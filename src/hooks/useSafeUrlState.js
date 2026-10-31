'use client';

import { useCallback } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

/**
 * safeReplaceState
 * Safely updates window.location without erasing Next.js internal router state.
 * Never passes null or raw empty objects to replaceState.
 */
export function safeReplaceState(newUrl) {
  if (typeof window === 'undefined') return;
  try {
    const currentState = window.history.state || {};
    window.history.replaceState({ ...currentState }, '', newUrl);
  } catch (err) {
    console.warn('[safeReplaceState] Failed to replace state safely:', err);
  }
}

/**
 * useSafeUrlState
 * Institutional URL state adapter for Next.js App Router (React 19).
 * Guarantees that query string modifications never corrupt __PRIVATE_NEXTJS_INTERNALS_TREE
 * or trigger uncoordinated synthetic popstate cascades that break sidebar navigation.
 */
export function useSafeUrlState() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const getParam = useCallback((key, fallback = null) => {
    if (searchParams) {
      return searchParams.get(key) ?? fallback;
    }
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get(key) ?? fallback;
    }
    return fallback;
  }, [searchParams]);

  const setParam = useCallback((key, value, options = {}) => {
    if (typeof window === 'undefined') return;
    try {
      const currentParams = new URLSearchParams(window.location.search);
      if (value !== undefined && value !== null && value !== '') {
        currentParams.set(key, String(value));
      } else {
        currentParams.delete(key);
      }

      const qs = currentParams.toString();
      const currentBase = pathname || window.location.pathname;
      const newUrl = qs ? `${currentBase}?${qs}` : currentBase;

      if (options.useRouter) {
        router.replace(newUrl, { scroll: false });
      } else {
        safeReplaceState(newUrl);
      }
    } catch (err) {
      console.warn('[useSafeUrlState] setParam error:', err);
    }
  }, [pathname, router]);

  const setParams = useCallback((paramMap, options = {}) => {
    if (typeof window === 'undefined') return;
    try {
      const currentParams = new URLSearchParams(window.location.search);
      Object.entries(paramMap).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          currentParams.set(key, String(value));
        } else {
          currentParams.delete(key);
        }
      });

      const qs = currentParams.toString();
      const currentBase = pathname || window.location.pathname;
      const newUrl = qs ? `${currentBase}?${qs}` : currentBase;

      if (options.useRouter) {
        router.replace(newUrl, { scroll: false });
      } else {
        safeReplaceState(newUrl);
      }
    } catch (err) {
      console.warn('[useSafeUrlState] setParams error:', err);
    }
  }, [pathname, router]);

  const removeParam = useCallback((key, options = {}) => {
    setParam(key, null, options);
  }, [setParam]);

  const clearAll = useCallback((preserveKeys = [], options = {}) => {
    if (typeof window === 'undefined') return;
    try {
      const currentParams = new URLSearchParams(window.location.search);
      const newParams = new URLSearchParams();

      preserveKeys.forEach((key) => {
        if (currentParams.has(key)) {
          newParams.set(key, currentParams.get(key));
        }
      });

      const qs = newParams.toString();
      const currentBase = pathname || window.location.pathname;
      const newUrl = qs ? `${currentBase}?${qs}` : currentBase;

      if (options.useRouter) {
        router.replace(newUrl, { scroll: false });
      } else {
        safeReplaceState(newUrl);
      }
    } catch (err) {
      console.warn('[useSafeUrlState] clearAll error:', err);
    }
  }, [pathname, router]);

  return {
    getParam,
    setParam,
    setParams,
    removeParam,
    clearAll,
    searchParams,
    pathname
  };
}

