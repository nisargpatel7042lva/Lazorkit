/**
 * PasskeyRegister Component
 * 
 * Handles new user registration with passkey creation
 * Guides users through the WebAuthn/passkey setup process
 */

'use client';

import React, { useState } from 'react';
import { useLazorkit } from '@/hooks/useLazorkit';
import { usePasskey } from '@/hooks/usePasskey';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { AlertCircle, Check } from 'lucide-react';
import { logger } from '@/lib/utils/logger';

export interface PasskeyRegisterProps {
  onSuccess?: () => void;
}

/**
 * Component for registering a new passkey wallet
 */
export const PasskeyRegister = ({ onSuccess }: PasskeyRegisterProps) => {
  const { connect, isConnecting, error } = useLazorkit();
  const { isSupported, isPlatformAuthenticatorAvailable, isCheckingSupport, unsupportedMessage } =
    usePasskey();
  const { success, error: toastError } = useToast();
  const [step, setStep] = useState<'check' | 'register' | 'success'>('check');

  /**
   * Initiates passkey creation
   */
  const handleRegister = async () => {
    try {
      logger.info('PasskeyRegister', 'Starting registration...');
      const result = await connect({ feeMode: 'paymaster' });

      if (result) {
        setStep('success');
        success('Wallet created successfully! Your passkey is now registered.', 'You can now use your wallet for transactions.');
        onSuccess?.();
      }
    } catch (err) {
      toastError(
        'Registration failed',
        err instanceof Error ? err.message : 'Please try again'
      );
      logger.error('PasskeyRegister', 'Registration error', err as Error);
    }
  };

  // Still checking support
  if (isCheckingSupport) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Register Wallet</CardTitle>
          <CardDescription>Setting up your passkey...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <LoadingSpinner label="Checking browser support..." />
        </CardContent>
      </Card>
    );
  }

  // Passkey not supported
  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto border-red-200">
        <CardHeader className="border-b-red-200">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Passkey Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-slate-700 mb-4">{unsupportedMessage}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p className="font-semibold mb-2">Recommended browsers:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Chrome/Chromium (latest)</li>
              <li>Safari 16+ (macOS, iOS, iPad)</li>
              <li>Firefox (latest)</li>
              <li>Edge (latest)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state
  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto border-green-200">
        <CardHeader className="border-b-green-200">
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            Registration Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-slate-700 mb-6">
            Your wallet has been created successfully! Your passkey is securely stored on this device.
          </p>
          <Button onClick={onSuccess} className="w-full">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Registration form
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Your Wallet</CardTitle>
        <CardDescription>
          Register a passkey to create a secure, seedless Solana wallet
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info boxes */}
        <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-blue-900">What is a passkey?</p>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span>✓</span>
              <span>No seed phrase to memorize or store</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Secured by your biometric or PIN</span>
            </li>
            <li className="flex gap-2">
              <span>✓</span>
              <span>Hardware-bound and phishing-resistant</span>
            </li>
          </ul>
        </div>

        {/* Platform authenticator check */}
        {!isPlatformAuthenticatorAvailable && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-900">
              <span className="font-semibold">Note:</span> Platform authenticator (biometric/PIN) is not available. You may need to set up a passkey manually.
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Register button */}
        <Button
          onClick={handleRegister}
          isLoading={isConnecting}
          size="lg"
          fullWidth
          disabled={isConnecting}
        >
          {isConnecting ? 'Creating Wallet...' : 'Create Wallet with Passkey'}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          By registering, you agree to create a new Solana wallet on Devnet
        </p>
      </CardContent>
    </Card>
  );
};
