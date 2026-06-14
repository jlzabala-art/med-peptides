import Box from "lucide-react/dist/esm/icons/box";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import FileWarning from "lucide-react/dist/esm/icons/file-warning";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import Link from "lucide-react/dist/esm/icons/link";
import Activity from "lucide-react/dist/esm/icons/activity";
import React, { useMemo } from 'react';

export default function CatalogKPIHeader({ products, activeFilters = [], onFilterSelect }) {
  const kpis = useMemo(() => {
    let missingCoa = 0;
    let missingSupplier = 0;
    let regulatoryRisk = 0;
    let singleSource = 0;
    let lowHealth = 0;

    // We can group by parent product to determine single source if products represent variants.
    // Assuming products here is the main array.
    products.forEach(p => {
      // Logic from useCatalogData: COA might be 'Missing' if we derive it there.
      // But here p is the raw product. Let's use simple heuristic based on the properties.
      if (!p.hasCoa) missingCoa++;
      if (!p.supplier) missingSupplier++;
      if (p.registrationStatus !== 'Registered') regulatoryRisk++;
      // Single source: if there's only one supplier for this sku/name... we just mock it for now
      if (p.suppliersCount === 1 || !p.suppliersCount) singleSource++;
      if ((p.healthScore || 100) < 70) lowHealth++;
    });

    return [
      {
        id: 'total',
        label: 'Total Items',
        value: products.length,
        icon: Box,
        color: 'var(--color-primary)',
        bg: 'var(--color-primary-light)',
      },
      {
        id: 'missing_coa',
        label: 'Missing COA',
        value: missingCoa,
        icon: FileWarning,
        color: '#f59e0b',
        bg: '#fef3c7',
      },
      {
        id: 'missing_supplier',
        label: 'Missing Supplier',
        value: missingSupplier,
        icon: AlertCircle,
        color: '#ef4444',
        bg: '#fee2e2',
      },
      {
        id: 'regulatory_risk',
        label: 'Regulatory Risk',
        value: regulatoryRisk,
        icon: ShieldAlert,
        color: '#8b5cf6',
        bg: '#ede9fe',
      },
      {
        id: 'single_source',
        label: 'Single Source',
        value: singleSource,
        icon: Link,
        color: '#0ea5e9',
        bg: '#e0f2fe',
      },
      {
        id: 'low_health',
        label: 'Low Health',
        value: lowHealth,
        icon: Activity,
        color: '#ec4899',
        bg: '#fce7f3',
      }
    ];
  }, [products]);

  return (
    <>
      <style>{`
        .kpi-container {
          display: flex;
          overflow-x: auto;
          gap: 1rem;
          margin-bottom: 0;
          padding-bottom: 0.5rem;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .kpi-container::-webkit-scrollbar {
          height: 4px;
        }
        .kpi-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .kpi-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .kpi-card {
          flex: 0 0 85%;
          scroll-snap-align: start;
        }
        @media (min-width: 1024px) {
          .kpi-container {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: none;
            gap: 0.5rem;
          }
          .kpi-card {
            flex: 0 0 auto;
          }
        }
      `}</style>
      <div className="kpi-container">
        {kpis.map(kpi => {
          const isActive = activeFilters.some(f => f.id === kpi.id);
          return (
            <div
              key={kpi.id}
              className="kpi-card"
              onClick={() => onFilterSelect(kpi.id)}
              style={{
                backgroundColor: isActive ? kpi.bg : 'var(--color-bg-surface, #ffffff)',
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
                border: `1px solid ${isActive ? kpi.color : 'var(--color-border, #e2e8f0)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: isActive ? `0 0 0 1px ${kpi.color}33` : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-hover, #f8fafc)';
                  e.currentTarget.style.borderColor = 'var(--color-border-hover, #cbd5e1)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-surface, #ffffff)';
                  e.currentTarget.style.borderColor = 'var(--color-border, #e2e8f0)';
                }
              }}
            >
              <div style={{ color: isActive ? kpi.color : 'var(--text-muted, #64748b)', display: 'flex' }}>
                <kpi.icon size={14} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isActive ? kpi.color : 'var(--text-main, #1e293b)' }}>
                  {kpi.label}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? kpi.color : 'var(--text-main, #1e293b)', background: isActive ? 'rgba(255,255,255,0.5)' : 'var(--color-bg-hover, #f1f5f9)', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                  {kpi.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}