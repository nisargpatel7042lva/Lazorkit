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

  // Debug logging
  React.useEffect(() => {
    console.log('TransactionHistory render:', {
      isLoadingTransactions,
      transactionCount: transactions.length,
      transactions: transactions.slice(0, 2), // Show first 2 for debugging
    });
  }, [transactions, isLoadingTransactions]);

  if (isLoadingTransactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
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
        <CardTitle className="text-xl">Recent Transactions ({transactions.length})</CardTitle>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-3">
          {transactions.map((tx) => {
            const statusIcon =
              tx.status === TransactionStatus.CONFIRMED ? (
                <CheckCircle className="h-5 w-5 text-[#8b5cf6]" />
              ) : tx.status === TransactionStatus.FAILED ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-[#fbbf24] animate-spin" />
              );

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
                  <p className={`font-semibold ${tx.amount > 0 ? 'text-[#8b5cf6]' : 'text-[#1a1a1a]'}`}>
                    {tx.amount > 0 ? '+' : ''}{Math.abs(tx.amount / Math.pow(10, tx.tokenType === 'USDC' ? 6 : 9)).toFixed(tx.tokenType === 'USDC' ? 2 : 4)}{' '}
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
