// Pilluna (App 2) Service Worker — pengingat jadwal harian
// File ini berada di `public/sw.js` sehingga tersedia di `<base>/sw.js`
// (mis. /app2/sw.js) setelah build.

const SCOPE = self.registration.scope;

const ICON_URL = new URL('icons/icon-192x192.png', SCOPE).href;
const DEFAULT_URL = new URL('user/dashboard', SCOPE).href;

// ── Lifecycle ───────────────────────────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// ── Web Push dari backend ───────────────────────────────────────────────────
self.addEventListener('push', event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : '' };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Pengingat Pilluna 💊', {
      body: payload.body || 'Waktunya menjalankan jadwal harianmu.',
      icon: ICON_URL,
      badge: ICON_URL,
      vibrate: [200, 100, 200, 100, 200],
      tag: payload.tag || undefined,
      data: {
        url: payload.url || DEFAULT_URL,
        dateOfArrival: Date.now(),
      },
    }),
  );
});

// ── Klik notifikasi ─────────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const targetUrl = new URL(event.notification.data?.url || DEFAULT_URL, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (!('focus' in client)) continue;
        if ('navigate' in client) {
          return client.navigate(targetUrl).then(navigated => (navigated || client).focus());
        }
        return client.focus();
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
