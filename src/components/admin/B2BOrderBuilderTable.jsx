import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Plus, Trash2 } from 'lucide-react';
import { useUnifiedCatalogSearch } from '../../hooks/useUnifiedCatalogSearch';

function AutocompleteCell({ item, onSelect }) {
  const { results, loading, handleInput, clear } = useUnifiedCatalogSearch();
  const [q, setQ] = useState(item?.name || '');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQ(val);
    if (val.length >= 2) {
      setIsOpen(true);
      handleInput(val);
    } else {
      setIsOpen(false);
      clear();
    }
  };

  const handleSelect = (r) => {
    setQ(r.name);
    setIsOpen(false);
    onSelect(r);
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.2rem 0.5rem' }}>
        {loading ? <Loader2 size={12} style={{ animation: 'adminSpin 1s linear infinite' }} /> : <Search size={12} color="var(--color-text-tertiary)" />}
        <input 
          value={q} 
          onChange={handleChange} 
          onFocus={() => q.length >= 2 && setIsOpen(true)}
          placeholder="Buscar producto o API..."
          style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', padding: '0.2rem 0.5rem', color: 'var(--color-text-primary)' }}
        />
      </div>
      {isOpen && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--color-bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', borderRadius: '4px', maxHeight: '200px', overflowY: 'auto' }}>
          {results.map(r => (
            <div 
              key={r.id} 
              onClick={() => handleSelect(r)}
              style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-app)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{r.type.toUpperCase()} • {r.category}</span>
                {r.relativeCostScore ? (
                  <span style={{ color: 'var(--color-primary)' }}>Cost Score: {r.relativeCostScore}</span>
                ) : (
                  <span>€{r.price}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function B2BOrderBuilderTable({ items, onChange }) {
  
  const handleAddItem = () => {
    onChange([...items, { id: Date.now().toString(), name: '', quantity: 1, rate: 0, type: '', unit: 'vials', isApiWithScore: false }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    onChange(newItems);
  };

  const handleSelectProduct = (index, productData) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      id: productData.id,
      name: productData.name,
      type: productData.type,
      sku: productData.sku,
      unit: productData.unit,
      isApiWithScore: productData.relativeCostScore !== null,
      rate: productData.price || 0,
    };
    onChange(newItems);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + ((parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0)), 0);

  return (
    <div style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: 'var(--color-bg-app)', borderBottom: '1px solid var(--border)' }}>
          <tr>
            <th style={thStyle}>Detalle del Artículo</th>
            <th style={thStyle}>Tipo</th>
            <th style={thStyle}>Cantidad</th>
            <th style={thStyle}>Tarifa (€)</th>
            <th style={thStyle}>Importe (€)</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const amount = ((parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0)).toFixed(2);
            return (
              <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>
                  <AutocompleteCell item={item} onSelect={(prod) => handleSelectProduct(index, prod)} />
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                    {item.type || 'N/A'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.quantity} 
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    style={inputStyle} 
                  />
                </td>
                <td style={tdStyle}>
                  {item.isApiWithScore ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <input 
                        type="number" 
                        value={item.rate} 
                        onChange={(e) => updateItem(index, 'rate', e.target.value)}
                        placeholder="Fórmula"
                        style={{ ...inputStyle, borderColor: 'var(--color-primary)', background: 'rgba(0,54,102,0.02)' }} 
                      />
                      <span style={{ fontSize: '0.6rem', color: 'var(--color-primary)', fontWeight: 600 }}>Cálculo Manual</span>
                    </div>
                  ) : (
                    <input 
                      type="number" 
                      value={item.rate} 
                      onChange={(e) => updateItem(index, 'rate', e.target.value)}
                      style={inputStyle} 
                    />
                  )}
                </td>
                <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {amount}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.2rem' }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
        <button onClick={handleAddItem} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px dashed var(--border)', color: 'var(--color-text-secondary)', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          <Plus size={14} /> Añadir otra línea
        </button>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Total Líneas: <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{items.length}</span>
          </div>
          <div style={{ fontSize: '1rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Total Estimado:</span>
            <span style={{ fontWeight: 800 }}>€{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '0.75rem 1rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const tdStyle = {
  padding: '0.75rem 1rem',
  verticalAlign: 'top'
};

const inputStyle = {
  width: '80px',
  padding: '0.4rem',
  fontSize: '0.8rem',
  border: '1px solid var(--border)',
  borderRadius: '4px',
  outline: 'none',
  fontFamily: 'inherit'
};
