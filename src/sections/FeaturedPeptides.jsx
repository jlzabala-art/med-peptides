import React, { useState, useEffect, useMemo } from 'react';
import { FlaskConical, ChevronRight, Flame, Star, Syringe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCatalog } from '../repositories/productRepository';

/* ─── Static peptide data ────────────────────────────────────────────────── */
const FEATURED_PEPTIDES = [
  // ── Metabolic ────────────────────────────────────────────────────────────
  {
    name: 'Tirzepatide',
    slug: 'tirzepatide',
    category: 'Metabolic',
    role: 'Dual GIP/GLP-1 appetite & metabolic support',
    tags: ['GLP-1', 'GIP', 'Weight Management'],
    color: '#10B981',
    badge: { label: 'Most Used', icon: <Flame size={10} />, bg: '#FF6B3520', color: '#FF6B35', border: '#FF6B3540' },
  },
  {
    name: 'Semaglutide',
    slug: 'semaglutide',
    category: 'Metabolic',
    role: 'GLP-1 metabolic regulation',
    tags: ['GLP-1', 'Cardiometabolic', 'Glycemic'],
    color: '#06B6D4',
    badge: { label: 'Popular', icon: <Star size={10} />, bg: '#A78BFA20', color: '#A78BFA', border: '#A78BFA40' },
  },
  {
    name: 'Retatrutide',
    slug: 'retatrutide',
    category: 'Metabolic',
    role: 'Triple GIP/GLP-1/Glucagon agonist',
    tags: ['Triple-Agonist', 'Novel', 'Obesity'],
    color: '#A78BFA',
    badge: { label: 'New', icon: <Star size={10} />, bg: '#10B98120', color: '#10B981', border: '#10B98140' },
  },
  {
    name: 'MOTS-c',
    slug: 'mots-c',
    category: 'Metabolic',
    role: 'Mitochondrial metabolic signaling',
    tags: ['Mitochondrial', 'AMPK', 'Insulin Sensitivity'],
    color: '#F59E0B',
    badge: null,
  },
  {
    name: 'Liraglutide',
    slug: 'liraglutide',
    category: 'Metabolic',
    role: 'GLP-1 receptor agonist — glycemic & weight',
    tags: ['GLP-1', 'Diabetes', 'Cardiovascular'],
    color: '#34D399',
    badge: null,
  },
  {
    name: 'CJC-1295',
    slug: 'cjc-1295',
    category: 'Metabolic',
    role: 'GHRH analogue — fat metabolism & GH pulse',
    tags: ['Growth Hormone', 'Fat Loss', 'Peptide'],
    color: '#6EE7B7',
    badge: null,
  },
  {
    name: 'Ipamorelin',
    slug: 'ipamorelin',
    category: 'Metabolic',
    role: 'Selective GH secretagogue',
    tags: ['GH Secretagogue', 'Anti-Aging', 'Metabolic'],
    color: '#A7F3D0',
    badge: null,
  },

  // ── Recovery ─────────────────────────────────────────────────────────────
  {
    name: 'BPC-157',
    slug: 'bpc-157',
    category: 'Recovery',
    role: 'Tissue repair, gut & tendon regeneration',
    tags: ['Regenerative', 'Gut Health', 'Tendon'],
    color: '#00A3E0',
    badge: null,
  },
  {
    name: 'TB-500',
    slug: 'tb-500',
    category: 'Recovery',
    role: 'Thymosin β4 — musculoskeletal healing',
    tags: ['Healing', 'Inflammation', 'Muscle'],
    color: '#38BDF8',
    badge: { label: 'Popular', icon: <Star size={10} />, bg: '#38BDF820', color: '#38BDF8', border: '#38BDF840' },
  },
  {
    name: 'GHK-Cu',
    slug: 'ghk-cu',
    category: 'Recovery',
    role: 'Copper peptide — tissue remodeling & repair',
    tags: ['Copper', 'Collagen', 'Wound Healing'],
    color: '#F97316',
    badge: null,
  },
  {
    name: 'Pentadecapeptide BPC',
    slug: 'pentadecapeptide-bpc',
    category: 'Recovery',
    role: 'Systemic healing & angiogenesis support',
    tags: ['Angiogenesis', 'Healing', 'Regenerative'],
    color: '#60A5FA',
    badge: null,
  },
  {
    name: 'LL-37',
    slug: 'll-37',
    category: 'Recovery',
    role: 'Antimicrobial & wound-healing cathelicidin',
    tags: ['Antimicrobial', 'Immune', 'Wound'],
    color: '#A78BFA',
    badge: null,
  },
  {
    name: 'Larazotide',
    slug: 'larazotide',
    category: 'Recovery',
    role: 'Intestinal permeability & tight junction support',
    tags: ['Gut Health', 'Permeability', 'Anti-Inflammatory'],
    color: '#34D399',
    badge: null,
  },

  // ── Cognitive ────────────────────────────────────────────────────────────
  {
    name: 'Semax',
    slug: 'semax',
    category: 'Cognitive',
    role: 'ACTH analogue — BDNF & focus enhancement',
    tags: ['BDNF', 'Neuroprotection', 'Focus'],
    color: '#8B5CF6',
    badge: { label: 'Top Cognitive', icon: <Star size={10} />, bg: '#8B5CF620', color: '#8B5CF6', border: '#8B5CF640' },
  },
  {
    name: 'Selank',
    slug: 'selank',
    category: 'Cognitive',
    role: 'Anxiolytic neuropeptide — stress resilience',
    tags: ['Anxiolytic', 'Stress', 'Memory'],
    color: '#7C3AED',
    badge: null,
  },
  {
    name: 'Dihexa',
    slug: 'dihexa',
    category: 'Cognitive',
    role: 'HGF modulator — synaptic plasticity',
    tags: ['Synaptic', 'Memory', 'Neuroprotection'],
    color: '#6D28D9',
    badge: null,
  },
  {
    name: 'Noopept',
    slug: 'noopept',
    category: 'Cognitive',
    role: 'NGF/BDNF stimulator — learning & memory',
    tags: ['NGF', 'BDNF', 'Cognition'],
    color: '#A855F7',
    badge: null,
  },
  {
    name: 'Pinealon',
    slug: 'pinealon',
    category: 'Cognitive',
    role: 'Neuroprotective tripeptide — age-related decline',
    tags: ['Neuroprotective', 'Aging', 'Sleep'],
    color: '#C084FC',
    badge: null,
  },

  // ── Longevity ────────────────────────────────────────────────────────────
  {
    name: 'Epithalon',
    slug: 'epithalon',
    category: 'Longevity',
    role: 'Telomere extension & anti-aging tetrapeptide',
    tags: ['Telomere', 'Anti-Aging', 'Pineal'],
    color: '#EC4899',
    badge: { label: 'Anti-Aging', icon: <Star size={10} />, bg: '#EC489920', color: '#EC4899', border: '#EC489940' },
  },
  {
    name: 'Thymalin',
    slug: 'thymalin',
    category: 'Longevity',
    role: 'Thymus peptide bioregulator — immune aging',
    tags: ['Thymus', 'Immune', 'Bioregulator'],
    color: '#F43F5E',
    badge: null,
  },
  {
    name: 'Humanin',
    slug: 'humanin',
    category: 'Longevity',
    role: 'Mitochondrial-derived — cytoprotection',
    tags: ['Mitochondrial', 'Cytoprotection', 'Aging'],
    color: '#FB7185',
    badge: null,
  },
  {
    name: 'SS-31 (Elamipretide)',
    slug: 'ss-31',
    category: 'Longevity',
    role: 'Cardiolipin stabilizer — mitochondrial integrity',
    tags: ['Mitochondrial', 'Cardiolipin', 'Energy'],
    color: '#E11D48',
    badge: null,
  },
  {
    name: 'FOXO4-DRI',
    slug: 'foxo4-dri',
    category: 'Longevity',
    role: 'Senolytic — targets p21 senescent cells',
    tags: ['Senolytic', 'Senescence', 'Cellular'],
    color: '#BE185D',
    badge: null,
  },

  // ── Immune ───────────────────────────────────────────────────────────────
  {
    name: 'Thymosin α1',
    slug: 'thymosin-alpha1',
    category: 'Immune',
    role: 'Thymic immunomodulator — T-cell activation',
    tags: ['Immune', 'T-Cell', 'Thymus'],
    color: '#14B8A6',
    badge: { label: 'Immune', icon: <Star size={10} />, bg: '#14B8A620', color: '#14B8A6', border: '#14B8A640' },
  },
  {
    name: 'VIP (Vasoactive Intestinal Peptide)',
    slug: 'vip',
    category: 'Immune',
    role: 'Anti-inflammatory neuropeptide & immune regulator',
    tags: ['Anti-Inflammatory', 'Neuropeptide', 'Autoimmune'],
    color: '#2DD4BF',
    badge: null,
  },
  {
    name: 'Thymulin',
    slug: 'thymulin',
    category: 'Immune',
    role: 'Thymic hormone — immune maturation',
    tags: ['Thymus', 'Immune', 'T-Cell'],
    color: '#5EEAD4',
    badge: null,
  },
  {
    name: 'KPV',
    slug: 'kpv',
    category: 'Immune',
    role: 'Alpha-MSH fragment — anti-inflammatory & gut',
    tags: ['Anti-Inflammatory', 'Gut', 'MSH'],
    color: '#99F6E4',
    badge: null,
  },
];

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const STYLES = `
  .fp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.25rem;
    align-items: stretch;
  }
  @media (max-width: 600px) {
    .fp-grid { grid-template-columns: 1fr; }
  }
  .fp-card {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    border-radius: 16px;
    background: white;
    border: 1.5px solid var(--border, #e5e7eb);
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    gap: 0.75rem;
    position: relative;
    overflow: hidden;
    min-height: 260px;
    height: 260px;
    box-sizing: border-box;
  }
  .fp-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--card-accent, #00A3E0);
    opacity: 0;
    transition: opacity 0.22s;
  }
  .fp-card:hover::before { opacity: 1; }
  .fp-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.09);
  }
  .fp-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    border: 1px solid;
    width: fit-content;
    margin-bottom: 0.25rem;
  }
  .fp-peptide-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .fp-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 99px;
    font-size: 0.7rem;
    font-weight: 600;
    background: rgba(0,0,0,0.04);
    color: var(--text-muted, #6b7280);
    letter-spacing: 0.02em;
  }
  /* ── Dosage pills ── */
  .fp-dosage-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-top: 0.25rem;
  }
  .fp-dosage-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 7px;
    border-radius: 99px;
    font-size: 0.67rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    border: 1px solid;
    white-space: nowrap;
  }
  .fp-dosage-loading {
    display: flex;
    gap: 0.3rem;
    margin-top: 0.25rem;
  }
  .fp-dosage-skeleton {
    height: 18px;
    width: 42px;
    border-radius: 99px;
    background: rgba(0,0,0,0.06);
    animation: fp-pulse 1.4s ease-in-out infinite;
  }
  @keyframes fp-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .fp-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    margin-top: auto;
    padding-top: 0.75rem;
    opacity: 0.7;
    transition: opacity 0.2s, gap 0.2s;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }
  .fp-card:hover .fp-cta { opacity: 1; gap: 0.5rem; }

  /* ── Category filter chips ── */
  .fp-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  .fp-chip {
    padding: 0.35rem 1rem;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    border: 1.5px solid var(--border, #e5e7eb);
    background: white;
    color: var(--text-muted, #6b7280);
    cursor: pointer;
    transition: background 0.18s, color 0.18s, border-color 0.18s, transform 0.15s;
    font-family: inherit;
  }
  .fp-chip:hover {
    border-color: var(--primary, #00A3E0);
    color: var(--primary, #00A3E0);
    transform: translateY(-1px);
  }
  .fp-chip.fp-chip--active {
    background: var(--primary, #00A3E0);
    border-color: var(--primary, #00A3E0);
    color: white;
  }

  /* ── Load More button ── */
  .fp-load-more {
    display: flex;
    justify-content: center;
    margin-top: 1.25rem;
  }
  .fp-load-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 1.5rem;
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    border: 1.5px solid var(--border, #e5e7eb);
    background: white;
    color: var(--text-muted, #6b7280);
    cursor: pointer;
    transition: border-color 0.18s, color 0.18s, transform 0.15s;
    font-family: inherit;
  }
  .fp-load-more-btn:hover {
    border-color: var(--primary, #00A3E0);
    color: var(--primary, #00A3E0);
    transform: translateY(-1px);
  }
`;

/* ─── Derive categories from data (order preserved) ─────────────────────── */
const CATEGORIES = [...new Set(FEATURED_PEPTIDES.map((p) => p.category))];
const PAGE_SIZE = 6;

export default function FeaturedPeptides() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  // Per-category visible count — starts at PAGE_SIZE
  const [visibleCount, setVisibleCount] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c, PAGE_SIZE]))
  );

  // ── Firebase dosage data ──────────────────────────────────────────────────
  // Map: lowercase product name → sorted dosage strings from Firestore
  const [dosageMap, setDosageMap] = useState({});
  const [dosageLoading, setDosageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCatalog()
      .then((catalog) => {
        if (cancelled) return;
        const map = {};
        for (const product of catalog) {
          const key = (product.name ?? '').trim().toLowerCase();
          if (!key) continue;
          // Collect unique, sorted dosage strings from all variants
          const dosages = [
            ...new Set(
              (product.variants ?? [])
                .map((v) => v.dosage || v.strength || null)
                .filter(Boolean)
            ),
          ].sort((a, b) => {
            const na = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
            const nb = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
            return na - nb;
          });
          map[key] = dosages;
        }
        setDosageMap(map);
      })
      .catch((err) => console.error('[FeaturedPeptides] dosage fetch:', err))
      .finally(() => { if (!cancelled) setDosageLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = FEATURED_PEPTIDES.filter((p) => p.category === activeCategory);
  const visible = filtered.slice(0, visibleCount[activeCategory]);
  const hasMore = visibleCount[activeCategory] < filtered.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory] + PAGE_SIZE,
    }));
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    // Reset to PAGE_SIZE when switching — feels clean
    setVisibleCount((prev) => ({ ...prev, [cat]: Math.max(prev[cat], PAGE_SIZE) }));
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Section header ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 2rem', padding: '0 1.25rem' }}>
        <p style={{
          fontSize: '0.72rem', fontWeight: 700, color: '#A78BFA',
          letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.45rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          Featured Peptides
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: '#A78BFA22', color: '#A78BFA', border: '1px solid #A78BFA55',
            borderRadius: '99px', fontSize: '0.65rem', fontWeight: 800,
            padding: '1px 8px', letterSpacing: '0.04em',
          }}>
            {FEATURED_PEPTIDES.length}
          </span>
        </p>
        <h2 style={{
          fontSize: 'clamp(1.45rem, 3vw, 2.1rem)', fontWeight: 800,
          color: '#fff', letterSpacing: '-0.02em', margin: '0 0 0.35rem', lineHeight: 1.15,
        }}>
          Bioactive Compounds Library
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.5 }}>
          Explore our curated peptide catalog by therapeutic category
        </p>
      </div>

      {/* ── Category chips ── */}
      <div className="fp-filters" role="tablist" aria-label="Filter peptides by category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={cat === activeCategory}
            className={`fp-chip${cat === activeCategory ? ' fp-chip--active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Peptide grid ── */}
      <div className="fp-grid">
        {visible.map((p) => (
          <div
            key={p.slug}
            className="fp-card"
            style={{ '--card-accent': p.color }}
            onMouseEnter={() => setHovered(p.slug)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate(`/products/${p.slug}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${p.slug}`)}
            aria-label={`View ${p.name}`}
          >
            {/* Badge */}
            {p.badge && (
              <div
                className="fp-badge"
                style={{ background: p.badge.bg, color: p.badge.color, borderColor: p.badge.border }}
              >
                {p.badge.icon}
                {p.badge.label}
              </div>
            )}

            {/* Icon + Name row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                className="fp-peptide-icon"
                style={{ background: `${p.color}15`, color: p.color }}
              >
                <FlaskConical size={20} />
              </div>
              <div>
                <div style={{
                  fontWeight: 800,
                  fontSize: '1rem',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-main, #111)',
                  lineHeight: 1.2,
                }}>
                  {p.name}
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted, #6b7280)',
                  marginTop: 1,
                }}>
                  {p.role}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
              {p.tags.map(tag => (
                <span key={tag} className="fp-tag">{tag}</span>
              ))}
            </div>

            {/* Dosage pills — live from Firebase */}
            {dosageLoading ? (
              <div className="fp-dosage-loading">
                <div className="fp-dosage-skeleton" />
                <div className="fp-dosage-skeleton" />
                <div className="fp-dosage-skeleton" />
              </div>
            ) : (() => {
              const dosages = dosageMap[p.name.toLowerCase()] ?? [];
              if (!dosages.length) return null;
              return (
                <div className="fp-dosage-row" title="Available dosages">
                  <Syringe size={12} style={{ color: p.color, flexShrink: 0, marginTop: 3 }} />
                  {dosages.slice(0, 5).map((d) => (
                    <span
                      key={d}
                      className="fp-dosage-pill"
                      style={{
                        background: `${p.color}12`,
                        color: p.color,
                        borderColor: `${p.color}35`,
                      }}
                    >
                      {d}
                    </span>
                  ))}
                  {dosages.length > 5 && (
                    <span className="fp-dosage-pill" style={{ background: 'rgba(0,0,0,0.04)', color: '#6b7280', borderColor: '#e5e7eb' }}>
                      +{dosages.length - 5}
                    </span>
                  )}
                </div>
              );
            })()}

            {/* CTA */}
            <button
              className="fp-cta"
              style={{ color: p.color }}
              onClick={(e) => { e.stopPropagation(); navigate(`/products/${p.slug}`); }}
            >
              View Peptide <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Load More ── */}
      {hasMore && (
        <div className="fp-load-more">
          <button className="fp-load-more-btn" onClick={handleLoadMore}>
            Load more {activeCategory} peptides <ChevronRight size={14} />
          </button>
        </div>
      )}
    </>
  );
}
