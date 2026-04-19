import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { X, Divide, Activity, TrendingUp, AlertCircle } from 'lucide-react';

/* ─── Responsive styles injected once ─────────────────────────────────────── */
const MODAL_STYLES = `
  .pcm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.65);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2100;
    backdrop-filter: blur(12px);
    animation: pcmFadeIn 0.25s ease-out;
  }
  @keyframes pcmFadeIn { from { opacity: 0; } to { opacity: 1; } }

  .pcm-panel {
    background: var(--background, #fff);
    width: min(98%, 1100px);
    height: min(95vh, 900px);
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 40px 100px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255,255,255,0.1);
    animation: pcmSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes pcmSlideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

  /* ── Sticky bar ── */
  .pcm-sticky-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border, #e2e8f0);
    padding: 0.6rem 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--primary, #003666);
  }
  .pcm-sticky-badge {
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 900;
    letter-spacing: 0.04em;
  }

  /* ── Column grid ── */
  .pcm-row {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr;
    padding: 0.9rem 0;
    border-bottom: 1px solid var(--border, #e2e8f0);
    gap: 0.5rem;
    align-items: start;
    transition: background 0.15s;
  }
  .pcm-row:hover { background: rgba(0,163,224,0.03); }
  .pcm-row.diff   { background: rgba(0,163,224,0.05); }

  .pcm-row-header {
    display: grid;
    grid-template-columns: 2fr 1.5fr 1.5fr;
    padding: 0 0 1.25rem 0;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .pcm-label {
    font-weight: 700;
    font-size: 0.82rem;
    color: var(--text-muted, #64748b);
    padding-right: 0.5rem;
  }
  .pcm-val {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-main, #0f172a);
    word-break: break-word;
  }
  .pcm-val.revised { color: var(--secondary, #00a3e0); }

  /* ── Mobile stacking ── */
  @media (max-width: 768px) {
    .pcm-panel { border-radius: 20px; height: 100dvh; max-height: 100dvh; }
    .pcm-sticky-bar { padding: 0.5rem 1rem; }
    .pcm-row-header { display: none; }
    .pcm-row {
      grid-template-columns: 1fr;
      padding: 0.75rem 0;
    }
    .pcm-row .pcm-label { font-size: 0.75rem; margin-bottom: 0.3rem; }
    .pcm-vals-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }
    .pcm-val-box {
      background: rgba(0,54,102,0.04);
      border-radius: 10px;
      padding: 0.5rem 0.75rem;
    }
    .pcm-val-box .tag {
      font-size: 0.62rem;
      font-weight: 900;
      opacity: 0.6;
      display: block;
      margin-bottom: 2px;
      letter-spacing: 0.04em;
    }
    .pcm-val { font-size: 0.85rem; }
    .pcm-body { padding: 1rem; }
    .pcm-header { padding: 1rem 1.25rem !important; }
    .pcm-footer { padding: 1rem 1.25rem !important; }
  }
`;

function injectStyles() {
  if (document.getElementById('pcm-styles')) return;
  const el = document.createElement('style');
  el.id = 'pcm-styles';
  el.textContent = MODAL_STYLES;
  document.head.appendChild(el);
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const getPhaseSummary = (phases) =>
  (phases || []).map(p => `${p.phase_title || p.title} (${p.phase_duration_weeks || p.weeks}w)`).join(', ');

const getProductList = (products) =>
  (products || []).map(p => `${p.name} ${p.totalVials}v`).join(', ');

/* ─── Compare Row ───────────────────────────────────────────────────────────── */
function CompareRow({ label, valA, valB }) {
  const isDifferent = valA !== valB;
  return (
    <div className={`pcm-row${isDifferent ? ' diff' : ''}`}>
      <div className="pcm-label">{label}</div>

      {/* Desktop: two separate cells */}
      <div className="pcm-val pcm-desktop">{valA ?? '—'}</div>
      <div className={`pcm-val pcm-desktop${isDifferent ? ' revised' : ''}`}>{valB ?? '—'}</div>

      {/* Mobile: side-by-side boxes */}
      <div className="pcm-vals-wrapper pcm-mobile">
        <div className="pcm-val-box">
          <span className="tag">ORIGINAL</span>
          <div className="pcm-val">{valA ?? '—'}</div>
        </div>
        <div className={`pcm-val-box${isDifferent ? ' diff' : ''}`} style={isDifferent ? { background: 'rgba(0,163,224,0.08)' } : {}}>
          <span className="tag">REVISED</span>
          <div className={`pcm-val${isDifferent ? ' revised' : ''}`}>{valB ?? '—'}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
const ProtocolComparisonModal = ({ isOpen, onClose, versionA, versionB }) => {
  injectStyles();

  if (!isOpen || !versionA || !versionB) return null;

  const modal = (
    <div className="pcm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pcm-panel">

        {/* ── Main Header ─────────────────────────────────────── */}
        <div className="pcm-header" style={{ padding: '1.5rem 2.5rem', background: 'white', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--secondary, #00a3e0)', color: 'white', width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Divide size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary, #003666)', letterSpacing: '-0.02em' }}>Comparative Clinical Analysis</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Comparing <strong>v{versionA.version_number}</strong> vs <strong>v{versionB.version_number}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', padding: '0.6rem', borderRadius: 12, color: 'var(--text-main)', display: 'flex', flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable Body ─────────────────────────────────── */}
        <div className="pcm-body" style={{ flex: 1, overflowY: 'auto', padding: '0 2.5rem 2.5rem' }}>

          {/* Sticky Bar */}
          <div className="pcm-sticky-bar">
            <span>Protocol Comparison</span>
            <span className="pcm-sticky-badge" style={{ background: 'rgba(0,54,102,0.08)', color: 'var(--primary)' }}>v{versionA.version_number}</span>
            <span style={{ opacity: 0.4 }}>vs</span>
            <span className="pcm-sticky-badge" style={{ background: 'rgba(0,163,224,0.12)', color: 'var(--secondary)' }}>v{versionB.version_number}</span>
          </div>

          {/* Column Headers (desktop) */}
          <div className="pcm-row-header" style={{ paddingTop: '1.5rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Metric</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="pcm-sticky-badge" style={{ background: 'rgba(0,54,102,0.07)', color: 'var(--primary)' }}>ORIGINAL</span>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>Version {versionA.version_number}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="pcm-sticky-badge" style={{ background: 'rgba(0,163,224,0.12)', color: 'var(--secondary)' }}>REVISED</span>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>Version {versionB.version_number}</span>
            </div>
          </div>

          {/* Rows */}
          <CompareRow label="Protocol Title" valA={versionA.protocol_name} valB={versionB.protocol_name} />
          <CompareRow label="Clinical Focus" valA={versionA.therapeutic_category} valB={versionB.therapeutic_category} />
          <CompareRow label="Status" valA={versionA.status?.toUpperCase()} valB={versionB.status?.toUpperCase()} />

          <div style={{ margin: '2rem 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>Dosing &amp; Pathway Structure</h3>
          </div>

          <CompareRow label="Phases" valA={getPhaseSummary(versionA.phases)} valB={getPhaseSummary(versionB.phases)} />
          <CompareRow label="Products Required" valA={getProductList(versionA.products)} valB={getProductList(versionB.products)} />
          <CompareRow label="Protocol Duration" valA={`${versionA.cost_summary?.totalWeeks ?? '—'} Weeks`} valB={`${versionB.cost_summary?.totalWeeks ?? '—'} Weeks`} />

          <div style={{ margin: '2rem 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <TrendingUp size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>Economic Comparison</h3>
          </div>

          <CompareRow label="Total Protocol Cost" valA={`$${(versionA.cost_summary?.total ?? 0).toLocaleString()}`} valB={`$${(versionB.cost_summary?.total ?? 0).toLocaleString()}`} />
          <CompareRow label="Weekly Investment" valA={`$${(versionA.cost_summary?.weekly ?? 0).toLocaleString()}`} valB={`$${(versionB.cost_summary?.weekly ?? 0).toLocaleString()}`} />

          {/* Change Impact Summary */}
          <div style={{ marginTop: '2.5rem', padding: '1.5rem 2rem', background: 'rgba(0,163,224,0.05)', border: '1.5px solid rgba(0,163,224,0.15)', borderRadius: 24 }}>
            <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 900, color: 'var(--primary)', fontSize: '0.95rem' }}>
              <AlertCircle size={18} /> Change Impact Summary
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.9 }}>
              {versionB.cost_summary?.total > versionA.cost_summary?.total && (
                <li>Economic Impact: Total protocol investment increased by ${(versionB.cost_summary.total - versionA.cost_summary.total).toLocaleString()}.</li>
              )}
              {versionB.cost_summary?.total < versionA.cost_summary?.total && (
                <li>Economic Impact: Total protocol investment decreased by ${(versionA.cost_summary.total - versionB.cost_summary.total).toLocaleString()}.</li>
              )}
              {versionB.phases?.length !== versionA.phases?.length && (
                <li>Pathway Structure: Adjusted from {versionA.phases?.length} to {versionB.phases?.length} clinical phases.</li>
              )}
              {versionB.status !== versionA.status && (
                <li>Governance: Protocol moved from <em>{versionA.status}</em> to <em>{versionB.status}</em> state.</li>
              )}
              {versionB.cost_summary?.total === versionA.cost_summary?.total &&
               versionB.version_number > versionA.version_number && (
                <li>Modification Note: v{versionB.version_number} contains documentation or metadata updates without altering clinical economics.</li>
              )}
            </ul>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="pcm-footer" style={{ padding: '1.25rem 2.5rem', borderTop: '1px solid var(--border)', background: 'white', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.75rem 2rem', fontWeight: 800, borderRadius: 14 }}>
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default ProtocolComparisonModal;
