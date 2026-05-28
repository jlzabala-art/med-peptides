/* eslint-disable no-unused-vars */
import { AlertTriangle, RotateCcw, Search, Lightbulb } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   PHASE 6 — Friction Insights
   Answers: "Where are users getting confused? What should we improve first?"

   Data sources (GA4 custom events):
     • search_empty_result  — query produced zero hits across all tabs
     • search_repeated      — user typed the same query > 1x in a session

   Props:
     friction = {
       emptySearches : [{ name: string, value: number }],   // top empty queries
       repeatedSearches: [{ name: string, value: number }], // top repeated queries
       totalEmptyEvents:    number,
       totalRepeatedEvents: number,
     }
───────────────────────────────────────────────────────────────────────── */

function fmtNum(n) {
  if (n === undefined || n === null) return '—';
  const val = typeof n === 'object' ? n.current ?? n : n;
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
  if (val >= 1_000) return (val / 1_000).toFixed(1) + 'K';
  return String(val);
}

/* ── Stat badge ─────────────────────────────────────────────────────────── */
function StatBadge({ label, value, color, bg }) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${color}22`,
      borderRadius: 'var(--radius-md)',
      padding: '0.75rem 1rem',
      display: 'flex', flexDirection: 'column', gap: '0.2rem',
    }}>
      <span style={{ fontSize: '1.4rem', fontWeight: 900, color, lineHeight: 1 }}>
        {fmtNum(value)}
      </span>
      <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
    </div>
  );
}

/* ── Friction list (empty / repeated queries) ────────────────────────────── */
function FrictionList({ icon: Icon, color, bg, title, subtitle, items, emptyMsg, badge }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem 1.4rem',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex', flexDirection: 'column', gap: '1rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ background: bg, color, padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', flexShrink: 0 }}>
            <Icon size={15} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              {title}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', fontWeight: 500 }}>
              {subtitle}
            </div>
          </div>
        </div>
        {badge && (
          <span style={{
            fontSize: '0.58rem', fontWeight: 800, color,
            background: bg, padding: '0.2rem 0.5rem',
            borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em',
            flexShrink: 0,
          }}>
            {badge}
          </span>
        )}
      </div>

      {/* Items */}
      {!items || items.length === 0 ? (
        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontStyle: 'italic', padding: '0.5rem 0' }}>
          {emptyMsg}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {items.slice(0, 5).map((item, i) => {
            const maxVal = items[0]?.value || 1;
            const val = typeof item.value === 'object' ? item.value.current ?? item.value : item.value;
            const pct = Math.max(8, Math.round((val / maxVal) * 100));
            const isTop = i === 0;

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                {/* Rank */}
                <span style={{
                  fontSize: '0.6rem', fontWeight: 900,
                  color: isTop ? color : 'var(--text-light)',
                  width: '14px', textAlign: 'right', flexShrink: 0,
                }}>
                  {i + 1}
                </span>

                {/* Bar + label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.18rem' }}>
                    <span style={{
                      fontSize: '0.71rem', fontWeight: isTop ? 700 : 600,
                      color: isTop ? 'var(--text-main)' : 'var(--text-muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      maxWidth: '80%',
                    }}>
                      "{item.name}"
                    </span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700,
                      color: isTop ? color : 'var(--text-light)',
                      flexShrink: 0,
                    }}>
                      {fmtNum(val)}×
                    </span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(0,0,0,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%',
                      background: isTop ? color : `${color}55`,
                      borderRadius: '99px',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Auto-generated friction interpretation ──────────────────────────────── */
function FrictionInterpretation({ friction }) {
  const insights = [];
  const { emptySearches = [], repeatedSearches = [], totalEmptyEvents = 0, totalRepeatedEvents = 0 } = friction;

  const topEmpty = emptySearches[0]?.name;
  const topRepeat = repeatedSearches[0]?.name;

  if (topEmpty) {
    insights.push(
      `"${topEmpty}" is the most common search with no results — consider adding a content page or FAQ entry for this term.`
    );
  }

  if (topRepeat) {
    insights.push(
      `Users are repeating the search "${topRepeat}" — results may not be matching expectations. Review search ranking or rename relevant content.`
    );
  }

  const ratio = totalEmptyEvents > 0 && totalRepeatedEvents > 0
    ? (totalRepeatedEvents / totalEmptyEvents).toFixed(1)
    : null;

  if (ratio && ratio >= 1.5) {
    insights.push(`Repeated searches are ${ratio}× more frequent than empty results — users are finding *some* content but not satisfying their intent. Focus on content quality over discoverability.`);
  }

  if (insights.length === 0) {
    if (totalEmptyEvents === 0 && totalRepeatedEvents === 0) return null;
    insights.push('Friction signals detected. Accumulating more data to generate specific recommendations.');
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid rgba(220,38,38,0.1)',
      borderRadius: 'var(--radius-md)',
      padding: '1rem 1.25rem',
      display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
    }}>
      <div style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '0.1rem' }}>
        <Lightbulb size={16} strokeWidth={1.8} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Friction Intelligence
        </span>
        {insights.map((insight, i) => (
          <p key={i} style={{ margin: 0, fontSize: '0.73rem', color: 'var(--text-main)', lineHeight: 1.55, fontWeight: 500 }}>
            {insight}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────────────── */
export default function FrictionInsights({ friction = {} }) {
  const {
    emptySearches    = [],
    repeatedSearches = [],
    totalEmptyEvents    = 0,
    totalRepeatedEvents = 0,
  } = friction;

  const hasData = emptySearches.length > 0 || repeatedSearches.length > 0;

  return (
    <section>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: '4px', height: '20px', background: 'var(--color-danger)', borderRadius: '2px' }} />
        <h3 style={{
          margin: 0, fontSize: '0.8rem', fontWeight: 800,
          color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em'
        }}>
          Friction Points
        </h3>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 600 }}>
          — Where users get confused or stuck
        </span>
      </div>

      {/* Summary stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem',
        marginBottom: '1rem',
        maxWidth: '400px',
      }}>
        <StatBadge
          label="Empty Searches"
          value={totalEmptyEvents}
          color="var(--color-danger)"
          bg="rgba(220,38,38,0.06)"
        />
        <StatBadge
          label="Repeated Searches"
          value={totalRepeatedEvents}
          color="#f97316"
          bg="rgba(249,115,22,0.06)"
        />
      </div>

      {/* 2-column friction lists */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <FrictionList
          icon={Search}
          color="var(--color-danger)"
          bg="rgba(220,38,38,0.07)"
          title="Dead-End Searches"
          subtitle="Queries that returned zero results"
          badge="Content gaps"
          items={emptySearches}
          emptyMsg="No empty searches recorded yet — great sign!"
        />
        <FrictionList
          icon={RotateCcw}
          color="#f97316"
          bg="rgba(249,115,22,0.07)"
          title="Repeated Queries"
          subtitle="Searches users ran more than once"
          badge="Unmet intent"
          items={repeatedSearches}
          emptyMsg="No repeated searches recorded yet."
        />
      </div>

      {/* Auto-generated friction intelligence */}
      {hasData && <FrictionInterpretation friction={friction} />}

      {/* No-data fallback */}
      {!hasData && (
        <div style={{
          background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '2rem',
          textAlign: 'center', color: 'var(--text-light)',
          fontSize: '0.75rem', fontWeight: 500,
        }}>
          <AlertTriangle size={20} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
          <div>No friction data yet.</div>
          <div style={{ fontSize: '0.66rem', marginTop: '0.3rem' }}>
            Events fire when users search with empty results or repeat the same query.
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .fi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
