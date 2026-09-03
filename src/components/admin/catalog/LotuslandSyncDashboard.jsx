"use client";

/**
 * LotuslandSyncDashboard.jsx
 *
 * Phase 3: Admin Catalog Sync Dashboard for Lotusland / RegenPept.
 *
 * Features:
 *  1. Upload a new JSON price list (same format as LotusLand Master Price List.json)
 *  2. Run a live dry-run against Firestore — shows exactly what will change
 *  3. Apply changes to Firestore with explicit typed confirmation
 *  4. Show sync history (last 5 imports stored in localStorage)
 *
 * ⚠️  All Firestore writes use the same stable ID scheme as the reconcile script:
 *     lotusland-<product-slug>-<dose-slug>
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase';
import PageHeader from '../../ui/PageHeader';
import MetricCard from '../../ui/MetricCard';
import DataTable from '../../ui/DataTable';
import StatusBadge from '../../ui/StatusBadge';
import EmptyState from '../../ui/EmptyState';
import Modal from '../../ui/Modal';
import toast from 'react-hot-toast';
import {
  RefreshCw, Upload, Play, CheckCircle, AlertTriangle,
  Trash2, PlusCircle, Edit3, History, FileJson, Zap,
  Shield, Package, TrendingUp
} from '@/lib/icons';

// ── Constants ─────────────────────────────────────────────────────────────────
const SUPPLIER_ID   = 'OLlBbQjgrj6tY7GmM2Jo';
const SUPPLIER_NAME = 'Lotusland Limited';
const CATALOG_BRAND = 'RegenPept';
const HISTORY_KEY   = 'lotusland_sync_history';
const MAX_HISTORY   = 10;

// ── Canonical Product Map (mirrors lotusland_reconcile.mjs) ───────────────────
const CANONICAL_MAP = {
  'Glutathione':                                  'glutathione',
  'Retatrutide':                                  'retatrutide',
  'Tirzepatide':                                  'tirzepatide',
  'Semaglutide':                                  'semaglutide',
  'Cagrilintide':                                 'cagrilintide',
  'BPC-157':                                      'vallida_bpc-157-6mg_prefilled_pen_pen_3ml',
  'BPC-157 + TB-500':                             'BPC-157_TB-500-5-5mg-vial',
  'Thymosin β4 (TB-500)':                         'FBwoncHjo8lU94LtQ0zs',
  'AOD-9604':                                     'pod-pen-001',
  'Thymosin Alpha 1':                             'TW4bNGbN2tTYKRiPqqBv',
  'Thymosin Alpha 1 + Thymalin':                  'lotusland-thymosinalpha1thymalin-10mg10mgvial',
  'Thymogen':                                     'x9LJ0UJXDSHf8Fuppzne',
  'Epithalon':                                    'magenta-epithalon-30mg-3ml-refill-cartridge-18',
  'Thymulin':                                     'thymulin',
  'Pinealon':                                     'pinealon',
  'KPV':                                          'pod-pen-013',
  'DSIP':                                         'pod-pen-006',
  'HGH':                                          'hgh',
  'HMG':                                          'hmg',
  'IGF LR3':                                      '7xjPH5kTDXdU13rooufH',
  'MOTS-C':                                       'vallida_mots-c-30mg_prefilled_pen_pen_3ml',
  'PEG-MGF':                                      'peg-mgf',
  'Ipamorelin':                                   'ipamorelin',
  'Sermorelin':                                   'sermorelin',
  'Hexarelin':                                    'hexarelin',
  'Tesamorelin':                                  'tesamorelin',
  'GHRP-2':                                       'Um4X9hH3MLSvZx6WoOX4',
  'CJC-1295 without DAC':                         'lotusland-cjc1295withoutdac-10mgvial',
  'CJC-1295 without DAC + Ipamorelin':            'CJC-1295_without_DAC_Ipamorelin-5-5mg-vial',
  'CJC-1295 with DAC':                            '6mOhZxaGyFo46MwgACfH',
  'Selank':                                       'selank',
  'Semax':                                        'semax',
  'Snap-8':                                       'snap-8',
  'PE 22-28':                                     'pe-22-28',
  'SS-31':                                        'ss-31',
  'NAD+':                                         'nad',
  'NMN':                                          'nmn',
  '5-Amino-1MQ':                                  'lotusland-5amino1mq-10mgvial',
  'GHK-Cu (Human Copper)':                        'lotusland-ghkcuhumancopper-50mgvial',
  'GW501516':                                     'lotusland-gw501516-10mgtablet',
  'MK-677':                                       'lotusland-mk677-12mgtablet',
  'SLU-PP-332':                                   'oDniHVTWA3jgssukDaKp',
  'GLOW (BPC-157 / TB-500 / GHK)':               'glow-bpc-157-tb-500-ghk-cu',
  'KLOW (BPC-157 / TB-500 / GHKCu / KPV)':       'lotusland-klowbpc157tb500ghkcukpv-10mg10mg75mg10mgvial',
  'PT-141':                                       'pt-141',
  'MT2':                                          'o6jpvVugV0gVhpVNk5WX',
  'Oxytocin Acetate':                             'oxytocin-acetate',
  'Kisspeptin-10':                                'kisspeptin-10',
  'hCG':                                          'magenta-hcg-5-000-iu-2ml-refill-cartridge-60',
  'LL-37':                                        'lotusland-ll37-12mgvial',
  'PNC-27':                                       'pnc-27',
  'FOX-04':                                       'lotusland-fox04-12mgvial',
  'FST344':                                       'dXb2N7AgnA09fnQAn4Ih',
  'ARA-290':                                      'ara-290',
  'Cartalax':                                     'cartalax',
  'Cardiogen':                                    'cardiogen',
  'Prostamax':                                    'prostamax',
  'Testagen':                                     'testagen',
  'Starter Kit (Syringe + Bac Water)':            'starter-kit',
  'Insulin Syringes 1/2 ml - 31g x 8 mm 100 Counts': 'lotusland-insulinsyringes12ml31gx8mm-100countbox',
  'Bac Water':                                    'lotusland-bacteriostaticwater-30mlbottle',
  'Syringe + Bac Water Bundle':                   'lotusland-syringeandbacwaterbundle-100insulinsyringesone30mlbacwaterbottle',
};

// ── Helpers (mirror reconcile script logic) ────────────────────────────────────
const slugify = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const normD = s => (s || '')
  .toLowerCase().replace(/\s+/g, '')
  .replace(/mcg\/ta[b]*/g, 'mcg')
  .replace(/\/vial/g, '').replace(/\/bottle/g, '').replace(/\/tablet/g, '')
  .replace(/iu\/vial/g, 'iu').replace(/,/g, '').replace(/\|/g, '+').replace(/\//g, '+');

const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const mkVarId = (productName, dosage) => {
  const prodSlug = slugify(productName);
  const doseSlug = slugify(
    (dosage || '')
      .replace(/\s*\/\s*(vial|bottle|tablet)/gi, '')
      .replace(/\s*\|\s*/g, '-')
      .trim()
  );
  return `lotusland-${prodSlug}-${doseSlug}`;
};

const fmtUSD = v => (v != null ? `$${Number(v).toFixed(2)}` : '—');
const today  = () => new Date().toISOString().split('T')[0];

// ── ACTION BADGE ───────────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  unchanged:  { label: 'Sin cambios',    color: '#64748b', bg: '#f1f5f9' },
  create:     { label: 'Crear',          color: '#2563eb', bg: '#eff6ff' },
  migrate:    { label: 'Migrar ID',      color: '#7c3aed', bg: '#f5f3ff' },
  update:     { label: 'Actualizar',     color: '#d97706', bg: '#fffbeb' },
  deactivate: { label: 'Desactivar',     color: '#dc2626', bg: '#fef2f2' },
  new_product:{ label: 'Nuevo Producto', color: '#059669', bg: '#f0fdf4' },
};

function ActionBadge({ action }) {
  const cfg = ACTION_CONFIG[action] || ACTION_CONFIG.unchanged;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 700,
      color: cfg.color,
      backgroundColor: cfg.bg,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
const buildStats = (results) => ({
  total:      results.filter(r => !['deactivate'].includes(r.action)).length,
  unchanged:  results.filter(r => r.action === 'unchanged').length,
  create:     results.filter(r => r.action === 'create').length,
  migrate:    results.filter(r => r.action === 'migrate').length,
  update:     results.filter(r => r.action === 'update').length,
  deactivate: results.filter(r => r.action === 'deactivate').length,
});

export default function LotuslandSyncDashboard() {
  const fileRef = useRef(null);
  const [phase, setPhase]     = useState('idle');   // idle | parsing | dry-run | applying | done
  const [jsonData, setJsonData]         = useState(null);
  const [fileName, setFileName]         = useState('');
  const [dryRunResults, setDryRunResults] = useState(null);
  const [confirmText, setConfirmText]   = useState('');
  const [showConfirm, setShowConfirm]   = useState(false);
  const [history, setHistory]           = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [activeTab, setActiveTab]       = useState('all');  // all | create | update | deactivate
  const [searchQ, setSearchQ]           = useState('');

  const saveHistory = useCallback((entry) => {
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Step 1: Parse JSON file ──────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhase('parsing');
    setFileName(file.name);
    setDryRunResults(null);
    setConfirmText('');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data) || !data[0]?.product) throw new Error('Formato inválido. Se espera un array con campos: product, dosage, quantity, perVialPriceUSD, perKitPriceUSD, presentation.');
      setJsonData(data);
      setPhase('ready');
      toast.success(`${data.length} variantes cargadas desde ${file.name}`);
    } catch (err) {
      toast.error(err.message || 'Error al parsear el JSON');
      setPhase('idle');
    }
    e.target.value = '';
  }, []);

  // ── Step 2: Dry-run ──────────────────────────────────────────────────────────
  const runDryRun = useCallback(async () => {
    if (!jsonData) return;
    setPhase('dry-run');
    const toastId = toast.loading('Consultando Firestore…');
    try {
      // Fetch all products and Lotusland variants
      const prodSnap = await getDocs(collection(db, 'products'));
      const dbProds  = prodSnap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));

      const varSnap  = await getDocs(collectionGroup(db, 'variants'));
      const dbVars   = [];
      for (const vDoc of varSnap.docs) {
        const data = vDoc.data();
        const sn   = (data.supplier || '').toLowerCase();
        if (!(sn.includes('lotusland'))) continue;
        const pId  = vDoc.ref.path.split('/')[1];
        const par  = dbProds.find(p => p.id === pId);
        dbVars.push({
          id: vDoc.id, ref: vDoc.ref, productId: pId,
          productName: par ? (par.name || par.title) : (data.productName || pId),
          dosage: data.dosage || data.strength || '',
          supplierUnitCostUSD: data.supplierUnitCostUSD ?? null,
          supplierKitCostUSD:  data.supplierKitCostUSD  ?? null,
          activeForSupplier:   data.activeForSupplier   ?? true,
          presentation:        data.presentation        || null,
          quantity:            data.quantity            || null,
          data,
        });
      }

      const results   = [];
      const matchedPaths = new Set();

      for (const item of jsonData) {
        const canonId   = CANONICAL_MAP[item.product];
        let parentProd  = dbProds.find(p => p.id === canonId)
                       || dbProds.find(p => norm(p.name) === norm(item.product) || norm(p.title) === norm(item.product));

        const itemDoseNorm = normD(item.dosage);
        const targetVarId  = mkVarId(item.product, item.dosage);

        if (!parentProd) {
          results.push({ action: 'create', new_product: true, item, targetVarId });
          continue;
        }

        const candidates = dbVars.filter(v => v.productId === parentProd.id && normD(v.dosage) === itemDoseNorm);
        const existing   = candidates.find(v => v.id === targetVarId);

        if (existing) {
          matchedPaths.add(existing.ref.path);
          candidates.filter(c => c.id !== targetVarId).forEach(dup => {
            matchedPaths.add(dup.ref.path);
          });

          const sameCost = existing.supplierUnitCostUSD === item.perVialPriceUSD
                        && existing.supplierKitCostUSD  === item.perKitPriceUSD;
          const samePres = existing.presentation === item.presentation;
          const sameQty  = existing.quantity     === item.quantity;

          if (!sameCost || !samePres || !sameQty || existing.activeForSupplier !== true || existing.data.productName !== item.product) {
            results.push({
              action: 'update', item, existing, targetVarId, parentProd,
              changes: {
                cost: !sameCost   ? { from: `${fmtUSD(existing.supplierUnitCostUSD)} / ${fmtUSD(existing.supplierKitCostUSD)}`, to: `${fmtUSD(item.perVialPriceUSD)} / ${fmtUSD(item.perKitPriceUSD)}` } : null,
                pres: !samePres   ? { from: existing.presentation, to: item.presentation } : null,
                qty:  !sameQty    ? { from: existing.quantity,     to: item.quantity     } : null,
              }
            });
          } else {
            results.push({ action: 'unchanged', item, existing, targetVarId, parentProd });
          }
        } else if (candidates.length > 0) {
          const old = candidates[0];
          matchedPaths.add(old.ref.path);
          results.push({ action: 'migrate', item, old, targetVarId, parentProd });
        } else {
          results.push({ action: 'create', item, targetVarId, parentProd });
        }
      }

      // Deactivations
      for (const fv of dbVars) {
        if (!matchedPaths.has(fv.ref.path) && fv.activeForSupplier !== false) {
          results.push({ action: 'deactivate', existing: fv });
        }
      }

      setDryRunResults({ results, dbProds, dbVars, runAt: new Date().toISOString() });
      setPhase('preview');
      toast.success('Dry-run completed successfully', { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Dry-run error', { id: toastId });
      setPhase('ready');
    }
  }, [jsonData]);

  // ── Step 3: Apply ────────────────────────────────────────────────────────────
  const applyChanges = useCallback(async () => {
    if (confirmText !== 'CONFIRM' || !dryRunResults || !jsonData) return;
    setShowConfirm(false);
    setPhase('applying');
    const toastId = toast.loading('Aplicando cambios en Firestore…');
    try {
      const { results, dbProds } = dryRunResults;
      const dateStr = today();
      let written = 0, deleted = 0, deactivated = 0;

      const mkPayload = (item) => ({
        supplierId: SUPPLIER_ID, supplierName: SUPPLIER_NAME, catalogBrand: CATALOG_BRAND,
        supplierUnitCostUSD: item.perVialPriceUSD, supplierKitCostUSD: item.perKitPriceUSD,
        supplierCurrency: 'USD', supplierCostSource: 'admin_sync_dashboard',
        supplierCostSourceDate: dateStr, supplierCostUpdatedAt: serverTimestamp(),
        dosage: item.dosage, normalizedDosage: normD(item.dosage),
        dosageForm: item.presentation === 'vial' ? 'Lyophilized vial' : item.presentation === 'bottle' ? 'Tablet' : 'Other',
        packageType: item.presentation, quantity: item.quantity,
        presentation: item.presentation, activeForSupplier: true,
        sourceOfTruthMismatch: false, supplier: 'LotusLand',
        productName: item.product,
        pricing: { master: { perUnit: item.perVialPriceUSD, kit: item.perKitPriceUSD, currency: 'USD' } },
        updatedAt: serverTimestamp(), updatedBy: 'admin_sync_dashboard',
      });

      for (const r of results) {
        if (r.action === 'unchanged') continue;

        if (r.action === 'deactivate') {
          await updateDoc(r.existing.ref, {
            activeForSupplier: false, catalogStatus: 'not_in_pdf',
            deactivatedAt: serverTimestamp(), deactivatedBy: 'admin_sync_dashboard',
          });
          deactivated++;
          continue;
        }

        // Resolve parent product
        let finalProd = r.parentProd;
        if (!finalProd && r.new_product) {
          const canonId = CANONICAL_MAP[r.item.product] || slugify(r.item.product);
          const prodRef = doc(db, 'products', canonId);
          await setDoc(prodRef, {
            name: r.item.product, canonicalName: r.item.product,
            status: 'published', isActive: true, category: 'Peptides',
            createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          }, { merge: true });
          finalProd = { id: canonId, ref: prodRef, name: r.item.product };
        }
        if (!finalProd) continue;

        const varRef  = finalProd.ref.collection('variants').doc(r.targetVarId);
        const payload = mkPayload(r.item);

        if (r.action === 'migrate') {
          // Inherit original createdAt
          if (r.old?.data?.createdAt) payload.createdAt = r.old.data.createdAt;
          payload.migratedFrom = r.old?.id;
          await setDoc(varRef, { ...payload, createdBy: 'admin_sync_dashboard' });
          await deleteDoc(r.old.ref);
          written++;
        } else if (r.action === 'create') {
          await setDoc(varRef, { ...payload, createdAt: serverTimestamp(), createdBy: 'admin_sync_dashboard' });
          written++;
        } else if (r.action === 'update') {
          await updateDoc(varRef, payload);
          written++;
        }
      }

      // Save to history
      const stats = buildStats(results);
      saveHistory({
        at: new Date().toISOString(),
        file: fileName,
        total: jsonData.length,
        written, deleted, deactivated,
        stats,
      });

      setPhase('done');
      toast.success(`✅ Sync completed — ${written} written, ${deactivated} deactivated`, { id: toastId, duration: 6000 });
    } catch (err) {
      toast.error(err.message || 'Error applying changes', { id: toastId });
      setPhase('preview');
    }
  }, [dryRunResults, jsonData, confirmText, fileName, saveHistory]);

  const stats = dryRunResults ? buildStats(dryRunResults.results) : null;

  const filteredResults = dryRunResults?.results.filter(r => {
    if (activeTab !== 'all' && r.action !== activeTab) return false;
    const q = searchQ.toLowerCase();
    if (!q) return true;
    const prod = r.item?.product || r.existing?.productName || '';
    const dose = r.item?.dosage  || r.existing?.dosage       || '';
    return prod.toLowerCase().includes(q) || dose.toLowerCase().includes(q);
  }) || [];

  const isClean = stats && stats.create === 0 && stats.migrate === 0 && stats.update === 0 && stats.deactivate === 0;
  const needsAction = stats && (stats.create + stats.migrate + stats.update + stats.deactivate) > 0;

  // ── TABLE COLUMNS ────────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'action', header: 'Acción', width: '110px',
      render: r => <ActionBadge action={r.action} />,
    },
    {
      key: 'product', header: 'Producto', width: '28%',
      render: r => {
        const name = r.item?.product || r.existing?.productName || '—';
        const dose = r.item?.dosage  || r.existing?.dosage      || '';
        return (
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dose}</div>
          </div>
        );
      },
    },
    {
      key: 'presentation', header: 'Presentación', width: '100px',
      render: r => {
        const pres = r.item?.presentation || r.existing?.presentation || '—';
        const icon = { vial: '💉', bottle: '🧴', kit: '📦', box: '📫' }[pres] || '📦';
        return <span style={{ fontSize: '0.8rem' }}>{icon} {pres}</span>;
      },
    },
    {
      key: 'cost', header: 'Coste (Unit / Kit)', width: '150px', align: 'right',
      render: r => {
        const u = r.item?.perVialPriceUSD ?? r.existing?.supplierUnitCostUSD;
        const k = r.item?.perKitPriceUSD  ?? r.existing?.supplierKitCostUSD;
        return (
          <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
            <div style={{ fontWeight: 700 }}>{fmtUSD(u)}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>kit {fmtUSD(k)}</div>
          </div>
        );
      },
    },
    {
      key: 'changes', header: 'Cambios detectados', width: '30%',
      render: r => {
        if (r.action === 'unchanged')  return <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Sin cambios</span>;
        if (r.action === 'deactivate') return <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>No está en el JSON fuente</span>;
        if (r.action === 'create')     return <span style={{ color: '#2563eb', fontSize: '0.75rem' }}>Nueva variante{r.new_product ? ' + Nuevo Producto' : ''}</span>;
        if (r.action === 'migrate')    return <span style={{ color: '#7c3aed', fontSize: '0.75rem' }}>ID antiguo: <code style={{ fontSize: '0.7rem' }}>{r.old?.id}</code></span>;
        if (r.action === 'update' && r.changes) {
          return (
            <div style={{ fontSize: '0.75rem' }}>
              {r.changes.cost && <div>💰 Coste: <s style={{ color: 'var(--text-muted)' }}>{r.changes.cost.from}</s> → <b style={{ color: '#059669' }}>{r.changes.cost.to}</b></div>}
              {r.changes.pres && <div>📦 Pres: <s style={{ color: 'var(--text-muted)' }}>{r.changes.pres.from}</s> → <b>{r.changes.pres.to}</b></div>}
              {r.changes.qty  && <div>📊 Qty: <s style={{ color: 'var(--text-muted)' }}>{r.changes.qty.from}</s> → <b>{r.changes.qty.to}</b></div>}
            </div>
          );
        }
        return null;
      },
    },
    {
      key: 'variantId', header: 'ID Variante', width: '22%',
      render: r => {
        const id = r.targetVarId || r.existing?.id || '—';
        return <code style={{ fontSize: '0.68rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{id}</code>;
      },
    },
  ];

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0 0 3rem 0' }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Catalog Sync — Lotusland"
        subtitle="Sincroniza el catálogo RegenPept desde un JSON fuente de verdad. Dry-run primero, aplica después."
        icon={RefreshCw}
        panel="admin"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {phase === 'preview' && needsAction && (
              <button
                onClick={() => { setConfirmText(''); setShowConfirm(true); }}
                style={STYLE.btnPrimary}
              >
                <Zap size={14} /> Aplicar cambios
              </button>
            )}
            {(phase === 'preview' || phase === 'done') && (
              <button onClick={runDryRun} style={STYLE.btnSecondary} disabled={phase === 'dry-run' || phase === 'applying'}>
                <Play size={14} /> Re-ejecutar dry-run
              </button>
            )}
            <button onClick={() => fileRef.current?.click()} style={STYLE.btnSecondary} disabled={phase === 'applying' || phase === 'dry-run'}>
              <Upload size={14} /> {jsonData ? 'Cargar nuevo JSON' : 'Cargar JSON'}
            </button>
            <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
        }
      />

      {/* IDLE STATE */}
      {phase === 'idle' && (
        <div style={STYLE.card}>
          <EmptyState
            icon={FileJson}
            title="Sin archivo cargado"
            subtitle='Haz clic en "Cargar JSON" para subir el LotusLand Master Price List.json y ejecutar el dry-run.'
            action={{ label: 'Cargar JSON ahora', onClick: () => fileRef.current?.click() }}
          />
        </div>
      )}

      {/* LOADING */}
      {(phase === 'parsing' || phase === 'dry-run') && (
        <div style={{ ...STYLE.card, textAlign: 'center', padding: '3rem' }}>
          <div style={{ ...STYLE.spinner }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            {phase === 'parsing' ? 'Procesando JSON…' : 'Consultando Firestore y calculando diff…'}
          </p>
        </div>
      )}

      {/* JSON LOADED — ready to dry-run */}
      {phase === 'ready' && jsonData && (
        <div style={STYLE.card}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.75rem 1.25rem', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>Archivo cargado</div>
              <div style={{ fontWeight: 700, color: '#1e40af' }}>{fileName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{jsonData.length} variantes</div>
            </div>
            <button onClick={runDryRun} style={{ ...STYLE.btnPrimary, fontSize: '0.95rem', padding: '0.75rem 1.5rem' }}>
              <Play size={16} /> Ejecutar Dry-Run
            </button>
          </div>
        </div>
      )}

      {/* DRY-RUN RESULTS */}
      {(phase === 'preview' || phase === 'done' || phase === 'applying') && stats && (
        <>
          {/* STATUS BANNER */}
          <div style={{
            ...STYLE.card,
            borderLeft: `4px solid ${isClean ? '#16a34a' : needsAction ? '#d97706' : '#2563eb'}`,
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            {isClean
              ? <CheckCircle size={20} color="#16a34a" />
              : <AlertTriangle size={20} color="#d97706" />}
            <div>
              <div style={{ fontWeight: 700 }}>
                {phase === 'done'
                  ? '✅ Sincronización aplicada correctamente'
                  : isClean
                    ? `✅ Catálogo en sincronía — ${stats.unchanged}/104 variantes correctas`
                    : `⚠️ Hay ${stats.create + stats.migrate + stats.update + stats.deactivate} cambios pendientes`}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Archivo: <b>{fileName}</b> · {jsonData?.length} variantes · {new Date(dryRunResults.runAt).toLocaleString('es-ES')}
              </div>
            </div>
          </div>

          {/* KPI STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            {[
              { title: 'Sin cambios',  value: stats.unchanged,  icon: CheckCircle, color: '#64748b' },
              { title: 'Crear',        value: stats.create,     icon: PlusCircle,  color: '#2563eb', alert: stats.create > 0 },
              { title: 'Migrar ID',    value: stats.migrate,    icon: RefreshCw,   color: '#7c3aed', alert: stats.migrate > 0 },
              { title: 'Actualizar',   value: stats.update,     icon: Edit3,       color: '#d97706', alert: stats.update > 0 },
              { title: 'Desactivar',   value: stats.deactivate, icon: Trash2,      color: '#dc2626', alert: stats.deactivate > 0 },
              { title: 'Cobertura',    value: `${stats.unchanged}/${jsonData?.length}`, icon: Shield, color: stats.unchanged === jsonData?.length ? '#16a34a' : '#d97706' },
            ].map(k => (
              <MetricCard key={k.title} title={k.title} value={k.value} icon={k.icon} color={k.color} alert={k.alert} />
            ))}
          </div>

          {/* FILTER TABS + SEARCH */}
          <div style={{ ...STYLE.card, padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {[
                { key: 'all',        label: `Todos (${dryRunResults.results.length})` },
                { key: 'create',     label: `Crear (${stats.create})` },
                { key: 'migrate',    label: `Migrar (${stats.migrate})` },
                { key: 'update',     label: `Actualizar (${stats.update})` },
                { key: 'deactivate', label: `Desactivar (${stats.deactivate})` },
                { key: 'unchanged',  label: `Sin cambios (${stats.unchanged})` },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem',
                    fontWeight: activeTab === t.key ? 700 : 500,
                    border: '1px solid',
                    borderColor: activeTab === t.key ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: activeTab === t.key ? 'var(--primary)' : 'transparent',
                    color: activeTab === t.key ? '#fff' : 'var(--text)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              ))}
              <div style={{ marginLeft: 'auto' }}>
                <input
                  placeholder="🔍 Search product..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  style={{
                    padding: '0.35rem 0.75rem', borderRadius: '8px',
                    border: '1px solid var(--border)', fontSize: '0.8rem',
                    background: 'var(--surface)', color: 'var(--text)',
                    minWidth: '200px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* DIFF TABLE */}
          <div style={STYLE.card}>
            {filteredResults.length === 0 ? (
              <EmptyState icon={CheckCircle} title="Sin resultados" subtitle={searchQ ? 'Ninguna variante coincide con la búsqueda.' : 'No hay variantes en esta categoría.'} />
            ) : (
              <DataTable
                data={filteredResults}
                columns={columns}
                keyField="targetVarId"
                globalSearch={false}
                rowStyle={r => ({
                  backgroundColor:
                    r.action === 'create'     ? '#eff6ff' :
                    r.action === 'migrate'    ? '#f5f3ff' :
                    r.action === 'update'     ? '#fffbeb' :
                    r.action === 'deactivate' ? '#fef2f2' :
                    'transparent',
                })}
              />
            )}
          </div>
        </>
      )}

      {/* SYNC HISTORY */}
      {history.length > 0 && (
        <div style={STYLE.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <History size={16} />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Historial de sincronizaciones</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.map((h, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 1rem',
                borderRadius: '8px', background: 'var(--surface-alt, #f8fafc)',
                border: '1px solid var(--border)', flexWrap: 'wrap',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '140px' }}>
                  {new Date(h.at).toLocaleString('es-ES')}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{h.file}</div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {h.written > 0    && <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>✏️ {h.written} escritas</span>}
                  {h.deactivated > 0 && <span style={{ fontSize: '0.75rem', color: '#dc2626' }}>🗑️ {h.deactivated} desactivadas</span>}
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{h.total} variantes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="⚠️ Confirmar sincronización en producción"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>⚠️ Esto modificará Firestore en producción</div>
            <div style={{ fontSize: '0.85rem', color: '#7f1d1d' }}>
              Se aplicarán <b>{stats?.create + stats?.migrate} creaciones/migraciones</b>,
              <b> {stats?.update} actualizaciones</b> y
              <b> {stats?.deactivate} desactivaciones</b>.
              Esta acción no es instantáneamente reversible.
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Escribe <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>CONFIRM</code> para continuar:
            </label>
            <input
              autoFocus
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmText === 'CONFIRM' && applyChanges()}
              placeholder="CONFIRM"
              style={{
                width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px',
                border: `2px solid ${confirmText === 'CONFIRM' ? '#16a34a' : 'var(--border)'}`,
                fontSize: '0.95rem', fontFamily: 'monospace',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowConfirm(false)} style={STYLE.btnSecondary}>Cancelar</button>
            <button
              onClick={applyChanges}
              disabled={confirmText !== 'CONFIRM'}
              style={{ ...STYLE.btnDanger, opacity: confirmText !== 'CONFIRM' ? 0.4 : 1 }}
            >
              <Zap size={14} /> Aplicar en producción
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLE = {
  card: {
    background: 'var(--surface)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    padding: '1.25rem',
    overflow: 'hidden',
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem',
    fontWeight: 600, border: 'none', cursor: 'pointer',
    background: 'var(--primary, #003666)', color: '#fff',
    transition: 'opacity 0.15s',
  },
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem',
    fontWeight: 600, cursor: 'pointer',
    background: 'var(--surface)', color: 'var(--text)',
    border: '1px solid var(--border)', transition: 'all 0.15s',
  },
  btnDanger: {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem',
    fontWeight: 600, border: 'none', cursor: 'pointer',
    background: '#dc2626', color: '#fff', transition: 'opacity 0.15s',
  },
  spinner: {
    width: '36px', height: '36px', margin: '0 auto',
    border: '3px solid var(--border)',
    borderTop: '3px solid var(--primary, #003666)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};
