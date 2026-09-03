import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import React from 'react';

import PageHeader from '../ui/PageHeader';
import POWidget from '../widgets/purchase/POWidget';
import { usePurchaseOrderAggregates } from '../../hooks/data/usePurchaseOrderAggregates';
import { MetricCard } from '../ui';

export default function AdminPOTab() {
  const { data: kpis, isLoading } = usePurchaseOrderAggregates();

  const kpiSection = (
    <div className="kpi-grid-4">
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Purchase Orders" subtitle="Manage official orders sent to suppliers." />
      <div className="tab-container" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        {kpiSection}
        <div style={{ marginTop: '1.5rem' }}>
          <POWidget collectionName="purchaseOrders" readOnly={false} compact={false} />
        </div>
      </div>
    </div>
  );
}