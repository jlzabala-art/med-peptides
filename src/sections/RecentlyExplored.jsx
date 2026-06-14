import Clock from "lucide-react/dist/esm/icons/clock";
import Dna from "lucide-react/dist/esm/icons/dna";
import Pill from "lucide-react/dist/esm/icons/pill";
import ScrollText from "lucide-react/dist/esm/icons/scroll-text";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Bot from "lucide-react/dist/esm/icons/bot";
import Search from "lucide-react/dist/esm/icons/search";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import History from "lucide-react/dist/esm/icons/history";
/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
/**
 * RecentlyExplored.jsx — Phase 4-D (v3 — Premium Redesign)
 *
 * Schema: Array<{ type: 'peptide'|'protocol'|'supplement', slug: string, name: string, ts: number, category?: string }>
 *
 * Features:
 *  - "Personal scientific workspace" aesthetic
 *  - Rich cards: type badge, name, category, timestamp, Open + Ask AI actions
 *  - Distinct visual DNA per type: peptide (blue), supplement (green), protocol (purple)
 *  - ClinicalAI structured payload — never opens empty
 *  - Empty state with "Start Exploring" CTA
 *  - Two-step clear history with confirm
 *  - Desktop: adaptive grid  |  Mobile: horizontal swipe carousel
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';













// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'rp_recent_views';
const MAX_DISPLAY  = 6;

// ── Type design system ────────────────────────────────────────────────────────

const TYPE_META = {
  peptide: {
    Icon:         Dna,
    label:        'Peptide',
    color:        '#0071bd',
    colorRgb:     '0,113,189',
    accentLight:  'rgba(0,113,189,0.10)',
    accentBorder: 'rgba(0,113,189,0.22)',
    accentGlow:   '0 8px 32px rgba(0,113,189,0.18)',
    badgeBg:      'rgba(0,113,189,0.12)',
    badgeColor:   '#0071bd',
    headerGrad:   'linear-gradient(135deg, rgba(0,54,102,0.08) 0%, rgba(0,149,255,0.04) 100%)',
    route:        (slug) => `/product/${slug}`,
    intent:       'peptide_explanation',
    aiPrefix:     'Tell me about',
    aiSuffix:     '— what is it, what are the main benefits, mechanisms of action, and what does the clinical research say?',
  },
  supplement: {
    Icon:         Pill,
    label:        'Supplement',
    color:        'var(--color-success)',
    colorRgb:     '5,150,105',
    accentLight:  'rgba(5,150,105,0.09)',
    accentBorder: 'rgba(5,150,105,0.22)',
    accentGlow:   '0 8px 32px rgba(5,150,105,0.18)',
    badgeBg:      'rgba(5,150,105,0.12)',
    badgeColor:   'var(--color-success)',
    headerGrad:   'linear-gradient(135deg, rgba(5,80,55,0.07) 0%, rgba(16,185,129,0.04) 100%)',
    route:        (slug) => `/product/${slug}`,
    intent:       'supplement_explanation',
    aiPrefix:     'Tell me about',
    aiSuffix:     '— benefits, recommended dosage, scientific evidence, and how it compares to alternatives?',
  },
  protocol: {
    Icon:         ScrollText,
    label:        'Protocol',
    color:        '#7c3aed',
    colorRgb:     '124,58,237',
    accentLight:  'rgba(124,58,237,0.09)',
    accentBorder: 'rgba(124,58,237,0.22)',
    accentGlow:   '0 8px 32px rgba(124,58,237,0.18)',
    badgeBg:      'rgba(124,58,237,0.12)',
    badgeColor:   '#7c3aed',
    headerGrad:   'linear-gradient(135deg, rgba(76,29,149,0.07) 0%, rgba(167,139,250,0.04) 100%)',
    route:        (slug) => `/protocol/${slug}`,
    intent:       'protocol_explanation',
    aiPrefix:     'Explain the',
    aiSuffix:     'protocol — what is it designed for, what peptides or supplements does it include, and what outcomes can I expect?',
  },
};

const FALLBACK_META = {
  Icon:         FlaskConical,
  label:        'Item',
  color:        'var(--color-text-secondary)',
  colorRgb:     '100,116,139',
  accentLight:  'rgba(100,116,139,0.08)',
  accentBorder: 'rgba(100,116,139,0.18)',
  accentGlow:   '0 4px 16px rgba(100,116,139,0.10)',
  badgeBg:      'rgba(100,116,139,0.10)',
  badgeColor:   'var(--color-text-secondary)',
  headerGrad:   'rgba(100,116,139,0.06)',
  route:        (slug) => `/product/${slug}`,
  intent:       'general_explanation',
  aiPrefix:     'Tell me about',
  aiSuffix:     '— what is it and what are the key benefits?',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function readRecent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function relativeTime(ts) {
  if (!ts) return '';
  const diffMs   = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1)   return 'Just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24)   return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)   return `${diffDays} days ago`;
  return 'Last week';
}

// ── RecentCard ────────────────────────────────────────────────────────────────

function RecentCard({ item, onNav }) {
  const meta = TYPE_META[item.type] ?? FALLBACK_META;
  const { Icon } = meta;

  const [hovered,   setHovered]   = useState(false);
  const [aiHovered, setAiHovered] = useState(false);
  const [openHov,   setOpenHov]   = useState(false);

  const handleOpen = (e) => {
    e.stopPropagation();
    onNav(meta.route(item.slug));
  };

  const handleAskAI = (e) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('open-clinical-ai', {
        detail: {
          source:     'recently_explored',
          entityType: item.type,
          entityName: item.name,
          entitySlug: item.slug,
          intent:     meta.intent,
          prefill:    `${meta.aiPrefix} ${item.name} ${meta.aiSuffix}`,
        },
      })
    );
  };

  return (
    <div
      className="re-card"
      role="article"
      aria-label={`${meta.label}: ${item.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:      'relative',
        display:       'flex',
        flexDirection: 'column',
        background:    hovered
          ? `linear-gradient(160deg, ${meta.accentLight} 0%, rgba(255,255,255,0.98) 60%)`
          : 'rgba(255,255,255,0.97)',
        border:        `1.5px solid ${hovered ? meta.accentBorder : 'rgba(0,0,0,0.07)'}`,
        borderRadius:  '18px',
        overflow:      'hidden',
        boxShadow:     hovered
          ? `${meta.accentGlow}, 0 2px 8px rgba(0,0,0,0.06)`
          : '0 2px 8px rgba(0,0,0,0.05)',
        transform:     hovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        transition:    'all 0.25s cubic-bezier(0.34,1.4,0.64,1)',
        cursor:        'default',
        minHeight:     '176px',
        flex:          '1 1 0',
      }}
    >
      {/* ── Top accent bar */}
      <div
        style={{
          height:     '3px',
          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)`,
          opacity:    hovered ? 1 : 0.55,
          transition: 'opacity 0.25s ease',
          flexShrink: 0,
        }}
      />

      {/* ── Card body */}
      <div style={{ padding: '1rem 1.1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>

        {/* Row 1: type badge + timestamp */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
          {/* Type badge */}
          <div
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '0.3rem',
              background:    meta.badgeBg,
              color:         meta.badgeColor,
              borderRadius:  '20px',
              padding:       '0.2rem 0.55rem',
              fontSize:      '0.6rem',
              fontWeight:    800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border:        `1px solid ${meta.accentBorder}`,
            }}
          >
            <Icon size={10} strokeWidth={2.5} />
            {meta.label}
          </div>

          {/* Timestamp */}
          {item.ts && (
            <div
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '0.25rem',
                fontSize:   '0.62rem',
                color:      'var(--text-muted, #94a3b8)',
                whiteSpace: 'nowrap',
              }}
            >
              <Clock size={9} strokeWidth={2.5} style={{ opacity: 0.7 }} />
              {relativeTime(item.ts)}
            </div>
          )}
        </div>

        {/* Row 2: name */}
        <div
          style={{
            fontSize:     '0.92rem',
            fontWeight:   800,
            color:        'var(--text-main)',
            lineHeight:   1.25,
            letterSpacing: '-0.01em',
            // clamp at 2 lines
            display:           '-webkit-box',
            WebkitLineClamp:   2,
            WebkitBoxOrient:   'vertical',
            overflow:          'hidden',
          }}
        >
          {item.name}
        </div>

        {/* Row 3: category (optional) */}
        {item.category && (
          <div
            style={{
              fontSize:   '0.7rem',
              fontWeight: 500,
              color:      meta.color,
              opacity:    0.8,
            }}
          >
            {item.category}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Row 4: action buttons */}
        <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.2rem' }}>
          {/* Open button */}
          <button
            onClick={handleOpen}
            onMouseEnter={() => setOpenHov(true)}
            onMouseLeave={() => setOpenHov(false)}
            aria-label={`Open ${item.name}`}
            style={{
              flex:           1,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '0.3rem',
              padding:        '0.4rem 0.6rem',
              background:     openHov ? meta.color : meta.accentLight,
              border:         `1px solid ${openHov ? meta.color : meta.accentBorder}`,
              borderRadius:   '9px',
              color:          openHov ? 'var(--color-bg-surface)' : meta.color,
              fontSize:       '0.68rem',
              fontWeight:     700,
              letterSpacing:  '0.02em',
              cursor:         'pointer',
              transition:     'all 0.18s ease',
            }}
          >
            <ExternalLink size={10} strokeWidth={2.5} />
            Open
          </button>

          {/* Ask AI button */}
          <button
            onClick={handleAskAI}
            onMouseEnter={() => setAiHovered(true)}
            onMouseLeave={() => setAiHovered(false)}
            aria-label={`Ask AI about ${item.name}`}
            style={{
              flex:           1,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '0.3rem',
              padding:        '0.4rem 0.6rem',
              background:     aiHovered ? 'rgba(0,113,189,0.1)' : 'transparent',
              border:         `1px solid ${aiHovered ? 'rgba(0,113,189,0.3)' : 'rgba(0,0,0,0.09)'}`,
              borderRadius:   '9px',
              color:          aiHovered ? '#0071bd' : 'var(--text-muted, #94a3b8)',
              fontSize:       '0.68rem',
              fontWeight:     600,
              cursor:         'pointer',
              transition:     'all 0.18s ease',
              whiteSpace:     'nowrap',
            }}
          >
            <Bot size={10} strokeWidth={2} />
            Ask AI
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState({ onSearch }) {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            '1rem',
        padding:        '2.5rem 2rem',
        background:     'linear-gradient(160deg, rgba(0,113,189,0.04) 0%, rgba(255,255,255,0) 100%)',
        border:         '1.5px dashed rgba(0,113,189,0.18)',
        borderRadius:   '20px',
        textAlign:      'center',
      }}
    >
      {/* Icon cluster */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
        {[
          { Icon: Dna,        bg: 'rgba(0,113,189,0.10)',  color: '#0071bd'  },
          { Icon: History,    bg: 'rgba(100,116,139,0.10)', color: 'var(--color-text-secondary)', size: 28 },
          { Icon: ScrollText, bg: 'rgba(124,58,237,0.10)', color: '#7c3aed' },
        ].map(({ Icon, bg, color, size = 22 }, i) => (
          <div
            key={i}
            style={{
              width:          `${size + 18}px`,
              height:         `${size + 18}px`,
              borderRadius:   '12px',
              background:     bg,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              transform:      i === 1 ? 'scale(1.15)' : 'scale(0.88)',
            }}
          >
            <Icon size={size} color={color} strokeWidth={1.7} />
          </div>
        ))}
      </div>

      {/* Text */}
      <div>
        <div
          style={{
            fontSize:      '1rem',
            fontWeight:    800,
            color:         'var(--text-main)',
            marginBottom:  '0.4rem',
            letterSpacing: '-0.01em',
          }}
        >
          Start Exploring
        </div>
        <div
          style={{
            fontSize:   '0.8rem',
            color:      'var(--text-muted, #64748b)',
            lineHeight: 1.6,
            maxWidth:   '300px',
          }}
        >
          Peptides, supplements and protocols you explore will appear here for quick access.
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onSearch}
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '0.4rem',
          padding:       '0.5rem 1.1rem',
          background:    'linear-gradient(135deg, #0071bd, #0099ff)',
          color:         'var(--color-bg-surface)',
          border:        'none',
          borderRadius:  '10px',
          cursor:        'pointer',
          fontSize:      '0.77rem',
          fontWeight:    700,
          letterSpacing: '0.02em',
          boxShadow:     '0 4px 14px rgba(0,113,189,0.3)',
          transition:    'all 0.18s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,113,189,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,113,189,0.3)';
        }}
      >
        <Search size={13} strokeWidth={2.5} />
        Explore the Research Hub
      </button>
    </div>
  );
}

// ── TypeLegend ────────────────────────────────────────────────────────────────

function TypeLegend({ items }) {
  const counts = items.reduce((acc, item) => {
    const t = item.type || 'unknown';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(counts)
    .filter(([type]) => TYPE_META[type])
    .map(([type, count]) => ({ type, count, meta: TYPE_META[type] }));

  if (entries.length < 2) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {entries.map(({ type, count, meta }) => {
        const { Icon } = meta;
        return (
          <div
            key={type}
            style={{
              display:    'inline-flex',
              alignItems: 'center',
              gap:        '0.28rem',
              background: meta.badgeBg,
              color:      meta.badgeColor,
              borderRadius: '20px',
              padding:    '0.18rem 0.55rem',
              fontSize:   '0.62rem',
              fontWeight: 700,
              border:     `1px solid ${meta.accentBorder}`,
            }}
          >
            <Icon size={9} strokeWidth={2.5} />
            {count} {meta.label}{count !== 1 ? 's' : ''}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function RecentlyExplored() {
  const navigate = useNavigate();
  const [items,      setItems]      = useState([]);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(() => {
    const all     = readRecent();
    const seen    = new Set();
    const deduped = [];
    [...all]
      .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))
      .forEach((item) => {
        const key = `${item.type}::${item.slug}`;
        if (!seen.has(key) && item.slug && item.name) {
          seen.add(key);
          deduped.push(item);
        }
      });
    setItems(deduped.slice(0, MAX_DISPLAY));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener('storage', load);
    window.addEventListener('rp_recent_updated', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('rp_recent_updated', load);
    };
  }, [load]);

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    window.dispatchEvent(new CustomEvent('open-search-modal', { detail: { tab: 'peptides' } }));
  };

  const handleClearClick = () => {
    if (confirming) {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event('rp_recent_updated'));
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
    }
  };

  const hasItems = items.length > 0;

  return (
    <section aria-label="Recently explored" style={{ padding: '1.5rem 0 2rem' }}>
      {/* Scoped styles */}
      <style>{`
        .re-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
        }
        @media (max-width: 639px) {
          .re-card-grid {
            display: flex !important;
            overflow-x: auto;
            gap: 0.65rem;
            padding: 0.25rem 0.25rem 1rem;
            margin-bottom: 0.25rem;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
          }
          .re-card-grid::-webkit-scrollbar { display: none; }
          .re-card {
            flex: 0 0 200px !important;
            scroll-snap-align: start;
          }
        }
      `}</style>

      <div className="container">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            marginBottom:   hasItems ? '0.85rem' : '1rem',
            flexWrap:       'wrap',
            gap:            '0.5rem',
          }}
        >
          {/* Left: badge + legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           '0.35rem',
                fontSize:      '0.67rem',
                fontWeight:    700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color:         'var(--color-text-secondary)',
                background:    'rgba(71,85,105,0.07)',
                padding:       '0.28rem 0.75rem',
                borderRadius:  '20px',
                border:        '1px solid rgba(71,85,105,0.14)',
              }}
            >
              <History size={11} strokeWidth={2.5} />
              Recently Explored
            </div>

            {hasItems && <TypeLegend items={items} />}
          </div>

          {/* Right: clear history */}
          {hasItems && (
            <button
              onClick={handleClearClick}
              aria-label={confirming ? 'Confirm clear history' : 'Clear recently explored'}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '0.3rem',
                background:   confirming ? 'rgba(239,68,68,0.07)' : 'none',
                border:       confirming ? '1px solid rgba(239,68,68,0.25)' : '1px solid transparent',
                cursor:       'pointer',
                fontSize:     '0.66rem',
                fontWeight:   confirming ? 700 : 500,
                color:        confirming ? 'var(--color-danger)' : 'var(--text-muted, #94a3b8)',
                padding:      '0.22rem 0.6rem',
                borderRadius: '8px',
                transition:   'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!confirming) e.currentTarget.style.color = 'var(--color-danger)';
              }}
              onMouseLeave={(e) => {
                if (!confirming) e.currentTarget.style.color = 'var(--text-muted, #94a3b8)';
              }}
            >
              <Trash2 size={10} strokeWidth={2.5} />
              {confirming ? 'Tap again to confirm' : 'Clear history'}
            </button>
          )}
        </div>

        {/* ── Content ─────────────────────────────────────────────────── */}
        {hasItems ? (
          <div className="re-card-grid">
            {items.map((item, idx) => (
              <RecentCard
                key={`${item.type}::${item.slug}::${idx}`}
                item={item}
                onNav={handleNav}
              />
            ))}
          </div>
        ) : (
          <EmptyState onSearch={handleSearch} />
        )}
      </div>
    </section>
  );
}