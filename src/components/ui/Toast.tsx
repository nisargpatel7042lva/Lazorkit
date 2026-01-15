/**
 * Toast Notification Component
 * 
 * Displays temporary notifications for success, error, warning, and info messages
 */

'use client';

import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { Toast as ToastType, ToastType as ToastTypeEnum } from '@/lib/lazorkit/types';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * Toast Context Type
 */
interface ToastContextType {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

/**
 * Create toast context
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to use toast context
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return {
    ...context,
    success: (message: string, description?: string) =>
      context.addToast({
        type: ToastTypeEnum.SUCCESS,
        message,
        description,
        duration: 3000,
      }),
    error: (message: string, description?: string) =>
      context.addToast({
        type: ToastTypeEnum.ERROR,
        message,
        description,
        duration: 5000,
      }),
    warning: (message: string, description?: string) =>
      context.addToast({
        type: ToastTypeEnum.WARNING,
        message,
        description,
        duration: 4000,
      }),
    info: (message: string, description?: string) =>
      context.addToast({
        type: ToastTypeEnum.INFO,
        message,
        description,
        duration: 3000,
      }),
  };
};

/**
 * Individual Toast Component
 */
const ToastItem = ({
  id,
  type,
  message,
  description,
  duration,
  onRemove,
}: ToastType & { onRemove: (id: string) => void }) => {
  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const iconColor =
    type === ToastTypeEnum.SUCCESS
      ? 'text-green-600'
      : type === ToastTypeEnum.ERROR
        ? 'text-red-600'
        : type === ToastTypeEnum.WARNING
          ? 'text-yellow-600'
          : 'text-blue-600';

  const bgColor =
    type === ToastTypeEnum.SUCCESS
      ? 'bg-green-50 border-green-200'
      : type === ToastTypeEnum.ERROR
        ? 'bg-red-50 border-red-200'
        : type === ToastTypeEnum.WARNING
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-blue-50 border-blue-200';

  const Icon =
    type === ToastTypeEnum.SUCCESS
      ? CheckCircle
      : type === ToastTypeEnum.ERROR
        ? AlertCircle
        : type === ToastTypeEnum.WARNING
          ? AlertTriangle
          : Info;

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-top-4',
        bgColor
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />

      <div className="flex-1">
        <p className="font-semibold text-slate-900">{message}</p>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>

      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Close notification"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

/**
 * Toast Provider Component
 * Wraps application and provides toast functionality
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback((toast: Omit<ToastType, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem {...toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
