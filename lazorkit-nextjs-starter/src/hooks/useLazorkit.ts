/**
 * useLazorkit Hook
 * 
 * High-level hook that provides the main SDK operations
 * like connect, disconnect, and signing transactions.
 * Wraps the lower-level Lazorkit context.
 * 
 * Usage:
 *   const { connect, isConnecting, error } = useLazorkit();
 */

import { useCallback, useState } from 'react';
import { useLazorkitContext } from '@/contexts/LazorkitContext';
import { logger } from '@/lib/utils/logger';
import { mapErrorToMessage } from '@/lib/utils/errors';

/**
 * Hook for high-level Lazorkit SDK operations
 */
export const useLazorkit = () => {
  const context = useLazorkitContext();
  const [operationError, setOperationError] = useState<string | null>(null);

  /**
   * Initiates wallet connection
   * Shows the Lazorkit portal for passkey creation/authentication
   */
  const connect = useCallback(
    async (options?: { feeMode?: 'paymaster' | 'user' }): Promise<boolean> => {
      try {
        setOperationError(null);
        logger.info('useLazorkit', 'Initiating wallet connection...');

        await context.connect(options);

        logger.info('useLazorkit', 'Wallet connection successful');
        return true;
      } catch (error) {
        const errorMessage = mapErrorToMessage(
          error as Error,
          'Failed to connect wallet. Please try again.'
        );
        setOperationError(errorMessage);
        logger.error('useLazorkit', 'Connection failed', error as Error);
        return false;
      }
    },
    [context]
  );

  /**
   * Disconnects the wallet
   * Clears session and local storage
   */
  const disconnect = useCallback(async (): Promise<boolean> => {
    try {
      setOperationError(null);
      logger.info('useLazorkit', 'Disconnecting wallet...');

      await context.disconnect();

      logger.info('useLazorkit', 'Wallet disconnected successfully');
      return true;
    } catch (error) {
      const errorMessage = mapErrorToMessage(
        error as Error,
        'Failed to disconnect wallet. Please refresh and try again.'
      );
      setOperationError(errorMessage);
      logger.error('useLazorkit', 'Disconnection failed', error as Error);
      return false;
    }
  }, [context]);

  /**
   * Reconnects to a previously connected wallet (if session exists)
   * Called on app load to restore user session
   */
  const reconnect = useCallback(async (): Promise<boolean> => {
    try {
      setOperationError(null);
      logger.info('useLazorkit', 'Attempting to reconnect to previous wallet...');

      // Try to connect with existing session
      // Lazorkit SDK automatically checks localStorage for session
      await context.connect({ feeMode: 'paymaster' });

      logger.info('useLazorkit', 'Successfully reconnected to wallet');
      return true;
    } catch {
      // Reconnection failed is normal - user is just not logged in
      logger.debug('useLazorkit', 'No existing session to reconnect to');
      return false;
    }
  }, [context]);

  /**
   * Clears any pending errors
   */
  const clearError = useCallback(() => {
    setOperationError(null);
  }, []);

  return {
    // State
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    wallet: context.wallet,
    error: operationError || context.error?.message || null,

    // Methods
    connect,
    disconnect,
    reconnect,
    clearError,

    // Utilities
    hasError: !!operationError || !!context.error,
  };
};
