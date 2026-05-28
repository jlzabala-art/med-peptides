 
import { useEffect } from 'react';

const BASE_TITLE = 'Med-Peptides';
const BASE_URL = 'https://Med-Peptides.com';
const DEFAULT_IMAGE = 'https://Med-Peptides.com/og-premium.png';

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
export function usePageMeta({ title, description, path = '', image, structuredData } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Premium Peptides, Supplements & Protocols`;
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

    // --- OG tags (upsert — create if not already in DOM) ---
    const setOg = (property, value) => {
      if (!value) return;
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };
    setOg('og:title', fullTitle);
    setOg('og:description', description);
    setOg('og:url', canonical);
    setOg('og:image', image || DEFAULT_IMAGE);
    setOg('og:type', 'website');
    setOg('og:site_name', 'Med-Peptides');

    // --- Twitter (upsert — create if not already in DOM) ---
    const setTw = (name, value) => {
      if (!value) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };
    setTw('twitter:card', 'summary_large_image');
    setTw('twitter:title', fullTitle);
    setTw('twitter:description', description);
    setTw('twitter:image', image || DEFAULT_IMAGE);
    setTw('twitter:url', canonical);

    // --- JSON-LD (Structured Data) ---
    let ldJsonEl = document.querySelector('script[id="dynamic-ld-json"]');
    
    if (structuredData) {
      if (!ldJsonEl) {
        ldJsonEl = document.createElement('script');
        ldJsonEl.setAttribute('type', 'application/ld+json');
        ldJsonEl.setAttribute('id', 'dynamic-ld-json');
        document.head.appendChild(ldJsonEl);
      }
      ldJsonEl.textContent = JSON.stringify(structuredData);
    } else if (ldJsonEl) {
      // Remove it if no structured data is provided for this page
      ldJsonEl.remove();
    }

    // Cleanup: restore defaults on unmount
    return () => {
      document.title = `${BASE_TITLE} | Premium Peptides, Supplements & Protocols`;
      const dynamicLd = document.querySelector('script[id="dynamic-ld-json"]');
      if (dynamicLd) dynamicLd.remove();
    };
  }, [title, description, path, image, JSON.stringify(structuredData)]);
}
