'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnlineStatus, useServiceWorker } from '@/hooks/useServiceWorker';

// ===========================================
// Offline Indicator Component
// ===========================================

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
      // Small delay for animation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOnline]);

  if (isOnline || dismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] transition-transform duration-300',
        isVisible ? 'translate-y-0' : '-translate-y-full'
      )}
    >
      <div className="bg-amber-500 dark:bg-amber-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Mode hors ligne</p>
              <p className="text-xs text-white/80">
                Certaines fonctionnalités sont limitées
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Update Available Banner
// ===========================================

export function UpdateAvailableBanner() {
  const { updateAvailable, update } = useServiceWorker();
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    await update();
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] max-w-lg mx-auto animate-slide-in-right">
      <div className="bg-primary dark:bg-primary-600 text-white rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <RefreshCw className={cn('w-5 h-5', isUpdating && 'animate-spin')} />
            <div>
              <p className="font-medium text-sm">Mise à jour disponible</p>
              <p className="text-xs text-white/80">
                Une nouvelle version est prête
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 text-sm font-medium hover:bg-white/20 rounded-lg transition-colors"
            >
              Plus tard
            </button>
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-3 py-1.5 text-sm font-medium bg-white text-primary rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// Combined Offline/Update Status
// ===========================================

export function ConnectionStatus() {
  return (
    <>
      <OfflineIndicator />
      <UpdateAvailableBanner />
    </>
  );
}

export default ConnectionStatus;
