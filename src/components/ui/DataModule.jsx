"use client";
import React, { useState, useEffect } from 'react';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from './GlobalSearchBar';
import FilterRow from './FilterRow';
import ActiveFiltersBar from './ActiveFiltersBar';
import GridSkeleton from './skeletons/GridSkeleton';
import DataTable from './DataTable';
import BulkActionsBar from './BulkActionsBar';
import ErrorBoundary from './ErrorBoundary';
import PageFooter from './PageFooter';
import { useRouter, usePathname } from 'next/navigation';
import { Download, SlidersHorizontal } from '@/lib/icons';
import MobileFiltersSheet, { MobileFilterTrigger } from './MobileFiltersSheet';
import UnifiedFiltersDrawer from './UnifiedFiltersDrawer';
import MobileSortSheet from './MobileSortSheet';
import MobilePageActions from './MobilePageActions';
import MobileGoalChipsBar from './MobileGoalChipsBar';
import { CheckSquare } from 'lucide-react';


export default function DataModule({
  title,
  subtitle,
  icon: Icon,
  hideHeader = false,
  isSubModule = false,
  actions, // ReactNode (if provided, overrides primaryAction)
  primaryAction, // { label, icon: ActionIcon, onClick }
  kpis, // ReactNode
  filtersBar, // Legacy explicit bar, if still needed
  searchPlaceholder = "Search...",
  searchTerm,
  onSearchChange,
  filters = [],          // active filter chips → Line 3
  filterOptions = [],    // filter dimension dropdowns → Line 2
  onClearAllFilters,     // clears all active filters at once
  resultCount,
  searchLoading,
  namespace = "search",
  data = [],
  loading = false,
  hasMore = undefined,   // undefined → DataTable uses local pagination logic; explicit true/false → server-side mode
  loadMore,
  isFetchingMore = false,
  isSearchActive = false,
  columns = [],
  selectedIds = [],
  onSelectionChange,
  onRowClick,
  expandableRender,      // Added expandableRender prop
  emptyState = {},
  bulkActions = [], // { label, icon, onClick, variant }
  mobileOverflowActions = [], // Added for MobilePageActions ••• menu
  breadcrumbs, // Array of breadcrumbs
  // Footer props
  lastUpdated,
  onRefresh,
  onExportCsv,
  enableExport = false, // Auto-generate export button
  onExportPdf,
  customFooterActions,
  mobileCardComponent,  // Custom card renderer for mobile list (e.g. MobileCatalogCard)
  mobileCardProps = {}, // Extra props forwarded to every mobile card instance
  sortOptions = [],     // [{ key, label, ascLabel?, descLabel?, directions? }] — for MobileSortSheet
  virtualize = false,   // When true, activates @tanstack/react-virtual for large lists
  children
}) {
  const router = useRouter();
  const [isMobileSelectionMode, setIsMobileSelectionMode] = useState(false);
  // Mobile filter sheet state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // Mobile sort sheet state
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [mobileSort, setMobileSort] = useState(null); // { key, direction } | null

  // Count of GROUPS with at least one active selection (for badge semantic:
  // '2' means '2 different filter groups are active', not '2 total values')
  const activeFilterCount = filterOptions.filter(fo =>
    Array.isArray(fo.values) ? fo.values.length > 0
    : fo.values && fo.values !== 'all' && fo.values !== ''
  ).length;

  // Phase 2: Hotkeys (Cmd+A, Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      
      // Escape: clear selection
      if (e.key === 'Escape') {
        if (selectedIds && selectedIds.length > 0 && onSelectionChange) {
          onSelectionChange([]);
        }
      }
      
      // Cmd/Ctrl + A: select all visible rows
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !isInput) {
        e.preventDefault();
        if (data && data.length > 0 && onSelectionChange) {
          onSelectionChange(data.map(d => d.id));
        }
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [data, selectedIds, onSelectionChange]);

  // Phase 3: Generic CSV Export
  const handleGenericExport = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }
    
    if (!data || !data.length || !columns || !columns.length) return;
    
    const exportCols = columns.filter(c => c.key && c.label);
    const headers = exportCols.map(c => c.label).join(',');
    const rows = data.map(row => {
      return exportCols.map(c => {
        let val = row[c.key];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'string') val = val.replace(/"/g, '""');
        return `"${val}"`;
      }).join(',');
    });
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${namespace || 'export'}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const finalActions = (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {enableExport && (
        <button className="btn btn-secondary" onClick={handleGenericExport} title="Export to CSV">
          <Download size={16} />
          <span>Export</span>
        </button>
      )}
      {actions ? actions : (
        primaryAction && (
          <button 
            className="gcp-btn-primary"
            onClick={primaryAction.onClick}
          >
            {primaryAction.icon && <primaryAction.icon size={16} />}
            <span>{primaryAction.label}</span>
          </button>
        )
      )}
    </div>
  );

  const augmentedMobileOverflow = [...(mobileOverflowActions || [])];

  const enhancedMobileCardProps = {
    ...mobileCardProps
  };

  return (
    <ErrorBoundary>
      <div className={`data-module-wrapper ${isSubModule ? 'is-sub-module' : ''}`}>
      {(!hideHeader && (title || subtitle || actions || primaryAction || enableExport || breadcrumbs)) && (
        <PageHeader
          title={title}
          subtitle={subtitle}
          icon={Icon}
          actions={finalActions}
          breadcrumbs={breadcrumbs}
        />
      )}
      
      {/* Mobile Page Actions (visible only on small screens via CSS) */}
      <MobilePageActions 
        primaryAction={primaryAction}
        overflowActions={augmentedMobileOverflow}
      />

      {/* KPI strip */}
      {kpis && (
        <div className="dm-kpi-strip">
          {kpis}
        </div>
      )}

      {onSearchChange && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Line 1 — Search input + result count */}
          <GlobalSearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            resultCount={resultCount}
            isLoading={searchLoading}
            namespace={namespace}
            size="lg"
          />

          {/* Line 2 — Filter dimension pills:
              Desktop: inline FilterRow (popovers)
              Mobile:  Filters button → BottomSheet (viewport-safe) */}
          {filterOptions.length > 0 && (
            <>
              {/* Desktop filter pills */}
              <div className="desktop-only">
                <FilterRow 
                  filterOptions={filterOptions} 
                  onClearAll={onClearAllFilters}
                  activeCount={activeFilterCount}
                />
              </div>
              {/* Mobile: Sort + Filters triggers side by side */}
              <div className="mobile-only" style={{ padding: '0 0 0.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <MobileGoalChipsBar
                  activeGoals={filterOptions.find(o => o.key === 'goals')?.values || []}
                  onToggleGoal={(goalId) => {
                    const goalOpt = filterOptions.find(o => o.key === 'goals');
                    if (goalOpt) {
                      const currentVals = Array.isArray(goalOpt.values) ? goalOpt.values : [];
                      const nextVals = currentVals.includes(goalId)
                        ? currentVals.filter(v => v !== goalId)
                        : [...currentVals, goalId];
                      goalOpt.onChange(nextVals);
                    }
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  {sortOptions.length > 0 && (
                    <button
                      className={`mfs-trigger-btn${mobileSort ? ' mfs-trigger-btn--active' : ''}`}
                      onClick={() => setShowMobileSort(true)}
                      style={{ flex: mobileSort ? '1 1 auto' : '0 0 auto' }}
                    >
                      <span style={{ fontSize: '0.8rem' }}>↕</span>
                      <span>Sort{mobileSort ? ` · ${sortOptions.find(o => o.key === mobileSort.key)?.label || ''}` : ''}</span>
                      {mobileSort && (
                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                          {mobileSort.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  )}
                  <MobileFilterTrigger
                    onClick={() => setShowMobileFilters(true)}
                    activeCount={activeFilterCount}
                  />
                </div>
              </div>
              <UnifiedFiltersDrawer
                isOpen={showMobileFilters}
                onClose={() => setShowMobileFilters(false)}
                filterOptions={filterOptions}
                onClearAll={onClearAllFilters}
                resultCount={resultCount}
                isMobile={true}
              />
                <MobileSortSheet
                  isOpen={showMobileSort}
                  onClose={() => setShowMobileSort(false)}
                  options={sortOptions}
                  currentSort={mobileSort}
                  onApply={(sort) => setMobileSort(sort)}
                />
            </>
          )}

          {/* Line 3 — Active filter chips (scrollable on mobile) */}
          {filters.length > 0 && (
            <div className="active-filters-bar">
              <ActiveFiltersBar
                filters={filters}
                onClearAll={onClearAllFilters}
              />
            </div>
          )}
        </div>
      )}

      <div className="data-module-container">
        
        {filtersBar}

        <div className="data-module-content">
          {columns && columns.length > 0 ? (
            <>
              <DataTable 
                data={data}
                columns={columns}
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
                enableExport={false}
                onRowClick={onRowClick} 
                expandableRender={expandableRender}
                hasNextPage={hasMore}
                onNextPage={loadMore}
                isLoading={loading}
                mobileCardComponent={mobileCardComponent}
                mobileCardProps={enhancedMobileCardProps}
                bulkActions={bulkActions}
                onRefresh={onRefresh}
                forceMobileSelectionMode={isMobileSelectionMode}
                onForceMobileSelectionModeChange={setIsMobileSelectionMode}
                virtualize={virtualize}
                emptyTitle={
                  (searchTerm || (filters && filters.length > 0)) && !emptyState.title
                    ? "No results for these filters"
                    : emptyState.title
                }
                emptyDescription={
                  (searchTerm || (filters && filters.length > 0)) && !emptyState.description
                    ? "Try changing your search terms or clearing current filters."
                    : emptyState.description
                }
                emptyActionLabel={
                  (searchTerm || (filters && filters.length > 0)) && !emptyState.actionLabel
                    ? "Clear Filters"
                    : emptyState.actionLabel
                }
                onEmptyAction={
                  (searchTerm || (filters && filters.length > 0)) && !emptyState.onAction
                    ? (onClearAllFilters || (() => { router.push(pathname); }))
                    : emptyState.onAction
                }
              />
              {children}
            </>
          ) : (
            children
          )}
        </div>
        
        {/* Page Footer (Sticky inside the table container) */}
        <PageFooter
          isSticky={true}
          selectedCount={selectedIds?.length || 0}
          lastUpdated={lastUpdated}
          onRefresh={onRefresh}
          onExportCsv={onExportCsv}
          onExportPdf={onExportPdf}
          customActions={customFooterActions}
        />
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClear={() => onSelectionChange([])}
        actions={bulkActions}
      />
    </div>
    </ErrorBoundary>
  );
}
