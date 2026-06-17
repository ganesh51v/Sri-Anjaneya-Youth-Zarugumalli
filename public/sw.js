const CACHE_NAME = 'sa-youth-v5';

// ─── Install ───────────────────────────────────────────────────────────────
// Skip pre-caching entirely; assets are cached on first successful fetch.
// This avoids install failures caused by stale/broken previous SWs.
self.addEventListener('install', () => {
  console.log('[SW] v5 installing…');
  self.skipWaiting(); // take over immediately
});

// ─── Activate ──────────────────────────────────────────────────────────────
// Delete every cache that doesn't match our current version.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      ))
      .then(() => {
        console.log('[SW] v5 active — claiming all clients');
        return self.clients.claim();
      })
  );
});

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Always returns a Response — never undefined or a rejected promise. */
function safeCache(request) {
  return caches.match(request).then((cached) => cached || null);
}

/** Offline fallback page sent for navigation when index.html isn't cached. */
function offlinePage() {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="UTF-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <title>Sri Anjaneya Youth – Offline</title>
     <style>
       body{font-family:sans-serif;display:flex;flex-direction:column;
            align-items:center;justify-content:center;min-height:100vh;
            margin:0;background:#0b0f17;color:#faf7f0;text-align:center;gap:16px;}
       h1{color:#ff7700;font-size:2rem;}
       p{opacity:.7;max-width:320px;}
       button{padding:10px 24px;border:none;border-radius:8px;
              background:#ff7700;color:#fff;font-size:1rem;cursor:pointer;}
     </style></head>
     <body>
       <h1>🙏 You're Offline</h1>
       <p>Please check your internet connection and try again.</p>
       <button onclick="location.reload()">Retry</button>
     </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests from the same origin
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  // ── Navigation (page loads: /, /signin, /signup …) ──────────────────────
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() =>
          // Offline: try cached index.html, else show offline page
          safeCache('/index.html').then((cached) => cached || offlinePage())
        )
    );
    return;
  }

  // ── Static assets (JS, CSS, images, fonts) ───────────────────────────────
  // Network-first → cache on success → cache fallback → null (let browser handle)
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache valid same-origin responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        // Offline: return cached version if available
        safeCache(request).then((cached) => {
          if (cached) return cached;
          // Nothing cached — return a clean 503 so the browser doesn't hang
          return new Response('Resource unavailable offline.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        })
      )
  );
});
