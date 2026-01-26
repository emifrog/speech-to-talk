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

interface IndexedDBCacheEntry {
  key: string;
  text: string;
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  timestamp: number;
  usageCount: number;
}

// Cache en mémoire pour les traductions fréquentes (session)
const memoryCache = new Map<string, CachedTranslation>();
const MAX_MEMORY_CACHE_SIZE = 100;

// IndexedDB configuration
const DB_NAME = 'SpeechToTalkCache';
const DB_VERSION = 1;
const STORE_NAME = 'translations';
const MAX_OFFLINE_CACHE_SIZE = 500; // Maximum entries in IndexedDB

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

// ===========================================
// IndexedDB Offline Cache
// ===========================================

let dbInstance: IDBDatabase | null = null;

/**
 * Open or get the IndexedDB database
 */
async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('usageCount', 'usageCount', { unique: false });
      }
    };
  });
}

/**
 * Save translation to IndexedDB for offline access
 */
export async function saveToOfflineCache(
  text: string,
  translatedText: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): Promise<void> {
  try {
    const db = await getDB();
    const key = getCacheKey(text, sourceLang, targetLang);

    const entry: IndexedDBCacheEntry = {
      key,
      text,
      translatedText,
      sourceLang,
      targetLang,
      timestamp: Date.now(),
      usageCount: 1,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put(entry);

      request.onerror = () => reject(new Error('Failed to save to IndexedDB'));
      request.onsuccess = () => {
        // Clean up old entries if cache is too large
        cleanupOfflineCache().catch(console.warn);
        resolve();
      };
    });
  } catch (error) {
    console.warn('Failed to save to offline cache:', error);
  }
}

/**
 * Get translation from IndexedDB offline cache
 */
export async function getFromOfflineCache(
  text: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): Promise<CachedTranslation | null> {
  try {
    const db = await getDB();
    const key = getCacheKey(text, sourceLang, targetLang);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.get(key);

      request.onerror = () => reject(new Error('Failed to read from IndexedDB'));
      request.onsuccess = () => {
        const entry = request.result as IndexedDBCacheEntry | undefined;

        if (entry) {
          // Update usage count
          entry.usageCount += 1;
          entry.timestamp = Date.now();
          store.put(entry);

          resolve({
            translatedText: entry.translatedText,
            sourceLang: entry.sourceLang,
            targetLang: entry.targetLang,
            usageCount: entry.usageCount,
          });
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.warn('Failed to get from offline cache:', error);
    return null;
  }
}

/**
 * Clean up old entries from IndexedDB to maintain cache size
 */
async function cleanupOfflineCache(): Promise<void> {
  try {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const countRequest = store.count();

      countRequest.onsuccess = () => {
        const count = countRequest.result;

        if (count > MAX_OFFLINE_CACHE_SIZE) {
          // Delete oldest entries
          const entriesToDelete = count - MAX_OFFLINE_CACHE_SIZE + 50; // Delete 50 extra for buffer
          const index = store.index('timestamp');
          const cursorRequest = index.openCursor();
          let deleted = 0;

          cursorRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;

            if (cursor && deleted < entriesToDelete) {
              store.delete(cursor.primaryKey);
              deleted++;
              cursor.continue();
            } else {
              resolve();
            }
          };

          cursorRequest.onerror = () => reject(new Error('Failed to cleanup cache'));
        } else {
          resolve();
        }
      };

      countRequest.onerror = () => reject(new Error('Failed to count cache entries'));
    });
  } catch (error) {
    console.warn('Failed to cleanup offline cache:', error);
  }
}

/**
 * Clear the entire offline cache
 */
export async function clearOfflineCache(): Promise<void> {
  try {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.clear();

      request.onerror = () => reject(new Error('Failed to clear IndexedDB'));
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Failed to clear offline cache:', error);
  }
}

/**
 * Get offline cache statistics
 */
export async function getOfflineCacheStats(): Promise<{ count: number; maxSize: number }> {
  try {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.count();

      request.onerror = () => reject(new Error('Failed to count cache'));
      request.onsuccess = () => {
        resolve({
          count: request.result,
          maxSize: MAX_OFFLINE_CACHE_SIZE,
        });
      };
    });
  } catch (error) {
    return { count: 0, maxSize: MAX_OFFLINE_CACHE_SIZE };
  }
}

/**
 * Check if the app is online
 */
function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Enhanced cache lookup with offline support
 * Priority: Memory -> IndexedDB -> Database
 */
export async function getCachedTranslationWithOffline(
  text: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): Promise<APIResponse<CachedTranslation | null>> {
  // 1. Check memory cache
  const memoryCached = getFromMemoryCache(text, sourceLang, targetLang);
  if (memoryCached) {
    return { success: true, data: memoryCached };
  }

  // 2. Check IndexedDB cache (works offline)
  const offlineCached = await getFromOfflineCache(text, sourceLang, targetLang);
  if (offlineCached) {
    // Add to memory cache for faster future access
    addToMemoryCache(text, offlineCached.translatedText, sourceLang, targetLang);
    return { success: true, data: offlineCached };
  }

  // 3. If online, check database cache
  if (isOnline()) {
    return getFromDatabaseCache(text, sourceLang, targetLang);
  }

  // Offline and not in cache
  return { success: true, data: null };
}

/**
 * Enhanced save with offline support
 */
export async function saveToCacheWithOffline(
  text: string,
  translatedText: string,
  sourceLang: LanguageCode,
  targetLang: LanguageCode
): Promise<APIResponse<void>> {
  // Always save to IndexedDB for offline access
  saveToOfflineCache(text, translatedText, sourceLang, targetLang).catch(console.warn);

  // Add to memory cache
  addToMemoryCache(text, translatedText, sourceLang, targetLang);

  // If online, also save to database
  if (isOnline()) {
    return saveToCache(text, translatedText, sourceLang, targetLang);
  }

  return { success: true };
}
