/**
 * Input Component
 * 
 * Reusable text input with support for error states
 * and custom styling
 */

import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Input component with optional label, error, and helper text
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random()}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#1a1a1a] mb-2"
          >
            {label}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-[#1a1a1a] bg-white px-4 py-2 text-base placeholder:text-[#1e293b] placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus-visible:ring-red-600',
            className
          )}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-[#1e293b] opacity-70">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
