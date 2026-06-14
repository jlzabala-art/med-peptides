import Activity from "lucide-react/dist/esm/icons/activity";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import Clock from "lucide-react/dist/esm/icons/clock";
import Download from "lucide-react/dist/esm/icons/download";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Layers from "lucide-react/dist/esm/icons/layers";
import Package from "lucide-react/dist/esm/icons/package";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Star from "lucide-react/dist/esm/icons/star";
import Syringe from "lucide-react/dist/esm/icons/syringe";
import Target from "lucide-react/dist/esm/icons/target";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import Users from "lucide-react/dist/esm/icons/users";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Zap from "lucide-react/dist/esm/icons/zap";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import TestTube from "lucide-react/dist/esm/icons/test-tube";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useEffect, useState, useCallback, useRef, useMemo, memo, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { motion, AnimatePresence } from 'framer-motion';
import ProtocolTOC from '../components/protocol/ProtocolTOC';
import MobileTOCDrawer from '../components/protocol/MobileTOCDrawer';






























import { getProtocolTemplate, getTemplatesByObjective, getTemplatesByPrefix } from '../repositories/protocolRepository';
import { trackEvent } from '../hooks/useAnalytics';
import { generateClinicalProtocol, generatePatientGuide, getCachedProtocolPDF, cacheProtocolPDF, getProtocolFilename } from '../services/pdfService';
import { toPng } from 'html-to-image';
import { useShop } from '../context/ShopProvider';
import { useCart } from '../context/CartProvider';
import { useUIStore } from '../stores/uiStore';
import { useAuth } from '../context/AuthContext';
import { generateICS } from '../utils/calendarHelper';

import ProtocolSupplyEngine from '../components/protocol/ProtocolSupplyEngine';
import InjectionDoseChart from '../components/protocol/InjectionDoseChart';
import ProtocolHeaderCharts from '../components/protocol/ProtocolHeaderCharts';
import RelatedProtocolsSection from '../components/protocol/RelatedProtocolsSection';
import ProductDetailDrawer from '../components/protocol/ProductDetailDrawer';
// TestingSection removed — content merged into Monitoring & Follow-Up accordion
import ProtocolSupplementSection from '../components/protocol/ProtocolSupplementSection';
import ProtocolTechnicalSection from '../components/protocol/ProtocolTechnicalSection';
import ReconstitutionVisualGuide from '../components/protocol/ReconstitutionVisualGuide';
import PharmacokineticsSimulator from '../components/protocol/PharmacokineticsSimulator';
import ProtocolOutcomesSection from '../components/protocol/ProtocolOutcomesSection';
import { useDailyDose } from '../hooks/useDailyDose';

import protocolIndex from "../data/protocol_search_index.json";
import { normalizeProtocol, frequencyToInjectionsPerWeek } from '../utils/protocolSchemaAdapter';
import ClinicalAssistant from '../components/shared/ClinicalAssistant';

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
import CategoryProtocolNavigator from '../components/protocol/CategoryProtocolNavigator';
import OptionalAccessoriesCard from '../components/protocol/OptionalAccessoriesCard';
import PhaseAccordion from '../components/protocol/PhaseAccordion';
import EligibilityBlock from '../components/protocol/EligibilityBlock';
import SectionAccordion from '../components/protocol/SectionAccordion';

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
function ProtocolSkeleton() {
  return (
    <div className="proto-detail-skeleton">
      <div className="proto-detail-skeleton__hero" />
      <div className="proto-detail-skeleton__body">
        {[1, 2, 3].map((i) => (
          <div key={i} className="proto-detail-skeleton__block" />
        ))}
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ProtocolNotFound({ slug }) {
  const navigate = useNavigate();
  return (
    <div className="proto-detail-notfound">
      <AlertCircle size={48} color="#f87171" />
      <h2>Protocol Not Found</h2>
      <p>
        No protocol was found for <code>{slug}</code>. It may have been archived
        or the link is incorrect.
      </p>
      <button className="proto-back-btn" onClick={() => navigate('/protocols')}>
        Browse All Protocols
      </button>
    </div>
  );
}

// ── Included Peptide Card ─────────────────────────────────────────────────────
function IncludedPeptideCard({ peptide, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const color = peptide.color || 'var(--color-primary)';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--color-bg-surface)' : 'rgba(255,255,255,0.7)',
        border: `1.5px solid ${hovered ? color : 'rgba(0,54,102,0.08)'}`,
        borderRadius: '14px',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 10px 30px rgba(0,54,102,0.12)' : '0 2px 8px rgba(0,54,102,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
      }}
    >
      {/* Accent dot + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: color, flexShrink: 0, marginTop: '5px',
          boxShadow: `0 0 8px ${color}80`,
        }} />
        <span style={{
          fontSize: '0.95rem', fontWeight: 700, color: '#0f172a',
          lineHeight: 1.3, letterSpacing: '-0.01em',
        }}>
          {peptide.name}
        </span>
      </div>

      {/* Role / category */}
      {peptide.role && (
        <p style={{
          fontSize: '0.78rem', color: `${color}CC`, margin: 0,
          fontWeight: 600, lineHeight: 1.4,
        }}>
          {peptide.role}
        </p>
      )}

      {/* Description (truncated) */}
      {peptide.description && (
        <p style={{
          fontSize: '0.78rem', color: 'var(--color-text-secondary)',
          margin: 0, lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {peptide.description}
        </p>
      )}

      {/* Dosage chip (if available) */}
      {peptide.dosage && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: `${color}08`, border: `1px solid ${color}25`,
          borderRadius: '999px', padding: '0.18rem 0.6rem',
          fontSize: '0.72rem', fontWeight: 600, color,
          width: 'fit-content', marginTop: '0.15rem',
        }}>
          {peptide.dosage}{peptide.frequency ? ` · ${peptide.frequency}` : ''}
        </span>
      )}
    </div>
  );
}

// ── Main template ─────────────────────────────────────────────────────────────
export default function ProtocolTemplate({
  region,
  isProfessional,
  cart,
  updateCart,
  setRegion,
  products,
  allFaqs,
}) {
  const { setActiveModal } = useUIStore();
  const { isProfessional: authIsPro, isAdmin, isPhysician } = useAuth();
  const isMed = !!(authIsPro || isAdmin || isPhysician || isProfessional);

  const { slug } = useParams();
  const navigate = useNavigate();
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
        protocol_name: protocol?.name || slug,
        start_date: calendarStartDate,
        all_day: calendarAllDay,
      });
    } catch (e) {
      console.error('[ProtocolTemplate] Calendar generation failed', e);
      alert('Could not generate calendar. Please verify the start date is valid.');
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
      protocol_name: protocol?.name || slug,
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
  }, [protocol, loading, captureChartDataUrl]);

  // ── Dynamic SEO: title + meta description + JSON-LD ────────────────────────
  const seoData = useMemo(() => {
    if (!protocol) return null;

    // Priority: metadata.scientificName > protocol_title > protocol_name > name > compound-based fallback
    const sciName  = protocol.metadata?.scientificName;
    const isRawId  = (s = '') => /^(rec_|prot_|id_|[a-z]{2,4}_\d{3,})/i.test(String(s).trim());

    // Best available human title from the Firestore document
    const firestoreTitle = protocol.protocol_title || protocol.metadata?.title || '';
    const rawName        = protocol.name || protocol.protocol_name || '';
    const resolvedName   = firestoreTitle || (isRawId(rawName) ? '' : rawName);

    // Ultimate fallback: build from compound names
    const compoundNames = (protocol.phase_blueprints || [])
      .flatMap(ph => ph.drugs || ph.compounds || ph.drugs_used || [])
      .map(d => d.product_title || d.name || d.product_slug)
      .filter(Boolean);
    const uniqueNames   = [...new Set(compoundNames)];
    const compoundTitle = uniqueNames.length
      ? uniqueNames.slice(0, 3).join(' + ') + ' Protocol'
      : humanize(slug);

    const name         = resolvedName || compoundTitle;
    const primaryTitle = sciName || name;

    // Build a rich, informative description for SEO
    const durationWks = protocol.protocol_duration_weeks
      || protocol.duration_weeks
      || protocol.timeline?.total_duration_weeks
      || (protocol.phase_blueprints || []).reduce((s, ph) => s + (ph.duration_weeks || ph.default_duration_weeks || 0), 0)
      || null;
    const allDrugs    = (protocol.phase_blueprints || protocol.phases || [])
      .flatMap(ph => ph.drugs || ph.compounds || ph.drugs_used || [])
      .map(d => d.product_title || d.name || d.product_slug)
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
    const pageUrl = `https://Atlas Health.com/protocol/${slug}`;
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
            '@id': 'https://Atlas Health.com#website',
            'name': 'Atlas Health',
            'url': 'https://Atlas Health.com'
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
            'url': 'https://Atlas Health.com',
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

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  // ── Phase 7: Precomputed protocol metadata ─────────────────────────────────
  // Must stay BEFORE render guards to comply with Rules of Hooks.
  // Uses optional chaining so it's safe when protocol is null (returns empty/zero values).
  const precomputed = useMemo(() => {
    const blueprints = protocol?.phase_blueprints || protocol?.phases || [];
    let totalMg = 0;
    const compoundSet = new Set();
    let totalWeeks = 0;

    blueprints.forEach(ph => {
      const dur = ph.default_duration_weeks || ph.duration_weeks || 4;
      totalWeeks += dur;
      const drugs = ph.drugs || ph.compounds || ph.medications || ph.drugs_used || [];
      drugs.forEach(d => {
        const logic = d.dose_logic || {};
        const start = parseFloat(logic.starting_dose || logic.starting_weekly_dose || 0);
        const end   = parseFloat(logic.peak_dose || logic.max_dose || logic.maintenance_dose || start);
        totalMg += ((start + end) / 2) * dur;
        const cname = d.product_title || d.name || d.compound || d.product_slug;
        if (cname) compoundSet.add(cname.toLowerCase());
      });
    });

    return {
      totalMg:       +totalMg.toFixed(1),
      totalWeeks,
      compoundList:  [...compoundSet],
      phaseCount:    blueprints.length,
      primaryGoalKey: protocol?.metadata?.primary_goal
                      || protocol?.primary_goal
                      || protocol?.category
                      || '',
    };
  }, [protocol?.id]);

  // ── Unified phase source (handles both schema variants) ────────────────────
  // `phase_blueprints` is the v2 schema used by wm_001; `phases` is the legacy
  // schema used by wm_003. We normalise both into `activeBlueprintPhases` so
  // every downstream section (Weekly Dosing, Vial Requirements, Reconstitution,
  // Treatment Flow) works regardless of which field the Firestore doc uses.
  // NOTE: useMemo MUST remain above render guards to comply with Rules of Hooks.
  const activeBlueprintPhases = useMemo(() => {
    const phaseBlueprintsArr = Array.isArray(protocol?.phase_blueprints) ? protocol.phase_blueprints : [];
    if (phaseBlueprintsArr.length > 0) return phaseBlueprintsArr;

    // Map legacy `phases` array to the canonical phase_blueprints shape
    const phasesArr = Array.isArray(protocol?.phases) ? protocol.phases : [];
    return phasesArr.map((ph) => ({
      phase_title:            ph.name || ph.phase_name || '',
      default_duration_weeks: ph.duration_weeks || 4,
      clinical_goal:          ph.objective || '',
      clinical_purpose:       ph.objective ? [ph.objective] : [],
      clinical_events:        [],
      drugs: (ph.drugs || ph.compounds || ph.medications || []).map((d) => {
        const firstSched = d.schedule?.[0];
        const freqVal = firstSched?.frequency;
        const injPerWeek = freqVal ? frequencyToInjectionsPerWeek(freqVal) : 1;
        const derivedWeeklyDose = firstSched?.dose?.amount ? firstSched.dose.amount * injPerWeek : null;

        return {
          product_title:  d.product_title || d.name || d.compound || '',
          route:          d.dose_logic?.route_of_administration || d.route || 'subcutaneous',
          vial_strength:  d.vial_strength || d.dose_logic?.vial_strength || null,
          reconstitution: d.reconstitution || null,
          dose_logic: {
            starting_weekly_dose:     d.dose_logic?.starting_weekly_dose     ?? derivedWeeklyDose,
            dose_per_administration:  d.dose_logic?.dose_per_administration  ?? firstSched?.dose?.amount ?? null,
            dose_unit:                d.dose_logic?.dose_unit                || firstSched?.dose?.unit || '',
            administration_frequency: d.dose_logic?.administration_frequency || firstSched?.frequency?.label || d.frequency || '',
            route_of_administration:  d.dose_logic?.route_of_administration  || d.route    || 'subcutaneous',
            vials_required:           d.dose_logic?.vials_required            ?? d.procurement?.vialCount ?? null,
            administrations_per_week: d.dose_logic?.administrations_per_week  ?? (freqVal ? injPerWeek : null) ?? null,
            vial_strength:            d.dose_logic?.vial_strength             || d.vial_strength || null,
            reconstitution_water_ml:  d.dose_logic?.reconstitution_water_ml   ?? d.reconstitution?.water_volume_ml ?? null,
            final_concentration:      d.dose_logic?.final_concentration       ?? d.reconstitution?.final_concentration ?? null,
          },
        };
      }),
    }));
  }, [protocol?.id, protocol?.phase_blueprints, protocol?.phases]);

  // ── Render guards ──────────────────────────────────────────────────────────
  if (loading) return <ProtocolSkeleton />;
  if (notFound || !protocol) return <ProtocolNotFound slug={slug} />;

  // ── Derived values from actual DB document ─────────────────────────────────
  // Never show raw ID-like strings (e.g. "wm_001", "prot_003") as the visible name.
  // Priority: protocol_title → metadata.display_name → abbreviatedName → humanized slug.
  const _isRawId = (s = '') => /^[a-z]{1,5}[_-]\d{2,}/i.test(String(s).trim());
  const _rawName = protocol.protocol_name || protocol.name || '';
  const name = protocol.protocol_title
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

      {/* ── Sticky Scroll Header ─────────────────────────────────────── */}
      <div className={`proto-sticky-header${scrolled ? ' proto-sticky-header--visible' : ''}`}>
        <div className="container proto-sticky-header__inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: goalMeta.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <GoalIcon size={14} color="white" />
            </div>
            {shortCode && (
              <span style={{
                fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.07em',
                fontWeight: 700, color: 'var(--color-text-secondary)', flexShrink: 0,
              }}>
                {shortCode}
              </span>
            )}
            <span className="proto-sticky-header__name">{displayTitle}</span>
{/* status badge removed from sticky header */}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {stickyTotal > 0 && (
              <span style={{ 
                fontSize: '1rem', 
                fontWeight: 800, 
                color: 'white',
                letterSpacing: '-0.02em',
                background: 'rgba(0,0,0,0.2)',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px'
              }}>
                ${stickyTotal}
              </span>
            )}
            <button
              onClick={() => {
                const supplySection = document.getElementById(slug + '_supply') || document.querySelector('.proto-supply-engine');
                if (supplySection) {
                  supplySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 1rem',
                color: 'var(--color-bg-surface)',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02) translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; }}
            >
              <ShoppingCart size={14} />
              <span>Add to Order</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setActiveModal('ai');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.4rem 0.8rem',
                color: 'var(--color-bg-surface)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Sparkles size={12} />
              <span>ClinicAI</span>
            </button>

            <div style={{ position: 'relative' }} ref={pdfDropdownRef}>
              <button
                className="proto-sticky-header__pdf"
                onClick={() => {
                  if (isMed) {
                    setPdfDropdownOpen(!pdfDropdownOpen);
                  } else {
                    handleExportPdf('patient', 'sticky_header');
                  }
                }}
                disabled={isExporting}
                style={{ 
                  opacity: isExporting ? 0.7 : 1, 
                  cursor: isExporting ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--color-bg-surface)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                }}
              >
                <Download size={12} />
                <span>{isExporting ? 'Generating...' : 'Generate PDF'}</span>
                {isMed && <ChevronDown size={12} style={{ transition: 'transform 0.2s', transform: pdfDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />}
              </button>

              {isMed && pdfDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'var(--color-text-primary)',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                  zIndex: 1000,
                  minWidth: '160px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <button
                    onClick={() => {
                      setPdfDropdownOpen(false);
                      handleExportPdf('patient', 'sticky_header');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.6rem 1rem',
                      color: 'var(--color-bg-app)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <Users size={12} color="var(--color-text-tertiary)" />
                    Patient Version
                  </button>
                  <button
                    onClick={() => {
                      setPdfDropdownOpen(false);
                      handleExportPdf('clinical', 'sticky_header');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.6rem 1rem',
                      color: 'var(--color-bg-app)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      borderTop: '1px solid #334155'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <FlaskConical size={12} color="var(--color-text-tertiary)" />
                    Clinical Version
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCalendarModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'var(--color-bg-surface)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              <Calendar size={12} />
              <span>Export Calendar</span>
            </button>
          </div>
        </div>
      </div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="proto-detail__hero">
        <div className="container">

          {/* ── Category Protocol Navigator ─────────────────────────── */}
          <CategoryProtocolNavigator
            currentSlug={protocol.protocol_id || protocol.id || slug}
            primaryGoal={primaryGoal}
            goalLabel={goalMeta.label}
            goalGradient={goalMeta.gradient}
          />

          {/* Icon + identity row */}
          <div className="proto-hero-identity glass-panel" style={{
            padding: '1.5rem',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 20, flexShrink: 0,
              background: goalMeta.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
            }}>
              <GoalIcon size={34} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              {/* ── Line 1: Clinical Category — uppercase, small, muted ── */}
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)',
                marginBottom: '0.45rem',
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              }}>
                {goalMeta.label}
              </div>

              {/* ── Line 2: Primary Strategy — h1, largest, bold ── */}
              <h1 className="proto-detail__hero-title" style={{
                margin: '0 0 0.3rem',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              }}>
                {displayTitle}
              </h1>

              {/* ── Version chip only — subtitle, status badge removed ── */}
              {version && (
                <div style={{ marginTop: '0.3rem' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.12)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 5,
                    backdropFilter: 'blur(4px)',
                    color: 'rgba(255,255,255,0.8)',
                  }}>
                    Version {version}
                  </span>
                </div>
              )}
            </div>
          </div>

          {tagline && (
            <p className="proto-detail__hero-tagline">{tagline}</p>
          )}

          {/* Quick-stat pills — Duration, Phases, and Est. Total removed */}
          <div className="proto-detail__stats" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="proto-stat">
                <Zap size={14} />
                <span className="proto-stat__val">{intensity}</span>
                <span className="proto-stat__label">Intensity</span>
              </div>
              {dailyDoseSource === 'clinic' && (
                <div className="proto-stat" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <ShieldCheck size={14} color="var(--color-success)" />
                  <span className="proto-stat__val" style={{ color: 'var(--color-success)' }}>Clinic Dosing Active</span>
                </div>
              )}
            </div>

            {/* Premium action buttons in Hero */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }} ref={heroPdfDropdownRef}>
                <button
                  onClick={() => {
                    if (isMed) {
                      setHeroPdfDropdownOpen(!heroPdfDropdownOpen);
                    } else {
                      handleExportPdf('patient', 'hero');
                    }
                  }}
                  disabled={isExporting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '0.75rem 1.3rem',
                    color: 'var(--color-bg-surface)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: isExporting ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <Download size={16} />
                  <span>{isExporting ? 'Generating PDF...' : 'Generate PDF'}</span>
                  {isMed && <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: heroPdfDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />}
                </button>

                {isMed && heroPdfDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--color-text-primary)',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                    zIndex: 1000,
                    minWidth: '180px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <button
                      onClick={() => {
                        setHeroPdfDropdownOpen(false);
                        handleExportPdf('patient', 'hero');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.8rem 1.2rem',
                        color: 'var(--color-bg-app)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-text-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <Users size={14} color="var(--color-text-tertiary)" />
                      Patient Version
                    </button>
                    <button
                      onClick={() => {
                        setHeroPdfDropdownOpen(false);
                        handleExportPdf('clinical', 'hero');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0.8rem 1.2rem',
                        color: 'var(--color-bg-app)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        borderTop: '1px solid #334155'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-text-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <FlaskConical size={14} color="var(--color-text-tertiary)" />
                      Clinical Version
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsCalendarModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '0.75rem 1.3rem',
                  color: 'var(--color-bg-surface)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <Calendar size={16} />
                <span>Export Calendar</span>
              </button>
            </div>
          </div>

          {/* ── Protocol Visualization Charts ─────────────────────────── */}
          <ProtocolHeaderCharts protocol={protocol} onChartRef={handleChartRef} />

        </div>
      </div>



      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="proto-detail__body">
        <div className="container pt-grid">
          {/* Left: TOC */}
          <aside className="pt-toc-col">
            <ProtocolTOC 
              sections={[
                (overviewSummary || longDescription || synergyRationale) && { id: `${slug}_overview`, label: 'Protocol Overview' },
                targetPatient && { id: `${slug}_target_patient`, label: 'Target Patient' },
                (protocol.reconstitution || (protocol.phase_blueprints || []).some(ph => (ph.drugs || []).some(d => d.reconstitution || d.dose_logic?.reconstitution_water_ml))) && { id: `${slug}_reconstitution`, label: 'Reconstitution' },
                clinicalEvidence && { id: `${slug}_clinical`, label: 'Clinical Evidence' },
                logistics && { id: `${slug}_logistics`, label: 'Implementation Logistics' },
                { id: `${slug}_safety`, label: 'Safety Profile' },
                { id: `${slug}_supply`, label: 'Supply & Dosage' }
              ].filter(Boolean)} 
            />
          </aside>

          <div className="mobile-toc-fab-container">
            <MobileTOCDrawer>

            <ProtocolTOC 
              sections={[
                (overviewSummary || longDescription || synergyRationale) && { id: `${slug}_overview`, label: 'Protocol Overview' },
                targetPatient && { id: `${slug}_target_patient`, label: 'Target Patient' },
                (protocol.reconstitution || (protocol.phase_blueprints || []).some(ph => (ph.drugs || []).some(d => d.reconstitution || d.dose_logic?.reconstitution_water_ml))) && { id: `${slug}_reconstitution`, label: 'Reconstitution' },
                clinicalEvidence && { id: `${slug}_clinical`, label: 'Clinical Evidence' },
                logistics && { id: `${slug}_logistics`, label: 'Implementation Logistics' },
                { id: `${slug}_safety`, label: 'Safety Profile' },
                { id: `${slug}_supply`, label: 'Supply & Dosage' }
              ].filter(Boolean)} 
            />
                      </MobileTOCDrawer>
          </div>

          {/* Center: Main Content */}
          <div className="proto-detail__main">

            {/* ── Expected Clinical Outcomes (Relocated below Hero, outside accordion) ── */}
            {protocol.expected_outcomes && (
              <div style={{ marginBottom: '2rem' }}>
                <ProtocolOutcomesSection
                  expectedOutcomes={protocol.expected_outcomes}
                  accentColor="var(--color-success)"
                />
              </div>
            )}

            {/* ── Protocol Overview Accordion ───────────────────────────── */}
            {(overviewSummary || longDescription || synergyRationale) && (
              <SectionAccordion
                id={`${slug}_overview`}
                title="Protocol Overview"
                icon={BookOpen}
                accentColor="#0ea5e9"
                defaultOpen={true}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.25rem' }}>
                  {overviewSummary && (
                    <p className="proto-section__text" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.6, margin: 0, letterSpacing: '-0.01em' }}>
                      {overviewSummary}
                    </p>
                  )}
                  {longDescription && (
                    <div style={{ fontFamily: "'Inter', sans-serif", color: 'var(--color-text-secondary)', fontSize: '0.9rem', lineHeight: 1.75, letterSpacing: '0.01em' }}>
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
                (ph.drugs || []).forEach((d) => {
                  const key = d.product_title || d.name || 'Unknown';
                  if (seen.has(key)) return;
                  seen.add(key);
                  const strength = d.vial_strength || d.dose_logic?.vial_strength || null;
                  const water = d.reconstitution?.water_volume_ml ?? d.dose_logic?.reconstitution_water_ml ?? null;
                  const conc = d.reconstitution?.final_concentration ?? d.dose_logic?.final_concentration ?? null;
                  const notes = d.reconstitution?.notes ?? null;
                  const targetDose = d.dose_logic?.starting_weekly_dose || d.dose_logic?.dose_per_administration || 250;
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
              const simCompounds = [];
              protocol.phase_blueprints?.forEach((ph) => {
                const drugs = ph.drugs || ph.compounds || ph.medications || ph.drugs_used || [];
                drugs.forEach((d) => {
                  simCompounds.push(d);
                });
              });
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


            {/* Phases accordion (detailed) — Section: Treatment Flow */}
            {activeBlueprintPhases.length > 0 && (() => {
              // Compute cumulative week ranges for each phase
              let cursor = 1;
              const phaseData = activeBlueprintPhases.map((ph) => {
                const dur = ph.default_duration_weeks || 4;
                const startWk = cursor;
                const endWk = cursor + dur - 1;
                cursor += dur;
                return {
                  ph,
                  weekRange: `Wk ${startWk}–${endWk}`,
                  clinicalGoal: Array.isArray(ph.clinical_purpose)
                    ? ph.clinical_purpose.join(' · ')
                    : (ph.clinical_goal || ph.objective || ''),
                };
              });

              return (
                <SectionAccordion
                  id={`${slug}_treatment_flow`}
                  title="Treatment Flow"
                  icon={Layers}
                  accentColor="var(--color-primary)"
                >
                  <div className="proto-phases">
                    {phaseData.map(({ ph, weekRange, clinicalGoal }, i) => {
                      const bluePh = {
                        name: ph.phase_title,
                        phase_name: ph.phase_title,
                        duration_weeks: ph.default_duration_weeks,
                        objective: clinicalGoal,
                        drugs: (ph.drugs || []).map(d => ({
                          name: d.product_title,
                          dose: d.dose_logic?.starting_weekly_dose
                            ? `${d.dose_logic.starting_weekly_dose}${d.dose_logic.dose_unit} (start)`
                            : d.dose_logic?.dose_per_administration
                            ? `${d.dose_logic.dose_per_administration}${d.dose_logic.dose_unit}` : '',
                          frequency: d.dose_logic?.administration_frequency?.replace(/_/g, ' '),
                          route: d.route,
                        })),
                        notes: ph.clinical_events?.map(e => `Wk ${e.week}: ${e.title}`).join(' | '),
                      };
                      return (
                        <div key={i} ref={el => (phaseRefs.current[i] = el)}>
                          <PhaseAccordion
                            phase={bluePh}
                            index={i}
                            weekRange={weekRange}
                            clinicalGoal={clinicalGoal}
                          />
                        </div>
                      );
                    })}
                  </div>
                </SectionAccordion>
              );
            })()}

            {/* Legacy fallback — only shown when activeBlueprintPhases is empty (edge case) */}
            {phases.length > 0 && activeBlueprintPhases.length === 0 && (
              <SectionAccordion
                id={`${slug}_phases`}
                title="Protocol Phases"
                icon={Layers}
                accentColor="var(--color-primary)"
              >
                <div className="proto-phases">
                  {phases.map((ph, i) => (<PhaseAccordion key={i} phase={ph} index={i} />))}
                </div>
              </SectionAccordion>
            )}

            {/* ── Phase 4: Monitoring Plan (redesigned) ────────────────── */}
            {(protocol.monitoring_plan || protocol.monitoring?.labs?.length > 0 || protocol.clinical_notes?.monitoring?.length > 0) && (() => {
              const mp = protocol.monitoring_plan || {
                baseline_required: protocol.monitoring?.labs || [],
                clinical_rationale: protocol.monitoring?.rationales?.join(' ') || 'Standard monitoring of safety markers and metabolic parameters.',
                scheduled_checkpoints: (protocol.clinical_notes?.monitoring || []).map((m, i) => ({
                  week: i === 0 ? 12 : 24,
                  type: 'clinical_consult',
                  title: m,
                  labs: []
                }))
              };
              const checkpoints = mp.scheduled_checkpoints || [];

              // Group label helper
              const checkpointGroup = (cp) => {
                const w = Number(cp.week);
                if (cp.type?.includes('baseline') || w === 0 || w <= 1) return 'baseline';
                if (cp.type?.includes('final') || cp.type?.includes('end')) return 'final';
                return 'mid';
              };

              const GROUP_META = {
                baseline: { label: 'Baseline', color: 'var(--color-primary-hover)', bg: '#eff6ff', border: '#bfdbfe' },
                mid:      { label: 'Mid-Protocol', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
                final:    { label: 'Final', color: '#047857', bg: 'var(--color-success-bg)', border: '#bbf7d0' },
              };

              const checkpointTypeColor = (type) => {
                if (!type) return { bg: '#f1f5f9', color: 'var(--color-text-secondary)' };
                const t = type.toLowerCase();
                if (t.includes('lab') || t.includes('blood')) return { bg: '#eff6ff', color: 'var(--color-primary-hover)' };
                if (t.includes('imaging') || t.includes('scan')) return { bg: '#faf5ff', color: '#7c3aed' };
                if (t.includes('consult') || t.includes('clinical')) return { bg: '#fff7ed', color: '#c2410c' };
                return { bg: '#f1f5f9', color: 'var(--color-text-secondary)' };
              };

              return (
                <SectionAccordion
                  id={`${slug}_monitoring`}
                  title="Monitoring & Follow-Up"
                  icon={TestTube}
                  accentColor="#047857"
                >

                  {/* Baseline Labs Checklist */}
                  {mp.baseline_required?.length > 0 && (
                    <div style={{
                      background: 'var(--color-bg-app)',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #1d4ed8',
                      borderRadius: 10,
                      padding: '1rem 1.25rem',
                      marginBottom: '1.5rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <CheckCircle2 size={15} color="var(--color-primary-hover)" />
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-hover)' }}>
                          Baseline Labs Required
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {mp.baseline_required.map((lab, i) => (
                          <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            fontSize: '0.77rem', fontWeight: 600,
                            background: 'var(--color-bg-surface)', border: '1px solid #bfdbfe',
                            borderRadius: 6, padding: '0.3rem 0.65rem', color: '#1e40af',
                          }}>
                            <CheckCircle2 size={11} color="#60a5fa" />
                            {lab.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checkpoint Cards */}
                  {checkpoints.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {checkpoints.map((cp, i) => {
                        const grp = checkpointGroup(cp);
                        const gm = GROUP_META[grp];
                        const tc = checkpointTypeColor(cp.type);
                        return (
                          <div key={i} style={{
                            display: 'grid',
                            gridTemplateColumns: '72px 1fr',
                            borderRadius: 10,
                            border: `1px solid ${gm.border}`,
                            overflow: 'hidden',
                          }}>
                            {/* Week badge column */}
                            <div style={{
                              background: gm.bg,
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center',
                              padding: '0.75rem 0.4rem',
                              borderRight: `2px solid ${gm.border}`,
                            }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: gm.color, letterSpacing: '0.06em', lineHeight: 1 }}>WK</span>
                              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: gm.color, lineHeight: 1.1 }}>{cp.week ?? '—'}</span>
                              <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', color: gm.color, opacity: 0.7, marginTop: '0.2rem', textAlign: 'center' }}>{gm.label}</span>
                            </div>

                            {/* Content column */}
                            <div style={{ background: 'var(--color-bg-surface)', padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                                {cp.type && (
                                  <span style={{
                                    fontSize: '0.68rem', fontWeight: 700,
                                    background: tc.bg, color: tc.color,
                                    borderRadius: 5, padding: '0.18rem 0.5rem',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                  }}>
                                    {cp.type.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                              {cp.purpose && (
                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.81rem', color: 'var(--color-text-primary)', fontWeight: 500, lineHeight: 1.45 }}>
                                  {cp.purpose}
                                </p>
                              )}
                              {(cp.labs || []).length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                  {cp.labs.map((l, j) => (
                                    <span key={j} style={{
                                      fontSize: '0.69rem', fontWeight: 600,
                                      background: '#f1f5f9', color: 'var(--color-text-secondary)',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: 4, padding: '0.15rem 0.45rem',
                                    }}>
                                      {l.replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SectionAccordion>
              );
            })()}



            {/* ── Eligibility & Contraindications Accordion ─────────────── */}
            {(eligibility || contraindications.length > 0) && (
              <SectionAccordion
                id={`${slug}_eligibility`}
                title="Eligibility & Contraindications"
                icon={ShieldCheck}
                accentColor="#b45309"
              >
                {eligibility && (
                  <div style={{ marginBottom: contraindications.length > 0 ? '1.5rem' : 0 }}>
                    <EligibilityBlock eligibility={eligibility} />
                  </div>
                )}

                {contraindications.length > 0 && (
                  <div className="proto-contraindication-card">
                    <div className="proto-contraindication-card__header">
                      <AlertTriangle size={18} />
                      <span>Contraindications</span>
                    </div>
                    <div className="proto-criteria-list">
                      {contraindications.map((c, i) => (
                        <span key={i} className="proto-badge proto-badge--warn">
                          <AlertCircle size={11} /> {humanize(fmt(c))}
                        </span>
                      ))}
                    </div>
                    {(protocol.eligibility_rules?.relative_cautions || []).length > 0 && (
                      <>
                        <div className="proto-contraindication-card__sub">Relative Cautions</div>
                        <div className="proto-criteria-list">
                          {protocol.eligibility_rules.relative_cautions.map((c, i) => (
                            <span key={i} className="proto-badge proto-badge--caution">
                              {humanize(c)}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </SectionAccordion>
            )}

            {(() => {
              const compounds = new Set();
              activeBlueprintPhases.forEach(ph => {
                const drugs = ph.drugs || ph.compounds || ph.medications || [];
                drugs.forEach(d => {
                  const nameLower = (d.product_title || d.name || d.compound || d.product_slug || '').toLowerCase();
                  if (nameLower) compounds.add(nameLower);
                });
              });

              let common = ["Mild injection site irritation", "Fatigue", "Headache"];
              let serious = ["Severe hypersensitivity reactions", "Persistent severe adverse events - report immediately"];
              let drugInteractions = ["Concomitant administration with other peptide therapies should be done under clinical supervision."];
              let monitoring = ["Baseline comprehensive metabolic panel (CMP)", "Regular vital signs monitoring"];

              if (compounds.has('retatrutide') || compounds.has('tirzepatide') || compounds.has('semaglutide') || compounds.has('glp-1')) {
                common = [
                  "Nausea & vomiting",
                  "Diarrhea or constipation",
                  "Mild injection site irritation",
                  "Increased resting heart rate",
                  "Fatigue & headache"
                ];
                serious = [
                  "Acute Pancreatitis (persistent severe abdominal pain)",
                  "Acute Gallbladder Disease (cholecystitis, biliary colic)",
                  "Severe Hypoglycemia (especially when combined with other hypoglycemic agents)",
                  "Dehydration leading to acute kidney injury"
                ];
                drugInteractions = [
                  "Delayed gastric emptying: May affect absorption rates of oral medications.",
                  "Other hypoglycemic agents: May increase hypoglycemia risk. Consider reducing doses."
                ];
                monitoring = [
                  "Fasting blood glucose & HbA1c",
                  "Renal function tests (eGFR, serum creatinine)",
                  "Amylase/Lipase (in case of clinical pancreatitis symptoms)",
                  "Heart rate and blood pressure monitoring"
                ];
              } else if (compounds.has('mots-c') || compounds.has('ss-31')) {
                common = [
                  "Mild injection site reaction",
                  "Transient flushing",
                  "Mild headache"
                ];
                serious = [
                  "Hypersensitivity / allergic reaction",
                  "Injection site infection"
                ];
                drugInteractions = [
                  "Cardioprotective or mitochondrial drugs: Possible synergy. Monitor clinical parameters."
                ];
                monitoring = [
                  "Mitochondrial biomarkers",
                  "Baseline safety labs (CBC/CMP)"
                ];
              }

              // Extract from JSON, falling back to defaults if empty
              const jsonSP = protocol.safety_profile || {};
              const jsonCommon = jsonSP.adverse_events_common?.length > 0 ? jsonSP.adverse_events_common : (jsonSP.adverse_events?.common?.length > 0 ? jsonSP.adverse_events.common : common);
              const jsonSerious = jsonSP.adverse_events_serious?.length > 0 ? jsonSP.adverse_events_serious : (jsonSP.adverse_events?.serious?.length > 0 ? jsonSP.adverse_events.serious : serious);
              const jsonDrugInt = jsonSP.drug_interactions?.length > 0 ? jsonSP.drug_interactions : drugInteractions;
              const jsonMonitoring = jsonSP.monitoring_required?.length > 0 ? jsonSP.monitoring_required : monitoring;

              const resolvedSafetyProfile = {
                adverse_events: { 
                  common: jsonCommon, 
                  serious: jsonSerious 
                },
                drug_interactions: jsonDrugInt,
                monitoring_required: jsonMonitoring,
              };

              let resolvedSafetyNotes = safetyNotes;
              if (!resolvedSafetyNotes) {
                if (compounds.has('retatrutide') || compounds.has('tirzepatide') || compounds.has('semaglutide')) {
                  resolvedSafetyNotes = "Retatrutide/GLP-1 agonists are powerful metabolic modulators. Strict clinical monitoring is required. Avoid in patients with a history of pancreatitis, gallbladder disease, or medullary thyroid carcinoma. Always seek medical supervision before beginning therapy.";
                } else {
                  resolvedSafetyNotes = "Clinical peptide therapy requires diligent adherence to aseptic injection techniques, correct reconstitution, and regular diagnostic monitoring to ensure optimal safety and efficacy.";
                }
              }

              const sp = resolvedSafetyProfile;

              return (
                <SectionAccordion
                  id={`${slug}_safety`}
                  title="Safety Profile"
                  icon={ShieldCheck}
                  accentColor="var(--color-danger)"
                >
                  {resolvedSafetyNotes && (
                    <p className="proto-section__text" style={{ marginBottom: '1.25rem' }}>{resolvedSafetyNotes}</p>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Adverse Events */}
                    {(sp.adverse_events?.common?.length > 0 || sp.adverse_events?.serious?.length > 0) && (
                      <div style={{
                        background: '#fff7ed',
                        border: '1px solid #fed7aa',
                        borderLeft: '4px solid #f97316',
                        borderRadius: 10,
                        padding: '1rem 1.25rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <AlertTriangle size={14} color="#f97316" />
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c2410c' }}>
                            Adverse Events
                          </span>
                        </div>
                        {sp.adverse_events.common?.length > 0 && (
                          <div style={{ marginBottom: '0.6rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>Common</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {sp.adverse_events.common.map((ae, i) => (
                                <span key={i} style={{ background: '#ffedd5', color: '#c2410c', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>{ae}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {sp.adverse_events.serious?.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>Serious (report immediately)</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                              {sp.adverse_events.serious.map((ae, i) => (
                                <span key={i} style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>{ae}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Drug Interactions */}
                    {sp.drug_interactions?.length > 0 && (
                      <div style={{
                        background: '#faf5ff',
                        border: '1px solid #e9d5ff',
                        borderLeft: '4px solid #9333ea',
                        borderRadius: 10,
                        padding: '1rem 1.25rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <AlertCircle size={14} color="#9333ea" />
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7e22ce' }}>
                            Drug Interactions
                          </span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.83rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          {sp.drug_interactions.map((di, i) => (
                            <li key={i}>{di}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Monitoring Required */}
                    {sp.monitoring_required?.length > 0 && (
                      <div style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderLeft: '4px solid #2563eb',
                        borderRadius: 10,
                        padding: '1rem 1.25rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <CheckCircle2 size={14} color="var(--color-primary)" />
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-hover)' }}>
                            Recommended Monitoring
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {sp.monitoring_required.map((m, i) => (
                            <span key={i} style={{ background: '#dbeafe', color: 'var(--color-primary-hover)', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>{m}</span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </SectionAccordion>
              );
            })()}

            {/* TestingSection removed — merged into Monitoring & Follow-Up accordion above */}

            {/* ── References Accordion ──────────────────────────────── */}
            {references.length > 0 && (
              <SectionAccordion
                id={`${slug}_references`}
                title="Clinical References"
                icon={BookOpen}
                accentColor="#0369a1"
                defaultOpen={false}
              >
                <ol className="proto-references">
                  {references.map((r, i) => (
                    <li key={i}>
                      {typeof r === 'string' ? (
                        r.startsWith('http') ? (
                          <a href={r} target="_blank" rel="noopener noreferrer">{r}</a>
                        ) : r
                      ) : (
                        <span>
                          {r.title || r.citation || JSON.stringify(r)}
                          {r.url && (
                            <>
                              {' '}—{' '}
                              <a href={r.url} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </>
                          )}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </SectionAccordion>
            )}
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
                  phase_blueprints={activeBlueprintPhases}
                  products={products || []}
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
              products={products || []}
              updateCart={updateCart}
              localTier={isProfessional ? 'clinic' : 'retail'}
              region={region || 'US'}
              slug={slug}
              dailyDose={dailyDose}
            />
          </div>
          {/* Right: ClinicAI Sidebar */}
          <div className="pt-ai-col">
            <ClinicalAssistant embedded={true} isOpen={true} setIsOpen={() => {}} />
          </div>
        </div>{/* /pt-grid */}
      </div>

      {/* ── Included Peptides ─────────────────────────────────────────── */}
      {(() => {
        // Extract unique compounds from v2 phase_blueprints OR legacy phases
        const allCompounds = (protocol?.phase_blueprints || protocol?.phases || [])
          .flatMap(ph => ph.drugs || ph.compounds || ph.drugs_used || []);

        // Deduplicate by slug/name
        const seen = new Set();
        const uniqueCompounds = allCompounds.filter(d => {
          const key = d.product_slug || d.slug || d.name || d.product_title;
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
          const match = (products || []).find(p =>
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
          <div style={{
            maxWidth: '1280px', margin: '0 auto 3rem', padding: '0 1.5rem',
          }}>
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

            {/* Card grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.1rem',
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

      {/* ── RUO Disclaimer footer ─────────────────────────────────────── */}
      <div className="proto-ruo-footer">
        <span className="proto-ruo-footer__dot" />
        For Laboratory Research Use Only (RUO). Not for diagnostic or therapeutic use.
        All compounds shown are investigational unless otherwise stated.
      </div>

      {/* ── Floating Action Bar (Glassmorphism) ───────────────────────────────── */}
      {Array.isArray(protocol.phase_blueprints) && protocol.phase_blueprints.length > 0 && (
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
                  protocol_name: protocol?.name || slug,
                  value: stickyTotal || 0,
                  currency: 'USD',
                  location: 'floating_action_bar',
                });
              }
              const supplySection = document.querySelector('.proto-sidebar-card:has(.pse-root)');
              if (supplySection) {
                supplySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                navigate('/cart');
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
              <><CheckCircle2 size={16} /> Added!</>
            ) : (
              <><ShoppingCart size={16} /> Get Bundle</>
            )}
          </button>
        </div>
      )}

      <ProductDetailDrawer 
        product={activeProductDrawer} 
        onClose={() => setActiveProductDrawer(null)} 
      />

      {/* ── iCalendar Export Modal ── */}
      {isCalendarModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(2, 6, 23, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-bg-app)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <Calendar size={18} color="#60a5fa" />
                Configure Calendar Export
              </h3>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  lineHeight: 1,
                  padding: '0.2rem'
                }}
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                Generate a personalized calendar file containing all dosing and administration events. You can import this file directly into Google Calendar, Apple Calendar, or Outlook.
              </p>

              {/* Start Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Protocol Start Date
                </label>
                <input
                  type="date"
                  value={calendarStartDate}
                  onChange={(e) => setCalendarStartDate(e.target.value)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.8rem',
                    color: 'var(--color-bg-app)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>

              {/* Reminder Type Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Reminder Type
                </label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--color-bg-app)', fontSize: '0.85rem' }}>
                    <input
                      type="radio"
                      checked={calendarAllDay}
                      onChange={() => setCalendarAllDay(true)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    All-Day Event
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--color-bg-app)', fontSize: '0.85rem' }}>
                    <input
                      type="radio"
                      checked={!calendarAllDay}
                      onChange={() => setCalendarAllDay(false)}
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    Specific Time
                  </label>
                </div>
              </div>

              {/* Time Picker (conditional) */}
              {!calendarAllDay && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Preferred Dosing Time
                  </label>
                  <input
                    type="time"
                    value={calendarTime}
                    onChange={(e) => setCalendarTime(e.target.value)}
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '0.6rem 0.8rem',
                      color: 'var(--color-bg-app)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      width: '120px'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.02)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadCalendar}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1.25rem',
                  color: 'var(--color-bg-surface)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Download size={14} />
                Generate File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}