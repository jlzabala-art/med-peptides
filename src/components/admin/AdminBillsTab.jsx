import Receipt from "lucide-react/dist/esm/icons/receipt";
import React from 'react';

import PageHeader from '../ui/PageHeader';
import BillsWidget from '../widgets/purchase/BillsWidget';
import { useBillAggregates } from '../../hooks/data/useBillAggregates';
import { MetricCard } from '../ui';
import DataModule from '../ui/DataModule';

export default function AdminBillsTab() {
  const { data: kpis, isLoading } = useBillAggregates();

  const kpiSection = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
    <DataModule
      header={<PageHeader title="Supplier Bills" subtitle="Manage incoming invoices and bills from suppliers." icon={Receipt} />}
      kpis={kpiSection}
    >
      <BillsWidget collectionName="purchaseBills" readOnly={false} compact={false} />
    </DataModule>
  );
}