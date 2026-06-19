import React from 'react';
import { useClinicalCart } from '../../contexts/ClinicalCartContext';
import { ShoppingCart, X, Trash2, Plus, Minus, CheckCircle, Package } from 'lucide-react';

export default function ClinicalCartDrawer() {
  const { isOpen, closeCart, items, patient, updateQuantity, removeItem, clearCart } = useClinicalCart();

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999
        }}
        onClick={closeCart}
      />
      <div 
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100vw',
          backgroundColor: '#fff', zIndex: 10000, display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.1)'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingCart size={24} color="#0f172a" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Clinical Cart</h2>
          </div>
          <button onClick={closeCart} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* Patient Selection Banner */}
        <div style={{ padding: '1rem 1.5rem', backgroundColor: patient ? '#ecfdf5' : '#fffbeb', borderBottom: '1px solid #e2e8f0' }}>
          {patient ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#065f46' }}>Patient: {patient.name}</span>
              </div>
              <button style={{ fontSize: '0.8rem', color: '#059669', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Change</button>
            </div>
          ) : (
            <div style={{ fontSize: '0.9rem', color: '#b45309', fontWeight: 500 }}>
              No patient selected. You must select a patient to issue this prescription.
              <div style={{ marginTop: '0.5rem' }}>
                <button className="gcp-btn-secondary" style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>Select Patient</button>
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: '#94a3b8' }}>
              <ShoppingCart size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Your clinical cart is empty.</p>
              <p style={{ fontSize: '0.85rem' }}>Add items or protocols from the catalog.</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.isProtocol ? <Package size={20} color="#3b82f6" /> : <img src={item.image || 'https://via.placeholder.com/40'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                    {item.isProtocol ? 'Protocol / Bundle' : (item.sku || 'Item')}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '6px' }}>
                      <button onClick={() => updateQuantity(item.id || item.objectID, -1)} style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id || item.objectID, 1)} style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id || item.objectID)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button 
            className="gcp-btn-primary" 
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}
            disabled={items.length === 0}
          >
            Issue Prescription
          </button>
          <button 
            className="gcp-btn-secondary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}
            onClick={clearCart}
            disabled={items.length === 0}
          >
            Clear Cart
          </button>
        </div>
      </div>
    </>
  );
}
