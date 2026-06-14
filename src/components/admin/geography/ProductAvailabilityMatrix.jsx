import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";
import React, { useState } from 'react';
import { Card } from '../../ui';



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

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '800px' }}>
          <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-bg-surface)', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', borderRight: '1px solid var(--border)', minWidth: '200px', color: 'var(--text-main)' }}>Product</th>
              {relevantMarkets.map(m => (
                <th key={m.id} style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{m.flag || '🏳️'}</span>
                    <span>{m.name}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-bg-surface)' }}>
                <td style={{ padding: '1rem', textAlign: 'left', borderRight: '1px solid var(--border)', fontWeight: 600, color: 'var(--text-main)' }}>
                  {p.name}
                </td>
                {relevantMarkets.map(m => {
                  const available = isAvailable(p, m.name);
                  return (
                    <td key={m.id} style={{ padding: '1rem' }}>
                      {available ? (
                        <Check size={20} color="var(--color-success)" style={{ margin: '0 auto' }} />
                      ) : (
                        <X size={20} color="var(--border)" style={{ margin: '0 auto' }} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={relevantMarkets.length + 1} style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}