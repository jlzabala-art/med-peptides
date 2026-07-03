import { useFirestorePaginatedCollection } from '../data/useFirestorePaginatedCollection';

export function useAgencyDeals(options = {}) {
  const {
    data: agencyDeals,
    isLoading: loading,
    isFetchingMore: loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    refresh: fetchAgencyDeals,
  } = useFirestorePaginatedCollection('agency_orders', {
    ...options,
    orderByFields: options.orderByFields || [['createdAt', 'desc']],
    pageSize: options.pageSize || 50,
  });

  return {
    agencyDeals,
    loading,
    loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    fetchAgencyDeals,
  };
}
