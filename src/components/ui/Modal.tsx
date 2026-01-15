/**
 * Modal Component
 * 
 * Simple dialog/modal for overlays and confirmations
 */

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Modal component for dialogs
 */
export const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  footer,
  size = 'md',
}: ModalProps) => {
  if (!isOpen) return null;

  const sizeClass =
    size === 'sm'
      ? 'max-w-sm'
      : size === 'lg'
        ? 'max-w-2xl'
        : 'max-w-md';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            'bg-white rounded-lg shadow-lg w-full',
            sizeClass
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1a1a1a] p-6">
            <h2 className="text-xl font-bold text-[#1a1a1a]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#1e293b] opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-[#1a1a1a] bg-[#faf9f6] p-6 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
