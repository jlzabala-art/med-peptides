import React from 'react';
import { AppActionGroup } from '../../../ui/AppActionGroup';

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

export default function VariantAnalyticsTable({ variants, parentProduct, onAction }) {
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
          <th style={thStyle}>Sales</th>
          <th style={thStyle}>Revenue</th>
          <th style={thStyle}>Orders</th>
          <th style={thStyle}>Avg Order Value</th>
          <th style={thStyle}>Velocity</th>
          <th style={thStyle}>Forecast</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((v, i) => (
          <tr key={v.id || i} style={trStyle}>
            <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '24px' }}>
              Analytics data for {v.sku || v.format || 'variant'} coming soon
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
                  actions={[
                    { type: 'view', onClick: () => onAction && onAction('view_variant', parentProduct, v) },
                    { type: 'edit', onClick: () => onAction && onAction('edit_variant', parentProduct, v) },
                    { type: 'delete', onClick: () => onAction && onAction('delete_variant', parentProduct, v) },
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
