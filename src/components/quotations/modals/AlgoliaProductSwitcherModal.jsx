"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, ShieldCheck, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { searchAlgolia } from '../../../services/algoliaSearch';
import { db } from '../../../firebase';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';

export default function AlgoliaProductSwitcherModal({
  isOpen,
  onClose,
  currentItem,
  onSelectProduct,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus search input and pre-load initial options on open
  useEffect(() => {
    if (isOpen) {
      const initialTerm = currentItem?.name ? currentItem.name.split(' ')[0] : '';
      setSearchTerm(initialTerm);
      performSearch(initialTerm);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen, currentItem]);

  const performSearch = async (term) => {
    setLoading(true);
    try {
      if (term && term.trim().length >= 2) {
        // 1. Try Algolia instant search (sub-10ms)
        const algoliaRes = await searchAlgolia(term, { hitsPerPage: 15 });
        if (algoliaRes?.products && algoliaRes.products.length > 0) {
          setResults(algoliaRes.products);
          setLoading(false);
          return;
        }
      }

      // 2. Fallback: Quick Firestore products query
      const q = query(
        collection(db, 'products'),
        where('isActive', '!=', false),
        limit(15)
      );
      const snap = await getDocs(q);
      const firestoreProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (term && term.trim().length > 0) {
        const lower = term.toLowerCase();
        const filtered = firestoreProducts.filter(p => 
          (p.name && p.name.toLowerCase().includes(lower)) ||
          (p.displayName && p.displayName.toLowerCase().includes(lower)) ||
          (p.category && p.category.toLowerCase().includes(lower))
        );
        setResults(filtered.length > 0 ? filtered : firestoreProducts);
      } else {
        setResults(firestoreProducts);
      }
    } catch (err) {
      console.warn('[AlgoliaProductSwitcher] Search fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    performSearch(val);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
        }}>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#003666" />
              <span>Sustituir Producto con Algolia</span>
            </div>
            {currentItem && (
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 2 }}>
                Sustituyendo: <strong style={{ color: '#0f172a' }}>{currentItem.name || currentItem.productName}</strong>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f1f5f9',
            padding: '8px 12px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
          }}>
            <Search size={16} color="#64748b" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Escribe el nombre del péptido o dosis..."
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.88rem',
                color: '#0f172a',
                fontWeight: 500,
              }}
            />
            {loading ? (
              <Loader2 size={16} className="spin-icon" color="#0284c7" />
            ) : searchTerm ? (
              <button 
                onClick={() => { setSearchTerm(''); performSearch(''); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Results List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {results.length === 0 && !loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
              No se encontraron productos coincidentes en el catálogo.
            </div>
          ) : (
            results.map((prod) => {
              const name = prod.name || prod.displayName || prod.title || 'Compuesto';
              const dosage = prod.dosage || prod.presentation || (prod.variants?.[0]?.dosage) || '';
              const supplier = prod.supplierName || prod.supplier || 'Lotusland Limited';
              const cost = prod.supplierCost || prod.basePrice || prod.masterPrice || (prod.variants?.[0]?.price) || 0;

              return (
                <div
                  key={prod.id || prod.objectID || Math.random()}
                  onClick={() => onSelectProduct(prod)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    minHeight: '44px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      backgroundColor: '#eff6ff',
                      color: '#003666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Package size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {dosage && <span style={{ fontWeight: 600, color: '#475569' }}>{dosage}</span>}
                        {dosage && supplier && <span>·</span>}
                        <span>{supplier}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {cost > 0 && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>
                        Costo: ${Number(cost).toFixed(2)}
                      </span>
                    )}
                    <div style={{
                      backgroundColor: '#f1f5f9',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#003666',
                    }}>
                      <span>Elegir</span>
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid #f1f5f9',
          backgroundColor: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: '#64748b',
        }}>
          <span>Búsqueda instantánea con Algolia AI Engine</span>
          <span>1 tap para sustituir</span>
        </div>
      </div>
    </div>
  );
}
