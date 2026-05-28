/* eslint-disable no-unused-vars */
import { Sparkles, Clock, CheckCircle2, ArrowRight, Zap, Calendar } from 'lucide-react';

/**
 * AdminPlaceholderTab
 * ─────────────────────────────────────────────────────────────────────────────
 * A rich "Coming Soon" page used for tabs that are planned but not yet built.
 *
 * Props
 *  title       — page title, e.g. "Visual Protocol Builder"
 *  description — 1-2 sentence description of the page's purpose
 *  features    — string[] of planned feature bullets
 *  tags        — string[] of short capability tags (pill badges)
 *  icon        — lucide-react icon component (optional)
 *  color       — accent color matching the parent section (optional, default #3b82f6)
 *  priority    — 'next' | 'soon' | 'planned'  (default 'planned')
 */

const PRIORITY_CONFIG = {
  next: {
    label: 'Up Next',
    Icon: Zap,
    bg: '#dc262615',
    border: '#dc262630',
    text: 'var(--color-danger)',
    glow: '#dc262622',
  },
  soon: {
    label: 'Coming Soon',
    Icon: Clock,
    bg: '#f59e0b15',
    border: '#f59e0b30',
    text: 'var(--color-warning)',
    glow: '#f59e0b22',
  },
  planned: {
    label: 'Planned',
    Icon: Calendar,
    bg: '#6b728015',
    border: '#6b728030',
    text: '#6b7280',
    glow: '#6b728022',
  },
};

export default function AdminPlaceholderTab({
  title = 'Coming Soon',
  description = 'This module is under active development and will be available shortly.',
  features = [],
  tags = [],
  icon: Icon = Sparkles,
  color = 'var(--color-primary)',
  priority = 'planned',
}) {
  const bg  = `${color}12`;
  const mid = `${color}25`;
  const p   = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.planned;
  const PIcon = p.Icon;

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
    }}>
      <div style={{
        maxWidth: 640,
        width: '100%',
        textAlign: 'center',
      }}>

        {/* ── Animated icon orb ── */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 96,
          height: 96,
          borderRadius: '28px',
          backgroundColor: bg,
          border: `2px solid ${mid}`,
          marginBottom: '1.75rem',
          animation: 'placeholderPulse 3s ease-in-out infinite',
          boxShadow: `0 8px 32px ${color}22`,
        }}>
          <Icon size={44} color={color} />
        </div>

        {/* ── Priority badge ── */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          backgroundColor: p.bg,
          color: p.text,
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '0.3rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${p.border}`,
          marginBottom: '1.25rem',
          boxShadow: priority === 'next' ? `0 0 12px ${p.glow}` : 'none',
          animation: priority === 'next' ? 'priorityGlow 2s ease-in-out infinite' : 'none',
        }}>
          <PIcon size={11} />
          {p.label}
        </div>

        {/* ── Title ── */}
        <h2 style={{
          margin: '0 0 0.85rem',
          fontSize: '2rem',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          color: 'var(--text-main)',
          lineHeight: 1.15,
        }}>
          {title}
        </h2>

        {/* ── Description ── */}
        <p style={{
          margin: '0 0 2.25rem',
          fontSize: '1rem',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          maxWidth: 500,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {description}
        </p>

        {/* ── Feature list ── */}
        {features.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '1.75rem',
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '1rem',
            }}>
              What this page will manage
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {features.map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  <CheckCircle2 size={16} color={color} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Capability tags ── */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
            {tags.map((tag, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.3rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                <ArrowRight size={11} color={color} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Subtle footer note ── */}
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, opacity: 0.7 }}>
          This section is part of the platform roadmap. Check back soon.
        </p>
      </div>

      <style>{`
        @keyframes placeholderPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 8px 32px ${color}22; }
          50%       { transform: scale(1.04); box-shadow: 0 12px 40px ${color}40; }
        }
        @keyframes priorityGlow {
          0%, 100% { box-shadow: 0 0 8px #dc262620; }
          50%       { box-shadow: 0 0 18px #dc262645; }
        }
      `}</style>
    </div>
  );
}
