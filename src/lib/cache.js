// src/lib/cache.js
// Unified Repository Cache Engine implementing the 4‑layer strategy (RAM → localStorage → React‑Query → Firestore).
// Golden Rule #2 (Firestore es la Única Fuente de Verdad).
// Provides RAM (0ms) + LocalStorage with quota protection (600KB guard + auto-prune) + EventBus invalidation.

export const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes – fast, in‑memory cache
export const LS_TTL = 45 * 60 * 1000;         // 45 minutes – persisted across page reloads

// In‑memory cache map: key -> { value, expiresAt }
const ramCache = new Map();

function now() {
  return Date.now();
}

/**
 * Safely prunes older cache entries when localStorage space is low.
 */
function pruneOldCaches(currentKey) {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('cache:') || k.startsWith('regenpept_')) && k !== currentKey) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });
  } catch {}
}

/** Get value from RAM cache if present and not expired */
export function getCache(key) {
  const entry = ramCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < now()) {
    ramCache.delete(key);
    return null;
  }
  return entry.value;
}

/** Store value in RAM cache with TTL */
export function setCache(key, value, ttl = DEFAULT_TTL_MS) {
  ramCache.set(key, { value, expiresAt: now() + ttl });
}

// Lightweight EventEmitter for cross-layer cache sync (RAM -> LS -> React Query)
class CacheEmitter {
  constructor() {
    this.listeners = new Map();
  }
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) {
    this.listeners.get(event)?.delete(fn);
  }
  emit(event, data) {
    this.listeners.get(event)?.forEach(fn => {
      try { fn(data); } catch (e) { console.error('[CacheEmitter] Error in listener:', e); }
    });
    if (event !== '*') {
      this.listeners.get('*')?.forEach(fn => {
        try { fn({ event, ...data }); } catch (e) {}
      });
    }
  }
}

export const cacheEventBus = new CacheEmitter();

/** Remove entry from RAM cache, localStorage, and notify subscribers */
export function invalidateCache(key) {
  ramCache.delete(key);
  deleteFromLocalStorage(key);
  cacheEventBus.emit(`invalidate:${key}`, { key });
  cacheEventBus.emit('invalidate', { key });
}

/** Remove all entries with a given prefix and notify subscribers */
export function clearCacheNamespace(prefix) {
  for (const key of ramCache.keys()) {
    if (key.startsWith(prefix)) {
      ramCache.delete(key);
      deleteFromLocalStorage(key);
    }
  }
  cacheEventBus.emit(`clear:${prefix}`, { prefix });
  cacheEventBus.emit('clear', { prefix });
}

/** LocalStorage helper – wraps JSON + timestamp */
function lsKey(key) {
  return key.startsWith('cache:') ? key : `cache:${key}`;
}

export function getFromLocalStorage(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(lsKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expiresAt < now()) {
      localStorage.removeItem(lsKey(key));
      return null;
    }
    return parsed.value;
  } catch (e) {
    localStorage.removeItem(lsKey(key));
    return null;
  }
}

export function setInLocalStorage(key, value, ttl = LS_TTL) {
  if (typeof window === 'undefined') return;
  try {
    const payload = { value, expiresAt: now() + ttl };
    const stringified = JSON.stringify(payload);
    // Keep localStorage payloads under 600KB to prevent browser quota exhaustion
    if (stringified.length > 600000) return;
    try {
      localStorage.setItem(lsKey(key), stringified);
    } catch (storageErr) {
      pruneOldCaches(lsKey(key));
      try {
        localStorage.setItem(lsKey(key), stringified);
      } catch {}
    }
  } catch (e) {
    // Silent fallback to RAM
  }
}

export function deleteFromLocalStorage(key) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(lsKey(key));
  } catch {}
}

/**
 * Standardized Unified Repository Cache Factory.
 * Used across all domain repositories for 4-layer caching.
 *
 * @param {string} key - Unique cache namespace (e.g. 'products_active_catalog')
 * @param {number} ttlMs - Time-to-live in ms (default 5 mins)
 */
export function createRepositoryCache(key, ttlMs = DEFAULT_TTL_MS) {
  return {
    read: () => {
      // 1. RAM layer
      const memVal = getCache(key);
      if (memVal !== null) return memVal;

      // 2. LocalStorage layer
      const lsVal = getFromLocalStorage(key);
      if (lsVal !== null) {
        setCache(key, lsVal, ttlMs);
        return lsVal;
      }
      return null;
    },

    write: (data) => {
      setCache(key, data, ttlMs);
      setInLocalStorage(key, data, LS_TTL);
    },

    invalidate: () => {
      invalidateCache(key);
    },
  };
}

