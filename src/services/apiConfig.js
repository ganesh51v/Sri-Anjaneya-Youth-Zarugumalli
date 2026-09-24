/**
 * apiConfig.js
 * Centralized API base URL resolver and automatic request router.
 * When hosted on Firebase Hosting (*.web.app, *.firebaseapp.com) or localhost,
 * API requests target the deployed Vercel serverless backend.
 * When hosted on Vercel (*.vercel.app), relative paths are used.
 */

export const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return '';
  }
  return 'https://sri-anjaneya-youth-zarugumalli.vercel.app';
};

export const getApiUrl = (endpoint) => {
  const base = getApiBase();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
};

// Seamless global proxy for /api/* requests on Firebase Hosting / non-Vercel domains
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      const base = getApiBase();
      if (base) {
        if (typeof input === 'string') {
          if (input.startsWith('/api/')) {
            input = `${base}${input}`;
          } else if (input.startsWith(window.location.origin + '/api/')) {
            input = input.replace(window.location.origin, base);
          }
        } else if (input instanceof Request) {
          const url = input.url;
          if (url.startsWith('/api/')) {
            input = new Request(`${base}${url}`, input);
          } else if (url.startsWith(window.location.origin + '/api/')) {
            input = new Request(url.replace(window.location.origin, base), input);
          }
        } else if (input instanceof URL) {
          if (input.pathname.startsWith('/api/') && input.origin === window.location.origin) {
            input = new URL(`${base}${input.pathname}${input.search}`);
          }
        }
      }
    } catch {
      // Fallback to original input if any error occurs during URL resolution
    }
    return originalFetch.call(this, input, init);
  };
}
