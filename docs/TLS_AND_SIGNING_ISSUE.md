# TLS Certificate & Signing Failure Issue

This document describes why **signing** (and sometimes **passkey login**) can fail with TLS/certificate or WebAuthn errors in the Lazorkit app, and how to fix or work around it.

---

## What’s the issue?

When you try to **approve a transaction** in the Lazorkit portal (or sometimes when logging in with a passkey), the browser may block the operation and you see errors such as:

- **"WebAuthn is not supported on sites with TLS certificate errors"**
- **"Signing failed"** with a `NotAllowedError`
- **"The operation either timed out or was not allowed"**
- A generic **certificate** or **secure context** error

**Important:** This is not a bug in the Lazorkit app code. The browser deliberately blocks WebAuthn (passkeys) when it considers the **origin** where WebAuthn runs to be insecure.

---

## Why does it happen?

Signing and passkey login use **WebAuthn**. The WebAuthn flow runs in the **Lazorkit portal**, which is loaded from:

- **`https://portal.lazor.sh`**

The browser treats that origin as **insecure** in these situations:

| Cause | What happens |
|-------|-------------------------------|
| **Wrong system date/time** | Certificate validity checks fail (cert is “not yet valid” or “expired”) |
| **Corporate / school WiFi** | Proxy or firewall inspects HTTPS and replaces certificates |
| **VPN or antivirus** | SSL/TLS inspection replaces the real certificate |
| **Invalid or self-signed cert** | Browser doesn’t trust the portal’s certificate |
| **Network / DNS issues** | Wrong or intercepted connection to `portal.lazor.sh` |

When the browser decides the portal origin is insecure, it **disables WebAuthn** for that origin. So signing (and sometimes login) fails even though the app itself is fine.

---

## What you see in the app

- After clicking **Approve** in the portal, the request fails.
- The app may show a message like:
  - *"Signing failed. This often happens when the browser blocks the sign-in portal due to TLS/certificate issues."*
- In the browser console (F12 → Console) you might see:
  - `WebAuthn is not supported on sites with TLS certificate errors`
  - `NotAllowedError: The operation either timed out or was not allowed`

---

## How to fix it (checklist)

Do these in order. Stop when signing starts working.

### 1. Fix system date and time

Incorrect clock is a very common cause.

- **Windows:** Settings → Time & language → Date & time → **Sync now** (or turn on “Set time automatically”).
- **macOS:** System Settings → General → Date & Time → **Set time and date automatically**.
- **Linux:** Use NTP (e.g. `timedatectl set-ntp true` or your distro’s time settings).

Then reload the app and try signing again.

### 2. Test the portal in a new tab

Open:

**https://portal.lazor.sh**

in a **new browser tab**.

- If you see a **certificate warning** (“Your connection is not private”, “Not secure”, etc.):
  - Fix the cause (time, network, or proxy) so the warning goes away.
  - Do **not** rely on “Advanced → Proceed” for normal use; the browser may still block WebAuthn.
- If the page loads **without** any warning, the portal is fine from that network; try signing again from the app.

### 3. Try a different network

- **Corporate / school WiFi** and many **VPNs** intercept HTTPS and break certificate validation.
- Try:
  - **Mobile hotspot** (phone’s 4G/5G), or  
  - **Home WiFi** without VPN.
- If signing works on the other network, the issue is your usual network (proxy/VPN/firewall).

### 4. Disable SSL/TLS inspection (if you control it)

If you use:

- Corporate proxy
- Antivirus or “security” software that inspects HTTPS

then:

- Temporarily **disable HTTPS/SSL inspection** for testing, or  
- Add an **exception** for `portal.lazor.sh` so it is not inspected.

(Exact steps depend on your proxy/antivirus.)

### 5. Use another browser or device

Sometimes one browser or device works when another doesn’t (e.g. different certificate store or no corporate proxy). Try:

- Another browser on the same machine (Chrome, Edge, Firefox).
- Another device on a different network (e.g. phone on cellular).

---

## Workaround: Demo mode

When you **cannot** fix the TLS/certificate or network (e.g. during a demo on restricted WiFi), you can still show the full app flow using **Demo mode**:

1. Open the dashboard with **`?demo=1`** in the URL, for example:
   - `https://your-app.com/dashboard?demo=1`
   - or locally: `http://localhost:3000/dashboard?demo=1`
2. In Demo mode, **transfers are simulated** (no real signing, no real blockchain transaction).
3. The UI (forms, confirmations, history) works as usual so you can demonstrate the experience.

Demo mode does **not** fix real signing; it only avoids the need for it during a demo.

---

## Summary

| Topic | Explanation |
|--------|-----------------------------|
| **Root cause** | Browser blocks WebAuthn when the Lazorkit portal origin (`https://portal.lazor.sh`) is considered insecure (TLS/certificate or secure-context rules). |
| **Common causes** | Wrong system time, corporate proxy, VPN, antivirus SSL inspection, or invalid cert for `portal.lazor.sh`. |
| **Fix** | Correct system time, open `https://portal.lazor.sh` and fix any cert warning, try another network (e.g. hotspot), disable SSL inspection for the portal if possible. |
| **Workaround** | Use **Demo mode** (`/dashboard?demo=1`) to demo the app without real signing. |

For more general troubleshooting (connection, balance, passkey support, etc.), see the main [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) in the project root.
