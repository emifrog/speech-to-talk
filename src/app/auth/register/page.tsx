'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    // Validation
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const result = await register(email, password);
    if (result) {
      setSuccess(true);
      // Rediriger après 2 secondes
      setTimeout(() => {
        router.push('/translate');
      }, 2000);
    }
  };

  const displayError = localError || error;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="header-gradient px-6 pt-12 pb-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Inscription réussie !</h1>
              <p className="text-white/80 text-sm">Bienvenue sur Speech To Talk</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 rounded-t-3xl -mt-6 relative z-10 px-6 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Compte créé avec succès</h2>
            <p className="text-gray-600 mb-6">
              Vous allez être redirigé vers l&apos;application...
            </p>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="header-gradient px-6 pt-12 pb-16">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-10 h-10">
              <circle cx="55" cy="40" r="28" fill="#2E5DA8" stroke="#1A1A2E" strokeWidth="3"/>
              <circle cx="45" cy="40" r="3" fill="#1A1A2E"/>
              <circle cx="55" cy="40" r="3" fill="#1A1A2E"/>
              <circle cx="65" cy="40" r="3" fill="#1A1A2E"/>
              <circle cx="35" cy="60" r="18" fill="#E63946" stroke="#1A1A2E" strokeWidth="3"/>
              <circle cx="29" cy="60" r="2" fill="#1A1A2E"/>
              <circle cx="35" cy="60" r="2" fill="#1A1A2E"/>
              <circle cx="41" cy="60" r="2" fill="#1A1A2E"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Speech To <span className="text-red-200">Talk</span>
            </h1>
            <p className="text-white/80 text-sm">Créer un compte</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 rounded-t-3xl -mt-6 relative z-10 px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {displayError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{displayError}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Minimum 6 caractères</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Créer mon compte
          </Button>

          {/* Login link */}
          <p className="text-center text-gray-600">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>

          {/* Continue without account */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">ou</span>
            </div>
          </div>

          <Link href="/translate">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
            >
              Continuer sans compte
            </Button>
          </Link>
        </form>
      </div>
    </div>
  );
}
