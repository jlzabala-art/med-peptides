/* eslint-disable no-unused-vars */
import { Sparkles, Clock, CheckCircle2, ArrowRight, Zap, Calendar } from 'lucide-react';

const PRIORITY_CONFIG = {
  next: { label: 'Up Next', Icon: Zap, bg: '#dc262615', border: '#dc262630', text: 'var(--color-danger)', glow: '#dc262622' },
  soon: { label: 'Coming Soon', Icon: Clock, bg: '#f59e0b15', border: '#f59e0b30', text: 'var(--color-warning)', glow: '#f59e0b22' },
  planned: { label: 'Planned', Icon: Calendar, bg: '#6b728015', border: '#6b728030', text: '#6b7280', glow: '#6b728022' },
};

export default function AdminPlaceholderTab({
  title = 'Coming Soon',
  description = 'This module is under active development and will be available shortly.',
  features = [],
  tags = [],
  icon: Icon = Sparkles,
  color = '#3b82f6',
  priority = 'planned',
}) {
  const p = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.planned;
  const PIcon = p.Icon || Calendar;
  const SafeIcon = Icon || Sparkles;

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 640, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, borderRadius: '28px', backgroundColor: `${color}15`, border: `2px solid ${color}30`, marginBottom: '1.75rem', animation: 'placeholderPulse 3s ease-in-out infinite' }}>
          <SafeIcon size={44} color={color} />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: p.bg, color: p.text, fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.3rem 0.85rem', borderRadius: '4px', border: `1px solid ${p.border}`, marginBottom: '1.25rem' }}>
          <PIcon size={11} />
          {p.label}
        </div>

        <h2 style={{ margin: '0 0 0.85rem', fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>{title}</h2>
        <p style={{ margin: '0 0 2.25rem', fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>{description}</p>

        {features && features.length > 0 && (
          <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.75rem', textAlign: 'left' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>What this page will manage</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {features.map((feat, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={16} color={color} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
            {tags.map((tag, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.85rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, backgroundColor: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                <ArrowRight size={11} color={color} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes placeholderPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
