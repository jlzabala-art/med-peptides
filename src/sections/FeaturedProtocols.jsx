/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Clock, Layers, Activity, ArrowRight, Flame, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPublicProtocols } from '../services/protocolStorage.js';
import { useQuery } from '@tanstack/react-query';
import { getProtocolTemplate } from '../repositories/protocolRepository';
import { useResponsive } from '../hooks/useResponsive';
import {
  trackProtocolView,
  trackProtocolMostUsedClick,
  trackProtocolLoadMore,
  trackProtocolFilterChange,
} from '../utils/analytics';
import { ProtocolPreviewModal } from '../components/protocol/ProtocolPreviewModal';
import '../styles/featured_protocols.css';

/* ─── Relevance badge sets ────────────────────────────────────── */
const MOST_USED_IDS = new Set([
  'wm_001', 'wm_002', 'wm_003', 'rec_001', 'rec_002', 'met_002',
]);
const RECENTLY_UPDATED_IDS = new Set([
  'lon_001', 'lon_002', 'neuro_001', 'cog_001', 'immune_001', 'immune_002',
]);

function getProtocolBadge(protocol) {
  const haystack = [
    protocol.id || '', protocol.protocol_id || '', protocol.short_code || '',
    protocol.category || '', protocol.primary_goal || '',
  ].join(' ').toLowerCase();

  if ([...MOST_USED_IDS].some(k => haystack.includes(k))) {
    return { label: 'Most Used', icon: <Flame size={10} />, bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' };
  }
  if ([...RECENTLY_UPDATED_IDS].some(k => haystack.includes(k))) {
    return { label: 'Updated', icon: <RefreshCw size={10} />, bg: '#EEF2FF', color: '#4F46E5', border: '#C7D2FE' };
  }
  return null;
}

/* ─── Helpers ────────────────────────────────────────────────── */
function getDuration(p) {
  if (p.duration_weeks) return `${p.duration_weeks}w`;
  if (p.timeline?.total_duration_weeks) return `${p.timeline.total_duration_weeks}w`;
  const phases = p.phases || p.phase_blueprints || [];
  if (phases.length) {
    const total = phases.reduce((s, ph) => s + (ph.duration_weeks || 0), 0);
    if (total) return `${total}w`;
  }
  return '—';
}

function getPhaseCount(p) {
  return (p.phase_blueprints || p.phases || []).length || null;
}

function getCompoundCount(p) {
  const sources = p.phase_blueprints?.length ? p.phase_blueprints : (p.phases || []);
  const names = new Set(
    sources.flatMap(ph => ph.drugs_used || ph.drugs || ph.compounds || [])
           .map(d => d.product_slug || d.product_title || d.name || d.compound)
           .filter(Boolean)
  );
  return names.size || null;
}

function humanize(str = '') {
  return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const STATUS_CONFIG = {
  approved: { color: '#10B981', bg: '#ECFDF5' },
  active:   { color: '#10B981', bg: '#ECFDF5' },
  review:   { color: '#F59E0B', bg: '#FFFBEB' },
  pending:  { color: '#F59E0B', bg: '#FFFBEB' },
  research: { color: '#6366F1', bg: '#EEF2FF' },
  draft:    { color: '#6366F1', bg: '#EEF2FF' },
  default:  { color: '#64748B', bg: '#F8FAFC' }
};

function getStatusStyle(status = '') {
  const s = status.toLowerCase();
  for (const [key, config] of Object.entries(STATUS_CONFIG)) {
    if (s.includes(key)) return config;
  }
  return STATUS_CONFIG.default;
}

const CATEGORY_COLORS = {
  'weight management': '#10B981',
  'peptide therapy':   'var(--color-primary)',
  'hormonal':          '#6366F1',
  'longevity':         '#D97706',
  'recovery':          '#F97316',
  'cognitive':         '#06B6D4',
};

function getCategoryColor(cat = '') {
  const key = cat.toLowerCase().trim();
  for (const [k, v] of Object.entries(CATEGORY_COLORS)) {
    if (key.includes(k)) return v;
  }
  return '#64748B';
}

/* ─── Normalizer ───────────────────────────────────────────── */
function normalizeBlueprint(bp) {
  const meta = bp.metadata || {};
  const legacy = bp.legacy_compatibility?.legacy_aliases || {};

  const durationWeeks =
    bp.protocol_duration_weeks ||
    bp.duration_weeks ||
    legacy.protocol_duration_weeks ||
    bp.timeline?.total_duration_weeks ||
    null;

  const primaryGoal =
    meta.primary_goal ||
    bp.primary_goal ||
    legacy.primary_goal ||
    bp.category ||
    '';

  const complexityLevel =
    meta.complexity_level ||
    bp.complexity_level ||
    bp.intensity ||
    '';

  const reviewStatus =
    meta.review?.review_status ||
    bp.protocol_review_status ||
    bp.approval_status ||
    bp.status ||
    '';

  const blueprints = bp.phase_blueprints || [];
  const phases     = bp.phases || [];

  const drugSource = blueprints.some(ph => (ph.drugs_used || ph.drugs || []).length > 0)
    ? blueprints
    : phases;

  const compound_count = (() => {
    const names = new Set(
      drugSource
        .flatMap(ph => ph.drugs_used || ph.drugs || ph.compounds || ph.peptides || [])
        .map(d => d.product_slug || d.product_title || d.name || d.compound || d.peptide_name)
        .filter(Boolean)
    );
    return names.size || null;
  })();

  const total_cost =
    bp.economics?.total_protocol_cost_estimate ??
    bp.economics?.estimated_total_cost ??
    bp.economics?.estimated_total_cost_usd ??
    bp.total_cost ??
    null;

  return {
    id:             bp.protocol_id || bp.id,
    short_code:     bp.protocol_id || null,
    version:        bp.protocol_version || bp.protocol_source_version || null,
    title:          bp.protocol_title || bp.name || bp.title || 'Unnamed Blueprint',
    category:       humanize(primaryGoal.replace(/_/g, ' ')),
    primary_goal:   primaryGoal,
    tagline:        bp.overview_summary || bp.tagline || bp.description || '',
    intensity:      complexityLevel,
    status:         reviewStatus,
    duration_weeks: durationWeeks,
    phase_count:    (blueprints.length || phases.length) || null,
    compound_count,
    total_cost,
    currency:       bp.economics?.currency || 'USD',
    tags:           bp.tags || [primaryGoal].filter(Boolean),
    slug:           bp.protocol_slug || bp.protocol_id || null,
    metadata:       meta,
    phases:         drugSource,
  };
}

/* ─── Components ────────────────────────────────────────────── */
function ProtocolCard({ protocol, onClick, highlighted, className = '', onQuickPreview }) {
  const displayTitle  = protocol.title       || 'Unnamed Blueprint';
  const complexity    = protocol.intensity   || null;
  const shortCode     = protocol.short_code  || null;
  const version       = protocol.version     || null;
  const status        = protocol.status      || '';
  const tagline       = protocol.tagline     || '';
  const duration      = protocol.duration_weeks ? `${protocol.duration_weeks}w` : getDuration(protocol);
  const phaseCount    = protocol.phase_count   ?? getPhaseCount(protocol);
  const compoundCount = protocol.compound_count ?? getCompoundCount(protocol);
  
  const statusStyle   = getStatusStyle(status);
  const catColor      = getCategoryColor(protocol.category || '');
  const category      = humanize(protocol.category || '');
  const badge         = getProtocolBadge(protocol);

  return (
    <div
      className={`protocol-card ${highlighted ? 'highlighted' : ''} ${className}`}
      onClick={onClick}
      style={{ borderLeftColor: catColor }}
    >
      <div className="card-category-row">
        {category && (
          <span className="card-category-chip" style={{ color: catColor, background: `${catColor}12` }}>
            {category}
          </span>
        )}
        {badge && (
          <span className="card-relevance-badge" style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}>
            {badge.icon} {badge.label}
          </span>
        )}
      </div>

      {complexity && <div className="card-complexity">{complexity}</div>}

      <h2 className="card-title">{displayTitle}</h2>

      <div className="card-meta">
        {shortCode && (
          <span className="card-id-badge">
            {shortCode}{version ? ` · v${version}` : ''}
          </span>
        )}
        {status && (
          <span className="card-status-badge" style={{ color: statusStyle.color, background: statusStyle.bg }}>
            <span className="status-dot" style={{ background: statusStyle.color }} />
            {status.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {tagline && <p className="card-tagline">{tagline}</p>}

      <div className="card-stats">
        {duration !== '—' && (
          <StatPill icon={<Clock size={11} />} value={duration} label="Duration" />
        )}
        {phaseCount && (
          <StatPill icon={<Layers size={11} />} value={phaseCount} label="Phases" />
        )}
        {compoundCount && (
          <StatPill icon={<Activity size={11} />} value={compoundCount} label="Peptides" />
        )}
      </div>

      <div className="card-footer">
        <span className="card-footer-nav">
          View Full Protocol <ArrowRight size={14} strokeWidth={2.5} />
        </span>
        {onQuickPreview && (
          <button
            className="card-quick-preview-btn"
            onClick={(e) => { e.stopPropagation(); onQuickPreview(protocol.id); }}
            aria-label="Quick preview"
            title="Quick Preview"
          >
            <Eye size={13} />
            Quick Preview
          </button>
        )}
      </div>
    </div>
  );
}

function StatPill({ icon, value, label }) {
  return (
    <span className="stat-pill">
      {icon}
      <span className="stat-pill-value">{value}</span>
      <span>{label}</span>
    </span>
  );
}

function ProtocolAccordionItem({ protocol, isOpen, onToggle, onClick }) {
  const duration      = protocol.duration_weeks ? `${protocol.duration_weeks}w` : getDuration(protocol);
  const phaseCount    = protocol.phase_count   ?? getPhaseCount(protocol);
  const compoundCount = protocol.compound_count ?? getCompoundCount(protocol);
  const catColor      = getCategoryColor(protocol.category || '');
  const status        = protocol.status || '';
  const statusStyle   = getStatusStyle(status);

  return (
    <div className={`protocol-accordion-item ${isOpen ? 'is-open' : ''}`} style={{ borderLeftColor: catColor }}>
      <div className="accordion-trigger" onClick={onToggle}>
        <div className="accordion-header-content">
          <h3 className="accordion-title">{protocol.title}</h3>
          <div className="accordion-mini-stats">
            {duration !== '—' && <span>{duration}</span>}
            {phaseCount && <span>{phaseCount} Phases</span>}
            {compoundCount && <span>{compoundCount} Peptides</span>}
          </div>
        </div>
        <div className="accordion-icon">{isOpen ? '−' : '+'}</div>
      </div>
      
      {isOpen && (
        <div className="accordion-content">
          {status && (
            <div className="accordion-status">
              <span className="card-status-badge" style={{ color: statusStyle.color, background: statusStyle.bg }}>
                <span className="status-dot" style={{ background: statusStyle.color }} />
                {status.replace(/_/g, ' ')}
              </span>
            </div>
          )}
          <p className="accordion-description">{protocol.tagline}</p>
          <div className="accordion-actions">
            <button className="view-protocol-btn" onClick={() => onClick(protocol.id)}>
              View Full Protocol <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Maps each UI filter label to the primary_goal keywords it owns.
// A protocol belongs to the FIRST filter whose keywords match its primary_goal.
// This enforces the single-category rule.
const FILTER_KEYWORDS = {
  'Weight':    ['weight', 'wm_', 'obesity', 'fat loss'],
  'Recovery':  ['recovery', 'repair', 'rec_', 'bpc', 'healing', 'tissue repair'],
  'Metabolic': ['metabolic', 'met_', 'insulin', 'glp', 'glucose', 'metabolism'],
  'Cognitive': ['cognitive', 'focus', 'cog_', 'neuro', 'nootropic', 'memory', 'brain'],
  'Sleep':     ['sleep', 'circadian', 'dsip', 'epitalon', 'delta wave'],
  'Hormonal':  ['hormonal', 'horm_', 'gh_', 'testosterone', 'peptide hormone', 'hormone'],
  'Longevity': ['longevity', 'lon_', 'epitalon', 'telomere', 'anti-aging', 'aging', 'age'],
  'Anti-Aging':['anti-aging', 'aging', 'epitalon', 'telomere', 'age'],
  'Immune':    ['immune', 'immune_', 'immunity'],
  'Energy':    ['energy', 'mitochondrial', 'mots', 'atp', 'fatigue'],
  'Aesthetic': ['aesthetic', 'skin', 'sa_', 'hair', 'collagen'],
};

const PROTOCOL_FILTERS = ['Weight', 'Recovery', 'Metabolic', 'Cognitive', 'Sleep', 'Hormonal', 'Longevity', 'Immune', 'Energy', 'Aesthetic'];

/** Returns the single canonical UI-filter category for a protocol (first match wins). */
function getProtocolPrimaryFilter(protocol) {
  const haystack = [
    protocol.primary_goal || '',
    protocol.category || '',
    protocol.id || '',
    protocol.short_code || '',
    ...(protocol.tags || []),
  ].join(' ').toLowerCase();

  for (const [filter, keywords] of Object.entries(FILTER_KEYWORDS)) {
    if (keywords.some(k => haystack.includes(k))) return filter;
  }
  return null; // belongs to no known category
}

/** Single-category filter: a protocol matches a filter only if that is its PRIMARY category. */
function matchesFilter(protocol, filter) {
  return getProtocolPrimaryFilter(protocol) === filter;
}

function matchesSearch(protocol, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [
    protocol.title || '', protocol.category || '',
    protocol.primary_goal || '', protocol.tagline || '',
    ...(protocol.tags || []),
  ].join(' ').toLowerCase().includes(needle);
}

function CategoryAccordion({ category, protocols, isActive, onToggle, onProtocolClick }) {
  const [visibleCount, setVisibleCount] = useState(4);
  const [openProtocolId, setOpenProtocolId] = useState(null);
  const accordionRef = useRef(null);

  const itemsToShow = protocols.slice(0, visibleCount);

  useEffect(() => {
    if (isActive && accordionRef.current) {
      setTimeout(() => {
        accordionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  }, [isActive]);

  return (
    <div className={`category-accordion ${isActive ? 'is-active' : ''}`} ref={accordionRef}>
      <div className="category-trigger" onClick={onToggle}>
        <span className="category-name">
          {category} <span className="category-count">({protocols.length})</span>
        </span>
        <div className="category-icon">{isActive ? '▲' : '▼'}</div>
      </div>

      {isActive && (
        <div className="category-protocols-list">
          {itemsToShow.map((p, idx) => (
            <ProtocolAccordionItem
              key={p.id}
              protocol={p}
              isOpen={openProtocolId === p.id}
              onToggle={() => setOpenProtocolId(openProtocolId === p.id ? null : p.id)}
              onClick={onProtocolClick}
            />
          ))}
          
          {visibleCount < protocols.length && (
            <button 
              className="load-more-category-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setVisibleCount(v => v + 4);
              }}
            >
              Load More Protocols ({protocols.length - visibleCount} left)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeaturedProtocols({ searchQuery = '' }) {
  const navigate    = useNavigate();
  const sectionRef  = useRef(null);
  const sidebarRef  = useRef(null);
  const [activeFilter, setFilter] = useState(() => {
    const stored = localStorage.getItem('Atlas Health_sidebar_filter');
    // Validate stored value is still in the current filter list
    return stored && PROTOCOL_FILTERS.includes(stored) ? stored : 'Weight';
  });
  const [visibleCount, setVisibleCount] = useState(4);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(4);
  const isMobile = useResponsive(); // hook returns a boolean directly
  const observerTarget = useRef(null);

  const [resumedId, setResumedId] = useState(null);
  const [currentPage, setPage] = useState(0);

  const { data: rawProtocols = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ['publicProtocols'],
    queryFn: getPublicProtocols,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const error = queryError ? 'Could not load protocols. Please try again later.' : null;

  const protocols = useMemo(() => {
    return rawProtocols.map(p => normalizeBlueprint(p));
  }, [rawProtocols]);

  /* ── Quick Preview state ─────────────────────────────────────── */
  const [showPreview, setShowPreview]       = useState(false);
  const [previewData, setPreviewData]       = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  /* ── Persist & restore sidebar scroll position ─────────────── */
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    // Restore saved scroll position
    const savedScroll = localStorage.getItem('Atlas Health_sidebar_scroll');
    if (savedScroll !== null) {
      sidebar.scrollTop = parseInt(savedScroll, 10);
    }

    const handleScroll = () => {
      localStorage.setItem('Atlas Health_sidebar_scroll', sidebar.scrollTop);
    };

    sidebar.addEventListener('scroll', handleScroll, { passive: true });
    return () => sidebar.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── Persist active filter ───────────────────────────────────── */
  useEffect(() => {
    localStorage.setItem('Atlas Health_sidebar_filter', activeFilter);
  }, [activeFilter]);

  useEffect(() => { setPage(0); }, [activeFilter, searchQuery]);

  const [featured, filterHasResults] = useMemo(() => {
    let filtered = [];
    if (searchQuery) {
      filtered = protocols.filter(p => matchesSearch(p, searchQuery));
    } else {
      filtered = protocols.filter(p => matchesFilter(p, activeFilter));
    }

    // Sort: "Most Used" first, then rest
    const sorted = [...filtered].sort((a, b) => {
      const aIsMostUsed = getProtocolBadge(a)?.label === 'Most Used';
      const bIsMostUsed = getProtocolBadge(b)?.label === 'Most Used';
      if (aIsMostUsed && !bIsMostUsed) return -1;
      if (!aIsMostUsed && bIsMostUsed) return 1;
      return 0;
    });

    // If filter returns nothing and not a search, show all protocols as fallback
    if (!searchQuery && sorted.length === 0 && protocols.length > 0) {
      return [protocols.slice().sort((a, b) => {
        const aM = getProtocolBadge(a)?.label === 'Most Used';
        const bM = getProtocolBadge(b)?.label === 'Most Used';
        return aM === bM ? 0 : aM ? -1 : 1;
      }), false];
    }

    return [sorted, true];
  }, [protocols, activeFilter, searchQuery]);

  const matchedIds = useMemo(() => {
    if (!searchQuery) return null;
    return new Set(featured.map(p => p.id));
  }, [featured, searchQuery]);

  const groupedProtocols = useMemo(() => {
    if (!isMobile) return {};
    const groups = {};
    protocols.forEach(p => {
      const cat = p.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    // Sort protocols within groups by importance if needed
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => {
        const aIsMostUsed = getProtocolBadge(a)?.label === 'Most Used';
        const bIsMostUsed = getProtocolBadge(b)?.label === 'Most Used';
        if (aIsMostUsed && !bIsMostUsed) return -1;
        if (!aIsMostUsed && bIsMostUsed) return 1;
        return 0;
      });
    });
    return groups;
  }, [protocols, isMobile]);

  // Resume browsing logic
  useEffect(() => {
    if (loading || !featured.length) return;
    
    const lastId = localStorage.getItem('Atlas Health_last_protocol_id');
    if (lastId) {
      setResumedId(lastId);
      const index = featured.findIndex(p => p.id === lastId);
      if (index !== -1) {
        const targetPage = Math.floor(index / 4);
        setPage(targetPage);
        
        // Optional: clear the highlight after 3 seconds for a better UX
        setTimeout(() => setResumedId(null), 3000);
      }
    }
  }, [loading, featured]);

  /* ── Most Used: filter-aware, 1 per category, max 4 total ── */
  const mostUsedByCategory = useMemo(() => {
    if (!protocols.length) return [];
    const seen = new Set();
    const result = [];

    if (activeFilter && activeFilter !== 'All' && !searchQuery) {
      // Category mode: find the single most-used protocol in that category
      const categoryProtocols = protocols.filter(
        p => matchesFilter(p, activeFilter)
      );
      // Prefer one with the badge; fall back to first in category
      const leader =
        categoryProtocols.find(p => getProtocolBadge(p)?.label === 'Most Used') ||
        categoryProtocols[0];
      if (leader) {
        seen.add(leader.id);
        result.push({ category: leader.category || 'Other', protocol: leader });
      }
    } else if (!searchQuery) {
      // "All" mode: 1 per category (badge-prioritised), cap at 4
      const categoryOrder = [...new Set(protocols.map(p => p.category || 'Other'))];
      for (const cat of categoryOrder) {
        if (result.length >= 4) break;
        const mostUsed = protocols.find(
          p => (p.category || 'Other') === cat && getProtocolBadge(p)?.label === 'Most Used'
        );
        if (mostUsed && !seen.has(mostUsed.id)) {
          seen.add(mostUsed.id);
          result.push({ category: cat, protocol: mostUsed });
        }
      }
    }

    return result;
  }, [protocols, activeFilter, searchQuery]);

  // IDs already shown in the Most Used strip — exclude from grid to avoid repetition
  const stripIds = useMemo(
    () => new Set(mostUsedByCategory.map(({ protocol }) => protocol.id)),
    [mostUsedByCategory]
  );

  // Grid protocols: remove strip entries.
  // When a specific category filter is active, cap the TOTAL (strip + grid) at 4.
  // If the strip has 1 → grid gets 3. If strip is empty → grid gets 4.
  const gridProtocols = useMemo(() => {
    const withoutStrip = featured.filter(p => !stripIds.has(p.id));
    if (!searchQuery && activeFilter && activeFilter !== 'All') {
      const stripCount = mostUsedByCategory.length; // 0 or 1
      const gridCap = Math.max(0, 4 - stripCount);
      return withoutStrip.slice(0, gridCap);
    }
    return withoutStrip;
  }, [featured, stripIds, activeFilter, searchQuery, mostUsedByCategory]);

  // Calculate items to render for a standard grid (exactly 4 per page)
  const itemsToRender = gridProtocols.slice(currentPage * 4, (currentPage + 1) * 4);

  const handleCardClick = (id, source = 'filtered') => {
    const protocol = protocols.find(p => p.id === id);
    if (protocol) {
      trackProtocolView(protocol.title, id, protocol.category, source);
    }
    localStorage.setItem('Atlas Health_last_protocol_id', id);
    const targetSlug = protocol?.slug || protocol?.id || id;
    navigate(`/protocol/${targetSlug}`);
  };

  const handleNext = () => {
    if ((currentPage + 1) * 4 < gridProtocols.length) {
      const nextPage = currentPage + 1;
      setPage(nextPage);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      trackProtocolLoadMore(nextPage, activeFilter, 'next');
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setPage(prevPage);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      trackProtocolLoadMore(prevPage, activeFilter, 'previous');
    }
  };

  const handleQuickPreview = useCallback(async (id) => {
    setPreviewLoading(true);
    setPreviewData(null);
    setShowPreview(true);
    try {
      const fullProtocol = await getProtocolTemplate(id);
      setPreviewData(fullProtocol);
    } catch (err) {
      console.error('[FeaturedProtocols] Quick preview fetch failed:', err);
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  // Count protocols per category for filter badge labels
  const countPerCategory = useMemo(() => {
    const counts = {};
    PROTOCOL_FILTERS.forEach(f => {
      counts[f] = protocols.filter(p => matchesFilter(p, f)).length;
    });
    return counts;
  }, [protocols]);

  return (
    <>
    <section className="protocols-section" ref={sectionRef}>
      <div className="protocols-container">
        
        <div className="protocols-full-header">
          <div className="protocols-header">
            <p className="protocols-badge">Therapeutic Blueprints</p>
            <h2 className="protocols-title">
              Structured Clinical Programs
              {protocols.length > 0 && (
                <span style={{
                  marginLeft: '0.65rem',
                  fontSize: '0.55em',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)',
                  borderRadius: '999px',
                  padding: '0.15em 0.65em',
                  verticalAlign: 'middle',
                  letterSpacing: '0.02em',
                }}
                >{protocols.length} protocols</span>
              )}
            </h2>
            <p className="protocols-subtitle">
              Curated peptide-based protocols designed for specific metabolic and regenerative research objectives.
            </p>
          </div>
        </div>

        <div className="protocols-sidebar">

          {!searchQuery && (
            <div className="filter-grid" ref={sidebarRef}>
              {PROTOCOL_FILTERS.map(f => {
                const count = countPerCategory[f] ?? 0;
                return (
                  <button
                    key={f}
                    className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
                    onClick={() => {
                      setFilter(f);
                      trackProtocolFilterChange(f);
                    }}
                  >
                    {f}
                    {!loading && count > 0 && (
                      <span className="filter-chip-count">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="protocols-content">
          {loading ? (
            <div className="loading-grid">
              {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : error ? (
            <div className="error-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 1rem' }}>
              <p style={{ margin: 0 }}>{error}</p>
              <button
                onClick={() => { refetch(); }}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '8px',
                  background: 'var(--primary)', color: 'var(--color-bg-surface)',
                  border: 'none', cursor: 'pointer', fontSize: '0.875rem'
                }}
              >
                Retry
              </button>
            </div>
          ) : featured.length === 0 ? (
            <div className="empty-container">No research blueprints found for this selection.</div>
          ) : (
            <>
              {/* ── Most Used: 1 per category strip ──────────────── */}
              {!isMobile && !searchQuery && mostUsedByCategory.length > 0 && (
                <div className="most-used-strip">
                  <p className="most-used-label">
                    <Flame size={13} style={{ verticalAlign: 'middle', marginRight: '0.35rem', color: '#D97706' }} />
                    Most Used · Per Category
                  </p>
                  <div className="most-used-per-cat-grid">
                    {mostUsedByCategory.map(({ category, protocol: p }, idx) => (
                      <div key={`mu-${p.id}`} className="most-used-cat-block">
                        <span
                          className="most-used-cat-label"
                          style={{ color: getCategoryColor(category) }}
                        >
                          {humanize(category)}
                        </span>
                        <ProtocolCard
                          protocol={p}
                          onClick={() => {
                            trackProtocolMostUsedClick(p.title, p.id, idx);
                            handleCardClick(p.id, 'most_used');
                          }}
                          highlighted={p.id === resumedId}
                          className="most-used-card"
                          onQuickPreview={handleQuickPreview}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isMobile ? (
                <div className="protocols-category-accordion-list">
                  {Object.entries(groupedProtocols)
                    .slice(0, visibleCategoriesCount)
                    .map(([cat, ps]) => (
                      <CategoryAccordion
                        key={cat}
                        category={cat}
                        protocols={ps}
                        isActive={activeAccordion === cat}
                        onToggle={() => setActiveAccordion(activeAccordion === cat ? null : cat)}
                        onProtocolClick={handleCardClick}
                      />
                    ))}
                  
                  {visibleCategoriesCount < Object.keys(groupedProtocols).length && (
                    <button 
                      className="load-more-btn" 
                      style={{ marginTop: '1rem', width: '100%' }}
                      onClick={() => setVisibleCategoriesCount(v => v + 4)}
                    >
                      Load More Categories
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {!filterHasResults && activeFilter !== 'All' && (
                    <p style={{
                      fontSize: '0.8rem', color: 'var(--text-muted)',
                      marginBottom: '1rem', fontStyle: 'italic'
                    }}>
                      No protocols found for "{activeFilter}" — showing all available protocols.
                    </p>
                  )}
                  <div className="protocols-grid">
                    {itemsToRender.map((p, idx) => (
                      <ProtocolCard
                        key={`${p.id}-${idx}`}
                        protocol={p}
                        onClick={() => handleCardClick(p.id)}
                        highlighted={(matchedIds ? matchedIds.has(p.id) : false) || p.id === resumedId}
                        className=""
                        onQuickPreview={handleQuickPreview}
                      />
                    ))}
                  </div>
                </>
              )}

              {!isMobile && (
                <div className="pagination-container" style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  gap: '1.5rem', 
                  marginTop: '3rem' 
                }}>
                  <p className="progress-indicator">
                    Showing {currentPage * 4 + 1} - {Math.min((currentPage + 1) * 4, gridProtocols.length)} of {gridProtocols.length} protocols
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {currentPage > 0 && (
                      <button className="load-more-btn" onClick={handlePrevious}>
                        Previous 4
                      </button>
                    )}
                    {(currentPage + 1) * 4 < gridProtocols.length && (
                      <button className="load-more-btn" onClick={handleNext}>
                        Next 4
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>

    {/* ── Quick Preview Modal ────────────────────────────────────── */}
    {showPreview && (
      previewLoading ? (
        <div className="quick-preview-loading-overlay">
          <Loader2 size={32} className="quick-preview-spinner" />
          <span>Loading protocol…</span>
        </div>
      ) : previewData ? (
        <ProtocolPreviewModal
          protocol={previewData}
          onClose={() => { setShowPreview(false); setPreviewData(null); }}
        />
      ) : null
    )}
    </>
  );
}
