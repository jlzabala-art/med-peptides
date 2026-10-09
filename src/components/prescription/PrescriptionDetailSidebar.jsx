"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FlaskConical,
  List, 
  X, 
  ChevronRight, 
  FileText, 
  ShieldCheck, 
  Stethoscope, 
  ExternalLink, 
  Award, 
  Sparkles, 
  Download, 
  Dna, 
  Droplets, 
  Clock, 
  Calendar, 
  Layers, 
  ArrowUp, 
  Printer, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Box, 
  Lock, 
  QrCode 
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import '@/components/product/PublicDatasheetTableOfContents.css';

/**
 * PrescriptionDetailSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-compliant dedicated sidebar for public prescription dossiers.
 * Flexible Architecture:
 *  - Supports single or multiple compounded formulations / vehicles
 *  - Supports multi-phase clinical regimens (e.g. Induction vs Maintenance)
 *  - Real-time IntersectionObserver ScrollSpy
 *  - Permanent Unique URL copy-on-click & direct verification
 *  - Clinical Actions widget (PDF Download, DHA Verification badge, Prescribing Physician)
 *  - Responsive: Desktop sticky sidebar + Mobile drawer (triggered via PublicStickyActionBar)
 */
export default function PrescriptionDetailSidebar({
  sections = [],
  formulations = [],
  phases = [],
  rxId = '',
  patientName = '',
  patient = null,
  doctorName = '',
  doctorTitle = '',
  doctorLicense = '',
  doctorOffice = '',
  doctorPhone = '',
  publicUrl = '',
  onOpenPdf = null,
  onExportExcel = null,
  onAssignDoctor = null,
  activeGcpTab = '',
  onSelectTab = null,
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const prescriptionCode = rxId || 'RX';
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const SECTION_TO_TAB = useMemo(() => ({
    'formula-card': 'treatment',
    'genomics-card': 'treatment',
    'milestones-card': 'roadmap',
    'quality-card': 'traceability',
    'atlas-recommendations-card': 'recommendations',
    'doctor-patient-credentials': 'credentials',
    'patient-sharing-card': 'patientSharing',
    'atlas-quotation-card': 'quotation'
  }), []);

  const TAB_TO_DEFAULT_SECTION = useMemo(() => ({
    treatment: 'formula-card',
    roadmap: 'milestones-card',
    traceability: 'quality-card',
    recommendations: 'atlas-recommendations-card',
    credentials: 'doctor-patient-credentials',
    patientSharing: 'patient-sharing-card',
    quotation: 'atlas-quotation-card'
  }), []);

  const canonicalUrl = publicUrl || (typeof window !== 'undefined' 
    ? `${window.location.origin}/rx/${rxId}` 
    : `https://med-peptides.com/rx/${rxId}`);

  const availableSections = useMemo(() => {
    return sections.filter(sec => sec && sec.id);
  }, [sections]);

  // Sync active section when activeGcpTab changes from parent
  useEffect(() => {
    if (!activeGcpTab) return;
    const defaultSec = TAB_TO_DEFAULT_SECTION[activeGcpTab];
    if (defaultSec) {
      setActiveId(defaultSec);
    }
  }, [activeGcpTab, TAB_TO_DEFAULT_SECTION]);

  // Support external trigger from PublicStickyActionBar ("Sections" button)
  useEffect(() => {
    const handleExternalOpen = () => {
      triggerHaptic('light');
      setIsMobileDrawerOpen(true);
    };
    window.addEventListener('open-rx-sections', handleExternalOpen);
    return () => window.removeEventListener('open-rx-sections', handleExternalOpen);
  }, []);

  // Real-time ScrollSpy via IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined' || !availableSections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const topEntry = visibleEntries[0];
          if (topEntry?.target?.id) {
            setActiveId(topEntry.target.id);
          }
        }
      },
      {
        rootMargin: '-80px 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5]
      }
    );

    availableSections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [availableSections]);

  const scrollTo = (id) => {
    triggerHaptic('selection');

    // Switch tab if clicking a section belonging to a different tab
    const targetTab = SECTION_TO_TAB[id] || (availableSections.find(s => s.id === id)?.category === 'formula' ? 'treatment' : null);
    if (targetTab && onSelectTab && activeGcpTab !== targetTab) {
      onSelectTab(targetTab);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('OPEN_RX_SECTION', { detail: { id } }));
    }

    const performScroll = (targetId) => {
      const el = document.getElementById(targetId);
      if (el) {
        const headerOffset = 95;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
        setActiveId(targetId);
        if (isMobileDrawerOpen) setIsMobileDrawerOpen(false);
        return true;
      }
      return false;
    };

    if (!performScroll(id)) {
      setTimeout(() => performScroll(id), 60);
    }
  };

  const handleCopyPermanentUrl = () => {
    try {
      navigator?.clipboard?.writeText(canonicalUrl);
      setCopiedUrl(true);
      triggerHaptic('success');
      toast.success(
        isEs 
          ? 'URL permanente de la prescripción copiada ✓' 
          : 'Permanent prescription URL copied ✓'
      );
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch (_) {
      toast.error('Could not copy link');
    }
  };

  const getSectionIcon = (id, iconType) => {
    if (iconType === 'box' || id.includes('oral')) return Box;
    if (iconType === 'droplets' || id.includes('oil') || id.includes('infographic')) return Droplets;
    if (iconType === 'dna' || id.includes('genomics')) return Dna;
    if (iconType === 'clock' || id.includes('posology')) return Clock;
    if (iconType === 'calendar' || id.includes('milestone')) return Calendar;
    if (iconType === 'stethoscope' || id.includes('doctor') || id.includes('clinical')) return Stethoscope;
    if (iconType === 'shield' || id.includes('qr')) return ShieldCheck;
    if (iconType === 'file' || id.includes('doc')) return FileText;
    if (iconType === 'sparkles' || id.includes('recommendation') || id.includes('synergy')) return Sparkles;
    if (iconType === 'share' || id.includes('sharing')) return ExternalLink;
    if (id.includes('formula')) return FlaskConical;
    return List;
  };

  return (
    <>
      {/* ── DESKTOP STICKY SIDEBAR (Hidden on mobile via CSS) ── */}
      <div 
        className="pds-sidebar-desktop"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.15rem'
        }}
      >
        {/* Patient Identity Badge in Sidebar */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '12px 14px',
          boxShadow: '0 2px 8px rgba(0, 54, 102, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.88rem',
            flexShrink: 0
          }}>
            {patientName?.charAt(0) || 'P'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Paciente Registrado' : 'Registered Patient'}
            </div>
            <div 
              title={patientName || 'Patient'}
              style={{ 
                fontSize: '0.88rem', 
                fontWeight: 750, 
                color: '#0f172a', 
                whiteSpace: 'normal', 
                wordBreak: 'break-word', 
                lineHeight: 1.32,
                marginTop: '1px'
              }}
            >
              {patientName || 'Patient'}
            </div>
            <div style={{ fontSize: '0.70rem', color: '#0284c7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span>Ref: {prescriptionCode}</span>
            </div>
          </div>
        </div>

        {/* Widget 1: On This Dossier (TOC) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.15rem',
          boxShadow: '0 4px 16px rgba(0, 54, 102, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
            paddingBottom: '0.65rem',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <List size={14} color="#0284c7" />
              <span>{isEs ? 'EN ESTE DOSSIER' : 'ON THIS DOSSIER'}</span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
              {availableSections.length} {isEs ? 'Secciones' : 'Sections'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {availableSections.map((sec, idx) => {
              const isActive = activeId === sec.id;
              const IconComp = getSectionIcon(sec.id, sec.icon);
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollTo(sec.id)}
                  title={sec.label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#f0f9ff' : 'transparent',
                    color: isActive ? '#0284c7' : '#475569',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.70rem', color: isActive ? '#0284c7' : '#94a3b8', fontFamily: 'monospace', marginTop: '2px', flexShrink: 0 }}>
                      {idx + 1}
                    </span>
                    <IconComp size={15} color={isActive ? (sec.accentColor || '#0284c7') : '#94a3b8'} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ 
                        fontSize: '0.78rem',
                        fontWeight: isActive ? 750 : 550,
                        color: isActive ? '#0284c7' : '#334155',
                        lineHeight: 1.35,
                        wordBreak: 'break-word',
                        whiteSpace: 'normal'
                      }}>
                        {sec.label}
                      </span>
                      {sec.badge && (
                        <span style={{
                          alignSelf: 'flex-start',
                          fontSize: '0.66rem',
                          fontWeight: 650,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: isActive ? '#e0f2fe' : '#f1f5f9',
                          color: isActive ? '#0369a1' : '#64748b',
                          lineHeight: 1.3
                        }}>
                          {sec.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  {isActive && <ChevronRight size={14} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>



        {/* Widget 3: EU GMP Quality & Verification Seal (GCP Standard) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '1rem',
          boxShadow: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldCheck size={16} color="#137333" />
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#137333', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'Trazabilidad & Calidad' : 'Traceability & Quality'}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#5f6368', lineHeight: 1.4 }}>
            {isEs 
              ? 'Elaboración individualizada en salas blancas bajo normativa EU GMP. Materias primas y vehículos con control analítico HPLC.'
              : 'Compounded under cleanroom EU GMP standards with verified batch release and HPLC analytical verification.'}
          </div>
          <div style={{
            marginTop: '8px',
            padding: '5px 8px',
            borderRadius: '4px',
            background: '#e6f4ea',
            border: '1px solid #ceead6',
            color: '#137333',
            fontSize: '0.70rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span>✓ Pharmapolis &amp; Fagron Standard</span>
          </div>
        </div>

      </div>

      {/* ── MOBILE SLIDE-OVER DRAWER (Opened via floating bottom bar) ── */}
      {isMobileDrawerOpen && (
        <div 
          className="pds-mobile-drawer-overlay"
          onClick={() => setIsMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div 
            className="pds-mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '85%',
              maxWidth: '350px',
              height: '100%',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
              overflowY: 'auto',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.25)',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 800, color: '#003666' }}>
                <List size={16} color="#0284c7" />
                <span>{isEs ? 'Secciones del Dossier' : 'Dossier Sections'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Permanent URL Action in Mobile */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} color="#166534" />
                <span>{isEs ? 'Expediente Clínico Digital' : 'Digital Clinical Record'}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#1e293b', fontWeight: 600 }}>
                {isEs ? `Expediente oficial verificado (${prescriptionCode})` : `Official verified record (${prescriptionCode})`}
              </div>
              <button
                type="button"
                onClick={handleCopyPermanentUrl}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                {copiedUrl ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedUrl ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy URL')}</span>
              </button>
            </div>

            {/* TOC Sections List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                {isEs ? 'Todas las Secciones' : 'All Sections'}
              </div>
              {availableSections.map((sec, idx) => {
                const isActive = activeId === sec.id;
                const IconComp = getSectionIcon(sec.id, sec.icon);
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => scrollTo(sec.id)}
                    title={sec.label}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isActive ? '#bae6fd' : '#e2e8f0',
                      background: isActive ? '#f0f9ff' : '#ffffff',
                      color: isActive ? '#0284c7' : '#334155',
                      textAlign: 'left',
                      cursor: 'pointer',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0, flex: 1 }}>
                      <span style={{ fontSize: '0.74rem', color: isActive ? '#0284c7' : '#94a3b8', fontFamily: 'monospace', marginTop: '2px', flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <IconComp size={15} color={isActive ? '#0284c7' : '#64748b'} style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{
                          fontSize: '0.84rem',
                          fontWeight: isActive ? 750 : 550,
                          lineHeight: 1.35,
                          wordBreak: 'break-word',
                          whiteSpace: 'normal'
                        }}>
                          {sec.label}
                        </span>
                        {sec.badge && (
                          <span style={{
                            alignSelf: 'flex-start',
                            fontSize: '0.68rem',
                            fontWeight: 650,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: isActive ? '#e0f2fe' : '#f1f5f9',
                            color: isActive ? '#0369a1' : '#64748b'
                          }}>
                            {sec.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    {isActive && <ChevronRight size={15} color="#0284c7" style={{ marginTop: '3px', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Registered Patient Summary in Mobile Drawer */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.86rem',
                flexShrink: 0
              }}>
                {patientName?.charAt(0) || 'P'}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                  {isEs ? 'PACIENTE REGISTRADO' : 'REGISTERED PATIENT'}
                </div>
                <div 
                  title={patientName || 'Patient'}
                  style={{ 
                    fontSize: '0.90rem', 
                    fontWeight: 800, 
                    color: '#0f172a', 
                    marginTop: '1px', 
                    whiteSpace: 'normal', 
                    wordBreak: 'break-word', 
                    lineHeight: 1.32 
                  }}
                >
                  {patientName || 'Patient'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                  Ref: {prescriptionCode}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
