import { useFirestoreCollection } from '../data/useFirestoreCollection';

export function usePrescriptions(options = {}) {
  const {
    data: prescriptions,
    isLoading,
    error,
    refetch,
    addDocAsync,
    updateDocAsync,
    deleteDocAsync,
  } = useFirestoreCollection('prescriptions', {
    ...options,
    // Provide a default orderBy if not specified. Usually sorted by createdAt descending
    orderByFields: options.orderByFields || [['createdAt', 'desc']],
  });

  return {
    prescriptions,
    loading: isLoading,
    error,
    refetch,
    addPrescription: addDocAsync,
    updatePrescription: updateDocAsync,
    deletePrescription: deleteDocAsync,
  };
}
