# Tutorial 2: Passkey Authentication Deep Dive

Understand how WebAuthn passkeys work and how Lazorkit integrates them into the wallet.

## What You'll Learn

- What passkeys are and why they're better than passwords
- How WebAuthn works at a technical level
- How Lazorkit creates smart wallets from passkeys
- Implementation details in the starter kit

## What Are Passkeys?

### The Problem with Passwords

Traditional password-based auth has issues:

- 💥 Data breaches expose millions of passwords
- 😰 Users reuse passwords across sites
- 🔓 Weak passwords easy to guess
- 🎣 Phishing attacks steal credentials
- 📱 Inconvenient to manage

### The Passkey Solution

Passkeys fix these problems:

- ✅ **No shared secrets** - Keys never leave your device
- ✅ **Cryptographically strong** - Impossible to guess
- ✅ **Phishing-resistant** - Tied to specific domain
- ✅ **Biometric-based** - Fingerprint or face recognition
- ✅ **User-friendly** - No memorization needed

## How WebAuthn Works

### High-Level Flow

```
User Action
    ↓
Browser WebAuthn API
    ↓
OS Authenticator (Fingerprint, Face, PIN)
    ↓
Generate Keypair (Public + Private)
    ↓
Private key stays on device
Public key sent to server
    ↓
Cryptographic proof verified
```

### Registration (Signup)

```
1. User clicks "Register"
   ↓
2. Server sends: "Create credential"
   ↓
3. Browser prompts user
   ↓
4. User authenticates (biometric/PIN)
   ↓
5. Device generates public/private keypair
   ↓
6. Public key sent to server
   ↓
7. Server stores: {username: "alice", publicKey: "xyz..."}
```

### Authentication (Login)

```
1. User clicks "Login"
   ↓
2. Browser asks for passkey
   ↓
3. User authenticates (biometric/PIN)
   ↓
4. Device signs challenge with private key
   ↓
5. Signed challenge sent to server
   ↓
6. Server verifies signature with stored public key
   ↓
7. Login successful!
```

## Lazorkit's Smart Wallet Integration

### Custom Keypair Handling

Lazorkit extends WebAuthn for blockchain:

```
User creates passkey
    ↓
Derive Solana keypair from passkey public key
    ↓
Create smart wallet account on-chain
    ↓
Smart wallet becomes user's identity
    ↓
Transactions signed by smart wallet
```

### Security Model

```
Passkey Private Key (on device)
    ↓
Only used locally for authentication
    ↓
Never sent over network
    ↓
Used to sign blockchain transactions
    ↓
Paymaster verifies and sponsors fees
```

## Code Implementation

### Registration Component

Let's look at how `PasskeyRegister.tsx` works:

```typescript
// User clicks "Register"
export const PasskeyRegister = ({ onSuccess }: PasskeyRegisterProps) => {
  const { connect } = useLazorkit();

  const handleRegister = async () => {
    try {
      // Call Lazorkit SDK
      const walletInfo = await connect();
      
      // Lazorkit handles:
      // 1. Open portal popup
      // 2. Create WebAuthn credential
      // 3. Derive Solana keypair
      // 4. Create smart wallet on-chain
      
      // Save to context and localStorage
      onSuccess();
    } catch (error) {
      // Handle errors gracefully
      setError(mapErrorToMessage(error));
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <Input 
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button type="submit">Create Wallet</Button>
    </form>
  );
};
```

### The useLazorkit Hook

The `useLazorkit.ts` hook encapsulates all SDK operations:

```typescript
export const useLazorkit = () => {
  const { setWalletInfo, setIsConnected } = useContext(LazorkitContext);

  const connect = useCallback(async () => {
    try {
      // Initialize Lazorkit provider
      const provider = createLazorkitProvider(config);
      
      // Open portal for passkey creation
      const walletInfo = await provider.connect();
      
      // Save session to localStorage
      localStorage.setItem('session', JSON.stringify(walletInfo));
      
      // Update context
      setWalletInfo(walletInfo);
      setIsConnected(true);
      
      return walletInfo;
    } catch (error) {
      logger.error('Connect failed', error as Error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem('session');
    setWalletInfo(null);
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(async () => {
    // Auto-reconnect from localStorage
    const stored = localStorage.getItem('session');
    if (stored) {
      const walletInfo = JSON.parse(stored);
      // Validate with Lazorkit
      setWalletInfo(walletInfo);
      setIsConnected(true);
    }
  }, []);

  return { connect, disconnect, reconnect, isConnected, walletInfo };
};
```

### Session Management

The `useLocalStorage.ts` hook handles persistence safely:

```typescript
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // State prevents SSR hydration mismatches
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Only run on client-side after hydration
    setIsHydrated(true);
    
    try {
      // Get from localStorage
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      logger.error(`localStorage read failed for ${key}`, error as Error);
    }
  }, [key]);

  const setValue = useCallback((value: T) => {
    try {
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch (error) {
      logger.error(`localStorage write failed for ${key}`, error as Error);
    }
  }, [key]);

  return [isHydrated ? storedValue : initialValue, setValue] as const;
};
```

## Advanced Topics

### Browser Support Detection

Not all browsers support WebAuthn. The `usePasskey.ts` hook detects support:

```typescript
export const usePasskey = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isCapable, setIsCapable] = useState(false);

  useEffect(() => {
    // Check API availability
    const supported = 
      typeof window !== 'undefined' &&
      window.PublicKeyCredential !== undefined;
    
    setIsSupported(supported);

    if (supported) {
      // Check device capability
      PublicKeyCredential.isUserVerificationAvailable()
        .then(capable => setIsCapable(capable))
        .catch(() => setIsCapable(false));
    }
  }, []);

  return {
    isSupported,
    isCapable,
    message: isSupported 
      ? isCapable 
        ? "Browser supports passkeys"
        : "Browser supports passkeys but device not ready"
      : "Your browser doesn't support passkeys"
  };
};
```

### Lazy Reconnection

Auto-login on app load if session exists:

```typescript
// In PasskeyLogin component
useEffect(() => {
  if (autoConnect) {
    reconnect();
  }
}, [autoConnect, reconnect]);
```

### Error Recovery

Graceful handling of authentication failures:

```typescript
const handleRegister = async () => {
  try {
    await connect();
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // User cancelled registration
      setError('Registration cancelled');
    } else if (error.name === 'NotSupportedError') {
      // Browser doesn't support WebAuthn
      setError('Your browser doesn\'t support passkeys');
    } else {
      // Generic error
      setError(mapErrorToMessage(error));
    }
  }
};
```

## Security Considerations

### Private Key Storage

```
Private Key Storage Hierarchy:
1. User's device (biometric/PIN protected)
2. Hardware module (secure enclave)
3. Encrypted by OS
4. Never transmitted or stored elsewhere
```

### Attack Resistance

Passkeys protect against:

| Attack | How Protected |
|--------|---------------|
| Phishing | Tied to specific domain (origin) |
| Brute Force | Cryptographically strong keys |
| Credential Reuse | Each site gets unique credential |
| Server Breach | No passwords stored on server |
| Man-in-the-Middle | Signature verification prevents tampering |

### Best Practices

✅ Never log private keys
✅ Always verify domain match in popup
✅ Clear sensitive data from memory
✅ Use HTTPS everywhere
✅ Validate signature server-side

## Troubleshooting WebAuthn

### "WebAuthn not supported"
- Chrome 90+, Safari 14+, Firefox 60+, Edge 90+
- Mobile: iOS Safari 16+, Chrome Android

### "No authenticator available"
- Biometric not set up on device
- Try setting PIN in device settings
- Use security key as backup

### "Operation timed out"
- User took too long to authenticate
- Browser session expired
- Try again

### "Credential already exists"
- Can't register same username twice
- Use different username or login

## Key Takeaways

✅ Passkeys are industry-standard WebAuthn
✅ Private keys never leave device
✅ Biometric security is user-friendly
✅ Lazorkit derives Solana keypair from passkey
✅ Smart wallets enable gasless transactions

## What's Next?

- **Tutorial 3**: Learn how gasless transactions work
- **Tutorial 4**: Understand session persistence
- **ARCHITECTURE.md**: Deep dive into system design

Ready to understand gasless transactions? Check **Tutorial 3: Gasless Transactions**!

References:
- [WebAuthn Specification](https://www.w3.org/TR/webauthn-2/)
- [FIDO2 Alliance](https://fidoalliance.org/)
- [Lazorkit SDK Docs](https://docs.lazorkit.com/)
