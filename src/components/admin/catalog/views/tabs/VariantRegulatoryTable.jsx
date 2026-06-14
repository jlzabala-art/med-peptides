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

export default function VariantRegulatoryTable({ variants, parentProduct, onAction }) {
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
          <th style={thStyle}>Registration</th>
          <th style={thStyle}>COA</th>
          <th style={thStyle}>GMP</th>
          <th style={thStyle}>Stability</th>
          <th style={thStyle}>Import Permit</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((v, i) => (
          <tr key={v.id || i} style={trStyle}>
            <td style={tdStyleMain}>{v.sku || '-'}</td>
            <td style={tdStyle}>{v.supplier || '-'}</td>
            <td style={tdStyle}>
              <span
                style={badgeStyle(
                  v.registrationStatus === 'Registered' || v.registration === 'Active'
                )}
              >
                {v.registrationStatus || v.registration || 'Unregistered'}
              </span>
            </td>
            <td style={tdStyle}>
              <span style={badgeStyle(v.coa)}>{v.coa === 'Valid' ? 'Valid' : 'Missing'}</span>
            </td>
            <td style={tdStyle}>
              <span style={badgeStyle(v.gmp)}>{v.gmp === 'Valid' ? 'Valid' : 'Missing'}</span>
            </td>
            <td style={tdStyle}>
              <span style={badgeStyle(v.stability)}>
                {v.stability === 'Valid' ? 'Valid' : 'Missing'}
              </span>
            </td>
            <td style={tdStyle}>
              <span style={badgeStyle(v.permit)}>
                {v.permit === 'Active' ? 'Active' : 'Missing'}
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
