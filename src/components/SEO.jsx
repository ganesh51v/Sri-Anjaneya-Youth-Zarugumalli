import { useEffect } from 'react';

const BASE_TITLE = 'Sri Anjaneya Youth Zarugumalli';
const BASE_URL   = 'https://sri-anjaneya-youth-zarugumalli.web.app';
const BASE_IMAGE = `${BASE_URL}/icon.png`;

/**
 * SEO component — updates document <title> and <meta> tags dynamically per page.
 * Renders nothing to the DOM; only manipulates <head>.
 *
 * Usage:
 *   <SEO
 *     title="Events"
 *     description="Upcoming cultural and seva events by Sri Anjaneya Youth Zarugumalli."
 *     path="/events"
 *   />
 */
const SEO = ({ title, description, path = '/', image }) => {
  useEffect(() => {
    const fullTitle  = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Seva, Culture & Community`;
    const fullUrl    = `${BASE_URL}${path}`;
    const fullImage  = image || BASE_IMAGE;

    // ---------- <title> ----------
    document.title = fullTitle;

    // ---------- helper ----------
    const setMeta = (selector, attr, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        // split selector like 'meta[property="og:title"]'
        const [, attrName, , attrVal] = selector.match(/\[(\w+)="([^"]+)"\]/) || [];
        if (attrName) el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // ---------- Standard ----------
    setMeta('meta[name="description"]',                'content', description || '');
    setLink('canonical', fullUrl);

    // ---------- Open Graph ----------
    setMeta('meta[property="og:title"]',               'content', fullTitle);
    setMeta('meta[property="og:description"]',         'content', description || '');
    setMeta('meta[property="og:url"]',                 'content', fullUrl);
    setMeta('meta[property="og:image"]',               'content', fullImage);

    // ---------- Twitter ----------
    setMeta('meta[name="twitter:title"]',              'content', fullTitle);
    setMeta('meta[name="twitter:description"]',        'content', description || '');
    setMeta('meta[name="twitter:image"]',              'content', fullImage);

  }, [title, description, path, image]);

  return null;
};

export default SEO;
