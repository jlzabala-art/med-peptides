import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, AlertTriangle, FileText, Activity } from 'lucide-react';
import { StatusChip } from '../../ui';

export default function SupplierTableView({ 
  paginatedData, 
  sortConfig, 
  setSortConfig, 
  selectedIds, 
  onToggleSelect, 
  onToggleSelectAll,
  onRowExpand // Will render the subcomponent
}) {
  const [expandedRows, setExpandedRows] = useState({});

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
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
              <th style={thStyle} onClick={() => handleSort('id')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Supplier SKU <SortIcon column="id" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('country')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Country <SortIcon column="country" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('type')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Type <SortIcon column="type" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('status')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Status <SortIcon column="status" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('healthScore')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Health <SortIcon column="healthScore" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('reliability')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Reliability <SortIcon column="reliability" /></div>
              </th>
              <th style={thStyle} onClick={() => handleSort('pendingDocsCount')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Docs <SortIcon column="pendingDocsCount" /></div>
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
                const isExpanded = expandedRows[s.id];
                const health = s.healthScore || 90;
                const reliability = s.reliability || 95;
                const pendingDocs = s.pendingDocsCount || 0;

                return (
                  <React.Fragment key={s.id}>
                    <tr style={{ backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent', transition: 'background-color 0.2s' }}>
                      <td style={tdStyle}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => onToggleSelect(s.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => toggleRow(s.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                          >
                            {isExpanded ? <ChevronUp size={14} color="var(--primary)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                          </button>
                          {s.companyName || s.name || 'Unknown'}
                          {s.supplierVariants && s.supplierVariants.length > 1 && (
                            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, marginLeft: '4px' }}>
                              {s.supplierVariants.length} Currencies
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)', backgroundColor: 'var(--surface-raised)', padding: '2px 6px', borderRadius: '4px' }}>
                          {s.sku || s.zohoVendorNumber_EUR || s.zohoVendorNumber_USD || ('SUP-' + s.id.slice(-6).toUpperCase())}
                        </span>
                      </td>
                      <td style={tdStyle}>{s.country || 'N/A'}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--surface-raised)', padding: '2px 6px', borderRadius: '4px' }}>
                          {s.type || (s.isZohoMaster ? 'Manufacturer' : 'Distributor')}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <StatusChip status={s.status} />
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
                        <span style={{ fontWeight: 600, color: reliability < 90 ? '#ef4444' : 'var(--text-main)' }}>{reliability}%</span>
                      </td>
                      <td style={tdStyle}>
                        {pendingDocs > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 600 }}>
                            <AlertTriangle size={14} /> {pendingDocs}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                            <FileText size={14} /> Complete
                          </div>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <button onClick={() => toggleRow(s.id)} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '4px 8px' }}>
                          {isExpanded ? 'Close' : 'Expand'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan="10" style={{ padding: 0, borderBottom: '1px solid var(--border)' }}>
                          <div style={{ backgroundColor: 'var(--surface-raised)', borderLeft: '4px solid var(--primary)' }}>
                            {onRowExpand(s)}
                          </div>
                        </td>
                      </tr>
                    )}
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
