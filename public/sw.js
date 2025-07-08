
const CACHE_NAME = 'numberguard-v3';  // Updated cache version
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
  // Don't cache Firebase API calls and other critical APIs
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('identitytoolkit.googleapis.com') || 
      event.request.url.includes('securetoken.googleapis.com')) {
    return;
  }
  
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

// Background sync registration
self.addEventListener('sync', function(event) {
  console.log('Background sync event triggered:', event.tag);
  
  if (event.tag === 'sync-contacts') {
    event.waitUntil(syncContacts());
  }
});

// Helper function to perform contact synchronization
async function syncContacts() {
  console.log('Starting background sync for contacts');
  
  // Notify all clients that a sync is needed
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_NEEDED',
        timestamp: new Date().getTime()
      });
    });
  });

  // Return success to resolve the event
  return Promise.resolve();
}

// Handle sync messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'REGISTER_SYNC') {
    console.log('Service Worker received register sync request');
    
    // Try to register for sync
    if ('SyncManager' in self) {
      self.registration.sync.register('sync-contacts')
        .then(() => {
          console.log('Sync registration successful');
          // Notify the client that sync was registered
          event.source.postMessage({
            type: 'SYNC_REGISTERED',
            success: true
          });
        })
        .catch(error => {
          console.error('Sync registration failed:', error);
          // Fallback for when sync registration fails
          syncContacts();
        });
    } else {
      console.log('Background Sync not supported, performing manual sync');
      // Fallback for browsers that don't support background sync
      syncContacts();
    }
  }
});
