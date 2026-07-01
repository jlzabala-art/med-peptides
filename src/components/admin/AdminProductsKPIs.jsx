import React from 'react';
import Package from 'lucide-react/dist/esm/icons/package';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Activity from 'lucide-react/dist/esm/icons/activity';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';

export function UniformKPIs({ products }) {
  const total = products.length;
  const active = products.filter((p) => p.status === 'active').length;
  const draft = products.filter((p) => p.status === 'draft').length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= (p.minStock || 5)).length;

  const stats = [
    { label: 'Total Products', value: total, color: '#3b82f6', icon: <Package size={16} /> },
    { label: 'Active', value: active, color: '#10b981', icon: <Activity size={16} /> },
    { label: 'Draft / Inactive', value: draft, color: '#6b7280', icon: <Clock size={16} /> },
    { label: 'Low Stock', value: lowStock, color: '#f59e0b', icon: <AlertTriangle size={16} /> },
    { label: 'Out of Stock', value: outOfStock, color: '#ef4444', icon: <AlertCircle size={16} /> },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
      }}
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

export function SmartChips({ activeChip, setActiveChip }) {
  const chips = [
    { id: 'all', label: 'All Items', icon: <Package size={14} /> },
    { id: 'active', label: 'Active', icon: <Activity size={14} /> },
    { id: 'draft', label: 'Draft / Inactive', icon: <Clock size={14} /> },
    { id: 'low_stock', label: 'Low / Out of Stock', icon: <AlertTriangle size={14} /> },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <style>{`
        .smart-chip {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          white-space: nowrap;
        }
        .smart-chip.active {
          background: #0f172a;
          color: white;
          border: 1px solid #0f172a;
        }
        .smart-chip.inactive {
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }
        .smart-chip.inactive:hover {
          border-color: #94a3b8;
          color: #334155;
        }
      `}</style>
      {chips.map((chip) => (
        <button
          key={chip.id}
          className={`smart-chip ${activeChip === chip.id ? 'active' : 'inactive'}`}
          onClick={() => setActiveChip(chip.id)}
        >
          {chip.icon} {chip.label}
        </button>
      ))}
    </div>
  );
}
