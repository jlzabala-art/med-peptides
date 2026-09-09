"use client";

import React, { useState, useEffect } from 'react';
import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import Check from "lucide-react/dist/esm/icons/check";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import { getActiveProducts } from '../../../repositories/productRepository';
import EmptyState from '../../ui/EmptyState';

export default function ProductMatchingCenter({ rxItems = [] }) {
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      try {
        const prods = await getActiveProducts();
        if (isMounted) setCatalogProducts(prods || []);
      } catch (err) {
        console.error('Error fetching catalog in ProductMatchingCenter:', err);
        if (isMounted) setCatalogProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  const matches = React.useMemo(() => {
    // If specific prescription items are provided, match them
    if (rxItems && rxItems.length > 0) {
      return rxItems.map((item, idx) => {
        const name = item.name || item.productName || item;
        const matched = catalogProducts.find(p => 
          p.name?.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(p.name?.toLowerCase())
        );
        const stock = matched ? (matched.stock ?? matched.quantity ?? 10) : 0;
        return {
          id: idx,
          rxName: name,
          atlasName: matched ? matched.name : null,
          status: matched ? (stock > 5 ? 'available' : 'low_stock') : 'unavailable',
          stock,
          alternatives: !matched ? catalogProducts.slice(0, 2).map(p => p.name) : []
        };
      });
    }

    // Default to comparing the first active catalog products
    return catalogProducts.slice(0, 5).map(prod => {
      const stock = prod.stock ?? prod.quantity ?? 10;
      return {
        id: prod.id,
        rxName: prod.name,
        atlasName: prod.name,
        status: stock > 5 ? 'available' : (stock > 0 ? 'low_stock' : 'unavailable'),
        stock,
        alternatives: []
      };
    });
  }, [rxItems, catalogProducts]);

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e2e8f0', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        background: '#f8fafc'
      }}>
        <PackageSearch size={18} color="#0071bd" />
        <span style={{ fontWeight: 600, color: '#0f172a' }}>Product Matching Center</span>
      </div>

      <div style={{ padding: '0' }}>
        {loading ? (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="skeleton" style={{ height: '40px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ height: '40px', borderRadius: '6px' }} />
          </div>
        ) : matches.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products to match"
            subtitle="Enter prescription items or activate products in the catalog to begin matching."
          />
        ) : (
          matches.map((match, idx) => (
            <div key={match.id || idx} style={{
              padding: '16px',
              borderBottom: idx < matches.length - 1 ? '1px solid #e2e8f0' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>Rx: {match.rxName}</span>
                {match.status === 'available' && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14}/> Available</span>}
                {match.status === 'low_stock' && <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>Low Stock</span>}
                {match.status === 'unavailable' && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14}/> Unavailable</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <ArrowRight size={16} color="#64748b" />
                {match.atlasName ? (
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a' }}>{match.atlasName}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Stock: {match.stock}</span>
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>No exact match found</span>
                    {match.alternatives && match.alternatives.length > 0 && (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Suggested Alternatives:</span>
                        {match.alternatives.map(alt => (
                          <div key={alt} style={{ fontSize: '13px', color: '#0071bd', fontWeight: 500, cursor: 'pointer' }}>+ {alt}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}