/**
 * useWallet Hook
 * 
 * Provides wallet-specific operations like balance fetching,
 * address formatting, and wallet metadata management.
 * 
 * Usage:
 *   const { address, balance, isLoading } = useWallet();
 */

import { useEffect, useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useLazorkitContext } from '@/contexts/LazorkitContext';
import { useWalletContext } from '@/contexts/WalletContext';
import { getSolBalance, getUsdcBalance } from '@/lib/solana/connection';
import { lamportsToSol, usdcToToken } from '@/lib/utils/formatting';
import { logger } from '@/lib/utils/logger';

/**
 * Hook for wallet operations and queries
 */
export const useWallet = () => {
  const { wallet, isConnected } = useLazorkitContext();
  const { solBalance, usdcBalance, isLoadingBalances, refreshBalances } = useWalletContext();

  const [walletAddress, setWalletAddress] = useState<PublicKey | null>(null);
  const [displayAddress, setDisplayAddress] = useState('');
  const [createdAt, setCreatedAt] = useState<Date | null>(null);

  /**
   * Update wallet address when SDK wallet changes
   */
  useEffect(() => {
    if (wallet?.smartWallet) {
      try {
        const pubKey = new PublicKey(wallet.smartWallet);
        setWalletAddress(pubKey);
        setDisplayAddress(wallet.smartWallet);

        // Set wallet creation date (approximate - when wallet was first created)
        setCreatedAt(new Date());

        logger.debug('useWallet', 'Wallet address updated', {
          address: wallet.smartWallet.substring(0, 10),
        });
      } catch (error) {
        logger.error('useWallet', 'Invalid wallet address from SDK', error as Error);
      }
    }
  }, [wallet?.smartWallet]);

  /**
   * Refresh balances when wallet connects
   */
  useEffect(() => {
    if (isConnected && walletAddress) {
      refreshBalances(walletAddress);

      // Also refresh on an interval
      const interval = setInterval(() => {
        refreshBalances(walletAddress);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isConnected, walletAddress, refreshBalances]);

  /**
   * Get balance in display units (SOL, USDC)
   */
  const getDisplayBalance = useCallback(
    (tokenType: 'SOL' | 'USDC'): string => {
      if (tokenType === 'SOL') {
        return lamportsToSol(solBalance).toFixed(4);
      } else {
        return usdcToToken(usdcBalance).toFixed(2);
      }
    },
    [solBalance, usdcBalance]
  );

  /**
   * Copy address to clipboard
   */
  const copyAddress = useCallback(async (): Promise<boolean> => {
    if (!displayAddress) return false;

    try {
      await navigator.clipboard.writeText(displayAddress);
      logger.info('useWallet', 'Address copied to clipboard');
      return true;
    } catch (error) {
      logger.error('useWallet', 'Failed to copy address', error as Error);
      return false;
    }
  }, [displayAddress]);

  return {
    // Address information
    address: walletAddress,
    displayAddress,
    shortAddress: displayAddress.substring(0, 10) + '...' + displayAddress.substring(-4),

    // Balance information (in smallest units)
    solBalance,
    usdcBalance,

    // Display balances (formatted)
    displaySolBalance: getDisplayBalance('SOL'),
    displayUsdcBalance: getDisplayBalance('USDC'),

    // Status
    isConnected,
    isLoading: isLoadingBalances,
    createdAt,

    // Methods
    copyAddress,
    refreshBalances: () => walletAddress && refreshBalances(walletAddress),
  };
};
