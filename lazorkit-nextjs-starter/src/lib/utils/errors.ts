/**
 * Error Handling Utilities
 * 
 * Provides custom error classes and error message formatting
 * for consistent error handling across the application.
 */

import { ERROR_MESSAGES } from '../lazorkit/constants';

/**
 * Custom Error for Lazorkit SDK operations
 */
export class LazorkitError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'LazorkitError';
  }
}

/**
 * Custom Error for wallet validation failures
 */
export class WalletValidationError extends Error {
  constructor(
    message: string,
    public fieldName?: string
  ) {
    super(message);
    this.name = 'WalletValidationError';
  }
}

/**
 * Custom Error for transaction failures
 */
export class TransactionError extends Error {
  constructor(
    message: string,
    public signature?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

/**
 * Maps error codes or messages to user-friendly error messages
 * 
 * This function attempts to:
 * 1. Check predefined error messages by exact match
 * 2. Check if error message contains known keywords
 * 3. Fall back to generic message
 * 
 * @param error - Error object or error message string
 * @param defaultMessage - Fallback message if no match found
 * @returns User-friendly error message
 */
export const mapErrorToMessage = (
  error: Error | string,
  defaultMessage = 'An unexpected error occurred. Please try again.'
): string => {
  const message = typeof error === 'string' ? error : error.message || '';

  // Check for exact matches in predefined messages
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key) || message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Check for DialogManager/Portal errors (Lazorkit SDK)
  if (message.includes('DialogManager') || message.includes('portal')) {
    // Portal communication failed - usually a signing/auth issue
    if (message.includes('sign') || message.toLowerCase().includes('signing')) {
      return ERROR_MESSAGES['signing_failed'] || 'Failed to sign transaction. Please try again.';
    }
    // Generic portal error
    return 'Failed to communicate with the authentication portal. Please try again or reconnect your wallet.';
  }

  // Check for signing failures
  if (message.includes('sign') || message.toLowerCase().includes('signing') || 
      message.includes('SigningError') || message.includes('passkey')) {
    return ERROR_MESSAGES['signing_failed'] || 'Failed to sign transaction. Please try again.';
  }

  // Check for passkey issues
  if (message.includes('passkeyMismatch') || message.includes('WalletWindowClosedError') ||
      message.includes('credential') || message.includes('WebAuthn')) {
    return ERROR_MESSAGES['passkey_mismatch'] || 'Passkey verification failed. Please authenticate again.';
  }

  if (message.includes('insufficientBalance') || message.includes('Insufficient funds')) {
    return ERROR_MESSAGES['insufficient_balance'] || 'Insufficient balance to complete this transaction.';
  }

  if (message.includes('NetworkError') || message.includes('fetch')) {
    return ERROR_MESSAGES['network_error'] || 'Network error. Please check your connection and try again.';
  }

  if (message.includes('RpcError') || message.includes('rpc')) {
    return ERROR_MESSAGES['rpc_error'] || 'RPC error. Please try again or switch to a different RPC endpoint.';
  }

  if (message.includes('InvalidPublicKey') || message.includes('PublicKeyError')) {
    return ERROR_MESSAGES['invalid_recipient'] || 'Invalid recipient address. Please check and try again.';
  }

  if (message.includes('timeout') || message.includes('Timeout')) {
    return ERROR_MESSAGES['transaction_timeout'] || 'Transaction confirmation timed out. Please check Solscan for status.';
  }

  // Return provided default or generic message
  return defaultMessage;
};

/**
 * Extracts error details for logging
 * 
 * @param error - Error object
 * @returns Object with error details
 */
export const extractErrorDetails = (error: Error | string) => {
  return {
    message: typeof error === 'string' ? error : error.message,
    name: typeof error === 'string' ? 'String Error' : error.name,
    stack: typeof error === 'string' ? null : error.stack,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Safely logs error to console in development
 * Prevents sensitive information from leaking in production
 * 
 * @param context - Where the error occurred
 * @param error - Error object
 */
export const logError = (context: string, error: Error | string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, extractErrorDetails(error));
  } else {
    console.error(`[${context}] ${typeof error === 'string' ? error : error.message}`);
  }
};

/**
 * Validates a Solana public key address
 * 
 * @param address - Address string to validate
 * @returns True if valid, false otherwise
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    // Solana addresses are 44 base58 characters or 32 bytes when decoded
    if (!address || address.length < 32 || address.length > 44) {
      return false;
    }

    // Check if it's valid base58
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    for (const char of address) {
      if (!alphabet.includes(char)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Checks if error is a timeout error
 * 
 * @param error - Error object
 * @returns True if timeout error
 */
export const isTimeoutError = (error: Error | string): boolean => {
  const message = typeof error === 'string' ? error : error.message;
  return (
    message.includes('timeout') ||
    message.includes('Timeout') ||
    message.includes('TIMEOUT') ||
    message.includes('timed out')
  );
};

/**
 * Checks if error is a network error
 * 
 * @param error - Error object
 * @returns True if network error
 */
export const isNetworkError = (error: Error | string): boolean => {
  const message = typeof error === 'string' ? error : error.message;
  return (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('Network') ||
    message.includes('NETWORK') ||
    message.includes('offline')
  );
};
