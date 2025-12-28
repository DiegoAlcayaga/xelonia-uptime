// Service Worker for XELONIA uptime PWA
const CACHE_NAME = 'xelonia-v2';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './logo.jpg',
    './icon-192.png',
    './icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control immediately
    );
});

// Fetch event - Network First, fallback to Cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone the response
                const responseToCache = response.clone();

                // Update cache with fresh content
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // Network failed, try cache
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            console.log('[SW] Serving from cache:', event.request.url);
                            return response;
                        }
                        // If not in cache, return offline page or error
                        return new Response('Offline - No cached version available', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Push notification event (for future use with Firebase)
self.addEventListener('push', event => {
    console.log('[SW] Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación de XELONIA',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'xelonia-notification',
        requireInteraction: true
    };

    event.waitUntil(
        self.registration.showNotification('XELONIA uptime', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked');
    event.notification.close();

    event.waitUntil(
        clients.openWindow('./')
    );
});

// Background sync (for offline actions)
self.addEventListener('sync', event => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-ots') {
        event.waitUntil(syncOTs());
    }
});

function syncOTs() {
    // Placeholder for syncing OTs when back online
    console.log('[SW] Syncing OTs...');
    return Promise.resolve();
}
