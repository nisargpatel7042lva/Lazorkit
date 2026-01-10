/**
 * LoadingSpinner Component
 * 
 * Shows a loading state with animated spinner
 */

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  label?: string;
}

/**
 * Loading spinner component
 */
export const LoadingSpinner = ({
  size = 'md',
  fullScreen = false,
  label,
}: LoadingSpinnerProps) => {
  const sizeClass =
    size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-slate-300 border-t-blue-600',
          sizeClass
        )}
      />
      {label && <p className="text-sm text-slate-600">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Skeleton Loader (for content placeholders)
 */
export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'rounded-lg bg-slate-100 animate-pulse',
        className
      )}
    />
  );
};
