'use client';

import { useState } from 'react';
import { BottomNavigation } from '@/components/features';
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simuler l'envoi (à remplacer par une vraie API)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header-gradient safe-area-pt">
        <div className="flex items-center justify-between max-w-lg mx-auto relative z-10">
          <div className="flex items-center gap-4">
            <Link
              href="/translate"
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-xl border border-white/30 hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Contact
              </h1>
              <p className="text-white/80 text-sm font-medium">Nous contacter</p>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30">
            <Mail className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-area min-h-[calc(100vh-200px)]">
        <div className="max-w-lg mx-auto">
          {isSubmitted ? (
            // Message de confirmation
            <div className="glass-card-gradient p-8 text-center animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(16,185,129,0.4)]">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                Message envoyé !
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Merci de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            // Formulaire de contact
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
              <div className="glass-card-gradient p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                  Envoyez-nous un message
                </h2>

                {/* Nom */}
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-lighter text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="Votre nom"
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-lighter text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                    placeholder="votre@email.com"
                  />
                </div>

                {/* Sujet */}
                <div className="mb-4">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-lighter text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="bug">Signaler un bug</option>
                    <option value="feature">Suggérer une fonctionnalité</option>
                    <option value="question">Question générale</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-dark-lighter text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>

                {/* Bouton d'envoi */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_30px_rgba(37,99,235,0.5)] transition-all duration-300 active:scale-95 touch-manipulation hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </div>

              {/* Informations de contact */}
              <div className="glass-card p-6">
                <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
                  Autres moyens de contact
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="text-sm">support@speechtotalk.app</span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
