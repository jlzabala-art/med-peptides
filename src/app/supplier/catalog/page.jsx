"use client";

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSupplierProducts } from '../../../hooks/data/useSupplierProducts';

import Image from "next/image";
import { Package, Plus } from '@/lib/icons';

export default function SupplierCatalogPage() {
  const { userProfile } = useAuth();
  const { products, loading, error, hasMore, loadMore } = useSupplierProducts({ pageSize: 20 });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
            <Package size={32} /> Mass Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your manufactured products and APIs available for Wholesalers.</p>
        </div>
        <button 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', padding: '1.5rem' }}>
        
        {/* Search / Filters */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '1rem'
            }}
          />
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        
        {loading && products.length === 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: 16 }} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {searchTerm ? "No products match your search." : "Your catalog is empty. Add a product to get started."}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {filteredProducts.map(product => (
                <div key={product.id} style={{
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  background: 'white',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ height: '180px', background: 'var(--bg-app)', position: 'relative' }}>
                    {product.imageUrls?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={product.imageUrls[0]} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                        <Package size={48} opacity={0.2} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.25rem' }}>
                      {product.sku || 'NO SKU'}
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {product.name}
                    </h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description || 'No description provided.'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)' }}>
                        ${product.basePrice?.toFixed(2) || '0.00'}
                      </div>
                      <button style={{
                        background: 'transparent',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button 
                  onClick={loadMore} 
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: loading ? 'wait' : 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {loading ? 'Loading...' : 'Load More Products'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
