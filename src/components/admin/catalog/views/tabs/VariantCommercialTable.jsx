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

export default function VariantCommercialTable({ variants, parentProduct, onAction }) {
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
          <th style={thStyle}>Base Cost</th>
          <th style={thStyle}>Shipping</th>
          <th style={thStyle}>Landed Cost</th>
          <th style={thStyle}>Wholesale</th>
          <th style={thStyle}>Clinic</th>
          <th style={thStyle}>MSRP</th>
          <th style={thStyle}>Margin %</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((v, i) => {
          const rawCost = v.cost || v.unitCost;
          const rawShipping = v.shippingCost || v.shipping;
          const rawWholesale = v.wholesalePrice || v.wholesale;
          const rawClinic = v.clinicPrice || v.clinic;
          const rawMsrp = v.msrp || v.price;

          const landedCost = rawCost && rawShipping ? Number(rawCost) + Number(rawShipping) : null;
          const margin =
            rawMsrp && rawCost ? (((rawMsrp - rawCost) / rawMsrp) * 100).toFixed(0) : null;
          return (
            <tr key={v.id || i} style={trStyle}>
              <td style={tdStyleMain}>{v.sku || '-'}</td>
              <td style={tdStyle}>{v.supplier || '-'}</td>
              <td style={tdStyle}>{rawCost ? `$${rawCost}` : '-'}</td>
              <td style={tdStyle}>{rawShipping ? `$${rawShipping}` : '-'}</td>
              <td style={tdStyle}>
                <b>{landedCost ? `$${landedCost.toFixed(2)}` : '-'}</b>
              </td>
              <td style={tdStyle}>{rawWholesale ? `$${rawWholesale}` : '-'}</td>
              <td style={tdStyle}>{rawClinic ? `$${rawClinic}` : '-'}</td>
              <td style={tdStyle}>
                <b>{rawMsrp ? `$${rawMsrp}` : '-'}</b>
              </td>
              <td style={tdStyle}>
                <span style={{ color: margin > 50 ? '#10b981' : margin ? '#f59e0b' : 'inherit' }}>
                  {margin ? `${margin}%` : '-'}
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
          );
        })}
      </tbody>
    </table>
  );
}
