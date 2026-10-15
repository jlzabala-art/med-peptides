"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  Printer,
  Copy,
  Check,
  Activity,
  FlaskConical,
  Heart,
  Zap,
  Info,
  User,
  Building2,
  Lock,
  QrCode
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import '@/components/product/PublicDatasheetTableOfContents.css';

/**
 * LabResultDetailSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-compliant dedicated sticky sidebar for laboratory & diagnostic results.
 * Mirrors the exact visual standards of PrescriptionDetailSidebar and ProductDetailSidebar:
 *  - Real-time IntersectionObserver ScrollSpy
 *  - Subject & Patient Clinical Badge
 *  - On This Dossier Table of Contents
 *  - Attending Clinician & Laboratory Accreditation Credentials
 *  - Clinical Actions: Download Official PDF, Print Report, Share Dossier Link
 *  - Responsive: Desktop Sticky Right Sidebar + Mobile Floating Drawer
 */
export default function LabResultDetailSidebar({
  data = {},
  code = '',
  sections = [],
  activeSection = 'overview',
  onSelectSection = null,
  onPrint = null,
  onCopyLink = null,
  isEternaProteomics = false,
  isTellmeGen = false,
  isDoctorUnlocked = false,
  patientDisplayName = ''
}) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState(activeSection || 'overview');

  const sampleCode = code || data.code || data.protocolNumber || 'LAB-RESULT';
  const patientName = patientDisplayName || (isDoctorUnlocked ? (data.patientName || data.patient?.name || 'Verified Patient') : (data.patientMaskedCode || `Subject #${sampleCode}`));
  const doctorName = data.doctorName || data.doctor?.name || 'Dr. Sobia Mirza';
  const doctorSpecialty = data.doctorSpecialty || 'Aesthetic Medicine & Regenerative Biology';
  const doctorClinic = data.clinic || data.clinicName || 'My London Skin Clinic · Dubai';
  const labAccreditation = data.laboratory?.standards || data.laboratory?.accreditation || 'ISO 15189 / EU-IVDR Accredited';
  const testName = data.testName || (isEternaProteomics ? 'Eterna BioAge Proteomics' : 'Bloodo™ NAD+ Quantitative Assay');
  const value = data.value != null ? `${data.value} ${data.unit || 'µmol/L'}` : '14.1 µmol/L';
  const zoneLabel = data.zoneLabel || 'Insufficient / Borderline';
  const zoneColor = data.zoneColor || '#d97706';

  const defaultSections = useMemo(() => [
    { id: 'overview', title: 'Overview & Subject', icon: Info },
    { id: 'results', title: isEternaProteomics ? 'Biological Age Metrics' : (isTellmeGen ? 'Genomic Variant Results' : 'Biomarker Quantification'), icon: Activity },
    ...(isEternaProteomics ? [{ id: 'organ-breakdown', title: '5-Organ Biological Ages', icon: Heart }] : []),
    { id: 'interpretation', title: 'Biological Reference Range', icon: Zap },
    { id: 'recommendations', title: 'Recommendations', icon: Sparkles },
    { id: 'accreditation', title: 'Methodology & Standards', icon: ShieldCheck },
  ], [isEternaProteomics, isTellmeGen]);

  const availableSections = sections.length > 0 ? sections : defaultSections;

  useEffect(() => {
    if (activeSection) {
      setActiveId(activeSection);
    }
  }, [activeSection]);

  // Real-time ScrollSpy via IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;

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

  const handleScrollTo = (id) => {
    triggerHaptic('selection');
    setActiveId(id);
    if (onSelectSection) {
      onSelectSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        const headerOffset = 90;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
    }
    if (isMobileDrawerOpen) setIsMobileDrawerOpen(false);
  };

  const handleCopy = () => {
    if (onCopyLink) {
      onCopyLink();
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      triggerHaptic('success');
      toast.success('Dossier link copied to clipboard ✓');
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const renderContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. Patient & Sample Identity Badge */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '14px 16px',
        boxShadow: '0 2px 8px rgba(0, 54, 102, 0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: isEternaProteomics 
            ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' 
            : 'linear-gradient(135deg, #003666 0%, #0284c7 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 750,
          fontSize: '0.92rem',
          flexShrink: 0
        }}>
          {patientName?.charAt(0) || 'P'}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Diagnostic Subject
          </div>
          <div style={{
            fontSize: '0.90rem',
            fontWeight: 750,
            color: '#0f172a',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {patientName}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 650, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Sample: #{sampleCode}</span>
          </div>
          {!isDoctorUnlocked && (
            <div style={{ marginTop: '4px', fontSize: '0.68rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={11} color="#d97706" />
              <span>Doctor sign in required to unlock full identity</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Key Biomarker Highlight Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '14px 16px',
        boxShadow: '0 2px 8px rgba(0, 54, 102, 0.04)'
      }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
          Key Finding
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span>{value}</span>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '6px',
          padding: '3px 8px',
          borderRadius: '6px',
          background: zoneColor ? `${zoneColor}15` : '#fffbeb',
          color: zoneColor || '#d97706',
          fontSize: '0.74rem',
          fontWeight: 700
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: zoneColor || '#d97706' }} />
          <span>{zoneLabel}</span>
        </div>
      </div>

      {/* 2b. Performing Laboratory Badge (Moved to Sidebar below Key Finding) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '14px 16px',
        boxShadow: '0 2px 8px rgba(0, 54, 102, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.80rem', fontWeight: 750 }}>
          <ShieldCheck size={16} />
          <span>{data.laboratory?.name || 'LifeLab1'}</span>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#334155' }}>
          License: <strong>{data.laboratory?.license || 'License 4864'}</strong>
        </div>
        <div style={{ fontSize: '0.70rem', color: '#64748b' }}>
          Standards: {data.laboratory?.standards || 'ISO 15189 / EU IVDR Accredited'}
        </div>
        <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
          Location: {data.laboratory?.city || 'Vilnius'}, {data.laboratory?.country || 'Lithuania'}
        </div>
      </div>

      {/* 3. On This Dossier (TOC) */}
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
            <span>On This Report</span>
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>
            {availableSections.length} Sections
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {availableSections.map((sec) => {
            const isCurrent = activeId === sec.id;
            const IconComponent = sec.icon || FileText;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => handleScrollTo(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isCurrent ? '1px solid #bfdbfe' : '1px solid transparent',
                  background: isCurrent ? '#eff6ff' : 'transparent',
                  color: isCurrent ? '#1d4ed8' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: isCurrent ? 750 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  width: '100%'
                }}
              >
                <span style={{
                  color: isCurrent ? '#1d4ed8' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0
                }}>
                  <IconComponent size={15} />
                </span>
                <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sec.title}
                </span>
                <ChevronRight size={13} color={isCurrent ? '#1d4ed8' : '#cbd5e1'} style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </nav>
      </div>

      {/* 4. Prescribing Clinician Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '14px 16px',
        boxShadow: '0 2px 8px rgba(0, 54, 102, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Stethoscope size={15} color="#0284c7" />
          <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Prescribing Clinician
          </span>
        </div>
        <div style={{ fontSize: '0.88rem', fontWeight: 750, color: '#0f172a' }}>
          {doctorName}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
          {doctorSpecialty}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 650, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Building2 size={13} />
          <span>{doctorClinic}</span>
        </div>
      </div>

      {/* 5. Laboratory Accreditation & Verification Badge */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '14px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Award size={16} color="#059669" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Accreditation & Standards
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
          LifeLab1 Clinical Bioanalysis Network
        </div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>
          Accredited under {labAccreditation}. Validated via automated Liquid Chromatography Tandem Mass Spectrometry (LC-MS/MS).
        </div>
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#059669', fontWeight: 650 }}>
          <ShieldCheck size={14} color="#059669" />
          <span>Cryptographically Sealed Dossier</span>
        </div>
      </div>

      {/* 6. Clinical Actions Widget */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
          Report Actions
        </div>

        {data.pdfReportUrl && (
          <a
            href={data.pdfReportUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#003666',
              color: '#ffffff',
              fontSize: '0.80rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,54,102,0.2)'
            }}
          >
            <Download size={15} />
            <span>Download Laboratory PDF</span>
          </a>
        )}

        <button
          type="button"
          onClick={onPrint || (() => window?.print())}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontSize: '0.80rem',
            fontWeight: 650,
            cursor: 'pointer'
          }}
        >
          <Printer size={15} />
          <span>Print Official Report</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontSize: '0.80rem',
            fontWeight: 650,
            cursor: 'pointer'
          }}
        >
          {copiedUrl ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
          <span>{copiedUrl ? 'Copied to Clipboard ✓' : 'Copy Permanent URL'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP STICKY SIDEBAR (Hidden on mobile via CSS) ── */}
      <aside 
        className="pds-sidebar-toc"
        style={{
          width: '300px',
          flexShrink: 0,
          position: 'sticky',
          top: '88px',
          alignSelf: 'flex-start',
          zIndex: 20
        }}
      >
        {renderContent()}
      </aside>

      {/* ── MOBILE FLOATING ACTION TRIGGER ── */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '20px',
          zIndex: 40,
          display: 'none'
        }}
        className="mobile-lab-toc-btn"
      >
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '50px',
            background: '#003666',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 750,
            border: 'none',
            boxShadow: '0 8px 24px rgba(0, 54, 102, 0.35)',
            cursor: 'pointer'
          }}
        >
          <List size={16} />
          <span>Dossier Sections</span>
        </button>
      </div>

      {/* ── MOBILE MODAL DRAWER ── */}
      {isMobileDrawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '360px',
            height: '100%',
            background: '#f8fafc',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical size={18} color="#0284c7" />
                <span>Diagnostic Dossier</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
