 
/**
 * useHeaderHeight — v1
 *
 * Returns the current height (in pixels) of the sticky site header.
 *
 * - Reads from window.APP_HEADER_HEIGHT if the root effect already set it.
 * - Falls back to querying the DOM directly via ResizeObserver.
 * - Updates on resize so it works with responsive headers that shrink/grow.
 *
 * Usage:
 *   const headerHeight = useHeaderHeight();
 *   window.scrollTo({ top: rect.top + scrollY - headerHeight - 16 });
 */

import { useState, useEffect } from 'react';

const FALLBACK_HEIGHT = 80; // matches --header-height token in tokens.css

export function useHeaderHeight() {
  const [height, setHeight] = useState(
    () => window.APP_HEADER_HEIGHT ?? FALLBACK_HEIGHT
  );

  useEffect(() => {
    const header = document.querySelector('header, .site-header');
    if (!header) return;

    const update = () => {
      const h = header.offsetHeight || FALLBACK_HEIGHT;
      window.APP_HEADER_HEIGHT = h;
      setHeight(h);
    };

    update(); // initial read

    const ro = new ResizeObserver(update);
    ro.observe(header);

    return () => ro.disconnect();
  }, []);

  return height;
}
