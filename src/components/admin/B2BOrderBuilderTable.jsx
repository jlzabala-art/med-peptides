"use client";

import React, { useState, useMemo } from 'react';
import UniversalItemPicker from '../shared/ItemPicker/UniversalItemPicker';
import { Trash2, Plus, ShoppingBag } from 'lucide-react';
import DataTable from '../ui/DataTable';

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

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Detalle del Artículo',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.name || 'Sin nombre'}</div>
          {row.sku && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {row.sku}</div>}
        </div>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (val) => (
        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
          {val ? val.toUpperCase() : 'N/A'}
        </span>
      )
    },
    {
      key: 'quantity',
      header: 'Cantidad',
      render: (val, row) => {
        const index = items.findIndex((i) => i.id === row.id);
        const overStock = row.stock !== undefined && row.quantity > row.stock;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <input 
              type="number" 
              min="1" 
              value={row.quantity} 
              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
              style={{ ...inputStyle, borderColor: overStock ? '#ef4444' : 'var(--border)' }} 
            />
            {overStock && (
              <span style={{ fontSize: '0.6rem', color: '#ef4444', fontWeight: 600 }}>Stock insuf. ({row.stock} disp.)</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'rate',
      header: 'Tarifa (€)',
      render: (val, row) => {
        const index = items.findIndex((i) => i.id === row.id);
        return row.isApiWithScore ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <input 
              type="number" 
              value={row.rate} 
              onChange={(e) => updateItem(index, 'rate', e.target.value)}
              placeholder="Fórmula"
              style={{ ...inputStyle, borderColor: 'var(--color-primary)', background: 'rgba(0,54,102,0.02)' }} 
            />
            <span style={{ fontSize: '0.6rem', color: 'var(--color-primary)', fontWeight: 600 }}>Cálculo Manual</span>
          </div>
        ) : (
          <input 
            type="number" 
            value={row.rate} 
            onChange={(e) => updateItem(index, 'rate', e.target.value)}
            style={inputStyle} 
          />
        );
      }
    },
    {
      key: 'amount',
      header: 'Importe (€)',
      render: (val, row) => {
        const amount = ((parseFloat(row.rate) || 0) * (parseInt(row.quantity) || 0)).toFixed(2);
        return <strong style={{ color: 'var(--color-text-primary)' }}>{amount}</strong>;
      }
    },
    {
      key: 'actions',
      header: '',
      align: 'center',
      render: (val, row) => {
        const index = items.findIndex((i) => i.id === row.id);
        return (
          <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.4rem', borderRadius: '4px' }}>
            <Trash2 size={16} />
          </button>
        );
      }
    }
  ], [items, onChange]);

  return (
    <div style={{ width: '100%', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: '#fff', position: 'relative' }}>
      <div className="gcp-table-container">
        <DataTable
          columns={columns}
          data={items}
          keyField="id"
          emptyTitle="No hay artículos en este pedido."
          emptyDescription="Busca y añade artículos al pedido."
          emptyActionLabel={<><Plus size={16} /> Añadir Artículos</>}
          onEmptyAction={() => setIsPickerOpen(true)}
        />
      </div>
      
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