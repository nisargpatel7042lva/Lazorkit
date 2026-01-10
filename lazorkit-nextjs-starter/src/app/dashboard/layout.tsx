/**
 * Dashboard Layout
 * 
 * Main layout for authenticated users
 * Shows navigation, user menu, and main content area
 */

'use client';

import React from 'react';
import { useLazorkit } from '@/hooks/useLazorkit';
import { useWallet } from '@/hooks/useWallet';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { LogOut, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { disconnect, wallet } = useLazorkit();
  const { displayAddress } = useWallet();
  const router = useRouter();
  const { success } = useToast();

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await disconnect();
    success('Logged out successfully');
    router.push('/');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Home className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-900">Lazorkit Dashboard</h1>
              </Link>

              <div className="flex items-center gap-4">
                {/* User Info */}
                <div className="text-right">
                  {wallet?.accountName && (
                    <p className="text-sm font-medium text-slate-900">
                      {wallet.accountName}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 font-mono">
                    {displayAddress}
                  </p>
                </div>

                {/* Logout Button */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white mt-12 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-600">
            <p>Solana Devnet • Powered by Lazorkit SDK</p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
