"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import ClinicalGanttTimeline from '../../../components/protocol/ClinicalGanttTimeline';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import { 
  generateDynamicReconData, 
  generateDynamicSupplySummary, 
  generateDynamicWeeklySchedule 
} from '../../../utils/clinicalDosingEngine';
import { 
  SUPPORTED_LANGUAGES, 
  getProtocolTranslations, 
  GOAL_TRANSLATIONS 
} from '../../../utils/protocolTranslations';
import '../../../components/product/PublicDatasheetView.css';
import { 
  FileText, ShieldCheck, Sparkles, FlaskConical, 
  Activity, CheckCircle2, AlertTriangle, Droplets, 
  Thermometer, Copy, Check, Clock,
  ExternalLink, Layers, ArrowRight, Package, Syringe,
  Calendar, CalendarDays, Zap, Box, RotateCcw, Info, QrCode
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';

export default function PublicProtocolPage({ protocol, slug, baseUrl }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('atlas_portal_lang') || localStorage.getItem('atlas_catalog_lang');
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) return stored;
      const browser = navigator.language?.slice(0, 2)?.toLowerCase();
      if (browser && SUPPORTED_LANGUAGES.some(l => l.code === browser)) return browser;
    }
    return 'en';
  });

  const [copied, setCopied] = useState(false);
  const [activeReconTab, setActiveReconTab] = useState(0);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState({});
  const requestedLangs = useRef(new Set());
  const [, startTransition] = useTransition();

  const publicUrl = `${baseUrl}/proto/${slug}`;
  const t = getProtocolTranslations(lang);

  const protocolCode = protocol?.protocol_id || protocol?.shortCode || protocol?.id || (typeof slug === 'string' ? slug.substring(0, 12).toUpperCase() : 'WMT-001');
  const baseName = protocol?.name || protocol?.title || 'Clinical Protocol Blueprint';
  const category = protocol?.category || protocol?.goal || protocol?.therapeutic_category || 'Regenerative Recovery';
  const rawDuration = protocol?.durationWeeks ? `${protocol.durationWeeks} ${t.weeksLabel || 'Weeks'}` : (protocol?.duration || `12 ${t.weeksLabel || 'Weeks'}`);
  const baseDescription = protocol?.description || protocol?.summary || protocol?.overview_summary || protocol?.clinicalRationale || '';

  const items = (Array.isArray(protocol?.items) && protocol.items.length > 0) ? protocol.items :
                (Array.isArray(protocol?.bom) && protocol.bom.length > 0) ? protocol.bom :
                (Array.isArray(protocol?.products) && protocol.products.length > 0) ? protocol.products :
                (Array.isArray(protocol?.peptides) && protocol.peptides.length > 0) ? protocol.peptides :
                (Array.isArray(protocol?.compounds) && protocol.compounds.length > 0) ? protocol.compounds : [];
  const phases = protocol?.phases || [];

  // Listen for cross-page/cross-component language synchronization
  useEffect(() => {
    const handleGlobalLang = (e) => {
      if (e.detail && SUPPORTED_LANGUAGES.some(l => l.code === e.detail)) {
        setLang(e.detail);
      }
    };
    window.addEventListener('atlas_lang_change', handleGlobalLang);
    return () => window.removeEventListener('atlas_lang_change', handleGlobalLang);
  }, []);

  // On-demand AI translation for protocol when non-English is selected
  useEffect(() => {
    if (lang === 'en' || !protocol?.id) return;
    if (requestedLangs.current.has(lang)) return;

    const rawDesc = protocol?.description || protocol?.summary || protocol?.clinicalRationale || '';
    if (!rawDesc) return;

    requestedLangs.current.add(lang);

    fetch('/api/ai-translate-clinical', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetId: protocol.id,
        targetType: 'protocol',
        targetLang: lang,
        fields: {
          description: rawDesc,
          name: protocol.name || protocol.title || '',
        },
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data?.ok && data?.translations) {
          setDynamicTranslations(prev => ({
            ...prev,
            [lang]: data.translations,
          }));
        }
      })
      .catch(() => {});
  }, [lang, protocol?.id, protocol?.description, protocol?.summary, protocol?.clinicalRationale, protocol?.name, protocol?.title]);

  const handleLangChange = (nextLang) => {
    startTransition(() => setLang(nextLang));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_portal_lang', nextLang);
        localStorage.setItem('atlas_catalog_lang', nextLang);
        window.dispatchEvent(new CustomEvent('atlas_lang_change', { detail: nextLang }));
      } catch {}
      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLang);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      triggerHaptic('light');
      toast.success(t.copySuccessToast);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Could not copy link');
    }
  };

  // Biomarkers extraction or clinical fallbacks
  const biomarkers = useMemo(() => {
    if (Array.isArray(protocol?.biomarkers) && protocol.biomarkers.length > 0) {
      return protocol.biomarkers;
    }
    return [
      {
        phase: lang === 'es' ? 'Evaluación Basal Inicial' : 'Baseline Pre-Screening',
        tests: lang === 'es' 
          ? 'Panel Metabólico Completo (CMP), Insulina Basal, Perfil Lipídico, hs-CRP, Frecuencia Cardíaca en Reposo'
          : 'Comprehensive Metabolic Panel (CMP), Fasting Insulin, Lipid Profile, hs-CRP, Resting Heart Rate',
        notes: lang === 'es'
          ? 'Realizar previo a la Fase 1 para establecer línea de base metabólica y verificar tolerancia cardíaca.'
          : 'Conduct prior to Phase 1 induction to establish metabolic baseline and ensure cardiac tolerance.'
      },
      {
        phase: lang === 'es' ? 'Punto de Control de Titulación (Semana 6)' : 'Mid-Cycle Titration Checkpoint (Week 6)',
        tests: lang === 'es'
          ? 'Glucosa en Ayunas, Función Renal (BUN/Creatinina), Transaminasas Hepáticas (AST/ALT), Electrolitos'
          : 'Fasting Glucose, Renal Function (BUN/Creatinine), Liver Enzymes (AST/ALT), Electrolytes',
        notes: lang === 'es'
          ? 'Monitorizado en Semana 6 durante el escalado para verificar aclaramiento renal y respuesta glucémica.'
          : 'Monitored at Week 6 during Phase 2 escalation to verify renal clearance and glycemic response.'
      },
      {
        phase: lang === 'es' ? 'Evaluación de Consolidación Post-Ciclo (Semana 14)' : 'Post-Cycle Consolidation Assessment (Week 14)',
        tests: lang === 'es'
          ? 'HbA1c, Cascada Hormonal Completa, Perfil Lipídico, Composición Corporal (DEXA)'
          : 'HbA1c, Full Hormone Cascade, Lipid Panel, Body Composition (DEXA)',
        notes: lang === 'es'
          ? 'Efectuada 2 semanas tras finalizar para evaluar optimización metabólica sostenida y retención de masa magra.'
          : 'Conducted 2 weeks following protocol completion to evaluate sustained metabolic enhancement and lean mass retention.'
      }
    ];
  }, [protocol, lang]);

  // Dynamic translated texts
  const dynT = dynamicTranslations[lang] || {};
  const displayName = dynT.name || (lang === 'es' && protocol?.name_es) || baseName;
  const displayDescription = dynT.description || (lang === 'es' && protocol?.description_es) || baseDescription;
  const displayDuration = rawDuration;

  // Protocol Supply Engine — Single Source of Truth
  const supplySummary = useMemo(() => {
    return generateDynamicSupplySummary(protocol);
  }, [protocol]);

  // Reconstitution Specs for interactive console — Single Source of Truth
  const reconData = useMemo(() => {
    return generateDynamicReconData(protocol);
  }, [protocol]);

  // 7-Day Administration Schedule Map — Single Source of Truth
  const weeklySchedule = useMemo(() => {
    return generateDynamicWeeklySchedule(protocol);
  }, [protocol]);

  // Auto-clamp active tab if compounds count changes
  useEffect(() => {
    if (activeReconTab >= reconData.length && reconData.length > 0) {
      setActiveReconTab(0);
    }
  }, [reconData.length, activeReconTab]);

  const currentRecon = reconData[activeReconTab] || reconData[0] || {
    name: displayName || 'Therapeutic Compound',
    strength: '10 mg Vial',
    solvent: '2.0 mL BAC Water',
    concentration: '5.0 mg / mL',
    storage: 'Refrigerate at 2°C – 8°C (Do Not Freeze). Protect from light. Aqueous stability: 28 days.',
    steps: [
      'Disinfect vial rubber septum using a sterile 70% isopropyl alcohol wipe.',
      'Draw exactly 2.0 mL of Bacteriostatic 0.9% Benzyl Alcohol Water using a sterile mixing syringe.',
      'Gently inject BAC water down the inside glass wall of the vial (avoid foaming).',
      'Swirl smoothly in a figure-eight motion until completely dissolved. Do not shake vigorously.'
    ],
    dosingScale: []
  };

  // Meaningful vial breakdown without any pricing mention
  const vialBreakdownText = useMemo(() => {
    if (supplySummary.compounds.length > 1) {
      return supplySummary.compounds.map(c => `${c.vials}x ${c.name.replace(/\(.*?\)/g, '').trim()}`).join(' · ');
    }
    if (supplySummary.compounds.length === 1) {
      const single = supplySummary.compounds[0];
      const cleanName = single.name.replace(/\(.*?\)/g, '').trim();
      const strengthPart = single.vialStrength ? ` (${single.vialStrength})` : '';
      return `${single.vials}x ${cleanName}${strengthPart}`;
    }
    return lang === 'es' ? 'Viales de Formulación Activa' : 'Active Formulation Vials';
  }, [supplySummary.compounds, lang]);

  return (
    <div className="public-datasheet-root">
      {/* ── Fixed Top Action Bar ── */}
      <header className="pds-top-bar proto-no-print" aria-label="Protocol Actions">
        <div className="pds-bar-inner">
          <div className="pds-brand-group">
            <span className="pds-brand-title">Med-Peptides</span>
            <span className="pds-brand-divider" aria-hidden="true" />
            <span className="pds-badge-pill">{t.clinicalProtocolGuide}</span>
            <span className="pds-zero-price-badge">{t.clinicalRegistryBadge}</span>
          </div>

          <div className="pds-actions-group">
            {/* Multi-language Selector (Identical across all public views) */}
            <select 
              className="pds-lang-select" 
              value={lang} 
              onChange={(e) => handleLangChange(e.target.value)}
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
                  {t.peptidesBadge} ({items.length})
                </span>
              </a>
            )}

            {/* Copy Link Button */}
            <button 
              type="button" 
              className="pds-btn pds-btn-ghost" 
              onClick={handleCopyUrl}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="pds-btn-label-desktop">{copied ? t.linkCopied : t.copyLink}</span>
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
            <strong>{t.standardizedBlueprint}</strong>
            <span>{t.blueprintNotice}</span>
          </div>
        </div>

        {/* Navigation Breadcrumb back to /proto Directory */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            href="/proto"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.80rem',
              fontWeight: 700,
              color: '#003666',
              textDecoration: 'none',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '4px 12px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>← {t.exploreAllProtocols}</span>
          </Link>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/</span>
          <span style={{ fontSize: '0.80rem', color: '#64748b', fontWeight: 600 }}>{category}</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/</span>
          <span style={{ fontSize: '0.80rem', color: '#0f172a', fontWeight: 700 }}>{displayName}</span>
        </div>

        {/* Hero Section */}
        <section className="pds-hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ flex: '1 1 600px' }}>
              <div className="pds-tag-group">
                <span className="pds-cat-tag">{category}</span>
                <span className="pds-purity-tag">
                  <Clock size={13} />
                  <span>{displayDuration}</span>
                </span>
                <span className="pds-cgmp-tag">
                  {lang === 'es' ? 'Estándares Clínicos Atlas Services' : 'Atlas Services Clinical Standards'}
                </span>
                <span className="pds-version-tag">
                  <span className="pds-version-dot" />
                  <span>{phases.length || 3} {lang === 'es' ? 'Fases de Tratamiento' : 'Treatment Phases'}</span>
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
                  🔒 {t.certifiedOnlyBadge}
                </span>
              </div>

              <h1 className="pds-title" style={{ margin: '0.5rem 0 0.75rem 0', fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {displayName}
              </h1>

              {displayDescription && (
                <p className="pds-desc" style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                  {displayDescription}
                </p>
              )}

              {/* Mobile GCP Verification Strip */}
              <div className="proto-mobile-gcp-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} style={{ color: '#0d9488', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>
                    {t.verifiedProtocol}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>
                    {protocolCode}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
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
                    <span>{copied ? t.linkCopied : t.copyLink}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      color: '#0d9488',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <QrCode size={11} />
                    <span>QR</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Institutional QR Code & Digital Verification (Desktop Only) */}
            <div className="proto-no-print proto-desktop-qr" style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.1rem',
              textAlign: 'center',
              minWidth: '150px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <QRCodeSVG value={publicUrl} size={110} level="M" />
              <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                {t.verifiedProtocol}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                {t.scanForAccess}
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
                <span>{copied ? t.linkCopied : t.copyLink}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── 4 Executive KPI Metric Cards (Scope: Full Protocol) ── */}
        <section className="proto-kpis-grid">
          {/* KPI 1: Duration */}
          <div className="proto-kpi-card-box">
            <div className="proto-kpi-card-icon" style={{ background: '#eff6ff', color: '#0284c7' }}>
              <Clock size={20} />
            </div>
            <div className="proto-kpi-card-body">
              <div className="proto-kpi-card-title">{t.kpiDurationTitle}</div>
              <div className="proto-kpi-card-value">{displayDuration}</div>
              <div className="proto-kpi-card-sub" style={{ color: '#0284c7' }}>{phases.length || 3} {t.kpiDurationSubtitle}</div>
            </div>
          </div>

          {/* KPI 2: Active Peptides */}
          <div className="proto-kpi-card-box">
            <div className="proto-kpi-card-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
              <FlaskConical size={20} />
            </div>
            <div className="proto-kpi-card-body">
              <div className="proto-kpi-card-title">{t.kpiPeptidesTitle}</div>
              <div className="proto-kpi-card-value">{items.length || 1} {items.length === 1 ? t.kpiFormulation : t.kpiFormulations}</div>
              <div className="proto-kpi-card-sub" style={{ color: '#0d9488' }}>{items.length > 1 ? t.kpiPeptidesSubtitle : t.kpiPeptidesFallbackSubtitle}</div>
            </div>
          </div>

          {/* KPI 3: Full Cycle Vials (No mention of price! Breakdown by peptide type) */}
          <div className="proto-kpi-card-box">
            <div className="proto-kpi-card-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
              <Package size={20} />
            </div>
            <div className="proto-kpi-card-body">
              <div className="proto-kpi-card-title">{t.kpiVialsTitle}</div>
              <div className="proto-kpi-card-value">{supplySummary.totalVials} {t.kpiVialsUnit}</div>
              {supplySummary.compounds.length > 1 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.2rem' }}>
                  {supplySummary.compounds.map((c, i) => (
                    <span 
                      key={i} 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        background: '#f3e8ff', 
                        color: '#6b21a8', 
                        padding: '0.12rem 0.45rem', 
                        borderRadius: '4px', 
                        fontSize: '0.68rem', 
                        fontWeight: 700 
                      }}
                    >
                      {c.vials}x {c.name.replace(/\(.*?\)/g, '').trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="proto-kpi-card-sub" style={{ color: '#7c3aed' }}>
                  {vialBreakdownText}
                </div>
              )}
            </div>
          </div>

          {/* KPI 4: Administration Events */}
          <div className="proto-kpi-card-box">
            <div className="proto-kpi-card-icon" style={{ background: '#fff7ed', color: '#c2410c' }}>
              <Syringe size={20} />
            </div>
            <div className="proto-kpi-card-body">
              <div className="proto-kpi-card-title">{t.kpiInjectionsTitle}</div>
              <div className="proto-kpi-card-value">{supplySummary.totalInjections} {t.kpiInjectionsUnit}</div>
              <div className="proto-kpi-card-sub" style={{ color: '#c2410c' }}>{t.kpiInjectionsSubtitle}</div>
            </div>
          </div>
        </section>

        {/* ── Sticky Anchor Quick Navigation Strip (Mobile-First / Zero Overflow) ── */}
        <nav className="proto-quick-nav">
          {/* Mobile section jump selector (Regla #23) */}
          <div className="proto-mobile-section-wrapper">
            <select
              className="proto-mobile-section-select"
              aria-label={lang === 'es' ? 'Saltar a sección' : 'Jump to section'}
              onChange={(e) => {
                if (e.target.value) {
                  const target = document.querySelector(e.target.value);
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>
                {lang === 'es' ? '📑 Saltar a sección...' : '📑 Jump to section...'}
              </option>
              <option value="#included-compounds">{lang === 'es' ? '🧬 Péptidos Incluidos' : '🧬 Included Peptides'}</option>
              <option value="#pathway-timeline">{lang === 'es' ? '📊 Cronograma & Fases' : '📊 Pathway Timeline'}</option>
              <option value="#reconstitution-console">{lang === 'es' ? '💉 Reconstitución & Jeringa' : '💉 Reconstitution & Syringe'}</option>
              <option value="#cycle-supplies">{lang === 'es' ? '📦 Suministros & Viales' : '📦 Cycle Supplies & Vials'}</option>
              <option value="#weekly-calendar">{lang === 'es' ? '📅 Calendario Semanal' : '📅 Weekly Roadmap'}</option>
              <option value="#biomarkers-safety">{lang === 'es' ? '🔬 Biomarcadores' : '🔬 Clinical Biomarkers'}</option>
              <option value="#safety-governance">{lang === 'es' ? '🛡️ Seguridad & Exclusiones' : '🛡️ Safety & Exclusions'}</option>
            </select>
          </div>

          <div className="proto-quick-nav-pills">
            {[
              { label: lang === 'es' ? '🧬 Compuestos' : '🧬 Compounds', href: '#included-compounds' },
              { label: lang === 'es' ? '📊 Timeline' : '📊 Timeline', href: '#pathway-timeline' },
              { label: lang === 'es' ? '💉 Reconstitución' : '💉 Reconstitution', href: '#reconstitution-console' },
              { label: lang === 'es' ? '📦 Suministros' : '📦 Supplies', href: '#cycle-supplies' },
              { label: lang === 'es' ? '📅 Calendario' : '📅 Roadmap', href: '#weekly-calendar' },
              { label: lang === 'es' ? '🔬 Biomarcadores' : '🔬 Biomarkers', href: '#biomarkers-safety' },
              { label: lang === 'es' ? '🛡️ Seguridad' : '🛡️ Safety', href: '#safety-governance' },
            ].map((nav, i) => (
              <a
                key={i}
                href={nav.href}
                className="proto-quick-nav-pill"
              >
                {nav.label}
              </a>
            ))}
          </div>
        </nav>

        {/* ── Core Pathway & Sections ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Section 1: Included Compounds */}
          <section id="included-compounds" className="pds-card proto-section-card" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #003666', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 16px -4px rgba(0, 54, 102, 0.07)' }}>
            <div className="proto-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FlaskConical size={18} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    {lang === 'es' ? 'Péptidos & Compuestos Activos Incluidos' : 'Included Therapeutic Compounds'}
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                    {lang === 'es' ? 'Formulaciones activas verificadas bajo estándares analíticos de Atlas Services' : 'Active API formulations verified under Atlas Services analytical standards'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '3px 10px', borderRadius: '9999px' }}>
                {items.length} {lang === 'es' ? 'Compuestos Activos' : 'Active Agents'}
              </span>
            </div>

            <div className="proto-compounds-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
              {items.map((item, idx) => {
                const itemSlug = item.slug || item.productId || item.productSlug || (item.id && !item.id.startsWith('item-') ? item.id : null);
                const itemName = item.product_name || item.name || item.title || 'Compound';
                const itemDosage = item.dosage || item.dose || (item.quantity ? `${item.quantity} ${item.unit || (lang === 'es' ? 'Viales' : 'Vials')}` : null);
                return (
                  <div key={idx} className="proto-compound-card" style={{
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
                      <div className="proto-compound-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 800 }}>
                          {itemName}
                        </strong>
                        {itemDosage && (
                          <span className="proto-compound-dosage-badge" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '6px' }}>
                            {itemDosage}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {item.format || (lang === 'es' ? 'Polvo Liofilizado' : 'Lyophilized Powder')}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                          • {item.route || (lang === 'es' ? 'Subcutánea (SubQ)' : 'Subcutaneous (SubQ)')}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                        {item.timing || item.schedule || item.instructions || (lang === 'es' ? 'Administrar según el cronograma de titulación por fases.' : 'Administer according to phased titration schedule.')}
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
                        <span>{lang === 'es' ? 'Ver Ficha Técnica del Péptido' : 'View Technical Monograph'}</span>
                        <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Phased Timeline Gantt */}
          <section id="pathway-timeline" className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {t.sec2Title}
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                  {t.sec2Subtitle}
                </div>
              </div>
            </div>

            <ClinicalGanttTimeline protocol={protocol} />
          </section>

          {/* Section 3: Interactive Reconstitution & Syringe Console */}
          <section id="reconstitution-console" className="pds-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Syringe size={18} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    {lang === 'es' ? 'Consola Interactiva de Reconstitución & Calibración de Jeringa' : 'Interactive Reconstitution & Syringe Calibration Console'}
                  </h2>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                    {lang === 'es' ? 'Fórmula de dilución de alta precisión y guía de graduación en jeringa U-100 para exactitud clínica' : 'High-precision dilution formula and U-100 syringe graduation guide for clinical accuracy'}
                  </div>
                </div>
              </div>

              {/* Compound Selector Switcher */}
              {reconData.length > 1 && (
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
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {/* Dilution Specifications */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
                  {lang === 'es' ? 'Arquitectura de Dilución' : 'Dilution Architecture'} • {currentRecon.name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{lang === 'es' ? 'Contenido Activo de Vial' : 'Vial Active API'}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{currentRecon.strength}</div>
                  </div>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{lang === 'es' ? 'Volumen de Diluyente' : 'Diluent Volume'}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>{currentRecon.solvent}</div>
                  </div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.70rem', color: '#1e40af', fontWeight: 700 }}>{lang === 'es' ? 'Concentración Resultante' : 'Resulting Concentration'}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e3a8a' }}>{currentRecon.concentration}</div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                  <strong>{lang === 'es' ? 'Almacenamiento:' : 'Storage:'}</strong> {currentRecon.storage}
                </div>
              </div>

              {/* Syringe Graduation Scale */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
                  {lang === 'es' ? 'Unidades en Jeringa U-100 por Fase' : 'Phase-by-Phase Draw Units (U-100 Syringe)'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {currentRecon.dosingScale.map((ds, idx) => (
                    <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{ds.phase}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{lang === 'es' ? 'Dosis Objetivo:' : 'Target Dose:'} {ds.dose}</div>
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
                  ✓ {lang === 'es' ? 'Calibrado para jeringas estándar U-100 de 0.3mL, 0.5mL o 1.0mL (100 unidades = 1.0 mL).' : 'Calibrated for 0.3mL, 0.5mL, or 1.0mL U-100 standard insulin syringes (100 units = 1.0 mL).'}
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Cycle Dispensing & Logistics Blueprint (No Pricing Mention) */}
          <section id="cycle-supplies" className="pds-card" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #7c3aed', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 16px -4px rgba(124, 58, 237, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#faf5ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {t.sec4Title}
                  </h2>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                    {lang === 'es' ? `Requerimientos de formulaciones activas para el ciclo completo de ${displayDuration}` : `Active API vial requirements for full ${displayDuration}`}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '2px 8px', borderRadius: '9999px' }}>
                {lang === 'es' ? 'Asignación de Tratamiento Completo' : 'Full Treatment Allocation'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {/* Peptide Supply Breakdown */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Box size={14} color="#0284c7" />
                  <span>{lang === 'es' ? 'Requerimientos de Péptidos Activos' : 'Active Peptide Requirements'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {supplySummary.compounds.map((c, i) => (
                    <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.90rem' }}>{c.name} ({c.vialStrength})</div>
                        <div style={{ fontSize: '0.70rem', color: '#64748b' }}>{lang === 'es' ? 'Cadencia:' : 'Cadence:'} {c.cadence}</div>
                        <div style={{ fontSize: '0.70rem', color: '#0d9488', fontWeight: 600, marginTop: '2px' }}>{c.totalInjections} {lang === 'es' ? 'Microinyecciones' : 'Micro-Dose Injections'}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7' }}>{c.vials} {lang === 'es' ? 'Viales' : 'Vials'}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>{displayDuration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sterile Ancillary Consumables */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Droplets size={14} color="#0d9488" />
                  <span>{lang === 'es' ? 'Consumibles Estériles de Administración' : 'Sterile Administration Consumables'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{lang === 'es' ? 'Agua Bacteriostática (BAC)' : 'Bacteriostatic Water (BAC)'}</div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>{lang === 'es' ? 'Solvente preservado USP (2.0 mL por vial)' : 'USP Preserved Solvent (2.0 mL per vial)'}</div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#0d9488', fontSize: '0.95rem' }}>{supplySummary.bacVials}x 10 mL</span>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{lang === 'es' ? 'Jeringas Estériles U-100' : 'Sterile U-100 Insulin Syringes'}</div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>31G 8mm Ultra-Fine ({lang === 'es' ? 'Uso único' : 'Single Use'})</div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.95rem' }}>{supplySummary.syringes} {lang === 'es' ? 'Jeringas' : 'Syringes'}</span>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{lang === 'es' ? 'Toallitas Antisépticas' : 'Antiseptic Prep Pads'}</div>
                      <div style={{ fontSize: '0.70rem', color: '#64748b' }}>70% Isopropyl Alcohol Swabs</div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#64748b', fontSize: '0.95rem' }}>{supplySummary.alcoholSwabs} {lang === 'es' ? 'Unidades' : 'Swabs'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.70rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '0.65rem' }}>
              {lang === 'es' 
                ? 'ℹ️ Nota: Los suministros auxiliares están calculados automáticamente en base a eventos de administración semanales y límites de estabilidad acuosa de 28 días.'
                : 'ℹ️ Note: Auxiliary supplies are automatically calculated based on exact weekly administration events and 28-day aqueous stability limits.'}
            </div>
          </section>

          {/* Section 5: Weekly Administration Roadmap */}
          <section id="weekly-calendar" className="pds-card" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #ea580c', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 16px -4px rgba(234, 88, 12, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarDays size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'es' ? 'Calendario Semanal de Administración' : 'Weekly Administration Roadmap'}
                </h2>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                  {lang === 'es' ? 'Cadencia estandarizada de administración en ciclo de 7 días' : 'Standardized 7-day administration cadence'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.75rem' }}>
              {weeklySchedule.map((ws, idx) => (
                <div key={idx} style={{
                  background: ws.rest ? '#f8fafc' : '#ffffff',
                  border: ws.rest ? '1px dashed #cbd5e1' : `1.5px solid ${ws.badgeColor}33`,
                  borderRadius: '10px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '120px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      {ws.day}
                    </div>
                    <div style={{ fontWeight: 800, color: ws.rest ? '#64748b' : ws.badgeColor, fontSize: '0.85rem', marginTop: '3px' }}>
                      {ws.compound}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                      {ws.dose}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '6px' }}>
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

          {/* Section 6: Laboratory Safety Biomarkers */}
          <section id="biomarkers-safety" className="pds-card" style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderTop: '3px solid #0284c7', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 16px -4px rgba(2, 132, 199, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Thermometer size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {t.sec3Title}
                </h2>
                <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                  {t.sec3Subtitle}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
              {biomarkers.map((b, idx) => (
                <div key={idx} style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '0.95rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    {b.phase || `Checkpoint ${idx + 1}`}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    {b.tests}
                  </div>
                  {b.notes && (
                    <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4, marginTop: '2px' }}>
                      {b.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section 7: Safety & Clinical Exclusions */}
          <section id="safety-governance" className="pds-card" style={{ background: '#ffffff', border: '1px solid #fecaca', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={18} />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#991b1b' }}>
                  {t.sec6Title}
                </h2>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 700 }}>
                {lang === 'es' ? 'Supervisión Médica Obligatoria Previa a la Administración' : 'Physician Consultation Required Prior to Administration'}
              </span>
            </div>

            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.5 }}>
              {protocol?.safetyGuidelines || protocol?.contraindications_text || t.contraindicationsDesc}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                lang === 'es' ? 'Hipersensibilidad conocida a los principios activos' : 'Known hypersensitivity to active peptides',
                lang === 'es' ? 'Neoplasias endocrinas activas o sospecha de MTC/MEN 2' : 'Active endocrine neoplasms or suspected MTC/MEN 2',
                lang === 'es' ? 'Insuficiencia renal o hepática severa no controlada' : 'Severe unmanaged renal or hepatic impairment',
                lang === 'es' ? 'Embarazo, lactancia o plan de embarazo en curso' : 'Pregnancy, lactation, or planned pregnancy',
                lang === 'es' ? 'Antecedentes de pancreatitis aguda o crónica' : 'History of acute or chronic pancreatitis'
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
        </div>

        {/* ── Modal QR Code Dialog ── */}
        {isQrModalOpen && (
          <div className="gcp-qr-modal-backdrop" onClick={() => setIsQrModalOpen(false)}>
            <div className="gcp-qr-modal-card" onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <div style={{ fontSize: "0.80rem", fontWeight: 800, color: "#0f172a" }}>
                  {t.verifiedProtocol}
                </div>
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(false)}
                  style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b", padding: "0 4px" }}
                >
                  ✕
                </button>
              </div>
              <QRCodeSVG value={publicUrl} size={180} level="M" />
              <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                {displayName}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                ID: {protocolCode} • {t.clinicalRegistryBadge}
              </div>
              <button
                type="button"
                onClick={handleCopyUrl}
                style={{
                  width: "100%",
                  background: "#0d9488",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.65rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? t.linkCopied : t.copyLink}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Single Public Atlas AI Research Copilot Floating Trigger ── */}
      <PublicAtlasAIDrawer
        contextType="protocol"
        contextAnchor={{
          name: displayName,
          slug: protocol?.slug || protocol?.protocol_slug || slug,
          code: protocolCode,
          duration: displayDuration,
          category: category,
          targetSystem: protocol?.therapeutic_category || 'Regenerative Pathway',
          description: displayDescription,
          phasesCount: phases.length,
          phases: phases.map(p => ({
            name: p.name || p.phase_name || `Phase ${p.phase || 1}`,
            durationWeeks: p.duration_weeks || p.durationWeeks || 4,
            description: p.description || p.clinical_intent,
            administrationSchedule: p.administrationSchedule || p.schedule,
          })),
          includedCompounds: items.map(i => i.name || i.title).join(', '),
          totalVials: `${supplySummary.totalVials} Vials (${vialBreakdownText})`,
          totalInjections: `${supplySummary.totalInjections} Micro-doses`
        }}
        storageKey={`protocol_${protocol?.slug || slug}`}
        onOpenRegisterModal={() => {
          window.open('/auth/login?register=true', '_blank');
        }}
      />
    </div>
  );
}
