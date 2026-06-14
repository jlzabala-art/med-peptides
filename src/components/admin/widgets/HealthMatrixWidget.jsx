import React from 'react';
import Activity from 'lucide-react/dist/esm/icons/activity';

export default function HealthMatrixWidget({ statusData = [] }) {
  const defaultStatus = [
    {
      id: 'sales',
      label: 'Sales Network',
      state: 'green',
      desc: 'Quota hit',
      link: '/admin/sales',
    },
    {
      id: 'procurement',
      label: 'Procurement',
      state: 'green',
      desc: 'Optimal lead time',
      link: '/admin/suppliers',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      state: 'yellow',
      desc: '3 SKUs low',
      link: '/admin/products',
    },
    {
      id: 'cashflow',
      label: 'Cash Flow',
      state: 'green',
      desc: 'Reserves healthy',
      link: '/admin/finance',
    },
    { id: 'crm', label: 'B2B Leads', state: 'green', desc: '14 new leads', link: '/admin/crm' },
    {
      id: 'ops',
      label: 'Ops Dispatch',
      state: 'yellow',
      desc: 'Courier delayed',
      link: '/admin/logistics',
    },
  ];

  const items = statusData.length > 0 ? statusData : defaultStatus;

  return (
    <div
      className="health-matrix-widget"
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '1.25rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Activity size={18} color="#0284c7" />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
          Business Health Matrix
        </h3>
      </div>

      <div className="health-matrix-grid">
        <style>{`
          .health-matrix-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .hm-card {
            padding: 0.75rem;
            border-radius: 8px;
            border: 1px solid #f1f5f9;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            transition: all 0.2s;
            text-decoration: none;
            color: inherit;
          }
          .hm-card:hover {
            border-color: #cbd5e1;
            transform: translateY(-2px);
            background: #ffffff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          @media (min-width: 1024px) {
            .health-matrix-grid {
              grid-template-columns: repeat(6, 1fr);
            }
          }
        `}</style>

        {items.map((item) => {
          let dotColor = '#10b981';
          let bgGlow = '#d1fae5';
          if (item.state === 'yellow') {
            dotColor = '#f59e0b';
            bgGlow = '#fef3c7';
          }
          if (item.state === 'red') {
            dotColor = '#ef4444';
            bgGlow = '#fee2e2';
          }

          return (
            <a href={item.link || '#'} key={item.id} className="hm-card">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: dotColor,
                    boxShadow: `0 0 8px ${dotColor}`,
                  }}
                />
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: dotColor,
                    backgroundColor: bgGlow,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.state}
                </span>
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.1rem',
                  marginTop: '0.25rem',
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.desc}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
