import React, { useState } from 'react';
import Box from 'lucide-react/dist/esm/icons/box';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import BarChart2 from 'lucide-react/dist/esm/icons/bar-chart-2';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import PackageOpen from 'lucide-react/dist/esm/icons/package-open';
import { calculateVariantHealthScore } from '../useVariantHealthScore';

export default function ExpandedProductRow({ row }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!row.variants || row.variants.length === 0) {
    return (
      <div
        style={{
          padding: '16px',
          color: 'var(--text-muted)',
          fontSize: '0.85rem',
          textAlign: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
        }}
      >
        No variants defined for this product.
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'commercial', label: 'Commercial', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: PackageOpen },
    { id: 'regulatory', label: 'Regulatory', icon: ShieldCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  const renderTableHead = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <tr>
            <th style={thStyle}>SKU</th>
            <th style={thStyle}>Supplier</th>
            <th style={thStyle}>Format / Size</th>
            <th style={thStyle}>Health Score</th>
            <th style={thStyle}>Inventory</th>
            <th style={thStyle}>Reg. Status</th>
          </tr>
        );
      case 'commercial':
        return (
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
          </tr>
        );
      case 'inventory':
        return (
          <tr>
            <th style={thStyle}>SKU</th>
            <th style={thStyle}>Stock</th>
            <th style={thStyle}>Reorder Point</th>
            <th style={thStyle}>MOQ</th>
            <th style={thStyle}>Lead Time</th>
            <th style={thStyle}>Velocity</th>
          </tr>
        );
      case 'regulatory':
        return (
          <tr>
            <th style={thStyle}>SKU</th>
            <th style={thStyle}>Supplier</th>
            <th style={thStyle}>Registration</th>
            <th style={thStyle}>COA</th>
            <th style={thStyle}>GMP</th>
            <th style={thStyle}>Stability</th>
            <th style={thStyle}>Import Permit</th>
          </tr>
        );
      case 'analytics':
        return (
          <tr>
            <th style={thStyle}>SKU</th>
            <th style={thStyle}>Sales</th>
            <th style={thStyle}>Revenue</th>
            <th style={thStyle}>Orders</th>
            <th style={thStyle}>Avg Order Value</th>
            <th style={thStyle}>Velocity</th>
            <th style={thStyle}>Forecast</th>
          </tr>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (v, i) => {
    const health = calculateVariantHealthScore(v);

    switch (activeTab) {
      case 'overview':
        return (
          <tr key={i} style={trStyle}>
            <td style={tdStyleMain}>{v.sku || '-'}</td>
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
          </tr>
        );
      case 'commercial': {
        const landedCost =
          v.cost && v.shippingCost ? Number(v.cost) + Number(v.shippingCost) : null;
        const margin = v.msrp && v.cost ? (((v.msrp - v.cost) / v.msrp) * 100).toFixed(0) : null;
        return (
          <tr key={i} style={trStyle}>
            <td style={tdStyleMain}>{v.sku || '-'}</td>
            <td style={tdStyle}>{v.supplier || '-'}</td>
            <td style={tdStyle}>{v.cost ? `$${v.cost}` : '-'}</td>
            <td style={tdStyle}>{v.shippingCost ? `$${v.shippingCost}` : '-'}</td>
            <td style={tdStyle}>
              <b>{landedCost ? `$${landedCost.toFixed(2)}` : '-'}</b>
            </td>
            <td style={tdStyle}>{v.wholesalePrice ? `$${v.wholesalePrice}` : '-'}</td>
            <td style={tdStyle}>{v.clinicPrice ? `$${v.clinicPrice}` : '-'}</td>
            <td style={tdStyle}>
              <b>{v.msrp ? `$${v.msrp}` : '-'}</b>
            </td>
            <td style={tdStyle}>
              <span style={{ color: margin > 50 ? '#10b981' : margin ? '#f59e0b' : 'inherit' }}>
                {margin ? `${margin}%` : '-'}
              </span>
            </td>
          </tr>
        );
      }
      case 'inventory':
        return (
          <tr key={i} style={trStyle}>
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
          </tr>
        );
      case 'regulatory':
        return (
          <tr key={i} style={trStyle}>
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
          </tr>
        );
      case 'analytics':
        return (
          <tr key={i} style={trStyle}>
            <td colSpan={7} style={{ ...tdStyle, textAlign: 'center', padding: '24px' }}>
              Analytics data for {v.sku || v.format || 'variant'} coming soon
            </td>
          </tr>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'inset 0 4px 6px -4px rgba(0,0,0,0.05)',
      }}
    >
      {/* Sub-Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nested Variant Table */}
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
        <thead>{renderTableHead()}</thead>
        <tbody>{row.variants.map((v, i) => renderTableRow(v, i))}</tbody>
      </table>
    </div>
  );
}

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
