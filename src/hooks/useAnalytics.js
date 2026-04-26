/**
 * useAnalytics.js — Google Analytics 4 helpers (G-782K5END43)
 * Thin wrappers around window.gtag so components stay decoupled from GA.
 */

const GA_ID = 'G-782K5END43';

/** Fire a page_view event — call this on every SPA route change */
export function trackPageView(path, title) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path:     path,
    page_title:    title,
    page_location: window.location.href,
    send_to:       GA_ID,
  });
}

/**
 * Fire a custom GA4 event.
 * @param {string} eventName  - GA4 event name (snake_case)
 * @param {object} [params]   - Optional event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, { send_to: GA_ID, ...params });
}
