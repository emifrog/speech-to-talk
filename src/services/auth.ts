import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { APIResponse, User } from '@/types';
import {
  SignUpSchema,
  SignInSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
  safeValidateData,
} from '@/lib/validation';
import { captureError } from '@/lib/sentry';

/**
 * Transforme un User Supabase en notre type User personnalisé
 */
function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    createdAt: new Date(supabaseUser.created_at),
  };
}

// ===========================================
// Service d'authentification Supabase
// ===========================================

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends AuthCredentials {
  confirmPassword?: string;
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function signUp(
  credentials: SignUpCredentials
): Promise<APIResponse<{ user: User }>> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Erreur lors de la création du compte');
    }

    return {
      success: true,
      data: {
        user: mapSupabaseUser(data.user),
      },
    };
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), { tags: { service: 'auth', action: 'signUp' } });
    return {
      success: false,
      error: {
        code: 'SIGNUP_ERROR',
        message: error instanceof Error ? error.message : 'Erreur lors de l\'inscription',
      },
    };
  }
}

/**
 * Connexion d'un utilisateur existant
 */
export async function signIn(
  credentials: AuthCredentials
): Promise<APIResponse<{ user: User }>> {
  try {
    // Validate input
    const validationResult = safeValidateData(SignInSchema, credentials);
    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationResult.error,
        },
      };
    }

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validationResult.data.email,
      password: validationResult.data.password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Utilisateur non trouvé');
    }

    return {
      success: true,
      data: { user: mapSupabaseUser(data.user) },
    };
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), { tags: { service: 'auth', action: 'signIn' } });
    return {
      success: false,
      error: {
        code: 'SIGNIN_ERROR',
        message: error instanceof Error ? error.message : 'Erreur lors de la connexion',
      },
    };
  }
}

/**
 * Déconnexion de l'utilisateur
 */
export async function signOut(): Promise<APIResponse<void>> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), { tags: { service: 'auth', action: 'signOut' } });
    return {
      success: false,
      error: {
        code: 'SIGNOUT_ERROR',
        message: error instanceof Error ? error.message : 'Erreur lors de la déconnexion',
      },
    };
  }
}

/**
 * Récupérer l'utilisateur actuel
 */
export async function getCurrentUser(): Promise<APIResponse<{ user: User | null }>> {
  try {
    const supabase = createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    // Si pas de session, retourner null sans erreur (utilisateur non connecté)
    if (error && error.message === 'Auth session missing!') {
      return {
        success: true,
        data: { user: null },
      };
    }

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      return {
        success: true,
        data: { user: null },
      };
    }

    return {
      success: true,
      data: { user: mapSupabaseUser(user) },
    };
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), { tags: { service: 'auth', action: 'getCurrentUser' } });
    return {
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: error instanceof Error ? error.message : 'Erreur lors de la récupération de l\'utilisateur',
      },
    };
  }
}

/**
 * Demande de réinitialisation de mot de passe
 */
export async function resetPassword(email: string): Promise<APIResponse<void>> {
  try {
    // Validate input
    const validationResult = safeValidateData(ResetPasswordSchema, { email });
    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationResult.error,
        },
      };
    }

    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(validationResult.data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), { tags: { service: 'auth', action: 'resetPassword' } });
    return {
      success: false,
      error: {
        code: 'RESET_PASSWORD_ERROR',
        message: error instanceof Error ? error.message : 'Erreur lors de la réinitialisation',
      },
    };
  }
}

/**
 * Mettre à jour le mot de passe
 */
export async function updatePassword(newPassword: string): Promise<APIResponse<void>> {
  try {
    // Validate input
    const validationResult = safeValidateData(UpdatePasswordSchema, { 
      password: newPassword,
      confirmPassword: newPassword 
    });
    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationResult.error,
        },
      };
    }

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: validationResult.data.password,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), { tags: { service: 'auth', action: 'updatePassword' } });
    return {
      success: false,
      error: {
        code: 'UPDATE_PASSWORD_ERROR',
        message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
      },
    };
  }
}
