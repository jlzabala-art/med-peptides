/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';

/**
 * useMediaQuery Hook
 * @param {string} query - CSS Media Query (e.g., '(max-width: 768px)')
 * @returns {boolean} - True if query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
