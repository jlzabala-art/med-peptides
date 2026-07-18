import React from 'react';
import { FileText, Clock, Activity, CheckCircle2 } from '@/lib/icons';
import { usePrescriptionAggregates } from '../../../hooks/data/usePrescriptionAggregates';
import { MetricCard } from '../../ui';

export default function PrescriptionsKPIs() {
  const { data: aggs, isLoading } = usePrescriptionAggregates();

  const stats = [
    { label: 'Total Prescriptions', value: aggs?.totalPrescriptions || 0, color: 'var(--color-primary)', icon: FileText },
    { label: 'Awaiting Review', value: aggs?.awaitingReview || 0, color: 'var(--color-warning)', icon: Clock, alert: (aggs?.awaitingReview || 0) > 0 },
    { label: 'Active', value: aggs?.active || 0, color: 'var(--color-success)', icon: Activity },
    { label: 'Fulfilled', value: aggs?.fulfilled || 0, color: '#6366f1', icon: CheckCircle2 },
  ];

  return (
    <div
      className="kpi-scroll-row"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', paddingBottom: '0.5rem' }}
    >
      {stats.map((s, i) => (
        <MetricCard
          key={i}
          title={s.label}
          value={s.value}
          color={s.color}
          icon={s.icon}
          alert={s.alert}
          loading={isLoading}
        />
      ))}
    </div>
  );
}
