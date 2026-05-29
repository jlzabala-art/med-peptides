/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
/**
 * ProtocolCollectionPage — /collection/protocols
 *
 * Status: Completed.
 * Features:
 * - Guided 2-level filtering (Goals -> Tags)
 * - Firestore-backed data with useProtocols hook
 * - Complexity-based categorization
 * - Responsive grid and list views
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, List, Search, SlidersHorizontal,
  ArrowRight, FlaskConical, X,
  Brain, Moon, Activity, Shield,
  Zap, Sparkles, Droplets, Tag,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/collection_shared.css';
import CollectionHeader from '../components/collection/CollectionHeader';
import GoalCard from '../components/collection/GoalCard';
import CollectionSidebar, { SidebarSection } from '../components/collection/CollectionSidebar';
import FilterDrawer from '../components/collection/FilterDrawer';
import SharedChip from '../components/collection/SharedChip';
import ProductCard, { SkeletonCard } from '../components/collection/ProductCard';
import { getAllProtocols, getProtocolTemplate } from '../repositories/protocolRepository.js';
import { ProtocolPreviewModal } from '../components/protocol/ProtocolPreviewModal';

/* ─────────────────────────────────────────────────────────────
   DATA CONSTANTS
   ───────────────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

/**
 * primary_goal → accent color
 * Sourced from the 16 bundle files' metadata.primary_goal values.
 */
export const GOAL_COLOR = {
  metabolic_weight:      '#16A34A', // green-600
  recovery_repair:       '#EC4899', // pink-600
  cognitive_mood:        '#0891B2', // cyan-600
  sleep_circadian:       '#4F46E5', // indigo-600
  longevity_anti_aging:  '#6D28D9', // violet-700
  hormonal_optimization: '#EA580C', // orange-600
  immune_support:        'var(--color-success)', // emerald-600
};

const DEFAULT_GOAL_COLOR = '#0096CC';

/**
 * Returns the hex color for a given primary_goal string.
 * Falls back gracefully to the default brand color.
 */
export function getGoalColor(goal) {
  if (!goal) return DEFAULT_GOAL_COLOR;
  // Direct lookup first
  if (GOAL_COLOR[goal]) return GOAL_COLOR[goal];
  // Partial keyword match (e.g. "weight_management_combo" → weight_management)
  const key = Object.keys(GOAL_COLOR).find(k =>
    goal.toLowerCase().includes(k.replace(/_/g, '')) ||
    k.includes(goal.toLowerCase().split('_')[0])
  );
  return key ? GOAL_COLOR[key] : DEFAULT_GOAL_COLOR;
}

/** Human-readable labels for primary_goal keys */
export const GOAL_LABEL = {
  metabolic_weight:      'Metabolic & Weight',
  recovery_repair:       'Recovery & Repair',
  cognitive_mood:        'Cognitive & Mood',
  sleep_circadian:       'Sleep & Circadian',
  longevity_anti_aging:  'Longevity & Anti-Aging',
  hormonal_optimization: 'Hormonal Optimization',
  immune_support:        'Immune Support',
};

/** primary_goal key → Lucide icon component */
const GOAL_ICON = {
  metabolic_weight:      Activity,
  recovery_repair:       Zap,
  cognitive_mood:        Brain,
  sleep_circadian:       Moon,
  longevity_anti_aging:  Sparkles,
  hormonal_optimization: Droplets,
  immune_support:        Shield,
};

const GOAL_INSIGHTS = {
  metabolic_weight:      'Advanced strategies for metabolic flexibility, glucose regulation, and sustainable tissue composition.',
  recovery_repair:       'Clinical protocols focused on structural integrity, systemic recovery, and inflammatory resolution.',
  cognitive_mood:        'Neuro-optimization research targeting neurogenesis, synaptic plasticity, and cognitive resilience.',
  sleep_circadian:       'Homeostatic restoration of circadian signaling and deep-recovery cycle optimization.',
  longevity_anti_aging:  'Pioneering research into cellular health, biological age deceleration, and tissue rejuvenation.',
  hormonal_optimization: 'Precision endocrine signaling and targeted GH secretagogue research protocols.',
  immune_support:        'Comprehensive immunomodulatory research for thymic health and adaptive response optimization.',
};

export function getGoalLabel(goal) {
  if (!goal) return 'General';
  if (GOAL_LABEL[goal]) return GOAL_LABEL[goal];
  // Prettify unknown keys: underscores → spaces, title-case
  return goal
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** complexity_level → display config */
export const COMPLEXITY_CONFIG = {
  standard: { label: 'Standard',  cssClass: 'standard' },
  moderate: { label: 'Moderate',  cssClass: 'moderate' },
  advanced: { label: 'Advanced',  cssClass: 'advanced' },
};

export function getComplexityConfig(level) {
  return COMPLEXITY_CONFIG[level?.toLowerCase()] ?? { label: 'Standard', cssClass: 'standard' };
}

/* ── Sidebar goal pill button ─────────────────────────────────────────────── */
function GoalFilterButton({ label, count, color, Icon, isActive, onClick }) {
  return (
    <button
      className={`pc-goal-pill${isActive ? ' active' : ''}`}
      onClick={onClick}
      style={{ '--gpill-color': color }}
    >
      <span className="pc-goal-pill-icon" style={{ color: isActive ? 'var(--color-bg-surface)' : color }}>
        {Icon && <Icon size={14} />}
      </span>
      <span className="pc-goal-pill-label">{label}</span>
      <span className="pc-goal-pill-count">{count}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   NORMALIZE PROTOCOL
   Converts a raw Firestore doc OR a local bundle JSON object
   into a flat card-ready shape.
   ───────────────────────────────────────────────────────────── */

/**
 * Extracts the list of phase titles from phase_blueprints or
 * generated_protocol_template.resolved_phases (Firestore variant).
 */
/** Safely extracts a string label from a phase entry, regardless of its shape. */
function phaseToString(p) {
  if (!p) return null;
  if (typeof p === 'string') return p;
  if (typeof p === 'object') {
    // Try common string fields in order of preference
    const label =
      p.phase_title   ??
      p.phase_key     ??
      p.title         ??
      p.name          ??
      p.phase_number  ??
      null;
    if (label != null) return String(label);
  }
  return null;
}

function extractPhases(doc) {
  const blueprints = Array.isArray(doc.phase_blueprints) ? doc.phase_blueprints : [];
  if (blueprints.length) {
    return blueprints
      .map(phaseToString)
      .filter(Boolean)
      .slice(0, 4); // cap to keep cards compact
  }
  // Firestore resolved_phases fallback
  const resolved = doc.generated_protocol_template?.resolved_phases;
  if (Array.isArray(resolved) && resolved.length) {
    return resolved.map(phaseToString).filter(Boolean).slice(0, 4);
  }
  return [];
}

/**
 * Extracts compound names used across all phases.
 * Returns an array of unique product titles (e.g. ['Semax', 'Selank']).
 */
/** Coerces every element to a string; drops nulls and objects we can't label. */
function toStringArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => {
      if (item == null) return null;
      if (typeof item === 'string') return item;
      if (typeof item === 'number' || typeof item === 'boolean') return String(item);
      if (typeof item === 'object') {
        // Try common label fields
        const label =
          item.phase_title  ??
          item.phase_key    ??
          item.title        ??
          item.name         ??
          item.product_title ??
          item.product_id   ??
          item.phase_number ??
          null;
        return label != null ? String(label) : null;
      }
      return null;
    })
    .filter(Boolean);
}

function extractCompounds(doc) {
  const blueprints = Array.isArray(doc.phase_blueprints) ? doc.phase_blueprints : [];
  const names = blueprints
    .flatMap(p => Array.isArray(p.drugs) ? p.drugs : [])
    .map(d => d.product_title || d.product_id)
    .filter(v => v != null && typeof v === 'string' && v.length > 0);
  return [...new Set(names)].slice(0, 5);
}

/**
 * Total duration — uses variant_rules or falls back to summing phases.
 */
function extractDuration(doc) {
  // Try to pull a representative age-group default
  const ageVariants = doc.variant_rules?.age_variants;
  if (ageVariants) {
    const durations = Object.values(ageVariants)
      .map(v => v.default_duration_weeks)
      .filter(Number.isFinite);
    if (durations.length) {
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      return min === max ? `${min} wks` : `${min}–${max} wks`;
    }
  }
  // Sum phase durations
  const blueprints = Array.isArray(doc.phase_blueprints) ? doc.phase_blueprints : [];
  const total = blueprints.reduce((sum, p) => sum + (p.default_duration_weeks || 0), 0);
  return total > 0 ? `${total} wks` : null;
}

/**
 * Extracts descriptive tags from the protocol for secondary filtering.
 */
function extractTags(doc) {
  if (Array.isArray(doc.tags) && doc.tags.length) return doc.tags;
  
  const goals = Array.isArray(doc.eligibility_rules?.supported_goals) 
    ? doc.eligibility_rules.supported_goals 
    : [];
  
  const conditions = Array.isArray(doc.eligibility_rules?.conditions)
    ? doc.eligibility_rules.conditions
    : [];

  // Lightweight extraction from title
  const title = (doc.protocol_title || doc.title || '').toLowerCase();
  const keywords = ['Fat Loss', 'Muscle Growth', 'Deep Sleep', 'Recovery', 'Energy', 'Anti-Aging', 'Mood', 'Brain Health'];
  const extracted = keywords.filter(k => title.includes(k.toLowerCase()));

  const combined = [...goals, ...conditions, ...extracted]
    .map(t => t.trim())
    .filter(t => t.length > 2 && t.length < 25);

  return [...new Set(combined)].slice(0, 8);
}

/**
 * Prettifies tag names by replacing underscores/hyphens with spaces 
 * and converting to Title Case.
 */
export function formatTagName(tag) {
  if (!tag) return '';
  return tag
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * normalizeProtocolCard — unified shape for the collection page card UI.
 * NOTE: This is intentionally separate from the canonical normalizeProtocol
 * in protocolSchemaAdapter.js. This function normalizes display metadata
 * (goal, complexity, color, phases, tags) for the collection page cards,
 * NOT the clinical protocol schema used by PDF rendering.
 *
 * @param {object} doc  — raw Firestore doc or local bundle JSON
 * @param {string} [source='firestore'] — 'firestore' | 'bundle'
 * @returns Normalized protocol card object for the collection UI
 */
export function normalizeProtocolCard(doc, source = 'firestore') {
  const meta = doc.metadata || {};
  let rawGoal = (meta.primary_goal || doc.primary_goal || 'general').toLowerCase();

  // ── Strict Goal Normalization ──
  // We map any "dirty" or legacy goal string to one of our 7 canonical keys.
  const canonicalGoals = Object.keys(GOAL_LABEL); // metabolic_weight, etc.
  
  let goal = 'metabolic_weight'; // fallback default
  
  // Try exact match
  if (canonicalGoals.includes(rawGoal)) {
    goal = rawGoal;
  } else {
    // Try keyword mapping
    const mapping = {
      weight: 'metabolic_weight',
      fat: 'metabolic_weight',
      loss: 'metabolic_weight',
      repair: 'recovery_repair',
      muscle: 'recovery_repair',
      brain: 'cognitive_mood',
      focus: 'cognitive_mood',
      mood: 'cognitive_mood',
      cognitive: 'cognitive_mood',
      circadian: 'sleep_circadian',
      sleep: 'sleep_circadian',
      aging: 'longevity_anti_aging',
      anti: 'longevity_anti_aging',
      longevity: 'longevity_anti_aging',
      hormone: 'hormonal_optimization',
      testo: 'hormonal_optimization',
      immune: 'immune_support',
      defense: 'immune_support'
    };

    const foundKey = Object.keys(mapping).find(key => rawGoal.includes(key));
    if (foundKey) {
      goal = mapping[foundKey];
    } else {
      // Last resort: find closest canonical key by substring
      const closest = canonicalGoals.find(cg => cg.split('_').some(part => rawGoal.includes(part)));
      if (closest) goal = closest;
    }
  }

  let complexity = (meta.complexity_level || doc.complexity_level || 'standard').toLowerCase();
  if (complexity === 'simple' || complexity === 'minimal') complexity = 'moderate';
  
  const color = getGoalColor(goal);


  return {
    // Identifiers
    id:          doc.id               || doc.protocol_id    || doc.protocol_slug,
    slug:        doc.protocol_slug    || doc.slug           || doc.id,
    source,

    // Display
    title:       doc.protocol_title   || doc.title          || doc.name || doc.id,
    goalKey:     goal,
    goalLabel:   getGoalLabel(goal),
    complexity,
    complexityConfig: getComplexityConfig(complexity),
    color,

    // Metadata
    version:     doc.protocol_version || meta.version       || null,
    status:      doc.status           || 'approved',
    active:      doc.active           ?? true,

    // Derived display data — always coerce to string[] so React never receives objects as children
    phases:      toStringArray(extractPhases(doc)),
    compounds:   toStringArray(extractCompounds(doc)),
    duration:    extractDuration(doc),

    // Tags for secondary filtering
    tags:        extractTags(doc),

    // Ranking / sorting
    createdAt:   meta.created_at      || doc.created_at     || null,
    updatedAt:   meta.updated_at      || doc.updated_at     || null,
  };
}

/* ─────────────────────────────────────────────────────────────
   SORT OPTIONS
   ───────────────────────────────────────────────────────────── */

export const SORT_OPTIONS = [
  { value: 'name-asc',    label: 'Name A–Z' },
  { value: 'name-desc',   label: 'Name Z–A' },
  { value: 'complexity',  label: 'Complexity' },
  { value: 'newest',      label: 'Newest' },
];

/* ─────────────────────────────────────────────────────────────
   useProtocols() — Firestore-only data hook
   Fetches ALL protocols from Firestore (no status filter).
   No bundle fallback — Firestore is the source of truth.
   ───────────────────────────────────────────────────────────── */

/**
 * useProtocols — fetches all protocols from Firestore.
 * Returns { protocols, loading, error }
 */
function useProtocols() {
  const [protocols, setProtocols] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getAllProtocols()
      .then(docs => {
        if (cancelled) return;
        console.log(`[ProtocolCollectionPage] Loaded ${docs.length} protocols from Firestore`);
        setProtocols(docs.map(d => normalizeProtocolCard(d, 'firestore')));
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[ProtocolCollectionPage] Firestore error:', err);
        setError(err.message || 'Failed to load protocols from Firestore');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { protocols, loading, error };
}

/* ─────────────────────────────────────────────────────────────
   FASE 3a — component shell + filter state + derived options
   ───────────────────────────────────────────────────────────── */

export default function ProtocolCollectionPage({ onNavigate, onBack }) {
  const navigate = useNavigate();
  const location = useLocation();

  usePageMeta({
    title: 'Clinical Protocol Library | Research Peptide Protocols | Atlas Health',
    description: 'Explore our library of research-grade clinical protocols. Filter by goal, complexity, and compounds. Scientifically structured peptide stacks for serious researchers.',
    canonicalUrl: 'https://Atlas Health-app-27a3a.web.app/collection/protocols',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://Atlas Health-app-27a3a.web.app/' },
        { '@type': 'ListItem', position: 2, name: 'Protocol Library', item: 'https://Atlas Health-app-27a3a.web.app/collection/protocols' },
      ],
    },
  });

  /* ── Data ── */
  const { protocols: allProtocols, loading, error } = useProtocols();

  /* ── View ── */
  const [viewMode, setViewMode]               = useState('grid'); // 'grid' | 'list'
  const [page, setPage]                       = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  /* ── Preview modal ── */
  const [selectedProtocol, setSelectedProtocol] = useState(null);  // full Firestore doc
  const [modalLoading, setModalLoading]         = useState(false);

  /* Lock body scroll while drawer or modal is open */
  useEffect(() => {
    const locked = showMobileFilters || !!selectedProtocol;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showMobileFilters, selectedProtocol]);

  /* ── Filter state (Guided 2-level system) ── */
  const [activeFilters, setActiveFilters] = useState({
    goal:       null, // Single active goal key
    tags:       [],   // Secondary tags
    complexity: [],   // 'standard' | 'moderate' | 'advanced'
    compound:   [],   // compound name strings (legacy support or extra filter)
    search:     '',
    sort:       'name-asc',
  });

  /* ── Pre-apply ?goal= query param ── */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const goal = params.get('goal');
    if (goal) {
      setActiveFilters(prev => ({ ...prev, goal: decodeURIComponent(goal) }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Derived filter options (restricted to 7 normalized goals) ── */
  const goalOptions = useMemo(() => {
    const counts = {};
    allProtocols.forEach(p => {
      // Only count if it's a normalized goal defined in GOAL_LABEL
      if (GOAL_LABEL[p.goalKey]) {
        counts[p.goalKey] = (counts[p.goalKey] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allProtocols]);

  /* ── Secondary Tag Options (Dynamic based on selected goal) ── */
  const secondaryTagOptions = useMemo(() => {
    if (!activeFilters.goal) return [];
    const counts = {};
    allProtocols
      .filter(p => p.goalKey === activeFilters.goal)
      .forEach(p => {
        p.tags.forEach(t => {
          counts[t] = (counts[t] || 0) + 1;
        });
      });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allProtocols, activeFilters.goal]);

  const complexityOptions = useMemo(() => {
    const counts = {};
    allProtocols.forEach(p => {
      if (p.complexity) counts[p.complexity] = (counts[p.complexity] || 0) + 1;
    });
    return Object.entries(counts);
  }, [allProtocols]);

  const compoundOptions = useMemo(() => {
    const counts = {};
    allProtocols.forEach(p =>
      p.compounds.forEach(c => { counts[c] = (counts[c] || 0) + 1; })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
  }, [allProtocols]);

  /* ── Filtered + sorted protocols ── */
  const filteredProtocols = useMemo(() => {
    let result = allProtocols;

    // Search
    const q = activeFilters.search.trim().toLowerCase();
    if (q) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.goalLabel.toLowerCase().includes(q) ||
        p.compounds.some(c => c.toLowerCase().includes(q))
      );
    }

    // Goal filter (Primary)
    if (activeFilters.goal) {
      result = result.filter(p => p.goalKey === activeFilters.goal);
    }

    // Tags filter (Secondary)
    if (activeFilters.tags.length) {
      result = result.filter(p =>
        activeFilters.tags.every(t => p.tags.includes(t))
      );
    }

    // Complexity filter
    if (activeFilters.complexity.length) {
      result = result.filter(p => activeFilters.complexity.includes(p.complexity));
    }

    // Compound filter
    if (activeFilters.compound.length) {
      result = result.filter(p =>
        activeFilters.compound.some(c => p.compounds.includes(c))
      );
    }

    // Sort
    const sorted = [...result];
    switch (activeFilters.sort) {
      case 'name-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'complexity':
        { const order = { standard: 0, moderate: 1, advanced: 2 };
          sorted.sort((a, b) =>
            (order[a.complexity] ?? 0) - (order[b.complexity] ?? 0) ||
            a.title.localeCompare(b.title)
          ); }
        break;
      case 'newest':
        sorted.sort((a, b) => {
          if (a.createdAt && b.createdAt)
            return new Date(b.createdAt) - new Date(a.createdAt);
          return b.title.localeCompare(a.title);
        });
        break;
      default:
        break;
    }
    return sorted;
  }, [allProtocols, activeFilters]);

  /* ── Pagination ── */
  const displayProtocols = useMemo(
    () => filteredProtocols.slice(0, page * PAGE_SIZE),
    [filteredProtocols, page]
  );
  const hasMore = displayProtocols.length < filteredProtocols.length;

  /* ── Helpers ── */
  const toggleGoal = (goalKey) => {
    setPage(1);
    setActiveFilters(prev => ({
      ...prev,
      goal: prev.goal === goalKey ? null : goalKey,
      tags: [], // Clear tags when goal changes
    }));
  };

  const toggleFilter = (key, value) => {
    setPage(1);
    setActiveFilters(prev => {
      const list = prev[key];
      return {
        ...prev,
        [key]: list.includes(value) ? list.filter(v => v !== value) : [...list, value],
      };
    });
  };

  const clearAllFilters = () => {
    setPage(1);
    setActiveFilters({ goal: null, tags: [], complexity: [], compound: [], search: '', sort: 'name-asc' });
  };

  const hasActiveFilters =
    activeFilters.goal ||
    activeFilters.tags.length ||
    activeFilters.complexity.length ||
    activeFilters.compound.length ||
    activeFilters.search;

  const handleDetailClick = useCallback((protocol) => {
    const target = `/protocol/${protocol.slug || protocol.id}`;
    if (onNavigate) onNavigate(protocol.slug || protocol.id);
    else navigate(target);
  }, [onNavigate, navigate]);

  const handleCardClick = useCallback(async (protocol) => {
    if (modalLoading) return;
    setModalLoading(true);
    try {
      // Fetch the full Firestore doc so the modal gets all clinical fields
      const fullDoc = await getProtocolTemplate(protocol.slug || protocol.id);
      if (fullDoc) {
        setSelectedProtocol(fullDoc);
      } else {
        // Slug lookup failed — fall back to page navigation
        const target = `/protocol/${protocol.slug}`;
        if (onNavigate) onNavigate(protocol.slug);
        else navigate(target);
      }
    } catch (err) {
      console.error('[ProtocolCollectionPage] handleCardClick fetch error:', err);
      // On error, fall back to full-page navigation
      const target = `/protocol/${protocol.slug}`;
      if (onNavigate) onNavigate(protocol.slug);
      else navigate(target);
    } finally {
      setModalLoading(false);
    }
  }, [modalLoading, onNavigate, navigate]);

  /* ── Render (Fase 3b layout + Fase 3c card grid + Fase 3d mobile modal) ── */
  const activeCount =
    (activeFilters.goal ? 1 : 0) +
    activeFilters.tags.length +
    activeFilters.complexity.length +
    activeFilters.compound.length +
    (activeFilters.search ? 1 : 0);

  return (
    <div className="pc-page-wrapper">
    <div className="pc-page">
      <CollectionHeader 
        title="Protocol Library"
        subtitle={loading ? 'Loading protocols...' : `Browse ${allProtocols.length} clinical protocols`}
        searchQuery={activeFilters.search}
        onSearchChange={val => { setPage(1); setActiveFilters(prev => ({ ...prev, search: val })); }}
        searchPlaceholder="Search protocols by clinical focus..."
      />

      <div className="col-layout">
        {/* SIDEBAR */}
        <CollectionSidebar>
          {/* ── Goals (first) ── */}
          {goalOptions.length > 0 && (
            <SidebarSection title="Goals">
              <div className="pc-goal-pill-list">
                {goalOptions.map(([goalKey, count]) => (
                  <GoalFilterButton
                    key={goalKey}
                    label={getGoalLabel(goalKey)}
                    count={count}
                    color={getGoalColor(goalKey)}
                    Icon={GOAL_ICON[goalKey] ?? Tag}
                    isActive={activeFilters.goal === goalKey}
                    onClick={() => toggleGoal(goalKey)}
                  />
                ))}
              </div>
            </SidebarSection>
          )}

          {complexityOptions.length > 0 && (
            <SidebarSection title="Complexity">
              {complexityOptions.map(([key, count]) => {
                const cfg = COMPLEXITY_CONFIG[key] || { label: key, cssClass: key };
                return (
                  <SharedChip 
                    key={key}
                    label={`${cfg.label} (${count})`}
                    isActive={activeFilters.complexity.includes(key)}
                    onClick={() => toggleFilter('complexity', key)}
                  />
                );
              })}
            </SidebarSection>
          )}

          {compoundOptions.length > 0 && (
            <SidebarSection title="Compounds">
              {compoundOptions.map(([name, count]) => (
                <SharedChip 
                  key={name}
                  label={`${formatTagName(name)} (${count})`}
                  isActive={activeFilters.compound.includes(name)}
                  onClick={() => toggleFilter('compound', name)}
                />
              ))}
            </SidebarSection>
          )}

          {activeFilters.goal && secondaryTagOptions.length > 0 && (
            <SidebarSection title="Refine Tags">
              {secondaryTagOptions.map(([tag, count]) => (
                <SharedChip 
                  key={tag}
                  label={`${formatTagName(tag)} (${count})`}
                  isActive={activeFilters.tags.includes(tag)}
                  onClick={() => toggleFilter('tags', tag)}
                />
              ))}
            </SidebarSection>
          )}
          
          {hasActiveFilters && (
            <button className="pc-clear-link" onClick={clearAllFilters} style={{ marginTop: '1rem' }}>
              Clear all filters
            </button>
          )}
        </CollectionSidebar>

        {/* MAIN CONTENT */}
        <main className="col-main">
          

          {/* ── Goal Focus Panel ── */}
          <AnimatePresence mode="wait">
            {activeFilters.goal && (
              <motion.div
                key={activeFilters.goal}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  background: `linear-gradient(135deg, ${getGoalColor(activeFilters.goal)}11 0%, ${getGoalColor(activeFilters.goal)}22 100%)`,
                  border: `1px solid ${getGoalColor(activeFilters.goal)}33`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: getGoalColor(activeFilters.goal),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                  boxShadow: `0 4px 12px ${getGoalColor(activeFilters.goal)}44`
                }}>
                  {React.createElement(GOAL_ICON[activeFilters.goal] || Tag, { size: 24 })}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{GOAL_LABEL[activeFilters.goal]}</h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {GOAL_INSIGHTS[activeFilters.goal]}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="pc-active-filters" style={{ marginBottom: '2rem' }}>
              {activeFilters.goal && (
                <button className="pc-active-pill" onClick={() => toggleGoal(activeFilters.goal)}>
                  {getGoalLabel(activeFilters.goal)} <X size={12} />
                </button>
              )}
              {activeFilters.tags.map(t => (
                <button key={t} className="pc-active-pill" onClick={() => toggleFilter('tags', t)}>
                  {formatTagName(t)} <X size={12} />
                </button>
              ))}
              {activeFilters.complexity.map(c => (
                <button key={c} className="pc-active-pill" onClick={() => toggleFilter('complexity', c)}>
                  {COMPLEXITY_CONFIG[c]?.label ?? c} <X size={12} />
                </button>
              ))}
              {activeFilters.compound.map(c => (
                <button key={c} className="pc-active-pill" onClick={() => toggleFilter('compound', c)}>
                  {formatTagName(c)} <X size={12} />
                </button>
              ))}
              {activeFilters.search && (
                <button className="pc-active-pill" onClick={() => { setPage(1); setActiveFilters(prev => ({ ...prev, search: '' })); }}>
                  "{activeFilters.search}" <X size={12} />
                </button>
              )}
              <button className="pc-active-pill pc-active-pill--clear" onClick={clearAllFilters}>
                Clear all
              </button>
            </div>
          )}



          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="pc-result-count">
              {loading ? '...' : `${filteredProtocols.length} protocols`}
            </span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                className="pc-sort-select"
                value={activeFilters.sort}
                onChange={e => { setPage(1); setActiveFilters(prev => ({ ...prev, sort: e.target.value })); }}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                className="pc-mobile-filter-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal size={15} />
                <span className="pc-filter-badge-mobile">Filters</span>
              </button>
            </div>
          </div>

          {error ? (
            <div className="pc-empty">
              <FlaskConical size={48} className="pc-empty-icon" />
              <p className="pc-empty-title">Error loading protocols</p>
              <p className="pc-empty-sub">{error}</p>
              <button className="pc-load-more-btn" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className={`col-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredProtocols.length === 0 ? (
            <div className="pc-empty">
              <FlaskConical size={48} className="pc-empty-icon" />
              <p className="pc-empty-title">No protocols match your filters</p>
              <p className="pc-empty-sub">Try adjusting your search or clearing some filters.</p>
              {hasActiveFilters && (
                <button className="pc-load-more-btn" style={{ marginTop: '0.5rem' }} onClick={clearAllFilters}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <motion.div 
                layout
                className={`col-grid ${viewMode === 'list' ? 'list-view' : ''}`}
              >
                <AnimatePresence mode="popLayout">
                  {displayProtocols.map(protocol => (
                    <motion.div
                      key={protocol.id || protocol.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard
                        title={protocol.title}
                        subtitle={protocol.goalLabel}
                        tags={protocol.phases.length > 0 ? protocol.phases : protocol.compounds}
                        color={protocol.color}
                        badge={{ text: protocol.complexityConfig.label, type: 'complexity' }}
                        footerLeft={protocol.duration || ' '}
                        viewMode={viewMode}
                        onClick={() => handleCardClick(protocol)}
                        onSecondaryClick={() => handleDetailClick(protocol)}
                        primaryLabel="Overview"
                        secondaryLabel="Details"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              {hasMore && (
                <div className="pc-load-more-wrap">
                  <p className="pc-progress-text">
                    Showing {displayProtocols.length} of {filteredProtocols.length} protocols
                  </p>
                  <button
                    className="pc-load-more-btn"
                    onClick={() => setPage(p => p + 1)}
                  >
                    Load more protocols <ArrowRight size={16} />
                  </button>
                </div>
              )}
              {!hasMore && filteredProtocols.length > 0 && (
                <p className="pc-progress-text" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
                  All {filteredProtocols.length} protocols loaded
                </p>
              )}
            </>
          )}

        </main>
      </div>

      <FilterDrawer 
        isOpen={showMobileFilters} 
        onClose={() => setShowMobileFilters(false)}
        title="Protocol Filters"
      >
        {complexityOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Complexity</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {complexityOptions.map(([key, count]) => {
                const cfg = COMPLEXITY_CONFIG[key] || { label: key, cssClass: key };
                return (
                  <SharedChip 
                    key={key}
                    label={`${cfg.label} (${count})`}
                    isActive={activeFilters.complexity.includes(key)}
                    onClick={() => toggleFilter('complexity', key)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {compoundOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Compounds</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {compoundOptions.map(([name, count]) => (
                <SharedChip 
                  key={name}
                  label={`${formatTagName(name)} (${count})`}
                  isActive={activeFilters.compound.includes(name)}
                  onClick={() => toggleFilter('compound', name)}
                />
              ))}
            </div>
          </div>
        )}

        {activeFilters.goal && secondaryTagOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Refine Tags</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {secondaryTagOptions.map(([tag, count]) => (
                <SharedChip 
                  key={tag}
                  label={`${formatTagName(tag)} (${count})`}
                  isActive={activeFilters.tags.includes(tag)}
                  onClick={() => toggleFilter('tags', tag)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="pc-modal-footer" style={{ marginTop: 'auto' }}>
          <button className="pc-modal-apply" onClick={() => setShowMobileFilters(false)}>
            Show {filteredProtocols.length} protocols
          </button>
        </div>
      </FilterDrawer>

      {/* ── Protocol Preview Modal ── */}
      {selectedProtocol && (
        <ProtocolPreviewModal
          protocol={selectedProtocol}
          onClose={() => setSelectedProtocol(null)}
          updateCart={() => {}}
          stickyTotal={0}
          bundleAdded={false}
          localTier="retail"
        />
      )}

      {/* Floating Mobile Filter Bar */}
      <div className="pc-mobile-floating-bar">
        <button 
          className="pc-mobile-fab"
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal size={18} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Explore Protocols</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{filteredProtocols.length} Research Cycles</span>
          </div>
        </button>
      </div>
    </div>
    </div>
  );
}


/* ─────────────────────────────────────────────────────────────
   FASE 3b — Sub-components
   (defined after main export so they can reference constants above)
   ───────────────────────────────────────────────────────────── */

function GoalSelector({ options, activeGoal, onToggle }) {
  const goalIcons = {
    metabolic_weight:      <Activity size={24} />,
    recovery_repair:       <Zap size={24} />,
    cognitive_mood:        <Brain size={24} />,
    sleep_circadian:       <Moon size={24} />,
    longevity_anti_aging:  <Sparkles size={24} />,
    hormonal_optimization: <Droplets size={24} />,
    immune_support:        <Shield size={24} />,
  };

  return (
    <div className="prc-goal-grid">
      {options.map(([key, count]) => (
        <button
          key={key}
          className={`prc-goal-card ${activeGoal === key ? 'active' : ''}`}
          onClick={() => onToggle(key)}
          style={{ '--goal-color': getGoalColor(key) }}
        >
          <div className="prc-goal-card-icon">
            {goalIcons[key] || <FlaskConical size={24} />}
          </div>
          <span className="prc-goal-card-label">{getGoalLabel(key)}</span>
          <span className="prc-goal-card-count">{count}</span>
        </button>
      ))}
    </div>
  );
}

function FilterSidebar({
  complexityOptions, compoundOptions,
  activeFilters, onToggle, onClear,
}) {
  const hasActive =
    activeFilters.tags.length ||
    activeFilters.complexity.length ||
    activeFilters.compound.length;

  return (
    <div className="prc-filter-panel">
      {/* ── Complexity ── */}
      <section className="prc-filter-section">
        <h4 className="prc-filter-heading">Complexity</h4>
        <ul className="prc-filter-list">
          {complexityOptions.map(([key, count]) => {
            const cfg = COMPLEXITY_CONFIG[key] || { label: key, cssClass: key };
            return (
              <li key={key}>
                <label className="prc-filter-item">
                  <input
                    type="checkbox"
                    checked={activeFilters.complexity.includes(key)}
                    onChange={() => onToggle('complexity', key)}
                  />
                  <span className={`prc-complexity prc-complexity--${cfg.cssClass}`}>
                    {cfg.label}
                  </span>
                  <span className="prc-filter-count">{count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Compounds ── */}
      {compoundOptions.length > 0 && (
        <section className="prc-filter-section">
          <h4 className="prc-filter-heading">Compounds</h4>
          <ul className="prc-filter-list">
            {compoundOptions.map(([name, count]) => (
              <li key={name}>
                <label className="prc-filter-item">
                  <input
                    type="checkbox"
                    checked={activeFilters.compound.includes(name)}
                    onChange={() => onToggle('compound', name)}
                  />
                  <span className="prc-filter-label">{formatTagName(name)}</span>
                  <span className="prc-filter-count">{count}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Clear ── */}
      {hasActive && (
        <button className="prc-filter-clear" onClick={onClear}>
          Clear all filters
        </button>
      )}
    </div>
  );
}

