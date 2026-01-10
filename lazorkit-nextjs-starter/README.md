# ⚡ Lazorkit Next.js Starter Kit

**Passkey-based Solana wallet with gasless transactions**

A production-ready starter template demonstrating Lazorkit SDK integration for building Web3 applications with passkey authentication and gasless transactions on Solana Devnet.

## 🎯 Features

- ✅ **Passkey Authentication** - Create and login with WebAuthn passkeys (no seed phrases)
- ✅ **Gasless Transactions** - SOL and USDC transfers sponsored by paymaster
- ✅ **Smart Wallet** - Solana smart account derived from passkey
- ✅ **Wallet Dashboard** - Real-time balance updates and transaction history
- ✅ **Mobile Responsive** - Works seamlessly on iOS, Android, and desktop
- ✅ **TypeScript** - Full type safety and excellent IDE support
- ✅ **Production Ready** - Comprehensive error handling and logging

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (check with `node --version`)
- **Modern browser** with WebAuthn support (Chrome, Safari, Firefox, Edge)
- **Biometric authentication** or PIN setup on your device

### Installation (5 minutes)

```bash
# Clone the repository
git clone <repo-url>
cd lazorkit-nextjs-starter

# Install dependencies
npm install

# Setup environment variables (defaults work for Devnet)
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Testing Checklist

- [ ] Register new wallet with passkey
- [ ] Login with existing passkey
- [ ] View wallet address and balances
- [ ] Copy address and show QR code
- [ ] Send SOL gaslessly
- [ ] Send USDC gaslessly
- [ ] View transaction history
- [ ] Logout and login again
- [ ] Test on mobile device
- [ ] View transactions on Solscan

## 🏗️ Architecture

See `ARCHITECTURE.md` for detailed design decisions, component interactions, and data flow diagrams.

## 📚 Tutorials

- **`tutorials/01-getting-started.md`** - Project overview
- **`tutorials/02-passkey-authentication.md`** - WebAuthn deep dive
- **`tutorials/03-gasless-transactions.md`** - Paymaster mechanics
- **`tutorials/04-session-management.md`** - Session persistence

## 🐛 Troubleshooting

See `TROUBLESHOOTING.md` for common issues and solutions.

## 📦 Deployment

Deploy to Vercel with one click:

```bash
git push origin main
# Visit vercel.com/new and connect your repo
```

## 🔗 Resources

- [Lazorkit Docs](https://docs.lazorkit.com/) - Official SDK documentation
- [Solana Docs](https://docs.solana.com/) - Blockchain fundamentals
- [WebAuthn Guide](https://webauthn.guide/) - Passkey deep dive

## 📄 License

MIT - Use freely in your projects!
This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
