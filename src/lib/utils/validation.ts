/**
 * Input Validation Utilities
 * 
 * Functions for validating user inputs like addresses, amounts,
 * usernames, and other form fields.
 */

import { PublicKey } from '@solana/web3.js';
import { isValidSolanaAddress } from './errors';

/**
 * Validates a Solana wallet address
 * Checks format and length using PublicKey constructor
 * @param address - Address string to validate
 * @returns Null if valid, error message if invalid
 */
export const validateAddress = (address: string): string | null => {
  if (!address || address.trim() === '') {
    return 'Recipient address is required';
  }

  if (!isValidSolanaAddress(address)) {
    return 'Invalid Solana address format';
  }

  // Try to construct PublicKey to validate
  try {
    new PublicKey(address);
    return null;
  } catch {
    return 'Invalid Solana address';
  }
};

/**
 * Validates a transfer amount
 * Checks for positive numbers, format, and reasonable limits
 * @param amount - Amount as string
 * @param balance - Available balance to check against
 * @param decimals - Token decimals (default: 6)
 * @returns Object with isValid flag and error message if invalid
 */
export const validateAmount = (
  amount: string,
  balance: number = 0,
  decimals = 6
): { isValid: boolean; error?: string } => {
  // Check for empty input
  if (!amount || amount.trim() === '') {
    return { isValid: false, error: 'Amount is required' };
  }

  // Parse the amount
  const parsed = parseFloat(amount);

  // Check if valid number
  if (isNaN(parsed)) {
    return { isValid: false, error: 'Please enter a valid amount' };
  }

  // Check if positive
  if (parsed <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  // Check if exceeds balance
  if (parsed > balance) {
    return { isValid: false, error: 'Insufficient balance' };
  }

  // Check for reasonable max amount (prevent accidental huge transfers)
  const maxAmount = 10000;
  if (parsed > maxAmount) {
    return {
      isValid: false,
      error: `Amount exceeds maximum of ${maxAmount}. Please verify.`,
    };
  }

  // Check decimal places don't exceed token precision
  const decimalCount = (amount.split('.')[1] || '').length;
  if (decimalCount > decimals) {
    return {
      isValid: false,
      error: `Too many decimal places (max ${decimals})`,
    };
  }

  return { isValid: true };
};

/**
 * Validates a username or account name
 * Checks length and allowed characters
 * @param username - Username to validate
 * @returns Null if valid, error message if invalid
 */
export const validateUsername = (username: string): string | null => {
  if (!username || username.trim() === '') {
    return 'Username is required';
  }

  const trimmed = username.trim();

  // Check length
  if (trimmed.length < 3) {
    return 'Username must be at least 3 characters';
  }

  if (trimmed.length > 32) {
    return 'Username must be less than 32 characters';
  }

  // Allow alphanumeric, underscore, hyphen, and periods
  const validPattern = /^[a-zA-Z0-9_.-]+$/;
  if (!validPattern.test(trimmed)) {
    return 'Username can only contain letters, numbers, underscore, hyphen, and period';
  }

  return null;
};

/**
 * Validates email format (if needed for recovery)
 * @param email - Email to validate
 * @returns Null if valid, error message if invalid
 */
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
};

/**
 * Validates recipient and amount for a transfer
 * @param recipientAddress - Recipient address string
 * @param amount - Amount to transfer
 * @param balance - Available balance
 * @returns Object with validation results
 */
export const validateTransfer = (
  recipientAddress: string,
  amount: string,
  balance: number
): {
  isValid: boolean;
  addressError: string | undefined;
  amountError: string | undefined;
} => {
  const addressError = validateAddress(recipientAddress);
  const amountValidation = validateAmount(amount, balance);

  return {
    isValid: !addressError && amountValidation.isValid,
    addressError: addressError || undefined,
    amountError: amountValidation.error,
  };
};

/**
 * Checks if a string is a valid base58 string (Solana addresses use base58)
 * @param str - String to check
 * @returns True if valid base58
 */
export const isValidBase58 = (str: string): boolean => {
  const base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  for (const char of str) {
    if (!base58Alphabet.includes(char)) {
      return false;
    }
  }
  return true;
};

/**
 * Sanitizes user input to prevent injection attacks
 * @param input - User input string
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validates that address is not the user's own address
 * @param userAddress - User's own address
 * @param recipientAddress - Recipient address
 * @returns Null if valid, error message if invalid
 */
export const validateNotOwnAddress = (
  userAddress: string,
  recipientAddress: string
): string | null => {
  if (userAddress === recipientAddress) {
    return 'Cannot send to your own address';
  }
  return null;
};
