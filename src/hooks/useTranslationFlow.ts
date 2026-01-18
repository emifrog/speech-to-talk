'use client';

import { useState, useCallback } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { useAppStore } from '@/lib/store';
import { speechToText } from '@/services/speechToText';
import { translateText, createTranslationResult } from '@/services/translation';
import { textToSpeech, playAudioFromBase64 } from '@/services/textToSpeech';
import type { TranslationResult, AudioState } from '@/types';

// ===========================================
// Hook principal pour le flux de traduction
// ===========================================

interface UseTranslationFlowReturn {
  // États
  audioState: AudioState;
  isRecording: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  duration: number;
  error: string | null;
  currentTranslation: TranslationResult | null;

  // Actions
  startRecording: () => Promise<void>;
  stopAndTranslate: () => Promise<void>;
  cancelRecording: () => void;
  playTranslation: () => Promise<void>;
  clearTranslation: () => void;

  // Permissions
  hasPermission: boolean | null;
  requestPermission: () => Promise<boolean>;
}

export function useTranslationFlow(): UseTranslationFlowReturn {
  const [error, setError] = useState<string | null>(null);
  const [currentTranslation, setCurrentTranslation] = useState<TranslationResult | null>(null);
  const [audioContent, setAudioContent] = useState<string | null>(null);

  // Store global
  const {
    audioState,
    setAudioState,
    sourceLang,
    targetLang,
    addToHistory,
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

  // Démarrer l'enregistrement
  const startRecording = useCallback(async () => {
    setError(null);
    setCurrentTranslation(null);
    setAudioContent(null);
    setAudioState('recording');
    await startAudioRecording();
  }, [startAudioRecording, setAudioState]);

  // Arrêter et lancer la traduction
  const stopAndTranslate = useCallback(async () => {
    try {
      setAudioState('processing');

      // 1. Arrêter l'enregistrement et récupérer l'audio
      const recordingResult = await stopAudioRecording();

      if (!recordingResult || recordingResult.blob.size === 0) {
        throw new Error('Aucun audio enregistré');
      }

      // 2. Convertir la parole en texte
      const sttResult = await speechToText({
        audioBlob: recordingResult.blob,
        languageCode: sourceLang,
      });

      if (!sttResult.success || !sttResult.data) {
        throw new Error(sttResult.error?.message || 'Erreur de transcription');
      }

      const { transcript } = sttResult.data;

      // 3. Traduire le texte
      const translationResponse = await translateText({
        text: transcript,
        sourceLang,
        targetLang,
      });

      if (!translationResponse.success || !translationResponse.data) {
        throw new Error(translationResponse.error?.message || 'Erreur de traduction');
      }

      const { translatedText } = translationResponse.data;

      // 4. Générer l'audio de la traduction
      const ttsResult = await textToSpeech({
        text: translatedText,
        languageCode: targetLang,
      });

      let audio: string | undefined;
      if (ttsResult.success && ttsResult.data) {
        audio = ttsResult.data.audioContent;
        setAudioContent(audio);
      }

      // 5. Créer le résultat final
      const result = createTranslationResult(
        transcript,
        translatedText,
        sourceLang,
        targetLang
      );

      setCurrentTranslation(result);
      addToHistory(result);

      // 6. Jouer l'audio automatiquement
      if (audio) {
        setAudioState('playing');
        await playAudioFromBase64(audio);
      }

      setAudioState('idle');
    } catch (err) {
      console.error('Translation flow error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de traduction');
      setAudioState('error');
    }
  }, [
    stopAudioRecording,
    sourceLang,
    targetLang,
    setAudioState,
    addToHistory,
  ]);

  // Annuler l'enregistrement
  const cancelRecording = useCallback(() => {
    cancelAudioRecording();
    setAudioState('idle');
    setError(null);
  }, [cancelAudioRecording, setAudioState]);

  // Rejouer la traduction
  const playTranslation = useCallback(async () => {
    if (!audioContent) {
      // Regénérer l'audio si nécessaire
      if (currentTranslation) {
        const ttsResult = await textToSpeech({
          text: currentTranslation.translatedText,
          languageCode: targetLang,
        });

        if (ttsResult.success && ttsResult.data) {
          setAudioContent(ttsResult.data.audioContent);
          setAudioState('playing');
          await playAudioFromBase64(ttsResult.data.audioContent);
          setAudioState('idle');
        }
      }
      return;
    }

    try {
      setAudioState('playing');
      await playAudioFromBase64(audioContent);
      setAudioState('idle');
    } catch (err) {
      console.error('Play audio error:', err);
      setError('Erreur de lecture audio');
      setAudioState('idle');
    }
  }, [audioContent, currentTranslation, targetLang, setAudioState]);

  // Effacer la traduction actuelle
  const clearTranslation = useCallback(() => {
    setCurrentTranslation(null);
    setAudioContent(null);
    setError(null);
    setAudioState('idle');
  }, [setAudioState]);

  return {
    audioState,
    isRecording,
    isProcessing: audioState === 'processing',
    isPlaying: audioState === 'playing',
    duration,
    error,
    currentTranslation,
    startRecording,
    stopAndTranslate,
    cancelRecording,
    playTranslation,
    clearTranslation,
    hasPermission,
    requestPermission,
  };
}
