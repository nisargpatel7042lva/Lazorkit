# Tutorial 3: Gasless Transactions

Understand how the paymaster sponsors transaction fees and makes Web3 accessible.

## What You'll Learn

- What gas fees are and why they matter
- How paymasters sponsor transactions
- SOL vs USDC transfers
- Transaction flow from form to blockchain
- Error handling and validation

## The Problem: Gas Fees

### Why Gas Fees Matter

```
Traditional Web3 Flow:

User: "I want to send 10 USDC"
Blockchain: "That'll be 0.0025 SOL ($0.25)"
User: "Wait, I have to pay just to send money?!"
```

### Real-World Impact

- 💸 Users need SOL for every transaction
- 😞 Barrier to entry for new users
- 🔗 Worse UX than traditional apps
- 🌍 Friction in Web3 adoption

## The Solution: Paymasters

### How Paymasters Work

```
User initiates transfer
    ↓
App creates transaction instruction
    ↓
Lazorkit SDK signs transaction
    ↓
Paymaster intercepts
    ↓
Paymaster adds its signature
    ↓
Paymaster sponsors the fees
    ↓
User's balance unchanged
```

### Real-World Flow

```
User: "Send 10 USDC to Bob"
App: "OK, creating transaction..."
Lazorkit: "Signing with passkey..."
Paymaster: "I'll pay the gas fee!"
Blockchain: "Transaction confirmed!"
User: "No gas fee? Amazing!"
```

## Types of Transfers

### SOL Transfers (Native Token)

**Pros:**
- No token contract overhead
- Minimal gas cost (~5,000 lamports ≈ 0.000005 SOL)
- Fastest execution

**Flow:**
```
User enters: recipient, amount
    ↓
Create SystemProgram.transfer instruction
    ↓
Transfer amount in lamports
    ↓
Paymaster adds signature and sponsors fee
    ↓
Transaction submitted
```

**Code Example:**
```typescript
// In useTransfer.ts
if (tokenType === 'SOL') {
  const instruction = SystemProgram.transfer({
    fromPubkey: smartWallet,
    toPubkey: new PublicKey(recipient),
    lamports: solToLamports(amount),
  });

  const signature = await signAndSendTransaction({
    instructions: [instruction],
    transactionOptions: {
      feeToken: 'SOL',
      computeUnitLimit: 200_000,
    },
  });
}
```

### USDC Transfers (Token)

**Pros:**
- Stable value (always $1)
- Familiar for traditional users
- Good for payments

**Flow:**
```
User enters: recipient, amount
    ↓
Find associated token accounts (ATAs)
    ↓
Create spl-token.transfer instruction
    ↓
Transfer amount with token decimals
    ↓
Paymaster adds signature and sponsors fee
    ↓
Transaction submitted
```

**Code Example:**
```typescript
// In useTransfer.ts
if (tokenType === 'USDC') {
  // Get or create associated token accounts
  const senderATA = await getAssociatedTokenAddress(
    getUsdcMint(),
    smartWalletPubkey
  );
  
  const recipientATA = await getAssociatedTokenAddress(
    getUsdcMint(),
    new PublicKey(recipient)
  );

  // Create transfer instruction
  const instruction = createTransferInstruction(
    senderATA,
    recipientATA,
    smartWalletPubkey,
    BigInt(tokenToUsdc(amount)) // Convert to USDC units
  );

  const signature = await signAndSendTransaction({
    instructions: [instruction],
    transactionOptions: {
      feeToken: 'USDC', // Can also use 'SOL'
      computeUnitLimit: 200_000,
    },
  });
}
```

## Complete Transaction Flow

### Step 1: User Input Validation

```typescript
// In TransferForm.tsx
const [validation, setValidation] = useState({ 
  isValid: false, 
  addressError: undefined,
  amountError: undefined 
});

// Validate on every change
useEffect(() => {
  const result = validateTransfer(
    recipientAddress,
    amount,
    balance
  );
  setValidation(result);
}, [recipientAddress, amount, balance]);
```

**Validation checks:**
- ✅ Address is valid Solana address format
- ✅ Amount is positive number
- ✅ Amount doesn't exceed balance
- ✅ Amount decimal places valid for token
- ✅ Not sending to own address

### Step 2: Preview Modal

```typescript
// User clicks "Preview"
const handleShowPreview = () => {
  if (!validation.isValid) {
    warning('Please fix errors before submitting');
    return;
  }

  setShowPreview(true);
  // Shows modal with:
  // - Token type
  // - Recipient (abbreviated)
  // - Amount with symbol
  // - Estimated fee (0 - paymaster covers)
  // - "Confirm Transfer" button
};
```

### Step 3: Transaction Creation

```typescript
// In useTransfer.ts transfer() function
const transfer = async (tokenType, recipient, amount) => {
  // 1. Validate inputs
  const addressValidation = validateAddress(recipient);
  if (addressValidation) {
    return { success: false, error: addressValidation };
  }

  // 2. Create instruction based on token type
  let instruction;
  if (tokenType === 'SOL') {
    instruction = SystemProgram.transfer({
      fromPubkey: smartWallet,
      toPubkey: new PublicKey(recipient),
      lamports: solToLamports(amount),
    });
  } else {
    // USDC flow (see above)
    instruction = createTransferInstruction(...);
  }

  // 3. Build transaction options
  const options = {
    instructions: [instruction],
    transactionOptions: {
      feeToken: tokenType, // Paymaster uses same token
      computeUnitLimit: 200_000,
    },
  };

  return options;
};
```

### Step 4: Signing & Submission

```typescript
// User confirms in modal
// Browser prompts: "Use passkey?"
// User authenticates with biometric

const signature = await signAndSendTransaction({
  instructions: [instruction],
  transactionOptions: { feeToken: 'SOL' },
});

// Lazorkit SDK:
// 1. Signs instruction with passkey
// 2. Builds transaction
// 3. Sends to Solana RPC
// 4. Returns signature
```

### Step 5: Confirmation & History

```typescript
// Transaction signed and submitted
setTransactionSignature(signature);

// Record in history
const transaction = {
  signature,
  type: tokenType,
  recipient: recipientAddress,
  amount,
  status: 'confirming',
  timestamp: Date.now(),
};

// Store in localStorage and context
recordTransaction(transaction);

// Show success toast
success(`Transfer confirmed! Signature: ${signature}`);

// Poll for confirmation
const confirmed = await waitForConfirmation(signature);
```

## Key Concepts

### Associated Token Accounts (ATAs)

```
For USDC transfers, we need to track:

User's Smart Wallet
    ├── Native SOL balance
    └── Derived Accounts
        ├── USDC ATA (associated token account)
        │   └── USDC balance
        ├── Other Token ATAs
        └── Program-derived accounts (PDAs)
```

**Why ATAs?**
- Each user has one ATA per token
- Lazorkit derives ATA from owner + mint
- Creates on first transfer if needed
- Standardized by SPL token program

### Instruction Structure

```
An instruction contains:
{
  program: TokenProgram,
  keys: [
    {pubkey: sender ATA, isSigner, isWritable},
    {pubkey: recipient ATA, isWritable},
    {pubkey: owner, isSigner},
    ...
  ],
  data: {amount, decimals, ...}
}
```

### Transaction vs Instruction

```
Transaction = Container for instructions
Instruction = Single operation

Example:
Transaction 1:
├── Instruction 1: Create USDC ATA (if needed)
└── Instruction 2: Transfer USDC

Transaction 2:
└── Instruction 1: Transfer SOL
```

## Gas Optimization

### Compute Units

```typescript
transactionOptions: {
  computeUnitLimit: 200_000, // Max compute allowed
}
```

Lazorkit estimates actual compute used:

| Operation | Approximate Units |
|-----------|-------------------|
| SOL transfer | 15,000 |
| USDC transfer | 65,000 |
| Create ATA | 110,000 |

### Best Practices

✅ Set reasonable compute unit limits
✅ Bundle related instructions
✅ Reuse existing accounts when possible
✅ Minimize account touches per transaction

## Error Handling

### Validation Errors (Caught Early)

```typescript
// These errors caught before blockchain submission
if (!isValidSolanaAddress(recipient)) {
  error("Invalid recipient address");
  return;
}

if (amount > balance) {
  error("Insufficient balance");
  return;
}

if (amount <= 0) {
  error("Amount must be positive");
  return;
}
```

### Transaction Errors (Caught During)

```typescript
try {
  const signature = await signAndSendTransaction({...});
} catch (error) {
  if (error.code === 'INSUFFICIENT_SOL') {
    // Shouldn't happen with paymaster, but show message
    error("Wallet needs SOL for account creation");
  } else if (error.code === 'USER_REJECTED') {
    // User cancelled passkey prompt
    error("Transaction cancelled");
  } else {
    // Map error to user-friendly message
    const message = mapErrorToMessage(error);
    error(message);
  }
}
```

### Recovery Strategies

```typescript
// Retry logic for transient failures
const submitWithRetry = async (transaction, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await signAndSendTransaction(transaction);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Wait before retrying
      await sleep(1000 * (i + 1));
    }
  }
};
```

## Testing Transfers

### Test Scenario 1: SOL Transfer

```
Setup:
- Register wallet
- Request testnet airdrop (2 SOL)
- Load dashboard

Test:
1. Select "SOL" in transfer form
2. Enter recipient address
3. Enter amount: "0.1"
4. Click "Preview"
5. Verify details correct
6. Click "Confirm Transfer"
7. Authenticate with passkey
8. Check signature appears
9. Verify balance decreased
10. Check Solscan link shows tx
```

### Test Scenario 2: USDC Transfer

```
Setup:
- Have USDC on Devnet
- Register wallet

Test:
1. Select "USDC" in transfer form
2. Enter recipient address
3. Enter amount: "10"
4. Click "Preview"
5. Verify details correct
6. Click "Confirm Transfer"
7. Complete passkey auth
8. Verify USDC balance decreased
```

### Test Scenario 3: Error Cases

```
Test Invalid Address:
- Enter: "invalid_address"
- Expected: Red error "Invalid Solana address format"

Test Insufficient Balance:
- Enter amount > balance
- Expected: Red error "Insufficient balance"

Test User Rejection:
- Click "Confirm Transfer"
- When prompted, click "Cancel" on passkey
- Expected: Error "Transaction cancelled"
```

## Advanced Topics

### Custom Instruction Building

```typescript
// Advanced: Build custom instruction
const instruction = new TransactionInstruction({
  keys: [
    // Instruction keys...
  ],
  programId: TOKEN_PROGRAM_ID,
  data: Buffer.concat([
    // Instruction data...
  ]),
});
```

### Multiple Instructions

```typescript
// Bundle multiple operations
const signature = await signAndSendTransaction({
  instructions: [
    createATAInstruction, // Create account if needed
    transferInstruction,   // Then transfer
  ],
  transactionOptions: {
    computeUnitLimit: 300_000, // Increased for both
  },
});
```

### Custom Paymaster Logic

```typescript
// Advance: Custom paymaster handling
const signature = await signAndSendTransaction({
  instructions: [instruction],
  transactionOptions: {
    feeToken: 'USDC', // Can use USDC instead of SOL
    computeUnitLimit: 200_000,
    priorityFeeLevel: 'high', // High priority
  },
});
```

## Key Takeaways

✅ Paymasters eliminate gas barriers
✅ Users can transfer without SOL
✅ Both SOL and USDC transfers work
✅ ATAs handle token accounting
✅ Validation prevents bad transactions
✅ Errors handled gracefully

## What's Next?

- **Tutorial 4**: Session persistence strategies
- **ARCHITECTURE.md**: Complete system design
- **TROUBLESHOOTING.md**: Common issues

Ready to learn about session management? Check **Tutorial 4: Session Management**!

References:
- [Solana Transactions](https://docs.solana.com/developing/programming-model/transactions)
- [SPL Token Program](https://spl.solana.com/token)
- [Associated Token Accounts](https://spl.solana.com/associated-token-account)
- [Lazorkit Paymaster](https://docs.lazorkit.com/)
