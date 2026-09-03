"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Plus, ScanLine, Package } from '@/lib/icons';
import { searchAlgolia } from '../../../../services/algoliaSearch';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import * as fb from '../../../../firebase';
const db = fb?.db;
import notifier from '../../../../services/NotificationService';

export default function AlgoliaProductPicker({ onProductSelect }) {
  const [queryTerm, setQueryTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchMode, setSearchMode] = useState('text'); // 'text' | 'id'
  const wrapperRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search for Text mode
  useEffect(() => {
    if (searchMode !== 'text') return;
    
    const delayDebounceFn = setTimeout(async () => {
      if (queryTerm.length < 3) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await searchAlgolia(queryTerm);
        setResults(data.products || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching products via Algolia:', error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [queryTerm, searchMode]);

  // Handle manual ID Search
  const handleIdSearch = async (e) => {
    e.preventDefault();
    if (!queryTerm.trim()) return;
    setIsLoading(true);
    setResults([]);
    try {
      // Direct Firestore query by ID or SKU
      const productsRef = collection(db, 'products');
      // Search by ID exact match
      const qId = query(productsRef, where('__name__', '==', queryTerm.trim()));
      const snapId = await getDocs(qId);
      
      let found = [];
      if (!snapId.empty) {
        found = snapId.docs.map(d => ({ id: d.id, ...d.data() }));
      } else {
        // Fallback to SKU exact match
        const qSku = query(productsRef, where('sku', '==', queryTerm.trim().toUpperCase()), limit(1));
        const snapSku = await getDocs(qSku);
        if (!snapSku.empty) {
          found = snapSku.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      }

      if (found.length > 0) {
        setResults(found);
        setIsOpen(true);
      } else {
        notifier.error(`No product found with ID or SKU: ${queryTerm}`);
        setResults([]);
      }
    } catch (err) {
      console.error('Error searching by ID:', err);
      notifier.error('Error searching database by ID.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
    setQueryTerm('');
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {/* Mode Toggles */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button
          onClick={() => { setSearchMode('text'); setQueryTerm(''); setResults([]); setIsOpen(false); }}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '8px',
            border: searchMode === 'text' ? '1px solid var(--primary)' : '1px solid var(--border)',
            background: searchMode === 'text' ? 'var(--primary-light)' : 'var(--surface)',
            color: searchMode === 'text' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }}
        >
          <Search size={14} /> Smart Search
        </button>
        <button
          onClick={() => { setSearchMode('id'); setQueryTerm(''); setResults([]); setIsOpen(false); }}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '8px',
            border: searchMode === 'id' ? '1px solid #8b5cf6' : '1px solid var(--border)',
            background: searchMode === 'id' ? '#f5f3ff' : 'var(--surface)',
            color: searchMode === 'id' ? '#7c3aed' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s'
          }}
        >
          <ScanLine size={14} /> Search by ID / Barcode
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: searchMode === 'id' ? '#8b5cf6' : 'var(--primary)' }}>
          {isLoading ? <Loader2 size={18} className="spin" /> : (searchMode === 'id' ? <ScanLine size={18} /> : <Search size={18} />)}
        </div>
        
        {searchMode === 'text' ? (
          <input
            type="text"
            value={queryTerm}
            onChange={(e) => setQueryTerm(e.target.value)}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            placeholder="Type ingredient or product name (e.g. BPC-157, NAD+)..."
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3rem',
              borderRadius: '12px',
              border: '2px solid transparent',
              background: 'var(--bg-main)',
              fontSize: '0.95rem',
              color: 'var(--text-main)',
              outline: 'none',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 0 0 1px var(--border)',
              transition: 'all 0.2s'
            }}
            onFocusCapture={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 0 0 2px var(--primary)'}
            onBlurCapture={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 0 0 1px var(--border)'}
          />
        ) : (
          <form onSubmit={handleIdSearch} style={{ margin: 0 }}>
            <input
              type="text"
              value={queryTerm}
              onChange={(e) => setQueryTerm(e.target.value)}
              placeholder="Scan Barcode or enter Product ID / SKU..."
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: '12px',
                border: '2px solid transparent',
                background: 'var(--bg-main)',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                outline: 'none',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02), 0 0 0 1px var(--border)',
                transition: 'all 0.2s'
              }}
              onFocusCapture={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 0 0 2px #8b5cf6'}
              onBlurCapture={(e) => e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02), 0 0 0 1px var(--border)'}
            />
            <button type="submit" style={{ display: 'none' }}>Search</button>
          </form>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.5rem',
          background: 'var(--surface)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          zIndex: 50,
          maxHeight: '350px',
          overflowY: 'auto'
        }}>
          {results.map((item) => (
            <div
              key={item.objectID || item.id}
              onClick={() => handleSelect(item)}
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'background 0.2s',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-main)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '8px', 
                  background: searchMode === 'id' ? '#ede9fe' : 'var(--primary-light)',
                  color: searchMode === 'id' ? '#7c3aed' : 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Package size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem', fontSize: '0.95rem' }}>
                    {item.title || item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{item.category || 'Product'}</span>
                    <span>•</span>
                    <span>SKU: {item.sku || 'N/A'}</span>
                    <span>•</span>
                    <span style={{ color: searchMode === 'id' ? '#7c3aed' : 'var(--primary)', fontWeight: 600 }}>{item.vial_strength || item.mg_per_vial || 0}mg</span>
                  </div>
                </div>
              </div>
              <button style={{
                background: searchMode === 'id' ? '#8b5cf6' : 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Plus size={14} /> Add
              </button>
            </div>
          ))}
        </div>
      )}
      
      {isOpen && results.length === 0 && queryTerm.length >= 3 && !isLoading && searchMode === 'text' && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.5rem',
          background: 'var(--surface)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 50,
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}>
          No products found matching "<strong>{queryTerm}</strong>"
        </div>
      )}
    </div>
  );
}

