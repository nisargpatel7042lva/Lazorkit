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
import { LogOut, Home, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { disconnect, wallet } = useLazorkit();
  const { displayAddress } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const { success } = useToast();

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await disconnect();
    success('Logged out successfully');
    router.push('/');
  };

  /**
   * Check if a route is active
   */
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#faf9f6]">
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-[#1a1a1a] sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <Image
                    src="/image.png"
                    alt="SolPass Logo"
                    width={36}
                    height={36}
                    className="object-contain"
                    priority
                  />
                </div>
                <h1 className="text-xl font-bold text-[#1a1a1a]">SolPass</h1>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                <Link 
                  href="/dashboard" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/dashboard') && pathname === '/dashboard'
                      ? 'text-[#8b5cf6] bg-[#faf9f6]'
                      : 'text-[#1e293b] opacity-70 hover:text-[#8b5cf6] hover:opacity-100 hover:bg-[#faf9f6]'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/profile" 
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive('/dashboard/profile')
                      ? 'text-[#8b5cf6] bg-[#faf9f6]'
                      : 'text-[#1e293b] opacity-70 hover:text-[#8b5cf6] hover:opacity-100 hover:bg-[#faf9f6]'
                  }`}
                >
                  Profile
                </Link>
              </div>

              {/* User Account Button */}
              <div className="flex items-center gap-3">
                <Link href="/dashboard/profile">
                  <Button
                    variant="accent"
                    size="sm"
                    className="gap-2 border border-[#fbbf24] hover:shadow-md transition-shadow"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#1e293b] flex items-center justify-center">
                      <User className="h-3 w-3 text-[#fbbf24]" />
                    </div>
                    <span className="font-mono text-xs font-medium">
                      {displayAddress.substring(0, 6)}...{displayAddress.substring(displayAddress.length - 4)}
                    </span>
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 hover:bg-[#faf9f6]"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#1a1a1a] bg-white mt-16 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-[#1e293b] opacity-70">
            <p>Solana Devnet • Powered by Lazorkit SDK</p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
