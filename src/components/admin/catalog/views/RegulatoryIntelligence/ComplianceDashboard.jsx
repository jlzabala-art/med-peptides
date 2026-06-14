import React from 'react';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import FileWarning from 'lucide-react/dist/esm/icons/file-warning';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';

export function ComplianceDashboard({ metrics }) {
  const kpis = [
    {
      label: 'Fully Compliant',
      value: metrics.fullyCompliant,
      icon: CheckCircle2,
      color: '#059669',
      bg: '#d1fae5',
    },
    { label: 'High Risk', value: metrics.highRisk, icon: XCircle, color: '#e11d48', bg: '#ffe4e6' },
    {
      label: 'Missing COA',
      value: metrics.missingCOA,
      icon: FileWarning,
      color: '#d97706',
      bg: '#fef3c7',
    },
    {
      label: 'Invalid GMP',
      value: metrics.missingGMP,
      icon: AlertTriangle,
      color: '#d97706',
      bg: '#fef3c7',
    },
    {
      label: 'Expiring Regs (30d)',
      value: metrics.expiringRegs,
      icon: ShieldCheck,
      color: '#4f46e5',
      bg: '#e0e7ff',
    },
    {
      label: 'Missing Permits',
      value: metrics.missingPermits,
      icon: FileWarning,
      color: '#db2777',
      bg: '#fce7f3',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}
    >
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = kpi.color)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                backgroundColor: kpi.bg,
                padding: '8px',
                borderRadius: '8px',
                color: kpi.color,
                display: 'flex',
              }}
            >
              <kpi.icon size={20} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{kpi.value}</div>
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>{kpi.label}</div>
        </div>
      ))}
    </div>
  );
}
