import { useFirestorePaginatedCollection } from '../data/useFirestorePaginatedCollection';

export function useLeads(options = {}) {
  const {
    data: leads,
    isLoading: loading,
    isFetchingMore: loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    refresh: fetchLeads,
  } = useFirestorePaginatedCollection('leads', {
    ...options,
    orderByFields: options.orderByFields || [['createdAt', 'desc']],
    pageSize: options.pageSize || 50,
  });

  return {
    leads,
    loading,
    loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    fetchLeads,
  };
}
