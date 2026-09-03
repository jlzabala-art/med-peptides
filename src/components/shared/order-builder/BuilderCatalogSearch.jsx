"use client";

import React, { useState, useMemo } from 'react';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import Search from "lucide-react/dist/esm/icons/search";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Plus from "lucide-react/dist/esm/icons/plus";
import { Pill, ArrowUpDown, ArrowUp, ArrowDown, Building2, Tag } from 'lucide-react';
import { normalizeProductMeta } from '../../../utils/productNormalizer';

export default function BuilderCatalogSearch({ onAdd }) {
  const [q, setQ] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Search trigger (at least 2 chars)
  const searchQuery = q.length >= 2 ? q : '';
  const { hits, loading } = useAlgoliaSearch('products', searchQuery, { hitsPerPage: 35 });

  // Normalize all hits
  const normalizedHits = useMemo(() => {
    return hits.map(hit => ({
      raw: hit,
      meta: normalizeProductMeta(hit)
    }));
  }, [hits]);

  // Extract unique categories for quick filtering
  const categories = useMemo(() => {
    const set = new Set();
    normalizedHits.forEach(item => {
      if (item.meta.category) set.add(item.meta.category);
    });
    return Array.from(set);
  }, [normalizedHits]);

  // Filter and sort items
  const processedHits = useMemo(() => {
    let result = [...normalizedHits];

    // Filter by Category if selected
    if (selectedCategoryFilter !== 'all') {
      result = result.filter(item => item.meta.category === selectedCategoryFilter);
    }

    // Sort items
    result.sort((a, b) => {
      let valA = a.meta[sortField] || '';
      let valB = b.meta[sortField] || '';

      if (sortField === 'dosage') {
        // Numeric dosage sort (e.g. 5mg < 10mg < 60mg)
        const numA = parseFloat(valA.replace(/[^0-9.]/g, '')) || 0;
        const numB = parseFloat(valB.replace(/[^0-9.]/g, '')) || 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [normalizedHits, selectedCategoryFilter, sortField, sortDirection]);

  // Toggle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.35 }} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} color="var(--color-primary, #003666)" />
    ) : (
      <ArrowDown size={12} color="var(--color-primary, #003666)" />
    );
  };

  const handleAdd = (item) => {
    const { meta, raw } = item;
    const itemId = raw.objectID || raw.id;

    onAdd({
      type: raw.type || 'product',
      id: itemId,
      productId: itemId,
      name: meta.name,
      productName: meta.name,
      sku: meta.sku,
      dosage: meta.dosage,
      presentation: meta.presentation,
      category: meta.category,
      supplier: meta.supplier,
      imageUrl: raw.imageUrl || raw.image || '',
      quantity: 1,
      unit: meta.presentation?.toLowerCase().includes('pen') ? 'pens' : 'vials',
      notes: '',
      prices: raw.prices || {},
      price: raw.price || 0
    });
    setQ('');
  };

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      
      {/* Search Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          border: '1px solid var(--border, #cbd5e1)',
          borderRadius: '8px',
          padding: '0.6rem 0.85rem',
          background: 'var(--color-bg-surface, #ffffff)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        {loading ? (
          <Loader2
            size={16}
            color="var(--color-text-tertiary, #94a3b8)"
            style={{ animation: 'adminSpin 1s linear infinite' }}
          />
        ) : (
          <Search size={16} color="var(--color-text-tertiary, #94a3b8)" />
        )}
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSelectedCategoryFilter('all');
          }}
          placeholder="Search catalog products by name, dosage, presentation, category or supplier (e.g. Tirzepatide, BPC-157)..."
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            outline: 'none',
            fontSize: '0.85rem',
            color: 'var(--color-text-primary, #0f172a)',
            fontFamily: 'inherit',
          }}
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: '#94a3b8',
              padding: '2px 6px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Category Filter Pills */}
      {categories.length > 1 && q.length >= 2 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', padding: '0 2px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginRight: '2px' }}>
            Filter Category:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            style={{
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.72rem',
              fontWeight: 600,
              border: selectedCategoryFilter === 'all' ? '1px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
              background: selectedCategoryFilter === 'all' ? 'var(--color-primary-light, #eff6ff)' : '#ffffff',
              color: selectedCategoryFilter === 'all' ? 'var(--color-primary, #003666)' : '#64748b',
              cursor: 'pointer'
            }}
          >
            All ({normalizedHits.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat)}
              style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 600,
                border: selectedCategoryFilter === cat ? '1px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
                background: selectedCategoryFilter === cat ? 'var(--color-primary-light, #eff6ff)' : '#ffffff',
                color: selectedCategoryFilter === cat ? 'var(--color-primary, #003666)' : '#64748b',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Tabular Search Results Dropdown */}
      {processedHits.length > 0 && q.length >= 2 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 14px 28px -4px rgba(0, 0, 0, 0.12), 0 6px 12px -2px rgba(0, 0, 0, 0.05)',
            maxHeight: '380px',
            overflowY: 'auto',
          }}
        >
          {/* Table Header (No ID/SKU column) */}
          <div style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: '#f8fafc',
            borderBottom: '2px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: '2.6fr 1.5fr 1.6fr 1.5fr 1.4fr 0.9fr',
            padding: '0.6rem 0.9rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div
              onClick={() => handleSort('name')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              Product {renderSortIcon('name')}
            </div>

            <div
              onClick={() => handleSort('dosage')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              Dosage {renderSortIcon('dosage')}
            </div>

            <div
              onClick={() => handleSort('presentation')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              Presentation {renderSortIcon('presentation')}
            </div>

            <div
              onClick={() => handleSort('category')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              Category {renderSortIcon('category')}
            </div>

            <div
              onClick={() => handleSort('supplier')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              Supplier {renderSortIcon('supplier')}
            </div>

            <div style={{ textAlign: 'right' }}>
              Action
            </div>
          </div>

          {/* Table Rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {processedHits.map((item) => {
              const { meta, raw } = item;

              return (
                <div
                  key={raw.objectID || raw.id}
                  onClick={() => handleAdd(item)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.6fr 1.5fr 1.6fr 1.5fr 1.4fr 0.9fr',
                    padding: '0.65rem 0.9rem',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.82rem',
                    color: '#1e293b',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Product Name Column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6, background: '#eff6ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0
                    }}>
                      <Pill size={14} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {meta.name}
                      </span>
                      {raw.stock_level !== undefined && (
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: raw.stock_level > 0 ? '#f0fdf4' : '#fef2f2',
                          color: raw.stock_level > 0 ? '#16a34a' : '#dc2626',
                          border: `1px solid ${raw.stock_level > 0 ? '#bbf7d0' : '#fecaca'}`,
                          flexShrink: 0
                        }}>
                          {raw.stock_level > 0 ? `${raw.stock_level} in stock` : 'Out of stock'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dosage Column */}
                  <div>
                    {meta.dosage ? (
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}>
                        {meta.dosage}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Standard</span>
                    )}
                  </div>

                  {/* Presentation Column */}
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#f1f5f9',
                      color: '#475569',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      {meta.presentation}
                    </span>
                  </div>

                  {/* Category Column */}
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#0d9488',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <Tag size={11} /> {meta.category}
                    </span>
                  </div>

                  {/* Supplier Column (Always populated) */}
                  <div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#4338ca',
                      background: '#eef2ff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Building2 size={11} /> {meta.supplier}
                    </span>
                  </div>

                  {/* Action Column */}
                  <div style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(item);
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        background: 'var(--color-primary, #003666)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'opacity 0.15s'
                      }}
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
