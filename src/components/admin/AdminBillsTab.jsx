import Receipt from "lucide-react/dist/esm/icons/receipt";
import React from 'react';

import PageHeader from '../ui/PageHeader';
import BillsWidget from '../widgets/purchase/BillsWidget';
import { useBillAggregates } from '../../hooks/data/useBillAggregates';
import { MetricCard } from '../ui';
import { MetricCard } from '../ui';
export default function AdminBillsTab() {
  const { data: kpis, isLoading } = useBillAggregates();

  const kpiSection = (
    <div className="kpi-scroll-row">
      <MetricCard
        title="Total Bills"
        value={isLoading ? '...' : kpis?.totalBills || 0}
        color="var(--color-primary)"
      />
      <MetricCard
        title="Open Bills"
        value={isLoading ? '...' : kpis?.openBills || 0}
        color="var(--color-warning)"
        alert={kpis?.openBills > 0}
      />
      <MetricCard
        title="Paid Bills"
        value={isLoading ? '...' : kpis?.paidBills || 0}
        color="var(--color-success)"
      />
      <MetricCard
        title="Total Spend"
        value={isLoading ? '...' : `$${(kpis?.totalSpend || 0).toLocaleString()}`}
        color="var(--color-primary)"
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Supplier Bills" subtitle="Manage incoming invoices and bills from suppliers." />
      <div className="tab-container" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
        {kpiSection}
        <div style={{ marginTop: '1.5rem' }}>
          <BillsWidget collectionName="purchaseBills" readOnly={false} compact={false} />
        </div>
      </div>
    </div>
  );
}