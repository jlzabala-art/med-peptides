import React from 'react';
import OperationalKPICard from './OperationalKPICard';

/**
 * Generic KPI Header Widget
 * Displays a list of KPI cards in a responsive grid.
 * 
 * @param {string} title - Optional title above the KPIs.
 * @param {Array} kpis - Array of { label, value, icon: LucideIcon, color, severity, trend, actionLabel, onClick }
 */
export default function KPIHeaderWidget({ title, kpis = [] }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      {title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {title}
          </h2>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px'
      }}>
        {kpis.map((kpi, idx) => (
          <OperationalKPICard
            key={idx}
            title={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            severity={kpi.severity || 'neutral'}
            trend={kpi.trend}
            actionLabel={kpi.actionLabel}
            onClick={kpi.onClick}
          />
        ))}
      </div>
    </div>
  );
}
