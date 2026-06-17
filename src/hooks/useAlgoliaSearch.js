import { useState, useEffect, useCallback, useRef } from 'react';
import { searchClient } from '../services/algolia/client';
import { algoliaConfig } from '../services/algolia/config';

/**
 * A powerful React hook to search via Algolia.
 * Supports debouncing, filtering, and pagination.
 * 
 * @param {Object} options
 * @param {string} options.indexName - The Algolia index to search
 * @param {number} options.debounceMs - Delay before triggering search
 * @param {number} options.hitsPerPage - Number of results to return per page
 * @param {string} options.filters - Algolia filter syntax string (e.g. "stock > 0")
 */
export function useAlgoliaSearch({ 
  indexName, 
  debounceMs = 300,
  hitsPerPage = algoliaConfig.defaultSearchOptions.hitsPerPage,
  filters = '' 
}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [totalHits, setTotalHits] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const initialLoadDone = useRef(false);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const performSearch = useCallback(async (searchQuery, pageNum = 0, isLoadMore = false) => {
    if (!searchClient) {
      const errMsg = 'Algolia is not configured. Missing environment variables.';
      if (!initialLoadDone.current) console.warn(errMsg);
      setError(new Error(errMsg));
      setIsSearching(false);
      return;
    }
    
    // Optional: allow empty query to fetch all if desired, but typically we want at least 2 chars
    // We'll allow empty query for "browse" experiences.
    
    setIsSearching(true);
    setError(null);

    try {
      const response = await searchClient.search({
        requests: [
          {
            indexName,
            query: searchQuery,
            hitsPerPage,
            page: pageNum,
            filters,
            ...algoliaConfig.defaultSearchOptions
          }
        ]
      });
      
      const hits = response.results[0]?.hits || [];
      const nbHits = response.results[0]?.nbHits || 0;
      const nbPages = response.results[0]?.nbPages || 0;

      if (isLoadMore) {
        setResults(prev => [...prev, ...hits]);
      } else {
        setResults(hits);
      }
      
      setTotalHits(nbHits);
      setPage(pageNum);
      setHasMore(pageNum < nbPages - 1);
      
    } catch (err) {
      console.error('Algolia Search Error:', err);
      setError(err);
      if (!isLoadMore) setResults([]);
    } finally {
      setIsSearching(false);
      initialLoadDone.current = true;
    }
  }, [indexName, hitsPerPage, filters]);

  // Trigger search when debounced query or filters change
  useEffect(() => {
    // Reset to page 0 when query or filters change
    performSearch(debouncedQuery, 0, false);
  }, [debouncedQuery, filters, performSearch]);

  const loadMore = useCallback(() => {
    if (!isSearching && hasMore) {
      performSearch(debouncedQuery, page + 1, true);
    }
  }, [isSearching, hasMore, debouncedQuery, page, performSearch]);

  const forceSearch = useCallback(async (searchQuery) => {
    setQuery(searchQuery);
    await performSearch(searchQuery, 0, false);
  }, [performSearch]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    totalHits,
    hasMore,
    loadMore,
    forceSearch
  };
}
