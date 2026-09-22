'use client';

import React from 'react';
import { FlaskConical, ShieldCheck, Zap, FileCheck } from 'lucide-react';

/**
 * SharedCatalogKpiBar — Google Cloud Console Standard 4-KPI Metric Strip
 * Displays institutional quality guarantees and live stock status.
 * STRICT: Zero mentions of cold-chain (lyophilized peptides are stable at room temperature).
 */
export default function SharedCatalogKpiBar({
  totalProductsCount = 0,
  displayedCount = 0,
  totalVariants = 0,
  isFiltered = false,
  t = (k, fallback) => fallback,
}) {
  const kpis = [
    {
      id: 'formulas',
      icon: FlaskConical,
      title: 'Active Formulations',
      value: isFiltered ? `${displayedCount} / ${totalProductsCount}` : `${totalProductsCount || 0}`,
      badge: isFiltered ? 'Filtered View' : `${totalVariants || 0} SKUs`,
      badgeColor: isFiltered ? '#d97706' : '#0369a1',
      badgeBg: isFiltered ? '#fef3c7' : '#e0f2fe',
      subtitle: 'Lyophilized peptide formulations',
      color: '#0284c7',
      bg: 'rgba(2, 132, 199, 0.06)',
      border: 'rgba(2, 132, 199, 0.18)',
    },
    {
      id: 'purity',
      icon: ShieldCheck,
      title: 'Analytical Purity',
      value: '≥99.2%',
      badge: 'Dual HPLC',
      badgeColor: '#15803d',
      badgeBg: '#dcfce7',
      subtitle: 'High-purity verified assay',
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.06)',
      border: 'rgba(22, 163, 74, 0.18)',
    },
    {
      id: 'dispatch',
      icon: Zap,
      title: 'Dispatch Readiness',
      value: '24-48h',
      badge: 'Ready Stock',
      badgeColor: '#1d4ed8',
      badgeBg: '#dbeafe',
      subtitle: 'Immediate warehouse fulfillment',
      color: '#2563eb',
      bg: 'rgba(37, 99, 235, 0.06)',
      border: 'rgba(37, 99, 235, 0.18)',
    },
    {
      id: 'traceability',
      icon: FileCheck,
      title: 'Batch Traceability',
      value: '100% CoA',
      badge: 'Full Trace',
      badgeColor: '#6d28d9',
      badgeBg: '#ede9fe',
      subtitle: 'Lot analysis & chromatography',
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.06)',
      border: 'rgba(124, 58, 237, 0.18)',
    },
  ];

  return (
    <div
      className="shared-catalog-kpi-bar"
      style={{
        margin: '0.85rem 0 1rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '0.75rem',
        width: '100%',
      }}
    >
      <style jsx>{`
        @media (max-width: 900px) {
          .shared-catalog-kpi-bar {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.6rem !important;
          }
        }
        @media (max-width: 480px) {
          .shared-catalog-kpi-bar {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            style={{
              backgroundColor: '#ffffff',
              border: `1px solid ${kpi.border}`,
              borderRadius: '10px',
              padding: '0.75rem 0.9rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '84px',
            }}
          >
            {/* Top row: Icon + Title + Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    backgroundColor: kpi.bg,
                    color: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} strokeWidth={2.2} />
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {kpi.title}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '99px',
                  backgroundColor: kpi.badgeBg,
                  color: kpi.badgeColor,
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                {kpi.badge}
              </span>
            </div>

            {/* Bottom row: Value + Subtitle */}
            <div style={{ marginTop: '0.45rem' }}>
              <div
                style={{
                  fontSize: '1.22rem',
                  fontWeight: 900,
                  color: '#0f172a',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                {kpi.value}
              </div>
              <p
                style={{
                  margin: '3px 0 0',
                  fontSize: '0.68rem',
                  color: '#64748b',
                  fontWeight: 500,
                  lineHeight: 1.25,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {kpi.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
