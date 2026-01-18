import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ===========================================
// Classe utilitaire pour Tailwind
// ===========================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===========================================
// Formatage
// ===========================================
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// ===========================================
// Audio Helpers
// ===========================================
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const buffer = base64ToArrayBuffer(base64);
  return new Blob([buffer], { type: mimeType });
}

// ===========================================
// Génération d'ID
// ===========================================
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===========================================
// Debounce / Throttle
// ===========================================
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// ===========================================
// Vérification du support navigateur
// ===========================================
export function checkBrowserSupport(): {
  microphone: boolean;
  camera: boolean;
  webAudio: boolean;
  mediaRecorder: boolean;
} {
  return {
    microphone: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    camera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    webAudio: !!(window.AudioContext || (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext),
    mediaRecorder: typeof MediaRecorder !== 'undefined',
  };
}

// ===========================================
// Gestion des erreurs
// ===========================================
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Une erreur inattendue est survenue';
}

// ===========================================
// Hash helpers
// ===========================================
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash un texte pour le cache de traduction
 * Normalise le texte (lowercase + trim) avant le hash
 */
export async function hashText(text: string): Promise<string> {
  const normalized = text.toLowerCase().trim();
  return sha256(normalized);
}

// ===========================================
// Storage helpers
// ===========================================
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Error saving to localStorage');
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      console.error('Error removing from localStorage');
    }
  },
};
