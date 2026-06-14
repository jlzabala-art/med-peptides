import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Inbox from "lucide-react/dist/esm/icons/inbox";
import ArrowUp from "lucide-react/dist/esm/icons/arrow-up";
import ArrowDown from "lucide-react/dist/esm/icons/arrow-down";
import Search from "lucide-react/dist/esm/icons/search";
import X from "lucide-react/dist/esm/icons/x";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import React, { useState, useMemo } from 'react';











import Skeleton from './Skeleton';

export default function DataTable({ 
  columns, 
  data = [], 
  keyField = 'id',
  isLoading = false,
  // Selection
  selectedIds = [],
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
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display.",
  emptyMessage, // for backwards compatibility
  emptyActionLabel,
  onEmptyAction,

  // Toolbar (Search, Filter, Date)
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  dateRange = { start: '', end: '' },
  onDateRangeChange,
  filters = [],
  onFilterRemove,
  renderCustomFilters,

  // Table Settings
  enableColumnSelection = false,
  enableExport = false,
  onExport,
  visibleColumns, // array of keys
  onColumnToggle, // (columnKey, isVisible) => void
  tableId
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showColMenu, setShowColMenu] = useState(false);

  // Use visibleColumns prop if provided, otherwise assume all visible
  const activeColumns = useMemo(() => {
    if (!visibleColumns) return columns;
    return columns.filter(c => visibleColumns.includes(c.key || c.header));
  }, [columns, visibleColumns]);

  const sortedData = useMemo(() => {
    const safeData = data || [];
    if (!sortConfig.key) return safeData;
    let sortableItems = [...safeData];
    sortableItems.sort((a, b) => {
      const col = columns.find(c => c.key === sortConfig.key);
      let aVal = col && col.sortValue ? col.sortValue(a) : a[sortConfig.key];
      let bVal = col && col.sortValue ? col.sortValue(b) : b[sortConfig.key];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [data, sortConfig, columns]);

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
      onSelectionChange(data.map(item => item[keyField]));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    }
  };



  const allSelected = sortedData.length > 0 && selectedIds.length === sortedData.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < sortedData.length;

  return (
    <div style={{ 
      backgroundColor: 'transparent',
      overflow: 'visible',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* TOOLBAR */}
      {(onSearchChange || onDateRangeChange || renderCustomFilters || (filters && filters.length > 0) || enableColumnSelection || enableExport) && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: '1rem',
          backgroundColor: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border)',
          borderTopLeftRadius: 'var(--radius-md)',
          borderTopRightRadius: 'var(--radius-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {onSearchChange && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.35rem 0.75rem',
                backgroundColor: 'var(--color-bg-app)',
                flex: '1 1 200px',
                maxWidth: '350px'
              }}>
                <Search size={16} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    fontSize: '0.8rem', color: 'var(--text-main)', width: '100%'
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
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                    padding: '0.25rem 0.5rem', fontSize: '0.75rem', outline: 'none',
                    color: 'var(--text-main)', backgroundColor: 'var(--color-bg-app)'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to</span>
                <input
                  type="date"
                  value={dateRange.end || ''}
                  onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                  style={{
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                    padding: '0.25rem 0.5rem', fontSize: '0.75rem', outline: 'none',
                    color: 'var(--text-main)', backgroundColor: 'var(--color-bg-app)'
                  }}
                />
              </div>
            )}

            {renderCustomFilters && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {renderCustomFilters()}
              </div>
            )}

            <div style={{ flex: 1 }} />

            {(enableColumnSelection || enableExport) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
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
                      cursor: 'pointer' 
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
                        gap: '0.25rem'
                      }}
                    >
                      Columns <ChevronDown size={14}/>
                    </button>
                    {showColMenu && (
                      <div style={{ 
                        position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                        backgroundColor: 'var(--color-bg-app)', border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)', padding: '0.5rem', minWidth: '150px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50,
                        display: 'flex', flexDirection: 'column', gap: '0.25rem'
                      }}>
                        {columns.map((c, i) => {
                          const colKey = c.key || c.header;
                          const isVisible = visibleColumns ? visibleColumns.includes(colKey) : true;
                          return (
                            <label key={`col-sel-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={isVisible} 
                                onChange={(e) => onColumnToggle && onColumnToggle(colKey, e.target.checked)} 
                              />
                              {c.header || colKey}
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
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active filters:</span>
              {filters.map((filter, index) => (
                <div key={index} style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.2rem 0.5rem', borderRadius: '1rem',
                  backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)',
                  color: 'var(--color-primary)',
                  fontSize: '0.7rem', fontWeight: 600
                }}>
                  {filter.label}: {filter.value}
                  {onFilterRemove && (
                    <button
                      onClick={() => onFilterRemove(filter)}
                      style={{
                        background: 'none', border: 'none', padding: 0,
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        color: 'inherit', opacity: 0.7
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
      <div className="ui-table-container responsive-stack" style={{ overflowX: 'auto', overflowY: 'auto', width: '100%', minHeight: '350px', maxHeight: 'calc(100vh - 200px)' }}>
        <table className="ui-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ 
            backgroundColor: 'var(--color-bg-app)', 
            borderBottom: '1px solid var(--color-border)',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <tr style={{ backgroundColor: someSelected || allSelected ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent' }}>
              {onSelectionChange && (
                <th style={{ width: '48px', minWidth: '48px', whiteSpace: 'nowrap', padding: '0', borderBottom: '1px solid var(--color-border)', textAlign: 'center', verticalAlign: 'middle' }}>
                  <input 
                    type="checkbox" 
                    checked={allSelected} 
                    ref={input => { if (input) input.indeterminate = someSelected; }}
                    onChange={handleSelectAll} 
                    style={{ cursor: 'pointer' }}
                  />
                </th>
              )}
              {/* We no longer render batch actions in the table header. It's a floating bar now. */}
              {!(someSelected || allSelected) || !renderBatchActions ? (
                <React.Fragment>
                  {expandableRender && <th style={{ width: '48px', minWidth: '48px', whiteSpace: 'nowrap', padding: '0', borderBottom: '1px solid var(--color-border)', textAlign: 'center' }}></th>}
                  {activeColumns.map((col, idx) => {
                    const isSortable = col.key && col.sortable !== false;
                    return (
                      <th 
                        key={col.key || idx} 
                        className={col.hideOnMobile ? 'hide-on-mobile' : ''}
                        onClick={() => isSortable && requestSort(col.key)}
                        style={{ 
                          height: '36px',
                          padding: '0 16px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600,
                          color: sortConfig.key === col.key ? 'var(--color-primary)' : 'var(--text-muted)',
                          textAlign: col.align || 'left',
                          width: col.width || 'auto',
                          borderBottom: '1px solid var(--color-border)',
                          cursor: isSortable ? 'pointer' : 'default',
                          userSelect: 'none',
                          whiteSpace: 'nowrap',
                          position: (col.key === 'name' || col.header === 'Product Name' || col.label === 'Product Name') ? 'sticky' : 'static',
                          left: (col.key === 'name' || col.header === 'Product Name' || col.label === 'Product Name') ? (onSelectionChange ? '48px' : '0') : 'auto',
                          backgroundColor: 'var(--color-bg-subtle)',
                          zIndex: (col.key === 'name' || col.header === 'Product Name' || col.label === 'Product Name') ? 2 : 0,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: col.align === 'right' ? 'flex-end' : (col.align === 'center' ? 'center' : 'flex-start'), gap: '4px' }}>
                          {col.header}
                          {isSortable && sortConfig.key === col.key && (
                            <span style={{ display: 'flex', color: 'var(--color-primary)' }}>
                              {sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </React.Fragment>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} style={{ borderBottom: '1px solid var(--color-border)', minHeight: 'var(--row-min-height)' }}>
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
                      <Skeleton width={colIndex === 0 ? "80%" : "60%"} height="16px" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (!data || data.length === 0) ? (
              <tr>
                <td colSpan={columns.length + (onSelectionChange ? 1 : 0) + (expandableRender ? 1 : 0)}>
                  <div style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '64px 24px', textAlign: 'center'
                  }}>
                    <div style={{ 
                      width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-bg-hover)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)',
                      marginBottom: '16px'
                    }}>
                      <Inbox size={32} />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--color-text-primary)' }}>{emptyMessage || emptyTitle}</h3>
                    {!emptyMessage && <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>{emptyDescription}</p>}
                    {emptyActionLabel && onEmptyAction && (
                      <button 
                        onClick={onEmptyAction}
                        style={{
                          padding: '8px 16px', backgroundColor: 'var(--color-primary)', color: 'white',
                          border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        {emptyActionLabel}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : sortedData.map((row, rowIndex) => {
              const rowKey = (row && row[keyField] !== undefined && row[keyField] !== null) ? row[keyField] : `fallback-key-${rowIndex}`;
              const isExpanded = expandedId === rowKey;
              const isSelected = selectedIds.includes(rowKey);
              return (
                <React.Fragment key={rowKey}>
                  <tr 
                    style={{ 
                      borderBottom: '1px solid var(--color-border)', 
                      backgroundColor: isSelected ? 'var(--color-bg-selected)' : (isExpanded ? 'var(--color-bg-hover)' : 'transparent'),
                      transition: 'background-color 0.2s ease',
                      height: '64px',
                      cursor: (expandableRender || onRowClick) ? 'pointer' : 'default',
                      position: 'relative',
                    }}
                    onClick={() => {
                      if (onRowClick) {
                        onRowClick(row);
                      } else if (expandableRender) {
                        setExpandedId(isExpanded ? null : rowKey);
                      }
                    }}
                    onMouseEnter={(e) => {
                      setHoveredRowId(rowKey);
                      if (!isSelected && !isExpanded) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      setHoveredRowId(null);
                      if (!isSelected && !isExpanded) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {onSelectionChange && (
                      <td style={{ 
                        padding: '0', width: '48px', minWidth: '48px', whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center',
                        position: 'sticky', left: 0, backgroundColor: 'inherit', zIndex: 1
                      }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowKey, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    )}
                    {expandableRender && (
                      <td 
                        style={{ padding: '0', width: '48px', minWidth: '48px', whiteSpace: 'nowrap', cursor: 'pointer', color: 'var(--text-muted)', verticalAlign: 'middle', textAlign: 'center' }}
                        onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : rowKey); }}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                    )}
                    {activeColumns.map((col, idx) => {
                      let cellValue = col.render ? col.render(row) : row[col.key];
                      const isProductColumn = col.key === 'name' || col.header === 'Product Name' || col.label === 'Product Name';
                      const cellStyle = {
                        padding: '12px 16px', 
                        fontSize: '13px', 
                        color: 'var(--text-main)',
                        textAlign: col.align || 'left',
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
                          data-label={typeof col.header === 'string' ? col.header : col.key}
                          style={cellStyle}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              {cellValue}
                            </div>
                            {idx === activeColumns.length - 1 && renderHoverActions && hoveredRowId === rowKey && (
                              <div style={{ position: 'absolute', right: '16px', display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, transparent, inherit 20%)', paddingLeft: '24px' }}>
                                {renderHoverActions(row)}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {isExpanded && expandableRender && (
                    <tr style={{ backgroundColor: 'var(--color-bg-hover)' }}>
                      <td colSpan={columns.length + (onSelectionChange ? 1 : 0) + 1} style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
                        {expandableRender(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Google Cloud Style) */}
      {(onPageChange || onNextPage || onPrevPage) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          padding: '8px 24px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-app)',
          gap: '24px',
          minHeight: '48px'
        }}>
          {/* Rows per page selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rows per page:</span>
            {onRowsPerPageChange ? (
              <select 
                value={rowsPerPage} 
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '12px',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {[20, 50, 100, 250].map(val => (
                  <option key={`rpp-${val}`} value={val}>{val}</option>
                ))}
              </select>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: 600 }}>
                {rowsPerPage || 20}
              </span>
            )}
          </div>

          {/* Item count (e.g. 1-20 of 152) */}
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {paginationText || (
              totalItems > 0 
                ? `${((currentPage - 1) * (rowsPerPage || 20)) + 1}-${Math.min(currentPage * (rowsPerPage || 20), totalItems)} of ${totalItems}`
                : '0-0 of 0'
            )}
          </span>

          {/* Pagination controls */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => onPrevPage ? onPrevPage() : onPageChange(currentPage - 1)}
              disabled={hasPrevPage !== undefined ? !hasPrevPage : currentPage <= 1}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '4px',
                border: 'none', background: 'transparent',
                color: (hasPrevPage !== undefined ? !hasPrevPage : currentPage <= 1) ? 'var(--color-border)' : 'var(--color-text-primary)',
                cursor: (hasPrevPage !== undefined ? !hasPrevPage : currentPage <= 1) ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => onNextPage ? onNextPage() : onPageChange(currentPage + 1)}
              disabled={hasNextPage !== undefined ? !hasNextPage : (totalPages ? currentPage >= totalPages : true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '4px',
                border: 'none', background: 'transparent',
                color: (hasNextPage !== undefined ? !hasNextPage : (totalPages ? currentPage >= totalPages : true)) ? 'var(--color-border)' : 'var(--color-text-primary)',
                cursor: (hasNextPage !== undefined ? !hasNextPage : (totalPages ? currentPage >= totalPages : true)) ? 'not-allowed' : 'pointer'
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
      {/* Floating Batch Actions */}
      {(selectedIds.length > 0) && renderBatchActions && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1e293b', // Dark modern color
          borderRadius: '12px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          color: 'white',
          animation: 'slideUp 0.3s ease-out forwards',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#334155', color: '#e2e8f0', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
              {selectedIds.length}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#e2e8f0' }}>Selected</span>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: '#475569' }} />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {renderBatchActions(selectedIds)}
          </div>
          <button 
            onClick={() => onSelectionChange?.([])} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', marginLeft: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Clear Selection"
          >
            <X size={16} />
          </button>
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translate(-50%, 20px); }
              to { opacity: 1; transform: translate(-50%, 0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}