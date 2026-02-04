/* ============================================
   Shree Physiotherapy Clinic - Service Worker
   PWA with Offline Support and Notifications
   ============================================ */

const CACHE_NAME = 'shree-physio-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/book.html',
  '/dashboard.html',
  '/css/style.css',
  '/css/dashboard-calendar.css',
  '/js/main.js',
  '/js/booking.js',
  '/js/dashboard.js',
  '/js/pwa.js',
  '/a1.jpg',
  '/a2.jpg',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache (ensures latest content)
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Got network response - cache it and return
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed - try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Offline fallback for HTML pages
            if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'Shree Physiotherapy Clinic',
    body: 'You have a notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'notification'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/dashboard.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Periodic sync for appointment reminders (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'appointment-reminder-check') {
    event.waitUntil(checkAppointmentReminders());
  }
});

// Check for upcoming appointment reminders
async function checkAppointmentReminders() {
  try {
    // Get appointments from localStorage via message to client
    const clients = await self.clients.matchAll();
    if (clients.length === 0) return;

    clients[0].postMessage({
      type: 'CHECK_REMINDERS'
    });
  } catch (error) {
    console.log('[SW] Reminder check failed:', error);
  }
}

// Message event - receive data from main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    scheduleNotification(event.data.payload);
  }

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Schedule a notification
function scheduleNotification(data) {
  const { title, body, scheduledTime, tag } = data;
  const delay = new Date(scheduledTime).getTime() - Date.now();

  if (delay > 0) {
    setTimeout(() => {
      self.registration.showNotification(title, {
        body: body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: tag || 'reminder',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });
    }, delay);
  }
}
