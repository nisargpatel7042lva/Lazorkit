/**
 * TransferForm Component
 * 
 * Form for initiating a gasless transfer
 * Handles input validation and amount checking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useTransfer } from '@/hooks/useTransfer';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { validateTransfer } from '@/lib/utils/validation';
import { lamportsToSol, usdcToToken, parseAmountInput } from '@/lib/utils/formatting';
import { useToast } from '@/components/ui/Toast';
import { Send } from 'lucide-react';

export interface TransferFormProps {
  onTransferComplete?: (signature: string) => void;
}

/**
 * Form component for executing transfers
 */
export const TransferForm = ({ onTransferComplete }: TransferFormProps) => {
  const { transfer, isProcessing, error: transferError } = useTransfer();
  const { solBalance, usdcBalance, isConnected } = useWallet();
  const { warning } = useToast();

  const [tokenType, setTokenType] = useState<'SOL' | 'USDC'>('SOL');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [validation, setValidation] = useState({ 
    isValid: false, 
    addressError: undefined as string | undefined, 
    amountError: undefined as string | undefined 
  });

  const balance = tokenType === 'SOL' ? lamportsToSol(solBalance) : usdcToToken(usdcBalance);

  /**
   * Validate form on input change
   */
  useEffect(() => {
    const parsedAmount = parseAmountInput(amount) || 0;
    const result = validateTransfer(recipientAddress, String(parsedAmount), balance);
    setValidation(result);
  }, [recipientAddress, amount, balance]);

  /**
   * Handle transfer submission (shows preview first)
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.isValid) {
      warning('Please fix errors before submitting');
      return;
    }

    setShowPreview(true);
  };

  /**
   * Execute the transfer after preview confirmation
   */
  const handleConfirmTransfer = async () => {
    const parsedAmount = parseAmountInput(amount);
    if (!parsedAmount) return;

    const result = await transfer(tokenType, recipientAddress, parsedAmount);

    if (result.success && result.signature) {
      setShowPreview(false);
      setRecipientAddress('');
      setAmount('');
      onTransferComplete?.(result.signature);
    }
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-slate-600">Connect your wallet to transfer funds</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Funds
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Token Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Token
              </label>
              <div className="flex gap-2">
                {['SOL', 'USDC'].map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => setTokenType(token as 'SOL' | 'USDC')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      tokenType === token
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Address */}
            <Input
              label="Recipient Address"
              placeholder="Enter Solana wallet address..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              error={validation.addressError}
              helperText="Must be a valid Solana address"
            />

            {/* Amount */}
            <Input
              label="Amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={validation.amountError}
              helperText={`Available: ${balance.toFixed(2)} ${tokenType}`}
            />

            {/* Error Message */}
            {transferError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{transferError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              isLoading={isProcessing}
              disabled={!validation.isValid || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Review & Send'}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              No SOL needed for gas - powered by Lazorkit paymaster
            </p>
          </form>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        title="Confirm Transfer"
        onClose={() => setShowPreview(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTransfer}
              isLoading={isProcessing}
              disabled={isProcessing}
            >
              Confirm Transfer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Token:</span>
              <span className="font-semibold text-slate-900">{tokenType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Amount:</span>
              <span className="font-semibold text-slate-900">
                {amount} {tokenType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">To:</span>
              <span className="font-mono text-sm text-slate-900 break-all">
                {recipientAddress.substring(0, 10)}...
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="text-slate-600">Gas Fee:</span>
              <span className="font-semibold text-green-600">Free (Paymaster)</span>
            </div>
          </div>

          <p className="text-sm text-slate-600">
            This transaction will be signed with your passkey and submitted gaslessly.
          </p>
        </div>
      </Modal>
    </>
  );
};
