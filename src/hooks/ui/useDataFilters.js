import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '../useDebounce';

/**
 * scoreMatch — Weighted fuzzy scoring engine for multi-field search.
 *
 * Returns a relevance score (higher = more relevant):
 *  - Exact match: 100
 *  - Starts with term: 80
 *  - Word boundary match: 60
 *  - Contains (substring): 40
 *  - Initials match (e.g. "BPC" matches "BPC-157"): 30
 *
 * Each field has an individual weight multiplier (priority).
 *
 * @param {Object} item - The data item.
 * @param {string} term - The lowercased search term.
 * @param {Array<{field: string, weight?: number}>} searchConfig - Fields + weights.
 * @returns {number} score
 */
function scoreMatch(item, term, searchConfig) {
  if (!term) return 1; // No search term = everything passes

  let totalScore = 0;

  for (const { field, weight = 1 } of searchConfig) {
    const raw = item[field];
    if (raw === null || raw === undefined) continue;

    const val = String(raw).toLowerCase();

    if (val === term) {
      totalScore += 100 * weight;
    } else if (val.startsWith(term)) {
      totalScore += 80 * weight;
    } else if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(val)) {
      totalScore += 60 * weight;
    } else if (val.includes(term)) {
      totalScore += 40 * weight;
    } else {
      // Initials/abbreviation: check each word starts with a letter of the term
      const words = val.split(/\s+/);
      const initials = words.map((w) => w[0] || '').join('');
      if (term.length <= initials.length && initials.startsWith(term)) {
        totalScore += 30 * weight;
      }
    }
  }

  return totalScore;
}

/**
 * useDataFilters
 * A generic, reusable hook for searching, filtering, and paginating any in-memory data array.
 * Designed to be used across all admin modules (Products, Prescriptions, RFQs, Orders, etc.)
 *
 * Features:
 * - Weighted, multi-field fuzzy search with relevance scoring
 * - Debounced search input (250ms by default)
 * - Dynamic, key-value based filter system
 * - Client-side pagination
 * - Active filter count for badge UI
 *
 * @param {Array} data - The raw data array to filter.
 * @param {Object} options - Configuration options.
 * @param {Array<{field: string, weight?: number}>} options.searchConfig
 *        Fields to search with optional weights.
 *        e.g. [{ field: 'name', weight: 3 }, { field: 'sku', weight: 2 }, { field: 'category', weight: 1 }]
 *        Simple string array also supported: ['name', 'sku'] (default weight 1).
 * @param {Object} options.initialFilters - Initial filter key/value map (e.g. { status: 'All', category: 'All' }).
 * @param {number} options.pageSize - Items per page. Defaults to 20.
 * @param {string} options.initialSearch - Pre-filled search term.
 * @param {number} options.debounceMs - Debounce delay in ms. Defaults to 250.
 * @param {number} options.minScoreThreshold - Minimum relevance score to include a result. Defaults to 1.
 *
 * @example
 * // In AdminProductsTab:
 * const { searchTerm, setSearchTerm, filters, setFilter, paginatedData, totalItems } = useDataFilters(products, {
 *   searchConfig: [
 *     { field: 'name', weight: 4 },
 *     { field: 'sku', weight: 3 },
 *     { field: 'category', weight: 2 },
 *     { field: 'objective', weight: 1 },
 *   ],
 *   initialFilters: { status: 'All', category: 'All', warehouse: 'All', supplier: 'All' },
 *   pageSize: 25,
 * });
 */
export function useDataFilters(data = [], options = {}) {
  const {
    searchConfig = [{ field: 'name', weight: 1 }],
    initialFilters = {},
    pageSize: initialPageSize = 20,
    initialSearch = '',
    debounceMs = 250,
    minScoreThreshold = 1,
  } = options;

  // Normalize searchConfig: support both string[] and {field, weight}[]
  const normalizedSearchConfig = useMemo(() =>
    searchConfig.map((s) => (typeof s === 'string' ? { field: s, weight: 1 } : s)),
    [searchConfig]
  );

  const [searchTerm, setSearchTermRaw] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchTerm, debounceMs);
  const [filters, setFiltersState] = useState(initialFilters);
  const [currentPage, setCurrentPageRaw] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(initialPageSize);

  /** Set search term and reset to page 1 */
  const setSearchTerm = useCallback((term) => {
    setSearchTermRaw(term);
    setCurrentPageRaw(1);
  }, []);

  /** Set a single filter value. Resets to page 1. */
  const setFilter = useCallback((key, value) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
    setCurrentPageRaw(1);
  }, []);

  /** Reset multiple filters at once */
  const setFilters = useCallback((updates) => {
    setFiltersState((prev) => ({ ...prev, ...updates }));
    setCurrentPageRaw(1);
  }, []);

  /** Clear all filters and search term */
  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setSearchTermRaw('');
    setCurrentPageRaw(1);
  }, [initialFilters]);

  const setCurrentPage = useCallback((page) => setCurrentPageRaw(page), []);

  const setPageSize = useCallback((size) => {
    setPageSizeRaw(size);
    setCurrentPageRaw(1);
  }, []);

  /** Number of active (non-default) filters — useful for badge UI */
  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v && v !== 'All' && v !== '').length,
    [filters]
  );

  /**
   * Core filter + score engine.
   * Returns results sorted by relevance score (desc) when a search term is active.
   */
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const term = debouncedSearch.toLowerCase().trim();

    const scored = data
      .map((item) => {
        // Score for search
        const score = scoreMatch(item, term, normalizedSearchConfig);
        if (score < minScoreThreshold) return null;

        // Apply key-value filters
        const passesFilters = Object.entries(filters).every(([key, value]) => {
          if (!value || value === 'All') return true;
          const itemValue = item[key];
          if (itemValue === undefined || itemValue === null) return false;

          // Support array fields (e.g. item.tags = ['peptide', 'anti-aging'])
          if (Array.isArray(itemValue)) {
            return itemValue.some((v) => String(v).toLowerCase() === String(value).toLowerCase());
          }

          return String(itemValue).toLowerCase() === String(value).toLowerCase();
        });

        if (!passesFilters) return null;

        return { item, score };
      })
      .filter(Boolean);

    // Sort by relevance only when a search term is active
    if (term) {
      scored.sort((a, b) => b.score - a.score);
    }

    return scored.map((s) => s.item);
  }, [data, debouncedSearch, normalizedSearchConfig, filters, minScoreThreshold]);

  /** Paginated slice of filtered results */
  const { paginatedData, totalItems, totalPages } = useMemo(() => {
    const total = filteredData.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(currentPage, pages);
    const paginated = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);
    return { paginatedData: paginated, totalItems: total, totalPages: pages };
  }, [filteredData, currentPage, pageSize]);

  return {
    // Search
    searchTerm,
    setSearchTerm,
    // Filters
    filters,
    setFilter,
    setFilters,
    clearFilters,
    activeFilterCount,
    // Data
    paginatedData,
    filteredData,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
  };
}
