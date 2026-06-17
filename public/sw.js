const CACHE_NAME = 'sa-youth-v4';

// Install Event - Skip pre-caching to avoid install failures from cached 503s
// Assets are cached dynamically on first fetch instead
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v4...');
  // Force the new SW to activate immediately without waiting
  self.skipWaiting();
});

// Activate Event - Clean up ALL old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activated v4, claiming all clients...');
      return self.clients.claim();
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Only intercept same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // --- Navigation requests (SPA page loads) ---
  // Always go to network first; fall back to cached index.html when offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // --- Static asset requests (JS, CSS, images) ---
  // Network-first: serve fresh from network, cache on success, serve from cache if offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache valid same-origin responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline fallback: return cached version if available
        return caches.match(event.request);
      })
  );
});
