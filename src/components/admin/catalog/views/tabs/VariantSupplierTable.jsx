"use client";

import React, { useState, useMemo } from 'react';
import AppActionGroup from '../../../../ui/AppActionGroup';
import DataTable from '../../../../ui/DataTable';
import { UserPlus, Send } from '@/lib/icons';

export default function VariantSupplierTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const processedVariants = useMemo(() => {
    return variants.map(v => {
      const generateFallbackSku = () => {
        const prodName = parentProduct?.name || parentProduct?.displayName || 'UNK';
        const safeName = prodName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
        const format = (v.format || '').substring(0, 3).toUpperCase();
        const size = (v.size || v.dosage || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return ['SKU', safeName, format, size].filter(Boolean).join('-');
      };

      const primarySupplierName = v.primarySupplier?.name || v.supplier || parentProduct?.supplier || '';
      const backupSupplierName = v.backupSupplier?.name || '';

      return {
        ...v,
        displaySku: v.sku || generateFallbackSku(),
        primarySupplierName,
        backupSupplierName,
        leadTimeDays: v.leadTime || 0,
        moqUnits: v.moq || 0,
      };
    });
  }, [variants, parentProduct]);

  const sortedVariants = useMemo(() => {
    let sortableItems = [...processedVariants];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [processedVariants, sortConfig]);

  const allSelected = variants.length > 0 && variants.every(v => selectedIds.includes(v.id));

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const newIds = new Set([...selectedIds, ...variants.map(v => v.id)]);
      onSelectionChange(Array.from(newIds));
    } else {
      const variantIds = new Set(variants.map(v => v.id));
      onSelectionChange(selectedIds.filter(id => !variantIds.has(id)));
    }
  };

  const handleSelectRow = (id, checked) => {
    if (!onSelectionChange) return;
    if (checked) onSelectionChange([...selectedIds, id]);
    else onSelectionChange(selectedIds.filter(sid => sid !== id));
  };

  const columns = [
    ...(onSelectionChange ? [{
      key: 'select',
      header: <input type="checkbox" checked={allSelected} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />,
      render: (val, row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'pointer' }}
        />
      )
    }] : []),
    {
      key: 'displaySku',
      header: <span onClick={() => handleSort('displaySku')} style={{ cursor: 'pointer' }}>Variant SKU{getSortIcon('displaySku')}</span>,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name || row.displaySku}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.displaySku}</div>
        </div>
      )
    },
    {
      key: 'primarySupplierName',
      header: <span onClick={() => handleSort('primarySupplierName')} style={{ cursor: 'pointer' }}>Primary Supplier{getSortIcon('primarySupplierName')}</span>,
      render: (val, row) => (
        val ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontWeight: 600, color: '#334155' }}>{val}</span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Health: {row.primarySupplier?.healthScore || 'N/A'}</span>
          </div>
        ) : (
          <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>Not Assigned</span>
        )
      )
    },
    {
      key: 'backupSupplierName',
      header: <span onClick={() => handleSort('backupSupplierName')} style={{ cursor: 'pointer' }}>Backup Supplier{getSortIcon('backupSupplierName')}</span>,
      render: (val) => (
        val ? (
          <span style={{ color: '#334155', fontSize: '0.85rem' }}>{val}</span>
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>None</span>
        )
      )
    },
    {
      key: 'leadTimeDays',
      header: <span onClick={() => handleSort('leadTimeDays')} style={{ cursor: 'pointer' }}>Lead Time{getSortIcon('leadTimeDays')}</span>,
      render: (val) => <span style={{ fontSize: '0.85rem' }}>{val ? `${val} days` : '—'}</span>
    },
    {
      key: 'moqUnits',
      header: <span onClick={() => handleSort('moqUnits')} style={{ cursor: 'pointer' }}>MOQ{getSortIcon('moqUnits')}</span>,
      render: (val) => <span style={{ fontSize: '0.85rem' }}>{val || '—'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onAction('assignSupplier', row); }}
            style={{ padding: '0.3rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
          >
            <UserPlus size={12} /> Assign
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAction('createRfq', row); }}
            style={{ padding: '0.3rem 0.6rem', border: '1px solid #bfdbfe', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
          >
            <Send size={12} /> RFQ
          </button>
          <AppActionGroup
            maxVisible={3}
            actions={[
              { type: 'view', onClick: () => onAction && onAction('view_variant', parentProduct, row) },
              { type: 'edit', onClick: () => onAction && onAction('edit_variant', parentProduct, row, 'supplier') },
              { type: 'delete', onClick: () => onAction && onAction('delete_variant', parentProduct, row) },
            ]}
          />
        </div>
      )
    }
  ];

  if (!variants || variants.length === 0) return null;

  return (
    <div className="gcp-table-container">
      <DataTable
        columns={columns}
        data={sortedVariants}
        keyField={(row, idx) => row.id || idx.toString()}
        onRowClick={(row) => onAction && onAction('view_variant', parentProduct, row)}
        rowStyle={(row) => ({
          backgroundColor: selectedIds.includes(row.id) ? 'var(--color-bg-selected)' : 'transparent',
          borderLeft: selectedIds.includes(row.id) ? '4px solid #3b82f6' : '4px solid transparent',
          cursor: 'pointer',
        })}
        emptyMessage="No variants found."
      />
    </div>
  );
}
