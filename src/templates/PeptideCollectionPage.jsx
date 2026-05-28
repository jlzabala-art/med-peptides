/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
/**
 * PeptideCollectionPage — Phase 3a: Filter state + derived options.
 * Fetches all peptides from Firestore via productRepository.
 * Filtering, sorting and search are now wired up.
 * 
 * Status: Completed.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  LayoutGrid, List, Search, SlidersHorizontal, ArrowRight, FlaskConical, X, Check,
  Brain, Moon, Activity, Shield,
  Zap, Sparkles, Droplets, Tag, Weight, Dumbbell
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getActiveProducts } from '../repositories/productRepository';
import '../styles/collection_shared.css';
import CollectionHeader from '../components/collection/CollectionHeader';
import GoalCard from '../components/collection/GoalCard';
import CollectionSidebar, { SidebarSection } from '../components/collection/CollectionSidebar';
import FilterDrawer from '../components/collection/FilterDrawer';
import SharedChip from '../components/collection/SharedChip';
import ProductCard, { SkeletonCard } from '../components/collection/ProductCard';

const PAGE_SIZE = 20;

/* ── Category → accent color (mirrors KeyPeptides) ───────────────────────── */
const CATEGORY_COLOR = {
  'Metabolic & Weight':      '#16A34A', // green-600
  'Recovery & Repair':       '#EC4899', // pink-600
  'Longevity & Anti-Aging':  '#6D28D9', // violet-700
  'Cognitive & Mood':        '#0891B2', // cyan-600
  'Hormonal Optimization':   '#EA580C', // orange-600
  'Sleep & Circadian':       '#4F46E5', // indigo-600
  'Immune Support':          'var(--color-success)', // emerald-600
  'Research Supplies':       '#DB2777', // pink-600 (admin)
  'Other Research Peptides': '#0096CC', // blue
};
const DEFAULT_COLOR = '#0096CC';

const CATEGORY_ICON = {
  'Metabolic & Weight':      Activity,
  'Recovery & Repair':       Zap,
  'Longevity & Anti-Aging':  Sparkles,
  'Cognitive & Mood':        Brain,
  'Hormonal Optimization':   Droplets,
  'Sleep & Circadian':       Moon,
  'Immune Support':          Shield,
  'Research Supplies':       FlaskConical,
  'Other Research Peptides': Tag,
};

const CATEGORY_PATHWAYS = {
  'Metabolic & Weight': [
    { label: '1. Agonismo', desc: 'Recepción del agonista del receptor GLP-1/GIP.' },
    { label: '2. Retraso Gástrico', desc: 'Regulación de saciedad y modulación en el SNC.' },
    { label: '3. Balance Hormonal', desc: 'Optimización de glucemia e insulina dependiente.' },
    { label: '4. Lipólisis Tisular', desc: 'Activación de lipasa para movilizar ácidos grasos.' }
  ],
  'Recovery & Repair': [
    { label: '1. Señalización', desc: 'Respuesta quimiotáctica a nivel microvascular celular.' },
    { label: '2. Quimiotaxis', desc: 'Migración celular activa facilitada hacia el tejido dañado.' },
    { label: '3. Angiogénesis', desc: 'Estimulación de receptores VEGFR2 y proliferación de colágeno.' },
    { label: '4. Regeneración', desc: 'Reconstrucción de la matriz extracelular y remodelación.' }
  ],
  'Longevity & Anti-Aging': [
    { label: '1. Estímulo Pineal', desc: 'Regulación de la telomerasa y síntesis de melatonina.' },
    { label: '2. Elongación DNA', desc: 'Preservación cromosómica contra el desgaste celular.' },
    { label: '3. Autofagia', desc: 'Limpieza y reciclaje de orgánulos y proteínas dañadas.' },
    { label: '4. Expresión Epigenética', desc: 'Restauración transcripcional hacia perfiles más jóvenes.' }
  ],
  'Cognitive & Mood': [
    { label: '1. Factor Neurotrófico', desc: 'Estímulo de síntesis de BDNF y NGF en el hipocampo.' },
    { label: '2. Sinaptogénesis', desc: 'Formación y reforzamiento de conexiones dendríticas.' },
    { label: '3. Modulación Sináptica', desc: 'Balance de neurotransmisión colinérgica y GABAérgica.' },
    { label: '4. Neuroprotección', desc: 'Defensa contra isquemia y aminoramiento de fatiga mental.' }
  ],
  'Hormonal Optimization': [
    { label: '1. Pulso Somatótropo', desc: 'Estimulación del receptor GHRH hipofisario.' },
    { label: '2. Emulación Pulsátil', desc: 'Liberación natural de hormona de crecimiento en pulsos.' },
    { label: '3. Síntesis de IGF-1', desc: 'Conversión hepática para proliferación y reparación celular.' },
    { label: '4. Anabolismo Tisular', desc: 'Optimización de composición corporal y vitalidad física.' }
  ],
  'Sleep & Circadian': [
    { label: '1. Sincronización', desc: 'Alineación de marcapasos en el núcleo supraquiasmático.' },
    { label: '2. Ondas Delta', desc: 'Promoción de actividad oscilatoria lenta del sueño profundo.' },
    { label: '3. Melatonina Pineal', desc: 'Inducción de la fase de sueño y balance de melatonina.' },
    { label: '4. Depuración Cerebral', desc: 'Fase glinfática nocturna de limpieza de metabolitos.' }
  ],
  'Immune Support': [
    { label: '1. Diferenciación', desc: 'Estimulación del timo para maduración de linfocitos T.' },
    { label: '2. Señalización', desc: 'Regulación inmunitaria mediante interferón y citocinas.' },
    { label: '3. Lisis de Patógenos', desc: 'Mecanismo catelicidínico que desestabiliza membranas.' },
    { label: '4. Inmunoresiliencia', desc: 'Refuerzo inmunológico celular innato y adaptativo.' }
  ]
};

const CATEGORY_INSIGHTS = {
  'Metabolic & Weight': 'Advanced research into glucose modulation, lipid metabolism, and mitochondrial energy efficiency.',
  'Recovery & Repair': 'Focus on musculoskeletal tissue regeneration, collagen synthesis, and systemic inflammatory pathways.',
  'Longevity & Anti-Aging': 'Exploration of cellular senescence, NAD+ precursors, and epigenetic maintenance.',
  'Cognitive & Mood': 'Neuro-protective agents focusing on synaptic plasticity, memory consolidation, and neurogenesis.',
  'Hormonal Optimization': 'Targeted research into peptide-driven endocrine signaling and growth hormone secretagogues.',
  'Sleep & Circadian': 'Modulation of GABAergic pathways and pineal gland signaling for homeostatic sleep regulation.',
  'Immune Support': 'Immunomodulatory research focused on thymic rejuvenation and adaptive response optimization.',
  'Other Research Peptides': 'Broad-spectrum compounds for specialized biochemical and pharmacological research.',
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

/* ── Dosage range finder — aggregates all variant strengths ─────────────── */
function buildDosageRange(doc) {
  // 1. Doc-level scalar fields take priority when no variants exist
  const rawFallback =
    doc.dosage || doc.dose || doc.dosageRange || doc.strength || null;
  const scalarFallback = typeof rawFallback === 'object' && rawFallback !== null
    ? `${rawFallback.min ?? ''}${rawFallback.max ? `–${rawFallback.max}` : ''} ${rawFallback.unit ?? ''} ${rawFallback.frequency ? `(${rawFallback.frequency.replace(/_/g, ' ')})` : ''}`.trim()
    : rawFallback;

  // 2. Harvest values from every variant
  const variants = Array.isArray(doc.variants) ? doc.variants : [];
  const raw = variants
    .flatMap(v => [v.strength, v.dosage, v.dose])
    .filter(Boolean)
    .map(s => String(s).trim())
    // Normalize: strip "/vial", "/ vial", "per vial", "/ml" etc.
    .map(s => s.replace(/\s*\/\s*(vial|ml|mcg|iu|units?).*$/i, '').trim())
    .map(s => s.replace(/\s+per\s+.*$/i, '').trim())
    .filter(s => s.length > 0);

  if (!raw.length) return scalarFallback;

  // 3. Try to extract a leading numeric value so we can sort & deduplicate
  const parseNum = (s) => {
    const m = s.match(/^([\d.]+)/);
    return m ? parseFloat(m[1]) : null;
  };

  // Deduplicate by the full string
  const unique = [...new Set(raw)];

  // Sort numerically if all have leading numbers; otherwise alphabetically
  const allNumeric = unique.every(s => parseNum(s) !== null);
  if (allNumeric) {
    unique.sort((a, b) => parseNum(a) - parseNum(b));
  } else {
    unique.sort();
  }

  if (unique.length === 1) return unique[0];

  // Show "min – max" to keep the card compact
  return `${unique[0]} – ${unique[unique.length - 1]}`;
}

/* ── Normalize Firestore doc → card shape ─────────────────────────────────── */
function normalizeProduct(doc) {
  let rawCat = (doc.category_main || doc.category || 'Other Research Peptides');
  
  // ── Strict Category Normalization ──
  const canonicalCategories = Object.keys(CATEGORY_COLOR);
  let cat = 'Other Research Peptides';

  // Try exact match
  if (canonicalCategories.includes(rawCat)) {
    cat = rawCat;
  } else {
    // Try keyword mapping
    const mapping = {
      'metabolic': 'Metabolic & Weight',
      'weight':    'Metabolic & Weight',
      'recovery':  'Recovery & Repair',
      'repair':    'Recovery & Repair',
      'longevity': 'Longevity & Anti-Aging',
      'aging':     'Longevity & Anti-Aging',
      'cognitive': 'Cognitive & Mood',
      'mood':      'Cognitive & Mood',
      'hormon':    'Hormonal Optimization',
      'sleep':     'Sleep & Circadian',
      'immune':    'Immune Support',
      'supply':    'Research Supplies',
      'supplies':  'Research Supplies'
    };

    const foundKey = Object.keys(mapping).find(key => rawCat.toLowerCase().includes(key));
    if (foundKey) {
      cat = mapping[foundKey];
    } else {
      // Last resort: find closest canonical key by substring
      const closest = canonicalCategories.find(cc => {
        const parts = cc.toLowerCase().replace('&', '').split(' ');
        return parts.some(part => part.length > 3 && rawCat.toLowerCase().includes(part));
      });
      if (closest) cat = closest;
    }
  }

  const color = getCategoryColor(cat);

  const rawTags = Array.isArray(doc.tags) && doc.tags.length ? doc.tags : [];
  const tags    = rawTags.length ? rawTags.slice(0, 3) : [cat.split('&')[0].trim()];

  return {
    id:          doc.id,
    name:        doc.displayName || doc.name || doc.id,
    slug:        doc.slug        || doc.id,
    role:        doc.shortDescription || doc.subtitle || cat,
    description: doc.description || doc.shortDescription || '',
    dosage:      buildDosageRange(doc),
    /* raw dosage strings needed for merging later */
    _rawDosages: (() => {
      const variants = Array.isArray(doc.variants) ? doc.variants : [];
      const vals = variants
        .flatMap(v => [v.strength, v.dosage, v.dose])
        .filter(Boolean)
        .map(s => String(s).trim()
          .replace(/\s*\/\s*(vial|ml|mcg|iu|units?).*$/i, '').trim()
          .replace(/\s+per\s+.*$/i, '').trim()
        )
        .filter(s => s.length > 0);
      const rawScalar = doc.dosage || doc.dose || doc.dosageRange || doc.strength;
      const scalar = typeof rawScalar === 'object' && rawScalar !== null
        ? `${rawScalar.min ?? ''}${rawScalar.max ? `–${rawScalar.max}` : ''} ${rawScalar.unit ?? ''} ${rawScalar.frequency ? `(${rawScalar.frequency.replace(/_/g, ' ')})` : ''}`.trim()
        : rawScalar;
      if (vals.length) return vals;
      if (scalar) return [String(scalar).trim()];
      return [];
    })(),
    tags,
    color,
    isNew:       doc.isNew     ?? false,
    isPopular:   doc.isPopular ?? false,
    category:    cat,
    form:        doc.form || doc.administration_route || null,
    strength:    doc.strength || null,
    /* ranking fields */
    analytics_usage_score: doc.analytics_usage_score ?? 0,
    usage_score:           doc.usage_score           ?? 0,
    view_count:            doc.view_count            ?? 0,
    search_count:          doc.search_count          ?? 0,
  };
}

/* ── Consolidate variants: same name + same form → one card ──────────────── */
function consolidateByAdminRoute(peptides) {
  const map = new Map();

  peptides.forEach(p => {
    // Key: lowercase name + (form or '__no_form__')
    const key = `${p.name.toLowerCase()}||${(p.form || '__no_form__').toLowerCase()}`;

    if (!map.has(key)) {
      map.set(key, { ...p, _rawDosages: [...p._rawDosages], variantCount: 1 });
    } else {
      const existing = map.get(key);
      existing.variantCount = (existing.variantCount || 1) + 1;
      // Merge raw dosages
      const merged = [...new Set([...existing._rawDosages, ...p._rawDosages])];
      // Prefer the card that is already popular/new
      existing.isPopular = existing.isPopular || p.isPopular;
      existing.isNew     = existing.isNew     || p.isNew;
      // Boost ranking scores
      existing.analytics_usage_score += p.analytics_usage_score;
      existing.view_count            += p.view_count;
      existing._rawDosages = merged;

      // Re-build the human-readable dosage range from merged values
      const parseNum = s => { const m = s.match(/^([\d.]+)/); return m ? parseFloat(m[1]) : null; };
      const allNum   = merged.every(s => parseNum(s) !== null);
      const sorted   = [...merged].sort(allNum
        ? (a, b) => parseNum(a) - parseNum(b)
        : (a, b) => a.localeCompare(b)
      );
      existing.dosage = sorted.length === 0
        ? null
        : sorted.length === 1
          ? sorted[0]
          : `${sorted[0]} – ${sorted[sorted.length - 1]}`;
    }
  });

  return Array.from(map.values());
}

export default function PeptideCollectionPage({ onNavigate, onBack, toggleCompare }) {
  const navigate = useNavigate();
  const location = useLocation();

  usePageMeta({
    title: 'Research Peptide Catalog | Browse All Peptides | Med-Peptides',
    description: 'Browse our complete catalog of high-purity research peptides. Filter by biological goal, form, and tags. Free worldwide shipping on qualified orders.',
    canonicalUrl: 'https://Med-Peptides-app-27a3a.web.app/collection/peptides',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://Med-Peptides-app-27a3a.web.app/' },
        { '@type': 'ListItem', position: 2, name: 'Peptide Catalog', item: 'https://Med-Peptides-app-27a3a.web.app/collection/peptides' },
      ],
    },
  });

  const [peptides, setPeptides] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage]         = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = showMobileFilters ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showMobileFilters]);

  const [activeFilters, setActiveFilters] = useState({
    category: null,
    tags:     [],
    search:   '',
    sort:     'name-asc',
  });

  /* Pre-apply ?category= query param */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setActiveFilters(prev => ({ ...prev, category: decodeURIComponent(cat) }));
    }
  }, [location.search]);

  /* Load + consolidate peptides */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getActiveProducts()
      .then(docs => {
        if (cancelled) return;
        const normalized = docs.map(d => normalizeProduct(d));
        const consolidated = consolidateByAdminRoute(normalized);
        setPeptides(consolidated);
      })
      .catch(err => console.warn('[PeptideCollectionPage] load error:', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const categoryOptions = useMemo(() => {
    const map = {};
    peptides.forEach(p => {
      if (p.category) map[p.category] = (map[p.category] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [peptides]);

  const tagOptions = useMemo(() => {
    const map = {};
    peptides.forEach(p => (p.tags || []).forEach(t => {
      map[t] = (map[t] || 0) + 1;
    }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 20);
  }, [peptides]);

  const filteredPeptides = useMemo(() => {
    let list = [...peptides];

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

    switch (activeFilters.sort) {
      case 'name-asc':  list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': list.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'popular':   list.sort((a, b) => b.analytics_usage_score - a.analytics_usage_score); break;
      default: break;
    }
    return list;
  }, [peptides, activeFilters]);

  const displayPeptides = useMemo(
    () => filteredPeptides.slice(0, page * PAGE_SIZE),
    [filteredPeptides, page]
  );
  const hasMore = displayPeptides.length < filteredPeptides.length;

  const toggleCategory = (cat) => {
    setPage(1);
    setActiveFilters(prev => ({ ...prev, category: prev.category === cat ? null : cat }));
  };

  const toggleTag = (tag) => {
    setPage(1);
    setActiveFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const clearAllFilters = () => {
    setPage(1);
    setActiveFilters({ category: null, tags: [], search: '', sort: 'name-asc' });
  };

  const handleCardClick = (p) => {
    // Derive URL slug from name (e.g. "Semax" → "semax") to match ProductTemplate's resolver.
    // p.slug is the Firestore document ID (e.g. "Semax-30mg-vial") which ProductTemplate does NOT use for URL matching.
    const nameSlug = p.name ? p.name.toLowerCase().replace(/\s+/g, '-') : p.slug;
    if (onNavigate) onNavigate(nameSlug);
    else navigate(`/product/${nameSlug}`);
  };

  const hasActiveFilters = !!activeFilters.category || activeFilters.tags.length > 0 || !!activeFilters.search;

  return (
    <div className="pc-page-wrapper">
    <div className="pc-page">
      <CollectionHeader 
        title="Peptide Catalog"
        subtitle={loading ? 'Loading peptides...' : `Browse ${peptides.length} research peptides`}
        searchQuery={activeFilters.search}
        onSearchChange={val => { setPage(1); setActiveFilters(prev => ({ ...prev, search: val })); }}
        searchPlaceholder="Search peptides by name or focus..."
      />

      <div className="col-layout">
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
            <SidebarSection title="Popular Tags">
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

        <main className="col-main">
          {/* ── Category Focus Panel (Phase 1) ── */}
          <AnimatePresence mode="wait">
            {activeFilters.category && (
              <motion.div
                key={activeFilters.category}
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, cubicBezier: [0.34, 1.56, 0.64, 1] }}
                className="col-focus-panel"
                style={{ 
                  '--panel-accent': getCategoryColor(activeFilters.category),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  padding: '1.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div className="col-focus-icon-box">
                    {React.createElement(getCategoryIcon(activeFilters.category), { size: 22 })}
                  </div>
                  <div>
                    <h3 className="col-focus-title">{activeFilters.category}</h3>
                    <p className="col-focus-desc">
                      {CATEGORY_INSIGHTS[activeFilters.category] || CATEGORY_INSIGHTS['Other Research Peptides']}
                    </p>
                  </div>
                </div>

                {CATEGORY_PATHWAYS[activeFilters.category] && (
                  <div className="pc-pathway-container">
                    <h4 style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: getCategoryColor(activeFilters.category), marginBottom: '0.75rem', textAlign: 'left' }}>
                      Vía de Señalización Biológica Investigada
                    </h4>
                    <div className="pc-pathway-flow">
                      {CATEGORY_PATHWAYS[activeFilters.category].map((step, idx) => (
                        <div key={idx} className="pc-pathway-step">
                          <span className="pc-pathway-step-num" style={{ '--step-accent': getCategoryColor(activeFilters.category) }}>{step.label}</span>
                          <span className="pc-pathway-step-label">{step.name || step.label.split('.')[1]?.trim() || step.label}</span>
                          <span className="pc-pathway-step-desc">{step.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="pc-result-count">
              {loading ? '...' : `${filteredPeptides.length} peptides`}
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
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal size={15} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <motion.div 
            layout
            className={`col-grid ${viewMode === 'list' ? 'list-view' : ''}`}
          >
            <AnimatePresence mode="popLayout">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : displayPeptides.map(p => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard
                        title={p.name}
                        subtitle={p.role}
                        description={p.description}
                        tags={p.tags}
                        color={p.color}
                        badge={p.isPopular ? { text: 'Popular', type: 'popular' } : p.isNew ? { text: 'New', type: 'new' } : null}
                        footerLeft={p.dosage || ' '}
                        viewMode={viewMode}
                        onClick={() => handleCardClick(p)}
                        onCompareClick={toggleCompare ? () => toggleCompare(p) : undefined}
                      />
                    </motion.div>
                  ))
              }
            </AnimatePresence>
          </motion.div>

          {!loading && filteredPeptides.length === 0 && (
            <div className="pc-empty">
              <FlaskConical size={48} className="pc-empty-icon" />
              <p className="pc-empty-title">No peptides match your filters</p>
              <p className="pc-empty-sub">Try adjusting your search or clearing some filters.</p>
              {hasActiveFilters && (
                <button className="pc-load-more-btn" onClick={clearAllFilters}>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {hasMore && (
            <div className="pc-load-more-wrap">
              <p className="pc-progress-text">
                Showing {displayPeptides.length} of {filteredPeptides.length} peptides
              </p>
              <button
                className="pc-load-more-btn"
                onClick={() => setPage(p => p + 1)}
              >
                Load more peptides <ArrowRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>

      <FilterDrawer 
        isOpen={showMobileFilters} 
        onClose={() => setShowMobileFilters(false)}
        title="Peptide Filters"
      >
        {categoryOptions.length > 0 && (
          <div className="pc-filter-group">
            <h4 className="pc-filter-group-title">Biological Goals</h4>
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
        <div className="pc-modal-footer">
          <button className="pc-modal-apply" onClick={() => setShowMobileFilters(false)}>
            Show {filteredPeptides.length} peptides
          </button>
        </div>
      </FilterDrawer>

      {/* Floating Mobile Filter Bar (Phase 2) */}
      <div className="pc-mobile-floating-bar">
        <button 
          className="pc-mobile-fab"
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal size={18} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Explore Research</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{filteredPeptides.length} Results Active</span>
          </div>
        </button>
      </div>
      </div>

      <style>{`
        .pc-pathway-container {
          width: 100%;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1rem;
        }
        .pc-pathway-flow {
          display: flex;
          gap: 0.75rem;
          width: 100%;
          overflow-x: auto;
          padding: 0.25rem 0;
          scrollbar-width: none;
        }
        .pc-pathway-flow::-webkit-scrollbar {
          display: none;
        }
        .pc-pathway-step {
          flex: 1;
          min-width: 140px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: left;
        }
        .pc-pathway-step-num {
          font-size: 0.65rem;
          font-weight: 900;
          color: var(--step-accent, var(--primary));
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .pc-pathway-step-label {
          font-size: 0.78rem;
          font-weight: 850;
          color: #FFF;
        }
        .pc-pathway-step-desc {
          font-size: 0.7rem;
          color: #7A90A8;
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}
