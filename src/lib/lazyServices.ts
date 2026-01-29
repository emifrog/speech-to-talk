// ===========================================
// Lazy Loading Services
// ===========================================

// Dynamic imports for heavy services to reduce initial bundle size

/**
 * Lazy load translation service
 */
export async function getTranslationService() {
  const { translateText, createTranslationResult } = await import('@/services/translation');
  return { translateText, createTranslationResult };
}

/**
 * Lazy load text-to-speech service
 */
export async function getTextToSpeechService() {
  const { textToSpeech, playAudioFromBase64 } = await import('@/services/textToSpeech');
  return { textToSpeech, playAudioFromBase64 };
}

/**
 * Lazy load speech-to-text service
 */
export async function getSpeechToTextService() {
  const { speechToText, detectSpokenLanguage } = await import('@/services/speechToText');
  return { speechToText, detectSpokenLanguage };
}

/**
 * Lazy load OCR service
 */
export async function getOCRService() {
  const {
    extractTextFromImage,
    fileToBase64,
    isValidImageFile,
    isValidFileSize,
    compressImage,
  } = await import('@/services/ocr');
  return {
    extractTextFromImage,
    fileToBase64,
    isValidImageFile,
    isValidFileSize,
    compressImage,
  };
}

/**
 * Lazy load auth service
 */
export async function getAuthService() {
  const {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    getCurrentUser,
  } = await import('@/services/auth');
  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    getCurrentUser,
  };
}
