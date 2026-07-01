import { useState, useEffect, useRef, useCallback } from 'react';
import { algoliasearch } from 'algoliasearch';

const APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID;
const SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

let _client = null;
function getClient() {
  if (!_client && APP_ID && SEARCH_KEY) {
    _client = algoliasearch(APP_ID, SEARCH_KEY);
  }
  return _client;
}

/**
 * useAlgoliaSearch
 *
 * A reusable hook that queries Algolia for any index, with debounce.
 * Falls back to an empty array if Algolia is not configured.
 *
 * @param {string}   indexName   - Algolia index name (e.g. 'protocols', 'prescriptions')
 * @param {string}   query       - Search query string (reactive)
 * @param {Object}   searchParams - Extra Algolia search params (facetFilters, hitsPerPage, etc.)
 * @param {number}   debounce    - Debounce delay in ms (default: 300)
 *
 * @returns {{ hits, loading, error, isAlgoliaActive }}
 */
export function useAlgoliaSearch(indexName, query, searchParams = {}, debounce = 300) {
  const [hits, setHits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const isAlgoliaActive = Boolean(APP_ID && SEARCH_KEY);

  const search = useCallback(
    async (q) => {
      const client = getClient();
      if (!client || !indexName) return;

      // Cancel previous in-flight request if any
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const { results } = await client.search({
          requests: [
            {
              indexName,
              query: q,
              hitsPerPage: 50,
              ...searchParams,
            },
          ],
        });
        if (!controller.signal.aborted) {
          setHits(results?.[0]?.hits ?? []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
          setHits([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [indexName, JSON.stringify(searchParams)]
  );

  useEffect(() => {
    if (!isAlgoliaActive) return;

    // Don't search on empty query — show local data instead
    if (!query || query.trim() === '') {
      setHits([]);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), debounce);

    return () => {
      clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, debounce, search, isAlgoliaActive]);

  return { hits, loading, error, isAlgoliaActive };
}
