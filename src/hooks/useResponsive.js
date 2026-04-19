import { useState, useEffect } from 'react';

/**
 * useResponsive — returns true while the viewport is BELOW the given breakpoint.
 * Subscribes to the MediaQueryList so the value updates without a page reload.
 *
 * @param {string} query  — any valid CSS media-query string
 *                          default: '(max-width: 767px)'
 */
export function useResponsive(query = '(max-width: 767px)') {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
    // Safari < 14 fallback
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, [query]);

  return matches;
}
