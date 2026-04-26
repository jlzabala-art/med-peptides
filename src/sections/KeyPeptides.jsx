import React, { useState, useMemo, useEffect } from 'react';
import { FlaskConical, ArrowRight, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getActiveProducts } from '../repositories/productRepository';
import priorityMap from '../config/peptide_priority_map.json';

/* ─── Category → accent color ───────────────────────────────────────────── */
const CATEGORY_COLOR = {
  'Weight Management & Metabolic': '#10B981',
  'Healing & Recovery':            '#00A3E0',
  'Anti-Aging & Longevity':        '#A78BFA',
  'Cognitive & Neuro-Protection':  '#22D3EE',
  'Muscle Growth & Performance':   '#F59E0B',
  'Hormonal Support':              '#F97316',
  'Research Supplies':             '#EC4899',
  'Other Research Peptides':       '#06B6D4',
};
const DEFAULT_COLOR = '#00A3E0';

/* ─── Map Firestore product doc → PeptideCard shape ────────────────────── */
function normalizeProduct(doc) {
  const cat   = doc.category || 'Other Research Peptides';
  const color = CATEGORY_COLOR[cat] ?? DEFAULT_COLOR;

  // Build tags: prefer explicit tags array, fall back to category label
  const rawTags = Array.isArray(doc.tags) && doc.tags.length ? doc.tags : [];
  const tags    = rawTags.length ? rawTags : [cat.split('&')[0].trim()];

  return {
    name:        doc.displayName || doc.name || doc.id,
    slug:        doc.slug        || doc.id,
    role:        doc.shortDescription || doc.subtitle || cat,
    description: doc.description || doc.shortDescription || '',
    dosage:      doc.dosage || doc.dose || doc.dosageRange
                 || doc.strength
                 || (Array.isArray(doc.variants) && doc.variants.length
                       ? (doc.variants[0].strength || doc.variants[0].dosage || null)
                       : null)
                 || null,
    tags,
    color,
    isNew:       doc.isNew     ?? false,
    isPopular:   doc.isPopular ?? false,
    category:    cat,
  };
}

/* ─── Badge helper ──────────────────────────────────────────────────────── */
function getPeptideBadge(peptide) {
  if (peptide.isPopular) return { label: 'Popular', icon: <Star size={10} />, bg: '#F59E0B20', color: '#F59E0B', border: '#F59E0B40' };
  if (peptide.isNew)     return { label: 'New',     icon: <Sparkles size={10} />, bg: '#A78BFA20', color: '#A78BFA', border: '#A78BFA40' };
  return null;
}

/* ─── Filter match ──────────────────────────────────────────────────────── */
function peptideMatchesFilter(peptide, filter) {
  if (filter === 'All') return true;
  if (filter === 'New') return peptide.isNew;
  const haystack = [peptide.name, peptide.role, peptide.description, peptide.category, ...peptide.tags]
    .join(' ').toLowerCase();
  return haystack.includes(filter.toLowerCase());
}

/* ─── Skeleton card shown while loading ─────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', padding: '1.35rem', minHeight: '220px',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      {[36, 18, 12, 10].map((h, i) => (
        <div key={i} style={{
          height: `${h}px`, width: i === 0 ? '60%' : i === 1 ? '80%' : i === 2 ? '90%' : '40%',
          borderRadius: '6px', background: 'rgba(255,255,255,0.07)',
          animation: 'pulse 1.6s ease-in-out infinite',
        }} />
      ))}
    </div>
  );
}

/* ─── Peptide Card ──────────────────────────────────────────────────────── */
function PeptideCard({ peptide, onClick, highlighted }) {
  const [hovered, setHovered] = useState(false);
  const badge = getPeptideBadge(peptide);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${
          highlighted ? `${peptide.color}70`
          : hovered   ? `${peptide.color}55`
                      : 'rgba(255,255,255,0.10)'
        }`,
        borderRadius: '14px',
        padding: '1.35rem',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 10px 30px rgba(0,0,0,0.35)`
          : highlighted
          ? `0 0 0 2px ${peptide.color}35`
          : '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        minHeight: '220px',
      }}
    >
      {/* Name + Role + Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: `${peptide.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FlaskConical size={18} color={peptide.color} strokeWidth={1.8} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.01em' }}>
              {peptide.name}
            </span>
            {badge && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.22rem',
                fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: badge.color,
                background: badge.bg, border: `1px solid ${badge.border}`,
                borderRadius: '999px', padding: '0.15rem 0.45rem',
              }}>
                {badge.icon} {badge.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 1-line clinical role */}
      <p style={{
        margin: 0, fontSize: '0.79rem',
        color: 'rgba(255,255,255,0.50)', lineHeight: 1.4,
        fontStyle: 'italic',
      }}>
        {peptide.role}
      </p>

      {/* Dosage badge */}
      {peptide.dosage && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          background: 'rgba(0,163,224,0.08)', border: '1px solid rgba(0,163,224,0.25)',
          borderRadius: '6px', padding: '0.28rem 0.65rem',
          fontSize: '0.70rem', fontWeight: 700, letterSpacing: '0.04em',
          color: 'rgba(0,163,224,0.90)', fontFamily: 'monospace',
          alignSelf: 'flex-start',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'inherit', fontWeight: 600 }}>DOSAGE</span>
          {peptide.dosage}
        </div>
      )}

      {/* Clinical tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {peptide.tags.map(tag => (
          <span key={tag} style={{
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: peptide.color,
            background: `${peptide.color}14`, border: `1px solid ${peptide.color}28`,
            borderRadius: '999px', padding: '0.18rem 0.55rem',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: 'auto',
        color: hovered ? peptide.color : 'rgba(255,255,255,0.28)',
        fontSize: '0.76rem', fontWeight: 600, transition: 'color 0.2s',
      }}>
        View Peptide <ArrowRight size={12} strokeWidth={2.5} />
      </div>
    </div>
  );
}

/* ─── Section ───────────────────────────────────────────────────────────── */
export default function KeyPeptides({ onSelectProduct, searchQuery = '' }) {
  const navigate = useNavigate();

  // ── Firestore fetch ──────────────────────────────────────────────────────
  const [peptides, setPeptides]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeFilter, setFilter] = useState('Anti-Aging');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getActiveProducts()
      .then((docs) => {
        if (cancelled) return;
        // Deduplicate by normalised name (same peptide, different dosage docs)
        const seen = new Set();
        const unique = [];
        for (const doc of docs) {
          if (doc.category === 'Research Supplies') continue;
          const key = (doc.displayName || doc.name || doc.id).trim().toLowerCase();
          if (!seen.has(key)) { seen.add(key); unique.push(normalizeProduct(doc)); }
        }
        // Sort: Priority from map first, then popular, then alphabetical
        const flatPriorityList = Array.from(new Set(Object.values(priorityMap).flat()));
        const getPriority = (name) => {
          const lowerName = name.toLowerCase();
          for (let i = 0; i < flatPriorityList.length; i++) {
            if (lowerName.includes(flatPriorityList[i].toLowerCase())) {
              return i;
            }
          }
          return Infinity;
        };

        unique.sort((a, b) => {
          const prioA = getPriority(a.name);
          const prioB = getPriority(b.name);

          if (prioA !== prioB) return prioA - prioB;
          if (a.isPopular !== b.isPopular) return a.isPopular ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        setPeptides(unique);
      })
      .catch((err) => console.error('[KeyPeptides] fetch error:', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // ── Dynamic filter chips derived from loaded categories ───────────────────
  const filterChips = useMemo(() => {
    const cats = new Set(peptides.map(p => p.category.split('&')[0].trim()));
    return [...Array.from(cats).sort(), 'New'];
  }, [peptides]);

  // Reset to 6 when filter or search changes
  useEffect(() => { setVisibleCount(6); }, [activeFilter, searchQuery]);

  // ── Filtered + search list ────────────────────────────────────────────────
  const visible = useMemo(() => {
    if (searchQuery) {
      const needle = searchQuery.toLowerCase();
      return peptides.filter(p =>
        [p.name, p.role, p.description, p.category, ...p.tags].join(' ').toLowerCase().includes(needle)
      );
    }
    return peptides.filter(p => peptideMatchesFilter(p, activeFilter));
  }, [peptides, activeFilter, searchQuery]);

  const visibleSlice = visible.slice(0, visibleCount);
  const matchedSlugs = searchQuery ? new Set(visible.map(p => p.slug)) : null;

  return (
    <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.25rem', background: '#080E1B' }}>
      {/* Pulse animation for skeletons */}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem',
        }}>
          <div>
            <p style={{
              fontSize: '0.72rem', fontWeight: 700, color: '#00A3E0',
              letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.45rem',
            }}>
              Peptide Catalog
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{
                fontSize: 'clamp(1.45rem, 3vw, 2.1rem)', fontWeight: 800,
                color: '#fff', letterSpacing: '-0.02em', margin: '0 0 0.35rem',
                lineHeight: 1.15,
              }}>
                Key Peptides Available
              </h2>
              {!loading && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  background: 'rgba(0,163,224,0.12)',
                  border: '1px solid rgba(0,163,224,0.30)',
                  borderRadius: '999px', padding: '0.2rem 0.75rem',
                  fontSize: '0.78rem', fontWeight: 700,
                  color: '#00A3E0', letterSpacing: '0.04em',
                  marginBottom: '0.35rem', whiteSpace: 'nowrap',
                }}>
                  <FlaskConical size={12} strokeWidth={2} />
                  {peptides.length} Available
                </span>
              )}
            </div>
            <p style={{
              margin: 0, fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.42)', lineHeight: 1.5,
            }}>
              Core compounds currently in the catalog
            </p>
          </div>
        </div>

        {/* Dynamic filter chips */}
        {!loading && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
            {filterChips.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: activeFilter === f ? '#00A3E0' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeFilter === f ? '#00A3E0' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '999px', padding: '0.35rem 0.9rem',
                  color: activeFilter === f ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem', alignItems: 'stretch',
        }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : visibleSlice.map(p => (
                <PeptideCard
                  key={p.slug}
                  peptide={p}
                  onClick={() => onSelectProduct ? onSelectProduct(p.slug) : navigate(`/peptide/${p.slug}`)}
                  highlighted={matchedSlugs ? matchedSlugs.has(p.slug) : false}
                />
              ))
          }
        </div>

        {/* Load more */}
        {!loading && visibleCount < visible.length && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => setVisibleCount(c => c + 6)}
              style={{
                background: 'rgba(0,163,224,0.10)',
                border: '1.5px solid rgba(0,163,224,0.35)',
                borderRadius: '999px',
                color: '#00A3E0',
                fontSize: '0.83rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                padding: '0.55rem 1.8rem',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,163,224,0.20)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,163,224,0.10)'; }}
            >
              Load more ({visible.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', marginTop: '2rem', fontSize: '0.9rem' }}>
            No peptides match this filter.
          </p>
        )}
      </div>
    </section>
  );
}
