import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';

export interface EnvironmentConfig {
  rpcEndpoint: string;
  programId: PublicKey;
  network: 'localnet' | 'devnet' | 'mainnet';
}

export function useEnvironment(): EnvironmentConfig {
  const [config, setConfig] = useState<EnvironmentConfig>(() => {
    // Server-side safe defaults
    return {
      network: 'devnet' as const,
      rpcEndpoint: 'https://devnet.helius-rpc.com/?api-key=8a3dd4b9-dc2b-4b76-824c-9a2fafb72a21',
      programId: new PublicKey('14UeMM8EJ4zqvU5B3P9RvdYEwA9UCcNnU6GidEuv3LWd'),
    };
  });

  useEffect(() => {
    // Client-side configuration
    const network = (process.env.NEXT_PUBLIC_NETWORK || 'devnet') as 'localnet' | 'devnet' | 'mainnet';
    
    const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 
      (window.location.hostname === 'localhost' 
        ? 'http://127.0.0.1:8899'
        : 'https://devnet.helius-rpc.com/?api-key=8a3dd4b9-dc2b-4b76-824c-9a2fafb72a21');
        
    const programIdString = process.env.NEXT_PUBLIC_APEX_PROGRAM_ID || '14UeMM8EJ4zqvU5B3P9RvdYEwA9UCcNnU6GidEuv3LWd';
    
    setConfig({
      network,
      rpcEndpoint,
      programId: new PublicKey(programIdString),
    });
  }, []);

  return config;
}
