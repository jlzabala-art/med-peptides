import React from 'react';

/**
 * Generic KPI Header Widget
 * Displays a list of KPI cards in a responsive grid.
 * 
 * @param {string} title - Optional title above the KPIs.
 * @param {Array} kpis - Array of { label, value, icon: LucideIcon, color }
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '16px'
      }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {Icon && <Icon size={16} color={kpi.color || '#64748b'} />}
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {kpi.label}
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
