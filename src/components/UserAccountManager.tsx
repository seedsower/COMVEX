'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserAccount } from '../hooks/useUserAccount';

export default function UserAccountManager() {
  const { connected } = useWallet();
  const { userAccount, isLoading, error, initializeUser, depositUSDC } = useUserAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [transactionResult, setTransactionResult] = useState<string | null>(null);

  const handleInitializeUser = async () => {
    try {
      setIsInitializing(true);
      setTransactionResult(null);
      
      const signature = await initializeUser();
      setTransactionResult(`✅ User account initialized! Signature: ${signature}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTransactionResult(`❌ Initialization failed: ${errorMessage}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setTransactionResult('❌ Please enter a valid amount');
      return;
    }

    try {
      setIsDepositing(true);
      setTransactionResult(null);
      
      const signature = await depositUSDC(amount);
      setTransactionResult(`✅ Deposited ${amount} USDC! Signature: ${signature}`);
      setDepositAmount('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTransactionResult(`❌ Deposit failed: ${errorMessage}`);
    } finally {
      setIsDepositing(false);
    }
  };

  if (!connected) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">User Account</h2>
        <div className="text-center py-8">
          <p className="text-gray-400">Please connect your wallet to manage your account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">User Account Manager</h2>
      
      {/* Account Status */}
      <div className="mb-6 p-4 rounded bg-gray-700">
        <h3 className="text-lg font-semibold text-white mb-2">Account Status</h3>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-300">Checking account...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${userAccount.exists ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-300">
                {userAccount.exists ? 'Account Initialized' : 'Account Not Found'}
              </span>
            </div>
            {userAccount.address && (
              <div className="text-sm text-gray-400">
                PDA: {userAccount.address.slice(0, 8)}...{userAccount.address.slice(-8)}
              </div>
            )}
          </div>
        )}
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      {/* Initialize User Account */}
      {!userAccount.exists && (
        <div className="mb-6 p-4 rounded bg-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">First-Time Setup</h3>
          <p className="text-gray-300 text-sm mb-4">
            Before you can deposit or trade, you need to initialize your user account on the protocol.
          </p>
          <button
            onClick={handleInitializeUser}
            disabled={isInitializing || isLoading}
            className={`w-full py-2 px-4 rounded-md font-medium ${
              isInitializing || isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isInitializing ? 'Initializing...' : 'Initialize Account'}
          </button>
        </div>
      )}

      {/* Deposit USDC */}
      {userAccount.exists && (
        <div className="mb-6 p-4 rounded bg-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Deposit USDC</h3>
          <p className="text-gray-300 text-sm mb-4">
            Deposit USDC to your protocol account to start trading.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (USDC)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={handleDeposit}
              disabled={isDepositing || isLoading || !depositAmount}
              className={`w-full py-2 px-4 rounded-md font-medium ${
                isDepositing || isLoading || !depositAmount
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isDepositing ? 'Depositing...' : 'Deposit USDC'}
            </button>
          </div>
        </div>
      )}

      {/* Transaction Result */}
      {transactionResult && (
        <div className="p-4 rounded bg-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">Transaction Result</h3>
          <p className="text-sm text-gray-300 break-all">{transactionResult}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 rounded bg-gray-700 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-2">How It Works</h3>
        <div className="text-sm text-gray-300 space-y-2">
          <p><strong>1. Initialize Account:</strong> Creates your unique Program Derived Address (PDA) on the protocol.</p>
          <p><strong>2. Deposit USDC:</strong> Transfers USDC from your wallet to the protocol's vault and credits your account.</p>
          <p><strong>3. Start Trading:</strong> Use your deposited USDC as collateral for perpetual futures trading.</p>
        </div>
      </div>
    </div>
  );
}
