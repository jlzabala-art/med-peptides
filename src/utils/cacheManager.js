// Safely cleans older regenpept cache entries when localStorage space is low
function pruneOldCaches(currentKey) {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('regenpept_') && k !== currentKey) {
        keysToRemove.push(k);
      }
    }
    // Remove oldest/legacy cache keys to free quota
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
  } catch {}
}

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
        // Silently fallback if corrupted
      }
      return null;
    },

    /**
     * Writes data to RAM and localStorage with automatic quota management.
     */
    write: (data) => {
      const entry = { data, cachedAt: Date.now() };
      _memCache = entry;
      if (typeof window !== 'undefined') {
        try {
          const stringified = JSON.stringify(entry);
          // Keep localStorage payloads under 600KB to prevent browser quota exhaustion
          if (stringified.length > 600000) {
            // Relies safely on RAM Layer (Layer 1) per Golden Rule #2
            return;
          }
          try {
            localStorage.setItem(key, stringified);
          } catch (storageErr) {
            // On quota error, prune legacy caches and retry once
            pruneOldCaches(key);
            try {
              localStorage.setItem(key, stringified);
            } catch {
              // Silently fallback to RAM Layer 1 without breaking execution
            }
          }
        } catch {
          // Keep in RAM without breaking execution
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
        } catch {}
      }
    }
  };
}
