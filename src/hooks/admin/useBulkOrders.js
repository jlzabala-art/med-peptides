import { useFirestorePaginatedCollection } from '../data/useFirestorePaginatedCollection';

export function useBulkOrders(options = {}) {
  const {
    data: bulkOrders,
    isLoading: loading,
    isFetchingMore: loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    refresh: fetchBulkOrders,
  } = useFirestorePaginatedCollection('bulk_orders', {
    ...options,
    orderByFields: options.orderByFields || [['createdAt', 'desc']],
    pageSize: options.pageSize || 50,
  });

  return {
    bulkOrders,
    loading,
    loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    fetchBulkOrders,
  };
}
