'use client';
import React from 'react';
import { Building2, Layers, AlertTriangle, BarChart2 } from '@/lib/icons';
import { MetricCard } from '../../ui';

/**
 * SupplierKPIs
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders 4 pre-computed KPIs sourced from `_meta/supplier_coverage.kpis`.
 * No client-side scanning — all numbers are server-materialized on every
 * product/variant write via the metaSupplierCoverage Cloud Function trigger.
 *
 * KPI definitions:
 *   1. Active Suppliers    — suppliers with ≥1 product linked (vs. "Total Network"
 *                            which counted all registered suppliers, causing
 *                            the duplicate "12 / 12" problem).
 *   2. Total SKUs          — total variants across all suppliers (more granular
 *                            than "products", shows depth of each partnership).
 *   3. Top Supplier Share  — % of catalog owned by the single largest supplier.
 *                            High % = concentration risk. Actionable for sourcing.
 *   4. Avg SKUs / Supplier — total SKUs ÷ active suppliers. Low = shallow partnerships.
 */
export default function SupplierKPIs({ kpiStats = {}, activeKpiFilter, setActiveKpiFilter, isMobile }) {
  const {
    activeSuppliers    = 0,
    totalSKUs          = 0,
    topSupplierShare   = 0,
    topSupplierName    = '',
    avgSkusPerSupplier = 0,
  } = kpiStats;

  const kpis = [
    {
      id: 'all',
      title: 'Active Suppliers',
      value: activeSuppliers,
      subtitle: 'With linked catalog',
      trend: activeSuppliers > 0 ? 'up' : 'neutral',
      trendValue: `${activeSuppliers} sourcing`,
      icon: Building2,
      color: 'var(--color-primary, #003666)',
      tooltip: 'Suppliers that have at least one product linked in the catalog.',
    },
    {
      id: 'skus',
      title: 'Total SKUs',
      value: totalSKUs.toLocaleString(),
      subtitle: 'Variants across all suppliers',
      trend: totalSKUs > 0 ? 'up' : 'neutral',
      trendValue: 'Live',
      icon: Layers,
      color: 'var(--color-info, #2563eb)',
      tooltip: 'Total number of product variants (SKUs) sourced from all active suppliers.',
    },
    {
      id: 'concentration',
      title: 'Top Supplier Share',
      value: `${topSupplierShare}%`,
      subtitle: topSupplierName ? `${topSupplierName} leads` : 'Concentration risk',
      trend: topSupplierShare > 50 ? 'down' : topSupplierShare > 30 ? 'neutral' : 'up',
      trendValue: topSupplierShare > 50 ? 'High risk' : topSupplierShare > 30 ? 'Moderate' : 'Healthy',
      icon: AlertTriangle,
      color: topSupplierShare > 50
        ? 'var(--color-error, #dc2626)'
        : topSupplierShare > 30
          ? 'var(--color-warning, #d97706)'
          : 'var(--color-success, #16a34a)',
      tooltip: `${topSupplierName || 'The largest supplier'} supplies ${topSupplierShare}% of your catalog. Above 50% signals concentration risk.`,
    },
    {
      id: 'depth',
      title: 'Avg SKUs / Supplier',
      value: avgSkusPerSupplier,
      subtitle: 'Partnership depth',
      trend: avgSkusPerSupplier >= 50 ? 'up' : avgSkusPerSupplier >= 20 ? 'neutral' : 'down',
      trendValue: avgSkusPerSupplier >= 50 ? 'Deep' : avgSkusPerSupplier >= 20 ? 'Moderate' : 'Shallow',
      icon: BarChart2,
      color: 'var(--color-success, #16a34a)',
      tooltip: 'Average number of SKUs per active supplier. Low values suggest shallow sourcing relationships.',
    },
  ];

  return (
    <div className="dashboard-kpi-grid">
      {kpis.map(kpi => (
        <MetricCard
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          subtitle={kpi.subtitle}
          icon={kpi.icon}
          color={kpi.color}
          trend={kpi.trend}
          trendValue={kpi.trendValue}
          tooltip={kpi.tooltip}
          onClick={() => setActiveKpiFilter?.(activeKpiFilter === kpi.id ? 'all' : kpi.id)}
          className="clickable-card"
          style={{ opacity: (activeKpiFilter && activeKpiFilter !== 'all' && activeKpiFilter !== kpi.id) ? 0.6 : 1 }}
        />
      ))}
    </div>
  );
}
