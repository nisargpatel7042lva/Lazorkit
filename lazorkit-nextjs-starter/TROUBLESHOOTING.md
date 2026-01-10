# Troubleshooting Guide

## Common Issues & Solutions

### ❌ "WebAuthn is not supported in your browser"

**Causes:** Old browser, disabled biometrics, or unsupported OS

**Solutions:**

1. **Update your browser**
   - Chrome: Check Chrome Menu → About Google Chrome (auto-updates)
   - Safari: macOS System Settings → About → Software Update
   - Firefox: Help → About Firefox
   - Edge: Help & feedback → About Microsoft Edge

2. **Enable biometric authentication**
   - **Windows**: Settings → Accounts → Sign-in options → Biometric
   - **macOS**: System Settings → Touch ID & Password
   - **iPhone/iPad**: Settings → Face ID/Touch ID
   - **Android**: Settings → Security → Fingerprint/Face unlock

3. **Check browser support**
   - ✅ Chrome 67+ (Desktop)
   - ✅ Safari 13+ (macOS 10.15+, iOS 13+)
   - ✅ Firefox 60+ (Desktop)
   - ✅ Edge 18+ (Desktop)
   - ❌ Internet Explorer (not supported)

4. **Try a different device**
   - Older phones/tablets may not have biometrics
   - Try a newer device with biometric support

### ❌ "Connection Failed" when creating wallet

**Causes:** Network issue, Devnet RPC down, browser blocking popup

**Solutions:**

1. **Check your internet**
   ```bash
   # Test internet connection
   ping google.com
   ```

2. **Check RPC endpoint**
   - Default: `https://api.devnet.solana.com`
   - Try alternative: `https://free.rpcpool.com/solana-devnet` (if stuck)

3. **Allow popups**
   - Browser may have blocked the Lazorkit portal popup
   - Check your browser's popup blocker
   - Add `portal.lazor.sh` to allowed sites

4. **Check Devnet status**
   - Visit [Solana Status](https://status.solana.com/)
   - If Devnet is down, try again in a few minutes

### ❌ "Insufficient Balance" on transfer

**Cause:** You don't have enough tokens

**Solutions:**

1. **Get free SOL on Devnet**
   ```
   Visit: https://faucet.solana.com/
   Paste your wallet address (from dashboard)
   Request SOL (can do 2x per day per IP)
   ```

2. **Get USDC on Devnet**
   - **Option A**: Mint from serum-wrapped token faucet
   - **Option B**: Swap SOL for USDC in wallet
   - **Option C**: Get from Devnet USDC faucet

3. **Check balance updated**
   - Click "Refresh" button in balance card
   - Wait 10 seconds for balance update
   - Hard refresh browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)

### ❌ "Invalid Recipient Address"

**Causes:** Address format wrong, typo, or not a Solana address

**Solutions:**

1. **Check address format**
   - ✅ Solana addresses are 44 characters
   - ✅ Start with number 1-9 or letter A-Z
   - ❌ No special characters except uppercase letters

2. **Valid examples:**
   ```
   5ohNfHbq6BpwNkWGqPv67Ms5aqWasSEDQwa7UAL32nK (✅ Correct)
   TokenkegQfeZyiNwAJsyFbPVwwQW8JwqvxLucKBbjc (✅ Correct)
   ```

3. **Avoid common mistakes:**
   - ❌ Don't include "https://" or "solana:"
   - ❌ Don't copy address from Solscan URL (might have extra params)
   - ❌ Don't paste address with extra spaces

4. **Find valid addresses**
   - Create a test wallet on Devnet
   - Use a known public wallet like @projectserum tokens
   - Use Devnet faucet addresses

### ❌ Transaction fails after signing

**Causes:** Insufficient gas, account doesn't exist, network issue

**Solutions:**

1. **Check you have tokens**
   - Need SOL for gas (paymaster covers this, but need some balance)
   - Need USDC if transferring USDC
   - Click refresh to update balances

2. **Check recipient account**
   - Recipient wallet must exist on Devnet
   - If transferring USDC, recipient needs a USDC account (auto-created)

3. **Check network connection**
   - Ensure stable internet connection
   - Try a different RPC endpoint in `.env.local`

4. **Check transaction on-chain**
   - Copy signature from error message
   - Visit: `https://solscan.io/tx/[signature]?cluster=devnet`
   - Look for error message on Solscan

### ❌ "Transaction Timeout"

**Cause:** Solana Devnet is slow or network latency

**Solutions:**

1. **Wait and retry**
   - Devnet can be congested
   - Wait 30 seconds and try again

2. **Use different RPC**
   - Try a different public RPC endpoint
   - Edit `.env.local`:
     ```env
     NEXT_PUBLIC_SOLANA_RPC_URL=https://free.rpcpool.com/solana-devnet
     ```

3. **Reduce compute units**
   - Simpler transactions use less resources
   - Try transferring smaller amounts first

### ❌ "Session not persisting" - login required after refresh

**Causes:** localStorage disabled, private browsing, storage full

**Solutions:**

1. **Enable localStorage**
   - Go to browser settings
   - Allow cookies and site data for `localhost:3000`
   - Disable private/incognito browsing

2. **Check storage space**
   - Clear old data if device storage full
   - Press F12 → Application → Clear site data

3. **Verify localStorage working**
   ```javascript
   // In browser console (F12)
   localStorage.setItem('test', 'value');
   localStorage.getItem('test'); // Should return 'value'
   ```

### ❌ Build fails with TypeScript errors

**Cause:** Type mismatches in code

**Solution:**

```bash
# Check what's wrong
npm run build

# Fix TypeScript errors shown in output
# Or disable strict mode in tsconfig.json (not recommended)
```

### ❌ Tailwind CSS not applying

**Cause:** CSS not compiled

**Solutions:**

1. **Restart dev server**
   ```bash
   # Stop: Ctrl+C
   npm run dev
   ```

2. **Clear cache**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check tailwind.config.ts**
   - Ensure all paths are correct
   - Should include `src/app/**/*.{js,ts,jsx,tsx}`

### ❌ Error: "Cannot find module '@lazorkit/wallet'"

**Cause:** Dependencies not installed

**Solution:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ QR Code not showing

**Cause:** qrcode.react library issue

**Solutions:**

```bash
# Reinstall the library
npm install --save qrcode.react
npm run dev
```

### ❌ Mobile layout broken

**Cause:** Viewport meta tag missing or CSS issue

**Solutions:**

1. **Check meta tags in layout.tsx**
   - Should have: `<meta name="viewport" content="width=device-width, initial-scale=1" />`

2. **Test on device**
   ```bash
   # Get your local IP
   ipconfig getifaddr en0  # Mac
   ipconfig  # Windows

   # Visit from phone: http://[your-ip]:3000
   ```

3. **Use browser DevTools**
   - Press F12 → Toggle device toolbar
   - Test different screen sizes

### ❌ Passkey not working on mobile

**Causes:** Mobile browser doesn't support WebAuthn, passkey not synced

**Solutions:**

1. **Use supported mobile browsers**
   - ✅ Safari on iOS 14+
   - ✅ Chrome on Android 10+
   - ✅ Edge on iOS/Android
   - ❌ Firefox on iOS (uses WebKit, no WebAuthn support)

2. **Check iCloud Keychain** (iOS)
   - Settings → [Your Name] → iCloud → Keychain (ON)
   - Passkeys should auto-sync

3. **Check Biometric settings** (Android)
   - Settings → Security → Biometric/Fingerprint
   - Make sure fingerprint/face unlock is set up

4. **Create new passkey on mobile**
   - Device-specific passkeys work best
   - Each device needs its own passkey registration

### ❌ Error: "Secp256r1 signature verification failed"

**Cause:** Passkey signature validation failed on-chain

**Solutions:**

1. **Ensure wallet is connected**
   - Check dashboard loads wallet info
   - Logout and login again

2. **Check clock sync**
   - Your device time must be correct
   - Set to auto-sync: Settings → Date & Time → Auto adjust

3. **Try different browser/device**
   - Passkey might have issues on this device
   - Register new passkey on different device

## Getting Help

If issue persists:

1. **Check logs**
   ```bash
   # Browser console (F12)
   # Look for red error messages
   ```

2. **Check `.env.local`**
   - Verify all environment variables are set
   - Check RPC URL is accessible

3. **See resources**
   - [Lazorkit Docs](https://docs.lazorkit.com/)
   - [Solana Docs](https://docs.solana.com/)
   - [WebAuthn Guide](https://webauthn.guide/)

4. **Ask community**
   - [Solana Discord](https://solana.com/discord)
   - [Lazorkit Issues](https://github.com/lazor-kit/lazor-kit/issues)

---

**Most issues resolve with:** browser update + cache clear + RPC reconnect 🎉
