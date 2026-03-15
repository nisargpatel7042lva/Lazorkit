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
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountIdempotentInstructionWithDerivation,
} from '@solana/spl-token';
import { useWallet as useSdkWallet } from '@lazorkit/wallet';
import { getSolanaConnection } from '@/lib/solana/connection';
import { useWalletContext } from '@/contexts/WalletContext';
import { getUsdcMint, USDC_DECIMALS } from '@/lib/lazorkit/constants';
import { validateTransfer, validateNotOwnAddress } from '@/lib/utils/validation';
import { tokenToUsdc, solToLamports } from '@/lib/utils/formatting';
import { mapErrorToMessage } from '@/lib/utils/errors';
import { logger } from '@/lib/utils/logger';
import { TransactionStatus, StoredTransaction } from '@/lib/lazorkit/types';
import { useDemoMode } from '@/hooks/useDemoMode';

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
  const isDemoMode = useDemoMode();
  const { signAndSendTransaction, smartWalletPubkey } = useSdkWallet();
  const { addTransaction } = useWalletContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  /**
   * Validates that the wallet session is ready for signing
   * Checks if signAndSendTransaction is available and wallet is connected
   */
  const validateWalletSession = useCallback((): string | null => {
    if (!smartWalletPubkey) {
      return 'Wallet not connected. Please connect your wallet first.';
    }

    if (!isDemoMode && !signAndSendTransaction) {
      return 'Wallet connection incomplete. Please reconnect your wallet.';
    }

    // Check if smartWalletPubkey is valid
    try {
      new PublicKey(smartWalletPubkey);
    } catch (error) {
      return 'Invalid wallet address. Please reconnect your wallet.';
    }

    return null;
  }, [smartWalletPubkey, isDemoMode, signAndSendTransaction]);

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
      // Validate wallet session first
      const sessionError = validateWalletSession();
      if (sessionError) {
        return { success: false, error: sessionError };
      }

      try {
        setIsProcessing(true);
        setTransferError(null);
        logger.info('useTransfer', 'Starting SOL transfer', {
          recipient: recipientAddress.substring(0, 10),
          amount,
          senderAddress: smartWalletPubkey!.toString().substring(0, 10),
        });

        // Validate inputs
        const recipientValidationError = validateRecipient(recipientAddress);
        if (recipientValidationError) {
          setTransferError(recipientValidationError);
          return { success: false, error: recipientValidationError };
        }

        // Validate amount
        if (amount <= 0) {
          const error = 'Amount must be greater than 0';
          setTransferError(error);
          return { success: false, error };
        }

        // Demo mode: simulate success so you can show the full flow without real signing
        if (isDemoMode) {
          await new Promise((r) => setTimeout(r, 1500));
          const signature = `demo-${Date.now()}`;
          setTransactionSignature(signature);
          const transaction: StoredTransaction = {
            signature,
            timestamp: new Date(),
            type: 'transfer',
            tokenType: 'SOL',
            amount: -solToLamports(amount),
            recipientAddress,
            status: TransactionStatus.CONFIRMED,
            description: `[Demo] Transferred ${amount} SOL to ${recipientAddress.substring(0, 10)}...`,
          };
          addTransaction(transaction);
          logger.info('useTransfer', 'SOL transfer simulated (demo mode)', { signature });
          return { success: true, signature };
        }

        const recipientPubkey = new PublicKey(recipientAddress);

        // Create transfer instruction
        const instruction = SystemProgram.transfer({
          fromPubkey: smartWalletPubkey!,
          toPubkey: recipientPubkey,
          lamports: solToLamports(amount),
        });

        logger.debug('useTransfer', 'Instruction created successfully', {
          instruction: instruction.programId.toString().substring(0, 10),
        });

        // Sign and send via Lazorkit (gasless)
        logger.info('useTransfer', 'Sending transaction to Lazorkit portal...');
        const signature = await signAndSendTransaction({
          instructions: [instruction],
          transactionOptions: {
            feeToken: 'SOL',
            computeUnitLimit: 200_000,
          },
        });

        setTransactionSignature(signature);

        // Record transaction (negative amount for outgoing)
        const transaction: StoredTransaction = {
          signature,
          timestamp: new Date(),
          type: 'transfer',
          tokenType: 'SOL',
          amount: -solToLamports(amount), // Negative for outgoing
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
        
        // Detailed logging for signing failures
        const err = error as any;
        const errorDetails = {
          message: err?.message || String(error),
          code: (err as any)?.code,
          name: (err as any)?.name,
          stack: (err as any)?.stack?.split('\n').slice(0, 3).join(' | '),
        };
        if ((err?.message || String(error)).toLowerCase().includes('sign')) {
          logger.error('useTransfer', 'SOL transfer signing failed', {
            ...errorDetails,
            type: 'SIGNING_FAILURE',
            tokenType: 'SOL',
          });
        } else {
          logger.error('useTransfer', 'SOL transfer failed', errorDetails);
        }
        
        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    [smartWalletPubkey, signAndSendTransaction, validateRecipient, validateWalletSession, addTransaction, isDemoMode]
  );

  /**
   * Executes a gasless USDC transfer
   */
  const transferUsdc = useCallback(
    async (
      recipientAddress: string,
      amount: number // in USDC tokens
    ): Promise<TransferResult> => {
      // Validate wallet session first
      const sessionError = validateWalletSession();
      if (sessionError) {
        return { success: false, error: sessionError };
      }

      try {
        setIsProcessing(true);
        setTransferError(null);
        logger.info('useTransfer', 'Starting USDC transfer', {
          recipient: recipientAddress.substring(0, 10),
          amount,
          senderAddress: smartWalletPubkey!.toString().substring(0, 10),
        });

        // Validate inputs
        const recipientValidationError = validateRecipient(recipientAddress);
        if (recipientValidationError) {
          setTransferError(recipientValidationError);
          return { success: false, error: recipientValidationError };
        }

        // Validate amount
        if (amount <= 0) {
          const error = 'Amount must be greater than 0';
          setTransferError(error);
          return { success: false, error };
        }

        // Demo mode: simulate success
        if (isDemoMode) {
          await new Promise((r) => setTimeout(r, 1500));
          const signature = `demo-${Date.now()}`;
          setTransactionSignature(signature);
          const transaction: StoredTransaction = {
            signature,
            timestamp: new Date(),
            type: 'transfer',
            tokenType: 'USDC',
            amount: -tokenToUsdc(amount),
            recipientAddress,
            status: TransactionStatus.CONFIRMED,
            description: `[Demo] Transferred ${amount} USDC to ${recipientAddress.substring(0, 10)}...`,
          };
          addTransaction(transaction);
          logger.info('useTransfer', 'USDC transfer simulated (demo mode)', { signature });
          return { success: true, signature };
        }

        const recipientPubkey = new PublicKey(recipientAddress);

        // Get associated token accounts
        logger.debug('useTransfer', 'Getting associated token accounts', {
          senderAddress: smartWalletPubkey!.toString().substring(0, 10),
          recipientAddress: recipientPubkey.toString().substring(0, 10),
        });

        const usdcMint = getUsdcMint();
        const senderUsdcAta = await getAssociatedTokenAddress(
          usdcMint,
          smartWalletPubkey!,
          true // allowOwnerOffCurve for smart wallet owner
        );
        const recipientUsdcAta = await getAssociatedTokenAddress(
          usdcMint,
          recipientPubkey
        );

        logger.debug('useTransfer', 'Associated token accounts retrieved', {
          senderAta: senderUsdcAta.toString().substring(0, 10),
          recipientAta: recipientUsdcAta.toString().substring(0, 10),
        });

        const connection = getSolanaConnection();
        const instructions: Parameters<typeof signAndSendTransaction>[0]['instructions'] = [];

        // Ensure sender USDC ATA exists (InvalidAccountData if missing)
        const senderAtaInfo = await connection.getAccountInfo(senderUsdcAta);
        if (!senderAtaInfo) {
          instructions.push(
            createAssociatedTokenAccountIdempotentInstructionWithDerivation(
              smartWalletPubkey!,
              smartWalletPubkey!,
              usdcMint,
              true // allowOwnerOffCurve for smart wallet
            )
          );
          logger.debug('useTransfer', 'Added create sender USDC ATA instruction');
        }

        // Ensure recipient USDC ATA exists
        const recipientAtaInfo = await connection.getAccountInfo(recipientUsdcAta);
        if (!recipientAtaInfo) {
          instructions.push(
            createAssociatedTokenAccountIdempotentInstructionWithDerivation(
              smartWalletPubkey!,
              recipientPubkey,
              usdcMint,
              false
            )
          );
          logger.debug('useTransfer', 'Added create recipient USDC ATA instruction');
        }

        // USDC transfer instruction
        const amountInUsdc = BigInt(tokenToUsdc(amount));
        instructions.push(
          createTransferInstruction(
            senderUsdcAta,
            recipientUsdcAta,
            smartWalletPubkey!,
            amountInUsdc
          )
        );

        logger.debug('useTransfer', 'USDC transfer instruction created', {
          amount: amount.toString(),
          instructionCount: instructions.length,
        });

        // Sign and send via Lazorkit (gasless, paid in USDC)
        logger.info('useTransfer', 'Sending USDC transaction to Lazorkit portal...');
        const signature = await signAndSendTransaction({
          instructions,
          transactionOptions: {
            feeToken: 'USDC', // Pay gas in USDC
            computeUnitLimit: 400_000, // higher to allow ATA creation if needed
          },
        });

        setTransactionSignature(signature);

        // Record transaction (negative amount for outgoing)
        const transaction: StoredTransaction = {
          signature,
          timestamp: new Date(),
          type: 'transfer',
          tokenType: 'USDC',
          amount: -tokenToUsdc(amount), // Negative for outgoing
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
        
        // Detailed logging for signing failures
        const err = error as any;
        const errorDetails = {
          message: err?.message || String(error),
          code: (err as any)?.code,
          name: (err as any)?.name,
          stack: (err as any)?.stack?.split('\n').slice(0, 3).join(' | '),
        };
        if ((err?.message || String(error)).toLowerCase().includes('sign')) {
          logger.error('useTransfer', 'USDC transfer signing failed', {
            ...errorDetails,
            type: 'SIGNING_FAILURE',
            tokenType: 'USDC',
          });
        } else {
          logger.error('useTransfer', 'USDC transfer failed', errorDetails);
        }
        
        return { success: false, error: errorMessage };
      } finally {
        setIsProcessing(false);
      }
    },
    [smartWalletPubkey, signAndSendTransaction, validateRecipient, validateWalletSession, addTransaction, isDemoMode]
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
