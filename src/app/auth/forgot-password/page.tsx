'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/services/auth';
import { Button } from '@/components/ui';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error?.message || 'Une erreur est survenue');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark flex flex-col">
      {/* Header */}
      <div className="header-gradient px-6 pt-12 pb-16">
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Mot de passe oublié
            </h1>
            <p className="text-white/80 text-sm">Réinitialisez votre mot de passe</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 dark:bg-dark rounded-t-3xl -mt-6 relative z-10 px-6 py-8">
        {isSuccess ? (
          // Success state
          <div className="text-center py-8 animate-fade-in">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              Email envoyé !
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-sm mx-auto">
              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
              Vérifiez votre boîte mail et suivez les instructions.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Vous n&apos;avez pas reçu l&apos;email ? Vérifiez vos spams ou{' '}
              <button
                onClick={() => setIsSuccess(false)}
                className="text-primary font-medium hover:underline"
              >
                réessayez
              </button>
            </p>
            <Link href="/auth/login">
              <Button variant="primary" size="lg" className="w-full max-w-xs mx-auto">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        ) : (
          // Form state
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            <div className="text-center mb-8">
              <p className="text-gray-600 dark:text-gray-300">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 animate-slide-up">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-light border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
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
              Envoyer le lien
            </Button>

            {/* Back to login */}
            <p className="text-center text-gray-600 dark:text-gray-400">
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
