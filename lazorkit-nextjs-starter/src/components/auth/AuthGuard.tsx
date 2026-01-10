/**
 * AuthGuard Component
 * 
 * Protected route wrapper that ensures user is authenticated
 * Redirects to login if not authenticated
 */

'use client';

import React from 'react';
import { useLazorkit } from '@/hooks/useLazorkit';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to protect routes that require authentication
 */
export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { isConnected, isConnecting } = useLazorkit();

  // Still checking connection status
  if (isConnecting) {
    return fallback || <LoadingSpinner fullScreen label="Loading wallet..." />;
  }

  // Not authenticated
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Not Authenticated</h1>
          <p className="text-slate-600 mb-6">Please log in to access this page</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Authenticated - render children
  return children;
};
