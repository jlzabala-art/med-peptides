/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/**
 * AdminProtocolsTab.jsx
 * Full admin view: list all protocols, edit metadata + phases.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { getPaginatedProtocols, updateProtocolFull } from '../../services/protocolStorage';
import {
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Trash2,
  Save,
  Check,
  Plus,
  X,
  AlertTriangle,
  FlaskConical,
  Package,
  Clock,
  User,
  GripVertical,
  Edit3,
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['draft', 'active', 'archived'];

const STATUS_STYLE = {
  draft: { bg: 'var(--status-draft-bg)', color: 'var(--status-draft-color)' },
  active: { bg: 'var(--status-active-bg)', color: 'var(--status-active-color)' },
  archived: { bg: 'var(--status-archived-bg)', color: 'var(--status-archived-color)' },
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
      productId: product.id,
      productName: product.displayName ?? product.name,
      dosageMg: product.defaultDosage ?? 0,
      frequency: 'Weekly',
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

  const filteredProducts = (catalogProducts ?? [])
    .filter(
      (p) =>
        p &&
        (!productSearch ||
          (p.displayName ?? p.name ?? '').toLowerCase().includes(productSearch.toLowerCase()))
    )
    .slice(0, 8);

  return (
    <div className="phase-editor-root">
      <AnimatePresence initial={false}>
        {phases.map((phase, pi) => (
          <motion.div
            key={pi}
            className="phase-card"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {/* Phase header */}
            <div className="phase-card-header">
              <GripVertical size={15} color="var(--text-muted)" style={{ cursor: 'grab' }} />
              <input
                value={phase.label ?? ''}
                placeholder="Phase label"
                aria-label="Edit phase label"
                onChange={(e) => updatePhase(pi, { label: e.target.value })}
                className="admin-premium-input"
                style={{ fontWeight: 500, flex: 1 }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Duration:
              </span>
              <input
                type="number"
                min="1"
                value={phase.durationWeeks ?? 4}
                className="admin-premium-input"
                style={{ width: '65px', textAlign: 'center' }}
                aria-label="Edit phase duration in weeks"
                onChange={(e) => updatePhase(pi, { durationWeeks: parseInt(e.target.value) || 1 })}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                wks
              </span>
              <button
                onClick={() => removePhase(pi)}
                aria-label="Remove phase"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--error)',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Items list */}
            <div style={{ padding: '0.5rem 0' }}>
              {(phase.items ?? []).length === 0 && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    padding: '1rem 0',
                  }}
                >
                  No products in this phase yet.
                </p>
              )}
              <AnimatePresence initial={false}>
                {(phase.items ?? []).map((item, ii) => (
                  <motion.div
                    key={ii}
                    className="phase-product-row"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        color: 'var(--text-main)',
                        display: 'block',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.productName ?? item.productId}
                    </span>

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.dosageMg ?? 0}
                        aria-label="Edit dosage in milligrams"
                        onChange={(e) =>
                          updateItem(pi, ii, { dosageMg: parseFloat(e.target.value) || 0 })
                        }
                        className="admin-premium-input"
                        style={{ width: '75px', textAlign: 'center' }}
                        placeholder="mg"
                      />
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                        }}
                      >
                        mg
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <select
                        value={item.frequency ?? 'Weekly'}
                        aria-label="Select dosage frequency"
                        onChange={(e) => updateItem(pi, ii, { frequency: e.target.value })}
                        className="admin-premium-select"
                        style={{ width: '100%', cursor: 'pointer' }}
                      >
                        {['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Custom'].map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        value={item.vialsNeeded ?? 1}
                        aria-label="Edit vials needed quantity"
                        onChange={(e) =>
                          updateItem(pi, ii, { vialsNeeded: parseInt(e.target.value) || 1 })
                        }
                        className="admin-premium-input"
                        style={{ width: '60px', textAlign: 'center' }}
                      />
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                        }}
                      >
                        vials
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem(pi, ii)}
                      aria-label="Remove product"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--error)';
                        e.currentTarget.style.transform = 'scale(1.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add product */}
              <div style={{ padding: '0.75rem 1rem 0.5rem', position: 'relative' }}>
                <input
                  placeholder="🔍 Add product to phase…"
                  aria-label="Search and add product to phase"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="admin-premium-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
                <AnimatePresence>
                  {productSearch && filteredProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '1rem',
                        right: '1rem',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: 'var(--shadow-sm)',
                        zIndex: 100,
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}
                    >
                      {filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => addItem(pi, p)}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.65rem 0.85rem',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.83rem',
                            borderBottom: '1px solid var(--border-light)',
                            color: 'var(--text-main)',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = 'var(--accent-soft)')
                          }
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {p.displayName ?? p.name}
                          <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                            ({p.category})
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={addPhase}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 1rem',
          border: '1px dashed var(--primary)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-soft)',
          color: 'var(--primary)',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.83rem',
          width: '100%',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-medium)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent-soft)')}
      >
        <Plus size={15} /> Add Phase
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminProtocolsTab() {
  const { toast } = useToast();
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [edits, setEdits] = useState({}); // id → { protocol_name, status, therapeutic_category, phases }
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [deleting, setDeleting] = useState(null);
  const [catalogProducts, setCatalog] = useState([]);

  // Fetch initial protocols
  const fetchProtocols = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        protocols: data,
        lastDoc: last,
        hasMore: more,
      } = await getPaginatedProtocols(null, 20);
      setProtocols(data);
      setLastDoc(last);
      setHasMore(more);
    } catch (err) {
      setError('Failed to load protocols: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const {
        protocols: data,
        lastDoc: last,
        hasMore: more,
      } = await getPaginatedProtocols(lastDoc, 20);
      setProtocols((prev) => [...prev, ...data]);
      setLastDoc(last);
      setHasMore(more);
    } catch (err) {
      setError('Failed to load more protocols: ' + err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  // Fetch all protocols
  useEffect(() => {
    fetchProtocols();
  }, [fetchProtocols]);

  // Fetch product catalog for phase editor
  useEffect(() => {
    getDocs(collection(db, 'products'))
      .then((snap) => setCatalog(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => {});
  }, []);

  // Edit helpers
  const getEdit = (p) => {
    if (!p)
      return {
        protocol_name: '',
        therapeutic_category: '',
        status: 'draft',
        complexity_level: 'moderate',
        phases: [],
      };
    let comp = (p.complexity_level ?? p.metadata?.complexity_level ?? 'moderate').toLowerCase();
    if (comp === 'simple' || comp === 'minimal') comp = 'moderate';

    return (
      edits[p.id] ?? {
        protocol_name: p.protocol_name ?? '',
        therapeutic_category: p.therapeutic_category ?? '',
        status: p.status ?? 'draft',
        complexity_level: comp,
        phases: JSON.parse(JSON.stringify(p.phases ?? [])),
      }
    );
  };

  const setEditField = (id, field, value) =>
    setEdits((prev) => ({
      ...prev,
      [id]: { ...getEdit(protocols.find((p) => p.id === id)), ...prev[id], [field]: value },
    }));

  const setEditPhases = (id, phases) =>
    setEdits((prev) => ({
      ...prev,
      [id]: { ...getEdit(protocols.find((p) => p.id === id)), ...prev[id], phases },
    }));

  // Save
  async function handleSave(id) {
    const patch = edits[id];
    if (!patch) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      await updateProtocolFull(id, patch);
      setProtocols((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      setSaved((prev) => ({ ...prev, [id]: true }));
      setTimeout(
        () =>
          setSaved((prev) => {
            const n = { ...prev };
            delete n[id];
            return n;
          }),
        2000
      );
      setEdits((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    } catch (err) {
      toast.error('Save failed: ' + err.message);
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Delete
  async function handleDelete(id) {
    if (!window.confirm('Permanently delete this protocol? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'protocols', id));
      setProtocols((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error('Delete failed: ' + err.message);
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
    padding: '0.4rem 0.65rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    width: '100%',
  };

  if (loading)
    return (
      <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)' }}>
        <RefreshCw
          size={28}
          className="admin-pill-status-dot admin-pill-status-dot--pulse"
          style={{ marginBottom: '1rem', color: 'var(--primary)' }}
        />
        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Loading all protocols…</p>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          padding: '2rem',
          backgroundColor: 'rgba(239,68,68,0.05)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: 'var(--error)',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <AlertTriangle size={20} />
        <span style={{ fontWeight: 600 }}>{error}</span>
        <button
          onClick={fetchProtocols}
          className="admin-premium-input"
          style={{
            marginLeft: 'auto',
            border: '1px solid var(--error)',
            background: 'transparent',
            color: 'var(--error)',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Retry
        </button>
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            All Protocols
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {protocols.length} total across all users
          </p>
        </div>
      </div>

      {protocols.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem',
            color: 'var(--text-muted)',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
          }}
        >
          No protocols saved yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* GCP Table Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '0.25rem' }}>
          <button
            onClick={fetchProtocols}
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              padding: '0.4rem 1rem',
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Protocol Table */}
        <div
          style={{
            background: 'var(--color-bg-surface)',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.85rem',
              }}
            >
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 1rem', width: '32px' }}></th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#5f6368',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Protocol Name
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                    Category
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                    Status
                  </th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#5f6368' }}>
                    Phases
                  </th>
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#5f6368',
                      textAlign: 'right',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {protocols.map((p, i) => {
                  const isOpen = !!expanded[p.id];
                  const e = getEdit(p);
                  const isDirty = !!edits[p.id];
                  const isSaving = !!saving[p.id];
                  const isSaved = !!saved[p.id];
                  const isLast = i === protocols.length - 1;

                  const toggleActive = () => {
                    const newStatus = e.status === 'active' ? 'draft' : 'active';
                    setEditField(p.id, 'status', newStatus);
                    handleSave(p.id); // auto-save status toggle
                  };

                  const archiveProtocol = () => {
                    setEditField(p.id, 'status', 'archived');
                    handleSave(p.id);
                  };

                  return (
                    <React.Fragment key={p.id}>
                      <tr
                        style={{
                          borderBottom: isLast && !isOpen ? 'none' : '1px solid var(--border)',
                          background: isOpen ? '#f8f9fa' : 'transparent',
                          transition: 'background 0.2s',
                        }}
                      >
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <button
                            onClick={() => setExpanded((prev) => ({ ...prev, [p.id]: !isOpen }))}
                            aria-label="Expand protocol details"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#5f6368',
                            }}
                          >
                            <motion.div
                              animate={{ rotate: isOpen ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight size={16} />
                            </motion.div>
                          </button>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          {isDirty ? (
                            <input
                              value={e.protocol_name}
                              onChange={(ev) =>
                                setEditField(p.id, 'protocol_name', ev.target.value)
                              }
                              style={{
                                padding: '4px 8px',
                                border: '1px solid #1a73e8',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                width: '100%',
                                minWidth: '180px',
                              }}
                            />
                          ) : (
                            <div style={{ fontWeight: 600, color: '#202124' }}>
                              {e.protocol_name || 'Unnamed Protocol'}
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  color: '#5f6368',
                                  marginTop: '2px',
                                  fontWeight: 400,
                                }}
                              >
                                v{p.version_number ?? 1} • {formatDate(p.created_at)}
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#5f6368' }}>
                          {isDirty ? (
                            <input
                              value={e.therapeutic_category}
                              onChange={(ev) =>
                                setEditField(p.id, 'therapeutic_category', ev.target.value)
                              }
                              style={{
                                padding: '4px 8px',
                                border: '1px solid #1a73e8',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                width: '100%',
                              }}
                            />
                          ) : (
                            e.therapeutic_category || '—'
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              background:
                                e.status === 'active'
                                  ? '#e6f4ea'
                                  : e.status === 'archived'
                                    ? '#f1f3f4'
                                    : '#fef7e0',
                              color:
                                e.status === 'active'
                                  ? '#137333'
                                  : e.status === 'archived'
                                    ? '#5f6368'
                                    : '#b06000',
                            }}
                          >
                            {e.status}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#5f6368' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FlaskConical size={14} /> {(e.phases ?? []).length}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <div
                            style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}
                          >
                            {isDirty ? (
                              <button
                                onClick={() => handleSave(p.id)}
                                disabled={isSaving}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  background: '#1a73e8',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 12px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  opacity: isSaving ? 0.6 : 1,
                                }}
                              >
                                <Save size={12} /> {isSaving ? 'Saving' : 'Save'}
                              </button>
                            ) : (
                              <button
                                onClick={() => setEditField(p.id, 'protocol_name', e.protocol_name)}
                                title="Edit Protocol"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#1a73e8',
                                  cursor: 'pointer',
                                  padding: '4px',
                                }}
                              >
                                <Edit3 size={16} />
                              </button>
                            )}

                            <button
                              onClick={toggleActive}
                              title={e.status === 'active' ? 'Deactivate' : 'Activate'}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: e.status === 'active' ? '#137333' : '#b06000',
                                cursor: 'pointer',
                                padding: '4px',
                              }}
                            >
                              {e.status === 'active' ? (
                                <Check size={16} />
                              ) : (
                                <AlertTriangle size={16} />
                              )}
                            </button>

                            <button
                              onClick={archiveProtocol}
                              title="Archive Protocol"
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#5f6368',
                                cursor: 'pointer',
                                padding: '4px',
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Phase Editor Row */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <tr
                            style={{
                              borderBottom: isLast ? 'none' : '1px solid var(--border)',
                              background: '#fafafa',
                            }}
                          >
                            <td colSpan={6} style={{ padding: 0 }}>
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                style={{ overflow: 'hidden' }}
                              >
                                <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f3f4' }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      marginBottom: '1rem',
                                    }}
                                  >
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#202124' }}>
                                      Protocol Phases
                                    </h4>
                                    {isDirty && (
                                      <span
                                        style={{
                                          fontSize: '0.75rem',
                                          color: '#e53e3e',
                                          fontWeight: 600,
                                        }}
                                      >
                                        Unsaved changes
                                      </span>
                                    )}
                                  </div>
                                  <PhaseEditor
                                    phases={e.phases ?? []}
                                    products={catalogProducts}
                                    onChange={(phases) => setEditPhases(p.id, phases)}
                                  />
                                  {isDirty && (
                                    <div
                                      style={{
                                        marginTop: '1rem',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                      }}
                                    >
                                      <button
                                        onClick={() => handleSave(p.id)}
                                        disabled={isSaving}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          background: '#1a73e8',
                                          color: 'white',
                                          border: 'none',
                                          padding: '6px 16px',
                                          borderRadius: '4px',
                                          fontSize: '0.8rem',
                                          fontWeight: 600,
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <Save size={14} />{' '}
                                        {isSaving ? 'Saving...' : 'Save Protocol Changes'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Load More */}
        {hasMore && (
          <div
            style={{
              padding: '1rem',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              background: '#f8f9fa',
            }}
          >
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '4px',
                border: '1px solid #dadce0',
                background: 'var(--color-bg-surface)',
                color: '#1a73e8',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: loadingMore ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: loadingMore ? 0.7 : 1,
              }}
            >
              {loadingMore ? (
                <RefreshCw size={14} className="admin-pill-status-dot--pulse" />
              ) : (
                <ChevronDown size={14} />
              )}
              {loadingMore ? 'Loading...' : 'Load More Protocols'}
            </button>
          </div>
        )}
      </div>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminProtocolsTab | Props: none
      </div>
    
</div>
  );
}
