'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ConnectionStatus } from '@/components/OfflineIndicator';
import { captureError, addBreadcrumb } from '@/lib/sentry';

// ===========================================
// Providers wrapper pour l'application
// ===========================================

// Error handler for logging and Sentry
function handleGlobalError(error: Error, errorInfo: React.ErrorInfo) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Global Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  // Send to Sentry
  captureError(error, {
    tags: {
      type: 'react-error-boundary',
    },
    extra: {
      componentStack: errorInfo.componentStack,
    },
    level: 'error',
  });
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary onError={handleGlobalError}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            {children}
            <ConnectionStatus />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
