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

export default function ExpandedProductRow({ row, onAction }) {
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
      {activeTab === 'overview' && (
        <VariantOverviewTable variants={row.variants} parentProduct={row} onAction={onAction} />
      )}
      {activeTab === 'commercial' && (
        <VariantCommercialTable variants={row.variants} parentProduct={row} onAction={onAction} />
      )}
      {activeTab === 'inventory' && (
        <VariantInventoryTable variants={row.variants} parentProduct={row} onAction={onAction} />
      )}
      {activeTab === 'regulatory' && (
        <VariantRegulatoryTable variants={row.variants} parentProduct={row} onAction={onAction} />
      )}
      {activeTab === 'analytics' && (
        <VariantAnalyticsTable variants={row.variants} parentProduct={row} onAction={onAction} />
      )}
    </div>
  );
}
