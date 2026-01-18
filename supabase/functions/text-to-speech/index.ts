// ===========================================
// Supabase Edge Function: text-to-speech
// ===========================================
// Déployez avec: supabase functions deploy text-to-speech

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  corsHeaders,
  handleCors,
  createErrorResponse,
  validateRequiredParams,
} from '../_shared/error-handler.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');

// Voix par défaut par langue
const defaultVoices: Record<string, { name: string; ssmlGender: string }> = {
  'en-US': { name: 'en-US-Neural2-J', ssmlGender: 'MALE' },
  'fr-FR': { name: 'fr-FR-Neural2-B', ssmlGender: 'MALE' },
  'de-DE': { name: 'de-DE-Neural2-B', ssmlGender: 'MALE' },
  'it-IT': { name: 'it-IT-Neural2-C', ssmlGender: 'MALE' },
  'es-ES': { name: 'es-ES-Neural2-B', ssmlGender: 'MALE' },
  'ru-RU': { name: 'ru-RU-Wavenet-B', ssmlGender: 'MALE' },
};

interface TextToSpeechRequest {
  text: string;
  languageCode: string;
  speakingRate?: number;
  pitch?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: TextToSpeechRequest = await req.json();

    // Validate required parameters
    validateRequiredParams(body, ['text', 'languageCode']);

    const { text, languageCode, speakingRate = 1.0, pitch = 0.0 } = body;

    const voice = defaultVoices[languageCode] || {
      name: `${languageCode}-Standard-A`,
      ssmlGender: 'NEUTRAL',
    };

    // Call Google Cloud Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode,
            name: voice.name,
            ssmlGender: voice.ssmlGender,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate,
            pitch,
            effectsProfileId: ['headphone-class-device'],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Text-to-Speech API error: ${errorText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        audioContent: data.audioContent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    return createErrorResponse(error, corsHeaders);
  }
});
