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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
      if (isMobileDrawerOpen) setIsMobileDrawerOpen(false);
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
    if (iconType === 'shield' || id.includes('qr')) return ShieldCheck;
    if (iconType === 'file' || id.includes('doc')) return FileText;
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

        {/* Widget 2: Formulations & Vehicles Multi-Vehicle Navigator (Flexible) */}
        {formulations && formulations.length > 0 && (
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
              marginBottom: '0.75rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Layers size={14} color="#0d9488" />
                <span>{isEs ? 'VEHÍCULOS & FÓRMULAS' : 'VEHICLES & FORMULAS'}</span>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#0d9488',
                background: '#ccfbf1',
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {formulations.length} {formulations.length === 1 ? (isEs ? 'Vehículo' : 'Vehicle') : (isEs ? 'Vehículos' : 'Vehicles')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {formulations.map((form, fIdx) => {
                const isFormActive = activeId === form.id || activeId === `posology-${form.id}`;
                return (
                  <div
                    key={form.id || fIdx}
                    onClick={() => scrollTo(form.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: isFormActive ? (form.accentColor || '#0284c7') : '#e2e8f0',
                      background: isFormActive ? '#f0fdfa' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: form.accentColor || '#0284c7',
                        color: '#ffffff'
                      }}>
                        {form.vehicle?.tag || `PREP ${fIdx + 1}`}
                      </span>
                      {form.volume && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>
                          {form.volume}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                      {form.vehicle?.name || form.title}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{form.route}</span>
                      {form.apis?.length > 0 && (
                        <>
                          <span>·</span>
                          <span style={{ fontWeight: 600, color: '#0284c7' }}>
                            {form.apis.length} {isEs ? 'APIs' : 'APIs'}
                          </span>
                        </>
                      )}
                    </div>

                    {form.posology?.regimen && (
                      <div style={{
                        marginTop: '6px',
                        padding: '4px 8px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.70rem',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <Clock size={11} color="#0d9488" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {form.posology.regimen}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Widget 3: Treatment Phases (if multi-phase protocol) */}
        {phases && phases.length > 0 && (
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
              marginBottom: '0.75rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Calendar size={14} color="#7c3aed" />
                <span>{isEs ? 'FASES DE TRATAMIENTO' : 'TREATMENT PHASES'}</span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '1px 6px', borderRadius: '4px' }}>
                {phases.length} {isEs ? 'Fases' : 'Phases'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {phases.map((phase, pIdx) => (
                <div key={pIdx} style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                    {phase.name || `${isEs ? 'Fase' : 'Phase'} ${pIdx + 1}`}
                  </div>
                  {phase.duration && (
                    <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
                      {phase.duration}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Widget 4: Permanent Prescription Canonical URL (Golden Rule) */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
          borderRadius: '14px',
          border: '1px solid #86efac',
          padding: '1.15rem',
          boxShadow: '0 4px 16px rgba(22, 163, 74, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Lock size={12} color="#16a34a" />
              <span>{isEs ? 'URL PERMANENTE OFICIAL' : 'OFFICIAL PERMANENT URL'}</span>
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
              SSL 2026
            </span>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '8px 10px',
            fontSize: '0.74rem',
            fontFamily: 'monospace',
            color: '#1e293b',
            wordBreak: 'break-all',
            marginBottom: '0.65rem'
          }}>
            {canonicalUrl}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={handleCopyPermanentUrl}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 10px',
                borderRadius: '8px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {copiedUrl ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedUrl ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy URL')}</span>
            </button>
            <a
              href={canonicalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7px 10px',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#166534',
                border: '1px solid #86efac',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.76rem'
              }}
              title={isEs ? 'Abrir enlace directo' : 'Open permanent link'}
            >
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Widget 5: Prescribing Physician Authority (Doctor Prominence) */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%)',
          borderRadius: '14px',
          border: '1px solid #bbf7d0',
          padding: '1.15rem',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.65rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: '#047857',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Stethoscope size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {doctorName ? (isEs ? 'MÉDICO TRATANTE' : 'TREATING PHYSICIAN') : (isEs ? 'PRÁCTICA CLÍNICA' : 'CLINICAL PRACTICE')}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {doctorName || (isEs ? 'Centro Médico Prescriptor' : 'Licensed Clinical Practice')}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4, marginBottom: '0.75rem' }}>
            {doctorTitle && <div>{doctorTitle}</div>}
            {doctorLicense && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
                <ShieldCheck size={12} />
                <span>
                  {doctorLicense.toUpperCase().includes('DHA') 
                    ? `DHA Licensed · Lic. ${doctorLicense}` 
                    : `Lic. ${doctorLicense}`}
                </span>
              </div>
            )}
            {doctorOffice && (
              <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                📍 {doctorOffice}
              </div>
            )}
            {!doctorName && onAssignDoctor && (
              <button
                type="button"
                onClick={onAssignDoctor}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  color: '#166534',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + {isEs ? 'Asignar Médico Tratante' : 'Assign Treating Physician'}
              </button>
            )}
          </div>
        </div>

        {/* Widget 6: Actions & Downloads (No duplicate QR graphic) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1.15rem',
          boxShadow: '0 2px 10px rgba(0, 54, 102, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'ACCIONES & DESCARGAS' : 'ACTIONS & EXPORTS'}
            </span>
            <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
              {rxId}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                justifyContent: 'center',
                gap: '6px',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                background: '#f0f9ff',
                color: '#0284c7',
                border: '1px solid #bae6fd',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={isEs ? 'Ir a la tarjeta de Código QR del paciente' : 'Go to Patient QR Code'}
            >
              <QrCode size={14} color="#0284c7" />
              <span>{isEs ? 'Ver Código QR Paciente' : 'View Patient QR Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                window.print();
              }}
              className="rx-print-btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                background: '#f8fafc',
                color: '#003666',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Printer size={14} color="#003666" />
              <span>{isEs ? 'Imprimir / Guardar PDF' : 'Print / Save PDF'}</span>
            </button>

            {onExportExcel && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  onExportExcel();
                }}
                className="rx-excel-btn"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title={isEs ? 'Exportar a Excel (.xlsx)' : 'Export to Excel (.xlsx)'}
              >
                <FileSpreadsheet size={14} color="#15803d" />
                <span>{isEs ? 'Exportar a Excel (.xlsx)' : 'Export to Excel (.xlsx)'}</span>
              </button>
            )}
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
              <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                {isEs ? 'URL Permanente' : 'Permanent URL'}
              </div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#1e293b', wordBreak: 'break-all' }}>
                {canonicalUrl}
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

            {/* Formulations & Vehicles Quick Switcher in Mobile */}
            {formulations && formulations.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  {isEs ? 'Vehículos & Preparaciones' : 'Vehicles & Formulations'}
                </div>
                {formulations.map((form, fIdx) => (
                  <button
                    key={fIdx}
                    type="button"
                    onClick={() => scrollTo(form.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a' }}>
                        {form.vehicle?.name || form.title}
                      </div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
                        {form.route} {form.volume ? `· ${form.volume}` : ''}
                      </div>
                    </div>
                    <ChevronRight size={14} color="#94a3b8" />
                  </button>
                ))}
              </div>
            )}

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
