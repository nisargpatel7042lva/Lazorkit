# Tutorial 4: Session Management

Learn how to persist wallet sessions, handle reconnection, and manage user state across browser sessions.

## What You'll Learn

- How session persistence works
- localStorage vs sessionStorage trade-offs
- Auto-reconnect logic
- Handling stale sessions
- SSR considerations with Next.js

## The Challenge: Session Persistence

### Problem Statement

```
User Flow Problem:

1. User registers wallet on Monday
2. Closes browser tab
3. Returns on Tuesday
4. Expects to still be logged in
5. But wallet state is lost!

Solution: Save session to localStorage
```

### Why Session Persistence Matters

```
Without persistence:
- User must register every visit
- Frustrating for frequent users
- Bad UX compared to traditional apps

With persistence:
- Register once, login forever
- User credentials safe on device
- Better UX and retention
```

## How Session Persistence Works

### Storage Strategy

```typescript
// What gets stored?

Session Storage = {
  credentialId: "...",          // WebAuthn credential ID
  passkeyPubkey: [33, 127, ...], // Passkey public key
  smartWallet: "So9...",        // Solana wallet address
  walletDevice: "PDA...",       // Device account PDA
  platform: "macIntel",         // Device platform
  accountName: "Alice",         // User's chosen name
  createdAt: 1704873600000,    // Timestamp
}
```

### Storage Location

```
Browser Memory
    ├── React State (useContext)
    │   └── Lost on page refresh
    │
    ├── localStorage
    │   ├── Survives page refresh ✅
    │   ├── Survives browser close ✅
    │   ├── Persists ~5-10MB data ✅
    │   └── String-based only (JSON parse/stringify)
    │
    └── sessionStorage
        ├── Survives page refresh ✅
        ├── Lost on browser close ❌
        └── Good for temporary data only
```

## Implementation

### 1. useLocalStorage Hook

The `useLocalStorage.ts` hook safely handles browser storage:

```typescript
// Why custom hook?
// - Next.js SSR doesn't have window object
// - Prevents hydration mismatches
// - Provides error handling
// - Type-safe with generics

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
) => {
  // State for client-only rendering
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Only run in browser, after hydration
  useEffect(() => {
    setIsHydrated(true);
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      logger.error(`Failed to read ${key}`, error as Error);
    }
  }, [key]);

  // Save function
  const setValue = useCallback((value: T) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch (error) {
      logger.error(`Failed to write ${key}`, error as Error);
    }
  }, [key]);

  // Return initial value during SSR/hydration
  // Then switch to stored value after hydration
  return [isHydrated ? storedValue : initialValue, setValue] as const;
};
```

### 2. Session Saving

When user registers/logs in, save session:

```typescript
// In useLazorkit.ts
const connect = useCallback(async () => {
  try {
    // Get provider and connect
    const provider = createLazorkitProvider(config);
    const walletInfo = await provider.connect();

    // Save to localStorage
    const sessionData = {
      credentialId: walletInfo.credentialId,
      passkeyPubkey: walletInfo.passkeyPubkey,
      smartWallet: walletInfo.smartWallet,
      walletDevice: walletInfo.walletDevice,
      platform: walletInfo.platform,
      accountName: walletInfo.accountName,
      createdAt: Date.now(),
    };

    localStorage.setItem('lazorkit_session', JSON.stringify(sessionData));

    // Update context
    setWalletInfo(walletInfo);
    setIsConnected(true);

    logger.log('Session saved successfully');
    return walletInfo;
  } catch (error) {
    logger.error('Connection failed', error as Error);
    throw error;
  }
}, []);
```

### 3. Session Recovery (Auto-Login)

On app load, restore session if available:

```typescript
// In PasskeyLogin.tsx
export const PasskeyLogin = ({ 
  autoConnect = true 
}: PasskeyLoginProps) => {
  const { reconnect } = useLazorkit();

  // Auto-reconnect on mount
  useEffect(() => {
    if (autoConnect) {
      const attemptReconnect = async () => {
        try {
          await reconnect();
          // User auto-logged in!
        } catch (error) {
          // Session expired or invalid
          // User can manual login
          logger.log('Auto-login failed, showing manual login');
        }
      };

      attemptReconnect();
    }
  }, [autoConnect, reconnect]);
};
```

### 4. Reconnect Logic

```typescript
// In useLazorkit.ts
const reconnect = useCallback(async () => {
  try {
    // Read stored session
    const stored = localStorage.getItem('lazorkit_session');
    if (!stored) {
      logger.log('No stored session');
      return;
    }

    const walletInfo = JSON.parse(stored);

    // Validate session is still valid
    // (e.g., within 30 days of creation)
    const createdAt = walletInfo.createdAt || Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - createdAt > thirtyDaysMs;

    if (isExpired) {
      logger.log('Session expired');
      localStorage.removeItem('lazorkit_session');
      return;
    }

    // Restore state
    setWalletInfo(walletInfo);
    setIsConnected(true);
    logger.log('Session restored successfully');
  } catch (error) {
    logger.error('Reconnection failed', error as Error);
    // Clear invalid session
    localStorage.removeItem('lazorkit_session');
  }
}, []);
```

### 5. Session Clearing

When user logs out:

```typescript
// In useLazorkit.ts
const disconnect = useCallback(() => {
  try {
    // Clear localStorage
    localStorage.removeItem('lazorkit_session');
    localStorage.removeItem('lazorkit_credentials');

    // Clear context
    setWalletInfo(null);
    setIsConnected(false);

    logger.log('Session cleared');
  } catch (error) {
    logger.error('Logout failed', error as Error);
  }
}, []);
```

## Advanced Session Management

### Session Validation

```typescript
// Verify session is still valid
const validateSession = async (walletInfo: WalletInfo) => {
  try {
    // Check wallet still exists on-chain
    const connection = getSolanaConnection();
    const accountInfo = await connection.getAccountInfo(
      new PublicKey(walletInfo.smartWallet)
    );

    if (!accountInfo) {
      // Wallet deleted or doesn't exist
      return false;
    }

    // Check account has expected data structure
    const isValid = accountInfo.data.length > 0;
    return isValid;
  } catch (error) {
    logger.error('Session validation failed', error as Error);
    return false;
  }
};
```

### Session Expiration

```typescript
// Auto-logout after inactivity
const useSessionTimeout = (timeoutMs = 30 * 60 * 1000) => {
  const { disconnect } = useLazorkit();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logger.log('Session timed out due to inactivity');
        disconnect();
      }, timeoutMs);
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [timeoutMs, disconnect]);
};
```

### Multi-Device Support

```typescript
// Store sessions for multiple devices
const useMultiDeviceSession = () => {
  const storeDeviceSession = (device: string, session: SessionState) => {
    const allSessions = JSON.parse(
      localStorage.getItem('sessions') || '{}'
    );
    
    allSessions[device] = {
      ...session,
      deviceId: device,
      lastUsed: Date.now(),
    };

    localStorage.setItem('sessions', JSON.stringify(allSessions));
  };

  const getDeviceSession = (device: string) => {
    const allSessions = JSON.parse(
      localStorage.getItem('sessions') || '{}'
    );
    return allSessions[device];
  };

  const listAllSessions = () => {
    const allSessions = JSON.parse(
      localStorage.getItem('sessions') || '{}'
    );
    return Object.values(allSessions);
  };

  return { storeDeviceSession, getDeviceSession, listAllSessions };
};
```

## Next.js & SSR Considerations

### The Hydration Problem

```typescript
// ❌ WRONG - Causes hydration mismatch
const [session, setSession] = useState(
  JSON.parse(localStorage.getItem('session') || '{}')
);
// Server renders: {}
// Client renders: {actual session}
// Mismatch! ❌

// ✅ CORRECT - No hydration mismatch
const [session, setSession] = useState<SessionState | null>(null);
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  setIsHydrated(true);
  const stored = localStorage.getItem('session');
  setSession(stored ? JSON.parse(stored) : null);
}, []);

if (!isHydrated) return <LoadingSpinner />;
```

### Server-Safe Components

```typescript
// ✅ GOOD - Can safely render on server
export const WalletInfo = ({ address, accountName }: Props) => {
  return (
    <div>
      <h2>{accountName}</h2>
      <p>{address}</p>
    </div>
  );
};

// ❌ BAD - localStorage only works in browser
export const SessionDisplay = () => {
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  return <div>{session.address}</div>;
};

// ✅ GOOD - Use custom hook for localStorage safety
export const SessionDisplay = () => {
  const [session] = useLocalStorage('session', null);
  if (!session) return <LoadingSpinner />;
  return <div>{session.address}</div>;
};
```

## Testing Session Management

### Test Case 1: Auto-Login

```typescript
it('should auto-login if session exists', async () => {
  // Setup
  const session = {
    credentialId: 'test...',
    passkeyPubkey: [1, 2, 3],
    smartWallet: 'So9...',
    // ...
  };
  localStorage.setItem('session', JSON.stringify(session));

  // Mount component
  const { getByText } = render(<App />);

  // Wait for reconnect
  await waitFor(() => {
    expect(getByText('Dashboard')).toBeInTheDocument();
  });

  // Verify
  expect(localStorage.getItem('session')).toBeTruthy();
});
```

### Test Case 2: Session Expiration

```typescript
it('should logout after timeout', async () => {
  const { unmount } = render(<App />);

  // Simulate inactivity for 30+ minutes
  jest.advanceTimersByTime(31 * 60 * 1000);

  // Verify user logged out
  expect(localStorage.getItem('session')).toBeNull();
  expect(getByText('Login')).toBeInTheDocument();
});
```

### Test Case 3: Manual Logout

```typescript
it('should clear session on logout', async () => {
  const { getByRole } = render(<Dashboard />);

  // Setup initial session
  localStorage.setItem('session', JSON.stringify({...}));

  // Click logout
  fireEvent.click(getByRole('button', { name: /logout/i }));

  // Verify session cleared
  expect(localStorage.getItem('session')).toBeNull();
});
```

## Best Practices

### ✅ DO

- ✅ Store session with timestamp
- ✅ Validate session before restoring
- ✅ Use useLocalStorage hook for safety
- ✅ Clear session on logout
- ✅ Set reasonable expiration (30 days)
- ✅ Show loading state during reconnect
- ✅ Handle storage quota gracefully

### ❌ DON'T

- ❌ Store passwords or private keys
- ❌ Access localStorage outside useEffect
- ❌ Trust localStorage for sensitive data
- ❌ Store unencrypted credentials
- ❌ Forget to handle quota exceeded errors
- ❌ Assume localStorage always available
- ❌ Skip validation on reconnect

## Security Considerations

### What's Safe to Store

```
✅ Safe in localStorage:
- Public wallet addresses
- Session timestamps
- User preferences
- Device IDs

❌ Never store in localStorage:
- Private keys
- Seed phrases
- Passphrases
- Secret keys
- API tokens
```

### Protection Strategy

```
Private Keys (on device):
└── Protected by OS (Secure Enclave)
    └── Protected by biometric/PIN
    └── Never stored in localStorage
    └── Never sent to server

Session Data (in localStorage):
├── Publicly readable but not sensitive
├── Used to restore context only
└── Validates via passkey re-auth if needed
```

## Storage Limits

### Quota by Browser

| Browser | Limit |
|---------|-------|
| Chrome | 10 MB |
| Firefox | 10 MB |
| Safari | 5 MB |
| Edge | 10 MB |
| Mobile Safari | 5 MB |

### Handling Quota Exceeded

```typescript
const setLocalStorageWithFallback = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Storage full, cleanup old sessions
      const allSessions = JSON.parse(
        localStorage.getItem('sessions') || '{}'
      );
      
      // Keep only 3 most recent sessions
      const sorted = Object.entries(allSessions)
        .sort((a, b) => b[1].lastUsed - a[1].lastUsed)
        .slice(0, 3);
      
      localStorage.setItem('sessions', JSON.stringify(Object.fromEntries(sorted)));
      
      // Try again
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      throw error;
    }
  }
};
```

## Key Takeaways

✅ localStorage persists across browser sessions
✅ useLocalStorage hook handles SSR safely
✅ Always validate sessions on reconnect
✅ Clear sessions on logout
✅ Never store sensitive data
✅ Handle quota and errors gracefully

## Complete Example

```typescript
// Full session lifecycle
export const useSession = () => {
  const [session, setSession] = useLocalStorage<SessionState | null>(
    'session',
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: try to restore session
  useEffect(() => {
    const restore = async () => {
      try {
        if (session) {
          // Validate session is still valid
          const isValid = await validateSession(session);
          if (isValid) {
            setIsConnected(true);
          } else {
            setSession(null);
          }
        }
      } catch (error) {
        logger.error('Session restore failed', error as Error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  // Save new session
  const saveSession = useCallback((newSession: SessionState) => {
    setSession(newSession);
    setIsConnected(true);
  }, [setSession]);

  // Clear session
  const clearSession = useCallback(() => {
    setSession(null);
    setIsConnected(false);
  }, [setSession]);

  return {
    session,
    isConnected,
    isLoading,
    saveSession,
    clearSession,
  };
};
```

## What's Next?

- **ARCHITECTURE.md**: Complete system design
- **TROUBLESHOOTING.md**: Debug session issues
- Deploy to Vercel and test persistence

## Resources

- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Web Storage Security](https://owasp.org/www-community/controls/Proper_Handling_of_Confidential_Data)
- [Next.js Hydration](https://nextjs.org/docs/basic-features/data-fetching/client-side#useeffect)
- [Lazorkit Session Docs](https://docs.lazorkit.com/)

Happy coding! 🚀
