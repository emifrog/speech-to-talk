'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/components/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ConnectionStatus } from '@/components/OfflineIndicator';

// ===========================================
// Providers wrapper pour l'application
// ===========================================

// Error handler for logging
function handleGlobalError(error: Error, errorInfo: React.ErrorInfo) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Global Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  // TODO: Send to error monitoring service
  // Example: Sentry.captureException(error, { extra: errorInfo });
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
