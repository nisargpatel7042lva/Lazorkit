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
import { Lightbulb, Lock } from 'lucide-react';

export default function DashboardPage() {
  const { address, refreshBalances } = useWallet();
  const { refreshTransactionHistory } = useWalletContext();
  const { success, error: showError } = useToast();

  /**
   * Load transaction history and balances on mount and when address changes
   * Use 2-minute interval to avoid RPC rate limiting (429 errors)
   * User can also manually refresh via dashboard buttons
   * 
   * NOTE: Only depend on address, not refreshBalances/refreshTransactionHistory
   * to avoid excessive re-renders and re-triggering the interval
   */
  useEffect(() => {
    if (!address) return;

    // Initial load
    refreshBalances();
    refreshTransactionHistory(address);

    // Set up interval to refresh both balances and transaction history every 2 minutes
    // (Reduced polling frequency to avoid 429 rate limit errors)
    // User can manually refresh via dashboard button for immediate updates
    const interval = setInterval(async () => {
      try {
        await refreshBalances();
        await refreshTransactionHistory(address);
      } catch (err) {
        console.error('Auto-refresh error:', err);
      }
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
    // ONLY depend on address - functions are stable from context
  }, [address]);

  /**
   * Handle successful transfer
   */
  const handleTransferComplete = async (signature: string) => {
    success(
      'Transfer initiated',
      `Transaction: ${signature.substring(0, 10)}...`
    );

    // Refresh balances and transaction history immediately after transfer
    if (address) {
      try {
        // Wait a moment for transaction to be indexed
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Refresh both
        await Promise.all([
          refreshBalances(),
          refreshTransactionHistory(address),
        ]);

        success('Balances updated');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to refresh data';
        showError(errorMessage);
      }
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-3 tracking-tight">
          Dashboard
        </h1>
        <p className="text-lg text-[#1e293b] opacity-70">
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
      <div className="mt-10">
        <TransactionHistory />
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="bg-white border border-[#1a1a1a] rounded-lg p-8 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#8b5cf6] rounded-lg flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-[#1a1a1a] text-lg">Gasless Transactions</h3>
          </div>
          <p className="text-sm text-[#1e293b] opacity-70 leading-relaxed">
            All transactions are gasless. The paymaster covers the SOL fees for you, so you only need tokens to transfer.
          </p>
        </div>

        <div className="bg-white border border-[#1a1a1a] rounded-lg p-8 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#1e293b] rounded-lg flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-[#1a1a1a] text-lg">Passkey Security</h3>
          </div>
          <p className="text-sm text-[#1e293b] opacity-70 leading-relaxed">
            Your passkey is secured by biometric authentication on this device and never leaves your device.
          </p>
        </div>
      </div>
    </div>
  );
}
