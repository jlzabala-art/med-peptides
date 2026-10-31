'use client';

import { useTransition, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTE_ALIASES } from '../config/navigationRegistry';

/**
 * usePortalNavigation
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional navigation adapter with built-in Navigation Circuit Breaker.
 *
 * Guarantees that:
 * 1. Client-side transitions are clean and responsive.
 * 2. If Next.js App Router client transition stalls or hangs (>900ms),
 *    the Circuit Breaker automatically falls back to an instant native navigation,
 *    ensuring the operator is NEVER trapped on a frozen screen.
 * 3. Query string state in window.history is safely preserved.
 */
export function usePortalNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef(null);

  const resolveTargetUrl = useCallback((tabId) => {
    if (!tabId || tabId === 'dashboard' || tabId === 'overview') {
      return '/admin';
    }
    if (tabId === 'b2c-shop') {
      return '/';
    }
    if (tabId === 'pending-apis') {
      return '/admin/catalog?apiPlaceholder=Only APIs';
    }
    const resolvedId = ROUTE_ALIASES[tabId] || tabId;
    return `/admin/${resolvedId}`;
  }, []);

  const navigateTo = useCallback((tabId, options = {}) => {
    const targetUrl = resolveTargetUrl(tabId);
    const targetPathOnly = targetUrl.split('?')[0];

    // If already on the exact target path and no search query differences, avoid redundant hop
    if (pathname === targetPathOnly && !options.force) {
      if (typeof window !== 'undefined' && window.location.search) {
        // Clear lingering query params if clicking the same tab link (e.g. catalog?supplier=... -> catalog)
        window.history.replaceState({ ...(window.history.state || {}) }, '', targetPathOnly);
        window.location.assign(targetPathOnly);
      }
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // ── Navigation Circuit Breaker ───────────────────────────────────────────
    // If the soft transition has not reached target within 850ms, force instant native dispatch
    timeoutRef.current = setTimeout(() => {
      if (typeof window !== 'undefined' && window.location.pathname !== targetPathOnly) {
        console.warn(`[CircuitBreaker] Soft transition to ${targetUrl} took >850ms. Executing instant fallback.`);
        window.location.assign(targetUrl);
      }
    }, 850);

    // Standard Next.js client transition
    startTransition(() => {
      try {
        router.push(targetUrl);
      } catch (err) {
        console.error('[usePortalNavigation] Router push failed, activating native fallback:', err);
        window.location.assign(targetUrl);
      }
    });
  }, [pathname, resolveTargetUrl, router]);

  return {
    navigateTo,
    resolveTargetUrl,
    isPending,
    pathname
  };
}
