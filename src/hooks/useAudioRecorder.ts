'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioRecordingResult } from '@/types';
import { AUDIO_CONFIG } from '@/lib/constants';

// ===========================================
// Hook pour l'enregistrement audio
// ===========================================

interface UseAudioRecorderOptions {
  maxDuration?: number; // Durée max en ms
  onSilenceDetected?: () => void;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<AudioRecordingResult | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  cancelRecording: () => void;
  hasPermission: boolean | null;
  requestPermission: () => Promise<boolean>;
}

export function useAudioRecorder(
  options: UseAudioRecorderOptions = {}
): UseAudioRecorderReturn {
  const { maxDuration = AUDIO_CONFIG.maxDuration } = options;

  // États
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Nettoyage du stream
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Nettoyage du timer
  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Demander la permission du micro
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Vérifier si l'API est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Votre navigateur ne supporte pas l\'accès au microphone');
        setHasPermission(false);
        return false;
      }

      // Demander l'accès
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Arrêter immédiatement le stream (on veut juste la permission)
      stream.getTracks().forEach((track) => track.stop());

      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error('Permission error:', err);

      // Messages d'erreur plus spécifiques
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Accès au microphone refusé. Veuillez autoriser dans les paramètres du navigateur.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('Aucun microphone détecté sur cet appareil.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Le microphone est utilisé par une autre application.');
        } else if (err.name === 'OverconstrainedError') {
          setError('Impossible de configurer le microphone.');
        } else if (err.name === 'SecurityError') {
          setError('Accès au microphone bloqué. Utilisez HTTPS.');
        } else {
          setError('Impossible d\'accéder au microphone.');
        }
      } else {
        setError('Erreur inconnue lors de l\'accès au microphone.');
      }

      setHasPermission(false);
      return false;
    }
  }, []);

  // Démarrer l'enregistrement
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];

      // Obtenir le flux audio
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: AUDIO_CONFIG.channelCount,
          sampleRate: AUDIO_CONFIG.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      setHasPermission(true);

      // Créer le MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported(AUDIO_CONFIG.mimeType)
        ? AUDIO_CONFIG.mimeType
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        setError('Erreur d\'enregistrement');
        cleanupStream();
        cleanupTimer();
        setIsRecording(false);
      };

      // Démarrer l'enregistrement
      mediaRecorder.start(100); // Chunk toutes les 100ms
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setDuration(0);

      // Timer pour la durée
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);

        // Arrêter si durée max atteinte
        if (elapsed >= maxDuration) {
          mediaRecorder.stop();
          cleanupTimer();
        }
      }, 100);
    } catch (err) {
      console.error('Start recording error:', err);
      setError('Impossible d\'accéder au microphone');
      setHasPermission(false);
    }
  }, [maxDuration, cleanupStream, cleanupTimer]);

  // Arrêter l'enregistrement
  const stopRecording = useCallback(async (): Promise<AudioRecordingResult | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        const finalDuration = Date.now() - startTimeRef.current;

        cleanupStream();
        cleanupTimer();
        setIsRecording(false);
        setIsPaused(false);

        resolve({
          blob,
          duration: finalDuration,
          mimeType: mediaRecorder.mimeType,
        });
      };

      mediaRecorder.stop();
    });
  }, [cleanupStream, cleanupTimer]);

  // Pause
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      cleanupTimer();
      setIsPaused(true);
    }
  }, [cleanupTimer]);

  // Resume
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      // Reprendre le timer
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setDuration(elapsed);
      }, 100);
    }
  }, []);

  // Annuler
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    chunksRef.current = [];
    cleanupStream();
    cleanupTimer();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
  }, [cleanupStream, cleanupTimer]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      cleanupStream();
      cleanupTimer();
    };
  }, [cleanupStream, cleanupTimer]);

  // Vérifier la permission au montage
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((result) => {
          setHasPermission(result.state === 'granted');
        })
        .catch(() => {
          // Certains navigateurs ne supportent pas cette query
        });
    }
  }, []);

  return {
    isRecording,
    isPaused,
    duration,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    hasPermission,
    requestPermission,
  };
}
