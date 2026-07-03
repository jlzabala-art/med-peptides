import { useFirestorePaginatedCollection } from '../data/useFirestorePaginatedCollection';

export function useAuditLogs(options = {}) {
  const {
    data: auditLogs,
    isLoading: loading,
    isFetchingMore: loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    refresh: fetchAuditLogs,
  } = useFirestorePaginatedCollection('audit_log', {
    ...options,
    orderByFields: options.orderByFields || [['executed_at', 'desc']],
    pageSize: options.pageSize || 50,
  });

  return {
    auditLogs,
    loading,
    loadingMore,
    hasMore,
    error,
    totalCount,
    loadMore,
    fetchAuditLogs,
  };
}
