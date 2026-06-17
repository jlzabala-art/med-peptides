import { useAlgoliaSearch } from './useAlgoliaSearch';
import { algoliaConfig } from '../services/algolia/config';

/**
 * A powerful React hook to search products via Algolia.
 * Built for transactional modules (Quotations, Sales Orders, etc.) where speed is critical.
 * 
 * @param {Object} options 
 * @param {string} options.indexName - The Algolia index to search (default: 'products')
 * @param {number} options.debounceMs - Delay before triggering search
 * @param {number} options.hitsPerPage - Number of results to return
 * @param {string} options.filters - Algolia filter syntax string (e.g. "stock > 0")
 */
export function useProductSearch({ 
  indexName = algoliaConfig.indices.products, 
  debounceMs = 300,
  hitsPerPage = 10,
  filters = '' 
} = {}) {
  // Leverage the new generic Algolia hook
  return useAlgoliaSearch({
    indexName,
    debounceMs,
    hitsPerPage,
    filters
  });
}
