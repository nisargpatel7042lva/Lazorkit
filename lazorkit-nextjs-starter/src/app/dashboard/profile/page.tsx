/**
 * Profile Page
 * 
 * User profile page showing wallet information and account details
 */

'use client';

import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useLazorkit } from '@/hooks/useLazorkit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wallet, Calendar, Copy, Check, QrCode, ExternalLink, User, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatting';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Modal } from '@/components/ui/Modal';

export default function ProfilePage() {
  const { address, displayAddress, createdAt, isConnected } = useWallet();
  const { wallet } = useLazorkit();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  /**
   * Copy address to clipboard
   */
  const handleCopy = async () => {
    if (!displayAddress) return;

    try {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-3 tracking-tight">
          Profile
        </h1>
        <p className="text-lg text-[#1e293b] opacity-70">
          Manage your account settings and wallet information
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wallet Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8b5cf6] rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span>Wallet Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Account Name */}
            {wallet?.accountName && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#1e293b] opacity-70">Account Name</p>
                <p className="text-lg font-semibold text-[#1a1a1a]">{wallet.accountName}</p>
              </div>
            )}

            {/* Wallet Address */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#1e293b] opacity-70">Wallet Address</p>
              <div className="flex items-center gap-3 p-4 bg-[#faf9f6] border border-[#1a1a1a] rounded-lg">
                <code className="flex-1 font-mono text-sm text-[#1a1a1a] break-all">
                  {displayAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-[#8b5cf6]" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowQR(true)}
                  className="flex-1 gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Show QR Code
                </Button>
                <a
                  href={`https://solscan.io/address/${displayAddress}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View on Solscan
                  </Button>
                </a>
              </div>
            </div>

            {/* Creation Date */}
            {createdAt && (
              <div className="flex items-center gap-4 p-4 bg-[#faf9f6] border border-[#1a1a1a] rounded-lg">
                <Calendar className="h-5 w-5 text-[#8b5cf6] flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#1e293b] opacity-70">Wallet Created</p>
                  <p className="text-base font-semibold text-[#1a1a1a]">{formatDate(createdAt)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1e293b] rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-[#fbbf24]" />
              </div>
              <span>Account Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Network */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#1e293b] opacity-70">Network</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#8b5cf6] rounded-full"></div>
                <p className="text-base font-semibold text-[#1a1a1a]">Solana Devnet</p>
              </div>
            </div>

            {/* Wallet Type */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#1e293b] opacity-70">Wallet Type</p>
              <p className="text-base font-semibold text-[#1a1a1a]">Smart Wallet (Passkey)</p>
            </div>

            {/* Features */}
            <div className="space-y-3 p-4 bg-[#faf9f6] border border-[#1a1a1a] rounded-lg">
              <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Features</p>
              <ul className="space-y-2 text-sm text-[#1e293b] opacity-70">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8b5cf6] flex-shrink-0" />
                  <span>Gasless transactions (no SOL needed)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8b5cf6] flex-shrink-0" />
                  <span>Passkey authentication (no seed phrase)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8b5cf6] flex-shrink-0" />
                  <span>Hardware-bound security</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#8b5cf6] flex-shrink-0" />
                  <span>Phishing-resistant</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQR}
        title="Wallet Address QR Code"
        onClose={() => setShowQR(false)}
        size="sm"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white border-4 border-[#1a1a1a] rounded-lg">
            <QRCodeCanvas
              value={displayAddress}
              size={256}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-center text-sm text-[#1e293b] opacity-70 font-mono break-all">
            {displayAddress}
          </p>
        </div>
      </Modal>
    </div>
  );
}
