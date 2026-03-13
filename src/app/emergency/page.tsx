'use client';

import { useState } from 'react';
import { BottomNavigation, EmergencyPhraseCard, SettingsMenu } from '@/components/features';
import { SkeletonEmergencyCard, useToast } from '@/components/ui';
import { EMERGENCY_CATEGORIES } from '@/lib/constants';
import { useLanguages } from '@/lib/store';
import { useRequireAuth, useEmergencyPhrases } from '@/hooks';
import { cn } from '@/lib/utils';
import type { EmergencyCategory } from '@/types';

export default function EmergencyPage() {
  useRequireAuth();
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('medical');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { sourceLang, targetLang } = useLanguages();
  const toast = useToast();
  const { phrases, isLoading } = useEmergencyPhrases();

  const filteredPhrases = phrases
    .filter((phrase) => phrase.category === selectedCategory)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const handlePlay = async (phraseId: string, text: string) => {
    try {
      setPlayingId(phraseId);

      const { textToSpeech, playAudioFromBase64 } = await import('@/services/textToSpeech');

      const result = await textToSpeech({
        text,
        languageCode: targetLang,
      });

      if (result.success && result.data) {
        await playAudioFromBase64(result.data.audioContent);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast.error('Erreur de lecture audio');
    } finally {
      setPlayingId(null);
    }
  };

  return (
    <div className="page-container">
      {/* Header - Emergency variant */}
      <div className="header-gradient-emergency safe-area-pt">
        <div className="header-gradient-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/icons/logo.png"
                alt="Speech To Talk"
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h1 className="text-lg font-bold text-white">
                  Urgence
                </h1>
                <p className="text-white/70 text-xs">Phrases sapeurs-pompiers</p>
              </div>
            </div>
            <SettingsMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        <div className="content-area-inner">
          {/* Category tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            {EMERGENCY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95',
                  selectedCategory === category.id
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>

          {/* Emergency phrases */}
          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonEmergencyCard key={i} />
              ))
            ) : (
              filteredPhrases.map((phrase) => (
                <EmergencyPhraseCard
                  key={phrase.id}
                  phrase={{
                    id: phrase.id,
                    category: phrase.category,
                    translations: phrase.translations,
                    severity: phrase.severity,
                    displayOrder: phrase.displayOrder,
                  }}
                  sourceLang={sourceLang}
                  targetLang={targetLang}
                  onPlay={() => handlePlay(phrase.id, phrase.translations[targetLang])}
                  isPlaying={playingId === phrase.id}
                />
              ))
            )}
          </div>

          {/* Empty state */}
          {!isLoading && filteredPhrases.length === 0 && (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Aucune phrase dans cette catégorie</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
