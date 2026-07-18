"use client";

import React, { useState, useMemo } from 'react';
import AppActionGroup from '../../../../ui/AppActionGroup';
import DataTable from '../../../../ui/DataTable';

export default function VariantAnalyticsTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
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
      return { ...v, displaySku: v.sku || generateFallbackSku() };
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
      header: (
        <input type="checkbox" checked={allSelected} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
      ),
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
      header: <span onClick={() => handleSort('displaySku')} style={{ cursor: 'pointer' }}>SKU{getSortIcon('displaySku')}</span>,
      render: (val) => <span style={{ fontWeight: 500 }}>{val}</span>
    },
    { key: 'sales', header: 'Sales', render: () => <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Analytics coming soon</span> },
    { key: 'revenue', header: 'Revenue', render: () => null },
    { key: 'orders', header: 'Orders', render: () => null },
    { key: 'aov', header: 'Avg Order Value', render: () => null },
    { key: 'velocity', header: 'Velocity', render: () => null },
    { key: 'forecast', header: 'Forecast', render: () => null },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <AppActionGroup
            maxVisible={3}
            actions={[
              { type: 'edit', onClick: () => onAction && onAction('edit_variant', parentProduct, row, 'analytics') }
            ]}
          />
        </div>
      )
    }
  ];

  return (
    <div className="gcp-table-container">
      <DataTable
        columns={columns}
        data={sortedVariants}
        keyField={(row, idx) => row.id || idx.toString()}
        onRowClick={(row) => onAction && onAction('edit_variant', parentProduct, row, 'analytics')}
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
