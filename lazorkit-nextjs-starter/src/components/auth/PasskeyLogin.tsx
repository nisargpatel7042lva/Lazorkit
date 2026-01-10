/**
 * PasskeyLogin Component
 * 
 * Handles user login with existing passkey
 * Supports both new registrations and existing user authentication
 */

'use client';

import React, { useState } from 'react';
import { useLazorkit } from '@/hooks/useLazorkit';
import { usePasskey } from '@/hooks/usePasskey';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { LogIn, AlertCircle } from 'lucide-react';
import { logger } from '@/lib/utils/logger';

export interface PasskeyLoginProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
  autoConnect?: boolean; // Auto-attempt connection on mount
}

/**
 * Component for authenticating with an existing passkey
 */
export const PasskeyLogin = ({
  onSuccess,
  onRegisterClick,
  autoConnect = false,
}: PasskeyLoginProps) => {
  const { connect, reconnect, isConnecting, error, isConnected } = useLazorkit();
  const { isSupported, isCheckingSupport, unsupportedMessage } = usePasskey();
  const { error: toastError } = useToast();
  const [hasAttemptedAuto, setHasAttemptedAuto] = useState(false);

  /**
   * Auto-attempt connection on mount if specified
   */
  React.useEffect(() => {
    if (autoConnect && !hasAttemptedAuto && isSupported && !isCheckingSupport) {
      setHasAttemptedAuto(true);
      handleAutoConnect();
    }
  }, [autoConnect, hasAttemptedAuto, isSupported, isCheckingSupport]);

  /**
   * Handle auto-connection attempt
   */
  const handleAutoConnect = async () => {
    logger.info('PasskeyLogin', 'Attempting auto-reconnect...');
    const result = await reconnect();
    if (result) {
      onSuccess?.();
    }
  };

  /**
   * Initiates authentication
   */
  const handleConnect = async () => {
    try {
      logger.info('PasskeyLogin', 'Starting authentication...');
      const result = await connect({ feeMode: 'paymaster' });

      if (result) {
        onSuccess?.();
      }
    } catch (err) {
      toastError(
        'Authentication failed',
        err instanceof Error ? err.message : 'Please try again'
      );
      logger.error('PasskeyLogin', 'Authentication error', err as Error);
    }
  };

  // Already connected
  if (isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto border-green-200">
        <CardHeader className="border-b-green-200">
          <CardTitle className="text-green-600">Logged In</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-slate-700 mb-6">You are already connected to your wallet.</p>
          <Button onClick={onSuccess} className="w-full">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Still checking support
  if (isCheckingSupport) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Login</CardTitle>
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
            <p className="font-semibold mb-2">Please use:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Chrome, Safari, Firefox, or Edge (latest versions)</li>
              <li>A device with biometric authentication support</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Login form
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login to Your Wallet</CardTitle>
        <CardDescription>Authenticate with your passkey to access your Solana wallet</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Login button */}
        <Button
          onClick={handleConnect}
          isLoading={isConnecting}
          size="lg"
          fullWidth
          disabled={isConnecting}
          className="gap-2"
        >
          <LogIn className="h-5 w-5" />
          {isConnecting ? 'Authenticating...' : 'Login with Passkey'}
        </Button>

        {/* Register link */}
        <div className="text-center border-t border-slate-200 pt-6">
          <p className="text-slate-600 mb-3">Don't have a wallet yet?</p>
          <Button
            variant="outline"
            onClick={onRegisterClick}
            fullWidth
            disabled={isConnecting}
          >
            Create a New Wallet
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Your passkey is securely stored on this device and never leaves it
        </p>
      </CardContent>
    </Card>
  );
};
