import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, Layers, Activity, DollarSign, ArrowRight, ChevronRight, Flame, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPublicProtocols } from '../services/protocolStorage.js';

/* ─── Relevance badge sets (Phase 4) ────────────────────────────────────── */
// Slug / id fragments for protocols considered "Most Used"
const MOST_USED_IDS = new Set([
  'wm_001', 'wm_002', 'wm_003', 'rec_001', 'rec_002', 'met_002',
]);
// Slug / id fragments for protocols "Recently Updated" (rotate monthly)
const RECENTLY_UPDATED_IDS = new Set([
  'lon_001', 'lon_002', 'neuro_001', 'cog_001', 'immune_001', 'immune_002',
]);

function getProtocolBadge(protocol) {
  const haystack = [
    protocol.id || '', protocol.protocol_id || '', protocol.short_code || '',
    protocol.category || '', protocol.primary_goal || '',
  ].join(' ').toLowerCase();

  if ([...MOST_USED_IDS].some(k => haystack.includes(k))) {
    return { label: 'Most Used', icon: <Flame size={10} />, bg: '#FF6B3520', color: '#FF6B35', border: '#FF6B3540' };
  }
  if ([...RECENTLY_UPDATED_IDS].some(k => haystack.includes(k))) {
    return { label: 'Updated', icon: <RefreshCw size={10} />, bg: '#A78BFA20', color: '#A78BFA', border: '#A78BFA40' };
  }
  return null;
}

/* ─── helpers (mirrors ProtocolTemplate logic) ──────────────────────────── */
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

function getStatusColor(status = '') {
  const s = status.toLowerCase();
  if (s.includes('approved') || s.includes('active')) return '#10B981';
  if (s.includes('review') || s.includes('pending')) return '#F59E0B';
  if (s.includes('research') || s.includes('draft')) return '#A78BFA';
  return '#64748B';
}

const CATEGORY_COLORS = {
  'weight management': '#10B981',
  'peptide therapy':   '#00A3E0',
  'hormonal':          '#A78BFA',
  'longevity':         '#F59E0B',
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

/* ─── Blueprint → display normalizer ───────────────────────────────────── */
function normalizeBlueprint(bp) {
  // Support both old Firestore schema and new local bundle schema
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

  // Prefer phase_blueprints for count, but fall back to phases for drug data
  // (Firestore schema stores drugs_used in phases, not phase_blueprints)
  const blueprints = bp.phase_blueprints || [];
  const phases     = bp.phases || [];

  // Pick the source that actually has drug entries
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

/* ─── Protocol Card ─────────────────────────────────────────────────────── */
function ProtocolCard({ protocol, onClick, highlighted }) {
  const [hovered, setHovered] = useState(false);

  const displayTitle  = protocol.title       || 'Unnamed Blueprint';
  const complexity    = protocol.intensity   || null;   // e.g. "moderate", "advanced"
  const shortCode     = protocol.short_code  || null;
  const version       = protocol.version     || null;
  const status        = protocol.status      || '';
  const tagline       = protocol.tagline     || '';
  const duration      = protocol.duration_weeks ? `${protocol.duration_weeks}w` : getDuration(protocol);
  const phaseCount    = protocol.phase_count   ?? getPhaseCount(protocol);
  const compoundCount = protocol.compound_count ?? getCompoundCount(protocol);
  const statusColor   = getStatusColor(status);
  const catColor      = getCategoryColor(protocol.category || '');
  const category      = humanize(protocol.category || '');
  const badge         = getProtocolBadge(protocol);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${
          highlighted ? 'rgba(0,163,224,0.55)'
          : hovered   ? 'rgba(0,163,224,0.40)'
                      : 'rgba(255,255,255,0.11)'
        }`,
        borderRadius: '16px',
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 12px 36px rgba(0,0,0,0.4)'
          : highlighted
          ? '0 0 0 2px rgba(0,163,224,0.25)'
          : '0 2px 8px rgba(0,0,0,0.15)',
        minHeight: '260px',
        height: '260px',
      }}
    >
      {/* ── Line 0: Category chip + relevance badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        {category && (
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: catColor,
            background: `${catColor}18`, border: `1px solid ${catColor}30`,
            borderRadius: '999px', padding: '0.2rem 0.65rem',
          }}>
            {category}
          </span>
        )}
        {badge && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: badge.color,
            background: badge.bg, border: `1px solid ${badge.border}`,
            borderRadius: '999px', padding: '0.18rem 0.55rem',
          }}>
            {badge.icon} {badge.label}
          </span>
        )}
      </div>

      {/* ── Line 1: Complexity tier (monospace, subtle) */}
      {complexity && (
        <div style={{
          fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        }}>
          {complexity}
        </div>
      )}

      {/* ── Line 2: Primary title — h2, bold (mirrors proto-detail__hero-title) */}
      <h2 style={{
        margin: 0, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15,
        fontSize: 'clamp(1.05rem, 2vw, 1.3rem)', color: '#FFFFFF',
      }}>
        {displayTitle}
      </h2>

      {/* ── Line 3: Protocol ID · Status (mirrors ProtocolTemplate badge row) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {shortCode && (
          <span style={{
            fontSize: '0.62rem', fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            letterSpacing: '0.06em', fontWeight: 600,
            background: 'rgba(255,255,255,0.10)', padding: '0.18rem 0.5rem',
            borderRadius: '5px', color: 'rgba(255,255,255,0.70)',
          }}>
            {shortCode}{version ? ` · v${version}` : ''}
          </span>
        )}
        {status && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.65rem', fontWeight: 600, color: statusColor,
            background: `${statusColor}15`, borderRadius: '999px',
            padding: '0.18rem 0.55rem',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
            {status.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      {/* ── Tagline */}
      {tagline && (
        <p style={{
          margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.48)',
          lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {tagline}
        </p>
      )}

      {/* ── Quick-stat pills (mirrors proto-detail__stats) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
        {duration !== '—' && (
          <StatPill icon={<Clock size={11} />} value={duration} label="Duration" />
        )}
        {phaseCount && (
          <StatPill icon={<Layers size={11} />} value={phaseCount} label="Phases" />
        )}
        {compoundCount && (
          <StatPill icon={<Activity size={11} />} value={compoundCount} label="Compounds" />
        )}
      </div>

      {/* ── CTA — pinned to bottom */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        marginTop: 'auto',
        color: hovered ? '#00A3E0' : 'rgba(255,255,255,0.35)',
        fontSize: '0.8rem', fontWeight: 600, transition: 'color 0.2s',
      }}>
        View Protocol <ArrowRight size={13} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function StatPill({ icon, value, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '999px', padding: '0.22rem 0.6rem',
      fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)',
    }}>
      {icon}
      <span style={{ fontWeight: 700, color: '#fff' }}>{value}</span>
      <span>{label}</span>
    </span>
  );
}

/* ─── Static filter chips ────────────────────────────────────────────────── */
const PROTOCOL_FILTERS = ['Anti-Aging', 'Weight', 'Cognitive', 'Hormonal', 'Longevity', 'Metabolic', 'Energy', 'Immune', 'Recovery', 'Aesthetic'];

function matchesFilter(protocol, filter) {
  const haystack = [
    protocol.id || '',
    protocol.short_code || '',
    protocol.category || '',
    protocol.metadata?.primary_goal || '',
    protocol.primary_goal || '',
    ...(protocol.tags || []),
  ].join(' ').toLowerCase();

  const needle = filter.toLowerCase();
  // Map friendly filter names to protocol slugs/goals
  if (needle === 'anti-aging') return haystack.includes('anti-aging') || haystack.includes('anti_aging') || haystack.includes('aging') || haystack.includes('longevity') || haystack.includes('lon_') || haystack.includes('epitalon') || haystack.includes('telomere') || haystack.includes('age');
  if (needle === 'aesthetic') return haystack.includes('aesthetic') || haystack.includes('skin') || haystack.includes('sa_');
  if (needle === 'energy') return haystack.includes('energy') || haystack.includes('mitochondrial') || haystack.includes('mots') || haystack.includes('lon_') || haystack.includes('longevity');
  if (needle === 'immune') return haystack.includes('immune') || haystack.includes('immune_');
  if (needle === 'metabolic') return haystack.includes('metabolic') || haystack.includes('met_') || haystack.includes('insulin') || haystack.includes('glp') || haystack.includes('glucose');
  if (needle === 'cognitive') return haystack.includes('cognitive') || haystack.includes('focus') || haystack.includes('cog_') || haystack.includes('neuro') || haystack.includes('nootropic');
  if (needle === 'weight') return haystack.includes('weight') || haystack.includes('wm_');
  if (needle === 'hormonal') return haystack.includes('hormonal') || haystack.includes('horm_') || haystack.includes('gh_') || haystack.includes('testosterone') || haystack.includes('peptide hormone');
  if (needle === 'longevity') return haystack.includes('longevity') || haystack.includes('lon_') || haystack.includes('epitalon') || haystack.includes('telomere');
  if (needle === 'recovery') return haystack.includes('recovery') || haystack.includes('repair') || haystack.includes('rec_') || haystack.includes('bpc');
  return haystack.includes(needle);
}

/* ─── FeaturedProtocols section ─────────────────────────────────────────── */

/* ─── Search-aware filter helper (Phase 6) ─────────────────────────────── */
function matchesSearch(protocol, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [
    protocol.title || '', protocol.category || '',
    protocol.primary_goal || '', protocol.tagline || '',
    ...(protocol.tags || []),
  ].join(' ').toLowerCase().includes(needle);
}

/* ─── Section ─────────────────────────────────────────────────────────────── */

export default function FeaturedProtocols({ searchQuery = '' }) {
  const navigate    = useNavigate();
  const sectionRef  = useRef(null);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeFilter, setFilter] = useState('Anti-Aging');
  const [visibleCount, setVisibleCount] = useState(6);

  // Firebase-only: no local fallback.
  useEffect(() => {
    let cancelled = false;
    const fetchProtocols = async () => {
      setLoading(true);
      setError(null);
      try {
        const firebaseData = await getPublicProtocols();
        if (cancelled) return;
        setProtocols(firebaseData.map(p => normalizeBlueprint(p)));
      } catch (err) {
        if (cancelled) return;
        console.error('[FeaturedProtocols] Firebase fetch failed:', err);
        setError('Could not load protocols. Please try again later.');
        setProtocols([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProtocols();
    return () => { cancelled = true; };
  }, []);

  // Phase 6: when a search query is active, bypass chips and search instead
  // Reset visible count when filter or search changes
  useEffect(() => { setVisibleCount(6); }, [activeFilter, searchQuery]);

  const featured = useMemo(() => {
    if (searchQuery) {
      return protocols.filter(p => matchesSearch(p, searchQuery));
    }
    return protocols.filter(p => matchesFilter(p, activeFilter));
  }, [protocols, activeFilter, searchQuery]);

  const visibleFeatured = featured.slice(0, visibleCount);

  // IDs that match the search for ring highlight
  const matchedIds = useMemo(() => {
    if (!searchQuery) return null;
    return new Set(featured.map(p => p.id));
  }, [featured, searchQuery]);

  return (
    <section ref={sectionRef} style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.25rem', background: '#0B1120' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <p style={{
              fontSize: '0.72rem', fontWeight: 700, color: '#10B981',
              letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.45rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              Featured Protocols
              {protocols.length > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  background: '#10B98122', color: '#10B981', border: '1px solid #10B98155',
                  borderRadius: '99px', fontSize: '0.65rem', fontWeight: 800,
                  padding: '1px 8px', letterSpacing: '0.04em',
                }}>
                  {protocols.length}
                </span>
              )}
            </p>
            <h2 style={{
              fontSize: 'clamp(1.45rem, 3vw, 2.1rem)', fontWeight: 800,
              color: '#fff', letterSpacing: '-0.02em', margin: '0 0 0.35rem',
              lineHeight: 1.15,
            }}>
              Structured Clinical Programs
            </h2>
            <p style={{
              margin: 0, fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.42)', lineHeight: 1.5,
            }}>
              Ready-to-review therapeutic blueprints
            </p>
          </div>

        </div>

        {/* Static filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {PROTOCOL_FILTERS.map(f => (
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

        {/* Grid */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}>
            {[1,2,3].map(i => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', padding: '1.5rem',
                height: '260px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#F87171', padding: '3rem 0',
            fontSize: '0.9rem', background: 'rgba(248,113,113,0.05)', borderRadius: '12px',
            border: '1px solid rgba(248,113,113,0.20)' }}>
            {error}
          </div>
        ) : featured.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', padding: '3rem 0',
            fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)' }}>No blueprints found for this category.</div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
              alignItems: 'stretch',
            }}>
              {visibleFeatured.map(p => (
                <ProtocolCard
                  key={p.id}
                  protocol={p}
                  onClick={() => navigate(`/blueprint/${p.id}`)}
                  highlighted={matchedIds ? matchedIds.has(p.id) : false}
                />
              ))}
            </div>

            {/* Load more */}
            {visibleCount < featured.length && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button
                  onClick={() => setVisibleCount(c => c + 6)}
                  style={{
                    background: 'rgba(16,185,129,0.10)',
                    border: '1.5px solid rgba(16,185,129,0.35)',
                    borderRadius: '999px',
                    color: '#10B981',
                    fontSize: '0.83rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '0.55rem 1.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.20)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.10)'; }}
                >
                  Load more ({featured.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};


