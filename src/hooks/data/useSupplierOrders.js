'use client';
/**
 * hooks/data/useSupplierOrders.js
 *
 * Migrado a React Query + supplierRepository.
 * Sin imports directos de firebase/firestore.
 */

import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getOrdersBySupplier } from '@/repositories/supplierRepository';
import { queryKeys } from './queryKeys';
import notifier from '@/services/NotificationService';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook principal — pedidos del supplier autenticado (primera página, sin infinite scroll).
 * Útil para el dashboard y widgets de resumen.
 *
 * @param {{ statusFilter?: string, limitCount?: number, enabled?: boolean }} opts
 */
export function useSupplierOrders(opts = {}) {
  const { statusFilter = null, limitCount = 50, enabled = true } = opts;
  const { user, userProfile } = useAuth();
  const supplierId = user?.uid;
  const isSupplier = userProfile?.role === 'supplier' || userProfile?.role === 'admin';

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.suppliers.orders(supplierId, { statusFilter, limitCount }),
    queryFn: async () => {
      const res = await getOrdersBySupplier(supplierId, { limitCount, status: statusFilter });
      return res.orders;
    },
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!supplierId && isSupplier,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.orders(supplierId, {}) });

  return {
    ...query,
    orders: query.data ?? [],
    invalidate,
  };
}

/**
 * Infinite scroll variant — para la tabla completa de pedidos del supplier.
 *
 * @param {{ statusFilter?: string, limitCount?: number, enabled?: boolean }} opts
 */
export function useInfiniteSupplierOrders(opts = {}) {
  const { statusFilter = null, limitCount = 50, enabled = true } = opts;
  const { user, userProfile } = useAuth();
  const supplierId = user?.uid;
  const isSupplier = userProfile?.role === 'supplier' || userProfile?.role === 'admin';

  return useInfiniteQuery({
    queryKey: queryKeys.suppliers.orders(supplierId, { statusFilter, limitCount, infinite: true }),
    queryFn: async ({ pageParam = null }) => {
      return await getOrdersBySupplier(supplierId, { limitCount, status: statusFilter, lastDoc: pageParam });
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: null,
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!supplierId && isSupplier,
  });
}
