import React from 'react';
import { FileText, Clock, Activity, CheckCircle2 } from '@/lib/icons';
import { usePrescriptionAggregates } from '../../../hooks/data/usePrescriptionAggregates';
import GridSkeleton from '../../ui/skeletons/GridSkeleton';

export default function PrescriptionsKPIs() {
  const { data: aggs, isLoading } = usePrescriptionAggregates();

  if (isLoading) {
    return <GridSkeleton count={4} cols={4} />;
  }

  const stats = [
    { label: 'Total Prescriptions', value: aggs?.totalPrescriptions || 0, color: '#3b82f6', icon: <FileText size={16} /> },
    { label: 'Awaiting Review', value: aggs?.awaitingReview || 0, color: '#f59e0b', icon: <Clock size={16} /> },
    { label: 'Active', value: aggs?.active || 0, color: '#10b981', icon: <Activity size={16} /> },
    { label: 'Fulfilled', value: aggs?.fulfilled || 0, color: '#6366f1', icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <div
      className="kpi-scroll-row"
      style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            flex: '1 1 200px',
            minWidth: 180,
            background: 'white',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
            <div
              style={{
                color: s.color,
                background: s.color + '15',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
              }}
            >
              {s.icon}
            </div>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {s.label}
            </span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
