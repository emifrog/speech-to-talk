// ===========================================
// Supabase Edge Function: ocr
// ===========================================
// Déployez avec: supabase functions deploy ocr

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import {
  corsHeaders,
  handleCors,
  createErrorResponse,
  validateRequiredParams,
} from '../_shared/error-handler.ts';

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');

interface OCRRequest {
  imageContent: string;
  languageHints?: string[];
}

serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: OCRRequest = await req.json();

    // Validate required parameters
    validateRequiredParams(body, ['imageContent']);

    const { imageContent, languageHints = [] } = body;

    // Call Google Cloud Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: imageContent,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 10,
                },
                {
                  type: 'DOCUMENT_TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
              imageContext: {
                languageHints: languageHints.length > 0 ? languageHints : ['en', 'it', 'es', 'ru'],
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vision API error: ${errorText}`);
    }

    const data = await response.json();
    const result = data.responses[0];

    // Check for errors
    if (result.error) {
      throw new Error(result.error.message);
    }

    // Extract text
    const fullTextAnnotation = result.fullTextAnnotation;
    const textAnnotations = result.textAnnotations;

    if (!fullTextAnnotation && (!textAnnotations || textAnnotations.length === 0)) {
      return new Response(
        JSON.stringify({
          success: true,
          text: '',
          confidence: 0,
          detectedLanguage: null,
          warning: 'No text detected in image',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get full text
    const text = fullTextAnnotation?.text || textAnnotations[0].description;

    // Get detected language
    const detectedLanguage = fullTextAnnotation?.pages?.[0]?.property?.detectedLanguages?.[0]?.languageCode;

    // Get confidence
    const confidence = fullTextAnnotation?.pages?.[0]?.property?.detectedLanguages?.[0]?.confidence || 0.9;

    // Get bounding boxes for each text block
    const boundingBoxes = textAnnotations?.slice(1).map((annotation: {
      description: string;
      boundingPoly?: {
        vertices: Array<{ x: number; y: number }>;
      };
    }) => ({
      text: annotation.description,
      vertices: annotation.boundingPoly?.vertices || [],
    }));

    return new Response(
      JSON.stringify({
        success: true,
        text,
        confidence,
        detectedLanguage,
        boundingBoxes,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    return createErrorResponse(error, corsHeaders);
  }
});
