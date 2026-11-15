'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * useSyncedTableParams
 * Synchronizes search query, category filter, and view mode with URL query
 * parameters so Browser Back/Forward and shared links preserve exact table state.
 */
export function useSyncedTableParams({
  defaultCategory = 'all',
  defaultViewMode = 'table',
  paramKeys = { q: 'q', category: 'cat', view: 'view' },
} = {}) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQueryState] = useState(
    () => searchParams?.get(paramKeys.q) || ''
  );
  const [selectedCategory, setSelectedCategoryState] = useState(
    () => searchParams?.get(paramKeys.category) || defaultCategory
  );
  const [viewMode, setViewModeState] = useState(
    () => searchParams?.get(paramKeys.view) || defaultViewMode
  );

  useEffect(() => {
    const urlQ = searchParams?.get(paramKeys.q) || '';
    const urlCat = searchParams?.get(paramKeys.category) || defaultCategory;
    const urlView = searchParams?.get(paramKeys.view) || defaultViewMode;
    setSearchQueryState(urlQ);
    setSelectedCategoryState(urlCat);
    setViewModeState(urlView);
  }, [searchParams, defaultCategory, defaultViewMode, paramKeys.q, paramKeys.category, paramKeys.view]);

  const updateUrl = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams?.toString() || '');
      Object.entries(patch).forEach(([k, v]) => {
        if (!v || v === 'all' || (k === paramKeys.view && v === defaultViewMode)) {
          next.delete(k);
        } else {
          next.set(k, v);
        }
      });
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams, paramKeys.view, defaultViewMode]
  );

  const setSearchQuery = useCallback(
    (val) => {
      setSearchQueryState(val);
      updateUrl({ [paramKeys.q]: val });
    },
    [paramKeys.q, updateUrl]
  );

  const setSelectedCategory = useCallback(
    (val) => {
      setSelectedCategoryState(val);
      updateUrl({ [paramKeys.category]: val });
    },
    [paramKeys.category, updateUrl]
  );

  const setViewMode = useCallback(
    (valOrUpdater) => {
      setViewModeState((prev) => {
        const nextVal = typeof valOrUpdater === 'function' ? valOrUpdater(prev) : valOrUpdater;
        updateUrl({ [paramKeys.view]: nextVal });
        return nextVal;
      });
    },
    [paramKeys.view, updateUrl]
  );

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
  };
}
