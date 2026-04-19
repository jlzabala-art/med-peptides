/**
 * AdminProtocolsTab.jsx
 * Full admin view: list all protocols, edit metadata + phases.
 */
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAllProtocols, updateProtocolFull } from '../../services/protocolStorage';
import {
  RefreshCw, ChevronDown, ChevronRight, Trash2, Save, Check,
  Plus, X, AlertTriangle, FlaskConical, Package, Clock, User,
  GripVertical, Edit3
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['draft', 'active', 'archived'];

const STATUS_STYLE = {
  draft:    { bg: 'rgba(251,191,36,0.15)', color: '#b45309' },
  active:   { bg: 'rgba(16,185,129,0.12)', color: '#065f46' },
  archived: { bg: 'rgba(100,116,139,0.12)', color: '#475569' },
};

// ── PhaseEditor ───────────────────────────────────────────────────────────────
function PhaseEditor({ phases, products: catalogProducts, onChange }) {
  const [productSearch, setProductSearch] = useState('');

  const updatePhase = (pi, patch) =>
    onChange(phases.map((p, i) => (i === pi ? { ...p, ...patch } : p)));

  const addPhase = () =>
    onChange([...phases, { label: `Phase ${phases.length + 1}`, durationWeeks: 4, items: [] }]);

  const removePhase = (pi) => onChange(phases.filter((_, i) => i !== pi));

  const addItem = (pi, product) => {
    const newItem = {
      productId:   product.id,
      productName: product.displayName ?? product.name,
      dosageMg:    product.defaultDosage ?? 0,
      frequency:   'Weekly',
      vialsNeeded: 1,
    };
    updatePhase(pi, { items: [...(phases[pi].items ?? []), newItem] });
    setProductSearch('');
  };

  const updateItem = (pi, ii, patch) =>
    updatePhase(pi, {
      items: phases[pi].items.map((it, i) => (i === ii ? { ...it, ...patch } : it)),
    });

  const removeItem = (pi, ii) =>
    updatePhase(pi, { items: phases[pi].items.filter((_, i) => i !== ii) });

  const filteredProducts = (catalogProducts ?? []).filter(p =>
    !productSearch || (p.displayName ?? p.name ?? '').toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8);

  const inputSm = {
    padding: '0.35rem 0.5rem', borderRadius: '5px',
    border: '1px solid var(--border)', fontSize: '0.82rem', fontFamily: 'inherit',
  };

  return (
    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', background: '#fafbfc' }}>
      {phases.map((phase, pi) => (
        <div key={pi} style={{ marginBottom: '1.25rem', background: 'white',
          borderRadius: '10px', border: '1px solid var(--border)', overflow: 'hidden' }}>

          {/* Phase header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem', background: 'rgba(0,54,102,0.04)',
            borderBottom: '1px solid var(--border)' }}>
            <GripVertical size={15} color="var(--text-muted)" />
            <input value={phase.label ?? ''} placeholder="Phase label"
              onChange={e => updatePhase(pi, { label: e.target.value })}
              style={{ ...inputSm, fontWeight: 700, flex: 1 }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Duration:</span>
            <input type="number" min="1" value={phase.durationWeeks ?? 4} style={{ ...inputSm, width: '60px' }}
              onChange={e => updatePhase(pi, { durationWeeks: parseInt(e.target.value) || 1 })} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>wks</span>
            <button onClick={() => removePhase(pi)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', padding: '0.25rem' }}>
              <Trash2 size={15} />
            </button>
          </div>

          {/* Items table */}
          <div style={{ padding: '0.75rem 1rem' }}>
            {(phase.items ?? []).length === 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: '0.5rem 0' }}>
                No products in this phase yet.
              </p>
            )}
            {(phase.items ?? []).map((item, ii) => (
              <div key={ii} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center',
                marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', minWidth: '150px', flex: 1 }}>
                  {item.productName ?? item.productId}
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <input type="number" min="0" step="0.1" value={item.dosageMg ?? 0}
                    onChange={e => updateItem(pi, ii, { dosageMg: parseFloat(e.target.value) || 0 })}
                    style={{ ...inputSm, width: '70px' }} placeholder="mg" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>mg</span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <select value={item.frequency ?? 'Weekly'}
                    onChange={e => updateItem(pi, ii, { frequency: e.target.value })}
                    style={{ ...inputSm }}>
                    {['Daily','Weekly','Bi-Weekly','Monthly','Custom'].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <input type="number" min="1" value={item.vialsNeeded ?? 1}
                    onChange={e => updateItem(pi, ii, { vialsNeeded: parseInt(e.target.value) || 1 })}
                    style={{ ...inputSm, width: '55px' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>vials</span>
                </div>
                <button onClick={() => removeItem(pi, ii)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--error)', padding: '0.2rem' }}>
                  <X size={13} />
                </button>
              </div>
            ))}

            {/* Add product */}
            <div style={{ marginTop: '0.75rem', position: 'relative' }}>
              <input placeholder="🔍 Add product to phase…"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                style={{ ...inputSm, width: '100%', boxSizing: 'border-box' }} />
              {productSearch && filteredProducts.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'white', border: '1px solid var(--border)', borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredProducts.map(p => (
                    <button key={p.id} onClick={() => addItem(pi, p)}
                      style={{ display: 'block', width: '100%', textAlign: 'left',
                        padding: '0.5rem 0.85rem', border: 'none', background: 'transparent',
                        cursor: 'pointer', fontSize: '0.83rem', borderBottom: '1px solid var(--border)' }}>
                      {p.displayName ?? p.name}
                      <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({p.category})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <button onClick={addPhase}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
          border: '1px dashed var(--primary)', borderRadius: '8px', background: 'rgba(0,54,102,0.04)',
          color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '0.83rem',
          width: '100%', justifyContent: 'center' }}>
        <Plus size={15} /> Add Phase
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminProtocolsTab() {
  const [protocols, setProtocols]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [expanded, setExpanded]       = useState({});
  const [edits, setEdits]             = useState({});     // id → { protocol_name, status, therapeutic_category, phases }
  const [saving, setSaving]           = useState({});
  const [saved, setSaved]             = useState({});
  const [deleting, setDeleting]       = useState(null);
  const [catalogProducts, setCatalog] = useState([]);

  // Fetch all protocols
  const fetchProtocols = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getAllProtocols();
      setProtocols(data);
    } catch (err) {
      setError('Failed to load protocols: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch product catalog for phase editor
  useEffect(() => {
    fetchProtocols();
    getDocs(collection(db, 'products'))
      .then(snap => setCatalog(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
  }, [fetchProtocols]);

  // Edit helpers
  const getEdit = (p) => edits[p.id] ?? {
    protocol_name: p.protocol_name ?? '',
    therapeutic_category: p.therapeutic_category ?? '',
    status: p.status ?? 'draft',
    phases: JSON.parse(JSON.stringify(p.phases ?? [])),
  };

  const setEditField = (id, field, value) =>
    setEdits(prev => ({
      ...prev,
      [id]: { ...getEdit(protocols.find(p => p.id === id)), ...prev[id], [field]: value }
    }));

  const setEditPhases = (id, phases) =>
    setEdits(prev => ({
      ...prev,
      [id]: { ...getEdit(protocols.find(p => p.id === id)), ...prev[id], phases }
    }));

  // Save
  const handleSave = async (id) => {
    const patch = edits[id];
    if (!patch) return;
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      await updateProtocolFull(id, patch);
      setProtocols(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
      setSaved(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setSaved(prev => { const n = { ...prev }; delete n[id]; return n; }), 2000);
      setEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this protocol? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'protocols', id));
      setProtocols(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Styles
  const inputStyle = {
    padding: '0.4rem 0.65rem', borderRadius: '6px',
    border: '1px solid var(--border)', fontSize: '0.85rem', fontFamily: 'inherit', width: '100%'
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
      <RefreshCw size={28} style={{ marginBottom: '1rem' }} /><p>Loading all protocols…</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: '12px',
      border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)', display: 'flex', gap: '0.75rem' }}>
      <AlertTriangle size={20} /><span>{error}</span>
      <button onClick={fetchProtocols}
        style={{ marginLeft: 'auto', padding: '0.35rem 0.85rem', border: '1px solid var(--error)',
          borderRadius: '6px', background: 'transparent', color: 'var(--error)', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>All Protocols</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {protocols.length} total across all users
          </p>
        </div>
        <button onClick={fetchProtocols}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
            border: '1px solid var(--border)', borderRadius: '8px', background: 'white',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {protocols.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: 'white',
          borderRadius: '12px', border: '1px solid var(--border)' }}>
          No protocols saved yet.
        </div>
      )}

      {/* Protocol rows */}
      {protocols.map(p => {
        const isOpen   = !!expanded[p.id];
        const e        = getEdit(p);
        const isDirty  = !!edits[p.id];
        const isSaving = !!saving[p.id];
        const isSaved  = !!saved[p.id];
        const st       = STATUS_STYLE[e.status] ?? STATUS_STYLE.draft;

        return (
          <div key={p.id} className="card"
            style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden',
              border: isOpen ? '1px solid var(--primary-light)' : '1px solid var(--border)',
              transition: 'border-color 0.2s' }}>

            {/* Row header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.85rem 1.25rem', flexWrap: 'wrap' }}>

              <button onClick={() => setExpanded(prev => ({ ...prev, [p.id]: !isOpen }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
                  display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>

              {/* Name (editable inline) */}
              <input value={e.protocol_name}
                onChange={ev => setEditField(p.id, 'protocol_name', ev.target.value)}
                style={{ ...inputStyle, fontWeight: 700, flex: 1, minWidth: '180px', border: isDirty ? '1px solid var(--primary-light)' : '1px solid transparent',
                  background: isDirty ? 'white' : 'transparent' }} />

              {/* Category */}
              <input value={e.therapeutic_category} placeholder="Category"
                onChange={ev => setEditField(p.id, 'therapeutic_category', ev.target.value)}
                style={{ ...inputStyle, width: '140px', fontSize: '0.8rem', color: 'var(--text-muted)' }} />

              {/* Status */}
              <select value={e.status}
                onChange={ev => setEditField(p.id, 'status', ev.target.value)}
                style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', fontWeight: 700,
                  fontSize: '0.8rem', border: '1px solid var(--border)',
                  backgroundColor: st.bg, color: st.color, cursor: 'pointer' }}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Meta badges */}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                <User size={12} /> {p.created_by?.user_name ?? 'Unknown'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                <Clock size={12} /> {formatDate(p.created_at)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                v{p.version_number ?? 1}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                <FlaskConical size={12} style={{ verticalAlign: 'middle' }} /> {(e.phases ?? []).length} phases
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                {isSaved ? (
                  <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Check size={14} /> Saved
                  </span>
                ) : (
                  <button disabled={!isDirty || isSaving} onClick={() => handleSave(p.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.4rem 0.85rem', borderRadius: '6px', border: 'none',
                      backgroundColor: isDirty ? 'var(--primary)' : '#e2e8f0',
                      color: isDirty ? 'white' : 'var(--text-muted)',
                      fontWeight: 700, fontSize: '0.8rem',
                      cursor: isDirty ? 'pointer' : 'not-allowed', opacity: isSaving ? 0.6 : 1 }}>
                    <Save size={13} /> {isSaving ? 'Saving…' : 'Save'}
                  </button>
                )}
                <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.4rem 0.75rem', borderRadius: '6px',
                    border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)',
                    color: 'var(--error)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                  <Trash2 size={13} /> {deleting === p.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>

            {/* Phase editor (expanded) */}
            {isOpen && (
              <PhaseEditor
                phases={e.phases ?? []}
                products={catalogProducts}
                onChange={(phases) => setEditPhases(p.id, phases)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
