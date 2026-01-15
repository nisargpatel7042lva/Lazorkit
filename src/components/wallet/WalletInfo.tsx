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
import { Wallet, CheckCircle, Calendar, Check } from 'lucide-react';

/**
 * Component displaying wallet information
 */
export const WalletInfo = () => {
  const { address, displayAddress, createdAt, isConnected } = useWallet();

  if (!isConnected || !address) {
    return null;
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-8 h-8 bg-[#8b5cf6] rounded-lg flex items-center justify-center">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span>Wallet Information</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        {/* Connection Status */}
        <div className="flex items-center gap-4 p-4 bg-[#faf9f6] rounded-lg border border-[#1a1a1a]">
          <div className="w-10 h-10 bg-[#8b5cf6] rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Connected</p>
            <p className="text-xs text-[#1e293b] opacity-70 mt-0.5">Passkey wallet ready</p>
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-sm font-medium text-[#1e293b] opacity-70 mb-1">Wallet Address</p>
          <code className="block text-xs text-[#1a1a1a] bg-[#faf9f6] p-2 rounded font-mono break-all border border-[#1a1a1a]">
            {displayAddress}
          </code>
        </div>

        {/* Creation Date */}
        {createdAt && (
          <div className="flex items-center gap-4 p-4 bg-[#faf9f6] rounded-lg border border-[#1a1a1a]">
            <div className="w-10 h-10 bg-[#1e293b] rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1e293b] opacity-70">Created</p>
              <p className="text-sm font-semibold text-[#1a1a1a] mt-0.5">{formatDate(createdAt)}</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="space-y-3 p-4 bg-[#faf9f6] rounded-lg border border-[#1a1a1a]">
          <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Features</p>
          <ul className="space-y-2 text-xs text-[#1e293b] opacity-70">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#8b5cf6] flex-shrink-0" />
              <span>Gasless transactions (no SOL needed)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#8b5cf6] flex-shrink-0" />
              <span>Passkey authentication (no seed phrase)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#8b5cf6] flex-shrink-0" />
              <span>Devnet testnet ready</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
