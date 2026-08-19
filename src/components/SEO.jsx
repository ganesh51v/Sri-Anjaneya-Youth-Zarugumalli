import { useEffect } from 'react';

const BASE_TITLE = 'Sri Anjaneya Youth Zarugumalli';
const BASE_URL   = 'https://sri-anjaneya-youth-zarugumalli.vercel.app';
const BASE_IMAGE = `${BASE_URL}/icon.png`;

/**
 * Advanced SEO Component — dynamically updates document <title>, <meta> tags,
 * canonical link, Open Graph, Twitter Cards, robots directives, and JSON-LD schema per page.
 *
 * @param {Object} props
 * @param {string} [props.title] - Page title (will be suffixed with BASE_TITLE)
 * @param {string} [props.description] - SEO meta description
 * @param {string} [props.path] - Canonical route path (e.g. '/events')
 * @param {string} [props.image] - Custom Open Graph image URL
 * @param {string} [props.type] - Open Graph type ('website', 'article', 'profile', etc.)
 * @param {boolean} [props.noindex] - Whether to disallow search engine indexation
 * @param {Object|Array} [props.schema] - Optional JSON-LD structured data object or array
 */
const SEO = ({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
  schema = null
}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Seva, Culture & Community Zarugumalli`;
    // Clean path and ensure valid absolute canonical URL
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = cleanPath === '/' ? BASE_URL : `${BASE_URL}${cleanPath}`;
    const fullImage = image || BASE_IMAGE;

    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to safely set or create meta elements
    const setMeta = (selector, attr, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const match = selector.match(/\[(\w+)="([^"]+)"\]/);
        const attrName = match?.[1];
        const attrVal = match?.[2];
        if (attrName && attrVal) el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    // Helper to safely set or create link elements
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // 2. Standard Search Meta Tags
    setMeta('meta[name="description"]', 'content', description || 'Sri Anjaneya Youth Association of Zarugumalli — youth community dedicated to temple seva, festivals, annadanam, blood donation, and village empowerment.');
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setLink('canonical', fullUrl);

    // 3. Open Graph (Facebook, WhatsApp, LinkedIn)
    setMeta('meta[property="og:site_name"]', 'content', BASE_TITLE);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description || 'Sri Anjaneya Youth Association of Zarugumalli — dedicated to temple seva, cultural events, and community development.');
    setMeta('meta[property="og:url"]', 'content', fullUrl);
    setMeta('meta[property="og:image"]', 'content', fullImage);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:locale"]', 'content', 'en_IN');

    // 4. Twitter / X Card Meta Tags
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', description || 'Sri Anjaneya Youth Association Zarugumalli — Seva, Culture, Community.');
    setMeta('meta[name="twitter:image"]', 'content', fullImage);

    // 5. Dynamic Page-Level JSON-LD Structured Data Injection
    const SCRIPT_ID = 'page-jsonld-schema';
    let scriptEl = document.getElementById(SCRIPT_ID);

    if (schema) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = SCRIPT_ID;
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(schema);
    } else if (scriptEl) {
      // Remove stale schema if this page doesn't supply one
      scriptEl.remove();
    }

    return () => {
      // Cleanup custom page schema on unmount
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) existing.remove();
    };
  }, [title, description, path, image, type, noindex, schema]);

  return null;
};

export default SEO;
