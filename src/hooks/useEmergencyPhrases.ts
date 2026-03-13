'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EMERGENCY_PHRASES } from '@/lib/constants';
import type { EmergencyCategory, EmergencyPhrase } from '@/types';

// ===========================================
// Hook : charge les phrases d'urgence depuis Supabase
// Fallback sur les constantes si la DB est inaccessible
// ===========================================

interface UseEmergencyPhrasesReturn {
  phrases: EmergencyPhrase[];
  isLoading: boolean;
  error: string | null;
}

export function useEmergencyPhrases(): UseEmergencyPhrasesReturn {
  const [phrases, setPhrases] = useState<EmergencyPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPhrases() {
      try {
        const supabase = createClient();
        const { data, error: dbError } = await supabase
          .from('emergency_phrases')
          .select('id, category, translations, icon, severity, display_order')
          .order('display_order');

        if (cancelled) return;

        if (dbError || !data || data.length === 0) {
          // Fallback sur les constantes locales
          setPhrases(EMERGENCY_PHRASES as EmergencyPhrase[]);
          return;
        }

        const mapped: EmergencyPhrase[] = data.map((row) => ({
          id: row.id,
          category: row.category as EmergencyCategory,
          translations: row.translations,
          icon: row.icon ?? undefined,
          severity: row.severity ?? 'medium',
          displayOrder: row.display_order,
        }));

        setPhrases(mapped);
      } catch {
        if (cancelled) return;
        // Fallback silencieux sur les constantes
        setPhrases(EMERGENCY_PHRASES as EmergencyPhrase[]);
        setError(null); // Pas d'erreur visible — le fallback fonctionne
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPhrases();
    return () => { cancelled = true; };
  }, []);

  return { phrases, isLoading, error };
}
