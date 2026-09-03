import { useMemo } from 'react';
import useFirestorePaginatedCollection from './useFirestorePaginatedCollection';

/**
 * Hook estandarizado para obtener órdenes (B2B Orders / Compras).
 * Migrado para usar useFirestorePaginatedCollection internamente y seguir Golden Rules.
 *
 * @param {Object} filters - Filtros de la consulta (ej. { buyerId: '123', status: 'pending' })
 * @param {Object} options - Opciones de configuración
 */
export default function useOrders(filters = {}, options = {}, initialData = null) {
  const pageSize = options.pageSize || 50;
  const orderByDesc = options.orderByDesc !== undefined ? options.orderByDesc : true;

  const whereConditions = useMemo(() => {
    return Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, '==', value]);
  }, [JSON.stringify(filters)]);

  const {
    data,
    isLoading: loading,
    isFetchingMore,
    hasMore,
    error,
    loadMore,
    refresh
  } = useFirestorePaginatedCollection('orders', {
    pageSize,
    whereConditions,
    orderByFields: [['createdAt', orderByDesc ? 'desc' : 'asc']],
    initialData
  });

  return {
    data,
    loading,
    isFetchingMore,
    error,
    hasMore,
    loadMore,
    refresh
  };
}
