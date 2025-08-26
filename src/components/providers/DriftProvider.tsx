'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface DriftContextType {
    driftClient: null;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    initializeDrift: () => Promise<void>;
}

const DriftContext = createContext<DriftContextType>({
    driftClient: null,
    isConnected: false,
    isLoading: false,
    error: null,
    initializeDrift: async () => {},
});

export const useDrift = () => {
    const context = useContext(DriftContext);
    if (!context) {
        throw new Error('useDrift must be used within a DriftProvider');
    }
    return context;
};

interface DriftProviderProps {
    children: ReactNode;
}

export const DriftProvider: React.FC<DriftProviderProps> = ({ children }) => {
    const { connection } = useConnection();
    const { wallet, publicKey, connected } = useWallet();
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initializeDrift = useCallback(async () => {
        // Our local Apex Protocol program ID
        const APEX_PROGRAM_ID = new PublicKey('14UeMM8EJ4zqvU5B3P9RvdYEwA9UCcNnU6GidEuv3LWd');
        if (!wallet || !publicKey || !connected) {
            setError('Wallet not connected');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🚀 Wallet connected successfully');
            console.log('Wallet:', publicKey.toString());
            console.log('RPC:', connection.rpcEndpoint);
            console.log('Program ID:', APEX_PROGRAM_ID.toString());

            // Simulate successful connection for now
            // TODO: Add actual Drift SDK integration once module issues are resolved
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setIsConnected(true);
            console.log('✅ Ready for Drift integration');
            
        } catch (err) {
            console.error('❌ Connection failed:', err);
            setError(err instanceof Error ? err.message : 'Connection failed');
        } finally {
            setIsLoading(false);
        }
    }, [connection, wallet, publicKey, connected]);

    useEffect(() => {
        if (connected && wallet && publicKey) {
            initializeDrift();
        } else {
            setIsConnected(false);
            setError(null);
        }
    }, [connected, wallet, publicKey, initializeDrift]);

    const value: DriftContextType = {
        driftClient: null,
        isConnected,
        isLoading,
        error,
        initializeDrift,
    };

    return (
        <DriftContext.Provider value={value}>
            {children}
        </DriftContext.Provider>
    );
};
