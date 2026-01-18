// ===========================================
// Shared Error Handler for Edge Functions
// ===========================================

/**
 * Extrait un message d'erreur sûr depuis n'importe quel type d'erreur
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Une erreur inattendue est survenue';
}

/**
 * Crée une réponse d'erreur standardisée
 */
export function createErrorResponse(
  error: unknown,
  corsHeaders: Record<string, string>,
  statusCode = 500
): Response {
  const message = getErrorMessage(error);
  
  console.error('Edge Function Error:', {
    message,
    error: error instanceof Error ? error.stack : error,
    timestamp: new Date().toISOString(),
  });

  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code: getErrorCode(error),
        message,
      },
    }),
    {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Détermine le code d'erreur approprié
 */
function getErrorCode(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('missing') || message.includes('required')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('api') || message.includes('fetch')) {
      return 'EXTERNAL_API_ERROR';
    }
    if (message.includes('auth') || message.includes('permission')) {
      return 'AUTH_ERROR';
    }
    if (message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
  }
  return 'INTERNAL_ERROR';
}

/**
 * Crée une réponse de succès standardisée
 */
export function createSuccessResponse<T>(
  data: T,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Headers CORS standard
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Gère les requêtes OPTIONS pour CORS
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

/**
 * Valide les paramètres requis
 */
export function validateRequiredParams(
  params: Record<string, unknown>,
  required: string[]
): void {
  const missing = required.filter((key) => !params[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }
}
