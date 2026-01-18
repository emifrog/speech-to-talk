'use client';

import { Card, CardContent } from '@/components/ui';
import { getLanguageByCode } from '@/lib/constants';
import type { TranslationResult as TranslationResultType } from '@/types';
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

  const sourceLanguage = getLanguageByCode(result.sourceLang);
  const targetLanguage = getLanguageByCode(result.targetLang);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="animate-fade-in">
      <CardContent className="space-y-4">
        {/* Source text */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{sourceLanguage?.flag}</span>
            <p className="text-xs text-gray-400">Transcription</p>
          </div>
          <p className="text-gray-700">{result.sourceText}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Translated text */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{targetLanguage?.flag}</span>
            <p className="text-xs text-gray-400">Traduction</p>
          </div>
          <p className="text-lg font-medium text-primary">
            {result.translatedText}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {/* Play button */}
          <button
            onClick={onPlayAudio}
            disabled={isPlaying}
            className="flex-1 bg-accent/10 text-accent py-3 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-accent/20 transition-colors disabled:opacity-50"
          >
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
            {isPlaying ? 'Lecture...' : 'Écouter'}
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="w-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Copier"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {/* Favorite button */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className="w-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'text-accent fill-accent' : 'text-gray-400'}`}
              />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
