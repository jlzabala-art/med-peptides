import React, { useState } from 'react';
import { FileText, Clock, Activity, CheckCircle2 } from '@/lib/icons';
import { usePrescriptionAggregates } from '../../../hooks/data/usePrescriptionAggregates';
import { MetricCard, KpiScopeBar } from '../../ui';

export default function PrescriptionsKPIs({ serverKPIs, filteredCount = null, isFiltered = false }) {
  const { data: aggs, isLoading } = usePrescriptionAggregates({ enabled: !serverKPIs });
  const [scope, setScope] = useState('filtered');

  const globalKpis = serverKPIs || aggs;
  const isKpiLoading = !serverKPIs && isLoading;

  const totalCount = globalKpis?.total || globalKpis?.totalPrescriptions || 0;
  const pendingCount = globalKpis?.awaiting || globalKpis?.awaitingReview || 0;
  const activeCount = globalKpis?.active || 0;
  const fulfilledCount = globalKpis?.fulfilled || 0;

  const displayedTotal = (scope === 'filtered' && isFiltered && filteredCount != null) ? filteredCount : totalCount;

  const stats = [
    { label: 'Total Prescriptions', value: displayedTotal, subtitle: scope === 'global' ? 'All database records' : (isFiltered ? 'Matching active filters' : 'Active prescriptions'), color: 'var(--color-primary, #003666)', icon: FileText, filter: 'all' },
    { label: 'Pending Review', value: pendingCount, subtitle: 'Awaiting doctor approval', color: '#d97706', icon: Clock, alert: pendingCount > 0, filter: 'pending' },
    { label: 'Active Treatments', value: activeCount, subtitle: 'Currently in progress', color: '#16a34a', icon: Activity, filter: 'active' },
    { label: 'Fulfilled & Completed', value: fulfilledCount, subtitle: 'Successfully dispensed', color: '#2563eb', icon: CheckCircle2, filter: 'fulfilled' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <KpiScopeBar
        scope={scope}
        onScopeChange={setScope}
        isFiltered={isFiltered}
        filteredCount={filteredCount}
        globalCount={totalCount}
        scopeLabel={scope === 'global' ? 'Entire Database (Unfiltered)' : (isFiltered ? 'Matching Active Filters' : 'Active Prescriptions')}
      />
      <div className="dashboard-kpi-grid">
        {stats.map((s, i) => (
          <MetricCard
            key={i}
            title={s.label}
            value={s.value}
            subtitle={s.subtitle}
            color={s.color}
            icon={s.icon}
            alert={s.alert}
            loading={isKpiLoading}
            onClick={() => {
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                if (s.filter === 'all') {
                  url.searchParams.delete('status');
                } else {
                  url.searchParams.set('status', s.filter);
                }
                window.history.pushState({}, '', url.toString());
                window.dispatchEvent(new Event('popstate'));
              }
            }}
            className="clickable-card"
          />
        ))}
      </div>
    </div>
  );
}
