import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getEnvironmentConfig } from '@/config/environment';

export interface MarketData {
  marketIndex: number;
  symbol: string;
  baseAssetSymbol: string;
  quoteAssetSymbol: string;
  marketType: 'perp' | 'spot';
  marketAddress: string;
}

export const useMarkets = () => {
  const { connection } = useConnection();
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const config = getEnvironmentConfig();
      console.log(`🔍 Fetching markets from ${config.network} validator...`);
      
      // Use environment-specific program ID
      const APEX_PROGRAM_ID = config.programId;
      
      // Get all accounts owned by our program
      const programAccounts = await connection.getProgramAccounts(APEX_PROGRAM_ID, {
        commitment: 'confirmed',
        filters: [
          {
            dataSize: 1000, // Approximate size filter for market accounts
          }
        ]
      });

      console.log(`📊 Found ${programAccounts.length} program accounts`);

      // Mock market data for now since we need the actual account parsing logic
      const mockMarkets: MarketData[] = [
        {
          marketIndex: 0,
          symbol: 'SOL-PERP',
          baseAssetSymbol: 'SOL',
          quoteAssetSymbol: 'USD',
          marketType: 'perp',
          marketAddress: 'mock-sol-perp-address'
        },
        {
          marketIndex: 1,
          symbol: 'BTC-PERP', 
          baseAssetSymbol: 'BTC',
          quoteAssetSymbol: 'USD',
          marketType: 'perp',
          marketAddress: 'mock-btc-perp-address'
        },
        {
          marketIndex: 2,
          symbol: 'ETH-PERP',
          baseAssetSymbol: 'ETH', 
          quoteAssetSymbol: 'USD',
          marketType: 'perp',
          marketAddress: 'mock-eth-perp-address'
        }
      ];

      // If we have program accounts, show real data count
      if (programAccounts.length > 0) {
        console.log(`✅ Connected to Apex Protocol with ${programAccounts.length} accounts`);
        console.log('📈 Displaying mock market data (parsing logic needed for real data)');
      }

      setMarkets(mockMarkets);
      console.log(`🎯 Loaded ${mockMarkets.length} markets`);

    } catch (err) {
      console.error('❌ Failed to fetch markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    if (connection) {
      fetchMarkets();
    }
  }, [connection, fetchMarkets]);

  return {
    markets,
    loading,
    error,
    refetch: fetchMarkets
  };
};
