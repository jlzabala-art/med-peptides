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
  syncRfqItem: () => {},
  removeRfqItem: () => {},
  clearRfqItems: () => {},
  addRecentItem: () => {},
  buildWorkspaceHref: (path) => path,
});

function deriveRouteLabel(pathname) {
  if (!pathname || pathname === '/') return null;
  if (pathname === '/pricing') return { label: 'B2B Price Hub', category: 'Pricing' };
  if (pathname === '/pricing/colway') return { label: 'Colway UAE Schedule', category: 'Pricing' };
  if (pathname === '/pricing/colway-qatar') return { label: 'Colway Qatar Schedule', category: 'Pricing' };
  if (pathname === '/pricing/colway-hair') return { label: 'Colway Hair & Trichology', category: 'Pricing' };
  if (pathname === '/pricing/peptides') return { label: 'Peptides Schedule', category: 'Pricing' };
  if (pathname === '/pricing/pellets') return { label: 'Hormone Pellets Schedule', category: 'Pricing' };
  if (pathname === '/pricing/pens') return { label: 'Peptide Pen Guide', category: 'Pricing' };
  if (pathname === '/pricing/dnlab-pens') return { label: 'DNLab Pens Schedule', category: 'Pricing' };
  if (pathname === '/pricing/nplab-hormones') return { label: 'NP Lab Hormones', category: 'Pricing' };
  if (pathname === '/pricing/24genetics') return { label: '24Genetics DNA Panels', category: 'Pricing' };
  if (pathname === '/pricing/24genomics-qatar') return { label: '24Genetics Qatar', category: 'Pricing' };
  if (pathname === '/vials') return { label: 'Peptide Vials Directory', category: 'Catalog' };
  if (pathname === '/proto') return { label: 'Clinical Protocols', category: 'Protocols' };
  if (pathname === '/protocol-finder') return { label: 'Protocol Finder', category: 'Protocols' };
  if (pathname === '/calculator') return { label: 'Dosing Calculator', category: 'Tool' };
  if (pathname === '/compounding') return { label: 'Compounding Lab', category: 'Lab' };
  if (pathname === '/tools') return { label: 'Clinical Tools', category: 'Tool' };

  const slug = pathname.split('/').filter(Boolean).pop() || '';
  const pretty = decodeURIComponent(slug)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  if (pathname.startsWith('/p/')) return { label: pretty, category: 'Monograph' };
  if (pathname.startsWith('/proto/')) return { label: pretty, category: 'Protocol' };
  if (pathname.startsWith('/guides/')) return { label: pretty, category: 'Guide' };
  if (pathname.startsWith('/collection/')) return { label: pretty, category: 'Collection' };
  if (pathname.startsWith('/c/')) return { label: `Catalog ${slug}`, category: 'Catalog' };
  return null;
}

export function PublicWorkspaceProvider({ children }) {
  const pathname = usePathname() || '/';
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);

  // Hydrate from URL, localStorage on mount (English default)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const urlCur = (sp.get('cur') || sp.get('currency') || '').toUpperCase();
      const urlLang = (sp.get('lang') || '').toLowerCase();

      const storedLegacyCur = (localStorage.getItem('atlas_portal_currency') || '').toUpperCase();
      const storedLegacyLang = (localStorage.getItem('atlas_portal_lang') || localStorage.getItem('atlas_catalog_lang') || '').toLowerCase();

      const raw = window.localStorage.getItem(STORAGE_KEY);
      let parsed = {};
      if (raw) {
        try { parsed = JSON.parse(raw); } catch { /* ignore */ }
      }

      const validCurrencies = ['USD', 'EUR', 'AED'];
      const resolvedCurrency = validCurrencies.includes(urlCur)
        ? urlCur
        : validCurrencies.includes(parsed.currency)
          ? parsed.currency
          : validCurrencies.includes(storedLegacyCur)
            ? storedLegacyCur
            : 'USD';

      const validLangs = ['en', 'es'];
      const resolvedLang = validLangs.includes(urlLang)
        ? urlLang
        : validLangs.includes(parsed.lang)
          ? parsed.lang
          : validLangs.includes(storedLegacyLang)
            ? storedLegacyLang
            : 'en';

      setState({
        currency: resolvedCurrency,
        lang: resolvedLang,
        rfqItems: Array.isArray(parsed.rfqItems) ? parsed.rfqItems : [],
        recentItems: Array.isArray(parsed.recentItems) ? parsed.recentItems.slice(0, 6) : [],
      });
    } catch {
      // ignore storage errors
    }
    setHydrated(true);
  }, []);

  // Listen for custom events across components (Unified Header, Price List, Drawers)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onCurChanged = (e) => {
      const nextCur = (e?.detail || '').toUpperCase();
      if (['USD', 'EUR', 'AED'].includes(nextCur)) {
        setState((prev) => (prev.currency === nextCur ? prev : { ...prev, currency: nextCur }));
      }
    };

    const onLangChanged = (e) => {
      const detailLang = typeof e?.detail === 'string' ? e.detail : e?.detail?.lang;
      const nextLang = String(detailLang || '').toLowerCase();
      if (['en', 'es'].includes(nextLang)) {
        setState((prev) => (prev.lang === nextLang ? prev : { ...prev, lang: nextLang }));
      }
    };

    window.addEventListener('atlas-currency-changed', onCurChanged);
    window.addEventListener('atlas-language-changed', onLangChanged);

    return () => {
      window.removeEventListener('atlas-currency-changed', onCurChanged);
      window.removeEventListener('atlas-language-changed', onLangChanged);
    };
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

  const setCurrency = useCallback((newCur) => {
    if (!newCur) return;
    const upper = String(newCur).toUpperCase();
    if (!['USD', 'EUR', 'AED'].includes(upper)) return;

    setState((prev) => (prev.currency === upper ? prev : { ...prev, currency: upper }));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_portal_currency', upper);
      } catch { /* ignore */ }
      const url = new URL(window.location.href);
      url.searchParams.delete('cur');
      url.searchParams.set('currency', upper);
      if (!url.searchParams.get('lang')) {
        url.searchParams.set('lang', state.lang === 'es' ? 'es' : 'en');
      }
      window.history.replaceState({}, '', url.toString());
      window.dispatchEvent(new CustomEvent('atlas-currency-changed', { detail: upper }));
    }
  }, [state.lang]);

  const setLang = useCallback((newLang) => {
    if (!newLang) return;
    const lower = String(newLang).toLowerCase();
    if (!['en', 'es'].includes(lower)) return;

    setState((prev) => (prev.lang === lower ? prev : { ...prev, lang: lower }));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_portal_lang', lower);
        localStorage.setItem('atlas_catalog_lang', lower);
      } catch { /* ignore */ }
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lower);
      if (state.currency && !url.searchParams.get('currency')) {
        url.searchParams.set('currency', state.currency);
      }
      window.history.replaceState({}, '', url.toString());
      window.dispatchEvent(new CustomEvent('atlas-language-changed', { detail: { lang: lower } }));
    }
  }, [state.currency]);

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

  const syncRfqItem = useCallback((item, nextQty) => {
    if (!item || (!item.id && !item.sku)) return;
    const key = item.id || item.sku;
    const qtyNum = Math.max(0, Number(nextQty) || 0);
    setState((prev) => {
      if (qtyNum === 0) {
        return {
          ...prev,
          rfqItems: prev.rfqItems.filter((x) => (x.id || x.sku) !== key),
        };
      }
      const existing = prev.rfqItems.find((x) => (x.id || x.sku) === key);
      if (existing) {
        return {
          ...prev,
          rfqItems: prev.rfqItems.map((x) =>
            (x.id || x.sku) === key ? { ...x, ...item, qty: qtyNum } : x
          ),
        };
      }
      return {
        ...prev,
        rfqItems: [...prev.rfqItems, { ...item, qty: qtyNum }],
      };
    });
  }, []);

  const buildWorkspaceHref = useCallback((basePath, extraParams = {}) => {
    const params = new URLSearchParams();
    params.set('lang', state.lang === 'es' ? 'es' : 'en');
    if (state.currency) params.set('currency', state.currency);
    if (typeof window !== 'undefined') {
      const currentSp = new URLSearchParams(window.location.search);
      const ref = currentSp.get('ref');
      if (ref) params.set('ref', ref);
    }
    Object.entries(extraParams || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        params.set(k, String(v));
      }
    });
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }, [state.lang, state.currency]);

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
        syncRfqItem,
        removeRfqItem,
        clearRfqItems,
        addRecentItem,
        buildWorkspaceHref,
      }}
    >
      {children}
    </PublicWorkspaceContext.Provider>
  );
}

export function usePublicWorkspace() {
  return useContext(PublicWorkspaceContext);
}
