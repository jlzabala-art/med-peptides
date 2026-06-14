import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Flame from "lucide-react/dist/esm/icons/flame";
import Star from "lucide-react/dist/esm/icons/star";
import Syringe from "lucide-react/dist/esm/icons/syringe";
import Activity from "lucide-react/dist/esm/icons/activity";
import Bot from "lucide-react/dist/esm/icons/bot";
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';







import { useNavigate } from 'react-router-dom';
import { getCatalog } from '../repositories/productRepository';
import { trackPeptideView } from '../hooks/useAnalytics';
import '../styles/featured_peptides.css';

/* ─── Static peptide data ────────────────────────────────────────────────── */
const FEATURED_PEPTIDES = [
  // ── Metabolic ────────────────────────────────────────────────────────────
  {
    name: 'Tirzepatide',
    slug: 'tirzepatide',
    category: 'Metabolic',
    role: 'Dual GIP/GLP-1 appetite & metabolic support',
    tags: ['GLP-1', 'GIP', 'Weight Management'],
    color: 'var(--color-primary)',
    badge: { label: 'Most Used', icon: <Flame size={10} />, bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  },
  {
    name: 'Semaglutide',
    slug: 'semaglutide',
    category: 'Metabolic',
    role: 'GLP-1 metabolic regulation',
    tags: ['GLP-1', 'Cardiometabolic', 'Glycemic'],
    color: 'var(--color-primary)',
    badge: { label: 'Popular', icon: <Star size={10} />, bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
  },
  {
    name: 'Retatrutide',
    slug: 'retatrutide',
    category: 'Metabolic',
    role: 'Triple GIP/GLP-1/Glucagon agonist',
    tags: ['Triple-Agonist', 'Novel', 'Obesity'],
    color: 'var(--color-primary)',
    badge: null, // Removed "New" badge as requested
  },
  {
    name: 'MOTS-c',
    slug: 'mots-c',
    category: 'Metabolic',
    role: 'Mitochondrial metabolic signaling',
    tags: ['Mitochondrial', 'AMPK', 'Insulin Sensitivity'],
    color: 'var(--color-primary)',
    badge: null,
  },
  {
    name: 'Liraglutide',
    slug: 'liraglutide',
    category: 'Metabolic',
    role: 'GLP-1 receptor agonist — glycemic & weight',
    tags: ['GLP-1', 'Diabetes', 'Cardiovascular'],
    color: 'var(--color-primary)',
    badge: null,
  },
  {
    name: 'CJC-1295',
    slug: 'cjc-1295',
    category: 'Metabolic',
    role: 'GHRH analogue — fat metabolism & GH pulse',
    tags: ['Growth Hormone', 'Fat Loss', 'Peptide'],
    color: 'var(--color-primary)',
    badge: null,
  },
  {
    name: 'Ipamorelin',
    slug: 'ipamorelin',
    category: 'Metabolic',
    role: 'Selective GH secretagogue',
    tags: ['GH Secretagogue', 'Anti-Aging', 'Metabolic'],
    color: 'var(--color-primary)',
    badge: null,
  },

  // ── Recovery ─────────────────────────────────────────────────────────────
  {
    name: 'BPC-157',
    slug: 'bpc-157',
    category: 'Recovery',
    role: 'Tissue repair, gut & tendon regeneration',
    tags: ['Regenerative', 'Gut Health', 'Tendon'],
    color: 'var(--color-primary)',
    badge: null,
  },
  {
    name: 'TB-500',
    slug: 'tb-500',
    category: 'Recovery',
    role: 'Thymosin β4 — musculoskeletal healing',
    tags: ['Healing', 'Inflammation', 'Muscle'],
    color: 'var(--color-primary)',
    badge: { label: 'Popular', icon: <Star size={10} />, bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' },
  },
  {
    name: 'GHK-Cu',
    slug: 'ghk-cu',
    category: 'Recovery',
    role: 'Copper peptide — tissue remodeling & repair',
    tags: ['Copper', 'Collagen', 'Wound Healing'],
    color: 'var(--color-primary)',
    badge: null,
  },
  {
    name: 'Pentadecapeptide BPC',
    slug: 'pentadecapeptide-bpc',
    category: 'Recovery',
    role: 'Systemic healing & angiogenesis support',
    tags: ['Angiogenesis', 'Healing', 'Regenerative'],
    color: 'var(--color-primary)',
    badge: null,
  },
  {
    name: 'LL-37',
    slug: 'll-37',
    category: 'Recovery',
    role: 'Antimicrobial & wound-healing cathelicidin',
    tags: ['Antimicrobial', 'Immune', 'Wound'],
    color: 'var(--color-primary)',
    badge: null,
  },
  {
    name: 'Larazotide',
    slug: 'larazotide',
    category: 'Recovery',
    role: 'Intestinal permeability & tight junction support',
    tags: ['Gut Health', 'Permeability', 'Anti-Inflammatory'],
    color: 'var(--color-primary)',
    badge: null,
  },

  // ── Cognitive ────────────────────────────────────────────────────────────
  {
    name: 'Semax',
    slug: 'semax',
    category: 'Cognitive',
    role: 'ACTH analogue — BDNF & focus enhancement',
    tags: ['BDNF', 'Neuroprotection', 'Focus'],
    color: '#4F46E5',
    badge: { label: 'Top Cognitive', icon: <Star size={10} />, bg: '#EEF2FF', color: '#4F46E5', border: '#C7D2FE' },
  },
  {
    name: 'Selank',
    slug: 'selank',
    category: 'Cognitive',
    role: 'Anxiolytic neuropeptide — stress resilience',
    tags: ['Anxiolytic', 'Stress', 'Memory'],
    color: '#4F46E5',
    badge: null,
  },
  {
    name: 'Dihexa',
    slug: 'dihexa',
    category: 'Cognitive',
    role: 'HGF modulator — synaptic plasticity',
    tags: ['Synaptic', 'Memory', 'Neuroprotection'],
    color: '#4F46E5',
    badge: null,
  },
  {
    name: 'Noopept',
    slug: 'noopept',
    category: 'Cognitive',
    role: 'NGF/BDNF stimulator — learning & memory',
    tags: ['NGF', 'BDNF', 'Cognition'],
    color: '#4F46E5',
    badge: null,
  },
  {
    name: 'Pinealon',
    slug: 'pinealon',
    category: 'Cognitive',
    role: 'Neuroprotective tripeptide — age-related decline',
    tags: ['Neuroprotective', 'Aging', 'Sleep'],
    color: '#4F46E5',
    badge: null,
  },

  // ── Longevity ────────────────────────────────────────────────────────────
  {
    name: 'Epithalon',
    slug: 'epithalon',
    category: 'Longevity',
    role: 'Telomere extension & anti-aging tetrapeptide',
    tags: ['Telomere', 'Anti-Aging', 'Pineal'],
    color: '#0891B2',
    badge: { label: 'Anti-Aging', icon: <Star size={10} />, bg: '#ECFEFF', color: '#0891B2', border: '#CFFAFE' },
  },
  {
    name: 'Thymalin',
    slug: 'thymalin',
    category: 'Longevity',
    role: 'Thymus peptide bioregulator — immune aging',
    tags: ['Thymus', 'Immune', 'Bioregulator'],
    color: '#0891B2',
    badge: null,
  },
  {
    name: 'Humanin',
    slug: 'humanin',
    category: 'Longevity',
    role: 'Mitochondrial-derived — cytoprotection',
    tags: ['Mitochondrial', 'Cytoprotection', 'Aging'],
    color: '#0891B2',
    badge: null,
  },
  {
    name: 'SS-31 (Elamipretide)',
    slug: 'ss-31',
    category: 'Longevity',
    role: 'Cardiolipin stabilizer — mitochondrial integrity',
    tags: ['Mitochondrial', 'Cardiolipin', 'Energy'],
    color: '#0891B2',
    badge: null,
  },
  {
    name: 'FOXO4-DRI',
    slug: 'foxo4-dri',
    category: 'Longevity',
    role: 'Senolytic — targets p21 senescent cells',
    tags: ['Senolytic', 'Senescence', 'Cellular'],
    color: '#0891B2',
    badge: null,
  },

  // ── Immune ───────────────────────────────────────────────────────────────
  {
    name: 'Thymosin α1',
    slug: 'thymosin-alpha1',
    category: 'Immune',
    role: 'Thymic immunomodulator — T-cell activation',
    tags: ['Immune', 'T-Cell', 'Thymus'],
    color: '#10B981',
    badge: { label: 'Immune', icon: <Star size={10} />, bg: '#ECFDF5', color: '#10B981', border: '#D1FAE5' },
  },
  {
    name: 'VIP (Vasoactive Intestinal Peptide)',
    slug: 'vip',
    category: 'Immune',
    role: 'Anti-inflammatory neuropeptide & immune regulator',
    tags: ['Anti-Inflammatory', 'Neuropeptide', 'Autoimmune'],
    color: '#10B981',
    badge: null,
  },
  {
    name: 'Thymulin',
    slug: 'thymulin',
    category: 'Immune',
    role: 'Thymic hormone — immune maturation',
    tags: ['Thymus', 'Immune', 'T-Cell'],
    color: '#10B981',
    badge: null,
  },
  {
    name: 'KPV',
    slug: 'kpv',
    category: 'Immune',
    role: 'Alpha-MSH fragment — anti-inflammatory & gut',
    tags: ['Anti-Inflammatory', 'Gut', 'MSH'],
    color: '#10B981',
    badge: null,
  },
];

const CATEGORIES = [...new Set(FEATURED_PEPTIDES.map((p) => p.category))];
const PAGE_SIZE = 6;

/**
 * @param {{ excludeSlugs?: Set<string> }} props
 *   excludeSlugs — set of slugs already shown in other tabs (e.g. Trending).
 *   Items whose slug is in this set are hidden to prevent duplicates.
 */
export default function FeaturedPeptides({ excludeSlugs }) {
  const navigate = useNavigate();

  // Phase 4-C: filter out anything that is trending in another tab
  const dedupedPeptides = excludeSlugs && excludeSlugs.size > 0
    ? FEATURED_PEPTIDES.filter((p) => !excludeSlugs.has(p.slug))
    : FEATURED_PEPTIDES;

  const deducedCategories = [...new Set(dedupedPeptides.map((p) => p.category))];

  const [activeCategory, setActiveCategory] = useState(deducedCategories[0] ?? CATEGORIES[0]);

  const [visibleCount, setVisibleCount] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c, PAGE_SIZE]))
  );

  const [dosageMap, setDosageMap] = useState({});
  const [dosageLoading, setDosageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const catalog = await getCatalog();
        if (cancelled) return;

        const map = {};
        for (const product of catalog) {
          try {
            const key = (product.name ?? '').trim().toLowerCase();
            if (!key) continue;

            const rawVariants = Array.isArray(product.variants) ? product.variants : [];
            const dosages = [
              ...new Set(
                rawVariants
                  .map((v) => (v && (v.dosage || v.strength)) || null)
                  .filter(Boolean)
              ),
            ].sort((a, b) => {
              const na = parseFloat(String(a).replace(/[^0-9.]/g, '')) || 0;
              const nb = parseFloat(String(b).replace(/[^0-9.]/g, '')) || 0;
              return na - nb;
            });

            map[key] = dosages;
          } catch (productErr) {
            console.warn('[FeaturedPeptides] skipping malformed product:', product?.id, productErr);
          }
        }

        if (!cancelled) setDosageMap(map);
      } catch (err) {
        // getCatalog failed (e.g. Firestore index missing, network error).
        // The cards still render — they just show "Contact for specifications".
        console.error('[FeaturedPeptides] dosage fetch failed — cards will render without dosage info:', err);
      } finally {
        if (!cancelled) setDosageLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleNav = (slug, name) => {
    // Always derive the URL slug from the product name to match ProductTemplate's resolver.
    // p.slug is the Firestore document ID (e.g. "Semax-30mg-vial") which is NOT the URL slug.
    const nameSlug = name ? name.toLowerCase().replace(/\s+/g, '-') : slug;
    if (nameSlug) {
      trackPeptideView({
        peptide_id: nameSlug,
        peptide_name: name
      });
      navigate(`/product/${nameSlug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAskAI = (e, peptide) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('open-clinical-ai', {
      detail: { message: `Tell me about ${peptide.name}: mechanism of action, clinical use cases, typical dosing, and what research says about its effectiveness for ${peptide.role}.` }
    }));
  };

  const filtered = dedupedPeptides.filter((p) => p.category === activeCategory);
  const visible = filtered.slice(0, visibleCount[activeCategory] ?? PAGE_SIZE);
  const hasMore = (visibleCount[activeCategory] ?? PAGE_SIZE) < filtered.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory] + PAGE_SIZE,
    }));
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
  };

  return (
    <section className="peptides-section">
      <div className="peptides-container">
        <div className="peptides-header">
          <p className="peptides-badge">
            Reference Catalog
            <span className="peptides-count">{dedupedPeptides.length}</span>
            {excludeSlugs?.size > 0 && (
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-tertiary)', marginLeft: '0.35rem' }}>
                ({excludeSlugs.size} hidden — already trending)
              </span>
            )}
          </p>
          <h2 className="peptides-title">Bioactive Peptides Library</h2>
          <p className="peptides-subtitle">
            Explore our curated selection of high-purity research peptides, categorized by primary physiological system.
          </p>
        </div>

        <div className="peptide-filter-row">
          {deducedCategories.map((cat) => (
            <button
              key={cat}
              className={`peptide-chip ${cat === activeCategory ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="peptide-grid">
          {visible.map((p) => (
            <div
              key={p.slug}
              className="peptide-card"
              style={{ '--card-accent': p.color }}
              onClick={() => handleNav(p.slug, p.name)}  // handleNav derives name-based slug
            >
              <div className="peptide-badge-row">
                {p.badge && (
                  <div
                    className="peptide-relevance-badge"
                    style={{ background: p.badge.bg, color: p.badge.color, borderColor: p.badge.border }}
                  >
                    {p.badge.icon}
                    {p.badge.label}
                  </div>
                )}
              </div>

              <div className="peptide-info-row">
                <div
                  className="peptide-icon-box"
                  style={{ background: `${p.color}08`, color: p.color, border: `1px solid ${p.color}20` }}
                >
                  <FlaskConical size={24} strokeWidth={2} />
                </div>
                <div className="peptide-name-stack">
                  <div className="peptide-name">{p.name}</div>
                  <div className="peptide-role">{p.role}</div>
                </div>
              </div>

              <div className="peptide-tags">
                {p.tags.map(tag => (
                  <span key={tag} className="peptide-tag">{tag}</span>
                ))}
              </div>

              <div className="dosage-container">
                <div className="dosage-label">
                  <Activity size={12} /> Available Concentrations
                </div>
                {dosageLoading ? (
                  <div className="dosage-skeleton-row">
                    <div className="dosage-skeleton" />
                    <div className="dosage-skeleton" />
                    <div className="dosage-skeleton" />
                  </div>
                ) : (() => {
                  const dosages = dosageMap[p.name.toLowerCase()] ?? [];
                  if (!dosages.length) return <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>Contact for specifications</div>;
                  return (
                    <div className="dosage-list">
                      {dosages.slice(0, 4).map((d) => (
                        <span
                          key={d}
                          className="dosage-pill"
                          style={{
                            background: 'white',
                            color: 'var(--color-text-secondary)',
                            borderColor: 'var(--color-border)',
                          }}
                        >
                          {d}
                        </span>
                      ))}
                      {dosages.length > 4 && (
                        <span className="dosage-pill" style={{ color: 'var(--color-text-tertiary)' }}>
                          +{dosages.length - 4} more
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="peptide-card-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: p.color, display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, fontSize: '0.82rem' }}>
                  View Specifications <ChevronRight size={14} strokeWidth={2.5} />
                </span>
                <button
                  onClick={(e) => handleAskAI(e, p)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.3rem 0.7rem', borderRadius: '8px',
                    background: 'rgba(244,63,94,0.07)', color: '#fb7185',
                    border: '1px solid rgba(244,63,94,0.2)',
                    fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'background 0.18s',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244,63,94,0.16)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(244,63,94,0.07)'}
                  aria-label={`Ask AI about ${p.name}`}
                >
                  <Bot size={11} /> Ask AI
                </button>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="load-more-section">
            <button className="peptide-load-btn" onClick={handleLoadMore}>
              View More {activeCategory} Peptides <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}