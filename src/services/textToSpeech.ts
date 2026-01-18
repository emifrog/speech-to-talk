import { createClient } from '@/lib/supabase/client';
import type { LanguageCode, TextToSpeechResult, APIResponse } from '@/types';
import { base64ToBlob } from '@/lib/utils';
import { getLanguageByCode } from '@/lib/constants';

// ===========================================
// Service Text-to-Speech
// ===========================================

interface TextToSpeechParams {
  text: string;
  languageCode: LanguageCode;
  speakingRate?: number; // 0.25 à 4.0, default 1.0
  pitch?: number; // -20.0 à 20.0, default 0.0
}

/**
 * Convertit un texte en audio via Google Text-to-Speech
 */
export async function textToSpeech(
  params: TextToSpeechParams
): Promise<APIResponse<TextToSpeechResult>> {
  try {
    const supabase = createClient();

    const language = getLanguageByCode(params.languageCode);
    if (!language) {
      throw new Error('Langue non supportée');
    }

    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: {
        text: params.text,
        languageCode: language.googleCode,
        speakingRate: params.speakingRate ?? 1.0,
        pitch: params.pitch ?? 0.0,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      data: {
        audioContent: data.audioContent,
      },
    };
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return {
      success: false,
      error: {
        code: 'TTS_ERROR',
        message: error instanceof Error ? error.message : 'Erreur de synthèse vocale',
      },
    };
  }
}

/**
 * Joue un audio depuis un contenu base64
 */
export function playAudioFromBase64(audioContent: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audioBlob = base64ToBlob(audioContent, 'audio/mp3');
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };

      audio.play();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Crée un élément audio contrôlable
 */
export function createAudioPlayer(audioContent: string): {
  audio: HTMLAudioElement;
  url: string;
  cleanup: () => void;
} {
  const audioBlob = base64ToBlob(audioContent, 'audio/mp3');
  const url = URL.createObjectURL(audioBlob);
  const audio = new Audio(url);

  return {
    audio,
    url,
    cleanup: () => URL.revokeObjectURL(url),
  };
}

/**
 * Synthèse vocale native (fallback sans API)
 */
export function speakWithNativeTTS(text: string, languageCode: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Synthèse vocale non supportée'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event.error);

    speechSynthesis.speak(utterance);
  });
}

/**
 * Arrête la lecture audio en cours
 */
export function stopAllAudio(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}
