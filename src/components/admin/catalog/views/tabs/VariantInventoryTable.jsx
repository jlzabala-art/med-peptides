import React, { useState, useMemo } from 'react';
import AppActionGroup from '../../../../ui/AppActionGroup';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

const thStyle = {
  padding: '12px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  borderBottom: '1px solid var(--color-border)',
  textAlign: 'left',
  backgroundColor: '#f1f5f9',
  cursor: 'pointer',
  userSelect: 'none'
};
const tdStyleMain = {
  padding: '12px',
  fontWeight: 500,
  color: 'var(--text-main)',
  borderBottom: '1px solid var(--color-border)',
};
const tdStyle = {
  padding: '12px',
  color: 'var(--text-main)',
  borderBottom: '1px solid var(--color-border)',
};
const trStyle = { backgroundColor: 'transparent', cursor: 'pointer' };

export default function VariantInventoryTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id, e) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
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
  const someSelected = variants.some(v => selectedIds.includes(v.id)) && !allSelected;

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
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(sid => sid !== id));
    }
  };

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.8rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}
    >
      <thead>
        <tr>
          {onSelectionChange && (
            <th style={{ ...thStyle, width: '48px', textAlign: 'center', cursor: 'default' }}>
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => { if (input) input.indeterminate = someSelected; }}
                onChange={handleSelectAll}
                style={{ cursor: 'pointer' }}
              />
            </th>
          )}
          <th style={thStyle} onClick={() => handleSort('displayDosageFormat')}>Dosage / Format{getSortIcon('displayDosageFormat')}</th>
          <th style={thStyle} onClick={() => handleSort('inventory')}>Stock{getSortIcon('inventory')}</th>

          <th style={{ ...thStyle, textAlign: 'right', cursor: 'default' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedVariants.map((v, i) => {
          const isSelected = selectedIds.includes(v.id);
          return (
            <tr 
              key={v.id || i} 
              style={{
                ...trStyle,
                backgroundColor: isSelected ? 'var(--color-bg-selected)' : 'transparent',
                borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
              }}
              onClick={() => onAction && onAction('edit_variant', parentProduct, v, 'inventory')}
            >
              {onSelectionChange && (
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleSelectRow(v.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
              )}
              <td style={tdStyleMain}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {v.warehouses && v.warehouses.length > 0 && (
                    <div onClick={(e) => toggleRow(v.id, e)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {expandedRows[v.id] ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
                    </div>
                  )}
                  {v.displayDosageFormat}
                </div>
              </td>
              <td style={tdStyle}>
                <span style={{ color: v.inventory < v.reorderPoint ? '#ef4444' : 'inherit', fontWeight: v.warehouses?.length > 0 ? 600 : 400 }}>
                  {v.inventory} units {v.warehouses?.length > 0 && <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px' }}>({v.warehouses.length} locations)</span>}
                </span>
              </td>

              <td style={{ ...tdStyle, textAlign: 'right' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                  }}
                >
                  <AppActionGroup
                    maxVisible={3}
                    actions={[
                      {
                        type: 'edit',
                        onClick: () => onAction && onAction('edit_variant', parentProduct, v, 'inventory'),
                      }
                    ]}
                  />
                </div>
              </td>
            </tr>
          );
        })}
        {sortedVariants.map((v, i) => {
          if (!expandedRows[v.id] || !v.warehouses || v.warehouses.length === 0) return null;
          return v.warehouses.map((wh, wIdx) => (
            <tr key={`${v.id}-wh-${wIdx}`} style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {onSelectionChange && <td style={tdStyle}></td>}
              <td style={{ ...tdStyleMain, paddingLeft: '48px', fontSize: '0.75rem', color: '#475569' }}>
                ↳ {wh.location || 'Unknown Location'}
              </td>
              <td style={{ ...tdStyle, fontSize: '0.75rem', color: wh.stock === 0 ? '#ef4444' : '#475569' }}>
                {wh.stock || 0} units
              </td>
              <td style={tdStyle}></td>
            </tr>
          ));
        })}
      </tbody>
    </table>
  );
}
