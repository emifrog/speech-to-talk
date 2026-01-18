'use client';

import { BottomNavigation, LanguageSelector, MicrophoneButton, TranslationResult, UserMenu } from '@/components/features';
import { useTranslationFlow } from '@/hooks';

export default function TranslatePage() {
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

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header-gradient px-4 pt-safe pt-14 pb-6 safe-area-pt">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/95 backdrop-blur rounded-2xl flex items-center justify-center shadow-soft">
              <svg viewBox="0 0 100 100" className="w-9 h-9">
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
              <h1 className="text-xl font-bold text-white drop-shadow-sm">
                Speech To <span className="text-red-200">Talk</span>
              </h1>
              <p className="text-white/90 text-sm">Traduction vocale</p>
            </div>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Content */}
      <div className="content-area pt-6 pb-8 min-h-[calc(100vh-200px)] max-w-lg mx-auto">
        {/* Language Selector */}
        <div className="animate-fade-in mb-6">
          <LanguageSelector />
        </div>

        {/* Permission request */}
        {hasPermission === false && (
          <div className="mt-4 mb-6 p-5 bg-gradient-to-r from-warning-50 to-yellow-50 rounded-2xl text-center border-2 border-warning-200 animate-slide-up">
            <div className="w-14 h-14 bg-warning rounded-full flex items-center justify-center mx-auto mb-3 shadow-soft">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-warning-800 mb-4 font-semibold text-base">
              Accès au microphone requis
            </p>
            <p className="text-warning-700 mb-4 text-sm">
              Pour utiliser la traduction vocale, autorisez l&apos;accès au microphone.
            </p>
            <button
              onClick={requestPermission}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-warning to-warning-600 text-white rounded-xl font-semibold shadow-soft hover:shadow-medium transition-all active:scale-95 touch-manipulation"
            >
              Autoriser le microphone
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
            disabled={hasPermission === false}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-accent-50 rounded-2xl border-2 border-accent-200 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-soft">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-accent-700 font-semibold text-base mb-1">Erreur</p>
                <p className="text-accent-600 text-sm">{error}</p>
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

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
