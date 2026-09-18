/**
 * pdfPrefetch.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional low-priority background prefetcher for PDF monographs and assets.
 * Guarantees zero main-thread blockage while pre-warming the browser HTTP cache.
 */

const PREFETCHED_CACHE = new Set();

export function prefetchPdf(url) {
  if (!url || typeof window === 'undefined') return;
  if (PREFETCHED_CACHE.has(url)) return;
  PREFETCHED_CACHE.add(url);

  try {
    // 1. Try standard browser link prefetch hint
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  } catch {
    // 2. Fallback: low-priority background fetch
    if (typeof fetch === 'function') {
      fetch(url, { priority: 'low', credentials: 'same-origin' }).catch(() => {});
    }
  }
}

export default prefetchPdf;
