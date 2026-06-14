import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Bot from "lucide-react/dist/esm/icons/bot";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';





import { useNavigate } from 'react-router-dom';

/**
 * GuidedSearchHints — Phase 3 (Rules 5.0 Redesign)
 * ──────────────────────────────────────────────────
 * Contextual discovery layer placed directly below the hero.
 * NO own search input — the hero search bar is the unified input.
 * Each suggestion card seeds the hero search (via onSeedSearch prop)
 * or falls back to opening the search modal.
 *
 * Visual treatment: subdued, supportive — clearly below the hero.
 */

const GOAL_CATEGORIES = [
  {
    id: 'recovery',
    label: 'Recovery & Repair',
    color: '#fb7185',
    bg: 'rgba(251,113,133,0.08)',
    border: 'rgba(251,113,133,0.2)',
    searches: [
      { label: 'Beginner recovery peptides', icon: BookOpen },
      { label: 'BPC-157 vs TB-500', icon: ArrowRight },
      { label: 'Tendon & joint repair protocols', icon: ArrowRight },
      { label: 'Post-workout healing stack', icon: ArrowRight },
    ],
  },
  {
    id: 'longevity',
    label: 'Longevity',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.2)',
    searches: [
      { label: 'Beginner longevity peptides', icon: BookOpen },
      { label: 'Epithalon research', icon: ArrowRight },
      { label: 'Anti-aging peptide protocols', icon: ArrowRight },
      { label: 'Compare GLP-1 peptides', icon: ArrowRight },
    ],
  },
  {
    id: 'cognitive',
    label: 'Cognitive',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.08)',
    border: 'rgba(56,189,248,0.2)',
    searches: [
      { label: 'Nootropic peptides for beginners', icon: BookOpen },
      { label: 'Semax vs Selank', icon: ArrowRight },
      { label: 'Brain performance protocols', icon: ArrowRight },
      { label: 'How does Semax work?', icon: Bot },
    ],
  },
  {
    id: 'metabolic',
    label: 'Metabolic',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.2)',
    searches: [
      { label: 'Sleep supplements guide', icon: BookOpen },
      { label: 'Semaglutide protocol', icon: ArrowRight },
      { label: 'GLP-1 peptides explained', icon: Bot },
      { label: 'Fat loss stack', icon: ArrowRight },
    ],
  },
];

const BEGINNER_EXAMPLES = [
  'Beginner recovery peptides',
  'Sleep supplements',
  'Longevity protocols',
  'Compare GLP-1 peptides',
  'What is BPC-157?',
  'Energy & Vitality',
];

export default function GuidedSearchHints({ onOpenSearch, onSeedSearch, onOpenAI }) {
  const navigate = useNavigate();
  const [activeGoal, setActiveGoal] = useState(null);

  /** Seeds the hero search bar if available, otherwise opens modal */
  const handleSuggestion = (label) => {
    if (onSeedSearch) {
      // Scroll + auto-submit handled centrally in GuestHome.handleSeedSearch
      onSeedSearch(label);
    } else if (onOpenSearch) {
      onOpenSearch(label);
    } else {
      navigate(`/products?search=${encodeURIComponent(label)}`);
    }
  };

  /** AI suggestions — route through hero so the AI mode pill is visible */
  const handleAISuggestion = (label) => {
    sessionStorage.setItem('ai_seed_query', label);
    if (onSeedSearch) {
      onSeedSearch(label);
    } else if (onOpenSearch) {
      onOpenSearch(label);
    } else {
      navigate('/');
    }
  };

  const isAIQuery = (label) =>
    /^(what|how|why|explain|tell me|difference between)/i.test(label);

  const currentGoal = GOAL_CATEGORIES.find((g) => g.id === activeGoal);

  return (
    <section
      aria-labelledby="gsh-heading"
      style={{
        padding: '2.5rem 1.25rem',
        background: 'linear-gradient(180deg, rgba(10,12,20,0.97) 0%, #0d1117 100%)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Subtle background glow */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: '20%',
        width: 600, height: 200,
        background: 'radial-gradient(ellipse, rgba(34,211,238,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Section eyebrow */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.4rem', marginBottom: '0.75rem',
        }}>
          <Sparkles size={12} color="#22d3ee" />
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            color: '#22d3ee', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Start your research here
          </span>
        </div>

        <h2
          id="gsh-heading"
          style={{
            fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
            fontWeight: 700, color: 'var(--color-border)',
            textAlign: 'center', marginBottom: '0.4rem', lineHeight: 1.3,
          }}
        >
          Explore by Goal or Topic
        </h2>
        <p style={{
          color: 'var(--color-text-secondary)', fontSize: '0.82rem',
          textAlign: 'center', marginBottom: '1.5rem',
          lineHeight: 1.6, maxWidth: 480, margin: '0 auto 1.5rem',
        }}>
          Not sure what to search? Pick a goal below — it'll fill the search bar for you.
        </p>

        {/* Goal filter pills */}
        <div style={{
          display: 'flex', gap: '0.45rem', flexWrap: 'wrap',
          justifyContent: 'center', marginBottom: '1.25rem',
        }}>
          {GOAL_CATEGORIES.map((goal) => {
            const isActive = activeGoal === goal.id;
            return (
              <button
                key={goal.id}
                id={`gsh-filter-${goal.id}`}
                onClick={() => setActiveGoal(isActive ? null : goal.id)}
                style={{
                  padding: '0.28rem 0.85rem',
                  borderRadius: 99,
                  border: `1px solid ${isActive ? goal.color : 'rgba(255,255,255,0.1)'}`,
                  background: isActive ? goal.bg : 'transparent',
                  color: isActive ? goal.color : 'var(--color-text-secondary)',
                  fontSize: '0.74rem', fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = goal.color;
                    e.currentTarget.style.color = goal.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }
                }}
              >
                {goal.label}
              </button>
            );
          })}
        </div>

        {/* Goal-specific suggestions */}
        {currentGoal && (
          <div style={{
            background: currentGoal.bg,
            border: `1px solid ${currentGoal.border}`,
            borderRadius: 12, padding: '1rem 1.25rem',
            marginBottom: '1rem',
          }}>
            <div style={{
              fontSize: '0.68rem', color: currentGoal.color,
              fontWeight: 700, marginBottom: '0.65rem',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {currentGoal.label} — example searches
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {currentGoal.searches.map(({ label }) => {
                const isAI = isAIQuery(label);
                return (
                  <button
                    key={label}
                    id={`gsh-hint-${label.replace(/\s+/g, '-').toLowerCase().slice(0, 32)}`}
                    onClick={() => isAI ? handleAISuggestion(label) : handleSuggestion(label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.32rem 0.8rem',
                      borderRadius: 8,
                      border: `1px solid ${currentGoal.border}`,
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--color-border)',
                      fontSize: '0.78rem', fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = currentGoal.bg;
                      e.currentTarget.style.color = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = 'var(--color-border)';
                    }}
                  >
                    {isAI
                      ? <Bot size={11} style={{ color: '#818cf8' }} />
                      : <ArrowRight size={11} style={{ color: currentGoal.color }} />
                    }
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Default beginner examples (no goal selected) */}
        {!currentGoal && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.35rem', marginBottom: '0.65rem',
            }}>
              <TrendingUp size={12} color="var(--color-text-primary)" />
              <span style={{
                fontSize: '0.68rem', color: 'var(--color-text-primary)',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Popular starting points
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {BEGINNER_EXAMPLES.map((label) => {
                const isAI = isAIQuery(label);
                return (
                  <button
                    key={label}
                    id={`gsh-example-${label.replace(/\s+/g, '-').toLowerCase().slice(0, 32)}`}
                    onClick={() => isAI ? handleAISuggestion(label) : handleSuggestion(label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      padding: '0.3rem 0.8rem',
                      borderRadius: 99,
                      border: `1px solid ${isAI ? 'rgba(129,140,248,0.2)' : 'rgba(255,255,255,0.08)'}`,
                      background: isAI ? 'rgba(129,140,248,0.06)' : 'rgba(255,255,255,0.025)',
                      color: isAI ? '#818cf8' : 'var(--color-text-secondary)',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isAI
                        ? 'rgba(129,140,248,0.12)'
                        : 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.color = isAI ? '#a5b4fc' : 'var(--color-border)';
                      e.currentTarget.style.borderColor = isAI
                        ? 'rgba(129,140,248,0.35)'
                        : 'rgba(255,255,255,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isAI
                        ? 'rgba(129,140,248,0.06)'
                        : 'rgba(255,255,255,0.025)';
                      e.currentTarget.style.color = isAI ? '#818cf8' : 'var(--color-text-secondary)';
                      e.currentTarget.style.borderColor = isAI
                        ? 'rgba(129,140,248,0.2)'
                        : 'rgba(255,255,255,0.08)';
                    }}
                  >
                    {isAI && <Bot size={11} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}