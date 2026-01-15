// Service Worker for PWA - Progressive Web App
// Version 1.0.0

const CACHE_NAME = 'change-your-life-v1';
const DYNAMIC_CACHE = 'change-dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/protocol.html',
    '/game.html',
    '/styles/design-system.css',
    '/styles/animations.css',
    '/styles/main.css',
    '/js/storage.js',
    '/js/protocol.js',
    '/js/main.js',
    '/js/protocol-ui.js',
    '/manifest.json',
    // Add your other essential files
];

// Install Event - Cache static files
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[Service Worker] Installed successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name !== CACHE_NAME && name !== DYNAMIC_CACHE;
                        })
                        .map((name) => {
                            console.log('[Service Worker] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip cross-origin requests
    if (!request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[Service Worker] Serving from cache:', request.url);
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(request)
                    .then((networkResponse) => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }

                        // Clone the response
                        const responseToCache = networkResponse.clone();

                        // Add to dynamic cache
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', error);

                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }

                        throw error;
                    });
            })
    );
});

// Background Sync - للمزامنة عند عودة الاتصال
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-answers') {
        event.waitUntil(syncAnswers());
    }
});

async function syncAnswers() {
    // Sync user answers when online
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        // Implement your sync logic here
        console.log('[Service Worker] Syncing answers...');
    } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
    }
}

// Push Notifications
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received');

    const options = {
        body: event.data ? event.data.text() : 'إشعار جديد!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'open',
                title: 'فتح',
                icon: '/icons/open.png'
            },
            {
                action: 'close',
                title: 'إغلاق',
                icon: '/icons/close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('تحويل حياتك', options)
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');

    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message Event - للتواصل مع الصفحة الرئيسية
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                    return cache.addAll(event.data.urls);
                })
        );
    }
});

// Periodic Background Sync (للإشعارات اليومية)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'daily-reminder') {
        event.waitUntil(sendDailyReminder());
    }
});

async function sendDailyReminder() {
    const lastVisit = await getLastVisit();
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (now - lastVisit > oneDayInMs) {
        await self.registration.showNotification('تحويل حياتك', {
            body: 'لم نرك منذ يوم! واصل رحلتك 🚀',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png'
        });
    }
}

async function getLastVisit() {
    // Implement logic to get last visit time
    return Date.now();
}
