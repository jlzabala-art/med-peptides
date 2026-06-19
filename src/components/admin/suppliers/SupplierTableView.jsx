import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, Clock, AlertTriangle, FileText, Activity } from 'lucide-react';
import { StatusChip } from '../../ui';

export default function SupplierTableView({ 
  paginatedData, 
  sortConfig, 
  setSortConfig, 
  selectedIds, 
  onToggleSelect, 
  onToggleSelectAll,
  onRowClick,
  selectedSupplierId
}) {
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const allSelected = paginatedData.length > 0 && paginatedData.every(s => selectedIds.includes(s.id));

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronDown size={12} color="#cbd5e1" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} color="var(--primary)" /> : <ChevronDown size={12} color="var(--primary)" />;
  };

  const thStyle = { 
    padding: '12px 16px', 
    textAlign: 'left', 
    fontSize: '0.75rem', 
    fontWeight: 700, 
    color: 'var(--text-muted)', 
    borderBottom: '2px solid var(--border)',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap'
  };

  const tdStyle = { 
    padding: '12px 16px', 
    fontSize: '0.8rem', 
    color: 'var(--text-main)', 
    borderBottom: '1px solid var(--border)',
    verticalAlign: 'middle'
  };

  return (
    <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-raised)' }}>
              <th style={{ ...thStyle, width: '40px', cursor: 'default' }}>
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  onChange={(e) => onToggleSelectAll(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={thStyle} onClick={() => handleSort('companyName')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Supplier <SortIcon column="companyName" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('country')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Country <SortIcon column="country" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('type')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Type <SortIcon column="type" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('productsSupplied')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Items Linked <SortIcon column="productsSupplied" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('singleSourceItems')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Single Source Items <SortIcon column="singleSourceItems" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('pendingDocsCount')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Compliance <SortIcon column="pendingDocsCount" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('healthScore')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Health Score <SortIcon column="healthScore" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('lastActivity')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Last Activity <SortIcon column="lastActivity" /></div>
              </th>
              <th style={{ ...thStyle, cursor: 'default', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No suppliers found matching the criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map(s => {
                const isSelected = selectedIds.includes(s.id);
                return (
                  <React.Fragment key={s.id}>
                    <tr 
                      style={{ backgroundColor: s.id === selectedSupplierId ? 'var(--primary-light)' : isSelected ? 'var(--color-bg-selected)' : 'transparent', transition: 'background-color 0.2s', cursor: 'pointer' }}
                      onClick={() => onRowClick(s)}
                    >
                      <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => onToggleSelect(s.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {s.companyName || s.name || 'Unknown'}
                          {s.supplierVariants && s.supplierVariants.length > 1 && (
                            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, marginLeft: '4px' }}>
                              {s.supplierVariants.length} Currencies
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>{s.country || 'N/A'}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--surface-raised)', padding: '2px 6px', borderRadius: '4px' }}>
                          {s.type || (s.isZohoMaster ? 'Manufacturer' : 'Distributor')}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.productsSupplied || 0}</span>
                      </td>
                      <td style={tdStyle}>
                        {s.singleSourceItems > 0 ? (
                          <span style={{ fontWeight: 600, color: '#ef4444' }}>{s.singleSourceItems}</span>
                        ) : (
                          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>0</span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        {pendingDocs > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 600, fontSize: '0.75rem' }}>
                            <AlertTriangle size={14} /> Pending ({pendingDocs})
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
                            <FileText size={14} /> Complete
                          </div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '40px', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${health}%`, height: '100%', background: health < 80 ? '#ef4444' : health < 90 ? '#f59e0b' : '#10b981' }} />
                          </div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{health}</span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {s.lastActivity || 'Today'}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <ChevronRight size={16} color="var(--text-muted)" />
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
