'use client';

import { cn } from '@/lib/utils';
import type { EmergencyPhrase, LanguageCode } from '@/types';
import { Volume2, Loader2 } from 'lucide-react';

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
  const severityIndicator = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-slate-400',
  };

  const sourceText = phrase.translations[sourceLang];
  const targetText = phrase.translations[targetLang];

  return (
    <button
      onClick={onPlay}
      disabled={isPlaying}
      className={cn(
        'w-full text-left bg-white dark:bg-slate-800 rounded-xl p-4 transition-all duration-200',
        'border border-slate-200 dark:border-slate-700',
        'hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm',
        'active:scale-[0.99]',
        'disabled:opacity-60 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:focus-visible:ring-primary-400'
      )}
      aria-label={`${sourceText} - ${targetText}`}
    >
      <div className="flex items-center gap-3">
        {/* Severity indicator */}
        <div className={cn('w-1 self-stretch rounded-full flex-shrink-0', severityIndicator[phrase.severity])} />

        <div className="flex-1 min-w-0">
          {/* Source language text */}
          <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">
            {sourceText}
          </p>

          {/* Target language text */}
          {targetText && targetText !== sourceText && (
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1 leading-snug">
              {targetText}
            </p>
          )}
        </div>

        {/* Play indicator */}
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
          isPlaying
            ? 'bg-primary-600 text-white'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        )}>
          {isPlaying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </div>
      </div>
    </button>
  );
}
