import Receipt from "lucide-react/dist/esm/icons/receipt";
import Plus from "lucide-react/dist/esm/icons/plus";
import X from "lucide-react/dist/esm/icons/x";
import Save from "lucide-react/dist/esm/icons/save";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import LinkIcon from "lucide-react/dist/esm/icons/link";
/**
 * BillsWidget – Reusable Supplier Bills widget.
 * Can be embedded in any portal.
 *
 * Props:
 *  - collectionName  {string}  Firestore collection (default: 'purchaseBills')
 *  - readOnly        {boolean} Disable create/edit (default: false)
 *  - compact         {boolean} Compact layout (default: false)
 *  - filterFn        {fn}      Optional doc filter
 *  - onSelect        {fn}      Optional row-click callback
 */
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase';








const STATUS_OPTIONS = ['unpaid', 'paid', 'void'];
const STATUS_STYLE = {
  unpaid: { bg: '#fff7ed', color: '#ea580c' },
  paid:   { bg: '#f0fdf4', color: '#16a34a' },
  void:   { bg: '#fef2f2', color: '#ef4444' },
};
const EMPTY_ITEM = { itemName: '', quantity: 1, unit: 'vial', unitPrice: 0 };

export default function BillsWidget({
  collectionName = 'purchaseBills',
  readOnly = false,
  compact = false,
  filterFn = null,
  onSelect = null,
}) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (filterFn) data = data.filter(filterFn);
      setBills(data);
      setLoading(false);
    });
    return () => unsub();
  }, [collectionName, filterFn]);

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit   = (bill) => {
    if (onSelect) { onSelect(bill); return; }
    if (readOnly) return;
    setEditing(bill);
    setShowForm(true);
  };

  const st = (s) => STATUS_STYLE[s] || { bg: '#f1f5f9', color: '#475569' };

  return (
    <div>
      {!compact && !readOnly && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <Plus size={14} /> New Bill
          </button>
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: compact ? '0.8rem' : '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', fontWeight: 600, color: '#64748b' }}>Date</th>
                <th style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', fontWeight: 600, color: '#64748b' }}>Bill #</th>
                <th style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', fontWeight: 600, color: '#64748b' }}>Supplier</th>
                {!compact && <th style={{ padding: '0.75rem', fontWeight: 600, color: '#64748b' }}>PO Ref</th>}
                {!compact && <th style={{ padding: '0.75rem', fontWeight: 600, color: '#64748b' }}>Amount Due</th>}
                <th style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', fontWeight: 600, color: '#64748b' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr><td colSpan={compact ? 4 : 6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No Supplier Bills found.</td></tr>
              ) : bills.map(b => (
                <tr
                  key={b.id}
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: (readOnly && !onSelect) ? 'default' : 'pointer', transition: 'background 150ms' }}
                  onClick={() => openEdit(b)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', color: '#64748b' }}>
                    {b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', fontWeight: 600, color: '#0f172a' }}>{b.billNumber}</td>
                  <td style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', color: '#3b82f6' }}>{b.supplierName}</td>
                  {!compact && <td style={{ padding: '0.75rem', color: '#64748b' }}>{b.poReference || '—'}</td>}
                  {!compact && <td style={{ padding: '0.75rem', fontWeight: 600 }}>${Number(b.totalAmount || 0).toFixed(2)}</td>}
                  <td style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: st(b.status).bg, color: st(b.status).color }}>
                      {(b.status || 'unpaid').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <BillForm
          bill={editing}
          collectionName={collectionName}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

// ── Inline form (modal) ──────────────────────────────────────────────────────
function BillForm({ bill, collectionName, onClose }) {
  const [supplierName, setSupplierName] = useState(bill?.supplierName || '');
  const [billNumber, setBillNumber]     = useState(bill?.billNumber || `BILL-${Date.now().toString().slice(-6)}`);
  const [poReference, setPoReference]  = useState(bill?.poReference || '');
  const [status, setStatus]            = useState(bill?.status || 'unpaid');
  const [items, setItems]              = useState(bill?.items || [{ ...EMPTY_ITEM }]);
  const [saving, setSaving]            = useState(false);

  const totalAmount = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const updateItem = (idx, field, value) => {
    const next = [...items];
    next[idx][field] = value;
    if (idx === items.length - 1 && field === 'itemName' && value.length > 0) {
      next.push({ ...EMPTY_ITEM });
    }
    setItems(next);
  };
  const removeItem = idx => setItems(items.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!supplierName) return alert('Supplier Name is required');
    setSaving(true);
    const payload = { supplierName, billNumber, poReference, status, items, totalAmount, updatedAt: serverTimestamp() };
    try {
      if (bill?.id) {
        await updateDoc(doc(db, collectionName, bill.id), payload);
      } else {
        await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() });
      }
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save Bill');
    }
    setSaving(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '900px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '12px 12px 0 0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={18} color="#ea580c" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{bill ? 'Edit Supplier Bill' : 'New Supplier Bill'}</h2>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Record an invoice received from a supplier.</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: '6px', padding: '4px' }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Supplier Name *</label>
              <input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="e.g. LotusLand" className="gcp-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Bill / Invoice Number</label>
              <input value={billNumber} onChange={e => setBillNumber(e.target.value)} placeholder="e.g. INV-2024-001" className="gcp-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LinkIcon size={12} /> PO Reference
              </label>
              <input value={poReference} onChange={e => setPoReference(e.target.value)} placeholder="e.g. PO-123456" className="gcp-input" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Line items */}
          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Billed Items</h3>
            <button onClick={() => setItems([...items, { ...EMPTY_ITEM }])} style={{ fontSize: '0.8rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={14} /> Add Row
            </button>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>Item Description</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', width: '80px', fontWeight: 600, color: '#64748b' }}>Qty</th>
                  <th style={{ padding: '0.6rem 0.75rem', width: '90px', fontWeight: 600, color: '#64748b' }}>Unit</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', width: '110px', fontWeight: 600, color: '#64748b' }}>Unit Price</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', width: '100px', fontWeight: 600, color: '#64748b' }}>Total</th>
                  <th style={{ width: '36px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <input value={item.itemName} onChange={e => updateItem(idx, 'itemName', e.target.value)} placeholder="e.g. Tirzepatide 10mg" className="gcp-input" style={{ width: '100%' }} />
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} className="gcp-input" style={{ width: '100%', textAlign: 'right' }} />
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <select value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} className="gcp-input" style={{ width: '100%' }}>
                        <option value="vial">vial</option>
                        <option value="box">box</option>
                        <option value="kg">kg</option>
                        <option value="mg">mg</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="gcp-input" style={{ width: '100%', textAlign: 'right' }} />
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.5rem 0.4rem', textAlign: 'center' }}>
                      <button onClick={() => removeItem(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                <tr>
                  <td colSpan={4} style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>Amount Due:</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>${totalAmount.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Status chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748b' }}>Status:</span>
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  border: status === s ? `2px solid ${STATUS_STYLE[s].color}` : '1px solid #cbd5e1',
                  backgroundColor: status === s ? STATUS_STYLE[s].bg : 'white',
                  color: status === s ? STATUS_STYLE[s].color : '#64748b',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                {status === s && <CheckCircle size={12} />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0 0 12px 12px' }}>
          <button onClick={onClose} className="gcp-btn gcp-btn--secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="gcp-btn gcp-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Bill'}
          </button>
        </div>
      </div>
    </div>
  );
}