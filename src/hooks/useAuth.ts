'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signIn, signUp, signOut, getCurrentUser } from '@/services/auth';
import type { User } from '@/types';

// ===========================================
// Hook d'authentification
// ===========================================

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'utilisateur au montage
  useEffect(() => {
    const checkUser = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success && result.data?.user) {
          setUser(result.data.user);
        }
      } catch (err) {
        console.error('Check user error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Écouter les changements d'état d'authentification
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            createdAt: new Date(session.user.created_at),
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn({ email, password });

      if (!result.success) {
        setError(result.error?.message || 'Erreur de connexion');
        return false;
      }

      if (result.data?.user) {
        setUser(result.data.user);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp({ email, password });

      if (!result.success) {
        setError(result.error?.message || 'Erreur d\'inscription');
        return false;
      }

      if (result.data?.user) {
        setUser(result.data.user);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur d\'inscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de déconnexion');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    clearError,
  };
}
