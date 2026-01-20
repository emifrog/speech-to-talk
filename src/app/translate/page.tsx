'use client';

import { useState } from 'react';
import { BottomNavigation, LanguageSelector, MicrophoneButton, TranslationResult, UserMenu, ThemeToggle } from '@/components/features';
import { useTranslationFlow } from '@/hooks';

export default function TranslatePage() {
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const {
    audioState,
    duration,
    error,
    currentTranslation,
    startRecording,
    stopAndTranslate,
    playTranslation,
    isPlaying,
    hasPermission,
    requestPermission,
  } = useTranslationFlow();

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      await requestPermission();
    } finally {
      setIsRequestingPermission(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header-gradient safe-area-pt">
        <div className="flex items-center justify-between max-w-lg mx-auto relative z-10">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img
              src="/icons/logo.png"
              alt="Speech To Talk"
              className="w-14 h-14 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
            />
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Speech To Talk
              </h1>
              <p className="text-white/80 text-sm font-medium">Traduction vocale intelligente</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/*<UserMenu />*/}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-area min-h-[calc(100vh-200px)]">
        <div className="max-w-lg mx-auto">
          {/* Language Selector */}
          <div className="animate-fade-in mb-8">
            <LanguageSelector />
          </div>

          {/* Permission request - affiché si permission refusée OU jamais demandée */}
          {hasPermission !== true && (
            <div className="mt-4 mb-8 glass-card-gradient p-6 text-center animate-slide-up">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_4px_20px_rgba(251,191,36,0.4)]">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-slate-800 dark:text-white mb-2 font-semibold text-lg">
                {hasPermission === false ? 'Microphone non autorisé' : 'Accès au microphone requis'}
              </p>
              <p className="text-slate-600 dark:text-slate-300 mb-5 text-sm">
                {hasPermission === false
                  ? 'Veuillez autoriser l\'accès au microphone dans les paramètres de votre navigateur, puis réessayez.'
                  : 'Pour utiliser la traduction vocale, autorisez l\'accès au microphone.'
                }
              </p>
              <button
                onClick={handleRequestPermission}
                disabled={isRequestingPermission}
                className="w-full px-6 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl font-semibold shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.5)] transition-all duration-300 active:scale-95 touch-manipulation hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isRequestingPermission ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Demande en cours...
                  </span>
                ) : hasPermission === false ? (
                  'Réessayer'
                ) : (
                  'Autoriser le microphone'
                )}
              </button>
            </div>
          )}

          {/* Microphone Button */}
          <div className="flex flex-col items-center my-12">
            <MicrophoneButton
              audioState={audioState}
              duration={duration}
              onPress={startRecording}
              onRelease={stopAndTranslate}
              disabled={hasPermission === false}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-8 glass-card p-5 border-l-4 border-accent animate-slide-up">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(220,38,38,0.3)]">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-accent font-semibold text-base mb-1">Erreur</p>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Translation Result */}
          {currentTranslation && (
            <div className="animate-slide-up">
              <TranslationResult
                result={currentTranslation}
                onPlayAudio={playTranslation}
                isPlaying={isPlaying}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
