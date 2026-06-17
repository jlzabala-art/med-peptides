import React, { useState } from 'react';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import BarChart2 from 'lucide-react/dist/esm/icons/bar-chart-2';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import PackageOpen from 'lucide-react/dist/esm/icons/package-open';

import VariantOverviewTable from './tabs/VariantOverviewTable';
import VariantCommercialTable from './tabs/VariantCommercialTable';
import VariantInventoryTable from './tabs/VariantInventoryTable';
import VariantRegulatoryTable from './tabs/VariantRegulatoryTable';
import VariantAnalyticsTable from './tabs/VariantAnalyticsTable';

export default function ExpandedProductRow({ row, onAction, selectedIds = [], onSelectionChange }) {
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

  return (
    <div
      style={{
        padding: '24px 32px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Product Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
            {row.name || row.displayName}
          </h3>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.85rem', color: '#64748b' }}>
            <span style={{ fontFamily: 'monospace' }}>SKU: {row.sku || '-'}</span>
            <span>{row.variants?.length || 0} Variants</span>
            {row.healthScore && (
              <span style={{ color: row.healthScore >= 80 ? '#10b981' : row.healthScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                Health: {row.healthScore}%
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Sub-Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginBottom: '24px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0 0 12px 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: activeTab === tab.id ? '#0f172a' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #0f172a' : '2px solid transparent',
              transition: 'all 0.2s',
              position: 'relative',
              top: '1px',
            }}
          >
            <tab.icon size={16} color={activeTab === tab.id ? '#0f172a' : '#94a3b8'} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nested Variant Table */}
      {activeTab === 'overview' && (
        <VariantOverviewTable variants={row.variants} parentProduct={row} onAction={onAction} selectedIds={selectedIds} onSelectionChange={onSelectionChange} />
      )}
      {activeTab === 'commercial' && (
        <VariantCommercialTable variants={row.variants} parentProduct={row} onAction={onAction} selectedIds={selectedIds} onSelectionChange={onSelectionChange} />
      )}
      {activeTab === 'inventory' && (
        <VariantInventoryTable variants={row.variants} parentProduct={row} onAction={onAction} selectedIds={selectedIds} onSelectionChange={onSelectionChange} />
      )}
      {activeTab === 'regulatory' && (
        <VariantRegulatoryTable variants={row.variants} parentProduct={row} onAction={onAction} selectedIds={selectedIds} onSelectionChange={onSelectionChange} />
      )}
      {activeTab === 'analytics' && (
        <VariantAnalyticsTable variants={row.variants} parentProduct={row} onAction={onAction} selectedIds={selectedIds} onSelectionChange={onSelectionChange} />
      )}
    </div>
  );
}
