import React, { useState } from 'react';
import useFirestorePaginatedCollection from '../../hooks/data/useFirestorePaginatedCollection';

import SalesOrderWorkspace from './SalesOrderWorkspace';
import SalesOrderActionCenter from './SalesOrderActionCenter';

import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusChip from '../../components/ui/StatusChip';
import CopyableId from '../../components/ui/CopyableId';
import StandardDrawer from '../../components/ui/StandardDrawer';

function normalizeOrderData(doc) {
  const data = { id: doc.id, ...doc.data() };
  if (!data.commercialStatus) {
    if (['CONFIRMED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'INVOICED'].includes(data.status)) data.commercialStatus = 'Accepted';
    else if (data.status === 'CANCELLED') data.commercialStatus = 'Rejected';
    else data.commercialStatus = 'Draft';
  }
  if (!data.operationalStatus) {
    if (data.status === 'SHIPPED') data.operationalStatus = 'In Transit';
    else if (data.status === 'DELIVERED') data.operationalStatus = 'Delivered';
    else if (data.status === 'IN_PROGRESS') data.operationalStatus = 'Manufacturing';
    else data.operationalStatus = 'Awaiting Stock';
  }
  if (!data.financialStatus) {
    data.financialStatus = data.status === 'INVOICED' ? 'Unpaid' : 'Unpaid';
  }
  return data;
}

export default function SalesOrdersHub() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  const {
    data: rawOrders,
    isLoading: loading,
    isFetchingMore,
    hasMore,
    loadMore,
    refresh,
    metrics
  } = useFirestorePaginatedCollection('b2b_sales_orders', {
    pageSize: 50,
    orderByField: 'createdAt',
    orderByDesc: true
  });

  const orders = rawOrders.map(normalizeOrderData);

  const columns = [
    { key: 'reference', label: 'Order Ref', width: '15%', render: (row) => <CopyableId value={row.reference || row.id.slice(0, 8)} /> },
    { key: 'customerName', label: 'Customer', width: '30%', render: (row) => <span style={{ fontWeight: 600 }}>{row.customerName || 'Unknown'}</span> },
    { key: 'createdAt', label: 'Date', width: '15%', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'totalAmount', label: 'Total', width: '10%', render: (row) => `$${(row.totalAmount || row.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}` },
    { key: 'status', label: 'Status', width: '15%', render: (row) => <StatusChip status={row.commercialStatus || row.status || 'draft'} /> },
    { key: 'operationalStatus', label: 'Ops Status', width: '15%', render: (row) => <StatusChip status={row.operationalStatus || 'pending'} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader 
        title="Sales Orders" 
        subtitle="Manage B2B orders and wholesale fulfillments"
      />
      
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, overflow: 'auto' }}>
        <DataTable
          data={orders}
          columns={columns}
          loading={loading}
          globalSearch={true}
          searchPlaceholder="Search sales orders..."
          onRowClick={setSelectedOrder}
        />
      </div>

      <StandardDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.reference || selectedOrder.id.slice(0, 8)}` : ''}
        size="lg"
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <SalesOrderWorkspace order={selectedOrder} />
            <div style={{ padding: '0 2rem 2rem 2rem' }}>
              <SalesOrderActionCenter order={selectedOrder} />
            </div>
          </div>
        )}
      </StandardDrawer>
    </div>
  );
}
