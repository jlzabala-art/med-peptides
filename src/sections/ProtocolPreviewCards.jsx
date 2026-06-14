import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Clock from "lucide-react/dist/esm/icons/clock";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Layers from "lucide-react/dist/esm/icons/layers";
import Zap from "lucide-react/dist/esm/icons/zap";
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';






/**
 * ProtocolPreviewCards — Phase 15 of Rules 5.0
 * ─────────────────────────────────────────────
 * Lightweight protocol preview cards shown before the full protocol page.
 * Each card surfaces: goal, duration, compounds, complexity, commitment.
 * CTA: "View Full Protocol"
 *
 * Rules 5.0 requirements:
 *  - Show BEFORE full protocol pages
 *  - Include: goal, duration, compounds, complexity, expected commitment
 *  - CTA: "View Full Protocol"
 */

const COMPLEXITY_COLORS = {
  Beginner: { color: 'var(--color-success)', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  Intermediate: { color: 'var(--color-warning)', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  Advanced: { color: '#e11d48', bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.3)' },
  'Multi-Phase': { color: '#7c3aed', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
};

const PREVIEW_PROTOCOLS = [
  {
    id: 'recovery-foundation',
    slug: 'recovery-foundation',
    title: 'Recovery Foundation Protocol',
    goal: 'Tissue repair & physical recovery',
    goalIcon: '🔬',
    complexity: 'Beginner',
    duration: '8–12 weeks',
    commitment: 'Once daily injection',
    compounds: ['BPC-157', 'TB-500'],
    compoundCount: 2,
    summary: 'The most commonly studied recovery protocol for researchers starting out. Combines two complementary peptides.',
    gradient: 'linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)',
    glowColor: 'rgba(244,63,94,0.12)',
  },
  {
    id: 'longevity-essentials',
    slug: 'longevity-essentials',
    title: 'Longevity Essentials Protocol',
    goal: 'Cellular aging & lifespan research',
    goalIcon: '🧬',
    complexity: 'Intermediate',
    duration: '12–16 weeks',
    commitment: '3–4x per week',
    compounds: ['Epithalon', 'Sermorelin', 'GHK-Cu'],
    compoundCount: 3,
    summary: 'A structured multi-compound approach to longevity research, studied for telomere and GH-axis dynamics.',
    gradient: 'linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)',
    glowColor: 'rgba(16,185,129,0.12)',
  },
  {
    id: 'metabolic-optimization',
    slug: 'metabolic-optimization',
    title: 'Metabolic Optimization Protocol',
    goal: 'Metabolic health & body composition',
    goalIcon: '⚡',
    complexity: 'Intermediate',
    duration: '12 weeks',
    commitment: 'Weekly injection',
    compounds: ['Semaglutide', 'AOD-9604'],
    compoundCount: 2,
    summary: 'A research-backed metabolic protocol using GLP-1 agonists alongside GH-fragment compounds.',
    gradient: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)',
    glowColor: 'rgba(139,92,246,0.12)',
  },
  {
    id: 'cognitive-focus-stack',
    slug: 'cognitive-focus-stack',
    title: 'Cognitive Focus Stack',
    goal: 'Neural enhancement & focus',
    goalIcon: '🧠',
    complexity: 'Beginner',
    duration: '6–8 weeks',
    commitment: 'Daily nasal or injection',
    compounds: ['Semax', 'Selank'],
    compoundCount: 2,
    summary: 'A paired nootropic peptide stack frequently researched for cognitive performance and stress response.',
    gradient: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)',
    glowColor: 'rgba(14,165,233,0.12)',
  },
];

function ComplexityBadge({ level }) {
  const theme = COMPLEXITY_COLORS[level] || COMPLEXITY_COLORS.Intermediate;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.6rem',
      borderRadius: 99,
      background: theme.bg,
      color: theme.color,
      border: `1px solid ${theme.border}`,
      letterSpacing: '0.03em',
    }}>
      {level}
    </span>
  );
}

function ProtocolPreviewCard({ protocol, onView }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) {
      onView(protocol.slug);
    } else {
      navigate(`/protocol/${protocol.slug}`);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--background)',
        border: '1px solid var(--border-light)',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 12px 48px ${protocol.glowColor}` : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Card accent bar */}
      <div style={{ height: 4, background: protocol.gradient }} />

      <div style={{ padding: '1.25rem 1.25rem 0' }}>
        {/* Goal icon + title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: protocol.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem',
          }}>
            {protocol.goalIcon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)',
              marginBottom: '0.2rem', lineHeight: 1.25,
            }}>
              {protocol.title}
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {protocol.goal}
            </div>
          </div>
        </div>

        {/* Complexity badge */}
        <div style={{ marginBottom: '0.75rem' }}>
          <ComplexityBadge level={protocol.complexity} />
        </div>

        {/* Summary */}
        <p style={{
          fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55,
          marginBottom: '1rem',
        }}>
          {protocol.summary}
        </p>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        {[
          { icon: Clock, label: 'Duration', value: protocol.duration },
          { icon: Layers, label: 'Compounds', value: `${protocol.compoundCount} compounds` },
          { icon: Zap, label: 'Commitment', value: protocol.commitment },
        ].map(({ icon: Icon, label, value }, i) => (
          <div
            key={label}
            style={{
              padding: '0.75rem 0.85rem',
              borderRight: i < 2 ? '1px solid var(--border-light)' : 'none',
              textAlign: 'center',
            }}
          >
            <Icon size={13} color="var(--color-text-secondary)" style={{ display: 'block', margin: '0 auto 0.3rem' }} />
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
              {label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.2 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Compound tags */}
      <div style={{ padding: '0.75rem 1.25rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <FlaskConical size={12} color="var(--color-text-secondary)" style={{ flexShrink: 0, marginTop: 2 }} />
        {protocol.compounds.map((c) => (
          <span
            key={c}
            style={{
              fontSize: '0.72rem', fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'var(--surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 6, padding: '0.15rem 0.45rem',
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 1.25rem 1.25rem', marginTop: 'auto' }}>
        <button
          id={`protocol-preview-view-${protocol.id}`}
          onClick={handleView}
          aria-label={`View full ${protocol.title}`}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.4rem',
            padding: '0.65rem',
            borderRadius: 10,
            background: hovered ? protocol.gradient : 'var(--surface)',
            border: hovered ? 'none' : '1px solid var(--border-light)',
            color: hovered ? 'var(--color-bg-surface)' : 'var(--text-muted)',
            fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
        >
          View Full Protocol
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function ProtocolPreviewCards({ onViewProtocol }) {
  return (
    <section style={{ padding: 'clamp(3rem, 5vw, 6rem) 1.5rem', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* Background accent */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, right: '10%',
        width: 400, height: 400,
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(251,113,133,0.10)', border: '1px solid rgba(251,113,133,0.25)',
            borderRadius: 24, padding: '0.35rem 1rem', marginBottom: '1rem',
            fontSize: '0.78rem', color: '#fb7185', fontWeight: 600, letterSpacing: '0.05em',
          }}>
            <FlaskConical size={13} />
            PHASE 15 — PROTOCOL PREVIEW
          </div>

          <h2
            id="protocol-preview-heading"
            style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
              fontWeight: 700, color: 'var(--primary)',
              marginBottom: '0.6rem', lineHeight: 1.2,
            }}
          >
            Explore Research Protocols
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: 'clamp(0.88rem, 2vw, 1rem)',
            maxWidth: 520, margin: '0 auto', lineHeight: 1.6,
          }}>
            Quick-glance previews of the most researched protocols — including complexity,
            duration, and compounds before you commit to the full read.
          </p>
        </div>

        {/* Protocol Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
          gap: '1.1rem',
        }}>
          {PREVIEW_PROTOCOLS.map((protocol) => (
            <ProtocolPreviewCard
              key={protocol.id}
              protocol={protocol}
              onView={onViewProtocol}
            />
          ))}
        </div>
      </div>
    </section>
  );
}