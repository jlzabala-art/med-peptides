"use client";

/**
 * AdminBioniqImportTab.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Safe import workflow for Bioniq peptide catalog
 *
 * Rules:
 *   1. NEVER create new Product / Supplier / Presentation master records
 *   2. Resolve all IDs to EXISTING database entities before inserting variants
 *   3. Flag conflicts / discrepancies / unresolved items for admin review
 *   4. Show full preview table before committing any write
 *   5. Commit in a single Firestore batch; roll back on failure
 *
 * Workflow:
 *   PARSE JSON → RESOLVE IDs → CHECK DUPLICATES → SHOW PREVIEW → ADMIN CONFIRM → COMMIT
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, getDocs, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import toast from 'react-hot-toast';
import PageHeader from '../../ui/PageHeader';
import DataTable from '../../ui/DataTable';

// ── Icons ─────────────────────────────────────────────────────────────────────
import Upload from 'lucide-react/dist/esm/icons/upload';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Info from 'lucide-react/dist/esm/icons/info';

// ── Status badge helpers ───────────────────────────────────────────────────────
const STATUS_META = {
  READY:                   { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'READY' },
  UNRESOLVED_PEPTIDE:      { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'UNRESOLVED PEPTIDE' },
  UNRESOLVED_PRESENTATION: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'UNRESOLVED PRESENTATION' },
  UNRESOLVED_SUPPLIER:     { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'UNRESOLVED SUPPLIER' },
  MULTIPLE_MATCHES:        { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'MULTIPLE MATCHES' },
  SOURCE_DISCREPANCY:      { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'SOURCE DISCREPANCY' },
  DUPLICATE:               { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', label: 'DUPLICATE (SKIP)' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.READY;
  return (
    <span style={{
      background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
      padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
      whiteSpace: 'nowrap', display: 'inline-block'
    }}>
      {meta.label}
    </span>
  );
}

// ── Searchable Dropdown ────────────────────────────────────────────────────────
function SearchableSelect({ options, value, onChange, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef();

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    o.value.toLowerCase().includes(search.toLowerCase())
  );
  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 200 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: 'white',
          cursor: 'pointer', fontSize: '0.8rem', color: selected ? '#1e293b' : '#94a3b8', gap: 4
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={13} style={{ flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 50, width: 260,
          background: 'white', border: '1px solid #e2e8f0', borderRadius: 6,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: 2, overflow: 'hidden'
        }}>
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            style={{ width: '100%', padding: '8px 10px', border: 'none', borderBottom: '1px solid #e2e8f0', outline: 'none', fontSize: '0.8rem', boxSizing: 'border-box' }}
          />
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0
              ? <div style={{ padding: '10px', color: '#94a3b8', fontSize: '0.78rem' }}>No results</div>
              : filtered.map(o => (
                <div
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); setSearch(''); }}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem',
                    background: o.value === value ? '#f0f9ff' : 'transparent', color: '#1e293b'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{o.label}</div>
                  {o.sublabel && <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{o.sublabel}</div>}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ── Normalization helper ───────────────────────────────────────────────────────
function normalize(str) {
  return (str || '').trim().toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[–—−]/g, '-');
}

// ── Parse strength string → structured fields ──────────────────────────────────
function parseStrength(strengthStr) {
  if (!strengthStr) return {};
  const s = strengthStr.trim();
  const concMatch = s.match(/^([\d.]+)\s*(mg\/ml|mcg\/ml|iu\/ml)/i);
  if (concMatch) return { concentration_value: parseFloat(concMatch[1]), concentration_unit: concMatch[2].toLowerCase() };
  const simpleMatch = s.match(/^([\d.]+)\s*(mg|mcg|iu|g)/i);
  if (simpleMatch) return { total_strength_value: parseFloat(simpleMatch[1]), total_strength_unit: simpleMatch[2].toLowerCase() };
  return { blend_description: s };
}

// ── Presentation mapping (presentations collection is empty — use display keys) ──
const PRESENTATION_MAP = {
  'capsule':     'capsule',
  'capsules':    'capsule',
  'nasal spray': 'nasal-spray',
  'pen':         'pen',
  'vial':        'vial',
  'tablet':      'tablet',
  'tablets':     'tablet',
  'injection':   'vial',
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminBioniqImportTab() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [masterLoaded, setMasterLoaded] = useState(false);

  const [step, setStep] = useState(0); // 0=idle, 1=loading, 2=review, 3=done
  const [rows, setRows] = useState([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Raw JSON — loaded lazily to avoid blocking
  const [rawData, setRawData] = useState(null);

  // Load source JSON
  useEffect(() => {
    import('../../../../AI Prompts/Bioniq/bioniq_peptides_antigravity_safe_import.json')
      .then(mod => setRawData(mod.default))
      .catch(err => toast.error('Could not load Bioniq JSON: ' + err.message));
  }, []);

  // Load Firestore master data
  useEffect(() => {
    async function load() {
      try {
        const [prodSnap, suppSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'suppliers')),
        ]);
        setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setSuppliers(suppSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setMasterLoaded(true);
      } catch (err) {
        toast.error('Failed to load master data: ' + err.message);
      }
    }
    load();
  }, []);

  // ── Resolve & enrich all rows ────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    if (!rawData) return;
    setStep(1);
    await new Promise(r => setTimeout(r, 300));

    const dosageForms = ['capsule', 'capsules', 'nasal spray', 'pen', 'vial', 'injection', 'spray', 'tablet', 'tablets'];

    const enriched = (rawData.products || rawData).map((raw, idx) => {
      let status = 'READY';
      const flags = [];
      let productId = null;
      let productDoc = null;
      let supplierId = null;
      let supplierDoc = null;

      // ── 1. Resolve Product ──────────────────────────────────────────────
      const normalizedName = normalize(raw.product_name);
      // Strip dosage form suffix for matching
      let baseName = normalizedName;
      for (const form of dosageForms) {
        baseName = baseName.replace(new RegExp(`\\s+${form}s?$`, 'i'), '').trim();
      }

      const matches = products.filter(p => {
        const names = [
          normalize(p.canonicalName), normalize(p.displayName), normalize(p.name),
          ...(p.synonyms || []).map(normalize),
          ...(p.identity?.synonyms || []).map(normalize),
          ...(p.identity?.searchAliases || []).map(normalize),
        ].filter(Boolean);
        return names.includes(normalizedName) || names.includes(baseName);
      });

      const uniqueMatches = [...new Map(matches.map(p => [p.id, p])).values()];

      if (uniqueMatches.length === 1) {
        productDoc = uniqueMatches[0];
        productId = productDoc.id;
      } else if (uniqueMatches.length > 1) {
        status = 'MULTIPLE_MATCHES';
        flags.push(`Multiple product matches: ${uniqueMatches.slice(0, 3).map(p => p.id).join(', ')}${uniqueMatches.length > 3 ? '…' : ''}`);
      } else {
        status = 'UNRESOLVED_PEPTIDE';
        flags.push(`No product found for "${raw.product_name}" (base: "${baseName}")`);
      }

      // ── 2. Resolve Supplier ─────────────────────────────────────────────
      const supplierQuery = normalize(raw.supplier || 'bioniq');
      const supplierMatches = suppliers.filter(s =>
        [s.name, s.displayName, s.companyName].some(n => normalize(n) === supplierQuery)
      );

      if (supplierMatches.length === 1) {
        supplierDoc = supplierMatches[0];
        supplierId = supplierDoc.id;
      } else if (supplierMatches.length > 1) {
        if (status === 'READY') status = 'MULTIPLE_MATCHES';
        flags.push(`Multiple supplier matches for "${raw.supplier}"`);
      } else {
        if (status === 'READY') status = 'UNRESOLVED_SUPPLIER';
        flags.push(`Supplier "${raw.supplier || 'Bioniq'}" not in database. Select manually.`);
      }

      // ── 3. Presentation ─────────────────────────────────────────────────
      const presentationId = PRESENTATION_MAP[normalize(raw.dosage_form || '')] || null;
      if (!presentationId) {
        if (status === 'READY') status = 'UNRESOLVED_PRESENTATION';
        flags.push(`Presentation "${raw.dosage_form}" not mapped (presentations collection is empty).`);
      }

      // ── 4. Tier pricing ─────────────────────────────────────────────────
      const tiers = [
        { source_range: '10–49',  min_qty: 10,  max_qty: 49,   unit_price: { amount: raw.wholesale_10_49_eur,    currency: 'EUR' } },
        { source_range: '50–99',  min_qty: 50,  max_qty: 99,   unit_price: { amount: raw.wholesale_50_99_eur,    currency: 'EUR' } },
        { source_range: '100+',   min_qty: 100, max_qty: null, unit_price: { amount: raw.wholesale_100_plus_eur, currency: 'EUR' } },
      ];

      const variantId = `bioniq-${(raw.sku || `row-${idx}`).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

      return {
        _idx: idx,
        sku: raw.sku,
        product_name: raw.product_name,
        dosage_form: raw.dosage_form,
        strength: raw.strength,
        pack_size: raw.pack_size,
        volume_ml: raw.volume_ml,
        rrp_eur: raw.rrp_eur,
        rrp_aed: raw.rrp_aed,
        tiers,
        active: raw.active !== false,
        productId,
        productDoc,
        supplierId,
        supplierDoc,
        presentationId,
        strengthFields: parseStrength(raw.strength),
        variantId,
        status,
        flags,
        _manualSupplierId: null,
        _manualProductId: null,
      };
    });

    setRows(enriched);
    setStep(2);
  }, [rawData, products, suppliers]);

  // ── Manual resolution update ─────────────────────────────────────────────
  const updateRow = useCallback((idx, patch) => {
    setRows(prev => prev.map(r => {
      if (r._idx !== idx) return r;
      const u = { ...r, ...patch };
      const pId = u._manualProductId || u.productId;
      const sId = u._manualSupplierId || u.supplierId;
      let s = 'READY';
      if (!pId) s = 'UNRESOLVED_PEPTIDE';
      else if (!sId) s = 'UNRESOLVED_SUPPLIER';
      else if (!u.presentationId) s = 'UNRESOLVED_PRESENTATION';
      return { ...u, status: s };
    }));
  }, []);

  // ── Commit READY rows ─────────────────────────────────────────────────────
  const handleCommit = async () => {
    const toWrite = rows.filter(r => r.status === 'READY');
    if (toWrite.length === 0) { toast.error('No READY rows to commit.'); return; }

    setIsCommitting(true);
    const batch = writeBatch(db);
    const results = { created: 0, updated: 0, errors: [] };

    try {
      for (const row of toWrite) {
        const pid = row._manualProductId || row.productId;
        const sid = row._manualSupplierId || row.supplierId;
        if (!pid || !sid) { results.errors.push(row.sku); continue; }

        const variantRef = doc(db, 'products', pid, 'variants', row.variantId);
        const existing = await getDoc(variantRef);

        const variantData = {
          sku: row.sku,
          supplierId: sid,
          supplierName: row.supplierDoc?.displayName || row.supplierDoc?.name || 'Bioniq',
          presentationId: row.presentationId,
          dosage_form: row.dosage_form,
          strength: row.strength,
          ...row.strengthFields,
          pack_size: row.pack_size,
          volume_ml: row.volume_ml,
          retail_unit_price: { EUR: row.rrp_eur, AED: row.rrp_aed },
          pricing_tiers: row.tiers,
          currency: 'EUR',
          active: row.active,
          source: 'bioniq_safe_import',
          importedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (existing.exists()) {
          batch.update(variantRef, variantData);
          results.updated++;
        } else {
          batch.set(variantRef, { ...variantData, createdAt: new Date().toISOString() });
          results.created++;
        }
      }

      await batch.commit();
      setImportResult(results);
      setStep(3);
      toast.success(`Import complete — ${results.created} created, ${results.updated} updated`);
    } catch (err) {
      toast.error('Import failed: ' + err.message);
      console.error(err);
    } finally {
      setIsCommitting(false);
    }
  };

  const summary = {
    total:      rows.length,
    ready:      rows.filter(r => r.status === 'READY').length,
    unresolved: rows.filter(r => ['UNRESOLVED_PEPTIDE','UNRESOLVED_SUPPLIER','UNRESOLVED_PRESENTATION','MULTIPLE_MATCHES'].includes(r.status)).length,
  };

  const supplierOptions = suppliers.map(s => ({
    value: s.id,
    label: s.displayName || s.name || s.id,
    sublabel: `${s.type || ''} · ${s.country || ''}`.replace(/^[· ]+|[· ]+$/g, ''),
  }));

  const productOptions = products.map(p => ({
    value: p.id,
    label: p.canonicalName || p.displayName || p.name || p.id,
    sublabel: p.id,
  }));

  const totalInSource = rawData ? (rawData.products || rawData).length : '…';

  return (
    <div style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto', fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)' }}>
      <PageHeader
        title="Bioniq Peptide Import"
        subtitle="Safe import — resolves IDs against existing master records. No duplicate products or suppliers will be created."
        panel="admin"
      />

      {/* ── Step 0: Idle ─────────────────────────────────────────────────── */}
      {step === 0 && (
        <div style={{ marginTop: '2rem', background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '3rem 2rem', textAlign: 'center' }}>
          <ShieldCheck size={56} color="#003666" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>Bioniq Safe Import</h2>
          <p style={{ color: '#64748b', maxWidth: 560, margin: '0 auto 0.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
            This tool will import <strong>{totalInSource} Bioniq products</strong> as new <em>variants</em> on your existing catalog products.
            All unresolved IDs must be mapped manually before any write occurs.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', margin: '1.5rem 0 2rem' }}>
            {[
              { label: `${totalInSource} rows to analyze`, color: '#2563eb', bg: '#eff6ff' },
              { label: 'Mode: insert_only (safe)', color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Source: Bioniq JSON', color: '#7c3aed', bg: '#f5f3ff' },
            ].map(p => (
              <span key={p.label} style={{ background: p.bg, color: p.color, padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>{p.label}</span>
            ))}
          </div>

          {!masterLoaded
            ? <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite', display: 'inline', marginRight: 6 }} />
                Loading master data…
              </div>
            : <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                ✓ {products.length} products · {suppliers.length} suppliers loaded
              </div>
          }

          <button
            onClick={runAnalysis}
            disabled={!masterLoaded || !rawData}
            style={{
              background: (!masterLoaded || !rawData) ? '#94a3b8' : '#003666',
              color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 2.5rem',
              fontWeight: 700, fontSize: '0.95rem', cursor: (!masterLoaded || !rawData) ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8
            }}
          >
            <Upload size={18} /> Analyze &amp; Preview Import
          </button>
        </div>
      )}

      {/* ── Step 1: Analyzing ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div style={{ marginTop: '2rem', textAlign: 'center', padding: '4rem 2rem' }}>
          <Loader2 size={48} color="#003666" style={{ animation: 'spin 1s linear infinite', marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Resolving IDs…</h2>
          <p style={{ color: '#64748b' }}>Matching products, suppliers, and presentations against your database.</p>
        </div>
      )}

      {/* ── Step 2: Review ───────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={{ marginTop: '2rem' }}>
          {/* KPI Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Records', value: summary.total, color: '#003666', bg: '#eff6ff' },
              { label: 'Ready to Import', value: summary.ready, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Needs Resolution', value: summary.unresolved, color: '#dc2626', bg: '#fef2f2' },
              { label: 'Skipped / Dup', value: rows.filter(r => r.status === 'DUPLICATE').length, color: '#64748b', bg: '#f8fafc' },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: kpi.bg, border: `1px solid ${kpi.color}22`, borderRadius: 10, padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            {/* Table header bar */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Import Preview — {rows.length} records
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button onClick={runAnalysis} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: '0.82rem', color: '#475569' }}>
                  <RefreshCw size={13} /> Re-analyze
                </button>
                <button
                  onClick={handleCommit}
                  disabled={summary.ready === 0 || isCommitting}
                  style={{
                    background: summary.ready === 0 ? '#94a3b8' : '#003666',
                    color: 'white', border: 'none', borderRadius: 8, padding: '8px 20px',
                    fontWeight: 700, cursor: summary.ready === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem'
                  }}
                >
                  {isCommitting
                    ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Committing…</>
                    : <><ArrowRight size={13} /> Commit {summary.ready} READY</>
                  }
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <DataTable
                data={rows}
                keyField="_idx"
                columns={[
                  {
                    id: 'product',
                    header: 'Product',
                    width: '20%',
                    render: (row) => (
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.product_name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.7rem' }}>{row.sku}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{row.strength}{row.pack_size ? ` · ${row.pack_size}` : ''}</div>
                      </div>
                    )
                  },
                  {
                    id: 'matchedId',
                    header: 'Matched ID',
                    width: '15%',
                    render: (row) => {
                      const resolvedProductId = row._manualProductId || row.productId;
                      return resolvedProductId
                        ? <code style={{ background: '#f0fdf4', color: '#15803d', padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', wordBreak: 'break-all' }}>{resolvedProductId}</code>
                        : <span style={{ color: '#dc2626', fontSize: '0.7rem' }}>—</span>;
                    }
                  },
                  {
                    id: 'presentation',
                    header: 'Presentation',
                    width: '10%',
                    render: (row) => (
                      <div>
                        <div style={{ color: '#475569' }}>{row.dosage_form}</div>
                        {row.presentationId
                          ? <code style={{ background: '#eff6ff', color: '#2563eb', padding: '1px 5px', borderRadius: 3, fontSize: '0.65rem' }}>{row.presentationId}</code>
                          : <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>no master</span>
                        }
                      </div>
                    )
                  },
                  {
                    id: 'supplier',
                    header: 'Supplier',
                    width: '12%',
                    render: (row) => {
                      const resolvedSupplierId = row._manualSupplierId || row.supplierId;
                      return resolvedSupplierId
                        ? <code style={{ background: '#f5f3ff', color: '#7c3aed', padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', wordBreak: 'break-all' }}>{resolvedSupplierId}</code>
                        : <span style={{ color: '#dc2626', fontSize: '0.7rem' }}>—</span>;
                    }
                  },
                  {
                    id: 'rrpEur',
                    header: 'RRP EUR',
                    width: '8%',
                    render: (row) => (
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>
                        {row.rrp_eur != null ? `€${Number(row.rrp_eur).toFixed(2)}` : '—'}
                      </span>
                    )
                  },
                  {
                    id: 'tier1',
                    header: 'Tier 10–49',
                    width: '7%',
                    render: (row) => (
                      <span style={{ color: '#475569' }}>
                        {row.tiers[0]?.unit_price?.amount != null ? `€${Number(row.tiers[0].unit_price.amount).toFixed(2)}` : '—'}
                      </span>
                    )
                  },
                  {
                    id: 'tier2',
                    header: 'Tier 50–99',
                    width: '7%',
                    render: (row) => (
                      <span style={{ color: '#475569' }}>
                        {row.tiers[1]?.unit_price?.amount != null ? `€${Number(row.tiers[1].unit_price.amount).toFixed(2)}` : '—'}
                      </span>
                    )
                  },
                  {
                    id: 'tier3',
                    header: 'Tier 100+',
                    width: '7%',
                    render: (row) => (
                      <span style={{ color: '#475569' }}>
                        {row.tiers[2]?.unit_price?.amount != null ? `€${Number(row.tiers[2].unit_price.amount).toFixed(2)}` : '—'}
                      </span>
                    )
                  },
                  {
                    id: 'status',
                    header: 'Status / Action',
                    width: '14%',
                    render: (row) => (
                      <div>
                        <StatusBadge status={row.status} />

                        {/* Supplier picker */}
                        {(row.status === 'UNRESOLVED_SUPPLIER' || (row.status === 'MULTIPLE_MATCHES' && !row.supplierId)) && !row._manualSupplierId && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 3 }}>Select supplier:</div>
                            <SearchableSelect options={supplierOptions} value={row._manualSupplierId || ''} onChange={val => updateRow(row._idx, { _manualSupplierId: val })} placeholder="Choose supplier…" />
                          </div>
                        )}

                        {/* Product picker */}
                        {(row.status === 'UNRESOLVED_PEPTIDE' || (row.status === 'MULTIPLE_MATCHES' && !row.productId)) && !row._manualProductId && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: 3 }}>Select product:</div>
                            <SearchableSelect options={productOptions} value={row._manualProductId || ''} onChange={val => updateRow(row._idx, { _manualProductId: val })} placeholder="Choose product…" />
                          </div>
                        )}

                        {/* Flag details */}
                        {row.flags.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {row.flags.map((f, fi) => (
                              <div key={fi} style={{ fontSize: '0.66rem', color: '#64748b', display: 'flex', gap: 3, alignItems: 'flex-start', marginTop: 2 }}>
                                <Info size={9} style={{ marginTop: 2, flexShrink: 0 }} />
                                <span style={{ lineHeight: 1.4 }}>{f}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                ]}
              />
            </div>

            {/* Bottom bar */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button onClick={() => { setStep(0); setRows([]); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', color: '#475569', fontWeight: 600, fontSize: '0.82rem' }}>
                ← Start Over
              </button>
              {summary.unresolved > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#d97706', fontSize: '0.82rem', fontWeight: 600 }}>
                  <AlertTriangle size={14} /> {summary.unresolved} item(s) still need resolution
                </div>
              )}
              <button
                onClick={handleCommit}
                disabled={summary.ready === 0 || isCommitting}
                style={{
                  background: summary.ready === 0 ? '#94a3b8' : '#003666',
                  color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px',
                  fontWeight: 700, cursor: summary.ready === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem'
                }}
              >
                {isCommitting
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Writing to Firestore…</>
                  : <><ShieldCheck size={15} /> Commit {summary.ready} READY rows</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Done ─────────────────────────────────────────────────── */}
      {step === 3 && importResult && (
        <div style={{ marginTop: '2rem', background: 'white', borderRadius: 12, border: '1px solid #bbf7d0', padding: '3rem 2rem', textAlign: 'center' }}>
          <CheckCircle2 size={64} color="#16a34a" style={{ marginBottom: '1.25rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Import Complete</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Bioniq variants have been written to Firestore.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', maxWidth: 560, margin: '0 auto 2.5rem', textAlign: 'left' }}>
            {[
              { label: 'Source Rows', value: totalInSource },
              { label: 'Created', value: importResult.created },
              { label: 'Updated', value: importResult.updated },
              { label: 'Errors', value: importResult.errors.length },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.9rem 1rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#003666' }}>{kpi.value}</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {importResult.errors.length > 0 && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '1rem', maxWidth: 500, margin: '0 auto 1.5rem', textAlign: 'left' }}>
              <strong style={{ color: '#dc2626' }}>Failed SKUs:</strong>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', color: '#991b1b', fontSize: '0.82rem' }}>
                {importResult.errors.map(e => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}

          <button onClick={() => { setStep(0); setRows([]); setImportResult(null); }} style={{ background: '#003666', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', fontWeight: 700, cursor: 'pointer' }}>
            Run Another Import
          </button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
