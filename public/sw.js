// ===========================================
// Service Worker - Speech To Talk PWA
// ===========================================

const CACHE_NAME = 'speech-to-talk-v2';
const TRANSLATION_CACHE_NAME = 'translations-v2';

// Static assets to cache on install (only truly static files, not HTML pages)
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/logo.png',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
];

// API routes that should use network-first strategy
const API_ROUTES = [
  '/api/',
  'supabase.co/functions',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== TRANSLATION_CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Check if this is an API request
  const isApiRequest = API_ROUTES.some((route) => request.url.includes(route));

  if (isApiRequest) {
    // Network-first for API requests
    event.respondWith(networkFirst(request));
  } else if (request.mode === 'navigate') {
    // Network-first for HTML pages (must go through middleware for auth)
    event.respondWith(networkFirst(request));
  } else if (request.destination === 'image') {
    // Cache-first for images
    event.respondWith(cacheFirst(request));
  } else if (url.pathname.startsWith('/_next/')) {
    // Stale-while-revalidate for Next.js assets
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Cache-first for other static assets
    event.respondWith(cacheFirst(request));
  }
});

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'OFFLINE',
        message: 'Vous êtes hors ligne. Cette fonctionnalité nécessite une connexion internet.',
      },
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, responseToCache);
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// Handle translation cache specifically
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_TRANSLATION') {
    const { key, data } = event.data;

    caches.open(TRANSLATION_CACHE_NAME)
      .then((cache) => {
        const response = new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' },
        });
        cache.put(key, response);
        console.log('[SW] Translation cached:', key);
      });
  }

  if (event.data && event.data.type === 'GET_CACHED_TRANSLATION') {
    const { key } = event.data;

    caches.open(TRANSLATION_CACHE_NAME)
      .then((cache) => cache.match(key))
      .then((response) => {
        if (response) {
          return response.json();
        }
        return null;
      })
      .then((data) => {
        event.ports[0].postMessage({ data });
      });
  }

  if (event.data && event.data.type === 'CLEAR_TRANSLATION_CACHE') {
    caches.delete(TRANSLATION_CACHE_NAME)
      .then(() => {
        console.log('[SW] Translation cache cleared');
        event.ports[0].postMessage({ success: true });
      });
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-translations') {
    console.log('[SW] Syncing translations...');
    event.waitUntil(syncPendingTranslations());
  }
});

async function syncPendingTranslations() {
  // Get pending translations from IndexedDB and sync them
  // This will be implemented when the offline queue is set up
  console.log('[SW] Background sync complete');
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Speech To Talk', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

console.log('[SW] Service Worker loaded');
