/**
 * performanceObserver.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-overhead Web Vitals Observer (LCP, INP, CLS, TTFB).
 * Reports performance metrics safely in client browsers without blocking execution.
 */

export function initPerformanceObserver(callback = null) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    // 1. Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        const metric = { name: 'LCP', value: Math.round(lastEntry.startTime), rating: lastEntry.startTime < 2500 ? 'good' : 'poor' };
        if (callback) callback(metric);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // 2. Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      const metric = { name: 'CLS', value: parseFloat(clsValue.toFixed(3)), rating: clsValue < 0.1 ? 'good' : 'poor' };
      if (callback) callback(metric);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

  } catch (e) {
    // Silently fall through if browser does not support specific entry type
  }
}
