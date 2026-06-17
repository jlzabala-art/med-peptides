import React, { useState, useMemo } from 'react';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import Send from 'lucide-react/dist/esm/icons/send';
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

export default function VariantSupplierTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
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

  if (!variants || variants.length === 0) return null;

  return (
    <div style={{ width: '100%', overflowX: 'auto', background: '#fff', borderRadius: '6px', border: '1px solid var(--border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
        <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
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
            <th style={thStyle} onClick={() => handleSort('displaySku')}>Variant SKU{getSortIcon('displaySku')}</th>
            <th style={thStyle} onClick={() => handleSort('primarySupplierName')}>Primary Supplier{getSortIcon('primarySupplierName')}</th>
            <th style={thStyle} onClick={() => handleSort('backupSupplierName')}>Backup Supplier{getSortIcon('backupSupplierName')}</th>
            <th style={thStyle} onClick={() => handleSort('leadTimeDays')}>Lead Time{getSortIcon('leadTimeDays')}</th>
            <th style={thStyle} onClick={() => handleSort('moqUnits')}>MOQ{getSortIcon('moqUnits')}</th>
            <th style={{ ...thStyle, textAlign: 'right', cursor: 'default' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedVariants.map((variant, i) => {
            const isSelected = selectedIds?.includes(variant.id);
            return (
              <tr 
                key={variant.id || i} 
                style={{ 
                  ...trStyle,
                  borderBottom: '1px solid #f1f5f9', 
                  background: isSelected ? '#eff6ff' : 'transparent',
                  borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent'
                }}
                onClick={() => onAction && onAction('view_variant', parentProduct, variant)}
              >
                {onSelectionChange && (
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(variant.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                )}
                <td style={tdStyleMain}>
                  <div style={{ fontWeight: 600 }}>{variant.name || variant.displaySku}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{variant.displaySku}</div>
                </td>
                <td style={tdStyle}>
                  {variant.primarySupplierName ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{variant.primarySupplierName}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Health: {variant.primarySupplier?.healthScore || 'N/A'}</span>
                    </div>
                  ) : (
                    <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>Not Assigned</span>
                  )}
                </td>
                <td style={tdStyle}>
                  {variant.backupSupplierName ? (
                    <span style={{ color: '#334155', fontSize: '0.85rem' }}>{variant.backupSupplierName}</span>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>None</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '0.85rem' }}>{variant.leadTimeDays ? `${variant.leadTimeDays} days` : '—'}</span>
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '0.85rem' }}>{variant.moqUnits || '—'}</span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAction('assignSupplier', variant); }}
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      <UserPlus size={12} /> Assign
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAction('createRfq', variant); }}
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid #bfdbfe', borderRadius: '4px', background: '#eff6ff', color: '#1d4ed8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      <Send size={12} /> RFQ
                    </button>
                    <AppActionGroup
                      maxVisible={3}
                      actions={[
                        {
                          type: 'view',
                          onClick: () => onAction && onAction('view_variant', parentProduct, variant),
                        },
                        {
                          type: 'edit',
                          onClick: () => onAction && onAction('edit_variant', parentProduct, variant, 'supplier'),
                        },
                        {
                          type: 'delete',
                          onClick: () => onAction && onAction('delete_variant', parentProduct, variant),
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
    </div>
  );
}
