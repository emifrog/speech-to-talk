// ===========================================
// Supabase Edge Function: translate
// ===========================================
// Déployez avec: supabase functions deploy translate

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  corsHeaders,
  handleCors,
  createErrorResponse,
  validateRequiredParams,
} from '../_shared/error-handler.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');

interface TranslateRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: TranslateRequest = await req.json();

    // Validate required parameters
    validateRequiredParams(body, ['text', 'sourceLang', 'targetLang']);

    const { text, sourceLang, targetLang } = body;

    // Call Google Cloud Translation API
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Translation API error: ${errorText}`);
    }

    const data = await response.json();
    const translatedText = data.data.translations[0].translatedText;
    const detectedSourceLanguage = data.data.translations[0].detectedSourceLanguage;

    return new Response(
      JSON.stringify({
        success: true,
        translatedText,
        detectedSourceLanguage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    return createErrorResponse(error, corsHeaders);
  }
});
