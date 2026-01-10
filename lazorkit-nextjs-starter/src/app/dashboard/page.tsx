/**
 * Dashboard Page
 * 
 * Main dashboard showing wallet info, balances, and transfer interface
 */

'use client';

import React, { useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useWalletContext } from '@/contexts/WalletContext';
import { WalletInfo } from '@/components/wallet/WalletInfo';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { AddressDisplay } from '@/components/wallet/AddressDisplay';
import { TransferForm } from '@/components/transfer/TransferForm';
import { TransactionHistory } from '@/components/transfer/TransactionHistory';
import { useToast } from '@/components/ui/Toast';

export default function DashboardPage() {
  const { address } = useWallet();
  const { refreshTransactionHistory } = useWalletContext();
  const { success } = useToast();

  /**
   * Load transaction history on mount
   */
  useEffect(() => {
    if (address) {
      refreshTransactionHistory(address);
    }
  }, [address, refreshTransactionHistory]);

  /**
   * Handle successful transfer
   */
  const handleTransferComplete = (signature: string) => {
    success(
      'Transfer initiated',
      `Transaction: ${signature.substring(0, 10)}...`
    );

    // Refresh transaction history
    if (address) {
      refreshTransactionHistory(address);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Welcome to Your Wallet
        </h1>
        <p className="text-xl text-slate-600">
          Manage your Solana assets with gasless transactions
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Wallet Info */}
        <div className="lg:col-span-1 space-y-6">
          <WalletInfo />
          <AddressDisplay />
        </div>

        {/* Right Column - Balances & Transfer */}
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard />
          <TransferForm onTransferComplete={handleTransferComplete} />
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <TransactionHistory />
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Gasless Transactions</h3>
          <p className="text-sm text-blue-800">
            All transactions on Lazorkit are gasless. The paymaster covers the SOL fees for you, so you only need tokens to transfer.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">🔐 Passkey Security</h3>
          <p className="text-sm text-green-800">
            Your passkey is secured by biometric authentication on this device and never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
