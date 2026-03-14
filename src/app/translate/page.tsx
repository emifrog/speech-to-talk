'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BottomNavigation, LanguageSelector, MicrophoneButton, TranslationResult, SettingsMenu } from '@/components/features';
import { SkeletonLanguageSelector, SkeletonMicrophoneButton } from '@/components/ui';
import { useTranslationFlow, useRequireAuth } from '@/hooks';

export default function TranslatePage() {
  const { isLoading } = useRequireAuth();
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

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="header-gradient safe-area-pt">
          <div className="header-gradient-content h-16" />
        </div>
        <div className="content-area">
          <div className="content-area-inner space-y-6">
            <SkeletonLanguageSelector />
            <div className="flex flex-col items-center my-10">
              <SkeletonMicrophoneButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      {/* Header - compact */}
      <div className="header-gradient safe-area-pt">
        <div className="header-gradient-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/logo.png"
                alt="Speech To Talk"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h1 className="text-lg font-bold text-white">
                  Speech To Talk
                </h1>
                <p className="text-white/70 text-xs">Traduction vocale</p>
              </div>
            </div>
            <SettingsMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        <div className="content-area-inner">
          {/* Language Selector */}
          <div className="animate-fade-in mb-6">
            <LanguageSelector />
          </div>

          {/* Permission request */}
          {hasPermission !== true && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 text-center animate-slide-up">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-slate-900 dark:text-white mb-1 font-semibold">
                {hasPermission === false ? 'Microphone non autorisé' : 'Accès au microphone requis'}
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                {hasPermission === false
                  ? 'Autorisez l\'accès dans les paramètres du navigateur.'
                  : 'Pour utiliser la traduction vocale.'
                }
              </p>
              <button
                onClick={handleRequestPermission}
                disabled={isRequestingPermission}
                className="w-full px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors duration-200 active:scale-95 disabled:opacity-70"
              >
                {isRequestingPermission ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Demande en cours...
                  </span>
                ) : hasPermission === false ? 'Réessayer' : 'Autoriser le microphone'}
              </button>
            </div>
          )}

          {/* Microphone Button */}
          <div className="flex flex-col items-center my-10">
            <MicrophoneButton
              audioState={audioState}
              duration={duration}
              onPress={startRecording}
              onRelease={stopAndTranslate}
              disabled={false}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 animate-slide-up">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 dark:text-red-300 font-medium text-sm">Erreur</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-0.5">{error}</p>
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
