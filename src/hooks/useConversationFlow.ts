'use client';

import { useState, useCallback } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { useAppStore } from '@/lib/store';
import { speechToText } from '@/services/speechToText';
import { translateText, createTranslationResult } from '@/services/translation';
import { textToSpeech, playAudioFromBase64 } from '@/services/textToSpeech';
import type { ConversationParticipant, ConversationMessage, AudioState, LanguageCode } from '@/types';
import { generateId } from '@/lib/utils';

// ===========================================
// Hook pour le flux de conversation bilingue
// ===========================================

interface UseConversationFlowReturn {
  // États
  audioState: AudioState;
  isRecording: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  duration: number;
  error: string | null;
  currentParticipant: ConversationParticipant;

  // Actions
  setCurrentParticipant: (participant: ConversationParticipant) => void;
  startRecording: () => Promise<void>;
  stopAndTranslate: () => Promise<void>;
  cancelRecording: () => void;
  playMessage: (message: ConversationMessage) => Promise<void>;
  clearConversation: () => void;

  // Permissions
  hasPermission: boolean | null;
  requestPermission: () => Promise<boolean>;
}

export function useConversationFlow(): UseConversationFlowReturn {
  const [error, setError] = useState<string | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<ConversationParticipant>('A');

  // Store global
  const {
    audioState,
    setAudioState,
    sourceLang,
    targetLang,
    addConversationMessage,
    clearConversation: clearMessages,
  } = useAppStore();

  // Hook d'enregistrement audio
  const {
    isRecording,
    duration,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    cancelRecording: cancelAudioRecording,
    hasPermission,
    requestPermission,
  } = useAudioRecorder();

  // Déterminer les langues selon le participant
  const getLanguages = useCallback((): { speakerLang: LanguageCode; listenerLang: LanguageCode } => {
    if (currentParticipant === 'A') {
      return { speakerLang: sourceLang, listenerLang: targetLang };
    } else {
      return { speakerLang: targetLang, listenerLang: sourceLang };
    }
  }, [currentParticipant, sourceLang, targetLang]);

  // Démarrer l'enregistrement
  const startRecording = useCallback(async () => {
    setError(null);
    setAudioState('recording');
    await startAudioRecording();
  }, [startAudioRecording, setAudioState]);

  // Arrêter et lancer la traduction
  const stopAndTranslate = useCallback(async () => {
    try {
      setAudioState('processing');

      const { speakerLang, listenerLang } = getLanguages();

      // 1. Arrêter l'enregistrement et récupérer l'audio
      const recordingResult = await stopAudioRecording();

      if (!recordingResult || recordingResult.blob.size === 0) {
        throw new Error('Aucun audio enregistré');
      }

      // 2. Convertir la parole en texte
      const sttResult = await speechToText({
        audioBlob: recordingResult.blob,
        languageCode: speakerLang,
      });

      if (!sttResult.success || !sttResult.data) {
        throw new Error(sttResult.error?.message || 'Erreur de transcription');
      }

      const { transcript } = sttResult.data;

      // 3. Traduire le texte
      const translationResponse = await translateText({
        text: transcript,
        sourceLang: speakerLang,
        targetLang: listenerLang,
      });

      if (!translationResponse.success || !translationResponse.data) {
        throw new Error(translationResponse.error?.message || 'Erreur de traduction');
      }

      const { translatedText } = translationResponse.data;

      // 4. Générer l'audio de la traduction
      const ttsResult = await textToSpeech({
        text: translatedText,
        languageCode: listenerLang,
      });

      let audioContent: string | undefined;
      if (ttsResult.success && ttsResult.data) {
        audioContent = ttsResult.data.audioContent;
      }

      // 5. Créer le message de conversation
      const message: ConversationMessage = {
        id: generateId(),
        participant: currentParticipant,
        originalText: transcript,
        translatedText: translatedText,
        originalLang: speakerLang,
        targetLang: listenerLang,
        timestamp: new Date(),
        audioUrl: audioContent,
      };

      addConversationMessage(message);

      // 6. Jouer l'audio automatiquement
      if (audioContent) {
        setAudioState('playing');
        await playAudioFromBase64(audioContent);
      }

      // 7. Alterner le participant pour le prochain message
      setCurrentParticipant(currentParticipant === 'A' ? 'B' : 'A');

      setAudioState('idle');
    } catch (err) {
      console.error('Conversation flow error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de traduction');
      setAudioState('error');
    }
  }, [
    stopAudioRecording,
    getLanguages,
    currentParticipant,
    setAudioState,
    addConversationMessage,
  ]);

  // Annuler l'enregistrement
  const cancelRecording = useCallback(() => {
    cancelAudioRecording();
    setAudioState('idle');
    setError(null);
  }, [cancelAudioRecording, setAudioState]);

  // Rejouer un message
  const playMessage = useCallback(async (message: ConversationMessage) => {
    if (!message.audioUrl) {
      // Regénérer l'audio si nécessaire
      const ttsResult = await textToSpeech({
        text: message.translatedText,
        languageCode: message.targetLang,
      });

      if (ttsResult.success && ttsResult.data) {
        setAudioState('playing');
        await playAudioFromBase64(ttsResult.data.audioContent);
        setAudioState('idle');
      }
      return;
    }

    try {
      setAudioState('playing');
      await playAudioFromBase64(message.audioUrl);
      setAudioState('idle');
    } catch (err) {
      console.error('Play audio error:', err);
      setError('Erreur de lecture audio');
      setAudioState('idle');
    }
  }, [setAudioState]);

  // Effacer la conversation
  const clearConversation = useCallback(() => {
    clearMessages();
    setCurrentParticipant('A');
    setError(null);
    setAudioState('idle');
  }, [clearMessages, setAudioState]);

  return {
    audioState,
    isRecording,
    isProcessing: audioState === 'processing',
    isPlaying: audioState === 'playing',
    duration,
    error,
    currentParticipant,
    setCurrentParticipant,
    startRecording,
    stopAndTranslate,
    cancelRecording,
    playMessage,
    clearConversation,
    hasPermission,
    requestPermission,
  };
}
