'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useDrift } from './providers/DriftProvider';
import { MarketSelector } from './MarketSelector';
import { MarketData } from '@/hooks/useMarkets';
import { getEnvironmentConfig } from '@/config/environment';
import { ClientOnly } from './ClientOnly';

export const DriftStatus: React.FC = () => {
    const { connected, publicKey } = useWallet();
    const { isConnected, isLoading, error, initializeDrift } = useDrift();
    const [selectedMarket, setSelectedMarket] = useState<MarketData | null>(null);
    const config = getEnvironmentConfig();

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Apex Protocol - {config.network.toUpperCase()} Environment
                </h1>
                
                {/* Wallet Connection Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        🔗 Wallet Connection
                    </h2>
                    <div className="flex items-center space-x-4">
                        <ClientOnly fallback={<div className="bg-gray-200 rounded-md px-4 py-2 text-gray-500">Loading wallet...</div>}>
                            <WalletMultiButton />
                        </ClientOnly>
                        <ClientOnly>
                            {connected && (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">Connected:</span> {publicKey?.toString().slice(0, 8)}...
                                </div>
                            )}
                        </ClientOnly>
                    </div>
                </div>

                {/* Drift Service Status */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        ⚡ Drift Service Status
                    </h2>
                    
                    <div className="space-y-3">
                        <ClientOnly>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm">
                                    Wallet: {connected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </ClientOnly>
                        
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : isLoading ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm">
                                Drift Client: {isConnected ? 'Connected' : isLoading ? 'Connecting...' : 'Disconnected'}
                            </span>
                        </div>
                        
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <div className="text-red-800 text-sm">
                                    <strong>Error:</strong> {error}
                                </div>
                            </div>
                        )}
                        
                        {isConnected && (
                            <div className="bg-green-50 border border-green-200 rounded-md p-3">
                                <div className="text-green-800 text-sm">
                                    <strong>✅ Success!</strong> DriftService successfully initialized against local Apex Protocol
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Market Selector Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        📈 Market Selection
                    </h2>
                    
                    <MarketSelector
                        selectedMarket={selectedMarket}
                        onMarketSelect={setSelectedMarket}
                        className="max-w-md"
                    />
                    
                    {selectedMarket && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Selected Market:</h4>
                            <div className="text-blue-800 text-sm space-y-1">
                                <div><span className="font-medium">Symbol:</span> {selectedMarket.symbol}</div>
                                <div><span className="font-medium">Type:</span> {selectedMarket.marketType.toUpperCase()}</div>
                                <div><span className="font-medium">Base/Quote:</span> {selectedMarket.baseAssetSymbol}/{selectedMarket.quoteAssetSymbol}</div>
                                <div><span className="font-medium">Index:</span> {selectedMarket.marketIndex}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Connection Details */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        📊 Connection Details
                    </h2>
                    
                    <div className="bg-gray-50 rounded-md p-4 space-y-2 text-sm">
                        <div>
                            <span className="font-medium">RPC Endpoint:</span> {config.rpcEndpoint}
                        </div>
                        <div>
                            <span className="font-medium">Apex Program ID:</span> {config.programId.toString()}
                        </div>
                        <div>
                            <span className="font-medium">Network:</span> {config.network.toUpperCase()}
                        </div>
                        <ClientOnly>
                            {connected && (
                                <div>
                                    <span className="font-medium">Wallet Address:</span> {publicKey?.toString()}
                                </div>
                            )}
                        </ClientOnly>
                    </div>
                </div>

                {/* Manual Retry Button */}
                <ClientOnly>
                    {connected && !isConnected && !isLoading && (
                        <div className="mb-8">
                            <button
                                onClick={initializeDrift}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                Retry Drift Connection
                            </button>
                        </div>
                    )}
                </ClientOnly>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h3 className="font-medium text-blue-900 mb-2">📝 Instructions:</h3>
                    <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
                        <li>Connect your wallet using the button above</li>
                        <li>Check the browser console for detailed Drift initialization logs</li>
                        <li>Verify the green status indicators show successful connection</li>
                        <li>The local Apex Protocol should be accessible via the DriftService</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default DriftStatus;
