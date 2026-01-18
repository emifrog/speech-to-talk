// ===========================================
// Supabase Edge Function: speech-to-text
// ===========================================
// Déployez avec: supabase functions deploy speech-to-text

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  corsHeaders,
  handleCors,
  createErrorResponse,
  validateRequiredParams,
} from '../_shared/error-handler.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');

// Mapping des codes de langue
const languageCodeMap: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  es: 'es-ES',
  ru: 'ru-RU',
};

interface SpeechToTextRequest {
  audioContent: string;
  languageCode: string;
  enableAutomaticPunctuation?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: SpeechToTextRequest = await req.json();

    // Validate required parameters
    validateRequiredParams(body, ['audioContent', 'languageCode']);

    const { audioContent, languageCode, enableAutomaticPunctuation = true } = body;
    const googleLanguageCode = languageCodeMap[languageCode] || languageCode;

    // Call Google Cloud Speech-to-Text API
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
            languageCode: googleLanguageCode,
            enableAutomaticPunctuation,
            model: 'latest_long',
            useEnhanced: true,
          },
          audio: {
            content: audioContent,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Speech-to-Text API error: ${errorText}`);
    }

    const data = await response.json();

    // Check if we got any results
    if (!data.results || data.results.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          transcript: '',
          confidence: 0,
          warning: 'No speech detected',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = data.results[0].alternatives[0];

    return new Response(
      JSON.stringify({
        success: true,
        transcript: result.transcript,
        confidence: result.confidence || 0.9,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    return createErrorResponse(error, corsHeaders);
  }
});
