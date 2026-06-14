import React from 'react';
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

export default function VariantOverviewTable({ variants, parentProduct, onAction }) {
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
          <th style={thStyle}>SKU</th>
          <th style={thStyle}>Supplier</th>
          <th style={thStyle}>Format / Size</th>
          <th style={thStyle}>Health Score</th>
          <th style={thStyle}>Inventory</th>
          <th style={thStyle}>Reg. Status</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((v, i) => {
          const health = calculateVariantHealthScore(v);

          // Fallback SKU Generator Algorithm
          const generateFallbackSku = () => {
            const prodName = parentProduct?.name || parentProduct?.displayName || 'UNK';
            const safeName = prodName
              .replace(/[^a-zA-Z0-9]/g, '')
              .substring(0, 5)
              .toUpperCase();
            const format = (v.format || '').substring(0, 3).toUpperCase();
            const size = (v.size || v.dosage || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const parts = ['SKU', safeName, format, size].filter(Boolean);
            return parts.join('-');
          };

          const displaySku = v.sku || generateFallbackSku();

          return (
            <tr key={v.id || i} style={trStyle}>
              <td style={tdStyleMain}>
                {displaySku}
                {!v.sku && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color: '#f59e0b',
                      marginLeft: '6px',
                      border: '1px solid #fcd34d',
                      padding: '2px 4px',
                      borderRadius: '4px',
                    }}
                  >
                    AUTO
                  </span>
                )}
              </td>
              <td style={tdStyle}>{v.supplier || 'Unassigned'}</td>
              <td style={tdStyle}>
                {[v.format || '', v.dosage || '', v.size || ''].filter(Boolean).join(' ') || '-'}
              </td>
              <td style={tdStyle}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  title={health.flags.map((f) => f.label).join(', ') || 'Fully Compliant'}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: health.color,
                    }}
                  />
                  <span style={{ fontWeight: 600, color: health.color }}>{health.score}</span>
                </div>
              </td>
              <td style={tdStyle}>
                <span
                  style={{
                    color:
                      (typeof v.stock === 'object' ? v.stock?.available || 0 : v.stock || 0) <
                      (v.reorderPoint || 20)
                        ? '#ef4444'
                        : 'inherit',
                  }}
                >
                  {typeof v.stock === 'object' ? v.stock?.available || 0 : v.stock || 0} units
                </span>
              </td>
              <td style={tdStyle}>
                <span
                  style={badgeStyle(
                    v.registrationStatus === 'Registered' || v.registration === 'Active'
                  )}
                >
                  {v.registrationStatus || v.registration || 'Unregistered'}
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
                    actions={[
                      {
                        type: 'view',
                        onClick: () => onAction && onAction('view_variant', parentProduct, v),
                      },
                      {
                        type: 'edit',
                        onClick: () => onAction && onAction('edit_variant', parentProduct, v),
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
