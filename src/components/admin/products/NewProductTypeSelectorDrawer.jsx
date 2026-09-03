"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlgoliaSearch } from '../../../hooks/data/useAlgoliaSearch';
import { Plus, X, Copy, Search, Box, PackageOpen } from '@/lib/icons';

/**
 * NewProductTypeSelectorDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * GCP-style sliding drawer offering 3 creation pathways:
 * 1. Clone existing variant via Live Algolia Search
 * 2. Raw Material / API
 * 3. Finished Product
 */
export default function NewProductTypeSelectorDrawer({ isOpen, onClose, isMobile, onSelectType, onCloneProduct }) {
  const [cloneQuery, setCloneQuery] = useState('');
  const [sortField, setSortField] = useState('product'); // 'product' | 'supplier'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const { hits, loading: algoliaLoading } = useAlgoliaSearch('products', cloneQuery, { hitsPerPage: 20 });
  const [inMemoryFallback, setInMemoryFallback] = useState([]);

  // Fetch local catalog items if Algolia hits are empty or during typing
  useEffect(() => {
    const q = cloneQuery.trim().toLowerCase();
    if (!q) return;
    let active = true;
    fetch('/api/catalog/summary')
      .then(r => r.json())
      .then(d => {
        if (!active) return;
        const groups = d.groups || [];
        const matches = groups.filter(g => 
          (g.name || '').toLowerCase().includes(q) || 
          (g.canonicalName || '').toLowerCase().includes(q) ||
          (g.category || '').toLowerCase().includes(q)
        ).slice(0, 20);
        setInMemoryFallback(matches);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [cloneQuery]);

  const rawResults = cloneQuery.trim()
    ? ((hits && hits.length > 0) ? hits : inMemoryFallback)
    : [];


  const handleToggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const results = [...rawResults].sort((a, b) => {
    if (sortField === 'supplier') {
      const sA = (a.supplier || a.supplierName || (Array.isArray(a.suppliers) ? a.suppliers[0]?.name : '') || '').toLowerCase();
      const sB = (b.supplier || b.supplierName || (Array.isArray(b.suppliers) ? b.suppliers[0]?.name : '') || '').toLowerCase();
      const cmp = sA.localeCompare(sB);
      if (cmp !== 0) return sortOrder === 'asc' ? cmp : -cmp;
    }
    const nA = (a.canonicalName || a.name || '').toLowerCase();
    const nB = (b.canonicalName || b.name || '').toLowerCase();
    const cmp = nA.localeCompare(nB);
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Sliding Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            style={{
              position: 'fixed',
              top: 0, 
              right: 0, 
              bottom: 0,
              height: '100vh',
              width: '100%',
              maxWidth: isMobile ? '100vw' : '520px',
              backgroundColor: '#ffffff',
              boxShadow: '-10px 0 35px rgba(0,0,0,0.18)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 54, 102, 0.08)',
                  color: 'var(--color-primary, #003666)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Create New Product</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>Choose creation mode or clone existing live catalogue</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>

              {/* 🌟 OPTION 1: Clone existing variant with Algolia */}
              <div style={{
                border: '1px solid #bae6fd',
                borderRadius: '14px',
                padding: '1.15rem',
                backgroundColor: '#f0f9ff',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '7px', backgroundColor: '#0284c7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Copy size={15} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#0369a1' }}>Option 1: Clone Existing Variant</h4>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                    ⚡ Live Algolia
                  </span>
                </div>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.78rem', color: '#0369a1', lineHeight: '1.3' }}>
                  Search live catalog to duplicate molecular formulas, HPLC purity, CAS# and dosage tiers into a new editable record.
                </p>

                {/* Algolia search input */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cloneQuery}
                    onChange={(e) => setCloneQuery(e.target.value)}
                    placeholder="Search product (e.g. Tirzepatide, BPC-157, Sermorelin)..."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.65rem 2rem 0.65rem 2.2rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #7dd3fc',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
                  {cloneQuery && (
                    <button
                      onClick={() => setCloneQuery('')}
                      style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Algolia Sortable Table View */}
                {cloneQuery.trim().length > 0 && (
                  <div style={{
                    marginTop: '0.75rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0f2fe',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                  }}>
                    {/* Sortable Header Bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#f1f5f9',
                      borderBottom: '1px solid #e2e8f0',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#475569',
                      userSelect: 'none'
                    }}>
                      {/* Product Column Header */}
                      <button
                        type="button"
                        onClick={() => handleToggleSort('product')}
                        style={{
                          flex: 1,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: 'none',
                          background: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          color: sortField === 'product' ? 'var(--color-primary, #003666)' : '#64748b',
                          textAlign: 'left'
                        }}
                      >
                        <span>PRODUCT & DETAILS</span>
                        <span style={{ fontSize: '0.7rem', color: sortField === 'product' ? '#0284c7' : '#94a3b8' }}>
                          {sortField === 'product' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>

                      {/* Supplier Column Header */}
                      <button
                        type="button"
                        onClick={() => handleToggleSort('supplier')}
                        style={{
                          width: '120px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          border: 'none',
                          background: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          color: sortField === 'supplier' ? 'var(--color-primary, #003666)' : '#64748b',
                          textAlign: 'left'
                        }}
                      >
                        <span>SUPPLIER</span>
                        <span style={{ fontSize: '0.7rem', color: sortField === 'supplier' ? '#0284c7' : '#94a3b8' }}>
                          {sortField === 'supplier' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      </button>

                      {/* Action Header */}
                      <div style={{ width: '68px', textAlign: 'right', color: '#94a3b8' }}>
                        ACTION
                      </div>
                    </div>

                    {/* Scrollable Table Body */}
                    <div style={{
                      maxHeight: '260px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {algoliaLoading ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.82rem' }}>
                          Searching Algolia index…
                        </div>
                      ) : results.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                          No matching products found for "{cloneQuery}".
                        </div>
                      ) : (
                        results.map((hit, idx) => {
                          const hName = hit.canonicalName || hit.name || 'Compound';
                          const hCat = hit.category || 'Peptides';
                          const hDosage = hit.dosage || hit.standard_dosage || hit.variants?.[0]?.dosage || '';
                          const hSupplier = hit.supplier || hit.supplierName || (Array.isArray(hit.suppliers) ? hit.suppliers[0]?.name : '') || 'Fagron / Atlas';

                          return (
                            <div
                              key={hit.id || hit.objectID || idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.55rem 0.75rem',
                                borderBottom: idx < results.length - 1 ? '1px solid #f1f5f9' : 'none',
                                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                transition: 'background 0.15s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                            >
                              {/* 1. Product & Details Column */}
                              <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                                <div style={{
                                  fontWeight: 700,
                                  fontSize: '0.86rem',
                                  color: '#0f172a',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {hName}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                                  <span style={{ fontSize: '0.67rem', color: '#475569', backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>
                                    {hCat}
                                  </span>
                                  {hDosage && (
                                    <span style={{ fontSize: '0.67rem', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                                      {hDosage}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* 2. Supplier Column */}
                              <div style={{ width: '120px', minWidth: 0, paddingRight: '0.5rem' }}>
                                <span style={{
                                  display: 'inline-block',
                                  maxWidth: '110px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: '#334155',
                                  backgroundColor: '#f1f5f9',
                                  padding: '2px 6px',
                                  borderRadius: '5px',
                                  border: '1px solid #e2e8f0'
                                }} title={hSupplier}>
                                  {hSupplier}
                                </span>
                              </div>

                              {/* 3. Action Column */}
                              <div style={{ width: '68px', textAlign: 'right', flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => onCloneProduct(hit)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.35rem 0.55rem',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    backgroundColor: '#0284c7',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  <Copy size={11} />
                                  <span>Clone</span>
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* DIVIDER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  OR CREATE FROM SCRATCH
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              </div>

              {/* 🧪 OPTION 2: Raw Material / API */}
              <button
                onClick={() => onSelectType('api_raw_material')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.15rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                <div style={{ background: '#10b98122', padding: '0.75rem', borderRadius: '10px', color: '#10b981', flexShrink: 0 }}>
                  <Box size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>Option 2: Raw Material / API</h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', backgroundColor: '#d1fae5', padding: '2px 7px', borderRadius: '5px' }}>
                      Compounding
                    </span>
                  </div>
                  <p style={{ margin: '0.3rem 0 0 0', color: '#64748b', fontSize: '0.8rem', lineHeight: '1.35' }}>
                    Bulk powder, chemical CAS specifications, purity HPLC, and active raw ingredients for compounding.
                  </p>
                </div>
              </button>

              {/* 💉 OPTION 3: Finished Product */}
              <button
                onClick={() => onSelectType('finished_product')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.15rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#f0f9ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                <div style={{ background: '#0ea5e922', padding: '0.75rem', borderRadius: '10px', color: '#0ea5e9', flexShrink: 0 }}>
                  <PackageOpen size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>Option 3: Finished Product</h4>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 7px', borderRadius: '5px' }}>
                      Prescription Ready
                    </span>
                  </div>
                  <p style={{ margin: '0.3rem 0 0 0', color: '#64748b', fontSize: '0.8rem', lineHeight: '1.35' }}>
                    Lyophilized vials, multi-dose kits, sprays ready to prescribe to clinics and patients.
                  </p>
                </div>
              </button>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
