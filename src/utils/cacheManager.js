/**
 * src/utils/cacheManager.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Delegates to UnifiedRepositoryCache engine in src/lib/cache.js (Golden Rule #2).
 * Preserves 100% backward compatibility for existing repository callers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createRepositoryCache } from '../lib/cache';

export function createCacheManager(key, ttlMs) {
  return createRepositoryCache(key, ttlMs);
}

