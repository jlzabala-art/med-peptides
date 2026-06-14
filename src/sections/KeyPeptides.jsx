import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Star from "lucide-react/dist/esm/icons/star";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Brain from "lucide-react/dist/esm/icons/brain";
import Activity from "lucide-react/dist/esm/icons/activity";
import Flame from "lucide-react/dist/esm/icons/flame";
import Shield from "lucide-react/dist/esm/icons/shield";
import Zap from "lucide-react/dist/esm/icons/zap";
import Beaker from "lucide-react/dist/esm/icons/beaker";
import Layers from "lucide-react/dist/esm/icons/layers";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Moon from "lucide-react/dist/esm/icons/moon";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
















import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getActiveProducts } from '../repositories/productRepository';
import priorityMap from "../config/peptide_priority_map.json";
import {
  trackPeptideView,
  trackPeptideSearch,
  trackPeptideLoadMore,
  trackPeptideFilterChange,
  trackKeyPeptideMostUsedView,
  trackKeyPeptideMostUsedClick,
  trackKeyPeptideCategoryFilter,
  trackKeyPeptideCardClick,
} from '../utils/analytics';
import '../styles/key_peptides.css';

/* ─── Category → accent color (kept for card accent bar & tags) ─────────── */
const CATEGORY_COLOR = {
  'Recovery & Repair':       '#f43f5e',
  'Metabolic & Weight':      '#8b5cf6',
  'Longevity & Anti-Aging':  'var(--color-success)',
  'Cognitive & Mood':        '#0ea5e9',
  'Sleep & Circadian':       '#818cf8',
  'Hormonal Optimization':   '#f59e0b',
  'Immune Support':          '#14b8a6',
  'Research Supplies':       '#DB2777',
  'Other Research Peptides': '#0096CC',
};

const FILTER_ICONS = {
  'Recovery & Repair':       <Activity size={14} />,
  'Metabolic & Weight':      <Zap size={14} />,
  'Longevity & Anti-Aging':  <Sparkles size={14} />,
  'Cognitive & Mood':        <Brain size={14} />,
  'Sleep & Circadian':       <Moon size={14} />,
  'Hormonal Optimization':   <Droplets size={14} />,
  'Immune Support':          <ShieldCheck size={14} />,
  'Research Supplies':       <Beaker size={14} />,
  'Other Research Peptides': <FlaskConical size={14} />,
  'All':                     <Layers size={14} />,
  'New':                     <Sparkles size={14} />
};
const DEFAULT_COLOR = '#0096CC';

/* ALL_CATEGORIES removed — categories are now derived dynamically from Firestore */

/* ─── Dynamic usage ranking ────────────────────────────────────────────── */
function rankByUsage(list) {
  return [...list].sort((a, b) => {
    const score = (p) =>
      (p.analytics_usage_score ?? 0) * 1e9 +
      (p.usage_score            ?? 0) * 1e6 +
      (p.view_count             ?? 0) * 1e3 +
      (p.search_count           ?? 0);
    const diff = score(b) - score(a);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}

/* ─── Map Firestore product doc → PeptideCard shape ────────────────────── */
function normalizeProduct(doc) {
  const cat   = doc.category || 'Other Research Peptides';
  const color = CATEGORY_COLOR[cat] ?? DEFAULT_COLOR;

  const rawTags = Array.isArray(doc.tags) && doc.tags.length ? doc.tags : [];
  const tags    = rawTags.length ? rawTags : [cat.split('&')[0].trim()];

  return {
    id:          doc.id,
    name:        doc.displayName || doc.name || doc.id,
    slug:        doc.slug        || doc.id,
    role:        doc.shortDescription || doc.subtitle || cat,
    description: doc.description || doc.shortDescription || '',
    dosage:      (() => {
                   const rawDosage = doc.dosage || doc.dose || doc.dosageRange || doc.strength
                     || (Array.isArray(doc.variants) && doc.variants.length
                           ? (doc.variants[0].strength || doc.variants[0].dosage || null)
                           : null);
                   return typeof rawDosage === 'object' && rawDosage !== null
                     ? `${rawDosage.min ?? ''}${rawDosage.max ? `–${rawDosage.max}` : ''} ${rawDosage.unit ?? ''} ${rawDosage.frequency ? `(${rawDosage.frequency.replace(/_/g, ' ')})` : ''}`.trim()
                     : rawDosage;
                 })(),
    tags,
    color,
    isNew:       doc.isNew     ?? false,
    isPopular:   doc.isPopular ?? false,
    category:    cat,
    category_main: doc.category_main || cat,
    /* usage-ranking fields (default 0 when absent) */
    analytics_usage_score: doc.analytics_usage_score ?? 0,
    usage_score:           doc.usage_score           ?? 0,
    view_count:            doc.view_count            ?? 0,
    search_count:          doc.search_count          ?? 0,
  };
}

/* ─── Badge helper ──────────────────────────────────────────────────────── */
function getPeptideBadge(peptide) {
  if (peptide.isPopular) return {
    label: 'Popular',
    icon:  <Star size={10} />,
    bg:    'rgba(217, 119, 6, 0.10)',
    color: '#D97706',
    border:'rgba(217, 119, 6, 0.25)',
  };
  if (peptide.isNew) return {
    label: 'New',
    icon:  <Sparkles size={10} />,
    bg:    'rgba(124, 58, 237, 0.10)',
    color: '#7C3AED',
    border:'rgba(124, 58, 237, 0.25)',
  };
  return null;
}

/* ─── Filter match ──────────────────────────────────────────────────────── */
function peptideMatchesFilter(peptide, filter) {
  if (!filter) return false;
  if (filter === 'All') return true;
  if (filter === 'New') return peptide.isNew;
  const catField = (peptide.category_main || peptide.category || 'Other').split('&')[0].trim();
  return catField.toLowerCase() === filter.toLowerCase();
}

/* ─── Skeleton card shown while loading ─────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="kp-skeleton-card">
      {[{ w: '60%', h: 36 }, { w: '80%', h: 18 }, { w: '90%', h: 12 }, { w: '40%', h: 10 }].map(({ w, h }, i) => (
        <div
          key={i}
          className="kp-skeleton-line"
          style={{ height: `${h}px`, width: w }}
        />
      ))}
    </div>
  );
}

/* ─── Peptide Card ──────────────────────────────────────────────────────── */
function PeptideCard({ peptide, onClick, onViewCategory, highlighted }) {
  const badge = getPeptideBadge(peptide);

  return (
    <motion.div
      className={`kp-card${highlighted ? ' kp-card--highlighted' : ''}`}
      style={{ '--kp-accent': peptide.color }}
      onClick={() => {
        trackPeptideView(peptide.name, peptide.slug, peptide.category);
        onClick();
      }}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Name + Icon + Badge row */}
      <div className="kp-card-top">
        <div
          className="kp-card-icon"
          style={{
            background: `${peptide.color}12`,
            border:     `1px solid ${peptide.color}25`,
          }}
        >
          <FlaskConical size={20} color={peptide.color} strokeWidth={2} />
        </div>

        <div className="kp-card-name-stack">
          <div className="kp-card-name-row">
            <span className="kp-card-name">{peptide.name}</span>
            {badge && (
              <span
                className="kp-inline-badge"
                style={{
                  background:  badge.bg,
                  color:       badge.color,
                  borderColor: badge.border,
                }}
              >
                {badge.icon} {badge.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clinical role */}
      <p className="kp-card-role">{peptide.role}</p>

      {/* Dosage */}
      {(() => {
        const raw = (peptide.allDosages && peptide.allDosages.length > 0)
          ? peptide.allDosages
          : peptide.dosage ? [peptide.dosage] : [];
        if (raw.length === 0) return null;

        const parsed = raw.map(d => {
          const m = String(d).match(/^([\d.]+)\s*([a-zA-Z/]+)/);
          return m ? { val: parseFloat(m[1]), unit: m[2].toLowerCase() } : null;
        }).filter(Boolean);

        let label;
        if (parsed.length === 0) {
          label = raw.length === 1 ? raw[0] : `${raw[0]}–${raw[raw.length - 1]}`;
        } else if (parsed.length === 1) {
          label = `${parsed[0].val}${parsed[0].unit}`;
        } else {
          const nums = parsed.map(p => p.val);
          const unit = parsed[0].unit;
          const min  = Math.min(...nums);
          const max  = Math.max(...nums);
          label = `${min}–${max}${unit}/vial`;
        }

        return (
          <div className="kp-dosage-info">
            <span className="kp-dosage-info-label">Potency:</span>
            <span className="kp-dosage-info-value">{label}</span>
          </div>
        );
      })()}

      {/* Tags */}
      <div className="kp-card-tags">
        {peptide.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="kp-tag"
            style={{
              color:           peptide.color,
              background:      `${peptide.color}10`,
              borderColor:     `${peptide.color}20`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA row */}
      <div className="kp-card-cta-row">
        <div className="kp-card-cta">
          Details <ArrowRight size={14} strokeWidth={2.5} />
        </div>
        {onViewCategory && (
          <button
            className="kp-card-cta-secondary"
            onClick={(e) => {
              e.stopPropagation();
              onViewCategory(peptide.category);
            }}
          >
            Collection <Layers size={14} strokeWidth={2} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─── Section ───────────────────────────────────────────────────────────── */
export default function KeyPeptides({ onSelectProduct, searchQuery = '' }) {
  const navigate = useNavigate();

  /* Firestore fetch */
  const [peptides, setPeptides]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeFilter, setFilter]       = useState(null); // closed by default on mobile/catalog
  const [currentPage, setPage]          = useState(0);
  const [retryKey, setRetryKey]         = useState(0);
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 768);
  const [gridVisible, setGridVisible]   = useState(true);
  const sectionRef                       = useRef(null);
  const gridRef                          = useRef(null);
  const accordionRefs                    = useRef({});
  // Ref mirror of `loading` — avoids stale closure inside setTimeout callbacks
  const loadingRef                       = useRef(true);

  /* Scroll to grid with 80px header offset */
  const scrollToGrid = useCallback(() => {
    if (!gridRef.current) return;
    const top = gridRef.current.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  /* Track window resize for mobile layout */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadingRef.current = true;
    setError(null);

    // Timeout safety: if Firestore hangs for > 20s, show error.
    // Uses loadingRef (not `loading` state) to avoid stale closure.
    const timeoutId = setTimeout(() => {
      if (!cancelled && loadingRef.current) {
        console.warn('[KeyPeptides] Fetch timeout reached');
        setError('Loading is taking longer than expected. Please check your connection.');
        setLoading(false);
        loadingRef.current = false;
      }
    }, 20000);

    getActiveProducts()
      .then((docs) => {
        if (cancelled) return;
        clearTimeout(timeoutId);

        if (!docs || docs.length === 0) {
          console.warn('[KeyPeptides] No products found in catalog');
          setPeptides([]);
          setLoading(false);
          return;
        }

        /* Deduplicate by normalised name */
        const groups = {};
        for (const doc of docs) {
          if (doc.category === 'Research Supplies') continue;
          const name = doc.displayName || doc.name || doc.id || '';
          const key  = name.trim().toLowerCase() || doc.id || `_unknown_${Math.random()}`;

          if (!groups[key]) {
            groups[key] = { ...normalizeProduct(doc), allDosages: [] };
          }

          const d = doc.dosage || doc.dose || doc.strength;
          if (d && !groups[key].allDosages.includes(d)) {
            groups[key].allDosages.push(d);
          }
        }

        const unique = Object.values(groups);

        /* Sort: Popular (Most Used) → priority map → alphabetical */
        const flatPriorityList = Array.from(new Set(Object.values(priorityMap).flat()));
        const getPriority = (name) => {
          const lower = name.toLowerCase();
          for (let i = 0; i < flatPriorityList.length; i++) {
            if (lower.includes(flatPriorityList[i].toLowerCase())) return i;
          }
          return Infinity;
        };

        unique.sort((a, b) => {
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          const prioA = getPriority(a.name);
          const prioB = getPriority(b.name);
          if (prioA !== prioB) return prioA - prioB;
          return a.name.localeCompare(b.name);
        });

        setPeptides(unique);

        // Auto-select first category if none active and not searching
        if (!activeFilter && !searchQuery && unique.length > 0) {
          const firstCat = (unique[0].category_main || unique[0].category || 'Other').split('&')[0].trim();
          if (firstCat) setFilter(firstCat);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        console.error('[KeyPeptides] fetch error:', err);
        setError('Could not load peptides. Please try again later.');
      })
      .finally(() => { 
        if (!cancelled) {
          clearTimeout(timeoutId);
          setLoading(false);
          loadingRef.current = false;
        }
      });

    return () => { 
      cancelled = true;
      loadingRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [retryKey, searchQuery]); // Added searchQuery to dependencies to ensure sync if needed

  /* Dynamic filter chips derived from live peptides list */
  const filterChips = useMemo(() => {
    if (peptides.length === 0) return [];
    const seen = new Set();
    const cats = [];
    for (const p of peptides) {
      const cat = (p.category_main || p.category || 'Other').split('&')[0].trim();
      if (!seen.has(cat)) { seen.add(cat); cats.push(cat); }
    }
    cats.sort();
    return cats; // 'All' removed — not useful
  }, [peptides]);

  /* Reset page when filter/search changes */
  useEffect(() => { setPage(0); }, [activeFilter, searchQuery]);

  /* ── Analytics: track search (debounced 600 ms) ─────────── */
  useEffect(() => {
    if (!searchQuery) return;
    const timer = setTimeout(() => trackPeptideSearch(searchQuery), 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ── Analytics: Most Used view — fires once after load ───── */
  useEffect(() => {
    if (!loading && mostUsed.length > 0) {
      trackKeyPeptideMostUsedView(mostUsed.length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  /* Most Used Peptides — fully dynamic ranking */
  const mostUsed = useMemo(() => {
    if (peptides.length === 0) return [];
    return rankByUsage(peptides).slice(0, 4);
  }, [peptides]);

  /* Slugs of the top-4 most-used — excluded from the category grid */
  const mostUsedSlugs = useMemo(() => new Set(mostUsed.map(p => p.slug)), [mostUsed]);

  /* Category results grid — excludes top-4, applies filter/search */
  const categoryVisible = useMemo(() => {
    let filtered = [];
    if (searchQuery) {
      const needle = searchQuery.toLowerCase();
      filtered = peptides.filter((p) =>
        [p.name, p.role, p.description, p.category, ...(Array.isArray(p.tags) ? p.tags : [])]
          .map(s => s ?? '').join(' ').toLowerCase().includes(needle)
      );
    } else {
      filtered = peptides
        .filter((p) => !mostUsedSlugs.has(p.slug))
        .filter((p) => peptideMatchesFilter(p, activeFilter));
    }
    return filtered;
  }, [peptides, mostUsedSlugs, activeFilter, searchQuery]);

  /* Max 6 items per category page, 4 for search/all */
  const PAGE_SIZE = searchQuery ? 4 : 6;
  const hasMultiplePages = categoryVisible.length > PAGE_SIZE;
  const categorySlice = categoryVisible.slice(0, (currentPage + 1) * PAGE_SIZE);

  /* Remaining count for dynamic Load More label */
  const remaining = Math.max(0, categoryVisible.length - categorySlice.length);
  const loadMoreLabel = remaining === 1
    ? 'Load 1 More Peptide'
    : `Load ${remaining} More Peptides`;
  const matchedSlugs = searchQuery ? new Set(categoryVisible.map((p) => p.slug)) : null;

  const handleNext = () => {
    if (remaining > 0) {
      const nextPage = currentPage + 1;
      setPage(nextPage);
      scrollToGrid();
      trackPeptideLoadMore(nextPage, activeFilter, isMobile ? 'mobile_accordion' : 'desktop');
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setPage(currentPage - 1);
      scrollToGrid();
    }
  };

  const getCategoryCount = (category) => {
    if (category === 'All') return peptides.length;
    if (category === 'New') return peptides.filter(p => p.isNew).length;
    return peptides.filter(p => {
      const cat = (p.category_main || p.category || 'Other').split('&')[0].trim();
      return cat.toLowerCase() === category.toLowerCase();
    }).length;
  };

  const handleFilterClick = (f) => {
    const prev = activeFilter;
    if (isMobile) {
      const isOpening = prev !== f;
      setFilter(isOpening ? f : null);
      if (isOpening) {
        trackPeptideFilterChange(f);
        trackKeyPeptideCategoryFilter(f, prev);
        setPage(0);
        // Phase C3 — scroll to start (sticky header offset via CSS scroll-margin-top)
        setTimeout(() => {
          const el = accordionRefs.current[f];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
    } else {
      /* Desktop Fade Logic */
      setGridVisible(false);
      setTimeout(() => {
        setFilter(f);
        trackPeptideFilterChange(f);
        trackKeyPeptideCategoryFilter(f, prev);
        setPage(0);
        setGridVisible(true);
        scrollToGrid();
      }, 175);
    }
  };

  return (
    <div className="kp-section" ref={sectionRef}>
      <div className="kp-container">

        {/* ── Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="kp-header"
        >
          <span className="kp-eyebrow">Peptide Catalog</span>
          <h2 className="kp-title">Key Peptides Available</h2>
          <p className="kp-subtitle">
            Core research peptides currently available in the catalog.
          </p>
        </motion.div>

        {/* ── Search Results or Category Content ── */}
        {loading ? (
          <div className="kp-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: '320px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="kp-grid">
            {categorySlice.map((p, idx) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <PeptideCard
                  peptide={p}
                  onClick={() => {
                    trackKeyPeptideCardClick(p.name, p.slug, p.category, 'filtered');
                    onSelectProduct ? onSelectProduct(p) : navigate(`/product/${p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : p.slug}`);
                  }}
                  onViewCategory={(cat) => navigate(`/collection/peptides?category=${encodeURIComponent(cat)}`)}
                  highlighted={matchedSlugs ? matchedSlugs.has(p.slug) : false}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Normal View (Not Searching) */
          <>
            {isMobile ? (
              /* ── Mobile Accordion Layout ── */
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                {!loading && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <button
                      className="kp-cta-pill"
                      onClick={() => navigate('/collection/peptides')}
                      aria-label={`View all ${peptides.length} peptides in the collection`}
                    >
                      <span className="kp-cta-pill-count">
                        <FlaskConical size={13} strokeWidth={2} />
                        {peptides.length} peptides
                      </span>
                      <span className="kp-cta-pill-action">
                        View Full Catalog <ArrowRight size={13} strokeWidth={2.5} />
                      </span>
                    </button>
                  </div>
                )}
                <div className="kp-accordion-list">
                  {!loading && mostUsed.length > 0 && (
                    <div 
                      ref={el => accordionRefs.current['Most Used'] = el}
                      className={`kp-accordion-item${activeFilter === 'Most Used' ? ' kp-accordion-item--expanded' : ''}`}
                    >
                      <button className="kp-accordion-header" onClick={() => handleFilterClick('Most Used')}>
                        <div className="kp-accordion-title">
                          <Star size={16} color="#D97706" fill="#D9770622" />
                          Most Used Peptides
                          <span className="kp-accordion-count">({mostUsed.length})</span>
                        </div>
                        <ChevronDown size={18} className="kp-accordion-chevron" />
                      </button>
                      {activeFilter === 'Most Used' && (
                        <div className="kp-accordion-content">
                          <div className="kp-grid">
                            {mostUsed.map((p, idx) => (
                              <PeptideCard
                                key={`featured-mob-${p.slug}`}
                                peptide={p}
                                onClick={() => {
                                  trackKeyPeptideMostUsedClick(p.name, p.slug, idx);
                                  onSelectProduct ? onSelectProduct(p) : navigate(`/product/${p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : p.slug}`);
                                }}
                                onViewCategory={(cat) => navigate(`/collection/peptides?category=${encodeURIComponent(cat)}`)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. Category Accordions */}
                  {!loading && filterChips.map((f) => {
                    const count = getCategoryCount(f);
                    if (count === 0) return null;
                    return (
                      <div 
                        key={f} 
                        ref={el => accordionRefs.current[f] = el}
                        className={`kp-accordion-item${activeFilter === f ? ' kp-accordion-item--expanded' : ''}`}
                      >
                        <button className="kp-accordion-header" onClick={() => handleFilterClick(f)}>
                          <div className="kp-accordion-title">
                            {FILTER_ICONS[f] || <FlaskConical size={16} />}
                            {f}
                            <span className="kp-accordion-count">({count})</span>
                          </div>
                          <ChevronDown size={18} className="kp-accordion-chevron" />
                        </button>
                        {activeFilter === f && (
                          <div className="kp-accordion-content">
                            <div className="kp-grid">
                              {categorySlice.map((p) => (
                                <PeptideCard
                                  key={p.slug}
                                  peptide={p}
                                  onClick={() => {
                                    trackKeyPeptideCardClick(p.name, p.slug, p.category, 'filtered');
                                    onSelectProduct ? onSelectProduct(p) : navigate(`/product/${p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : p.slug}`);
                                  }}
                                  onViewCategory={(cat) => navigate(`/collection/peptides?category=${encodeURIComponent(cat)}`)}
                                />
                              ))}
                            </div>
                            {remaining > 0 && (
                              <div className="kp-accordion-pagination">
                                <p className="progress-indicator">
                                  Showing {categorySlice.length} of {categoryVisible.length} peptides
                                </p>
                                <button className="kp-load-btn" onClick={handleNext}>{loadMoreLabel}</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* ── Desktop Grid Layout ── */
              <>
                {/* Most Used Peptides */}
                {!loading && mostUsed.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="kp-featured-section"
                  >
                    <h3 className="kp-featured-title">Most Used Peptides</h3>
                    <div className="kp-grid">
                      {mostUsed.map((p, idx) => (
                        <motion.div
                          key={`featured-${p.slug}`}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <PeptideCard
                            peptide={p}
                            onClick={() => {
                              trackKeyPeptideMostUsedClick(p.name, p.slug, idx);
                              onSelectProduct ? onSelectProduct(p) : navigate(`/product/${p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : p.slug}`);
                            }}
                            onViewCategory={(cat) => navigate(`/collection/peptides?category=${encodeURIComponent(cat)}`)}
                          />
                        </motion.div>
                      ))}
                    </div>
                    <div className="kp-featured-divider" />
                  </motion.div>
                )}

                {/* Category Filters */}
                {!loading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="kp-filters"
                  >
                    <div className="flex flex-wrap gap-3 items-center w-full">
                      {filterChips.map((f) => (
                        <button
                          key={f}
                          className={`kp-chip${activeFilter === f ? ' kp-chip--active' : ''}`}
                          onClick={() => handleFilterClick(f)}
                        >
                          {FILTER_ICONS[f] || <FlaskConical size={14} />}
                          {f} ({getCategoryCount(f)})
                        </button>
                      ))}
                      {/* Catalog CTA for Desktop filters row */}
                      <button
                        className="kp-cta-pill ml-auto"
                        onClick={() => navigate('/collection/peptides')}
                      >
                        <span className="kp-cta-pill-count">
                          {peptides.length} peptides
                        </span>
                        <span className="kp-cta-pill-action">
                          Full Catalog <ArrowRight size={13} strokeWidth={2.5} />
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}

                <div
                  ref={gridRef}
                  className="kp-grid"
                  style={{
                    opacity: gridVisible ? 1 : 0,
                    transition: 'opacity 175ms ease',
                  }}
                >
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    : categorySlice.map((p, idx) => (
                        <motion.div
                          key={p.slug}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <PeptideCard
                            peptide={p}
                            onClick={() => {
                              trackKeyPeptideCardClick(p.name, p.slug, p.category, 'filtered');
                              onSelectProduct ? onSelectProduct(p) : navigate(`/product/${p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : p.slug}`);
                            }}
                            onViewCategory={(cat) => navigate(`/collection/peptides?category=${encodeURIComponent(cat)}`)}
                            highlighted={matchedSlugs ? matchedSlugs.has(p.slug) : false}
                          />
                        </motion.div>
                      ))
                  }
                </div>

                {/* Explore full category catalog CTA */}
                {!loading && activeFilter !== 'All' && hasMultiplePages && (
                  <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                    <button
                      className="kp-explore-link"
                      onClick={() => navigate(`/collection/peptides?category=${encodeURIComponent(activeFilter)}`)}
                    >
                      Explore full {activeFilter} catalog <ArrowRight size={13} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Global Pagination (Desktop or Search only) ── */}
        {!loading && categoryVisible.length > 0 && (!isMobile || searchQuery) && hasMultiplePages && (
          <div className="pagination-container">
            <p className="progress-indicator">
              Showing {categorySlice.length} of {categoryVisible.length} peptides
            </p>
            <div className="kp-pagination-btns">
              {currentPage > 0 && (
                <button className="kp-load-btn kp-prev-btn" onClick={handlePrev}>
                  ← Previous
                </button>
              )}
              {remaining > 0 && (
                <button className="kp-load-btn" onClick={handleNext}>
                  {loadMoreLabel}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── View All pill — bottom of grid ── */}
        {!loading && !isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
            <button
              className="kp-cta-pill"
              onClick={() => navigate('/collection/peptides')}
              aria-label={`View all ${peptides.length} peptides in the collection`}
            >
              <span className="kp-cta-pill-count">
                <FlaskConical size={13} strokeWidth={2} />
                {peptides.length} peptides
              </span>
              <span className="kp-cta-pill-action">
                View Full Catalog <ArrowRight size={13} strokeWidth={2.5} />
              </span>
            </button>
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            color: 'var(--text-muted)', display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: '1rem'
          }}>
            <p style={{ margin: 0 }}>{error}</p>
            <button
              onClick={() => setRetryKey(k => k + 1)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '8px',
                background: 'var(--primary)', color: 'var(--color-bg-surface)',
                border: 'none', cursor: 'pointer', fontSize: '0.875rem'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty state — only when filter/search is active and returns nothing ── */}
        {!loading && !error && categoryVisible.length === 0 && (activeFilter || searchQuery) && (
          <div className="kp-empty-container">
            <FlaskConical size={48} className="kp-empty-icon" />
            <p className="kp-empty-text">No peptides found matching your criteria.</p>
            <button className="kp-reset-btn" onClick={() => { setFilter(null); }}>
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}