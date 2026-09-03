"use client";

import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, ArrowUp, ArrowDown, Search, X, Calendar, Zap } from '@/lib/icons';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { DataTableSearchEngine } from '@/utils/DataTableSearchEngine';
import { AlertTriangle } from 'lucide-react';

import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import MobileRecordCard from './MobileRecordCard';
import MobileContextualActionBar from './MobileContextualActionBar';
import MobileCardSkeleton from './MobileCardSkeleton';
import usePullToRefresh from '../../hooks/ui/usePullToRefresh';
import SwipeableCard from './SwipeableCard';
import DataTableContextualHeader from './DataTableContextualHeader';
import StickyBulkActionBar from './StickyBulkActionBar';
import { useRoleAccess } from '@/hooks/useRoleAccess';

export default function DataTable({
  columns,
  data = [],
  keyField = 'id',
  isLoading = false,
  error = null,
  // Selection
  selectedIds = [],
  indeterminateIds = [], // Array of IDs that should be shown as indeterminate
  onSelectionChange, // receives array of selected ids
  // Pagination
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  // GCP Style Pagination
  rowsPerPage,
  onRowsPerPageChange,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
  paginationText,
  // Batch Actions
  renderBatchActions,
  // Expansion
  expandableRender,
  // Custom Interaction
  onRowClick,
  renderHoverActions,
  // Empty State
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display.',
  emptyMessage, // for backwards compatibility
  emptyActionLabel,
  onEmptyAction,

  // Toolbar (Search, Filter, Date)
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchStrategy = 'local', // 'local', 'semantic', 'algolia'
  searchConfig = {}, // { keys: [], fuseOptions: {} }
  dateRange = { start: '', end: '' },
  onDateRangeChange,
  filters = [],
  onFilterRemove,
  renderCustomFilters,

  // Table Settings
  enableColumnSelection = false,
  enableExport = false,
  onExport,
  virtualize = false,
  visibleColumns, // array of keys
  onColumnToggle, // (columnKey, isVisible) => void
  tableId,
  getRowProps, // (row) => ({ style?: {}, className?: string })
  minHeight, // custom minHeight override
  pagination = true,
  hidePagination = false,

  // Ask Atlas Action
  enableAskAtlas = true,
  askAtlasTopic = 'record',
  // Mobile View
  mobileView = 'cards',  // 'cards' | 'scroll'
  mobileCardComponent = null, // Optional custom card component; falls back to MobileRecordCard
  mobileCardProps = {},       // Extra props forwarded to every mobile card instance
  bulkActions = [],           // [{label, icon?, onClick, variant?}] — reused for mobile bulk sheet
  onRefresh = null,           // async fn → triggers pull-to-refresh gesture
  swipeActions = null,        // fn(row) → { leftAction?, rightActions[] } | null
  forceMobileSelectionMode,   // boolean flag to force selection mode externally
  onForceMobileSelectionModeChange, // callback to update external state
}) {
  const { is, can } = useRoleAccess();
  // ── Mobile detection ──────────────────────────────────────────────────────
  // Always start as false (SSR safe — avoids hydration mismatch).
  // Immediately set to real value after mount via useEffect.
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  useEffect(() => {
    // Set immediately on mount (runs client-side only)
    setIsMobileViewport(window.innerWidth <= 768);
    const onResize = () => setIsMobileViewport(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  // Render card list when on mobile AND caller hasn't opted out via mobileView='scroll'
  const showMobileCards = isMobileViewport && mobileView !== 'scroll';

  const [expandedId, setExpandedId] = useState(null);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(-1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showColMenu, setShowColMenu] = useState(false);

  // Mobile selection mode (long-press to enter)
  const [internalMobileSelectionMode, setInternalMobileSelectionMode] = useState(false);
  const mobileSelectionMode = forceMobileSelectionMode !== undefined ? forceMobileSelectionMode : internalMobileSelectionMode;
  
  const setMobileSelectionMode = (value) => {
    if (onForceMobileSelectionModeChange) onForceMobileSelectionModeChange(value);
    setInternalMobileSelectionMode(value);
  };

  const [mobileSelectedIds, setMobileSelectedIds] = useState([]);

  const handleMobileLongPress = (row, rowKey) => {
    setMobileSelectionMode(true);
    setMobileSelectedIds([rowKey]);
    // Also notify parent if it cares about selection
    onSelectionChange?.([rowKey]);
  };

  const handleMobileToggleSelect = (rowKey) => {
    setMobileSelectedIds((prev) => {
      const next = prev.includes(rowKey)
        ? prev.filter(id => id !== rowKey)
        : [...prev, rowKey];
      
      // Schedule side-effects outside of the render phase
      setTimeout(() => {
        onSelectionChange?.(next);
        if (next.length === 0) {
          setMobileSelectionMode(false);
        } else if (next.length > 0 && !mobileSelectionMode) {
          setMobileSelectionMode(true);
        }
      }, 0);
      
      return next;
    });
  };

  const exitMobileSelection = () => {
    setMobileSelectionMode(false);
    setMobileSelectedIds([]);
    onSelectionChange?.([]);
  };

  // Sync external selectionIds into mobileSelectedIds if DataModule controls them
  useEffect(() => {
    if (forceMobileSelectionMode !== undefined && selectedIds) {
      setMobileSelectedIds(selectedIds);
      if (selectedIds.length === 0 && mobileSelectionMode) {
        setMobileSelectionMode(false);
      } else if (selectedIds.length > 0 && !mobileSelectionMode) {
        setMobileSelectionMode(true);
      }
    }
  }, [selectedIds, forceMobileSelectionMode, mobileSelectionMode]);


  const [touchTimer, setTouchTimer] = useState(null);
  const parentRef = useRef(null);
  const mobileContainerRef = useRef(null);

  // Pull-to-Refresh — only active on mobile
  const { isPulling, pullProgress, isRefreshing } = usePullToRefresh(
    mobileContainerRef,
    onRefresh,
    72
  );

  const [internalPage, setInternalPage] = useState(1);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(25);

  // Reset to page 1 whenever the data set changes (e.g. filter applied on server).
  // Without this, navigating from page 2 of 46 results to a 21-result filtered set
  // keeps internalPage=2 and slice(20,40) returns 0-1 rows → blank table.
  const prevDataLenRef = React.useRef(data?.length ?? 0);
  React.useEffect(() => {
    const newLen = data?.length ?? 0;
    if (newLen !== prevDataLenRef.current) {
      setInternalPage(1);
      prevDataLenRef.current = newLen;
    }
  }, [data]);
  
  // Search state
  const [filteredData, setFilteredData] = useState(data || []);
  const [isSearching, setIsSearching] = useState(false);

  // Run search when dependencies change
  React.useEffect(() => {
    let isMounted = true;
    
    if (!searchQuery || !searchQuery.trim()) {
      setFilteredData(data || []);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Use a short timeout to allow the browser to paint the Skeleton state
    const timer = setTimeout(() => {
      const result = DataTableSearchEngine.execute(
        data || [], 
        searchQuery, 
        columns, 
        searchStrategy, 
        searchConfig
      );
      
      if (result instanceof Promise) {
        result.then((res) => {
          if (isMounted) {
            setFilteredData(res);
            setIsSearching(false);
          }
        });
      } else {
        if (isMounted) {
          setFilteredData(result);
          setIsSearching(false);
        }
      }
    }, 50);

    return () => { 
      isMounted = false; 
      clearTimeout(timer);
    };
  }, [data, searchQuery, columns, searchStrategy, JSON.stringify(searchConfig)]);

  const activePage = onPageChange ? currentPage : internalPage;
  const activeRowsPerPage = onRowsPerPageChange ? rowsPerPage : internalRowsPerPage;

  const handlePageChange = (newPage) => {
    if (onPageChange) onPageChange(newPage);
    else setInternalPage(newPage);
  };

  const handleRowsPerPageChange = (newRows) => {
    if (onRowsPerPageChange) onRowsPerPageChange(newRows);
    else {
      setInternalRowsPerPage(newRows);
      setInternalPage(1); // reset to page 1
    }
  };


  // Use visibleColumns prop if provided, and apply automatic role masking (Rule #13)
  const activeColumns = useMemo(() => {
    if (!columns || !Array.isArray(columns)) return [];
    let cols = columns;
    if (visibleColumns && Array.isArray(visibleColumns)) {
      cols = cols.filter((c) => visibleColumns.includes(c.key || c.header || c.label));
    }
    // Automated Role Masking Engine
    return cols.filter((c) => {
      if (c.requiredPermission && !can(c.requiredPermission)) return false;
      if (c.minRole === 'admin' && !is('admin')) return false;
      if (c.hiddenRoles && Array.isArray(c.hiddenRoles)) {
        if (c.hiddenRoles.some(r => is(r)) && !is('admin')) return false;
      }
      return true;
    });
  }, [columns, visibleColumns, is, can]);

  const sortedData = useMemo(() => {
    const safeData = filteredData || [];
    if (!sortConfig.key) return safeData;
    let sortableItems = [...safeData];
    sortableItems.sort((a, b) => {
      const col = columns.find((c) => c.key === sortConfig.key);
      let aVal = col && col.sortValue ? col.sortValue(a) : a[sortConfig.key];
      let bVal = col && col.sortValue ? col.sortValue(b) : b[sortConfig.key];

      const getComparable = (val) => {
        if (val === null || val === undefined) return '';
        if (val.toMillis && typeof val.toMillis === 'function') return val.toMillis();
        if (val.seconds !== undefined && val.nanoseconds !== undefined) return val.seconds;
        if (val instanceof Date) return val.getTime();
        if (typeof val === 'string') {
          if (/^\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/.test(val)) {
            const parsed = Date.parse(val);
            if (!isNaN(parsed)) return parsed;
          }
          return val.toLowerCase();
        }
        return val;
      };

      aVal = getComparable(aVal);
      bVal = getComparable(bVal);

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [filteredData, sortConfig, columns]);

  const paginatedData = useMemo(() => {
    return !onPageChange
      ? sortedData.slice((internalPage - 1) * internalRowsPerPage, internalPage * internalRowsPerPage)
      : sortedData;
  }, [sortedData, onPageChange, internalPage, internalRowsPerPage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (!paginatedData || paginatedData.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedRowIndex(prev => Math.min(prev + 1, paginatedData.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedRowIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusedRowIndex >= 0) {
        e.preventDefault();
        const row = paginatedData[focusedRowIndex];
        if (onRowClick) {
          onRowClick(row);
        } else if (expandableRender) {
          const rowKey = row[keyField] || focusedRowIndex;
          setExpandedId(expandedId === rowKey ? null : rowKey);
        }
      } else if (e.key === 'Escape') {
        setFocusedRowIndex(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginatedData, focusedRowIndex, onRowClick, expandableRender, expandedId, keyField]);

  const rowVirtualizer = useVirtualizer({
    count: paginatedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // Default row height in CSS
    overscan: 5,
  });

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(data.map((item) => item[keyField]));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    }
  };

  const handleTouchStart = (id) => {
    if (!onSelectionChange) return;
    const timer = setTimeout(() => {
      // Long press triggers selection
      const isSelected = selectedIds.includes(id) || indeterminateIds.includes(id);
      handleSelectRow(id, !isSelected);
    }, 500); // 500ms long press
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const allSelected = sortedData.length > 0 && selectedIds.length === sortedData.length;
  const someSelected =
    (selectedIds.length > 0 && selectedIds.length < sortedData.length) ||
    indeterminateIds.length > 0;

  /* ── MOBILE CARD LIST ─────────────────────────────────────────────────────
     Renders when viewport ≤ 768px and mobileView !== 'scroll'.
     Replaces the desktop table entirely — same data, different presentation.
  ─────────────────────────────────────────────────────────────────────────── */
  if (showMobileCards) {
    const totalInternalPages = Math.ceil(filteredData.length / internalRowsPerPage);

    // Pull-to-refresh arc progress (0–56.5 = full circle circumference for r=9)
    const circumference = 56.5;
    const dashOffset = circumference - pullProgress * circumference;

    return (
      <div
        ref={mobileContainerRef}
        className="ptr-container"
        style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto', minHeight: 0, flex: 1 }}
      >
        {/* Pull-to-refresh indicator */}
        {(isPulling || isRefreshing) && (
          <div className={`ptr-indicator ptr-indicator--visible${isRefreshing ? ' ptr-indicator--refreshing' : ''}`}>
            {isRefreshing ? (
              <div className="ptr-spinner ptr-spinner--spin" />
            ) : (
              <div className="ptr-arc">
                <svg viewBox="0 0 20 20" width="20" height="20">
                  <circle className="ptr-arc-track" cx="10" cy="10" r="9" />
                  <circle
                    className="ptr-arc-fill"
                    cx="10" cy="10" r="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {(isLoading || isSearching) && (
          <MobileCardSkeleton
            count={5}
            variant={mobileCardComponent && mobileCardComponent.displayName === 'MobileProtocolCard' ? 'protocol' : 'default'}
          />
        )}


        {/* Empty state */}
        {!isLoading && !isSearching && paginatedData.length === 0 && (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription || emptyMessage}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        )}

        {/* Mobile Contextual Selection Header */}
        {mobileSelectionMode && (
          <div className="mobile-contextual-selection-header" style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'var(--color-surface, #ffffff)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            marginBottom: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                onClick={exitMobileSelection}
                aria-label="Cancel selection"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text)'
                }}
              >
                <X size={20} />
              </button>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {mobileSelectedIds.length} selected
              </span>
            </div>
            <button
              onClick={() => {
                const visibleIds = filteredData.map(r => r[keyField]);
                onSelectionChange?.(visibleIds);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary, #003666)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Select all
            </button>
          </div>
        )}

        {/* Card list */}
        {!isLoading && !isSearching && paginatedData.length > 0 && (
          <div className="data-table-mobile-cards">
            {paginatedData.map((row, idx) => {
              const rowKey = row[keyField] ?? idx;
              const cardReactKey = `${rowKey}_${idx}`;
              const CardComponent = mobileCardComponent || MobileRecordCard;
              const isMobileSelected = mobileSelectedIds.includes(rowKey);
              const cardEl = (
                <CardComponent
                  key={cardReactKey}
                  row={row}
                  columns={activeColumns}
                  onRowClick={onRowClick}
                  expandableRender={expandableRender}
                  isSelected={isMobileSelected}
                  onSelectionChange={onSelectionChange}
                  selectionMode={mobileSelectionMode}
                  onToggleSelect={() => handleMobileToggleSelect(rowKey)}
                  onLongPress={() => handleMobileLongPress(row, rowKey)}
                  {...mobileCardProps}
                />
              );
              if (swipeActions && !mobileSelectionMode) {
                const actions = swipeActions(row) || {};
                return (
                  <SwipeableCard
                    key={cardReactKey}
                    leftAction={actions.leftAction}
                    rightActions={actions.rightActions || []}
                  >
                    {cardEl}
                  </SwipeableCard>
                );
              }
              return React.cloneElement(cardEl, { key: cardReactKey });
            })}
          </div>
        )}

        {/* Mobile selection bar — Portal-rendered floating bottom bar */}
        <MobileContextualActionBar
          count={mobileSelectedIds.length}
          bulkActions={bulkActions.map(a => ({
            ...a,
            onClick: () => {
              // Pass selected rows to bulk action
              const selectedRows = paginatedData.filter(r =>
                mobileSelectedIds.includes(r[keyField] ?? paginatedData.indexOf(r))
              );
              a.onClick?.(selectedRows);
              exitMobileSelection();
            },
          }))}
        />

        {/* Pagination — simplified for mobile */}
        {!onPageChange && filteredData.length > internalRowsPerPage && (
          <div className="ui-pagination-footer" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--color-border)',
            gap: '0.5rem',
          }}>
            <button
              onClick={() => setInternalPage(p => Math.max(1, p - 1))}
              disabled={internalPage <= 1}
              style={{ minWidth: 44, minHeight: 44, border: '1px solid var(--color-border)', borderRadius: '8px', background: 'transparent', cursor: internalPage <= 1 ? 'not-allowed' : 'pointer', opacity: internalPage <= 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              {internalPage} / {totalInternalPages}
              <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>({filteredData.length} total)</span>
            </span>
            <button
              onClick={() => setInternalPage(p => Math.min(totalInternalPages, p + 1))}
              disabled={internalPage >= totalInternalPages}
              style={{ minWidth: 44, minHeight: 44, border: '1px solid var(--color-border)', borderRadius: '8px', background: 'transparent', cursor: internalPage >= totalInternalPages ? 'not-allowed' : 'pointer', opacity: internalPage >= totalInternalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'transparent',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TOOLBAR */}
      {(onSearchChange ||
        onDateRangeChange ||
        renderCustomFilters ||
        (filters && filters.length > 0) ||
        enableColumnSelection ||
        enableExport) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'var(--color-bg-surface)',
            borderBottom: '1px solid var(--color-border)',
            borderTopLeftRadius: 'var(--radius-md)',
            borderTopRightRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {onSearchChange && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'var(--color-bg-app)',
                  flex: '1 1 200px',
                  maxWidth: '350px',
                }}
              >
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    width: '100%',
                  }}
                />
              </div>
            )}
            {onDateRangeChange && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--text-muted)" />
                <input
                  type="date"
                  value={dateRange.start || ''}
                  onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    outline: 'none',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--color-bg-app)',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to</span>
                <input
                  type="date"
                  value={dateRange.end || ''}
                  onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    outline: 'none',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--color-bg-app)',
                  }}
                />
              </div>
            )}

            {renderCustomFilters && (
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
              >
                {renderCustomFilters()}
              </div>
            )}

            <div style={{ flex: 1 }} />

            {(enableColumnSelection || enableExport) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                }}
              >
                {enableExport && (
                  <button
                    onClick={onExport}
                    style={{
                      padding: '0.35rem 0.75rem',
                      backgroundColor: 'var(--color-bg-subtle)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Export CSV
                  </button>
                )}
                {enableColumnSelection && (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowColMenu(!showColMenu)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: 'var(--color-bg-subtle)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      Columns <ChevronDown size={14} />
                    </button>
                    {showColMenu && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: '4px',
                          backgroundColor: 'var(--color-bg-app)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.5rem',
                          minWidth: '150px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          zIndex: 50,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}
                      >
                        {columns.map((c, i) => {
                          const colKey = c.key || c.header || c.label;
                          const isVisible = visibleColumns ? visibleColumns.includes(colKey) : true;
                          return (
                            <label
                              key={`col-sel-${i}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isVisible}
                                onChange={(e) =>
                                  onColumnToggle && onColumnToggle(colKey, e.target.checked)
                                }
                              />
                              {c.header || c.label || colKey}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter Chips */}
          {filters && filters.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Active filters:
              </span>
              {filters.map((filter, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '1rem',
                    backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                    color: 'var(--color-primary)',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  {filter.label}: {filter.value}
                  {onFilterRemove && (
                    <button
                      onClick={() => onFilterRemove(filter)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'inherit',
                        opacity: 0.7,
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Desktop Contextual Selection Header */}
      {(someSelected || allSelected) && (bulkActions.length > 0 || renderBatchActions) && (
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 15,
          backgroundColor: '#f0fdf4',
          borderBottom: '2px solid #0f766e',
          padding: '0.25rem 0.75rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <DataTableContextualHeader
            selectedCount={selectedIds.length}
            bulkActions={bulkActions}
            renderBatchActions={renderBatchActions}
            selectedIds={selectedIds}
            onClearSelection={() => onSelectionChange?.([])}
          />
        </div>
      )}

      <div
        ref={virtualize ? parentRef : null}
        className={`gcp-table-container ui-table-container content-visibility-auto${!virtualize && mobileView === 'stack' ? ' rsp-table-wrap responsive-stack' : ''}`}
        style={{
          overflowX: 'auto',
          overflowY: 'auto',
          width: '100%',
          minHeight: minHeight !== undefined ? minHeight : (isLoading ? '350px' : (!data || data.length <= 8 ? 'auto' : '350px')),
          maxHeight: virtualize ? 'calc(100vh - 220px)' : 'calc(100vh - 200px)',
          backgroundColor: 'var(--color-bg-app)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <table
          className="gcp-table ui-table"
          style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left' }}
        >
          <thead
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderBottom: '2px solid var(--color-border)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <tr
              style={{
                backgroundColor:
                  someSelected || allSelected
                    ? 'rgba(15, 118, 110, 0.05)'
                    : 'transparent',
              }}
            >
              {onSelectionChange && (
                <th
                  style={{
                    width: '48px',
                    minWidth: '48px',
                    whiteSpace: 'nowrap',
                    padding: '0',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    backgroundColor: 'var(--color-bg-subtle)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
              )}

              {expandableRender && (
                <th
                  style={{
                    width: '48px',
                    minWidth: '48px',
                    whiteSpace: 'nowrap',
                    padding: '0',
                    borderBottom: '1px solid var(--color-border)',
                    textAlign: 'center',
                  }}
                ></th>
              )}

              {activeColumns.map((col, idx) => {
                const isSortable = col.key && col.sortable !== false;
                const effectiveAlign = idx === 0 ? 'left' : idx === activeColumns.length - 1 ? 'right' : 'center';
                return (
                  <th
                    key={col.key || idx}
                    className={col.hideOnMobile ? 'hide-on-mobile' : ''}
                    onClick={() => isSortable && requestSort(col.key)}
                    style={{
                      height: '36px',
                      padding: '0 16px',
                      fontSize: 'clamp(0.6rem, 0.8vw, 0.75rem)',
                      fontWeight: 600,
                      color:
                        sortConfig.key === col.key
                          ? 'var(--color-primary)'
                          : 'var(--text-muted)',
                      textAlign: effectiveAlign,
                      width: col.width || 'auto',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: isSortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      wordBreak: 'normal',
                      lineHeight: '1.2',
                      position:
                        col.key === 'name' ||
                        col.header === 'Product Name' ||
                        col.label === 'Product Name'
                          ? 'sticky'
                          : 'static',
                      left:
                        col.key === 'name' ||
                        col.header === 'Product Name' ||
                        col.label === 'Product Name'
                          ? onSelectionChange
                            ? '48px'
                            : '0'
                          : 'auto',
                      backgroundColor: 'var(--color-bg-subtle)',
                      zIndex:
                        col.key === 'name' ||
                        col.header === 'Product Name' ||
                        col.label === 'Product Name'
                          ? 2
                          : 0,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          effectiveAlign === 'right'
                            ? 'flex-end'
                            : effectiveAlign === 'center'
                              ? 'center'
                              : 'flex-start',
                        gap: '4px',
                      }}
                    >
                      {col.header || col.label}
                      {isSortable && sortConfig.key === col.key && (
                        <span style={{ display: 'flex', color: 'var(--color-primary)' }}>
                          {sortConfig.direction === 'asc' ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody
            style={
              virtualize
                ? { height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }
                : {}
            }
          >
            {isLoading || isSearching ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr
                  key={`skeleton-${rowIndex}`}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    minHeight: 'var(--row-min-height)',
                  }}
                >
                  {onSelectionChange && (
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <Skeleton width="16px" height="16px" borderRadius="4px" />
                    </td>
                  )}
                  {expandableRender && (
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <Skeleton width="16px" height="16px" borderRadius="50%" />
                    </td>
                  )}
                  {columns.map((col, colIndex) => (
                    <td key={`skel-col-${colIndex}`} style={{ padding: '12px 16px' }}>
                      <Skeleton width={colIndex === 0 ? '80%' : '60%'} height="16px" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length + (onSelectionChange ? 1 : 0) + (expandableRender ? 1 : 0)}>
                    <EmptyState
                      icon={AlertTriangle}
                      title="Data Error"
                      subtitle={`System error: ${error}. Please try clearing filters.`}
                      action={{
                        label: 'Clear Filters',
                        onClick: () => {
                          if (onSearchChange) onSearchChange('');
                        }
                      }}
                    />
                </td>
              </tr>
            ) : !filteredData || filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (onSelectionChange ? 1 : 0) + (expandableRender ? 1 : 0)
                  }
                >
                    <EmptyState
                      icon={Inbox}
                      title={emptyMessage || emptyTitle}
                      subtitle={!emptyMessage ? emptyDescription : undefined}
                      action={emptyActionLabel && onEmptyAction ? {
                        label: emptyActionLabel,
                        onClick: onEmptyAction
                      } : undefined}
                    />
                </td>
              </tr>
            ) : (
              ((virtualize && rowVirtualizer.getVirtualItems().length > 0) ? rowVirtualizer.getVirtualItems() : paginatedData).map(
                (virtualRowOrRow, index) => {
                  const isVirtual = virtualize && rowVirtualizer.getVirtualItems().length > 0;
                  const row = isVirtual ? paginatedData[virtualRowOrRow.index] : virtualRowOrRow;
                  const rowKey =
                    row && row[keyField] !== undefined && row[keyField] !== null
                      ? row[keyField]
                      : `fallback-key-${isVirtual ? virtualRowOrRow.index : index}`;
                  const rowReactKey = `${rowKey}_${isVirtual ? virtualRowOrRow.index : index}`;
                  const isExpanded = expandedId === rowKey;
                  const isSelected = selectedIds.includes(rowKey);
                  const isIndeterminate = indeterminateIds.includes(rowKey);
                  const isActive = isSelected || isIndeterminate;
                  const isFocused = isVirtual ? virtualRowOrRow.index === focusedRowIndex : index === focusedRowIndex;


                  const customProps = getRowProps ? getRowProps(row) : {};

                  return (
                    <React.Fragment key={rowReactKey}>
                      <tr
                        ref={virtualize ? rowVirtualizer.measureElement : null}
                        data-index={virtualize ? virtualRowOrRow.index : index}
                        className={customProps.className || ''}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          borderLeft: isFocused 
                            ? '4px solid #0284c7' 
                            : isActive 
                              ? '4px solid #3b82f6' 
                              : '4px solid transparent',
                          backgroundColor: isFocused
                            ? 'rgba(2, 132, 199, 0.05)'
                            : isActive
                              ? 'var(--color-bg-selected)'
                              : isExpanded
                                ? 'var(--color-bg-hover)'
                                : 'transparent',
                          transition: 'background-color 0.15s ease',
                          cursor: expandableRender || onRowClick ? 'pointer' : 'default',
                          ...(virtualize ? {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            transform: `translateY(${virtualRowOrRow.start}px)`
                          } : {}),
                          ...customProps.style,
                        }}
                        onClick={() => {
                          const toggleExpand = () => setExpandedId(isExpanded ? null : rowKey);
                          if (onRowClick) {
                            onRowClick(row, toggleExpand);
                          } else if (expandableRender) {
                            toggleExpand();
                          }
                        }}
                        onMouseEnter={(e) => {
                          setHoveredRowId(rowKey);
                          if (!isActive && !isExpanded)
                            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                        }}
                        onMouseLeave={(e) => {
                          setHoveredRowId(null);
                          if (!isActive && !isExpanded)
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onTouchStart={() => handleTouchStart(rowKey)}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                      >
                        {onSelectionChange && (
                          <td
                            style={{
                              padding: '0',
                              width: '48px',
                              minWidth: '48px',
                              whiteSpace: 'nowrap',
                              verticalAlign: 'middle',
                              textAlign: 'center',
                              position: 'sticky',
                              left: 0,
                              backgroundColor: 'inherit',
                              zIndex: 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected || isIndeterminate}
                              ref={(input) => {
                                if (input) input.indeterminate = isIndeterminate;
                              }}
                              onChange={(e) => handleSelectRow(rowKey, e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                        )}
                        {expandableRender && (
                          <td
                            style={{
                              padding: '0',
                              width: '48px',
                              minWidth: '48px',
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              verticalAlign: 'middle',
                              textAlign: 'center',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId(isExpanded ? null : rowKey);
                            }}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </td>
                        )}
                        {activeColumns.map((col, idx) => {
                          const effectiveAlign = idx === 0 ? 'left' : idx === activeColumns.length - 1 ? 'right' : 'center';
                          let cellValue = col.render ? col.render(row) : row[col.key];
                          const isProductColumn =
                            col.key === 'name' ||
                            col.header === 'Product Name' ||
                            col.label === 'Product Name';
                          const isActionColumn = col.key === 'actions' || col.isAction;
                          const cellStyle = {
                            padding: isActionColumn ? '12px 12px 12px 6px' : '12px 16px',
                            fontSize: '13px',
                            color: 'var(--text-main)',
                            textAlign: effectiveAlign,
                            verticalAlign: 'middle',
                            position: isProductColumn ? 'sticky' : 'static',
                            left: isProductColumn ? (onSelectionChange ? '48px' : '0') : 'auto',
                            backgroundColor: 'inherit',
                            zIndex: isProductColumn ? 1 : 0,
                          };

                          return (
                            <td
                              key={col.key || idx}
                              className={col.hideOnMobile ? 'hide-on-mobile' : ''}
                              data-label={typeof (col.header || col.label) === 'string' ? (col.header || col.label) : col.key}
                              style={{ 
                                ...cellStyle, 
                                overflow: isActionColumn ? 'visible' : 'hidden', 
                                textOverflow: isActionColumn ? 'clip' : 'ellipsis', 
                                whiteSpace: col.nowrap || isActionColumn ? 'nowrap' : 'normal', 
                                wordBreak: isActionColumn ? 'normal' : 'break-word', 
                                maxWidth: col.width || 'none' 
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: effectiveAlign === 'right' ? 'flex-end' : effectiveAlign === 'center' ? 'center' : 'flex-start',
                                  minWidth: 0,
                                }}
                              >
                                <div style={{ 
                                  flex: isActionColumn ? 'none' : 1, 
                                  overflow: isActionColumn ? 'visible' : 'hidden', 
                                  textOverflow: isActionColumn ? 'clip' : 'ellipsis', 
                                  whiteSpace: col.nowrap || isActionColumn ? 'nowrap' : 'normal', 
                                  wordBreak: isActionColumn ? 'normal' : 'break-word', 
                                  minWidth: 0, 
                                  textAlign: effectiveAlign 
                                }}>{cellValue}</div>
                                {idx === activeColumns.length - 1 &&
                                  renderHoverActions &&
                                  hoveredRowId === rowKey && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        right: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background:
                                          'linear-gradient(90deg, transparent, inherit 20%)',
                                        paddingLeft: '24px',
                                      }}
                                    >
                                      {enableAskAtlas && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.dispatchEvent(
                                              new CustomEvent('ATLAS_PREFILL_QUERY', {
                                                detail: {
                                                  query: `Analyze ${askAtlasTopic}: ${row[keyField] || row.id}`,
                                                  record: row
                                                }
                                              })
                                            );
                                          }}
                                          title={`Ask Atlas to analyze this ${askAtlasTopic}`}
                                          style={{
                                            background: '#0f172a',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: '#fff',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.1s'
                                          }}
                                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                          <Zap size={14} />
                                        </button>
                                      )}
                                      {renderHoverActions && renderHoverActions(row)}
                                    </div>
                                  )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      {isExpanded && expandableRender && !virtualize && (
                        <tr style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                          <td
                            colSpan={columns.length + (onSelectionChange ? 1 : 0) + 1}
                            style={{
                              padding: '24px',
                              borderBottom: '1px solid var(--color-border)',
                            }}
                          >
                            {expandableRender(row)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                }
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Google Cloud Style) */}
      {!hidePagination && pagination !== false && (onPageChange || sortedData.length > (activeRowsPerPage || 25) || (totalItems > 0 && totalItems > (activeRowsPerPage || 25))) && (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '8px 24px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-app)',
          gap: '24px',
          minHeight: '48px',
        }}
      >
        {/* Rows per page selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rows per page:</span>
          <select
            value={activeRowsPerPage}
            onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {[25, 50, 100].map((val) => (
              <option key={`rpp-${val}`} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>

        {/* Item count (e.g. 1-20 of 152) */}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {paginationText || (() => {
            const total = onPageChange ? totalItems : sortedData.length;
            if (total === 0) return '0-0 of 0';
            const start = (activePage - 1) * activeRowsPerPage + 1;
            const end = Math.min(activePage * activeRowsPerPage, total);
            return `${start}-${end} of ${total}`;
          })()}
        </span>

        {/* Pagination controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => (onPrevPage ? onPrevPage() : handlePageChange(activePage - 1))}
            disabled={hasPrevPage !== undefined ? !hasPrevPage : activePage <= 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: (hasPrevPage !== undefined ? !hasPrevPage : activePage <= 1)
                ? 'var(--color-border)'
                : 'var(--color-text-primary)',
              cursor: (hasPrevPage !== undefined ? !hasPrevPage : activePage <= 1)
                ? 'not-allowed'
                : 'pointer',
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => {
              if (onPageChange) {
                if (onNextPage) onNextPage();
                else handlePageChange(activePage + 1);
              } else {
                const isLastLocalPage = activePage >= Math.ceil(sortedData.length / activeRowsPerPage);
                if (isLastLocalPage && onNextPage) {
                  onNextPage();
                  handlePageChange(activePage + 1);
                } else {
                  handlePageChange(activePage + 1);
                }
              }
            }}
            disabled={
              hasNextPage !== undefined
                ? !hasNextPage
                : onPageChange
                  ? (totalPages ? activePage >= totalPages : true)
                  : activePage >= Math.ceil(sortedData.length / activeRowsPerPage)
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: (
                hasNextPage !== undefined
                  ? !hasNextPage
                  : onPageChange
                    ? (totalPages ? activePage >= totalPages : true)
                    : activePage >= Math.ceil(sortedData.length / activeRowsPerPage)
              )
                ? 'var(--color-border)'
                : 'var(--color-text-primary)',
              cursor: (
                hasNextPage !== undefined
                  ? !hasNextPage
                  : onPageChange
                    ? (totalPages ? activePage >= totalPages : true)
                    : activePage >= Math.ceil(sortedData.length / activeRowsPerPage)
              )
                ? 'not-allowed'
                : 'pointer',
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      )}
      {/* Mobile Contextual Action Bar — reserved for mobile touch layout */}
      
      {/* Desktop Sticky Floating Bulk Action Bar */}
      {(someSelected || allSelected) && (bulkActions.length > 0 || renderBatchActions) && (
        <StickyBulkActionBar
          selectedCount={selectedIds.length}
          bulkActions={bulkActions}
          renderBatchActions={renderBatchActions}
          selectedIds={selectedIds}
          onClearSelection={() => onSelectionChange?.([])}
        />
      )}
    </div>
  );
}
