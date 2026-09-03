'use client';
/**
 * hooks/data/useSupplierProducts.js
 *
 * Migrado a React Query + supplierRepository.
 * Sin imports directos de firebase/firestore.
 */

import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getProductsBySupplier } from '@/repositories/supplierRepository';
import { queryKeys } from './queryKeys';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook de productos del supplier autenticado.
 * Primera página (sin infinite scroll) — para widgets y dashboards.
 *
 * @param {{ limitCount?: number, enabled?: boolean }} opts
 */
export function useSupplierProducts(opts = {}) {
  const { limitCount = 50, enabled = true } = opts;
  const { user } = useAuth();
  const supplierId = user?.uid;

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.suppliers.products(supplierId, { limitCount }),
    queryFn: async () => {
      const res = await getProductsBySupplier(supplierId, { limitCount });
      return res.products;
    },
    staleTime: 1000 * 60 * 15, // Productos cambian menos frecuentemente
    enabled: enabled && !!supplierId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.products(supplierId, {}) });

  return {
    ...query,
    products: query.data ?? [],
    invalidate,
  };
}

/**
 * Infinite scroll variant — para la tabla completa de productos del supplier.
 *
 * @param {{ limitCount?: number, enabled?: boolean }} opts
 */
export function useInfiniteSupplierProducts(opts = {}) {
  const { limitCount = 50, enabled = true } = opts;
  const { user } = useAuth();
  const supplierId = user?.uid;

  return useInfiniteQuery({
    queryKey: queryKeys.suppliers.products(supplierId, { limitCount, infinite: true }),
    queryFn: async ({ pageParam = null }) => {
      return await getProductsBySupplier(supplierId, { limitCount, lastDoc: pageParam });
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: null,
    staleTime: 1000 * 60 * 15,
    enabled: enabled && !!supplierId,
  });
}
