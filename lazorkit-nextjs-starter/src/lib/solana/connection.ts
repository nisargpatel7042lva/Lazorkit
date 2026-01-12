/**
 * Solana RPC Connection Management
 * 
 * This module handles all communication with the Solana blockchain
 * including balance fetching, transaction lookups, and token account queries.
 */

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
} from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { SOLANA_RPC_URL, getUsdcMint } from '../lazorkit/constants';
import { logError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Singleton Solana RPC connection
 * Reuse the same connection across the app to avoid creating multiple connections
 */
let solanaConnection: Connection | null = null;

/**
 * Gets or creates a Solana RPC connection
 * @returns Solana Connection instance
 */
export const getSolanaConnection = (): Connection => {
  if (!solanaConnection) {
    solanaConnection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }
  return solanaConnection;
};

/**
 * Fetches the SOL balance for a wallet address
 * @param address - Wallet address as string or PublicKey
 * @returns Balance in lamports
 */
export const getSolBalance = async (
  address: string | PublicKey
): Promise<number> => {
  try {
    const connection = getSolanaConnection();
    const publicKey = typeof address === 'string' ? new PublicKey(address) : address;
    const balance = await connection.getBalance(publicKey);
    return balance;
  } catch (error) {
    logError('getSolBalance', error as Error);
    throw error;
  }
};

/**
 * Fetches the USDC balance for a wallet address
 * Uses the associated token account for the USDC mint
 * @param address - Wallet address as string or PublicKey
 * @returns Balance in smallest USDC units (6 decimals)
 */
export const getUsdcBalance = async (
  address: string | PublicKey
): Promise<number> => {
  try {
    const connection = getSolanaConnection();
    const publicKey = typeof address === 'string' ? new PublicKey(address) : address;

    // Get the associated token account for USDC
    let ataAddress: PublicKey;
    try {
      ataAddress = await getAssociatedTokenAddress(getUsdcMint(), publicKey);
    } catch (error) {
      // Handle TokenOwnerOffCurveError or invalid mint issues
      const errorMsg = (error as any)?.message || '';
      if (
        errorMsg.includes('TokenOwnerOffCurve') ||
        errorMsg.includes('Invalid public key') ||
        errorMsg.includes('USDC')
      ) {
        console.warn('USDC balance fetch failed (invalid token configuration):', errorMsg);
        return 0;
      }
      throw error;
    }

    try {
      const tokenAccount = await connection.getParsedAccountInfo(ataAddress);

      if (tokenAccount.value === null) {
        // Account doesn't exist yet (user has no USDC)
        return 0;
      }

      // Extract balance from parsed token data
      if (tokenAccount.value.data instanceof Buffer) {
        return 0;
      }

      const parsedData = tokenAccount.value.data as ParsedAccountData;
      const balance = parsedData.parsed?.info?.tokenAmount?.amount ?? 0;

      return typeof balance === 'string' ? parseInt(balance, 10) : balance;
    } catch (error) {
      // Token account doesn't exist (user has no USDC)
      if ((error as any)?.message?.includes('owner does not match')) {
        return 0;
      }
      throw error;
    }
  } catch (error) {
    logError('getUsdcBalance', error as Error);
    throw error;
  }
};

/**
 * Fetches both SOL and USDC balances in a single operation
 * More efficient than calling both functions separately
 * @param address - Wallet address
 * @returns Object with both balances
 */
export const getWalletBalances = async (address: string | PublicKey) => {
  try {
    // Fetch SOL balance first
    const solBalance = await getSolBalance(address);
    
    // Add a small delay between RPC calls to reduce rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Try to fetch USDC balance, but don't fail the whole operation if it fails
    let usdcBalance = 0;
    try {
      usdcBalance = await getUsdcBalance(address);
    } catch (error) {
      // If USDC fetch fails, just use 0 - don't crash the whole balance fetch
      logger.warn('getWalletBalances', 'USDC fetch failed, using 0 balance', error as Error);
      usdcBalance = 0;
    }

    return {
      solBalance,
      usdcBalance,
      fetchedAt: new Date(),
    };
  } catch (error) {
    logError('getWalletBalances', error as Error);
    throw error;
  }
};

/**
 * Parses transaction details to extract transfer information
 * @param transaction - Raw transaction from Solana
 * @param userAddress - Wallet address to check transfers for
 * @returns Parsed transaction details with amount and recipient
 */
export const parseTransactionDetails = (transaction: any, userAddress: string | PublicKey) => {
  const userAddr = typeof userAddress === 'string' ? userAddress : userAddress.toBase58();
  
  let totalAmount = 0;
  let recipientAddress = '';
  let transactionType = 'other';
  
  try {
    if (!transaction || !transaction.transaction) {
      return { amount: 0, recipientAddress: '', type: 'other' };
    }

    const instructions = transaction.transaction.message.instructions;
    
    // Parse instructions to find transfer amount
    for (const instruction of instructions) {
      // Check for system program transfers
      if (instruction.program === 'system') {
        if (instruction.parsed?.type === 'transfer') {
          const { source, destination, lamports } = instruction.parsed.info;
          
          // If this wallet is the source, it's sending
          if (source === userAddr) {
            totalAmount = lamports;
            recipientAddress = destination;
            transactionType = 'transfer';
            break;
          }
          // If this wallet is the destination, it's receiving
          else if (destination === userAddr) {
            totalAmount = lamports;
            recipientAddress = source;
            transactionType = 'transfer';
            break;
          }
        }
      }
      
      // Check for token transfers (SPL)
      if (instruction.program === 'spl-token') {
        if (instruction.parsed?.type === 'transfer' || instruction.parsed?.type === 'transferChecked') {
          const info = instruction.parsed.info;
          const amount = info.tokenAmount?.amount || info.amount || 0;
          recipientAddress = info.destination || '';
          totalAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount;
          transactionType = 'transfer';
          break;
        }
      }
    }
    
    return { amount: totalAmount, recipientAddress, type: transactionType };
  } catch (error) {
    logger.debug('parseTransactionDetails', 'Error parsing transaction', error as Error);
    return { amount: 0, recipientAddress: '', type: 'other' };
  }
};

/**
 * Fetches transaction details from Solana blockchain
 * Returns null if transaction not found or not finalized
 * @param signature - Transaction signature
 * @returns Transaction details or null
 */
export const getTransactionDetails = async (signature: string) => {
  try {
    const connection = getSolanaConnection();

    // Wait for transaction to be confirmed
    const latestBlockHash = await connection.getLatestBlockhash('confirmed');
    
    try {
      await connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: signature,
        },
        'confirmed'
      );
    } catch (confirmError) {
      // Handle block height exceeded or other confirmation errors
      // On devnet, transactions can expire quickly
      const errorMessage = confirmError instanceof Error ? confirmError.message : String(confirmError);
      
      if (errorMessage.includes('block height exceeded')) {
        logger.debug(
          'getTransactionDetails',
          'Transaction block height exceeded - checking alternative confirmation method'
        );
        
        // Try alternative confirmation check using getSignatureStatus
        const statuses = await connection.getSignatureStatuses([signature]);
        if (!statuses.value[0] || statuses.value[0].confirmations === 0) {
          throw new Error('Transaction failed: unconfirmed after block expiration');
        }
        // If confirmed in alternative check, continue to get details
      } else {
        throw confirmError;
      }
    }

    // Get transaction details
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    return transaction;
  } catch (error) {
    logError('getTransactionDetails', error as Error);
    return null;
  }
};

/**
 * Checks if a transaction has been confirmed on-chain
 * @param signature - Transaction signature
 * @returns True if confirmed
 */
export const isTransactionConfirmed = async (signature: string): Promise<boolean> => {
  try {
    const connection = getSolanaConnection();
    const status = await connection.getSignatureStatus(signature);

    return status.value?.confirmationStatus === 'confirmed' || 
           status.value?.confirmationStatus === 'finalized';
  } catch (error) {
    logError('isTransactionConfirmed', error as Error);
    return false;
  }
};

/**
 * Waits for a transaction to be confirmed with a timeout
 * @param signature - Transaction signature
 * @param timeoutMs - Timeout in milliseconds (default: 60000)
 * @returns True if confirmed, false if timeout
 */
export const waitForTransactionConfirmation = async (
  signature: string,
  timeoutMs = 60000
): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const confirmed = await isTransactionConfirmed(signature);
    if (confirmed) {
      return true;
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return false;
};

/**
 * Gets the associated token account address for USDC
 * Creates the account data if it doesn't exist (for display purposes)
 * @param address - Wallet address
 * @returns ATA address
 */
export const getUsdcATA = async (address: string | PublicKey): Promise<PublicKey> => {
  try {
    const publicKey = typeof address === 'string' ? new PublicKey(address) : address;
    const ata = await getAssociatedTokenAddress(getUsdcMint(), publicKey);
    return ata;
  } catch (error) {
    logError('getUsdcATA', error as Error);
    throw error;
  }
};

/**
 * Fetches recent transactions for an address
 * Useful for transaction history display
 * @param address - Wallet address
 * @param limit - Number of transactions to fetch (default: 10)
 * @returns Array of transaction signatures
 */
export const getRecentTransactions = async (
  address: string | PublicKey,
  limit = 10
): Promise<string[]> => {
  try {
    const connection = getSolanaConnection();
    const publicKey = typeof address === 'string' ? new PublicKey(address) : address;

    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: Math.min(limit, 100), // Max 100
    });

    return signatures.map((sig) => sig.signature);
  } catch (error) {
    logError('getRecentTransactions', error as Error);
    return [];
  }
};

/**
 * Tests the RPC connection
 * Useful for checking network connectivity
 * @returns True if connection works
 */
export const testRpcConnection = async (): Promise<boolean> => {
  try {
    const connection = getSolanaConnection();
    const latestBlockHash = await connection.getLatestBlockhash();
    return !!latestBlockHash;
  } catch (error) {
    logError('testRpcConnection', error as Error);
    return false;
  }
};
