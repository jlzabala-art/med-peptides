"use client";

import React, { useState } from 'react';
import X from "lucide-react/dist/esm/icons/x";
import Send from "lucide-react/dist/esm/icons/send";
import { useProcurementManager } from '../../hooks/data/useProcurementManager';
import StandardDrawer from '../ui/StandardDrawer';
import DataTable from '../ui/DataTable';
import { toast } from 'react-hot-toast';
import { buildWhatsAppRFQUrl } from '../../utils/whatsappRFQHelper';

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
      toast.error('Error submitting quotation: ' + err.message);
    }
  };

  const [isConverting, setIsConverting] = useState(false);

  const handleConvertToPO = async () => {
    try {
      setIsConverting(true);
      const res = await fetch('/api/catalog/convert-quotation-to-po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId: rfq.id, notes: rfq.notes || '' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Purchase Order generated: ${data.poNumber}`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to generate Purchase Order');
      }
    } catch (err) {
      toast.error('Error generating PO: ' + err.message);
    } finally {
      setIsConverting(false);
    }
  };

  const isPending = rfq.status === 'pending_supplier';
  const canConvertToPO = rfq.status === 'supplier_quoted' || rfq.status === 'accepted';
  const subtotal = calculateSubtotal();
  const total = subtotal + (parseFloat(shippingCost) || 0);

  return (
    <StandardDrawer
      isOpen={true}
      onClose={onClose}
      title={isPending ? 'Respond to Quotation Request' : 'Quotation Details'}
      subtitle={`RFQ ID: ${rfq.prfqId || rfq.id}`}
      width="800px"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={loading || isConverting}>
            Close
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              const waUrl = buildWhatsAppRFQUrl(rfq, rfq.supplierPhone || '');
              window.open(waUrl, '_blank', 'noopener,noreferrer');
            }}
            style={{
              backgroundColor: '#25D366',
              color: '#ffffff',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem'
            }}
          >
            📱 Send RFQ via WhatsApp
          </button>
          {canConvertToPO && (
            <button
              className="btn btn-primary"
              onClick={handleConvertToPO}
              disabled={isConverting}
              style={{ background: '#2563eb', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Send size={15} />
              {isConverting ? 'Generating PO...' : 'Convert to PO'}
            </button>
          )}
          {isPending && (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              <Send size={16} />
              {loading ? 'Submitting...' : 'Submit Quotation to Admin'}
            </button>
          )}
        </div>
      }
    >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Items Table */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 1rem 0' }}>Requested Items</h3>
            <DataTable
              columns={[
                {
                  key: 'name',
                  header: 'Product',
                  render: (val, row) => (
                    <div>
                      <div style={{ fontWeight: 600 }}>{val}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.variantName}</div>
                    </div>
                  ),
                },
                { key: 'qty', header: 'Qty' },
                {
                  key: 'proposedUnitPrice',
                  header: 'Admin Proposed',
                  render: (val, row) => <span style={{ color: 'var(--text-muted)' }}>${(val || row.price || 0).toFixed(2)}</span>,
                },
                {
                  key: 'finalUnitPrice',
                  header: 'Your Final Price',
                  render: (val, row) => {
                    const idx = items.findIndex(i => i === row || i.name === row.name);
                    return isPending ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        $ <input
                          type="number"
                          className="input"
                          style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                          value={items[idx]?.finalUnitPrice ?? val}
                          onChange={(e) => handlePriceChange(idx, e.target.value)}
                          min="0" step="0.01"
                        />
                      </div>
                    ) : (
                      <div style={{ fontWeight: 600 }}>${(val || row.proposedUnitPrice || 0).toFixed(2)}</div>
                    );
                  },
                },
                {
                  key: '_lineTotal',
                  header: 'Line Total',
                  render: (_, row) => {
                    const idx = items.findIndex(i => i === row || i.name === row.name);
                    const price = items[idx]?.finalUnitPrice ?? row.finalUnitPrice ?? 0;
                    return <span style={{ fontWeight: 600 }}>${(price * row.qty).toFixed(2)}</span>;
                  },
                },
              ]}
              data={items}
              keyField="name"
            />
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
