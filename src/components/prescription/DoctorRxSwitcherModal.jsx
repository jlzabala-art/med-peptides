"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Search, FileText, ChevronRight, ExternalLink, Clock, FlaskConical, Loader2 } from 'lucide-react';
import { db } from '@/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { triggerHaptic } from '@/utils/haptics';

export default function DoctorRxSwitcherModal({
  isOpen,
  onClose,
  currentRxId = '',
  doctorName = '',
  lang = 'en',
}) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const overlayRef = useRef(null);
  const searchRef = useRef(null);
  const isEs = lang === 'es';

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
      label: String(status || '').toUpperCase(),
      color: '#475569', bg: '#f1f5f9', border: '#cbd5e1'
    };

  const STATUS_FILTERS = [
    { id: 'all',       label: isEs ? 'Todas' : 'All' },
    { id: 'active',    label: isEs ? 'Activas' : 'Active' },
    { id: 'pending',   label: isEs ? 'Pendientes' : 'Pending' },
    { id: 'completed', label: isEs ? 'Completadas' : 'Completed' },
  ];

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    try {
      const prescRef = collection(db, 'prescriptions');
      const q1 = query(prescRef, orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q1);
      const results = [];
      const normalizedDoctor = (doctorName || '').toLowerCase().replace('dr. ', '').replace('dr ', '');
      snap.forEach((doc) => {
        const d = doc.data();
        const dName = (
          d.treatingDoctor?.name || d.doctorName || d.doctor?.name || d.prescribingDoctor || ''
        ).toLowerCase();
        if (!normalizedDoctor || dName.includes(normalizedDoctor)) {
          results.push({ id: doc.id, ...d });
        }
      });
      setPrescriptions(results);
    } catch (err) {
      console.warn('DoctorRxSwitcher: fetch failed', err);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, [doctorName]);

  useEffect(() => {
    if (isOpen) {
      fetchPrescriptions();
      setTimeout(() => searchRef.current?.focus(), 120);
    } else {
      setSearchQuery('');
      setStatusFilter('all');
    }
  }, [isOpen, fetchPrescriptions]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = prescriptions.filter((rx) => {
    const status = String(rx.status || rx.state || '').toLowerCase();
    const name = (rx.patientName || rx.patient?.name || '').toLowerCase();
    const id = String(rx.id || rx.prescriptionNumber || '').toLowerCase();
    const formula = String(rx.treatmentTitle || rx.description || rx.program || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || name.includes(q) || id.includes(q) || formula.includes(q);
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
      const d = ts?.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString(isEs ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return '—'; }
  };

  const getFormulaSummary = (rx) => {
    if (rx.treatmentTitle) return rx.treatmentTitle;
    const items = rx.items || rx.prescriptionLines || rx.compounds || [];
    if (items.length > 0) {
      return items.slice(0,2).map(i => i.name || i.drugName || i.activeIngredient || '').filter(Boolean).join(' + ') + (items.length > 2 ? ` +${items.length-2}` : '');
    }
    return rx.description || rx.program || (isEs ? 'Fórmula magistral' : 'Compounded formula');
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(32,33,36,0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '5vh',
        paddingBottom: '5vh',
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
          maxWidth: 680,
          margin: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          animation: 'gcpModalIn 0.2s cubic-bezier(0.4,0,0.2,1)'
        }}
      >
        <style>{`
          @keyframes gcpModalIn { from { opacity:0; transform:translateY(-12px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
          @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
          .rxsc:hover { background:#f8fafd !important; border-color:#1a73e8 !important; }
          .rxsc--cur { background:#e8f0fe !important; border-color:#1a73e8 !important; }
          .rxsf { padding:4px 12px; border-radius:16px; border:1px solid #dadce0; background:#fff; color:#5f6368; font-size:0.78rem; font-weight:500; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
          .rxsf:hover { background:#f1f3f4; }
          .rxsf--active { background:#e8f0fe !important; border-color:#1a73e8 !important; color:#1a73e8 !important; font-weight:600 !important; }
        `}</style>

        {/* Header */}
        <div style={{ padding:'16px 20px 14px', borderBottom:'1px solid #e8eaed', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexShrink:0 }}>
          <div>
            <h2 style={{ margin:0, fontSize:'1rem', fontWeight:600, color:'#202124' }}>
              {isEs ? 'Mis Prescripciones' : 'My Prescriptions'}
            </h2>
            <p style={{ margin:'2px 0 0', fontSize:'0.78rem', color:'#5f6368' }}>
              {isEs ? `${filtered.length} resultado${filtered.length!==1?'s':''} · Selecciona para navegar` : `${filtered.length} result${filtered.length!==1?'s':''} · Select to navigate`}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#5f6368', padding:'4px', borderRadius:'4px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Search + Filters */}
        <div style={{ padding:'12px 20px', borderBottom:'1px solid #e8eaed', display:'flex', flexDirection:'column', gap:10, flexShrink:0 }}>
          <div style={{ position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#80868b', pointerEvents:'none' }} />
            <input
              ref={searchRef}
              type="text"
              placeholder={isEs ? 'Buscar por paciente, ID o fórmula…' : 'Search by patient, ID or formula…'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width:'100%', height:36, padding:'0 10px 0 32px',
                border:'1px solid #dadce0', borderRadius:'6px', fontSize:'0.85rem',
                color:'#202124', background:'#f8f9fa', outline:'none',
                boxSizing:'border-box', transition:'border-color 0.15s, box-shadow 0.15s'
              }}
              onFocus={e => { e.target.style.borderColor='#1a73e8'; e.target.style.background='#fff'; e.target.style.boxShadow='0 0 0 2px rgba(26,115,232,0.15)'; }}
              onBlur={e => { e.target.style.borderColor='#dadce0'; e.target.style.background='#f8f9fa'; e.target.style.boxShadow='none'; }}
            />
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {STATUS_FILTERS.map(f => (
              <button key={f.id} type="button" className={`rxsf${statusFilter===f.id?' rxsf--active':''}`} onClick={() => setStatusFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY:'auto', flexGrow:1, padding:'8px 12px 12px' }}>
          {loading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'32px 0', color:'#5f6368', fontSize:'0.85rem' }}>
              <Loader2 size={18} style={{ animation:'spin 1s linear infinite' }} />
              {isEs ? 'Cargando prescripciones…' : 'Loading prescriptions…'}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'#80868b' }}>
              <FileText size={32} style={{ marginBottom:8, opacity:0.4 }} />
              <p style={{ margin:0, fontSize:'0.85rem', fontWeight:500 }}>
                {isEs ? 'No se encontraron prescripciones' : 'No prescriptions found'}
              </p>
              <p style={{ margin:'4px 0 0', fontSize:'0.78rem' }}>
                {isEs ? 'Intenta con otro término de búsqueda' : 'Try a different search term or filter'}
              </p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {filtered.map((rx) => {
                const rxId = rx.id || rx.prescriptionNumber || '';
                const isCurrent = rxId === currentRxId;
                const statusMeta = getStatusMeta(rx.status || rx.state);
                const patientName = rx.patientName || rx.patient?.name || (isEs ? 'Paciente' : 'Patient');
                const formulaSummary = getFormulaSummary(rx);
                const createdAt = formatDate(rx.createdAt || rx.prescriptionDate);

                return (
                  <a
                    key={rxId}
                    href={`/rx/${rxId}`}
                    className={`rxsc${isCurrent?' rxsc--cur':''}`}
                    onClick={(e) => { triggerHaptic('selection'); onClose(); e.preventDefault(); window.location.href = `/rx/${rxId}`; }}
                    style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'10px 12px', borderRadius:'8px',
                      border:`1px solid ${isCurrent?'#1a73e8':'#e8eaed'}`,
                      background: isCurrent ? '#e8f0fe' : '#ffffff',
                      cursor:'pointer', textDecoration:'none',
                      transition:'all 0.15s ease'
                    }}
                    tabIndex={0}
                  >
                    <div style={{ width:36, height:36, borderRadius:'8px', background: isCurrent?'#c5d9fc':'#f1f3f4', color: isCurrent?'#1a73e8':'#5f6368', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <FileText size={16} />
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                        <span style={{ fontWeight:600, fontSize:'0.88rem', color:'#202124', whiteSpace:'nowrap' }}>{patientName}</span>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'2px 7px', borderRadius:'4px', background:statusMeta.bg, color:statusMeta.color, border:`1px solid ${statusMeta.border}`, fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                          <span style={{ width:5, height:5, borderRadius:'50%', background:statusMeta.color, flexShrink:0 }} />
                          {statusMeta.label}
                        </span>
                        {isCurrent && (
                          <span style={{ fontSize:'0.68rem', color:'#1a73e8', fontWeight:600, background:'#c5d9fc', padding:'2px 7px', borderRadius:'4px' }}>
                            {isEs ? 'ACTUAL' : 'CURRENT'}
                          </span>
                        )}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:3, flexWrap:'wrap' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.76rem', color:'#5f6368' }}>
                          <FlaskConical size={11} />
                          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:220 }}>{formulaSummary}</span>
                        </span>
                        <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.76rem', color:'#80868b' }}>
                          <Clock size={11} />
                          {createdAt}
                        </span>
                        <span style={{ fontSize:'0.72rem', color:'#80868b', fontFamily:'monospace' }}>#{rxId}</span>
                      </div>
                    </div>
                    <ChevronRight size={15} style={{ color:'#bdc1c6', flexShrink:0 }} />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 20px', borderTop:'1px solid #e8eaed', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, background:'#f8f9fa', borderRadius:'0 0 12px 12px' }}>
          <span style={{ fontSize:'0.75rem', color:'#80868b' }}>
            {isEs ? `${filtered.length} prescripción${filtered.length!==1?'es':''}` : `${filtered.length} prescription${filtered.length!==1?'s':''}`}
          </span>
          <a href="/rx/intake" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'0.78rem', color:'#1a73e8', fontWeight:500, textDecoration:'none' }} onClick={onClose}>
            <ExternalLink size={13} />
            {isEs ? 'Importar nueva prescripción' : 'Import new prescription'}
          </a>
        </div>
      </div>
    </div>
  );
}
