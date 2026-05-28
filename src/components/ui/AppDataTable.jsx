import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Inbox, ArrowUp, ArrowDown } from 'lucide-react';

export default function AppDataTable({ 
  columns, 
  data, 
  keyField = 'id',
  
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
  
  // Empty State
  emptyTitle = "No data found",
  emptyDescription = "There are no records to display.",
  emptyActionLabel,
  onEmptyAction
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    
    let sortableItems = [...data];
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
      <div style={{ overflowX: 'auto', overflowY: 'visible', width: '100%', minHeight: '350px', maxHeight: 'calc(100vh - 200px)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
              
              {(someSelected || allSelected) && renderBatchActions ? (
                <th colSpan={columns.length + (expandableRender ? 1 : 0)} style={{ padding: '0 var(--table-padding-h)', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {selectedIds.length} selected
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {renderBatchActions(selectedIds)}
                    </div>
                  </div>
                </th>
              ) : (
                <React.Fragment>
                  {expandableRender && <th style={{ width: '48px', minWidth: '48px', whiteSpace: 'nowrap', padding: '0', borderBottom: '1px solid var(--color-border)', textAlign: 'center' }}></th>}
                  
                  {columns.map((col, idx) => {
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
                          whiteSpace: 'nowrap',
                          cursor: isSortable ? 'pointer' : 'default',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start', gap: '4px' }}>
                          {col.header}
                          {isSortable && sortConfig.key === col.key && (
                            sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </React.Fragment>
              )}
            </tr>
          </thead>
          <tbody>
            {(!data || data.length === 0) ? (
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
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--color-text-primary)' }}>{emptyTitle}</h3>
                    <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>{emptyDescription}</p>
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
            ) : sortedData.map((row) => {
              const isExpanded = expandedId === row[keyField];
              const isSelected = selectedIds.includes(row[keyField]);
              
              return (
                <React.Fragment key={row[keyField]}>
                  <tr 
                    style={{ 
                      borderBottom: '1px solid var(--color-border)', 
                      backgroundColor: isSelected ? 'var(--color-bg-selected)' : (isExpanded ? 'var(--color-bg-hover)' : 'transparent'),
                      transition: 'background-color 0.2s ease',
                      minHeight: 'var(--row-min-height)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isExpanded) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isExpanded) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {onSelectionChange && (
                      <td style={{ padding: '0', width: '48px', minWidth: '48px', whiteSpace: 'nowrap', verticalAlign: 'middle', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(row[keyField], e.target.checked)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                    )}
                    {expandableRender && (
                      <td 
                        style={{ padding: '0', width: '48px', minWidth: '48px', whiteSpace: 'nowrap', cursor: 'pointer', color: 'var(--text-muted)', verticalAlign: 'middle', textAlign: 'center' }}
                        onClick={() => setExpandedId(isExpanded ? null : row[keyField])}
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td 
                        key={col.key || idx} 
                        className={col.hideOnMobile ? 'hide-on-mobile' : ''}
                        style={{ 
                          padding: '12px 16px', 
                          fontSize: '13px', 
                          color: 'var(--text-main)',
                          textAlign: col.align || 'left',
                          verticalAlign: 'middle'
                        }}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
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
                {[10, 20, 50, 100].map(val => (
                  <option key={val} value={val}>{val}</option>
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
    </div>
  );
}
