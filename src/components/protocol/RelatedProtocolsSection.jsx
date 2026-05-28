/* eslint-disable no-unused-vars */
/**
 * RelatedProtocolsSection.jsx
 * Phase 9 — Dynamically matched related protocols using clinical similarity scoring.
 * Reutilises card design consistent with TrendingProtocols.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, ArrowRight, Brain, Clock, Dna, Flame,
  FlaskConical, Heart, Layers, Leaf, Moon, Shield,
  Sparkles, Zap, GitCompare,
} from 'lucide-react';
import { getRelatedProtocols, getMatchReason } from '../../utils/ProtocolMatchingEngine';
import { PROTOCOL_BLUEPRINTS } from '../../data/protocolBlueprints';

// ── Shared theming (mirrors TrendingProtocols) ────────────────────────────
const THEME_MAP = {
  metabolicWeightLoss: {
    gradient: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)',
    glow: 'rgba(139,92,246,0.18)', accent: '#a78bfa', Icon: Flame,
  },
  recoveryInjury: {
    gradient: 'linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)',
    glow: 'rgba(244,63,94,0.18)', accent: '#fb7185', Icon: Heart,
  },
  cognitiveSupport: {
    gradient: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)',
    glow: 'rgba(14,165,233,0.18)', accent: '#38bdf8', Icon: Brain,
  },
  sleepSupport: {
    gradient: 'linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)',
    glow: 'rgba(59,130,246,0.18)', accent: '#93c5fd', Icon: Moon,
  },
  hormonalSupport: {
    gradient: 'linear-gradient(135deg,#f97316 0%,#eab308 100%)',
    glow: 'rgba(249,115,22,0.18)', accent: '#fb923c', Icon: Activity,
  },
  skinAntiAging: {
    gradient: 'linear-gradient(135deg,#f472b6 0%,#ec4899 100%)',
    glow: 'rgba(244,114,182,0.18)', accent: '#f9a8d4', Icon: Dna,
  },
  immuneInflammation: {
    gradient: 'linear-gradient(135deg,#14b8a6 0%,#06b6d4 100%)',
    glow: 'rgba(20,184,166,0.18)', accent: '#2dd4bf', Icon: Shield,
  },
  energyMitochondrial: {
    gradient: 'linear-gradient(135deg,#eab308 0%,#f97316 100%)',
    glow: 'rgba(234,179,8,0.18)', accent: '#fde047', Icon: Zap,
  },
  generalSupport: {
    gradient: 'linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)',
    glow: 'rgba(16,185,129,0.18)', accent: '#34d399', Icon: Leaf,
  },
};

export function getTheme(id) {
  return THEME_MAP[id] || {
    gradient: 'linear-gradient(135deg,#003666 0%,#0071bd 100%)',
    glow: 'rgba(0,112,192,0.18)', accent: '#60a5fa', Icon: FlaskConical,
  };
}

// ── Related Protocol Card ─────────────────────────────────────────────────
export function RelatedCard({ id, protocol, matchReason, onClick }) {
  const [hovered, setHovered] = useState(false);
  const theme = getTheme(id);
  const { Icon } = theme;
  const meta = protocol.clinical_metadata || {};

  // Extract compounds from phases for display
  const compounds = useMemo(() => {
    const seen = new Set();
    (protocol.phases || []).forEach(ph =>
      (ph.medications || []).forEach(m => seen.add(m.name))
    );
    return [...seen].slice(0, 3);
  }, [protocol]);

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
        minWidth: '280px',
        flex: '1 1 0',
      }}
    >
      {/* Gradient top bar */}
      <div style={{ height: '5px', background: theme.gradient, flexShrink: 0 }} />

      {/* Card body */}
      <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        {/* Icon + match reason badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 14px ${theme.glow}`,
          }}>
            <Icon size={20} color="white" strokeWidth={1.8} />
          </div>

          {/* Phase 6 — Match reason badge */}
          {matchReason && (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--primary)',
              background: 'rgba(0,113,189,0.08)',
              border: '1px solid rgba(0,113,189,0.15)',
              padding: '0.22rem 0.55rem',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              maxWidth: '150px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              <GitCompare size={9} />
              {matchReason}
            </span>
          )}
        </div>

        {/* Protocol name */}
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '0.92rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}>
            {protocol.title || protocol.name}
          </h3>
          {(protocol.summary?.goal || protocol.shortDescription) && (
            <p style={{
              margin: '0.3rem 0 0',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {protocol.summary?.goal || protocol.shortDescription}
            </p>
          )}
        </div>

        {/* Compounds */}
        {compounds.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: 'auto' }}>
            {compounds.map(c => (
              <span key={c} style={{
                fontSize: '0.67rem',
                fontWeight: 600,
                background: theme.glow,
                color: 'var(--text-main)',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                border: `1px solid ${theme.glow}`,
              }}>
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Footer: duration + phases + arrow */}
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
            <span style={{ fontWeight: 600 }}>{meta.duration_weeks || protocol.phases?.reduce((s, p) => s + (p.weeks || 0), 0) || '?'} wks</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <Layers size={12} />
            <span style={{ fontWeight: 600 }}>{protocol.phases?.length || 1} phase{protocol.phases?.length !== 1 ? 's' : ''}</span>
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
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────
export default function RelatedProtocolsSection({ protocolId }) {
  const navigate = useNavigate();
  const related = useMemo(() => getRelatedProtocols(protocolId), [protocolId]);
  const sourceBlueprint = PROTOCOL_BLUEPRINTS[protocolId];
  const meta = sourceBlueprint?.clinical_metadata;

  if (!related || related.length === 0) return null;

  // Phase 9 — "See More" filters by clinical_goal + protocol_class
  const handleSeeMore = () => {
    const params = new URLSearchParams();
    if (meta?.clinical_goal) params.set('goal', meta.clinical_goal);
    if (meta?.protocol_class) params.set('class', meta.protocol_class);
    navigate(`/protocols?${params.toString()}`);
  };

  return (
    <section style={{ padding: '3rem 0 1rem' }}>
      {/* Section header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
          background: 'rgba(0,113,189,0.06)',
          border: '1px solid rgba(0,113,189,0.12)',
          borderRadius: '30px',
          padding: '0.3rem 0.9rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--primary)',
          marginBottom: '0.75rem',
        }}>
          <Sparkles size={12} />
          Clinically Similar
        </div>

        <h2 style={{
          margin: '0 0 0.4rem',
          fontSize: 'clamp(1.35rem, 2.5vw, 1.7rem)',
          fontWeight: 900,
          color: 'var(--text-main)',
          letterSpacing: '-0.025em',
          lineHeight: 1.2,
        }}>
          Related Protocols
        </h2>
        <p style={{
          margin: 0,
          fontSize: '0.88rem',
          color: 'var(--text-muted)',
          lineHeight: 1.55,
        }}>
          Clinically similar protocols based on treatment strategy.
        </p>
      </div>

      {/* Phase 8 — Mobile-friendly swipe scroll, 4-col desktop */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '0.75rem',
        /* Hide scrollbar visually */
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {related.map(({ id, protocol, matchReason }) => (
          <div
            key={id}
            style={{
              scrollSnapAlign: 'start',
              flexShrink: 0,
              width: 'clamp(260px, 80vw, 320px)',
            }}
          >
            <RelatedCard
              id={id}
              protocol={protocol}
              matchReason={matchReason}
              onClick={() => navigate(`/protocol/${id}`)}
            />
          </div>
        ))}
      </div>

      {/* Phase 9 — See More CTA */}
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSeeMore}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.5rem',
            background: 'white',
            color: 'var(--primary)',
            border: '1.5px solid rgba(0,113,189,0.2)',
            borderRadius: '40px',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.background = 'rgba(0,113,189,0.04)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(0,113,189,0.2)';
            e.currentTarget.style.background = 'white';
          }}
        >
          See More Similar Protocols
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
