"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Zap,
  Heart,
  Activity,
  Brain,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Moon,
  Clock,
  Layers,
  ArrowRight,
  Filter,
  Check,
  Copy,
  QrCode,
  Share2,
  X,
  FileText,
  FlaskConical,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  List,
  LayoutGrid,
  ClipboardList
} from '@/lib/icons';
import { triggerHaptic } from '../../utils/haptics';
import '../../styles/publicProtocolsCatalog.css';
import '../../components/product/PublicDatasheetView.css';
import PublicAtlasAIDrawer from '../shared/PublicAtlasAIDrawer';
import PublicInstitutionalInquiryDrawer from '../shared/PublicInstitutionalInquiryDrawer';
import PublicUnifiedHeader from '../shared/PublicUnifiedHeader';
import { Mail, Lock } from 'lucide-react';
import { getProtocolTranslations, GOAL_TRANSLATIONS, SUPPORTED_LANGUAGES } from '../../utils/protocolTranslations';

// ── Goal Taxonomy Buckets ───────────────────────────────────────────────────
const GOAL_BUCKETS = [
  { id: 'all', label: 'All Protocols', icon: FlaskConical, color: '#003666', bg: '#eff6ff' },
  { id: 'fat_loss', label: 'Metabolism & GLP-1 / GIP', icon: Zap, color: '#ea580c', bg: '#fff7ed' },
  { id: 'longevity', label: 'Longevity & Anti-Aging', icon: Heart, color: '#0d9488', bg: '#f0fdfa' },
  { id: 'recovery', label: 'Tissue & Joint Regeneration', icon: Activity, color: '#0284c7', bg: '#f0f9ff' },
  { id: 'cognitive', label: 'Neuroplasticity & Cognition', icon: Brain, color: '#7c3aed', bg: '#faf5ff' },
  { id: 'muscle_growth', label: 'Muscle Mass & Performance', icon: Shield, color: '#16a34a', bg: '#f0fdf4' },
  { id: 'immune', label: 'Immunity & Cellular Defense', icon: ShieldAlert, color: '#0891b2', bg: '#ecfeff' },
  { id: 'sexual_health', label: 'Hormonal & Sexual Health', icon: Sparkles, color: '#db2777', bg: '#fdf2f8' },
  { id: 'sleep', label: 'Sleep & Circadian Rhythm', icon: Moon, color: '#4338ca', bg: '#eef2ff' },
  { id: 'skin_hair', label: 'Skin, Hair & Aesthetics', icon: Sparkles, color: '#d97706', bg: '#fffbeb' },
];

/**
 * Maps arbitrary Firestore goal tags to standard bucket IDs
 */
function mapProtocolToGoals(p) {
  const text = [
    ...(Array.isArray(p.goals) ? p.goals : [p.goals]),
    p.goal,
    p.category,
    p.therapeutic_category,
    p.name,
    p.protocol_name,
    p.title,
    p.description
  ].filter(Boolean).join(' ').toLowerCase();

  const matched = new Set(['all']);

  if (text.match(/glp|gip|fat|weight|metabolic|tirzepatide|semaglutide|retatrutide|aod|5-amino|adipotide/i)) {
    matched.add('fat_loss');
  }
  if (text.match(/longevity|aging|epithalon|nad|foxo4|telomere|mitochondr|ghk/i)) {
    matched.add('longevity');
  }
  if (text.match(/recovery|tissue|joint|repair|bpc|tb-500|tb500|kpv|pentosan|collagen|cartilage/i)) {
    matched.add('recovery');
  }
  if (text.match(/cognit|neuro|brain|semax|selank|dihexa|cerebro|memory|focus|anxiety/i)) {
    matched.add('cognitive');
  }
  if (text.match(/muscle|lean|performance|growth|strength|cjc|ipamorelin|sermorelin|tesamorelin|ghrh|ghrp/i)) {
    matched.add('muscle_growth');
  }
  if (text.match(/immune|thymosin|ll-37|ta-1|ta1|inflam|defense|antimicrobial/i)) {
    matched.add('immune');
  }
  if (text.match(/sexual|libido|pt-141|kisspeptin|bremelanotide|hormon|fertility|testosterone/i)) {
    matched.add('sexual_health');
  }
  if (text.match(/sleep|dsip|circadian|insomnia|rest|pineal/i)) {
    matched.add('sleep');
  }
  if (text.match(/skin|hair|ghk-cu|copper|cosmetic|aesthetics|wrinkle/i)) {
    matched.add('skin_hair');
  }

  return Array.from(matched);
}

/**
 * Extracts distinct active compounds for chip rendering
 */
function extractCompounds(p) {
  const list = [];
  const seen = new Set();

  const add = (name, slug) => {
    if (!name) return;
    const clean = String(name).trim();
    const key = clean.toLowerCase();
    if (!seen.has(key) && clean.length > 1) {
      seen.add(key);
      const autoSlug = slug || clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      list.push({ name: clean, slug: autoSlug });
    }
  };

  // 1. From BOM
  if (Array.isArray(p.bom)) {
    p.bom.forEach(b => add(b.name || b.compound || b.product_name, b.slug || b.productId));
  }
  // 2. From Peptides
  if (Array.isArray(p.peptides)) {
    p.peptides.forEach(c => add(c.name || c.compound, c.slug));
  }
  // 3. From Phases
  if (Array.isArray(p.phases)) {
    p.phases.forEach(ph => {
      if (Array.isArray(ph.compounds)) {
        ph.compounds.forEach(c => add(c.name || c.compound, c.slug));
      }
    });
  }

  return list;
}

export default function PublicProtocolsCatalogView({ initialProtocols = [] }) {
  const [lang, setLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [phasesFilter, setPhasesFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [copiedId, setCopiedId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // Default: list view
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const toggleExpanded = (id) => {
    triggerHaptic('light');
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Synchronized language state across all public views
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && ['en', 'es', 'fr', 'de', 'it'].includes(urlLang)) {
        setLang(urlLang);
        return;
      }

      const savedLang = localStorage.getItem('atlas_portal_lang') || localStorage.getItem('atlas_catalog_lang');
      if (savedLang && ['en', 'es', 'fr', 'de', 'it'].includes(savedLang)) {
        setLang(savedLang);
      } else {
        setLang('en');
      }
      
      const handleGlobalLang = (e) => {
        if (e.detail && ['en', 'es', 'fr', 'de', 'it'].includes(e.detail)) {
          setLang(e.detail);
        }
      };
      window.addEventListener('atlas_lang_change', handleGlobalLang);
      return () => window.removeEventListener('atlas_lang_change', handleGlobalLang);
    }
  }, []);

  const handleLangChange = (nextLang) => {
    setLang(nextLang);
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

  const t = getProtocolTranslations(lang);

  // Keyboard shortcut: ⌘K / Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const el = document.getElementById('protocol-global-search');
        if (el) el.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Pre-calculate mapped metadata
  const enrichedProtocols = useMemo(() => {
    return (initialProtocols || []).map(p => {
      const durationWeeks = p.durationWeeks || p.duration_weeks || 
        (typeof p.duration === 'string' ? parseInt(p.duration, 10) || 8 : 8);
      const phasesCount = Array.isArray(p.phases) ? p.phases.length : 1;
      const compounds = extractCompounds(p);
      const mappedGoals = mapProtocolToGoals(p);
      const cleanName = p.name || p.protocol_name || p.title || 'Clinical Protocol';
      const cleanCode = p.sku || p.code || p.protocol_id || p.protocolCode || (p.id ? `PR-${p.id.slice(0, 6).toUpperCase()}` : 'PR-CLIN');
      const cleanSlug = p.slug || p.protocol_slug || p.id;
      const summary = p.overview_summary || p.description || p.executiveSummary || p.clinical_rationale || 
        'Prescription protocol calibrated for cellular receptor adaptation and targeted biomarker outcomes.';

      return {
        ...p,
        cleanName,
        cleanCode,
        cleanSlug,
        durationWeeks,
        phasesCount,
        compounds,
        mappedGoals,
        summary,
      };
    });
  }, [initialProtocols]);

  // Goal counts for badges
  const goalCounts = useMemo(() => {
    const counts = {};
    GOAL_BUCKETS.forEach(g => {
      counts[g.id] = 0;
    });
    enrichedProtocols.forEach(p => {
      p.mappedGoals.forEach(gid => {
        if (counts[gid] !== undefined) counts[gid]++;
      });
    });
    return counts;
  }, [enrichedProtocols]);

  // Filtered and sorted protocols
  const filteredProtocols = useMemo(() => {
    let result = enrichedProtocols.filter(p => {
      // 1. Goal filter
      if (selectedGoal !== 'all' && !p.mappedGoals.includes(selectedGoal)) {
        return false;
      }

      // 2. Duration filter
      if (durationFilter === 'short' && p.durationWeeks > 8) return false;
      if (durationFilter === 'medium' && (p.durationWeeks <= 8 || p.durationWeeks > 12)) return false;
      if (durationFilter === 'long' && p.durationWeeks <= 12) return false;

      // 3. Phases filter
      if (phasesFilter === 'single' && p.phasesCount !== 1) return false;
      if (phasesFilter === 'titration' && p.phasesCount < 2) return false;

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = p.cleanName.toLowerCase().includes(q);
        const codeMatch = p.cleanCode.toLowerCase().includes(q);
        const summaryMatch = p.summary.toLowerCase().includes(q);
        const compoundMatch = p.compounds.some(c => c.name.toLowerCase().includes(q));
        const goalMatch = p.mappedGoals.some(g => g.toLowerCase().includes(q));

        if (!nameMatch && !codeMatch && !summaryMatch && !compoundMatch && !goalMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'duration-desc') return b.durationWeeks - a.durationWeeks;
      if (sortBy === 'duration-asc') return a.durationWeeks - b.durationWeeks;
      if (sortBy === 'name-asc') return a.cleanName.localeCompare(b.cleanName);
      if (sortBy === 'phases-desc') return b.phasesCount - a.phasesCount;
      // Default: relevance (multi-compound and multi-phase first)
      return (b.compounds.length * 2 + b.phasesCount) - (a.compounds.length * 2 + a.phasesCount);
    });

    return result;
  }, [enrichedProtocols, selectedGoal, durationFilter, phasesFilter, searchQuery, sortBy]);

  // Group filtered protocols by therapeutic goal buckets
  const groupedProtocols = useMemo(() => {
    const groups = [];
    const targetBuckets = selectedGoal === 'all'
      ? GOAL_BUCKETS.filter(b => b.id !== 'all')
      : GOAL_BUCKETS.filter(b => b.id === selectedGoal);

    targetBuckets.forEach(bucket => {
      const matching = filteredProtocols.filter(p => {
        const primary = p.mappedGoals.find(g => g !== 'all') || 'longevity';
        return primary === bucket.id || (selectedGoal !== 'all' && p.mappedGoals.includes(bucket.id));
      });
      if (matching.length > 0) {
        groups.push({
          bucket,
          protocols: matching
        });
      }
    });

    if (selectedGoal === 'all') {
      const matchedSlugs = new Set(groups.flatMap(g => g.protocols.map(p => p.cleanSlug || p.id)));
      const remainder = filteredProtocols.filter(p => !matchedSlugs.has(p.cleanSlug || p.id));
      if (remainder.length > 0) {
        groups.push({
          bucket: {
            id: 'other',
            label: 'Specialized Protocols',
            icon: FlaskConical,
            color: '#003666',
            bg: '#eff6ff'
          },
          protocols: remainder
        });
      }
    }

    return groups;
  }, [filteredProtocols, selectedGoal]);

  const handleCopyCode = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(code);
    triggerHaptic('light');
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [copiedDirectoryUrl, setCopiedDirectoryUrl] = useState(false);
  const handleCopyDirectoryUrl = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        triggerHaptic('copy');
        setCopiedDirectoryUrl(true);
        setTimeout(() => setCopiedDirectoryUrl(false), 2000);
      }
    } catch {}
  };

  const handleResetFilters = () => {
    triggerHaptic('tap');
    setSearchQuery('');
    setSelectedGoal('all');
    setDurationFilter('all');
    setPhasesFilter('all');
    setSortBy('relevance');
  };

  const hasActiveFilters = searchQuery || selectedGoal !== 'all' || durationFilter !== 'all' || phasesFilter !== 'all';

  return (
    <div className="proto-catalog-container">
      {/* ── Fixed 2-Tier Sticky Executive Navigation ── */}
      <PublicUnifiedHeader
        track="protocols"
        lang={lang}
        onLangChange={handleLangChange}
        copyUrl={typeof window !== 'undefined' ? `${window.location.origin}/proto` : 'https://med-peptides.com/proto'}
        inquiryContextType="protocols_directory"
        onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
        loginRedirect="/proto"
        filterTabs={[
          {
            id: 'all',
            label: lang === 'es' ? 'Todos' : 'All Protocols',
            count: enrichedProtocols.length,
            isActive: selectedGoal === 'all',
            onClick: () => setSelectedGoal('all')
          },
          ...GOAL_BUCKETS.slice(1, 6).map(g => ({
            id: g.id,
            label: GOAL_TRANSLATIONS[g.id]?.[lang] || g.label,
            isActive: selectedGoal === g.id,
            onClick: () => setSelectedGoal(g.id)
          }))
        ]}
        callout={{
          message: lang === 'es'
            ? 'Clínicas y Médicos: Regístrate para duplicar pautas en fichas de pacientes'
            : 'Healthcare Providers: Register to duplicate blueprints into patient charts',
          ctaLabel: lang === 'es' ? 'Alta Profesional →' : 'Register as Provider →',
          ctaHref: '/login?tab=register&role=doctor&redirect=/proto'
        }}
      />

      {/* ── 1. Hero Section ── */}
      <header className="proto-catalog-hero">
        <div className="proto-hero-pill">
          <FlaskConical size={14} />
          <span>{lang === 'es' ? 'Ecosistema de Vías Clínicas • Fuente Única de Verdad' : 'Ecosystem Clinical Pathways • Single Source of Truth'}</span>
        </div>
        <h1 className="proto-catalog-title">
          {t.catalogHeroTitle || t.catalogTitle || 'Clinical Protocols & Peptides Directory'}
        </h1>
        <p className="proto-catalog-subtitle">
          {t.catalogHeroSubtitle || t.catalogSubtitle || 'Explore standardized therapeutic protocols formulated with certified pharmaceutical grade compounds. Monotherapies and combined synergies with dosage schedules, titration phases, and laboratory surveillance.'}
        </p>
      </header>

      {/* ── 2. KPI Metrics Strip with Scope Indicator (Regla #22) ── */}
      <div className="proto-kpi-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasActiveFilters ? '#ea580c' : '#16a34a' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
              {hasActiveFilters
                ? (lang === 'es' ? `Vista Filtrada: ${filteredProtocols.length} de ${enrichedProtocols.length} protocolos activos` : `Active Filters View: ${filteredProtocols.length} of ${enrichedProtocols.length} protocols matching`)
                : (lang === 'es' ? `Base Global del Registro: ${enrichedProtocols.length} protocolos disponibles` : `Global Registry View: ${enrichedProtocols.length} standardized clinical protocols`)}
            </span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#003666',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '3px 9px',
                cursor: 'pointer'
              }}
            >
              {lang === 'es' ? 'Ver Base Completa (Limpiar Filtros)' : 'View Entire Database (Reset Filters)'}
            </button>
          )}
        </div>

        <div className="proto-kpi-strip">
          <div className="proto-kpi-card">
            <div className="proto-kpi-icon" style={{ background: '#eff6ff', color: '#0284c7' }}>
              <FlaskConical size={22} />
            </div>
            <div className="proto-kpi-body">
              <div className="proto-kpi-title">{t.kpiActiveProtocolsTitle || 'ACTIVE PROTOCOLS'}</div>
              <div className="proto-kpi-val">{hasActiveFilters ? filteredProtocols.length : enrichedProtocols.length}</div>
              <div className="proto-kpi-subtitle">{t.kpiActiveProtocolsSub || 'Standardized pathways in registry'}</div>
            </div>
          </div>

          <div className="proto-kpi-card">
            <div className="proto-kpi-icon" style={{ background: '#f0fdfa', color: '#0d9488' }}>
              <Sparkles size={22} />
            </div>
            <div className="proto-kpi-body">
              <div className="proto-kpi-title">{t.kpiGoalsTitle || 'THERAPEUTIC GOALS'}</div>
              <div className="proto-kpi-val">{GOAL_BUCKETS.length - 1}</div>
              <div className="proto-kpi-subtitle">{t.kpiGoalsSub || 'Target biomarker categories'}</div>
            </div>
          </div>

          <div className="proto-kpi-card">
            <div className="proto-kpi-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
              <Layers size={22} />
            </div>
            <div className="proto-kpi-body">
              <div className="proto-kpi-title">{t.kpiSsotTitle || 'DOSIMETRIC SSOT'}</div>
              <div className="proto-kpi-val">100%</div>
              <div className="proto-kpi-subtitle">{t.kpiSsotSub || 'Calibrated titration formulas'}</div>
            </div>
          </div>

          <div className="proto-kpi-card">
            <div className="proto-kpi-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
              <Clock size={22} />
            </div>
            <div className="proto-kpi-body">
              <div className="proto-kpi-title">{t.kpiCyclesTitle || 'CYCLE HORIZON'}</div>
              <div className="proto-kpi-val">4–28 wks</div>
              <div className="proto-kpi-subtitle">{t.kpiCyclesSub || 'Treatment duration spectrum'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Search & Goals Engine Card ── */}
      <section className="proto-search-engine-card">
        {/* Search Input */}
        <div className="proto-search-input-wrapper">
          <Search size={20} className="proto-search-icon" />
          <input
            id="protocol-global-search"
            type="text"
            className="proto-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
          />
          {searchQuery && (
            <button
              type="button"
              className="proto-search-clear-btn"
              onClick={() => {
                triggerHaptic('light');
                setSearchQuery('');
              }}
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Mobile Goal Category Selector (Mobile-First UX / Regla #23) */}
        <div className="proto-mobile-goal-wrapper">
          <label htmlFor="proto-mobile-goal-select" className="proto-mobile-goal-label">
            {lang === 'es' ? 'Objetivo Terapéutico:' : 'Therapeutic Goal:'}
          </label>
          <select
            id="proto-mobile-goal-select"
            className="proto-mobile-goal-select"
            value={selectedGoal}
            onChange={(e) => {
              triggerHaptic('selection');
              setSelectedGoal(e.target.value);
            }}
          >
            {GOAL_BUCKETS.map(g => {
              const count = goalCounts[g.id] || 0;
              const localizedLabel = GOAL_TRANSLATIONS[g.id]?.[lang] || g.label;
              return (
                <option key={g.id} value={g.id}>
                  {localizedLabel} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Goals Ribbon Selector (Desktop & Tablet Horizontal Strip) */}
        <div className="proto-goals-ribbon" role="tablist" aria-label={lang === 'es' ? 'Filtrar por objetivo terapéutico' : 'Filter by therapeutic goal'}>
          {GOAL_BUCKETS.map(g => {
            const Icon = g.icon;
            const isActive = selectedGoal === g.id;
            const count = goalCounts[g.id] || 0;
            const localizedLabel = GOAL_TRANSLATIONS[g.id]?.[lang] || g.label;

            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`proto-goal-chip ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedGoal(g.id);
                }}
              >
                <Icon size={15} className="proto-goal-icon" style={{ color: isActive ? '#ffffff' : g.color }} />
                <span className="proto-goal-label">{localizedLabel}</span>
                <span className="proto-goal-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls */}
        <div className="proto-controls-row">
          <div className="proto-controls-left">
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
              {lang === 'es' ? 'Filtros:' : 'Filters:'}
            </span>

            {/* Duration select */}
            <select
              className="proto-select-filter"
              value={durationFilter}
              onChange={(e) => {
                triggerHaptic('light');
                setDurationFilter(e.target.value);
              }}
            >
              <option value="all">{t.allDurations}</option>
              <option value="short">{t.shortCycle}</option>
              <option value="medium">{t.standardCycle}</option>
              <option value="long">{t.extendedCycle}</option>
            </select>

            {/* Phases select */}
            <select
              className="proto-select-filter"
              value={phasesFilter}
              onChange={(e) => {
                triggerHaptic('light');
                setPhasesFilter(e.target.value);
              }}
            >
              <option value="all">{t.allStructures}</option>
              <option value="single">{t.singlePhase}</option>
              <option value="titration">{t.titrationPhase}</option>
            </select>

            {/* Sort select */}
            <select
              className="proto-select-filter"
              value={sortBy}
              onChange={(e) => {
                triggerHaptic('light');
                setSortBy(e.target.value);
              }}
            >
              <option value="relevance">{t.sortRecommended}</option>
              <option value="duration-desc">{t.sortDurationDesc}</option>
              <option value="duration-asc">{t.sortDurationAsc}</option>
              <option value="phases-desc">{lang === 'es' ? 'Fases: Mayor complejidad' : 'Phases: Highest complexity'}</option>
              <option value="name-asc">{t.sortNameAsc}</option>
            </select>
          </div>

          <div className="proto-controls-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Dual View Mode Switcher */}
            <div className="proto-view-switcher" role="radiogroup" aria-label="Visual view mode">
              <button
                type="button"
                className={`proto-view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                onClick={() => { triggerHaptic('selection'); setViewMode('list'); }}
                title={lang === 'es' ? 'Vista Lista (Compacta)' : 'Compact List View'}
              >
                <List size={14} />
                <span>{lang === 'es' ? 'Lista' : 'List'}</span>
              </button>
              <button
                type="button"
                className={`proto-view-btn ${viewMode === 'cards' ? 'is-active' : ''}`}
                onClick={() => { triggerHaptic('selection'); setViewMode('cards'); }}
                title={lang === 'es' ? 'Vista Tarjetas' : 'Cards Grid View'}
              >
                <LayoutGrid size={14} />
                <span>{lang === 'es' ? 'Tarjetas' : 'Cards'}</span>
              </button>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={13} />
                <span>{t.resetFilters}</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="proto-active-filters-strip">
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{lang === 'es' ? 'Filtros Activos:' : 'Active Filters:'}</span>
            {searchQuery && (
              <span className="proto-filter-badge">
                {lang === 'es' ? 'Búsqueda' : 'Search'}: "{searchQuery}"
                <span className="proto-filter-badge-remove" onClick={() => setSearchQuery('')}>×</span>
              </span>
            )}
            {selectedGoal !== 'all' && (
              <span className="proto-filter-badge">
                {lang === 'es' ? 'Objetivo' : 'Goal'}: {GOAL_TRANSLATIONS[selectedGoal]?.[lang] || selectedGoal}
                <span className="proto-filter-badge-remove" onClick={() => setSelectedGoal('all')}>×</span>
              </span>
            )}
            {durationFilter !== 'all' && (
              <span className="proto-filter-badge">
                {lang === 'es' ? 'Duración' : 'Duration'}: {durationFilter}
                <span className="proto-filter-badge-remove" onClick={() => setDurationFilter('all')}>×</span>
              </span>
            )}
            {phasesFilter !== 'all' && (
              <span className="proto-filter-badge">
                {lang === 'es' ? 'Fases' : 'Phases'}: {phasesFilter}
                <span className="proto-filter-badge-remove" onClick={() => setPhasesFilter('all')}>×</span>
              </span>
            )}
          </div>
        )}
      </section>

      {/* ── 4. Scope Bar (Regla #22) ── */}
      <div className="proto-scope-bar">
        <div className="proto-scope-badge">
          <Check size={16} />
          <span>
            {lang === 'es' ? 'Mostrando' : 'Showing'} <strong>{filteredProtocols.length}</strong> {lang === 'es' ? 'de' : 'of'} <strong>{enrichedProtocols.length}</strong> {lang === 'es' ? 'protocolos clínicos disponibles' : 'available clinical protocols'}
          </span>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
          {selectedGoal !== 'all' 
            ? `${lang === 'es' ? 'Filtrado por' : 'Filtered by'}: ${GOAL_TRANSLATIONS[selectedGoal]?.[lang] || selectedGoal}` 
            : (lang === 'es' ? 'Mostrando Catálogo Completo (Agrupado por Objetivos)' : 'Showing Complete Directory (Grouped by Goals)')}
        </div>
      </div>

      {/* ── 5. Protocol Groups by Therapeutic Goals ── */}
      {groupedProtocols.length > 0 ? (
        <div className="proto-goal-groups-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {groupedProtocols.map(group => {
            const bucket = group.bucket;
            const BucketIcon = bucket.icon || FlaskConical;
            const groupTitle = GOAL_TRANSLATIONS[bucket.id]?.[lang] || bucket.label;

            return (
              <section key={bucket.id} className="proto-goal-section">
                {/* Section Goal Header */}
                <div className="proto-goal-section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="proto-goal-section-icon" style={{ background: bucket.bg, color: bucket.color }}>
                      <BucketIcon size={18} />
                    </div>
                    <div>
                      <h2 className="proto-goal-section-title">
                        {groupTitle}
                      </h2>
                      <div className="proto-goal-section-sub">
                        {group.protocols.length} {lang === 'es' ? 'protocolos clínicos disponibles' : 'clinical protocols available'}
                      </div>
                    </div>
                  </div>
                  <span className="proto-goal-section-count" style={{ background: bucket.bg, color: bucket.color, border: `1px solid ${bucket.color}30` }}>
                    {group.protocols.length}
                  </span>
                </div>

                {/* Content: List Mode (Default) vs Cards Mode */}
                {viewMode === 'list' ? (
                  <div className="proto-list-container">
                    {group.protocols.map(proto => {
                      const isExpanded = expandedIds.has(proto.cleanSlug);
                      const primaryGoalId = proto.mappedGoals.find(g => g !== 'all') || 'longevity';
                      const goalInfo = GOAL_BUCKETS.find(g => g.id === primaryGoalId) || GOAL_BUCKETS[0];
                      const localizedGoal = (GOAL_TRANSLATIONS[primaryGoalId]?.[lang] || goalInfo.label).split('&')[0].trim();

                      return (
                        <article key={proto.cleanSlug} className={`proto-list-item ${isExpanded ? 'is-expanded' : ''}`}>
                          {/* Main Compact Row */}
                          <div className="proto-list-row" onClick={() => toggleExpanded(proto.cleanSlug)}>
                            {/* Left: Expand chevron + Code + Title */}
                            <div className="proto-list-left">
                              <button
                                type="button"
                                className="proto-list-expand-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpanded(proto.cleanSlug);
                                }}
                                aria-expanded={isExpanded}
                                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>

                              <Link
                                href={`/proto/${proto.cleanSlug}`}
                                className="proto-list-title"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {proto.cleanName}
                              </Link>

                              <span
                                className="proto-card-goal-pill"
                                style={{ background: goalInfo.bg, color: goalInfo.color, border: `1px solid ${goalInfo.color}33` }}
                              >
                                {localizedGoal}
                              </span>
                            </div>

                            {/* Middle/Meta: Peptides count + Duration + Phases */}
                            <div className="proto-list-meta">
                              {proto.compounds.length > 0 && (
                                <span className="proto-list-chip-compounds">
                                  {proto.compounds.length} {lang === 'es' ? 'Péptidos' : 'Peptides'}
                                </span>
                              )}

                              <span className="proto-list-chip-spec">
                                <Clock size={12} style={{ color: '#0284c7' }} />
                                <span>{proto.durationWeeks}w</span>
                              </span>

                              <span className="proto-list-chip-spec">
                                <Layers size={12} style={{ color: '#0d9488' }} />
                                <span>{proto.phasesCount}ph</span>
                              </span>
                            </div>

                            {/* Right: Actions */}
                            <div className="proto-list-actions" onClick={(e) => e.stopPropagation()}>
                              <Link
                                href={`/proto/${proto.cleanSlug}`}
                                className="proto-card-btn-primary proto-list-btn-cta"
                                onClick={() => triggerHaptic('selection')}
                              >
                                <span>{t.viewTimeline}</span>
                                <ArrowRight size={13} />
                              </Link>

                              <button
                                type="button"
                                className="proto-card-btn-icon"
                                onClick={(e) => handleCopyCode(`https://med-peptides.com/proto/${proto.cleanSlug}`, e)}
                                title={t.copyProtocolLink}
                              >
                                {copiedId === `https://med-peptides.com/proto/${proto.cleanSlug}` ? (
                                  <Check size={15} style={{ color: '#16a34a' }} />
                                ) : (
                                  <Copy size={15} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Expandable Master-Detail Panel (Google Cloud Console Standard) */}
                          {isExpanded && (
                            <div className="proto-list-expanded">
                              <div className="proto-expanded-grid">
                                {/* Left Column: Clinical Rationale & Compounds */}
                                <div className="proto-expanded-left">
                                  <div className="proto-expanded-section-label">
                                    {lang === 'es' ? 'RESUMEN CLÍNICO & INDICACIÓN' : 'CLINICAL SUMMARY & INDICATION'}
                                  </div>
                                  <p className="proto-list-expanded-summary">
                                    {proto.summary}
                                  </p>

                                  {proto.compounds.length > 0 && (
                                    <div style={{ marginTop: '0.85rem' }}>
                                      <div className="proto-card-peptides-label" style={{ marginBottom: '6px' }}>
                                        {lang === 'es' ? 'Péptidos Activos Incluidos (Monografías):' : 'Included Active Peptides (Monographs):'}
                                      </div>
                                      <div className="proto-card-peptides-list" style={{ marginBottom: 0 }}>
                                        {proto.compounds.map((c, cIdx) => (
                                          <Link
                                            key={cIdx}
                                            href={`/p/${c.slug}`}
                                            target="_blank"
                                            className="proto-compound-chip"
                                            title={`Inspect ${c.name} technical monograph`}
                                          >
                                            <span>{c.name}</span>
                                            <ExternalLink size={10} />
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Right Column: Structured Administration Telemetry */}
                                <div className="proto-expanded-right">
                                  <div className="proto-expanded-section-label">
                                    {lang === 'es' ? 'PARÁMETROS DE ADMINISTRACIÓN' : 'ADMINISTRATION PARAMETERS'}
                                  </div>
                                  <div className="proto-telemetry-specs">
                                    <div className="proto-telemetry-item">
                                      <span className="proto-telemetry-key">{lang === 'es' ? 'Vía:' : 'Route:'}</span>
                                      <span className="proto-telemetry-val">Subcutaneous (SubQ)</span>
                                    </div>
                                    <div className="proto-telemetry-item">
                                      <span className="proto-telemetry-key">{lang === 'es' ? 'Frecuencia:' : 'Schedule:'}</span>
                                      <span className="proto-telemetry-val">{proto.phasesCount > 1 ? (lang === 'es' ? 'Titulación Progresiva' : 'Progressive Titration') : (lang === 'es' ? 'Monofásico Continuo' : 'Continuous Protocol')}</span>
                                    </div>
                                    <div className="proto-telemetry-item">
                                      <span className="proto-telemetry-key">{lang === 'es' ? 'Estructura:' : 'Phases:'}</span>
                                      <span className="proto-telemetry-val">{proto.phasesCount} {proto.phasesCount === 1 ? (lang === 'es' ? 'Fase' : 'Phase') : (lang === 'es' ? 'Fases' : 'Phases')} ({proto.durationWeeks}w {lang === 'es' ? 'total' : 'total'})</span>
                                    </div>
                                  </div>

                                  <div style={{ marginTop: '12px' }}>
                                    <Link
                                      href={`/proto/${proto.cleanSlug}`}
                                      className="proto-expanded-blueprint-btn"
                                      onClick={() => triggerHaptic('selection')}
                                    >
                                      <span>{lang === 'es' ? 'Explorar Blueprint Completo (Gantt) ↗' : 'Explore Full Clinical Blueprint (Gantt) ↗'}</span>
                                      <ExternalLink size={13} />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  /* Cards Mode */
                  <div className="proto-cards-grid">
                    {group.protocols.map(proto => {
                      const primaryGoalId = proto.mappedGoals.find(g => g !== 'all') || 'longevity';
                      const goalInfo = GOAL_BUCKETS.find(g => g.id === primaryGoalId) || GOAL_BUCKETS[0];
                      const localizedGoal = (GOAL_TRANSLATIONS[primaryGoalId]?.[lang] || goalInfo.label).split('&')[0].trim();

                      return (
                        <article key={proto.id || proto.cleanSlug} className="proto-card">
                          <div className="proto-card-top">
                            {/* Header: Category Goal Pill */}
                            <div className="proto-card-header">
                              <span
                                className="proto-card-goal-pill"
                                style={{ background: goalInfo.bg, color: goalInfo.color, border: `1px solid ${goalInfo.color}33` }}
                              >
                                {localizedGoal}
                              </span>
                            </div>

                            {/* Title linking to Public Protocol Page */}
                            <Link href={`/proto/${proto.cleanSlug}`} className="proto-card-title">
                              {proto.cleanName}
                            </Link>

                            {/* Summary */}
                            <p className="proto-card-summary">
                              {proto.summary}
                            </p>

                            {/* Included Active Peptides */}
                            {proto.compounds.length > 0 && (
                              <div>
                                <div className="proto-card-peptides-label">
                                  {lang === 'es' ? 'Péptidos Activos' : 'Active Peptides'} ({proto.compounds.length}):
                                </div>
                                <div className="proto-card-peptides-list">
                                  {proto.compounds.map((c, cIdx) => (
                                    <Link
                                      key={cIdx}
                                      href={`/p/${c.slug}`}
                                      target="_blank"
                                      className="proto-compound-chip"
                                      title={`Inspect ${c.name} technical monograph`}
                                    >
                                      <span>{c.name}</span>
                                      <ExternalLink size={10} />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Timeline Specs Strip */}
                            <div className="proto-card-specs">
                              <div className="proto-card-spec-item">
                                <Clock size={13} style={{ color: '#0284c7' }} />
                                <span>{proto.durationWeeks} {lang === 'es' ? 'Semanas' : 'Weeks'}</span>
                              </div>

                              <div className="proto-card-spec-item">
                                <Layers size={13} style={{ color: '#0d9488' }} />
                                <span>{proto.phasesCount} {proto.phasesCount === 1 ? (lang === 'es' ? 'Fase Continua' : 'Continuous Phase') : (lang === 'es' ? 'Fases de Titulación' : 'Titration Phases')}</span>
                              </div>

                              <div className="proto-card-spec-item">
                                <Shield size={13} style={{ color: '#16a34a' }} />
                                <span>{lang === 'es' ? 'Clínico' : 'Clinical'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Action Buttons */}
                          <div className="proto-card-actions">
                            <Link
                              href={`/proto/${proto.cleanSlug}`}
                              className="proto-card-btn-primary"
                              onClick={() => triggerHaptic('selection')}
                            >
                              <span>{t.viewTimeline}</span>
                              <ArrowRight size={14} />
                            </Link>

                            <button
                              type="button"
                              className="proto-card-btn-icon"
                              onClick={(e) => handleCopyCode(`https://med-peptides.com/proto/${proto.cleanSlug}`, e)}
                              title={t.copyProtocolLink}
                            >
                              {copiedId === `https://med-peptides.com/proto/${proto.cleanSlug}` ? (
                                <Check size={16} style={{ color: '#16a34a' }} />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="proto-empty-state">
          <div className="proto-empty-icon">
            <Search size={28} />
          </div>
          <h3 className="proto-empty-title">
            {t.noResultsTitle}
          </h3>
          <p className="proto-empty-subtitle">
            {t.noResultsSubtitle}
          </p>
          <button
            type="button"
            className="proto-empty-btn"
            onClick={handleResetFilters}
          >
            {t.resetFilters}
          </button>
        </div>
      )}

      {/* ── 6. Institutional Prudence & Medical Notice (Bottom of page per GCP Standards) ── */}
      <div className="pds-notice-card" style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>
        <ShieldCheck size={20} color="#0284c7" style={{ flexShrink: 0 }} />
        <div className="pds-notice-text">
          <strong>{lang === 'es' ? 'Compendio Clínico de Acceso Profesional' : 'Professional Clinical Reference Directory'}</strong>
          <span>
            {lang === 'es' 
              ? 'Todos los protocolos clínicos presentados en este directorio están formulados bajo estándares de farmacocinética molecular y guías clínicas internacionales (SURMOUNT, STEP, TRIUMPH). La administración requiere prescripción médica y supervisión por un profesional de la salud debidamente cualificado.'
              : 'All clinical protocols presented in this directory are formulated under molecular pharmacokinetics standards and international clinical trials (SURMOUNT, STEP, TRIUMPH). Administration requires medical prescription and supervision by a certified healthcare professional.'}
          </span>
        </div>
      </div>

      <footer style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        fontSize: '0.80rem',
        color: '#64748b',
        lineHeight: 1.5,
        textAlign: 'center'
      }}>
        <strong>{lang === 'es' ? 'Aviso Médico Profesional:' : 'Professional Medical Notice:'}</strong> {lang === 'es' ? 'Todos los protocolos clínicos presentados en este directorio están formulados bajo estándares de farmacocinética molecular y guías clínicas internacionales (SURMOUNT, STEP, TRIUMPH). La administración requiere prescripción médica y supervisión por un profesional de la salud debidamente cualificado.' : 'All clinical protocols presented in this directory are formulated under molecular pharmacokinetics standards and international clinical trials (SURMOUNT, STEP, TRIUMPH). Administration requires medical prescription and supervision by a certified healthcare professional.'}
      </footer>

      {/* ── Floating Atlas AI Technical Inquiry (Single consolidated AI button across all public views) ── */}
      <PublicAtlasAIDrawer
        contextType="catalog"
        contextAnchor={{
          type: 'protocols_catalog',
          totalProtocols: enrichedProtocols.length,
          activeFilterGoal: selectedGoal,
          activeSearchQuery: searchQuery
        }}
      />

      {/* Non-Intrusive Institutional Inquiry Drawer */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="protocols_directory"
        lang={lang}
      />
    </div>
  );
}
