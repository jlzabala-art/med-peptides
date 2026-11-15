'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'atlas_public_workspace_v1';

const DEFAULT_STATE = {
  currency: 'USD',
  lang: 'en',
  rfqItems: [],
  recentItems: [],
};

const PublicWorkspaceContext = createContext({
  ...DEFAULT_STATE,
  isSpanish: false,
  t: (en) => en,
  isQuoteDrawerOpen: false,
  setIsQuoteDrawerOpen: () => {},
  setCurrency: () => {},
  setLang: () => {},
  addRfqItem: () => {},
  updateRfqQty: () => {},
  removeRfqItem: () => {},
  clearRfqItems: () => {},
  addRecentItem: () => {},
});

function deriveRouteLabel(pathname) {
  if (!pathname || pathname === '/') return null;
  if (pathname === '/pricing') return { label: 'B2B Price Hub', category: 'Pricing' };
  if (pathname === '/pricing/colway') return { label: 'Colway UAE Schedule', category: 'Pricing' };
  if (pathname === '/pricing/colway-qatar') return { label: 'Colway Qatar Schedule', category: 'Pricing' };
  if (pathname === '/pricing/colway-hair') return { label: 'Colway Hair & Trichology', category: 'Pricing' };
  if (pathname === '/pricing/peptides') return { label: 'Peptides Schedule', category: 'Pricing' };
  if (pathname === '/pricing/24genetics') return { label: '24Genetics DNA Panels', category: 'Pricing' };
  if (pathname === '/pricing/24genomics-qatar') return { label: '24Genetics Qatar', category: 'Pricing' };
  if (pathname === '/vials') return { label: 'Peptide Vials Directory', category: 'Catalog' };
  if (pathname === '/proto') return { label: 'Clinical Protocols', category: 'Protocols' };
  if (pathname === '/calculator') return { label: 'Dosing Calculator', category: 'Tool' };

  const slug = pathname.split('/').filter(Boolean).pop() || '';
  const pretty = decodeURIComponent(slug)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (pathname.startsWith('/p/')) return { label: pretty, category: 'Monograph' };
  if (pathname.startsWith('/proto/')) return { label: pretty, category: 'Protocol' };
  if (pathname.startsWith('/collection/')) return { label: pretty, category: 'Collection' };
  if (pathname.startsWith('/c/')) return { label: `Catalog ${slug}`, category: 'Catalog' };
  return null;
}

export function PublicWorkspaceProvider({ children }) {
  const pathname = usePathname() || '/';
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({
          currency: parsed.currency || 'USD',
          lang: parsed.lang || 'en',
          rfqItems: Array.isArray(parsed.rfqItems) ? parsed.rfqItems : [],
          recentItems: Array.isArray(parsed.recentItems) ? parsed.recentItems.slice(0, 6) : [],
        });
      }
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage after hydration
  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state, hydrated]);

  // Cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setState({
            currency: parsed.currency || 'USD',
            lang: parsed.lang || 'en',
            rfqItems: Array.isArray(parsed.rfqItems) ? parsed.rfqItems : [],
            recentItems: Array.isArray(parsed.recentItems) ? parsed.recentItems.slice(0, 6) : [],
          });
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addRecentItem = useCallback((item) => {
    if (!item?.href || !item?.label) return;
    setState((prev) => {
      const filtered = (prev.recentItems || []).filter((x) => x.href !== item.href);
      const next = [{ href: item.href, label: item.label, category: item.category || 'Page', visitedAt: Date.now() }, ...filtered].slice(0, 6);
      return { ...prev, recentItems: next };
    });
  }, []);

  // Automatically record visited catalog / pricing / monograph routes
  useEffect(() => {
    if (!hydrated) return;
    const meta = deriveRouteLabel(pathname);
    if (meta) {
      addRecentItem({ href: pathname, ...meta });
    }
  }, [pathname, hydrated, addRecentItem]);

  const setCurrency = useCallback((currency) => {
    if (!currency) return;
    setState((prev) => (prev.currency === currency ? prev : { ...prev, currency }));
  }, []);

  const setLang = useCallback((lang) => {
    if (!lang) return;
    setState((prev) => (prev.lang === lang ? prev : { ...prev, lang }));
  }, []);

  const addRfqItem = useCallback((item) => {
    if (!item || (!item.id && !item.sku)) return;
    const key = item.id || item.sku;
    setState((prev) => {
      const existing = prev.rfqItems.find((x) => (x.id || x.sku) === key);
      if (existing) {
        return {
          ...prev,
          rfqItems: prev.rfqItems.map((x) =>
            (x.id || x.sku) === key ? { ...x, qty: (x.qty || 1) + (item.qty || 1) } : x
          ),
        };
      }
      return {
        ...prev,
        rfqItems: [...prev.rfqItems, { ...item, qty: item.qty || 1 }],
      };
    });
  }, []);

  const updateRfqQty = useCallback((key, qty) => {
    const safeQty = Math.max(1, Number(qty) || 1);
    setState((prev) => ({
      ...prev,
      rfqItems: prev.rfqItems.map((x) => ((x.id || x.sku) === key ? { ...x, qty: safeQty } : x)),
    }));
  }, []);

  const removeRfqItem = useCallback((key) => {
    setState((prev) => ({
      ...prev,
      rfqItems: prev.rfqItems.filter((x) => (x.id || x.sku) !== key),
    }));
  }, []);

  const clearRfqItems = useCallback(() => {
    setState((prev) => ({ ...prev, rfqItems: [] }));
  }, []);

  const isSpanish = state.lang === 'es';
  const t = useCallback((en, es) => (state.lang === 'es' ? (es ?? en) : en), [state.lang]);

  return (
    <PublicWorkspaceContext.Provider
      value={{
        currency: state.currency,
        lang: state.lang,
        isSpanish,
        t,
        rfqItems: state.rfqItems,
        recentItems: state.recentItems,
        isQuoteDrawerOpen,
        setIsQuoteDrawerOpen,
        setCurrency,
        setLang,
        addRfqItem,
        updateRfqQty,
        removeRfqItem,
        clearRfqItems,
        addRecentItem,
      }}
    >
      {children}
    </PublicWorkspaceContext.Provider>
  );
}

export function usePublicWorkspace() {
  return useContext(PublicWorkspaceContext);
}
