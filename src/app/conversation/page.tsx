'use client';

import { useRef, useEffect } from 'react';
import { BottomNavigation } from '@/components/features';
import { useConversation, useLanguages } from '@/lib/store';
import { useConversationFlow } from '@/hooks';
import { getLanguageByCode } from '@/lib/constants';
import { cn, formatDuration } from '@/lib/utils';
import { Settings, Mic, Square, Loader2, Volume2, Trash2, ArrowLeftRight } from 'lucide-react';

export default function ConversationPage() {
  const { messages } = useConversation();
  const { sourceLang, targetLang, swapLanguages } = useLanguages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    audioState,
    isRecording,
    isProcessing,
    isPlaying,
    duration,
    error,
    currentParticipant,
    setCurrentParticipant,
    startRecording,
    stopAndTranslate,
    cancelRecording,
    playMessage,
    clearConversation,
    hasPermission,
    requestPermission,
  } = useConversationFlow();

  const sourceLanguage = getLanguageByCode(sourceLang);
  const targetLanguage = getLanguageByCode(targetLang);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMicPress = async () => {
    if (hasPermission === false) {
      await requestPermission();
      return;
    }
    if (audioState === 'idle') {
      await startRecording();
    }
  };

  const handleMicRelease = async () => {
    if (isRecording) {
      await stopAndTranslate();
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header-gradient px-6 pt-12 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">💬 Conversation</h1>
            <p className="text-white/80 text-sm">Mode bilingue en temps réel</p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Effacer la conversation"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            )}
            <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-area flex flex-col min-h-[calc(100vh-180px)]">
        {/* Participants info */}
        <div className="flex justify-between items-center px-4 py-3 bg-gray-100 border-b">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentParticipant('A')}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all',
                currentParticipant === 'A' ? 'bg-primary ring-2 ring-primary ring-offset-2' : 'bg-primary/50'
              )}
            >
              A
            </button>
            <span className="text-sm text-gray-600">{sourceLanguage?.flag} {sourceLanguage?.nativeName}</span>
          </div>
          <button
            onClick={swapLanguages}
            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
            aria-label="Inverser les langues"
          >
            <ArrowLeftRight className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{targetLanguage?.nativeName} {targetLanguage?.flag}</span>
            <button
              onClick={() => setCurrentParticipant('B')}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all',
                currentParticipant === 'B' ? 'bg-accent ring-2 ring-accent ring-offset-2' : 'bg-accent/50'
              )}
            >
              B
            </button>
          </div>
        </div>

        {/* Permission request */}
        {hasPermission === false && (
          <div className="mx-4 mt-4 p-4 bg-yellow-50 rounded-xl text-center">
            <p className="text-yellow-800 mb-3 text-sm">
              L&apos;accès au microphone est nécessaire pour la conversation.
            </p>
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium text-sm"
            >
              Autoriser le microphone
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 rounded-xl text-red-700 text-center text-sm">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Aucun message</p>
              <p className="text-sm text-gray-400">
                Sélectionnez qui parle (A ou B) puis maintenez le micro
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  message.participant === 'B' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
                    message.participant === 'A' ? 'bg-primary' : 'bg-accent'
                  )}
                >
                  {message.participant}
                </div>
                <div className="flex-1 max-w-[80%]">
                  <div
                    className={cn(
                      'flex items-center gap-2 mb-1',
                      message.participant === 'B' && 'justify-end'
                    )}
                  >
                    <span className="text-xs font-medium text-gray-600">
                      Personne {message.participant}
                    </span>
                    <span className="text-lg">
                      {message.participant === 'A' ? sourceLanguage?.flag : targetLanguage?.flag}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'rounded-2xl p-4 relative group',
                      message.participant === 'A'
                        ? 'bg-white rounded-tl-none shadow-soft'
                        : 'bg-accent/10 rounded-tr-none'
                    )}
                  >
                    <p className="text-gray-800">&quot;{message.originalText}&quot;</p>
                    <p className="text-primary text-sm mt-2 pt-2 border-t border-gray-100">
                      {message.translatedText}
                    </p>
                    {/* Bouton replay */}
                    <button
                      onClick={() => playMessage(message)}
                      disabled={isPlaying}
                      className={cn(
                        'absolute -bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all',
                        message.participant === 'A' ? 'bg-primary' : 'bg-accent',
                        'opacity-0 group-hover:opacity-100',
                        isPlaying && 'opacity-50 cursor-not-allowed'
                      )}
                      aria-label="Rejouer l'audio"
                    >
                      <Volume2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Recording area */}
        <div className="px-4 pb-4">
          <div
            className={cn(
              'bg-white rounded-2xl p-4 shadow-lg border-2 transition-colors',
              isRecording ? 'border-accent' : 'border-gray-200'
            )}
          >
            <div className="flex items-center gap-4">
              {/* Indicateur du participant actuel */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
                  currentParticipant === 'A' ? 'bg-primary' : 'bg-accent'
                )}
              >
                {currentParticipant}
              </div>

              {/* Bouton micro */}
              <button
                onMouseDown={handleMicPress}
                onMouseUp={handleMicRelease}
                onMouseLeave={isRecording ? handleMicRelease : undefined}
                onTouchStart={handleMicPress}
                onTouchEnd={handleMicRelease}
                disabled={isProcessing || isPlaying || hasPermission === false}
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg',
                  isRecording && 'animate-recording bg-accent',
                  isProcessing && 'bg-gray-400',
                  isPlaying && 'bg-green-500',
                  audioState === 'idle' && (currentParticipant === 'A' ? 'bg-primary hover:bg-primary-600' : 'bg-accent hover:bg-accent-600'),
                  audioState === 'error' && 'bg-red-500',
                  (isProcessing || isPlaying || hasPermission === false) && 'opacity-50 cursor-not-allowed'
                )}
                aria-label={isRecording ? 'Relâchez pour arrêter' : 'Maintenez pour parler'}
              >
                {isProcessing ? (
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                ) : isRecording ? (
                  <Square className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-7 h-7 text-white" />
                )}
              </button>

              {/* Texte d'état */}
              <div className="flex-1">
                {isRecording ? (
                  <>
                    <p className="text-sm font-medium text-accent">
                      Enregistrement... {formatDuration(duration)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Relâchez pour traduire
                    </p>
                  </>
                ) : isProcessing ? (
                  <>
                    <p className="text-sm font-medium text-gray-600">Traduction en cours...</p>
                    <p className="text-xs text-gray-500">Veuillez patienter</p>
                  </>
                ) : isPlaying ? (
                  <>
                    <p className="text-sm font-medium text-green-600">Lecture audio...</p>
                    <p className="text-xs text-gray-500">Traduction vocale</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-800">
                      Maintenez pour parler ({currentParticipant === 'A' ? sourceLanguage?.nativeName : targetLanguage?.nativeName})
                    </p>
                    <p className="text-xs text-gray-500">
                      Traduction vers {currentParticipant === 'A' ? targetLanguage?.nativeName : sourceLanguage?.nativeName}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
