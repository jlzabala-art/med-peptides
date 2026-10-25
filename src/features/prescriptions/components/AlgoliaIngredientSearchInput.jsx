'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, Plus, Package, AlertCircle, X } from '@/lib/icons';
import { searchAlgoliaProducts } from '../../../services/algoliaSearch';

/**
 * AlgoliaIngredientSearchInput
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive Algolia-powered search input for Active Pharmaceutical Ingredients (APIs).
 * Prioritizes matching against the official Atlas catalog products index.
 * Only allows creating custom placeholder APIs in exceptional circumstances when
 * an ingredient does not exist in catalog.
 */
export default function AlgoliaIngredientSearchInput({
  value = '',
  productId = null,
  sku = '',
  isPlaceholder = false,
  onChange = () => {},
  placeholder = 'Search API in Atlas Catalog (Algolia)...',
  disabled = false
}) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Sync internal state when parent value changes externally
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search against Algolia products index
  useEffect(() => {
    if (!isOpen || disabled) return;
    const term = (searchTerm || '').trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const hits = await searchAlgoliaProducts(term, { hitsPerPage: 10 });
        setResults(Array.isArray(hits) ? hits : []);
      } catch (err) {
        console.warn('[AlgoliaIngredientSearchInput] Search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, disabled]);

  const handleSelectProduct = (hit) => {
    const matchedName = hit.name || hit.productName || searchTerm;
    const matchedId = hit.objectID || hit.id || null;
    const matchedSku = hit.sku || '';

    setSearchTerm(matchedName);
    setIsOpen(false);
    onChange({
      name: matchedName,
      productId: matchedId,
      sku: matchedSku,
      isPlaceholder: false,
      product: hit
    });
  };

  const handleAddAsCustomPlaceholder = () => {
    const customName = searchTerm.trim();
    if (!customName) return;

    setIsOpen(false);
    onChange({
      name: customName,
      productId: null,
      sku: '',
      isPlaceholder: true,
      product: null
    });
  };

  const isMatchedInCatalog = Boolean(productId && !isPlaceholder);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      {/* Search Input Bar */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: '#ffffff',
        border: `1px solid ${isMatchedInCatalog ? '#86efac' : (isPlaceholder ? '#fde047' : '#cbd5e1')}`,
        borderRadius: '6px',
        transition: 'all 0.15s ease',
        boxShadow: isOpen ? '0 0 0 2px rgba(26,115,232,0.2)' : 'none'
      }}>
        <div style={{ padding: '0 8px', color: '#64748b', display: 'flex', alignItems: 'center' }}>
          <Search size={14} />
        </div>

        <input
          type="text"
          value={searchTerm}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => {
            setIsOpen(true);
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsOpen(false);
          }}
          style={{
            flex: 1,
            height: '36px',
            border: 'none',
            outline: 'none',
            fontSize: '0.84rem',
            color: '#0f172a',
            paddingRight: '60px',
            boxSizing: 'border-box',
            background: 'transparent'
          }}
        />

        {/* Catalog Match / Placeholder Pill */}
        <div style={{ position: 'absolute', right: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {isMatchedInCatalog ? (
            <span
              title={`Matched to catalog (${sku || 'Active'})`}
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#15803d',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '1px 6px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <Check size={10} color="#16a34a" /> {sku || 'Catalog'}
            </span>
          ) : isPlaceholder ? (
            <span
              title="Custom ingredient (unmapped placeholder)"
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#b45309',
                background: '#fefce8',
                border: '1px solid #fef08a',
                padding: '1px 6px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <AlertCircle size={10} color="#d97706" /> Custom
            </span>
          ) : null}

          {searchTerm && !disabled && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setIsOpen(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Clear"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Algolia Search Dropdown Popover */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
          zIndex: 999,
          maxHeight: '260px',
          overflowY: 'auto'
        }}>
          {isLoading ? (
            <div style={{ padding: '12px', fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
              Searching catalog via Algolia...
            </div>
          ) : results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                padding: '6px 10px',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#64748b',
                background: '#f8fafc',
                borderBottom: '1px solid #f1f5f9',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Atlas Catalog Matches ({results.length})
              </div>

              {results.map((hit) => {
                const isSelected = productId === (hit.objectID || hit.id);
                return (
                  <div
                    key={hit.objectID || hit.id}
                    onClick={() => handleSelectProduct(hit)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      borderBottom: '1px solid #f8fafc',
                      transition: 'background 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#ffffff';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Package size={14} color={isSelected ? '#16a34a' : '#64748b'} />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                          {hit.name || hit.productName}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b', display: 'flex', gap: '6px' }}>
                          {hit.sku && <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{hit.sku}</span>}
                          {hit.category && <span>• {hit.category}</span>}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check size={14} color="#16a34a" />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '12px 10px', fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
              {searchTerm.trim().length < 2
                ? 'Type at least 2 characters to search catalog...'
                : 'No catalog products found matching this name.'}
            </div>
          )}

          {/* Exceptional Fallback: Add as Custom Placeholder */}
          {searchTerm.trim().length >= 2 && (
            <div style={{
              padding: '8px 10px',
              borderTop: '1px solid #e2e8f0',
              background: '#fffbeb'
            }}>
              <button
                type="button"
                onClick={handleAddAsCustomPlaceholder}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px dashed #d97706',
                  background: '#fef3c7',
                  color: '#92400e',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={13} />
                <span>Use &quot;{searchTerm.trim()}&quot; as Custom API (Placeholder)</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
