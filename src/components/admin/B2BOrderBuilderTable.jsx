import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Plus from "lucide-react/dist/esm/icons/plus";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import React, { useState } from 'react';
import UniversalItemPicker from '../shared/ItemPicker/UniversalItemPicker';

export default function B2BOrderBuilderTable({ items, onChange }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    onChange(newItems);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleAddItems = (selectedItems) => {
    const newLines = selectedItems.map(prod => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      productId: prod.id || prod.objectID,
      parentProductId: prod.parentProductId,
      name: prod.name,
      type: prod.type || 'producto',
      sku: prod.sku || '',
      unit: prod.unit || 'vials',
      isApiWithScore: prod.relativeCostScore !== undefined && prod.relativeCostScore !== null,
      rate: prod.price || 0,
      stock: prod.stock || 0,
      quantity: prod.quantity || 1
    }));
    onChange([...items, ...newLines]);
    setIsPickerOpen(false);
  };

  const totalAmount = items.reduce((sum, item) => sum + ((parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0)), 0);

  return (
    <div style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: '#fff', position: 'relative' }}>
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
          {items.length === 0 && (
            <tr>
              <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                <ShoppingBag size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No hay artículos en este pedido.</p>
                <button 
                  onClick={() => setIsPickerOpen(true)}
                  style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
                >
                  <Plus size={16} /> Buscar y Añadir Artículos
                </button>
              </td>
            </tr>
          )}
          {items.map((item, index) => {
            const amount = ((parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0)).toFixed(2);
            return (
              <tr key={item.id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name || 'Sin nombre'}</div>
                  {item.sku && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {item.sku}</div>}
                </td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                    {item.type ? item.type.toUpperCase() : 'N/A'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      style={{ ...inputStyle, borderColor: item.stock !== undefined && item.quantity > item.stock ? '#ef4444' : 'var(--border)' }} 
                    />
                    {item.stock !== undefined && item.quantity > item.stock && (
                      <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 600 }}>Stock insuf. ({item.stock} disp.)</span>
                    )}
                  </div>
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
                  <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.4rem', borderRadius: '4px' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {items.length > 0 && (
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
          <button 
            onClick={() => setIsPickerOpen(true)} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px dashed #cbd5e1', color: '#3b82f6', borderRadius: '6px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <Plus size={16} /> Añadir Artículos
          </button>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Líneas: <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{items.length}</span>
            </div>
            <div style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Total Estimado:</span>
              <span style={{ fontWeight: 800 }}>€{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Drawer for the Item Picker */}
      {isPickerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: '#fff',
            height: '100%',
            boxShadow: '-4px 0 25px rgba(0,0,0,0.1)',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <UniversalItemPicker 
              onClose={() => setIsPickerOpen(false)}
              onSelect={handleAddItems}
              multiSelect={true}
              showQuantities={true}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
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
  padding: '1rem',
  verticalAlign: 'middle'
};

const inputStyle = {
  width: '90px',
  padding: '0.4rem 0.5rem',
  fontSize: '0.85rem',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s'
};