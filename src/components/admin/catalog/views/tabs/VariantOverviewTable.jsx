import React, { useState, useMemo } from 'react';
import { calculateVariantHealthScore } from '../../useVariantHealthScore';
import AppActionGroup from '../../../../ui/AppActionGroup';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

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

const badgeStyle = (isValid) => ({
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '0.7rem',
  backgroundColor:
    isValid === true || isValid === 'Valid' || isValid === 'Active'
      ? 'rgba(16, 185, 129, 0.1)'
      : 'rgba(148, 163, 184, 0.1)',
  color: isValid === true || isValid === 'Valid' || isValid === 'Active' ? '#10b981' : '#64748b',
});

export default function VariantOverviewTable({ variants, parentProduct, onAction, selectedIds = [], onSelectionChange }) {
  const [touchTimer, setTouchTimer] = React.useState(null);
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
    return variants.map((v) => {
      const health = calculateVariantHealthScore(v);

      const generateFallbackSku = () => {
        const prodName = parentProduct?.name || parentProduct?.displayName || 'UNK';
        const safeName = prodName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
        const format = (v.format || '').substring(0, 3).toUpperCase();
        const size = (v.size || v.dosage || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return ['SKU', safeName, format, size].filter(Boolean).join('-');
      };

      const displaySku = v.sku || generateFallbackSku();
      const supplierName = v.supplier || parentProduct?.supplier || 'Unassigned';
      const formatSize = [v.format || '', v.dosage || '', v.size || ''].filter(Boolean).join(' ') || '-';
      const inventory = typeof v.stock === 'object' ? v.stock?.available || 0 : v.stock || 0;
      const regStatus = v.registrationStatus || v.registration || 'Unregistered';

      return {
        ...v,
        displaySku,
        supplierName,
        formatSize,
        health,
        inventory,
        regStatus
      };
    });
  }, [variants, parentProduct]);

  const sortedVariants = useMemo(() => {
    let sortableItems = [...processedVariants];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        if (sortConfig.key === 'health') {
          valA = a.health.score;
          valB = b.health.score;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
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

  const handleTouchStart = (id) => {
    if (!onSelectionChange) return;
    const timer = setTimeout(() => {
      const isSelected = selectedIds.includes(id);
      handleSelectRow(id, !isSelected);
    }, 500);
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
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
          <th style={thStyle} onClick={() => handleSort('supplierName')}>Supplier{getSortIcon('supplierName')}</th>
          <th style={thStyle} onClick={() => handleSort('formatSize')}>Format / Size{getSortIcon('formatSize')}</th>
          <th style={thStyle} onClick={() => handleSort('health')}>Health Score{getSortIcon('health')}</th>
          <th style={thStyle} onClick={() => handleSort('inventory')}>Inventory{getSortIcon('inventory')}</th>
          <th style={thStyle} onClick={() => handleSort('regStatus')}>Reg. Status{getSortIcon('regStatus')}</th>
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
              onTouchStart={() => handleTouchStart(v.id)}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
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
              <td style={tdStyleMain}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {v.image ? <img src={v.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} /> : <span style={{ fontSize: '10px', color: '#94a3b8' }}>Img</span>}
                  </div>
                  <span>{v.displaySku}</span>
                </div>
              </td>
              <td style={tdStyle}>{v.supplierName}</td>
              <td style={tdStyle}>{v.formatSize}</td>
              <td style={tdStyle}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  title={v.health.flags.map((f) => f.label).join(', ') || 'Fully Compliant'}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: v.health.color,
                    }}
                  />
                  <span style={{ fontWeight: 600, color: v.health.color }}>{v.health.score}</span>
                </div>
              </td>
              <td style={tdStyle}>
                <span style={{ color: v.inventory < (v.reorderPoint || 20) ? '#ef4444' : 'inherit' }}>
                  {v.inventory} units
                </span>
              </td>
              <td style={tdStyle}>
                <span style={badgeStyle(v.regStatus === 'Registered' || v.regStatus === 'Active')}>
                  {v.regStatus}
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAction) onAction('ai_variant', parentProduct, v);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#6366f1',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                    title="Atlas AI"
                  >
                    <Sparkles size={12} /> Atlas
                  </button>
                  <AppActionGroup
                    maxVisible={3}
                    actions={[
                      {
                        type: 'clone',
                        onClick: () => onAction && onAction('clone_variant', parentProduct, v),
                      },
                      {
                        type: 'edit',
                        onClick: () => onAction && onAction('edit_variant', parentProduct, v, 'overview'),
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
