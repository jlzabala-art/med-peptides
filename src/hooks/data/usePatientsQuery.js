'use client';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { PatientRepository } from '@/repositories/patientRepository';

import { queryKeys } from './queryKeys';
import { validatePatient } from '@/schemas/patientSchema.zod';
import notifier from '@/services/NotificationService';

export function usePatientsQuery(options = {}) {
  const queryClient = useQueryClient();
  const { filters = {}, pageSize = 50, validate = true, enabled = true } = options;

  const query = useQuery({
    queryKey: queryKeys.patients.list(filters),
    queryFn: async () => {
      const res = await PatientRepository.getPatientsPage({ filters, pageSize });
      const data = res.data;
      if (validate) {
        const results = data.map(item => validatePatient(item));
        const valid = results.filter(r => r.success).map(r => r.data);
        const invalid = results.filter(r => !r.success);
        if (invalid.length) {
          console.warn(`${invalid.length} patient(s) failed validation and will be excluded.`);
          notifier.error(`${invalid.length} invalid patient(s) ignored.`);
        }
        return valid;
      }
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await PatientRepository.updatePatient(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      notifier.success('Patient updated successfully ✓');
    },
    onError: (err) => {
      notifier.error(`Failed to update patient: ${err.message}`);
    },
  });

  return {
    ...query,
    patients: query.data || [],
    updatePatient: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useInfinitePatientsQuery(options = {}) {
  const { filters = {}, pageSize = 50, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: queryKeys.patients.list({ ...filters, infinite: true }),
    queryFn: async ({ pageParam = null }) => {
      return await PatientRepository.getPatientsPage({ filters, pageSize, pageParam });
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: null,
    staleTime: 1000 * 60 * 10,
    enabled,
  });
}
