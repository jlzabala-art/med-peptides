"use client";

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import ClinicalGanttTimeline from '../../../components/protocol/ClinicalGanttTimeline';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import { SUPPORTED_LANGUAGES, getTranslations, getLocalizedField } from '../../../utils/productTranslations';
import '../../../components/product/PublicDatasheetView.css';
import { 
  FileText, ShieldCheck, Sparkles, FlaskConical, 
  Activity, CheckCircle2, AlertTriangle, Droplets, 
  Thermometer, Share2, Copy, Check, Printer, Clock,
  ExternalLink, Layers, ArrowRight
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

function WaIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.091.537 4.058 1.477 5.771L.013 23.52l5.893-1.44A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a10 10 0 01-5.079-1.381l-.365-.217-3.495.854.875-3.403-.238-.384A10 10 0 1122 12 10.011 10.011 0 0112 22z"/>
    </svg>
  );
}

export default function PublicProtocolPage({ protocol, slug, baseUrl }) {
  const [lang, setLang] = useState('en');
  const [copied, setCopied] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [, startTransition] = useTransition();

  const publicUrl = `${baseUrl}/proto/${slug}`;
  const t = getTranslations(lang);

  const name = protocol?.name || protocol?.title || 'Clinical Protocol Blueprint';
  const category = protocol?.category || protocol?.goal || protocol?.therapeutic_category || 'Regenerative Recovery';
  const duration = protocol?.durationWeeks ? `${protocol.durationWeeks} Weeks` : (protocol?.duration || '8 Weeks');
  const description = getLocalizedField(protocol, 'description', lang) || protocol?.description || protocol?.summary || protocol?.clinicalRationale || '';
  const items = protocol?.items || protocol?.products || protocol?.peptides || [];
  const phases = protocol?.phases || [];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('atlas_portal_lang') || localStorage.getItem('atlas_catalog_lang');
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
        setLang(stored);
      } else {
        const browserLang = navigator.language?.slice(0, 2)?.toLowerCase();
        if (browserLang && SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
          setLang(browserLang);
        }
      }
    }
  }, []);

  const handlePrint = () => {
    triggerHaptic('light');
    window.print();
  };

  const handleCopyUrl = async () => {
    triggerHaptic('copy');
    await navigator.clipboard.writeText(publicUrl).catch(() => {});
    setCopied(true);
    toast.success(lang === 'es' ? 'Enlace del protocolo copiado ✓' : 'Protocol guide link copied ✓');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    triggerHaptic('light');
    const text = 
      `📋 *${name}* — ${t.protocolBadge || 'Clinical Protocol Blueprint'}\n\n` +
      `• *Duration:* ${duration}\n` +
      `• *Therapeutic Goal:* ${category}\n` +
      `• *Phases:* ${phases.length || 1} Treatment Phases\n` +
      `• *Regulatory Context:* Professional Clinical Research (Zero Pricing Disclosed)\n\n` +
      `${description ? `_${description.substring(0, 180)}…_\n\n` : ''}` +
      `📑 *View Complete Clinical Pathway & Dosage Schedule:*\n${publicUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // Biomarkers extraction or clinical fallbacks
  const biomarkers = useMemo(() => {
    if (Array.isArray(protocol?.biomarkers) && protocol.biomarkers.length > 0) {
      return protocol.biomarkers;
    }
    return [
      {
        phase: 'Baseline Evaluation',
        tests: 'Comprehensive Metabolic Panel (CMP), Fasting Insulin, Lipid Profile, hs-CRP, CBC',
        notes: 'Conduct prior to treatment induction to verify physiological eligibility.'
      },
      {
        phase: 'Mid-Cycle Re-calibration',
        tests: 'Fasting Glucose, Renal Function (BUN/Creatinine), Liver Enzymes (AST/ALT)',
        notes: 'Monitored at Week 4 or Week 8 to calibrate optimal peptide titration.'
      },
      {
        phase: 'Post-Cycle Assessment',
        tests: 'HbA1c, Full Hormone Cascade, Cellular Health Biomarkers',
        notes: 'Conducted 2 weeks following protocol completion to document sustained clinical response.'
      }
    ];
  }, [protocol]);

  return (
    <div className="public-datasheet-root">
      {/* ── Fixed Top Institutional Header (Same as Public Datasheet) ── */}
      <header className="pds-top-bar">
        <div className="pds-bar-inner">
          <div className="pds-brand-group">
            <span className="pds-brand-title">{t.brandName || 'Med-Peptides'}</span>
            <span className="pds-brand-divider" aria-hidden="true" />
            <span className="pds-badge-pill">CLINICAL PROTOCOL GUIDE</span>
            <span className="pds-zero-price-badge">Confidential Medical Reference • Zero Pricing Disclosed</span>
          </div>

          <div className="pds-actions-group">
            {/* Multi-language Selector */}
            <select 
              className="pds-lang-select" 
              value={lang} 
              onChange={(e) => {
                const nextLang = e.target.value;
                startTransition(() => setLang(nextLang));
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.setItem('atlas_portal_lang', nextLang);
                    localStorage.setItem('atlas_catalog_lang', nextLang);
                  } catch {}
                }
              }}
              aria-label="Select Language"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>

            {/* Atlas AI Copilot Quick Trigger */}
            <button
              type="button"
              className="pds-btn pds-btn-ghost"
              onClick={() => setIsAiDrawerOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)' }}
            >
              <Sparkles size={14} />
              <span className="pds-btn-label-desktop">Atlas AI</span>
            </button>

            {/* Print / PDF Button */}
            <button 
              type="button" 
              className="pds-btn pds-btn-pdf" 
              onClick={handlePrint}
            >
              <Printer size={14} />
              <span className="pds-btn-label-desktop">PDF / Print</span>
            </button>

            {/* Copy Link Button */}
            <button 
              type="button" 
              className="pds-btn pds-btn-ghost" 
              onClick={handleCopyUrl}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="pds-btn-label-desktop">{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            {/* WhatsApp Share Button */}
            <button 
              type="button" 
              className="pds-btn pds-btn-wa" 
              onClick={handleWhatsApp}
            >
              <WaIcon />
              <span className="pds-btn-label-desktop">Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="pds-container">
        {/* Institutional Verification Notice */}
        <div className="pds-notice-card">
          <ShieldCheck size={20} color="#0284c7" style={{ flexShrink: 0 }} />
          <div className="pds-notice-text">
            <strong>Standardized Clinical Pathway Blueprint</strong>
            <span>
              This treatment protocol guide is curated exclusively for certified medical practitioners and clinical research protocols. 
              All active pharmaceutical ingredients and administration schedules adhere to Lotusland Biosciences research standards. Commercial pricing and distributor markups are strictly withheld.
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pds-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ flex: '1 1 600px' }}>
              <div className="pds-tag-group">
                <span className="pds-cat-tag">{category}</span>
                <span className="pds-purity-tag">
                  <Clock size={13} />
                  <span>{duration}</span>
                </span>
                <span className="pds-cgmp-tag">
                  Lotusland Clinical Standards
                </span>
                <span className="pds-version-tag">
                  <span className="pds-version-dot" />
                  <span>{phases.length || 1} Phases</span>
                </span>
                <span style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                }}>
                  🔒 Medical Use Only
                </span>
              </div>

              <h1 className="pds-title" style={{ margin: '0.5rem 0 0.75rem 0', fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {name}
              </h1>

              {description && (
                <p className="pds-desc" style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                  {description}
                </p>
              )}
            </div>

            {/* Institutional QR Code & Digital Verification */}
            <div className="proto-no-print" style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.1rem',
              textAlign: 'center',
              minWidth: '150px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <QRCodeSVG value={publicUrl} size={110} level="M" />
              <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                VERIFIED PROTOCOL
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                Scan for Instant Clinical Access
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                style={{
                  marginTop: '0.25rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Included Compounds Section */}
        <section className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FlaskConical size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {t.includedPeptides || 'Included Therapeutic Compounds'}
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                  Active API formulations verified under RP-HPLC testing standards
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '3px 10px', borderRadius: '9999px' }}>
              {items.length} Active Agents
            </span>
          </div>

          {items.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              Individual peptide compound specifications are detailed within each phase of the clinical pathway below.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {items.map((item, idx) => {
                const itemSlug = item.slug || item.productId || item.id;
                return (
                  <div key={idx} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.15rem',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                    transition: 'border-color 0.15s ease'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 800 }}>
                          {item.name || item.title || 'Compound'}
                        </strong>
                        {item.dosage && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '6px' }}>
                            {item.dosage}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                        {item.format && (
                          <span style={{ fontSize: '0.72rem', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {item.format}
                          </span>
                        )}
                        {item.route && (
                          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                            • {item.route}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                        {item.timing || item.schedule || item.instructions || 'Administer according to phased titration schedule.'}
                      </p>
                    </div>

                    {itemSlug && (
                      <Link 
                        href={`/p/${itemSlug}`}
                        target="_blank"
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#0284c7',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '0.65rem'
                        }}
                      >
                        <FileText size={14} />
                        <span>View Technical Datasheet</span>
                        <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Phased Clinical Pathway Timeline (Gantt Engine) */}
        <section className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Phased Administration Timeline (Interactive Pathway Engine)
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                Week-by-week titration guidelines and receptor response calibration
              </div>
            </div>
          </div>

          <ClinicalGanttTimeline protocol={protocol} />
        </section>

        {/* Contraindications & Clinical Exclusions */}
        <section className="pds-card" style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#991b1b' }}>
                Contraindications & Clinical Exclusions
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 700 }}>
              Physician Consultation Required Prior to Administration
            </span>
          </div>

          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.5 }}>
            {protocol?.safetyGuidelines || protocol?.contraindications_text || 
              'This protocol is intended strictly under licensed healthcare professional supervision. Verify all clinical exclusions and baseline biomarker levels prior to initiating patient therapy.'}
          </p>

          {Array.isArray(protocol?.contraindications) && protocol.contraindications.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {protocol.contraindications.map((c, i) => (
                <span key={i} style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#991b1b',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{ color: '#dc2626', fontSize: '0.8rem' }}>•</span>
                  <span>{typeof c === 'string' ? c : (c?.condition || JSON.stringify(c))}</span>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Laboratory Biomarkers & Safety Monitoring */}
        <section className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Thermometer size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Recommended Laboratory Biomarkers & Safety Monitoring
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                Recommended blood panels and clinical check points for therapeutic monitoring
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {biomarkers.map((b, idx) => (
              <div key={idx} style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {b.phase || `Checkpoint ${idx + 1}`}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                  {b.tests}
                </div>
                {b.notes && (
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4, marginTop: '2px' }}>
                    {b.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Fixed Floating Bottom Bar (Matching Public Datasheet) ── */}
      <div className="pds-bottom-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #e2e8f0',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
      }}>
        <button 
          type="button"
          onClick={handleWhatsApp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(37, 211, 102, 0.3)'
          }}
        >
          <WaIcon />
          <span>Share Protocol</span>
        </button>

        <button 
          type="button"
          onClick={handlePrint}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: '1.5px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Printer size={15} />
          <span>Print / PDF</span>
        </button>

        <button 
          type="button"
          onClick={handleCopyUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: '1.5px solid #bfdbfe',
            background: '#eff6ff',
            color: '#0284c7',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          <span>{copied ? 'Copied ✓' : 'Copy Guide Link'}</span>
        </button>

        <button 
          type="button"
          onClick={() => setIsAiDrawerOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: '1.5px solid #ccfbf1',
            background: '#f0fdfa',
            color: '#0d9488',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={15} />
          <span>Ask Atlas AI</span>
        </button>
      </div>

      {/* ── Public Atlas AI Copilot Drawer ── */}
      <PublicAtlasAIDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        product={{
          name: protocol?.name || protocol?.title,
          category: protocol?.category || protocol?.goal,
          purity: 'Clinical Protocol Standard',
          targetSystem: protocol?.therapeutic_category || 'Regenerative Pathway',
          description: protocol?.summary || protocol?.description,
          analyticalSpecs: {
            durationWeeks: duration,
            phasesCount: phases.length,
            includedCompounds: items.map(i => i.name || i.title).join(', ')
          }
        }}
        activeStrength={{ name: duration }}
        activeFormat={{ name: 'Clinical Pathway' }}
        isLotusland={true}
      />
    </div>
  );
}
