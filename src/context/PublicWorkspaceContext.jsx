'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'atlas_public_workspace_v1';

const DEFAULT_STATE = {
  currency: 'USD',
  lang: 'en',
  rfqItems: [],
};

const PublicWorkspaceContext = createContext({
  ...DEFAULT_STATE,
  setCurrency: () => {},
  setLang: () => {},
  addRfqItem: () => {},
  removeRfqItem: () => {},
  clearRfqItems: () => {},
});

export function PublicWorkspaceProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

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
          });
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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

  const removeRfqItem = useCallback((key) => {
    setState((prev) => ({
      ...prev,
      rfqItems: prev.rfqItems.filter((x) => (x.id || x.sku) !== key),
    }));
  }, []);

  const clearRfqItems = useCallback(() => {
    setState((prev) => ({ ...prev, rfqItems: [] }));
  }, []);

  return (
    <PublicWorkspaceContext.Provider
      value={{
        currency: state.currency,
        lang: state.lang,
        rfqItems: state.rfqItems,
        setCurrency,
        setLang,
        addRfqItem,
        removeRfqItem,
        clearRfqItems,
      }}
    >
      {children}
    </PublicWorkspaceContext.Provider>
  );
}

export function usePublicWorkspace() {
  return useContext(PublicWorkspaceContext);
}
