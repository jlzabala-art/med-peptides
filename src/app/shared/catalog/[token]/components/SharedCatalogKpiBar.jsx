'use client';

import React, { useState } from 'react';
import { FlaskConical, ShieldCheck, Zap, FileCheck, Database, Filter } from 'lucide-react';

/**
 * SharedCatalogKpiBar — Google Cloud Console Standard 4-KPI Metric Strip
 * Implements Golden Rule #22:
 * 1. 4 Essential KPIs pre-computed at server level (O(1) client render, zero lag).
 * 2. Scope Switcher & Filter Indicator (Matching Active Filters vs Entire Database).
 * 3. STRICT: Zero cold-chain mention (lyophilized peptides are room-temperature stable).
 */
export default function SharedCatalogKpiBar({
  serverKpis = null,
  totalProductsCount = 0,
  displayedCount = 0,
  totalVariants = 0,
  isFiltered = false,
  t = (k, fallback) => fallback,
}) {
  // Scope Switcher state: 'active' (Applied Filters / Catalog slice) vs 'global' (Entire Firestore Database)
  const [scope, setScope] = useState('active');

  const catalogCount = serverKpis?.catalogTotalProducts ?? totalProductsCount;
  const catalogVariants = serverKpis?.catalogTotalVariants ?? totalVariants;
  const globalCount = serverKpis?.globalTotalProducts ?? 430;
  const globalVariants = serverKpis?.globalTotalVariants ?? 830;

  const isGlobalScope = scope === 'global';

  const kpis = [
    {
      id: 'formulas',
      icon: FlaskConical,
      title: isGlobalScope ? 'Global Formulations' : 'Active Formulations',
      value: isGlobalScope
        ? `${globalCount}`
        : isFiltered
        ? `${displayedCount} / ${catalogCount}`
        : `${catalogCount}`,
      badge: isGlobalScope
        ? `${globalVariants} Global SKUs`
        : isFiltered
        ? 'Filtered View'
        : `${catalogVariants} SKUs`,
      badgeColor: isGlobalScope ? '#0f766e' : isFiltered ? '#d97706' : '#0369a1',
      badgeBg: isGlobalScope ? '#ccfbf1' : isFiltered ? '#fef3c7' : '#e0f2fe',
      subtitle: isGlobalScope
        ? 'Enterprise peptide repository'
        : isFiltered
        ? 'Matching active search criteria'
        : 'Lyophilized peptide formulations',
      color: isGlobalScope ? '#0d9488' : '#0284c7',
      bg: isGlobalScope ? 'rgba(13, 148, 136, 0.07)' : 'rgba(2, 132, 199, 0.06)',
      border: isGlobalScope ? 'rgba(13, 148, 136, 0.22)' : 'rgba(2, 132, 199, 0.18)',
    },
    {
      id: 'purity',
      icon: ShieldCheck,
      title: 'Analytical Purity',
      value: serverKpis?.purityValue || '≥99.2%',
      badge: serverKpis?.purityBadge || 'Dual HPLC',
      badgeColor: '#15803d',
      badgeBg: '#dcfce7',
      subtitle: serverKpis?.puritySubtitle || 'High-purity verified assay',
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.06)',
      border: 'rgba(22, 163, 74, 0.18)',
    },
    {
      id: 'dispatch',
      icon: Zap,
      title: 'Dispatch Readiness',
      value: serverKpis?.dispatchSlaValue || '24-48h',
      badge: serverKpis?.dispatchBadge || 'Ready Stock',
      badgeColor: '#1d4ed8',
      badgeBg: '#dbeafe',
      subtitle: serverKpis?.dispatchSubtitle || 'Immediate warehouse fulfillment',
      color: '#2563eb',
      bg: 'rgba(37, 99, 235, 0.06)',
      border: 'rgba(37, 99, 235, 0.18)',
    },
    {
      id: 'traceability',
      icon: FileCheck,
      title: 'Batch Traceability',
      value: serverKpis?.traceabilityValue || '100% CoA',
      badge: serverKpis?.traceabilityBadge || 'Full Trace',
      badgeColor: '#6d28d9',
      badgeBg: '#ede9fe',
      subtitle: serverKpis?.traceabilitySubtitle || 'Lot analysis & chromatography',
      color: '#7c3aed',
      bg: 'rgba(124, 58, 237, 0.06)',
      border: 'rgba(124, 58, 237, 0.18)',
    },
  ];

  return (
    <div style={{ margin: '0.85rem 0 1rem', width: '100%' }}>
      {/* ── Rule #22 Scope Indicator & Scope Switcher Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '0.6rem',
          padding: '0 2px',
        }}
      >
        {/* Scope Indicator Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.73rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: isGlobalScope
                ? 'rgba(13, 148, 136, 0.09)'
                : isFiltered
                ? 'rgba(217, 119, 6, 0.09)'
                : 'rgba(2, 132, 199, 0.08)',
              color: isGlobalScope ? '#0f766e' : isFiltered ? '#b45309' : '#0369a1',
              border: `1px solid ${
                isGlobalScope
                  ? 'rgba(13, 148, 136, 0.2)'
                  : isFiltered
                  ? 'rgba(217, 119, 6, 0.2)'
                  : 'rgba(2, 132, 199, 0.18)'
              }`,
            }}
          >
            {isGlobalScope ? (
              <>
                <Database size={12} strokeWidth={2.4} />
                Global Database View ({globalCount} Total Formulations)
              </>
            ) : isFiltered ? (
              <>
                <Filter size={12} strokeWidth={2.4} />
                Applied Filters View ({displayedCount} of {catalogCount} matching)
              </>
            ) : (
              <>
                <FlaskConical size={12} strokeWidth={2.4} />
                Catalog Portfolio View ({catalogCount} items)
              </>
            )}
          </span>
        </div>

        {/* GCP-Style Scope Switcher Control */}
        <div
          role="group"
          aria-label="KPI Scope Switcher"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => setScope('active')}
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '3px 9px',
              fontSize: '0.71rem',
              fontWeight: scope === 'active' ? 700 : 500,
              backgroundColor: scope === 'active' ? '#ffffff' : 'transparent',
              color: scope === 'active' ? '#0f172a' : '#64748b',
              boxShadow: scope === 'active' ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <Filter size={11} strokeWidth={2.2} />
            <span>Active Slice ({isFiltered ? displayedCount : catalogCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setScope('global')}
            style={{
              border: 'none',
              borderRadius: '6px',
              padding: '3px 9px',
              fontSize: '0.71rem',
              fontWeight: scope === 'global' ? 700 : 500,
              backgroundColor: scope === 'global' ? '#ffffff' : 'transparent',
              color: scope === 'global' ? '#0f172a' : '#64748b',
              boxShadow: scope === 'global' ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <Database size={11} strokeWidth={2.2} />
            <span>Global DB ({globalCount})</span>
          </button>
        </div>
      </div>

      {/* ── 4-KPI Grid Strip ── */}
      <div
        className="shared-catalog-kpi-bar"
        style={{
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
    </div>
  );
}
