/* eslint-disable no-unused-vars */
import { Users, Repeat, Clock, Search, BrainCircuit, TrendingUp, TrendingDown } from 'lucide-react';

/* ── Helpers ──────────────────────────────────────────────────────────── */
function fmtSeconds(secs) {
  if (!secs) return '—';
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function fmtNum(n) {
  if (n === undefined || n === null) return '—';
  const val = typeof n === 'object' ? n.current : n;
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
  if (val >= 1_000) return (val / 1_000).toFixed(1) + 'K';
  return String(val);
}

/* ── Trend Pill ───────────────────────────────────────────────────────── */
function Trend({ value }) {
  if (value === undefined || value === null) return null;
  const positive = value > 0;
  const neutral = value === 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
      fontSize: '0.65rem', fontWeight: 700,
      padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)',
      color: neutral ? 'var(--text-light)' : positive ? 'var(--color-success)' : 'var(--color-danger)',
      background: neutral ? 'rgba(0,0,0,0.04)' : positive ? 'rgba(5,150,105,0.08)' : 'rgba(220,38,38,0.08)',
    }}>
      {positive ? <TrendingUp size={9} /> : neutral ? null : <TrendingDown size={9} />}
      {positive ? '+' : ''}{value}%
    </span>
  );
}

/* ── Single KPI Tile ──────────────────────────────────────────────────── */
function Tile({ icon: Icon, color, bg, label, value, trend, sub, wide }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem 1.4rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      boxShadow: 'var(--shadow-sm)',
      gridColumn: wide ? 'span 2' : 'span 1',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ background: bg, color, padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
          <Icon size={16} strokeWidth={2} />
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '1.55rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </span>
        {trend !== undefined && <Trend value={trend} />}
      </div>
      {sub && (
        <span style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 500 }}>{sub}</span>
      )}
    </div>
  );
}

/* ── Returning Rate Arc ───────────────────────────────────────────────── */
function ReturnArc({ rate }) {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * (rate / 100);
  const gap = circumference - filled;
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" style={{ flexShrink: 0 }}>
      <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
      <circle
        cx="42" cy="42" r={r} fill="none"
        stroke="var(--secondary)" strokeWidth="8"
        strokeDasharray={`${filled} ${gap}`}
        strokeLinecap="round"
        transform="rotate(-90 42 42)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x="42" y="42" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: '13px', fontWeight: 900, fill: 'var(--text-main)' }}>
        {rate}%
      </text>
    </svg>
  );
}

/* ── Main Component ───────────────────────────────────────────────────── */
export default function PlatformHealth({ health, visitors }) {
  if (!health) return null;

  const {
    returningUsers,
    returningRate = 0,
    newUsers,
    avgSessionDuration,
    pagesPerSession,
    searchEvents,
    searchRate = 0,
    aiEvents,
    aiRate = 0,
  } = health;

  const totalVisitors = typeof visitors === 'object' ? visitors.current : (visitors || 0);
  const visitorTrend = typeof visitors === 'object' ? visitors.trend : null;

  return (
    <section>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '2px' }} />
        <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Platform Health
        </h3>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 600 }}>
          — Audience quality & engagement depth
        </span>
      </div>

      {/* KPI grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
      }}>

        {/* Active Users */}
        <Tile
          icon={Users}
          color="var(--primary)"
          bg="rgba(0,54,102,0.08)"
          label="Active Users"
          value={fmtNum(totalVisitors)}
          trend={visitorTrend}
          sub={`${fmtNum(newUsers?.current ?? 0)} new this period`}
        />

        {/* Returning Users — with arc */}
        <div style={{
          background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <ReturnArc rate={returningRate} />
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
              Return Rate
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {fmtNum(returningUsers?.current ?? 0)}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: '0.3rem' }}>
              returning researchers
            </div>
          </div>
        </div>

        {/* Session Duration */}
        <Tile
          icon={Clock}
          color="#7c3aed"
          bg="rgba(124,58,237,0.08)"
          label="Avg Session"
          value={fmtSeconds(avgSessionDuration?.current)}
          trend={avgSessionDuration?.trend}
          sub={`${pagesPerSession?.current ?? '—'} pages / session`}
        />

        {/* Search Adoption */}
        <Tile
          icon={Search}
          color="#0891b2"
          bg="rgba(8,145,178,0.08)"
          label="Search Rate"
          value={searchRate > 0 ? `${Math.round(searchRate * 100)}%` : '—'}
          trend={searchEvents?.trend}
          sub={`${fmtNum(searchEvents?.current ?? 0)} total searches`}
        />

        {/* ClinicalAI Engagement — full width if data present */}
        <div style={{
          background: aiRate > 0
            ? 'linear-gradient(135deg, rgba(0,54,102,0.04) 0%, rgba(124,58,237,0.04) 100%)'
            : 'white',
          border: `1px solid ${aiRate > 0 ? 'rgba(124,58,237,0.15)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem 1.4rem',
          gridColumn: 'span 4',
          display: 'flex', alignItems: 'center', gap: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', padding: '0.6rem', borderRadius: 'var(--radius-md)' }}>
              <BrainCircuit size={20} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ClinicalAI Engagement
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
                {aiRate > 0
                  ? `${Math.round(aiRate * 100)}% of visitors initiated an AI research session`
                  : 'AI session tracking activates in Phase 5 — events not yet emitted'}
              </div>
            </div>
          </div>
          {aiEvents?.current > 0 && (
            <div style={{ display: 'flex', gap: '2rem', marginLeft: 'auto' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7c3aed', letterSpacing: '-0.03em' }}>{fmtNum(aiEvents.current)}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>AI sessions</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>{Math.round(aiRate * 100)}%</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>engagement rate</div>
              </div>
              <Trend value={aiEvents?.trend} />
            </div>
          )}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .ph-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .ph-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
