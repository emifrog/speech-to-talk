import { createClient } from '@/lib/supabase/client';
import type { LanguageCode, OCRResult, APIResponse } from '@/types';
import { retry, defaultIsRetryable } from '@/lib/retry';

// ===========================================
// Service OCR (Google Cloud Vision)
// ===========================================

interface OCRParams {
  imageContent: string; // Base64 encoded image (sans préfixe data:image/...)
  languageHints?: LanguageCode[];
}

/**
 * Extrait le texte d'une image via Google Cloud Vision
 */
export async function extractTextFromImage(
  params: OCRParams
): Promise<APIResponse<OCRResult>> {
  try {
    const supabase = createClient();

    const { data, error } = await retry(
      async () => {
        const result = await supabase.functions.invoke('ocr', {
          body: {
            imageContent: params.imageContent,
            languageHints: params.languageHints || ['en', 'it', 'es', 'ru'],
          },
        });

        if (result.error) {
          const err = new Error(result.error.message);
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
          console.warn(`OCR retry attempt ${attempt} after ${delay}ms:`, err);
        },
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    // Vérifier si du texte a été détecté
    if (data.error && data.text === '') {
      return {
        success: true,
        data: {
          text: '',
          confidence: 0,
          detectedLanguage: undefined,
          boundingBoxes: [],
        },
      };
    }

    // Mapper la langue détectée vers LanguageCode si possible
    const detectedLanguage = mapToLanguageCode(data.detectedLanguage);

    return {
      success: true,
      data: {
        text: data.text,
        confidence: data.confidence,
        detectedLanguage,
        boundingBoxes: data.boundingBoxes,
      },
    };
  } catch (error) {
    console.error('OCR error:', error);
    return {
      success: false,
      error: {
        code: 'OCR_ERROR',
        message: error instanceof Error ? error.message : 'Erreur lors de l\'extraction du texte',
      },
    };
  }
}

/**
 * Convertit un fichier image en base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Retirer le préfixe "data:image/...;base64," pour obtenir uniquement le contenu base64
      const base64Content = result.split(',')[1];
      resolve(base64Content);
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Vérifie si le fichier est une image valide
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  return validTypes.includes(file.type);
}

/**
 * Vérifie la taille du fichier (max 10MB pour Google Vision)
 */
export function isValidFileSize(file: File, maxSizeMB = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Mappe un code de langue Google vers LanguageCode
 */
function mapToLanguageCode(googleLangCode: string | undefined): LanguageCode | undefined {
  if (!googleLangCode) return undefined;

  const langMap: Record<string, LanguageCode> = {
    'en': 'en',
    'it': 'it',
    'es': 'es',
    'ru': 'ru',
  };

  return langMap[googleLangCode.toLowerCase()];
}

/**
 * Compresse une image avant envoi si nécessaire
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Redimensionner si l'image est trop grande
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Impossible de créer le contexte canvas'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en base64
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const base64Content = dataUrl.split(',')[1];
      resolve(base64Content);
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };

    img.src = URL.createObjectURL(file);
  });
}
