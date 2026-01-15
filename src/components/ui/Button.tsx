/**
 * Button Component
 * 
 * Reusable button with multiple variants and states
 * Supports loading state, disabled state, and size variants
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-[#1e293b] text-white hover:bg-[#334155] focus-visible:ring-[#1e293b] border border-[#1e293b]',
        secondary: 'bg-[#faf9f6] text-[#1a1a1a] hover:bg-[#f5f5f0] focus-visible:ring-[#1e293b] border border-[#1e293b]',
        accent: 'bg-[#fbbf24] text-[#0a0a0a] hover:bg-[#fcd34d] focus-visible:ring-[#fbbf24] border border-[#fbbf24] font-semibold',
        purple: 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] focus-visible:ring-[#8b5cf6] border border-[#8b5cf6]',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
        outline: 'border border-[#1e293b] text-[#1e293b] hover:bg-[#faf9f6] focus-visible:ring-[#1e293b] bg-transparent',
        ghost: 'text-[#1a1a1a] hover:bg-[#f5f5f0] focus-visible:ring-[#1e293b]',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: false,
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  fullWidth?: ButtonVariants['fullWidth'];
  isLoading?: boolean;
  children?: React.ReactNode;
}

/**
 * Button component with loading state
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
