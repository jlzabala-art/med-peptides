'use client';
/**
 * hooks/data/usePrescriptionsQuery.js
 *
 * Hook canónico de prescripciones — React Query + prescriptionRepository.
 * Este es el único hook que los componentes deben importar.
 *
 * usePrescriptions.js está DEPRECATED — usar este en su lugar.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { prescriptionRepository } from '@/repositories/prescriptionRepository';
import { queryKeys } from './queryKeys';
import notifier from '@/services/NotificationService';

// ─── HOOK PRINCIPAL ───────────────────────────────────────────────────────────

export function usePrescriptionsQuery(options = {}) {
  const queryClient = useQueryClient();
  const { filters = {}, pageSize = 50, enabled = true } = options;

  const query = useQuery({
    queryKey: queryKeys.prescriptions.list(filters),
    queryFn: async () => {
      const res = await prescriptionRepository.getPrescriptionsPage({ filters, pageSize });
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await prescriptionRepository.createPrescription(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.all });
      notifier.success('Prescripción creada correctamente ✓');
    },
    onError: (err) => {
      notifier.error(`Error al crear prescripción: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await prescriptionRepository.updatePrescription(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.all });
      notifier.success('Prescripción actualizada ✓');
    },
    onError: (err) => {
      notifier.error(`Error al actualizar prescripción: ${err.message}`);
    },
  });

  return {
    ...query,
    prescriptions: query.data || [],
    createPrescription: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updatePrescription: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

// ─── INFINITE SCROLL ──────────────────────────────────────────────────────────

export function useInfinitePrescriptionsQuery(options = {}) {
  const { filters = {}, pageSize = 50, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: queryKeys.prescriptions.list({ ...filters, infinite: true }),
    queryFn: async ({ pageParam = null }) => {
      return await prescriptionRepository.getPrescriptionsPage({ filters, pageSize, pageParam });
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: null,
    staleTime: 1000 * 60 * 10,
    enabled,
  });
}

// ─── CROSS-ENTITY: POR PRODUCTO ───────────────────────────────────────────────

/**
 * Prescripciones que contienen un producto específico.
 * Útil para: Supplier Dashboard, Admin Product View.
 *
 * @param {string} productId
 * @param {{ enabled?: boolean }} opts
 */
export function usePrescriptionsByProduct(productId, opts = {}) {
  const { enabled = true } = opts;

  return useQuery({
    queryKey: [...queryKeys.prescriptions.all, 'byProduct', productId],
    queryFn: () => prescriptionRepository.getByProduct(productId),
    staleTime: 1000 * 60 * 10,
    enabled: enabled && !!productId,
  });
}

// ─── CROSS-ENTITY: POR PROTOCOLO ─────────────────────────────────────────────

/**
 * Prescripciones originadas desde un protocolo.
 * Útil para ver cuántas prescripciones ha generado un protocolo.
 *
 * @param {string} protocolId
 * @param {{ enabled?: boolean }} opts
 */
export function usePrescriptionsByProtocol(protocolId, opts = {}) {
  const { enabled = true } = opts;

  return useQuery({
    queryKey: [...queryKeys.prescriptions.all, 'byProtocol', protocolId],
    queryFn: () => prescriptionRepository.getByProtocol(protocolId),
    staleTime: 1000 * 60 * 10,
    enabled: enabled && !!protocolId,
  });
}

// ─── CROSS-ENTITY: PROTOCOLO → PRESCRIPCIÓN ──────────────────────────────────

/**
 * Mutación para crear una prescripción a partir de un protocolo.
 * Flujo confirmado por usuario: Doctor en vista de Protocolo → "Iniciar Prescripción"
 *
 * @example
 * const { createFromProtocol, isCreating } = useCreatePrescriptionFromProtocol();
 * const newId = await createFromProtocol(protocol, { doctorId, patientId });
 * router.push(`/prescriptions/${newId}`);
 */
export function useCreatePrescriptionFromProtocol() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ protocol, overrides }) =>
      prescriptionRepository.createFromProtocol(protocol, overrides),
    onSuccess: (newId, { protocol }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prescriptions.all });
      notifier.success(
        `Prescripción borrador creada desde "${protocol.name || protocol.title}" ✓`
      );
    },
    onError: (err) => {
      notifier.error(`Error al iniciar prescripción: ${err.message}`);
    },
  });

  return {
    createFromProtocol: ({ protocol, overrides } = {}) =>
      mutation.mutateAsync({ protocol, overrides }),
    isCreating: mutation.isPending,
    newPrescriptionId: mutation.data,
  };
}
