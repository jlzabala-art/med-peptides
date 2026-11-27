'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Shared hook for unified Cards | B2B Table view toggle across all /pricing/* pages.
 * Syncs `?view=cards` with the URL without reloading or losing cart/filter state.
 */
export function usePricingViewMode(initialMode = 'table') {
  const [viewMode, setViewMode] = useState(initialMode === 'cards' ? 'cards' : 'table');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let active = true;
    const raw = new URLSearchParams(window.location.search).get('view')?.toLowerCase();
    const isMobile = window.innerWidth <= 768;

    let nextMode = null;
    if (raw === 'cards' || raw === 'catalog') {
      nextMode = 'cards';
    } else if (raw === 'table') {
      nextMode = 'table';
    } else if (isMobile) {
      nextMode = 'cards';
    }

    if (nextMode) {
      Promise.resolve().then(() => {
        if (active) setViewMode(nextMode);
      });
    }

    return () => {
      active = false;
    };
  }, []);

  const handleViewModeChange = useCallback((nextMode) => {
    const normalized = nextMode === 'cards' ? 'cards' : 'table';
    setViewMode(normalized);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (normalized === 'cards') url.searchParams.set('view', 'cards');
      else url.searchParams.set('view', 'table');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return { viewMode, handleViewModeChange };
}
