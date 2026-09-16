/**
 * apiConfig.js
 * Centralized API base URL resolver.
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
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : /;
  return ${base};
};
