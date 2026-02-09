'use client';

import { cn } from '@/lib/utils';
import type { EmergencyPhrase, LanguageCode } from '@/types';
import { Volume2 } from 'lucide-react';

// ===========================================
// Emergency Phrase Card Component
// ===========================================

interface EmergencyPhraseCardProps {
  phrase: EmergencyPhrase;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  onPlay?: () => void;
  isPlaying?: boolean;
}

export function EmergencyPhraseCard({
  phrase,
  sourceLang,
  targetLang,
  onPlay,
  isPlaying = false,
}: EmergencyPhraseCardProps) {
  const severityColors = {
    critical: 'border-l-red-500 dark:border-l-red-400',
    high: 'border-l-orange-500 dark:border-l-orange-400',
    medium: 'border-l-blue-400 dark:border-l-blue-400',
    low: 'border-l-gray-400 dark:border-l-gray-500',
  };

  const sourceText = phrase.translations[sourceLang];
  const targetText = phrase.translations[targetLang];

  return (
    <button
      onClick={onPlay}
      disabled={isPlaying}
      className={cn(
        'w-full text-left bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border-l-4 transition-all duration-200',
        'hover:shadow-medium hover:scale-[1.01] active:scale-[0.99]',
        'disabled:opacity-60 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-400',
        severityColors[phrase.severity]
      )}
      aria-label={`${sourceText} - ${targetText}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {/* Source language text (French - what the firefighter says) */}
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-snug">
            {sourceText}
          </p>

          {/* Target language text */}
          {targetText && targetText !== sourceText && (
            <p className="text-xs text-primary dark:text-primary-400 font-medium mt-1 leading-snug">
              {targetText}
            </p>
          )}
        </div>

        {/* Play indicator */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
          isPlaying
            ? 'bg-primary text-white'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        )}>
          <Volume2 className={cn('w-4 h-4', isPlaying && 'animate-pulse')} />
        </div>
      </div>
    </button>
  );
}
