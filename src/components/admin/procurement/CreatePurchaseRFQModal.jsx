"use client";

import React, { useState, useEffect } from 'react';
import { Card, StandardDrawer } from '../../ui';
import { useAuth } from '../../../context/AuthContext';
import { useProcurementManager } from '../../../hooks/data/useProcurementManager';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, Send, Info, X, AlertCircle } from '@/lib/icons';

export default function CreatePurchaseRFQModal({ supplierName, selectedVariantIds, variants, onClose }) {
  const { user } = useAuth();
  const { createPurchaseRFQ } = useProcurementManager();
  
  const [rfqItems, setRfqItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Build initial items array from selected variants
    const items = selectedVariantIds.map(id => {
      const variant = variants.find(v => v.id === id);
      if (!variant) return null;
      
      const product = variant.originalProduct || variant.parentProduct || {};
      const currentCost = variant.cost || variant.unitCost || 0;
      
      return {
        variantId: variant.id,
        productId: product.id,
        sku: variant.sku || product.sku || '',
        name: product.name || variant.displayName || 'Unknown Product',
        dosage: variant.format || variant.size || '',
        currentCost: currentCost,
        targetCost: currentCost, // Default target is current cost
        quantity: 100, // Default requested quantity
        units: 'vials' // Default units
      };
    }).filter(Boolean);
    
    setRfqItems(items);
  }, [selectedVariantIds, variants]);

  const handleUpdateItem = (index, field, value) => {
    const updated = [...rfqItems];
    updated[index][field] = value;
    setRfqItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = [...rfqItems];
    updated.splice(index, 1);
    setRfqItems(updated);
  };

  const handleSubmit = async () => {
    if (rfqItems.length === 0) {
      toast.error("You must have at least one item to request a quote.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplierName: supplierName || 'Unknown Supplier',
        items: rfqItems.map(item => ({
          ...item,
          quantity: parseInt(item.quantity, 10) || 0,
          targetCost: parseFloat(item.targetCost) || 0
        })),
        adminNotes: notes,
        expectedDeliveryDate: null,
      };

      await createPurchaseRFQ(payload);
      toast.success("Purchase RFQ sent to supplier.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit RFQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StandardDrawer
      isOpen={true}
      onClose={onClose}
      title="Request Quotation"
      subtitle={`Constructing a Purchase RFQ for ${supplierName}`}
      width="900px"
      footer={
        <>
          <button onClick={onClose} className="btn btn-outline" disabled={isSubmitting}>Cancel</button>
          <button onClick={handleSubmit} className="btn btn-primary" disabled={isSubmitting || rfqItems.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isSubmitting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            Send RFQ to Supplier
          </button>
        </>
      }
    >
          
          <div style={{ padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: '#1d4ed8', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <Info size={18} style={{ flexShrink: 0 }} />
            <div>
              You can propose a <strong>Target Cost</strong> (e.g. asking for a discount on current catalog prices) and request a specific volume. 
              The supplier will review this RFQ in their portal.
            </div>
          </div>

          <table className="gcp-table" style={{ width: '100%', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Product / Variant</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Current Cost</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Target Cost</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Req. Qty</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Total Target Value</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {rfqItems.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.dosage} | SKU: {item.sku}</div>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                    ${parseFloat(item.currentCost).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <span style={{ marginRight: '4px', color: 'var(--text-muted)' }}>$</span>
                      <input 
                        type="number"
                        min="0" step="0.01"
                        value={item.targetCost}
                        onChange={(e) => handleUpdateItem(idx, 'targetCost', e.target.value)}
                        style={{ width: '70px', padding: '0.3rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right', fontWeight: 600, color: item.targetCost < item.currentCost ? '#16a34a' : 'inherit' }}
                      />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input 
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                      style={{ width: '70px', padding: '0.3rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right' }}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    ${((parseFloat(item.targetCost) || 0) * (parseInt(item.quantity, 10) || 0)).toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleRemoveItem(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 600 }}>Total Est. RFQ Value:</td>
                <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
                  ${rfqItems.reduce((acc, item) => acc + ((parseFloat(item.targetCost) || 0) * (parseInt(item.quantity, 10) || 0)), 0).toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Notes to Supplier (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Can we get an additional 5% discount if we double the volume?"
              style={{ width: '100%', minHeight: '80px', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'inherit' }}
            />
          </div>

    </StandardDrawer>
  );
}
