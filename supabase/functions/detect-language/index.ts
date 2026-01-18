// ===========================================
// Supabase Edge Function: detect-language
// ===========================================
// Détecte automatiquement la langue parlée dans un audio

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  corsHeaders,
  handleCors,
  createErrorResponse,
  createSuccessResponse,
  validateRequiredParams,
} from '../_shared/error-handler.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');

interface DetectLanguageRequest {
  audioContent: string;
}

interface DetectLanguageResponse {
  languageCode: string;
  confidence: number;
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: DetectLanguageRequest = await req.json();

    // Validate required parameters
    validateRequiredParams(body, ['audioContent']);

    const { audioContent } = body;

    // Call Google Cloud Speech-to-Text API with language detection
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            // Alternative languages to detect
            alternativeLanguageCodes: [
              'en-US', 'it-IT', 'es-ES', 'ru-RU', 
              'fr-FR', 'de-DE', 'pt-PT', 'ar-SA',
              'zh-CN', 'ja-JP', 'ko-KR'
            ],
            enableAutomaticPunctuation: true,
            model: 'default',
          },
          audio: {
            content: audioContent,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Speech API error: ${errorText}`);
    }

    const data = await response.json();

    // Check if we got results
    if (!data.results || data.results.length === 0) {
      return createSuccessResponse({
        languageCode: 'en',
        confidence: 0,
      }, corsHeaders);
    }

    // Get the detected language from the first result
    const result = data.results[0];
    const alternative = result.alternatives?.[0];

    if (!alternative) {
      return createSuccessResponse({
        languageCode: 'en',
        confidence: 0,
      }, corsHeaders);
    }

    // Extract language code from the result
    // Google returns language codes like "en-us", we need to normalize them
    const detectedLanguageCode = result.languageCode || 'en-US';
    const confidence = alternative.confidence || 0;

    // Normalize language code to match our supported languages
    const languageMap: Record<string, string> = {
      'en-US': 'en',
      'en-GB': 'en',
      'it-IT': 'it',
      'es-ES': 'es',
      'es-MX': 'es',
      'ru-RU': 'ru',
      'fr-FR': 'fr',
      'de-DE': 'de',
      'pt-PT': 'pt',
      'pt-BR': 'pt',
      'ar-SA': 'ar',
      'zh-CN': 'zh',
      'ja-JP': 'ja',
      'ko-KR': 'ko',
    };

    const normalizedLanguageCode = languageMap[detectedLanguageCode] || 
                                    detectedLanguageCode.split('-')[0] || 
                                    'en';

    const responseData: DetectLanguageResponse = {
      languageCode: normalizedLanguageCode,
      confidence: confidence,
    };

    return createSuccessResponse(responseData, corsHeaders);
  } catch (error: unknown) {
    return createErrorResponse(error, corsHeaders);
  }
});
