import { useMemo } from 'react';
import useFirestorePaginatedCollection from './useFirestorePaginatedCollection';

/**
 * Hook to fetch paginated prescriptions authored by a specific doctor.
 * Adheres to the "Golden Rule" pagination architecture.
 * 
 * @param {Object} options - Hook options
 * @param {string} options.doctorId - The ID of the doctor
 * @param {number} [options.pageSize=50] - Number of prescriptions per page
 */
export function useDoctorPrescriptions({ doctorId, pageSize = 50 }) {
  const whereConditions = useMemo(() => {
    const conditions = [];
    if (doctorId) {
      conditions.push(['doctorId', '==', doctorId]);
    }
    return conditions;
  }, [doctorId]);

  const {
    data: prescriptions,
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
    enabled: !!doctorId
  });

  return {
    prescriptions,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}
