import {
  Search,
  FlaskConical,
  BookOpen,
  ShoppingCart,
  ArrowRight,
  Compass,
  Zap,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   PHASE 3 — Exploration Journey
   Answers: "Are users actually exploring? What path do they take?"
   
   Data sources (all existing, no new GA4 queries needed):
   - tops.searches   → what users look for
   - tops.peptides   → what compounds they reach
   - tops.protocols  → what protocols they consume
   - metrics funnel  → cart / checkout numbers
───────────────────────────────────────────────────────────────────────── */

function fmtNum(n) {
  if (n === undefined || n === null) return '—';
  const val = typeof n === 'object' ? (n.current ?? n) : n;
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
  if (val >= 1_000) return (val / 1_000).toFixed(1) + 'K';
  return String(val);
}

/* ── Stage definition ─────────────────────────────────────────────────── */
const STAGES = [
  {
    id: 'search',
    label: 'Search Intent',
    description: 'What researchers are looking for',
    icon: Search,
    color: '#0891b2',
    bg: 'rgba(8,145,178,0.08)',
    dataKey: 'searches',
    emptyMsg: 'No search data yet',
  },
  {
    id: 'peptide',
    label: 'Compound Discovery',
    description: 'Peptides capturing most attention',
    icon: FlaskConical,
    color: 'var(--primary)',
    bg: 'rgba(0,54,102,0.08)',
    dataKey: 'peptides',
    emptyMsg: 'No peptide views yet',
  },
  {
    id: 'protocol',
    label: 'Protocol Engagement',
    description: 'Research protocols being consumed',
    icon: BookOpen,
    color: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    dataKey: 'protocols',
    emptyMsg: 'No protocol views yet',
  },
  {
    id: 'cart',
    label: 'Purchase Consideration',
    description: 'Moving toward acquisition',
    icon: ShoppingCart,
    color: 'var(--color-success)',
    bg: 'rgba(5,150,105,0.08)',
    dataKey: null, // derived from funnel
    emptyMsg: 'No cart activity yet',
  },
];

/* ── Top item mini-list within each stage ─────────────────────────────── */
function StageItems({ items, color, emptyMsg }) {
  if (!items || items.length === 0) {
    return (
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
    );
  }

  const maxVal = items[0]?.value || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {items.slice(0, 3).map((item, i) => {
        const pct = Math.max(6, Math.round((item.value / maxVal) * 100));
        return (
          <div key={i}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.2rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '75%',
                }}
              >
                {item.name}
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {fmtNum(item.value)}
              </span>
            </div>
            <div
              style={{
                height: '3px',
                background: 'rgba(0,0,0,0.06)',
                borderRadius: '99px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: '99px',
                  transition: 'width 0.6s ease',
                  opacity: 0.7 + (i === 0 ? 0.3 : i === 1 ? 0.15 : 0),
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Single stage card ────────────────────────────────────────────────── */
function StageCard({ stage, items, cartVal, isLast }) {
  const Icon = stage.icon;
  const displayItems = stage.dataKey ? items : null;
  const cartFormatted = cartVal ? fmtNum(cartVal) : null;

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', flex: 1, minWidth: 0 }}>
      {/* Card */}
      <div
        style={{
          flex: 1,
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1.1rem 1.2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          transition: 'box-shadow 0.2s, transform 0.2s',
          minWidth: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              background: stage.bg,
              color: stage.color,
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <Icon size={15} strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: '0.67rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {stage.label}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-light)', fontWeight: 500 }}>
              {stage.description}
            </div>
          </div>
        </div>

        {/* Content */}
        {stage.id === 'cart' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {cartFormatted ? (
              <>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: stage.color,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {cartFormatted}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>
                  researchers added to cart
                </span>
              </>
            ) : (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                {stage.emptyMsg}
              </span>
            )}
          </div>
        ) : (
          <StageItems items={displayItems} color={stage.color} emptyMsg={stage.emptyMsg} />
        )}
      </div>

      {/* Arrow connector */}
      {!isLast && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 0.4rem',
            color: 'var(--border)',
            flexShrink: 0,
          }}
        >
          <ArrowRight size={16} strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

/* ── Depth signal bar ─────────────────────────────────────────────────── */
function DepthSignal({ tops }) {
  const hasSearch = tops.searches?.length > 0;
  const hasPeptide = tops.peptides?.length > 0;
  const hasProtocol = tops.protocols?.length > 0;

  const depth = [hasSearch, hasPeptide, hasProtocol].filter(Boolean).length;
  const depthLabel =
    depth === 3
      ? 'Deep Exploration — users reach protocols'
      : depth === 2
        ? 'Mid Exploration — users reach peptides'
        : depth === 1
          ? 'Surface Exploration — users are searching'
          : 'No exploration data yet';

  const depthColor =
    depth === 3
      ? 'var(--color-success)'
      : depth === 2
        ? '#0891b2'
        : depth === 1
          ? '#f59e0b'
          : 'var(--text-light)';
  const depthPct = depth === 0 ? 0 : Math.round((depth / 3) * 100);

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '0.9rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <Zap size={14} color={depthColor} strokeWidth={2} />
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Exploration Depth
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: '6px',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '99px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${depthPct}%`,
              height: '100%',
              background: 'var(--surface)',
              borderRadius: '99px',
              transition: 'width 0.8s ease',
            }}
          />
        </div>
      </div>
      <span style={{ fontSize: '0.68rem', color: depthColor, fontWeight: 700, flexShrink: 0 }}>
        {depthLabel}
      </span>
    </div>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */
export default function ExplorationJourney({ tops = {}, funnel = [] }) {
  // Extract cart value from funnel if available
  const cartStep = funnel.find(
    (s) => s.label?.toLowerCase().includes('cart') || s.label?.toLowerCase().includes('add to')
  );
  const cartVal = cartStep?.value
    ? typeof cartStep.value === 'object'
      ? cartStep.value.current
      : cartStep.value
    : null;

  return (
    <section>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: '4px', height: '20px', background: '#0891b2', borderRadius: '2px' }} />
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
          Exploration Journey
        </h3>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 600 }}>
          — How researchers navigate from curiosity to protocol
        </span>
      </div>

      {/* Stage flow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          gap: '0',
          marginBottom: '1rem',
          overflowX: 'auto',
        }}
      >
        {STAGES.map((stage, i) => (
          <StageCard
            key={stage.id}
            stage={stage}
            items={tops[stage.dataKey] ?? []}
            cartVal={cartVal}
            isLast={i === STAGES.length - 1}
          />
        ))}
      </div>

      {/* Depth signal */}
      <DepthSignal tops={tops} />
    </section>
  );
}
