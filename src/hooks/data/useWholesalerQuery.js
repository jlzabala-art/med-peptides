'use client';
/**
 * hooks/data/useWholesalerQuery.js
 *
 * Hook principal B2B — centraliza toda la lógica de datos del panel Wholesaler.
 * Patrón: React Query + wholesalerRepository (sin imports directos de Firestore).
 *
 * Exports:
 *   - useClientsQuery(tenantId, opts)
 *   - useManagerStatsQuery(managerId)
 *   - useInvitationsQuery(managerId)
 *   - useWholesalerOrdersQuery(wholesalerId, opts)
 *   - useInfiniteBulkOrdersQuery(wholesalerId, opts)
 */

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { wholesalerRepository } from '@/repositories/wholesalerRepository';
import { queryKeys } from './queryKeys';
import notifier from '@/services/NotificationService';

// ─── CLIENTS ──────────────────────────────────────────────────────────────────

/**
 * Query de clientes atribuidos a un tenant.
 * Reemplaza el useEffect + getDocs de ClientsTab.jsx
 *
 * @param {string} tenantId
 * @param {{ role?: string, limitCount?: number, enabled?: boolean }} opts
 */
export function useClientsQuery(tenantId, opts = {}) {
  const { role = undefined, limitCount = 50, enabled = true } = opts;

  return useQuery({
    queryKey: queryKeys.wholesaler.clients(tenantId, { role, limitCount }),
    queryFn: async () => {
      const res = await wholesalerRepository.getClientsByTenant(tenantId, { role, limitCount });
      return res.clients;
    },
    staleTime: 1000 * 60 * 10, // 10 min
    enabled: enabled && !!tenantId,
  });
}

// ─── MANAGER STATS ────────────────────────────────────────────────────────────

/**
 * Query de estadísticas KPI para un account manager.
 * Reemplaza el useEffect + getDocs de ManagerOverviewTab.jsx
 *
 * @param {string} managerId
 * @param {{ enabled?: boolean }} opts
 */
export function useManagerStatsQuery(managerId, opts = {}) {
  const { enabled = true } = opts;

  return useQuery({
    queryKey: queryKeys.wholesaler.stats(managerId),
    queryFn: () => wholesalerRepository.getManagerStats(managerId),
    staleTime: 1000 * 60 * 5, // 5 min
    enabled: enabled && !!managerId,
  });
}

// ─── INVITATIONS ──────────────────────────────────────────────────────────────

/**
 * Query + mutación de invitaciones del manager.
 * Reemplaza el inline useQuery/useMutation de ManagerInvitationsTab.jsx
 *
 * @param {string} managerId
 * @param {{ enabled?: boolean }} opts
 */
export function useInvitationsQuery(managerId, opts = {}) {
  const { enabled = true } = opts;
  const queryClient = useQueryClient();
  const queryKey = queryKeys.invitations.byManager(managerId);

  const query = useQuery({
    queryKey,
    queryFn: () => wholesalerRepository.getInvitationsByManager(managerId),
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!managerId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => wholesalerRepository.createInvitation({ ...data, createdBy: managerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      notifier.success('Invitación enviada correctamente ✓');
    },
    onError: (err) => notifier.error(`Error al crear invitación: ${err.message}`),
  });

  return {
    ...query,
    invitations: query.data ?? [],
    createInvitation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

// ─── WHOLESALER ORDERS ────────────────────────────────────────────────────────

/**
 * Query de pedidos de un wholesaler, con filtro de estado opcional.
 *
 * @param {string} wholesalerId
 * @param {{ status?: string, limitCount?: number, enabled?: boolean }} opts
 */
export function useWholesalerOrdersQuery(wholesalerId, opts = {}) {
  const { status = undefined, limitCount = 50, enabled = true } = opts;

  return useQuery({
    queryKey: queryKeys.wholesaler.orders(wholesalerId, { status, limitCount }),
    queryFn: async () => {
      const res = await wholesalerRepository.getOrdersByWholesaler(wholesalerId, { status, limitCount });
      return res.orders;
    },
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!wholesalerId,
  });
}

// ─── BULK ORDERS (Infinite Scroll) ────────────────────────────────────────────

/**
 * Infinite query de bulk orders con cursor de Firestore.
 * Reemplaza el useFirestoreCollection genérico de useBulkOrders.js
 *
 * @param {string} wholesalerId
 * @param {{ limitCount?: number, enabled?: boolean }} opts
 */
export function useInfiniteBulkOrdersQuery(wholesalerId, opts = {}) {
  const { limitCount = 50, enabled = true } = opts;

  return useInfiniteQuery({
    queryKey: queryKeys.wholesaler.bulkOrders(wholesalerId, { limitCount }),
    queryFn: async ({ pageParam = null }) => {
      return await wholesalerRepository.getBulkOrdersPaginated(wholesalerId, {
        limitCount,
        lastDoc: pageParam,
      });
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!wholesalerId,
  });
}
