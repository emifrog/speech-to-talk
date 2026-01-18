'use client';

import { cn } from '@/lib/utils';
import type { EmergencyPhrase, LanguageCode } from '@/types';
import { Volume2, Heart } from 'lucide-react';

// ===========================================
// Emergency Phrase Card Component
// ===========================================

interface EmergencyPhraseCardProps {
  phrase: EmergencyPhrase;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  onPlay?: () => void;
  onToggleFavorite?: () => void;
  isPlaying?: boolean;
  isFavorite?: boolean;
}

export function EmergencyPhraseCard({
  phrase,
  sourceLang,
  targetLang,
  onPlay,
  onToggleFavorite,
  isPlaying = false,
  isFavorite = false,
}: EmergencyPhraseCardProps) {
  const severityColors = {
    critical: 'border-l-accent',
    high: 'border-l-orange-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-gray-400',
  };

  const severityButtonColors = {
    critical: 'bg-accent/10 text-accent hover:bg-accent/20',
    high: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20',
    low: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
  };

  const sourceText = phrase.translations[sourceLang];
  const targetText = phrase.translations[targetLang];

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-4 shadow-soft border-l-4 transition-all duration-300 hover:shadow-medium hover:scale-[1.02] animate-fade-in',
        severityColors[phrase.severity]
      )}
    >
      {/* Icon badge */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{phrase.icon}</span>
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all active:scale-90"
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-all',
                isFavorite ? 'text-accent fill-accent scale-110' : 'text-gray-400'
              )}
            />
          </button>
        )}
      </div>

      {/* Source language text */}
      <p className="font-semibold text-gray-900 mb-1">{sourceText}</p>

      {/* Target language text */}
      <p className="text-sm text-primary font-medium">{targetText}</p>

      {/* Play button */}
      <button
        onClick={onPlay}
        disabled={isPlaying}
        className={cn(
          'w-full mt-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95',
          severityButtonColors[phrase.severity]
        )}
      >
        <Volume2 className={cn('w-4 h-4', isPlaying && 'animate-pulse')} />
        {isPlaying ? 'Lecture en cours...' : 'Écouter la traduction'}
      </button>
    </div>
  );
}
