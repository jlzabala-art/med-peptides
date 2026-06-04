import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, Search, Package } from 'lucide-react';

export default function ProductAutocomplete({ value, onChange, onSelect, placeholder = "Search product..." }) {
  const [query, setQuery] = useState(value || '');
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Sync state if prop changes (e.g. form reset or value populated)
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Load products from firestore once
  useEffect(() => {
    getDocs(collection(db, 'products')).then(snap => {
      const flattened = [];
      snap.docs.forEach(docSnap => {
        const p = docSnap.data();
        if (p.isActive === false) return; // skip inactive
        
        if (p.isGroup && p.variants && p.variants.length > 0) {
          p.variants.forEach(v => {
            flattened.push({
              id: `${docSnap.id}-${v.sku || v.name}`,
              name: v.name || p.name,
              sku: v.sku || p.sku || '',
              category: p.category || '',
              costPrice: parseFloat(v.costPrice || p.costPrice || 0),
              dosage: v.dosage || p.dosage || '',
              unit: v.unit || p.unit || 'vial',
              product_type: p.product_type || 'Other'
            });
          });
        } else {
          flattened.push({
            id: docSnap.id,
            name: p.name,
            sku: p.sku || '',
            category: p.category || '',
            costPrice: parseFloat(p.costPrice || 0),
            dosage: p.dosage || '',
            unit: p.unit || 'vial',
            product_type: p.product_type || 'Other'
          });
        }
      });
      setProducts(flattened);
    }).catch(err => console.error("Error loading products for autocomplete:", err));
  }, []);

  // Filter products when query changes, starting only after 3 letters
  useEffect(() => {
    if (!query || query.length < 3) {
      setFiltered([]);
      setOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const results = products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    setFiltered(results.slice(0, 10)); // limit to top 10 for better UX
    setOpen(results.length > 0);
  }, [query, products]);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (prod) => {
    const fullName = prod.dosage ? `${prod.name} (${prod.dosage})` : prod.name;
    setQuery(fullName);
    setOpen(false);
    onChange(fullName);
    if (onSelect) {
      onSelect(prod);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    if (onSelect) onSelect(null);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="gcp-input"
          style={{ width: '100%', paddingRight: '2rem' }}
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute', right: '0.5rem', background: 'none', border: 'none',
              cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center'
            }}
          >
            <X size={14} />
          </button>
        ) : (
          <Search size={14} style={{ position: 'absolute', right: '0.75rem', color: '#94a3b8' }} />
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          zIndex: 999, maxHeight: '280px', overflowY: 'auto'
        }}>
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => handleSelect(p)}
              style={{
                padding: '0.6rem 0.85rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                  {p.name} {p.dosage && <span style={{ color: '#64748b', fontWeight: 400 }}>({p.dosage})</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  SKU: {p.sku || 'N/A'} • {p.category}
                </div>
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px',
                backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px'
              }}>
                {p.unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
