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
import { getAssociatedTokenAddress, getAssociatedTokenAddressSync } from '@solana/spl-token';
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

    // Get the associated token account for USDC.
    // NOTE: Lazorkit smart wallets can be off-curve, so we must allow owner off curve
    // to avoid TokenOwnerOffCurveError when deriving the ATA.
    let ataAddress: PublicKey;
    try {
      ataAddress = await getAssociatedTokenAddress(
        getUsdcMint(),
        publicKey,
        true // allowOwnerOffCurve
      );
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
/**
 * Parses transaction details to extract transfer information
 * @param transaction - Raw transaction from Solana
 * @param userAddress - Wallet address to check transfers for
 * @returns Parsed transaction details with amount and recipient
 */
export const parseTransactionDetails = (transaction: any, userAddress: string | PublicKey): {
  amount: number;
  recipientAddress: string;
  type: 'transfer' | 'approval' | 'swap' | 'other';
  tokenType: import('../lazorkit/types').TokenType;
} => {
  const userAddr = typeof userAddress === 'string' ? userAddress : userAddress.toBase58();
  const userAddrLower = userAddr.toLowerCase();

  let totalAmount = 0;
  let recipientAddress = '';
  let transactionType: 'transfer' | 'approval' | 'swap' | 'other' = 'other';
  let tokenType: import('../lazorkit/types').TokenType = 'SOL';

  try {
    if (!transaction || !transaction.transaction) {
      return { amount: 0, recipientAddress: '', type: 'other', tokenType: 'SOL' };
    }

    // Get instructions - top-level + meta.instructions + innerInstructions (CPIs)
    let instructions: any[] = [];
    if (transaction.transaction.message?.instructions) {
      instructions = [...transaction.transaction.message.instructions];
    }
    if (transaction.meta?.instructions) {
      instructions = [...instructions, ...transaction.meta.instructions];
    }
    const inner = transaction.meta?.innerInstructions;
    if (Array.isArray(inner)) {
      for (const innerBlock of inner) {
        if (Array.isArray(innerBlock.instructions)) {
          instructions = [...instructions, ...innerBlock.instructions];
        }
      }
    }

    const userPubkey = typeof userAddress === 'string' ? new PublicKey(userAddress) : userAddress;
    const usdcMintB58 = getUsdcMint().toBase58().toLowerCase();
    const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

    const isSplTokenInstruction = (ix: any): boolean => {
      const prog = ix.program;
      const progId = ix.programId?.toString?.() ?? ix.programId;
      if (prog === 'spl-token' || progId === TOKEN_PROGRAM_ID) return true;
      if (typeof prog === 'string' && prog.toLowerCase().includes('token')) return true;
      return false;
    };

    // Process SPL token transfers FIRST so USDC is preferred when a tx has both SOL and token moves
    for (const instruction of instructions) {
      if (!isSplTokenInstruction(instruction)) continue;
      const parsed = instruction.parsed;
      if (parsed?.type !== 'transfer' && parsed?.type !== 'transferChecked') continue;

      const info = parsed.info || {};
      const amount = info.tokenAmount?.amount ?? info.amount ?? 0;
      const authority = (info.authority ?? info.owner ?? info.source ?? '').toString().trim().toLowerCase();
      const source = (info.source ?? '').toString().trim().toLowerCase();
      const destination = (info.destination ?? '').toString().trim().toLowerCase();
      const mint = (info.mint ?? '').toString().trim().toLowerCase();

      const isSender = authority === userAddrLower;
      let isReceiver = false;
      if (mint && destination) {
        try {
          const mintPk = new PublicKey(mint);
          const userAta = getAssociatedTokenAddressSync(mintPk, userPubkey, true);
          isReceiver = destination === userAta.toBase58().toLowerCase();
        } catch {
          // ignore
        }
      }
      // Fallback: if source is user's USDC ATA, user is sender
      if (!isSender && !isReceiver && source && mint === usdcMintB58) {
        try {
          const mintPk = new PublicKey(mint);
          const userAta = getAssociatedTokenAddressSync(mintPk, userPubkey, true);
          if (source === userAta.toBase58().toLowerCase()) {
            const parsedAmount = typeof amount === 'string' ? parseInt(amount, 10) : Number(amount);
            totalAmount = -parsedAmount;
            recipientAddress = destination;
            transactionType = 'transfer';
            tokenType = 'USDC';
            break;
          }
        } catch {
          // ignore
        }
      }

      if (isSender) {
        const parsedAmount = typeof amount === 'string' ? parseInt(amount, 10) : Number(amount);
        totalAmount = -parsedAmount;
        recipientAddress = destination;
        transactionType = 'transfer';
        tokenType = mint === usdcMintB58 ? 'USDC' : 'TOKEN';
        break;
      }
      if (isReceiver) {
        const parsedAmount = typeof amount === 'string' ? parseInt(amount, 10) : Number(amount);
        totalAmount = parsedAmount;
        recipientAddress = authority || '';
        transactionType = 'transfer';
        tokenType = mint === usdcMintB58 ? 'USDC' : 'TOKEN';
        break;
      }
    }

    // If no SPL match, check system program transfers (SOL)
    if (totalAmount === 0 && transactionType === 'other') {
      for (const instruction of instructions) {
        if (instruction.program === 'system' || instruction.programId?.toString() === '11111111111111111111111111111111') {
          if (instruction.parsed?.type === 'transfer') {
            const { source, destination, lamports } = instruction.parsed.info;
            const sourceLower = (source || '').toLowerCase();
            const destLower = (destination || '').toLowerCase();

            if (sourceLower === userAddrLower) {
              totalAmount = -lamports;
              recipientAddress = destination;
              transactionType = 'transfer';
              tokenType = 'SOL';
              break;
            }
            if (destLower === userAddrLower) {
              totalAmount = lamports;
              recipientAddress = source;
              transactionType = 'transfer';
              tokenType = 'SOL';
              break;
            }
          }
        }
      }
    }

    // Fallback: use token balance changes so USDC shows correctly when instruction parsing misses it
    if (totalAmount === 0 && transactionType === 'other' && transaction.meta) {
      const preToken = (transaction.meta as any).preTokenBalances as Array<{ mint?: string; owner?: string; uiTokenAmount?: { amount: string }; tokenAmount?: { amount: string } }> | undefined;
      const postToken = (transaction.meta as any).postTokenBalances as Array<{ mint?: string; owner?: string; uiTokenAmount?: { amount: string }; tokenAmount?: { amount: string } }> | undefined;
      if (Array.isArray(postToken)) {
        for (const post of postToken) {
          const postMint = (post.mint ?? '').toLowerCase();
          const postOwner = (post.owner ?? '').toLowerCase();
          if (postOwner !== userAddrLower || postMint !== usdcMintB58) continue;
          const pre = Array.isArray(preToken) ? preToken.find((p: any) => (p.mint ?? '').toLowerCase() === usdcMintB58 && (p.owner ?? '').toLowerCase() === userAddrLower) : undefined;
          const preAmount = pre ? (pre.tokenAmount?.amount ?? pre.uiTokenAmount?.amount ?? '0') : '0';
          const postAmount = post.tokenAmount?.amount ?? post.uiTokenAmount?.amount ?? '0';
          const preVal = parseInt(String(preAmount), 10) || 0;
          const postVal = parseInt(String(postAmount), 10) || 0;
          const diff = postVal - preVal;
          if (diff !== 0) {
            totalAmount = diff;
            transactionType = 'transfer';
            tokenType = 'USDC';
            recipientAddress = '';
            break;
          }
        }
      }
    }

    // If no amount found in instructions, check pre/post SOL balances as fallback
    if (totalAmount === 0 && transaction.meta) {
      logger.debug('parseTransactionDetails', 'No amount found in instructions, checking balance changes');
      const preBalances = transaction.meta.preBalances || [];
      const postBalances = transaction.meta.postBalances || [];
      const msg = transaction.transaction?.message;
      // Support both legacy (message.accountKeys) and versioned (staticAccountKeys + loadedAddresses)
      let accountKeys: string[] = [];
      if (msg?.accountKeys && Array.isArray(msg.accountKeys)) {
        accountKeys = msg.accountKeys.map((key: any) =>
          typeof key === 'string' ? key : (key.pubkey?.toString?.() ?? '')
        );
      } else if (msg?.staticAccountKeys && Array.isArray(msg.staticAccountKeys)) {
        const staticKeys = msg.staticAccountKeys.map((k: any) =>
          typeof k === 'string' ? k : (k?.toString?.() ?? '')
        );
        const loaded = transaction.meta?.loadedAddresses;
        const writable = (loaded?.writable || []).map((a: any) =>
          typeof a === 'string' ? a : (a?.toString?.() ?? '')
        );
        const readonly = (loaded?.readonly || []).map((a: any) =>
          typeof a === 'string' ? a : (a?.toString?.() ?? '')
        );
        accountKeys = [...staticKeys, ...writable, ...readonly];
      }

      const userIndex = accountKeys.findIndex((addr) => addr?.toLowerCase() === userAddrLower);

      if (userIndex >= 0 && preBalances[userIndex] !== undefined && postBalances[userIndex] !== undefined) {
        const balanceChange = postBalances[userIndex] - preBalances[userIndex];
        if (balanceChange !== 0) {
          totalAmount = balanceChange; // Keep sign for direction
          transactionType = 'transfer';
          tokenType = 'SOL';
          recipientAddress = '';
        }
      }
    }

    return { amount: totalAmount, recipientAddress, type: transactionType, tokenType };
  } catch (error) {
    logger.error('parseTransactionDetails', 'Error parsing transaction', error as Error);
    return { amount: 0, recipientAddress: '', type: 'other', tokenType: 'SOL' };
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

    logger.debug('getTransactionDetails', 'Fetching transaction', {
      signature: signature.substring(0, 10),
    });

    // Fetch transaction first; don't require confirmation status so we can show
    // amounts for recently landed txs while RPC catch-up (avoids showing 0.0000 SOL).
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      logger.debug('getTransactionDetails', 'Transaction not found or not in block yet', {
        signature: signature.substring(0, 10),
      });
      return null;
    }

    // Also try to get parsed transaction for better instruction parsing
    try {
      const parsedTransaction = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (parsedTransaction) {
        // Merge parsed instructions into transaction object for easier parsing
        if (parsedTransaction.transaction?.message?.instructions) {
          transaction.transaction = transaction.transaction || {} as any;
          transaction.transaction.message = transaction.transaction.message || {} as any;
          // Cast to any to avoid strict type checks on VersionedMessage specific structure
          (transaction.transaction.message as any).instructions = parsedTransaction.transaction.message.instructions;
        }
      }
    } catch (parseError) {
      // If parsed transaction fails, continue with regular transaction
      logger.debug('getTransactionDetails', 'Could not fetch parsed transaction, using regular', {
        signature: signature.substring(0, 10),
      });
    }

    logger.debug('getTransactionDetails', 'Fetched transaction successfully', { signature: signature.substring(0, 10) });
    return transaction;
  } catch (error) {
    logger.error('getTransactionDetails', `Failed to fetch transaction ${signature.substring(0, 10)}`, error as Error);
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
    const ata = await getAssociatedTokenAddress(
      getUsdcMint(),
      publicKey,
      true // allowOwnerOffCurve for smart wallet owners
    );
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

    logger.debug('getRecentTransactions', 'Fetching signatures for address', {
      address: publicKey.toBase58().substring(0, 10),
      limit,
    });

    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: Math.min(limit, 100), // Max 100
    });

    logger.debug('getRecentTransactions', 'Fetched signatures', {
      count: signatures.length,
      address: publicKey.toBase58().substring(0, 10),
    });

    return signatures.map((sig) => sig.signature);
  } catch (error) {
    logger.error('getRecentTransactions', 'Failed to fetch transaction signatures', error as Error);
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
