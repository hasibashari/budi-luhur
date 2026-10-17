// PRELUNA PWA Service Worker v1
const CACHE_NAME = 'preluna-pwa-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// ============================================================
// LIFECYCLE: INSTALL & ACTIVATE
// ============================================================

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        // Precache error handled gracefully
        console.warn('[SW] Failed to precache some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ============================================================
// FETCH STRATEGY & OFFLINE FALLBACK
// ============================================================

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip dynamic API requests, server actions, and external origins
  if (url.pathname.startsWith('/api/') || url.origin !== self.origin) {
    return;
  }

  // 1. Navigation requests (HTML pages) -> Network first, fallback to cache, then offline.html (200 OK)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(event.request);
          if (cachedPage) {
            return cachedPage;
          }
          const offlineFallback = await caches.match(OFFLINE_URL);
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>PRELUNA Offline</title></head><body style="font-family:sans-serif;padding:2rem;text-align:center;"><h2>Anda sedang offline</h2><p>Silakan periksa koneksi internet Anda.</p></body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // 2. Static Assets (Icons, Images, Manifest) -> Cache first, fallback to network
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/screenshots/') ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 3. Other GET requests -> Stale-while-revalidate / Network first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// ============================================================
// BACKGROUND SYNC
// ============================================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-preluna-tt' || event.tag === 'sync-consumption') {
    event.waitUntil(
      // Trigger background sync task when back online
      Promise.resolve()
    );
  }
});

// ============================================================
// SKIP WAITING MESSAGE HANDLER
// ============================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================================
// WEB NOTIFICATIONS & PUSH HANDLERS
// ============================================================

// 1. Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/user/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if (client.url !== self.location.origin + targetUrl && 'navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 2. Server Push Event Handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {
    title: 'Pengingat Imunisasi TT PRELUNA',
    body: 'Waktunya memeriksa jadwal imunisasi Tetanus Toxoid atau kunjungan faskes Anda.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    url: '/user/dashboard',
  };

  try {
    const json = event.data.json();
    data = { ...data, ...json };
  } catch {
    data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'preluna-reminder',
    renotify: true,
    data: {
      url: data.url || '/user/dashboard',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Buka Jadwal' },
      { action: 'dismiss', title: 'Tutup' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
