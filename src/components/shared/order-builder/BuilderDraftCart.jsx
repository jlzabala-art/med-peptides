import React from 'react';
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import { formatAEDtoDual } from '../../../utils/currencies';

export default function BuilderDraftCart({ items, totals, onUpdateQuantity, onRemove, pricingTier }) {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <ShoppingBag size={32} color="var(--color-text-tertiary)" style={{ margin: '0 auto 1rem' }} />
        <h4 style={{ margin: 0, color: 'var(--color-text-secondary)' }}>El carrito está vacío</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', marginTop: '0.5rem' }}>
          Busca productos en el catálogo para agregarlos a la orden.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--color-bg-app)' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Productos de la Orden</h3>
      </div>
      
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((item, index) => {
          let unitPrice = 0;
          if (item.prices && item.prices[pricingTier]) {
            unitPrice = item.prices[pricingTier];
          } else if (item.price) {
            unitPrice = item.price;
          }

          return (
            <div key={`${item.id}-${item.sourceId}-${index}`} className="draft-cart-item">
              <div style={{ flex: 1, width: '100%' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                  {item.sku && `SKU: ${item.sku} | `}{formatAEDtoDual(unitPrice)} cada uno
                </div>
                {item.sourceId && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', marginTop: '0.2rem', fontWeight: 700 }}>
                    Origen: {item.sourceType === 'prescription' ? 'Receta Importada' : 'Pedido Directo'}
                  </div>
                )}
              </div>
              
              <div className="draft-cart-item-actions">
                <input 
                  type="number" 
                  min="1" 
                  value={item.quantity} 
                  onChange={(e) => onUpdateQuantity(item.id, item.sourceId, parseInt(e.target.value) || 1)}
                  style={{ width: '60px', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px', textAlign: 'center' }}
                />
                
                <div style={{ width: '80px', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                  {formatAEDtoDual(unitPrice * item.quantity)}
                </div>
                
                <button 
                  onClick={() => onRemove(item.id, item.sourceId)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ padding: '1.25rem', borderTop: '1px dashed var(--border)', background: 'var(--color-bg-app)', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: '250px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal:</span>
            <span style={{ fontWeight: 600 }}>{formatAEDtoDual(totals.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Impuestos (5%):</span>
            <span style={{ fontWeight: 600 }}>{formatAEDtoDual(totals.tax)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <span>Total:</span>
            <span>{formatAEDtoDual(totals.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
