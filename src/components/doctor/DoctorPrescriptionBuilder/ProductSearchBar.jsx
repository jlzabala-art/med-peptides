"use client";

import React, { useState, useRef, useCallback } from 'react';
import { apiCatalog } from '../../../data/apis';
import { useUnifiedCatalogSearch } from '../../../hooks/useUnifiedCatalogSearch';
import { Search, Plus, Loader2 } from '@/lib/icons';

export default function ProductSearchBar({ onAdd, catalogProducts = [], catalogProtocols = [] }) {
  const [q, setQ]           = useState('');
  const [mode, setMode]     = useState('catalog'); // 'catalog' | 'apis'
  const [localResults, setLocalResults] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const debounce = useRef(null);

  const { results: unifiedResults, loading: unifiedLoading, handleInput: handleUnifiedInput, clear: clearUnified } = useUnifiedCatalogSearch();

  const results = mode === 'catalog' ? unifiedResults : localResults;
  const loading = mode === 'catalog' ? unifiedLoading : localLoading;

  const searchLocalApis = useCallback((term) => {
    console.log('[ProductSearch] Starting local API search for term:', term);
    if (term.length < 2) { setLocalResults([]); return; }
    setLocalLoading(true);
    try {
      const filteredApis = apiCatalog.filter(a => 
        (a.name || '').toLowerCase().includes(term.toLowerCase())
      );
      setLocalResults(filteredApis.slice(0, 10));
    } catch (err) {
      console.error('[ProductSearch] Error in API search:', err);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  const handleInput = (val) => {
    setQ(val);
    if (mode === 'catalog') {
      handleUnifiedInput(val);
    } else {
      clearTimeout(debounce.current);
      debounce.current = setTimeout(() => searchLocalApis(val), 150);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setQ('');
    setLocalResults([]);
    clearUnified();
  };

  const handleAdd = (item) => {
    if (mode === 'apis' || item.type === 'api') {
      onAdd({
        type: 'supplement_compounding',
        id: `comp-${item.id}-${Date.now()}`,
        name: `Fórmula con ${item.name}`,
        sku: 'MAGISTRAL',
        pricing: null,
        quantity: 1,
        unit: 'vials',
        dosage: '',
        frequency: '',
        duration: '',
        notes: '',
        format: 'capsules',
        excipient: 'cellulose_capsule',
        ingredients: [{
           id: item.id,
           name: item.name,
           dose: '',
           unit: item.baseUnit || 'mg',
        }]
      });
    } else {
      onAdd({
        type:      item.type || 'product',
        id:        item.id,
        name:      item.name || item.displayName || '',
        sku:       item.sku || item.variants?.[0]?.sku || '',
        imageUrl:  item.imageUrl || item.image || '',
        pricing:   item.pricing || null,
        quantity:  1,
        unit:      item.productType === 'testing' || item.type === 'testing' ? 'kits' : 'vials',
        dosage:    '',
        frequency: '',
        duration:  '',
        notes:     '',
        recommended_tests: item.recommended_tests || [],
      });
    }
    setQ('');
    setLocalResults([]);
    clearUnified();
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button 
          onClick={() => handleModeChange('catalog')}
          style={{ flex: 1, padding: '0.4rem', borderRadius: '8px', border: mode === 'catalog' ? '2px solid #003666' : '1px solid #cbd5e1', background: mode === 'catalog' ? '#f0f9ff' : 'var(--color-bg-surface)', fontWeight: mode === 'catalog' ? 800 : 600, color: mode === 'catalog' ? 'var(--color-primary)' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
          Catálogo Regular (Algolia)
        </button>
        <button 
          onClick={() => handleModeChange('apis')}
          style={{ flex: 1, padding: '0.4rem', borderRadius: '8px', border: mode === 'apis' ? '2px solid #0d9488' : '1px solid #cbd5e1', background: mode === 'apis' ? '#f0fdfa' : 'var(--color-bg-surface)', fontWeight: mode === 'apis' ? 800 : 600, color: mode === 'apis' ? '#0d9488' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
          Materias Primas (Fórmula Magistral)
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
        border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0.6rem 0.9rem',
        background: 'var(--color-bg-app)', transition: 'border-color 0.15s' }}
        onFocus={e => e.currentTarget.style.borderColor = mode === 'catalog' ? 'var(--color-primary)' : '#0d9488'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
        {loading ? <Loader2 size={15} color="var(--color-text-tertiary)" style={{ animation: 'rxSpin 1s linear infinite' }} />
                 : <Search size={15} color="var(--color-text-tertiary)" />}
        <input value={q} onChange={e => handleInput(e.target.value)}
          placeholder={mode === 'catalog' ? "Buscar producto o protocolo para añadir…" : "Buscar API puro para componer receta..."}
          style={{ flex: 1, border: 'none', background: 'none', outline: 'none',
            fontSize: '0.82rem', color: 'var(--color-text-primary)', fontFamily: 'inherit' }} />
      </div>

      {results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden',
        }}>
          {results.map(r => (
            <button key={r.id} onClick={() => handleAdd(r)} style={{
              width: '100%', textAlign: 'left', background: 'none', border: 'none',
              cursor: 'pointer', padding: '0.65rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              borderBottom: '1px solid #f8fafc',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-app)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{ fontSize: '0.9rem' }}>
                {mode === 'apis' || r.type === 'api' ? '🧪' : (r.type === 'protocol' ? '🧬' : (r.productType === 'testing' || r.type === 'testing' ? '🔬' : '💊'))}
              </span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {r.name || r.displayName}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                  {mode === 'apis' ? `API Base: ${r.baseUnit}` : (r.type === 'protocol' ? 'Protocolo' : `SKU: ${r.sku || '—'}`)}
                </div>
              </div>
              <Plus size={13} color={(mode === 'apis' || r.type === 'api') ? "#0d9488" : "var(--color-primary)"} style={{ marginLeft: 'auto' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
