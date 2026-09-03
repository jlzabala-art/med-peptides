"use client";
/**
 * IvDripCatalogPage.jsx
 * Módulo Admin — Catálogo de IV Drips
 * Sigue: DataTable, PageHeader, GlobalSearchBar, StatusBadge, EmptyState, MetricCard
 */
import React, { useState, useMemo } from 'react';
import { Droplets, FlaskConical, Plus, RefreshCw, AlertCircle, Package, DollarSign, CheckCircle } from '@/lib/icons';
import { useIvDrips } from './hooks/useIvDrips';
import DataTable from '../../components/ui/DataTable';
import GlobalSearchBar from '../../components/ui/GlobalSearchBar';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import IvDripDetailDrawer from './IvDripDetailDrawer';

// ── Colores de categoría ─────────────────────────────────────────────────────
const CATEGORY_LABELS = {
  cognitive_support:         'Cognitive',
  stress_support:            'Stress',
  detox_support:             'Detox',
  metabolic_support:         'Metabolic',
  energy_support:            'Energy',
  mens_wellness:             'Men\'s Wellness',
  skin_support:              'Skin',
  wellness:                  'Wellness',
  healthy_aging:             'Anti-Aging',
  womens_wellness:           'Women\'s',
  recovery_support:          'Recovery',
  hair_support:              'Hair',
  nail_support:              'Nails',
  gastrointestinal_support:  'Gut',
  multivitamin_support:      'Multivitamin',
  immune_support:            'Immune',
  performance_support:       'Performance',
  custom:                    'Custom',
};

// ── MetricCard simple ────────────────────────────────────────────────────────
function MetricCard({ label, value, icon: Icon, color = 'var(--color-primary, #003666)', sub }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flex: '1 1 160px',
      minWidth: 140,
    }}>
      <div style={{ background: `${color}15`, borderRadius: 10, padding: 10 }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function IvDripCatalogPage() {
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType]       = useState('');
  const [selectedVial, setSelectedVial]   = useState(null);

  const { vials, loading, error, kpis, categories, ingredientMap, refresh } = useIvDrips({
    searchQuery, filterCategory, filterType
  });

  // ── Columnas DataTable ────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      key: 'commercial_names',
      header: 'Product Name',
      width: '28%',
      render: (v) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
            {v.commercial_names?.[0] || v.vial_id}
          </div>
          {v.commercial_names?.length > 1 && (
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              +{v.commercial_names.length - 1} alias{v.commercial_names.length > 2 ? 'es' : ''}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      width: '12%',
      render: (v) => (
        <code style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#475569' }}>
          {v.sku}
        </code>
      ),
    },
    {
      key: 'volume_ml',
      header: 'Vol.',
      width: '8%',
      render: (v) => (
        <span style={{ fontSize: 12, color: '#64748b' }}>
          {v.volume_ml ? `${v.volume_ml} mL` : '—'}
        </span>
      ),
    },
    {
      key: 'categories',
      header: 'Category',
      width: '18%',
      render: (v) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {(v.categories || []).slice(0, 2).map(cat => (
            <span key={cat} style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 20,
              background: '#eff6ff', color: '#2563eb', fontWeight: 500,
            }}>
              {CATEGORY_LABELS[cat] || cat}
            </span>
          ))}
          {v.categories?.length > 2 && (
            <span style={{ fontSize: 10, color: '#94a3b8' }}>+{v.categories.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: 'ingredients',
      header: 'Ingredients',
      width: '10%',
      render: (v) => (
        <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
          {v.ingredients?.length || 0}
          {v.optional_separate_vials?.length > 0 && (
            <span style={{ fontSize: 11, color: '#94a3b8' }}> +{v.optional_separate_vials.length} opt.</span>
          )}
        </span>
      ),
    },
    {
      key: 'pricing',
      header: 'Clinic Price',
      width: '12%',
      render: (v) => (
        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>
          AED {v.pricing?.clinic_price_aed ?? 500}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '8%',
      render: (v) => (
        <StatusBadge status={v.type === 'customized' ? 'draft' : 'active'} label={v.type === 'customized' ? 'Custom' : 'Standard'} />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '4%',
      sortable: false,
      render: (v) => (
        <button
          onClick={() => setSelectedVial(v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}
        >
          Ver →
        </button>
      ),
    },
  ], []);

  // ── Filtros activos ───────────────────────────────────────────────────────
  const activeFilters = [];
  if (filterCategory) activeFilters.push({ label: `Cat: ${CATEGORY_LABELS[filterCategory] || filterCategory}`, onRemove: () => setFilterCategory('') });
  if (filterType)     activeFilters.push({ label: `Tipo: ${filterType}`,  onRemove: () => setFilterType('') });

  // ── Expandable row — detalle de ingredientes ──────────────────────────────
  const expandableRender = (vial) => (
    <div style={{ padding: '12px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Ingredients</div>
          {(vial.ingredients || []).map(ing => {
            const master = ingredientMap[ing.ingredient_id];
            return (
              <div key={ing.ingredient_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#0f172a' }}>{master?.name || ing.ingredient_id}</span>
                <span style={{ color: '#64748b', fontFamily: 'monospace' }}>
                  {ing.requires_review ? '⚠️ review' : `${ing.quantity} ${ing.unit}`}
                </span>
              </div>
            );
          })}
        </div>
        {vial.optional_separate_vials?.length > 0 && (
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#d97706', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Optional Add-ons (Separate Vial)</div>
            {vial.optional_separate_vials.map(opt => {
              const master = ingredientMap[opt.ingredient_id];
              return (
                <div key={opt.ingredient_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0', borderBottom: '1px solid #fef3c7' }}>
                  <span style={{ color: '#92400e' }}>{master?.name || opt.ingredient_id}</span>
                  <span style={{ color: '#d97706', fontFamily: 'monospace' }}>
                    {opt.requires_review ? '⚠️ review' : `${opt.quantity} ${opt.unit}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ flex: 0, minWidth: 180 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Pricing</div>
          <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Clinic Price</span>
              <span style={{ fontWeight: 600, color: '#16a34a' }}>AED {vial.pricing?.clinic_price_aed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Internal Cost</span>
              <span style={{ color: '#dc2626' }}>AED {vial.pricing?.internal_cost_aed}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Margin</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{vial.pricing?.gross_margin_percent}%</span>
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              type="button"
              onClick={() => setSelectedVial(vial)}
              style={{ background: '#003666', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
            >
              Ver detalle completo
            </button>
            <button
              type="button"
              onClick={() => {
                const quoteItem = {
                  productId: vial.id || vial.sku || `iv_${Date.now()}`,
                  name: vial.name || 'IV Formulation',
                  dosage: vial.specs?.volume || 'IV Infusion',
                  unitPrice: Number(vial.pricing?.clinic_aed || vial.pricing?.retail_aed || 0),
                  supplierCost: Number(vial.pricing?.internal_cost_aed || 0),
                  quantity: 1,
                  category: 'IV Drips',
                  pricing: {
                    retail: { perUnit: Number(vial.pricing?.retail_aed || 0) },
                    clinic: { perUnit: Number(vial.pricing?.clinic_aed || 0) },
                    wholesale: { perUnit: Number(vial.pricing?.wholesale_aed || vial.pricing?.clinic_aed || 0) },
                    cost: { perUnit: Number(vial.pricing?.internal_cost_aed || 0) }
                  }
                };
                window.dispatchEvent(new CustomEvent('open-quotation-wizard', {
                  detail: {
                    type: 'manual',
                    recipientType: 'clinic',
                    source: 'iv_drips',
                    items: [quoteItem],
                    initialItem: quoteItem
                  }
                }));
              }}
              style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
            >
              + Crear cotización
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <EmptyState icon={AlertCircle} title="Error cargando catálogo IV Drips" subtitle={error}
      action={{ label: 'Reintentar', onClick: refresh }} />
  );

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Page Header */}
      <PageHeader
        title="IV Drip Catalog"
        subtitle={`${kpis.totalVials} formulaciones · ${kpis.totalPresentations} presentaciones comerciales`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={refresh} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button style={{ background: 'var(--color-primary, #003666)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Nueva Fórmula
            </button>
          </div>
        }
      />

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <MetricCard label="Viales únicos"       value={kpis.totalVials}          icon={FlaskConical}  color="#2563eb" />
        <MetricCard label="Presentaciones"       value={kpis.totalPresentations}   icon={Package}       color="#7c3aed" />
        <MetricCard label="Con add-ons opcionales" value={kpis.withOptionalAddons} icon={Droplets}     color="#0d9488" />
        <MetricCard label="Precio medio clínica" value={`AED ${kpis.avgClinicPrice}`} icon={DollarSign} color="#16a34a" />
        {kpis.requiresReview > 0 && (
          <MetricCard label="Requieren revisión" value={kpis.requiresReview} icon={AlertCircle} color="#d97706" sub="Dosis no especificadas" />
        )}
      </div>

      {/* Search + Filters */}
      <div style={{ padding: '16px 24px 8px' }}>
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre, SKU, ingrediente o categoría..."
          size="lg"
          resultCount={vials.length}
          activeFilters={activeFilters}
          filters={[
            {
              key: 'category',
              label: 'Categoría',
              value: filterCategory,
              options: [{ value: '', label: 'Todas' }, ...categories.map(c => ({ value: c, label: CATEGORY_LABELS[c] || c }))],
              onChange: setFilterCategory,
            },
            {
              key: 'type',
              label: 'Tipo',
              value: filterType,
              options: [{ value: '', label: 'Todos' }, { value: 'standard', label: 'Estándar' }, { value: 'customized', label: 'Customizado' }],
              onChange: setFilterType,
            },
          ]}
        />
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px' }}>
        <DataTable
          columns={columns}
          data={vials}
          loading={loading}
          expandableRender={expandableRender}
          globalSearch={false}
          emptyState={
            <EmptyState
              icon={FlaskConical}
              title={searchQuery || filterCategory || filterType ? "Sin resultados para estos filtros" : "Catálogo IV Drips vacío"}
              subtitle={searchQuery || filterCategory || filterType ? "Ajusta los filtros o la búsqueda" : "Ejecuta el script de importación para cargar el catálogo."}
              action={searchQuery || filterCategory || filterType
                ? { label: 'Limpiar filtros', onClick: () => { setSearchQuery(''); setFilterCategory(''); setFilterType(''); } }
                : { label: 'Refresh', onClick: refresh }
              }
            />
          }
          rowKey="vial_id"
        />
      </div>

      {/* Detail Drawer */}
      {selectedVial && (
        <IvDripDetailDrawer vial={selectedVial} ingredientMap={ingredientMap} onClose={() => setSelectedVial(null)} />
      )}
    </div>
  );
}
