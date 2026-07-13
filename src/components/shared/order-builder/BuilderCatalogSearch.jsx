import React, { useState, useCallback, useRef } from 'react';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import Search from "lucide-react/dist/esm/icons/search";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import Plus from "lucide-react/dist/esm/icons/plus";

export default function BuilderCatalogSearch({ onAdd }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounce = useRef(null);

  const search = useCallback(async (term) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // Future: Migrating this to algoliasearch or an index instead of client-side filtering.
      // For now we use the existing pattern from AdminBulkOrderBuilder
      const snap = await getDocs(query(collection(db, 'products'), limit(200)));
      const all = snap.docs.map((d) => ({ id: d.id, type: 'product', ...d.data() }));
      const filtered = all.filter((p) =>
        (p.name || p.displayName || '').toLowerCase().includes(term.toLowerCase())
      );

      const pSnap = await getDocs(query(collection(db, 'protocols'), limit(100)));
      const protos = pSnap.docs
        .map((d) => ({ id: d.id, type: 'protocol', ...d.data() }))
        .filter((p) => (p.name || '').toLowerCase().includes(term.toLowerCase()));

      setResults([...filtered.slice(0, 6), ...protos.slice(0, 4)]);
    } catch (err) {
      console.error('[CatalogSearch] Error in search:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (val) => {
    setQ(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(val), 300);
  };

  const handleAdd = (item) => {
    onAdd({
      type: item.type,
      id: item.id,
      name: item.name || item.displayName || '',
      sku: item.sku || item.variants?.[0]?.sku || '',
      imageUrl: item.imageUrl || item.image || '',
      quantity: 1,
      unit: 'vials',
      dosage: item.dosage || '',
      notes: '',
      prices: item.prices || {},
      price: item.price || 0
    });
    setQ('');
    setResults([]);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem 0.75rem',
          background: 'var(--color-bg-surface)',
        }}
      >
        {loading ? (
          <Loader2
            size={14}
            color="var(--color-text-tertiary)"
            style={{ animation: 'adminSpin 1s linear infinite' }}
          />
        ) : (
          <Search size={14} color="var(--color-text-tertiary)" />
        )}
        <input
          value={q}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Buscar producto o protocolo del catálogo..."
          style={{
            flex: 1,
            border: 'none',
            background: 'none',
            outline: 'none',
            fontSize: '0.78rem',
            color: 'var(--color-text-primary)',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 100,
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}
        >
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleAdd(r)}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderBottom: '1px solid #f1f5f9',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-app)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: '0.8rem' }}>{r.type === 'protocol' ? '🧬' : '💊'}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {r.name || r.displayName}
                </div>
                <div
                  style={{
                    fontSize: '0.62rem',
                    color: 'var(--color-text-tertiary)',
                    fontWeight: 600,
                  }}
                >
                  {r.type === 'protocol' ? 'Protocolo' : `SKU: ${r.sku || '—'}`}
                </div>
              </div>
              <Plus size={12} color="var(--color-primary)" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
