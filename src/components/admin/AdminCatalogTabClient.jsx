"use client";

import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import { Package, Tag, Crosshair } from 'lucide-react';
import ProductsTable from '../../features/products/components/ProductsTable';
import AdminPricesTabClient from './AdminPricesTabClient';
import AdminCompetitorsTab from './AdminCompetitorsTab';

export default function AdminCatalogTabClient({ initialProducts, globalMetrics, readOnly = false }) {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      <PageHeader
        title="Master Catalog Hub"
        subtitle="Manage products, control pricing visibility, and track competitor benchmarks."
        icon={Package}
      />

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem',
        padding: '0 0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'products' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'products' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'products' ? 700 : 500,
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Package size={16} /> Products
        </button>
        <button
          onClick={() => setActiveTab('prices')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'prices' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'prices' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'prices' ? 700 : 500,
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Tag size={16} /> Pricing Visibility
        </button>
        <button
          onClick={() => setActiveTab('competitors')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'competitors' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'competitors' ? 'var(--color-primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'competitors' ? 700 : 500,
            padding: '0.75rem 1rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Crosshair size={16} /> Competitors
        </button>
      </div>

      <div style={{ padding: '0 0.5rem' }}>
        {/* We use display: block/none to keep state of ProductsTable (search, filters, etc) */}
        <div style={{ display: activeTab === 'products' ? 'block' : 'none' }}>
          <ProductsTable 
            role="admin"
            initialProducts={initialProducts}
            globalMetrics={globalMetrics}
            readOnly={readOnly}
            isSubTab={true}
          />
        </div>
        <div style={{ display: activeTab === 'prices' ? 'block' : 'none' }}>
          <AdminPricesTabClient isSubTab={true} />
        </div>
        <div style={{ display: activeTab === 'competitors' ? 'block' : 'none' }}>
          <AdminCompetitorsTab isSubTab={true} />
        </div>
      </div>
    </div>
  );
}
