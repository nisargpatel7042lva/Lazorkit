/**
 * useTransfer Hook
 * 
 * Orchestrates the gasless transfer flow including:
 * - Input validation
 * - Balance checks
 * - Transaction signing
 * - Status tracking
 * 
 * Usage:
 *   const { transfer, isProcessing } = useTransfer();
 */

import { useCallback, useState } from 'react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { useWallet as useSdkWallet } from '@lazorkit/wallet';
import { useWalletContext } from '@/contexts/WalletContext';
import { getUsdcMint, USDC_DECIMALS } from '@/lib/lazorkit/constants';
import { validateTransfer, validateNotOwnAddress } from '@/lib/utils/validation';
import { tokenToUsdc, solToLamports } from '@/lib/utils/formatting';
import { mapErrorToMessage } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { TransactionStatus, StoredTransaction } from '@/lib/lazorkit/types';

/**
 * Transfer result type
 */
interface TransferResult {
  success: boolean;
  signature?: string;
  error?: string;
}

/**
 * Hook for handling gasless transfers
 */
export const useTransfer = () => {
  const { signAndSendTransaction, smartWalletPubkey } = useSdkWallet();
  const { addTransaction } = useWalletContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  /**
   * Validates recipient address matches user's current address
   */
  const validateRecipient = useCallback(
    (recipientAddress: string): string | null => {
      if (!smartWalletPubkey) {
        return 'Wallet not connected';
      }

      return validateNotOwnAddress(smartWalletPubkey.toString(), recipientAddress);
    },
    [smartWalletPubkey]
  );

  /**
   * Executes a gasless SOL transfer
   */
  const transferSol = useCallback(
    async (
      recipientAddress: string,
      amount: number // in SOL
    ): Promise<TransferResult> => {
      if (!smartWalletPubkey) {
        return { success: false, error: 'Wallet not connected' };
      }

      try {
        setIsProcessing(true);
        setTransferError(null);
        logger.info('useTransfer', 'Starting SOL transfer', {
          recipient: recipientAddress.substring(0, 10),
          amount,
        });

        // Validate inputs
        const recipientValidationError = validateRecipient(recipientAddress);
        if (recipientValidationError) {
          setTransferError(recipientValidationError);
          return { success: false, error: recipientValidationError };
        }

        const recipientPubkey = new PublicKey(recipientAddress);

        // Create transfer instruction
        const instruction = SystemProgram.transfer({
          fromPubkey: smartWalletPubkey,
          toPubkey: recipientPubkey,
          lamports: solToLamports(amount),
        });

        // Sign and send via Lazorkit (gasless)
        const signature = await signAndSendTransaction({
          instructions: [instruction],
          transactionOptions: {
            feeToken: 'SOL',
            computeUnitLimit: 200_000,
          },
        });

        setTransactionSignature(signature);

        // Record transaction
        const transaction: StoredTransaction = {
          signature,
          timestamp: new Date(),
          type: 'transfer',
          tokenType: 'SOL',
          amount: solToLamports(amount),
          recipientAddress,
          status: TransactionStatus.CONFIRMING,
          description: `Transferred ${amount} SOL to ${recipientAddress.substring(0, 10)}...`,
        };

        addTransaction(transaction);

        logger.info('useTransfer', 'SOL transfer successful', { signature });
        return { success: true, signature };
      } catch (error) {
        const errorMessage = mapErrorToMessage(
          error as Error,
          'Transfer failed. Please try again.'
        );
        setTransferError(errorMessage);
        logger.error('useTransfer', 'SOL transfer failed', error as Error);
        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    [smartWalletPubkey, signAndSendTransaction, validateRecipient, addTransaction]
  );

  /**
   * Executes a gasless USDC transfer
   */
  const transferUsdc = useCallback(
    async (
      recipientAddress: string,
      amount: number // in USDC tokens
    ): Promise<TransferResult> => {
      if (!smartWalletPubkey) {
        return { success: false, error: 'Wallet not connected' };
      }

      try {
        setIsProcessing(true);
        setTransferError(null);
        logger.info('useTransfer', 'Starting USDC transfer', {
          recipient: recipientAddress.substring(0, 10),
          amount,
        });

        // Validate inputs
        const recipientValidationError = validateRecipient(recipientAddress);
        if (recipientValidationError) {
          setTransferError(recipientValidationError);
          return { success: false, error: recipientValidationError };
        }

        const recipientPubkey = new PublicKey(recipientAddress);

        // Get associated token accounts
        const senderUsdcAta = await getAssociatedTokenAddress(getUsdcMint(), smartWalletPubkey);
        const recipientUsdcAta = await getAssociatedTokenAddress(getUsdcMint(), recipientPubkey);

        // Create USDC transfer instruction
        const amountInUsdc = BigInt(tokenToUsdc(amount));
        const instruction = createTransferInstruction(
          senderUsdcAta,
          recipientUsdcAta,
          smartWalletPubkey,
          amountInUsdc
        );

        // Sign and send via Lazorkit (gasless, paid in USDC)
        const signature = await signAndSendTransaction({
          instructions: [instruction],
          transactionOptions: {
            feeToken: 'USDC', // Pay gas in USDC
            computeUnitLimit: 200_000,
          },
        });

        setTransactionSignature(signature);

        // Record transaction
        const transaction: StoredTransaction = {
          signature,
          timestamp: new Date(),
          type: 'transfer',
          tokenType: 'USDC',
          amount: tokenToUsdc(amount),
          recipientAddress,
          status: TransactionStatus.CONFIRMING,
          description: `Transferred ${amount} USDC to ${recipientAddress.substring(0, 10)}...`,
        };

        addTransaction(transaction);

        logger.info('useTransfer', 'USDC transfer successful', { signature });
        return { success: true, signature };
      } catch (error) {
        const errorMessage = mapErrorToMessage(
          error as Error,
          'USDC transfer failed. Please try again.'
        );
        setTransferError(errorMessage);
        logger.error('useTransfer', 'USDC transfer failed', error as Error);
        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    [smartWalletPubkey, signAndSendTransaction, validateRecipient, addTransaction]
  );

  /**
   * Generic transfer method that handles both SOL and USDC
   */
  const transfer = useCallback(
    async (
      tokenType: 'SOL' | 'USDC',
      recipientAddress: string,
      amount: number
    ): Promise<TransferResult> => {
      if (tokenType === 'SOL') {
        return transferSol(recipientAddress, amount);
      } else {
        return transferUsdc(recipientAddress, amount);
      }
    },
    [transferSol, transferUsdc]
  );

  /**
   * Clears any pending errors
   */
  const clearError = useCallback(() => {
    setTransferError(null);
  }, []);

  return {
    // State
    isProcessing,
    error: transferError,
    lastSignature: transactionSignature,

    // Methods
    transfer,
    transferSol,
    transferUsdc,
    validateRecipient,
    clearError,

    // Utilities
    hasError: !!transferError,
  };
};
