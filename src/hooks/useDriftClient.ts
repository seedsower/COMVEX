import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getEnvironmentConfig } from '../config/environment';

// Mock DriftClient interface for development
interface MockDriftClient {
  isSubscribed: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  placeOrder: (params: OrderParams) => Promise<string>;
  getUserAccount: () => any;
  getMarkets: () => any[];
}

interface OrderParams {
  marketIndex: number;
  direction: 'long' | 'short';
  baseAssetAmount: number;
  price?: number;
  orderType: 'market' | 'limit';
}

export function useDriftClient() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [driftClient, setDriftClient] = useState<MockDriftClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeDriftClient = useCallback(async () => {
    if (!publicKey || !connected) {
      setDriftClient(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const config = getEnvironmentConfig();
      
      // Mock DriftClient for development
      const mockClient: MockDriftClient = {
        isSubscribed: false,
        subscribe: async () => {
          console.log('📡 DriftClient subscribed');
          mockClient.isSubscribed = true;
        },
        unsubscribe: async () => {
          console.log('📡 DriftClient unsubscribed');
          mockClient.isSubscribed = false;
        },
        placeOrder: async (params: OrderParams) => {
          console.log('📝 Placing order:', params);
          // Simulate order placement
          await new Promise(resolve => setTimeout(resolve, 1000));
          return 'mock_signature_' + Date.now();
        },
        getUserAccount: () => ({
          authority: publicKey,
          subAccountId: 0,
          collateral: 1000,
          positions: []
        }),
        getMarkets: () => [
          { marketIndex: 0, symbol: 'SOL-PERP', baseAsset: 'SOL' },
          { marketIndex: 1, symbol: 'BTC-PERP', baseAsset: 'BTC' },
          { marketIndex: 2, symbol: 'ETH-PERP', baseAsset: 'ETH' }
        ]
      };

      await mockClient.subscribe();
      setDriftClient(mockClient);
      
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to initialize DriftClient:', err);
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, connection]);

  useEffect(() => {
    initializeDriftClient();

    return () => {
      if (driftClient?.isSubscribed) {
        driftClient.unsubscribe().catch(console.error);
      }
    };
  }, [initializeDriftClient]);

  const placeOrder = useCallback(async (params: OrderParams) => {
    if (!driftClient) {
      throw new Error('DriftClient not initialized');
    }
    return await driftClient.placeOrder(params);
  }, [driftClient]);

  return {
    driftClient,
    isLoading,
    error,
    placeOrder,
    isConnected: !!driftClient?.isSubscribed
  };
}
