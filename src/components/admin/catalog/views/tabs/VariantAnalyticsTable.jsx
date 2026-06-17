import React, { useState, useMemo } from 'react';
import AppActionGroup from '../../../../ui/AppActionGroup';

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

export default function VariantAnalyticsTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

      return {
        ...v,
        displaySku: v.sku || generateFallbackSku(),
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
          <th style={thStyle} onClick={() => handleSort('displaySku')}>SKU{getSortIcon('displaySku')}</th>
          <th style={thStyle}>Sales</th>
          <th style={thStyle}>Revenue</th>
          <th style={thStyle}>Orders</th>
          <th style={thStyle}>Avg Order Value</th>
          <th style={thStyle}>Velocity</th>
          <th style={thStyle}>Forecast</th>
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
              onClick={() => onAction && onAction('view_variant', parentProduct, v)}
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
              <td style={tdStyleMain}>{v.displaySku}</td>
              <td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: '24px', fontStyle: 'italic', color: '#94a3b8' }}>
                Analytics data coming soon
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
                        type: 'view',
                        onClick: () => onAction && onAction('view_variant', parentProduct, v),
                      },
                      {
                        type: 'edit',
                        onClick: () => onAction && onAction('edit_variant', parentProduct, v, 'analytics'),
                      },
                      {
                        type: 'delete',
                        onClick: () => onAction && onAction('delete_variant', parentProduct, v),
                      },
                    ]}
                  />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
