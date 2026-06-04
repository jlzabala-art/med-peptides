/**
 * POWidget – Reusable Purchase Order widget.
 * Can be embedded in any portal (admin, wholesaler, supplier, etc.)
 *
 * Props:
 *  - collectionName   {string}  Firestore collection (default: 'purchaseOrders')
 *  - readOnly         {boolean} Disable create/edit (default: false)
 *  - compact          {boolean} Compact card layout (default: false)
 *  - filterFn         {fn}      Optional fn(doc) => bool to filter rows
 *  - onSelect         {fn}      Optional callback when a row is clicked
 */
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../../firebase';
import { X, Plus, Trash2, Save, FileText, CheckCircle, Package, Link, ShoppingCart } from 'lucide-react';

const STATUS_OPTIONS = ['open', 'sent', 'closed'];
const STATUS_STYLE = {
  open:   { bg: '#eff6ff', color: '#2563eb' },
  sent:   { bg: '#fef3c7', color: '#d97706' },
  closed: { bg: '#f0fdf4', color: '#16a34a' },
};
const EMPTY_ITEM = { itemName: '', quantity: 1, unit: 'vial', unitPrice: 0 };

export default function POWidget({
  collectionName = 'purchaseOrders',
  readOnly = false,
  compact = false,
  filterFn = null,
  onSelect = null,
}) {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (filterFn) data = data.filter(filterFn);
      setPos(data);
      setLoading(false);
    });
    return () => unsub();
  }, [collectionName, filterFn]);

  const openCreate = () => { setEditing(null); setShowForm(true); };
  const openEdit   = (po) => {
    if (onSelect) { onSelect(po); return; }
    if (readOnly) return;
    setEditing(po);
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
            <Plus size={14} /> New PO
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
                <th style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', fontWeight: 600, color: '#64748b' }}>PO Number</th>
                <th style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', fontWeight: 600, color: '#64748b' }}>Supplier</th>
                {!compact && <th style={{ padding: '0.75rem', fontWeight: 600, color: '#64748b' }}>Total</th>}
                <th style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', fontWeight: 600, color: '#64748b' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {pos.length === 0 ? (
                <tr><td colSpan={compact ? 4 : 5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No Purchase Orders found.</td></tr>
              ) : pos.map(p => (
                <tr
                  key={p.id}
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: (readOnly && !onSelect) ? 'default' : 'pointer', transition: 'background 150ms' }}
                  onClick={() => openEdit(p)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', color: '#64748b' }}>
                    {p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', fontWeight: 600, color: '#0f172a' }}>{p.poNumber}</td>
                  <td style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem', color: '#3b82f6' }}>{p.supplierName}</td>
                  {!compact && (
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>${Number(p.totalAmount || 0).toFixed(2)}</td>
                  )}
                  <td style={{ padding: compact ? '0.5rem 0.75rem' : '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-start' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: st(p.status).bg, color: st(p.status).color }}>
                        {(p.status || 'open').toUpperCase()}
                      </span>
                      {p.approvalStatus === 'pending_approval' && (
                        <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                          PENDING APPROVAL
                        </span>
                      )}
                      {p.approvalStatus === 'approved' && (
                        <span style={{ padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                          APPROVED
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <POForm
          po={editing}
          collectionName={collectionName}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

// ── Inline form (modal) ──────────────────────────────────────────────────────
function POForm({ po, collectionName, onClose }) {
  const [supplierName, setSupplierName] = useState(po?.supplierName || '');
  const [poNumber]   = useState(po?.poNumber || `PO-${Date.now().toString().slice(-6)}`);
  const [status, setStatus] = useState(po?.status || 'open');
  const [items, setItems]   = useState(po?.items || [{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);

  const totalAmount = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const updateItem = (idx, field, value) => {
    const next = [...items];
    next[idx][field] = value;
    // Rapid entry: auto-add row when typing in last item name
    if (idx === items.length - 1 && field === 'itemName' && value.length > 0) {
      next.push({ ...EMPTY_ITEM });
    }
    setItems(next);
  };
  const removeItem = idx => setItems(items.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!supplierName) return alert('Supplier Name is required');
    setSaving(true);
    let newApprovalStatus = po?.approvalStatus;
    if (totalAmount >= 10000 && (!po || po.approvalStatus !== 'approved')) {
      newApprovalStatus = 'pending_approval';
    } else if (totalAmount < 10000 && (!po || !po.approvalStatus)) {
      newApprovalStatus = 'approved';
    }

    const payload = { 
      supplierName, 
      poNumber, 
      status, 
      items, 
      totalAmount, 
      approvalStatus: newApprovalStatus || 'approved',
      updatedAt: serverTimestamp() 
    };
    try {
      if (po?.id) {
        await updateDoc(doc(db, collectionName, po.id), payload);
      } else {
        await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() });
      }
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save PO');
    }
    setSaving(false);
  };

  const handleConvertToBill = async () => {
    if (!po?.id) return;
    if (!window.confirm('Convert this PO to a Supplier Bill? This will generate a new Bill.')) return;
    setSaving(true);
    try {
      // 1. Create a Bill with the same items
      const billPayload = {
        vendorName: supplierName,
        billNumber: `BILL-${Date.now().toString().slice(-6)}`,
        linkedPoId: po.id,
        linkedPoNumber: poNumber,
        status: 'open',
        items,
        totalAmount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await addDoc(collection(db, 'purchaseBills'), billPayload);

      // 2. Update this PO to 'closed' status
      await updateDoc(doc(db, collectionName, po.id), { status: 'closed', updatedAt: serverTimestamp() });
      
      // 3. Increment Inventory
      if (items && items.length > 0) {
        for (const item of items) {
          const itemName = item.name || item.itemName;
          if (!itemName) continue;
          
          const q = query(collection(db, 'products'), where('name', '==', itemName));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const productDoc = snap.docs[0];
            await updateDoc(doc(db, 'products', productDoc.id), {
              stock: increment(parseInt(item.quantity || 1))
            });
          }
        }
      }

      alert('Bill successfully created and stock updated!');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to convert to Bill');
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
              <ShoppingCart size={18} color="#2563eb" />
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{po ? 'Edit Purchase Order' : 'New Purchase Order'}</h2>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Create an official order based on quoted prices.</p>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: '6px', padding: '4px' }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>Supplier Name *</label>
              <input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="e.g. LotusLand" className="gcp-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.85rem' }}>PO Number</label>
              <input value={poNumber} readOnly className="gcp-input" style={{ width: '100%', backgroundColor: '#f1f5f9' }} />
            </div>
          </div>

          {/* Line items */}
          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Order Items</h3>
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
                  <td colSpan={4} style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>Total Amount:</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>${totalAmount.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Status chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#64748b' }}>Status:</span>
            {po?.approvalStatus === 'pending_approval' ? (
              <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>Locked (Pending Approval)</span>
            ) : (
              STATUS_OPTIONS.map(s => (
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
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: '0 0 12px 12px' }}>
          <div>
            {po?.id && status !== 'closed' && (
              <button 
                onClick={handleConvertToBill} 
                disabled={saving || po?.approvalStatus === 'pending_approval'} 
                className="btn btn-outline" 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', 
                  color: po?.approvalStatus === 'pending_approval' ? '#9ca3af' : '#16a34a', 
                  borderColor: po?.approvalStatus === 'pending_approval' ? '#d1d5db' : '#16a34a',
                  cursor: po?.approvalStatus === 'pending_approval' ? 'not-allowed' : 'pointer'
                }}
                title={po?.approvalStatus === 'pending_approval' ? "Cannot convert while pending approval" : ""}
              >
                <CheckCircle size={15} /> Convert to Bill
              </button>
            )}
            {po?.id && status !== 'closed' && (
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/b2b-po/${po.id}`;
                  navigator.clipboard.writeText(url);
                  alert('Enlace del Portal de Proveedor copiado:\n' + url);
                }} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '6px', 
                  padding: '0.4rem 0.8rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginLeft: '8px'
                }}
              >
                <Link size={15} /> Magic Link Proveedor
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} className="gcp-btn gcp-btn--secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="gcp-btn gcp-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={15} /> {saving ? 'Saving…' : 'Save PO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
