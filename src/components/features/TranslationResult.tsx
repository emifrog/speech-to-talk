'use client';

import { getLanguageByCode } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { TranslationResult as TranslationResultType } from '@/types';
import { useToast } from '@/components/ui';
import { Volume2, Heart, Copy, Check } from 'lucide-react';
import { useState } from 'react';

// ===========================================
// Translation Result Component
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
  const toast = useToast();

  const sourceLanguage = getLanguageByCode(result.sourceLang);
  const targetLanguage = getLanguageByCode(result.targetLang);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.translatedText);
      setCopied(true);
      toast.success('Traduction copiée');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le texte');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
      {/* Source text */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{sourceLanguage?.flag}</span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Transcription</p>
        </div>
        <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">{result.sourceText}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100 dark:bg-slate-700 mx-5" />

      {/* Translated text */}
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{targetLanguage?.flag}</span>
          <p className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wider">Traduction</p>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
          {result.translatedText}
        </p>
      </div>

      {/* Actions */}
      <div className="flex border-t border-slate-100 dark:border-slate-700">
        {/* Play button */}
        <button
          onClick={onPlayAudio}
          disabled={isPlaying}
          className={cn(
            'flex-1 py-3.5 flex items-center justify-center gap-2 font-medium text-sm',
            'transition-colors duration-200',
            'text-accent-600 dark:text-accent-400',
            'hover:bg-accent-50 dark:hover:bg-accent/10',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'active:scale-95',
            'border-r border-slate-100 dark:border-slate-700'
          )}
        >
          <Volume2 className={cn('w-5 h-5', isPlaying && 'animate-pulse')} />
          {isPlaying ? 'Lecture...' : 'Écouter'}
        </button>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={cn(
            'flex-1 py-3.5 flex items-center justify-center gap-2 font-medium text-sm',
            'transition-colors duration-200',
            'text-slate-600 dark:text-slate-400',
            'hover:bg-slate-50 dark:hover:bg-slate-700/50',
            'active:scale-95',
            onToggleFavorite && 'border-r border-slate-100 dark:border-slate-700'
          )}
          aria-label="Copier"
        >
          {copied ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
          {copied ? 'Copié' : 'Copier'}
        </button>

        {/* Favorite button */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={cn(
              'flex-1 py-3.5 flex items-center justify-center gap-2 font-medium text-sm',
              'transition-colors duration-200',
              isFavorite
                ? 'text-accent-500'
                : 'text-slate-600 dark:text-slate-400',
              'hover:bg-slate-50 dark:hover:bg-slate-700/50',
              'active:scale-95'
            )}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart
              className={cn(
                'w-5 h-5',
                isFavorite && 'fill-current'
              )}
            />
            Favori
          </button>
        )}
      </div>
    </div>
  );
}
