import { PublicKey } from '@solana/web3.js';

export interface EnvironmentConfig {
  rpcEndpoint: string;
  programId: PublicKey;
  network: 'localnet' | 'devnet' | 'mainnet';
}

// Static configuration for SSR compatibility
export function getEnvironmentConfig(): EnvironmentConfig {
  const network = (process.env.NEXT_PUBLIC_NETWORK || 'devnet') as 'localnet' | 'devnet' | 'mainnet';
  
  // Use hardcoded production values to avoid hydration mismatch
  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://devnet.helius-rpc.com/?api-key=8a3dd4b9-dc2b-4b76-824c-9a2fafb72a21';
    
  const programIdString = process.env.NEXT_PUBLIC_APEX_PROGRAM_ID || '14UeMM8EJ4zqvU5B3P9RvdYEwA9UCcNnU6GidEuv3LWd';
  
  return {
    network,
    rpcEndpoint,
    programId: new PublicKey(programIdString),
  };
}
