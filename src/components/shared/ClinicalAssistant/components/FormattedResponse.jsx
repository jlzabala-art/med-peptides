/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical, CheckCircle, AlertTriangle, ArrowRight, ChevronDown, ChevronUp,
  Microscope, Clipboard, Activity, Star, ShieldAlert, Info, ExternalLink, Hash,
  Stethoscope, Beaker, BookOpen, Zap,
} from 'lucide-react';

// ── Design tokens (match project palette) ────────────────────────────────────
const T = {
  primary:    'var(--primary, #004b87)',
  accent:     '#6366f1',
  success:    'var(--color-success)',
  warning:    '#f59e0b',
  danger:     'var(--color-danger)',
  neutral:    'var(--color-text-secondary)',
  bg:         'var(--color-bg-app)',
  border:     'var(--color-border)',
  card:       'white',
  radius:     '16px',
  shadow:     '0 4px 20px rgba(0,0,0,0.05)',
};

const fadeUp = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
const statusColor = { success: T.success, warning: T.warning, danger: T.danger, caution: T.warning, neutral: T.neutral };

// ─────────────────────────────────────────────────────────────────────────────
// Section: intro_card
// ─────────────────────────────────────────────────────────────────────────────
function IntroCard({ section }) {
  return (
    <motion.div {...fadeUp} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.9rem 1rem', backgroundColor: 'rgba(99,102,241,0.04)', borderRadius: T.radius, border: '1px solid rgba(99,102,241,0.12)' }}>
      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{section.icon || '💡'}</span>
      <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.7, color: 'var(--color-text-primary)' }}
        dangerouslySetInnerHTML={{ __html: (section.text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: key_points
// ─────────────────────────────────────────────────────────────────────────────
function KeyPoints({ section }) {
  return (
    <motion.div {...fadeUp} style={{ padding: '0.9rem 1rem', backgroundColor: T.card, borderRadius: T.radius, border: `1px solid ${T.border}` }}>
      {section.title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <CheckCircle size={14} color={T.success} />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section.title}</span>
        </div>
      )}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {(section.items || []).map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.8rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
            <span style={{ color: T.accent, fontWeight: 900, marginTop: '1px', flexShrink: 0 }}>›</span>
            <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--primary);text-decoration:none;font-weight:600">$1</a>') }} />
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: compound_table
// ─────────────────────────────────────────────────────────────────────────────
const LEVEL_BADGE = {
  beginner:     { color: T.success,  bg: 'rgba(16,185,129,0.08)',  label: 'Beginner' },
  intermediate: { color: T.warning,  bg: 'rgba(245,158,11,0.08)',  label: 'Intermediate' },
  advanced:     { color: T.danger,   bg: 'rgba(239,68,68,0.08)',   label: 'Advanced' },
};

function CompoundTable({ section, onNavigate }) {
  return (
    <motion.div {...fadeUp} style={{ borderRadius: T.radius, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      {section.title && (
        <div style={{ padding: '0.65rem 1rem', backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Beaker size={13} color={T.primary} />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section.title}</span>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(section.rows || []).map((row, i) => {
          const lvl = LEVEL_BADGE[row.level] || LEVEL_BADGE.beginner;
          return (
            <div key={i} onClick={() => onNavigate?.(`/product/${row.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 1rem', borderBottom: i < (section.rows.length - 1) ? `1px solid ${T.border}` : 'none', cursor: 'pointer', transition: 'background 0.15s', backgroundColor: 'white' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: T.primary }}>{row.name}</span>
                <span style={{ fontSize: '0.72rem', color: T.neutral }}>{row.benefit}</span>
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: lvl.color, backgroundColor: lvl.bg, padding: '0.2rem 0.5rem', borderRadius: '6px', flexShrink: 0, marginLeft: '0.75rem' }}>{lvl.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: product_card
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({ section, onNavigate }) {
  return (
    <motion.div {...fadeUp}
      onClick={() => section.link && onNavigate?.(section.link)}
      style={{ padding: '0.75rem 1rem', backgroundColor: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`, cursor: section.link ? 'pointer' : 'default', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}
      onMouseEnter={e => { if (section.link) { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.1)'; }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flex: 1 }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FlaskConical size={16} color={T.accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{section.name}</span>
            {section.badge && <span style={{ fontSize: '0.58rem', fontWeight: 700, color: T.success, backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>{section.badge}</span>}
          </div>
          {section.description && <p style={{ margin: 0, fontSize: '0.72rem', color: T.neutral, lineHeight: 1.4 }}>{section.description}</p>}
        </div>
      </div>
      {section.link && <ArrowRight size={14} color={T.accent} style={{ flexShrink: 0 }} />}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: prescription_table
// ─────────────────────────────────────────────────────────────────────────────
function PrescriptionTable({ section, onNavigate }) {
  return (
    <motion.div {...fadeUp} style={{ borderRadius: T.radius, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '0.65rem 1rem', backgroundColor: 'var(--color-success-bg)', borderBottom: `1px solid #bbf7d0`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CheckCircle size={13} color={T.success} />
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section.title}</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
          <thead>
            <tr style={{ backgroundColor: T.bg }}>
              {(section.columns || []).map((col, i) => (
                <th key={i} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--color-text-secondary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${T.border}` }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(section.rows || []).map((row, i) => (
              <tr key={i} onClick={() => row.link && onNavigate?.(row.link)}
                style={{ borderBottom: `1px solid ${T.border}`, cursor: row.link ? 'pointer' : 'default', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (row.link) e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'; }}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >
                <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: T.primary }}>{row.name}</td>
                <td style={{ padding: '0.55rem 0.75rem', color: 'var(--color-text-secondary)' }}>{row.strength}</td>
                <td style={{ padding: '0.55rem 0.75rem', color: 'var(--color-text-secondary)' }}>{row.quantity}</td>
                <td style={{ padding: '0.55rem 0.75rem' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: row.category?.includes('A') ? T.success : T.warning, backgroundColor: row.category?.includes('A') ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', padding: '0.2rem 0.45rem', borderRadius: '5px' }}>{row.category}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: quotation_cards
// ─────────────────────────────────────────────────────────────────────────────
function QuotationCards({ section }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <motion.div {...fadeUp} style={{ borderRadius: T.radius, border: `1px solid #fde68a`, overflow: 'hidden' }}>
      <div style={{ padding: '0.65rem 1rem', backgroundColor: 'var(--color-warning-bg)', borderBottom: `1px solid #fde68a`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Beaker size={13} color={T.warning} />
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section.title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {(section.items || []).map((item, i) => (
          <div key={i} style={{ borderBottom: i < section.items.length - 1 ? `1px solid #fde68a` : 'none' }}>
            <div onClick={() => setExpanded(expanded === i ? null : i)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 1rem', cursor: 'pointer', backgroundColor: 'white' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-warning-bg)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
            >
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.65rem', color: T.neutral }}>{item.vehicle}</span>
                {expanded === i ? <ChevronUp size={13} color={T.neutral} /> : <ChevronDown size={13} color={T.neutral} />}
              </div>
            </div>
            <AnimatePresence>
              {expanded === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', padding: '0.5rem 1rem 0.75rem', backgroundColor: 'var(--color-warning-bg)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    {(item.actives || []).map((a, j) => (
                      <span key={j} style={{ fontSize: '0.65rem', fontWeight: 600, color: '#92400e', backgroundColor: 'rgba(245,158,11,0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{a.active} {a.concentration}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.68rem', color: T.neutral }}><strong>Volume:</strong> {item.volume}</span>
                    <span style={{ fontSize: '0.68rem', color: T.neutral }}><strong>Form:</strong> {item.vehicle}</span>
                  </div>
                  {item.instructions && <p style={{ margin: '0.4rem 0 0', fontSize: '0.68rem', color: '#78350f', fontStyle: 'italic' }}>{item.instructions}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: lab_table
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  success:  { icon: '✅', color: '#166534', bg: 'var(--color-success-bg)', border: '#bbf7d0' },
  warning:  { icon: '🔻', color: '#854d0e', bg: '#fefce8', border: '#fde68a' },
  danger:   { icon: '🔺', color: '#991b1b', bg: 'var(--color-danger-bg)', border: '#fecaca' },
  caution:  { icon: '⚠️',  color: '#92400e', bg: 'var(--color-warning-bg)', border: '#fde68a' },
  neutral:  { icon: '—',  color: 'var(--color-text-secondary)', bg: T.bg,     border: T.border   },
};

function LabTable({ section }) {
  return (
    <motion.div {...fadeUp} style={{ borderRadius: T.radius, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '0.65rem 1rem', backgroundColor: 'rgba(99,102,241,0.04)', borderBottom: `1px solid rgba(99,102,241,0.12)`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={13} color={T.accent} />
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section.title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(section.biomarkers || []).map((bm, i) => {
          const st = STATUS_STYLE[bm.statusColor] || STATUS_STYLE.neutral;
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem', borderBottom: i < section.biomarkers.length - 1 ? `1px solid ${T.border}` : 'none', backgroundColor: 'white', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-primary)', flex: 1 }}>{bm.name}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-primary)', minWidth: '60px', textAlign: 'right' }}>{bm.value} <span style={{ fontWeight: 400, color: T.neutral }}>{bm.unit}</span></span>
              {bm.range && <span style={{ fontSize: '0.65rem', color: T.neutral, minWidth: '80px', textAlign: 'center' }}>ref: {bm.range}</span>}
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: st.color, backgroundColor: st.bg, border: `1px solid ${st.border}`, padding: '0.18rem 0.45rem', borderRadius: '6px', flexShrink: 0 }}>
                {st.icon} {bm.statusLabel}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: protocol_phase
// ─────────────────────────────────────────────────────────────────────────────
const PHASE_COLORS = ['#6366f1', 'var(--color-success)', '#f59e0b', 'var(--color-danger)', '#8b5cf6', '#06b6d4'];

function ProtocolPhase({ section, phaseIndex = 0 }) {
  const color = PHASE_COLORS[phaseIndex % PHASE_COLORS.length];
  return (
    <motion.div {...fadeUp} style={{ borderRadius: T.radius, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '0.65rem 1rem', backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section.phase}</span>
        {section.weeks && <span style={{ fontSize: '0.65rem', color: T.neutral, marginLeft: 'auto' }}>⏱ {section.weeks}</span>}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.73rem' }}>
          <thead>
            <tr style={{ backgroundColor: T.bg }}>
              {['Compound', 'Research Range', 'Frequency', 'Route', 'Notes'].map((h, i) => (
                <th key={i} style={{ padding: '0.45rem 0.75rem', textAlign: 'left', fontWeight: 700, color: T.neutral, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(section.compounds || []).map((c, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: T.primary, whiteSpace: 'nowrap' }}>{c.name}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-text-primary)' }}>{c.range}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-text-primary)' }}>{c.frequency}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-text-primary)' }}>{c.route}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: T.neutral, fontStyle: c.notes ? 'italic' : 'normal' }}>{c.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: monitoring_list
// ─────────────────────────────────────────────────────────────────────────────
function MonitoringList({ section }) {
  return (
    <motion.div {...fadeUp} style={{ padding: '0.9rem 1rem', backgroundColor: 'rgba(16,185,129,0.03)', borderRadius: T.radius, border: '1px solid rgba(16,185,129,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
        <Activity size={13} color={T.success} />
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section.title}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {(section.items || []).map((item, i) => (
          <span key={i} style={{ fontSize: '0.68rem', fontWeight: 600, color: '#065f46', backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.25rem 0.6rem', borderRadius: '8px' }}>{item}</span>
        ))}
      </div>
      {(section.flags || []).length > 0 && (
        <div style={{ marginTop: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {section.flags.map((flag, i) => (
            <span key={i} style={{ fontSize: '0.68rem', fontWeight: 600, color: '#991b1b', backgroundColor: 'rgba(239,68,68,0.08)', padding: '0.25rem 0.6rem', borderRadius: '8px' }}>⚠️ {flag}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: recommendation_card (onboarding)
// ─────────────────────────────────────────────────────────────────────────────
function RecommendationCard({ section, onNavigate }) {
  return (
    <motion.div {...fadeUp} style={{ borderRadius: T.radius, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '0.65rem 1rem', backgroundColor: T.bg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Star size={13} color={T.accent} />
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{section.title}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {(section.items || []).map((item, i) => (
          <div key={i} onClick={() => item.link && onNavigate?.(item.link)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 1rem', borderBottom: i < section.items.length - 1 ? `1px solid ${T.border}` : 'none', cursor: item.link ? 'pointer' : 'default', backgroundColor: 'white', transition: 'background 0.15s', gap: '0.5rem' }}
            onMouseEnter={e => { if (item.link) e.currentTarget.style.backgroundColor = 'var(--color-bg-app)'; }}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
          >
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flex: 1 }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FlaskConical size={14} color={T.accent} />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block' }}>{item.name}</span>
                {item.description && <span style={{ fontSize: '0.68rem', color: T.neutral }}>{item.description}</span>}
              </div>
            </div>
            {item.experience && (
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: LEVEL_BADGE[item.experience]?.color || T.neutral, backgroundColor: LEVEL_BADGE[item.experience]?.bg || T.bg, padding: '0.18rem 0.4rem', borderRadius: '5px', flexShrink: 0 }}>
                {LEVEL_BADGE[item.experience]?.label || item.experience}
              </span>
            )}
            {item.link && <ArrowRight size={13} color={T.accent} style={{ flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: warning_box
// ─────────────────────────────────────────────────────────────────────────────
function WarningBox({ section }) {
  return (
    <motion.div {...fadeUp} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.04)', borderRadius: T.radius, border: '1px solid rgba(239,68,68,0.15)' }}>
      <AlertTriangle size={14} color={T.danger} style={{ flexShrink: 0, marginTop: '1px' }} />
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#7f1d1d', lineHeight: 1.5 }}>{section.text}</p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: info_box
// ─────────────────────────────────────────────────────────────────────────────
function InfoBox({ section }) {
  const variant = section.variant || 'info';
  const styles = {
    info:    { bg: 'rgba(99,102,241,0.04)', border: 'rgba(99,102,241,0.15)', color: '#3730a3', icon: <Info size={14} color={T.accent} /> },
    tip:     { bg: 'rgba(16,185,129,0.04)', border: 'rgba(16,185,129,0.15)', color: '#065f46', icon: <Zap size={14} color={T.success} /> },
    caution: { bg: 'rgba(245,158,11,0.04)', border: 'rgba(245,158,11,0.2)',  color: '#78350f', icon: <AlertTriangle size={14} color={T.warning} /> },
  };
  const s = styles[variant] || styles.info;
  return (
    <motion.div {...fadeUp} style={{ padding: '0.75rem 1rem', backgroundColor: s.bg, borderRadius: T.radius, border: `1px solid ${s.border}` }}>
      {section.title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
          {s.icon}
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: s.color }}>{section.title}</span>
        </div>
      )}
      <p style={{ margin: 0, fontSize: '0.75rem', color: s.color, lineHeight: 1.5 }}>{section.text}</p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: pharmacology_stats
// ─────────────────────────────────────────────────────────────────────────────
function PharmacologyStats({ section }) {
  return (
    <motion.div {...fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
      {(section.stats || []).map((stat, i) => (
        <div key={i} style={{ padding: '0.75rem', backgroundColor: T.card, borderRadius: T.radius, border: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: T.neutral, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>{stat.label}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: T.primary }}>{stat.value}</span>
        </div>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section: text_block
// ─────────────────────────────────────────────────────────────────────────────
function TextBlock({ section }) {
  return (
    <motion.div {...fadeUp}>
      {section.title && <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{section.title}</h4>}
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-primary)', lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: (section.text || '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA button
// ─────────────────────────────────────────────────────────────────────────────
function CTAButton({ cta, onNavigate }) {
  if (!cta?.label) return null;
  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      onClick={() => cta.link && onNavigate?.(cta.link)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', backgroundColor: T.accent, color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', alignSelf: 'flex-start' }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = T.accent; e.currentTarget.style.transform = 'none'; }}
    >
      {cta.label}
      <ArrowRight size={13} />
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Disclaimer strip
// ─────────────────────────────────────────────────────────────────────────────
function Disclaimer({ text }) {
  if (!text) return null;
  return (
    <div style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', lineHeight: 1.5, paddingTop: '0.5rem', borderTop: `1px solid ${T.border}`, fontStyle: 'italic' }}>
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: FormattedResponse
// Drop-in replacement / addition inside ChatMessageItem for assistant messages
// ─────────────────────────────────────────────────────────────────────────────
export default function FormattedResponse({ formatted, onProductClick }) {
  const navigate = useNavigate();

  if (!formatted || !formatted.sections?.length) return null;

  const handleNavigate = (path) => {
    if (path?.startsWith('http')) {
      window.open(path, '_blank', 'noopener');
    } else if (path) {
      navigate(path);
    }
    onProductClick?.();
  };

  // Track protocol phase index for color cycling
  let phaseCount = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem' }}>
      {/* Headline */}
      {formatted.headline && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '3px', height: '18px', backgroundColor: T.accent, borderRadius: '2px', flexShrink: 0 }} />
          <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{formatted.headline}</h3>
        </motion.div>
      )}

      {/* Sections */}
      {formatted.sections.map((section, i) => {
        const key = `${section.type}-${i}`;
        switch (section.type) {
          case 'intro_card':        return <IntroCard          key={key} section={section} />;
          case 'key_points':        return <KeyPoints          key={key} section={section} />;
          case 'compound_table':    return <CompoundTable      key={key} section={section} onNavigate={handleNavigate} />;
          case 'product_card':      return <ProductCard        key={key} section={section} onNavigate={handleNavigate} />;
          case 'prescription_table':return <PrescriptionTable  key={key} section={section} onNavigate={handleNavigate} />;
          case 'quotation_cards':   return <QuotationCards     key={key} section={section} />;
          case 'lab_table':         return <LabTable           key={key} section={section} />;
          case 'protocol_phase':    return <ProtocolPhase      key={key} section={section} phaseIndex={phaseCount++} />;
          case 'monitoring_list':   return <MonitoringList     key={key} section={section} />;
          case 'recommendation_card': return <RecommendationCard key={key} section={section} onNavigate={handleNavigate} />;
          case 'warning_box':       return <WarningBox         key={key} section={section} />;
          case 'info_box':          return <InfoBox            key={key} section={section} />;
          case 'text_block':        return <TextBlock          key={key} section={section} />;
          case 'pharmacology_stats':return <PharmacologyStats  key={key} section={section} />;
          default:                  return null;
        }
      })}

      {/* CTA */}
      <CTAButton cta={formatted.cta} onNavigate={handleNavigate} />

      {/* Disclaimer */}
      <Disclaimer text={formatted.disclaimer} />
    </div>
  );
}
