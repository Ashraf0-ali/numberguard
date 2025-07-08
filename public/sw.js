const CACHE_NAME = 'numberguard-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache the app shell
self.addEventListener('install', event => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker installation failed:', error);
      })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim any clients that match the worker's scope
  self.clients.claim();
});

// Fetch event - respond with cached resources or fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise try to fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response or not a GET request
            if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
              return response;
            }

            // Clone the response because it's a stream that can only be consumed once
            const responseToCache = response.clone();
            
            // Add the new response to cache for future
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('Fetch failed; returning offline page instead.', error);
            // You could return a specific offline page here
            // return caches.match('/offline.html');
          });
      })
  );
});

// Handle offline syncing messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SYNC_CONTACTS') {
    console.log('Service Worker received sync request');
    // Notify all open clients that a sync is needed
    self.clients.matchAll()
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'TRIGGER_SYNC',
            timestamp: new Date().getTime()
          });
        });
      });
  }
});
