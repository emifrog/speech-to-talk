// ===========================================
// Speech To Talk - Types TypeScript
// ===========================================

// ----- Langues -----
export type LanguageCode = 'en' | 'fr' | 'de' | 'it' | 'es' | 'ru';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  googleCode: string; // Code pour Google APIs (ex: 'en-US')
}

// ----- Traduction -----
export interface TranslationResult {
  id?: string;
  sourceText: string;
  translatedText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  audioUrl?: string;
  timestamp: Date;
}

export interface TranslationRequest {
  text: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
}

// ----- Audio / Reconnaissance vocale -----
export type AudioState = 'idle' | 'recording' | 'processing' | 'playing' | 'error';

export interface AudioRecordingResult {
  blob: Blob;
  duration: number;
  mimeType: string;
}

export interface SpeechToTextResult {
  transcript: string;
  confidence: number;
  detectedLanguage?: LanguageCode;
}

// ----- Text-to-Speech -----
export interface TextToSpeechRequest {
  text: string;
  languageCode: string;
  voiceName?: string;
}

export interface TextToSpeechResult {
  audioContent: string; // Base64 encoded audio
  audioUrl?: string;
}

// ----- Phrases d'urgence (Sapeurs-Pompiers) -----
export type EmergencyCategory = 'medical' | 'fire' | 'reassurance' | 'evacuation' | 'general';

export interface EmergencyPhrase {
  id: string;
  category: EmergencyCategory;
  translations: Record<LanguageCode, string>;
  icon?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  displayOrder: number;
}

// ----- Mode Conversation -----
export type ConversationParticipant = 'A' | 'B';

export interface ConversationMessage {
  id: string;
  participant: ConversationParticipant;
  originalText: string;
  translatedText: string;
  originalLang: LanguageCode;
  targetLang: LanguageCode;
  timestamp: Date;
  audioUrl?: string;
}

export interface ConversationSettings {
  participantA: {
    language: LanguageCode;
    name?: string;
  };
  participantB: {
    language: LanguageCode;
    name?: string;
  };
  autoDetectLanguage: boolean;
  autoPlayTranslation: boolean;
}

// ----- OCR -----
export interface OCRResult {
  text: string;
  confidence: number;
  detectedLanguage?: LanguageCode;
  boundingBoxes?: Array<{
    text: string;
    vertices: Array<{ x: number; y: number }>;
  }>;
}

// ----- Historique -----
export interface TranslationHistory {
  id: string;
  userId: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  sourceText: string;
  translatedText: string;
  isFavorite: boolean;
  createdAt: Date;
}

// ----- User / Auth -----
export interface User {
  id: string;
  email: string;
  createdAt: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  defaultSourceLang: LanguageCode;
  defaultTargetLang: LanguageCode;
  autoPlayAudio: boolean;
  highVisibilityMode: boolean;
  theme: 'light' | 'dark' | 'system';
}

// ----- API Responses -----
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// ----- Store State -----
export interface AppState {
  // Audio
  audioState: AudioState;
  setAudioState: (state: AudioState) => void;
  
  // Languages
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  setSourceLang: (lang: LanguageCode) => void;
  setTargetLang: (lang: LanguageCode) => void;
  swapLanguages: () => void;
  
  // Current translation
  currentTranslation: TranslationResult | null;
  setCurrentTranslation: (result: TranslationResult | null) => void;
  
  // Conversation
  conversationMessages: ConversationMessage[];
  addConversationMessage: (message: ConversationMessage) => void;
  clearConversation: () => void;
  
  // User preferences
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}
