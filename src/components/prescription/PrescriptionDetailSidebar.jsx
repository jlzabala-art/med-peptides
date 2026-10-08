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
  doctorName = '',
  doctorTitle = '',
  doctorLicense = '',
  doctorOffice = '',
  doctorPhone = '',
  publicUrl = '',
  onOpenPdf = null,
  onExportExcel = null,
  onAssignDoctor = null,
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const prescriptionCode = rxId || 'RX';
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const canonicalUrl = publicUrl || (typeof window !== 'undefined' 
    ? `${window.location.origin}/rx/${rxId}` 
    : `https://med-peptides.com/rx/${rxId}`);

  const availableSections = useMemo(() => {
    return sections.filter(sec => sec && sec.id);
  }, [sections]);

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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? '#f0f9ff' : 'transparent',
                    color: isActive ? '#0284c7' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 750 : 550,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.70rem', color: isActive ? '#0284c7' : '#94a3b8', fontFamily: 'monospace' }}>
                      {idx + 1}
                    </span>
                    <IconComp size={14} color={isActive ? (sec.accentColor || '#0284c7') : '#94a3b8'} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sec.label}
                    </span>
                  </div>
                  {sec.badge && (
                    <span style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: isActive ? '#e0f2fe' : '#f1f5f9',
                      color: isActive ? '#0369a1' : '#64748b',
                      marginLeft: '6px',
                      flexShrink: 0
                    }}>
                      {sec.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={13} color="#0284c7" style={{ marginLeft: '4px', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Widget 2: Official Clinical Actions & Exports (GCP Standard) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dadce0',
          padding: '1rem',
          boxShadow: 'none'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #f1f3f4'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 600, color: '#3c4043', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Download size={14} color="#1a73e8" />
              <span>{isEs ? 'ACCIONES & DOCUMENTOS' : 'ACTIONS & DOCUMENTS'}</span>
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#1a73e8', background: '#e8f0fe', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
              {prescriptionCode}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {onOpenPdf && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  onOpenPdf();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: '#f8fafd',
                  color: '#1a73e8',
                  border: '1px solid #d2e3fc',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
                title={isEs ? 'Ver dossier y monografía clínica completa en PDF' : 'View full clinical monograph & dossier in PDF'}
              >
                <FileText size={15} color="#1a73e8" />
                <span>{isEs ? 'Dossier Clínico (PDF)' : 'Clinical Dossier (PDF)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                window.print();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                background: '#ffffff',
                color: '#3c4043',
                border: '1px solid #dadce0',
                fontWeight: 500,
                fontSize: '0.76rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              title={isEs ? 'Imprimir expediente oficial' : 'Print official clinical dossier'}
            >
              <Printer size={15} color="#5f6368" />
              <span>{isEs ? 'Imprimir Expediente' : 'Print Official Dossier'}</span>
            </button>

            {onExportExcel && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  onExportExcel();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  color: '#137333',
                  border: '1px solid #dadce0',
                  fontWeight: 500,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left'
                }}
                title={isEs ? 'Exportar fórmula galénica a Excel' : 'Export formulation specs to Excel'}
              >
                <FileSpreadsheet size={15} color="#137333" />
                <span>{isEs ? 'Exportar Ficha (Excel)' : 'Export Specs (Excel)'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                scrollTo('qr-card');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 10px',
                borderRadius: '6px',
                background: '#ffffff',
                color: '#3c4043',
                border: '1px solid #dadce0',
                fontWeight: 500,
                fontSize: '0.76rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              title={isEs ? 'Verificación QR para dispensación' : 'QR Verification for pharmacy dispensing'}
            >
              <QrCode size={15} color="#1a73e8" />
              <span>{isEs ? 'Código QR de Validación' : 'QR Validation Code'}</span>
            </button>
          </div>

          {/* Compact Copy URL Row */}
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f3f4', display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={handleCopyPermanentUrl}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '4px',
                background: '#f8f9fa',
                color: '#1a73e8',
                border: '1px solid #dadce0',
                fontWeight: 600,
                fontSize: '0.74rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {copiedUrl ? <Check size={13} color="#137333" /> : <Copy size={13} />}
              <span>{copiedUrl ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy Record Link')}</span>
            </button>
            <a
              href={canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 9px',
                borderRadius: '4px',
                background: '#ffffff',
                color: '#5f6368',
                border: '1px solid #dadce0',
                textDecoration: 'none',
                fontSize: '0.74rem'
              }}
              title={isEs ? 'Abrir enlace directo' : 'Open permanent link'}
            >
              <ExternalLink size={13} />
            </a>
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isActive ? '#bae6fd' : '#e2e8f0',
                      background: isActive ? '#f0f9ff' : '#ffffff',
                      color: isActive ? '#0284c7' : '#334155',
                      fontSize: '0.84rem',
                      fontWeight: isActive ? 750 : 550,
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.74rem', color: isActive ? '#0284c7' : '#94a3b8', fontFamily: 'monospace' }}>
                        {idx + 1}
                      </span>
                      <IconComp size={15} color={isActive ? '#0284c7' : '#64748b'} />
                      <span>{sec.label}</span>
                    </div>
                    {isActive && <ChevronRight size={15} color="#0284c7" />}
                  </button>
                );
              })}
            </div>

            {/* Prescribing Doctor Summary in Mobile Drawer */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              marginTop: 'auto'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                {isEs ? 'MÉDICO PRESCRIPTOR' : 'PRESCRIBING PHYSICIAN'}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {doctorName}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div>{doctorTitle}</div>
                {doctorLicense && (
                  <div style={{ color: '#047857', fontWeight: 700 }}>
                    {doctorLicense.toUpperCase().includes('DHA') 
                      ? `DHA Licensed · Lic. ${doctorLicense}` 
                      : `Lic. ${doctorLicense}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
