/**
 * BalanceCard Component
 * 
 * Displays wallet balances for SOL and USDC
 * Shows loading state and refresh functionality
 */

'use client';

import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { RefreshCw, Lightbulb } from 'lucide-react';
import { lamportsToSol, usdcToToken } from '@/lib/utils/formatting';
import { useToast } from '@/components/ui/Toast';

/**
 * Component displaying wallet balances
 */
export const BalanceCard = () => {
  const { solBalance, usdcBalance, isLoading, refreshBalances } = useWallet();
  const { success, error: showError } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const displaySol = lamportsToSol(solBalance).toFixed(4);
  const displayUsdc = usdcToToken(usdcBalance).toFixed(2);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshBalances();
      success('Balances updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh balances';
      showError(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-xl">Wallet Balances</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="gap-2 hover:bg-[#faf9f6]"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh balances</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* SOL Balance */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#1e293b] opacity-70 uppercase tracking-wide">SOL Balance</p>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div>
                <p className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                  {displaySol}
                </p>
                <p className="text-sm text-[#1e293b] opacity-60 mt-1">SOL</p>
              </div>
            )}
          </div>

          {/* USDC Balance */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#1e293b] opacity-70 uppercase tracking-wide">USDC Balance</p>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <div>
                <p className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
                  {displayUsdc}
                </p>
                <p className="text-sm text-[#1e293b] opacity-60 mt-1">USDC</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#1a1a1a]">
          <div className="flex items-start gap-3 p-4 bg-[#faf9f6] border border-[#1a1a1a] rounded-lg">
            <div className="w-6 h-6 bg-[#8b5cf6] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a] mb-1 text-sm">Gasless Transactions</p>
              <p className="text-xs text-[#1e293b] opacity-70 leading-relaxed">Your wallet is sponsored by our paymaster. No SOL needed for gas fees!</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
