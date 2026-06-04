import React, { useState } from 'react';
import { addDoc, updateDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, Plus, Trash2, CheckCircle, Save, Link as LinkIcon } from 'lucide-react';
import { Card } from '../ui';

export default function BillForm({ bill, onClose }) {
  const [supplierName, setSupplierName] = useState(bill?.supplierName || '');
  const [billNumber, setBillNumber] = useState(bill?.billNumber || `BILL-${Date.now().toString().slice(-6)}`);
  const [poReference, setPoReference] = useState(bill?.poReference || '');
  const [status, setStatus] = useState(bill?.status || 'unpaid');
  const [items, setItems] = useState(bill?.items || [{ itemName: '', quantity: 1, unit: 'vial', unitPrice: 0 }]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!supplierName) return alert('Supplier Name is required');
    setIsSaving(true);
    
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    const billData = {
      supplierName,
      billNumber,
      poReference,
      status,
      items,
      totalAmount,
      updatedAt: serverTimestamp()
    };

    try {
      if (bill?.id) {
        await updateDoc(doc(db, 'purchaseBills', bill.id), billData);
      } else {
        billData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'purchaseBills'), billData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving Bill:', error);
      alert('Failed to save Bill');
    }
    setIsSaving(false);
  };

  const addItem = () => setItems([...items, { itemName: '', quantity: 1, unit: 'vial', unitPrice: 0 }]);
  
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Rapid entry: add a new empty line if the last row is being typed into
    if (index === items.length - 1 && field === 'itemName' && value.length > 0) {
      newItems.push({ itemName: '', quantity: 1, unit: 'vial', unitPrice: 0 });
    }
    
    setItems(newItems);
  };
  
  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const getStatusColor = (s) => {
    switch(s) {
      case 'unpaid': return { bg: '#fff7ed', color: '#ea580c' };
      case 'paid': return { bg: '#f0fdf4', color: '#16a34a' };
      case 'pending_approval': return { bg: '#fee2e2', color: '#dc2626' };
      case 'void': return { bg: '#fef2f2', color: '#ef4444' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: '900px', maxHeight: '90vh', overflowY: 'auto', padding: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              {bill ? 'Edit Supplier Bill' : 'New Supplier Bill'}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Record an invoice received from a supplier for goods or services.
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Supplier Name *</label>
              <input 
                type="text" 
                value={supplierName} 
                onChange={e => setSupplierName(e.target.value)}
                placeholder="e.g. LotusLand"
                className="gcp-input"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>Bill / Invoice Number</label>
              <input 
                type="text" 
                value={billNumber} 
                onChange={e => setBillNumber(e.target.value)}
                className="gcp-input"
                style={{ width: '100%' }}
                placeholder="e.g. INV-2023-001"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <LinkIcon size={14} /> PO Reference
              </label>
              <input 
                type="text" 
                value={poReference} 
                onChange={e => setPoReference(e.target.value)}
                className="gcp-input"
                style={{ width: '100%' }}
                placeholder="e.g. PO-123456"
              />
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Billed Items</h3>
            <button onClick={addItem} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2563eb', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              <Plus size={16} /> Add Item
            </button>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '2rem' }}>
            <table className="gcp-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item Description</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', width: '100px' }}>Qty</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', width: '100px' }}>Unit</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', width: '120px' }}>Unit Price</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', width: '120px' }}>Total</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <input 
                        type="text" 
                        value={item.itemName} 
                        onChange={(e) => updateItem(idx, 'itemName', e.target.value)}
                        placeholder="e.g. Tirzepatide 10mg"
                        className="gcp-input"
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <input 
                        type="number" min="1"
                        value={item.quantity} 
                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                        className="gcp-input"
                        style={{ width: '100%', textAlign: 'right' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <select 
                        value={item.unit}
                        onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                        className="gcp-input"
                        style={{ width: '100%' }}
                      >
                        <option value="vial">vial</option>
                        <option value="box">box</option>
                        <option value="kg">kg</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span>$</span>
                        <input 
                          type="number" min="0" step="0.01"
                          value={item.unitPrice} 
                          onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="gcp-input"
                          style={{ width: '100%', textAlign: 'right' }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button onClick={() => removeItem(idx)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                <tr>
                  <td colSpan="4" style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Amount Due:</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                    ${totalAmount.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            {items.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No items added yet.</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Status:</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['unpaid', 'pending_approval', 'paid', 'void'].map(s => (
                <button 
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{ 
                    padding: '0.4rem 1rem', 
                    borderRadius: '20px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    border: status === s ? `2px solid ${getStatusColor(s).color}` : '1px solid #cbd5e1',
                    backgroundColor: status === s ? getStatusColor(s).bg : 'white',
                    color: status === s ? getStatusColor(s).color : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {status === s && <CheckCircle size={14} />}
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: '#f8fafc' }}>
          <button onClick={onClose} className="gcp-btn gcp-btn--secondary">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="gcp-btn gcp-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Bill'}
          </button>
        </div>

      </Card>
    </div>
  );
}
