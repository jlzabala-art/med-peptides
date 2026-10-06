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
  RefreshCw,
  User,
  Stethoscope,
  ShieldCheck,
  Printer
} from '@/lib/icons';
import { db } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'react-hot-toast';

// ── Multi-Tier Cache Layer (0ms Instant Load) ─────────────────────────────────
const _PATIENT_RX_RAM_CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper to safely extract string posology
function getPosologyString(raw) {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') {
    return raw.regimen || raw.summary || raw.timing || raw.notes || (Array.isArray(raw.steps) ? raw.steps[0] : '') || '';
  }
  return String(raw);
}

// Format doctor name and capitalize medical credentials
function formatDoctorName(name) {
  if (!name) return 'Treating Physician';
  return String(name)
    .replace(/,\s*md\b/i, ', MD')
    .replace(/,\s*fishrs\b/i, ', FISHRS')
    .replace(/,\s*phd\b/i, ', PhD')
    .replace(/,\s*facp\b/i, ', FACP')
    .replace(/,\s*faad\b/i, ', FAAD')
    .replace(/\bMd\b/, 'MD')
    .replace(/\bFishrs\b/, 'FISHRS');
}

function normalizePatientRx(d, id, defaultPatName) {
  if (!d) return null;
  const docId = id || d.id || d.prescriptionNumber || d.code || '';
  return {
    id: docId,
    prescriptionNumber: d.prescriptionNumber || d.code || docId,
    code: d.code || d.prescriptionNumber || docId,
    patientName: d.patientName || d.patient?.name || defaultPatName || 'Patient',
    patient: d.patient ? { name: d.patient.name, alias: d.patient.alias, dob: d.patient.dob } : null,
    status: d.status || d.state || 'active',
    state: d.state || d.status || 'active',
    treatmentTitle: d.treatmentTitle || d.description || d.treatmentProgram || d.program || 'Personalized Formulation',
    clinic: d.clinic || d.clinicName || d.treatingDoctor?.clinic || 'Clinical Dispensary',
    clinicName: d.clinicName || d.clinic || d.treatingDoctor?.clinic || '',
    createdAt: d.createdAt ? (d.createdAt.toMillis ? d.createdAt.toMillis() : (d.createdAt.seconds ? d.createdAt.seconds * 1000 : String(d.createdAt))) : null,
    items: Array.isArray(d.items) ? d.items.map(i => ({ name: i.name, dose: i.dose, vehicle: i.vehicle, _isVehicleOrBase: i._isVehicleOrBase })) : [],
    prescriptionLines: Array.isArray(d.prescriptionLines) ? d.prescriptionLines.map(i => ({ name: i.name, dose: i.dose, vehicle: i.vehicle })) : [],
    compounds: Array.isArray(d.compounds) ? d.compounds.map(i => ({ name: i.name, dose: i.dose })) : [],
    posology: getPosologyString(d.posology),
    structuredPosology: d.structuredPosology ? { summary: getPosologyString(d.structuredPosology) } : null,
    treatingDoctor: d.treatingDoctor ? { name: formatDoctorName(d.treatingDoctor.name), clinic: d.treatingDoctor.clinic, specialty: d.treatingDoctor.specialty } : null,
    doctorName: formatDoctorName(d.doctorName || d.treatingDoctor?.name || 'Treating Physician'),
    doctorLicense: d.doctorLicense || d.treatingDoctor?.license || '',
    description: d.description || ''
  };
}

export default function PatientRxSwitcherModal({
  isOpen,
  onClose,
  currentRx = null,
  currentRxId = '',
  patientName = '',
  patientId = '',
  patientPhone = '',
  patientEmail = '',
  lang = 'en',
  onOpenBrochure = null,
  onRequestRefill = null
}) {
  const initialSeed = useMemo(() => {
    if (currentRx) {
      const norm = normalizePatientRx(currentRx, currentRxId || currentRx.id, patientName);
      return norm ? [norm] : [];
    }
    return [];
  }, [currentRx, currentRxId, patientName]);

  const [prescriptions, setPrescriptions] = useState(initialSeed);
  const [loading, setLoading] = useState(false);
  const [isBackgroundUpdating, setIsBackgroundUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all');
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
    { id: 'completed', label: isEs ? 'Completadas' : 'Completed' },
  ];

  // ── Multi-Tier Fetch (RAM -> localStorage -> Server Admin SDK API) ─────────
  const fetchPrescriptions = useCallback(async (forceRefresh = false) => {
    const normName = (patientName || '').toLowerCase().trim();
    const normId = (patientId || '').toLowerCase().trim();
    const cacheKey = `patient_rx_${normId || normName || 'current'}`;
    const storageKey = `atlas_patient_rx_cache_${normId || normName || 'current'}`;

    let hasCachedData = false;
    const now = Date.now();

    // 1. Tier 1: Check Memory RAM Cache
    if (!forceRefresh) {
      const inRam = _PATIENT_RX_RAM_CACHE.get(cacheKey);
      if (inRam && (now - inRam.timestamp < CACHE_TTL_MS)) {
        setPrescriptions(inRam.data);
        hasCachedData = true;
      } else if (typeof window !== 'undefined') {
        // 2. Tier 2: Check localStorage Cache
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.data) && parsed.data.length > 0) {
              setPrescriptions(parsed.data);
              hasCachedData = true;
              _PATIENT_RX_RAM_CACHE.set(cacheKey, { data: parsed.data, timestamp: parsed.timestamp || now });
            }
          }
        } catch (e) {
          console.warn('PatientRxSwitcher: localStorage read error', e);
        }
      }
    }

    if (!hasCachedData && initialSeed.length === 0) {
      setLoading(true);
    } else {
      setIsBackgroundUpdating(true);
    }

    // 3. Tier 3: Fetch from Secure Server API
    try {
      const activeRxKey = currentRxId || currentRx?.id || '';
      const params = new URLSearchParams();
      params.set('scope', 'patient');
      if (patientName) params.set('patientName', patientName);
      if (patientId) params.set('patientId', patientId);
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
        _PATIENT_RX_RAM_CACHE.set(cacheKey, { data: results, timestamp: Date.now() });

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify({ data: results, timestamp: Date.now() }));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('PatientRxSwitcher: server fetch failed', err);
      if (!hasCachedData && initialSeed.length > 0) {
        setPrescriptions(initialSeed);
      }
    } finally {
      setLoading(false);
      setIsBackgroundUpdating(false);
    }
  }, [patientName, patientId, currentRxId, currentRx, initialSeed]);

  useEffect(() => {
    if (isOpen) {
      fetchPrescriptions();
      setTimeout(() => searchRef.current?.focus(), 80);
    } else {
      setSearchQuery('');
      setStatusFilter('all');
      setSelectedDoctorFilter('all');
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
    const url = `${window.location.origin}/rx/${encodeURIComponent(code)}?view=patient`;
    navigator.clipboard?.writeText(url);
    setCopiedId(code);
    toast.success(isEs ? 'Enlace del paciente copiado ✓' : 'Patient link copied ✓');
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

    const cleanCurrent = (currentRxId || '').toUpperCase().replace(/^RX-/, '').trim();
    const cleanTarget = String(targetCode).toUpperCase().replace(/^RX-/, '').trim();
    if (cleanCurrent && cleanTarget && cleanCurrent === cleanTarget) {
      toast.success(isEs ? 'Ya estás viendo esta receta' : 'Already viewing this prescription');
      onClose();
      return;
    }

    onClose();
    window.location.assign(`/rx/${encodeURIComponent(targetCode)}?view=patient`);
  };

  // Distinct doctors list for filtering
  const distinctDoctors = useMemo(() => {
    const map = new Map();
    prescriptions.forEach(rx => {
      const doc = rx.doctorName || rx.treatingDoctor?.name || 'Treating Physician';
      if (doc) {
        map.set(doc, (map.get(doc) || 0) + 1);
      }
    });
    return Array.from(map.entries()).map(([doc, count]) => ({ name: doc, count }));
  }, [prescriptions]);

  const filtered = prescriptions.filter((rx) => {
    const status = String(rx.status || rx.state || '').toLowerCase();
    const doctor = (rx.doctorName || rx.treatingDoctor?.name || '').toLowerCase();
    const clinic = String(rx.clinic || rx.clinicName || rx.treatingDoctor?.clinic || '').toLowerCase();
    const formula = String(rx.treatmentTitle || rx.description || '').toLowerCase();
    const id = String(rx.id || '').toLowerCase();
    const code = String(rx.prescriptionNumber || rx.code || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchSearch = !q || 
      doctor.includes(q) || 
      clinic.includes(q) || 
      formula.includes(q) || 
      id.includes(q) || 
      code.includes(q);

    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && ['active','approved','prescribed','dispensed','processing'].includes(status)) ||
      (statusFilter === 'completed' && ['completed','delivered'].includes(status));

    const matchDoctor =
      selectedDoctorFilter === 'all' ||
      doctor.includes(selectedDoctorFilter.toLowerCase());

    return matchSearch && matchStatus && matchDoctor;
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
            dose: i.dose || i.dosage || i.concentration || ''
          });
        }
      });
    } else if (Array.isArray(rx.prescriptionLines) && rx.prescriptionLines.length > 0) {
      rx.prescriptionLines.forEach(i => {
        list.push({
          name: i.name || i.activeIngredient || i.productName || 'Compound',
          dose: i.dose || i.dosage || i.concentration || ''
        });
      });
    } else if (Array.isArray(rx.compounds) && rx.compounds.length > 0) {
      rx.compounds.forEach(i => {
        list.push({
          name: i.name || i.title || 'Compound',
          dose: i.dose || i.concentration || ''
        });
      });
    }
    return list;
  };

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
          maxWidth: 880,
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
          .gcp-patient-rx-card { transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease; border: 1px solid #dadce0; border-radius: 8px; margin-bottom: 10px; background: #ffffff; }
          .gcp-patient-rx-card:hover { border-color: #1a73e8; box-shadow: 0 2px 6px rgba(60,64,67,0.1); }
          .gcp-patient-rx-card--current { border-color: #1a73e8 !important; background: #f8fafd !important; border-left: 4px solid #1a73e8 !important; }
          .prxsf { padding: 4px 12px; border-radius: 16px; border: 1px solid #dadce0; background: #fff; color: #5f6368; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; }
          .prxsf:hover { background: #f1f3f4; }
          .prxsf--active { background: #e8f0fe !important; border-color: #1a73e8 !important; color: #1a73e8 !important; font-weight: 600 !important; }
          .gcp-btn-primary { background: #1a73e8; border: 1px solid #1a73e8; border-radius: 6px; padding: 6px 14px; font-size: 0.78rem; font-weight: 600; color: #ffffff !important; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
          .gcp-btn-primary:hover { background: #1557b0; border-color: #1557b0; }
          .gcp-btn-outline { background: #ffffff; border: 1px solid #dadce0; border-radius: 6px; padding: 6px 12px; font-size: 0.78rem; font-weight: 600; color: #1a73e8 !important; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
          .gcp-btn-outline:hover { background: #e8f0fe; border-color: #1a73e8; }
        `}</style>

        {/* Header (GCP Standard) */}
        <div style={{ padding: '16px 22px 14px', borderBottom: '1px solid #e8eaed', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              background: '#e8f0fe',
              color: '#1a73e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #d2e3fc',
              flexShrink: 0
            }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.10rem', fontWeight: 600, color: '#202124' }}>
                  {isEs ? 'Mis Prescripciones Médicas' : 'My Clinical Prescriptions'}
                </h2>
                <span style={{ fontSize: '0.70rem', color: '#137333', background: '#e6f4ea', border: '1px solid #ceead6', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                  {isEs ? 'Historial Unificado' : 'Consolidated Record'}
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
                  ? `Prescrito para ${patientName} · Consultas con todos tus médicos tratantes` 
                  : `Prescribed for ${patientName} · Complete treatment records across all your treating physicians`}
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            title={isEs ? 'Cerrar' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search + Doctor and Status Filters (GCP Standard) */}
        <div style={{ padding: '12px 22px', borderBottom: '1px solid #e8eaed', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, background: '#fafbfc' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#80868b', pointerEvents: 'none' }} />
            <input
              ref={searchRef}
              type="text"
              placeholder={isEs ? 'Buscar por médico, clínica, fármaco o ID de prescripción…' : 'Search by doctor, clinic, active drug or Rx ID…'}
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            {/* Status Filters */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 600, textTransform: 'uppercase' }}>
                {isEs ? 'Estado:' : 'Status:'}
              </span>
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { triggerHaptic('light'); setStatusFilter(f.id); }}
                  className={`prxsf ${statusFilter === f.id ? 'prxsf--active' : ''}`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Doctor Filter (if patient has prescriptions from >1 physician) */}
            {distinctDoctors.length > 1 && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#5f6368', fontWeight: 600, textTransform: 'uppercase' }}>
                  {isEs ? 'Médico:' : 'Doctor:'}
                </span>
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #dadce0',
                    fontSize: '0.78rem',
                    color: '#202124',
                    background: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">{isEs ? 'Todos los médicos' : 'All Doctors'}</option>
                  {distinctDoctors.map((d, i) => (
                    <option key={i} value={d.name}>{d.name} ({d.count})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Prescription Cards List */}
        <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '16px 22px', background: '#f8f9fa' }}>
          {loading && prescriptions.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#5f6368' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', color: '#1a73e8' }} />
              <div style={{ fontSize: '0.86rem', fontWeight: 500, color: '#202124' }}>
                {isEs ? 'Cargando tus recetas médicas…' : 'Loading your medical prescriptions…'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: 4 }}>
                {isEs ? 'Consultando historial unificado de pacientes' : 'Accessing consolidated patient repository'}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center', color: '#5f6368', background: '#ffffff', borderRadius: '8px', border: '1px solid #dadce0' }}>
              <FileText size={36} color="#80868b" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#202124' }}>
                {isEs ? 'No se encontraron prescripciones' : 'No prescriptions found'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#5f6368', marginTop: 4, maxWidth: 440, margin: '4px auto 0' }}>
                {searchQuery || statusFilter !== 'all'
                  ? (isEs ? 'Prueba cambiando los filtros o la búsqueda' : 'Try clearing filters or search query')
                  : (isEs ? `No hay registros adicionales para ${patientName}` : `No additional prescription records found for ${patientName}`)}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map((rx) => {
                const targetCode = rx.prescriptionNumber || rx.code || rx.id;
                const cleanTarget = String(targetCode).toUpperCase().replace(/^RX-/, '').trim();
                const isCurrent = cleanCurrentCode && cleanTarget && cleanCurrentCode === cleanTarget;
                const sm = getStatusMeta(rx.status);
                const apis = extractApis(rx);
                const isExpanded = !!expandedRows[rx.id];

                return (
                  <div
                    key={rx.id}
                    className={`gcp-patient-rx-card ${isCurrent ? 'gcp-patient-rx-card--current' : ''}`}
                    style={{ padding: '14px 16px' }}
                  >
                    {/* Header Row: Doctor + Clinic + Rx Code + Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        {/* Treating Physician Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Stethoscope size={14} color="#1a73e8" />
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#202124' }}>
                            {rx.doctorName || rx.treatingDoctor?.name || 'Treating Physician'}
                          </span>
                          {rx.doctorLicense && (
                            <span style={{ fontSize: '0.68rem', color: '#5f6368', background: '#f1f3f4', padding: '1px 6px', borderRadius: '4px' }}>
                              Lic. {rx.doctorLicense}
                            </span>
                          )}
                        </div>

                        {/* Clinic info */}
                        <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} color="#80868b" />
                          <span>{rx.clinic || rx.clinicName || 'Clinical Dispensary'}</span>
                          <span>·</span>
                          <Calendar size={12} color="#80868b" />
                          <span>{formatDate(rx.createdAt)}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Rx Code */}
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: '#1a73e8',
                          background: '#e8f0fe',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #d2e3fc'
                        }}>
                          #{targetCode}
                        </span>

                        {/* Status Badge */}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: '0.70rem',
                          fontWeight: 600,
                          color: sm.color,
                          background: sm.bg,
                          border: `1px solid ${sm.border}`,
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sm.color }} />
                          {sm.label}
                        </span>

                        {isCurrent && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: '#1a73e8',
                            background: '#e8f0fe',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {isEs ? 'Viendo Ahora ●' : 'Currently Viewing ●'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Treatment Title & APIs */}
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f3f4' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#202124' }}>
                        {rx.treatmentTitle || 'Personalized Compounded Regimen'}
                      </div>

                      {/* Active Ingredients Chips */}
                      {apis.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                          {apis.map((api, aIdx) => (
                            <span
                              key={aIdx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: '0.70rem',
                                color: '#3c4043',
                                background: '#f8f9fa',
                                border: '1px solid #dadce0',
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}
                            >
                              <Pill size={11} color="#1a73e8" />
                              <strong style={{ color: '#202124' }}>{api.name}</strong>
                              {api.dose && <span style={{ color: '#1a73e8', fontWeight: 600 }}>{api.dose}</span>}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Posology Note */}
                      {rx.posology && (
                        <div style={{ fontSize: '0.74rem', color: '#5f6368', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={12} color="#1a73e8" style={{ flexShrink: 0 }} />
                          <span><strong>{isEs ? 'Pauta:' : 'Posology:'}</strong> {rx.posology}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Bar (Google Cloud UX Buttons) */}
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={(e) => handleNavigate(rx, e)}
                            className="gcp-btn-primary"
                          >
                            <span>{isEs ? 'Ver Dossier' : 'Open Dossier'}</span>
                            <ChevronRight size={13} />
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: '#137333', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Check size={14} color="#137333" />
                            {isEs ? 'Dossier abierto en pantalla' : 'Dossier loaded in view'}
                          </span>
                        )}

                        {onOpenBrochure && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              onOpenBrochure(rx);
                            }}
                            className="gcp-btn-outline"
                            title={isEs ? 'Ver guía imprimible en PDF' : 'View printable posology guide PDF'}
                          >
                            <FileText size={13} />
                            <span>{isEs ? 'Guía de Tratamiento' : 'Treatment Guide'}</span>
                          </button>
                        )}

                        {onRequestRefill && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              onRequestRefill(rx);
                            }}
                            className="gcp-btn-outline"
                          >
                            <RefreshCw size={12} />
                            <span>{isEs ? 'Solicitar Refill' : 'Request Refill'}</span>
                          </button>
                        )}
                      </div>

                      {/* Copy Link Button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(targetCode, e)}
                        style={{
                          background: 'none',
                          border: '1px solid #dadce0',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '0.72rem',
                          color: copiedId === targetCode ? '#137333' : '#5f6368',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {copiedId === targetCode ? <Check size={12} color="#137333" /> : <Copy size={12} />}
                        <span>{copiedId === targetCode ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Copiar Enlace' : 'Copy Link')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 22px', borderTop: '1px solid #dadce0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', flexShrink: 0 }}>
          <div style={{ fontSize: '0.74rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} color="#137333" />
            <span>{isEs ? 'Acceso seguro al expediente digital del paciente' : 'Secure patient health record · EU GMP dispensary verified'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '6px',
              padding: '6px 16px',
              fontSize: '0.80rem',
              fontWeight: 600,
              color: '#3c4043',
              cursor: 'pointer'
            }}
          >
            {isEs ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
