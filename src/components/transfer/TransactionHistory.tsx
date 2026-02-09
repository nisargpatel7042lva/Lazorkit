/**
 * TransactionHistory Component
 * 
 * Displays recent transactions with status and links
 */

'use client';

import React from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { formatRelativeTime, getSolscanUrl, abbreviateAddress } from '@/lib/utils/formatting';
import { TransactionStatus } from '@/lib/lazorkit/types';
import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Component displaying transaction history
 */
export const TransactionHistory = () => {
  const { transactions, isLoadingTransactions } = useWalletContext();

  // Helper to format displayed amount
  const formatAmount = (amount: number, decimals: number = 2): string => {
    try {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      } as any);
    } catch {
      return `${amount}`;
    }
  };


  if (isLoadingTransactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-500 text-center py-4">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  const txArray = transactions || [];
  const hasTransactions = (txArray as any).length > 0;

  if (!hasTransactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-[#1e293b] opacity-70 py-8">
            No transactions yet. Start by sending some tokens!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Recent Transactions ({txArray.length})</CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-3">
          {txArray.map((tx) => {
            const statusIcon =
              tx.status === TransactionStatus.CONFIRMED ? (
                <CheckCircle className="h-5 w-5 text-[#8b5cf6]" />
              ) : tx.status === TransactionStatus.FAILED ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-[#fbbf24] animate-spin" />
              );

            // Use pre-calculated displayAmount from context if available, otherwise fallback (should exist)
            const amountToDisplay = tx.displayAmount !== undefined
              ? tx.displayAmount
              : Math.abs(tx.amount) / (tx.tokenType === 'USDC' ? 1000000 : 1000000000);

            const isPositive = tx.amount > 0;
            const decimals = tx.tokenType === 'USDC' ? 2 : 4;

            return (
              <a
                key={tx.signature}
                href={getSolscanUrl(tx.signature, 'devnet')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#faf9f6] hover:bg-[#f5f5f0] hover:shadow-md border border-[#1a1a1a] rounded-lg transition-all"
              >
                {statusIcon}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1a1a1a] truncate">{tx.description}</p>
                  <p className="text-xs text-[#1e293b] opacity-60">{formatRelativeTime(tx.timestamp)}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className={`font-semibold ${isPositive ? 'text-[#8b5cf6]' : 'text-[#1a1a1a]'}`}>
                    {isPositive ? '+' : ''}{tx.amount < 0 ? '-' : ''}{formatAmount(amountToDisplay, decimals)}{' '}
                    {tx.tokenType}
                  </p>
                  <p className="text-xs text-[#1e293b] opacity-60 font-mono">
                    {abbreviateAddress(tx.signature)}
                  </p>
                </div>

                <ExternalLink className="h-4 w-4 text-[#1e293b] opacity-50 flex-shrink-0" />
              </a>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
