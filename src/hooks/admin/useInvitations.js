import { useFirestorePaginatedCollection } from '../data/useFirestorePaginatedCollection';

export function useInvitations(options = {}) {
  const {
    data: invitations,
    isLoading: loading,
    isFetchingMore: loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    refresh: fetchInvitations,
  } = useFirestorePaginatedCollection('invitations', {
    ...options,
    orderByFields: options.orderByFields || [['invitedAt', 'desc']],
    pageSize: options.pageSize || 50,
  });

  return {
    invitations,
    loading,
    loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    fetchInvitations,
  };
}
