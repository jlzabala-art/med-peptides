'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * AtlasContextProvider
 * ─────────────────────────────────────────────────────────────────────────────
 * Single unified screen-context registry for Atlas AI across all public and
 * portal routes (Golden Rule #67). Any page or module can register live
 * entity/catalog/role/currency metadata via `useRegisterAtlasContext(ctx)` or
 * the `set-public-atlas-context` / `atlas-register-context` events.
 */
const RECENT_ITEMS_KEY = 'atlas_recent_items_v1';
const MAX_RECENT_ITEMS = 8;

const AtlasContext = createContext({
  screenContext: null,
  recentItems: [],
  registerContext: () => {},
  clearContext: () => {},
  clearRecentItems: () => {},
  openAtlasAi: () => {},
});

export function AtlasContextProvider({ children }) {
  const pathname = usePathname() || '/';
  const [screenContext, setScreenContext] = useState(null);
  const [recentItems, setRecentItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(RECENT_ITEMS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Reset route-bound context when navigating to a new page
  useEffect(() => {
    setScreenContext(null);
  }, [pathname]);

  const registerContext = useCallback((ctx) => {
    if (!ctx) return;
    setScreenContext((prev) => ({
      ...(prev || {}),
      ...ctx,
      updatedAt: Date.now(),
    }));

    const itemTitle = ctx.title || ctx.contextAnchor?.sectionTitle;
    if (itemTitle && pathname && pathname !== '/') {
      setRecentItems((prev) => {
        const entry = {
          path: pathname,
          title: String(itemTitle).slice(0, 80),
          subtitle: ctx.subtitle ? String(ctx.subtitle).slice(0, 80) : '',
          type: ctx.type || 'page',
          visitedAt: Date.now(),
        };
        const next = [entry, ...prev.filter((item) => item.path !== pathname)].slice(0, MAX_RECENT_ITEMS);
        try {
          localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });
    }
  }, [pathname]);

  const clearContext = useCallback(() => {
    setScreenContext(null);
  }, []);

  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
    try {
      localStorage.removeItem(RECENT_ITEMS_KEY);
    } catch {
      // ignore
    }
  }, []);

  const openAtlasAi = useCallback((overrideCtx = null) => {
    if (overrideCtx) {
      setScreenContext((prev) => ({ ...(prev || {}), ...overrideCtx, updatedAt: Date.now() }));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('set-public-atlas-context', { detail: overrideCtx }));
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
      window.dispatchEvent(new CustomEvent('open-atlas-ai'));
    }
  }, []);

  // Bridge legacy `set-public-atlas-context` and unified `atlas-register-context` events
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleContext = (e) => {
      if (e?.detail) registerContext(e.detail);
    };
    window.addEventListener('set-public-atlas-context', handleContext);
    window.addEventListener('atlas-register-context', handleContext);
    return () => {
      window.removeEventListener('set-public-atlas-context', handleContext);
      window.removeEventListener('atlas-register-context', handleContext);
    };
  }, [registerContext]);

  return (
    <AtlasContext.Provider value={{ screenContext, recentItems, registerContext, clearContext, clearRecentItems, openAtlasAi }}>
      {children}
    </AtlasContext.Provider>
  );
}

export function useAtlasContext() {
  return useContext(AtlasContext);
}

/**
 * Declarative hook for any page/module to keep Atlas AI aware of its live state.
 */
export function useRegisterAtlasContext(contextObj, deps = []) {
  const { registerContext } = useAtlasContext();
  useEffect(() => {
    if (contextObj) {
      registerContext(contextObj);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
