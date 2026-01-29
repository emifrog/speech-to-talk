'use client';

import { useState } from 'react';
import { BottomNavigation, EmergencyPhraseCard, SettingsMenu } from '@/components/features';
import { EMERGENCY_CATEGORIES, EMERGENCY_PHRASES } from '@/lib/constants';
import { useLanguages } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { EmergencyCategory } from '@/types';

export default function EmergencyPage() {
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('pain');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const { sourceLang, targetLang } = useLanguages();

  const filteredPhrases = EMERGENCY_PHRASES
    .filter((phrase) => phrase.category === selectedCategory)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const handlePlay = async (phraseId: string, text: string) => {
    try {
      setPlayingId(phraseId);

      // Lazy load TTS service only when needed
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
    } finally {
      setPlayingId(null);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header-gradient-emergency safe-area-pt">
        <div className="flex items-center justify-between max-w-lg mx-auto relative z-10">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img
              src="/icons/logo.png"
              alt="Speech To Talk"
              className="w-14 h-14 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
            />
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Urgence
              </h1>
              <p className="text-white/80 text-sm font-medium">Phrases essentielles</p>
            </div>
          </div>
          <SettingsMenu />
        </div>
      </div>

      {/* Content */}
      <div className="content-area pt-6 pb-8 min-h-[calc(100vh-200px)] max-w-lg mx-auto">
        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 px-1 scrollbar-hide animate-slide-in-right">
          {EMERGENCY_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shadow-soft active:scale-95',
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-accent to-accent-600 text-white shadow-glow-accent'
                  : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-medium'
              )}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>

        {/* Emergency phrases */}
        <div className="space-y-3">
          {filteredPhrases.map((phrase) => (
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
          ))}
        </div>

        {/* Empty state */}
        {filteredPhrases.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Aucune phrase dans cette catégorie</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
