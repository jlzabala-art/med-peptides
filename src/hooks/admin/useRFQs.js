import { useFirestoreCollection } from '../data/useFirestoreCollection';

export function useRFQs(options = {}) {
  const {
    data: rfqs,
    isLoading,
    error,
    refetch,
    addDocAsync,
    updateDocAsync,
    deleteDocAsync,
  } = useFirestoreCollection('rfqs', {
    ...options,
    orderByFields: options.orderByFields || [['createdAt', 'desc']],
  });

  return {
    rfqs,
    loading: isLoading,
    error,
    refetch,
    addRFQ: addDocAsync,
    updateRFQ: updateDocAsync,
    deleteRFQ: deleteDocAsync,
  };
}
