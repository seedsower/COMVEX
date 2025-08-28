import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { getEnvironmentConfig } from '../config/environment';

// User PDA derivation
function deriveUserPDA(userWallet: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user'), userWallet.toBuffer()],
    programId
  );
}

// USDC vault PDA derivation
function deriveUSDCVaultPDA(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('spot_market_vault'), Buffer.from([0, 0])], // USDC is market index 0
    programId
  );
}

interface UserAccountData {
  exists: boolean;
  address?: string;
  balance?: number;
  initialized?: boolean;
}

export function useUserAccount() {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [userAccount, setUserAccount] = useState<UserAccountData>({ exists: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = getEnvironmentConfig();

  const checkUserAccount = useCallback(async () => {
    if (!publicKey || !connected) {
      setUserAccount({ exists: false });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [userPDA] = deriveUserPDA(publicKey, config.programId);
      const accountInfo = await connection.getAccountInfo(userPDA);

      if (accountInfo) {
        setUserAccount({
          exists: true,
          address: userPDA.toString(),
          initialized: true,
          balance: 0 // Would parse from account data in production
        });
      } else {
        setUserAccount({
          exists: false,
          address: userPDA.toString(),
          initialized: false
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check user account';
      setError(errorMessage);
      console.error('Error checking user account:', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, connection, config.programId]);

  const initializeUser = useCallback(async (): Promise<string> => {
    if (!publicKey || !connected || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      const [userPDA, userBump] = deriveUserPDA(publicKey, config.programId);
      
      // Check if already exists
      const existingAccount = await connection.getAccountInfo(userPDA);
      if (existingAccount) {
        throw new Error('User account already exists');
      }

      // Derive state account PDA
      const [stateAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('drift_state')],
        config.programId
      );

      // Create initialize user instruction
      const initializeUserIx = {
        programId: config.programId,
        keys: [
          { pubkey: userPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: false },
          { pubkey: stateAccount, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.from([0, userBump]) // Instruction discriminator + bump
      };

      const transaction = new Transaction().add({
        ...initializeUserIx,
        keys: initializeUserIx.keys
      });

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);

      // Update user account state
      await checkUserAccount();

      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize user account';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, signTransaction, connection, config.programId, checkUserAccount]);

  const depositUSDC = useCallback(async (amount: number): Promise<string> => {
    if (!publicKey || !connected || !signTransaction) {
      throw new Error('Wallet not connected');
    }

    if (!userAccount.exists) {
      throw new Error('User account not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      const [userPDA] = deriveUserPDA(publicKey, config.programId);
      
      // USDC mint address (Devnet)
      const usdcMint = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
      
      // Get user's USDC ATA
      const userUSDCATA = await getAssociatedTokenAddress(usdcMint, publicKey);
      
      // Derive protocol's USDC vault
      const [usdcVault] = deriveUSDCVaultPDA(config.programId);
      
      // Derive spot market PDA for USDC (index 0)
      const [spotMarketPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('spot_market'), Buffer.from([0, 0])],
        config.programId
      );
      
      // Derive state account PDA
      const [stateAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('drift_state')],
        config.programId
      );

      // Convert amount to proper decimals (USDC has 6 decimals)
      const depositAmount = Math.floor(amount * 1_000_000);
      
      // Create deposit instruction
      const depositIx = {
        programId: config.programId,
        keys: [
          { pubkey: stateAccount, isSigner: false, isWritable: false },
          { pubkey: userPDA, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: false },
          { pubkey: userUSDCATA, isSigner: false, isWritable: true },
          { pubkey: usdcVault, isSigner: false, isWritable: true },
          { pubkey: spotMarketPDA, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([
          Buffer.from([1]), // Deposit instruction discriminator
          Buffer.from(new Uint8Array(new BigUint64Array([BigInt(depositAmount)]).buffer)), // Amount as u64
          Buffer.from([0, 0]) // Market index (USDC = 0)
        ])
      };

      const transaction = new Transaction().add({
        ...depositIx,
        keys: depositIx.keys
      });

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);

      // Update user account state
      await checkUserAccount();

      return signature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deposit USDC';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, signTransaction, connection, config.programId, userAccount.exists, checkUserAccount]);

  useEffect(() => {
    if (connected && publicKey) {
      checkUserAccount();
    }
  }, [connected, publicKey, checkUserAccount]);

  return {
    userAccount,
    isLoading,
    error,
    initializeUser,
    depositUSDC,
    checkUserAccount
  };
}
