"use client";

import React, { useState, useEffect } from 'react';
import { Card, StandardDrawer, DataTable } from '../../ui';
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

          <DataTable
            data={rfqItems.map((item, idx) => ({ ...item, _idx: idx }))}
            keyField="_idx"
            columns={[
              {
                key: 'product',
                header: 'Product / Variant',
                render: (r) => (
                  <>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.dosage} | SKU: {r.sku}</div>
                  </>
                )
              },
              {
                key: 'currentCost',
                header: 'Current Cost',
                render: (r) => <div style={{ textAlign: 'right', color: 'var(--text-muted)' }}>${parseFloat(r.currentCost).toFixed(2)}</div>
              },
              {
                key: 'targetCost',
                header: 'Target Cost',
                render: (r) => (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span style={{ marginRight: '4px', color: 'var(--text-muted)' }}>$</span>
                    <input 
                      type="number"
                      min="0" step="0.01"
                      value={r.targetCost}
                      onChange={(e) => handleUpdateItem(r._idx, 'targetCost', e.target.value)}
                      style={{ width: '70px', padding: '0.3rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right', fontWeight: 600, color: r.targetCost < r.currentCost ? '#16a34a' : 'inherit' }}
                    />
                  </div>
                )
              },
              {
                key: 'quantity',
                header: 'Req. Qty',
                render: (r) => (
                  <div style={{ textAlign: 'right' }}>
                    <input 
                      type="number"
                      min="1"
                      value={r.quantity}
                      onChange={(e) => handleUpdateItem(r._idx, 'quantity', e.target.value)}
                      style={{ width: '70px', padding: '0.3rem', border: '1px solid var(--border)', borderRadius: '4px', textAlign: 'right' }}
                    />
                  </div>
                )
              },
              {
                key: 'totalValue',
                header: 'Total Target Value',
                render: (r) => <div style={{ textAlign: 'right', fontWeight: 700 }}>${((parseFloat(r.targetCost) || 0) * (parseInt(r.quantity, 10) || 0)).toFixed(2)}</div>
              },
              {
                key: 'actions',
                header: '',
                render: (r) => (
                  <div style={{ textAlign: 'right' }}>
                    <button onClick={() => handleRemoveItem(r._idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <X size={16} />
                    </button>
                  </div>
                )
              }
            ]}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem 0.5rem', borderTop: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <span style={{ fontWeight: 600, marginRight: '1rem' }}>Total Est. RFQ Value:</span>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
              ${rfqItems.reduce((acc, item) => acc + ((parseFloat(item.targetCost) || 0) * (parseInt(item.quantity, 10) || 0)), 0).toFixed(2)}
            </span>
          </div>

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
