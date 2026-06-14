import LayoutGrid from "lucide-react/dist/esm/icons/layout-grid";
import List from "lucide-react/dist/esm/icons/list";
import BarChart2 from "lucide-react/dist/esm/icons/bar-chart-2";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Truck from "lucide-react/dist/esm/icons/truck";
import React from 'react';






export const CATALOG_VIEWS = [
  { id: 'table', label: 'Table', icon: List },
  { id: 'cards', label: 'Cards', icon: LayoutGrid },
  { id: 'inventory', label: 'Inventory Intelligence', icon: BarChart2 },
  { id: 'suppliers', label: 'Supplier Insights', icon: Truck },
  { id: 'regulatory', label: 'Regulatory', icon: ShieldAlert }
];

export default function CatalogViewManager({ activeView, onViewChange, isMobile }) {
  const views = isMobile ? CATALOG_VIEWS.filter(v => v.id !== 'table') : CATALOG_VIEWS;

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '0.5rem',
        padding: '0.5rem 0',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1rem'
      }} className="hide-scrollbars">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: activeView === view.id ? 'var(--color-bg-subtle)' : 'transparent',
              color: activeView === view.id ? 'var(--color-primary)' : 'var(--text-muted)',
              fontWeight: activeView === view.id ? 600 : 500,
              fontSize: '0.85rem',
              whiteSpace: 'nowrap'
            }}
          >
            <view.icon size={16} />
            {view.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid var(--border)',
      padding: '4px',
      width: 'max-content'
    }}>
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          title={view.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: 'none',
            background: activeView === view.id ? 'var(--color-bg-subtle)' : 'transparent',
            color: activeView === view.id ? 'var(--color-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: activeView === view.id ? 600 : 500,
            fontSize: '0.85rem'
          }}
        >
          <view.icon size={16} />
          {view.label}
        </button>
      ))}
    </div>
  );
}