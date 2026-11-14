"use client";

import React, { useState, useMemo } from 'react';
import { useSupplierProducts } from '@/hooks/data/useSupplierProducts';
import { Package, Plus, DollarSign, CheckCircle2, Layers } from '@/lib/icons';
import DataModule from '@/components/ui/DataModule';
import MetricCard from '@/components/ui/MetricCard';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';

export default function SupplierCatalogTab() {
  const { products, loading, error, hasMore, loadMore } = useSupplierProducts({ pageSize: 20 });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  const kpiStats = useMemo(() => {
    const total = products.length;
    const withPrice = products.filter((p) => Number(p.basePrice) > 0).length;
    const avgPrice =
      withPrice > 0
        ? products.reduce((acc, p) => acc + (Number(p.basePrice) || 0), 0) / withPrice
        : 0;
    const categories = new Set(products.map((p) => p.category).filter(Boolean)).size;
    return { total, withPrice, avgPrice, categories };
  }, [products]);

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      width: '18%',
      render: (p) => <CopyableId value={p.sku || p.id} displayValue={p.sku || 'NO SKU'} />,
    },
    {
      key: 'name',
      header: 'Product / API',
      width: '36%',
      render: (p) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
            {p.description || 'No description provided.'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '16%',
      render: (p) => <StatusBadge status={p.status || 'published'} />,
    },
    {
      key: 'basePrice',
      header: 'Base Price',
      width: '15%',
      align: 'right',
      render: (p) => (
        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
          ${p.basePrice ? Number(p.basePrice).toFixed(2) : '0.00'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '15%',
      align: 'right',
      render: () => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="gcp-btn-secondary"
            style={{ minHeight: '36px', padding: '0 12px', fontSize: '0.8rem', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataModule
      title="Mass Catalog"
      subtitle="Manage your manufactured products and APIs available for Wholesalers."
      icon={Package}
      panel="supplier"
      namespace="supplier_catalog"
      primaryAction={{
        label: 'Add Product',
        icon: Plus,
        onClick: () => {},
      }}
      searchPlaceholder="Search by product name or SKU..."
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      resultCount={filteredProducts.length}
      totalCount={products.length}
      onClearAllFilters={() => setSearchTerm('')}
      kpis={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <MetricCard title="Loaded SKUs" value={kpiStats.total} subtitle="Catalog items" icon={Package} color="#2563eb" />
          <MetricCard title="Priced Items" value={kpiStats.withPrice} subtitle="Active pricing" icon={CheckCircle2} color="#16a34a" />
          <MetricCard title="Avg Base Price" value={`$${kpiStats.avgPrice.toFixed(2)}`} subtitle="Across priced items" icon={DollarSign} color="#0f172a" />
          <MetricCard title="Categories" value={kpiStats.categories} subtitle="Product lines" icon={Layers} color="#8b5cf6" />
        </div>
      }
      data={filteredProducts}
      columns={columns}
      loading={loading && products.length === 0}
      hasMore={hasMore}
      onLoadMore={loadMore}
      isFetchingMore={loading && products.length > 0}
      emptyState={{
        icon: Package,
        title: searchTerm ? 'No products match your search' : 'Your catalog is empty',
        subtitle: error || 'Add a product to make it available for institutional wholesalers.',
      }}
    />
  );
}
