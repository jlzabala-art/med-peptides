import React from 'react';
import OrdersTable from '../../features/orders/components/OrdersTable';
import { fetchOrdersAction, fetchOrdersMetricsAction } from '../../actions/ordersActions';

/**
 * Server Component Container for Orders
 * Fetches the initial data payload securely via Firebase Admin
 * and passes it to the presentational Client Component.
 */
export default async function OrdersTab({ buyerId = null, accountManagerId = null, doctorId = null, readOnly = false, viewMode = 'admin' }) {
  // Fetch initial data securely on the server
  const [initialOrders, globalMetrics] = await Promise.all([
    fetchOrdersAction({ limitCount: 50, buyerId, accountManagerId, doctorId }),
    fetchOrdersMetricsAction({ buyerId, accountManagerId, doctorId })
  ]);
  
  return (
    <OrdersTable
      initialOrders={initialOrders}
      globalMetrics={globalMetrics}
      buyerId={buyerId}
      accountManagerId={accountManagerId}
      doctorId={doctorId}
      readOnly={readOnly}
      viewMode={viewMode}
    />
  );
}