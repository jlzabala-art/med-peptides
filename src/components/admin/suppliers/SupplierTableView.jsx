"use client";

import React from 'react';
import { ChevronRight, AlertTriangle, FileText } from '@/lib/icons';
import { StatusChip } from '../../ui';
import DataTable from '../../ui/DataTable';

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
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const allSelected = paginatedData.length > 0 && paginatedData.every(s => selectedIds.includes(s.id));

  return (
    <div className="gcp-table-container" style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <DataTable
        columns={[
          {
            key: 'select',
            header: (
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onToggleSelectAll(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
            ),
            render: (val, row) => (
              <input
                type="checkbox"
                checked={selectedIds.includes(row.id)}
                onChange={(e) => { e.stopPropagation(); onToggleSelect(row.id); }}
                onClick={(e) => e.stopPropagation()}
                style={{ cursor: 'pointer' }}
              />
            )
          },
          {
            key: 'companyName',
            header: <span onClick={() => handleSort('companyName')} style={{ cursor: 'pointer' }}>Supplier {sortConfig.key === 'companyName' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</span>,
            render: (val, row) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                {row.companyName || row.name || 'Unknown'}
                {row.supplierVariants?.length > 1 && (
                  <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    {row.supplierVariants.length} Currencies
                  </span>
                )}
              </div>
            )
          },
          {
            key: 'country',
            header: <span onClick={() => handleSort('country')} style={{ cursor: 'pointer' }}>Country {sortConfig.key === 'country' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</span>,
            render: (val) => <span>{val || 'N/A'}</span>
          },
          {
            key: 'type',
            header: <span onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>Type {sortConfig.key === 'type' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</span>,
            render: (val, row) => (
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', backgroundColor: 'var(--surface-raised)', padding: '2px 6px', borderRadius: '4px' }}>
                {val || (row.isZohoMaster ? 'Manufacturer' : 'Distributor')}
              </span>
            )
          },
          {
            key: 'productsSupplied',
            header: <span onClick={() => handleSort('productsSupplied')} style={{ cursor: 'pointer' }}>Items Linked {sortConfig.key === 'productsSupplied' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</span>,
            render: (val) => <span style={{ fontWeight: 600 }}>{val || 0}</span>
          },
          {
            key: 'singleSourceItems',
            header: <span onClick={() => handleSort('singleSourceItems')} style={{ cursor: 'pointer' }}>Single Source {sortConfig.key === 'singleSourceItems' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</span>,
            render: (val) => (
              <span style={{ fontWeight: 600, color: val > 0 ? '#ef4444' : 'var(--text-muted)' }}>{val || 0}</span>
            )
          },
          {
            key: 'pendingDocsCount',
            header: <span onClick={() => handleSort('pendingDocsCount')} style={{ cursor: 'pointer' }}>Compliance {sortConfig.key === 'pendingDocsCount' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</span>,
            render: (val) => val > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontWeight: 600, fontSize: '0.75rem' }}>
                <AlertTriangle size={14} /> Pending ({val})
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>
                <FileText size={14} /> Complete
              </div>
            )
          },
          {
            key: 'healthScore',
            header: <span onClick={() => handleSort('healthScore')} style={{ cursor: 'pointer' }}>Health {sortConfig.key === 'healthScore' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</span>,
            render: (val) => {
              const health = val || 0;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '40px', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${health}%`, height: '100%', background: health < 80 ? '#ef4444' : health < 90 ? '#f59e0b' : '#10b981' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{health}</span>
                </div>
              );
            }
          },
          {
            key: 'lastActivity',
            header: <span onClick={() => handleSort('lastActivity')} style={{ cursor: 'pointer' }}>Last Activity {sortConfig.key === 'lastActivity' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</span>,
            render: (val) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{val || 'Today'}</span>
          },
          {
            key: 'id',
            header: 'Actions',
            render: () => <ChevronRight size={16} color="var(--text-muted)" />
          }
        ]}
        data={paginatedData}
        keyField="id"
        onRowClick={(row) => onRowClick(row)}
        rowStyle={(row) => ({
          backgroundColor: row.id === selectedSupplierId ? 'var(--primary-light)' : selectedIds.includes(row.id) ? 'var(--color-bg-selected)' : 'transparent',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        })}
        emptyMessage="No suppliers found matching the criteria."
      />
    </div>
  );
}
