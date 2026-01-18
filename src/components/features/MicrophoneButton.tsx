'use client';

import { cn, formatDuration } from '@/lib/utils';
import { startRecordingHaptic, stopRecordingHaptic, errorHaptic } from '@/lib/haptics';
import { Mic, Square, Loader2 } from 'lucide-react';
import type { AudioState } from '@/types';

// ===========================================
// Microphone Button Component
// ===========================================

interface MicrophoneButtonProps {
  audioState: AudioState;
  duration: number;
  onPress: () => void;
  onRelease: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MicrophoneButton({
  audioState,
  duration,
  onPress,
  onRelease,
  disabled = false,
  size = 'lg',
}: MicrophoneButtonProps) {
  const isRecording = audioState === 'recording';
  const isProcessing = audioState === 'processing';
  const isPlaying = audioState === 'playing';
  const isError = audioState === 'error';

  const handlePress = () => {
    if (!disabled && audioState === 'idle') {
      startRecordingHaptic();
      onPress();
    }
  };

  const handleRelease = () => {
    if (isRecording) {
      stopRecordingHaptic();
      onRelease();
    }
  };

  // Haptic on error state
  if (isError) {
    errorHaptic();
  }

  const sizes = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  return (
    <div className="flex flex-col items-center">
      {/* Pulse ring when recording */}
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-ring" />
        )}

        {/* Main button */}
        <button
          onMouseDown={handlePress}
          onMouseUp={handleRelease}
          onMouseLeave={handleRelease}
          onTouchStart={handlePress}
          onTouchEnd={handleRelease}
          disabled={disabled || isProcessing || isPlaying}
          className={cn(
            'relative rounded-full flex items-center justify-center shadow-strong transition-all active:scale-95 touch-manipulation',
            sizes[size],
            isRecording && 'animate-recording bg-gradient-to-br from-accent to-accent-600 shadow-glow-accent scale-110',
            isProcessing && 'bg-gradient-to-br from-gray-400 to-gray-500',
            isPlaying && 'bg-gradient-to-br from-success to-success-600',
            audioState === 'idle' && 'bg-gradient-to-br from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700',
            audioState === 'error' && 'bg-gradient-to-br from-red-500 to-red-600',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label={
            isRecording
              ? 'Relâchez pour arrêter'
              : isProcessing
                ? 'Traitement en cours'
                : 'Appuyez pour parler'
          }
        >
          {isProcessing ? (
            <Loader2 className={cn(iconSizes[size], 'text-white animate-spin')} />
          ) : isRecording ? (
            <Square className={cn(iconSizes[size], 'text-white')} />
          ) : (
            <Mic className={cn(iconSizes[size], 'text-white')} />
          )}
        </button>
      </div>

      {/* Status text */}
      <div className="mt-6 text-center">
        {isRecording ? (
          <div className="animate-fade-in">
            <p className="text-accent font-bold text-lg mb-1">
              {formatDuration(duration)}
            </p>
            <p className="text-gray-500 text-sm">Enregistrement en cours...</p>
          </div>
        ) : isProcessing ? (
          <div className="animate-fade-in">
            <p className="text-gray-700 font-semibold text-base">Traduction en cours...</p>
            <p className="text-gray-500 text-sm mt-1">Veuillez patienter</p>
          </div>
        ) : isPlaying ? (
          <div className="animate-fade-in">
            <p className="text-success-600 font-semibold text-base">Lecture audio...</p>
          </div>
        ) : audioState === 'error' ? (
          <div className="animate-fade-in">
            <p className="text-red-600 font-semibold text-base">Erreur</p>
            <p className="text-gray-500 text-sm mt-1">Réessayez</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <p className="text-gray-700 font-semibold text-base">Maintenez pour parler</p>
            <p className="text-gray-500 text-sm mt-1">Relâchez pour traduire</p>
          </div>
        )}
      </div>
    </div>
  );
}
