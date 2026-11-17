// Service Worker for FEMORY App1 PWA & Real-Time Alarm Notifications
const CACHE_NAME = 'femory-app1-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push notifications from backend scheduler / admin nudges
self.addEventListener('push', (event) => {
  let data = {
    title: 'Waktunya Minum TTD! 🌸',
    body: 'Jadwal minum Tablet Tambah Darah telah tiba. Yuk catat sekarang!',
    url: '/user/dashboard',
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (err) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    // Strong vibrating pattern for alarm
    vibrate: [500, 200, 500, 200, 500, 200, 500],
    requireInteraction: true, // Keep notification on screen until user acts
    tag: 'femory-ttd-alarm',
    renotify: true,
    data: {
      url: data.url || '/user/dashboard',
      actionUrl: data.url || '/user/dashboard',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'take_ttd', title: 'Sudah Minum TTD 🌸' },
      { action: 'dismiss_alarm', title: 'Matikan Alarm 🔕' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// Handle user interaction with notification and buttons
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const targetUrl = event.notification.data?.url || '/user/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and post action message
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({
            type: 'ALARM_ACTION',
            action: action || 'open',
            url: targetUrl,
          });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
