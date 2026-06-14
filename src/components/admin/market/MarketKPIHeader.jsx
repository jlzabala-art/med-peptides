import Box from "lucide-react/dist/esm/icons/box";
import Users from "lucide-react/dist/esm/icons/users";
import Bell from "lucide-react/dist/esm/icons/bell";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import React from 'react';







export default function MarketKPIHeader({ stats }) {
  const kpis = [
    {
      id: 'products',
      label: 'Products Monitored',
      value: stats?.totalMatches || 0,
      icon: Box,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-light)',
    },
    {
      id: 'competitors',
      label: 'Competitors',
      value: stats?.totalCompetitors || 0,
      icon: Users,
      color: '#8b5cf6',
      bg: '#ede9fe',
    },
    {
      id: 'alerts',
      label: 'Price Alerts',
      value: '12',
      icon: Bell,
      color: '#ef4444',
      bg: '#fee2e2',
    },
    {
      id: 'opportunities',
      label: 'Market Opportunities',
      value: stats?.cheaperCount || 0,
      icon: TrendingUp,
      color: '#10b981',
      bg: '#dcfce7',
    },
    {
      id: 'margin_risk',
      label: 'Needs Adjustment',
      value: stats?.expensiveCount || 0,
      icon: AlertTriangle,
      color: '#f59e0b',
      bg: '#fef3c7',
    },
    {
      id: 'score',
      label: 'Competitive Score',
      value: '86/100',
      icon: ShieldCheck,
      color: '#0ea5e9',
      bg: '#e0f2fe',
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      {kpis.map(kpi => (
        <div
          key={kpi.id}
          style={{
            backgroundColor: 'white',
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          <div style={{
            backgroundColor: kpi.bg,
            color: kpi.color,
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <kpi.icon size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>{kpi.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}