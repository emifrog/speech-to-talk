import { z } from 'zod';
import type { LanguageCode } from '@/types';

// ===========================================
// Validation Schemas with Zod
// ===========================================

// Supported language codes
const languageCodes = [
  'en', 'it', 'es', 'ru', 'fr', 'de', 'pt', 'ar', 'zh', 'ja', 'ko'
] as const;

export const LanguageCodeSchema = z.enum(languageCodes);

// Translation schemas
export const TranslateRequestSchema = z.object({
  text: z.string().min(1, 'Le texte ne peut pas être vide').max(5000, 'Le texte est trop long (max 5000 caractères)'),
  sourceLang: LanguageCodeSchema,
  targetLang: LanguageCodeSchema,
}).refine(
  (data) => data.sourceLang !== data.targetLang,
  { message: 'La langue source et cible doivent être différentes' }
);

export const TranslateResponseSchema = z.object({
  translatedText: z.string(),
  detectedSourceLanguage: LanguageCodeSchema.optional(),
  confidence: z.number().min(0).max(1).optional(),
});

// Speech-to-Text schemas
export const SpeechToTextRequestSchema = z.object({
  audioContent: z.string().min(1, 'Le contenu audio ne peut pas être vide'),
  languageCode: LanguageCodeSchema,
  enableAutomaticPunctuation: z.boolean().optional().default(true),
});

export const SpeechToTextResponseSchema = z.object({
  transcript: z.string(),
  confidence: z.number().min(0).max(1),
});

// Text-to-Speech schemas
export const TextToSpeechRequestSchema = z.object({
  text: z.string().min(1, 'Le texte ne peut pas être vide').max(5000, 'Le texte est trop long'),
  languageCode: LanguageCodeSchema,
  voiceName: z.string().optional(),
  speakingRate: z.number().min(0.25).max(4.0).optional().default(1.0),
  pitch: z.number().min(-20).max(20).optional().default(0),
});

export const TextToSpeechResponseSchema = z.object({
  audioContent: z.string(),
});

// OCR schemas
export const OCRRequestSchema = z.object({
  imageContent: z.string().min(1, 'Le contenu image ne peut pas être vide'),
  languageHints: z.array(LanguageCodeSchema).optional(),
});

export const OCRResponseSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  detectedLanguage: LanguageCodeSchema.optional(),
  boundingBoxes: z.array(z.object({
    text: z.string(),
    vertices: z.array(z.object({
      x: z.number(),
      y: z.number(),
    })),
  })).optional(),
});

// Detect Language schemas
export const DetectLanguageRequestSchema = z.object({
  audioContent: z.string().min(1, 'Le contenu audio ne peut pas être vide'),
});

export const DetectLanguageResponseSchema = z.object({
  languageCode: LanguageCodeSchema,
  confidence: z.number().min(0).max(1),
});

// Auth schemas
export const SignUpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe est trop long'),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => !data.confirmPassword || data.password === data.confirmPassword,
  { message: 'Les mots de passe ne correspondent pas', path: ['confirmPassword'] }
);

export const SignInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export const UpdatePasswordSchema = z.object({
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe est trop long'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Les mots de passe ne correspondent pas', path: ['confirmPassword'] }
);

// File upload schemas
export const ImageFileSchema = z.object({
  file: z.instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Le fichier est trop volumineux (max 10MB)')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'Format de fichier non supporté (JPEG, PNG, WebP, GIF uniquement)'
    ),
});

export const AudioBlobSchema = z.instanceof(Blob)
  .refine((blob) => blob.size > 0, 'Le fichier audio est vide')
  .refine((blob) => blob.size <= 10 * 1024 * 1024, 'Le fichier audio est trop volumineux (max 10MB)');

// Helper function to validate and return typed data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Helper function to safely validate and return result
export function safeValidateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format Zod errors into a readable message
  const errorMessage = result.error.issues
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
  
  return { success: false, error: errorMessage };
}

// Type exports
export type TranslateRequest = z.infer<typeof TranslateRequestSchema>;
export type TranslateResponse = z.infer<typeof TranslateResponseSchema>;
export type SpeechToTextRequest = z.infer<typeof SpeechToTextRequestSchema>;
export type SpeechToTextResponse = z.infer<typeof SpeechToTextResponseSchema>;
export type TextToSpeechRequest = z.infer<typeof TextToSpeechRequestSchema>;
export type TextToSpeechResponse = z.infer<typeof TextToSpeechResponseSchema>;
export type OCRRequest = z.infer<typeof OCRRequestSchema>;
export type OCRResponse = z.infer<typeof OCRResponseSchema>;
export type DetectLanguageRequest = z.infer<typeof DetectLanguageRequestSchema>;
export type DetectLanguageResponse = z.infer<typeof DetectLanguageResponseSchema>;
export type SignUpData = z.infer<typeof SignUpSchema>;
export type SignInData = z.infer<typeof SignInSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
export type UpdatePasswordData = z.infer<typeof UpdatePasswordSchema>;
