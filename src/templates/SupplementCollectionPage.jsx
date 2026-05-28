/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
/**
 * SupplementCollectionPage — Phase 1: shell + imports
 * Mirrors PeptideCollectionPage architecture.
 * Data sourced from src/data/supplements.js (static, no Firestore).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  LayoutGrid, List, Search, SlidersHorizontal, ArrowRight,
  X, Check, Tag, Leaf, Zap, Moon, Brain, Shield, Activity,
  Sparkles, Droplets, FlaskConical, Dumbbell,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getActiveSupplements } from '../repositories/supplementRepository';
import '../styles/collection_shared.css';
import CollectionHeader from '../components/collection/CollectionHeader';
import GoalCard from '../components/collection/GoalCard';
import CollectionSidebar, { SidebarSection } from '../components/collection/CollectionSidebar';
import FilterDrawer from '../components/collection/FilterDrawer';
import SharedChip from '../components/collection/SharedChip';
import ProductCard, { SkeletonCard } from '../components/collection/ProductCard';

const PAGE_SIZE = 20;

/* ── Supplement Category → Accent Color ─────────────────────────────────── */
const CATEGORY_COLOR = {
  'Metabolic & Weight':      '#16A34A', // green-600
  'Recovery & Repair':       '#EC4899', // pink-600
  'Longevity & Anti-Aging':  '#6D28D9', // violet-700
  'Cognitive & Mood':        '#0891B2', // cyan-600
  'Hormonal Optimization':   '#EA580C', // orange-600
  'Sleep & Circadian':       '#4F46E5', // indigo-600
  'Immune Support':          'var(--color-success)', // emerald-600
  'Other':                   '#0096CC', // blue
};
const DEFAULT_COLOR = '#0096CC';

/* ── Supplement Category → Icon ──────────────────────────────────────────── */
const CATEGORY_ICON = {
  'Metabolic & Weight':      Activity,
  'Recovery & Repair':       Zap,
  'Longevity & Anti-Aging':  Sparkles,
  'Cognitive & Mood':        Brain,
  'Hormonal Optimization':   Droplets,
  'Sleep & Circadian':       Moon,
  'Immune Support':          Shield,
  'Other':                   Tag,
};

const CATEGORY_INSIGHTS = {
  'Metabolic & Weight':      'High-purity therapeutic cofactors researched for metabolic efficiency, AMPK activation, and glucose homeostasis.',
  'Recovery & Repair':       'Systemic compounds focusing on structural tissue regeneration, cellular membrane repair, and inflammatory pathway modulation.',
  'Longevity & Anti-Aging':  'Sirtuin-activating compounds, NAD+ precursors, and cellular defense molecules optimized for healthspan support.',
  'Cognitive & Mood':        'Neuroactive adaptogens and structural lipids researched for synaptic plasticity, memory pathways, and neurotransmitter balance.',
  'Hormonal Optimization':   'Endocrine support cofactors and targeted modulators for physiological resilience and hormone signaling.',
  'Sleep & Circadian':       'Circadian synchronizers and GABAergic signaling supports researched for deep restorative sleep quality.',
  'Immune Support':          'Immunomodulatory agents and high-potency antioxidants focused on adaptive response optimization and thymic support.',
  'Other':                   'Specialized auxiliary compounds for broad-spectrum biochemical research and laboratory assays.',
};

function getCategoryColor(cat) {
  if (!cat) return DEFAULT_COLOR;
  const key = Object.keys(CATEGORY_COLOR).find(k =>
    cat.toLowerCase().includes(k.split(' ')[0].toLowerCase())
  );
  return key ? CATEGORY_COLOR[key] : DEFAULT_COLOR;
}

function getCategoryIcon(cat) {
  if (!cat) return Tag;
  const key = Object.keys(CATEGORY_ICON).find(k =>
    cat.toLowerCase().includes(k.split(' ')[0].toLowerCase())
  );
  return key ? CATEGORY_ICON[key] : Tag;
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

/* ── Map raw supplement entry → card shape ───────────────────────────────── */
function normalizeProduct(s, index) {
  const GOALS_MAP = {
    'cognitive_mood':        'Cognitive & Mood',
    'hormonal_optimization': 'Hormonal Optimization',
    'immune_support':        'Immune Support',
    'longevity_anti_aging':  'Longevity & Anti-Aging',
    'metabolic_weight':      'Metabolic & Weight',
    'recovery_repair':       'Recovery & Repair',
    'sleep_circadian':       'Sleep & Circadian',
  };

  const rawGoals = Array.isArray(s.canonicalGoals) && s.canonicalGoals.length > 0 
    ? s.canonicalGoals 
    : (Array.isArray(s.goals) && s.goals.length > 0 ? s.goals : []);

  const cleanGoals = rawGoals.map(g => GOALS_MAP[g] || g);
  const primaryGoal = cleanGoals.length > 0 ? cleanGoals[0] : (s.category || 'Other');
  
  const color = getCategoryColor(primaryGoal);

  const rawTags = Array.isArray(s.tags) && s.tags.length ? s.tags : [];
  const tags = rawTags.length ? rawTags.slice(0, 3) : [primaryGoal.split('&')[0].trim()];

  // Build a slug from name + index to keep each dosage variant unique
  const slug = `${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`;

  return {
    id:          slug,
    name:        s.name,
    slug,
    role:        s.objective || s.desc?.slice(0, 60) || primaryGoal,
    description: s.desc || '',
    dosage:      s.dosage || null,
    quantity:    s.quantity || null,
    priceUSD:    s.pricing?.retail?.perUnit ?? s.pricing?.wholesale?.perUnit ?? null,
    tags,
    color,
    category:    primaryGoal, // Keep for backward compatibility of card
    form:        s.quantity || null,           // e.g. "60 caps"
    isNew:       false,
    isPopular:   (s.analytics_usage_score ?? 0) > 5,
    analytics_usage_score: s.analytics_usage_score ?? 0,
    usage_score:           s.usage_score           ?? 0,
    search_count:          s.search_count           ?? 0,
    goals:                 cleanGoals,
    // Keep raw dosage for merging
    _rawDosages: s.dosage ? [String(s.dosage)] : [],
  };
}

/* ── Consolidate same-name entries → dosage range ──────────────────────── */
function consolidateByName(items) {
  const map = new Map();
  items.forEach(p => {
    const key = p.name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, { ...p, _rawDosages: [...p._rawDosages], variantCount: 1 });
    } else {
      const existing = map.get(key);
      existing.variantCount++;
      const merged = [...new Set([...existing._rawDosages, ...p._rawDosages])];
      existing._rawDosages = merged;
      existing.isPopular = existing.isPopular || p.isPopular;
      existing.analytics_usage_score += p.analytics_usage_score;
      // Rebuild dosage range string
      if (merged.length === 1) {
        existing.dosage = merged[0];
      } else if (merged.length > 1) {
        existing.dosage = `${merged[0]} – ${merged[merged.length - 1]}`;
      }
    }
  });
  return Array.from(map.values());
}

export default function SupplementCollectionPage({ onNavigate, onBack, toggleCompare }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  usePageMeta({
    title: 'Research-Grade Supplement Catalog | Med-Peptides',
    description: 'Browse our catalog of scientifically-sourced, research-grade supplements. Filter by biological goal, category, and compound tags.',
    canonicalUrl: 'https://Med-Peptides-app-27a3a.web.app/collection/supplements',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://Med-Peptides-app-27a3a.web.app/' },
        { '@type': 'ListItem', position: 2, name: 'Supplement Catalog', item: 'https://Med-Peptides-app-27a3a.web.app/collection/supplements' },
      ],
    },
  });

  const [allSupplements, setAllSupplements] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage]       = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  /* Lock body scroll while mobile filter drawer is open */
  useEffect(() => {
    document.body.style.overflow = showMobileFilters ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showMobileFilters]);

  /* Filter state */
  const [activeFilters, setActiveFilters] = useState({
    category: null,
    tags:     [],
    search:   '',
    sort:     'name-asc',
  });

  /* Pre-apply ?category= query param on first load */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setActiveFilters(prev => ({ ...prev, category: decodeURIComponent(cat) }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Load + normalize supplements from Firestore (cached via supplementRepository) */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getActiveSupplements()
      .then((rawSupplements) => {
        if (cancelled) return;
        const normalized = rawSupplements
          .filter(s => s.status === 'active' || !s.status)
          .map((s, i) => normalizeProduct(s, i));
        const consolidated = consolidateByName(normalized);
        setAllSupplements(consolidated);
      })
      .catch((err) => console.warn('[SupplementCollectionPage] load error:', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ── Filter option lists (sorted by count desc) ── */
  const categoryOptions = useMemo(() => {
    const map = {};
    allSupplements.forEach(p => {
      if (p.category) map[p.category] = (map[p.category] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allSupplements]);

  const tagOptions = useMemo(() => {
    const map = {};
    allSupplements.forEach(p => (p.tags || []).forEach(t => {
      map[t] = (map[t] || 0) + 1;
    }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 20);
  }, [allSupplements]);

  /* ── Derived: filtered + sorted list ── */
  const filteredSupplements = useMemo(() => {
    let list = [...allSupplements];

    if (activeFilters.category)
      list = list.filter(p => p.category === activeFilters.category);

    if (activeFilters.tags.length)
      list = list.filter(p => activeFilters.tags.every(t => p.tags.includes(t)));

    if (activeFilters.search) {
      const q = activeFilters.search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    /* sort */
    switch (activeFilters.sort) {
      case 'name-asc':    list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc':   list.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'popular':     list.sort((a, b) => b.analytics_usage_score - a.analytics_usage_score); break;
      default: break;
    }
    return list;
  }, [allSupplements, activeFilters]);

  /* ── Paginated slice ── */
  const displaySupplements = useMemo(
    () => filteredSupplements.slice(0, page * PAGE_SIZE),
    [filteredSupplements, page]
  );
  const hasMore = displaySupplements.length < filteredSupplements.length;

  /* ── Derived booleans ── */
  const hasActiveFilters =
    !!activeFilters.category ||
    activeFilters.tags.length > 0 ||
    !!activeFilters.search;

  /* ── Handlers ── */
  const toggleCategory = (cat) => {
    setPage(1);
    setActiveFilters(prev => ({ ...prev, category: prev.category === cat ? null : cat }));
  };
  const toggleTag = (tag) => {
    setPage(1);
    setActiveFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  };
  const clearAllFilters = () => {
    setPage(1);
    setActiveFilters({ category: null, tags: [], search: '', sort: 'name-asc' });
  };
  const handleCardClick = (p) => navigate(`/supplements/${p.slug}`);
  const handleSearchChange = (e) => {
    setPage(1);
    setActiveFilters(prev => ({ ...prev, search: e.target.value }));
  };

  return (
    <div className="pc-page">
      <CollectionHeader 
        title="Supplement Catalog"
        subtitle={loading ? 'Loading supplements...' : `Browse ${allSupplements.length} active supplements`}
        searchQuery={activeFilters.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search supplements by name or goal..."
      />

      <div className="col-layout">
        {/* SIDEBAR */}
        <CollectionSidebar>
          {/* ── Goals (first) ── */}
          {categoryOptions.length > 0 && (
            <SidebarSection title="Goals">
              <div className="pc-goal-pill-list">
                {categoryOptions.map(([cat, count]) => {
                  const Icon = getCategoryIcon(cat);
                  const color = getCategoryColor(cat);
                  return (
                    <GoalFilterButton
                      key={cat}
                      label={cat}
                      count={count}
                      color={color}
                      Icon={Icon}
                      isActive={activeFilters.category === cat}
                      onClick={() => toggleCategory(cat)}
                    />
                  );
                })}
              </div>
            </SidebarSection>
          )}

          {tagOptions.length > 0 && (
            <SidebarSection title="Specific Tags">
              {tagOptions.map(([tag, count]) => (
                <SharedChip 
                  key={tag}
                  label={`${tag} (${count})`}
                  isActive={activeFilters.tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
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
          
          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="pc-active-filters" style={{ marginBottom: '2rem' }}>
              {activeFilters.category && (
                <button className="pc-active-pill" onClick={() => toggleCategory(activeFilters.category)}>
                  {activeFilters.category} <X size={12} />
                </button>
              )}
              {activeFilters.tags.map(tag => (
                <button key={tag} className="pc-active-pill" onClick={() => toggleTag(tag)}>
                  {tag} <X size={12} />
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



          {/* ── Category Focus Panel ── */}
          <AnimatePresence mode="wait">
            {activeFilters.category && (
              <motion.div
                key={activeFilters.category}
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, cubicBezier: [0.34, 1.56, 0.64, 1] }}
                className="col-focus-panel"
                style={{ '--panel-accent': getCategoryColor(activeFilters.category) }}
              >
                <div className="col-focus-icon-box">
                  {React.createElement(getCategoryIcon(activeFilters.category), { size: 22 })}
                </div>
                <div>
                  <h3 className="col-focus-title">{activeFilters.category}</h3>
                  <p className="col-focus-desc">
                    {CATEGORY_INSIGHTS[activeFilters.category] || CATEGORY_INSIGHTS['Other']}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="pc-result-count">
              {loading ? '...' : `${filteredSupplements.length} supplements`}
            </span>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                className="pc-sort-select"
                value={activeFilters.sort}
                onChange={e => { setPage(1); setActiveFilters(prev => ({ ...prev, sort: e.target.value })); }}
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="popular">Most Popular</option>
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

          <motion.div 
            layout
            className={`col-grid ${viewMode === 'list' ? 'list-view' : ''}`}
          >
            <AnimatePresence mode="popLayout">
              {loading
                ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                : displaySupplements.map(p => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard
                        key={p.id}
                        title={p.name}
                        subtitle={p.role}
                        description={p.description}
                        tags={p.tags}
                        color={p.color}
                        badge={p.isPopular ? { text: 'Popular', type: 'popular' } : null}
                        footerLeft={p.dosage || p.quantity || ' '}
                        viewMode={viewMode}
                        onClick={() => handleCardClick(p)}
                        onCompareClick={toggleCompare ? () => toggleCompare(p) : undefined}
                      />
                    </motion.div>
                  ))
              }
            </AnimatePresence>
          </motion.div>

          {!loading && filteredSupplements.length === 0 && (
            <div className="pc-empty">
              <Leaf size={40} className="pc-empty-icon" />
              <p className="pc-empty-title">No supplements found</p>
              <p className="pc-empty-sub">Try adjusting your filters or search term.</p>
              <button className="pc-load-more-btn" style={{ marginTop: '0.5rem' }} onClick={clearAllFilters}>
                Clear filters
              </button>
            </div>
          )}

          {!loading && hasMore && (() => {
            const remaining = filteredSupplements.length - displaySupplements.length;
            const label = remaining === 1 ? 'Load 1 More' : `Load ${remaining} More`;
            return (
              <div className="pc-load-more-wrap">
                <p className="pc-progress-text">
                  Showing {displaySupplements.length} of {filteredSupplements.length} supplements
                </p>
                <button id="supplement-load-more" className="pc-load-more-btn" onClick={() => setPage(p => p + 1)}>
                  {label} <ArrowRight size={16} />
                </button>
              </div>
            );
          })()}

          {!loading && !hasMore && filteredSupplements.length > 0 && (
            <p className="pc-progress-text" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
              All {filteredSupplements.length} supplements loaded
            </p>
          )}

        </main>
      </div>

      <FilterDrawer 
        isOpen={showMobileFilters} 
        onClose={() => setShowMobileFilters(false)}
        title="Biological Goals & Filters"
      >
        {categoryOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Category</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categoryOptions.map(([cat, count]) => (
                <SharedChip 
                  key={cat}
                  label={`${cat} (${count})`}
                  isActive={activeFilters.category === cat}
                  onClick={() => toggleCategory(cat)}
                />
              ))}
            </div>
          </div>
        )}

        {tagOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Tags</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {tagOptions.map(([tag, count]) => (
                <SharedChip 
                  key={tag}
                  label={`${tag} (${count})`}
                  isActive={activeFilters.tags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="pc-modal-footer" style={{ marginTop: 'auto' }}>
          <button className="pc-modal-apply" onClick={() => setShowMobileFilters(false)}>
            Show {filteredSupplements.length} supplements
          </button>
        </div>
      </FilterDrawer>

      {/* Floating Mobile Filter Bar */}
      <div className="pc-mobile-floating-bar">
        <button 
          className="pc-mobile-fab"
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal size={18} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Explore Supplements</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{filteredSupplements.length} Results Active</span>
          </div>
        </button>
      </div>

    </div>
  );
}


