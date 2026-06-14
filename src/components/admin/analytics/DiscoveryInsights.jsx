import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Search from "lucide-react/dist/esm/icons/search";
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
/* eslint-disable no-unused-vars */






/* ─────────────────────────────────────────────────────────────────────────
   PHASE 4 — Discovery Insights
   Answers: "What content creates curiosity? What should we improve first?"
   Data: tops.peptides, tops.protocols, tops.searches (all existing)
   Adds: contextual interpretation of what the data *means*
───────────────────────────────────────────────────────────────────────── */

function fmtNum(n) {
  if (n === undefined || n === null) return '—';
  const val = typeof n === 'object' ? (n.current ?? n) : n;
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
  if (val >= 1_000) return (val / 1_000).toFixed(1) + 'K';
  return String(val);
}

/* ── Compact ranked list with contextual labels ───────────────────────── */
function RankedList({ icon: Icon, color, bg, title, subtitle, items, emptyMsg, badge }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.4rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              background: bg,
              color,
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <Icon size={15} strokeWidth={2} />
          </div>
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-light)', fontWeight: 500 }}>
              {subtitle}
            </div>
          </div>
        </div>
        {badge && (
          <span
            style={{
              fontSize: '0.58rem',
              fontWeight: 800,
              color,
              background: bg,
              padding: '0.2rem 0.5rem',
              borderRadius: '99px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              flexShrink: 0,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Items */}
      {!items || items.length === 0 ? (
        <div
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-light)',
            fontStyle: 'italic',
            padding: '0.5rem 0',
          }}
        >
          {emptyMsg}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {items.slice(0, 5).map((item, i) => {
            const maxVal = items[0]?.value || 1;
            const val =
              typeof item.value === 'object' ? (item.value.current ?? item.value) : item.value;
            const pct = Math.max(8, Math.round((val / maxVal) * 100));
            const isTop = i === 0;

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                {/* Rank number */}
                <span
                  style={{
                    fontSize: '0.6rem',
                    fontWeight: 900,
                    color: isTop ? color : 'var(--text-light)',
                    width: '14px',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>

                {/* Bar + label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.18rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.71rem',
                        fontWeight: isTop ? 700 : 600,
                        color: isTop ? 'var(--text-main)' : 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '80%',
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: isTop ? color : 'var(--text-light)',
                        flexShrink: 0,
                      }}
                    >
                      {fmtNum(val)}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '3px',
                      background: 'rgba(0,0,0,0.05)',
                      borderRadius: '99px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: isTop ? color : `${color}55`,
                        borderRadius: '99px',
                        transition: 'width 0.6s ease',
                      }}
                    />
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

/* ── Insight interpretation card ──────────────────────────────────────── */
function AutoInsight({ tops }) {
  const insights = [];

  const topPeptide = tops.peptides?.[0]?.name;
  const topProtocol = tops.protocols?.[0]?.name;
  const topSearch = tops.searches?.[0]?.name;
  const peptideViews = tops.peptides?.[0]?.value || 0;
  const protocolViews = tops.protocols?.[0]?.value || 0;

  if (topSearch && topPeptide) {
    const matchRatio = topSearch.toLowerCase().includes(topPeptide.toLowerCase().slice(0, 5))
      ? 'aligned'
      : 'divergent';
    insights.push(
      matchRatio === 'aligned'
        ? `Search intent and compound discovery are aligned — users searching for "${topSearch}" are reaching ${topPeptide}.`
        : `Search intent ("${topSearch}") doesn't clearly map to the top compound (${topPeptide}). Consider improving search indexing.`
    );
  }

  if (peptideViews > 0 && protocolViews > 0) {
    const ratio = protocolViews / peptideViews;
    if (ratio < 0.3) {
      insights.push(
        `Protocol consumption is low relative to peptide interest (${Math.round(ratio * 100)}%). Users may need clearer peptide → protocol pathways.`
      );
    } else if (ratio >= 0.6) {
      insights.push(
        `Strong protocol engagement relative to peptide discovery (${Math.round(ratio * 100)}% conversion). Content architecture is working well.`
      );
    }
  }

  if (!topPeptide && !topProtocol && !topSearch) {
    return null;
  }

  if (insights.length === 0) {
    insights.push(
      'Collecting enough data to generate content intelligence. Check back after more user sessions.'
    );
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid rgba(0,54,102,0.1)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        display: 'flex',
        gap: '0.85rem',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ color: '#7c3aed', flexShrink: 0, marginTop: '0.1rem' }}>
        <Lightbulb size={16} strokeWidth={1.8} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Content Intelligence
        </span>
        {insights.map((insight, i) => (
          <p
            key={i}
            style={{
              margin: 0,
              fontSize: '0.73rem',
              color: 'var(--text-main)',
              lineHeight: 1.55,
              fontWeight: 500,
            }}
          >
            {insight}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */
export default function DiscoveryInsights({ tops = {} }) {
  const hasAnyData = tops.peptides?.length || tops.protocols?.length || tops.searches?.length;

  return (
    <section>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: '4px', height: '20px', background: '#7c3aed', borderRadius: '2px' }} />
        <h3
          style={{
            margin: 0,
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Discovery Insights
        </h3>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 600 }}>
          — What content creates curiosity and drives exploration
        </span>
      </div>

      {/* 3-column ranked lists */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <RankedList
          icon={Search}
          color="#0891b2"
          bg="rgba(8,145,178,0.08)"
          title="Research Intent"
          subtitle="What users are searching for"
          badge="Search signals"
          items={tops.searches}
          emptyMsg="No searches recorded yet."
        />
        <RankedList
          icon={FlaskConical}
          color="var(--primary)"
          bg="rgba(0,54,102,0.08)"
          title="High-Interest Compounds"
          subtitle="Peptides capturing most attention"
          badge="Compound interest"
          items={tops.peptides}
          emptyMsg="No peptide views yet."
        />
        <RankedList
          icon={BookOpen}
          color="#7c3aed"
          bg="rgba(124,58,237,0.08)"
          title="Consumed Protocols"
          subtitle="Research protocols being read"
          badge="Protocol depth"
          items={tops.protocols}
          emptyMsg="No protocol views yet."
        />
      </div>

      {/* Auto-generated content intelligence */}
      {hasAnyData && <AutoInsight tops={tops} />}

      {/* Responsive grid */}
      <style>{`
        @media (max-width: 900px) {
          .di-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 700px) {
          .di-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}