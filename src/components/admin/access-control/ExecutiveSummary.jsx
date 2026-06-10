import React from 'react';
import { Users, Shield, Edit3, AlertTriangle, Clock } from 'lucide-react';

export default function ExecutiveSummary({ rolesCount, usersCount, customRoles, adminUsers, changesThisMonth, securityAlerts, lastAudit }) {
  const kpis = [
    { label: 'Roles', value: rolesCount, icon: Shield, color: 'var(--primary)' },
    { label: 'Users', value: usersCount, icon: Users, color: '#8b5cf6' },
    { label: 'Custom Roles', value: customRoles, icon: Shield, color: '#f59e0b' },
    { label: 'Admin Users', value: adminUsers, icon: Shield, color: 'var(--color-danger)' },
    { label: 'Changes This Month', value: changesThisMonth, icon: Edit3, color: '#06b6d4' },
    { label: 'Security Alerts', value: securityAlerts, icon: AlertTriangle, color: 'var(--color-danger)', bg: 'rgba(239, 68, 68, 0.1)' },
    { label: 'Last Audit', value: lastAudit, icon: Clock, color: 'var(--text-muted)' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {kpis.map((kpi, idx) => (
        <div key={idx} style={{
          backgroundColor: kpi.bg || 'var(--color-bg-surface)',
          border: `1px solid ${kpi.bg ? kpi.color : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {kpi.label}
            </span>
            <kpi.icon size={16} style={{ color: kpi.color }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {kpi.value}
          </div>
        </div>
      ))}
    </div>
  );
}
