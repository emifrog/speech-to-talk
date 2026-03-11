'use client';

import { useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook de protection des routes côté client.
 * Redirige vers /auth/login si l'utilisateur n'est pas connecté.
 */
export function useRequireAuth() {
  const { user, isLoading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }, [isLoading, isAuthenticated]);

  return { user, isLoading, isAuthenticated };
}
