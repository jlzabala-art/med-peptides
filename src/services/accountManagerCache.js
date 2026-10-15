/**
 * src/services/accountManagerCache.js
 * 
 * Multi-tier caching layer for Account Manager Console:
 * Layer 1: Memory RAM (0ms)
 * Layer 2: LocalStorage with schema versioning & TTL
 * Layer 3: Stale-while-revalidate background sync
 * Layer 4: Authoritative Firestore fallback
 */

const CACHE_KEY = 'atlas_am_cache_v2';
const TTL_MS = 60 * 60 * 1000; // 60 minutes

// Layer 1: In-Memory RAM Cache
let memCache = null;
let memCacheTimestamp = 0;

export function getCachedAMData() {
  const now = Date.now();

  // 1. Check RAM
  if (memCache && (now - memCacheTimestamp < 5 * 60 * 1000)) {
    return { data: memCache, from: 'RAM' };
  }

  // 2. Check LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.timestamp && (now - parsed.timestamp < TTL_MS)) {
          memCache = parsed.data;
          memCacheTimestamp = parsed.timestamp;
          return { data: parsed.data, from: 'LocalStorage' };
        }
      }
    } catch (e) {
      console.warn('[AM Cache] LocalStorage read error:', e);
    }
  }

  return { data: null, from: 'None' };
}

export function setCachedAMData(data) {
  const now = Date.now();
  memCache = data;
  memCacheTimestamp = now;

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: now,
        data
      }));
    } catch (e) {
      console.warn('[AM Cache] LocalStorage write error:', e);
    }
  }
}

export function purgeAMCache() {
  memCache = null;
  memCacheTimestamp = 0;
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem('cached_doctors');
      localStorage.removeItem('cached_prescriptions');
      localStorage.removeItem('cached_patients');
      sessionStorage.clear();
    } catch (e) {
      console.warn('[AM Cache] LocalStorage purge error:', e);
    }
  }
}
