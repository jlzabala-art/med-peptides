"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import ClinicalGanttTimeline from '../../../components/protocol/ClinicalGanttTimeline';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';
import PublicStickyActionBar from '@/components/shared/PublicStickyActionBar';
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
  Calendar, CalendarDays, Zap, Box, RotateCcw, Info, QrCode, BarChart3,
  Moon, ShieldAlert, Calculator, Printer
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
import ProtocolClinicalOutcomesCard from '@/components/protocol/ProtocolClinicalOutcomesCard';
import ProtocolPersonalizationEngine from '@/components/protocol/ProtocolPersonalizationEngine';
import ProtocolClinicalCompanionCard from '@/components/protocol/ProtocolClinicalCompanionCard';
import ProtocolAnatomicalTargetingCard from '@/components/protocol/ProtocolAnatomicalTargetingCard';
import ProtocolIncretinSafetyCard from '@/components/protocol/ProtocolIncretinSafetyCard';
import ProtocolSomatotropicAxisCard from '@/components/protocol/ProtocolSomatotropicAxisCard';
import ProtocolImmuneModulationCard from '@/components/protocol/ProtocolImmuneModulationCard';
import LongevityEpigeneticCalculator from '@/components/protocol/LongevityEpigeneticCalculator';
import ImmuneResilienceCalculator from '@/components/protocol/ImmuneResilienceCalculator';
import RecoveryLoadCalculator from '@/components/protocol/RecoveryLoadCalculator';
import PublicDatasheetTableOfContents from '@/components/product/PublicDatasheetTableOfContents';
import { PUBLIC_APP_VERSION, getPublicVersionInfo } from '../../../config/publicVersionConfig';
import { generateProtocolGuidePdf } from '../../../services/protocolGuideExportService';

// ── Extracted Modular Subcomponents & Diagnostic Helpers ──
import { 
  extractBiomarkerCalibrationFromUrl, 
  computeCalibrationDisplay 
} from '../../../utils/biomarkerCalibrationHelper';
import BiomarkerCalibrationBanner from '@/components/protocol/BiomarkerCalibrationBanner';
import ProtocolCompoundsSection from '@/components/protocol/ProtocolCompoundsSection';
import ProtocolReconstitutionConsole from '@/components/protocol/ProtocolReconstitutionConsole';
import ProtocolSupplyLogisticsCard from '@/components/protocol/ProtocolSupplyLogisticsCard';
import ProtocolWeeklyRoadmapCard from '@/components/protocol/ProtocolWeeklyRoadmapCard';
import ProtocolBiomarkersSafetyCard from '@/components/protocol/ProtocolBiomarkersSafetyCard';
import ProtocolSafetyExclusionsCard from '@/components/protocol/ProtocolSafetyExclusionsCard';
import ProtocolQrModal from '@/components/protocol/ProtocolQrModal';
import ProtocolCosmeticsAdjunctsCard from '@/components/protocol/ProtocolCosmeticsAdjunctsCard';

export default function PublicProtocolPage({ protocol, slug, baseUrl, similarProtocols = [] }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && SUPPORTED_LANGUAGES.some(l => l.code === urlLang)) return urlLang;
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
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [activeReconTab, setActiveReconTab] = useState(0);
  const [activeRoadmapPhase, setActiveRoadmapPhase] = useState(0);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState({});
  const requestedLangs = useRef(new Set());
  const [, startTransition] = useTransition();

  // ── Biomarker Calibration State (Precision Diagnostic Integration) ──
  const [biomarkerCalibration, setBiomarkerCalibration] = useState(() => {
    return extractBiomarkerCalibrationFromUrl(slug, protocol?.category);
  });

  const handleClearCalibration = () => {
    setBiomarkerCalibration(null);
    if (typeof window !== 'undefined' && window.history) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    toast.success(lang === 'es' ? 'Vista restablecida al protocolo general' : 'Reset to general protocol view');
  };

  const calibrationDisplay = useMemo(() => {
    return computeCalibrationDisplay(biomarkerCalibration, lang);
  }, [biomarkerCalibration, lang]);

  const publicUrl = `${baseUrl}/proto/${slug}`;
  const t = getProtocolTranslations(lang);

  const protocolCode = protocol?.protocol_id || protocol?.shortCode || protocol?.id || (typeof slug === 'string' ? slug.substring(0, 12).toUpperCase() : 'WMT-001');
  const baseName = protocol?.name || protocol?.title || 'Clinical Protocol Blueprint';
  const category = protocol?.category || protocol?.goal || protocol?.therapeutic_category || 'Regenerative Recovery';
  const rawDuration = protocol?.durationWeeks ? `${protocol.durationWeeks} ${t.weeksLabel || 'Weeks'}` : (protocol?.duration || `12 ${t.weeksLabel || 'Weeks'}`);
  const baseDescription = protocol?.description || protocol?.summary || protocol?.overview_summary || protocol?.clinicalRationale || '';

  const items = useMemo(() => {
    if (Array.isArray(protocol?.items) && protocol.items.length > 0) return protocol.items;
    if (Array.isArray(protocol?.bom) && protocol.bom.length > 0) return protocol.bom;
    if (Array.isArray(protocol?.products) && protocol.products.length > 0) return protocol.products;
    if (Array.isArray(protocol?.peptides) && protocol.peptides.length > 0) return protocol.peptides;
    if (Array.isArray(protocol?.compounds) && protocol.compounds.length > 0) return protocol.compounds;

    // Dynamically derive distinct compounds from phases
    if (Array.isArray(protocol?.phases) && protocol.phases.length > 0) {
      const distinct = new Map();
      protocol.phases.forEach((ph, pIdx) => {
        const rawDrugs = [...(ph.compounds || []), ...(ph.items || []), ...(ph.drugs_used || [])];
        rawDrugs.forEach(d => {
          const rawSlug = d.product_slug || d.slug || (d.productId ? String(d.productId).toLowerCase().replace(/-vial.*$/, '') : null);
          const rawName = d.name || d.product_name || d.product_slug || d.productId || '';
          if (!rawName && !rawSlug) return;
          const bm = matchClinicalBenchmark(rawName || rawSlug);
          const cleanName = bm?.canonicalName || rawName;
          const key = (rawSlug || cleanName).toLowerCase().replace(/[^a-z0-9]/g, '');
          if (key && !distinct.has(key)) {
            distinct.set(key, {
              ...d,
              id: key,
              name: cleanName,
              slug: rawSlug || key,
              format: d.format || (lang === 'es' ? 'Vial Liofilizado Estéril (Polvo)' : 'Lyophilized Sterile API'),
              route: d.route || 'Subcutaneous (SubQ)',
              dosage: d.selected_strength || (bm ? `${bm.defaultVialMg} mg Vial` : null),
              timing: d.dosing_frequency && !d.weekly_dose?.includes('Consult protocol')
                ? `${d.dosing_frequency.replace('_', ' ')} • ${d.weekly_dose}`
                : (bm?.cadence || (lang === 'es' ? 'Titulación por fases' : 'Phased titration')),
              phaseCoverage: `Phase ${pIdx + 1}`
            });
          }
        });
      });
      if (distinct.size > 0) return Array.from(distinct.values());
    }
    return [];
  }, [protocol, lang]);
  const phases = protocol?.phases || [];

  // ── Version & Update Date System (Homogeneous GCP Standard) ──
  const versionInfo = useMemo(() => {
    const rawUpdated = protocol?.updatedAt || protocol?._updatedAt;
    let d = new Date();
    if (rawUpdated) {
      if (typeof rawUpdated.toDate === 'function') d = rawUpdated.toDate();
      else {
        const parsed = new Date(rawUpdated);
        if (!isNaN(parsed.getTime())) d = parsed;
      }
    }
    const updatedAtDate = d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return getPublicVersionInfo(protocol?.version, updatedAtDate, lang);
  }, [protocol, lang]);

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

  const handleCopyClinicalBlueprint = async () => {
    try {
      const activeItemsList = items.map((it, idx) => 
        `  ${idx + 1}. ${it.name || it.product_slug} | ${it.format || 'Lyophilized Sterile API'} | Route: ${it.route || 'SubQ'} | Cadence: ${it.timing || 'Phased'}`
      ).join('\n');

      const phasesList = phases.map((ph, idx) => 
        `  Phase ${idx + 1} (${ph.duration_weeks || ph.durationWeeks || 4} wks): ${ph.name || ph.phase_name || 'Active Phase'}\n    Clinical Intent: ${ph.description || ph.clinical_intent || 'Titration & cellular optimization'}`
      ).join('\n');

      const biomarkersList = biomarkers.map((bm, idx) => 
        `  • ${bm.phase || `Checkpoint ${idx + 1}`}: ${bm.tests}`
      ).join('\n');

      const text = [
        `============================================================`,
        `CLINICAL PROTOCOL SPECIFICATION & BLUEPRINT`,
        `============================================================`,
        `Protocol ID: ${protocolCode}`,
        `Title: ${displayName}`,
        `Therapeutic Category: ${category}`,
        `Duration: ${displayDuration} (${phases.length || 3} Treatment Phases)`,
        `Specification Rev: Rev ${versionInfo.version} (${versionInfo.updatedAtDate})`,
        `Verification Standards: Atlas Services Clinical Standards (CE-IVDR Grade A)`,
        `Canonical URL: ${publicUrl}`,
        ``,
        `[1] CLINICAL RATIONALE & MECHANISM`,
        `${displayDescription || 'Phased peptide therapy for cellular repair, endocrine optimization and tissue regeneration.'}`,
        ``,
        `[2] ACTIVE FORMULATIONS & COMPOUND BLUEPRINT (BOM)`,
        activeItemsList || '  (Consult clinical documentation for proprietary formulation breakdown)',
        ``,
        `[3] SUPPLY & LOGISTICS ALLOCATION`,
        `  • Total Sterile Vials: ${supplySummary.totalVials}`,
        `  • Scheduled Injections: ${supplySummary.totalInjections} Micro-doses`,
        `  • Reconstitution Solvent: ${supplySummary.compounds.length * 2.0} mL Bacteriostatic 0.9% Benzyl Alcohol Water`,
        `  • Cold Chain Stability: 28 Days refrigerated (2°C – 8°C)`,
        ``,
        `[4] TITRATION & DOSING TIMELINE`,
        phasesList || '  Consult phased timeline in the verified clinical engine',
        ``,
        `[5] SEROLOGICAL SURVEILLANCE & BIOMARKER CHECKPOINTS`,
        biomarkersList || '  Routine clinical baseline and surveillance panels',
        `============================================================`,
        `Atlas Clinical Research & Compounding Platform • Medical Professional Reference Only`
      ].join('\n');

      await navigator.clipboard.writeText(text);
      setCopiedBlueprint(true);
      triggerHaptic('success');
      toast.success(lang === 'es' ? 'Blueprint clínico copiado al portapapeles ✓' : 'Clinical blueprint copied to clipboard ✓');
      setTimeout(() => setCopiedBlueprint(false), 2500);
    } catch {
      toast.error('Could not copy clinical blueprint');
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

  const handleCopyLabRequisition = () => {
    try {
      const text = biomarkers.map((b, i) => 
        `[${b.phase || `Checkpoint ${i + 1}`}]\nRequired Tests: ${b.tests}\nClinical Rationale: ${b.notes || 'Routine clinical monitoring'}\n`
      ).join('\n');
      navigator.clipboard.writeText(
        `CLINICAL LABORATORY REQUISITION CHECKLIST\nProtocol: ${displayName}\nReference Code: ${protocol?.code || 'PR-001'}\n\n${text}`
      );
      triggerHaptic('success');
      toast.success(lang === 'es' ? 'Orden de analítica copiada al portapapeles ✓' : 'Lab checklist copied to clipboard ✓');
    } catch {
      toast.error('Could not copy lab checklist');
    }
  };

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
    return generateDynamicWeeklySchedule(protocol, activeRoadmapPhase);
  }, [protocol, activeRoadmapPhase]);

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
    return `${supplySummary.totalVials} Vials`;
  }, [supplySummary]);

  // Check if protocol is specifically Tirzepatide (single-agent metabolic titration)
  const isTirzepatideProtocol = useMemo(() => {
    const s = String(slug || protocol?.slug || protocol?.id || '').toLowerCase();
    const title = String(protocol?.protocol_title || protocol?.title || '').toLowerCase();
    const compounds = (protocol?.items || []).map(i => String(i.name || i.title || '').toLowerCase()).join(' ');
    return (
      s.includes('tirzepatide') ||
      title.includes('tirzepatide') ||
      compounds.includes('tirzepatide') ||
      s === 'wm_001' ||
      s.includes('structured-weight-management') ||
      s.includes('glp-1-gip') ||
      protocol?.has_personalization_calculator === true
    ) && !s.includes('retatrutide');
  }, [slug, protocol]);

  // Check if protocol is a Longevity / NAD+ protocol
  const isLongevityProtocol = useMemo(() => {
    const s = String(slug || protocol?.slug || protocol?.id || '').toLowerCase();
    const title = String(protocol?.protocol_title || protocol?.title || '').toLowerCase();
    return (
      s.includes('lon_') ||
      s.includes('longevity') ||
      title.includes('longevity') ||
      s.includes('nad') ||
      s.includes('epigenetic') ||
      s.includes('epithalon')
    );
  }, [slug, protocol]);

  // Check if protocol is an Immune / Thymosin protocol
  const isImmuneProtocol = useMemo(() => {
    const s = String(slug || protocol?.slug || protocol?.id || '').toLowerCase();
    const title = String(protocol?.protocol_title || protocol?.title || '').toLowerCase();
    const compounds = (protocol?.items || []).map(i => String(i.name || i.title || '').toLowerCase()).join(' ');
    return (
      s.includes('immune') ||
      title.includes('immune') ||
      compounds.includes('thymosin alpha') ||
      s.includes('ta-1') ||
      s.includes('zadaxin')
    );
  }, [slug, protocol]);

  // Check if protocol is a Recovery (BPC-157 / TB-500) protocol
  const isRecoveryProtocol = useMemo(() => {
    const s = String(slug || protocol?.slug || protocol?.id || '').toLowerCase();
    const title = String(protocol?.protocol_title || protocol?.title || '').toLowerCase();
    const compounds = (protocol?.items || []).map(i => String(i.name || i.title || '').toLowerCase()).join(' ');
    return (
      s.includes('rec_') ||
      s.includes('recovery') ||
      title.includes('recovery') ||
      (compounds.includes('bpc-157') && (compounds.includes('tb-500') || s.includes('rec')))
    ) && !isTirzepatideProtocol && !isImmuneProtocol;
  }, [slug, protocol, isTirzepatideProtocol, isImmuneProtocol]);

  // ── Protocol Sections for Sticky Sidebar Table of Contents & Mobile QuickNav ──
  const tocSections = useMemo(() => {
    const isEs = lang === 'es';
    return [
      ...(protocol?.clinical_outcomes?.has_objective_data ? [
        { 
          id: 'clinical-outcomes', 
          label: isEs ? 'Evidencia y Endpoints' : 'Clinical Evidence & Trials', 
          href: '#clinical-outcomes',
          icon: BarChart3 
        }
      ] : []),
      ...((protocol?.companion_diagnostic || protocol?.methylation_support || (protocol?.administration_modalities && protocol.administration_modalities.length > 0)) ? [
        { 
          id: 'protocol-clinical-companion', 
          label: isEs ? 'Farmacocinética & Diagnóstico' : 'Pharmacokinetics & Diagnostics', 
          href: '#protocol-clinical-companion',
          icon: Activity 
        }
      ] : []),
      ...((protocol?.anatomical_targeting || (protocol?.mechanotherapy_phases && protocol.mechanotherapy_phases.length > 0)) ? [
        { 
          id: 'anatomical-targeting', 
          label: isEs ? 'Técnica Anatómica' : 'Anatomical Targeting', 
          href: '#anatomical-targeting',
          icon: Activity 
        }
      ] : []),
      ...((protocol?.gi_tolerance_algorithm || protocol?.lean_mass_preservation_target) ? [
        { 
          id: 'incretin-safety', 
          label: isEs ? 'Seguridad Incretinas & DEXA' : 'Incretin Safety & DEXA Guard', 
          href: '#incretin-safety',
          icon: ShieldCheck 
        }
      ] : []),
      ...(protocol?.somatotropic_axis_parameters ? [
        { 
          id: 'somatotropic-axis', 
          label: isEs ? 'Eje GH / Somatotropo' : 'Somatotropic Axis', 
          href: '#somatotropic-axis',
          icon: Moon 
        }
      ] : []),
      ...(protocol?.immune_modulation_matrix ? [
        { 
          id: 'immune-modulation', 
          label: isEs ? 'Modulación Inmune' : 'Immune Modulation Matrix', 
          href: '#immune-modulation',
          icon: ShieldAlert 
        }
      ] : []),
      { 
        id: 'included-compounds', 
        label: isEs ? 'Compuestos Activos' : 'Included Compounds', 
        href: '#included-compounds',
        icon: FlaskConical 
      },
      ...((protocol?.topical_adjuncts?.length > 0 || (protocol?.goal && protocol.goal.toLowerCase().includes('hair'))) ? [
        { 
          id: 'cosmeceutical-adjuncts', 
          label: isEs ? 'Coadyuvantes Tópicos' : 'Cosmeceutical Adjuncts', 
          href: '#cosmeceutical-adjuncts',
          icon: Sparkles 
        }
      ] : []),
      { 
        id: 'pathway-timeline', 
        label: isTirzepatideProtocol 
          ? (isEs ? 'Personalización & Cronograma' : 'Titration Engine & Timeline')
          : isLongevityProtocol
          ? (isEs ? 'Motor NAD+ & Cronograma' : 'NAD+ Engine & Timeline')
          : isImmuneProtocol
          ? (isEs ? 'Dosificación Inmune & Cronograma' : 'Immune Dosing Engine & Timeline')
          : isRecoveryProtocol
          ? (isEs ? 'Carga Recuperación & Cronograma' : 'Recovery Load Engine & Timeline')
          : (isEs ? 'Cronograma Clínico' : 'Clinical Pathway Timeline'), 
        href: '#pathway-timeline',
        icon: (isTirzepatideProtocol || isLongevityProtocol || isImmuneProtocol || isRecoveryProtocol) ? Calculator : CalendarDays 
      },
      { 
        id: 'reconstitution-console', 
        label: isEs ? 'Consola de Reconstitución' : 'Reconstitution Console', 
        href: '#reconstitution-console',
        icon: Droplets 
      },
      { 
        id: 'cycle-supplies', 
        label: isEs ? 'Suministros del Ciclo' : 'Cycle Supplies & Kit', 
        href: '#cycle-supplies',
        icon: Package 
      },
      { 
        id: 'weekly-calendar', 
        label: isEs ? 'Calendario Semanal' : 'Weekly Administration Schedule', 
        href: '#weekly-calendar',
        icon: Calendar 
      },
      { 
        id: 'biomarkers-safety', 
        label: isEs ? 'Biomarcadores de Control' : 'Biomarkers & Surveillance', 
        href: '#biomarkers-safety',
        icon: Activity 
      },
      { 
        id: 'safety-governance', 
        label: isEs ? 'Gobernanza y Seguridad' : 'Clinical Safety Governance', 
        href: '#safety-governance',
        icon: ShieldCheck 
      }
    ];
  }, [lang, protocol, isTirzepatideProtocol, isLongevityProtocol, isImmuneProtocol, isRecoveryProtocol]);

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
        hideContactButton={true}
        loginRedirect={`/proto/${encodeURIComponent(slug)}`}
        hideTier2={true}
        breadcrumb={[
          { label: lang === 'es' ? 'Protocolos' : 'Protocols', href: '/proto' },
          { label: displayName }
        ]}
        anchorTabs={[
          { id: 'blueprint', label: lang === 'es' ? 'Plan Clínico' : 'Blueprint', href: '#blueprint' },
          { id: 'titration-phases', label: lang === 'es' ? 'Fases' : 'Phases', href: '#titration-phases', count: phases.length },
          ...(items.length > 0 ? [{
            id: 'included-compounds',
            label: lang === 'es' ? 'Compuestos Activos' : 'Active Compounds',
            href: '#included-compounds',
            count: items.length
          }] : []),
          { id: 'biomarker-panels', label: lang === 'es' ? 'Biomarcadores' : 'Biomarkers', href: '#biomarker-panels' },
          { id: 'administration-schedule', label: lang === 'es' ? 'Pauta 7 Días' : '7-Day Schedule', href: '#administration-schedule' },
        ]}
        callout={{
          message: lang === 'es'
            ? 'Uso Clínico: Especificación técnica y cálculo de dosificación verificada'
            : 'Clinical Use: Technical specification & verified dosage calculation',
          ctaLabel: lang === 'es' ? 'Portal Clínico →' : 'Clinical Portal →',
          ctaHref: `/login?tab=register&role=doctor&redirect=/proto/${encodeURIComponent(slug)}`
        }}
      />

      {/* ── Standardized Clinical Page Shell ── */}
      <PublicPageShell style={{ paddingBottom: '5rem' }}>
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
              <span className="pds-version-tag" title={`Clinical Protocol Specification Rev ${versionInfo.version}`}>
                <span className="pds-version-dot" />
                <span>Rev {versionInfo.version}</span>
              </span>
              <span className="pds-updated-tag" title="Verified clinical specification release date">
                <span>{lang === 'es' ? 'Actualizado:' : 'Updated:'} {versionInfo.updatedAtDate}</span>
              </span>
              <span className="pds-purity-tag">
                <Layers size={13} />
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
          description={
            <>
              {displayDescription && (
                <span style={{ display: 'block', fontSize: '0.94rem', color: '#475569', lineHeight: 1.6, marginBottom: '0.65rem' }}>
                  {displayDescription}
                </span>
              )}

              {/* ── Google Cloud UX Action Buttons Strip ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '0.75rem',
                marginBottom: '0.25rem',
                flexWrap: 'wrap'
              }}>
                <button
                  type="button"
                  onClick={handleCopyClinicalBlueprint}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#1e293b',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                  title={lang === 'es' ? 'Copiar especificación del protocolo clínico' : 'Copy technical protocol specification'}
                >
                  {copiedBlueprint ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                  <span>{copiedBlueprint ? (lang === 'es' ? 'Copiado ✓' : 'Copied ✓') : (lang === 'es' ? 'Copiar Blueprint Clínico' : 'Copy Clinical Blueprint')}</span>
                </button>

                <button
                  type="button"
                  disabled={isPdfGenerating}
                  onClick={async () => {
                    setIsPdfGenerating(true);
                    try {
                      await generateProtocolGuidePdf(protocol, { role: 'public', clinicName: 'Atlas Health' });
                      triggerHaptic('success');
                      toast.success(lang === 'es' ? 'PDF generado y descargado ✓' : 'PDF generated and downloaded ✓');
                    } catch (err) {
                      console.error('PDF generation failed:', err);
                      toast.error(lang === 'es' ? 'Error al generar el PDF' : 'Could not generate PDF');
                    } finally {
                      setIsPdfGenerating(false);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: isPdfGenerating ? '#f1f5f9' : '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: isPdfGenerating ? '#94a3b8' : '#1e293b',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: isPdfGenerating ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease',
                    opacity: isPdfGenerating ? 0.7 : 1
                  }}
                  title={lang === 'es' ? 'Descargar protocolo como PDF' : 'Download protocol as PDF'}
                >
                  <Printer size={13} />
                  <span>
                    {isPdfGenerating
                      ? (lang === 'es' ? 'Generando PDF…' : 'Generating PDF…')
                      : (lang === 'es' ? 'Descargar PDF' : 'Download PDF')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#0d9488',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                  title={lang === 'es' ? 'Ver y ampliar código QR de verificación' : 'View QR verification code'}
                >
                  <QrCode size={13} />
                  <span>{lang === 'es' ? 'Código QR' : 'QR Verification'}</span>
                </button>
              </div>
            </>
          }
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

        {/* ── Google Cloud Console 2-Column Layout (Main Stream + Desktop Sticky Sidebar TOC) ── */}
        <div className="pds-content-with-sidebar">
          <div className="pds-main-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* ── STEP 1: Biomarker-Driven Calibration Banner ──
                 Always first — personalises all downstream sections */}
            <BiomarkerCalibrationBanner
              calibrationDisplay={calibrationDisplay}
              biomarkerCalibration={biomarkerCalibration}
              onCalibrate={(newCal) => {
                setBiomarkerCalibration(newCal);
                toast.success(lang === 'es' ? 'Pauta recalibrada con éxito' : 'Protocol recalibrated successfully');
              }}
              onClearCalibration={handleClearCalibration}
              slug={slug}
              protocolCategory={protocol?.category}
              protocolTitle={protocol?.title || protocol?.name}
              lang={lang}
            />

            {/* ── STEP 2: Personalisation Engines (Calculators) ──
                 Rendered before evidence so the patient's profile is set
                 before they read clinical outcomes */}
            {(isTirzepatideProtocol || isLongevityProtocol || isImmuneProtocol || isRecoveryProtocol) && (
              <div id="personalisation-engine" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollMarginTop: '100px' }}>
                {isTirzepatideProtocol && (
                  <ProtocolPersonalizationEngine protocol={protocol} lang={lang} />
                )}
                {isLongevityProtocol && (
                  <LongevityEpigeneticCalculator lang={lang} />
                )}
                {isImmuneProtocol && !isTirzepatideProtocol && (
                  <ImmuneResilienceCalculator lang={lang} />
                )}
                {isRecoveryProtocol && (
                  <RecoveryLoadCalculator lang={lang} />
                )}
              </div>
            )}

            {/* ── STEP 3: Clinical Evidence & Endpoints ──
                 After calibration — outcomes are now contextualised to the patient */}
            <ProtocolClinicalOutcomesCard protocol={protocol} lang={lang} />

            {/* ── STEP 4: Pharmacokinetics, Companion Diagnostics & Methylation ── */}
            <ProtocolClinicalCompanionCard
              protocol={protocol}
              lang={lang}
              biomarkerCalibration={biomarkerCalibration}
            />

            {/* ── STEP 5: Anatomical Targeting & Mechanotherapy Pathway ── */}
            <ProtocolAnatomicalTargetingCard protocol={protocol} lang={lang} />

            {/* ── STEP 6: Incretin Safety, GI Tolerance Algorithm & DEXA ── */}
            <ProtocolIncretinSafetyCard protocol={protocol} lang={lang} />

            {/* ── STEP 7: Somatotropic Axis Fasting Kinetics & 5-On/2-Off ── */}
            <ProtocolSomatotropicAxisCard protocol={protocol} lang={lang} />

            {/* ── STEP 8: Immune Modulation Matrix & Zadaxin Lineage ── */}
            <ProtocolImmuneModulationCard protocol={protocol} lang={lang} />

            {/* ── STEP 9: Active Compounds / Bill of Materials ── */}
            <ProtocolCompoundsSection items={items} lang={lang} />

            {/* ── STEP 9B: Topical Cosmeceutical Adjuncts (Colway Hair System, etc.) ── */}
            {(protocol?.topical_adjuncts?.length > 0 || (protocol?.goal && protocol.goal.toLowerCase().includes('hair'))) && (
              <ProtocolCosmeticsAdjunctsCard
                products={protocol?.topical_adjuncts}
                protocol={protocol}
                lang={lang}
              />
            )}

            {/* ── STEP 10: Phased Gantt Timeline ── */}
            <div id="pathway-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollMarginTop: '100px' }}>
              <PublicSectionCard
                icon={Layers}
                category={lang === 'es' ? 'CRONOGRAMA DE TITULACIÓN' : 'CLINICAL PATHWAY ENGINE'}
                title={isTirzepatideProtocol
                  ? (lang === 'es' ? 'Cronograma Clínico y Fases de Titulación' : 'Clinical Titration Timeline & Phase Distribution')
                  : t.sec2Title}
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
            </div>

            {/* ── STEP 11: Reconstitution Console ── */}
            <ProtocolReconstitutionConsole
              reconData={reconData}
              activeReconTab={activeReconTab}
              setActiveReconTab={setActiveReconTab}
              currentRecon={currentRecon}
              lang={lang}
            />

            {/* ── STEP 12: Cycle Supply & Logistics Blueprint ── */}
            <ProtocolSupplyLogisticsCard
              supplySummary={supplySummary}
              displayDuration={displayDuration}
              t={t}
              lang={lang}
            />

            {/* ── STEP 13: Weekly Administration Roadmap ── */}
            <ProtocolWeeklyRoadmapCard
              weeklySchedule={weeklySchedule}
              phases={phases}
              activeRoadmapPhase={activeRoadmapPhase}
              setActiveRoadmapPhase={setActiveRoadmapPhase}
              lang={lang}
            />

            {/* ── STEP 14: Biomarker & Laboratory Surveillance ── */}
            <ProtocolBiomarkersSafetyCard
              biomarkers={biomarkers}
              onCopyLabRequisition={handleCopyLabRequisition}
              t={t}
              lang={lang}
            />

            {/* ── STEP 15: Safety Governance & Clinical Exclusions ── */}
            <ProtocolSafetyExclusionsCard
              protocol={protocol}
              t={t}
              lang={lang}
            />

            {/* Standardized Institutional Disclaimer & Versioning Footer */}
            <footer className="pds-disclaimer-footer" style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
              <p className="pds-disclaimer-text" style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 0.75rem 0' }}>
                {lang === 'es'
                  ? 'Aviso Médico Institucional: Este protocolo describe pautas de investigación clínica y formulación magistral bajo supervisión facultativa. Los compuestos descritos requieren prescripción y control analítico previo.'
                  : 'Institutional Medical Disclaimer: This protocol outlines clinical research blueprints and compounding specifications under authorized medical supervision. Described compounds require prescription and preliminary diagnostic evaluation.'}
              </p>
              <div className="pds-footer-metadata" style={{ fontSize: '0.70rem', color: '#94a3b8', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span>
                  Document Ref: PROTO-{slug.toUpperCase()}-2026 • Rev {versionInfo.version} • {lang === 'es' ? 'Actualizado:' : 'Updated:'} {versionInfo.updatedAtDate} • Verified on Atlas Health Clinical Engine • {new Date().getFullYear()} ATLAS HEALTH Clinical Portal
                </span>
              </div>
            </footer>
          </div>

          {/* Persistent Google Cloud Console Table of Contents (Desktop Sticky Sidebar + Mobile Drawer) */}
          <PublicDatasheetTableOfContents 
            sections={tocSections} 
            lang={lang} 
            title={lang === 'es' ? 'Secciones del Protocolo' : 'Protocol Navigation'}
            similarProtocols={similarProtocols}
            currentProtocolSlug={slug}
          />
        </div>

        {/* ── Modal QR Code Dialog ── */}
        <ProtocolQrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          publicUrl={publicUrl}
          displayName={displayName}
          protocolCode={protocolCode}
          t={t}
          copied={copied}
          onCopyUrl={handleCopyUrl}
        />
      </PublicPageShell>

      {/* Unified Persistent Sticky Bottom Action Bar (GCP Standard) */}
      <PublicStickyActionBar
        title={displayName}
        subtitle={`${displayDuration} • ${phases.length || 3} ${lang === 'es' ? 'Fases' : 'Phases'}`}
        badge={lang === 'es' ? 'Protocolo Clínico' : 'Clinical Protocol'}
        badgeType="protocol"
        inquireLabel={lang === 'es' ? 'Consultar Protocolo' : 'Inquire Protocol'}
        onInquire={() => setIsInquiryDrawerOpen(true)}
        showClinicalAI={true}
        showSections={true}
        sectionsCount={tocSections.length}
        onOpenSections={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-datasheet-toc'));
          }
        }}
        lang={lang}
      />

      {/* ── Single Public Atlas AI Research Copilot ── */}
      <PublicAtlasAIDrawer
        hideFloatingTrigger={true}
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
