/**
 * hooks/data/useBulkOrders.js
 *
 * Re-export del hook B2B estandarizado.
 * La implementación real vive en useWholesalerQuery.js
 */
export { useInfiniteBulkOrdersQuery as useBulkOrders } from './useWholesalerQuery';
