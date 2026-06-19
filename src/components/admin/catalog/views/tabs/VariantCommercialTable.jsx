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

export default function VariantCommercialTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
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
      const rawCost = v.cost_per_gram || v.cost || v.unitCost || v.pricing?.master?.perUnit || 0;
      const rawShipping = v.shippingCost || v.shipping || 0;
      const rawWholesale = v.pricing?.wholesale?.perUnit || v.wholesalePrice || v.wholesale || 0;
      const rawClinic = v.pricing?.clinic?.perUnit || v.clinicPrice || v.clinic || 0;
      const rawMsrp = v.pricing?.retail?.perUnit || v.msrp || v.price || 0;
      const landedCost = rawCost && rawShipping ? Number(rawCost) + Number(rawShipping) : null;
      const margin = rawMsrp && rawCost ? (((rawMsrp - rawCost) / rawMsrp) * 100).toFixed(0) : null;

      // Fallback SKU Generator Algorithm
      const generateFallbackSku = () => {
        const prodName = parentProduct?.name || parentProduct?.displayName || 'UNK';
        const safeName = prodName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
        const format = (v.format || '').substring(0, 3).toUpperCase();
        const size = (v.size || v.dosage || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return ['SKU', safeName, format, size].filter(Boolean).join('-');
      };

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
        supplierName: v.supplier || parentProduct?.supplier || 'Unassigned',
        rawCost: Number(rawCost),
        rawWholesale: Number(rawWholesale),
        rawClinic: Number(rawClinic),
        rawMsrp: Number(rawMsrp),
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
          <th style={thStyle} onClick={() => handleSort('supplierName')}>Supplier{getSortIcon('supplierName')}</th>
          <th style={thStyle} onClick={() => handleSort('rawCost')}>Base Cost{getSortIcon('rawCost')}</th>
          <th style={thStyle} onClick={() => handleSort('rawWholesale')}>Wholesale{getSortIcon('rawWholesale')}</th>
          <th style={thStyle} onClick={() => handleSort('rawClinic')}>Clinic{getSortIcon('rawClinic')}</th>
          <th style={thStyle} onClick={() => handleSort('rawMsrp')}>MSRP{getSortIcon('rawMsrp')}</th>
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
              onClick={() => onAction && onAction('edit_variant', parentProduct, v, 'commercial')}
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
              <td style={tdStyleMain}>{v.displayDosageFormat}</td>
              <td style={tdStyle}>{v.supplierName}</td>
              <td style={tdStyle}>{v.rawCost ? `$${v.rawCost}` : '-'}</td>
              <td style={tdStyle}>
                {v.rawWholesale ? `$${v.rawWholesale}` : '-'}
                {v.rawWholesale && v.rawCost ? <span style={{fontSize:'0.75rem', color:'#64748b', marginLeft:'6px'}}>{Math.round(((v.rawWholesale - v.rawCost)/v.rawWholesale)*100)}%</span> : null}
              </td>
              <td style={tdStyle}>
                {v.rawClinic ? `$${v.rawClinic}` : '-'}
                {v.rawClinic && v.rawWholesale ? <span style={{fontSize:'0.75rem', color:'#64748b', marginLeft:'6px'}}>{Math.round(((v.rawClinic - v.rawWholesale)/v.rawClinic)*100)}%</span> : null}
              </td>
              <td style={tdStyle}>
                <b>{v.rawMsrp ? `$${v.rawMsrp}` : '-'}</b>
                {v.rawMsrp && v.rawClinic ? <span style={{fontSize:'0.75rem', color:'#f59e0b', marginLeft:'6px'}}>{Math.round(((v.rawMsrp - v.rawClinic)/v.rawMsrp)*100)}%</span> : null}
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
                        onClick: () => onAction && onAction('edit_variant', parentProduct, v, 'commercial'),
                      }
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
