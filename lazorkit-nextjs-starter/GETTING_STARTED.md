# 🎯 Getting Started with Lazorkit

A beginner-friendly guide to understanding and using the Lazorkit Next.js Starter Kit.

## What Is This Project?

This is a complete example application showing how to build a Web3 wallet using:

- **Passkey Authentication** - Login with your fingerprint or face (no seed phrases!)
- **Gasless Transactions** - Send money without paying gas fees
- **Solana Blockchain** - Fast, low-cost blockchain
- **React/Next.js** - Modern web framework

Think of it as **Gmail for Web3** - easy-to-use with built-in security.

## Key Concepts

### What's a Passkey?

```
Traditional Wallet:        Passkey Wallet:
1. Create seed phrase  →   1. Use fingerprint
2. Write it down       →   2. It's stored in your device
3. Memorize it        →   3. Can't forget it!
4. Risk losing it     →   4. Can't lose it!
5. Vulnerable to      →   5. Phishing-proof
   phishing attacks
```

**Passkeys are:** Biometric authentication (fingerprint, face ID, PIN)
**Benefits:**
- ✅ No seed phrases to memorize or lose
- ✅ Phishing-proof (tied to specific domain)
- ✅ Works on phone and computer
- ✅ Encrypted locally on your device

### What's a Smart Wallet?

A **smart account** on Solana that:
- ✅ Derives from your passkey
- ✅ Can execute transactions
- ✅ Supports gasless transactions
- ✅ More flexible than regular accounts

### What Are Gasless Transactions?

```
Regular Transaction:          Gasless Transaction:
User has: 10 SOL              User has: 0 SOL
User pays: 0.0025 SOL gas     User pays: 0 gas
User receives: 9.9975 SOL     User receives: 10 SOL
Result: Unhappy :(            Result: Happy! :)
```

A **paymaster** sponsors the gas fee for you.

## Installation (2 minutes)

### Prerequisites

✅ You have these installed:
- Node.js 18+ ([download here](https://nodejs.org))
- npm or yarn package manager
- A modern browser (Chrome, Safari, Firefox, Edge)

✅ You have:
- A GitHub account (optional, for deployment)
- A device with biometric auth (fingerprint or face)

### Step 1: Clone the Repository

```bash
# Navigate to where you want to save the project
cd ~/projects

# Clone the repository
git clone https://github.com/nisargpatel7042lva/Lazorkit.git
cd Lazorkit/lazorkit-nextjs-starter
```

### Step 2: Install Dependencies

```bash
# Download all required libraries
npm install

# This takes 2-3 minutes
```

### Step 3: Setup Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# ✅ Default values work! No changes needed.
```

### Step 4: Start the Development Server

```bash
npm run dev

# Output:
# ▲ Next.js 16.1.1
# - Local: http://localhost:3000
```

### Step 5: Open in Browser

Navigate to **[http://localhost:3000](http://localhost:3000)**

## Your First Wallet (5 minutes)

### Step 1: Register a Wallet

1. Click **"Create Wallet"** button
2. You'll see: "Create a new wallet with passkey"
3. Click **"Register with Passkey"**
4. Your browser will ask for permission
5. Authenticate using:
   - Fingerprint
   - Face ID
   - PIN code
   - Windows Hello
   - Whatever your device supports

**What's happening:**
- Your device generates a cryptographic keypair
- Public key sent to app
- Private key stays on your device
- Wallet derived from passkey ✅

### Step 2: Confirm Registration

After authentication:
- ✅ Wallet address is displayed
- ✅ You're logged in automatically
- ✅ You can start exploring!

### Step 3: View Your Wallet

On the **Dashboard**, you'll see:

```
┌─────────────────────────────────────┐
│  Your Solana Wallet                 │
│  Address: 2pD3sk...1KXo             │
│  [Copy Address] [QR Code]           │
│                                      │
│  SOL Balance: 0.0000 SOL            │
│  USDC Balance: 0.0000 USDC          │
│                                      │
│  [Send SOL] [Send USDC]             │
└─────────────────────────────────────┘
```

## Getting Test Funds (3 minutes)

To test transfers, you need SOL. Use the **Devnet Airdrop**:

### Step 1: Copy Your Wallet Address

1. In the app, click **"Copy Address"**
2. Address is now in clipboard

### Step 2: Request Airdrop

1. Visit [airdrop.solana.com](https://airdrop.solana.com)
2. Paste your wallet address
3. Select "Devnet"
4. Click "Request 2 SOL"
5. Wait 30 seconds ⏳

### Step 3: Check Balance

Back in the app, you should see:
- SOL Balance: 2.0000 SOL ✅

**What just happened:**
- You requested test funds
- Solana network sent you 2 SOL (test tokens)
- Balance auto-refreshed in the app

## Your First Transfer (5 minutes)

### Understanding the Flow

```
1. You enter amount
   ↓
2. App validates input
   ↓
3. You confirm transaction
   ↓
4. Passkey signs it
   ↓
5. Paymaster sponsors gas
   ↓
6. Transaction submitted
   ↓
7. Confirmed! ✅
```

### Step 1: Prepare Transfer

You have: **2.0000 SOL**

Let's send **0.5 SOL** to another address.

### Step 2: Enter Transfer Details

1. Click **"Send SOL"** button
2. Enter a recipient address (another Solana address)
   - For testing: Ask a friend, or use a wallet generator
   - Example format: `2pD3sk...1KXo` (44 characters)
3. Enter amount: **0.5**
4. Click **"Review Transfer"**

### Step 3: Review Details

You'll see:
```
┌─────────────────────────────────────┐
│  Confirm Transfer                   │
│                                      │
│  You're sending:  0.5 SOL            │
│  To:              recipient...       │
│  Gas fee:         0.0000 SOL (free!) │
│                                      │
│  [Cancel] [Confirm]                 │
└─────────────────────────────────────┘
```

### Step 4: Confirm with Passkey

1. Click **"Confirm"**
2. Authenticate with fingerprint/face/PIN
3. Wait for confirmation ⏳

### Step 5: Success! 🎉

You'll see:
```
✅ Transfer Successful!
Transaction: 2pD3sk...1KXo
Status: Confirmed
```

Your balance updates:
- SOL Balance: **1.5000 SOL** ✅

## Transaction History

All your transfers appear in "Recent Transactions":

```
┌─────────────────────────────────────┐
│  Recent Transactions                │
│                                      │
│ ✅ 0.5000 SOL transfer              │
│    To: recipient...                 │
│    1 min ago                        │
│    [View on Solscan]                │
└─────────────────────────────────────┘
```

Click **"View on Solscan"** to see the transaction on the blockchain explorer.

## Key Features Explained

### 1. Auto-Reconnect

Close and reopen the app:
```
App opens
  ↓
Checks localStorage for passkey
  ↓
Auto-connects to wallet
  ↓
You're logged in! ✅
```

### 2. Balance Auto-Refresh

Every 5 seconds:
```
App checks blockchain
  ↓
Updates balances
  ↓
Displays latest amounts ✅
```

### 3. Gasless Transfers

When you send money:
```
You pay: 0 SOL ✅
Paymaster pays: ~0.000005 SOL
You receive full amount
```

## Troubleshooting

### "Passkey not supported"

Your browser doesn't support WebAuthn yet.

**Solutions:**
1. Try a different browser:
   - Chrome 90+ ✅
   - Safari 14+ ✅
   - Firefox 60+ ✅
2. Update your current browser
3. Try incognito/private mode

### "Failed to connect wallet"

The app can't connect to Solana network.

**Solutions:**
1. Check your internet connection
2. Check if RPC URL is correct in `.env.local`
3. Clear localStorage and try again:
   ```bash
   # In browser console:
   localStorage.clear()
   # Refresh page
   ```

### "Balance shows 0"

Your wallet might not have funds.

**Solutions:**
1. Request airdrop: [airdrop.solana.com](https://airdrop.solana.com)
2. Make sure you're on **Devnet** (not Mainnet)
3. Wait 30 seconds for airdrop to arrive

### "Transfer failed"

Transaction couldn't be submitted.

**Solutions:**
1. Check you have enough SOL (for gas)
2. Verify recipient address is valid (44 characters)
3. Amount should be > 0
4. Try again after 30 seconds

## Next Steps

Now that you understand the basics:

1. **Explore the code** - Read `src/` directory
2. **Customize UI** - Edit `src/components/`
3. **Read tutorials** - Check `tutorials/` folder
4. **Deploy live** - Follow `DEPLOYMENT.md`

## Common Questions

**Q: Is my passkey safe?**
A: Yes! Private key never leaves your device. Only public key is used.

**Q: Can I use this on mainnet with real money?**
A: Currently set to Devnet (test network). To use mainnet, change environment variables (NOT recommended unless you understand the risks).

**Q: Can I recover my wallet if I lose my device?**
A: Passkeys can be synced across devices (iCloud Keychain on Apple, Google Password Manager on Android). Check your OS settings.

**Q: How much can I send?**
A: Limited by your balance. No transaction limits in code.

**Q: Can I withdraw to a real exchange?**
A: Yes! You can send to any Solana address, including exchange deposit addresses.

## Learning Resources

**Inside this project:**
- `README.md` - Full feature documentation
- `ARCHITECTURE.md` - How it's built
- `tutorials/` - Deep dives on specific topics

**External resources:**
- [Solana Docs](https://docs.solana.com/) - Blockchain basics
- [WebAuthn Guide](https://webauthn.guide/) - Passkeys explained
- [Lazorkit Docs](https://docs.lazorkit.com/) - SDK reference

## Getting Help

**Issues?**

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Check browser console for errors: `Ctrl+Shift+J` (Chrome)
3. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Browser and device info

## Ready to Build?

You now understand:
- ✅ What passkeys are
- ✅ How gasless transactions work
- ✅ How smart wallets are created
- ✅ How to use the app

**Next steps:**
1. Play with the app more
2. Read the code in `src/`
3. Customize components
4. Deploy your own version!

Happy building! 🚀

---

**Questions?** Check the [README.md](./README.md) or [DOCS_INDEX.md](./DOCS_INDEX.md)
