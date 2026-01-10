/**
 * WalletInfo Component
 * 
 * Displays general wallet information including
 * address, creation date, and connection status
 */

'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { formatDate, abbreviateAddress } from '@/lib/utils/formatting';
import { Wallet, CheckCircle, Calendar } from 'lucide-react';

/**
 * Component displaying wallet information
 */
export const WalletInfo = () => {
  const { address, displayAddress, createdAt, isConnected } = useWallet();

  if (!isConnected || !address) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900">Connected</p>
            <p className="text-xs text-green-800">Passkey wallet ready</p>
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">Wallet Address</p>
          <code className="block text-xs text-slate-700 bg-slate-50 p-2 rounded font-mono break-all">
            {displayAddress}
          </code>
        </div>

        {/* Creation Date */}
        {createdAt && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Calendar className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-600">Created</p>
              <p className="text-xs text-slate-500">{formatDate(createdAt)}</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900">Features</p>
          <ul className="space-y-1 text-xs text-blue-800">
            <li className="flex gap-2">
              <span>✓</span>
              <span>Gasless transactions (no SOL needed)</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Passkey authentication (no seed phrase)</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Devnet testnet ready</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
