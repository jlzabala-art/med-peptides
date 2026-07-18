import React from 'react';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from './GlobalSearchBar';
import GridSkeleton from './skeletons/GridSkeleton';
import DataTable from './DataTable';
import BulkActionsBar from './BulkActionsBar';
import ErrorBoundary from './ErrorBoundary';

export default function DataModule({
  title,
  subtitle,
  icon: Icon,
  hideHeader = false,
  primaryAction, // { label, icon: ActionIcon, onClick }
  kpis, // ReactNode
  filtersBar, // Legacy explicit bar, if still needed
  searchPlaceholder = "Search...",
  searchTerm,
  onSearchChange,
  filters = [],          // array for GlobalSearchBar chips
  filterOptions = [],    // array for GlobalSearchBar dropdowns
  resultCount,
  searchLoading,
  namespace = "search",
  data = [],
  loading = false,
  hasMore = false,
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
  children
}) {
  return (
    <ErrorBoundary>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', backgroundColor: 'var(--bg-app, #f1f5f9)' }}>
      {!hideHeader && (
        <PageHeader
          title={title}
          subtitle={subtitle}
          icon={Icon}
          actions={
            primaryAction && (
              <button 
                className="gcp-btn-primary"
                onClick={primaryAction.onClick}
              >
                {primaryAction.icon && <primaryAction.icon size={16} style={{ marginRight: '0.5rem' }} />}
                {primaryAction.label}
              </button>
            )
          }
        />
      )}

      {kpis}

      {onSearchChange && (
        <GlobalSearchBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          resultCount={resultCount}
          isLoading={searchLoading}
          namespace={namespace}
          size="lg"
          filters={filters}
          filterOptions={filterOptions}
        />
      )}

      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {filtersBar}

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {loading && !isFetchingMore ? (
            <GridSkeleton count={6} cols={3} />
          ) : (
            <>
              <DataTable 
                data={data}
                columns={columns}
                selectedIds={selectedIds}
                onSelectionChange={onSelectionChange}
                enableExport={false}
                onRowClick={onRowClick} 
                expandableRender={expandableRender}
                emptyTitle={emptyState.title}
                emptyDescription={emptyState.description}
                emptyActionLabel={emptyState.actionLabel}
                onEmptyAction={emptyState.onAction}
              />
              {hasMore && !isSearchActive && (
                 <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <button 
                      className="gcp-btn-secondary" 
                      onClick={loadMore} 
                      disabled={isFetchingMore}
                    >
                      {isFetchingMore ? 'Loading more...' : 'Load More'}
                    </button>
                 </div>
              )}
            </>
          )}
        </div>
      </div>

      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClear={() => onSelectionChange([])}
        actions={bulkActions}
      />

      {children}
    </div>
    </ErrorBoundary>
  );
}
