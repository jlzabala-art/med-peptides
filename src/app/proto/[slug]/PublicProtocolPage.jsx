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
import { Mail, Lock } from 'lucide-react';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicPageShell from '@/components/shared/public/PublicPageShell';
import PublicPageHero from '@/components/shared/public/PublicPageHero';
import PublicSectionCard from '@/components/shared/public/PublicSectionCard';
import PublicKpiGrid from '@/components/shared/public/PublicKpiGrid';
import PublicSegmentedControl from '@/components/shared/public/PublicSegmentedControl';
import PublicLocalQuickNav from '@/components/shared/public/PublicLocalQuickNav';

const DAY_LABELS_ES = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
};

export default function PublicProtocolPage({ protocol, slug, baseUrl }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && SUPPORTED_LANGUAGES.some(l => l.code === urlLang)) return urlLang;
      const stored = localStorage.getItem('atlas_portal_lang') || localStorage.getItem('atlas_catalog_lang');
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) return stored;
    }
    return 'en';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleGlobalLang = (e) => {
        if (e.detail && SUPPORTED_LANGUAGES.some(l => l.code === e.detail)) {
          setLang(e.detail);
        }
      };
      window.addEventListener('atlas_lang_change', handleGlobalLang);
      return () => window.removeEventListener('atlas_lang_change', handleGlobalLang);
    }
  }, []);

  const [copied, setCopied] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
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
  const displayDuration = lang === 'es'
    ? rawDuration.replace(/\bWeeks?\b/i, 'Semanas').replace(/\bDays?\b/i, 'Días').replace(/\bMonths?\b/i, 'Meses')
    : rawDuration;

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
      {/* ── Fixed 2-Tier Sticky Executive Navigation ── */}
      <PublicUnifiedHeader
        track="protocols"
        lang={lang}
        onLangChange={handleLangChange}
        copyUrl={publicUrl}
        inquiryContextType="protocol"
        inquiryEntity={{
          name: displayName,
          slug,
          code: protocol?.sku || protocol?.code || '',
          category: protocol?.goal || 'Clinical Protocols'
        }}
        onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
        loginRedirect={`/proto/${encodeURIComponent(slug)}`}
        breadcrumb={[
          { label: lang === 'es' ? 'Protocolos' : 'Protocols', href: '/proto' },
          { label: displayName }
        ]}
        anchorTabs={[
          { id: 'blueprint', label: lang === 'es' ? 'Plan Clínico' : 'Blueprint', href: '#blueprint' },
          { id: 'titration-phases', label: lang === 'es' ? 'Fases' : 'Phases', href: '#titration-phases', count: phases.length },
          ...(items.length > 0 ? [{
            id: 'included-compounds',
            label: lang === 'es' ? 'Compuestos (/p/)' : 'Compounds (/p/)',
            href: '#included-compounds',
            count: items.length
          }] : []),
          { id: 'biomarker-panels', label: lang === 'es' ? 'Biomarcadores' : 'Biomarkers', href: '#biomarker-panels' },
          { id: 'administration-schedule', label: lang === 'es' ? 'Pauta 7 Días' : '7-Day Schedule', href: '#administration-schedule' },
        ]}
        callout={{
          message: lang === 'es'
            ? 'Médicos y Especialistas: Personaliza dosis y exporta pautas para pacientes'
            : 'Prescribing Physicians: Customize dosages & export patient schedules',
          ctaLabel: lang === 'es' ? 'Pauta Médica →' : 'Provider Access →',
          ctaHref: `/login?tab=register&role=doctor&redirect=/proto/${encodeURIComponent(slug)}`
        }}
      />

      {/* ── Standardized Clinical Page Shell ── */}
      <PublicPageShell>
        {/* Universal Clinical Page Hero */}
        <PublicPageHero
          badges={
            <>
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
            </>
          }
          title={displayName}
          description={displayDescription}
          mobileSecondary={
            <>
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
                  onClick={() => setIsQrModalOpen(true)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#0d9488',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <QrCode size={12} />
                  <span>{lang === 'es' ? 'Ver QR' : 'View QR'}</span>
                </button>
              </div>
            </>
          }
          desktopSecondary={
            <div className="proto-no-print pds-qr-verification-box" style={{ minWidth: '150px' }}>
              <div
                onClick={() => setIsQrModalOpen(true)}
                className="pds-qr-code-wrap"
                title={lang === 'es' ? 'Clic para ampliar o imprimir código QR' : 'Click to enlarge or print QR code'}
              >
                <QRCodeSVG value={publicUrl} size={110} level="M" />
              </div>
              <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                {t.verifiedProtocol}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>
                {t.scanForAccess}
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                style={{
                  marginTop: '0.25rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '3px 8px',
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
                <span>{lang === 'es' ? 'Ampliar QR' : 'Enlarge QR'}</span>
              </button>
            </div>
          }
        />

        {/* ── Standardized 4-KPI Metric Grid ── */}
        <PublicKpiGrid
          items={[
            {
              icon: Clock,
              iconBg: '#eff6ff',
              iconColor: '#0284c7',
              title: t.kpiDurationTitle,
              value: displayDuration,
              subtitle: `${phases.length || 3} ${t.kpiDurationSubtitle}`,
              subColor: '#0284c7'
            },
            {
              icon: FlaskConical,
              iconBg: '#f0fdfa',
              iconColor: '#0d9488',
              title: t.kpiPeptidesTitle,
              value: `${items.length || 1} ${items.length === 1 ? t.kpiFormulation : t.kpiFormulations}`,
              subtitle: items.length > 1 ? t.kpiPeptidesSubtitle : t.kpiPeptidesFallbackSubtitle,
              subColor: '#0d9488'
            },
            {
              icon: Package,
              iconBg: '#faf5ff',
              iconColor: '#7c3aed',
              title: t.kpiVialsTitle,
              value: `${supplySummary.totalVials} ${t.kpiVialsUnit}`,
              subtitle: supplySummary.compounds.length > 1 ? (
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
              ) : vialBreakdownText,
              subColor: '#7c3aed'
            },
            {
              icon: Syringe,
              iconBg: '#fff7ed',
              iconColor: '#c2410c',
              title: t.kpiInjectionsTitle,
              value: `${supplySummary.totalInjections} ${t.kpiInjectionsUnit}`,
              subtitle: t.kpiInjectionsSubtitle,
              subColor: '#c2410c'
            }
          ]}
        />

        {/* ── Standardized Quick Section Jump Navigation ── */}
        <PublicLocalQuickNav
          lang={lang}
          items={[
            { label: lang === 'es' ? 'Compuestos' : 'Compounds', href: '#included-compounds', icon: FlaskConical },
            { label: lang === 'es' ? 'Timeline' : 'Timeline', href: '#pathway-timeline', icon: CalendarDays },
            { label: lang === 'es' ? 'Reconstitución' : 'Reconstitution', href: '#reconstitution-console', icon: Droplets },
            { label: lang === 'es' ? 'Suministros' : 'Supplies', href: '#cycle-supplies', icon: Package },
            { label: lang === 'es' ? 'Calendario' : 'Roadmap', href: '#weekly-calendar', icon: Calendar },
            { label: lang === 'es' ? 'Biomarcadores' : 'Biomarkers', href: '#biomarkers-safety', icon: Activity },
            { label: lang === 'es' ? 'Seguridad' : 'Safety', href: '#safety-governance', icon: ShieldCheck },
          ]}
        />

        {/* ── Core Pathway & Sections ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Section 1: Included Compounds */}
          <PublicSectionCard
            id="included-compounds"
            icon={FlaskConical}
            category={lang === 'es' ? 'FORMULACIONES ACTIVAS' : 'THERAPEUTIC FORMULATIONS'}
            badge={`${items.length} ${lang === 'es' ? 'Compuestos Activos' : 'Active Agents'}`}
            badgeVariant="cyan"
            title={lang === 'es' ? 'Péptidos & Compuestos Activos Incluidos' : 'Included Therapeutic Compounds'}
            rightAction={
              <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 600 }}>
                {lang === 'es' ? 'Estándares Analíticos Atlas' : 'Atlas Analytical Standards'}
              </span>
            }
          >
            <div className="proto-compounds-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
              {items.map((item, idx) => {
                const itemSlug = item.slug || item.productId || item.productSlug || (item.id && !item.id.startsWith('item-') ? item.id : null);
                const itemName = item.product_name || item.name || item.title || 'Compound';
                const itemDosage = item.dosage || item.dose || (item.quantity ? `${item.quantity} ${item.unit || (lang === 'es' ? 'Viales' : 'Vials')}` : null);
                return (
                  <div key={idx} className="proto-compound-card" style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'border-color 0.15s ease'
                  }}>
                    <div>
                      <div className="proto-compound-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 800 }}>
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

                      <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.55 }}>
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
                          gap: '6px',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '0.75rem'
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
          </PublicSectionCard>

          {/* Section 2: Phased Timeline Gantt */}
          <PublicSectionCard
            id="pathway-timeline"
            icon={Layers}
            category={lang === 'es' ? 'CRONOGRAMA DE TITULACIÓN' : 'CLINICAL PATHWAY ENGINE'}
            title={t.sec2Title}
            badge={phases.length ? `${phases.length} ${lang === 'es' ? 'Fases' : 'Phases'}` : null}
            badgeVariant="green"
            rightAction={
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#93c5fd' }}>
                <Activity size={14} />
                <span>{t.sec2Subtitle}</span>
              </div>
            }
          >
            <ClinicalGanttTimeline protocol={protocol} />
          </PublicSectionCard>

          {/* Section 3: Interactive Reconstitution & Syringe Console */}
          <PublicSectionCard
            id="reconstitution-console"
            icon={Syringe}
            category={lang === 'es' ? 'CONSOLA DE RECONSTITUCIÓN' : 'RECONSTITUTION CONSOLE'}
            title={lang === 'es' ? 'Consola Interactiva de Reconstitución & Calibración de Jeringa' : 'Interactive Reconstitution & Syringe Calibration Console'}
            badge={lang === 'es' ? 'Calibrado U-100' : 'U-100 Calibrated'}
            badgeVariant="cyan"
            rightAction={
              reconData.length > 1 ? (
                <PublicSegmentedControl
                  size="sm"
                  items={reconData.map((rd, idx) => ({ id: idx, label: rd.name }))}
                  activeId={activeReconTab}
                  onChange={setActiveReconTab}
                />
              ) : null
            }
          >
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
          </PublicSectionCard>

          {/* Section 4: Cycle Dispensing & Logistics Blueprint (No Pricing Mention) */}
          <PublicSectionCard
            id="cycle-supplies"
            icon={Package}
            category={lang === 'es' ? 'DISPENSARIO DEL CICLO' : 'CYCLE DISPENSARY'}
            title={t.sec4Title}
            badge={`${supplySummary.totalVials} ${t.kpiVialsUnit}`}
            badgeVariant="purple"
            rightAction={
              <span style={{ fontSize: '0.74rem', color: '#c4b5fd', fontWeight: 600 }}>
                {lang === 'es' ? `Asignación Completa · ${displayDuration}` : `Full Cycle · ${displayDuration}`}
              </span>
            }
          >
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
          </PublicSectionCard>

          {/* Section 5: Weekly Administration Roadmap */}
          <PublicSectionCard
            id="weekly-calendar"
            icon={CalendarDays}
            category={lang === 'es' ? 'CRONOGRAMA DE ADMINISTRACIÓN' : 'ADMINISTRATION SCHEDULE'}
            title={lang === 'es' ? 'Calendario Semanal de Administración' : 'Weekly Administration Roadmap'}
            badge={lang === 'es' ? 'Ciclo 7 Días' : '7-Day Regimen'}
            badgeVariant="cyan"
            rightAction={
              <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 600 }}>
                {lang === 'es' ? 'Pauta Estandarizada' : 'Standardized Cadence'}
              </span>
            }
          >
            <div className="proto-roadmap-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
              {weeklySchedule.map((ws, idx) => {
                const isActiveAdmin = !ws.rest;
                const activeBorderColor = ws.badgeColor || '#0284c7';
                const displayDay = lang === 'es' ? (DAY_LABELS_ES[ws.day] || ws.day) : ws.day;
                const displayCompound = (lang === 'es' && ws.compound === 'Receptor Rest & Cellular Assimilation')
                  ? 'Descanso Receptorial y Asimilación Celular'
                  : ws.compound;
                const displayDose = (lang === 'es' && ws.dose === 'No peptide administration scheduled')
                  ? 'Sin administración de péptidos programada'
                  : ws.dose;
                const displayTime = (lang === 'es' && ws.time === 'Clinical Rest Window')
                  ? 'Ventana de Reposo Clínico'
                  : (lang === 'es' && ws.time === 'Morning Administration')
                  ? 'Administración Matutina'
                  : (lang === 'es' && ws.time === 'Evening Administration')
                  ? 'Administración Vespertina'
                  : ws.time;
                const displayRoute = (lang === 'es' && ws.route === 'Physiological Reset')
                  ? 'Reinicio Fisiológico'
                  : ws.route;

                return (
                  <div
                    key={idx}
                    className={`proto-roadmap-row ${isActiveAdmin ? 'is-active' : 'is-rest'}`}
                    style={{
                      width: '100%',
                      background: isActiveAdmin ? '#ffffff' : '#f8fafc',
                      border: isActiveAdmin ? `1px solid ${activeBorderColor}40` : '1px solid #e2e8f0',
                      borderLeft: `4px solid ${isActiveAdmin ? activeBorderColor : '#cbd5e1'}`,
                      borderRadius: '10px',
                      padding: '0.85rem 1.15rem',
                      boxShadow: isActiveAdmin ? '0 2px 8px -2px rgba(2, 132, 199, 0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Col 1: Day Badge */}
                    <div className="proto-roadmap-day-col">
                      <div style={{
                        width: '100%',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        background: isActiveAdmin ? `${activeBorderColor}14` : '#f1f5f9',
                        color: isActiveAdmin ? activeBorderColor : '#475569',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        border: `1px solid ${isActiveAdmin ? `${activeBorderColor}30` : '#e2e8f0'}`,
                        boxSizing: 'border-box'
                      }}>
                        {displayDay}
                      </div>
                    </div>

                    {/* Col 2: Compound & Dose */}
                    <div className="proto-roadmap-info-col" style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        color: isActiveAdmin ? '#0f172a' : '#475569',
                        letterSpacing: '-0.01em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap'
                      }}>
                        <span>{displayCompound}</span>
                        {isActiveAdmin && (
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            background: `${activeBorderColor}18`,
                            color: activeBorderColor,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>
                            {lang === 'es' ? 'Administración' : 'Admin'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: isActiveAdmin ? activeBorderColor : '#64748b', fontWeight: 600 }}>
                        {displayDose}
                      </div>
                    </div>

                    {/* Col 3: Timing / Schedule Note */}
                    <div className="proto-roadmap-time-col" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      <Clock size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                      <span>{displayTime}</span>
                    </div>

                    {/* Col 4: Route & Protocol Mode Tag */}
                    <div className="proto-roadmap-route-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        background: isActiveAdmin ? '#eff6ff' : '#f1f5f9',
                        color: isActiveAdmin ? '#1d4ed8' : '#64748b',
                        border: `1px solid ${isActiveAdmin ? '#bfdbfe' : '#e2e8f0'}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {displayRoute}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </PublicSectionCard>

          {/* Section 6: Laboratory Safety Biomarkers */}
          <PublicSectionCard
            id="biomarkers-safety"
            icon={Thermometer}
            category={lang === 'es' ? 'MONITORIZACIÓN CLÍNICA' : 'CLINICAL MONITORING'}
            title={t.sec3Title}
            badge={lang === 'es' ? 'Supervisión de Laboratorio' : 'Laboratory Surveillance'}
            badgeVariant="green"
            rightAction={
              <span style={{ fontSize: '0.74rem', color: '#93c5fd', fontWeight: 600 }}>
                {t.sec3Subtitle}
              </span>
            }
          >
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
          </PublicSectionCard>

          {/* Section 7: Safety & Clinical Exclusions */}
          <PublicSectionCard
            id="safety-governance"
            icon={ShieldCheck}
            category={lang === 'es' ? 'GOBERNANZA CLÍNICA & EXCLUSIONES' : 'CLINICAL GOVERNANCE & EXCLUSIONS'}
            title={t.sec6Title}
            badge={lang === 'es' ? 'Supervisión Médica Obligatoria' : 'Physician Consultation Required'}
            badgeVariant="green"
            rightAction={
              <span style={{ fontSize: '0.74rem', color: '#fca5a5', fontWeight: 600 }}>
                {lang === 'es' ? 'Supervisión Obligatoria' : 'Physician Oversight'}
              </span>
            }
          >
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
              {protocol?.safetyGuidelines || protocol?.contraindications_text || t.contraindicationsDesc}
            </p>

            {/* Clinical Exclusions Matrix */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.75rem',
              marginTop: '1rem'
            }}>
              {[
                {
                  title: lang === 'es' ? 'Hipersensibilidad a Péptidos' : 'Known Peptide Hypersensitivity',
                  desc: lang === 'es' ? 'Reacción alérgica previa o anafilaxia a principios activos o excipientes.' : 'Prior systemic or localized hypersensitivity to active peptide chains or excipients.'
                },
                {
                  title: lang === 'es' ? 'Neoplasias Endocrinas / MTC / MEN 2' : 'Endocrine Neoplasms / MTC / MEN 2',
                  desc: lang === 'es' ? 'Antecedente personal o familiar de carcinoma medular de tiroides o NEM 2.' : 'Personal or family history of medullary thyroid carcinoma or MEN type 2.'
                },
                {
                  title: lang === 'es' ? 'Insuficiencia Renal o Hepática Severa' : 'Severe Renal or Hepatic Impairment',
                  desc: lang === 'es' ? 'Disfunción orgánica avanzada no compensada sin supervisión especializada.' : 'Uncompensated advanced clearance dysfunction without nephrology supervision.'
                },
                {
                  title: lang === 'es' ? 'Embarazo y Lactancia' : 'Pregnancy & Lactation',
                  desc: lang === 'es' ? 'Contraindicado en gestación, lactancia materna o búsqueda activa de embarazo.' : 'Strictly contraindicated during active gestation, nursing, or conception planning.'
                },
                {
                  title: lang === 'es' ? 'Antecedentes de Pancreatitis' : 'Pancreatitis History',
                  desc: lang === 'es' ? 'Episodios agudos previos o inflamación pancreática crónica activa.' : 'Prior acute pancreatitis episodes or active chronic pancreatic pathology.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fffbfb',
                    border: '1px solid #fee2e2',
                    borderLeft: '4px solid #ef4444',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    boxShadow: '0 1px 2px rgba(239, 68, 68, 0.04)'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <AlertTriangle size={13} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#991b1b', lineHeight: 1.3 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#7f1d1d', marginTop: '3px', lineHeight: 1.45 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </PublicSectionCard>

          {/* Institutional Verification & Clinical Governance Notice */}
          <div className="pds-notice-card" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
            <ShieldCheck size={20} color="#0284c7" style={{ flexShrink: 0 }} />
            <div className="pds-notice-text">
              <strong>{t.standardizedBlueprint}</strong>
              <span>{t.blueprintNotice}</span>
            </div>
          </div>
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
      </PublicPageShell>

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

      {/* Non-Intrusive Institutional Inquiry Drawer */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="protocol"
        initialEntity={{
          name: baseName,
          code: protocolCode,
          slug: slug,
          category: category
        }}
        lang={lang}
      />
    </div>
  );
}
