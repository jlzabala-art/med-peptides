import React, { useState } from 'react';
import { useCart } from '../../../context/CartProvider';
import { useAuth } from '../../../context/AuthContext';
import { Trash2, Save, Send, AlertTriangle } from 'lucide-react';
import StandardDrawer from '../../ui/StandardDrawer';
import { createOrder } from '../../../repositories/orderRepository';
import notifier from '../../../services/NotificationService';
import StatusBadge from '../../ui/StatusBadge';

export default function B2BCartDrawer({ onClose }) {
  const { cart, cartMetadata, updateCart, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [draftNotes, setDraftNotes] = useState('');
  
  const handleSaveDraft = async () => {
    if (cartCount === 0) return;
    
    setIsSaving(true);
    try {
      // Build order payload
      const orderItems = Object.entries(cart).map(([name, qty]) => {
        const meta = cartMetadata[name] || {};
        return {
          productId: meta.id || meta.productId || name,
          productName: name,
          name: name,
          quantity: qty,
          unitPrice: meta.price || 0,
          price: meta.price || 0,
          totalPrice: (meta.price || 0) * qty
        };
      });
      
      const newOrder = {
        type: 'b2b_draft',
        status: 'draft',
        items: orderItems,
        createdBy: user?.uid || 'admin',
        userId: user?.uid || 'admin',
        notes: draftNotes,
        orderNumber: `DRAFT-${Math.floor(Math.random() * 10000)}`
      };
      
      await createOrder(newOrder);
      notifier.success('B2B Draft saved successfully');
      clearCart();
      onClose();
    } catch (e) {
      console.error(e);
      notifier.error('Failed to save draft order');
    } finally {
      setIsSaving(false);
    }
  };

  const hasItems = cartCount > 0;

  // Calculate order total
  const orderTotal = Object.entries(cart).reduce((total, [name, qty]) => {
    const price = cartMetadata?.[name]?.price || 0;
    return total + (price * qty);
  }, 0);

  return (
    <StandardDrawer
      isOpen={true}
      onClose={onClose}
      title="B2B Draft Order"
      subtitle="Build a purchase order or draft order for B2B customers"
      width="450px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {!hasItems ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.2 }}>🛒</div>
              <p>Your B2B draft is currently empty.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Browse the catalog and add variants to build an order.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(cart).map(([productName, quantity]) => {
                const meta = cartMetadata?.[productName] || {};
                const unitPrice = meta.price || 0;
                const itemTotal = unitPrice * quantity;

                return (
                  <div key={productName} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px',
                    background: 'var(--background)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {meta.name ? `${meta.name}${meta.dosage ? ` (${meta.dosage})` : ''}` : productName}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quantity: {quantity}</span>
                        {unitPrice > 0 && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            &times; ${unitPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      {itemTotal > 0 && (
                        <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                          ${itemTotal.toFixed(2)}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px' }}>
                          <button 
                            onClick={() => updateCart(productName, -1)}
                            style={{ padding: '0.2rem 0.6rem', background: 'none', border: 'none', cursor: 'pointer' }}
                          >-</button>
                          <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{quantity}</span>
                          <button 
                            onClick={() => updateCart(productName, 1)}
                            style={{ padding: '0.2rem 0.6rem', background: 'none', border: 'none', cursor: 'pointer' }}
                          >+</button>
                        </div>
                        <button 
                          onClick={() => updateCart(productName, -quantity)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Order Notes (Internal)</label>
                <textarea
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  placeholder="E.g., Special pricing negotiated for Dr. Smith..."
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '6px',
                    border: '1px solid var(--border)', minHeight: '80px',
                    fontFamily: 'inherit', resize: 'vertical'
                  }}
                />
              </div>

              {orderTotal > 0 && (
                <div style={{ 
                  marginTop: '1rem', padding: '1rem', background: 'var(--color-bg-subtle)', 
                  borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontWeight: 600 }}>Estimated Total</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    ${orderTotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {hasItems && (
          <div style={{ 
            padding: '1.5rem', borderTop: '1px solid var(--border)', 
            background: 'var(--background)', display: 'flex', gap: '1rem' 
          }}>
            <button
              onClick={() => {
                clearCart();
                notifier.info('Draft cleared');
              }}
              style={{
                padding: '0.8rem 1rem', background: 'white', border: '1px solid var(--border)',
                borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 500
              }}
            >
              Clear
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              style={{
                flex: 1, padding: '0.8rem 1rem', background: 'var(--primary)', border: 'none',
                borderRadius: '6px', color: 'white', cursor: isSaving ? 'wait' : 'pointer', 
                fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Draft Order'}
            </button>
          </div>
        )}
      </div>
    </StandardDrawer>
  );
}
