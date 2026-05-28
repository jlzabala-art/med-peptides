 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Search, Sparkles } from 'lucide-react';

/**
 * GoalEntryFlow — Phase 1 of Rules 5.0
 * ─────────────────────────────────────
 * "What Are You Exploring?" goal-first entry section.
 * Presents 7 research goals as interactive cards.
 * On selection, routes to the Unified Protocols Catalog (pre-filtered) or opens
 * the ClinicalAssistant pre-seeded with the chosen goal.
 *
 * Rules 5.0 requirements:
 *  - One clear goal at a time — no information dump
 *  - First question is always about the goal, not the compound
 *  - Connects directly to AI discovery or Consolidated Catalog
 */

const GOALS = [
  {
    id: 'Recovery & Repair',
    icon: '🔬',
    label: 'Recovery & Repair',
    sub: 'Tissue, muscle & cellular restoration',
    color: 'var(--accent-cyan, #22d3ee)',
    aiPrompt: 'I want to explore peptides and supplements for recovery and tissue repair.',
  },
  {
    id: 'Metabolic & Weight',
    icon: '⚡',
    label: 'Metabolic Health',
    sub: 'Energy systems & body composition',
    color: '#a78bfa',
    aiPrompt: 'I want to explore peptides and supplements for metabolic health and body composition.',
  },
  {
    id: 'Longevity & Anti-Aging',
    icon: '🧬',
    label: 'Longevity & Anti-Aging',
    sub: 'Cellular aging & lifespan research',
    color: '#34d399',
    aiPrompt: 'I want to explore biological optimization strategies for longevity and anti-aging, including relevant peptides and supplements.',
  },
  {
    id: 'Cognitive & Mood',
    icon: '🧠',
    label: 'Cognitive & Mood',
    sub: 'Neural enhancement & focus',
    color: '#f59e0b',
    aiPrompt: 'I want to explore peptides and supplements for cognitive performance and mood support.',
  },
  {
    id: 'Sleep & Circadian',
    icon: '🌙',
    label: 'Sleep & Circadian',
    sub: 'Restorative cycles & regulation',
    color: '#818cf8',
    aiPrompt: 'I want to explore peptides and supplements for sleep quality and circadian rhythm support.',
  },
  {
    id: 'Hormonal Optimization',
    icon: '⚖️',
    label: 'Hormonal Optimization',
    sub: 'Endocrine balance & GH axis',
    color: '#fb7185',
    aiPrompt: 'I want to explore biological optimization strategies for hormonal balance, including relevant peptides and supplements.',
  },
  {
    id: 'Immune Support',
    icon: '🛡️',
    label: 'Immune Support',
    sub: 'Defense modulation & resilience',
    color: '#4ade80',
    aiPrompt: 'I want to explore peptides and supplements for immune support and defense modulation.',
  },
];

export default function GoalEntryFlow({ onOpenAI, onSeedSearch }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  // Protocols: seed the hero with a protocol query so search handles routing.
  const handleProtocolFinder = (goal) => {
    setSelected(goal.id);
    const query = `${goal.label} protocol`;
    if (onSeedSearch) {
      onSeedSearch(query);
    } else {
      // Unify exploration under the collection view
      navigate(`/collection/protocols?q=${encodeURIComponent(goal.label)}`);
    }
  };

  const handleAI = (goal) => {
    setSelected(goal.id);
    // Build a rich contextual message including the goal's label and subtitle
    const message = `${goal.aiPrompt} Specifically, I'm interested in ${goal.sub.toLowerCase()}. `
      + `Please give me an overview of the key research compounds in this area, what makes each one unique, `
      + `and suggest a sensible starting point for a beginner researcher.`;
    // Always dispatch the event so the modal opens regardless of prop availability
    window.dispatchEvent(new CustomEvent('open-clinical-ai', { detail: { message } }));
    // Also call prop callback if provided (e.g. for any parent-side analytics)
    onOpenAI?.(message);
  };

  // Seeds the hero search bar with a goal + type query and auto-submits.
  // The scroll and auto-submit are now handled centrally in GuestHome.handleSeedSearch.
  const handleSeedType = (goal, type) => {
    const query = `${goal.label} ${type}`;
    if (onSeedSearch) {
      onSeedSearch(query);
    }
  };

  return (
    <section
      aria-labelledby="goal-entry-heading"
      style={{
        padding: '4rem 1.25rem 3rem',
        background: 'linear-gradient(180deg, #0d1117 0%, #111827 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative blobs */}
      <div aria-hidden style={{
        position: 'absolute', top: '-80px', left: '-100px',
        width: 360, height: 360, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: '-60px', right: '-80px',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.09) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 24, padding: '0.35rem 1rem', marginBottom: '1rem',
            fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600, letterSpacing: '0.05em',
          }}>
            <Sparkles size={13} />
            EXPLORE BY GOAL
          </div>

          <h2
            id="goal-entry-heading"
            style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
              fontWeight: 700,
              color: '#f1f5f9',
              marginBottom: '0.6rem',
              lineHeight: 1.2,
            }}
          >
            What are you exploring?
          </h2>
          <p style={{
            color: 'var(--color-text-tertiary)',
            fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
            maxWidth: 520,
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Select your research goal — we'll guide you to the right peptides,
            supplements, protocols, and ClinicalAI-powered resources.
          </p>
        </div>

        {/* Goal Cards Grid */}
        <div
          role="list"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {GOALS.map((goal) => {
            const isHovered = hovered === goal.id;
            const isSelected = selected === goal.id;
            return (
              <div
                key={goal.id}
                role="listitem"
                onMouseEnter={() => setHovered(goal.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: isHovered
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected ? goal.color : isHovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 14,
                  padding: '1.2rem 1.1rem',
                  transition: 'all 0.22s ease',
                  transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? `0 8px 32px ${goal.color}25`
                    : 'none',
                  cursor: 'default',
                }}
              >
                {/* Icon + Label */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{
                    fontSize: '1.8rem',
                    marginBottom: '0.4rem',
                    lineHeight: 1,
                  }}>
                    {goal.icon}
                  </div>
                  <div style={{
                    fontWeight: 700,
                    color: isHovered ? goal.color : 'var(--color-border)',
                    fontSize: '1rem',
                    transition: 'color 0.2s',
                    marginBottom: '0.2rem',
                  }}>
                    {goal.label}
                  </div>
                  <div style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.8rem',
                  }}>
                    {goal.sub}
                  </div>
                </div>

                {/* Action buttons — 2×2 grid: Peptides | Supplements / Protocols | Ask AI */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.4rem',
                }}>
                  {/* Row 1 — Peptides */}
                  <button
                    id={`goal-peptides-${goal.id.replace(/\W+/g, '-').toLowerCase()}`}
                    onClick={() => handleSeedType(goal, 'peptides')}
                    aria-label={`Explore ${goal.label} peptides`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.3rem',
                      padding: '0.45rem 0.5rem',
                      borderRadius: 8,
                      border: `1px solid ${goal.color}50`,
                      background: `${goal.color}10`,
                      color: goal.color,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${goal.color}22`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${goal.color}10`; }}
                  >
                    Peptides
                  </button>

                  {/* Row 1 — Supplements */}
                  <button
                    id={`goal-supplements-${goal.id.replace(/\W+/g, '-').toLowerCase()}`}
                    onClick={() => handleSeedType(goal, 'supplements')}
                    aria-label={`Explore ${goal.label} supplements`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.3rem',
                      padding: '0.45rem 0.5rem',
                      borderRadius: 8,
                      border: `1px solid ${goal.color}35`,
                      background: `${goal.color}08`,
                      color: goal.color,
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      whiteSpace: 'nowrap',
                      opacity: 0.85,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${goal.color}18`; e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${goal.color}08`; e.currentTarget.style.opacity = '0.85'; }}
                  >
                    Supplements
                  </button>

                  {/* Row 2 — Protocols */}
                  <button
                    id={`goal-protocol-${goal.id.replace(/\W+/g, '-').toLowerCase()}`}
                    onClick={() => handleProtocolFinder(goal)}
                    aria-label={`Find protocols for ${goal.label}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.3rem',
                      padding: '0.45rem 0.5rem',
                      borderRadius: 8,
                      border: '1px solid rgba(148,163,184,0.2)',
                      background: 'rgba(148,163,184,0.06)',
                      color: 'var(--color-text-tertiary)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.12)'; e.currentTarget.style.color = 'var(--color-border)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.06)'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
                  >
                    <Search size={11} />
                    Protocols
                  </button>

                  {/* Row 2 — Ask AI */}
                  <button
                    id={`goal-ai-${goal.id.replace(/\W+/g, '-').toLowerCase()}`}
                    onClick={() => handleAI(goal)}
                    aria-label={`Ask AI about ${goal.label}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '0.3rem',
                      padding: '0.45rem 0.5rem',
                      borderRadius: 8,
                      border: '1px solid rgba(165,180,252,0.3)',
                      background: 'rgba(165,180,252,0.08)',
                      color: '#a5b4fc',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(165,180,252,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(165,180,252,0.08)'; }}
                  >
                    <Bot size={12} />
                    Ask AI
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            Not sure where to start?
          </span>
          <button
            id="goal-entry-ai-guide"
            onClick={() => {
              const message = "I'm not sure where to start with biological optimization. Can you ask me a few questions about my goals and then recommend the best research area, peptides, and supplements to begin with?";
              window.dispatchEvent(new CustomEvent('open-clinical-ai', { detail: { message } }));
              onOpenAI?.(message);
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'none', border: 'none', padding: 0,
              color: '#818cf8', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', textDecoration: 'underline',
              textDecorationColor: 'rgba(129,140,248,0.4)',
              textUnderlineOffset: 3,
            }}
          >
            Let the AI guide you
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </section>
  );
}
