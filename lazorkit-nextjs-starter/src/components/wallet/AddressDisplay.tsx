/**
 * AddressDisplay Component
 * 
 * Shows wallet address with copy button and optional QR code
 */

'use client';

import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { Copy, Check, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { QRCodeCanvas } from 'qrcode.react';
import { Modal } from '@/components/ui/Modal';

/**
 * Component displaying wallet address
 */
export const AddressDisplay = () => {
  const { address, displayAddress, shortAddress, isConnected } = useWallet();
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

  if (!isConnected || !displayAddress) {
    return null;
  }

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl">Wallet Address</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5 pt-6">
          {/* Address Display */}
          <div className="flex items-center gap-2 p-3 bg-[#faf9f6] rounded-lg border border-[#1a1a1a]">
            <code className="flex-1 font-mono text-sm text-[#1a1a1a] break-all">
              {displayAddress}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0 gap-2"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* QR Code Button */}
          <Button
            variant="outline"
            onClick={() => setShowQR(true)}
            fullWidth
            className="gap-2"
          >
            <QrCode className="h-4 w-4" />
            Show QR Code
          </Button>

          {/* Solscan Link */}
          <a
            href={`https://solscan.io/address/${displayAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-[#8b5cf6] hover:text-[#7c3aed] font-medium transition-colors"
          >
            View on Solscan ↗
          </a>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQR}
        title="Wallet Address QR Code"
        onClose={() => setShowQR(false)}
        size="sm"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-white border-4 border-slate-200 rounded-lg">
            <QRCodeCanvas
              value={displayAddress}
              size={256}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-center text-sm text-slate-600 font-mono break-all">
            {displayAddress}
          </p>
        </div>
      </Modal>
    </>
  );
};
