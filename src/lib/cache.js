// src/lib/cache.js
// Simple cache utility implementing the 4‑layer strategy (RAM → localStorage → React‑Query → Firestore).
// This file provides minimal helpers used by repository classes. It does NOT depend on any UI framework.
// TTL values are in milliseconds.

export const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes – fast, in‑memory cache
const LS_TTL = 45 * 60 * 1000; // 45 minutes – persisted across page reloads

// In‑memory cache map: key -> { value, expiresAt }
const ramCache = new Map();

function now() {
  return Date.now();
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

// Lightweight EventEmitter / EventTarget for cross-layer cache sync (RAM -> LS -> React Query)
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
    // Also dispatch wildcard event
    if (event !== '*') {
      this.listeners.get('*')?.forEach(fn => {
        try { fn({ event, ...data }); } catch (e) {}
      });
    }
  }
}

export const cacheEventBus = new CacheEmitter();

/** Remove entry from RAM cache and notify subscribers */
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
  return `cache:${key}`;
}

export function getFromLocalStorage(key) {
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
    // Corrupted entry – clean up
    localStorage.removeItem(lsKey(key));
    return null;
  }
}

export function setInLocalStorage(key, value, ttl = LS_TTL) {
  try {
    const payload = { value, expiresAt: now() + ttl };
    localStorage.setItem(lsKey(key), JSON.stringify(payload));
  } catch (e) {
    // If storage quota is exceeded we silently ignore; the RAM cache still works.
  }
}

export function deleteFromLocalStorage(key) {
  try {
    localStorage.removeItem(lsKey(key));
  } catch (e) {
    // ignore
  }
}
