import X from "lucide-react/dist/esm/icons/x";
import Send from "lucide-react/dist/esm/icons/send";
import Plus from "lucide-react/dist/esm/icons/plus";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Save from "lucide-react/dist/esm/icons/save";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import React, { useState, useEffect, useRef } from 'react';
import { addDoc, updateDoc, doc, collection, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';











import { Card } from '../ui';
import ProductAutocomplete from '../shared/ProductAutocomplete';


// ─── Supplier Autocomplete Component ────────────────────────────────────────
function SupplierAutocomplete({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [suppliers, setSuppliers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const wrapperRef = useRef(null);

  // Load all suppliers once
  useEffect(() => {
    getDocs(collection(db, 'suppliers')).then(snap => {
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // Filter as user types
  useEffect(() => {
    if (!query || query.length < 1) {
      setFiltered([]);
      setOpen(false);
      return;
    }
    const q = query.toLowerCase();
    const results = suppliers.filter(s =>
      (s.name || s.displayName || '').toLowerCase().includes(q) ||
      (s.type || '').toLowerCase().includes(q)
    );
    setFiltered(results);
    setOpen(results.length > 0);
  }, [query, suppliers]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (supplier) => {
    const name = supplier.displayName || supplier.name;
    setQuery(name);
    setSelectedSupplier(supplier);
    setOpen(false);
    onChange(name);
    if (onSelect) onSelect(supplier);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedSupplier(null);
    onChange('');
    if (onSelect) onSelect(null);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setSelectedSupplier(null);
          }}
          placeholder="e.g. Lotusland Limited"
          className="gcp-input"
          style={{ width: '100%', paddingRight: query ? '2rem' : '0.75rem' }}
          autoComplete="off"
        />
        {query && (
          <button
            onClick={handleClear}
            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden'
        }}>
          {filtered.map(s => (
            <div
              key={s.id}
              onClick={() => handleSelect(s)}
              style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>
                    {s.displayName || s.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                    {s.type} · {s.email}
                  </div>
                </div>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px',
                  backgroundColor: s.sourceReadOnly ? '#eff6ff' : '#f0fdf4',
                  color: s.sourceReadOnly ? '#2563eb' : '#16a34a',
                  borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '0.5rem'
                }}>
                  {s.sourceReadOnly ? '📚 Zoho Books' : '✓ Local'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected supplier info card */}
      {selectedSupplier && (
        <div style={{
          marginTop: '0.75rem', padding: '0.875rem 1rem',
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem'
        }}>
          {selectedSupplier.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#0369a1' }}>
              <Mail size={13} />
              <span>{selectedSupplier.email}</span>
            </div>
          )}
          {selectedSupplier.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#0369a1' }}>
              <Phone size={13} />
              <span>{selectedSupplier.phone}</span>
            </div>
          )}
          {selectedSupplier.bankName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#0369a1' }}>
              <CreditCard size={13} />
              <span>{selectedSupplier.bankName} · SWIFT: {selectedSupplier.swift}</span>
            </div>
          )}
          {selectedSupplier.sourceReadOnly && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
              <ExternalLink size={11} />
              <span>Master en Zoho Books – solo lectura</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RFQForm Component ───────────────────────────────────────────────────────
export default function RFQForm({ rfq, onClose }) {
  const [supplierName, setSupplierName] = useState(rfq?.supplierName || '');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [rfqNumber, setRfqNumber] = useState(rfq?.rfqNumber || `RFQ-${Date.now().toString().slice(-6)}`);
  const [status, setStatus] = useState(rfq?.status || 'draft');
  const [items, setItems] = useState(rfq?.items || [{ itemName: '', quantity: 1, unit: 'vial', expectedCost: 0, supplierUnitCost: 0, itemDiscount: 0 }]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!supplierName) return alert('Supplier Name is required');
    setIsSaving(true);

    const rfqData = {
      supplierName,
      supplierZohoId: selectedSupplier?.zohoContactId_EUR || selectedSupplier?.id || null,
      rfqNumber,
      status,
      items,
      updatedAt: serverTimestamp()
    };

    try {
      if (rfq?.id) {
        await updateDoc(doc(db, 'purchase_rfqs', rfq.id), rfqData);
      } else {
        rfqData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'purchase_rfqs'), rfqData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving RFQ:', error);
      alert('Failed to save RFQ');
    }
    setIsSaving(false);
  };

  const addItem = () => setItems([...items, { itemName: '', quantity: 1, unit: 'vial', expectedCost: 0, supplierUnitCost: 0, itemDiscount: 0 }]);

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const getStatusColor = (s) => {
    switch (s) {
      case 'draft': return { bg: '#f1f5f9', color: '#475569' };
      case 'sent': return { bg: '#eff6ff', color: '#2563eb' };
      case 'approved': return { bg: '#f0fdf4', color: '#16a34a' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: '900px', maxHeight: '92vh', overflowY: 'auto', padding: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
              {rfq ? 'Edit Request for Quotation' : 'New Request for Quotation'}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Request pricing and availability from suppliers.
            </p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
                <Building2 size={14} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                Supplier Name *
              </label>
              <SupplierAutocomplete
                value={supplierName}
                onChange={setSupplierName}
                onSelect={setSelectedSupplier}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>RFQ Number</label>
              <input
                type="text"
                value={rfqNumber}
                onChange={e => setRfqNumber(e.target.value)}
                className="gcp-input"
                style={{ width: '100%', backgroundColor: '#f1f5f9' }}
                readOnly
              />
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Requested Items</h3>
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
                  {(status === 'PRICING_SUBMITTED' || status === 'approved') && (
                    <>
                      <th style={{ padding: '0.75rem', textAlign: 'right', color: '#16a34a' }}>Supplier Cost</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', color: '#16a34a' }}>Item Discount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', color: '#16a34a' }}>Net Cost</th>
                    </>
                  )}
                  <th style={{ padding: '0.75rem', textAlign: 'center', width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <ProductAutocomplete
                        value={item.itemName}
                        onChange={(val) => updateItem(idx, 'itemName', val)}
                        onSelect={(prod) => {
                          if (prod) {
                            const newItems = [...items];
                            newItems[idx].itemName = prod.dosage ? `${prod.name} (${prod.dosage})` : prod.name;
                            if (prod.unit) newItems[idx].unit = prod.unit;
                            if (prod.costPrice) newItems[idx].expectedCost = prod.costPrice;
                            setItems(newItems);
                          }
                        }}
                        placeholder="Search product (min. 3 chars)..."
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
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                      </select>
                    </td>
                    {(status === 'PRICING_SUBMITTED' || status === 'approved') && (
                      <>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>${parseFloat(item.supplierUnitCost || 0).toFixed(2)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: '#16a34a' }}>-${parseFloat(item.itemDiscount || 0).toFixed(2)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>${(parseFloat(item.supplierUnitCost || 0) - parseFloat(item.itemDiscount || 0)).toFixed(2)}</td>
                      </>
                    )}
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button onClick={() => removeItem(idx)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No items added yet.</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Status:</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['draft', 'sent', 'PRICING_SUBMITTED', 'approved'].map(s => (
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
                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                  }}
                >
                  {status === s && <CheckCircle size={14} />}
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {(status === 'PRICING_SUBMITTED' || status === 'approved') && rfq?.globalDiscount > 0 && (
            <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: '#166534' }}>Global Order Discount applied by supplier:</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#16a34a' }}>-${parseFloat(rfq.globalDiscount).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div>
            {rfq?.id && (
              <button onClick={() => window.open(`/supplier-quote/${rfq.id}`, '_blank')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', backgroundColor: 'white', border: '1px solid #cbd5e1' }}>
                Preview Supplier Portal
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={onClose} className="gcp-btn gcp-btn--secondary">Cancel</button>
            <button onClick={handleSave} disabled={isSaving} className="gcp-btn gcp-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save RFQ'}
            </button>
          </div>
        </div>

      </Card>
    </div>
  );
}