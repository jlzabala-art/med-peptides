import Box from "lucide-react/dist/esm/icons/box";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import FileWarning from "lucide-react/dist/esm/icons/file-warning";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import React, { useMemo } from 'react';








export default function CatalogKPIHeader({ products, onFilterSelect }) {
  const kpis = useMemo(() => {
    let active = 0;
    const suppliers = new Set();
    let regulatoryRisks = 0;
    let missingData = 0;
    let lowStock = 0;

    products.forEach(p => {
      if (p.isActive !== false) active++;
      if (p.supplier) suppliers.add(p.supplier);
      if (p.registrationStatus !== 'Registered') regulatoryRisks++;
      if (!p.sku || !p.supplier || !p.category) missingData++;
      if (p.stock < 20) lowStock++;
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
        id: 'active',
        label: 'Active Items',
        value: active,
        icon: CheckCircle,
        color: '#16a34a',
        bg: '#dcfce7',
      },
      {
        id: 'suppliers',
        label: 'Suppliers',
        value: suppliers.size,
        icon: Building2,
        color: '#8b5cf6',
        bg: '#ede9fe',
      },
      {
        id: 'regulatory',
        label: 'Regulatory Risks',
        value: regulatoryRisks,
        icon: AlertTriangle,
        color: '#f59e0b',
        bg: '#fef3c7',
      },
      {
        id: 'missing_data',
        label: 'Missing Data',
        value: missingData,
        icon: FileWarning,
        color: '#ef4444',
        bg: '#fee2e2',
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
          margin-bottom: 1.5rem;
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
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            overflow: hidden;
            scroll-snap-type: none;
            gap: 1rem;
          }
          .kpi-card {
            flex: 1;
            min-width: 0;
          }
        }
      `}</style>
      <div className="kpi-container">
        {kpis.map(kpi => (
          <div
            key={kpi.id}
            className="kpi-card"
            onClick={() => onFilterSelect(kpi.id)}
          style={{
            backgroundColor: 'white',
            padding: '1rem',
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
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <kpi.icon size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{kpi.label}</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{kpi.value}</span>
          </div>
        </div>
      ))}
      </div>
    </>
  );
}