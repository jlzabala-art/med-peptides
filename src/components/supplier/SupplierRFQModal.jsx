"use client";

import React, { useState } from 'react';
import X from "lucide-react/dist/esm/icons/x";
import Send from "lucide-react/dist/esm/icons/send";
import { useProcurementManager } from '../../hooks/data/useProcurementManager';
import StandardDrawer from '../ui/StandardDrawer';

export default function SupplierRFQModal({ rfq, onClose, onSuccess }) {
  const { respondToPurchaseRFQ, loading } = useProcurementManager();
  
  // State for the editable items (supplier can adjust final price)
  const [items, setItems] = useState(
    rfq.items?.map(item => ({
      ...item,
      finalUnitPrice: item.proposedUnitPrice || item.price || 0,
    })) || []
  );
  
  const [shippingCost, setShippingCost] = useState(0);
  const [supplierNotes, setSupplierNotes] = useState('');

  const handlePriceChange = (index, newPrice) => {
    const updated = [...items];
    updated[index].finalUnitPrice = parseFloat(newPrice) || 0;
    setItems(updated);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.finalUnitPrice * item.qty), 0);
  };

  const handleSubmit = async () => {
    try {
      await respondToPurchaseRFQ({
        rfqDocId: rfq.id,
        supplierNotes,
        finalItems: items,
        finalShippingCost: parseFloat(shippingCost) || 0
      });
      onSuccess();
    } catch (err) {
      alert('Error submitting quotation: ' + err.message);
    }
  };

  const isPending = rfq.status === 'pending_supplier';
  const subtotal = calculateSubtotal();
  const total = subtotal + (parseFloat(shippingCost) || 0);

  return (
    <StandardDrawer
      isOpen={true}
      onClose={onClose}
      title={isPending ? 'Respond to Quotation Request' : 'Quotation Details'}
      subtitle={`RFQ ID: ${rfq.prfqId}`}
      width="800px"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            Close
          </button>
          {isPending && (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={16} />
              {loading ? 'Submitting...' : 'Submit Quotation to Admin'}
            </button>
          )}
        </>
      }
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Items Table */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Requested Items</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>Product</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>Qty</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>Admin Proposed</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>Your Final Price</th>
                  <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.variantName}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{item.qty}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>${(item.proposedUnitPrice || item.price || 0).toFixed(2)}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {isPending ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          $ <input 
                            type="number" 
                            className="input" 
                            style={{ width: '80px', padding: '0.25rem 0.5rem' }} 
                            value={item.finalUnitPrice}
                            onChange={(e) => handlePriceChange(idx, e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <div style={{ fontWeight: 600 }}>${(item.finalUnitPrice || item.proposedUnitPrice || 0).toFixed(2)}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                      ${(item.finalUnitPrice * item.qty).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Admin Notes */}
          {rfq.notes && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Admin Notes:</strong>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{rfq.notes}</div>
            </div>
          )}

          {/* Supplier Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Your Notes (Optional)</label>
              <textarea 
                className="input"
                style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                placeholder="Add any conditions, estimated lead times, or comments for the Admin..."
                value={isPending ? supplierNotes : (rfq.supplierNotes || 'No notes provided.')}
                onChange={(e) => setSupplierNotes(e.target.value)}
                disabled={!isPending}
              />
            </div>
            
            <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shipping Cost:</span>
                {isPending ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    $ <input 
                      type="number" 
                      className="input" 
                      style={{ width: '80px', padding: '0.25rem 0.5rem' }} 
                      value={shippingCost}
                      onChange={(e) => setShippingCost(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                ) : (
                  <span>${(rfq.totals?.shipping || 0).toFixed(2)}</span>
                )}
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>
                <span>Total:</span>
                <span>${(isPending ? total : (rfq.totals?.total || 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
        </div>
    </StandardDrawer>
  );
}
