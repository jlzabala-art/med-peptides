"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
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
  Printer
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import '@/components/product/PublicDatasheetTableOfContents.css';

/**
 * PrescriptionDetailSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-compliant dedicated sidebar for public prescription dossiers.
 * Features:
 *  - On This Dossier (TOC) with real-time IntersectionObserver ScrollSpy
 *  - Clinical Actions widget (PDF Download, DHA Verification badge, Prescribing Physician)
 *  - Instant QR code validation widget (SSOT 2026 seal)
 *  - Responsive: Desktop sticky sidebar + Mobile drawer (triggered via PublicStickyActionBar)
 */
export default function PrescriptionDetailSidebar({
  sections = [],
  rxId = '',
  doctorName = 'Dr. Hanieh Erdmann',
  doctorTitle = 'Physician Consultant Dermatology',
  doctorLicense = 'DHA-00013060-006',
  doctorOffice = 'Index Tower 5709, Dubai',
  doctorPhone = '+971 50 354 6123',
  publicUrl = '',
  onOpenPdf = null,
  lang = 'en'
}) {
  const isEs = lang === 'es';
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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

  const getSectionIcon = (id) => {
    if (id.includes('formula')) return FlaskConicalIcon;
    if (id.includes('genomics')) return Dna;
    if (id.includes('infographic') || id.includes('posology')) return Droplets;
    if (id.includes('milestone')) return Calendar;
    if (id.includes('qr')) return ShieldCheck;
    if (id.includes('doc')) return FileText;
    return List;
  };

  const FlaskConicalIcon = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16h10" />
    </svg>
  );

  return (
    <>
      {/* ── DESKTOP STICKY SIDEBAR (Hidden on mobile via CSS) ── */}
      <div 
        className="pds-sidebar-desktop"
        style={{
          width: '100%'
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {availableSections.map((sec, idx) => {
              const isActive = activeId === sec.id;
              const IconComp = getSectionIcon(sec.id);
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
                    padding: '7px 10px',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ fontSize: '0.70rem', color: isActive ? '#0284c7' : '#94a3b8', fontFamily: 'monospace' }}>
                      {idx + 1}
                    </span>
                    <IconComp size={13} color={isActive ? '#0284c7' : '#94a3b8'} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sec.label}
                    </span>
                  </div>
                  {isActive && <ChevronRight size={13} color="#0284c7" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Widget 2: Prescribing Physician Authority (Doctor Prominence) */}
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
                {isEs ? 'MÉDICO PRESCRIPTOR' : 'PRESCRIBING PHYSICIAN'}
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {doctorName}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4, marginBottom: '0.75rem' }}>
            <div>{doctorTitle}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#047857', fontWeight: 700, marginTop: '2px' }}>
              <ShieldCheck size={12} />
              <span>Lic. {doctorLicense}</span>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
              📍 {doctorOffice}
            </div>
          </div>
        </div>

        {/* Widget 3: Patient Mobile Access QR */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '1rem',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0, 54, 102, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isEs ? 'ACCESO PACIENTE' : 'PATIENT ACCESS'}
            </span>
            <span style={{ fontSize: '0.64rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
              {isEs ? 'CONFIDENCIAL' : 'CONFIDENTIAL'}
            </span>
          </div>

          {publicUrl && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px',
              display: 'inline-flex',
              marginBottom: '0.5rem'
            }}>
              <QRCodeSVG 
                value={publicUrl}
                size={110}
                level="M"
                includeMargin={false}
              />
            </div>
          )}

          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
            {rxId}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px', marginBottom: '0.5rem' }}>
            {isEs ? 'Acceso móvil confidencial del paciente' : 'Confidential mobile access for registered patient'}
          </div>

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
              padding: '0.55rem',
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
            <Printer size={13} color="#003666" />
            <span>{isEs ? 'Imprimir / Guardar PDF' : 'Print / Save PDF'}</span>
          </button>
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
              maxWidth: '340px',
              height: '100%',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.25rem',
              overflowY: 'auto',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.5rem' }}>
              {availableSections.map((sec, idx) => {
                const isActive = activeId === sec.id;
                const IconComp = getSectionIcon(sec.id);
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
                      textAlign: 'left'
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
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {doctorTitle} · Lic. {doctorLicense}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
