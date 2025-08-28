import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';

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
      // Mock market data to avoid RPC calls that might cause 500 errors
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

      setMarkets(mockMarkets);
      console.log(`🎯 Loaded ${mockMarkets.length} mock markets`);

    } catch (err) {
      console.error('❌ Failed to fetch markets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  }, []);

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
