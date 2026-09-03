'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrdersByUser, getOrdersBySupplier, updateOrderStatus } from '@/repositories/orderRepository';
import { queryKeys } from './queryKeys';
import notifier from '@/services/NotificationService';

export function useOrdersQuery(options = {}) {
  const queryClient = useQueryClient();
  const { userId = null, supplierId = null, status = null, limitCount = 50, enabled = true } = options;

  const queryKey = userId
    ? queryKeys.orders.byUser(userId)
    : supplierId
    ? queryKeys.orders.bySupplier(supplierId)
    : queryKeys.orders.list({ status, limitCount });

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (userId) {
        const res = await getOrdersByUser(userId, { limitCount, status });
        return res.orders;
      }
      if (supplierId) {
        const res = await getOrdersBySupplier(supplierId, { limitCount, status });
        return res.orders;
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && (!!userId || !!supplierId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status: newStatus, notes }) => {
      await updateOrderStatus(orderId, newStatus, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      notifier.success('Order status updated ✓');
    },
    onError: (err) => {
      notifier.error(`Failed to update order: ${err.message}`);
    },
  });

  return {
    ...query,
    orders: query.data || [],
    updateOrderStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
}
