/**
 * Lazorkit and Solana Network Constants
 * 
 * This file contains all hardcoded configuration values for Lazorkit SDK,
 * network endpoints, and token addresses. All values are for Solana Devnet.
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Solana Network Configuration
 */
export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet' | 'testnet') ||
  'devnet';

/**
 * Lazorkit Configuration
 * These values tell the Lazorkit SDK where to:
 * 1. Redirect for passkey authentication (portalUrl)
 * 2. Submit transactions for sponsorship (paymasterUrl)
 */
export const LAZORKIT_PORTAL_URL =
  process.env.NEXT_PUBLIC_LAZORKIT_PORTAL_URL || 'https://portal.lazor.sh';

export const LAZORKIT_PAYMASTER_URL =
  process.env.NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL ||
  'https://kora.devnet.lazorkit.com';

/**
 * Token Configuration
 * USDC on Solana Devnet uses the standard SPL token address
 * Store as string to avoid module initialization errors during SSR
 */
export const USDC_MINT_ADDRESS = 
  process.env.NEXT_PUBLIC_USDC_MINT_ADDRESS || 'EPjFWaLb3odccccccccccccccccccccccccPEKjq';

// Lazy getter for USDC_MINT PublicKey to avoid SSR issues
export const getUsdcMint = (): PublicKey => new PublicKey(USDC_MINT_ADDRESS);

/**
 * Token Decimals
 * USDC uses 6 decimal places (like traditional currency cents but to the 6th place)
 * Example: 1 USDC = 1,000,000 lamports
 */
export const USDC_DECIMALS = 6;
export const SOL_DECIMALS = 9;

/**
 * UI/UX Constants
 */
export const BALANCE_REFRESH_INTERVAL = 5000; // Poll balances every 5 seconds
export const MAX_TRANSACTION_HISTORY = 10; // Show last 10 transactions
export const SESSION_STORAGE_KEY = 'lazorkit_wallet_session';
export const CREDENTIALS_STORAGE_KEY = 'lazorkit_credentials';

/**
 * Lazorkit Program Addresses (On-chain)
 * These are the smart contract addresses that verify signatures and manage wallets
 */
export const LAZORKIT_PROGRAM_ID = 'Gsuz7YcA5sbMGVRXT3xSYhJBessW4xFC4xYsihNCqMFh';
export const SECP256R1_PROGRAM_ID = 'Secp256r1SigVerify1111111111111111111111111';

/**
 * Error Messages
 * User-friendly messages for common error scenarios
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Browser/Platform Errors
  'webauthn_not_supported': 'WebAuthn (passkeys) is not supported in your browser. Please use Chrome, Safari, or Firefox on a device with biometric authentication.',
  'webauthn_setup_failed': 'Failed to setup passkey. Please try again or use a different device.',
  'credential_not_found': 'Passkey not found. Please register a new passkey.',

  // Wallet Errors
  'wallet_connection_failed': 'Failed to connect wallet. Please check your network and try again.',
  'wallet_disconnection_failed': 'Failed to disconnect wallet. Please try refreshing the page.',
  'insufficient_balance': 'Insufficient balance to complete this transaction.',
  'invalid_recipient': 'Invalid recipient address. Please check and try again.',

  // Transaction Errors
  'transaction_failed': 'Transaction failed. Please check your network and try again.',
  'transaction_timeout': 'Transaction confirmation timed out. Please check Solscan for status.',
  'signing_failed': 'Failed to sign transaction. Please try again.',
  'passkey_mismatch': 'Passkey verification failed. Please authenticate again.',

  // Network Errors
  'network_error': 'Network error. Please check your connection and try again.',
  'rpc_error': 'RPC error. Please try again or switch to a different RPC endpoint.',

  // Validation Errors
  'amount_required': 'Please enter an amount.',
  'amount_invalid': 'Please enter a valid amount.',
  'recipient_required': 'Please enter a recipient address.',
  'insufficient_funds': 'Insufficient funds for this transaction and gas fees.',
};

/**
 * Transaction Status Types
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

/**
 * Toast Notification Types
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

/**
 * Local Storage Keys
 * These are prefixed to avoid collisions with other apps
 */
export const STORAGE_KEYS = {
  WALLET_SESSION: 'lazorkit:wallet:session',
  WALLET_ADDRESS: 'lazorkit:wallet:address',
  CREDENTIALS: 'lazorkit:credentials:data',
  TRANSACTION_HISTORY: 'lazorkit:transactions:history',
  APP_PREFERENCES: 'lazorkit:app:preferences',
} as const;
