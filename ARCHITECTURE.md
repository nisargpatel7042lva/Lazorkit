# Architecture & Design Decisions

## Overview

This starter kit demonstrates best practices for integrating the Lazorkit SDK with Next.js. The architecture emphasizes:

1. **Clarity** - Every component has a single responsibility
2. **Modularity** - Easy to extend and customize
3. **Type Safety** - Full TypeScript without `any` types
4. **Error Handling** - Graceful failures with user-friendly messages
5. **Developer Experience** - Well-documented and easy to understand

## Layer Architecture

```
┌─────────────────────────────────────┐
│   UI Layer (Components)              │
│  Button, Card, Modal, Toast, etc     │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   Page Layer                        │
│  Dashboard, Auth Pages              │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   State Management (Context + Hooks) │
│  useLazorkit, useWallet, useTransfer │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   SDK Integration Layer             │
│  LazorkitContext, WalletContext     │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   Utility & Helper Layers           │
│  Validation, Formatting, Solana RPC │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   External (Lazorkit SDK, Solana)  │
│  @lazorkit/wallet, @solana/web3.js │
└─────────────────────────────────────┘
```

## Key Components

### 1. Lazorkit Context (`contexts/LazorkitContext.tsx`)

**Responsibility:** Wrap Lazorkit SDK provider and expose SDK functionality

**Key Methods:**
- `connect()` - Opens portal for passkey creation/authentication
- `disconnect()` - Clears session and logs user out
- Auto-reconnection from localStorage on app load

**Why This Design:**
- Centralizes SDK state management
- Simplifies component-level SDK access via `useLazorkitContext()`
- Handles error mapping and logging

### 2. Wallet Context (`contexts/WalletContext.tsx`)

**Responsibility:** Manage application-level wallet state

**Key Features:**
- Balance updates (SOL + USDC) from on-chain
- Transaction history tracking
- Automatic refresh on intervals
- TypeScript-safe balance queries

**Why This Design:**
- Separates wallet operations from SDK auth
- Enables real-time balance updates
- Scales for future features (tokens, NFTs)

### 3. Custom Hooks

#### `useLazorkit()`
High-level SDK operations with error handling and status tracking.

```typescript
const { connect, disconnect, isConnected, error } = useLazorkit();
```

#### `useWallet()`
Query wallet information and balances.

```typescript
const { address, displaySolBalance, displayUsdcBalance } = useWallet();
```

#### `useTransfer()`
Execute gasless transfers (SOL or USDC).

```typescript
const { transfer, isProcessing } = useTransfer();
const result = await transfer('USDC', recipientAddress, amount);
```

#### `usePasskey()`
Browser support detection and passkey operations.

```typescript
const { isSupported, isPlatformAuthenticatorAvailable } = usePasskey();
```

## Data Flow

### Registration Flow

```
User clicks "Register"
          ↓
PasskeyRegister component
          ↓
useLazorkit().connect()
          ↓
Lazorkit SDK → Portal (WebAuthn)
          ↓
User biometric/PIN
          ↓
Passkey created, Smart wallet derived
          ↓
Session stored in localStorage
          ↓
Redirect to Dashboard
```

### Transfer Flow

```
User enters recipient & amount
          ↓
Form validation (Input layer)
          ↓
User clicks "Send"
          ↓
TransferForm component
          ↓
Show preview modal
          ↓
User confirms
          ↓
useTransfer().transfer()
          ↓
Construct transaction instructions
          ↓
useSdkWallet().signAndSendTransaction()
          ↓
SDK signs with passkey
          ↓
Paymaster bundles & submits
          ↓
Transaction signature returned
          ↓
Store in transaction history
          ↓
Show success toast & refresh balances
```

### Balance Update Flow

```
User connects wallet
          ↓
useWallet() initializes
          ↓
Fetches balance from RPC
          ↓
Updates WalletContext state
          ↓
Component re-renders with new balance
          ↓
Set interval for periodic refresh (5s)
          ↓
User clicks refresh button (manual override)
          ↓
Immediate balance fetch & update
```

## Error Handling Strategy

Three-tier error handling:

### 1. Validation Layer (`lib/utils/validation.ts`)
- Input validation (address format, amount limits)
- Returns user-friendly messages
- Prevents invalid transactions

### 2. SDK Layer (`lib/utils/errors.ts`)
- Maps SDK errors to user messages
- Custom error classes for different types
- Structured error logging

### 3. Component Layer
- Error boundaries catch React errors
- Toast notifications show errors to users
- Retry mechanisms for network failures

## TypeScript Patterns

### Custom Type Definitions

```typescript
// File: lib/lazorkit/types.ts
export interface WalletInfo {
  smartWallet: string;
  passkeyPubkey: number[];
  // ... etc
}
```

### No `any` Types Policy

Every function has proper types. Example:

```typescript
// ❌ Avoid
async function transfer(to, amount) { }

// ✅ Correct
async function transfer(
  to: PublicKey,
  amount: number
): Promise<TransferResult> { }
```

## State Management Philosophy

**Why Context + Hooks instead of Redux/Zustand?**

1. **Starter Kit Scale** - Sufficient for this demo
2. **Lower Overhead** - No additional dependencies
3. **Easy to Migrate** - Can convert to Redux/Zustand later
4. **React Native Ready** - Hooks work the same across platforms

## Component Design Principles

### Single Responsibility

Each component does ONE thing:

```typescript
// ❌ Don't combine
export const WalletDashboard = () => {
  // Show wallet info, balances, transfer form, history
};

// ✅ Do separate
export const WalletInfo = () => { /* wallet info */ };
export const BalanceCard = () => { /* balances */ };
export const TransferForm = () => { /* transfer */ };
export const TransactionHistory = () => { /* history */ };
```

### Composition over Props Drilling

```typescript
// ❌ Avoid deep prop drilling
<Parent pass={pass} data={data} callbacks={callbacks}>
  <Child />
</Parent>

// ✅ Use context
const { data } = useWalletContext();
```

## Authentication Flow

```
Landing Page (Public)
├── Register Flow
│   ├── PasskeyRegister component
│   ├── WebAuthn prompt
│   ├── Create smart wallet
│   └── Redirect to Dashboard
│
└── Login Flow
    ├── PasskeyLogin component
    ├── Check localStorage for session
    ├── Auto-reconnect if valid
    ├── Or show WebAuthn prompt
    └── Redirect to Dashboard

Protected Routes (AuthGuard wrapper)
├── Dashboard
├── Settings
└── Admin Panel (future)

Session Persistence
├── localStorage stores wallet info
├── Auto-restore on page refresh
├── Invalidate on explicit logout
└── Timeout after 24 hours (future)
```

## Performance Considerations

### Memoization

Components wrapped with `React.memo()` to prevent unnecessary re-renders:

```typescript
export const BalanceCard = React.memo(() => { });
```

### Lazy Loading (Future)

```typescript
const Dashboard = dynamic(() => import('./Dashboard'), {
  loading: () => <LoadingSpinner />,
});
```

### API Caching

- RPC calls cached with 5-second intervals
- Manual refresh button for immediate updates
- Transaction history cached in localStorage

## Security Considerations

### Passkey Security

- ✅ Hardware-bound (can't be exported)
- ✅ Origin-bound (prevents phishing)
- ✅ Biometric/PIN protected
- ✅ Never transmitted (only used for signing)

### Transaction Signing

- ✅ All signing happens on-device
- ✅ SDK never sees private keys
- ✅ Message preview before signing
- ✅ Transaction validation before submission

### Environment Variables

- ✅ Public variables prefixed with `NEXT_PUBLIC_`
- ✅ Secrets never exposed in frontend
- ✅ RPC endpoints can be replaced with custom

## Future Extensibility

### Adding a New Feature (Example: Swaps)

1. Create `hooks/useSwap.ts` for swap logic
2. Create `components/swap/SwapForm.tsx` UI
3. Add to dashboard route
4. No need to modify contexts or core logic

### Adding a New Token

1. Update `TOKENS` constant in `lib/lazorkit/constants.ts`
2. Add token ATA logic to `hooks/useWallet.ts`
3. UI automatically supports new token

### Migrating to Redux

1. Keep hooks interface the same
2. Move state to Redux stores
3. Replace `useContext` with `useSelector`
4. Components remain unchanged

## Testing Strategy

### Unit Tests
- Validation functions
- Formatting utilities
- Error mapping

### Integration Tests
- Hook interactions with context
- Component state updates
- User flows (register, transfer)

### E2E Tests
- Full user journey
- Browser compatibility
- Mobile responsiveness

## Monitoring & Analytics (Future)

```typescript
// Add to hooks for tracking
logger.info('Transfer', 'User initiated transfer', {
  tokenType, amount, recipient
});
```

## Conclusion

This architecture balances:

- **Clarity** - Easy to understand code
- **Scalability** - Room to grow
- **Maintainability** - Clear patterns
- **Performance** - Efficient updates
- **DX** - Enjoyable to build with

The design supports both beginners learning Solana development and experienced teams extending with custom features.
