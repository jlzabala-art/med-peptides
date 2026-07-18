import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import React from 'react';

import PageHeader from '../ui/PageHeader';
import POWidget from '../widgets/purchase/POWidget';
import { usePurchaseOrderAggregates } from '../../hooks/data/usePurchaseOrderAggregates';
import { MetricCard } from '../ui';
import DataModule from '../ui/DataModule';

export default function AdminPOTab() {
  const { data: kpis, isLoading } = usePurchaseOrderAggregates();

  const kpiSection = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      <MetricCard
        title="Total POs"
        value={isLoading ? '...' : kpis?.totalPOs || 0}
        color="var(--color-primary)"
      />
      <MetricCard
        title="Open POs"
        value={isLoading ? '...' : kpis?.openPOs || 0}
        color="var(--color-warning)"
      />
      <MetricCard
        title="Pending Approval"
        value={isLoading ? '...' : kpis?.pendingApproval || 0}
        color="var(--color-danger)"
        alert={kpis?.pendingApproval > 0}
      />
      <MetricCard
        title="Total Spend"
        value={isLoading ? '...' : `$${(kpis?.totalSpend || 0).toLocaleString()}`}
        color="var(--color-success)"
      />
    </div>
  );

  return (
    <DataModule
      header={<PageHeader title="Purchase Orders" subtitle="Manage official orders sent to suppliers." icon={ShoppingCart} />}
      kpis={kpiSection}
    >
      <POWidget collectionName="purchaseOrders" readOnly={false} compact={false} />
    </DataModule>
  );
}