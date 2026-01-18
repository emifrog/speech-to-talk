import { createClient } from '@/lib/supabase/client';
import type { LanguageCode, APIResponse } from '@/types';
import { sha256 } from '@/lib/utils';

// ===========================================
// Service de cache des traductions
// ===========================================

interface CachedTranslation {
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  usageCount: number;
}

// Cache en mémoire pour les traductions fréquentes (session)
const memoryCache = new Map<string, CachedTranslation>();
const MAX_MEMORY_CACHE_SIZE = 100;

/**
 * Génère une clé de cache unique
 */
function getCacheKey(text: string, sourceLang: LanguageCode, targetLang: LanguageCode): string {
  return `${sourceLang}:${targetLang}:${text}`;
}

/**
 * Vérifie d'abord le cache mémoire
 */
export function getFromMemoryCache(
  text: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): CachedTranslation | null {
  const key = getCacheKey(text, sourceLang, targetLang);
  return memoryCache.get(key) || null;
}

/**
 * Ajoute au cache mémoire
 */
export function addToMemoryCache(
  text: string,
  translatedText: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): void {
  const key = getCacheKey(text, sourceLang, targetLang);

  // Limiter la taille du cache mémoire
  if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) {
      memoryCache.delete(firstKey);
    }
  }

  memoryCache.set(key, {
    translatedText,
    sourceLang,
    targetLang,
    usageCount: 1,
  });
}

/**
 * Recherche une traduction dans le cache de la base de données
 */
export async function getFromDatabaseCache(
  text: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): Promise<APIResponse<CachedTranslation | null>> {
  try {
    const supabase = createClient();
    const textHash = await sha256(text.toLowerCase().trim());

    const { data, error } = await supabase
      .from('translation_cache')
      .select('translated_text, source_lang, target_lang, usage_count')
      .eq('source_lang', sourceLang)
      .eq('target_lang', targetLang)
      .eq('source_text_hash', textHash)
      .single();

    if (error) {
      // PGRST116 = pas de résultat trouvé, ce n'est pas une erreur
      if (error.code === 'PGRST116') {
        return { success: true, data: null };
      }
      throw error;
    }

    if (!data) {
      return { success: true, data: null };
    }

    // Mettre à jour le compteur d'utilisation et la date de dernière utilisation
    await supabase
      .from('translation_cache')
      .update({
        usage_count: data.usage_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('source_lang', sourceLang)
      .eq('target_lang', targetLang)
      .eq('source_text_hash', textHash);

    // Ajouter au cache mémoire pour les prochaines requêtes
    addToMemoryCache(text, data.translated_text, sourceLang, targetLang);

    return {
      success: true,
      data: {
        translatedText: data.translated_text,
        sourceLang: data.source_lang as LanguageCode,
        targetLang: data.target_lang as LanguageCode,
        usageCount: data.usage_count,
      },
    };
  } catch (error) {
    console.error('Cache lookup error:', error);
    return {
      success: false,
      error: {
        code: 'CACHE_LOOKUP_ERROR',
        message: 'Erreur lors de la recherche dans le cache',
      },
    };
  }
}

/**
 * Sauvegarde une traduction dans le cache de la base de données
 */
export async function saveToCache(
  text: string,
  translatedText: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): Promise<APIResponse<void>> {
  try {
    const supabase = createClient();
    const textHash = await sha256(text.toLowerCase().trim());

    // Upsert pour éviter les doublons
    const { error } = await supabase
      .from('translation_cache')
      .upsert(
        {
          source_lang: sourceLang,
          target_lang: targetLang,
          source_text_hash: textHash,
          source_text: text,
          translated_text: translatedText,
          usage_count: 1,
          last_used_at: new Date().toISOString(),
        },
        {
          onConflict: 'source_lang,target_lang,source_text_hash',
          ignoreDuplicates: true,
        }
      );

    if (error) {
      // Ignorer l'erreur de doublon
      if (!error.message.includes('duplicate')) {
        throw error;
      }
    }

    // Ajouter au cache mémoire
    addToMemoryCache(text, translatedText, sourceLang, targetLang);

    return { success: true };
  } catch (error) {
    console.error('Cache save error:', error);
    // Ne pas retourner d'erreur - le cache est optionnel
    return { success: true };
  }
}

/**
 * Recherche une traduction (mémoire d'abord, puis base de données)
 */
export async function getCachedTranslation(
  text: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): Promise<APIResponse<CachedTranslation | null>> {
  // 1. Vérifier le cache mémoire
  const memoryCached = getFromMemoryCache(text, sourceLang, targetLang);
  if (memoryCached) {
    return { success: true, data: memoryCached };
  }

  // 2. Vérifier le cache de la base de données
  return getFromDatabaseCache(text, sourceLang, targetLang);
}

/**
 * Vide le cache mémoire (utile pour les tests)
 */
export function clearMemoryCache(): void {
  memoryCache.clear();
}

/**
 * Statistiques du cache mémoire
 */
export function getMemoryCacheStats(): { size: number; maxSize: number } {
  return {
    size: memoryCache.size,
    maxSize: MAX_MEMORY_CACHE_SIZE,
  };
}
