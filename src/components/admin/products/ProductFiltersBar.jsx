import React from 'react';
import { Package, Truck, Filter, MapPin, Activity } from '@/lib/icons';
import { useAlgoliaFacets } from '../../../hooks/data/useAlgoliaSearch';

export default function ProductFiltersBar({
  filterCategory,
  setFilterCategory,
  filterSupplier,
  setFilterSupplier,
  filterStatus,
  setFilterStatus,
  filterWarehouse,
  setFilterWarehouse
}) {
  // Dynamically load categories from Algolia
  const { facets, loading: facetsLoading } = useAlgoliaFacets('products', ['category', 'supplier', 'warehouse']);
  const availableCategories = facets.category || [];
  const availableSuppliers = facets.supplier || [];
  const availableWarehouses = facets.warehouse || [];

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      padding: '0.75rem 1rem', 
      borderBottom: '1px solid var(--border)',
      backgroundColor: '#1e293b',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', paddingRight: '1rem', borderRight: '1px solid var(--border)' }}>
        <Filter size={16} /> Filters
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Package size={14} color="var(--text-muted)" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ height: '32px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '0 0.75rem', fontSize: '0.8rem', background: '#0f172a', cursor: 'pointer', color: 'var(--text-main)' }}
          >
            <option value="All">All Categories</option>
            {facetsLoading && <option value="" disabled>Loading...</option>}
            {availableCategories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Truck size={14} color="var(--text-muted)" />
          <select
            value={filterSupplier}
            onChange={e => setFilterSupplier(e.target.value)}
            style={{ height: '32px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '0 0.75rem', fontSize: '0.8rem', background: '#0f172a', cursor: 'pointer', color: 'var(--text-main)' }}
          >
            <option value="All">All Suppliers</option>
            {facetsLoading && <option value="" disabled>Loading...</option>}
            {availableSuppliers.map(sup => (
              <option key={sup.name} value={sup.name}>{sup.name} ({sup.count})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={14} color="var(--text-muted)" />
          <select
            value={filterWarehouse}
            onChange={e => setFilterWarehouse(e.target.value)}
            style={{ height: '32px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '0 0.75rem', fontSize: '0.8rem', background: '#0f172a', cursor: 'pointer', color: 'var(--text-main)' }}
          >
            <option value="All">All Warehouses</option>
            {facetsLoading && <option value="" disabled>Loading...</option>}
            {availableWarehouses.map(wh => (
              <option key={wh.name} value={wh.name}>{wh.name} ({wh.count})</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Activity size={14} color="var(--text-muted)" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ height: '32px', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '0 0.75rem', fontSize: '0.8rem', background: '#0f172a', cursor: 'pointer', color: 'var(--text-main)' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}
