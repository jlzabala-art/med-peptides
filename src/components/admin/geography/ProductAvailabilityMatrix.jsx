"use client";

import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import DataTable from '../../ui/DataTable';
import { Check, X } from 'lucide-react';
import { useGlobalData } from '../../../hooks/useGlobalData';

export default function ProductAvailabilityMatrix({ markets, products }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products
  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // We only want to show operational or pending markets as columns to avoid clutter
  const relevantMarkets = markets.filter(m => m.status === 'Operational' || m.status === 'Pending' || m.status === 'Opportunity');

  const isAvailable = (product, marketName) => {
    if (!product) return false;
    // Check if the market is explicitly mentioned in the product's availability/countries array
    const hasMarket = (product.availability && product.availability.includes(marketName)) || 
                      (product.countries && product.countries.includes(marketName));
    return hasMarket;
  };

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Product Availability Matrix</h3>
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="gcp-input"
          style={{ maxWidth: '300px' }}
        />
      </div>

      <div className="gcp-table-container">
        <DataTable
          columns={[
            {
              key: 'product',
              header: 'Product',
              render: (val, p) => <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</span>
            },
            ...relevantMarkets.map(m => ({
              key: m.id,
              header: (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{m.flag || '🏳️'}</span>
                  <span>{m.name}</span>
                </div>
              ),
              render: (val, p) => isAvailable(p, m.name) ? (
                <Check size={20} color="var(--color-success)" style={{ margin: '0 auto' }} />
              ) : (
                <X size={20} color="var(--border)" style={{ margin: '0 auto' }} />
              )
            }))
          ]}
          data={filteredProducts}
          keyField="id"
          emptyMessage="No products found."
        />
      </div>
    </Card>
  );
}