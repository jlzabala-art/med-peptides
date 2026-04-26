import { useEffect } from 'react';

const BASE_TITLE = 'Med-Peptides';
const BASE_URL = 'https://med-peptides-app-27a3a.web.app';

/**
 * usePageMeta — Updates <title>, <meta description>, and <link canonical>
 * dynamically on each view change. Resets to defaults on unmount.
 *
 * @param {Object} options
 * @param {string} options.title       - Page-specific title (appended to brand)
 * @param {string} options.description - Meta description for this page
 * @param {string} [options.path]      - URL path for canonical (e.g. '/products')
 * @param {string} [options.image]     - Absolute OG image URL override
 */
export function usePageMeta({ title, description, path = '', image } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Premium Research Compounds & Analytical Materials`;
    const canonical = `${BASE_URL}${path}`;

    // --- title ---
    document.title = fullTitle;

    // --- meta description ---
    let descEl = document.querySelector('meta[name="description"]');
    if (descEl && description) descEl.setAttribute('content', description);

    // --- canonical ---
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonical);

    // --- OG tags ---
    const setOg = (property, value) => {
      const el = document.querySelector(`meta[property="${property}"]`);
      if (el && value) el.setAttribute('content', value);
    };
    setOg('og:title', fullTitle);
    setOg('og:description', description);
    setOg('og:url', canonical);
    if (image) setOg('og:image', image);

    // --- Twitter ---
    const setTw = (name, value) => {
      const el = document.querySelector(`meta[property="${name}"]`);
      if (el && value) el.setAttribute('content', value);
    };
    setTw('twitter:title', fullTitle);
    setTw('twitter:description', description);
    setTw('twitter:url', canonical);

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = `${BASE_TITLE} | Premium Research Compounds & Analytical Materials`;
    };
  }, [title, description, path, image]);
}
