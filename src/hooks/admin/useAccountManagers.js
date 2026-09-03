"use client";

import { useFirestorePaginatedCollection } from '../data/useFirestorePaginatedCollection';

export function useAccountManagers(options = {}) {
  const {
    data: accountManagers,
    isLoading: loading,
    isFetchingMore: loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    refresh: fetchAccountManagers,
  } = useFirestorePaginatedCollection('users', {
    ...options,
    additionalConstraints: [
      ...(options.additionalConstraints || []),
      ['role', '==', 'account_manager']
    ],
    ...options,
    orderByFields: options.orderByFields || [['createdAt', 'desc']],
    pageSize: options.pageSize || 50,
  });

  return {
    accountManagers,
    loading,
    loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    fetchAccountManagers,
  };
}
