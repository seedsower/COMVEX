import { PublicKey } from '@solana/web3.js';

export interface EnvironmentConfig {
  rpcEndpoint: string;
  programId: PublicKey;
  network: 'localnet' | 'devnet' | 'mainnet';
}

// Static configuration for SSR compatibility
export function getEnvironmentConfig(): EnvironmentConfig {
  const network = (process.env.NEXT_PUBLIC_NETWORK || 'devnet') as 'localnet' | 'devnet' | 'mainnet';
  
  // Use public RPC endpoints to avoid rate limiting
  const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    
  const programIdString = process.env.NEXT_PUBLIC_APEX_PROGRAM_ID || 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH';
  
  return {
    network,
    rpcEndpoint,
    programId: new PublicKey(programIdString),
  };
}
