/**
 * WholesalerBulkOrderBuilder.jsx
 *
 * Wholesaler's tool to:
 *   1. View all incoming prescriptions assigned to them
 *   2. View all patient B2C orders
 *   3. Select any combination to include in a bulk order
 *   4. Add their own items (independent procurement)
 *   5. Preview the aggregated/deduplicated item list
 *   6. Submit → calls the submitBulkOrder Cloud Function
 *
 * After submit, admin sees the bulk order in their dashboard as a B2B purchase.
 * Doctors of included prescriptions are notified (via Cloud Function).
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  collection, query, where, onSnapshot, addDoc, doc, updateDoc,
  serverTimestamp, getDocs, limit, orderBy
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { logAction } from '../../services/auditLogger';
import { useAuth } from '../../context/AuthContext';
import {
  PackageOpen, ClipboardList, Plus, Minus, Trash2, Send, Save,
  ChevronDown, ChevronUp, ShoppingBag, User, Stethoscope, Building,
  CheckCircle2, AlertCircle, Loader2, RefreshCw, Eye, Layers
} from 'lucide-react';
import {
  BULK_STATUS, BULK_STATUS_META, RX_STATUS_META, RX_STATUS, aggregatePrescriptionItems
} from '../../config/prescriptionConfig';

const SUBMIT_CF = 'https://europe-west1-med-peptides-app.cloudfunctions.net/submitBulkOrder';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(ts) {
  if (!ts) return '—';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Status pill ───────────────────────────────────────────────────────────────
function BulkStatusPill({ status }) {
  const m = BULK_STATUS_META[status] || BULK_STATUS_META.draft;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      background: m.bg, color: m.color, fontSize: '0.65rem', fontWeight: 800 }}>
      {m.emoji} {m.label}
    </span>
  );
}

// ── Source row: a prescription or order to select ────────────────────────────
function SourceRow({ item, type, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const isPrescription  = type === 'prescription';
  const isOrder         = type === 'order';
  const alreadyInBulk   = Boolean(item.bulkOrderId);

  return (
    <div 
      onClick={() => !alreadyInBulk && onToggle(item.id)}
      style={{
      border: `1.5px solid ${selected ? 'var(--color-primary)' : alreadyInBulk ? 'var(--color-border)' : '#f1f5f9'}`,
      borderRadius: '12px', overflow: 'hidden',
      background: alreadyInBulk ? 'var(--color-bg-app)' : (selected ? 'rgba(0,54,102,0.02)' : 'var(--color-bg-surface)'),
      opacity: alreadyInBulk ? 0.6 : 1,
      transition: 'all 0.12s',
      cursor: alreadyInBulk ? 'not-allowed' : 'pointer'
    }}>
      <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Checkbox */}
        <div 
          style={{
            width: 20, height: 20, borderRadius: '5px', flexShrink: 0, cursor: alreadyInBulk ? 'not-allowed' : 'pointer',
            border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: selected ? 'var(--color-primary)' : 'var(--color-bg-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          {selected && <CheckCircle2 size={12} color="var(--color-bg-surface)" strokeWidth={3} />}
        </div>

        {/* Icon */}
        <div style={{ width: 32, height: 32, borderRadius: '9px', flexShrink: 0,
          background: isPrescription ? 'rgba(0,54,102,0.07)' : 'rgba(16,185,129,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isPrescription ? <ClipboardList size={14} color="var(--color-primary)" /> : <ShoppingBag size={14} color="var(--color-success)" />}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--color-text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isPrescription
              ? (item.patient?.name || item.patient?.email || 'Paciente sin nombre')
              : (item.customerName || item.userName || item.uid?.slice(0, 8))}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', fontWeight: 600, marginTop: '0.1rem',
            display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span>{fmtDate(item.createdAt)}</span>
            {isPrescription && item.doctorName && <span>· Dr. {item.doctorName}</span>}
            {isPrescription && item.diagnosis && <span>· {item.diagnosis}</span>}
            <span>· {(item.items || []).length} ítem{(item.items || []).length !== 1 ? 's' : ''}</span>
            {alreadyInBulk && <span style={{ color: '#6366f1', fontWeight: 700 }}>· Ya en bulk</span>}
          </div>
        </div>

        {/* Rx status */}
        {isPrescription && (
          <span style={{ fontSize: '0.62rem', fontWeight: 700, flexShrink: 0,
            color: RX_STATUS_META[item.status]?.color || 'var(--color-text-tertiary)' }}>
            {RX_STATUS_META[item.status]?.emoji} {RX_STATUS_META[item.status]?.label}
          </span>
        )}

        <button onClick={() => setOpen(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-border)', padding: '0.2rem' }}>
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {open && (
        <div style={{ padding: '0 1rem 0.75rem', borderTop: '1px solid #f8fafc' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
            {(item.items || item.lineItems || []).map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem',
                padding: '0.35rem 0.6rem', borderRadius: '7px', background: 'var(--color-bg-app)' }}>
                <span>{it.type === 'protocol' ? '🧬' : '💊'}</span>
                <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', flex: 1 }}>{it.name || it.productName}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{it.quantity} {it.unit || 'vials'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Own item row in the bulk builder ─────────────────────────────────────────
function OwnItemRow({ item, index, onChange, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.6rem 0.85rem', borderRadius: '10px', background: 'var(--color-bg-app)',
      border: '1px solid #f1f5f9' }}>
      <span>📦</span>
      <input value={item.name} onChange={e => onChange(index, { ...item, name: e.target.value })}
        placeholder="Producto / protocolo…" style={{ ...inp, flex: 1 }} />
      <button onClick={() => onChange(index, { ...item, quantity: Math.max(1, (item.quantity || 1) - 1) })}
        style={qb}>−</button>
      <span style={{ fontWeight: 800, minWidth: 24, textAlign: 'center', fontSize: '0.82rem' }}>
        {item.quantity || 1}
      </span>
      <button onClick={() => onChange(index, { ...item, quantity: (item.quantity || 1) + 1 })} style={qb}>+</button>
      <select value={item.unit || 'vials'}
        onChange={e => onChange(index, { ...item, unit: e.target.value })}
        style={{ ...inp, width: 72 }}>
        {['vials','mg','units','kits'].map(u => <option key={u}>{u}</option>)}
      </select>
      <button onClick={() => onRemove(index)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '0.2rem' }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}

const inp = { fontSize: '0.78rem', border: '1px solid #e2e8f0', borderRadius: '7px',
  padding: '0.3rem 0.55rem', outline: 'none', fontFamily: 'inherit', color: 'var(--color-text-primary)' };
const qb  = { width: 24, height: 24, borderRadius: '5px', border: '1px solid #e2e8f0',
  background: 'var(--color-bg-app)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)' };

// ── Aggregated preview item ───────────────────────────────────────────────────
function AggregatedItemRow({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'var(--color-bg-app)',
      border: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{item.type === 'protocol' ? '🧬' : '💊'}</span>
        <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--color-text-primary)', flex: 1 }}>{item.name || item.id}</span>
        <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{item.quantity}</span>
        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)' }}>{item.unit}</span>
        {item.sources?.length > 0 && (
          <button onClick={() => setOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: '0.1rem' }}>
            <Eye size={12} />
          </button>
        )}
      </div>
      {open && item.sources?.length > 0 && (
        <div style={{ marginTop: '0.4rem', paddingLeft: '1.5rem' }}>
          {item.sources.map((s, i) => (
            <div key={i} style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
              {s.type === 'own' ? '📦 propio' : s.type === 'prescription' ? `💊 Rx de ${s.patientName || '—'} (Dr. ${s.doctorName || '—'})` : `🛒 Order de ${s.patientName || '—'}`}
              {' · '}{s.quantity} {item.unit}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main builder ──────────────────────────────────────────────────────────────
export default function WholesalerBulkOrderBuilder() {
  const { user, userProfile } = useAuth();
  const uid  = user?.uid;
  const name = `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || 'Wholesaler';
  const email = user?.email || '';

  // Sources
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders]               = useState([]);
  const [loadingData, setLoadingData]     = useState(true);

  // Current bulk draft
  const [bulkId, setBulkId]               = useState(null);
  const [selectedPrescriptions, setSP]    = useState(new Set());
  const [selectedOrders, setSO]           = useState(new Set());
  const [ownItems, setOwnItems]           = useState([]);
  const [notes, setNotes]                 = useState('');
  const [tab, setTab]                     = useState('prescriptions'); // 'prescriptions' | 'orders' | 'own' | 'preview'

  // UI state
  const [saving, setSaving]   = useState(false);
  const [submitting, setSub]  = useState(false);
  const [toast, setToast]     = useState(null);
  const [submitted, setDone]  = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load prescriptions assigned to this wholesaler (multi-share model) ──
  useEffect(() => {
    if (!uid) return;
    // New model: wholesalerIds array-contains uid
    // (legacy delivery.wholesalerId single-share docs also appear via Firestore rules)
    const q = query(
      collection(db, 'prescriptions'),
      where('wholesalerIds', 'array-contains', uid),
      limit(50)
    );
    const unsub = onSnapshot(q, snap => {
      // Sort in memory to avoid requiring a composite index
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const validDocs = docs.filter(d => [RX_STATUS.SENT, RX_STATUS.ASSIGNED_TO_WS].includes(d.status));
      console.log('WholesalerBulkOrderBuilder primary query yielded:', validDocs.length, 'docs. Docs:', validDocs);
      
      validDocs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setPrescriptions(validDocs);
      setLoadingData(false);
    }, (err) => {
      console.error("WholesalerBulkOrderBuilder primary query failed:", err);
      // Fallback: legacy single-wholesaler field (for old documents)
      const qLegacy = query(
        collection(db, 'prescriptions'),
        where('delivery.wholesalerId', '==', uid),
        limit(50)
      );
      const unsubLegacy = onSnapshot(qLegacy, snap => {
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setPrescriptions(docs);
        setLoadingData(false);
      }, (err2) => {
        console.error("WholesalerBulkOrderBuilder legacy query failed:", err2);
        setPrescriptions([{ id: 'error', patient: { name: `ERROR: primary: ${err.message}. legacy: ${err2.message}` } }]);
        setLoadingData(false);
      });
      return () => unsubLegacy();
    });
    return () => unsub();
  }, [uid]);

  // ── Load all B2C patient orders ─────────────────────────────────────────
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(q, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, [uid]);

  // ── Computed aggregated preview ─────────────────────────────────────────
  const selectedRxData  = prescriptions.filter(p => selectedPrescriptions.has(p.id));
  const selectedOrdData = orders.filter(o => selectedOrders.has(o.id));

  // Build aggregated items (client-side preview — CF recomputes at submit)
  const aggregated = (() => {
    const map = new Map();
    const addItems = (items, source) => {
      for (const item of items || []) {
        const key = `${item.type || 'product'}__${item.id || item.productId}`;
        if (map.has(key)) {
          const ex = map.get(key);
          ex.quantity += Number(item.quantity) || 0;
          ex.sources.push({ ...source, quantity: Number(item.quantity) || 0 });
        } else {
          map.set(key, { ...item, quantity: Number(item.quantity) || 0,
            sources: [{ ...source, quantity: Number(item.quantity) || 0 }] });
        }
      }
    };
    selectedRxData.forEach(rx => addItems(rx.items, { type: 'prescription', patientName: rx.patient?.name, doctorName: rx.doctorName }));
    selectedOrdData.forEach(o => addItems(o.items || o.lineItems, { type: 'order', patientName: o.customerName }));
    ownItems.filter(i => i.name).forEach(i => addItems([i], { type: 'own' }));
    return Array.from(map.values());
  })();

  const totalSelected = selectedPrescriptions.size + selectedOrders.size;

  // ── Toggle selections ───────────────────────────────────────────────────
  const toggleRx   = id => setSP(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleOrd  = id => setSO(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // ── Own items management ────────────────────────────────────────────────
  const addOwn    = () => setOwnItems(p => [...p, { id: `own_${Date.now()}`, type: 'product', name: '', quantity: 1, unit: 'vials' }]);
  const updateOwn = (i, v) => setOwnItems(p => p.map((x, idx) => idx === i ? v : x));
  const removeOwn = (i) => setOwnItems(p => p.filter((_, idx) => idx !== i));

  // ── Save draft ──────────────────────────────────────────────────────────
  const saveDraft = async () => {
    if (totalSelected === 0 && ownItems.filter(i => i.name).length === 0) {
      showToast('Selecciona al menos una fuente o añade un ítem propio.', false); return;
    }
    setSaving(true);
    try {
      const payload = {
        wholesalerId:            uid,
        wholesalerName:          name,
        wholesalerEmail:         email,
        status:                  BULK_STATUS.DRAFT,
        source_prescription_ids: [...selectedPrescriptions],
        source_order_ids:        [...selectedOrders],
        own_items:               ownItems.filter(i => i.name),
        notes,
        updatedAt:               serverTimestamp(),
        timeline:                [{ event: 'draft_saved', actorId: uid, actorRole: 'wholesaler', note: '', timestamp: new Date().toISOString() }],
      };
      if (bulkId) {
        await updateDoc(doc(db, 'bulk_orders', bulkId), payload);
        await logAction(uid, 'wholesaler', 'BULK_ORDER_UPDATE_DRAFT', bulkId, { itemsCount: items.length });
      } else {
        const ref = await addDoc(collection(db, 'bulk_orders'), { ...payload, createdAt: serverTimestamp() });
        setBulkId(ref.id);
        await logAction(uid, 'wholesaler', 'BULK_ORDER_CREATE_DRAFT', ref.id, { itemsCount: items.length });
      }
      showToast('Borrador guardado.');
    } catch (err) { console.error(err); showToast('Error al guardar.', false); }
    finally { setSaving(false); }
  };

  // ── Submit via Cloud Function ───────────────────────────────────────────
  const submitBulk = async () => {
    if (!bulkId) { showToast('Guarda el borrador primero.', false); return; }
    setSub(true);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const res = await fetch(SUBMIT_CF, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ bulkOrderId: bulkId, notes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Submit failed');
      setDone(true);
      showToast(`✅ Bulk order enviado al admin. ${json.aggregated_items?.length || 0} líneas, ${json.totalItems || 0} unidades totales.`);
    } catch (err) { console.error(err); showToast(err.message, false); }
    finally { setSub(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          padding: '0.75rem 1.25rem', borderRadius: '12px',
          background: toast.ok ? '#0f172a' : 'var(--color-danger)', color: 'var(--color-bg-surface)',
          fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', animation: 'bkFadeIn 0.2s ease' }}>
          {toast.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(99,102,241,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={20} color="#6366f1" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
              Bulk Order Builder
            </h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
              {bulkId ? `Draft ID: ${bulkId.slice(0, 8)}…` : 'Sin guardar'}
              {totalSelected > 0 && ` · ${totalSelected} fuentes seleccionadas`}
              {ownItems.filter(i => i.name).length > 0 && ` · ${ownItems.filter(i => i.name).length} propios`}
            </p>
          </div>
        </div>
        {submitted && <BulkStatusPill status="submitted" />}
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '0.35rem', padding: '0.3rem', borderRadius: '12px',
        background: '#f1f5f9' }}>
        {[
          { id: 'prescriptions', label: `💊 Prescripciones (${prescriptions.length})` },
          { id: 'orders',        label: `🛒 Orders B2C (${orders.length})` },
          { id: 'own',           label: `📦 Propios (${ownItems.length})` },
          { id: 'preview',       label: `👁️ Preview (${aggregated.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '0.55rem 0.5rem', borderRadius: '9px', cursor: 'pointer',
            border: 'none', fontFamily: 'inherit', fontSize: '0.72rem', fontWeight: 700,
            background: tab === t.id ? 'var(--color-bg-surface)' : 'transparent',
            color: tab === t.id ? '#0f172a' : 'var(--color-text-secondary)',
            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.12s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Prescriptions ─────────────────────────────────────────── */}
      {tab === 'prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {loadingData ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem', fontSize: '0.85rem' }}>
              <Loader2 size={20} style={{ animation: 'bkSpin 1s linear infinite' }} />
            </div>
          ) : prescriptions.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem', fontSize: '0.82rem' }}>
              <ClipboardList size={30} strokeWidth={1.5} style={{ marginBottom: '0.5rem' }} />
              <div>No tienes prescripciones asignadas aún.</div>
            </div>
          ) : (
            prescriptions.map(rx => (
              <SourceRow key={rx.id} item={rx} type="prescription"
                selected={selectedPrescriptions.has(rx.id)} onToggle={toggleRx} />
            ))
          )}
        </div>
      )}

      {/* ── Tab: B2C Orders ──────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '2rem', fontSize: '0.82rem' }}>
              <ShoppingBag size={30} strokeWidth={1.5} style={{ marginBottom: '0.5rem' }} />
              <div>No hay órdenes de pacientes disponibles.</div>
            </div>
          ) : (
            orders.map(o => (
              <SourceRow key={o.id} item={o} type="order"
                selected={selectedOrders.has(o.id)} onToggle={toggleOrd} />
            ))
          )}
        </div>
      )}

      {/* ── Tab: Own items ────────────────────────────────────────────────── */}
      {tab === 'own' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Añade productos o protocolos para tu propio stock de clínica, independientemente de prescripciones u órdenes.
          </div>
          {ownItems.map((item, i) => (
            <OwnItemRow key={i} item={item} index={i} onChange={updateOwn} onRemove={removeOwn} />
          ))}
          <button onClick={addOwn} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem',
            borderRadius: '10px', border: '1.5px dashed #e2e8f0', background: '#fafbfc',
            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-secondary)', fontFamily: 'inherit',
          }}>
            <Plus size={13} /> Añadir ítem propio
          </button>
        </div>
      )}

      {/* ── Tab: Preview ─────────────────────────────────────────────────── */}
      {tab === 'preview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
            Vista agregada de todos los ítems seleccionados (deduplicados y sumados):
          </div>
          {aggregated.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '1.5rem', fontSize: '0.82rem' }}>
              Selecciona fuentes o añade ítems propios para ver el resumen.
            </div>
          ) : (
            <>
              {aggregated.map((item, i) => <AggregatedItemRow key={i} item={item} />)}
              <div style={{ textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                {aggregated.length} líneas · {aggregated.reduce((s, i) => s + i.quantity, 0)} unidades totales
              </div>
            </>
          )}
        </div>
      )}

      {/* Notes */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem',
        fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Notas para el admin
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          rows={2} placeholder="Instrucciones especiales, urgencias, condiciones de entrega…"
          style={{ fontSize: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '10px',
            padding: '0.65rem 0.85rem', outline: 'none', fontFamily: 'inherit',
            color: 'var(--color-text-primary)', resize: 'vertical', lineHeight: 1.5 }} />
      </label>

      {/* Actions */}
      {!submitted && (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={saveDraft} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.7rem 1.1rem', borderRadius: '10px',
            border: '1.5px solid #e2e8f0', background: 'var(--color-bg-surface)',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-secondary)', fontFamily: 'inherit',
          }}>
            {saving ? <Loader2 size={13} style={{ animation: 'bkSpin 1s linear infinite' }} /> : <Save size={13} />}
            Guardar borrador
          </button>

          <button onClick={submitBulk} disabled={submitting || !bulkId} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.7rem 1.5rem', borderRadius: '10px',
            border: 'none', background: submitting || !bulkId ? 'var(--color-text-tertiary)' : '#6366f1',
            cursor: submitting || !bulkId ? 'not-allowed' : 'pointer',
            fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-bg-surface)', fontFamily: 'inherit',
            boxShadow: submitting || !bulkId ? 'none' : '0 4px 14px rgba(99,102,241,0.3)',
          }}>
            {submitting ? <Loader2 size={13} style={{ animation: 'bkSpin 1s linear infinite' }} /> : <Send size={13} />}
            Enviar al Admin
          </button>
        </div>
      )}

      {submitted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 1.25rem', borderRadius: '12px',
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <CheckCircle2 size={18} color="#6366f1" />
          <div>
            <div style={{ fontWeight: 800, color: '#312e81', fontSize: '0.85rem' }}>
              Bulk Order enviado correctamente al Admin
            </div>
            <div style={{ fontSize: '0.72rem', color: '#818cf8' }}>
              El equipo de Med-Peptides ha sido notificado y procesará tu pedido.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bkSpin   { to { transform: rotate(360deg); } }
        @keyframes bkFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
