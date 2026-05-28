/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
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
  const [searchTerm, setSearchTerm] = useState('');

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
      sku:           variant.sku                  ?? '',
      guest_usd:     variant.price?.guest_usd     ?? variant.guestVialPrice  ?? 0,
      clinic_usd:    variant.price?.clinic_usd    ?? 0,
      wholesale_usd: variant.price?.wholesale_usd ?? variant.proVialPrice    ?? 0,
      pro_usd:       variant.price?.pro_usd       ?? variant.proVialPrice    ?? 0,
      stock_qty:     variant.stock?.qty           ?? variant.stock           ?? 0,
      available:     variant.stock?.available     ?? true,
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
        sku:                   patch.sku || '',
        'price.guest_usd':     pf(patch.guest_usd),
        'price.clinic_usd':    pf(patch.clinic_usd),
        'price.wholesale_usd': pf(patch.wholesale_usd),
        'price.pro_usd':       pf(patch.pro_usd),
        'stock.qty':           pi(patch.stock_qty),
        'stock.available':     !!patch.available,
        updatedAt:             new Date().toISOString(),
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
              sku: patch.sku,
              price: { ...v.price,
                guest_usd:     pf(patch.guest_usd),
                clinic_usd:    pf(patch.clinic_usd),
                wholesale_usd: pf(patch.wholesale_usd),
                pro_usd:       pf(patch.pro_usd),
              },
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
    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
    fontSize: '0.85rem', fontFamily: 'inherit',
  };

  const pillStyle = (ok) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700,
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
      <div style={{ padding: '2rem', backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(239,68,68,0.2)', color: 'var(--error)' }}>
        <AlertTriangle size={20} style={{ marginRight: '0.5rem' }} />
        {error}
        <button onClick={fetchAll} style={{ marginLeft: '1rem', padding: '0.4rem 1rem',
          border: '1px solid var(--error)', borderRadius: 'var(--radius-sm)', background: 'transparent',
          color: 'var(--error)', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
      </div>
    );
  }

  const totalVariants = productGroups.reduce((s, g) => s + g.variants.length, 0);

  const filteredGroups = productGroups.filter(g => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchesProduct = (g.product.name || '').toLowerCase().includes(term) || (g.product.displayName || '').toLowerCase().includes(term);
    const matchesVariant = g.variants.some(v => (v.sku || '').toLowerCase().includes(term) || (v.label || '').toLowerCase().includes(term));
    return matchesProduct || matchesVariant;
  });

  const columns = [
    {
      key: 'product',
      header: 'Product',
      sortValue: g => g.product.displayName || g.product.name || '',
      render: g => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>
            {g.product.displayName ?? g.product.name}
          </span>
          {(g.product.dosage || g.product.strength) && (
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', backgroundColor: 'var(--bg-light)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
              {g.product.dosage || g.product.strength}
            </span>
          )}
          {(g.product.supplier || g.product.vendor) && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              by {g.product.supplier || g.product.vendor}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortValue: g => g.product.category || '',
      render: g => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {g.product.category}
        </span>
      )
    },
    {
      key: 'variants',
      header: 'Variants',
      sortValue: g => g.variants.length,
      render: g => (
        <span style={{
          padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700,
          backgroundColor: g.variants.length > 0 ? 'rgba(59,130,246,0.1)' : 'rgba(0,0,0,0.05)',
          color: g.variants.length > 0 ? 'var(--primary)' : 'var(--text-muted)'
        }}>
          {g.variants.length} variant{g.variants.length !== 1 ? 's' : ''}
        </span>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Variant Catalog</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {productGroups.length} products · {totalVariants} variants
          </p>
        </div>
        <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'var(--color-bg-app)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><DollarSign size={13} /> 4 price tiers: Guest · Clinic · Wholesale · Pro (USD)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Hash size={13} /> Stock Qty</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Package size={13} /> Availability toggle</span>
      </div>

      <AppFilterBar 
        onSearch={setSearchTerm}
        searchPlaceholder="Search product or variant SKU..."
      />

      <AppDataTable
        columns={columns}
        data={filteredGroups}
        keyField="product.id"
        emptyTitle="No variants found"
        emptyDescription="Run the Products migration first or check search criteria."
        expandableRender={(g) => {
          const product = g.product;
          const variants = g.variants;
          if (variants.length === 0) {
            return <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No variants found in subcollection.</div>;
          }
          return (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
              <table className="gcp-table">
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--border)' }}>
                    {['SKU', 'Label / Strength', 'Guest $', 'Clinic $', 'Wholesale $', 'Pro $', 'Stock', 'Available', 'Save'].map(h => (
                      <th key={h} style={{ padding: '0.65rem 1rem', fontWeight: 700, textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{h}</th>
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
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: isDirty ? 'rgba(245,158,11,0.04)' : 'white', transition: 'background 0.2s' }}>
                        <td style={{ padding: '0.5rem 0.6rem', minWidth: '100px' }}>
                          <input type="text" value={e.sku} placeholder={v.id} onChange={ev => setEditField(product.id, v.id, 'sku', ev.target.value)} style={{ ...inputStyle, fontFamily: 'monospace', color: 'var(--primary)' }} title="Variant SKU" />
                        </td>
                        <td style={{ padding: '0.65rem 1rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600 }}>{v.label ?? v.dosage ?? '—'}</div>
                          {v.strength && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.strength}</div>}
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', minWidth: '90px' }}>
                          <input type="number" step="0.01" value={e.guest_usd} onChange={ev => setEditField(product.id, v.id, 'guest_usd', ev.target.value)} style={{ ...inputStyle, borderTop: '2px solid #6366f1' }} title="Retail / Guest price (USD)" />
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', minWidth: '90px' }}>
                          <input type="number" step="0.01" value={e.clinic_usd} onChange={ev => setEditField(product.id, v.id, 'clinic_usd', ev.target.value)} style={{ ...inputStyle, borderTop: '2px solid #0ea5e9' }} title="Clinic / Doctor price (USD)" />
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', minWidth: '90px' }}>
                          <input type="number" step="0.01" value={e.wholesale_usd} onChange={ev => setEditField(product.id, v.id, 'wholesale_usd', ev.target.value)} style={{ ...inputStyle, borderTop: '2px solid #10b981' }} title="Wholesale / Pro price (USD)" />
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', minWidth: '90px' }}>
                          <input type="number" step="0.01" value={e.pro_usd} onChange={ev => setEditField(product.id, v.id, 'pro_usd', ev.target.value)} style={{ ...inputStyle, borderTop: '2px solid #f59e0b' }} title="Pro / Internal price (USD)" />
                        </td>
                        <td style={{ padding: '0.5rem 0.6rem', minWidth: '80px' }}>
                          <input type="number" step="1" min="0" value={e.stock_qty} onChange={ev => setEditField(product.id, v.id, 'stock_qty', ev.target.value)} style={inputStyle} />
                        </td>
                        <td style={{ padding: '0.5rem 1rem' }}>
                          <button style={pillStyle(e.available)} onClick={() => setEditField(product.id, v.id, 'available', !e.available)}>
                            {e.available ? <Eye size={12} /> : <EyeOff size={12} />}
                            {e.available ? 'In Stock' : 'Hidden'}
                          </button>
                        </td>
                        <td style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                          {isSaved ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.8rem' }}><Check size={14} /> Saved</span>
                          ) : (
                            <button disabled={!isDirty || isSaving} onClick={() => handleSave(product.id, v.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-sm)', border: 'none', backgroundColor: isDirty ? 'var(--primary)' : 'var(--color-border)', color: isDirty ? 'white' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', cursor: isDirty ? 'pointer' : 'not-allowed', transition: 'all 0.2s', opacity: isSaving ? 0.6 : 1 }}>
                              <Save size={13} />{isSaving ? 'Saving…' : 'Save'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }}
      />
    </div>
  );
}
