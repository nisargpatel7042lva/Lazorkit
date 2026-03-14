/**
 * About Page
 *
 * Explains what Lazorkit is and what this app does for users
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Zap, KeyRound, Wallet, Send, History, ArrowRight, ListChecks } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <Image
                  src="/navbar-logo.png"
                  alt="Lazorkit Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-xl font-bold text-[#1a1a1a]">Lazorkit</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-[#1e293b] opacity-70 hover:text-[#8b5cf6] hover:opacity-100 font-medium transition-colors"
              >
                Home
              </Link>
              <span className="text-[#8b5cf6] font-medium">About</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4 tracking-tight">
            What is Lazorkit?
          </h2>
          <p className="text-lg md:text-xl text-[#1e293b] opacity-80 max-w-2xl mx-auto leading-relaxed">
            A Solana smart wallet you can use with your fingerprint or face—no seed phrases, no gas fees to worry about.
          </p>
        </div>

        {/* What we're building */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8b5cf6] rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span>What we're building</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-[#1e293b] opacity-90 leading-relaxed">
            <p>
              This app is a <strong className="text-[#1a1a1a]">demo of the Lazorkit SDK</strong>—a way to use Solana
              with a wallet that feels like a normal app. You sign in with a passkey (your device’s biometrics or PIN),
              and we create a secure Solana smart wallet for you. You can hold SOL and USDC, send them to anyone,
              and see your history, without ever dealing with seed phrases or paying gas yourself.
            </p>
            <p>
              We’re showing how Web3 can work with familiar, secure login and gasless transactions so that using
              Solana is simple and safe for everyone.
            </p>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8b5cf6] rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span>How it works</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-5 text-[#1e293b] opacity-90">
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#faf9f6] border border-[#1a1a1a] flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-[#8b5cf6]" />
                </div>
                <div>
                  <strong className="text-[#1a1a1a]">Passkey login</strong> — You create or sign in with a passkey
                  (WebAuthn). Your wallet is tied to that passkey, so there are no seed phrases to save or lose.
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#faf9f6] border border-[#1a1a1a] flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#8b5cf6]" />
                </div>
                <div>
                  <strong className="text-[#1a1a1a]">Smart wallet</strong> — Lazorkit creates a Solana smart account
                  for you. You get a real wallet address, balances, and full control—all secured by your passkey.
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#faf9f6] border border-[#1a1a1a] flex items-center justify-center">
                  <Send className="h-5 w-5 text-[#8b5cf6]" />
                </div>
                <div>
                  <strong className="text-[#1a1a1a]">Gasless sends</strong> — When you send SOL or USDC, a paymaster
                  covers the transaction fees. You only need enough balance for the amount you’re sending.
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#faf9f6] border border-[#1a1a1a] flex items-center justify-center">
                  <History className="h-5 w-5 text-[#8b5cf6]" />
                </div>
                <div>
                  <strong className="text-[#1a1a1a]">Transaction history</strong> — Every send is recorded in the app
                  and linked to Solscan so you can verify it on-chain.
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* What you can do here */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8b5cf6] rounded-lg flex items-center justify-center">
                <ListChecks className="h-5 w-5 text-white" />
              </div>
              <span>What you can do in this app</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-[#1e293b] opacity-90">
            <p>• <strong className="text-[#1a1a1a]">Register</strong> — Create a new wallet with your passkey.</p>
            <p>• <strong className="text-[#1a1a1a]">Login</strong> — Sign in with the same passkey on any supported device.</p>
            <p>• <strong className="text-[#1a1a1a]">View balance</strong> — See your SOL and USDC balances (Solana Devnet).</p>
            <p>• <strong className="text-[#1a1a1a]">Transfer</strong> — Send SOL or USDC to any address, gaslessly.</p>
            <p>• <strong className="text-[#1a1a1a]">Profile</strong> — View your wallet address, QR code, and account details.</p>
          </CardContent>
        </Card>

        {/* Technology */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Technology</CardTitle>
          </CardHeader>
          <CardContent className="text-[#1e293b] opacity-90 leading-relaxed">
            <p>
              This demo runs on <strong className="text-[#1a1a1a]">Solana Devnet</strong> and is built with the{' '}
              <a
                href="https://lazorkit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8b5cf6] font-semibold hover:text-[#7c3aed] underline-offset-4 hover:underline"
              >
                Lazorkit SDK
              </a>
              , Next.js, and WebAuthn passkeys. It’s a reference for developers who want to build passkey-based,
              gasless Solana experiences.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/">
            <Button variant="accent" size="lg" className="gap-2">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[#1e293b] opacity-70">
            Built on Solana Devnet • Powered by{' '}
            <a
              href="https://lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8b5cf6] font-semibold hover:text-[#7c3aed] transition-colors"
            >
              Lazorkit SDK
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
