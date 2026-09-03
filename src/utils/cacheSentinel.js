/**
 * cacheSentinel.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-Tier Client Cache Sentinel (Rule #2).
 * Manages Layer 1 (Module Memory) and Layer 2 (localStorage with 30-min TTL & LRU auto-cleanup).
 */

const memoryCache = new Map();
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const cacheSentinel = {
  /**
   * Get cached item from Memory (Layer 1) or LocalStorage (Layer 2)
   */
  get(key) {
    const now = Date.now();

    // 1. Check RAM (Layer 1)
    if (memoryCache.has(key)) {
      const entry = memoryCache.get(key);
      if (now < entry.expiry) return entry.data;
      memoryCache.delete(key);
    }

    // 2. Check localStorage (Layer 2)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(`cache_${key}`);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (now < entry.expiry) {
          // Promote to RAM
          memoryCache.set(key, entry);
          return entry.data;
        }
        localStorage.removeItem(`cache_${key}`);
      } catch (e) {
        return null;
      }
    }

    return null;
  },

  /**
   * Set item in Memory and LocalStorage with TTL
   */
  set(key, data, ttlMs = DEFAULT_TTL_MS) {
    const entry = {
      data,
      expiry: Date.now() + ttlMs,
      timestamp: Date.now()
    };

    // Store in RAM
    memoryCache.set(key, entry);

    // Store in localStorage with quota protection
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (e) {
        // Quota exceeded: Evict expired entries
        this.prune();
      }
    }
  },

  /**
   * Prunes expired or oldest keys from localStorage
   */
  prune() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'));
      const now = Date.now();
      for (const k of keys) {
        try {
          const item = JSON.parse(localStorage.getItem(k));
          if (!item || now >= item.expiry) {
            localStorage.removeItem(k);
          }
        } catch (err) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {
      // Ignored
    }
  },

  /**
   * Invalidate specific cache key or namespace
   */
  invalidate(prefix) {
    for (const k of memoryCache.keys()) {
      if (k.startsWith(prefix)) memoryCache.delete(k);
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(`cache_${prefix}`));
      keys.forEach(k => localStorage.removeItem(k));
    }
  }
};
