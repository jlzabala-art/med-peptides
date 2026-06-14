import Activity from "lucide-react/dist/esm/icons/activity";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Brain from "lucide-react/dist/esm/icons/brain";
import Bot from "lucide-react/dist/esm/icons/bot";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import Dna from "lucide-react/dist/esm/icons/dna";
import Flame from "lucide-react/dist/esm/icons/flame";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Heart from "lucide-react/dist/esm/icons/heart";
import Leaf from "lucide-react/dist/esm/icons/leaf";
import Moon from "lucide-react/dist/esm/icons/moon";
import Shield from "lucide-react/dist/esm/icons/shield";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';














import { useCategoryBestItems } from '../hooks/useCategoryBestItems';
import { useResponsive } from '../hooks/useResponsive';
import { useAnalytics } from '../hooks/useAnalytics';

// ── Card visual theming per category (mirrors TrendingProtocols) ─────────────
const THEME = {
  'Weight Management': {
    gradient: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)',
    glow: 'rgba(139,92,246,0.18)', accent: '#a78bfa', Icon: Flame,
  },
  'Recovery': {
    gradient: 'linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)',
    glow: 'rgba(244,63,94,0.18)', accent: '#fb7185', Icon: Heart,
  },
  'Cognitive': {
    gradient: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)',
    glow: 'rgba(14,165,233,0.18)', accent: '#38bdf8', Icon: Brain,
  },
  'Longevity': {
    gradient: 'linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)',
    glow: 'rgba(16,185,129,0.18)', accent: '#34d399', Icon: Leaf,
  },
  'Sleep': {
    gradient: 'linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)',
    glow: 'rgba(59,130,246,0.18)', accent: '#93c5fd', Icon: Moon,
  },
  'Hormonal': {
    gradient: 'linear-gradient(135deg,#f97316 0%,#eab308 100%)',
    glow: 'rgba(249,115,22,0.18)', accent: '#fb923c', Icon: Activity,
  },
  'Immune': {
    gradient: 'linear-gradient(135deg,#14b8a6 0%,#06b6d4 100%)',
    glow: 'rgba(20,184,166,0.18)', accent: '#2dd4bf', Icon: Shield,
  },
  'Anti-Aging': {
    gradient: 'linear-gradient(135deg,#f472b6 0%,#ec4899 100%)',
    glow: 'rgba(244,114,182,0.18)', accent: '#f9a8d4', Icon: Dna,
  },
};

function getTheme(category) {
  if (!category) return defaultTheme();
  // Partial-match: category may be 'Weight Management / Obesity' → matches 'Weight Management'
  const key = Object.keys(THEME).find((k) =>
    category.toLowerCase().includes(k.toLowerCase())
  );
  return key ? THEME[key] : defaultTheme();
}

function defaultTheme() {
  return {
    gradient: 'linear-gradient(135deg,#003666 0%,#0070c0 100%)',
    glow: 'rgba(0,112,192,0.18)', accent: '#60a5fa', Icon: FlaskConical,
  };
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
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

// ── Peptide card (mirrors ProtocolCard layout) ─────────────────────────────────
function PeptideCardUnified({ peptide, onClick, onAskAI }) {
  const [hovered, setHovered] = useState(false);
  const theme = getTheme(peptide.category);
  const { Icon } = theme;

  // Graceful fallbacks for peptide-specific metadata
  const route       = peptide.route || peptide.administration_route || peptide.form || null;
  const primaryUse  = peptide.primary_use || peptide.goal || peptide.indication || peptide.clinical_focus || null;
  const description = peptide.description || peptide.summary || peptide.short_description || primaryUse || null;
  const badgeLabel  = (peptide.category || 'Peptide').split('/')[0].trim();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.88)',
        border: hovered ? `1.5px solid ${theme.accent}` : '1px solid rgba(0,0,0,0.07)',
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
      <div style={{ height: '5px', background: theme.gradient, flexShrink: 0 }} />

      {/* Card body */}
      <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        {/* Icon + category badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: theme.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${theme.glow}`,
          }}>
            <Icon size={20} color="white" strokeWidth={1.8} />
          </div>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', background: theme.glow,
            padding: '0.25rem 0.6rem', borderRadius: '20px',
            border: `1px solid ${theme.glow}`, color: 'var(--text-muted)',
            whiteSpace: 'nowrap', maxWidth: '130px', overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {badgeLabel}
          </span>
        </div>

        {/* Name */}
        <h3 style={{
          margin: 0, fontSize: '0.92rem', fontWeight: 800,
          color: 'var(--text-main)', lineHeight: 1.3, letterSpacing: '-0.01em',
        }}>
          {peptide.displayName || peptide.name}
        </h3>

        {/* Description */}
        {description && (
          <p style={{
            margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)',
            lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {description}
          </p>
        )}

        {/* Route / form pill */}
        {route && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: 'auto' }}>
            <span style={{
              fontSize: '0.68rem', fontWeight: 600,
              background: theme.glow, color: 'var(--text-main)',
              padding: '0.2rem 0.55rem', borderRadius: '6px',
              border: `1px solid ${theme.glow}`,
              textTransform: 'capitalize', letterSpacing: '0.01em',
            }}>
              {route}
            </span>
          </div>
        )}

        {/* Footer: primary use + arrow */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '0.6rem',
          borderTop: '0.5px solid rgba(0,0,0,0.06)',
          marginTop: '0.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <Activity size={12} />
            <span style={{ fontWeight: 600 }}>
              {primaryUse
                ? primaryUse.slice(0, 26) + (primaryUse.length > 26 ? '…' : '')
                : badgeLabel}
            </span>
          </div>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: hovered ? theme.gradient : 'rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s ease',
          }}>
            <ArrowRight size={13} color={hovered ? 'white' : 'var(--text-muted)'} />
          </div>
        </div>

        {/* Phase 3 — Contextual Ask AI button */}
        {onAskAI && (
          <button
            onClick={(e) => { e.stopPropagation(); onAskAI(peptide); }}
            aria-label={`Ask AI about ${peptide.displayName || peptide.name}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              width: '100%', justifyContent: 'center',
              padding: '0.42rem 0.75rem',
              background: 'rgba(244,63,94,0.06)',
              border: '1px solid rgba(244,63,94,0.18)',
              borderRadius: '8px',
              color: '#fb7185',
              fontSize: '0.72rem', fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.18s ease, border-color 0.18s ease',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.13)'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.35)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.06)'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.18)'; }}
          >
            <Bot size={11} />
            Ask AI about {peptide.displayName || peptide.name}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Phase C1: Mobile accordion item for peptides (mirrors AccordionItem in TrendingProtocols) ─
function PeptideAccordionItem({ category, peptide, isOpen, onToggle, onCardClick, onAskAI, innerRef }) {
  const theme = getTheme(category);
  const { Icon } = theme;
  return (
    <div 
      ref={innerRef}
      style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '16px', overflow: 'hidden', background: 'white', marginBottom: '0.75rem' }}
    >
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
          <PeptideCardUnified peptide={peptide} onClick={() => onCardClick(peptide)} onAskAI={onAskAI} />
        </div>
      )}
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function TrendingPeptides({ onSelectProduct }) {
  const navigate = useNavigate();
  const isMobile = useResponsive('(max-width: 767px)');
  const { allItems, loading } = useCategoryBestItems('peptides', 'peptide_id');

  // Phase D3 — pagination state (4 items per page)
  const PAGE_SIZE = 4;
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(allItems.length / PAGE_SIZE);
  const items = allItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Phase C2 — mutual-exclusion: only one peptide accordion open at a time
  const [activeAccordion, setActiveAccordion] = useState(null);
  const accordionRefs = useRef({});

  // Phase E3 — analytics
  const { trackPeptideClick, trackTrendingCategoryOpen } = useAnalytics();

  function handleAccordionToggle(cat) {
    const willOpen = activeAccordion !== cat;
    setActiveAccordion(prev => (prev === cat ? null : cat));
    if (willOpen) {
      trackTrendingCategoryOpen({ section: 'peptides', category: cat });
      // Phase C3 — scroll to center on open (especially mobile)
      setTimeout(() => {
        const el = accordionRefs.current[cat];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    }
  }

  function handleClick(peptide) {
    const id = peptide.slug || peptide.peptide_id;
    // Phase E4 — track peptide click before navigating
    trackPeptideClick({ peptideId: id, name: peptide.name || peptide.displayName, source: 'trending_section' });
    if (onSelectProduct) {
      onSelectProduct(peptide.name || peptide.displayName);
    } else {
      navigate(`/product/${id}`);
    }
  }

  // Phase 3 — Contextual AI: pre-populate ClinicalAI with peptide-specific message
  function handleAskAI(peptide) {
    const name = peptide.displayName || peptide.name;
    window.dispatchEvent(new CustomEvent('open-clinical-ai', {
      detail: {
        action: 'ask_about_entity',
        entityName: name,
        section: 'TrendingPeptides',
        autoSend: true
      }
    }));
  }

  return (
    <section className="peptide-section">
      <div className="container">

        {/* ── Section header (unchanged) ── */}
        <div className="peptide-section__header">
          <div className="peptide-section__label">
            <TrendingUp size={18} strokeWidth={2.5} /> Research Velocity
          </div>
          <h2 className="peptide-section__title">Trending Peptides</h2>
          <p className="peptide-section__subtitle">
            Most requested by clinical research teams.
          </p>
        </div>

        {/* ── Loading: 4 skeleton cards ── */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Desktop: 4-card grid ── */}
        {!loading && !isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {items.map(({ item }) => (
              <PeptideCardUnified
                key={item.peptide_id}
                peptide={item}
                onClick={() => handleClick(item)}
                onAskAI={handleAskAI}
              />
            ))}
          </div>
        )}

        {/* ── Phase F2: Empty state ── */}
        {!loading && allItems.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem 1.5rem', marginBottom: '2.5rem',
            background: 'rgba(0,113,189,0.03)', borderRadius: '16px',
            border: '1.5px dashed rgba(0,113,189,0.15)',
          }}>
            <Dna size={40} style={{ color: 'rgba(0,113,189,0.25)', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1rem', color: '#9ca3af', fontWeight: 600, margin: 0 }}>
              No peptides available right now. Check back soon.
            </p>
          </div>
        )}

        {/* ── Mobile: accordion per category (Phase C3) ── */}
        {!loading && isMobile && allItems.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            {items.map(({ category, item }) => (
              <PeptideAccordionItem
                key={category}
                category={category}
                peptide={item}
                isOpen={activeAccordion === category}
                onToggle={handleAccordionToggle}
                onCardClick={handleClick}
                onAskAI={handleAskAI}
                innerRef={el => accordionRefs.current[category] = el}
              />
            ))}
          </div>
        )}

        {!loading && isMobile && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              disabled={page === 0}
              onClick={() => { setPage(p => p - 1); setActiveAccordion(null); }}
              style={{
                padding: '0.5rem 1.2rem', borderRadius: '30px', border: '1.5px solid rgba(0,113,189,0.25)',
                background: page === 0 ? 'rgba(0,113,189,0.04)' : 'white',
                color: page === 0 ? 'rgba(0,113,189,0.35)' : 'var(--primary)',
                fontWeight: 700, fontSize: '0.82rem', cursor: page === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              ← Anterior
            </button>
            <span style={{ alignSelf: 'center', fontSize: '0.78rem', color: '#6b7280', fontWeight: 600 }}>
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => { setPage(p => p + 1); setActiveAccordion(null); }}
              style={{
                padding: '0.5rem 1.2rem', borderRadius: '30px', border: '1.5px solid rgba(0,113,189,0.25)',
                background: page >= totalPages - 1 ? 'rgba(0,113,189,0.04)' : 'white',
                color: page >= totalPages - 1 ? 'rgba(0,113,189,0.35)' : 'var(--primary)',
                fontWeight: 700, fontSize: '0.82rem',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Ver más →
            </button>
          </div>
        )}

        {/* ── Footer CTAs (unchanged) ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/collection/peptides')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.85rem 2rem',
              background: 'linear-gradient(135deg,#003666,#0071bd)',
              color: 'white', border: 'none', borderRadius: '40px',
              fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,113,189,0.3)', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,113,189,0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,113,189,0.3)'; }}
          >
            <Dna size={16} />
            View All Peptides
            <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate('/protocol-finder')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 1.75rem', background: 'white',
              color: 'var(--primary)', border: '1.5px solid rgba(0,113,189,0.2)',
              borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(0,113,189,0.04)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,113,189,0.2)'; e.currentTarget.style.background = 'white'; }}
          >
            Build a Protocol
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-clinical-ai', {
              detail: {
                action: 'compare_trending',
                section: 'TrendingPeptides',
                autoSend: true
              }
            }))}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.85rem 1.75rem',
              background: 'rgba(244,63,94,0.07)', color: '#fb7185',
              border: '1.5px solid rgba(244,63,94,0.25)',
              borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.14)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(244,63,94,0.07)'; }}
          >
            <Bot size={15} /> Ask ClinicalAI
          </button>
        </div>

      </div>
    </section>
  );
}