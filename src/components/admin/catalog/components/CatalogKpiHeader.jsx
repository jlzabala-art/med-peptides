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
  setMultiParam,
  isGenomicsMatrix = false,
  genomicsMetrics = null,
  filterPriority,
  updateUrlParam,
  filterTagMode
}) {
  if (isGenomicsMatrix && genomicsMetrics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <KpiScopeBar
          scope={kpiScope}
          onScopeChange={setKpiScope}
          scopeLabel="Genomic Intervention Scope"
          isFiltered={hasAnyFilter || Boolean(filterPriority)}
          filteredCount={`${genomicsMetrics.total} Compounds · ${genomicsMetrics.totalVariants} Vars`}
          globalCount={`${genomicsMetrics.globalTotal || genomicsMetrics.total} Actionable Molecules`}
        />

        {/* Responsive KPI Grid: 4 cols on desktop, 2x2 grid on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
          gap: '0.75rem'
        }}>
          <MetricCard 
            title="Actionable Compounds"
            value={genomicsMetrics.total} 
            badge={`${genomicsMetrics.totalVariants} Formats`}
            subtitle="Linked to active genetic panels"
            icon={Package}
            color="#0284c7"
          />
          <MetricCard 
            title="First-Line (Priority A)" 
            value={genomicsMetrics.priorityA} 
            badge="Target Therapy"
            subtitle="Primary choice interventions"
            icon={FlaskConical}
            color="#15803d"
          />
          <MetricCard 
            title="Multi-Panel Targets" 
            value={genomicsMetrics.multiPanel} 
            badge="Cross-Indication"
            subtitle="Recommended by ≥2 genetic tests"
            icon={Layers}
            color="#7c3aed"
          />
          <MetricCard 
            title="Active Genetic Panels" 
            value={genomicsMetrics.testCount} 
            badge="Covered Tests"
            subtitle="TrichoTest, NutriGen, TeloTest..."
            icon={Tags}
            color="#ea580c"
          />
        </div>

        {/* Quick Genomic Priority Segmented Tabs with Smooth Touch Scroll */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            overflowX: 'auto', 
            paddingBottom: '4px', 
            paddingRight: '1rem',
            marginTop: '0.35rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {[
              { id: 'all', shortLabel: '🧬 All', label: '🧬 All Targets', count: genomicsMetrics.total },
              { id: 'A', shortLabel: '🟢 Priority A', label: '🟢 Priority A (First-line)', count: genomicsMetrics.priorityA },
              { id: 'B', shortLabel: '🟡 Priority B', label: '🟡 Priority B (Second-line)', count: genomicsMetrics.priorityB },
              { id: 'C', shortLabel: '🔵 Priority C', label: '🔵 Priority C (Supportive)', count: genomicsMetrics.priorityC },
              { id: 'shared', shortLabel: '🔀 Multi-Panel', label: '🔀 Multi-Panel (≥2 Tests)', count: genomicsMetrics.multiPanel },
            ].map(tab => {
              const isSelected = tab.id === 'all'
                ? (!filterPriority || filterPriority === 'all') && filterTagMode !== 'all'
                : tab.id === 'shared'
                  ? filterTagMode === 'all'
                  : filterPriority === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === 'all') {
                      updateUrlParam?.('priority', '');
                      updateUrlParam?.('tagMode', '');
                    } else if (tab.id === 'shared') {
                      updateUrlParam?.('tagMode', 'all');
                      updateUrlParam?.('priority', '');
                    } else {
                      updateUrlParam?.('priority', tab.id);
                      updateUrlParam?.('tagMode', '');
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    minHeight: '38px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
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
      </div>
    );
  }

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
