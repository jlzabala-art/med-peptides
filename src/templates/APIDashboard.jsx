"use client";

import { useState, useEffect } from 'react';








import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import * as fb from '../firebase';
const db = fb?.db;
import { ArrowLeft, FlaskConical, Lock, Loader2, AlertCircle, ChevronDown, ChevronRight, Package } from '@/lib/icons';
import DataTable from '../components/ui/DataTable';

/* ── Helper: derive peptideId from a product name string ──
   e.g. "TB-500 2mg Vial" → "tb-500"
        "5-AMINO 1MQ 50mg" → "5-amino-1mq" */
function derivePeptideId(raw = '') {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric → dash
    .replace(/(^-|-$)/g, '');     // trim leading/trailing dashes
}

export default function APIDashboard({ onBack, isProfessional }) {
  const [materials, setMaterials]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [expandedId, setExpandedId] = useState(null); // material id currently expanded

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  /* ── Fetch from Firestore on mount ── */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        /* 1) Fetch both collections in parallel */
        const [materialsSnap, productsSnap] = await Promise.all([
          getDocs(query(collection(db, 'api_materials'), orderBy('name'))),
          getDocs(collection(db, 'products')),
        ]);

        /* 2) Build a map: peptideId → [product, …] */
        const productsByPeptide = {};
        productsSnap.docs.forEach(d => {
          const p = { id: d.id, ...d.data() };
          // Use stored peptideId if present, otherwise derive from name
          const pid = p.peptideId || derivePeptideId(p.name || '');
          if (!productsByPeptide[pid]) productsByPeptide[pid] = [];
          productsByPeptide[pid].push(p);
        });

        /* 3) Attach linked products to each material */
        const docs = materialsSnap.docs.map(d => {
          const mat = { id: d.id, ...d.data() };
          mat.linkedProducts = productsByPeptide[mat.peptideId] || [];
          return mat;
        });

        console.log('[APIDashboard] materials with links:', docs.slice(0, 3));
        setMaterials(docs);
      } catch (err) {
        console.error('APIDashboard fetch error:', err);
        setError('Could not load materials. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* ── Filter by search ── */
  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Shared styles ── */
  const card = {
    background: 'var(--surface)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    padding: '1.5rem',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text)', padding: '2rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.4rem', borderRadius: '8px' }}
        >
          <ArrowLeft size={20} />
        </button>
        <FlaskConical size={22} style={{ color: 'var(--primary)' }} />
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>API Materials Catalog</h1>
        {isProfessional && (
          <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'var(--color-bg-surface)', borderRadius: '99px', padding: '0.2rem 0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            VERIFIED
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {!loading && !error && `${filtered.length} materials`}
        </span>
      </div>

      {/* ── Pro gate banner ── */}
      {!isProfessional && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <Lock size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Pricing is visible to verified professionals only. Contact us to apply for wholesale access.
          </p>
        </div>
      )}

      {/* ── Search ── */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search active pharmaceutical ingredient…"
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '0.75rem 1rem', borderRadius: '10px',
          border: '1px solid var(--border)', background: 'var(--surface)',
          color: 'var(--text)', fontSize: '0.9rem', marginBottom: '1.5rem',
          outline: 'none',
        }}
      />

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Loading catalog…</span>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', ...card, borderColor: 'rgba(239,68,68,0.3)' }}>
          <AlertCircle size={18} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.85rem' }}>{error}</p>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !error && (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'Material',
                render: (val, row) => (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    {row.linkedProducts?.length > 0 ? (
                      expandedId === row.id ? <ChevronDown size={14} style={{ color: '#818cf8', flexShrink: 0 }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    ) : <span style={{ width: 14 }} />}
                    {val}
                  </span>
                )
              },
              {
                key: 'linkedProducts',
                header: 'Products',
                render: (val, row) => val?.length > 0 ? (
                  <span style={{
                    display: 'inline-block',
                    background: expandedId === row.id ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)',
                    color: '#818cf8',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '99px',
                    padding: '0.15rem 0.6rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}>
                    {val.length} SKU{val.length !== 1 ? 's' : ''}
                  </span>
                ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
              },
              {
                key: 'quantity_g',
                header: 'Ref. Qty (g)',
                render: (val) => <span style={{ color: 'var(--text-muted)' }}>{val}</span>
              },
              {
                key: 'price_per_g_usd',
                header: 'Price / g (USD)',
                render: (val) => (
                  <span style={{ fontWeight: 600 }}>
                    {isProfessional
                      ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span>
                    }
                  </span>
                )
              }
            ]}
            data={filtered}
            keyField="id"
            onRowClick={(row) => {
              if (row.linkedProducts?.length > 0) {
                toggleExpand(row.id);
              }
            }}
            getRowProps={(row) => ({
              style: {
                background: expandedId === row.id ? 'rgba(99,102,241,0.06)' : 'transparent',
                cursor: row.linkedProducts?.length > 0 ? 'pointer' : 'default'
              }
            })}
            expandableRender={(row) => {
              if (expandedId !== row.id || !row.linkedProducts?.length) return null;
              return (
                <div style={{ padding: '1rem', paddingLeft: '2.5rem', background: 'rgba(99,102,241,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0 0.6rem', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    <Package size={12} />
                    Finished products linked to {row.name}
                  </div>
                  <DataTable
                    columns={[
                      { key: 'name', header: 'SKU / Name', render: (val, r) => val || r.id },
                      { key: 'dose', header: 'Dose', render: (val, r) => <span style={{ color: 'var(--text-muted)' }}>{val || r.quantity || '—'}</span> },
                      { key: 'price', header: 'Unit Price', render: (val) => (
                        <span style={{ fontWeight: 600 }}>
                          {isProfessional
                            ? (val != null ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>N/A</span>)
                            : <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span>
                          }
                        </span>
                      )}
                    ]}
                    data={row.linkedProducts}
                    keyField="id"
                  />
                </div>
              );
            }}
            emptyTitle="No materials found"
            emptyDescription="No materials match your search."
          />
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}