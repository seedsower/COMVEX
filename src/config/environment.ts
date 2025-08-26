import { PublicKey } from '@solana/web3.js';

export interface EnvironmentConfig {
  rpcEndpoint: string;
  programId: PublicKey;
  network: 'localnet' | 'devnet' | 'mainnet';
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const network = process.env.NEXT_PUBLIC_NETWORK || 'localnet';
  
  switch (network) {
    case 'devnet':
      return {
        rpcEndpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com',
        programId: new PublicKey(
          process.env.NEXT_PUBLIC_APEX_PROGRAM_ID || 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH'
        ),
        network: 'devnet'
      };
    case 'mainnet':
      return {
        rpcEndpoint: process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
        programId: new PublicKey(
          process.env.NEXT_PUBLIC_APEX_PROGRAM_ID || 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH'
        ),
        network: 'mainnet'
      };
    default: // localnet
      return {
        rpcEndpoint: 'http://127.0.0.1:8899',
        programId: new PublicKey('14UeMM8EJ4zqvU5B3P9RvdYEwA9UCcNnU6GidEuv3LWd'),
        network: 'localnet'
      };
  }
};
