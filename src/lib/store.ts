import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AudioState,
  LanguageCode,
  TranslationResult,
  ConversationMessage,
  UserPreferences,
} from '@/types';
import { APP_CONFIG } from '@/lib/constants';

// ===========================================
// Interface du Store
// ===========================================
interface AppStore {
  // ----- Audio State -----
  audioState: AudioState;
  setAudioState: (state: AudioState) => void;

  // ----- Languages -----
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  setSourceLang: (lang: LanguageCode) => void;
  setTargetLang: (lang: LanguageCode) => void;
  swapLanguages: () => void;

  // ----- Current Translation -----
  currentTranslation: TranslationResult | null;
  setCurrentTranslation: (result: TranslationResult | null) => void;

  // ----- Translation History -----
  translationHistory: TranslationResult[];
  addToHistory: (result: TranslationResult) => void;
  clearHistory: () => void;

  // ----- Conversation Mode -----
  conversationMessages: ConversationMessage[];
  addConversationMessage: (message: ConversationMessage) => void;
  clearConversation: () => void;
  isConversationActive: boolean;
  setConversationActive: (active: boolean) => void;

  // ----- User Preferences -----
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;

  // ----- UI State -----
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// ===========================================
// Store Zustand avec persistance
// ===========================================
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ----- Audio State -----
      audioState: 'idle',
      setAudioState: (audioState) => set({ audioState }),

      // ----- Languages -----
      sourceLang: APP_CONFIG.defaultSourceLang,
      targetLang: APP_CONFIG.defaultTargetLang,
      setSourceLang: (sourceLang) => set({ sourceLang }),
      setTargetLang: (targetLang) => set({ targetLang }),
      swapLanguages: () => {
        const { sourceLang, targetLang } = get();
        set({ sourceLang: targetLang, targetLang: sourceLang });
      },

      // ----- Current Translation -----
      currentTranslation: null,
      setCurrentTranslation: (currentTranslation) => set({ currentTranslation }),

      // ----- Translation History -----
      translationHistory: [],
      addToHistory: (result) =>
        set((state) => ({
          translationHistory: [result, ...state.translationHistory].slice(0, 50), // Garder les 50 dernières
        })),
      clearHistory: () => set({ translationHistory: [] }),

      // ----- Conversation Mode -----
      conversationMessages: [],
      addConversationMessage: (message) =>
        set((state) => ({
          conversationMessages: [...state.conversationMessages, message],
        })),
      clearConversation: () => set({ conversationMessages: [] }),
      isConversationActive: false,
      setConversationActive: (isConversationActive) => set({ isConversationActive }),

      // ----- User Preferences -----
      preferences: {
        defaultSourceLang: APP_CONFIG.defaultSourceLang,
        defaultTargetLang: APP_CONFIG.defaultTargetLang,
        autoPlayAudio: true,
        highVisibilityMode: false,
        theme: 'light',
      },
      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      // ----- UI State -----
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'speech-to-talk-storage',
      partialize: (state) => ({
        // Ne persister que ces champs
        sourceLang: state.sourceLang,
        targetLang: state.targetLang,
        translationHistory: state.translationHistory,
        preferences: state.preferences,
      }),
    }
  )
);

// ===========================================
// Hooks helpers
// ===========================================
export const useLanguages = () =>
  useAppStore((state) => ({
    sourceLang: state.sourceLang,
    targetLang: state.targetLang,
    setSourceLang: state.setSourceLang,
    setTargetLang: state.setTargetLang,
    swapLanguages: state.swapLanguages,
  }));

export const useAudioState = () =>
  useAppStore((state) => ({
    audioState: state.audioState,
    setAudioState: state.setAudioState,
    isRecording: state.audioState === 'recording',
    isProcessing: state.audioState === 'processing',
    isPlaying: state.audioState === 'playing',
  }));

export const useTranslation = () =>
  useAppStore((state) => ({
    currentTranslation: state.currentTranslation,
    setCurrentTranslation: state.setCurrentTranslation,
    history: state.translationHistory,
    addToHistory: state.addToHistory,
  }));

export const useConversation = () =>
  useAppStore((state) => ({
    messages: state.conversationMessages,
    addMessage: state.addConversationMessage,
    clear: state.clearConversation,
    isActive: state.isConversationActive,
    setActive: state.setConversationActive,
  }));

export const usePreferences = () =>
  useAppStore((state) => ({
    preferences: state.preferences,
    updatePreferences: state.updatePreferences,
  }));
