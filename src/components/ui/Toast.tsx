'use client';

import { useEffect, useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle, Info, Loader2 } from 'lucide-react';

// ===========================================
// Types
// ===========================================

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => string;
  error: (message: string, duration?: number) => string;
  warning: (message: string, duration?: number) => string;
  info: (message: string, duration?: number) => string;
  loading: (message: string) => string;
  dismiss: (id: string) => void;
}

// ===========================================
// Context
// ===========================================

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ===========================================
// Toast Item Component
// ===========================================

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss (except loading)
    if (toast.type !== 'loading' && toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, toast.duration || 4000);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.type]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), 200);
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    loading: <Loader2 className="w-5 h-5 animate-spin" />,
  };

  const colors = {
    success: 'bg-success text-white',
    error: 'bg-accent text-white',
    warning: 'bg-warning text-white',
    info: 'bg-primary text-white',
    loading: 'bg-gray-800 text-white',
  };

  const bgColors = {
    success: 'bg-success-50 border-success-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-warning-50 border-warning-200',
    info: 'bg-primary-50 border-primary-200',
    loading: 'bg-gray-50 border-gray-200',
  };

  const textColors = {
    success: 'text-success-700',
    error: 'text-red-700',
    warning: 'text-warning-700',
    info: 'text-primary-700',
    loading: 'text-gray-700',
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border shadow-medium transition-all duration-200 max-w-sm w-full',
        bgColors[toast.type],
        isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      {/* Icon */}
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', colors[toast.type])}>
        {icons[toast.type]}
      </div>

      {/* Message */}
      <p className={cn('flex-1 text-sm font-medium', textColors[toast.type])}>
        {toast.message}
      </p>

      {/* Action button */}
      {toast.action && (
        <button
          onClick={() => {
            toast.action?.onClick();
            handleDismiss();
          }}
          className={cn('text-sm font-semibold underline', textColors[toast.type])}
        >
          {toast.action.label}
        </button>
      )}

      {/* Dismiss button (not for loading) */}
      {toast.type !== 'loading' && (
        <button
          onClick={handleDismiss}
          className={cn('p-1 rounded-full hover:bg-black/5 transition-colors', textColors[toast.type])}
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ===========================================
// Toast Container
// ===========================================

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed bottom-20 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
}

// ===========================================
// Toast Provider
// ===========================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'success', message, duration });
  }, [addToast]);

  const error = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'error', message, duration: duration || 5000 });
  }, [addToast]);

  const warning = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'warning', message, duration });
  }, [addToast]);

  const info = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'info', message, duration });
  }, [addToast]);

  const loading = useCallback((message: string) => {
    return addToast({ type: 'loading', message, duration: 0 });
  }, [addToast]);

  const dismiss = useCallback((id: string) => {
    removeToast(id);
  }, [removeToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
        loading,
        dismiss,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}
