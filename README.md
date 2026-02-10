# ⚡ Lazorkit Next.js Starter Kit

**Passkey-based Solana wallet with gasless transactions**

A production-ready Next.js 14+ starter template demonstrating the complete Lazorkit SDK integration for building modern Web3 applications with passkey authentication and gasless transactions on Solana Devnet.

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Testing & Deployment](#testing--deployment)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

## 🎯 Features

### Authentication
- ✅ **Passkey Registration** - Create WebAuthn passkeys without seed phrases
- ✅ **Passkey Login** - Authenticate with biometric or PIN
- ✅ **Auto-Reconnect** - Resume sessions from localStorage
- ✅ **Browser Support Detection** - Graceful fallbacks for unsupported browsers

### Transactions
- ✅ **Gasless Transfers** - SOL and USDC sponsored by paymaster
- ✅ **Transaction Validation** - Client-side validation before submission
- ✅ **Transaction History** - Persistent record of last 10 transactions
- ✅ **Solscan Integration** - Direct links to view transactions on Solscan

### Wallet
- ✅ **Real-time Balances** - SOL and USDC balance display with 5s auto-refresh
- ✅ **Address Display** - Copy-to-clipboard and QR code support
- ✅ **Smart Wallet** - Solana smart account derived from passkey
- ✅ **Account Management** - Display wallet creation date and features

### Developer Experience
- ✅ **TypeScript** - Full type safety with strict mode enabled
- ✅ **React Hooks** - Custom hooks for SDK integration
- ✅ **Error Handling** - Three-tier error handling strategy
- ✅ **Logging** - Structured logging with development/production modes
- ✅ **Responsive Design** - Mobile-first Tailwind CSS styling
- ✅ **Accessible Components** - Radix UI primitives for accessibility

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (check with `node --version`)
- **npm** or **yarn** package manager
- **Modern browser** with WebAuthn support (Chrome, Safari, Firefox, Edge)
- **Biometric authentication** (fingerprint, face) or PIN setup on your device

### Installation (2 minutes)

```bash
# Clone the repository
git clone https://github.com/your-username/lazorkit-nextjs-starter.git
cd lazorkit-nextjs-starter

# Install dependencies
npm install

# Setup environment variables (defaults work for Devnet)
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### What You Can Do

1. **Register** - Create a new wallet with passkey authentication
2. **Login** - Authenticate with your existing passkey
3. **View Balance** - See your SOL and USDC balances
4. **Transfer** - Send SOL or USDC gaslessly to another address
5. **Check History** - View your last 10 transactions

## 📁 Project Structure

```
src/
├── app/                           # Next.js App Router pages
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page (login/register)
│   └── dashboard/
│       ├── layout.tsx            # Dashboard layout with nav
│       └── page.tsx              # Main dashboard
│
├── components/                    # React components
│   ├── ui/                       # Base UI components
│   ├── auth/                     # Authentication components
│   ├── wallet/                   # Wallet components
│   └── transfer/                 # Transfer components
│
├── contexts/                      # React Context
│   ├── LazorkitContext.tsx       # SDK provider wrapper
│   └── WalletContext.tsx         # Wallet state management
│
├── hooks/                         # Custom React hooks
│   ├── useLazorkit.ts            # SDK operations
│   ├── useWallet.ts              # Wallet queries
│   ├── useTransfer.ts            # Transfer orchestration
│   ├── usePasskey.ts             # Passkey support detection
│   └── useLocalStorage.ts        # Browser storage with SSR safety
│
├── lib/                           # Utilities and configuration
│   ├── lazorkit/                 # SDK integration layer
│   │   ├── config.ts             # Lazorkit provider config
│   │   ├── constants.ts          # Network and token config
│   │   └── types.ts              # TypeScript interfaces
│   ├── solana/                   # Solana blockchain utilities
│   │   └── connection.ts         # RPC connection
│   └── utils/                    # Helper utilities
│       ├── errors.ts             # Error handling
│       ├── formatting.ts         # Display formatting
│       ├── validation.ts         # Input validation
│       ├── logger.ts             # Structured logging
│       └── cn.ts                 # Tailwind utilities
│
└── public/                        # Static assets

.env.example                       # Environment variables template
ARCHITECTURE.md                    # Design decisions
TROUBLESHOOTING.md                 # Common issues
```

## 🏗️ Architecture

### Layered Architecture

```
User Interface (Components)
         ↓
React Hooks & Context
         ↓
SDK Integration Layer
         ↓
Utility Functions (Validation, Formatting, Errors)
         ↓
External APIs (Lazorkit SDK, Solana Web3.js)
```

### Component Tree

```
Root Layout (Providers)
├── LazorkitContextProvider
├── WalletContextProvider
└── ToastProvider
    ├── Landing Page
    │   ├── PasskeyLogin
    │   └── PasskeyRegister
    └── Dashboard Layout
        ├── NavBar
        └── Dashboard Page
            ├── WalletInfo
            ├── BalanceCard
            ├── TransferForm
            └── TransactionHistory
```

## 🔧 How It Works

### 1. Passkey Registration

Passkeys use **WebAuthn**, a web standard for secure authentication:

- ✅ No seed phrases to lose or manage
- ✅ Biometric security (fingerprint, face)
- ✅ Resistant to phishing attacks
- ✅ Same UX as traditional apps

### 2. Gasless Transactions

The **paymaster** sponsors transaction fees:

```
User initiates transfer
    ↓
Instruction created (SOL or USDC)
    ↓
Lazorkit signs with passkey
    ↓
Paymaster sponsors fees
    ↓
Transaction submitted to blockchain
```

### 3. Session Persistence

Wallet session stored in localStorage automatically:

- User closes tab and reopens → still logged in
- Refresh page → wallet state persists
- Can logout explicitly if desired

### 4. State Management

Dual-layer React Context:

```typescript
// LazorkitContext - SDK connection state
const { isConnected, walletInfo } = useLazorkit();

// WalletContext - App-level wallet state
const { solBalance, usdcBalance, transactions } = useWallet();

// Custom hooks combine both
const { transfer, isProcessing } = useTransfer();
```

## 📚 API Reference

### Main Hooks

**`useLazorkit()`** - SDK connection and wallet info
```typescript
const { isConnected, walletInfo, error, connect, disconnect, reconnect } = useLazorkit();
```

**`useWallet()`** - Query wallet balances
```typescript
const { address, solBalance, usdcBalance, refreshBalances } = useWallet();
```

**`useTransfer()`** - Execute gasless transfers
```typescript
const { transfer, isProcessing, error } = useTransfer();
const signature = await transfer('SOL', recipient, amount);
```

**`usePasskey()`** - Detect browser support
```typescript
const { isSupported, isCapable, message } = usePasskey();
```

### Utility Functions

```typescript
// Validation
validateTransfer(address, amount, balance)
validateAddress(address)
validateAmount(amount, balance)

// Formatting
lamportsToSol(lamports)
solToLamports(sol)
formatCurrency(amount)
abbreviateAddress(address)
formatDate(date)

// Errors
mapErrorToMessage(error)
```

## 📋 Testing & Deployment

### Testing Checklist

```
Authentication
[ ] Register new wallet
[ ] Passkey creation succeeds
[ ] Can logout and login again

Balances
[ ] SOL balance displays correctly
[ ] USDC balance displays correctly
[ ] Balance refreshes on interval

Transfers
[ ] SOL transfer succeeds
[ ] USDC transfer succeeds
[ ] Invalid addresses rejected
[ ] Insufficient balance prevented

UI/UX
[ ] Mobile responsive
[ ] Buttons work on mobile
[ ] Modals dismiss correctly
[ ] Toasts show and dismiss
```

### Getting Testnet Funds

1. Visit [airdrop.solana.com](https://airdrop.solana.com)
2. Paste your wallet address
3. Receive 2 SOL for testing

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Create Vercel Project**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repository
   - Click "Deploy"

3. **Add Environment Variables** in Vercel dashboard:
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_LAZORKIT_PORTAL_URL=https://portal.lazor.sh
NEXT_PUBLIC_LAZORKIT_PAYMASTER_URL=https://kora.devnet.lazorkit.com
```

4. **Redeploy** - Vercel auto-deploys on git push

Your app is now live!

## 🐛 Troubleshooting

### "WebAuthn not supported"
- Update to Chrome 90+, Safari 14+, Firefox 60+
- Try a different browser
- Check browser compatibility

### "Failed to connect wallet"
- Verify LAZORKIT_PORTAL_URL in .env.local
- Try incognito/private mode
- Clear localStorage and try again

### Balances showing 0
- Verify wallet address
- Check RPC URL is correct (https://api.devnet.solana.com)
- Confirm funds are on Devnet, not Mainnet

### Transfer fails with "Insufficient balance"
- Ensure you have SOL for gas
- Request airdrop from https://airdrop.solana.com
- For USDC, confirm balance > amount

See **TROUBLESHOOTING.md** for more solutions.

## 📚 Learning Resources

### Official Documentation

- [Lazorkit Docs](https://docs.lazorkit.com/) - SDK reference
- [Solana Docs](https://docs.solana.com/) - Blockchain fundamentals
- [WebAuthn Guide](https://webauthn.guide/) - Passkey standard
- [Next.js Docs](https://nextjs.org/docs) - React framework

### Tutorials Included

- `tutorials/01-getting-started.md` - Project overview
- `tutorials/02-passkey-authentication.md` - WebAuthn deep dive
- `tutorials/03-gasless-transactions.md` - Paymaster mechanics
- `tutorials/04-session-management.md` - Session persistence

## 🎓 Learning Path

**Beginner** (1-2 hours)
1. Read README and skim ARCHITECTURE.md
2. Run `npm install && npm run dev`
3. Register a wallet and explore

**Intermediate** (2-4 hours)
1. Study PasskeyLogin component
2. Test transfer feature with testnet funds
3. Read gasless transactions tutorial

**Advanced** (4+ hours)
1. Review ARCHITECTURE.md
2. Study useTransfer hook
3. Customize components for your use case

## 🤝 Contributing

Found a bug or want to improve this starter?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Open a Pull Request

## 📄 License

MIT License - Use freely in your projects!

## 📞 Support

- **Issues** - Open a GitHub issue for bugs
- **Discussions** - Start a discussion for questions
- **Lazorkit Support** - [docs.lazorkit.com](https://docs.lazorkit.com/)
- **Solana Discord** - [discord.gg/solana](https://discord.gg/solana)

## 🎉 Next Steps

1. ✅ Install and run locally
2. ✅ Register a wallet
3. ✅ Request testnet SOL
4. ✅ Test transfers
5. ✅ Deploy to Vercel
6. ✅ Share with friends!

Happy building! 🚀
