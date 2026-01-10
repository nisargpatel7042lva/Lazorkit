/**
 * Landing Page
 * 
 * Shows authentication options (login/register) for new and existing users
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useLazorkit } from '@/hooks/useLazorkit';
import { PasskeyLogin } from '@/components/auth/PasskeyLogin';
import { PasskeyRegister } from '@/components/auth/PasskeyRegister';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isConnected } = useLazorkit();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  /**
   * Redirect to dashboard if already connected
   */
  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            ⚡ Lazorkit Starter Kit
          </h1>
          <p className="text-slate-600 mt-2">
            Passkey-based Solana wallet with gasless transactions
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Wallet'}
            </h2>
            <p className="text-xl text-slate-600">
              {mode === 'login'
                ? 'Login with your passkey to access your Solana wallet'
                : 'Create a new passkey-based Solana wallet without seed phrases'}
            </p>
          </div>

          {/* Auth Component */}
          <div className="mb-8">
            {mode === 'login' ? (
              <PasskeyLogin
                onSuccess={handleAuthSuccess}
                onRegisterClick={() => setMode('register')}
                autoConnect={true}
              />
            ) : (
              <PasskeyRegister
                onSuccess={handleAuthSuccess}
              />
            )}
          </div>

          {/* Toggle Mode */}
          <div className="text-center">
            {mode === 'login' ? (
              <p className="text-slate-600">
                Don't have a wallet?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-slate-600">
                Already have a wallet?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-600 font-semibold hover:text-blue-700"
                >
                  Login here
                </button>
              </p>
            )}
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="font-semibold text-slate-900 mb-2">No Seed Phrases</h3>
              <p className="text-slate-600 text-sm">
                Passkeys are secured by your biometric or PIN authentication
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="font-semibold text-slate-900 mb-2">Gasless</h3>
              <p className="text-slate-600 text-sm">
                No SOL needed for gas - all fees are sponsored by the paymaster
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-semibold text-slate-900 mb-2">Web2 UX</h3>
              <p className="text-slate-600 text-sm">
                Same experience as traditional apps you already know
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-600">
            Built on Solana Devnet using{' '}
            <a
              href="https://lazorkit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Lazorkit
            </a>
            {' '}SDK
          </p>
        </div>
      </div>
    </div>
  );
}
