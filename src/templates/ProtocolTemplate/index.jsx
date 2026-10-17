"use client";

/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useEffect, useState, useCallback, useRef, useMemo, memo, Suspense, lazy } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { usePageMeta } from '../../hooks/usePageMeta';
import { motion, AnimatePresence } from 'framer-motion';
import ProtocolTOC from '../../components/protocol/ProtocolTOC';
import MobileTOCDrawer from '../../components/protocol/MobileTOCDrawer';






























import { getProtocolTemplate, getTemplatesByObjective, getTemplatesByPrefix } from '../../repositories/protocolRepository';
import { trackEvent } from '../../hooks/useAnalytics';
import { generateClinicalProtocol, generatePatientGuide, getCachedProtocolPDF, cacheProtocolPDF, getProtocolFilename } from '../../services/pdfService';
import { toPng } from 'html-to-image';
import { useShop } from '../../context/ShopProvider';
import { useCart } from '../../context/CartProvider';
import { useUIStore } from '../../stores/uiStore';
import { useAuth } from '../../context/AuthContext';
import { generateICS } from '../../utils/calendarHelper';

import dynamic from 'next/dynamic';
import { useDailyDose } from '../../hooks/useDailyDose';
import { useProtocolProducts } from '../../hooks/data/useProtocolProducts';

import ProtocolSupplyEngine from '../../components/protocol/ProtocolSupplyEngine';
import ProtocolHeaderCharts from '../../components/protocol/ProtocolHeaderCharts';
import ProtocolLifespanTracker from '@/components/protocols/ProtocolLifespanTracker';
import RelatedProtocolsSection from '../../components/protocol/RelatedProtocolsSection';
import ProductDetailDrawer from '../../components/protocol/ProductDetailDrawer';
import ProtocolSupplementSection from '../../components/protocol/ProtocolSupplementSection';
import ProtocolTechnicalSection from '../../components/protocol/ProtocolTechnicalSection';
import ProtocolOutcomesSection from '../../components/protocol/ProtocolOutcomesSection';
import MedicalSupervisionBanner from '../../components/shared/MedicalSupervisionBanner';
import ClinicalGanttTimeline from '../../components/protocol/ClinicalGanttTimeline';

// ── Heavy Interactive Components dynamically loaded on demand ───────────────
const InjectionDoseChart = dynamic(() => import('../../components/protocol/InjectionDoseChart'), { ssr: false });
const ReconstitutionVisualGuide = dynamic(() => import('../../components/protocol/ReconstitutionVisualGuide'), { ssr: false });
const PharmacokineticsSimulator = dynamic(() => import('../../components/protocol/PharmacokineticsSimulator'), { ssr: false });

import { normalizeProtocol, frequencyToInjectionsPerWeek } from '../../utils/protocolSchemaAdapter';
import ClinicalAssistant from '../../components/shared/ClinicalAssistant';

// ── Related-card theme (mirrors TrendingProtocols) ────────────────────────────
const RELATED_THEME = {
  'Weight Management / Obesity': { gradient: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)', glow: 'rgba(139,92,246,0.18)', accent: '#a78bfa', Icon: TrendingDown },
  'Recovery / Injury':           { gradient: 'linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)', glow: 'rgba(244,63,94,0.18)',  accent: '#fb7185',  Icon: Activity   },
  'Cognitive Support':           { gradient: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)', glow: 'rgba(14,165,233,0.18)', accent: '#38bdf8',  Icon: Target     },
  'Longevity':                   { gradient: 'linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)', glow: 'rgba(16,185,129,0.18)', accent: '#34d399',  Icon: Activity   },
  'Sleep Support':               { gradient: 'linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)', glow: 'rgba(59,130,246,0.18)', accent: '#93c5fd',  Icon: Clock      },
  'Hormonal Support':            { gradient: 'linear-gradient(135deg,#f97316 0%,#eab308 100%)', glow: 'rgba(249,115,22,0.18)', accent: '#fb923c',  Icon: Zap        },
  'Immune / Inflammation':       { gradient: 'linear-gradient(135deg,#14b8a6 0%,#06b6d4 100%)', glow: 'rgba(20,184,166,0.18)', accent: '#2dd4bf',  Icon: ShieldCheck },
  'Energy / Mitochondrial':      { gradient: 'linear-gradient(135deg,#eab308 0%,#f97316 100%)', glow: 'rgba(234,179,8,0.18)',  accent: '#fde047',  Icon: Zap        },
  'Skin / Anti-Aging':           { gradient: 'linear-gradient(135deg,#f472b6 0%,#ec4899 100%)', glow: 'rgba(244,114,182,0.18)',accent: '#f9a8d4',  Icon: Star       },
};
function getRelatedTheme(category) {
  return RELATED_THEME[category] || {
    gradient: 'linear-gradient(135deg,#003666 0%,#0070c0 100%)',
    glow: 'rgba(0,112,192,0.18)', accent: '#60a5fa', Icon: FlaskConical,
  };
}

// ── Goal → visual config ─────────────────────────────────────────────────────
const GOAL_META = {
  weight_management:  { label: 'Weight Management', gradient: 'linear-gradient(135deg,#10b981,#0d9488)', icon: TrendingDown },
  longevity:          { label: 'Anti-Aging & Longevity', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', icon: Activity },
  recovery:           { label: 'Recovery',           gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: Zap },
  performance:        { label: 'Performance',        gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', icon: Target },
  default:            { label: 'Clinical Protocol',  gradient: 'linear-gradient(135deg,#64748b,#475569)', icon: FlaskConical },
};
function getGoalMeta(goal) {
  return GOAL_META[goal] || GOAL_META.default;
}


// ── Category Protocol Navigator ───────────────────────────────────────────────
/**
 * Compact horizontal navigator that lets users move between sibling protocols
 * in the same category without returning to the listing page.
 * Renders nothing when there is only one protocol in the category.
 */
import CategoryProtocolNavigator from '../../components/protocol/CategoryProtocolNavigator';
import OptionalAccessoriesCard from '../../components/protocol/OptionalAccessoriesCard';
import PhaseAccordion from '../../components/protocol/PhaseAccordion';
import EligibilityBlock from '../../components/protocol/EligibilityBlock';
import SectionAccordion from '../../components/protocol/SectionAccordion';
import ProtocolHeroHeader from '../../components/protocol/ProtocolHeroHeader';
import ProtocolSafetyMonitoring from '../../components/protocol/ProtocolSafetyMonitoring';
import ProtocolCalendarModal from '../../components/protocol/ProtocolCalendarModal';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v) => (v !== undefined && v !== null ? v : '—');

function humanize(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayDuration(protocol) {
  if (protocol.duration_weeks) return `${protocol.duration_weeks} weeks`;
  if (protocol.timeline?.total_duration_weeks)
    return `${protocol.timeline.total_duration_weeks} weeks`;
  const phases = protocol.phases || [];
  if (phases.length) {
    const total = phases.reduce((s, ph) => s + (ph.duration_weeks || 0), 0);
    if (total) return `${total} weeks`;
  }
  return 'Multi-phase';
}

function displayPhases(protocol) {
  if (Array.isArray(protocol.phases) && protocol.phases.length) return protocol.phases;
  return [];
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Collapsible Optional Accessories sidebar card
// Memoized per-phase card — Clinical Luxury "Technical Data Sheet" format

// ── Loading skeleton ──────────────────────────────────────────────────────────
import { ProtocolSkeleton, ProtocolNotFound, IncludedPeptideCard } from "./subComponents";
import { Activity, AlertCircle, AlertTriangle, ArrowLeft, BookOpen, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Download, Droplets, DollarSign, FlaskConical, Layers, Package, ShieldCheck, Briefcase, Star, Syringe, Target, TrendingDown, Users, XCircle, Zap, Calendar, TestTube, CheckCircle2, Sparkles, ShoppingCart } from '@/lib/icons';
import { toast } from 'react-hot-toast';

// ── Main template ─────────────────────────────────────────────────────────────
export default function ProtocolTemplate({
  region,
  isProfessional,
  cart,
  updateCart,
  setRegion,
  allFaqs,
  slug: propSlug,
}) {
  const { setActiveModal } = useUIStore();
  const { isProfessional: authIsPro, isAdmin, isPhysician } = useAuth();
  const isMed = !!(authIsPro || isAdmin || isPhysician || isProfessional);

  const params = useParams();
  const slug = propSlug || params?.slug;
  const router = useRouter();
  const pathname = usePathname();
  const phaseRefs = useRef([]);
  const [scrolled, setScrolled] = useState(false);
  const [stickyTotal, setStickyTotal] = useState(0);
  const [bundleAdded, setBundleAdded] = useState(false);
  const [dosingView, setDosingView] = useState('table'); // 'table' | 'visual'
  const [isExporting, setIsExporting] = useState(false);
  const [pdfDropdownOpen, setPdfDropdownOpen] = useState(false);
  const pdfDropdownRef = useRef(null);
  const [heroPdfDropdownOpen, setHeroPdfDropdownOpen] = useState(false);
  const heroPdfDropdownRef = useRef(null);

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isClinicAIOpen, setIsClinicAIOpen] = useState(false);
  const [calendarStartDate, setCalendarStartDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [calendarTime, setCalendarTime] = useState('09:00');
  const [calendarAllDay, setCalendarAllDay] = useState(true);

  const handleDownloadCalendar = () => {
    if (!protocol) return;
    try {
      const icsData = generateICS(protocol, calendarStartDate, {
        allDay: calendarAllDay,
        timeStr: calendarTime
      });
      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atlas-health-${slug}-schedule.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsCalendarModalOpen(false);
      trackEvent('download_calendar', {
        protocol_slug: slug,
        name: protocol?.name || slug,
        start_date: calendarStartDate,
        all_day: calendarAllDay,
      });
    } catch (e) {
      console.error('[ProtocolTemplate] Calendar generation failed', e);
      toast.error('Could not generate calendar. Please verify the start date is valid.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pdfDropdownRef.current && !pdfDropdownRef.current.contains(event.target)) {
        setPdfDropdownOpen(false);
      }
      if (heroPdfDropdownRef.current && !heroPdfDropdownRef.current.contains(event.target)) {
        setHeroPdfDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Protocol data state — declared early so callbacks below can reference it safely
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeProductDrawer, setActiveProductDrawer] = useState(null);

  // ── Firebase Daily Dose Integration ──────────────────────────────────────
  // Resolves clinic-specific or global dose overrides from Firestore.
  // clinicId is derived from the isProfessional user context (passed as prop).
  // When no Firestore data exists, useDailyDose falls back to protocol JSON.
  const clinicId = isProfessional?.clinicId ?? null;
  const { dailyDose, loading: dailyDoseLoading, source: dailyDoseSource } = useDailyDose(
    protocol,
    clinicId
  );
  const { products: protocolProducts } = useProtocolProducts(protocol);

  // ── Chart capture for PDF export ─────────────────────────────────────────
  const protocolChartRef = useRef(null);
  const handleChartRef = useCallback((ref) => { protocolChartRef.current = ref; }, []);

  /**
   * Rasterizes the chart element inside protocolChartRef into a PNG data URL.
   * Uses html-to-image to capture the exact glassmorphism and gradient styles.
   */
  const captureChartDataUrl = useCallback(async () => {
    const container = protocolChartRef.current?.current ?? protocolChartRef.current;
    if (!container) return null;
    try {
      const dataUrl = await toPng(container, {
        backgroundColor: '#060b14', // Match the sleek dark theme background
        style: {
          borderRadius: '10px',
        },
        pixelRatio: 2, // retina quality
      });
      return dataUrl;
    } catch (e) {
      console.warn('[ProtocolTemplate] captureChartDataUrl with html-to-image failed', e);
      return null;
    }
  }, []);

  /**
   * PDF export — supports Patient and Clinical versions based on role or user choice.
   */
  const handleExportPdf = useCallback(async (version = 'clinical', location = 'unknown') => {
    if (isExporting || !protocol) return;
    setIsExporting(true);

    trackEvent('download_pdf', {
      protocol_slug: slug,
      name: protocol?.name || slug,
      version,
      location,
    });

    try {
      if (version === 'patient') {
        const blob = await generatePatientGuide(protocol, {}, { returnBlob: true });
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `atlas-health-patient-guide-${slug}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        // 1. Try to get from cache first
        const cachedUrl = await getCachedProtocolPDF(protocol);
        if (cachedUrl) {
          window.open(cachedUrl, '_blank');
          setIsExporting(false);
          return;
        }

        // 2. If not cached, generate it
        const chartDataUrl = await captureChartDataUrl();
        const blob = await generateClinicalProtocol(protocol, { returnBlob: true, chartPng: chartDataUrl });

        if (blob) {
          // 3. Cache it for future use (don't await this to speed up download)
          cacheProtocolPDF(protocol, blob).catch(e => console.error('[ProtocolTemplate] Caching failed', e));

          // 4. Trigger download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = getProtocolFilename(protocol);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      console.error('[ProtocolTemplate] Export failed', err);
    } finally {
      setIsExporting(false);
    }
  }, [slug, protocol, captureChartDataUrl, isExporting]);

  // ── Sticky header collapse on scroll ─────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToPhase = (i) => {
    phaseRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // (protocol/loading/notFound state moved above — see early declaration)

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setNotFound(false);

    getProtocolTemplate(slug)
      .then((data) => {
        if (!active) return;
        if (data) {
          // ── Apply Universal Normalization (v3 Canonical) ──
          const normalized = normalizeProtocol(data);
          setProtocol(normalized);
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error('[ProtocolTemplate] Fetch failed', err);
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [slug]);

  // ── Background pre-caching ───────────────────────────────────────────────
  useEffect(() => {
    if (!protocol || loading) return;
    // Only professionals and admins have permissions to read/write clinical PDFs in storage
    if (!isMed) return;

    const timer = setTimeout(async () => {
      try {
        const cachedUrl = await getCachedProtocolPDF(protocol);
        if (!cachedUrl) {
          console.log('[ProtocolTemplate] Pre-generating PDF in the background...');
          const chartDataUrl = await captureChartDataUrl();
          const blob = await generateClinicalProtocol(protocol, { returnBlob: true, chartPng: chartDataUrl });
          if (blob) {
            await cacheProtocolPDF(protocol, blob);
            console.log('[ProtocolTemplate] Background PDF generation and caching complete.');
          }
        } else {
          console.log('[ProtocolTemplate] PDF is already pre-generated and cached.');
        }
      } catch (err) {
        console.warn('[ProtocolTemplate] Background pre-caching skipped/failed', err);
      }
    }, 4000); // 4-second delay to ensure rendering and chart are fully settled

    return () => clearTimeout(timer);
  }, [protocol, loading, captureChartDataUrl, isMed]);

  // ── Dynamic SEO: title + meta description + JSON-LD ────────────────────────
  const seoData = useMemo(() => {
    if (!protocol) return null;

    // Priority: metadata.scientificName > name > name > name > compound-based fallback
    const sciName  = protocol.metadata?.scientificName;
    const isRawId  = (s = '') => /^(rec_|prot_|id_|[a-z]{2,4}_\d{3,})/i.test(String(s).trim());

    // Best available human title from the Firestore document
    const firestoreTitle = protocol.name || protocol.metadata?.title || '';
    const rawName        = protocol.name || protocol.name || '';
    const resolvedName   = firestoreTitle || (isRawId(rawName) ? '' : rawName);

    // Ultimate fallback: build from compound names
    const compoundNames = (protocol.phases || [])
      .flatMap(ph => ph.compounds || ph.drugs || [])
      .map(d => d.name)
      .filter(Boolean);
    const uniqueNames   = [...new Set(compoundNames)];
    const compoundTitle = uniqueNames.length
      ? uniqueNames.slice(0, 3).join(' + ') + ' Protocol'
      : humanize(slug);

    const name         = resolvedName || compoundTitle;
    const primaryTitle = sciName || name;

    // Build a rich, informative description for SEO
    const durationWks = protocol.durationWeeks || protocol.duration_weeks || 12;
    const allDrugs    = (protocol.phases || [])
      .flatMap(ph => ph.compounds || ph.drugs || [])
      .map(d => d.name)
      .filter(Boolean);
    const uniqueCompounds = [...new Set(allDrugs)];
    const goalLabel   = humanize(protocol.primary_goal || protocol.metadata?.primary_goal || protocol.category || '');
    const descParts   = [
      durationWks ? `${durationWks}-week ${goalLabel} protocol` : `${goalLabel} protocol`,
      uniqueCompounds.length ? `featuring ${uniqueCompounds.slice(0, 3).join(', ')}` : null,
      'Evidence-based clinical research protocol.',
    ].filter(Boolean);
    const desc =
      protocol.metadata?.description ||
      protocol.overview_summary ||
      protocol.tagline ||
      protocol.summary ||
      descParts.join(' — ');

    // ── JSON-LD: MedicalGuideline & WebPage structured data graph ────────────
    const pageUrl = `https://www.atlashealth-services.com/protocol/${slug}`;
    const conditionSchema = {
      "@type": "MedicalCondition",
      "name": humanize(protocol.metadata?.primary_goal || protocol.primary_goal || slug)
    };
    const drugSchemas = uniqueCompounds.map(compName => ({
      "@type": "Drug",
      "name": compName,
      "nonProprietaryName": compName
    }));

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'MedicalWebPage',
          '@id': `${pageUrl}#webpage`,
          'url': pageUrl,
          'name': `${primaryTitle} | Protocol Library`,
          'description': desc.slice(0, 160),
          'isPartOf': {
            '@type': 'WebSite',
            '@id': 'https://www.atlashealth-services.com#website',
            'name': 'Atlas Health',
            'url': 'https://www.atlashealth-services.com'
          },
          'about': [conditionSchema, ...drugSchemas]
        },
        {
          '@type': 'MedicalGuideline',
          '@id': `${pageUrl}#guideline`,
          'isPartOf': {
            '@id': `${pageUrl}#webpage`
          },
          'name': primaryTitle,
          'alternateName': sciName ? name : undefined,
          'description': desc,
          'url': pageUrl,
          'guidelineSubject': [conditionSchema, ...drugSchemas],
          'evidenceLevel': protocol.evidence_level || 'Level III',
          'guidelineDate': protocol.updated_at
            ? new Date(protocol.updated_at.seconds
                ? protocol.updated_at.seconds * 1000
                : protocol.updated_at).toISOString().split('T')[0]
            : undefined,
          'publisher': {
            '@type': 'Organization',
            'name': 'Atlas Health',
            'url': 'https://www.atlashealth-services.com',
          }
        }
      ]
    };

    // Remove undefined properties recursively
    const cleanObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(cleanObject).filter(x => x !== undefined);
      } else if (obj && typeof obj === 'object') {
        const newObj = {};
        Object.keys(obj).forEach(k => {
          const val = cleanObject(obj[k]);
          if (val !== undefined) {
            newObj[k] = val;
          }
        });
        return newObj;
      }
      return obj;
    };

    const cleanedJsonLd = cleanObject(jsonLd);

    return {
      title: `${primaryTitle} | Protocol Library`,
      description: desc.slice(0, 160),
      structuredData: cleanedJsonLd,
      path: `/protocol/${slug}`
    };
  }, [protocol, slug]);

  usePageMeta({
    title: seoData?.title || 'Protocol Library',
    description: seoData?.description || 'Explore evidence-based clinical research protocols.',
    path: seoData?.path || `/protocol/${slug}`,
    structuredData: seoData?.structuredData || null
  });

  const handleBack = useCallback(() => router.back(), [router]);

  // ── Phase 7: Precomputed protocol metadata ─────────────────────────────────
  // Must stay BEFORE render guards to comply with Rules of Hooks.
  // Uses optional chaining so it's safe when protocol is null (returns empty/zero values).
  const precomputed = useMemo(() => {
    const phases = protocol?.phases || [];
    let totalMg = 0;
    const compoundSet = new Set();
    let totalWeeks = 0;

    phases.forEach(ph => {
      const dur = ph.durationWeeks || ph.duration_weeks || 4;
      totalWeeks += dur;
      const drugs = ph.compounds || ph.drugs || [];
      drugs.forEach(d => {
        const dose = d.weeklyDoseAmount || d.doseAmount || 0;
        totalMg += dose * dur;
        const cname = d.name || d.product_name || d.id;
        if (cname) compoundSet.add(cname.toLowerCase());
      });
    });

    return {
      totalMg:       +totalMg.toFixed(1),
      totalWeeks:    totalWeeks || 12,
      compoundList:  [...compoundSet],
      phaseCount:    phases.length,
      primaryGoalKey: protocol?.primaryGoal
                      || protocol?.primary_goal
                      || protocol?.category
                      || '',
    };
  }, [protocol?.id, protocol?.phases]);

  // ── Unified phase source (Single SSOT schema, zero runtime mapping) ───────
  const activeBlueprintPhases = useMemo(() => {
    return Array.isArray(protocol?.phases) ? protocol.phases : [];
  }, [protocol?.id, protocol?.phases]);

  // ── Render guards ──────────────────────────────────────────────────────────
  if (loading) return <ProtocolSkeleton />;
  if (notFound || !protocol) return <ProtocolNotFound slug={slug} />;

  // ── Derived values from actual DB document ─────────────────────────────────
  // Never show raw ID-like strings (e.g. "wm_001", "prot_003") as the visible name.
  // Priority: name → metadata.display_name → abbreviatedName → humanized slug.
  const _isRawId = (s = '') => /^[a-z]{1,5}[_-]\d{2,}/i.test(String(s).trim());
  const _rawName = protocol.name || protocol.name || '';
  const name = protocol.name
    || protocol.metadata?.display_name
    || protocol.metadata?.abbreviatedName
    || (_isRawId(_rawName) ? '' : _rawName)
    || humanize(slug);
  const tagline        = protocol.tagline
    || protocol.summary
    || protocol.description
    || protocol.metadata?.description
    || protocol.metadata?.clinical_summary
    || '';
  const overviewSummary = protocol.overview_summary
    || protocol.summary
    || protocol.description
    || protocol.metadata?.description
    || protocol.metadata?.clinical_summary
    || '';
  const longDescription = protocol.metadata?.longDescription
    || protocol.long_description
    || protocol.metadata?.clinical_summary
    || '';
  const synergyRationale = protocol.synergy_rationale
    || protocol.clinical_rationale
    || protocol.metadata?.synergy_rationale
    || protocol.clinical_notes?.timing_optimization
    || '';
  const primaryGoal    = protocol.primary_goal || protocol.metadata?.primary_goal || 'weight_management';
  const duration       = displayDuration(protocol);
  const intensity      = protocol.intensity || protocol.metadata?.intensity || 'Moderate';
  const phases         = displayPhases(protocol);
  const eligibility    = protocol.eligibility
    || protocol.eligibility_criteria
    || protocol.clinical_notes?.eligibility_criteria
    || null;
  const contraindications = protocol.contraindications
    || protocol.clinical_notes?.contraindications
    || [];
  const references     = protocol.references
    || protocol.literature
    || protocol.metadata?.references
    || [];
  const targetPatient  = protocol.target_patient || protocol.patient_profile || '';
  const clinicalEvidence = protocol.clinical_evidence || protocol.evidence || '';
  const logistics      = protocol.logistics || protocol.implementation_logistics || '';
  const keyOutcomes    = protocol.key_outcomes || protocol.outcomes || [];
  const safetyNotes    = protocol.safety_notes
    || protocol.safety
    || (Array.isArray(protocol.clinical_notes?.side_effects) ? protocol.clinical_notes.side_effects.join('. ') : protocol.clinical_notes?.side_effects)
    || '';

  // ── Scientific naming system ─────────────────────────────────────────────────
  const scientificName  = protocol.metadata?.scientificName || null;
  const shortCode       = protocol.metadata?.shortCode || null; // never fall back to protocol_id
  const version         = protocol.metadata?.version || protocol.protocol_version || null;
  const abbreviatedName = protocol.metadata?.abbreviatedName || null;

  // ── H1 display title: ALWAYS use scientificName — never an ID ────────────────
  // If scientificName is missing, warn clearly in the console so it can be fixed.
  if (!scientificName) {
    console.warn(
      `[ProtocolTemplate] ⚠️  metadata.scientificName is missing for protocol "${slug}".\n` +
      `  protocol.metadata =`, protocol.metadata, `\n` +
      `  Falling back to: "${name}"\n` +
      `  → Fix: add metadata.scientificName to the Firestore document "protocol_templates/${slug}".`
    );
  }
  const displayTitle = scientificName || name;

  // ── Derived economics ─────────────────────────────────────────────────────
  const economics = protocol.economics || {};
  const totalCost = economics.estimated_total_cost;
  const weeklyCost = economics.estimated_weekly_cost;
  const currency = economics.currency || 'USD';
  const goalMeta = getGoalMeta(primaryGoal);
  const GoalIcon = goalMeta.icon;

  // ── Status badge meta ──────────────────────────────────────────────────
  const status = protocol.status || protocol.regulatory_status || null;
  const statusColor = {
    approved: 'var(--color-success)',
    investigational: '#f59e0b',
    experimental: 'var(--color-danger)',
    ruo: 'var(--color-text-secondary)',
  }[status?.toLowerCase()] || 'var(--color-text-secondary)';

  return (
    <div className="proto-detail">

      {/* ── Sticky Header & Hero View (Extracted to ProtocolHeroHeader) ── */}
      <ProtocolHeroHeader
        protocol={protocol}
        slug={slug}
        isMed={isMed}
        isExporting={isExporting}
        scrolled={scrolled}
        stickyTotal={stickyTotal}
        shortCode={shortCode}
        handleExportPdf={handleExportPdf}
        setIsCalendarModalOpen={setIsCalendarModalOpen}
        isClinicAIOpen={isClinicAIOpen}
        setIsClinicAIOpen={setIsClinicAIOpen}
        handleChartRef={handleChartRef}
        displayTitle={displayTitle}
        version={version}
        tagline={tagline}
        intensity={intensity}
        dailyDoseSource={dailyDoseSource}
        primaryGoal={primaryGoal}
        goalMeta={goalMeta}
      />



      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="proto-detail__body">
        <div className="container pt-grid">
          {/* Center: Main Content */}
          <div className="proto-detail__main">

            {/* ── Expected Clinical Outcomes (Relocated below Hero, outside accordion) ── */}
            {protocol.expected_outcomes && (
              <div style={{ marginBottom: '1.5rem' }}>
                <ProtocolOutcomesSection
                  expectedOutcomes={protocol.expected_outcomes}
                  accentColor="var(--color-success)"
                />
              </div>
            )}

            {/* ── Real-Time Aqueous Lifespan & Replenishment Forecaster ── */}
            <ProtocolLifespanTracker protocol={protocol} />

            {/* ── Cross-Integration: Medical Supervision On-Ramp (B2C -> B2B) ── */}
            <MedicalSupervisionBanner itemName={name} itemType="protocol" />

            {/* ── Protocol Overview Accordion ───────────────────────────── */}
            {(overviewSummary || longDescription || synergyRationale) && (
              <SectionAccordion
                id={`${slug}_overview`}
                title="Protocol Overview"
                icon={BookOpen}
                accentColor="#0ea5e9"
                defaultOpen={true}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.25rem', maxWidth: '85ch' }}>
                  {overviewSummary && (
                    <p className="proto-section__text" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.15rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.6, margin: 0, letterSpacing: '-0.015em' }}>
                      {overviewSummary}
                    </p>
                  )}
                  {longDescription && (
                    <div style={{ fontFamily: "'Inter', sans-serif", color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.8, letterSpacing: '0.01em', whiteSpace: 'pre-wrap' }}>
                      {longDescription}
                    </div>
                  )}

                  {synergyRationale && (
                    <div style={{
                      background: 'rgba(14, 165, 233, 0.05)',
                      border: '1px solid rgba(14, 165, 233, 0.15)',
                      borderLeft: '4px solid #0ea5e9',
                      borderRadius: 10,
                      padding: '1.25rem 1.5rem',
                      marginTop: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <Activity size={14} color="#0ea5e9" />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0369a1' }}>
                          Synergy Rationale
                        </span>
                      </div>
                      <p style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
                        {synergyRationale}
                      </p>
                    </div>
                  )}
                </div>
              </SectionAccordion>
            )}

            {/* ── Target Patient Profile Accordion ─────────────────────── */}
            {targetPatient && (
              <SectionAccordion
                id={`${slug}_target_patient`}
                title="Target Patient Profile"
                icon={Users}
                accentColor="#7c3aed"
              >
                <p className="proto-section__text">{targetPatient}</p>
              </SectionAccordion>
            )}

            {/* Secondary timeline removed — hero chart (ProtocolHeaderCharts) is the single timeline source */}



            {/* Vial requirements are shown in the sidebar Supply Engine (same Firebase data) */}



            {/* ── Section: Reconstitution Guide ─────────────────────────── */}
            {activeBlueprintPhases.length > 0 && (() => {
              // Collect unique compounds with reconstitution data
              const seen = new Set();
              const reconRows = [];
              activeBlueprintPhases.forEach((ph) => {
                (ph.compounds || ph.drugs || []).forEach((d) => {
                  const key = d.name || d.product_name || 'Unknown';
                  if (seen.has(key)) return;
                  seen.add(key);
                  const strength = d.reconstitution?.vialStrengthMg ? `${d.reconstitution.vialStrengthMg}mg` : (d.vial_strength ? `${d.vial_strength}mg` : null);
                  const water = d.reconstitution?.diluentMl ? `${d.reconstitution.diluentMl}mL` : null;
                  const conc = d.reconstitution?.finalConcentration || null;
                  const notes = d.clinicalNotes || d.storage || null;
                  const targetDose = d.dosage || d.dose || '250 mcg';
                  reconRows.push({ compound: key, strength, water, conc, notes, targetDose });
                });
              });
              // Only render if at least one row has reconstitution data
              const hasData = reconRows.some(r => r.water || r.conc || r.strength);
              if (!hasData) return null;
              return (
                <SectionAccordion
                  id={`${slug}_reconstitution`}
                  title="Reconstitution & Syringe Guide"
                  icon={FlaskConical}
                  accentColor="#7c3aed"
                >
                  <ReconstitutionVisualGuide compounds={reconRows} />
                </SectionAccordion>
              );
            })()}

            {/* ── Phase 2: Pharmacokinetics Simulator Accordion ───────────────── */}
            {(() => {
              const simCompounds = activeBlueprintPhases.flatMap(ph => ph.compounds || ph.drugs || []);
              if (simCompounds.length === 0) return null;
              return (
                <SectionAccordion
                  id={`${slug}_pharmacokinetics`}
                  title="Pharmacokinetics & Concentration Simulator"
                  icon={Activity}
                  accentColor="var(--color-success)"
                  defaultOpen={false}
                >
                  <PharmacokineticsSimulator compounds={simCompounds} />
                </SectionAccordion>
              );
            })()}

            {/* Interactive Clinical Gantt Diagram & Phased Timeline */}
            <div style={{ marginBottom: '2rem' }}>
              <ClinicalGanttTimeline protocol={protocol} />
            </div>

            {/* Phases accordion — Section: Treatment Flow (Single SSOT Scheme, zero mapping) */}
            {activeBlueprintPhases.length > 0 && (
              <SectionAccordion
                id={`${slug}_treatment_flow`}
                title="Treatment Flow & Clinical Phases"
                icon={Layers}
                accentColor="var(--color-primary)"
              >
                <div className="proto-phases">
                  {activeBlueprintPhases.map((ph, i) => (
                    <div key={i} ref={el => (phaseRefs.current[i] = el)}>
                      <PhaseAccordion
                        phase={ph}
                        index={i}
                      />
                    </div>
                  ))}
                </div>
              </SectionAccordion>
            )}

            {/* ── Phase 4: Safety, Monitoring, Eligibility & References (Extracted) ── */}
            <ProtocolSafetyMonitoring
              protocol={protocol}
              slug={slug}
              activeBlueprintPhases={activeBlueprintPhases}
              eligibility={eligibility}
              contraindications={contraindications}
              safetyNotes={safetyNotes}
              references={references}
            />
            {/* ── Included Peptides (Single SSOT schema) ───────────────────── */}
            {(() => {
              const allCompounds = (protocol?.phases || [])
                .flatMap(ph => ph.compounds || ph.drugs || []);

              // Deduplicate by slug/name
              const seen = new Set();
              const uniqueCompounds = allCompounds.filter(d => {
                const key = d.id || d.name || d.product_name;
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
              });

              if (!uniqueCompounds.length) return null;

              // Accent colors by category keyword
              const accentFor = (cat = '') => {
                const c = cat.toLowerCase();
                if (c.includes('weight') || c.includes('metabolic')) return '#10B981';
                if (c.includes('healing') || c.includes('recovery'))  return 'var(--color-primary)';
                if (c.includes('aging') || c.includes('longevity'))   return '#A78BFA';
                if (c.includes('cognitive') || c.includes('neuro'))   return '#22D3EE';
                if (c.includes('muscle') || c.includes('performance'))return '#F59E0B';
                if (c.includes('hormonal'))                           return '#F97316';
                return 'var(--color-primary)';
              };

              // Enrich with product catalog data when available
              const enrichedCards = uniqueCompounds.map(d => {
                const slugKey = d.product_slug || d.slug || d.name || d.product_title;
                const match = (protocolProducts || []).find(p =>
                  p.slug === slugKey || p.id === slugKey ||
                  (p.displayName || p.name || '').toLowerCase() === (d.product_title || d.name || '').toLowerCase()
                );
                const cat    = match?.category || d.category || '';
                const color  = accentFor(cat);
                return {
                  name:        match?.displayName || match?.name || d.product_title || d.name || slugKey,
                  slug:        match?.slug || slugKey,
                  role:        match?.shortDescription || match?.subtitle || cat || 'Research Compound',
                  description: match?.description || match?.shortDescription || d.description || '',
                  color,
                  dosage:      d.dosage || d.dose || '',
                  frequency:   d.frequency || '',
                };
              });

              return (
                <div style={{ marginBottom: '2rem', marginTop: '1rem' }}>
                  {/* Section header */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                      <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
                        textTransform: 'uppercase', color: 'var(--color-primary)',
                      }}>Protocol Compounds</span>
                    </div>
                    <h2 style={{
                      fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 800,
                      color: '#0f172a', margin: 0, letterSpacing: '-0.02em',
                    }}>
                      Included Peptides
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
                      {enrichedCards.length} active compound{enrichedCards.length !== 1 ? 's' : ''} in this protocol
                    </p>
                  </div>

                  {/* Card flex wrapper */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1.25rem',
                    paddingBottom: '0.75rem',
                  }}>
                    {enrichedCards.map((peptide, idx) => (
                      <IncludedPeptideCard
                        key={peptide.slug || idx}
                        peptide={peptide}
                        onClick={() => setActiveProductDrawer(peptide)}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── Related Protocols — Phase 9: clinical similarity engine ── */}
            {protocol?.id && <RelatedProtocolsSection protocolId={protocol.id} />}
            {/* ── Supplement Section ─────────────────────────────────────── */}
            {Array.isArray(protocol?.recommended_supplements) && protocol.recommended_supplements.length > 0 && (
              <ProtocolSupplementSection
                recommendedSupplements={protocol.recommended_supplements}
                protocolName={protocol?.name || ''}
                updateCart={updateCart}
              />
            )}

            {/* ── Full Cycle Supply Accordion ───────────────────────────── */}
            {/* Uses activeBlueprintPhases — normalizes BOTH phase_blueprints (v2) and
                legacy phases into the canonical format, so ALL protocols show this section. */}
            {activeBlueprintPhases.length > 0 && (
              <SectionAccordion
                id={`${slug}_full_cycle_supply`}
                title="Full Cycle Supply"
                icon={Package}
                accentColor="#0f172a"
                defaultOpen={false}
              >
                <ProtocolSupplyEngine
                  phases={activeBlueprintPhases}
                  products={protocolProducts || []}
                  region={region || 'US'}
                  tier={isProfessional ? 'clinic' : 'retail'}
                  dailyDose={dailyDose ?? null}
                  onTotalChange={setStickyTotal}
                  updateCart={(items) => {
                    if (updateCart) {
                      updateCart(items);
                      setBundleAdded(true);
                      setTimeout(() => setBundleAdded(false), 3000);
                    }
                  }}
                  protocolName={name}
                />
              </SectionAccordion>
            )}

            {/* ── Technical Section (peptides, supplements, accessories, economics) ── */}
            <ProtocolTechnicalSection
              protocol={protocol}
              activeProtocolPhases={activeBlueprintPhases}
              products={protocolProducts || []}
              updateCart={updateCart}
              localTier={isProfessional ? 'clinic' : 'retail'}
              region={region || 'US'}
              slug={slug}
              dailyDose={dailyDose}
            />
          </div>
          {/* ClinicAI Drawer Modal */}
          <div className={`pt-ai-drawer ${isClinicAIOpen ? 'open' : ''}`}>
            <div className="pt-ai-drawer__header">
              <span style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} /> ClinicAI
              </span>
              <button 
                onClick={() => setIsClinicAIOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <XCircle size={20} color="var(--color-text-muted)" />
              </button>
            </div>
            <div className="pt-ai-drawer__content">
              <ClinicalAssistant embedded={true} isOpen={isClinicAIOpen} setIsOpen={setIsClinicAIOpen} />
            </div>
          </div>
        </div>{/* /pt-grid */}
      </div>



      {/* ── RUO Disclaimer footer ─────────────────────────────────────── */}
      <div className="proto-ruo-footer">
        <span className="proto-ruo-footer__dot" />
        For Laboratory Research Use Only (RUO). Not for diagnostic or therapeutic use.
        All compounds shown are investigational unless otherwise stated.
      </div>

      {/* ── Floating Action Bar (Glassmorphism) ───────────────────────────────── */}
      {Array.isArray(protocol.phases) && protocol.phases.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 2rem)',
          maxWidth: '700px',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.85rem 1.25rem',
          animation: 'slideUp 0.3s ease-out forwards'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, letterSpacing: '-0.01em', color: '#0f172a', fontSize: '0.95rem' }}>
              {name}
            </span>
            {stickyTotal > 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                Est. Total: <span style={{ color: '#0071bd' }}>${stickyTotal.toFixed(0)}</span>
              </span>
            )}
          </div>
          <button
            style={{
              background: bundleAdded ? 'var(--color-success)' : '#0071bd',
              color: 'var(--color-bg-surface)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: bundleAdded ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(0, 113, 189, 0.3)'
            }}
            onClick={() => {
              if (!bundleAdded) {
                trackEvent('add_to_cart', {
                  protocol_slug: slug,
                  name: protocol?.name || slug,
                  value: stickyTotal || 0,
                  currency: 'USD',
                  location: 'floating_action_bar',
                });
              }
              const supplySection = document.querySelector('.proto-sidebar-card:has(.pse-root)');
              if (supplySection) {
                supplySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                router.push('/cart');
              }
            }}
            onMouseEnter={(e) => {
              if (!bundleAdded) e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              if (!bundleAdded) e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {bundleAdded ? (
              <><CheckCircle2 size={16} /> Added to Workspace</>
            ) : (
              <><Briefcase size={16} /> Add to Workspace</>
            )}
          </button>
        </div>
      )}

      <ProductDetailDrawer 
        product={activeProductDrawer} 
        onClose={() => setActiveProductDrawer(null)} 
      />

      {/* ── iCalendar Export Modal (Extracted) ── */}
      <ProtocolCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        startDate={calendarStartDate}
        setStartDate={setCalendarStartDate}
        allDay={calendarAllDay}
        setAllDay={setCalendarAllDay}
        time={calendarTime}
        setTime={setCalendarTime}
        onDownload={handleDownloadCalendar}
      />
    </div>
  );
}