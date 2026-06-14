import React, { useMemo } from 'react';
import Activity from 'lucide-react/dist/esm/icons/activity';
import Database from 'lucide-react/dist/esm/icons/database';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import PieChart from 'lucide-react/dist/esm/icons/pie-chart';

const Card = ({ title, icon: Icon, children }) => (
  <div
    style={{
      background: 'var(--color-bg-surface, #ffffff)',
      border: '1px solid var(--color-border, #e2e8f0)',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-muted, #64748b)',
      }}
    >
      <Icon size={16} />
      <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{title}</h3>
    </div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);
export default function CatalogOverviewDashboard({
  products = [],
  variants = [],
  onAction,
  filterState,
  onNavigate,
}) {
  const stats = useMemo(() => {
    let totalItems = products.length;
    let highHealth = 0;
    let missingCoa = 0;
    let missingGmp = 0;
    let completeData = 0;

    let categories = {};
    let suppliers = {};

    products.forEach((p) => {
      // Health
      if ((p.healthScore || 100) >= 80) highHealth++;

      // Data completeness
      const isComplete = p.supplier && p.category && p.description;
      if (isComplete) completeData++;

      // Regulatory
      if (!p.hasCoa) missingCoa++;
      if (p.registrationStatus !== 'Registered') missingGmp++;

      // Dist
      const cat = p.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;

      const sup = p.supplier || 'No Supplier';
      suppliers[sup] = (suppliers[sup] || 0) + 1;
    });

    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const topSuppliers = Object.entries(suppliers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalItems,
      healthPct: totalItems ? Math.round((highHealth / totalItems) * 100) : 0,
      completePct: totalItems ? Math.round((completeData / totalItems) * 100) : 0,
      missingCoa,
      missingGmp,
      topCategories,
      topSuppliers,
    };
  }, [products]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        height: '100%',
      }}
    >
      {/* Product Health */}
      <Card title="Product Health Summary" icon={Activity}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-main, #1e293b)',
              lineHeight: 1,
            }}
          >
            {stats.healthPct}%
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted, #64748b)',
              paddingBottom: '4px',
            }}
          >
            healthy products
          </span>
        </div>
        <div
          style={{
            marginTop: '1rem',
            height: '6px',
            background: 'var(--color-bg-hover, #f1f5f9)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${stats.healthPct}%`,
              background: 'var(--color-primary, #6366f1)',
            }}
          />
        </div>
      </Card>

      {/* Data Completeness */}
      <Card title="Data Completeness" icon={Database}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--text-main, #1e293b)',
              lineHeight: 1,
            }}
          >
            {stats.completePct}%
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted, #64748b)',
              paddingBottom: '4px',
            }}
          >
            fully mapped
          </span>
        </div>
        <div
          style={{
            marginTop: '1rem',
            height: '6px',
            background: 'var(--color-bg-hover, #f1f5f9)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: '100%', width: `${stats.completePct}%`, background: '#10b981' }} />
        </div>
      </Card>

      {/* Regulatory Status */}
      <Card title="Regulatory Risks" icon={ShieldCheck}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Missing COA</span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: stats.missingCoa > 0 ? '#ef4444' : '#10b981',
              }}
            >
              {stats.missingCoa}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
              Unregistered / Pending
            </span>
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: stats.missingGmp > 0 ? '#f59e0b' : '#10b981',
              }}
            >
              {stats.missingGmp}
            </span>
          </div>
        </div>
      </Card>

      {/* Supplier Distribution */}
      <Card title="Top Suppliers" icon={PieChart}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.topSuppliers.map(([sup, count], idx) => (
            <div
              key={idx}
              onClick={() => {
                if (filterState) {
                  filterState.setFilters([
                    { id: 'supplier', value: sup, label: `Supplier: ${sup}` },
                  ]);
                  if (onNavigate) onNavigate();
                }
              }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{sup}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {Math.round((count / stats.totalItems) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Category Distribution */}
      <Card title="Category Split" icon={PieChart}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.topCategories.map(([cat, count], idx) => (
            <div
              key={idx}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{cat}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {Math.round((count / stats.totalItems) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Risks */}
      <Card title="Top Actionable Risks" icon={AlertTriangle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div
            onClick={() => {
              if (filterState) {
                filterState.setFilters([{ id: 'missingCoa', value: 'true', label: 'Missing COA' }]);
                if (onNavigate) onNavigate();
              }
            }}
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {stats.missingCoa} items require immediate COA upload &rarr;
          </div>
          <div
            onClick={() => {
              if (filterState) {
                filterState.setFilters([
                  { id: 'regulatoryRisk', value: 'true', label: 'Regulatory Risk' },
                ]);
                if (onNavigate) onNavigate();
              }
            }}
            style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {stats.missingGmp} items pending regulatory review &rarr;
          </div>
        </div>
      </Card>
    </div>
  );
}
