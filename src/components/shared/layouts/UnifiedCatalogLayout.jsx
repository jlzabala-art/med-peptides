'use client';

import React, { useState } from 'react';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import Breadcrumb from '@/components/ui/Breadcrumb';
import MetricCard from '@/components/ui/MetricCard';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import FilterRow from '@/components/ui/FilterRow';
import ActiveFiltersBar from '@/components/ui/ActiveFiltersBar';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import { LayoutGrid, Table as TableIcon, Package } from '@/lib/icons';

/**
 * UnifiedCatalogLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout único parametrizable para:
 *  - Colecciones públicas (/collection/[slug], /proto)
 *  - Catálogos B2B / Compartidos (/vials, /c/[id], /shared/catalog/[token], /b2b/[id])
 *  - Listas de Precios y Acuerdos (/pricing/*)
 *
 * Adapta su densidad (grid vs table), cabecera (visual vs document vs minimal),
 * política de marca (atlas | cobrand | whitelabel) y visibilidad de precios.
 */
export default function UnifiedCatalogLayout({
  // Configuración principal
  config = {},
  // Navegación
  breadcrumbs = [],
  // KPIs opcionales (array de props para MetricCard)
  kpis = [],
  // Búsqueda y filtros
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search catalog...',
  namespace = 'unified_catalog',
  resultCount,
  totalCount,
  filterOptions = [],
  activeFilters = [],
  onClearAllFilters,
  // Controles de toolbar (moneda, exportaciones, acciones)
  toolbarActions = null,
  headerActions = null,
  // Datos y renderizado
  items = [],
  loading = false,
  columns = [],
  renderCard,
  onRowClick,
  expandableRender,
  emptyState = {},
  // Barra sticky inferior (carrito / RFQ)
  stickyFooterBar = null,
  // Contenido adicional opcional (tabs, notas, etc.)
  topBanner = null,
  children,
}) {
  const {
    defaultView = 'grid',
    allowViewSwitch = true,
    heroVariant = 'visual', // 'visual' | 'document' | 'minimal' | 'none'
    showKpis = true,
    branding = {},
  } = config;

  const {
    mode = 'atlas', // 'atlas' | 'cobrand' | 'whitelabel'
    title = '',
    subtitle = '',
    badge = '',
    documentRef = '',
    partnerName = '',
    accentColor = 'var(--color-primary, #003666)',
  } = branding;

  const [viewMode, setViewMode] = useState(defaultView);
  const canShowGrid = typeof renderCard === 'function';
  const canShowTable = Array.isArray(columns) && columns.length > 0;
  const effectiveView =
    viewMode === 'table' && canShowTable
      ? 'table'
      : canShowGrid
        ? 'grid'
        : canShowTable
          ? 'table'
          : 'grid';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
      }}
    >
      {/* 1. Header Público Unificado (respeta white-label cuando mode === 'whitelabel') */}
      <PublicUnifiedHeader
        whiteLabel={mode === 'whitelabel'}
        partnerName={partnerName}
      />

      {topBanner}

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1360px',
          margin: '0 auto',
          padding: 'clamp(1rem, 2.5vw, 1.75rem) clamp(1rem, 3vw, 2rem) 4rem',
        }}
      >
        {/* Breadcrumbs */}
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}

        {/* 2. Hero / Cabecera según heroVariant */}
        {heroVariant !== 'none' && (title || subtitle) && (
          <section
            style={{
              marginBottom: '1.5rem',
              padding:
                heroVariant === 'document'
                  ? '1.25rem 1.5rem'
                  : heroVariant === 'minimal'
                    ? '1rem 1.25rem'
                    : 'clamp(1.5rem, 3vw, 2.25rem)',
              borderRadius: '16px',
              background:
                heroVariant === 'visual'
                  ? `linear-gradient(135deg, ${accentColor} 0%, #0f172a 100%)`
                  : '#ffffff',
              color: heroVariant === 'visual' ? '#ffffff' : '#0f172a',
              border:
                heroVariant === 'visual'
                  ? 'none'
                  : '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ maxWidth: '780px' }}>
              {(badge || documentRef) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '0.5rem',
                  }}
                >
                  {badge && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background:
                          heroVariant === 'visual'
                            ? 'rgba(255,255,255,0.16)'
                            : '#eff6ff',
                        color:
                          heroVariant === 'visual' ? '#ffffff' : '#1d4ed8',
                      }}
                    >
                      {badge}
                    </span>
                  )}
                  {documentRef && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        opacity: 0.8,
                      }}
                    >
                      {documentRef}
                    </span>
                  )}
                </div>
              )}

              {title && (
                <h1
                  style={{
                    margin: 0,
                    fontSize:
                      heroVariant === 'visual'
                        ? 'clamp(1.5rem, 3vw, 2.15rem)'
                        : 'clamp(1.25rem, 2.2vw, 1.65rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </h1>
              )}

              {subtitle && (
                <p
                  style={{
                    margin: '0.45rem 0 0',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    opacity: heroVariant === 'visual' ? 0.9 : 0.72,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {headerActions && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  flexWrap: 'wrap',
                }}
              >
                {headerActions}
              </div>
            )}
          </section>
        )}

        {/* 3. KPIs Strip (opcional) */}
        {showKpis && Array.isArray(kpis) && kpis.length > 0 && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            {kpis.map((kpi, idx) => (
              <MetricCard key={kpi.id || idx} {...kpi} />
            ))}
          </section>
        )}

        {/* 4. Toolbar Unificada: Search + Filtros + View Switch + Acciones */}
        {(onSearchChange || filterOptions.length > 0 || toolbarActions || (allowViewSwitch && canShowGrid && canShowTable)) && (
          <section
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '0.9rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              {onSearchChange && (
                <div style={{ flex: '1 1 320px', minWidth: '220px' }}>
                  <GlobalSearchBar
                    value={searchTerm}
                    onChange={onSearchChange}
                    placeholder={searchPlaceholder}
                    namespace={namespace}
                    resultCount={resultCount}
                    totalCount={totalCount}
                    size="md"
                  />
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {toolbarActions}

                {allowViewSwitch && canShowGrid && canShowTable && (
                  <div
                    role="group"
                    aria-label="View mode"
                    style={{
                      display: 'inline-flex',
                      background: '#f1f5f9',
                      borderRadius: '10px',
                      padding: '3px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.38rem 0.65rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background:
                          effectiveView === 'grid' ? '#ffffff' : 'transparent',
                        color:
                          effectiveView === 'grid' ? '#0f172a' : '#64748b',
                        boxShadow:
                          effectiveView === 'grid'
                            ? '0 1px 2px rgba(0,0,0,0.08)'
                            : 'none',
                      }}
                    >
                      <LayoutGrid size={14} /> Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.38rem 0.65rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background:
                          effectiveView === 'table' ? '#ffffff' : 'transparent',
                        color:
                          effectiveView === 'table' ? '#0f172a' : '#64748b',
                        boxShadow:
                          effectiveView === 'table'
                            ? '0 1px 2px rgba(0,0,0,0.08)'
                            : 'none',
                      }}
                    >
                      <TableIcon size={14} /> Table
                    </button>
                  </div>
                )}
              </div>
            </div>

            {filterOptions.length > 0 && (
              <FilterRow filterOptions={filterOptions} />
            )}

            {activeFilters.length > 0 && (
              <ActiveFiltersBar
                filters={activeFilters}
                onClearAll={onClearAllFilters}
              />
            )}
          </section>
        )}

        {/* 5. Cuerpo de Ítems (Grid o DataTable) */}
        {children ? (
          children
        ) : effectiveView === 'table' && canShowTable ? (
          <DataTable
            data={items}
            columns={columns}
            loading={loading}
            onRowClick={onRowClick}
            expandableRender={expandableRender}
            emptyState={emptyState}
          />
        ) : items.length === 0 && !loading ? (
          <EmptyState
            icon={emptyState.icon || Package}
            title={emptyState.title || 'No items found'}
            subtitle={
              emptyState.subtitle ||
              'Try adjusting your search or active filters.'
            }
            action={emptyState.action}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {items.map((item, idx) => renderCard(item, idx))}
          </div>
        )}
      </main>

      {/* 6. Barra Sticky Inferior (Carrito / RFQ) */}
      {stickyFooterBar}

      {/* Footer Unificado */}
      <PublicUnifiedFooter whiteLabel={mode === 'whitelabel'} />
    </div>
  );
}
