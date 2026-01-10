/**
 * BalanceCard Component
 * 
 * Displays wallet balances for SOL and USDC
 * Shows loading state and refresh functionality
 */

'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { RefreshCw } from 'lucide-react';
import { lamportsToSol, usdcToToken } from '@/lib/utils/formatting';

/**
 * Component displaying wallet balances
 */
export const BalanceCard = () => {
  const { solBalance, usdcBalance, isLoading, refreshBalances } = useWallet();

  const displaySol = lamportsToSol(solBalance).toFixed(4);
  const displayUsdc = usdcToToken(usdcBalance).toFixed(2);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Wallet Balances</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshBalances}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh balances</span>
        </Button>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* SOL Balance */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">SOL Balance</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                {displaySol}
                <span className="text-lg text-slate-600 ml-1">SOL</span>
              </p>
            )}
          </div>

          {/* USDC Balance */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">USDC Balance</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">
                {displayUsdc}
                <span className="text-lg text-slate-600 ml-1">USDC</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900">
          <p className="font-semibold mb-1">💡 Tip:</p>
          <p>Your wallet is sponsored by Lazorkit's paymaster. No SOL needed for gas fees!</p>
        </div>
      </CardContent>
    </Card>
  );
};
