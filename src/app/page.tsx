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
import Image from 'next/image';

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
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image
                src="/image.png"
                alt="SolPass Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              SolPass
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full">
          {/* Hero Section */}
          <div className="mb-10">
            <h2 className="text-5xl font-bold text-[#1a1a1a] mb-4 tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Your Wallet'}
            </h2>
            <p className="text-lg text-[#1e293b] opacity-70 leading-relaxed">
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
              <p className="text-[#1e293b] opacity-70">
                Don't have a wallet?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-[#8b5cf6] font-semibold hover:text-[#7c3aed] transition-colors underline-offset-4 hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-[#1e293b] opacity-70">
                Already have a wallet?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-[#8b5cf6] font-semibold hover:text-[#7c3aed] transition-colors underline-offset-4 hover:underline"
                >
                  Login here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1a1a1a] bg-white py-6">
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
      </div>
    </div>
  );
}
