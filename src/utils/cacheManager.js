/**
 * cacheManager.js
 * 
 * Generic utility to manage the dual-layer cache strategy (Memory + localStorage)
 * per Golden Rule #2. Used across repositories to avoid duplicating caching logic.
 */

export function createCacheManager(key, ttlMs) {
  let _memCache = null;

  return {
    /**
     * Reads data from cache. Checks RAM first, then localStorage.
     * Returns null if cache is empty or expired.
     */
    read: () => {
      if (_memCache && Date.now() - _memCache.cachedAt < ttlMs) {
        return _memCache.data;
      }
      if (typeof window === 'undefined') return null;
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const { data, cachedAt } = JSON.parse(raw);
        if (Date.now() - cachedAt < ttlMs) {
          _memCache = { data, cachedAt };
          return data;
        }
      } catch (err) {
        console.warn(`[cacheManager] Error reading ${key} from localStorage:`, err);
      }
      return null;
    },

    /**
     * Writes data to RAM and localStorage.
     */
    write: (data) => {
      const entry = { data, cachedAt: Date.now() };
      _memCache = entry;
      if (typeof window !== 'undefined') {
        try {
          const stringified = JSON.stringify(entry);
          // Browsers typically limit localStorage to ~5MB. We leave some headroom.
          // If the payload is > 3MB (approx 3,000,000 characters), we skip localStorage and rely on RAM only.
          if (stringified.length > 3000000) {
            console.warn(`[cacheManager] Payload for ${key} is too large (${Math.round(stringified.length / 1024)}KB). Skipping localStorage to prevent QuotaExceededError.`);
          } else {
            localStorage.setItem(key, stringified);
          }
        } catch (err) {
          console.warn(`[cacheManager] Error writing ${key} to localStorage:`, err);
        }
      }
    },

    /**
     * Invalidates the cache for this key in both RAM and localStorage.
     */
    invalidate: () => {
      _memCache = null;
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(key);
        } catch (err) {
           console.warn(`[cacheManager] Error invalidating ${key} from localStorage:`, err);
        }
      }
    }
  };
}
