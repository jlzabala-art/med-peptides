"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, X, User, FileText, Pill, Sparkles, ArrowRight, 
  ExternalLink, CheckCircle2, ShieldCheck, ChevronRight, Lock
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';

export default function DoctorPracticeSearchModal({
  isOpen,
  onClose,
  doctor = {},
  isAuthorizedViewer = false,
  opaqueDoctorCode = '',
  prescriptions = [],
  topFormulations = [],
  onSelectPatient,
  onSelectPrescription,
  onSelectProduct,
  onSelectRecommendation,
  triggerHaptic
}) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'patients' | 'prescriptions' | 'products' | 'recommendations'
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // DHA / HIPAA Patient Privacy Helpers
  const getCodifiedPatientId = (patientName, code) => {
    const rawCode = String(code || '');
    const cleanSuffix = rawCode.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanSuffix.length >= 4) {
      return `PT-${cleanSuffix.slice(-4).toUpperCase()}`;
    }
    const cleanName = String(patientName || '').replace(/[^a-zA-Z0-9]/g, '');
    if (cleanName.length >= 4) {
      return `PT-${cleanName.slice(-4).toUpperCase()}`;
    }
    return 'PT-XXXX';
  };

  const maskCode = (code, rawName) => {
    if (!code || code === 'N/A') return 'N/A';
    if (isAuthorizedViewer) return code;
    let clean = String(code);
    if (rawName && rawName !== 'Anonymous Patient') {
      const parts = rawName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().split(/\s+/).filter(p => p.length >= 2);
      for (const part of parts) {
        clean = clean.replace(new RegExp(`[-_]?${part}`, 'gi'), '');
      }
      clean = clean.replace(/[-_]+$/, '');
    }
    clean = clean.replace(/-(?:[a-z]{3,}-?)+$/i, '');
    return clean || 'RX-PT-XXXX';
  };

  // 1. Extract Unique Patients (Strictly isolated to this doctor's prescriptions, Sold first)
  const patientsList = useMemo(() => {
    const map = new Map();
    prescriptions.forEach(rx => {
      const name = (rx.patientName || rx.patient?.name || rx.patientId || '').trim();
      if (!name) return;
      const codifiedId = getCodifiedPatientId(name, rx.prescriptionNumber || rx.code);
      const displayName = isAuthorizedViewer ? name : `Patient ${codifiedId}`;
      const safeRxCode = maskCode(rx.prescriptionNumber || rx.code, name);
      const key = isAuthorizedViewer 
        ? (String(name)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/^(mr\.?|mrs\.?|ms\.?|miss|dr\.?|prof\.?|patient:?|paciente:?)\s+/i, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase() || String(rx.patientId || rx.id || '').toLowerCase())
        : codifiedId;

      const s = (rx.status || rx.state || '').toLowerCase().trim();
      const rawInv = rx.invoiceRef ? String(rx.invoiceRef).trim() : '';
      const hasInv = rawInv && !/(proposal|unaccepted|propuesta|offer|sin pedido)/i.test(rawInv);
      const isFulfilled = ['completed', 'delivered', 'shipped', 'paid'].includes(s) || ['Delivered', 'Ordered'].includes(rx.orderStatus || '');
      const isProp = !isFulfilled && !hasInv && Boolean(
        s === 'proposal_pending' ||
        rx.isTreatmentProposal ||
        rx.orderStatus === 'Offer Not Accepted' ||
        String(rx.treatmentProgram || '').toLowerCase().includes('proposal') ||
        String(rx.invoiceRef || '').toLowerCase().includes('proposal')
      );
      const isSold = !isProp && Boolean(hasInv || rx.orderStatus === 'Ordered' || ['active', 'approved', 'completed', 'paid', 'shipped', 'delivered', 'en tránsito', 'processing', 'dispensed'].includes(s));

      if (!map.has(key)) {
        map.set(key, {
          name,
          displayName,
          codifiedId,
          safeRxCode,
          id: rx.patientId || rx.code || 'PAT-01',
          prescriptionsCount: 0,
          latestRx: rx,
          latestDate: rx.startDate || rx.createdAt || rx.dateIssued || 'Recent',
          status: isSold ? 'approved' : (isProp ? 'proposal_pending' : (rx.status || 'active')),
          hasSold: isSold,
          invoiceRef: hasInv ? rawInv : null
        });
      }
      const entry = map.get(key);
      entry.prescriptionsCount += 1;
      if (isSold) {
        entry.hasSold = true;
        entry.status = 'approved';
        if (hasInv && !entry.invoiceRef) entry.invoiceRef = rawInv;
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      if (a.hasSold !== b.hasSold) return a.hasSold ? -1 : 1;
      return b.prescriptionsCount - a.prescriptionsCount;
    });
  }, [prescriptions, isAuthorizedViewer]);

  // 2. Curated Clinical Synergies & Recommendations
  const curatedRecommendations = useMemo(() => [
    {
      id: 'rec-epithalon',
      title: 'Epithalon 50mg Lyophilized SubQ Vial',
      subtitle: 'Pineal Epigenetic Peptide · Telomerase Activation Cycle',
      format: 'SubQ Vial',
      formatBadge: 'SubQ Vial',
      formatColor: '#047857',
      formatBg: '#d1fae5',
      badge: 'Epigenetic Reset',
      synergyWith: 'Pairs with Selank / Semax & Neuro-Longevity regimens',
      tag: 'Cellular Longevity'
    },
    {
      id: 'rec-colway-vege',
      title: 'Colway Native Collagen Vege & Tropocollagen',
      subtitle: 'Phyto-Collagen Matrix · Cuticular & Dermal ECM Repair',
      format: 'Native Bio-Matrix',
      formatBadge: 'Collagen Bio-Matrix',
      formatColor: '#be185d',
      formatBg: '#fce7f3',
      badge: 'Natural ECM',
      synergyWith: 'Pairs with Scalp TrichoSol & GHK-Cu Tissue Regeneration',
      tag: 'Follicular & ECM'
    },
    {
      id: 'rec-dbs-panel',
      title: 'CE-IVDR Capillary Pre-Treatment Baseline Panel',
      subtitle: 'Quantitative DBS Assays · Ferritin, Vitamin D, IGF-1, hsCRP',
      format: 'Lab Diagnostic',
      formatBadge: 'CE-IVDR DBS',
      formatColor: '#6d28d9',
      formatBg: '#ede9fe',
      badge: 'Safety Baseline',
      synergyWith: 'Pre-requisite for high-affinity bioregulator cycles',
      tag: 'Diagnostics'
    },
    {
      id: 'rec-retatrutide',
      title: 'Retatrutide 10mg / Tirzepatide Incretin Agonists',
      subtitle: 'Triple GIP/GLP-1/Glucagon Receptor Agonist Multi-Dose Vial',
      format: 'Subcutaneous Vial',
      formatBadge: 'SubQ Vial',
      formatColor: '#047857',
      formatBg: '#d1fae5',
      badge: 'Metabolic Peak',
      synergyWith: 'Pairs with BPC-157 to preserve GI mucosal barrier',
      tag: 'Metabolic Axis'
    }
  ], []);

  // 3. Search Results Filtering
  const cleanQ = query.trim().toLowerCase();

  const matchingPatients = useMemo(() => {
    if (!cleanQ) return patientsList.slice(0, 8);
    return patientsList.filter(p => {
      if (isAuthorizedViewer) {
        return p.name.toLowerCase().includes(cleanQ) || String(p.id).toLowerCase().includes(cleanQ) || String(p.invoiceRef || '').toLowerCase().includes(cleanQ);
      }
      // Strictly prevent matching by raw nominal names for unregistered/unauthenticated users
      return (
        p.displayName.toLowerCase().includes(cleanQ) ||
        p.codifiedId.toLowerCase().includes(cleanQ) ||
        p.safeRxCode.toLowerCase().includes(cleanQ) ||
        String(p.invoiceRef || '').toLowerCase().includes(cleanQ)
      );
    });
  }, [cleanQ, patientsList, isAuthorizedViewer]);

  const matchingPrescriptions = useMemo(() => {
    if (!cleanQ) return prescriptions.slice(0, 6);
    return prescriptions.filter(rx => {
      const rawCode = String(rx.code || rx.prescriptionNumber || rx.id || '');
      const safeCode = maskCode(rawCode, rx.patientName).toLowerCase();
      const title = String(rx.treatmentTitle || rx.title || '').toLowerCase();
      const posology = String(rx.posology || '').toLowerCase();
      const items = (rx.items || []).map(i => (i.name || i.drugName || '').toLowerCase()).join(' ');

      if (isAuthorizedViewer) {
        const patient = String(rx.patientName || rx.patient?.name || '').toLowerCase();
        return rawCode.toLowerCase().includes(cleanQ) || patient.includes(cleanQ) || title.includes(cleanQ) || posology.includes(cleanQ) || items.includes(cleanQ);
      }

      // For unregistered users, strictly match by de-identified code, codified patient ID, title, or ingredients
      const codifiedId = getCodifiedPatientId(rx.patientName, rawCode).toLowerCase();
      return (
        safeCode.includes(cleanQ) ||
        codifiedId.includes(cleanQ) ||
        title.includes(cleanQ) ||
        posology.includes(cleanQ) ||
        items.includes(cleanQ)
      );
    });
  }, [cleanQ, prescriptions, isAuthorizedViewer]);

  const matchingFormulations = useMemo(() => {
    if (!cleanQ) return topFormulations;
    return topFormulations.filter(f => {
      const n = (f.name || '').toLowerCase();
      const cat = (f.category || f.meta?.category || '').toLowerCase();
      const fmt = (f.format || f.meta?.format || '').toLowerCase();
      return n.includes(cleanQ) || cat.includes(cleanQ) || fmt.includes(cleanQ);
    });
  }, [cleanQ, topFormulations]);

  const matchingRecommendations = useMemo(() => {
    if (!cleanQ) return curatedRecommendations;
    return curatedRecommendations.filter(r => {
      const t = r.title.toLowerCase();
      const s = r.subtitle.toLowerCase();
      const syn = r.synergyWith.toLowerCase();
      return t.includes(cleanQ) || s.includes(cleanQ) || syn.includes(cleanQ);
    });
  }, [cleanQ, curatedRecommendations]);

  const soldPatientsCount = useMemo(() => patientsList.filter(p => p.hasSold).length, [patientsList]);
  const unacceptedPatientsCount = useMemo(() => patientsList.filter(p => !p.hasSold).length, [patientsList]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 16px 24px',
        animation: 'fadeIn 0.15s ease'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Isolation Banner — Explicitly proves only this doctor's patients are shown */}
        <div style={{
          padding: '8px 20px',
          background: isAuthorizedViewer ? '#f0fdf4' : '#fffbeb',
          borderBottom: `1px solid ${isAuthorizedViewer ? '#bbf7d0' : '#fde68a'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '11.5px',
          color: isAuthorizedViewer ? '#166534' : '#92400e',
          fontWeight: 600
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} style={{ color: isAuthorizedViewer ? '#16a34a' : '#d97706', flexShrink: 0 }} />
            <span>
              {isAuthorizedViewer ? (
                <>
                  <strong>Private Practice Scope:</strong> Exclusively showing <strong>{doctor.name || 'Treating Physician'}</strong>&apos;s patients &amp; prescriptions
                </>
              ) : (
                <>
                  <strong>Accredited Practice Scope ({opaqueDoctorCode || 'DR-CLINICAL'}):</strong> Patient identities protected under DHA/HIPAA standards
                </>
              )}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 7px', borderRadius: '999px', fontWeight: 700 }}>
              {soldPatientsCount} Sold
            </span>
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '1px 7px', borderRadius: '999px', fontWeight: 700 }}>
              {unacceptedPatientsCount} Unaccepted
            </span>
            <span style={{ color: isAuthorizedViewer ? '#15803d' : '#92400e', fontWeight: 700 }}>
              Total: {patientsList.length} Patients
            </span>
          </div>
        </div>

        {/* Search Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={20} style={{ color: '#1a73e8', flexShrink: 0 }} />
            <input 
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isAuthorizedViewer 
                ? `Search ${doctor.name || 'doctor'}'s patients, invoice numbers, prescriptions, or formulas...`
                : "Search practice formulations, prescription codes, invoice refs, or clinical protocols..."}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontSize: '16px',
                fontWeight: 500,
                color: '#0f172a',
                outline: 'none',
                padding: '4px 0'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {query && (
                <button 
                  type="button"
                  onClick={() => setQuery('')}
                  title="Clear input"
                  style={{
                    border: 'none',
                    background: '#e2e8f0',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  <X size={13} />
                </button>
              )}
              <span style={{ fontSize: '11px', color: '#94a3b8', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                ESC
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                title="Close dialog (ESC)"
                style={{
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Patients & Rx' },
                { id: 'patients', label: `All Patients (${patientsList.length})` },
                { id: 'prescriptions', label: `Prescriptions (${prescriptions.length})` },
                { id: 'products', label: `Formulations (${matchingFormulations.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (triggerHaptic) triggerHaptic('selection');
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    border: activeTab === tab.id ? '1px solid #1a73e8' : '1px solid #e2e8f0',
                    background: activeTab === tab.id ? '#eff6ff' : '#ffffff',
                    color: activeTab === tab.id ? '#1a73e8' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* SECTION A: PATIENTS */}
          {(activeTab === 'all' || activeTab === 'patients') && matchingPatients.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={13} style={{ color: '#0284c7' }} />
                  {cleanQ 
                    ? `Matching Patients (${matchingPatients.length})` 
                    : (isAuthorizedViewer ? `Patients in ${doctor.name || 'Practice'} (Sold First)` : 'Cohort Patients (Codified Registry)')}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Showing { (activeTab === 'patients' ? patientsList : matchingPatients).length } of {patientsList.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(activeTab === 'patients' && !cleanQ ? patientsList : matchingPatients).map((pat) => (
                  <div
                    key={pat.codifiedId || pat.name}
                    onClick={() => {
                      if (onSelectPatient) onSelectPatient(isAuthorizedViewer ? pat.name : pat.codifiedId);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #f1f5f9',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: pat.hasSold ? '#dcfce7' : '#fef3c7', 
                        color: pat.hasSold ? '#15803d' : '#b45309', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700, 
                        fontSize: isAuthorizedViewer ? '13px' : '11px' 
                      }}>
                        {isAuthorizedViewer ? pat.name.charAt(0).toUpperCase() : <Lock size={13} style={{ color: pat.hasSold ? '#15803d' : '#b45309' }} />}
                      </div>
                      <div>
                        {isAuthorizedViewer ? (
                          <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                            {pat.name}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                              {pat.codifiedId}
                            </span>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '10px',
                              fontWeight: 650,
                              color: '#b45309',
                              background: '#fffbeb',
                              border: '1px solid #fde68a',
                              padding: '1px 6px',
                              borderRadius: '12px'
                            }}>
                              <Lock size={9} />
                              <span>Protected</span>
                            </span>
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {pat.prescriptionsCount} prescribed {pat.prescriptionsCount === 1 ? 'treatment' : 'treatments'} {pat.invoiceRef ? `· ${pat.invoiceRef}` : (isAuthorizedViewer ? `· ID: ${pat.id}` : '· Verified')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <StatusBadge
                        status={pat.hasSold ? 'approved' : 'proposal_pending'}
                        customLabel={pat.hasSold ? 'Sold Customer' : 'Offer Unaccepted'}
                      />
                      <ChevronRight size={15} style={{ color: '#94a3b8' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: MOST-USED FORMULATIONS IN THIS PRACTICE (Golden Request) */}
          {(activeTab === 'all' || activeTab === 'products') && matchingFormulations.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Pill size={13} style={{ color: '#16a34a' }} />
                  {cleanQ ? 'Matching Formulations in Practice' : 'Frequently Prescribed in Practice (Most Used First)'}
                </span>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, background: '#f0fdf4', padding: '1px 6px', borderRadius: '4px' }}>
                  Active in Practice
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchingFormulations.map((form, idx) => (
                  <div
                    key={form.name}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(form.name);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #f1f5f9',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0fdf4';
                      e.currentTarget.style.borderColor = '#bbf7d0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#f1f5f9';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: form.meta?.bg || '#eff6ff', color: form.meta?.color || '#1a73e8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                            {form.name}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: form.meta?.formatColor || '#0369a1',
                            backgroundColor: form.meta?.formatBg || '#e0f2fe',
                            border: `1px solid ${form.meta?.formatBorder || '#bae6fd'}`,
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            {form.meta?.formatBadge || form.format || 'Finished Product'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {form.meta?.role || form.category || 'Targeted Clinical Formulation'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {form.percentage || 0}%
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        {form.count} rxs
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION C: CLINICAL RECOMMENDATIONS & SYNERGIES (Golden Request) */}
          {(activeTab === 'all' || activeTab === 'recommendations') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={13} style={{ color: '#7c3aed' }} />
                  Atlas Clinical Recommendations & Practice Synergies
                </span>
                <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600, background: '#f5f3ff', padding: '1px 6px', borderRadius: '4px' }}>
                  Smart Synergies
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {matchingRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      if (onSelectRecommendation) onSelectRecommendation(rec);
                      onClose();
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1px solid #ede9fe',
                      background: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#c4b5fd';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#ede9fe';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          color: rec.formatColor,
                          background: rec.formatBg,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em'
                        }}>
                          {rec.formatBadge}
                        </span>
                        <span style={{ fontSize: '10px', color: '#7c3aed', fontWeight: 600 }}>
                          {rec.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e1b4b', lineHeight: 1.3 }}>
                        {rec.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                        {rec.subtitle}
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '10.5px', color: '#7c3aed', fontStyle: 'italic' }}>
                        {rec.synergyWith}
                      </span>
                      <ArrowRight size={13} style={{ color: '#7c3aed', flexShrink: 0, marginLeft: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION D: PRESCRIPTIONS */}
          {(activeTab === 'all' || activeTab === 'prescriptions') && matchingPrescriptions.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FileText size={13} style={{ color: '#ea580c' }} />
                  Matching Prescriptions
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{matchingPrescriptions.length} items</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matchingPrescriptions.map((rx) => {
                  const rawCode = rx.code || rx.prescriptionNumber || rx.id;
                  const safeCode = maskCode(rawCode, rx.patientName);
                  const codifiedPatId = getCodifiedPatientId(rx.patientName, rawCode);

                  return (
                    <div
                      key={rx.id || rx.code}
                      onClick={() => {
                        if (onSelectPrescription) onSelectPrescription(rx);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #f1f5f9',
                        background: '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff7ed';
                        e.currentTarget.style.borderColor = '#fed7aa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#f1f5f9';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', fontFamily: 'monospace' }}>
                            #{safeCode}
                          </span>
                          {isAuthorizedViewer ? (
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                              {rx.patientName || rx.patient?.name || 'Patient'}
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 650,
                              color: '#b45309',
                              background: '#fffbeb',
                              border: '1px solid #fde68a',
                              padding: '1px 6px',
                              borderRadius: '10px'
                            }}>
                              <Lock size={9} />
                              <span>Patient {codifiedPatId}</span>
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                          {rx.treatmentTitle || (rx.items || []).map(i => i.name).join(', ') || 'Prescribed Regimen'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <StatusBadge status={rx.status || 'active'} />
                        <ChevronRight size={15} style={{ color: '#94a3b8' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid #f1f5f9', background: '#fafbfc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
          <span>Navigate with mouse or keyboard · Press <b>ESC</b> to close</span>
          <span>Atlas Clinical Practice Intelligence</span>
        </div>
      </div>
    </div>
  );
}
