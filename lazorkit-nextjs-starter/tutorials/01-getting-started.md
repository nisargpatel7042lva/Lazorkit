# Tutorial 1: Getting Started with Lazorkit Starter Kit

Welcome! This tutorial covers the basics of the Lazorkit Next.js Starter Kit and how to get up and running.

## What You'll Learn

- Project structure and organization
- How to install and run the project
- Understanding the main components
- Basic flow: register → login → transfer

## Project Overview

This starter kit demonstrates a complete Web3 application with:

1. **Passkey-based Authentication** - Users create/login with WebAuthn
2. **Smart Wallet** - Solana smart account derived from passkey
3. **Gasless Transactions** - Paymaster sponsors transaction fees
4. **Transaction History** - Persistent record of user activities

### Key Technologies

- **Frontend**: Next.js 14+ with App Router
- **Language**: TypeScript strict mode
- **Styling**: Tailwind CSS
- **State**: React Context + Custom Hooks
- **Blockchain**: Solana Devnet
- **SDK**: Lazorkit Wallet SDK
- **Auth**: WebAuthn (Passkeys)

## Installation

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/lazorkit-nextjs-starter.git
cd lazorkit-nextjs-starter

# Install all dependencies
npm install
# or
yarn install
```

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env.local
```

The `.env.local` file contains defaults for Solana Devnet:

```env
# Solana RPC endpoint (defaults to devnet)
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Lazorkit Portal URL (for passkey authentication)
NEXT_PUBLIC_LAZORKIT_PORTAL_URL=https://portal.lazor.sh

# Lazorkit Paymaster URL (for gasless transactions)
NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL=https://kora.devnet.lazorkit.com

# USDC Mint address on Devnet (pre-configured)
NEXT_PUBLIC_USDC_MINT_ADDRESS=EPjFWaLb3odccccccccccccccccccccccccPEKjq
```

No changes needed - these defaults work perfectly for testing!

### Step 3: Start Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 16.1.1
- Local:         http://localhost:3000
- Network:       http://10.255.255.254:3000

✓ Ready in 1035ms
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

### Main Files and Folders

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Landing (login/register)
│   └── dashboard/
│       └── page.tsx       # Main dashboard
│
├── components/            # React components
│   ├── auth/              # Login/register forms
│   ├── wallet/            # Balance, address display
│   ├── transfer/          # Transfer form, history
│   └── ui/                # Base components
│
├── hooks/                 # Custom React hooks
│   ├── useLazorkit.ts     # SDK connection
│   ├── useWallet.ts       # Balance queries
│   └── useTransfer.ts     # Transfer execution
│
├── lib/
│   ├── lazorkit/          # SDK integration
│   ├── solana/            # RPC calls
│   └── utils/             # Helpers
│
└── contexts/              # React Context providers
```

### Key Files to Know

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing page with auth |
| `src/app/dashboard/page.tsx` | Main wallet interface |
| `src/hooks/useLazorkit.ts` | Manage wallet connection |
| `src/hooks/useWallet.ts` | Query balances |
| `src/hooks/useTransfer.ts` | Send transactions |
| `src/lib/lazorkit/config.ts` | SDK configuration |
| `src/lib/solana/connection.ts` | RPC connection |

## How the App Works

### User Flow

```
1. User visits localhost:3000
   ↓
2. Landing page shows login/register options
   ↓
3. User clicks "Register"
   ↓
4. PasskeyRegister component opens
   ↓
5. Lazorkit portal opens in popup
   ↓
6. User creates WebAuthn passkey
   ↓
7. Smart wallet generated on-chain
   ↓
8. Session stored in localStorage
   ↓
9. Redirects to /dashboard
   ↓
10. Dashboard shows wallet info and balances
```

### Component Hierarchy

```
Root Layout
├── LazorkitContextProvider (SDK state)
├── WalletContextProvider (Wallet state)
└── ToastProvider (Notifications)
    │
    ├── Landing Page
    │   ├── PasskeyLogin
    │   │   └── Connects existing wallet
    │   └── PasskeyRegister
    │       └── Creates new wallet
    │
    └── Dashboard Layout
        ├── NavBar (Display user info)
        └── Dashboard Page
            ├── WalletInfo (Address, creation date)
            ├── BalanceCard (SOL + USDC)
            ├── TransferForm (Send tokens)
            └── TransactionHistory (Past transactions)
```

## First Time Setup Walkthrough

### Step 1: Register a New Wallet

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Create one now" under "Don't have a wallet?"
3. Enter a username (e.g., "Alice")
4. Click "Continue"
5. A popup opens (Lazorkit portal)
6. Your browser prompts: "Use passkey?"
7. Create a passkey using:
   - **Biometric**: Fingerprint or face recognition
   - **PIN**: Or a PIN code if biometric unavailable
8. Click "Register"
9. You're redirected to the dashboard!

### Step 2: View Your Wallet

On the dashboard you'll see:

1. **Wallet Address** section:
   - Your smart wallet address
   - Copy button (click to copy)
   - QR code button
   - Link to view on Solscan

2. **Balance Card**:
   - SOL balance (in lamports internally)
   - USDC balance
   - Refresh button for manual update
   - Auto-refreshes every 5 seconds

3. **Transfer Form**:
   - Select token (SOL or USDC)
   - Enter recipient address
   - Enter amount
   - Preview button shows confirmation

4. **Transaction History**:
   - Shows last 10 transactions
   - Status indicators (✓ confirmed)
   - Timestamp and amounts
   - Link to each tx on Solscan

### Step 3: Get Testnet Funds (Optional)

To test transfers, request testnet SOL:

1. Visit [airdrop.solana.com](https://airdrop.solana.com)
2. Paste your wallet address
3. Click "Request Airdrop"
4. Receive 2 SOL (takes 30 seconds - 2 minutes)
5. Refresh dashboard to see balance update

### Step 4: Test a Transfer

With testnet funds, try sending:

1. Click "New Transfer" (or refresh to see form)
2. **Token**: Leave as "SOL"
3. **Recipient**: Paste another wallet address
   - Can be yours for testing
   - Or use another wallet for real transfer
4. **Amount**: "0.1" (100 million lamports)
5. Click "Preview"
6. Modal shows transaction details
7. Click "Confirm Transfer"
8. Your browser prompts to use passkey
9. Complete passkey authentication
10. Transaction submitted!
11. After 30 seconds, "Confirmed" appears in history

## Understanding the Code

### React Hooks Pattern

The app uses custom hooks to manage blockchain operations:

```typescript
// In your component
const { isConnected, walletInfo } = useLazorkit();
const { solBalance, usdcBalance } = useWallet();
const { transfer, isProcessing } = useTransfer();

// That's it! All SDK calls handled by hooks
```

### Error Handling

Three-tier error handling prevents issues:

```typescript
// 1. Input Validation (client-side)
if (amount > balance) {
  showError("Insufficient balance");
  return;
}

// 2. SDK Errors (mapped to user messages)
try {
  const signature = await transfer(...);
} catch (error) {
  const message = mapErrorToMessage(error);
  showError(message);
}

// 3. UI Presentation (user-friendly)
<Toast type="error" message="Transfer failed: insufficient balance" />
```

### State Management

Two Context providers handle state:

```typescript
// LazorkitContext - SDK state
const { isConnected, walletInfo } = useLazorkit();

// WalletContext - App state
const { balances, transactions } = useWallet();

// Both work together seamlessly
```

## Common Questions

### Q: Is my passkey secure?
**A:** Yes! Passkeys use industry-standard WebAuthn protocol. Your biometric/PIN is only processed locally on your device. Lazorkit never sees your credentials.

### Q: Where is my data stored?
**A:** Session data stored locally in browser localStorage. No accounts on centralized servers. All blockchain data stored on Solana Devnet.

### Q: Can I use this in production?
**A:** The starter kit is production-ready code! Customize it for your use case and deploy to Vercel.

### Q: What's the difference between Devnet and Mainnet?
**A:** Devnet = testnet with free SOL. Mainnet = real money. This starter uses Devnet for safe testing.

### Q: Can I add my own features?
**A:** Absolutely! The code is yours to customize. Check ARCHITECTURE.md for design patterns.

## Next Steps

1. ✅ Installation complete
2. ✅ Environment configured
3. ✅ Dev server running
4. 👉 Register a wallet
5. 👉 (Optional) Request testnet SOL
6. 👉 Test a transfer
7. 👉 Read Tutorial 2: Passkey Authentication

## Troubleshooting

### Port 3000 already in use
```bash
npm run dev -- -p 3001
# Now runs on localhost:3001
```

### `npm install` fails
```bash
# Clear npm cache and try again
npm cache clean --force
npm install
```

### Passkey creation fails
- Ensure browser supports WebAuthn (latest Chrome/Safari/Firefox)
- Try incognito/private mode
- Check biometric/PIN is set up on device

### Can't find `localhost:3000`
- Ensure dev server is running: `npm run dev`
- Try [http://127.0.0.1:3000](http://127.0.0.1:3000)
- Check no firewall blocking port 3000

## Key Takeaways

✅ Passkeys enable Web3 without seed phrases
✅ Gasless transactions remove gas barriers
✅ React hooks simplify SDK integration
✅ TypeScript ensures code safety
✅ Responsive design works on all devices

Ready to dive deeper? Check out **Tutorial 2: Passkey Authentication** to understand how WebAuthn works under the hood.

Happy coding! 🚀
