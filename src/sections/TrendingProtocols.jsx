/* eslint-disable no-undef */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowRight, Brain, ChevronDown, ChevronUp, Clock, Dna, Flame,
  FlaskConical, Heart, Layers, Moon, Shield, Sparkles
} from 'lucide-react';
import { useCategoryBestItems } from '../hooks/useCategoryBestItems';
import { useResponsive } from '../hooks/useResponsive';
import { useAnalytics } from '../hooks/useAnalytics';

// CATEGORIES removed — categories are now read dynamically from Firestore.

// ── Card visual theming per category ─────────────────────────────────────────
const THEME = {
  'Weight Management / Obesity': {
    gradient: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)',
    glow: 'rgba(139,92,246,0.18)',
    accent: '#a78bfa',
    Icon: Flame,
  },
  'Recovery / Injury': {
    gradient: 'linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)',
    glow: 'rgba(244,63,94,0.18)',
    accent: '#fb7185',
    Icon: Heart,
  },
  'Cognitive Support': {
    gradient: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)',
    glow: 'rgba(14,165,233,0.18)',
    accent: '#38bdf8',
    Icon: Brain,
  },
  'Longevity': {
    gradient: 'linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)',
    glow: 'rgba(16,185,129,0.18)',
    accent: '#34d399',
    Icon: Sparkles,
  },
  'Sleep Support': {
    gradient: 'linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)',
    glow: 'rgba(59,130,246,0.18)',
    accent: '#93c5fd',
    Icon: Moon,
  },
  'Hormonal Support': {
    gradient: 'linear-gradient(135deg,#f97316 0%,#eab308 100%)',
    glow: 'rgba(249,115,22,0.18)',
    accent: '#fb923c',
    Icon: Activity,
  },
  'Immune / Inflammation': {
    gradient: 'linear-gradient(135deg,#14b8a6 0%,#06b6d4 100%)',
    glow: 'rgba(20,184,166,0.18)',
    accent: '#2dd4bf',
    Icon: Shield,
  },
  'Energy / Mitochondrial': {
    gradient: 'linear-gradient(135deg,#eab308 0%,#f97316 100%)',
    glow: 'rgba(234,179,8,0.18)',
    accent: '#fde047',
    Icon: Activity,
  },
  'Skin / Anti-Aging': {
    gradient: 'linear-gradient(135deg,#f472b6 0%,#ec4899 100%)',
    glow: 'rgba(244,114,182,0.18)',
    accent: '#f9a8d4',
    Icon: Dna,
  },
};

function getTheme(category) {
  return THEME[category] || {
    gradient: 'linear-gradient(135deg,#003666 0%,#0070c0 100%)',
    glow: 'rgba(0,112,192,0.18)',
    accent: '#60a5fa',
    Icon: FlaskConical,
  };
}



// ── Protocol card ─────────────────────────────────────────────────────────────
function ProtocolCard({ protocol, onClick }) {
  const [hovered, setHovered] = useState(false);
  const theme = getTheme(protocol.category);
  const { Icon } = theme;
  const products = (protocol.products_used || []).slice(0, 3);
  const extraCount = (protocol.products_used || []).length - 3;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered
          ? 'rgba(255,255,255,0.97)'
          : 'rgba(255,255,255,0.88)',
        border: hovered
          ? `1.5px solid ${theme.accent}`
          : '1px solid rgba(0,0,0,0.07)',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered
          ? `0 20px 50px ${theme.glow}, 0 2px 8px rgba(0,0,0,0.06)`
          : '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Gradient header bar */}
      <div style={{
        height: '5px',
        background: theme.gradient,
        flexShrink: 0,
      }} />

      {/* Card body */}
      <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        {/* Icon + category badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            width: '42px', height: '42px',
            borderRadius: '12px',
            background: theme.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${theme.glow}`,
          }}>
            <Icon size={20} color="white" strokeWidth={1.8} />
          </div>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: theme.accent.replace('fa', '60').replace('d4', '60'),
            background: theme.glow,
            padding: '0.25rem 0.6rem',
            borderRadius: '20px',
            border: `1px solid ${theme.glow}`,
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}>
            {protocol.category?.split('/')[0]?.trim() || 'Protocol'}
          </span>
        </div>

        {/* Name */}
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '0.92rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}>
            {protocol.metadata?.scientificName || protocol.name}
          </h3>
          {/* Secondary label: legacy name when scientificName is primary */}
          {protocol.metadata?.scientificName && protocol.name && (
            <p style={{
              margin: '0.1rem 0 0',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              fontWeight: 500,
              lineHeight: 1.3,
              opacity: 0.7,
            }}>
              {protocol.name}
            </p>
          )}
          {protocol.metadata?.shortCode && (
            <span style={{
              display: 'inline-block',
              marginTop: '0.2rem',
              fontSize: '0.6rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
            }}>
              {protocol.metadata.shortCode}
            </span>
          )}
        </div>

        {/* Clinical focus */}
        {protocol.clinical_focus && (
          <p style={{
            margin: 0,
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {protocol.clinical_focus}
          </p>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: 'auto' }}>
            {products.map(p => (
              <span key={p} style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                background: `${theme.glow}`,
                color: 'var(--text-main)',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                border: `1px solid ${theme.glow}`,
                textTransform: 'capitalize',
                letterSpacing: '0.01em',
              }}>
                {p.replace(/-/g, ' ')}
              </span>
            ))}
            {extraCount > 0 && (
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                padding: '0.2rem 0.4rem',
              }}>
                +{extraCount} more
              </span>
            )}
          </div>
        )}

        {/* Footer: duration + chevron */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.6rem',
          borderTop: '0.5px solid rgba(0,0,0,0.06)',
          marginTop: '0.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <Clock size={12} />
            <span style={{ fontWeight: 600 }}>{protocol.duration_weeks} wks</span>
            {protocol.products_used?.length > 0 && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                <Layers size={12} />
                <span style={{ fontWeight: 600 }}>{protocol.products_used.length} compound{protocol.products_used.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
          <div style={{
            width: '28px', height: '28px',
            borderRadius: '50%',
            background: hovered ? theme.gradient : 'rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s ease',
          }}>
            <ArrowRight size={13} color={hovered ? 'white' : 'var(--text-muted)'} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton card (loading state) ────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', background: 'rgba(255,255,255,0.88)' }}>
      <div style={{ height: '5px', background: 'rgba(0,0,0,0.08)' }} />
      <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(0,0,0,0.08)' }} />
          <div style={{ width: 80, height: 20, borderRadius: 20, background: 'rgba(0,0,0,0.06)' }} />
        </div>
        <div style={{ height: 16, borderRadius: 8, background: 'rgba(0,0,0,0.08)' }} />
        <div style={{ height: 12, borderRadius: 8, background: 'rgba(0,0,0,0.05)', width: '70%' }} />
        <div style={{ height: 36, borderRadius: 8, background: 'rgba(0,0,0,0.05)' }} />
      </div>
    </div>
  );
}

// ── Mobile: one accordion item per category ───────────────────────────────────
// Phase B3 — internal useState removed; open state fully controlled by parent
function AccordionItem({ category, protocol, navigate, isOpen, onToggle }) {
  const theme = getTheme(category);
  const { Icon } = theme;
  return (
    <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', overflow: 'hidden', background: 'white', marginBottom: '0.75rem' }}>
      <button
        onClick={() => onToggle(category)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.2rem', background: 'transparent', border: 'none', cursor: 'pointer', gap: '0.75rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '10px', background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={16} color="white" strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', textAlign: 'left' }}>{category}</span>
        </div>
        {isOpen ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
      </button>
      {isOpen && (
        <div style={{ padding: '0 1rem 1rem' }}>
          <ProtocolCard
            protocol={protocol}
            onClick={() => {
              trackProtocolClick({ protocolId: protocol.protocol_id, category, source: 'trending_mobile_accordion' });
              navigate(`/protocol/${protocol.protocol_id}`);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function TrendingProtocols() {
  const navigate = useNavigate();
  const isMobile = useResponsive('(max-width: 767px)');
  const { allItems, loading } = useCategoryBestItems('blueprints', 'protocol_id');

  // Phase D1 — pagination: show 4 categories per page
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 4;
  const items = allItems.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // Phase E1 — analytics
  const { trackProtocolClick, trackTrendingCategoryOpen } = useAnalytics();

  // Phase B1 — mutual-exclusion: only one accordion open at a time
  const [openCategory, setOpenCategory] = useState(null);

  function handleAccordionToggle(cat) {
    const willOpen = openCategory !== cat;
    setOpenCategory(prev => (prev === cat ? null : cat));
    if (willOpen) trackTrendingCategoryOpen({ section: 'protocols', category: cat });
  }

  return (
    <section style={{ padding: '4rem 1rem', background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)' }}>
      <div className="container">

        {/* ── Section header ── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(0,113,189,0.06)',
            border: '1px solid rgba(0,113,189,0.12)',
            borderRadius: '30px',
            padding: '0.35rem 1rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--primary)',
            marginBottom: '1rem',
          }}>
            <FlaskConical size={13} />
            Research Protocol Library
          </div>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
            fontWeight: 900,
            color: 'var(--text-main)',
            margin: '0 0 0.75rem',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
          }}>
            Clinical-Grade Protocols,{' '}
            <span style={{ background: 'linear-gradient(135deg,#0071bd,#00a3e0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ready to Deploy
            </span>
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Evidence-based multi-phase programs designed for metabolic correction, recovery, longevity and beyond.
          </p>
        </div>

        {/* ── Loading: 4 skeleton cards ── */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Phase F1: Empty state ── */}
        {!loading && allItems.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem 1.5rem', marginBottom: '2.5rem',
            background: 'rgba(0,113,189,0.03)', borderRadius: '16px',
            border: '1.5px dashed rgba(0,113,189,0.15)',
          }}>
            <FlaskConical size={40} style={{ color: 'rgba(0,113,189,0.25)', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1rem', color: '#9ca3af', fontWeight: 600, margin: 0 }}>
              No protocols available right now. Check back soon.
            </p>
          </div>
        )}

        {/* ── Mobile: accordions per category ── */}
        {!loading && isMobile && allItems.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            {items.map(({ category, item }) => (
              <AccordionItem
                key={category}
                category={category}
                protocol={item}
                navigate={navigate}
                isOpen={openCategory === category}
                onToggle={handleAccordionToggle}
              />
            ))}
          </div>
        )}

        {/* ── Desktop: 4-card grid ── */}
        {!loading && !isMobile && allItems.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {items.map(({ item }) => (
              <ProtocolCard
                key={item.protocol_id}
                protocol={item}
                onClick={() => {
                  trackProtocolClick({ protocolId: item.protocol_id, source: 'trending_desktop_grid' });
                  navigate(`/protocol/${item.protocol_id}`);
                }}
              />
            ))}
          </div>
        )}

        {/* ── Phase D2: Pagination controls ── */}
        {!loading && allItems.length > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            {page > 0 && (
              <button
                onClick={() => { setPage(p => p - 1); setOpenCategory(null); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'white', border: '1.5px solid rgba(0,113,189,0.2)', borderRadius: '40px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer' }}
              >
                ← Anterior
              </button>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {page + 1} / {Math.ceil(allItems.length / PAGE_SIZE)}
            </span>
            {allItems.length > (page + 1) * PAGE_SIZE && (
              <button
                onClick={() => { setPage(p => p + 1); setOpenCategory(null); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg,#003666,#0071bd)', border: 'none', borderRadius: '40px', fontWeight: 700, fontSize: '0.85rem', color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,113,189,0.25)' }}
              >
                Ver 4 más →
              </button>
            )}
          </div>
        )}

        {/* ── Footer CTA row ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/protocol-finder')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.85rem 2rem',
              background: 'linear-gradient(135deg,#003666,#0071bd)',
              color: 'white', border: 'none', borderRadius: '40px',
              fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,113,189,0.3)', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,113,189,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,113,189,0.3)'; }}
          >
            <Activity size={16} />
            Build a Custom Protocol
            <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate('/protocols')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 1.75rem', background: 'white',
              color: 'var(--primary)', border: '1.5px solid rgba(0,113,189,0.2)',
              borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(0,113,189,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,113,189,0.2)'; e.currentTarget.style.background = 'white'; }}
          >
            View all protocols
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </section>
  );
}
