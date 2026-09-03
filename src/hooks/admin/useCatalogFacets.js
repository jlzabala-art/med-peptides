import { useState, useEffect } from 'react';

// Client-side cache (module-level) — TTL 5 min
let _cache = null;
let _cacheTs = 0;
const TTL = 5 * 60 * 1000;

/**
 * useCatalogFacets — fetches option counts for the catalog multi-select filters.
 * Returns: { categories, goals, formats, suppliers, loading }
 * Each array item: { value: string, label: string, count: number }
 */
export function useCatalogFacets() {
  const [facets, setFacets] = useState(_cache || { productTypes: [], categories: [], goals: [], formats: [], suppliers: [], presentations: [] });
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    if (_cache && Date.now() - _cacheTs < TTL) {
      setFacets(_cache);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch('/api/catalog/facets')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        _cache = data;
        _cacheTs = Date.now();
        setFacets(data);
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { ...facets, loading };
}

export function invalidateCatalogFacetsCache() {
  _cache = null;
  _cacheTs = 0;
}
