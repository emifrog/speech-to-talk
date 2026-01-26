'use client';

import { useState, useEffect, useCallback } from 'react';

// ===========================================
// Service Worker Registration Hook
// ===========================================

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
  error: Error | null;
}

interface UseServiceWorkerReturn extends ServiceWorkerState {
  update: () => Promise<void>;
  unregister: () => Promise<boolean>;
}

export function useServiceWorker(): UseServiceWorkerReturn {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    registration: null,
    updateAvailable: false,
    error: null,
  });

  // Check online status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => {
      setState((prev) => ({ ...prev, isOnline: navigator.onLine }));
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSupported = 'serviceWorker' in navigator;
    setState((prev) => ({ ...prev, isSupported }));

    if (!isSupported) {
      console.warn('[useServiceWorker] Service workers not supported');
      return;
    }

    // Don't register in development for easier debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[useServiceWorker] Skipping registration in development');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[useServiceWorker] Service worker registered:', registration.scope);

        setState((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[useServiceWorker] New version available');
                setState((prev) => ({ ...prev, updateAvailable: true }));
              }
            });
          }
        });

        // Listen for controlling service worker changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[useServiceWorker] Controller changed, reloading...');
          window.location.reload();
        });
      } catch (error) {
        console.error('[useServiceWorker] Registration failed:', error);
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error : new Error('Registration failed'),
        }));
      }
    };

    registerServiceWorker();
  }, []);

  // Update service worker
  const update = useCallback(async () => {
    if (!state.registration) return;

    try {
      await state.registration.update();

      if (state.registration.waiting) {
        state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (error) {
      console.error('[useServiceWorker] Update failed:', error);
    }
  }, [state.registration]);

  // Unregister service worker
  const unregister = useCallback(async () => {
    if (!state.registration) return false;

    try {
      const success = await state.registration.unregister();

      if (success) {
        setState((prev) => ({
          ...prev,
          isRegistered: false,
          registration: null,
        }));
      }

      return success;
    } catch (error) {
      console.error('[useServiceWorker] Unregister failed:', error);
      return false;
    }
  }, [state.registration]);

  return {
    ...state,
    update,
    unregister,
  };
}

// ===========================================
// Offline Detection Hook
// ===========================================

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ===========================================
// Service Worker Communication Utilities
// ===========================================

export async function sendMessageToSW<T>(message: unknown): Promise<T | null> {
  const controller = navigator.serviceWorker?.controller;
  if (!controller) {
    return null;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      resolve(event.data as T);
    };

    controller.postMessage(message, [messageChannel.port2]);
  });
}

export async function cacheTranslation(
  key: string,
  data: { text: string; translatedText: string; sourceLang: string; targetLang: string }
): Promise<void> {
  if (!navigator.serviceWorker?.controller) {
    return;
  }

  navigator.serviceWorker.controller.postMessage({
    type: 'CACHE_TRANSLATION',
    key,
    data,
  });
}

export async function getCachedTranslation(
  key: string
): Promise<{ text: string; translatedText: string } | null> {
  return sendMessageToSW<{ data: { text: string; translatedText: string } | null }>({
    type: 'GET_CACHED_TRANSLATION',
    key,
  }).then((result) => result?.data ?? null);
}

export async function clearTranslationCache(): Promise<boolean> {
  const result = await sendMessageToSW<{ success: boolean }>({
    type: 'CLEAR_TRANSLATION_CACHE',
  });

  return result?.success ?? false;
}
