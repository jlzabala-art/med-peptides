import React from 'react';
import AppActionGroup from '../../../../ui/AppActionGroup';

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

export default function VariantInventoryTable({ variants, parentProduct, onAction }) {
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
          <th style={thStyle}>Stock</th>
          <th style={thStyle}>Reorder Point</th>
          <th style={thStyle}>MOQ</th>
          <th style={thStyle}>Lead Time</th>
          <th style={thStyle}>Velocity</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((v, i) => (
          <tr key={v.id || i} style={trStyle}>
            <td style={tdStyleMain}>{v.sku || '-'}</td>
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
            <td style={tdStyle}>{v.reorderPoint || 20}</td>
            <td style={tdStyle}>{v.moq || '-'}</td>
            <td style={tdStyle}>{v.leadTime ? `${v.leadTime} days` : '-'}</td>
            <td style={tdStyle}>{v.salesStatus || 'Medium'}</td>
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
        ))}
      </tbody>
    </table>
  );
}
