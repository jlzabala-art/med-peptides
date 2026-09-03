import React from 'react';
import { Package, Truck, Layers, Tags } from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';

/**
 * Inline pill list for category / supplier names.
 * Shows up to `max` pills, then "+N" overflow badge.
 */
function NamePills({ names = [], color = '#6366f1', max = 4 }) {
  if (!names.length) return <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>None</span>;

  const visible  = names.slice(0, max);
  const overflow = names.length - max;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
      {visible.map((name, i) => (
        <span
          key={i}
          title={name}
          style={{
            display: 'inline-block',
            maxWidth: 110,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.65rem',
            fontWeight: 600,
            lineHeight: 1.5,
            padding: '1px 6px',
            borderRadius: 99,
            background: `${color}18`,
            color,
            border: `1px solid ${color}33`,
          }}
        >
          {name}
        </span>
      ))}
      {overflow > 0 && (
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          padding: '1px 4px',
        }}>
          +{overflow}
        </span>
      )}
    </div>
  );
}

/* ── Human-readable category key mapper ─────────────────────────── */
const FALLBACK_CATEGORY_LABELS = {
  api_raw_material:           'API / Raw Materials',
  blood_analysis:             'Blood Analysis',
  capsules_and_consumables:   'Capsules & Consumables',
  compounding_materials:      'Compounding Materials',
  peptides:                   'Peptides',
  genetic_tests:              'Genetic Tests',
  hormones:                   'Hormones',
  supplements:                'Supplements',
  wellness:                   'Wellness',
  diagnostics:                'Diagnostics',
};

function resolveCategoryLabel(key, getCategoryLabel) {
  if (getCategoryLabel) {
    const label = getCategoryLabel(key);
    if (label && label !== key) return label;
  }
  return FALLBACK_CATEGORY_LABELS[key] || key;
}

export default function CatalogKPIs({ kpis, getCategoryLabel }) {
  if (!kpis) return null;

  const formatCounts = kpis.formatCounts || {};
  const categoryList = (kpis.categoryList || []).map(k => resolveCategoryLabel(k, getCategoryLabel));
  const supplierList = kpis.supplierList || [];

  const formatParts = [];
  if (formatCounts.vial    > 0) formatParts.push(`Vials: ${formatCounts.vial}`);
  if (formatCounts.pen     > 0) formatParts.push(`Pens: ${formatCounts.pen}`);
  if (formatCounts.spray   > 0) formatParts.push(`Spray: ${formatCounts.spray}`);
  if (formatCounts.oral    > 0) formatParts.push(`Oral: ${formatCounts.oral}`);
  if (formatCounts.topical > 0) formatParts.push(`Topical: ${formatCounts.topical}`);

  return (
    <div className="dashboard-kpi-grid">
      <MetricCard
        title="Products"
        value={kpis.totalProducts || 0}
        icon={Package}
        color="#3b82f6"
        subtitle="Canonical master products"
      />
      <MetricCard
        title="Variants"
        value={kpis.totalVariants || 0}
        icon={Layers}
        color="#f59e0b"
        subtitle={
          formatParts.length > 0
            ? <NamePills names={formatParts} color="#f59e0b" max={3} />
            : 'All formats'
        }
      />
      <MetricCard
        title="Active Categories"
        value={kpis.activeCategories || 0}
        icon={Tags}
        color="#6366f1"
        subtitle={
          categoryList.length > 0
            ? <NamePills names={categoryList} color="#6366f1" max={2} />
            : 'Therapeutic areas'
        }
      />
      <MetricCard
        title="Active Suppliers"
        value={kpis.activeSuppliers || 0}
        icon={Truck}
        color="#10b981"
        subtitle={
          supplierList.length > 0
            ? <NamePills names={supplierList} color="#10b981" max={2} />
            : 'Sourcing partners'
        }
      />
    </div>
  );
}
