import { useState, useEffect, useRef, useCallback } from 'react';
import { algoliasearch } from 'algoliasearch';

const APP_ID = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.VITE_ALGOLIA_APP_ID) : '';
const SEARCH_KEY = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || process.env.VITE_ALGOLIA_SEARCH_KEY) : '';

let _client = null;
function getClient() {
  if (!_client && APP_ID && SEARCH_KEY) {
    _client = algoliasearch(APP_ID, SEARCH_KEY);
  }
  return _client;
}

// ── In-Memory LRU/TTL Cache (5 Minutes) to protect Algolia Quota ──────────────
const CACHE_TTL_MS = 5 * 60 * 1000;
const searchCache = new Map();

function getCachedResult(key) {
  const cached = searchCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
    searchCache.delete(key);
    return null;
  }
  return cached.data;
}

function setCachedResult(key, data) {
  if (searchCache.size > 200) {
    const firstKey = searchCache.keys().next().value;
    searchCache.delete(firstKey);
  }
  searchCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Extracts and highlights search terms from Algolia `_highlightResult`.
 * @param {Object} hit - Algolia hit object
 * @param {string} attribute - e.g. 'name', 'sku', 'activeIngredient'
 * @param {string} fallback - text to use if no highlight exists
 * @returns {string} string with highlighted tags or fallback
 */
export function getAlgoliaHighlight(hit, attribute, fallback = '') {
  if (!hit) return fallback;
  const highlight = hit._highlightResult?.[attribute];
  if (highlight && highlight.value) {
    return highlight.value;
  }
  return hit[attribute] || fallback;
}

/**
 * useAlgoliaSearch
 *
 * Universal Algolia search hook supporting dual signatures:
 * 1. Positional: useAlgoliaSearch(indexName, query, searchParams, debounce)
 * 2. Object: useAlgoliaSearch({ indexName, collectionName, query, searchQuery, facetFilters, numericFilters, hitsPerPage, page, debounce, debounceMs, alwaysFetch })
 */
export function useAlgoliaSearch(arg1, arg2, arg3 = {}, arg4 = 300) {
  // Normalize arguments between Positional vs Object format
  let indexName = '';
  let query = '';
  let searchParams = {};
  let debounce = 300;

  if (typeof arg1 === 'object' && arg1 !== null) {
    indexName = arg1.indexName || arg1.collectionName || '';
    query = arg1.query !== undefined ? arg1.query : (arg1.searchQuery || '');
    const {
      indexName: _i,
      collectionName: _c,
      query: _q,
      searchQuery: _sq,
      debounce: _d,
      debounceMs: _dm,
      ...restParams
    } = arg1;
    searchParams = restParams;
    debounce = _dm ?? _d ?? 300;
  } else {
    indexName = arg1 || '';
    query = typeof arg2 === 'string' ? arg2 : '';
    searchParams = typeof arg3 === 'object' && arg3 !== null ? arg3 : {};
    debounce = typeof arg4 === 'number' ? arg4 : 300;
  }

  const [controlledQuery, setControlledQuery] = useState(query);
  useEffect(() => {
    setControlledQuery(query);
  }, [query]);
  const activeQuery = controlledQuery ?? query;

  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalHits, setTotalHits] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(searchParams.page || 0);
  const [hasMore, setHasMore] = useState(false);

  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const isAlgoliaActive = Boolean(APP_ID && SEARCH_KEY);
  const { alwaysFetch, hitsPerPage = 50, ...algoliaParams } = searchParams;

  const search = useCallback(
    async (q, pageNum = 0, isLoadMore = false) => {
      const client = getClient();
      if (!client || !indexName) return;

      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const cacheKey = `${indexName}:${q}:${pageNum}:${hitsPerPage}:${JSON.stringify(algoliaParams)}`;
      const cached = getCachedResult(cacheKey);

      if (cached && !isLoadMore) {
        setHits(cached.hits);
        setTotalHits(cached.totalHits);
        setTotalPages(cached.totalPages);
        setHasMore(pageNum + 1 < cached.totalPages);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { results } = await client.search({
          requests: [
            {
              indexName,
              query: q,
              hitsPerPage,
              page: pageNum,
              ...algoliaParams,
            },
          ],
        });

        if (!controller.signal.aborted) {
          const firstResult = results?.[0];
          const newHits = firstResult?.hits ?? [];
          const nbHits = firstResult?.nbHits ?? 0;
          const nbPages = firstResult?.nbPages ?? 0;

          if (isLoadMore) {
            setHits((prev) => [...prev, ...newHits]);
          } else {
            setHits(newHits);
          }

          setTotalHits(nbHits);
          setTotalPages(nbPages);
          setHasMore(pageNum + 1 < nbPages);

          setCachedResult(cacheKey, {
            hits: newHits,
            totalHits: nbHits,
            totalPages: nbPages,
          });
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.warn('[useAlgoliaSearch] Query error:', err.message);
          setError(err);
          setHits([]);
          setTotalHits(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [indexName, hitsPerPage, JSON.stringify(algoliaParams)]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      search(activeQuery || '', nextPage, true);
    }
  }, [loading, hasMore, currentPage, activeQuery, search]);

  useEffect(() => {
    if (!isAlgoliaActive) return;

    const hasFilters = (algoliaParams?.facetFilters && algoliaParams.facetFilters.length > 0) ||
                       (algoliaParams?.filters && algoliaParams.filters.trim().length > 0);
    const hasNumericFilters = algoliaParams?.numericFilters && algoliaParams.numericFilters.length > 0;

    if (!alwaysFetch && (!activeQuery || activeQuery.trim() === '') && !hasFilters && !hasNumericFilters) {
      setHits([]);
      setTotalHits(0);
      setTotalPages(0);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentPage(0);
      search(activeQuery || '', 0, false);
    }, debounce);

    return () => {
      clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [activeQuery, debounce, search, isAlgoliaActive, alwaysFetch]);

  return {
    query: activeQuery,
    setQuery: setControlledQuery,
    hits,
    results: hits, // alias for backwards compatibility
    loading,
    isSearching: loading, // alias for backwards compatibility
    error,
    isAlgoliaActive,
    totalHits,
    totalPages,
    page: currentPage,
    setPage: setCurrentPage,
    hasMore,
    loadMore,
    search,
  };
}

export function useAlgoliaFacets(indexName, facetFields = []) {
  const [facets, setFacets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchFacets() {
      if (!indexName || facetFields.length === 0) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const client = getClient();
        if (!client) {
          setLoading(false);
          return;
        }
        const { results } = await client.search([{
          indexName,
          query: '',
          facets: facetFields,
          hitsPerPage: 0,
        }]);

        if (isMounted && results && results[0]) {
          const returnedFacets = results[0].facets;
          const formattedFacets = {};
          for (const field of facetFields) {
            formattedFacets[field] = [];
            if (returnedFacets && returnedFacets[field]) {
              formattedFacets[field] = Object.entries(returnedFacets[field])
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);
            }
          }
          setFacets(formattedFacets);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchFacets();
    return () => { isMounted = false; };
  }, [indexName, facetFields.join(',')]);

  return { facets, loading, error };
}
