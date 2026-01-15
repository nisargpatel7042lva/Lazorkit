/**
 * Solana and Token Utility Functions
 * 
 * Helper functions for converting between different units,
 * formatting values for display, and Solana-specific operations.
 */

import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { USDC_DECIMALS, SOL_DECIMALS } from '../lazorkit/constants';

/**
 * Converts lamports (smallest SOL unit) to SOL
 * @param lamports - Amount in lamports
 * @returns Amount in SOL
 */
export const lamportsToSol = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

/**
 * Converts SOL to lamports (smallest SOL unit)
 * @param sol - Amount in SOL
 * @returns Amount in lamports
 */
export const solToLamports = (sol: number): number => {
  return Math.floor(sol * LAMPORTS_PER_SOL);
};

/**
 * Converts the smallest USDC unit to USDC tokens
 * USDC has 6 decimal places
 * @param amount - Amount in smallest units (6 decimals)
 * @returns Amount in USDC
 */
export const usdcToToken = (amount: number): number => {
  return amount / Math.pow(10, USDC_DECIMALS);
};

/**
 * Converts USDC tokens to the smallest unit
 * @param amount - Amount in USDC
 * @returns Amount in smallest units (6 decimals)
 */
export const tokenToUsdc = (amount: number): number => {
  return Math.floor(amount * Math.pow(10, USDC_DECIMALS));
};

/**
 * Formats a number to display currency with specific decimal places
 * @param value - Value to format
 * @param decimals - Number of decimal places to show
 * @param currency - Currency symbol to prepend
 * @returns Formatted string (e.g., "$1,234.56")
 */
export const formatCurrency = (
  value: number,
  decimals = 2,
  currency = ''
): string => {
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return currency ? `${currency}${formatted}` : formatted;
};

/**
 * Abbreviates a long address to show first and last few characters
 * @param address - Full address string
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Abbreviated address (e.g., "5ohN6...2Gv9")
 */
export const abbreviateAddress = (
  address: string,
  startChars = 6,
  endChars = 4
): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Formats a Solana address for display (abbreviated by default)
 * @param address - PublicKey or string
 * @param abbreviated - Whether to abbreviate the address
 * @returns Formatted address string
 */
export const formatAddress = (
  address: string | { toString(): string },
  abbreviated = true
): string => {
  const addressStr = typeof address === 'string' ? address : address.toString();
  return abbreviated ? abbreviateAddress(addressStr) : addressStr;
};

/**
 * Formats a timestamp to a readable date string
 * @param date - Date object or timestamp
 * @param includeTime - Whether to include time (default: true)
 * @returns Formatted date string (e.g., "Jan 10, 2026 2:30 PM")
 */
export const formatDate = (date: Date | number, includeTime = true): string => {
  const dateObj = typeof date === 'number' ? new Date(date) : date;

  if (includeTime) {
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats a relative time string (e.g., "2 hours ago")
 * @param date - Date object or timestamp
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | number): string => {
  const dateObj = typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(dateObj, false);
};

/**
 * Parses a string input to a valid number for transfers
 * Removes currency symbols and extra whitespace
 * @param input - User input string
 * @returns Parsed number or null if invalid
 */
export const parseAmountInput = (input: string): number | null => {
  if (!input || typeof input !== 'string') return null;

  // Remove whitespace and common currency symbols
  const cleaned = input.trim().replace(/[$,\s]/g, '');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
};

/**
 * Validates an amount is within reasonable limits
 * Prevents accidental typos (e.g., sending 1,000,000 SOL)
 * @param amount - Amount to validate
 * @param maxAmount - Maximum allowed amount (default: 10,000)
 * @returns True if valid
 */
export const isValidAmount = (amount: number, maxAmount = 10000): boolean => {
  return amount > 0 && amount <= maxAmount && isFinite(amount);
};

/**
 * Converts small numbers to scientific notation for display
 * Useful for showing very small token amounts
 * @param value - Number to format
 * @param decimals - Decimal places
 * @returns Formatted string
 */
export const formatSmallNumber = (value: number, decimals = 8): string => {
  if (value === 0) return '0';
  if (Math.abs(value) >= 0.0001) {
    return value.toFixed(decimals);
  }
  return value.toExponential(decimals);
};

/**
 * Generates a Solscan URL for a transaction
 * @param signature - Transaction signature
 * @param network - Network ('devnet' | 'mainnet' | 'testnet')
 * @returns Full Solscan URL
 */
export const getSolscanUrl = (
  signature: string,
  network: 'devnet' | 'mainnet' | 'testnet' = 'devnet'
): string => {
  const baseUrl = 'https://solscan.io';
  const cluster = network === 'mainnet' ? '' : `?cluster=${network}`;
  return `${baseUrl}/tx/${signature}${cluster}`;
};

/**
 * Generates a Solscan URL for an address
 * @param address - Solana address
 * @param network - Network ('devnet' | 'mainnet' | 'testnet')
 * @returns Full Solscan URL
 */
export const getSolscanAddressUrl = (
  address: string,
  network: 'devnet' | 'mainnet' | 'testnet' = 'devnet'
): string => {
  const baseUrl = 'https://solscan.io';
  const cluster = network === 'mainnet' ? '' : `?cluster=${network}`;
  return `${baseUrl}/address/${address}${cluster}`;
};
