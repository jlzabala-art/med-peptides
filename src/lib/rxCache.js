/**
 * rxCache.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Global in-memory cache shared across Next.js Server Components and API Routes.
 * Uses globalThis to ensure cache invalidation in API routes immediately purges
 * the RAM cache in page.jsx.
 * ─────────────────────────────────────────────────────────────────────────────
 */

if (!globalThis.__RX_RAM_CACHE__) {
  globalThis.__RX_RAM_CACHE__ = new Map();
}

export const RX_RAM_CACHE = globalThis.__RX_RAM_CACHE__;
export const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function invalidateRxCache(code) {
  if (!code) {
    RX_RAM_CACHE.clear();
    return;
  }

  const rawCode = String(code).trim();
  const upperCode = decodeURIComponent(rawCode).trim().toUpperCase();
  const strippedCode = upperCode.replace(/^RX-/, '');
  const prefixedCode = upperCode.startsWith('RX-') ? upperCode : `RX-${upperCode}`;

  RX_RAM_CACHE.delete(rawCode);
  RX_RAM_CACHE.delete(upperCode);
  RX_RAM_CACHE.delete(strippedCode);
  RX_RAM_CACHE.delete(prefixedCode);
}
