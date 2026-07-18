"use client";

import React, { useState, useMemo } from 'react';
import AppActionGroup from '../../../../ui/AppActionGroup';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import DataTable from '../../../../ui/DataTable';

export default function VariantInventoryTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id, e) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

      let inventoryRaw = typeof v.stock === 'object' && v.stock !== null ? v.stock.available : v.stock;
      let inventory = Number(inventoryRaw);
      if (isNaN(inventory) || inventoryRaw === '' || inventoryRaw === null || inventoryRaw === undefined) {
        inventory = 0;
      }

      const typeStr = v.formatLabel || v.format || v.productType || '';
      const dosageStr = v.dosage || v.size || '';
      const unitStr = v.kit?.unit || v.dosage_unit || '';
      let displayDosageFormat = '-';
      if (typeStr.toLowerCase().includes('api')) {
        displayDosageFormat = `API (Bulk)`;
      } else if (dosageStr) {
        const presentation = unitStr ? unitStr : (typeStr.toLowerCase().includes('lyophilized') ? 'Vial' : typeStr);
        displayDosageFormat = `${dosageStr} / ${presentation.charAt(0).toUpperCase() + presentation.slice(1)}`;
      } else {
        displayDosageFormat = typeStr || '-';
      }

      return {
        ...v,
        displayDosageFormat,
        displaySku: v.sku || generateFallbackSku(),
        inventory,
        reorderPoint: v.reorderPoint || 20,
        moq: v.moq || '-',
        leadTime: v.leadTime || 0,
        velocity: v.salesStatus || 'Medium'
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
      key: 'displayDosageFormat',
      header: <span onClick={() => handleSort('displayDosageFormat')} style={{ cursor: 'pointer' }}>Dosage / Format{getSortIcon('displayDosageFormat')}</span>,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {row.warehouses && row.warehouses.length > 0 && (
            <div onClick={(e) => toggleRow(row.id, e)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {expandedRows[row.id] ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
            </div>
          )}
          <span style={{ fontWeight: 500 }}>{val}</span>
        </div>
      )
    },
    {
      key: 'inventory',
      header: <span onClick={() => handleSort('inventory')} style={{ cursor: 'pointer' }}>Stock{getSortIcon('inventory')}</span>,
      render: (val, row) => (
        <span style={{ color: val < row.reorderPoint ? '#ef4444' : 'inherit', fontWeight: row.warehouses?.length > 0 ? 600 : 400 }}>
          {val} units {row.warehouses?.length > 0 && <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px' }}>({row.warehouses.length} locations)</span>}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <AppActionGroup
            maxVisible={3}
            actions={[{ type: 'edit', onClick: () => onAction && onAction('edit_variant', parentProduct, row, 'inventory') }]}
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
        onRowClick={(row) => onAction && onAction('edit_variant', parentProduct, row, 'inventory')}
        rowStyle={(row) => ({
          backgroundColor: selectedIds.includes(row.id) ? 'var(--color-bg-selected)' : 'transparent',
          borderLeft: selectedIds.includes(row.id) ? '4px solid #3b82f6' : '4px solid transparent',
          cursor: 'pointer',
        })}
        emptyMessage="No variants found."
      />
      {Object.keys(expandedRows).length > 0 && (
        <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: '#475569' }}>Warehouse Stock</h4>
          {sortedVariants.map((v) => {
            if (!expandedRows[v.id] || !v.warehouses || v.warehouses.length === 0) return null;
            return (
              <div key={v.id} style={{ marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.8rem', color: '#334155' }}>{v.displayDosageFormat}:</strong>
                <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  {v.warehouses.map((wh, wIdx) => (
                    <li key={wIdx}>
                      {wh.location || 'Unknown Location'}: <span style={{ color: wh.stock === 0 ? '#ef4444' : 'inherit' }}>{wh.stock || 0} units</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
