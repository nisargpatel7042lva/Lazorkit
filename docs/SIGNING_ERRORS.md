# Signing Failed - Troubleshooting Guide

## Overview

The "Signing failed" error occurs when the Lazorkit SDK fails to sign a transaction with your passkey. This typically happens during transfer operations.

The error often originates from `DialogManager.ts` in the Lazorkit portal, which handles communication between the app and the authentication portal.

## Common Causes & Solutions

### 1. **Wallet Session Expired**

**Symptom:** "Signing failed" error in DialogManager.ts (698:28)

**Cause:** Your wallet session has expired or is invalid

**Solution:**
- The app now validates wallet session before attempting any transfer
- If you see "Wallet connection incomplete", click **"Connect Wallet"** again
- Re-authenticate with your passkey
- Then retry your transfer

---

### 2. **Passkey Not Registered or Expired**

**Symptom:** "Signing failed" appears immediately when you click transfer

**Cause:** Your passkey session has expired or was not properly registered

**Solution:**
- Click **"Login with Passkey"** to re-authenticate
- You should be prompted to verify with biometrics (Face ID, fingerprint, etc.)
- Then retry your transfer

---

### 3. **Portal Communication Failure**

**Symptom:** "Signing failed" with DialogManager error

**Cause:** Network issue or portal unavailability

**Solution:**
- Check your internet connection
- Disable any VPN temporarily
- Try refreshing the page
- Wait 30 seconds and try again
- Check [Lazorkit Portal Status](https://portal.lazor.sh)

---

### 4. **Browser/Device Compatibility**

**Symptom:** "Signing failed" or passkey dialog won't appear

**Cause:** Your browser or device doesn't fully support WebAuthn/Passkey functionality

**Supported Browsers:**
- ✅ Chrome 90+
- ✅ Safari 14+
- ✅ Firefox 60+
- ✅ Edge 90+

**Required Device Features:**
- Biometric authentication (Face ID, fingerprint, or PIN)
- Modern operating system (Windows 10+, macOS 10.15+, iOS 14+, Android 9+)

**Solution:**
- Update your browser to the latest version
- Try a different browser if available
- Use a device with biometric authentication support

---

### 5. **Network Issues**

**Symptom:** "Signing failed" or transaction times out

**Cause:** Network connectivity issue between your device and Lazorkit portal

**Solution:**
- Check your internet connection
- Disable any VPN temporarily
- Try refreshing the page and signing again
- Check the browser console for specific error messages

---

### 6. **RPC/Blockchain Issues**

**Symptom:** "Signing failed" after authentication dialog completes

**Cause:** Issue with Solana RPC connection or network congestion

**Solution:**
- Wait a few seconds and try again
- Check [Solana status page](https://status.solana.com) for network issues
- Check the browser console for RPC error messages

---

### 7. **Insufficient Balance or Permissions**

**Symptom:** "Signing failed" when trying to transfer USDC

**Cause:** 
- No SOL for initial transaction setup
- No USDC balance to transfer
- Associated token account not created

**Solution:**
- Ensure you have at least 0.01 SOL in your wallet
- For USDC transfers, ensure you have USDC balance
- The app will create USDC accounts automatically

---

### 8. **Browser Storage/Cache Issues**

**Symptom:** Signing works sometimes but randomly fails

**Cause:** Corrupted browser cache or local storage

**Solution:**
1. Open Developer Tools (F12 or right-click → Inspect)
2. Go to **Application** tab → **Clear Site Data**
3. Select all options and clear
4. Refresh the page and log in again

---

## Pre-Flight Checks

The app now performs automatic validation before attempting to sign:

1. **Wallet Session Validation** ✅
   - Checks if wallet is connected
   - Verifies signing function is available
   - Validates wallet address format

2. **Input Validation** ✅
   - Checks recipient address is valid
   - Ensures amount is positive
   - Prevents invalid transactions

3. **Instruction Creation** ✅
   - Validates transfer instructions
   - Logs instruction details for debugging
   - Catches instruction creation errors early

4. **Portal Communication** ✅
   - Logs when sending to Lazorkit portal
   - Captures DialogManager errors
   - Provides user-friendly error messages

---

## Debugging Steps

### Check Browser Console for Detailed Error

1. Open Developer Tools (F12 or right-click → Inspect)
2. Go to **Console** tab
3. Look for detailed error messages with these prefixes:
   - `[useTransfer]` - Transfer operation logs
   - `[LazorkitContext]` - Wallet connection logs
   - `[DialogManager]` - Portal communication logs

4. Screenshot the error and note:
   - Time of error
   - Exact error message
   - What action triggered it

### Example Console Output

```
[useTransfer] Starting SOL transfer
  recipient: "11111111111111111111111111111111"
  amount: 0.5
  senderAddress: "ABC..."

[useTransfer] Sending transaction to Lazorkit portal...

[useTransfer] SOL transfer signing failed
  Error: Signing failed
  Type: SIGNING_FAILURE
  DialogManager.ts (698:28)
```

### Check Browser Support

Run this in the browser console:

```javascript
// Check WebAuthn support
if (window.PublicKeyCredential === undefined ||
    navigator.credentials === undefined) {
  console.log('WebAuthn not supported');
} else {
  PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    .then(available => {
      console.log('Platform authenticator available:', available);
    });
}
```

### Test Passkey Directly

To verify your passkey works independently:

1. Visit [webauthn.io](https://webauthn.io)
2. Click "Register"
3. Create or use your existing passkey
4. If this works, your passkey is functional

If this fails, your passkey may be corrupted and you need to:
1. Disconnect wallet
2. Create a new wallet with a fresh passkey
3. Transfer funds to your new wallet

---

## Advanced Troubleshooting

### Enable Detailed Logging

The app logs detailed information automatically:

- Look for `[useTransfer]` logs for transfer signing issues
- Look for `[LazorkitContext]` logs for SDK-level issues
- Development mode shows full error stack traces
- Production mode shows user-friendly messages

### Session Validation Improvements

The app now validates:

1. **Before Signing:**
   - Wallet is connected (smartWalletPubkey exists)
   - Signing function is available (signAndSendTransaction exists)
   - Wallet address is valid (can create PublicKey)

2. **During Transfer:**
   - Recipient address is valid and different
   - Amount is positive
   - Instructions are created successfully
   - Portal receives valid data

3. **Error Recovery:**
   - Catches DialogManager errors specifically
   - Detects signing vs. network vs. validation errors
   - Provides targeted user guidance

---

## Still Having Issues?

### Collect Diagnostic Information

Before reporting:

1. **Browser & OS**: What browser and OS are you using? (e.g., Chrome 121 on Windows 11)
2. **Error Message**: Copy the exact error from console
3. **Console Logs**: Screenshot ALL logs from `[useTransfer]` and `[DialogManager]`
4. **Steps to Reproduce**: Exact steps that led to the error
5. **Device**: Is it a desktop, laptop, phone, etc.?
6. **Time**: When did the error occur? (helps track network issues)

### Workarounds

If signing continues to fail:

1. **Try a Different Browser** - Sometimes switching to Chrome/Safari/Firefox helps
2. **Try a Different Device** - Borrow a friend's computer to test
3. **Clear Browser Cache** - Delete all storage and cookies for this site
4. **Disable Extensions** - Temporarily disable browser extensions that might interfere
5. **Use VPN Off** - Try disabling any VPN temporarily
6. **Wait and Retry** - Sometimes Solana/Portal has temporary issues

### Contact Support

If the issue persists:

- Visit [Lazorkit Docs](https://docs.lazor.sh)
- Check [Solana Status](https://status.solana.com)
- Review [Portal Health](https://portal.lazor.sh)

---

## Security Notes

- ⚠️ Your passkey **never leaves your device** - it's only used locally
- ⚠️ The app never has access to your passkey credentials
- ✅ Signing happens securely through browser WebAuthn API
- ✅ No recovery phrases or private keys involved
- ✅ All transaction data is validated before signing
