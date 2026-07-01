import { useFirestoreCollection } from '../data/useFirestoreCollection';

export function useProtocols(options = {}) {
  // If we need to filter by status or doctor in the future, we pass whereConditions
  const {
    data: protocols,
    isLoading,
    error,
    refetch,
    addDocAsync,
    updateDocAsync,
    deleteDocAsync,
  } = useFirestoreCollection('protocols', {
    ...options,
    // Provide a default orderBy if not specified
    orderByFields: options.orderByFields || [['name', 'asc']],
  });

  return {
    protocols,
    loading: isLoading,
    error,
    refetch,
    addProtocol: addDocAsync,
    updateProtocol: updateDocAsync,
    deleteProtocol: deleteDocAsync,
  };
}
