import { createClient } from '@/lib/supabase/client';
import type { LanguageCode, APIResponse } from '@/types';
import { 
  SpeechToTextRequestSchema,
  SpeechToTextResponseSchema,
  DetectLanguageRequestSchema,
  DetectLanguageResponseSchema,
  AudioBlobSchema,
  safeValidateData 
} from '@/lib/validation';

// ===========================================
// Service de reconnaissance vocale
// ===========================================

/**
 * Convertit un ArrayBuffer en Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ===========================================
// Service Speech-to-Text
// ===========================================

interface SpeechToTextParams {
  audioBlob: Blob;
  languageCode: LanguageCode;
  enableAutomaticPunctuation?: boolean;
}

interface SpeechToTextResult {
  transcript: string;
  confidence: number;
  detectedLanguage?: LanguageCode;
}

/**
 * Convertit un fichier audio en texte via Google Speech-to-Text
 */
export async function speechToText(
  params: SpeechToTextParams
): Promise<APIResponse<SpeechToTextResult>> {
  try {
    // Validate audio blob
    const blobValidation = safeValidateData(AudioBlobSchema, params.audioBlob);
    if (!blobValidation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: blobValidation.error,
        },
      };
    }

    const supabase = createClient();

    // Convertir le blob audio en base64
    const arrayBuffer = await params.audioBlob.arrayBuffer();
    const audioContent = arrayBufferToBase64(arrayBuffer);

    // Validate request
    const requestData = {
      audioContent,
      languageCode: params.languageCode,
      enableAutomaticPunctuation: params.enableAutomaticPunctuation ?? true,
    };

    const requestValidation = safeValidateData(SpeechToTextRequestSchema, requestData);
    if (!requestValidation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: requestValidation.error,
        },
      };
    }

    const { data, error } = await supabase.functions.invoke('speech-to-text', {
      body: requestValidation.data,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.transcript) {
      return {
        success: false,
        error: {
          code: 'NO_SPEECH_DETECTED',
          message: 'Aucune parole détectée',
        },
      };
    }

    // Validate response
    const responseValidation = safeValidateData(SpeechToTextResponseSchema, data);
    if (!responseValidation.success) {
      throw new Error('Invalid response from speech-to-text service');
    }

    return {
      success: true,
      data: {
        transcript: responseValidation.data.transcript,
        confidence: responseValidation.data.confidence,
        detectedLanguage: data.detectedLanguage as LanguageCode | undefined,
      },
    };
  } catch (error) {
    console.error('Speech-to-text error:', error);
    return {
      success: false,
      error: {
        code: 'STT_ERROR',
        message: error instanceof Error ? error.message : 'Erreur de transcription',
      },
    };
  }
}

/**
 * Détecte automatiquement la langue parlée
 */
export async function detectSpokenLanguage(
  audioBlob: Blob
): Promise<APIResponse<{ languageCode: LanguageCode; confidence: number }>> {
  try {
    // Validate audio blob
    const blobValidation = safeValidateData(AudioBlobSchema, audioBlob);
    if (!blobValidation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: blobValidation.error,
        },
      };
    }

    const supabase = createClient();

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContent = arrayBufferToBase64(arrayBuffer);

    // Validate request
    const requestValidation = safeValidateData(DetectLanguageRequestSchema, { audioContent });
    if (!requestValidation.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: requestValidation.error,
        },
      };
    }

    const { data, error } = await supabase.functions.invoke('detect-language', {
      body: requestValidation.data,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Validate response
    const responseValidation = safeValidateData(DetectLanguageResponseSchema, data);
    if (!responseValidation.success) {
      throw new Error('Invalid response from language detection service');
    }

    return {
      success: true,
      data: {
        languageCode: responseValidation.data.languageCode as LanguageCode,
        confidence: responseValidation.data.confidence,
      },
    };
  } catch (error) {
    console.error('Language detection error:', error);
    return {
      success: false,
      error: {
        code: 'LANGUAGE_DETECTION_ERROR',
        message: error instanceof Error ? error.message : 'Erreur de détection de langue',
      },
    };
  }
}
