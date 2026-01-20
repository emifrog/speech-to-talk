'use client';

import { cn, formatDuration } from '@/lib/utils';
import { startRecordingHaptic, stopRecordingHaptic, errorHaptic } from '@/lib/haptics';
import { Mic, Square, Loader2 } from 'lucide-react';
import type { AudioState } from '@/types';

// ===========================================
// Microphone Button Component - Glassmorphism
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
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-36 h-36',
  };

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const ringSize = {
    sm: 'w-28 h-28',
    md: 'w-36 h-36',
    lg: 'w-40 h-40',
  };

  return (
    <div className="flex flex-col items-center">
      {/* Outer glow ring */}
      <div className="relative flex items-center justify-center">
        {/* Animated pulse rings */}
        {isRecording && (
          <>
            <div className={cn(
              'absolute rounded-full bg-accent/30 animate-pulse-ring',
              ringSize[size]
            )} />
            <div className={cn(
              'absolute rounded-full bg-accent/20 animate-pulse-ring',
              ringSize[size]
            )} style={{ animationDelay: '0.5s' }} />
          </>
        )}

        {/* Idle state glow */}
        {audioState === 'idle' && !disabled && (
          <div className={cn(
            'absolute rounded-full bg-primary/20 animate-pulse',
            ringSize[size]
          )} />
        )}

        {/* Glass container */}
        <div className={cn(
          'relative rounded-full p-1.5',
          'bg-white/30 dark:bg-white/10 backdrop-blur-xl',
          'border border-white/50 dark:border-white/20',
          'shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)]'
        )}>
          {/* Main button */}
          <button
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onMouseLeave={handleRelease}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
            disabled={disabled || isProcessing || isPlaying}
            className={cn(
              'relative rounded-full flex items-center justify-center transition-all duration-300 touch-manipulation',
              sizes[size],
              // Idle state - gradient with glow
              audioState === 'idle' && 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:shadow-[0_0_40px_rgba(37,99,235,0.7)] hover:scale-105 active:scale-95',
              // Recording state - accent gradient with intense glow
              isRecording && 'animate-recording bg-gradient-to-br from-accent-500 via-accent-600 to-accent-700 shadow-[0_0_50px_rgba(220,38,38,0.6)] scale-105',
              // Processing state - subtle gradient
              isProcessing && 'bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 shadow-[0_0_20px_rgba(100,116,139,0.4)]',
              // Playing state - success gradient
              isPlaying && 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]',
              // Error state - red gradient
              audioState === 'error' && 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)]',
              // Disabled state
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
            {/* Inner glow overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/30" />

            {/* Icon */}
            {isProcessing ? (
              <Loader2 className={cn(iconSizes[size], 'text-white animate-spin drop-shadow-lg relative z-10')} />
            ) : isRecording ? (
              <Square className={cn(iconSizes[size], 'text-white drop-shadow-lg relative z-10')} />
            ) : (
              <Mic className={cn(iconSizes[size], 'text-white drop-shadow-lg relative z-10')} />
            )}
          </button>
        </div>
      </div>

      {/* Status text */}
      <div className="mt-8 text-center">
        {isRecording ? (
          <div className="animate-fade-in">
            <p className="text-gradient-accent font-bold text-2xl mb-1">
              {formatDuration(duration)}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Enregistrement en cours...</p>
          </div>
        ) : isProcessing ? (
          <div className="animate-fade-in">
            <p className="text-slate-700 dark:text-slate-200 font-semibold text-base">Traduction en cours...</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Veuillez patienter</p>
          </div>
        ) : isPlaying ? (
          <div className="animate-fade-in">
            <p className="text-emerald-500 font-semibold text-base">Lecture audio...</p>
          </div>
        ) : audioState === 'error' ? (
          <div className="animate-fade-in">
            <p className="text-red-500 font-semibold text-base">Erreur</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Réessayez</p>
          </div>
        ) : (
          <div className="animate-fade-in">
            <p className="text-slate-700 dark:text-slate-200 font-semibold text-base">Maintenez pour parler</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Relâchez pour traduire</p>
          </div>
        )}
      </div>
    </div>
  );
}
