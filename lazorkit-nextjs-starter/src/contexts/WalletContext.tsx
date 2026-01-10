/**
 * Wallet State Context
 * 
 * Manages application-level wallet state including:
 * - Balances (SOL and USDC)
 * - Transaction history
 * - User preferences
 * 
 * Usage:
 *   const { solBalance, usdcBalance, transactions } = useWalletContext();
 */

'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  getWalletBalances,
  getRecentTransactions,
  getTransactionDetails,
} from '@/lib/solana/connection';
import { WalletBalance, StoredTransaction, TransactionStatus } from '@/lib/lazorkit/types';
import { BALANCE_REFRESH_INTERVAL, MAX_TRANSACTION_HISTORY } from '@/lib/lazorkit/constants';
import { logger } from '@/lib/utils/logger';

/**
 * Wallet Context Type Definition
 */
interface WalletContextType {
  // Balance state
  solBalance: number;
  usdcBalance: number;
  isLoadingBalances: boolean;
  balanceError: string | null;

  // Transaction history
  transactions: StoredTransaction[];
  isLoadingTransactions: boolean;

  // Methods
  refreshBalances: (address: PublicKey) => Promise<void>;
  refreshTransactionHistory: (address: PublicKey) => Promise<void>;
  addTransaction: (transaction: StoredTransaction) => void;
}

/**
 * Create the wallet context
 */
const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Hook to use the wallet context
 * Must be used inside WalletContextProvider
 */
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used inside WalletContextProvider');
  }
  return context;
};

/**
 * Wallet Context Provider Component
 * Manages balance updates and transaction history
 */
export const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const [solBalance, setSolBalance] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Track balance refresh interval
  const balanceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAddressRef = useRef<string | null>(null);

  /**
   * Refreshes wallet balances from on-chain
   */
  const refreshBalances = useCallback(async (address: PublicKey) => {
    if (!address) return;

    try {
      setIsLoadingBalances(true);
      setBalanceError(null);

      const { solBalance: sol, usdcBalance: usdc } = await getWalletBalances(address);

      setSolBalance(sol);
      setUsdcBalance(usdc);

      logger.debug('WalletContext', 'Balances refreshed', {
        sol,
        usdc,
        address: address.toString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch balances';
      setBalanceError(message);
      logger.error('WalletContext', 'Failed to refresh balances', error as Error);
    } finally {
      setIsLoadingBalances(false);
    }
  }, []);

  /**
   * Refreshes transaction history from on-chain
   */
  const refreshTransactionHistory = useCallback(async (address: PublicKey) => {
    if (!address) return;

    try {
      setIsLoadingTransactions(true);

      const signatures = await getRecentTransactions(address, MAX_TRANSACTION_HISTORY);

      // Fetch details for each transaction
      const txDetails = await Promise.all(
        signatures.map(async (sig) => {
          try {
            const details = await getTransactionDetails(sig);
            return {
              signature: sig,
              timestamp: new Date(),
              type: 'transfer' as const,
              tokenType: 'SOL',
              amount: 0,
              recipientAddress: '',
              status: details ? TransactionStatus.CONFIRMED : TransactionStatus.PENDING,
              description: 'Transaction',
            };
          } catch {
            return {
              signature: sig,
              timestamp: new Date(),
              type: 'other' as const,
              tokenType: 'SOL',
              amount: 0,
              recipientAddress: '',
              status: TransactionStatus.PENDING,
              description: 'Pending transaction',
            };
          }
        })
      );

      setTransactions(txDetails);

      logger.debug('WalletContext', 'Transaction history refreshed', {
        count: txDetails.length,
      });
    } catch (error) {
      logger.error('WalletContext', 'Failed to refresh transaction history', error as Error);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  /**
   * Adds a new transaction to the history
   */
  const addTransaction = useCallback((transaction: StoredTransaction) => {
    setTransactions((prev) => [transaction, ...prev.slice(0, MAX_TRANSACTION_HISTORY - 1)]);
    logger.info('WalletContext', 'New transaction added', {
      signature: transaction.signature,
    });
  }, []);

  /**
   * Sets up automatic balance refresh when address changes
   */
  useEffect(() => {
    return () => {
      // Cleanup interval on unmount
      if (balanceIntervalRef.current) {
        clearInterval(balanceIntervalRef.current);
      }
    };
  }, []);

  const value: WalletContextType = {
    solBalance,
    usdcBalance,
    isLoadingBalances,
    balanceError,
    transactions,
    isLoadingTransactions,
    refreshBalances,
    refreshTransactionHistory,
    addTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
