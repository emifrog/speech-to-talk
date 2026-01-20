'use client';

import { Card, CardContent } from '@/components/ui';
import { getLanguageByCode } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { TranslationResult as TranslationResultType } from '@/types';
import { Volume2, Heart, Copy, Check } from 'lucide-react';
import { useState } from 'react';

// ===========================================
// Translation Result Component - Glassmorphism
// ===========================================

interface TranslationResultProps {
  result: TranslationResultType;
  onPlayAudio?: () => void;
  onToggleFavorite?: () => void;
  isPlaying?: boolean;
  isFavorite?: boolean;
}

export function TranslationResult({
  result,
  onPlayAudio,
  onToggleFavorite,
  isPlaying = false,
  isFavorite = false,
}: TranslationResultProps) {
  const [copied, setCopied] = useState(false);

  const sourceLanguage = getLanguageByCode(result.sourceLang);
  const targetLanguage = getLanguageByCode(result.targetLang);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="space-y-5">
        {/* Source text */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{sourceLanguage?.flag}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Transcription</p>
          </div>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{result.sourceText}</p>
        </div>

        {/* Gradient Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

        {/* Translated text */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{targetLanguage?.flag}</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Traduction</p>
          </div>
          <p className="text-xl font-semibold text-gradient leading-relaxed">
            {result.translatedText}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {/* Play button */}
          <button
            onClick={onPlayAudio}
            disabled={isPlaying}
            className={cn(
              'flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold',
              'transition-all duration-300',
              'bg-accent/10',
              'text-accent dark:text-accent-400',
              'border border-accent/20 dark:border-accent/30',
              'hover:bg-accent/20',
              'hover:shadow-[0_4px_16px_rgba(220,38,38,0.2)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'active:scale-95'
            )}
          >
            <Volume2 className={cn('w-5 h-5', isPlaying && 'animate-pulse')} />
            {isPlaying ? 'Lecture...' : 'Écouter'}
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className={cn(
              'w-14 rounded-2xl flex items-center justify-center',
              'transition-all duration-300',
              'bg-white/60 dark:bg-dark-lighter/60',
              'backdrop-blur-sm',
              'border border-white/50 dark:border-white/10',
              'hover:bg-white dark:hover:bg-dark-lighter',
              'hover:shadow-glass',
              'active:scale-95'
            )}
            aria-label="Copier"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-500" />
            ) : (
              <Copy className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            )}
          </button>

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={cn(
                'w-14 rounded-2xl flex items-center justify-center',
                'transition-all duration-300',
                'bg-white/60 dark:bg-dark-lighter/60',
                'backdrop-blur-sm',
                'border border-white/50 dark:border-white/10',
                'hover:bg-white dark:hover:bg-dark-lighter',
                'hover:shadow-glass',
                'active:scale-95'
              )}
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart
                className={cn(
                  'w-5 h-5 transition-colors duration-300',
                  isFavorite ? 'text-accent fill-accent' : 'text-slate-400 dark:text-slate-500'
                )}
              />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
