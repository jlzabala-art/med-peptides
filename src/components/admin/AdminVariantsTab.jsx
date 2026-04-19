/**
 * AdminVariantsTab.jsx
 *
 * Displays all product variants grouped by parent product.
 * Allows inline editing of prices, stock qty, and availability.
 * Writes directly to Firestore (admin-only).
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection, getDocs, doc, updateDoc, query, orderBy
} from 'firebase/firestore';
import { db } from '../../firebase';
import {
  ChevronDown, ChevronRight, Save, Check, AlertTriangle,
  RefreshCw, EyeOff, Eye, Package, DollarSign, Hash
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Safely parse a float; returns fallback if NaN */
const pf = (v, fallback = 0) => {
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
};

/** Safely parse an int; returns fallback if NaN */
const pi = (v, fallback = 0) => {
  const n = parseInt(v, 10);
  return isNaN(n) ? fallback : n;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminVariantsTab() {
  const [productGroups, setProductGroups] = useState([]);   // [{ product, variants }]
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState({});          // productId → bool
  const [edits, setEdits]           = useState({});          // `${productId}_${variantId}` → patch obj
  const [saving, setSaving]         = useState({});          // same key → bool
  const [saved, setSaved]           = useState({});          // same key → bool
  const [error, setError]           = useState(null);

  // ── Fetch all products + their variants ───────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const prodSnap = await getDocs(collection(db, 'products'));
      const products = prodSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const groups = await Promise.all(
        products.map(async (product) => {
          try {
            const vSnap = await getDocs(
              query(collection(db, 'products', product.id, 'variants'), orderBy('sortOrder', 'asc'))
            );
            const variants = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            return { product, variants };
          } catch (_) {
            return { product, variants: [] };
          }
        })
      );

      // Sort by product name, skip products with no variants
      groups.sort((a, b) => (a.product.displayName ?? a.product.name ?? '').localeCompare(
        b.product.displayName ?? b.product.name ?? ''
      ));

      setProductGroups(groups);
    } catch (err) {
      console.error('[AdminVariantsTab] fetchAll:', err);
      setError('Failed to load variants. Check Firestore permissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Edit helpers ──────────────────────────────────────────────────────────

  const editKey = (productId, variantId) => `${productId}_${variantId}`;

  const getEdit = (productId, variantId, variant) => {
    const k = editKey(productId, variantId);
    return edits[k] ?? {
      guest_usd:  variant.price?.guest_usd  ?? variant.guestVialPrice ?? 0,
      pro_usd:    variant.price?.pro_usd    ?? variant.proVialPrice   ?? 0,
      stock_qty:  variant.stock?.qty        ?? variant.stock          ?? 0,
      available:  variant.stock?.available  ?? true,
    };
  };

  const setEditField = (productId, variantId, field, value) => {
    const k = editKey(productId, variantId);
    setEdits(prev => ({
      ...prev,
      [k]: { ...getEdit(productId, variantId, {}), ...prev[k], [field]: value }
    }));
  };

  // ── Save a single variant ─────────────────────────────────────────────────

  const handleSave = async (productId, variantId) => {
    const k = editKey(productId, variantId);
    const patch = edits[k];
    if (!patch) return;

    setSaving(prev => ({ ...prev, [k]: true }));
    try {
      const ref = doc(db, 'products', productId, 'variants', variantId);
      await updateDoc(ref, {
        'price.guest_usd':   pf(patch.guest_usd),
        'price.pro_usd':     pf(patch.pro_usd),
        'stock.qty':         pi(patch.stock_qty),
        'stock.available':   !!patch.available,
        updatedAt:           new Date().toISOString(),
      });

      // Mirror to local state
      setProductGroups(prev => prev.map(g => {
        if (g.product.id !== productId) return g;
        return {
          ...g,
          variants: g.variants.map(v => {
            if (v.id !== variantId) return v;
            return {
              ...v,
              price: { ...v.price, guest_usd: pf(patch.guest_usd), pro_usd: pf(patch.pro_usd) },
              stock: { ...v.stock, qty: pi(patch.stock_qty), available: !!patch.available },
            };
          }),
        };
      }));

      // Flash saved indicator
      setSaved(prev => ({ ...prev, [k]: true }));
      setTimeout(() => setSaved(prev => { const n = { ...prev }; delete n[k]; return n; }), 2000);
      setEdits(prev => { const n = { ...prev }; delete n[k]; return n; });
    } catch (err) {
      console.error('[AdminVariantsTab] handleSave:', err);
      alert(`Failed to save variant ${variantId}: ${err.message}`);
    } finally {
      setSaving(prev => ({ ...prev, [k]: false }));
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────

  const inputStyle = {
    width: '100%', padding: '0.4rem 0.6rem',
    borderRadius: '6px', border: '1px solid var(--border)',
    fontSize: '0.85rem', fontFamily: 'inherit',
  };

  const pillStyle = (ok) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.2rem 0.65rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
    backgroundColor: ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
    color: ok ? 'var(--success)' : 'var(--error)',
    cursor: 'pointer', border: 'none', transition: 'all 0.2s',
  });

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="animate-spin" style={{ marginBottom: '1rem' }} />
        <p>Loading all variants…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: '12px',
        border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)' }}>
        <AlertTriangle size={20} style={{ marginRight: '0.5rem' }} />
        {error}
        <button onClick={fetchAll} style={{ marginLeft: '1rem', padding: '0.4rem 1rem',
          border: '1px solid var(--error)', borderRadius: '6px', background: 'transparent',
          color: 'var(--error)', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
      </div>
    );
  }

  const totalVariants = productGroups.reduce((s, g) => s + g.variants.length, 0);

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
            Variant Catalog
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {productGroups.length} products · {totalVariants} variants
          </p>
        </div>
        <button onClick={fetchAll}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
            border: '1px solid var(--border)', borderRadius: '8px', background: 'white',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem',
        padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px',
        border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <DollarSign size={13} /> Guest USD / Pro USD
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Hash size={13} /> Stock Qty
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Package size={13} /> Availability toggle
        </span>
      </div>

      {/* Accordion groups */}
      {productGroups.map(({ product, variants }) => {
        const isOpen = !!expanded[product.id];
        const hasVariants = variants.length > 0;

        return (
          <div key={product.id} className="card"
            style={{ marginBottom: '0.75rem', padding: 0, overflow: 'hidden',
              border: isOpen ? '1px solid var(--primary-light)' : '1px solid var(--border)',
              transition: 'border-color 0.2s' }}>

            {/* Product header row */}
            <button
              onClick={() => setExpanded(prev => ({ ...prev, [product.id]: !prev[product.id] }))}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '1rem 1.25rem', background: isOpen ? 'rgba(0,54,102,0.03)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}>
              {isOpen ? <ChevronDown size={18} color="var(--primary)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
              <span style={{ fontWeight: 800, fontSize: '0.95rem', flex: 1 }}>
                {product.displayName ?? product.name}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                {product.category}
              </span>
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                backgroundColor: hasVariants ? 'rgba(59,130,246,0.1)' : 'rgba(0,0,0,0.05)',
                color: hasVariants ? 'var(--primary)' : 'var(--text-muted)'
              }}>
                {variants.length} variant{variants.length !== 1 ? 's' : ''}
              </span>
            </button>

            {/* Variants table */}
            {isOpen && (
              <div style={{ overflowX: 'auto', borderTop: '1px solid var(--border)' }}>
                {!hasVariants ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No variants found in subcollection.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)' }}>
                        {['SKU', 'Label / Strength', 'Guest USD', 'Pro USD', 'Stock Qty', 'Available', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '0.65rem 1rem', fontWeight: 700, textAlign: 'left',
                            fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase',
                            letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map(v => {
                        const k = editKey(product.id, v.id);
                        const e = getEdit(product.id, v.id, v);
                        const isDirty = !!edits[k];
                        const isSaving = !!saving[k];
                        const isSaved  = !!saved[k];

                        return (
                          <tr key={v.id}
                            style={{ borderBottom: '1px solid var(--border)',
                              backgroundColor: isDirty ? 'rgba(245,158,11,0.04)' : 'white',
                              transition: 'background 0.2s' }}>

                            {/* SKU */}
                            <td style={{ padding: '0.65rem 1rem', fontWeight: 700, color: 'var(--primary)',
                              fontFamily: 'monospace', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                              {v.sku ?? v.id}
                            </td>

                            {/* Label */}
                            <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: 600 }}>{v.label ?? v.dosage ?? '—'}</div>
                              {v.strength && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.strength}</div>}
                            </td>

                            {/* Guest USD */}
                            <td style={{ padding: '0.5rem 1rem', minWidth: '100px' }}>
                              <input type="number" step="0.01" value={e.guest_usd}
                                onChange={ev => setEditField(product.id, v.id, 'guest_usd', ev.target.value)}
                                style={inputStyle} />
                            </td>

                            {/* Pro USD */}
                            <td style={{ padding: '0.5rem 1rem', minWidth: '100px' }}>
                              <input type="number" step="0.01" value={e.pro_usd}
                                onChange={ev => setEditField(product.id, v.id, 'pro_usd', ev.target.value)}
                                style={inputStyle} />
                            </td>

                            {/* Stock Qty */}
                            <td style={{ padding: '0.5rem 1rem', minWidth: '90px' }}>
                              <input type="number" step="1" min="0" value={e.stock_qty}
                                onChange={ev => setEditField(product.id, v.id, 'stock_qty', ev.target.value)}
                                style={inputStyle} />
                            </td>

                            {/* Available toggle */}
                            <td style={{ padding: '0.5rem 1rem' }}>
                              <button
                                style={pillStyle(e.available)}
                                onClick={() => setEditField(product.id, v.id, 'available', !e.available)}>
                                {e.available ? <Eye size={12} /> : <EyeOff size={12} />}
                                {e.available ? 'In Stock' : 'Hidden'}
                              </button>
                            </td>

                            {/* Save */}
                            <td style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                              {isSaved ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                  color: 'var(--success)', fontWeight: 700, fontSize: '0.8rem' }}>
                                  <Check size={14} /> Saved
                                </span>
                              ) : (
                                <button
                                  disabled={!isDirty || isSaving}
                                  onClick={() => handleSave(product.id, v.id)}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                    padding: '0.4rem 0.85rem', borderRadius: '6px', border: 'none',
                                    backgroundColor: isDirty ? 'var(--primary)' : '#e2e8f0',
                                    color: isDirty ? 'white' : 'var(--text-muted)',
                                    fontWeight: 700, fontSize: '0.8rem',
                                    cursor: isDirty ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s',
                                    opacity: isSaving ? 0.6 : 1,
                                  }}>
                                  <Save size={13} />
                                  {isSaving ? 'Saving…' : 'Save'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}

      {productGroups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          No products found. Run the Products migration first.
        </div>
      )}
    </div>
  );
}
