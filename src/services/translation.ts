import { createClient } from '@/lib/supabase/client';
import type { LanguageCode, TranslationResult, APIResponse } from '@/types';
import { generateId } from '@/lib/utils';
import {
  TranslateRequestSchema,
  TranslateResponseSchema,
  safeValidateData
} from '@/lib/validation';
import { getCachedTranslationWithOffline, saveToCacheWithOffline } from './translationCache';
import { retry, defaultIsRetryable } from '@/lib/retry';

// ===========================================
// Service de traduction
// ===========================================

interface TranslateTextParams {
  text: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  skipCache?: boolean; // Option pour forcer une nouvelle traduction
}

interface TranslateTextResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
  fromCache?: boolean; // Indique si la réponse vient du cache
}

/**
 * Traduit un texte via Supabase Edge Function (avec cache)
 */
export async function translateText(
  params: TranslateTextParams
): Promise<APIResponse<TranslateTextResponse>> {
  try {
    // Validate input parameters
    const validationResult = safeValidateData(TranslateRequestSchema, {
      text: params.text,
      sourceLang: params.sourceLang,
      targetLang: params.targetLang,
    });
    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationResult.error,
        },
      };
    }

    // 1. Vérifier le cache avec support offline (sauf si skipCache est true)
    if (!params.skipCache) {
      const cachedResult = await getCachedTranslationWithOffline(
        params.text,
        params.sourceLang,
        params.targetLang
      );

      if (cachedResult.success && cachedResult.data) {
        return {
          success: true,
          data: {
            translatedText: cachedResult.data.translatedText,
            fromCache: true,
          },
        };
      }
    }

    // Check if offline and no cache hit
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        error: {
          code: 'OFFLINE',
          message: 'Vous êtes hors ligne et cette traduction n\'est pas en cache.',
        },
      };
    }

    // 2. Pas de cache, appeler l'API de traduction avec retry
    const supabase = createClient();

    const { data, error } = await retry(
      async () => {
        const result = await supabase.functions.invoke('translate', {
          body: validationResult.data,
        });

        if (result.error) {
          const err = new Error(result.error.message);
          // Attach status if available for retry logic
          if ('status' in result.error) {
            (err as Error & { status?: number }).status = (result.error as { status?: number }).status;
          }
          throw err;
        }

        return result;
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        isRetryable: defaultIsRetryable,
        onRetry: (attempt, err, delay) => {
          console.warn(`Translation retry attempt ${attempt} after ${delay}ms:`, err);
        },
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    // Validate response data
    const responseValidation = safeValidateData(TranslateResponseSchema, data);
    if (!responseValidation.success) {
      throw new Error('Invalid response from translation service');
    }

    // 3. Sauvegarder dans le cache avec support offline (en arrière-plan, sans bloquer)
    saveToCacheWithOffline(
      params.text,
      responseValidation.data.translatedText,
      params.sourceLang,
      params.targetLang
    ).catch(err => console.warn('Cache save failed:', err));

    return {
      success: true,
      data: {
        translatedText: responseValidation.data.translatedText,
        detectedSourceLanguage: responseValidation.data.detectedSourceLanguage,
        fromCache: false,
      },
    };
  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      error: {
        code: 'TRANSLATION_ERROR',
        message: error instanceof Error ? error.message : 'Erreur de traduction',
      },
    };
  }
}

/**
 * Crée un résultat de traduction complet
 */
export function createTranslationResult(
  sourceText: string,
  translatedText: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): TranslationResult {
  return {
    id: generateId(),
    sourceText,
    translatedText,
    sourceLang,
    targetLang,
    timestamp: new Date(),
  };
}

/**
 * Sauvegarde une traduction dans l'historique (Supabase)
 */
export async function saveTranslationToHistory(
  result: TranslationResult,
  userId: string
): Promise<APIResponse<{ id: string }>> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('translations')
      .insert({
        user_id: userId,
        source_lang: result.sourceLang,
        target_lang: result.targetLang,
        source_text: result.sourceText,
        translated_text: result.translatedText,
        audio_url: result.audioUrl,
        is_favorite: false,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: { id: data.id },
    };
  } catch (error) {
    console.error('Save translation error:', error);
    return {
      success: false,
      error: {
        code: 'SAVE_ERROR',
        message: 'Erreur lors de la sauvegarde',
      },
    };
  }
}

/**
 * Récupère l'historique des traductions
 */
export async function getTranslationHistory(
  userId: string,
  limit = 50
): Promise<APIResponse<TranslationResult[]>> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    const results: TranslationResult[] = data.map((item) => ({
      id: item.id,
      sourceText: item.source_text,
      translatedText: item.translated_text,
      sourceLang: item.source_lang as LanguageCode,
      targetLang: item.target_lang as LanguageCode,
      audioUrl: item.audio_url || undefined,
      timestamp: new Date(item.created_at),
    }));

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error('Get history error:', error);
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Erreur lors de la récupération',
      },
    };
  }
}

/**
 * Toggle favori pour une traduction
 */
export async function toggleFavorite(
  translationId: string,
  isFavorite: boolean
): Promise<APIResponse<void>> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('translations')
      .update({ is_favorite: isFavorite })
      .eq('id', translationId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return {
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Erreur lors de la mise à jour',
      },
    };
  }
}
