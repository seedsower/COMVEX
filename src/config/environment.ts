import { PublicKey } from '@solana/web3.js';

export interface EnvironmentConfig {
  rpcEndpoint: string;
  programId: PublicKey;
  network: 'localnet' | 'devnet' | 'mainnet';
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const network = (process.env.NEXT_PUBLIC_NETWORK || 'localnet') as 'localnet' | 'devnet' | 'mainnet';
  
  // Use environment variable for RPC endpoint to avoid hydration mismatch
  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'http://127.0.0.1:8899';
    
  const programIdString = process.env.NEXT_PUBLIC_APEX_PROGRAM_ID || '14UeMM8EJ4zqvU5B3P9RvdYEwA9UCcNnU6GidEuv3LWd';
  
  return {
    network,
    rpcEndpoint,
    programId: new PublicKey(programIdString),
  };
}
