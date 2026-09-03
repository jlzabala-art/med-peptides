"use client";

import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Heart, Activity, Smile, Moon, Droplets, Dumbbell, Bell, Users, TrendingUp, Sparkles, ChevronDown, ChevronUp } from '@/lib/icons';
import EmptyState from '../../../ui/EmptyState';

// ── helpers ──────────────────────────────────────────────────────────────────
const PHASE_COLORS = {
  adaptation:  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' },
  improvement: { bg: '#dcfce7', border: '#22c55e', text: '#166534', dot: '#22c55e' },
  maintenance: { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' },
  peak:        { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', dot: '#a855f7' },
};

function buildJourneyFromProtocol(protocol) {
  const weeks    = protocol?.duration_weeks || 12;
  const name     = protocol?.name || 'this protocol';
  const category = (protocol?.therapeutic_category || '').toLowerCase();

  const isAntiAging    = category.includes('anti-aging') || category.includes('longevity');
  const isRecovery     = category.includes('recovery')   || category.includes('injury');
  const isHormonal     = category.includes('hormonal')   || category.includes('testosterone') || category.includes('peptide');
  const isCognitive    = category.includes('cognitive')  || category.includes('nootropic');

  const phases = [];

  // Phase 1: Adaptation (weeks 1–3)
  phases.push({
    id: 'phase-1',
    phase: 'adaptation',
    label: 'Adaptation Phase',
    weekStart: 1,
    weekEnd: Math.min(3, weeks),
    description: 'The body begins recognising and responding to the protocol compounds. Mild side-effects are normal and expected.',
    symptoms: [
      'Mild injection-site sensitivity',
      'Increased thirst or hunger',
      'Sleep pattern changes (usually temporary)',
      isHormonal  ? 'Water retention (normalises in 7–10 days)' : null,
      isRecovery  ? 'Increased inflammation at the repair site' : null,
    ].filter(Boolean),
    improvements: [
      'Improved energy levels by week 2',
      'Enhanced mental clarity and focus',
      isAntiAging ? 'Initial skin hydration improvements' : null,
      isCognitive ? 'Faster recall and concentration' : null,
    ].filter(Boolean),
    lifestyle: ['Maintain consistent sleep schedule', 'Stay hydrated (2–3L water/day)', 'Avoid alcohol during first 2 weeks'],
    notifications: ['Week 1 check-in: report any unexpected reactions', 'Lab baseline scheduled'],
    adherence: 72,
  });

  // Phase 2: Active Improvement (weeks 4–8)
  if (weeks >= 4) {
    phases.push({
      id: 'phase-2',
      phase: 'improvement',
      label: 'Active Improvement Phase',
      weekStart: 4,
      weekEnd: Math.min(8, weeks),
      description: 'Peak anabolic and therapeutic activity. Most patients report the most noticeable results during this phase.',
      symptoms: ['Rare residual injection discomfort', 'Temporary fatigue in weeks 4–5 (adaptation complete)'],
      improvements: [
        'Significant energy and vitality boost',
        'Improved body composition (lean mass / fat ratio)',
        isHormonal  ? 'Libido and drive improvements' : null,
        isRecovery  ? 'Measurable healing acceleration at injury site' : null,
        isAntiAging ? 'Visible skin and hair quality improvements' : null,
        isCognitive ? 'Peak cognitive enhancement' : null,
      ].filter(Boolean),
      lifestyle: [
        'Introduce structured exercise (3–4x/week)',
        'Optimise protein intake (1.6–2.2 g/kg)',
        'Prioritise 7–9 hours of sleep',
        'Consider meditation / stress reduction',
      ],
      notifications: ['Week 4 mid-protocol check-in', 'Consider follow-up bloodwork at week 6'],
      adherence: 91,
    });
  }

  // Phase 3: Maintenance / Consolidation
  if (weeks >= 9) {
    phases.push({
      id: 'phase-3',
      phase: 'maintenance',
      label: 'Consolidation & Maintenance',
      weekStart: 9,
      weekEnd: Math.min(12, weeks),
      description: 'Consolidate gains and ensure sustainable long-term outcomes. Dosages may be tapered depending on the protocol.',
      symptoms: ['Minimal to none — most side-effects have resolved'],
      improvements: [
        'Stabilised results from the previous phase',
        'Improved baseline biomarker values',
        isHormonal ? 'Hormonal equilibrium re-established' : null,
      ].filter(Boolean),
      lifestyle: [
        'Continue exercise routine',
        'Evaluate diet and lifestyle changes made during the protocol',
        'Plan post-protocol maintenance strategy with your physician',
      ],
      notifications: ['Final check-in call scheduled', 'Post-protocol lab panel required'],
      adherence: 95,
    });
  }

  // Phase 4: Peak / Extension (>12 weeks)
  if (weeks > 12) {
    phases.push({
      id: 'phase-4',
      phase: 'peak',
      label: 'Extended Peak Phase',
      weekStart: 13,
      weekEnd: weeks,
      description: 'Extended protocols are individually calibrated. Regular biomarker monitoring is essential.',
      symptoms: ['Protocol well-tolerated at this stage'],
      improvements: [
        'Sustained therapeutic benefits',
        'Long-term biomarker optimisation',
      ],
      lifestyle: [
        'Quarterly biomarker reviews',
        'Consider cycling off for 4–6 weeks if clinically appropriate',
      ],
      notifications: [`Week ${Math.floor(weeks / 2)} extended check-in`, 'Annual comprehensive panel recommended'],
      adherence: 88,
    });
  }

  return phases;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function AdherenceBar({ pct }) {
  const color = pct >= 90 ? '#22c55e' : pct >= 75 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Expected adherence</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color }}>{pct}%</span>
      </div>
      <div style={{ height: '4px', borderRadius: '99px', background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function LifestyleTag({ icon: Icon, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.3rem 0.65rem', borderRadius: '99px',
      background: 'var(--surface-raised, #f8fafc)', border: '1px solid var(--border)',
      fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 500,
    }}>
      <Icon size={12} color="var(--primary)" /> {text}
    </div>
  );
}

const LIFESTYLE_ICONS = {
  sleep:   Moon,
  water:   Droplets,
  exercise: Dumbbell,
  default: Heart,
};

function getLifestyleIcon(text) {
  const t = text.toLowerCase();
  if (t.includes('sleep'))    return LIFESTYLE_ICONS.sleep;
  if (t.includes('water') || t.includes('hydrat')) return LIFESTYLE_ICONS.water;
  if (t.includes('exercise') || t.includes('workout') || t.includes('protein')) return LIFESTYLE_ICONS.exercise;
  return LIFESTYLE_ICONS.default;
}

function PhaseCard({ phase, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const colors  = PHASE_COLORS[phase.phase] || PHASE_COLORS.maintenance;

  return (
    <div style={{
      border: `1.5px solid ${colors.border}`,
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '1rem',
      background: 'var(--surface)',
    }}>
      {/* Phase header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer',
          padding: '1rem 1.25rem',
          background: colors.bg,
          border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: colors.text }}>{phase.label}</div>
            <div style={{ fontSize: '0.75rem', color: colors.text, opacity: 0.75 }}>
              Week {phase.weekStart}{phase.weekEnd > phase.weekStart ? ` – ${phase.weekEnd}` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AdherenceBar pct={phase.adherence} />
          {expanded ? <ChevronUp size={16} color={colors.text} /> : <ChevronDown size={16} color={colors.text} />}
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{phase.description}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {/* Symptoms */}
            {phase.symptoms.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertTriangle size={12} color="#f59e0b" /> Expected Symptoms
                </div>
                <ul style={{ margin: 0, paddingLeft: '1rem', listStyle: 'none' }}>
                  {phase.symptoms.map((s, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-main)', padding: '0.2rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <span style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }}>•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {phase.improvements.length > 0 && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <TrendingUp size={12} color="#22c55e" /> Expected Benefits
                </div>
                <ul style={{ margin: 0, paddingLeft: '1rem', listStyle: 'none' }}>
                  {phase.improvements.map((s, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-main)', padding: '0.2rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <CheckCircle size={12} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Lifestyle */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Smile size={12} color="var(--primary)" /> Lifestyle Recommendations
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {phase.lifestyle.map((l, i) => <LifestyleTag key={i} icon={getLifestyleIcon(l)} text={l} />)}
            </div>
          </div>

          {/* Notifications / Check-ins */}
          {phase.notifications.length > 0 && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Bell size={12} /> Patient Notifications
              </div>
              {phase.notifications.map((n, i) => (
                <div key={i} style={{ fontSize: '0.8rem', color: '#0c4a6e', padding: '0.15rem 0' }}>· {n}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProtocolPatientJourney({ protocol, onUpdate }) {
  const phases = protocol?.patient_journey_data || buildJourneyFromProtocol(protocol);
  const totalWeeks = protocol?.duration_weeks || 12;
  const phasePct = phases.length > 0 ? Math.round(phases.reduce((acc, p) => acc + (p.adherence || 0), 0) / phases.length) : 0;

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Hero summary */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
        borderRadius: '16px', padding: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        color: '#fff',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Patient Experience Journey
          </div>
          <h2 style={{ margin: '0.25rem 0', fontSize: '1.4rem', fontWeight: 800 }}>
            {protocol?.name || 'Protocol'} — {totalWeeks} Weeks
          </h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.85rem' }}>
            What the patient will feel, see, and experience — week by week.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Weeks', value: totalWeeks, icon: Activity },
            { label: 'Avg Adherence', value: `${phasePct}%`, icon: TrendingUp },
            { label: 'Phases', value: phases.length, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <Icon size={20} style={{ opacity: 0.8, marginBottom: '0.25rem' }} />
              <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{value}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI tip */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '0.85rem 1rem', borderRadius: '10px',
        background: '#faf5ff', border: '1px solid #e9d5ff',
      }}>
        <Sparkles size={18} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#5b21b6', lineHeight: 1.5 }}>
          <strong>Atlas AI:</strong> Patient adherence is highest between weeks 4–8. Consider scheduling a proactive check-in at week 3 to address early concerns before drop-off risk increases.
        </p>
      </div>

      {/* Phase timeline cards */}
      <div>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Phase-by-Phase Patient Journey
        </h3>
        {phases.map((phase, i) => (
          <PhaseCard key={phase.id} phase={phase} defaultExpanded={i === 0} />
        ))}
      </div>

      {/* Empty state if no phases */}
      {phases.length === 0 && (
        <EmptyState
          icon={Users}
          title="No Journey Data"
          subtitle="Set the protocol duration and therapeutic category to generate the patient journey automatically."
        />
      )}
    </div>
  );
}
