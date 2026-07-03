import { useFirestorePaginatedCollection } from '../data/useFirestorePaginatedCollection';

export function useUsers(options = {}) {
  const {
    data: users,
    isLoading: loading,
    isFetchingMore: loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    refresh: fetchUsers,
  } = useFirestorePaginatedCollection('users', {
    ...options,
    orderByFields: options.orderByFields || [['createdAt', 'desc']],
    pageSize: options.pageSize || 20,
  });

  return {
    users,
    loading,
    loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    fetchUsers,
  };
}
