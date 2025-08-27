'use client';

import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useDriftClient } from '../hooks/useDriftClient';

interface OrderFormProps {
  className?: string;
}

export default function OrderForm({ className = '' }: OrderFormProps) {
  const { connected } = useWallet();
  const { isLoading, error, placeOrder, isConnected } = useDriftClient();
  
  const [formData, setFormData] = useState({
    marketIndex: 0,
    direction: 'long' as 'long' | 'short',
    baseAssetAmount: '',
    price: '',
    orderType: 'market' as 'market' | 'limit'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<string | null>(null);

  const markets = [
    { index: 0, symbol: 'SOL-PERP', baseAsset: 'SOL' },
    { index: 1, symbol: 'BTC-PERP', baseAsset: 'BTC' },
    { index: 2, symbol: 'ETH-PERP', baseAsset: 'ETH' }
  ];

  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setOrderResult(null); // Clear previous results
  }, []);

  const handleSubmitOrder = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !isConnected) {
      setOrderResult('❌ Please connect wallet and wait for DriftClient');
      return;
    }

    if (!formData.baseAssetAmount || parseFloat(formData.baseAssetAmount) <= 0) {
      setOrderResult('❌ Please enter a valid amount');
      return;
    }

    if (formData.orderType === 'limit' && (!formData.price || parseFloat(formData.price) <= 0)) {
      setOrderResult('❌ Please enter a valid price for limit orders');
      return;
    }

    setIsSubmitting(true);
    setOrderResult(null);

    try {
      const orderParams = {
        marketIndex: formData.marketIndex,
        direction: formData.direction,
        baseAssetAmount: parseFloat(formData.baseAssetAmount),
        price: formData.orderType === 'limit' ? parseFloat(formData.price) : undefined,
        orderType: formData.orderType
      };

      const signature = await placeOrder(orderParams);
      setOrderResult(`✅ Order placed successfully! Signature: ${signature}`);
      
      // Reset form on success
      setFormData({
        marketIndex: 0,
        direction: 'long',
        baseAssetAmount: '',
        price: '',
        orderType: 'market'
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setOrderResult(`❌ Order failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [connected, isConnected, formData, placeOrder]);

  if (!connected) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
        <h2 className="text-xl font-bold text-white mb-4">Order Form</h2>
        <div className="text-center py-8">
          <p className="text-gray-400">Please connect your wallet to place orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-bold text-white mb-4">Place Order</h2>
      
      {/* Connection Status */}
      <div className="mb-4 p-3 rounded bg-gray-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-300">
            {isLoading ? 'Connecting...' : isConnected ? 'Connected to Protocol' : 'Disconnected'}
          </span>
        </div>
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>

      <form onSubmit={handleSubmitOrder} className="space-y-4">
        {/* Market Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Market
          </label>
          <select
            value={formData.marketIndex}
            onChange={(e) => handleInputChange('marketIndex', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {markets.map((market) => (
              <option key={market.index} value={market.index}>
                {market.symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Direction */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Direction
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleInputChange('direction', 'long')}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${
                formData.direction === 'long'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Long
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('direction', 'short')}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${
                formData.direction === 'short'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Short
            </button>
          </div>
        </div>

        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Order Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleInputChange('orderType', 'market')}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${
                formData.orderType === 'market'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Market
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('orderType', 'limit')}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${
                formData.orderType === 'limit'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount ({markets.find(m => m.index === formData.marketIndex)?.baseAsset})
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={formData.baseAssetAmount}
            onChange={(e) => handleInputChange('baseAssetAmount', e.target.value)}
            placeholder="0.000"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Price (for limit orders) */}
        {formData.orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isConnected || isSubmitting}
          className={`w-full py-3 px-4 rounded-md font-medium ${
            !isConnected || isSubmitting
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : formData.direction === 'long'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting
            ? 'Placing Order...'
            : `${formData.direction.toUpperCase()} ${markets.find(m => m.index === formData.marketIndex)?.baseAsset}`
          }
        </button>
      </form>

      {/* Order Result */}
      {orderResult && (
        <div className="mt-4 p-3 rounded bg-gray-700">
          <p className="text-sm text-gray-300 break-all">{orderResult}</p>
        </div>
      )}
    </div>
  );
}
