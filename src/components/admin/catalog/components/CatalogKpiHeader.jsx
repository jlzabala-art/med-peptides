import React from 'react';
import { Package, FlaskConical, Layers, Tags } from 'lucide-react';
import MetricCard from '../../../ui/MetricCard';
import { KpiScopeBar } from '../../../ui';

export default function CatalogKpiHeader({
  displayedMetrics,
  kpiScope,
  setKpiScope,
  hasAnyFilter,
  filterProductType,
  setMultiParam
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <KpiScopeBar
        scope={kpiScope}
        onScopeChange={setKpiScope}
        scopeLabel={displayedMetrics.scopeLabel}
        isFiltered={hasAnyFilter}
        filteredCount={`${displayedMetrics.totalProducts} Prods · ${displayedMetrics.totalVariants} Vars`}
        globalCount={`${displayedMetrics.globalProducts || 395} Prods · ${displayedMetrics.globalVariants || 814} Vars`}
      />

      <div className="kpi-grid-4">
        <MetricCard 
          title="Total Products"
          value={displayedMetrics.totalProducts} 
          badge={`${displayedMetrics.totalVariants} Variants`}
          subtitle={kpiScope === 'global' ? "All canonical molecules" : "Matching active filters"}
          icon={Package}
          color="#2563eb"
        />
        <MetricCard 
          title="Raw Materials / APIs" 
          value={displayedMetrics.apisProducts} 
          badge={`${displayedMetrics.apisVariants} Formats`}
          subtitle={kpiScope === 'global' ? "Active bulk peptide powders" : "Active raw materials in view"}
          icon={FlaskConical}
          color="#0d9488"
        />
        <MetricCard 
          title="Finished Formulations" 
          value={displayedMetrics.finishedProducts} 
          badge={`${displayedMetrics.finishedVariants} Doses`}
          subtitle={kpiScope === 'global' ? "Vials, sprays & finished pens" : "Finished formulations in view"}
          icon={Layers}
          color="#7c3aed"
        />
        <MetricCard 
          title="Active Categories" 
          value={displayedMetrics.categories} 
          badge={`${displayedMetrics.totalVariants} SKUs`}
          subtitle={kpiScope === 'global' ? "All registered categories" : "Categories in active scope"}
          icon={Tags}
          color="#ea580c"
        />
      </div>

      {/* Quick Product Type Segmented Tabs */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        overflowX: 'auto', 
        paddingBottom: '4px', 
        marginTop: '0.35rem',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {[
          { id: 'all', label: 'All Catalog', count: `${displayedMetrics.totalProducts} (${displayedMetrics.totalVariants} vars)` },
          { id: 'finished_product', label: '💊 Finished Products', count: `${displayedMetrics.finishedProducts} (${displayedMetrics.finishedVariants} vars)` },
          { id: 'api_raw_material', label: '🧪 Raw Materials & APIs', count: `${displayedMetrics.apisProducts} (${displayedMetrics.apisVariants} vars)` },
        ].map(tab => {
          const isSelected = tab.id === 'all' 
            ? filterProductType.length === 0 
            : (filterProductType.length === 1 && filterProductType[0] === tab.id);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'all') {
                  setMultiParam('productType', []);
                } else {
                  setMultiParam('productType', [tab.id]);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                minHeight: '40px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
                background: isSelected ? 'var(--color-primary, #003666)' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                boxShadow: isSelected ? '0 1px 3px rgba(0, 54, 102, 0.2)' : '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.72rem',
                padding: '1px 6px',
                borderRadius: '10px',
                background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: isSelected ? '#ffffff' : '#64748b',
                fontWeight: 700
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
