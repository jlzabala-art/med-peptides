import React from 'react';
import { FlaskConical, Activity, Edit3, Archive } from '@/lib/icons';

export default function UniformKPIs({ data, globalMetrics }) {
  const total = globalMetrics?.total ?? data.length;
  const active = globalMetrics?.active ?? data.filter((d) => d.status === 'active').length;
  const drafts = globalMetrics?.drafts ?? data.filter((d) => d.status === 'draft').length;
  const archived = globalMetrics?.archived ?? data.filter((d) => d.status === 'archived').length;

  const stats = [
    { label: 'Total Protocols', value: total, color: '#3b82f6', icon: <FlaskConical size={16} /> },
    { label: 'Active', value: active, color: '#10b981', icon: <Activity size={16} /> },
    { label: 'Drafts', value: drafts, color: '#6b7280', icon: <Edit3 size={16} /> },
    { label: 'Archived', value: archived, color: '#f59e0b', icon: <Archive size={16} /> },
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
