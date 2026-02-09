/**
 * Lazorkit TypeScript Type Definitions
 * 
 * This file extends the base Lazorkit types and creates custom types
 * used throughout the application for type safety and better IDE support.
 */

import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { TransactionStatus, ToastType } from './constants';

// --- Core Domain Types ---

/**
 * Supported Token Types
 * 'SOL' is the native token, others are SPL tokens
 */
export type TokenType = 'SOL' | 'USDC' | 'TOKEN';

/**
 * Token Metadata
 */
export interface TokenMetadata {
  mint: string;
  symbol: string;
  decimals: number;
  name?: string;
  icon?: string;
}

/**
 * On-Chain Transaction Record
 * Represents a transaction as stored in transaction history
 */
export interface StoredTransaction {
  /** Solana transaction signature */
  signature: string;

  /** Transaction timestamp */
  timestamp: Date;

  /** Transaction type (e.g., 'transfer', 'approval') */
  type: 'transfer' | 'approval' | 'swap' | 'other';

  /** 'SOL' or token symbol for transfers */
  tokenType: TokenType;

  /** Amount transferred (in raw units/lamports, positive = receive, negative = send) */
  amount: number;

  /** Display amount (human readable, adjusted for decimals) */
  displayAmount?: number;

  /** Recipient address */
  recipientAddress: string;

  /** Current confirmation status */
  status: TransactionStatus;

  /** Human-readable description */
  description: string;

  /** Metadata for UI rendering */
  metadata?: {
    fee?: number;
    slot?: number;
    err?: any;
  }
}

/**
 * Wallet Information from Lazorkit SDK
 * This is returned when a user creates or authenticates with a passkey
 */
export interface WalletInfo {
  /** Unique identifier for the passkey credential (Base64) */
  credentialId: string;

  /** Raw public key bytes for the passkey (33 bytes, secp256r1 P256 curve) */
  passkeyPubkey: number[];

  /** Solana smart wallet address (derived from wallet ID on-chain) */
  smartWallet: string;

  /** Internal PDA for device management */
  walletDevice: string;

  /** Platform information (e.g., 'macIntel', 'web', 'iPhone') */
  platform: string;

  /** User's account name (if available) */
  accountName?: string;
}

/**
 * Application Wallet State
 * Mirrors the connected wallet in the app context
 */
export interface AppWalletState {
  /** Wallet address as PublicKey */
  address: PublicKey | null;

  /** Raw wallet info from Lazorkit */
  walletInfo: WalletInfo | null;

  /** Is wallet currently connected */
  isConnected: boolean;

  /** Wallet creation timestamp */
  createdAt: Date | null;
}

/**
 * Wallet Balance Information
 * Stores SOL and USDC balances separately
 */
export interface WalletBalance {
  /** SOL balance in lamports */
  solBalance: number;

  /** USDC balance in smallest units (6 decimals) */
  usdcBalance: number;

  /** Timestamp of last balance update */
  lastUpdated: Date;
}

/**
 * Transfer Operation Data
 * Used during the transfer form and preview flow
 */
export interface TransferData {
  /** Recipient's public key (validated) */
  recipientAddress: PublicKey | null;

  /** Raw recipient input before validation */
  recipientInput: string;

  /** Amount to transfer (string input) */
  amount: string;

  /** Token being transferred */
  tokenType: TokenType;

  /** Estimated gas fee */
  estimatedGasFee: number | null;

  /** Validation errors (field -> error message) */
  errors: Record<string, string>;

  /** Is transfer data valid and ready to submit */
  isValid: boolean;
}

/**
 * API Response Wrapper
 * Used for all async operations that can fail
 */
export interface ApiResponse<T> {
  /** Success flag */
  success: boolean;

  /** Response data if successful */
  data?: T;

  /** Error message if failed */
  error?: string;

  /** Raw error object for debugging */
  rawError?: Error;
}

/**
 * Toast Notification Data
 * Used to display user feedback messages
 */
export interface Toast {
  /** Unique identifier */
  id: string;

  /** Notification type (success, error, warning, info) */
  type: ToastType;

  /** Message to display */
  message: string;

  /** Optional detailed description */
  description?: string;

  /** Auto-dismiss after milliseconds (null = manual dismiss) */
  duration?: number | null;
}

/**
 * Passkey Browser Support Info
 * Checked at app startup to show appropriate messages
 */
export interface PasskeySupport {
  /** Is WebAuthn API available */
  isSupported: boolean;

  /** Is platform authenticator available (biometric) */
  isPlatformAuthenticatorAvailable: boolean;

  /** Browser name if available */
  browserName?: string;

  /** User-friendly message if not supported */
  unsupportedMessage?: string;
}

/**
 * Session State
 * Tracks authentication and session status
 */
export interface SessionState {
  /** Is user currently authenticated */
  isAuthenticated: boolean;

  /** Wallet address if authenticated */
  walletAddress: PublicKey | null;

  /** When session started */
  startedAt: Date | null;

  /** When session expires (if applicable) */
  expiresAt: Date | null;

  /** Session ID for tracking */
  sessionId?: string;
}

/**
 * Lazorkit SDK Client Options
 * Configuration passed to LazorkitProvider
 */
export interface LazorkitClientOptions {
  /** Solana RPC endpoint URL */
  rpcUrl: string;

  /** Lazorkit portal URL for authentication */
  portalUrl: string;

  /** Paymaster configuration for gasless transactions */
  paymasterConfig: {
    paymasterUrl: string;
    apiKey?: string;
  };

  /** Network cluster ('devnet' | 'mainnet' | 'testnet') */
  cluster?: string;
}

/**
 * Sign and Send Transaction Payload
 * Matches the Lazorkit SDK's expected format
 */
export interface SignAndSendTransactionPayload {
  /** Array of transaction instructions */
  instructions: TransactionInstruction[];

  /** Transaction options */
  transactionOptions?: {
    feeToken?: 'SOL' | 'USDC';
    computeUnitLimit?: number;
    addressLookupTableAccounts?: PublicKey[];
  };
}

/**
 * Re-export TransactionStatus enum from constants
 * Provides a single import path for all types and enums
 */
export { TransactionStatus, ToastType } from './constants';
