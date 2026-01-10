/**
 * Lazorkit SDK Provider Context
 * 
 * This context wraps the Lazorkit SDK provider and exposes
 * SDK functionality to the rest of the application.
 * 
 * Usage:
 *   const { connect, disconnect, isConnected } = useLazorkitContext();
 */

'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { LazorkitProvider, useWallet } from '@lazorkit/wallet';
import { getLazorkitConfig, logLazorkitConfig } from '@/lib/lazorkit/config';
import { WalletInfo } from '@/lib/lazorkit/types';
import { logger } from '@/lib/utils/logger';

/**
 * Lazorkit Context Type Definition
 */
interface LazorkitContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  wallet: WalletInfo | null;
  error: Error | null;

  // SDK methods
  connect: (options?: { feeMode?: 'paymaster' | 'user' }) => Promise<void>;
  disconnect: () => Promise<void>;
}

/**
 * Create the Lazorkit context
 */
const LazorkitContext = createContext<LazorkitContextType | undefined>(undefined);

/**
 * Hook to use the Lazorkit context
 * Must be used inside LazorkitContextProvider
 */
export const useLazorkitContext = () => {
  const context = useContext(LazorkitContext);
  if (!context) {
    throw new Error('useLazorkitContext must be used inside LazorkitContextProvider');
  }
  return context;
};

/**
 * Internal component that uses the Lazorkit SDK
 * Separated from provider to ensure it runs inside LazorkitProvider
 */
const LazorkitContextConsumer = ({ children }: { children: ReactNode }) => {
  const { connect: sdkConnect, disconnect: sdkDisconnect, isConnected, wallet } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    logLazorkitConfig();
  }, []);

  /**
   * Handles user connection to the SDK
   * Shows portal for passkey creation/authentication
   */
  const handleConnect = async (options?: { feeMode?: 'paymaster' | 'user' }) => {
    try {
      setIsConnecting(true);
      setError(null);
      logger.info('LazorkitContext', 'Starting wallet connection...');

      // Call SDK connect - opens portal for passkey auth
      const result = await sdkConnect(options || { feeMode: 'paymaster' });

      logger.info('LazorkitContext', 'Wallet connected successfully', {
        address: result?.smartWallet,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('LazorkitContext', 'Connection failed', error);
      setError(error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Handles user disconnection
   */
  const handleDisconnect = async () => {
    try {
      setError(null);
      logger.info('LazorkitContext', 'Disconnecting wallet...');

      await sdkDisconnect();

      logger.info('LazorkitContext', 'Wallet disconnected successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('LazorkitContext', 'Disconnection failed', error);
      setError(error);
      throw error;
    }
  };

  const value: LazorkitContextType = {
    isConnected,
    isConnecting,
    wallet: wallet as WalletInfo | null,
    error,
    connect: handleConnect,
    disconnect: handleDisconnect,
  };

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return null;
  }

  return (
    <LazorkitContext.Provider value={value}>
      {children}
    </LazorkitContext.Provider>
  );
};

/**
 * Lazorkit Provider Component
 * Wraps the application with Lazorkit SDK provider and context
 * 
 * Usage:
 *   <LazorkitContextProvider>
 *     <YourApp />
 *   </LazorkitContextProvider>
 */
export const LazorkitContextProvider = ({ children }: { children: ReactNode }) => {
  const config = getLazorkitConfig();

  return (
    <LazorkitProvider
      rpcUrl={config.rpcUrl}
      portalUrl={config.portalUrl}
      paymasterConfig={config.paymasterConfig}
    >
      <LazorkitContextConsumer>{children}</LazorkitContextConsumer>
    </LazorkitProvider>
  );
};
