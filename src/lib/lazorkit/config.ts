/**
 * Lazorkit SDK Configuration
 * 
 * This module exports the Lazorkit provider configuration that will be used
 * in the root layout. It centralizes all SDK setup in one place for easy maintenance.
 */

import {
  LAZORKIT_PORTAL_URL,
  LAZORKIT_PAYMASTER_URL,
  SOLANA_RPC_URL,
  SOLANA_NETWORK,
} from './constants';
import { LazorkitClientOptions } from './types';

/**
 * Creates the Lazorkit provider configuration
 * 
 * This configuration tells the SDK:
 * 1. Where to send RPC calls (Solana node)
 * 2. Where to redirect for passkey authentication
 * 3. Where to submit transactions for gas sponsorship
 * 
 * @returns Configuration object for LazorkitProvider
 */
export const getLazorkitConfig = (): LazorkitClientOptions => {
  return {
    rpcUrl: SOLANA_RPC_URL,
    portalUrl: LAZORKIT_PORTAL_URL,
    paymasterConfig: {
      paymasterUrl: LAZORKIT_PAYMASTER_URL,
    },
    cluster: SOLANA_NETWORK,
  };
};

/**
 * Validates that all required environment variables are set
 * Call this during app initialization to catch config errors early
 * 
 * @throws Error if required environment variables are missing
 */
export const validateLazorkitConfig = (): void => {
  const requiredVars = {
    'NEXT_PUBLIC_SOLANA_RPC_URL': SOLANA_RPC_URL,
    'NEXT_PUBLIC_LAZORKIT_PORTAL_URL': LAZORKIT_PORTAL_URL,
    'NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL': LAZORKIT_PAYMASTER_URL,
  };

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      console.error(`Missing required environment variable: ${key}`);
      throw new Error(`Configuration Error: ${key} is not set`);
    }
  }

  console.log('[Lazorkit] Configuration validated successfully');
  console.log(`[Lazorkit] Network: ${SOLANA_NETWORK}`);
  console.log(`[Lazorkit] RPC: ${SOLANA_RPC_URL.substring(0, 30)}...`);
};

/**
 * Logs the active configuration to console
 * Useful for debugging (will only show environment variables, not secrets)
 */
export const logLazorkitConfig = (): void => {
  if (typeof window !== 'undefined') {
    console.group('Lazorkit Configuration');
    console.log('Network:', SOLANA_NETWORK);
    console.log('RPC URL:', SOLANA_RPC_URL.substring(0, 40) + '...');
    console.log('Portal URL:', LAZORKIT_PORTAL_URL);
    console.log('Paymaster URL:', LAZORKIT_PAYMASTER_URL.substring(0, 40) + '...');
    console.groupEnd();
  }
};
