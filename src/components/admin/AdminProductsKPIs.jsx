import React from 'react';
import Package from 'lucide-react/dist/esm/icons/package';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Activity from 'lucide-react/dist/esm/icons/activity';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import MetricCard from '@/components/ui/MetricCard';

export function UniformKPIs({ products, globalMetrics }) {
  const total = globalMetrics?.total ?? products.length;
  const active = globalMetrics?.active ?? products.filter((p) => p.status === 'active').length;
  const draft = globalMetrics?.drafts ?? products.filter((p) => p.status === 'draft').length;
  const outOfStock = globalMetrics?.outOfStock ?? products.filter((p) => p.stock <= 0).length;
  const lowStock = globalMetrics?.lowStock ?? products.filter((p) => p.stock > 0 && p.stock <= (p.minStock || 5)).length;

  const stats = [
    { label: 'Total Products', value: total, color: '#3b82f6', icon: Package, filter: 'all' },
    { label: 'Active', value: active, color: '#10b981', icon: Activity, filter: 'active' },
    { label: 'Draft / Inactive', value: draft, color: '#6b7280', icon: Clock, filter: 'draft' },
    { label: 'Stock Issues', value: lowStock + outOfStock, color: '#f59e0b', icon: AlertTriangle, filter: 'low_stock' },
  ];

  return (
    <div className="kpi-scroll-row" style={{ marginBottom: '1.5rem' }}>
      {stats.map((s, i) => (
        <MetricCard
          key={i}
          title={s.label}
          value={s.value}
          icon={s.icon}
          color={s.color}
          onClick={() => {
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href);
              if (s.filter === 'all') {
                url.searchParams.delete('status');
              } else {
                url.searchParams.set('status', s.filter);
              }
              window.history.pushState({}, '', url.toString());
              window.dispatchEvent(new Event('popstate'));
            }
          }}
          className="clickable-card"
        />
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
