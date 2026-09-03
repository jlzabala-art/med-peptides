import { useMemo } from 'react';
import useFirestorePaginatedCollection from './useFirestorePaginatedCollection';

/**
 * Hook to fetch paginated active treatments/prescriptions for a specific patient.
 * Adheres to the "Golden Rule" pagination architecture.
 * 
 * @param {Object} options - Hook options
 * @param {string} options.patientId - The ID of the patient
 * @param {number} [options.pageSize=50] - Number of items per page
 */
export function usePatientTreatments({ patientId, pageSize = 50 }) {
  const whereConditions = useMemo(() => {
    const conditions = [];
    if (patientId) {
      conditions.push(['patientId', '==', patientId]);
    }
    return conditions;
  }, [patientId]);

  const {
    data: treatments,
    isLoading: loading,
    isFetchingMore,
    error,
    hasMore,
    loadMore,
    refresh
  } = useFirestorePaginatedCollection('prescriptions', {
    pageSize,
    whereConditions,
    orderByFields: [['createdAt', 'desc']],
    enabled: !!patientId
  });

  return {
    treatments,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}
