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
  ExternalLink, Layers, ArrowRight, Package, Syringe,
  Calendar, CalendarDays, Zap, Box, RotateCcw, Info
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
  const [activeReconTab, setActiveReconTab] = useState(0);
  const [, startTransition] = useTransition();

  const publicUrl = `${baseUrl}/proto/${slug}`;
  const t = getTranslations(lang);

  const name = protocol?.name || protocol?.title || 'Clinical Protocol Blueprint';
  const category = protocol?.category || protocol?.goal || protocol?.therapeutic_category || 'Regenerative Recovery';
  const duration = protocol?.durationWeeks ? `${protocol.durationWeeks} Weeks` : (protocol?.duration || '12 Weeks');
  const description = getLocalizedField(protocol, 'description', lang) || protocol?.description || protocol?.summary || protocol?.overview_summary || protocol?.clinicalRationale || '';
  const items = (Array.isArray(protocol?.items) && protocol.items.length > 0) ? protocol.items :
                (Array.isArray(protocol?.bom) && protocol.bom.length > 0) ? protocol.bom :
                (Array.isArray(protocol?.products) && protocol.products.length > 0) ? protocol.products :
                (Array.isArray(protocol?.peptides) && protocol.peptides.length > 0) ? protocol.peptides :
                (Array.isArray(protocol?.compounds) && protocol.compounds.length > 0) ? protocol.compounds : [];
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
    triggerHaptic('medium');
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      triggerHaptic('light');
      toast.success(lang === 'es' ? 'Enlace del protocolo copiado al portapapeles' : 'Protocol guide link copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleWhatsApp = () => {
    triggerHaptic('light');
    const text = 
      `🔬 *Atlas Services Clinical Protocol Blueprint*\n\n` +
      `*Protocol:* ${name}\n` +
      `• *Duration:* ${duration}\n` +
      `• *Therapeutic Goal:* ${category}\n` +
      `• *Phases:* ${phases.length || 3} Treatment Phases\n` +
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
        phase: 'Baseline Pre-Screening',
        tests: 'Comprehensive Metabolic Panel (CMP), Fasting Insulin, Lipid Profile, hs-CRP, Resting Heart Rate',
        notes: 'Conduct prior to Phase 1 induction to establish metabolic baseline and ensure cardiac tolerance.'
      },
      {
        phase: 'Mid-Cycle Titration Checkpoint (Week 6)',
        tests: 'Fasting Glucose, Renal Function (BUN/Creatinine), Liver Enzymes (AST/ALT), Electrolytes',
        notes: 'Monitored at Week 6 during Phase 2 escalation to verify renal clearance and glycemic response.'
      },
      {
        phase: 'Post-Cycle Consolidation Assessment (Week 14)',
        tests: 'HbA1c, Full Hormone Cascade, Lipid Panel, Body Composition (DEXA)',
        notes: 'Conducted 2 weeks following protocol completion to evaluate sustained metabolic enhancement and lean mass retention.'
      }
    ];
  }, [protocol]);

  // Protocol Supply Engine (Zero-Pricing Material Yield)
  const supplySummary = useMemo(() => {
    const durWeeks = Number(protocol?.durationWeeks) || 
      (protocol?.phases ? protocol.phases.reduce((acc, p) => acc + (Number(p.durationWeeks) || 0), 0) : 12) || 12;

    const compoundSupplies = items.map(it => {
      const isMots = it.productId?.includes('motsc') || it.productId?.includes('mots-c') || it.name?.toLowerCase().includes('mots');
      const isReta = it.productId?.includes('reta') || it.name?.toLowerCase().includes('retatrutide');
      
      const q = it.quantity || (isMots ? Math.ceil(durWeeks * 1) : Math.ceil(durWeeks / 4));
      const vialStrength = it.vial_size_mg || '10 mg';
      const name = it.product_name || it.name || (isMots ? 'MOTS-c' : isReta ? 'Retatrutide' : 'Therapeutic Compound');
      const cadence = it.frequency || (isMots ? '3x Weekly SubQ' : 'Once Weekly SubQ');
      const injectionsPerWeek = isMots ? 3 : 1;
      const totalInj = injectionsPerWeek * durWeeks;

      return {
        id: it.id || it.productId,
        name,
        slug: it.slug || it.productId,
        vials: q,
        vialStrength,
        reconstitutionBac: '2.0 mL BAC',
        cadence,
        totalInjections: totalInj,
        injectionsPerWeek,
        weeklyDose: isMots ? '15.0 mg/wk (3x 5.0mg)' : '2.0 - 6.0 mg/wk (Titrated)'
      };
    });

    const totalVials = compoundSupplies.reduce((sum, c) => sum + c.vials, 0) || 15;
    const totalInjections = compoundSupplies.reduce((sum, c) => sum + c.totalInjections, 0) || 48;
    const bacVials = Math.max(3, Math.ceil((totalVials * 2.0) / 10)); // 10mL BAC vials

    return {
      durWeeks,
      totalVials,
      totalInjections,
      bacVials,
      syringes: totalInjections,
      alcoholSwabs: totalInjections,
      compounds: compoundSupplies
    };
  }, [items, protocol]);

  // Reconstitution Specs for interactive console
  const reconData = [
    {
      name: 'Retatrutide',
      strength: '10 mg Vial',
      solvent: '2.0 mL BAC Water',
      concentration: '5.0 mg / mL (0.05 mg per Unit on U-100)',
      storage: 'Refrigerate at 2°C – 8°C (Do Not Freeze). Aqueous shelf-life: 28 Days.',
      steps: [
        'Clean the rubber stopper with an isopropyl alcohol swab.',
        'Draw exactly 2.0 mL of Bacteriostatic Water into the mixing syringe.',
        'Gently inject BAC water down the inside glass wall of the vial (avoid foaming).',
        'Swirl smoothly in a figure-eight motion until completely dissolved. Do not shake vigorously.'
      ],
      dosingScale: [
        { phase: 'Phase 1 (W1–W4)', dose: '2.0 mg Weekly', units: '40 Units (0.40 mL)', syringe: 'U-100 Insulin Syringe' },
        { phase: 'Phase 2 (W5–W8)', dose: '4.0 mg Weekly', units: '80 Units (0.80 mL)', syringe: 'U-100 Insulin Syringe' },
        { phase: 'Phase 3 (W9–W12)', dose: '6.0 mg Weekly', units: '120 Units (or 2x 60 Units)', syringe: 'U-100 Insulin Syringe' }
      ]
    },
    {
      name: 'MOTS-c',
      strength: '10 mg Vial',
      solvent: '2.0 mL BAC Water',
      concentration: '5.0 mg / mL (0.05 mg per Unit on U-100)',
      storage: 'Refrigerate at 2°C – 8°C. Peptide is temperature sensitive; protect from direct light.',
      steps: [
        'Clean vial septum with an isopropyl alcohol swab.',
        'Introduce 2.0 mL of cold BAC water slowly along the glass wall.',
        'Allow lyophilized powder to wet and dissolve naturally with minimal agitation.',
        'Administer SubQ promptly in morning fasted state for maximum cellular response.'
      ],
      dosingScale: [
        { phase: 'All Phases (W1–W12)', dose: '5.0 mg per injection', units: '100 Units (1.0 mL)', syringe: 'U-100 (1.0 mL) Syringe' },
        { phase: 'Frequency', dose: '3x Weekly (Mon / Wed / Fri)', units: '3 Vials / 4 Weeks (12 Vials Total)', syringe: 'SubQ Abdominal / Thigh' }
      ]
    }
  ];

  // 7-Day Administration Schedule Map
  const weeklySchedule = [
    { day: 'Monday', compound: 'MOTS-c', dose: '5.0 mg (100 UI)', time: 'Morning • Fasted', route: 'SubQ (Abdomen)', badgeColor: '#0d9488', rest: false },
    { day: 'Tuesday', compound: 'Metabolic Rest', dose: 'Hydration & Electrolytes', time: 'All Day', route: 'Oral Support', badgeColor: '#64748b', rest: true },
    { day: 'Wednesday', compound: 'MOTS-c', dose: '5.0 mg (100 UI)', time: 'Morning • Fasted', route: 'SubQ (Abdomen)', badgeColor: '#0d9488', rest: false },
    { day: 'Thursday', compound: 'Metabolic Rest', dose: 'Zone 2 Cardio / Hydration', time: 'All Day', route: 'Lifestyle Calibration', badgeColor: '#64748b', rest: true },
    { day: 'Friday', compound: 'MOTS-c', dose: '5.0 mg (100 UI)', time: 'Morning • Fasted', route: 'SubQ (Abdomen)', badgeColor: '#0d9488', rest: false },
    { day: 'Saturday', compound: 'Metabolic Rest', dose: 'Protein Intake Focus', time: 'All Day', route: 'Nutritional Support', badgeColor: '#64748b', rest: true },
    { day: 'Sunday', compound: 'Retatrutide', dose: 'Phased Titration (2–6 mg)', time: 'Evening • Pre-Sleep', route: 'SubQ (Thigh / Deltoid)', badgeColor: '#0284c7', rest: false }
  ];

  const currentRecon = reconData[activeReconTab] || reconData[0];

  return (
    <div className="public-datasheet-root">
      {/* ── Fixed Top Institutional Header ── */}
      <header className="pds-top-bar">
        <div className="pds-bar-inner">
          <div className="pds-brand-group">
            <span className="pds-brand-title">{t.brandName || 'Med-Peptides'}</span>
            <span className="pds-brand-divider" aria-hidden="true" />
            <span className="pds-badge-pill">CLINICAL PROTOCOL GUIDE</span>
            <span className="pds-zero-price-badge">Atlas Services Clinical Registry • Zero Pricing Disclosed</span>
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

            {/* Jump to Included Peptides */}
            {items.length > 0 && (
              <a
                href="#included-compounds"
                className="pds-btn pds-btn-ghost"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(14, 165, 233, 0.15)',
                  color: '#38bdf8',
                  borderColor: 'rgba(56, 189, 248, 0.35)',
                  fontWeight: 600
                }}
              >
                <FlaskConical size={14} />
                <span className="pds-btn-label-desktop">
                  {lang === 'es' ? `Péptidos (${items.length})` : `Peptides (${items.length})`}
                </span>
              </a>
            )}

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
              All active pharmaceutical ingredients and administration schedules adhere to Atlas Services clinical research standards. Commercial pricing and distributor markups are strictly withheld.
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
                  Atlas Services Clinical Standards
                </span>
                <span className="pds-version-tag">
                  <span className="pds-version-dot" />
                  <span>{phases.length || 3} Treatment Phases</span>
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
                  🔒 Certified Practitioner Use Only
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

        {/* ── 4 Executive KPI Metric Cards (Scope: Full Protocol) ── */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          margin: '1.5rem 0'
        }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Protocol Duration</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{duration}</div>
              <div style={{ fontSize: '0.70rem', color: '#0284c7', fontWeight: 600 }}>3 Titration Stages</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FlaskConical size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Peptides</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{items.length || 2} Formulations</div>
              <div style={{ fontSize: '0.70rem', color: '#0d9488', fontWeight: 600 }}>Dual Metabolic Synergy</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Cycle Vials</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{supplySummary.totalVials} Vials</div>
              <div style={{ fontSize: '0.70rem', color: '#7c3aed', fontWeight: 600 }}>Zero Commercial Price</div>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff7ed', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Syringe size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Administration Events</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{supplySummary.totalInjections} Micro-Doses</div>
              <div style={{ fontSize: '0.70rem', color: '#c2410c', fontWeight: 600 }}>U-100 Sterile Syringes</div>
            </div>
          </div>
        </section>

        {/* ── Sticky Anchor Quick Navigation Strip ── */}
        <nav style={{
          position: 'sticky',
          top: '56px',
          zIndex: 800,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #e2e8f0',
          margin: '0 -1.5rem 1.5rem -1.5rem',
          padding: '0.65rem 1.5rem',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {[
            { label: '📊 Pathway Timeline', href: '#pathway-timeline' },
            { label: '📦 Cycle Supplies & Vials', href: '#cycle-supplies' },
            { label: '💉 Reconstitution & Syringe', href: '#reconstitution-console' },
            { label: '🗓️ 7-Day Schedule', href: '#weekly-calendar' },
            { label: '⚡ Pharmacokinetics', href: '#synergy-pk' },
            { label: '🩺 Biomarkers & Safety', href: '#biomarkers-safety' }
          ].map((nav, i) => (
            <a
              key={i}
              href={nav.href}
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#334155',
                textDecoration: 'none',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {nav.label}
            </a>
          ))}
        </nav>

        {/* Included Compounds Section */}
        <section id="included-compounds" className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: '1.75rem' }}>
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
                  Active API formulations verified under Atlas Services analytical standards
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '3px 10px', borderRadius: '9999px' }}>
              {items.length} Active Agents
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
            {items.map((item, idx) => {
              const itemSlug = item.slug || item.productId || item.productSlug || (item.id && !item.id.startsWith('item-') ? item.id : null);
              const itemName = item.product_name || item.name || item.title || 'Compound';
              const itemDosage = item.dosage || item.dose || (item.quantity ? `${item.quantity} ${item.unit || 'Vials'}` : null);
              return (
                <div key={idx} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.15rem',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 800 }}>
                        {itemName}
                      </strong>
                      {itemDosage && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '6px' }}>
                          {itemDosage}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        {item.format || 'Lyophilized Powder'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                        • {item.route || 'Subcutaneous (SubQ)'}
                      </span>
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
                      <span>View Technical Monograph</span>
                      <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Phased Clinical Pathway Timeline (Gantt Engine) ── */}
        <section id="pathway-timeline" className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: '1.75rem' }}>
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

        {/* ── Protocol Cycle Dispensing & Logistics Blueprint (Zero Pricing) ── */}
        <section id="cycle-supplies" className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Protocol Cycle Dispensing & Logistics Blueprint
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                  Calculated active API inventory and sterile administration consumables for the full {duration}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '3px 10px', borderRadius: '9999px' }}>
              Prescriptive Logistics • Zero Pricing Disclosed
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Peptide Supply Breakdown */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Box size={14} color="#0284c7" />
                <span>Active Peptide Requirements</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {supplySummary.compounds.map((c, i) => (
                  <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>{c.name} ({c.vialStrength})</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Cadence: {c.cadence} • {c.weeklyDose}</div>
                      <div style={{ fontSize: '0.70rem', color: '#0d9488', fontWeight: 600, marginTop: '2px' }}>{c.totalInjections} Micro-Dose Injections</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7' }}>{c.vials} Vials</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>12-Week Allocation</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sterile Ancillary Consumables */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Droplets size={14} color="#0d9488" />
                <span>Sterile Reconstitution & Administration Supplies</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Bacteriostatic Water (BAC)</div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>USP Preserved Solvent (2.0 mL per vial)</div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#0d9488', fontSize: '0.95rem' }}>{supplySummary.bacVials}x 10 mL Vials</span>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Sterile U-100 Insulin Syringes</div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>31G 8mm Ultra-Fine (Single Use)</div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.95rem' }}>{supplySummary.syringes} Syringes</span>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>Antiseptic Prep Pads</div>
                    <div style={{ fontSize: '0.70rem', color: '#64748b' }}>70% Isopropyl Alcohol Swabs</div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#64748b', fontSize: '0.95rem' }}>{supplySummary.alcoholSwabs} Swabs</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            ℹ️ Note: Auxiliary supplies are automatically calculated based on exact weekly administration events and 28-day aqueous stability limits. Commercial prices and supply costs are strictly excluded.
          </div>
        </section>

        {/* ── Interactive Reconstitution & Syringe Calibration Console ── */}
        <section id="reconstitution-console" className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Syringe size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Interactive Reconstitution & Syringe Calibration Console
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                  High-precision dilution formula and U-100 syringe graduation guide for clinical accuracy
                </div>
              </div>
            </div>

            {/* Compound Selector Switcher */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', gap: '4px' }}>
              {reconData.map((rd, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveReconTab(idx);
                  }}
                  style={{
                    border: 'none',
                    background: activeReconTab === idx ? '#ffffff' : 'transparent',
                    color: activeReconTab === idx ? '#0f172a' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: activeReconTab === idx ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  {rd.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Dilution Specifications */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
                Dilution Architecture • {currentRecon.name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Vial Active API</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{currentRecon.strength}</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Diluent Volume</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>{currentRecon.solvent}</div>
                </div>
              </div>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.70rem', color: '#1e40af', fontWeight: 700 }}>Resulting Concentration</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e3a8a' }}>{currentRecon.concentration}</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                <strong>Storage:</strong> {currentRecon.storage}
              </div>
            </div>

            {/* Syringe Graduation Scale */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
                Phase-by-Phase Draw Units (U-100 Syringe)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {currentRecon.dosingScale.map((ds, idx) => (
                  <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{ds.phase}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Target Dose: {ds.dose}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '3px 8px', borderRadius: '6px' }}>
                        {ds.units}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '0.85rem', fontSize: '0.72rem', color: '#64748b' }}>
                ✓ Calibrated for 0.3mL, 0.5mL, or 1.0mL U-100 standard insulin syringes (100 units = 1.0 mL).
              </div>
            </div>
          </div>
        </section>

        {/* ── Weekly Administration Roadmap (7-Day Schedule Grid) ── */}
        <section id="weekly-calendar" className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CalendarDays size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Weekly Administration Roadmap (7-Day Regimen Grid)
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                Standardized weekly administration schedule preventing receptor exhaustion and injection overlap
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {weeklySchedule.map((ws, idx) => (
              <div key={idx} style={{
                background: ws.rest ? '#f8fafc' : '#ffffff',
                border: ws.rest ? '1px dashed #cbd5e1' : `1.5px solid ${ws.badgeColor}33`,
                borderRadius: '10px',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '130px'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    {ws.day}
                  </div>
                  <div style={{ fontWeight: 800, color: ws.rest ? '#64748b' : ws.badgeColor, fontSize: '0.90rem', marginTop: '4px' }}>
                    {ws.compound}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                    {ws.dose}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
                    {ws.time}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                    {ws.route}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dual-Pathway Pharmacokinetics & Receptor Synergy ── */}
        <section id="synergy-pk" className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Dual-Pathway Pharmacokinetics & Receptor Synergy
              </h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                Mechanistic rationale for co-administering Retatrutide and MOTS-c
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Retatrutide • Triple Incretin / Glucagon Agonist
              </div>
              <p style={{ fontSize: '0.82rem', color: '#0f172a', lineHeight: 1.5, margin: '0.5rem 0' }}>
                <strong>Receptors:</strong> GLP-1R, GIPR, and GCGR (Glucagon Receptor).<br />
                <strong>Elimination Half-Life:</strong> ~6 Days (Steady-state achieved by Week 4).<br />
                <strong>Clinical Effect:</strong> Suppresses central appetite, improves glycemic control, elevates resting energy expenditure, and promotes direct hepatic lipid oxidation via glucagon activation.
              </p>
            </div>

            <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                MOTS-c • Mitochondrial-Derived Peptide (MDP)
              </div>
              <p style={{ fontSize: '0.82rem', color: '#0f172a', lineHeight: 1.5, margin: '0.5rem 0' }}>
                <strong>Target Pathway:</strong> AMPK phosphorylation, GLUT4 translocation, Folate-Methionine cycle.<br />
                <strong>Elimination Half-Life:</strong> ~4–5 Hours (Pulsatile intracellular signaling).<br />
                <strong>Clinical Synergy:</strong> Counteracts skeletal muscle catabolism (sarcopenia) frequently observed during aggressive caloric deficits, while restoring mitochondrial ATP biogenesis.
              </p>
            </div>
          </div>
        </section>

        {/* ── Contraindications & Clinical Exclusions ── */}
        <section className="pds-card" style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', marginBottom: '1.75rem' }}>
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

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              'Personal or family history of Medullary Thyroid Carcinoma (MTC)',
              'Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)',
              'History of Acute or Chronic Pancreatitis',
              'Severe renal impairment (eGFR < 30 mL/min/1.73 m²)',
              'Pregnancy, lactation, or planned pregnancy within 3 months',
              'Concurrent administration of other GLP-1/GIP receptor agonists'
            ].map((c, i) => (
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
                <span>{c}</span>
              </span>
            ))}
          </div>
        </section>

        {/* ── Laboratory Biomarkers & Safety Monitoring ── */}
        <section id="biomarkers-safety" className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', marginBottom: '4rem' }}>
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

      {/* ── Fixed Floating Bottom Bar (Mobile Elevated) ── */}
      <div className="pds-bottom-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #e2e8f0',
        padding: '0.65rem 1.25rem',
        paddingBottom: 'calc(0.65rem + env(safe-area-inset-bottom, 0px))',
        display: 'flex',
        gap: '0.65rem',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        flexWrap: 'wrap'
      }}>
        <button 
          type="button"
          onClick={handleWhatsApp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.55rem 1.15rem',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.82rem',
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
            padding: '0.55rem 1.15rem',
            borderRadius: '8px',
            border: '1.5px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <Printer size={14} />
          <span>Print / PDF</span>
        </button>

        <button 
          type="button"
          onClick={handleCopyUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.55rem 1.15rem',
            borderRadius: '8px',
            border: '1.5px solid #bfdbfe',
            background: '#eff6ff',
            color: '#0284c7',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied ✓' : 'Copy Guide Link'}</span>
        </button>

        <button 
          type="button"
          onClick={() => setIsAiDrawerOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.55rem 1.15rem',
            borderRadius: '8px',
            border: '1.5px solid #ccfbf1',
            background: '#f0fdfa',
            color: '#0d9488',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          <Sparkles size={14} />
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
            phasesCount: phases.length || 3,
            includedCompounds: items.map(i => i.name || i.title).join(', '),
            totalVials: `${supplySummary.totalVials} Vials (Zero Pricing Disclosed)`,
            totalInjections: `${supplySummary.totalInjections} Micro-doses`
          }
        }}
        activeStrength={{ name: duration }}
        activeFormat={{ name: 'Clinical Pathway' }}
        isLotusland={false}
      />
    </div>
  );
}
