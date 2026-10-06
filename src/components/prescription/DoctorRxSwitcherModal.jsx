"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  X, 
  Search, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  Clock, 
  FlaskConical, 
  Loader2, 
  Copy, 
  Check, 
  MapPin, 
  Pill,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { db } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'react-hot-toast';

// ── Multi-Tier Cache Layer (0ms Instant Load) ─────────────────────────────────
// Tier 1: In-memory module cache (survives component remounts within the SPA session)
const _RX_RAM_CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper to safely extract string posology from either string, object, or undefined
function getPosologyString(raw) {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') {
    return raw.regimen || raw.summary || raw.timing || raw.notes || (Array.isArray(raw.steps) ? raw.steps[0] : '') || '';
  }
  return String(raw);
}

function normalizeRx(d, id) {
  if (!d) return null;
  const docId = id || d.id || d.prescriptionNumber || d.code || '';
  return {
    id: docId,
    prescriptionNumber: d.prescriptionNumber || d.code || docId,
    code: d.code || d.prescriptionNumber || docId,
    patientName: d.patientName || d.patient?.name || 'Patient',
    patient: d.patient ? { name: d.patient.name, alias: d.patient.alias } : null,
    status: d.status || d.state || 'active',
    state: d.state || d.status || 'active',
    treatmentTitle: d.treatmentTitle || d.description || d.treatmentProgram || d.program || 'Personalized Formulation',
    clinic: d.clinic || d.clinicName || (typeof d.treatingDoctor === 'object' ? d.treatingDoctor?.clinic : '') || d.doctor?.clinic || '',
    clinicName: d.clinicName || d.clinic || (typeof d.treatingDoctor === 'object' ? d.treatingDoctor?.clinic : '') || '',
    createdAt: d.createdAt ? (d.createdAt.toMillis ? d.createdAt.toMillis() : (d.createdAt.seconds ? d.createdAt.seconds * 1000 : String(d.createdAt))) : null,
    items: Array.isArray(d.items) ? d.items.map(i => ({ name: i.name, dose: i.dose, vehicle: i.vehicle, _isVehicleOrBase: i._isVehicleOrBase })) : [],
    prescriptionLines: Array.isArray(d.prescriptionLines) ? d.prescriptionLines.map(i => ({ name: i.name, dose: i.dose, vehicle: i.vehicle })) : [],
    compounds: Array.isArray(d.compounds) ? d.compounds.map(i => ({ name: i.name, dose: i.dose })) : [],
    posology: getPosologyString(d.posology),
    structuredPosology: d.structuredPosology ? { summary: getPosologyString(d.structuredPosology) } : null,
    treatingDoctor: (typeof d.treatingDoctor === 'string' ? { name: d.treatingDoctor, clinic: d.clinic } : (d.treatingDoctor ? { name: d.treatingDoctor.name, clinic: d.treatingDoctor.clinic } : null)),
    doctorName: (typeof d.treatingDoctor === 'string' ? d.treatingDoctor : d.treatingDoctor?.name) || d.doctorName || d.doctor?.name || d.prescribingDoctor || '',
    description: d.description || ''
  };
}

export default function DoctorRxSwitcherModal({
  isOpen,
  onClose,
  currentRx = null,
  currentRxId = '',
  doctorName = '',
  lang = 'en',
}) {
  const initialSeed = useMemo(() => {
    if (currentRx) {
      const norm = normalizeRx(currentRx, currentRxId || currentRx.id);
      return norm ? [norm] : [];
    }
    return [];
  }, [currentRx, currentRxId]);

  const [prescriptions, setPrescriptions] = useState(initialSeed);
  const [loading, setLoading] = useState(false);
  const [isBackgroundUpdating, setIsBackgroundUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const overlayRef = useRef(null);
  const searchRef = useRef(null);
  const isEs = lang === 'es';

  // Keep current active prescription available immediately
  useEffect(() => {
    if (initialSeed.length > 0) {
      setPrescriptions(prev => {
        if (prev.length === 0) return initialSeed;
        const exists = prev.some(p => p.id === initialSeed[0].id || p.code === initialSeed[0].code);
        return exists ? prev : [initialSeed[0], ...prev];
      });
    }
  }, [initialSeed]);

  const STATUS_META = {
    approved:   { label: isEs ? 'Aprobada'    : 'Approved',   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    active:     { label: isEs ? 'Activa'      : 'Active',     color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    completed:  { label: isEs ? 'Completada'  : 'Completed',  color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    dispensed:  { label: isEs ? 'Dispensada'  : 'Dispensed',  color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    delivered:  { label: isEs ? 'Entregada'   : 'Delivered',  color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
    processing: { label: isEs ? 'Procesando'  : 'Processing', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
    pending:    { label: isEs ? 'Pendiente'   : 'Pending',    color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    draft:      { label: isEs ? 'Borrador'    : 'Draft',      color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
    cancelled:  { label: isEs ? 'Cancelada'   : 'Cancelled',  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    prescribed: { label: isEs ? 'Prescrita'   : 'Prescribed', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  };

  const getStatusMeta = (status) =>
    STATUS_META[String(status || '').toLowerCase()] || {
      label: String(status || 'Active').toUpperCase(),
      color: '#475569', bg: '#f1f5f9', border: '#cbd5e1'
    };

  const STATUS_FILTERS = [
    { id: 'all',       label: isEs ? 'Todas' : 'All' },
    { id: 'active',    label: isEs ? 'Activas' : 'Active' },
    { id: 'pending',   label: isEs ? 'Pendientes' : 'Pending' },
    { id: 'completed', label: isEs ? 'Completadas' : 'Completed' },
  ];

  // ── Multi-Tier Fetch (RAM -> localStorage -> Server Admin SDK API) ─────────
  const fetchPrescriptions = useCallback(async (forceRefresh = false) => {
    const normalizedDoctor = (doctorName || '').toLowerCase().replace('dr. ', '').replace('dr ', '').trim();
    const cacheKey = `rx_list_${normalizedDoctor || 'all'}`;
    const storageKey = `atlas_rx_cache_${normalizedDoctor || 'all'}`;

    let hasCachedData = false;
    const now = Date.now();

    // 1. Tier 1: Check Memory RAM Cache (Instant 0ms)
    if (!forceRefresh) {
      const inRam = _RX_RAM_CACHE.get(cacheKey);
      if (inRam && (now - inRam.timestamp < CACHE_TTL_MS)) {
        setPrescriptions(inRam.data);
        hasCachedData = true;
      } else if (typeof window !== 'undefined') {
        // 2. Tier 2: Check localStorage Cache (Instant ~1ms)
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
              setPrescriptions(parsed.data);
              hasCachedData = true;
              _RX_RAM_CACHE.set(cacheKey, { data: parsed.data, timestamp: parsed.timestamp || now });
            }
          }
        } catch (e) {
          console.warn('DoctorRxSwitcher: localStorage read error', e);
        }
      }
    }

    if (!hasCachedData && initialSeed.length === 0) {
      setLoading(true);
    } else {
      setIsBackgroundUpdating(true);
    }

    // 3. Tier 3: Fetch from Secure Server API (bypasses public client Firestore rule limitations)
    try {
      const activeRxKey = currentRxId || currentRx?.id || '';
      const params = new URLSearchParams();
      params.set('scope', 'doctor');
      if (doctorName) params.set('doctorName', doctorName);
      if (activeRxKey) params.set('currentRxId', activeRxKey);

      const res = await fetch(`/api/prescriptions/switcher-list?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let results = [];
      if (data && data.success && Array.isArray(data.prescriptions)) {
        results = data.prescriptions;
      }

      // Guarantee current active prescription is included
      if (initialSeed.length > 0 && !results.some(r => r.id === initialSeed[0].id || r.code === initialSeed[0].code)) {
        results = [initialSeed[0], ...results];
      }

      if (results.length > 0) {
        setPrescriptions(results);
        _RX_RAM_CACHE.set(cacheKey, { data: results, timestamp: Date.now() });

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify({ data: results, timestamp: Date.now() }));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('DoctorRxSwitcher: server fetch failed', err);
      if (!hasCachedData && initialSeed.length > 0) {
        setPrescriptions(initialSeed);
      }
    } finally {
      setLoading(false);
      setIsBackgroundUpdating(false);
    }
  }, [doctorName, currentRxId, currentRx, initialSeed]);

  useEffect(() => {
    if (isOpen) {
      fetchPrescriptions();
      setTimeout(() => searchRef.current?.focus(), 80);
    } else {
      setSearchQuery('');
      setStatusFilter('all');
      setExpandedRows({});
    }
  }, [isOpen, fetchPrescriptions]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleRow = (id, e) => {
    if (e) e.stopPropagation();
    triggerHaptic('light');
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLink = (code, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    triggerHaptic('selection');
    const url = `${window.location.origin}/rx/${encodeURIComponent(code)}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(code);
    toast.success(isEs ? 'Enlace permanente copiado ✓' : 'Permanent Rx link copied ✓');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNavigate = (rx, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    triggerHaptic('selection');
    const targetCode = rx.prescriptionNumber || rx.code || rx.id;
    if (!targetCode) return;

    // Check if user is already on this prescription
    const cleanCurrent = (currentRxId || '').toUpperCase().replace(/^RX-/, '').trim();
    const cleanTarget = String(targetCode).toUpperCase().replace(/^RX-/, '').trim();
    if (cleanCurrent && cleanTarget && cleanCurrent === cleanTarget) {
      toast.success(isEs ? 'Ya estás viendo este dossier' : 'Already viewing this prescription dossier');
      onClose();
      return;
    }

    onClose();
    window.location.assign(`/rx/${encodeURIComponent(targetCode)}`);
  };

  const filtered = prescriptions.filter((rx) => {
    const status = String(rx.status || rx.state || '').toLowerCase();
    const name = (rx.patientName || rx.patient?.name || '').toLowerCase();
    const id = String(rx.id || '').toLowerCase();
    const prescNum = String(rx.prescriptionNumber || '').toLowerCase();
    const code = String(rx.code || '').toLowerCase();
    const formula = String(rx.treatmentTitle || rx.description || '').toLowerCase();
    const clinic = String(rx.clinic || rx.clinicName || rx.treatingDoctor?.clinic || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    
    const matchSearch = !q || 
      name.includes(q) || 
      id.includes(q) || 
      prescNum.includes(q) || 
      code.includes(q) || 
      formula.includes(q) || 
      clinic.includes(q);

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && ['active','approved','prescribed','dispensed','processing'].includes(status)) ||
      (statusFilter === 'pending' && ['pending','awaiting payment','draft'].includes(status)) ||
      (statusFilter === 'completed' && ['completed','delivered'].includes(status));

    return matchSearch && matchStatus;
  });

  const formatDate = (ts) => {
    if (!ts) return '—';
    try {
      let d;
      if (typeof ts === 'number') d = new Date(ts);
      else if (ts?.toDate) d = ts.toDate();
      else if (ts?.seconds) d = new Date(ts.seconds * 1000);
      else d = new Date(ts);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString(isEs ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  const extractApis = (rx) => {
    const list = [];
    if (Array.isArray(rx.items) && rx.items.length > 0) {
      rx.items.forEach(i => {
        if (!i._isVehicleOrBase && !i.isVehicle) {
          list.push({
            name: i.name || i.drugName || i.activeIngredient || i.productName || 'Compound',
            dose: i.dose || i.dosage || i.concentration || '',
            vehicle: i.vehicle || i.base || rx.volume || ''
          });
        }
      });
    } else if (Array.isArray(rx.prescriptionLines) && rx.prescriptionLines.length > 0) {
      rx.prescriptionLines.forEach(i => {
        list.push({
          name: i.name || i.activeIngredient || i.productName || 'Compound',
          dose: i.dose || i.dosage || i.concentration || '',
          vehicle: i.vehicle || i.base || ''
        });
      });
    } else if (Array.isArray(rx.compounds) && rx.compounds.length > 0) {
      rx.compounds.forEach(i => {
        list.push({
          name: i.name || i.title || 'Compound',
          dose: i.dose || i.concentration || '',
          vehicle: ''
        });
      });
    }
    return list;
  };

  const getFormulaSummary = (rx) => {
    if (rx.treatmentTitle) return rx.treatmentTitle;
    const apis = extractApis(rx);
    if (apis.length > 0) {
      return apis.slice(0, 2).map(i => i.name).join(' + ') + (apis.length > 2 ? ` +${apis.length - 2}` : '');
    }
    return rx.description || (isEs ? 'Fórmula magistral' : 'Compounded formula');
  };

  // Normalized current Rx identifier for 100% accurate match
  const cleanCurrentCode = (currentRxId || '').toUpperCase().replace(/^RX-/, '').trim();

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(32,33,36,0.60)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '3.5vh',
        paddingBottom: '3.5vh',
        overflowY: 'auto'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 24px 64px rgba(60,64,67,0.3)',
          border: '1px solid #dadce0',
          width: '100%',
          maxWidth: 880, // Roomy GCP Dialog
          margin: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'gcpModalIn 0.2s cubic-bezier(0.4,0,0.2,1)'
        }}
      >
        <style>{`
          @keyframes gcpModalIn { from { opacity:0; transform:translateY(-10px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
          @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
          .gcp-rx-row { transition: background 0.15s ease, border-color 0.15s ease; border-bottom: 1px solid #e8eaed; }
          .gcp-rx-row:hover { background: #f8fafd; }
          .gcp-rx-row--cur { background: #e8f0fe !important; border-color: #1a73e8 !important; }
          .rxsf { padding: 4px 12px; border-radius: 16px; border: 1px solid #dadce0; background: #fff; color: #5f6368; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; }
          .rxsf:hover { background: #f1f3f4; }
          .rxsf--active { background: #e8f0fe !important; border-color: #1a73e8 !important; color: #1a73e8 !important; font-weight: 600 !important; }
          .gcp-action-btn-primary { background: #1a73e8; border: 1px solid #1a73e8; border-radius: 6px; padding: 5px 12px; font-size: 0.78rem; font-weight: 600; color: #ffffff !important; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s; text-decoration: none; box-sizing: border-box; }
          .gcp-action-btn-primary:hover { background: #1557b0; border-color: #1557b0; color: #ffffff !important; }
          .gcp-action-btn-secondary { background: #ffffff; border: 1px solid #dadce0; border-radius: 6px; padding: 5px 12px; font-size: 0.78rem; font-weight: 600; color: #1a73e8 !important; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s; text-decoration: none; box-sizing: border-box; }
          .gcp-action-btn-secondary:hover { background: #e8f0fe; border-color: #1a73e8; }
        `}</style>

        {/* Header (GCP Standard) */}
        <div style={{ padding: '16px 22px 14px', borderBottom: '1px solid #e8eaed', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 600, color: '#202124' }}>
                {isEs ? 'Mis Prescripciones' : 'My Prescriptions'}
              </h2>
              <span style={{ fontSize: '0.70rem', color: '#1a73e8', background: '#e8f0fe', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                {isEs ? 'Registro Clínico' : 'Clinical Register'}
              </span>
              {isBackgroundUpdating && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: '#80868b' }}>
                  <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                  {isEs ? 'Sincronizando…' : 'Syncing…'}
                </span>
              )}
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#5f6368' }}>
              {isEs 
                ? `${filtered.length} prescripciones · Despliega para ver principios activos o pulsa Detalle para abrir el dossier` 
                : `${filtered.length} prescriptions · Expand to review active ingredients or click Detail to open dossier`}
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            title={isEs ? 'Cerrar' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search + Filters (GCP Standard) */}
        <div style={{ padding: '12px 22px', borderBottom: '1px solid #e8eaed', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, background: '#fafbfc' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#80868b', pointerEvents: 'none' }} />
            <input
              ref={searchRef}
              type="text"
              placeholder={isEs ? 'Buscar por paciente, ID de prescripción, activos o clínica…' : 'Search by patient, Rx ID, active ingredients or clinic…'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', height: 36, padding: '0 32px 0 32px',
                border: '1px solid #dadce0', borderRadius: '6px', fontSize: '0.85rem',
                color: '#202124', background: '#ffffff', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.15s, box-shadow 0.15s'
              }}
              onFocus={e => { e.target.style.borderColor = '#1a73e8'; e.target.style.boxShadow = '0 0 0 2px rgba(26,115,232,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = '#dadce0'; e.target.style.boxShadow = 'none'; }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#80868b', padding: 2 }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {STATUS_FILTERS.map(f => (
              <button 
                key={f.id} 
                type="button" 
                className={`rxsf${statusFilter === f.id ? ' rxsf--active' : ''}`} 
                onClick={() => setStatusFilter(f.id)}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Headings (GCP Desktop Table Header - Adjusted for Zero Overlap) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 2.3fr 0.85fr 0.9fr 1.65fr 105px',
          alignItems: 'center',
          gap: 10,
          padding: '8px 22px',
          background: '#f1f3f4',
          borderBottom: '1px solid #dadce0',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#5f6368',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          flexShrink: 0
        }}>
          <div></div>
          <div>{isEs ? 'Paciente & Código' : 'Patient & Rx Code'}</div>
          <div>{isEs ? 'Fecha' : 'Date'}</div>
          <div>{isEs ? 'Estado' : 'Status'}</div>
          <div>{isEs ? 'Fórmula & Activos' : 'Formula & APIs'}</div>
          <div style={{ textAlign: 'right' }}>{isEs ? 'Acción' : 'Action'}</div>
        </div>

        {/* List Body */}
        <div style={{ overflowY: 'auto', flexGrow: 1, padding: 0 }}>
          {loading && prescriptions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '48px 0', color: '#5f6368', fontSize: '0.85rem' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: '#1a73e8' }} />
              {isEs ? 'Cargando prescripciones médicas…' : 'Loading prescription records…'}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#80868b' }}>
              <FileText size={38} style={{ marginBottom: 8, opacity: 0.35 }} />
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#3c4043' }}>
                {isEs ? 'No se encontraron prescripciones' : 'No prescriptions found'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>
                {isEs ? 'Intenta con otro término de búsqueda o limpia los filtros' : 'Try a different search query or clear your active filters'}
              </p>
            </div>
          ) : (
            <div>
              {filtered.map((rx) => {
                const targetCode = rx.prescriptionNumber || rx.code || rx.id;
                const cleanRowId = String(rx.id || '').toUpperCase().replace(/^RX-/, '').trim();
                const cleanRowCode = String(rx.code || '').toUpperCase().replace(/^RX-/, '').trim();
                const cleanRowPrescNum = String(rx.prescriptionNumber || '').toUpperCase().replace(/^RX-/, '').trim();

                const isCurrent = Boolean(
                  cleanCurrentCode && (
                    cleanCurrentCode === cleanRowId ||
                    cleanCurrentCode === cleanRowCode ||
                    cleanCurrentCode === cleanRowPrescNum
                  )
                );

                const isExpanded = Boolean(expandedRows[rx.id]);
                const statusMeta = getStatusMeta(rx.status || rx.state);
                const patientName = rx.patientName || rx.patient?.name || (isEs ? 'Paciente' : 'Patient');
                const formulaSummary = getFormulaSummary(rx);
                const apis = extractApis(rx);
                const createdAt = formatDate(rx.createdAt);
                const clinicName = rx.clinic || rx.clinicName || rx.treatingDoctor?.clinic || '';
                
                // Safe string conversion for posology to prevent React Error #31
                const posologySummary = getPosologyString(rx.structuredPosology?.summary) || 
                                        getPosologyString(rx.dosageSchedule) || 
                                        getPosologyString(rx.posology);

                const displayCode = rx.prescriptionNumber || (rx.code ? (rx.code.startsWith('RX-') ? rx.code : `RX-${rx.code}`) : rx.id);

                return (
                  <div key={rx.id} className={`gcp-rx-row${isCurrent ? ' gcp-rx-row--cur' : ''}`}>
                    {/* Primary Row (First Level) */}
                    <div 
                      onClick={(e) => toggleRow(rx.id, e)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '32px 2.3fr 0.85fr 0.9fr 1.65fr 105px',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 22px',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      {/* Accordion Chevron */}
                      <button
                        type="button"
                        onClick={(e) => toggleRow(rx.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: isExpanded ? '#1a73e8' : '#5f6368',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 4,
                          borderRadius: 4,
                          transition: 'transform 0.15s ease'
                        }}
                        title={isExpanded ? (isEs ? 'Colapsar detalles' : 'Collapse details') : (isEs ? 'Expandir APIs' : 'Expand APIs')}
                      >
                        {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                      </button>

                      {/* Patient & Rx Code (Zero Overlap GCP Design) */}
                      <div style={{ minWidth: 0, paddingRight: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 650, fontSize: '0.86rem', color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {patientName}
                          </span>
                          {isCurrent && (
                            <span style={{ fontSize: '0.64rem', color: '#1a73e8', fontWeight: 700, background: '#c5d9fc', padding: '1px 6px', borderRadius: '4px', flexShrink: 0 }}>
                              {isEs ? 'ACTUAL' : 'CURRENT'}
                            </span>
                          )}
                        </div>
                        {/* Monospace Pill + Clinic Name with clean separation and wrapping */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap', minWidth: 0 }}>
                          <span style={{ 
                            fontSize: '0.68rem', 
                            color: '#3c4043', 
                            fontFamily: 'SFMono-Regular, Consolas, Menlo, monospace', 
                            background: '#f1f3f4', 
                            border: '1px solid #dadce0',
                            padding: '1px 6px', 
                            borderRadius: '4px',
                            maxWidth: 145,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }} title={displayCode}>
                            #{displayCode}
                          </span>
                          {clinicName && (
                            <span style={{ 
                              fontSize: '0.70rem', 
                              color: '#5f6368', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap', 
                              maxWidth: 135,
                              flexShrink: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 3
                            }} title={clinicName}>
                              <span style={{ color: '#9aa0a6' }}>•</span>
                              {clinicName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div style={{ fontSize: '0.78rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                        <Clock size={12} style={{ color: '#80868b', flexShrink: 0 }} />
                        <span>{createdAt}</span>
                      </div>

                      {/* Status Badge (GCP Semantic) */}
                      <div>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: statusMeta.bg,
                          color: statusMeta.color,
                          border: `1px solid ${statusMeta.border}`,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusMeta.color, flexShrink: 0 }} />
                          {statusMeta.label}
                        </span>
                      </div>

                      {/* Formula & APIs Quick Pill */}
                      <div style={{ minWidth: 0, paddingRight: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <FlaskConical size={12} style={{ color: '#1a73e8', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.76rem', color: '#3c4043', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {formulaSummary}
                          </span>
                        </div>
                        {apis.length > 0 && (
                          <div style={{ fontSize: '0.68rem', color: '#1a73e8', marginTop: 1, fontWeight: 500 }}>
                            {apis.length} {isEs ? 'principios activos' : 'active ingredients'}
                          </div>
                        )}
                      </div>

                      {/* Action Button (Native <a> tag + handleNavigate for robust UX) */}
                      <div style={{ textAlign: 'right' }}>
                        <a
                          href={`/rx/${encodeURIComponent(targetCode)}`}
                          className={isCurrent ? "gcp-action-btn-secondary" : "gcp-action-btn-primary"}
                          onClick={(e) => handleNavigate(rx, e)}
                          title={isEs ? 'Abrir dossier clínico de esta prescripción' : 'Open clinical dossier for this prescription'}
                        >
                          <span>{isCurrent ? (isEs ? 'Viendo' : 'Viewing') : (isEs ? 'Detalle' : 'Detail')}</span>
                          <ChevronRight size={13} />
                        </a>
                      </div>
                    </div>

                    {/* Expandable Master-Detail Panel (APIs & Clinical Summary) */}
                    {isExpanded && (
                      <div style={{
                        padding: '12px 22px 16px 56px',
                        background: '#f8fafd',
                        borderTop: '1px dashed #dadce0',
                        borderLeft: '3px solid #1a73e8',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}>
                        {/* APIs Breakdown */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Pill size={13} style={{ color: '#1a73e8' }} />
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#3c4043', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                              {isEs ? 'Principios Activos & Concentración' : 'Active Ingredients & Concentration'}
                            </span>
                            <span style={{ fontSize: '0.70rem', color: '#5f6368', background: '#e8eaed', padding: '1px 6px', borderRadius: '10px' }}>
                              {apis.length} APIs
                            </span>
                          </div>

                          {apis.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {apis.map((item, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    background: '#ffffff',
                                    border: '1px solid #dadce0',
                                    borderRadius: '6px',
                                    padding: '5px 10px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
                                  }}
                                >
                                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#202124' }}>
                                    {item.name}
                                  </span>
                                  {item.dose && (
                                    <span style={{
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      color: '#1a73e8',
                                      background: '#e8f0fe',
                                      border: '1px solid #d2e3fc',
                                      padding: '2px 7px',
                                      borderRadius: '4px',
                                      flexShrink: 0
                                    }}>
                                      {item.dose}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.75rem', color: '#5f6368', fontStyle: 'italic', background: '#fff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #dadce0' }}>
                              {formulaSummary}
                            </div>
                          )}
                        </div>

                        {/* Posology & Clinic Meta */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            {clinicName && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', color: '#5f6368' }}>
                                <MapPin size={12} style={{ color: '#1a73e8' }} />
                                <span>{clinicName}</span>
                              </div>
                            )}
                            {posologySummary && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.74rem', color: '#5f6368' }}>
                                <Clock size={12} style={{ color: '#0d9488' }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>
                                  {String(posologySummary)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Secondary Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              onClick={(e) => handleCopyLink(targetCode, e)}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #dadce0',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '0.72rem',
                                fontWeight: 500,
                                color: '#5f6368',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                              title={isEs ? 'Copiar enlace permanente de la prescripción' : 'Copy permanent prescription URL'}
                            >
                              {copiedId === targetCode ? <Check size={12} style={{ color: '#16a34a' }} /> : <Copy size={12} />}
                              <span>{copiedId === targetCode ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar URL' : 'Copy URL')}</span>
                            </button>
                            <a
                              href={`/rx/${encodeURIComponent(targetCode)}`}
                              className="gcp-action-btn-primary"
                              onClick={(e) => handleNavigate(rx, e)}
                              style={{ padding: '4px 12px', fontSize: '0.74rem' }}
                            >
                              <span>{isEs ? 'Abrir Dossier Completo →' : 'Open Full Dossier →'}</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer (GCP Standard) */}
        <div style={{ padding: '12px 22px', borderTop: '1px solid #e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#f8f9fa', borderRadius: '0 0 12px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.75rem', color: '#5f6368', fontWeight: 500 }}>
              {isEs 
                ? `${filtered.length} prescripción${filtered.length !== 1 ? 'es' : ''} disponible${filtered.length !== 1 ? 's' : ''}` 
                : `${filtered.length} prescription${filtered.length !== 1 ? 's' : ''} available`}
            </span>
            <button
              type="button"
              onClick={() => fetchPrescriptions(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#1a73e8',
                fontSize: '0.72rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 6px',
                borderRadius: '4px'
              }}
              title={isEs ? 'Refrescar datos desde el servidor' : 'Refresh data from server'}
            >
              <RefreshCw size={11} className={isBackgroundUpdating ? 'spin' : ''} />
              <span>{isEs ? 'Actualizar' : 'Refresh'}</span>
            </button>
          </div>
          <a 
            href="/rx/intake" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 5, 
              fontSize: '0.78rem', 
              color: '#1a73e8', 
              fontWeight: 600, 
              textDecoration: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              transition: 'background 0.15s'
            }} 
            onClick={onClose}
          >
            <ExternalLink size={13} />
            {isEs ? 'Importar nueva prescripción' : 'Import new prescription'}
          </a>
        </div>
      </div>
    </div>
  );
}
