"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FlaskConical, Dna, ShieldCheck, ArrowRight, CornerDownLeft, Sparkles, Building2, Check, Tag } from 'lucide-react';
import { searchAlgolia } from '@/services/algoliaSearch';
import { getAllProducts } from '@/repositories/productRepository';
import { triggerHaptic } from '@/utils/haptics';

export default function DatasheetQuickSearchModal({
  isOpen,
  onClose,
  currentSupplier = 'Lotusland',
  currentSlug = '',
  lang = 'en'
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filterOnlyCurrentSupplier, setFilterOnlyCurrentSupplier] = useState(Boolean(currentSupplier));
  const [initialCatalog, setInitialCatalog] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const isSpanish = lang === 'es';

  // Normalize supplier string for matching (e.g., "lotusland", "lotus land")
  const cleanCurrentSupplier = useMemo(() => {
    return (currentSupplier || '').toLowerCase().replace(/[\s-_]/g, '');
  }, [currentSupplier]);

  // Load initial fallback catalog from local cache repository
  useEffect(() => {
    let isMounted = true;
    getAllProducts({ limit: 40 })
      .then((prods) => {
        if (isMounted && Array.isArray(prods)) {
          setInitialCatalog(prods);
        }
      })
      .catch((err) => {
        console.warn('[DatasheetQuickSearchModal] Preload catalog warning:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const performSearch = useCallback(async (queryText) => {
    setLoading(true);
    try {
      const term = (queryText || '').trim();
      let rawProducts = [];

      if (term.length >= 2) {
        // 1. Instant Algolia search (sub-10ms)
        const algoliaRes = await searchAlgolia(term, { hitsPerPage: 30 });
        if (algoliaRes?.products && algoliaRes.products.length > 0) {
          rawProducts = algoliaRes.products;
        }
      }

      // 2. Fallback or merge with cached repository if Algolia yielded 0
      if (rawProducts.length === 0) {
        const lower = term.toLowerCase();
        if (term.length > 0) {
          rawProducts = initialCatalog.filter((p) => {
            const name = (p.name || p.canonicalName || p.displayName || '').toLowerCase();
            const category = (p.category || '').toLowerCase();
            const target = (p.targetReceptorAxis || p.indication || '').toLowerCase();
            const supplier = (p.supplierName || p.sourceSupplier || p.supplier || '').toLowerCase();
            return name.includes(lower) || category.includes(lower) || target.includes(lower) || supplier.includes(lower);
          });
        } else {
          rawProducts = initialCatalog;
        }
      }

      // Filter by supplier if toggle is enabled and currentSupplier exists
      let finalResults = rawProducts;
      if (filterOnlyCurrentSupplier && cleanCurrentSupplier) {
        const filtered = rawProducts.filter((p) => {
          const sup = (p.supplierName || p.sourceSupplier || p.supplier || '').toLowerCase().replace(/[\s-_]/g, '');
          return sup.includes(cleanCurrentSupplier) || cleanCurrentSupplier.includes(sup);
        });
        // If supplier filter matched items, use them; otherwise keep all to avoid blank results
        if (filtered.length > 0) {
          finalResults = filtered;
        }
      }

      // Deduplicate by slug / id
      const seen = new Set();
      const unique = [];
      for (const item of finalResults) {
        const key = item.slug || item.id || item.name;
        if (key && !seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      }

      setResults(unique.slice(0, 20));
      setSelectedIndex(0);
    } catch (err) {
      console.warn('[DatasheetQuickSearchModal] Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [cleanCurrentSupplier, filterOnlyCurrentSupplier, initialCatalog]);

  // Open & Focus Management
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      performSearch('');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, performSearch]);

  // Re-run search when supplier toggle changes
  useEffect(() => {
    if (isOpen) {
      performSearch(searchTerm);
    }
  }, [filterOnlyCurrentSupplier, isOpen, performSearch, searchTerm]);

  // Keyboard Navigation: Esc, ArrowUp, ArrowDown, Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectProduct(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelectProduct = (product) => {
    triggerHaptic('selection');
    const targetSlug = product.slug || product.id;
    if (targetSlug) {
      onClose();
      router.push(`/p/${encodeURIComponent(targetSlug)}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '1.25rem 1rem',
        paddingTop: 'clamp(2rem, 8vh, 5rem)',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 54, 102, 0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '82vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#f8fafc'
        }}>
          <Search size={18} style={{ color: '#003666', flexShrink: 0 }} />
          
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              const val = e.target.value;
              setSearchTerm(val);
              performSearch(val);
            }}
            placeholder={
              currentSupplier
                ? (isSpanish ? `Buscar péptidos en catálogo ${currentSupplier}... (ej. BPC-157, Tirzepatide)` : `Search ${currentSupplier} peptide datasheets... (e.g. BPC-157, Tirzepatide)`)
                : (isSpanish ? 'Buscar ficha técnica de péptido...' : 'Search peptide datasheets...')
            }
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.94rem',
              fontWeight: 600,
              color: '#0f172a'
            }}
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                performSearch('');
                inputRef.current?.focus();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          )}

          <div style={{
            fontSize: '0.70rem',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            background: '#e2e8f0',
            color: '#64748b'
          }}>
            ESC
          </div>
        </div>

        {/* Filter / Scope Toolbar */}
        {currentSupplier && (
          <div style={{
            padding: '8px 16px',
            background: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={13} style={{ color: '#003666' }} />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
                {isSpanish ? 'Proveedor activo:' : 'Active catalog:'}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#003666',
                background: '#e0f2fe',
                padding: '1px 7px',
                borderRadius: '9999px',
                border: '1px solid #bae6fd'
              }}>
                {currentSupplier}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setFilterOnlyCurrentSupplier((v) => !v)}
              style={{
                background: filterOnlyCurrentSupplier ? '#003666' : '#ffffff',
                color: filterOnlyCurrentSupplier ? '#ffffff' : '#475569',
                border: `1px solid ${filterOnlyCurrentSupplier ? '#003666' : '#cbd5e1'}`,
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              {filterOnlyCurrentSupplier && <Check size={12} />}
              <span>{isSpanish ? `Solo ${currentSupplier}` : `Only ${currentSupplier}`}</span>
            </button>
          </div>
        )}

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {loading ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{
                display: 'inline-block',
                width: '24px',
                height: '24px',
                border: '2px solid #e2e8f0',
                borderTopColor: '#003666',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                marginBottom: '8px'
              }} />
              <div style={{ fontSize: '0.80rem', fontWeight: 600 }}>
                {isSpanish ? 'Consultando índice científico...' : 'Searching clinical monographs...'}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <FlaskConical size={28} style={{ color: '#94a3b8', margin: '0 auto 8px', display: 'block' }} />
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                {isSpanish ? 'No se encontraron péptidos' : 'No matching peptides found'}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {isSpanish ? 'Prueba con otro nombre como BPC-157, Tirzepatide, NAD+ o GHK-Cu' : 'Try searching for BPC-157, Tirzepatide, NAD+, or GHK-Cu'}
              </div>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const isCurrent = item.slug === currentSlug;
              const name = item.canonicalName || item.name || item.displayName || 'Peptide Monograph';
              const subtitle = item.targetReceptorAxis || item.clinicalIndication || item.category || 'Clinical Peptide';
              const purity = item.purity || '≥99% HPLC Verified';
              const supplier = item.supplierName || item.sourceSupplier || item.supplier || currentSupplier;

              return (
                <div
                  key={item.id || item.slug || idx}
                  onClick={() => handleSelectProduct(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: isSelected ? '#f0f9ff' : '#ffffff',
                    border: `1px solid ${isSelected ? '#bae6fd' : 'transparent'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected ? '#e0f2fe' : '#f1f5f9',
                      color: isSelected ? '#0369a1' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FlaskConical size={16} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          color: isSelected ? '#0369a1' : '#0f172a'
                        }}>
                          {name}
                        </span>
                        {isCurrent && (
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: '#e2e8f0',
                            color: '#475569'
                          }}>
                            {isSpanish ? 'Actual' : 'Current'}
                          </span>
                        )}
                      </div>

                      <div style={{
                        fontSize: '0.74rem',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '380px',
                        marginTop: '1px'
                      }}>
                        {subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Right Quality Badges (NO PRICING) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {supplier && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        display: 'none', // Shown on desktop via media query or inline flex
                      }} className="hide-on-mobile-badge">
                        {supplier}
                      </span>
                    )}

                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#16a34a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <ShieldCheck size={11} />
                      <span>{purity}</span>
                    </span>

                    <ArrowRight
                      size={14}
                      style={{
                        color: isSelected ? '#0284c7' : '#cbd5e1',
                        transition: 'transform 0.15s ease',
                        transform: isSelected ? 'translateX(2px)' : 'none'
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div style={{
          padding: '8px 16px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.70rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span><strong style={{ color: '#334155' }}>↑↓</strong> {isSpanish ? 'Navegar' : 'Navigate'}</span>
            <span><strong style={{ color: '#334155' }}>↵</strong> {isSpanish ? 'Abrir ficha' : 'Open datasheet'}</span>
            <span><strong style={{ color: '#334155' }}>ESC</strong> {isSpanish ? 'Cerrar' : 'Close'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0369a1', fontWeight: 700 }}>
            <Sparkles size={11} />
            <span>Atlas Algolia Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
