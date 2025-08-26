'use client';

import React, { useState } from 'react';
import { useMarkets, MarketData } from '@/hooks/useMarkets';

interface MarketSelectorProps {
  selectedMarket?: MarketData | null;
  onMarketSelect: (market: MarketData) => void;
  className?: string;
}

export const MarketSelector: React.FC<MarketSelectorProps> = ({
  selectedMarket,
  onMarketSelect,
  className = ''
}) => {
  const { markets, loading, error, refetch } = useMarkets();
  const [isOpen, setIsOpen] = useState(false);

  const handleMarketSelect = (market: MarketData) => {
    onMarketSelect(market);
    setIsOpen(false);
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-800">Failed to load markets</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Market
        </label>
      </div>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="relative w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="block truncate">
          {loading ? (
            <span className="text-gray-500">Loading markets...</span>
          ) : selectedMarket ? (
            <span className="flex items-center">
              <span className="font-medium">{selectedMarket.symbol}</span>
              <span className="ml-2 text-gray-500 text-xs">
                ({selectedMarket.marketType.toUpperCase()})
              </span>
            </span>
          ) : (
            <span className="text-gray-500">Choose a market</span>
          )}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {markets.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No markets available
            </div>
          ) : (
            markets.map((market) => (
              <button
                key={`${market.marketType}-${market.marketIndex}`}
                onClick={() => handleMarketSelect(market)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                  selectedMarket?.marketIndex === market.marketIndex &&
                  selectedMarket?.marketType === market.marketType
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{market.symbol}</div>
                    <div className="text-xs text-gray-500">
                      {market.baseAssetSymbol}/{market.quoteAssetSymbol}
                    </div>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {market.marketType.toUpperCase()}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Market Count Info */}
      {!loading && markets.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {markets.length} market{markets.length !== 1 ? 's' : ''} available
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching markets from local validator...
        </div>
      )}
    </div>
  );
};
