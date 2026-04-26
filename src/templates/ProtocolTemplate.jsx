import React, { useEffect, useState, useCallback, useRef, useMemo, memo, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  Droplets,
  DollarSign,
  FlaskConical,
  Layers,
  Package,
  ShieldCheck,
  ShoppingCart,
  Star,
  Syringe,
  Target,
  TrendingDown,
  Users,
  XCircle,
  Zap,
  Calendar,
  TestTube,
  CheckCircle2,
} from 'lucide-react';
import { getProtocolTemplate, getTemplatesByObjective, getTemplatesByGoalGroup } from '../repositories/protocolRepository';
import { trackEvent } from '../hooks/useAnalytics';
import { generateClinicalProtocol } from '../services/pdfService';

import ProtocolSupplyEngine from '../components/protocol/ProtocolSupplyEngine';
import InjectionDoseChart from '../components/protocol/InjectionDoseChart';
import ProtocolHeaderCharts from '../components/protocol/ProtocolHeaderCharts';
import RelatedProtocolsSection from '../components/protocol/RelatedProtocolsSection';

import protocolIndex from '../data/protocol_search_index.json';

// ── Related-card theme (mirrors TrendingProtocols) ────────────────────────────
const RELATED_THEME = {
  'Weight Management / Obesity': { gradient: 'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)', glow: 'rgba(139,92,246,0.18)', accent: '#a78bfa', Icon: TrendingDown },
  'Recovery / Injury':           { gradient: 'linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)', glow: 'rgba(244,63,94,0.18)',  accent: '#fb7185',  Icon: Activity   },
  'Cognitive Support':           { gradient: 'linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%)', glow: 'rgba(14,165,233,0.18)', accent: '#38bdf8',  Icon: Target     },
  'Longevity':                   { gradient: 'linear-gradient(135deg,#10b981 0%,#0ea5e9 100%)', glow: 'rgba(16,185,129,0.18)', accent: '#34d399',  Icon: Activity   },
  'Sleep Support':               { gradient: 'linear-gradient(135deg,#3b82f6 0%,#8b5cf6 100%)', glow: 'rgba(59,130,246,0.18)', accent: '#93c5fd',  Icon: Clock      },
  'Hormonal Support':            { gradient: 'linear-gradient(135deg,#f97316 0%,#eab308 100%)', glow: 'rgba(249,115,22,0.18)', accent: '#fb923c',  Icon: Zap        },
  'Immune / Inflammation':       { gradient: 'linear-gradient(135deg,#14b8a6 0%,#06b6d4 100%)', glow: 'rgba(20,184,166,0.18)', accent: '#2dd4bf',  Icon: ShieldCheck },
  'Energy / Mitochondrial':      { gradient: 'linear-gradient(135deg,#eab308 0%,#f97316 100%)', glow: 'rgba(234,179,8,0.18)',  accent: '#fde047',  Icon: Zap        },
  'Skin / Anti-Aging':           { gradient: 'linear-gradient(135deg,#f472b6 0%,#ec4899 100%)', glow: 'rgba(244,114,182,0.18)',accent: '#f9a8d4',  Icon: Star       },
};
function getRelatedTheme(category) {
  return RELATED_THEME[category] || {
    gradient: 'linear-gradient(135deg,#003666 0%,#0070c0 100%)',
    glow: 'rgba(0,112,192,0.18)', accent: '#60a5fa', Icon: FlaskConical,
  };
}

// ── Goal → visual config ─────────────────────────────────────────────────────
const GOAL_META = {
  weight_management:  { label: 'Weight Management', gradient: 'linear-gradient(135deg,#10b981,#0d9488)', icon: TrendingDown },
  longevity:          { label: 'Anti-Aging & Longevity', gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', icon: Activity },
  recovery:           { label: 'Recovery',           gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: Zap },
  performance:        { label: 'Performance',        gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', icon: Target },
  default:            { label: 'Clinical Protocol',  gradient: 'linear-gradient(135deg,#64748b,#475569)', icon: FlaskConical },
};
function getGoalMeta(goal) {
  return GOAL_META[goal] || GOAL_META.default;
}

/**
 * Maps a Firestore primary_goal string to a list of sibling goal strings that
 * should be treated as the same navigator category.
 * Add new aliases here whenever a new goal string is introduced in Firestore.
 */
const GOAL_GROUPS = {
  // Anti-Aging super-category includes all longevity + skin/anti-aging goals
  'Longevity':                            ['Longevity', 'Skin / Anti-Aging', 'Anti-Aging & Longevity', 'Weight Management / Metabolic Longevity'],
  'Skin / Anti-Aging':                   ['Longevity', 'Skin / Anti-Aging', 'Anti-Aging & Longevity', 'Weight Management / Metabolic Longevity'],
  'Anti-Aging & Longevity':              ['Longevity', 'Skin / Anti-Aging', 'Anti-Aging & Longevity', 'Weight Management / Metabolic Longevity'],
  'Weight Management / Metabolic Longevity': ['Longevity', 'Skin / Anti-Aging', 'Anti-Aging & Longevity', 'Weight Management / Metabolic Longevity'],
  // Each other goal is its own group — exact match only
  'Weight Management / Obesity':         ['Weight Management / Obesity'],
  'Metabolic Health':                    ['Metabolic Health'],
  'Recovery / Injury':                   ['Recovery / Injury'],
  'Cognitive Support':                   ['Cognitive Support'],
  'Sleep Support':                        ['Sleep Support'],
  'Hormonal Support':                    ['Hormonal Support'],
  'Immune / Inflammation':               ['Immune / Inflammation'],
  'Energy / Mitochondrial':              ['Energy / Mitochondrial'],
};
/** Returns the sibling goal strings for a given primaryGoal. Falls back to [primaryGoal]. */
function getSiblingGoals(primaryGoal) {
  return GOAL_GROUPS[primaryGoal] || [primaryGoal];
}

// ── Category Protocol Navigator ───────────────────────────────────────────────
/**
 * Compact horizontal navigator that lets users move between sibling protocols
 * in the same category without returning to the listing page.
 * Renders nothing when there is only one protocol in the category.
 */
const CategoryProtocolNavigator = memo(function CategoryProtocolNavigator({
  currentSlug,
  primaryGoal,
  goalLabel,
  goalGradient,
}) {
  const navigate = useNavigate();
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!primaryGoal) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    const siblingGoals = getSiblingGoals(primaryGoal);
    const fetchFn = siblingGoals.length > 1
      ? getTemplatesByGoalGroup(siblingGoals)
      : getTemplatesByObjective(primaryGoal);
    fetchFn
      .then((list) => {
        if (!active) return;
        // Sort: category_order → protocol_id → title
        const sorted = [...list].sort((a, b) => {
          const oa = a.category_order ?? a.order ?? 999;
          const ob = b.category_order ?? b.order ?? 999;
          if (oa !== ob) return oa - ob;
          const ida = a.protocol_id || a.id || '';
          const idb = b.protocol_id || b.id || '';
          if (ida !== idb) return ida.localeCompare(idb);
          const ta = a.protocol_title || a.name || '';
          const tb = b.protocol_title || b.name || '';
          return ta.localeCompare(tb);
        });
        setSiblings(sorted);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [primaryGoal]);

  if (loading || siblings.length <= 1) return null;

  const currentIdx = siblings.findIndex(
    (p) => (p.protocol_id || p.id || p.protocol_slug) === currentSlug
  );
  const idx = currentIdx === -1 ? 0 : currentIdx;
  const total = siblings.length;
  const prevIdx = (idx - 1 + total) % total;
  const nextIdx = (idx + 1) % total;
  const prevItem = siblings[prevIdx];
  const nextItem = siblings[nextIdx];

  const getSlug = (p) => p.protocol_id || p.id || p.protocol_slug;
  const getTitle = (p) => p.protocol_title || p.name || p.protocol_name || getSlug(p);

  const goTo = (p) => navigate(`/protocols/${getSlug(p)}`);

  const navBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '0.45rem 0.85rem',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1,
    transition: 'background 0.18s, border-color 0.18s',
    whiteSpace: 'nowrap',
    backdropFilter: 'blur(8px)',
    maxWidth: 180,
  };

  return (
    <>
      {/* ── Desktop navigator bar ── */}
      <div
        aria-label={`${goalLabel} protocol navigator`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginTop: '0.9rem',
          marginBottom: '1.2rem',
          padding: '0.55rem 0.85rem',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(10px)',
        }}
        className="cat-nav-desktop"
      >
        {/* Prev */}
        <button
          onClick={() => goTo(prevItem)}
          style={navBtnStyle}
          aria-label={`Previous protocol: ${getTitle(prevItem)}`}
          title={getTitle(prevItem)}
        >
          <ChevronLeft size={14} strokeWidth={2.5} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {getTitle(prevItem)}
          </span>
        </button>

        {/* Centre: category + position */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0.2rem', flexShrink: 0,
        }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {goalLabel}
          </span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)',
          }}>
            {idx + 1} <span style={{ color: 'rgba(255,255,255,0.35)' }}>of</span> {total}
          </span>
        </div>

        {/* Next */}
        <button
          onClick={() => goTo(nextItem)}
          style={navBtnStyle}
          aria-label={`Next protocol: ${getTitle(nextItem)}`}
          title={getTitle(nextItem)}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {getTitle(nextItem)}
          </span>
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* ── Mobile sticky nav bar ── */}
      <div
        className="cat-nav-mobile"
        aria-label={`${goalLabel} protocol navigator`}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 1100,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          background: 'rgba(8,13,24,0.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          gap: '0.5rem',
        }}
      >
        <button
          onClick={() => goTo(prevItem)}
          aria-label={`Previous: ${getTitle(prevItem)}`}
          style={{ ...navBtnStyle, padding: '0.4rem 0.7rem', maxWidth: 'none' }}
        >
          <ChevronLeft size={13} />
          <span>Prev</span>
        </button>
        <span style={{
          fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
          flexShrink: 0,
        }}>
          {idx + 1} / {total}
        </span>
        <button
          onClick={() => goTo(nextItem)}
          aria-label={`Next: ${getTitle(nextItem)}`}
          style={{ ...navBtnStyle, padding: '0.4rem 0.7rem', maxWidth: 'none' }}
        >
          <span>Next</span>
          <ChevronRight size={13} />
        </button>
      </div>
    </>
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v) => (v !== undefined && v !== null ? v : '—');

function humanize(str) {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function displayDuration(protocol) {
  if (protocol.duration_weeks) return `${protocol.duration_weeks} weeks`;
  if (protocol.timeline?.total_duration_weeks)
    return `${protocol.timeline.total_duration_weeks} weeks`;
  const phases = protocol.phases || [];
  if (phases.length) {
    const total = phases.reduce((s, ph) => s + (ph.duration_weeks || 0), 0);
    if (total) return `${total} weeks`;
  }
  return 'Multi-phase';
}

function displayPhases(protocol) {
  if (Array.isArray(protocol.phases) && protocol.phases.length) return protocol.phases;
  return [];
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Collapsible Optional Accessories sidebar card
const OPTIONAL_ACCESSORIES = [
  { id: 'bac_water_10ml',  label: 'Bacteriostatic Water 10 mL', detail: '1 vial per compound reconstituted', Icon: Droplets,  color: '#0369a1' },
  { id: 'insulin_syringe', label: 'Insulin Syringes 1 mL (x10)',detail: '29–31 gauge, ½" needle recommended', Icon: Syringe,   color: '#7c3aed' },
  { id: 'alcohol_pads',    label: 'Alcohol Prep Pads (x50)',    detail: '70% isopropyl, sterile',            Icon: Package,   color: '#047857' },
];

const OptionalAccessoriesCard = memo(function OptionalAccessoriesCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="proto-sidebar-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header / toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          color: '#334155',
        }}
        aria-expanded={open}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.82rem' }}>
          <Syringe size={15} style={{ color: '#7c3aed' }} />
          Optional Accessories
        </span>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          fontSize: '0.68rem', fontWeight: 600, color: '#94a3b8',
        }}>
          {open ? 'Hide' : 'Show'} {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </span>
      </button>

      {/* Collapsible body */}
      {open && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.6rem 1rem 0.9rem' }}>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.7rem', lineHeight: 1.5 }}>
            Recommended consumables for subcutaneous administration and reconstitution.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {OPTIONAL_ACCESSORIES.map(({ id, label, detail, Icon, color }) => (
              <div key={id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                borderRadius: 8, background: `${color}08`,
                border: `1px solid ${color}22`,
                padding: '0.55rem 0.7rem',
              }}>
                <Icon size={15} style={{ color, flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a' }}>{label}</div>
                  <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '0.1rem' }}>{detail}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: '0.63rem', color: '#94a3b8', marginTop: '0.75rem', lineHeight: 1.4,
            borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem',
          }}>
            These items are included in the full bundle calculator above.
          </p>
        </div>
      )}
    </div>
  );
});

// Memoized per-phase card — Clinical Luxury "Technical Data Sheet" format
const PhaseAccordion = memo(function PhaseAccordion({ phase, index, weekRange, clinicalGoal }) {
  const [open, setOpen] = useState(index === 0);
  const [showDetails, setShowDetails] = useState(false);
  const drugs = phase.drugs || phase.compounds || phase.medications || [];
  const hasDetails = phase.monitoring || phase.notes;
  const phaseName = phase.name || phase.phase_name || `Phase ${index + 1}`;
  const goal = clinicalGoal || phase.objective || '';

  return (
    <div className={`proto-phase ${open ? 'proto-phase--open' : ''}`}>
      <button className="proto-phase__header" onClick={() => setOpen((o) => !o)}>
        <div className="proto-phase__title-row">
          <span className="proto-phase__num">{String(index + 1).padStart(2, '0')}</span>
          <div className="proto-phase__title-group">
            <span className="proto-phase__name">{phaseName}</span>
            {/* Week range — always visible */}
            {weekRange && (
              <span style={{
                fontSize: '0.72rem', fontWeight: 600,
                color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem',
                marginTop: '0.15rem',
              }}>
                <Calendar size={11} strokeWidth={2} />
                {weekRange}
              </span>
            )}
            {/* Clinical goal — shown collapsed only */}
            {goal && !open && (
              <span className="proto-phase__subtitle-preview">
                {goal.slice(0, 70)}{goal.length > 70 ? '…' : ''}
              </span>
            )}
          </div>
          {phase.duration_weeks && (
            <span className="proto-phase__dur">
              <Clock size={11} />
              {phase.duration_weeks}w
            </span>
          )}
        </div>
        <div className="proto-phase__header-right">
          {drugs.length > 0 && (
            <span className="proto-phase__compound-count">{drugs.length} compd.</span>
          )}
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {open && (
        <div className="proto-phase__body">
          {phase.objective && (
            <p className="proto-phase__objective">{phase.objective}</p>
          )}

          {/* COMPOUNDS TABLE — Technical Data Sheet format */}
          {drugs.length > 0 && (
            <div className="proto-phase__drugs">
              <div className="proto-phase__drugs-title">
                <FlaskConical size={12} />
                <span>Compound Registry</span>
                <span className="proto-phase__drugs-count">{drugs.length}</span>
              </div>
              <div className="proto-compound-table">
                <div className="proto-compound-table__head">
                  <span>Compound</span>
                  <span>Dose</span>
                  <span>Frequency</span>
                  <span>Route</span>
                </div>
                {drugs.map((d, i) => (
                  <div key={i} className="proto-compound-table__row">
                    <span className="proto-compound-table__name">
                      {d.name || d.product_name || d.compound || d.product_slug || '—'}
                    </span>
                    <span className="proto-compound-table__dose" style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: '0.8rem', fontWeight: 600 }}>
                      {d.dose_logic?.starting_weekly_dose != null
                        ? `${d.dose_logic.starting_weekly_dose}${d.dose_logic.dose_unit || ''}`
                        : d.dose_logic?.dose_per_administration != null
                          ? `${d.dose_logic.dose_per_administration}${d.dose_logic.dose_unit || ''}`
                          : d.weekly_dose || d.dose || '—'}
                    </span>
                    <span className="proto-compound-table__freq">
                      {d.dose_logic?.administration_frequency
                        ? d.dose_logic.administration_frequency.replace(/_/g, ' ')
                        : (d.frequency || d.frequency_of_use || d.administration_schedule || '—')}
                    </span>
                    <span className="proto-compound-table__route">
                      {d.dose_logic?.route_of_administration || d.route || d.administration_route || d.route_of_administration || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROGRESSIVE DISCLOSURE — Monitoring + Notes */}
          {hasDetails && (
            <button
              onClick={() => setShowDetails(v => !v)}
              className="proto-phase__details-toggle"
            >
              {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showDetails ? 'Collapse Details' : 'View Clinical Details'}
            </button>
          )}

          {showDetails && (
            <div className="proto-phase__details-panel">
              {phase.monitoring && (
                <div className="proto-phase__detail-block">
                  <div className="proto-phase__detail-label">
                    <Activity size={11} /> Monitoring Protocol
                  </div>
                  <p className="proto-phase__monitoring-text">{phase.monitoring}</p>
                </div>
              )}
              {phase.notes && (
                <div className="proto-phase__detail-block">
                  <div className="proto-phase__detail-label">
                    <BookOpen size={11} /> Clinical Notes
                  </div>
                  <p className="proto-phase__notes">{phase.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

function EligibilityBlock({ eligibility }) {
  if (!eligibility) return null;
  const include = eligibility.inclusion_criteria || eligibility.include || [];
  const exclude = eligibility.exclusion_criteria || eligibility.exclude || [];

  if (!include.length && !exclude.length) return null;

  return (
    <div className="proto-eligibility">
      {include.length > 0 && (
        <div className="proto-eligibility__col">
          <h4><ShieldCheck size={15} color="#4ade80" /> Inclusion Criteria</h4>
          <div className="proto-criteria-list">
            {include.map((c, i) => (
              <span key={i} className="proto-badge proto-badge--include">
                <CheckCircle2 size={11} /> {fmt(c)}
              </span>
            ))}
          </div>
        </div>
      )}
      {exclude.length > 0 && (
        <div className="proto-eligibility__col proto-eligibility__col--exclude">
          <h4><XCircle size={15} color="#f87171" /> Exclusion Criteria</h4>
          <div className="proto-criteria-list">
            {exclude.map((c, i) => (
              <span key={i} className="proto-badge proto-badge--exclude">
                <AlertCircle size={11} /> {fmt(c)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section Accordion (lazy-render + localStorage persistence) ────────────────
const ACCORDION_STORAGE_KEY = 'proto_open_accordion';

function SectionAccordion({ id, title, icon: Icon, defaultOpen = false, children, accentColor = '#003666' }) {
  // Always start closed on page load — intentionally ignore any stored state
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false); // lazy: only render once opened

  const toggle = useCallback(() => {
    setOpen(prev => {
      const next = !prev;
      if (next) setRendered(true); // ensure content is rendered when opening
      return next;
    });
  }, []);

  return (
    <div
      className="proto-accordion"
      style={{
        borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.07)',
        background: '#fff',
        overflow: 'hidden',
        marginBottom: '1rem',
        boxShadow: open ? '0 4px 24px rgba(0,0,0,0.07)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {/* Header */}
      <button
        onClick={toggle}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.1rem 1.35rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          borderBottom: open ? '1px solid rgba(0,0,0,0.06)' : 'none',
          transition: 'border-color 0.15s',
        }}
      >
        <span style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: `${accentColor}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={accentColor} strokeWidth={2.2} />
        </span>
        <span style={{
          flex: 1,
          fontSize: '1rem',
          fontWeight: 700,
          color: '#0f172a',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
        }}>
          {title}
        </span>
        <span style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: open ? accentColor : 'rgba(0,0,0,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}>
          {open
            ? <ChevronUp size={13} color="#fff" strokeWidth={2.5} />
            : <ChevronDown size={13} color="#475569" strokeWidth={2.5} />
          }
        </span>
      </button>

      {/* Body — lazy-rendered */}
      {rendered && (
        <div
          style={{
            padding: open ? '1.35rem' : '0 1.35rem',
            maxHeight: open ? '9999px' : 0,
            overflow: 'hidden',
            opacity: open ? 1 : 0,
            transition: 'opacity 0.2s ease, padding 0.2s ease',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function ProtocolSkeleton() {
  return (
    <div className="proto-detail-skeleton">
      <div className="proto-detail-skeleton__hero" />
      <div className="proto-detail-skeleton__body">
        {[1, 2, 3].map((i) => (
          <div key={i} className="proto-detail-skeleton__block" />
        ))}
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ProtocolNotFound({ slug }) {
  const navigate = useNavigate();
  return (
    <div className="proto-detail-notfound">
      <AlertCircle size={48} color="#f87171" />
      <h2>Protocol Not Found</h2>
      <p>
        No protocol was found for <code>{slug}</code>. It may have been archived
        or the link is incorrect.
      </p>
      <button className="proto-back-btn" onClick={() => navigate('/protocols')}>
        Browse All Protocols
      </button>
    </div>
  );
}

// ── Included Peptide Card ─────────────────────────────────────────────────────
function IncludedPeptideCard({ peptide, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const color = peptide.color || '#00A3E0';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1.5px solid ${hovered ? `${color}55` : 'rgba(255,255,255,0.10)'}`,
        borderRadius: '14px',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 10px 28px rgba(0,0,0,0.30), 0 0 0 1px ${color}30` : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
      }}
    >
      {/* Accent dot + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: color, flexShrink: 0, marginTop: '5px',
          boxShadow: `0 0 8px ${color}80`,
        }} />
        <span style={{
          fontSize: '0.95rem', fontWeight: 700, color: '#fff',
          lineHeight: 1.3, letterSpacing: '-0.01em',
        }}>
          {peptide.name}
        </span>
      </div>

      {/* Role / category */}
      {peptide.role && (
        <p style={{
          fontSize: '0.78rem', color: `${color}CC`, margin: 0,
          fontWeight: 600, lineHeight: 1.4,
        }}>
          {peptide.role}
        </p>
      )}

      {/* Description (truncated) */}
      {peptide.description && (
        <p style={{
          fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)',
          margin: 0, lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {peptide.description}
        </p>
      )}

      {/* Dosage chip (if available) */}
      {peptide.dosage && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: `${color}18`, border: `1px solid ${color}35`,
          borderRadius: '999px', padding: '0.18rem 0.6rem',
          fontSize: '0.72rem', fontWeight: 600, color,
          width: 'fit-content', marginTop: '0.15rem',
        }}>
          {peptide.dosage}{peptide.frequency ? ` · ${peptide.frequency}` : ''}
        </span>
      )}
    </div>
  );
}

// ── Main template ─────────────────────────────────────────────────────────────
export default function ProtocolTemplate({
  region,
  isProfessional,
  cart,
  updateCart,
  setRegion,
  products,
  allFaqs,
}) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const phaseRefs = useRef([]);
  const [scrolled, setScrolled] = useState(false);
  const [stickyTotal, setStickyTotal] = useState(0);
  const [bundleAdded, setBundleAdded] = useState(false);
  const [dosingView, setDosingView] = useState('table'); // 'table' | 'visual'

  // ── Protocol data state — declared early so callbacks below can reference it safely
  const [protocol, setProtocol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ── Chart capture for PDF export ─────────────────────────────────────────
  const protocolChartRef = useRef(null);
  const handleChartRef = useCallback((ref) => { protocolChartRef.current = ref; }, []);

  /**
   * Rasterizes the SVG inside protocolChartRef into a PNG data URL.
   * Uses a 2× scale for retina-quality output inside the PDF.
   */
  const captureChartDataUrl = useCallback(() => new Promise((resolve) => {
    const container = protocolChartRef.current?.current ?? protocolChartRef.current;
    const svgEl = container?.querySelector('svg');
    if (!svgEl) return resolve(null);
    try {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob    = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url     = URL.createObjectURL(blob);
      const img     = new Image();
      img.onload = () => {
        const scale  = 2;
        const canvas = document.createElement('canvas');
        canvas.width  = img.naturalWidth  * scale || 800 * scale;
        canvas.height = img.naturalHeight * scale || 200 * scale;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#080d18';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
        URL.revokeObjectURL(url);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    } catch (e) {
      console.warn('[ProtocolTemplate] captureChartDataUrl failed', e);
      resolve(null);
    }
  }), []);

  /**
   * Full clinical PDF export — captures the chart, then calls pdfService.
   */
  const handleExportPdf = useCallback(async (location = 'unknown') => {
    trackEvent('download_pdf', {
      protocol_slug: slug,
      protocol_name: protocol?.name || slug,
      location,
    });
    const chartDataUrl = await captureChartDataUrl();
    await generateClinicalProtocol(protocol, {}, chartDataUrl);
  }, [slug, protocol, captureChartDataUrl]);

  // ── Sticky header collapse on scroll ─────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToPhase = (i) => {
    phaseRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // (protocol/loading/notFound state moved above — see early declaration)

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setNotFound(false);

    getProtocolTemplate(slug)
      .then((data) => {
        if (!active) return;
        if (data) {
          setProtocol(data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [slug]);

  // ── Dynamic SEO: title + meta description + JSON-LD ────────────────────────
  useEffect(() => {
    if (!protocol) return;

    // Priority: metadata.scientificName > protocol_title > protocol_name > name > compound-based fallback
    const sciName  = protocol.metadata?.scientificName;
    const isRawId  = (s = '') => /^(rec_|prot_|id_|[a-z]{2,4}_\d{3,})/i.test(String(s).trim());

    // Best available human title from the Firestore document
    const firestoreTitle = protocol.protocol_title || protocol.metadata?.title || '';
    const rawName        = protocol.name || protocol.protocol_name || '';
    const resolvedName   = firestoreTitle || (isRawId(rawName) ? '' : rawName);

    // Ultimate fallback: build from compound names
    const compoundNames = (protocol.phase_blueprints || [])
      .flatMap(ph => ph.drugs || ph.compounds || ph.drugs_used || [])
      .map(d => d.product_title || d.name || d.product_slug)
      .filter(Boolean);
    const uniqueNames   = [...new Set(compoundNames)];
    const compoundTitle = uniqueNames.length
      ? uniqueNames.slice(0, 3).join(' + ') + ' Protocol'
      : humanize(slug);

    const name         = resolvedName || compoundTitle;
    const primaryTitle = sciName || name;

    // Build a rich, informative description for SEO
    const durationWks = protocol.protocol_duration_weeks
      || protocol.duration_weeks
      || protocol.timeline?.total_duration_weeks
      || (protocol.phase_blueprints || []).reduce((s, ph) => s + (ph.duration_weeks || ph.default_duration_weeks || 0), 0)
      || null;
    const allDrugs    = (protocol.phase_blueprints || protocol.phases || [])
      .flatMap(ph => ph.drugs || ph.compounds || ph.drugs_used || [])
      .map(d => d.product_title || d.name || d.product_slug)
      .filter(Boolean);
    const uniqueCompounds = [...new Set(allDrugs)];
    const goalLabel   = humanize(protocol.primary_goal || protocol.metadata?.primary_goal || protocol.category || '');
    const descParts   = [
      durationWks ? `${durationWks}-week ${goalLabel} protocol` : `${goalLabel} protocol`,
      uniqueCompounds.length ? `featuring ${uniqueCompounds.slice(0, 3).join(', ')}` : null,
      'Evidence-based clinical research protocol.',
    ].filter(Boolean);
    const desc =
      protocol.metadata?.description ||
      protocol.overview_summary ||
      protocol.tagline ||
      protocol.summary ||
      descParts.join(' — ');

    document.title = `${primaryTitle} | ReGen PEPT Protocol Library`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = desc.slice(0, 160);

    // ── JSON-LD: MedicalGuideline structured data ────────────────────────────
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'MedicalGuideline',
      name: primaryTitle,
      alternateName: sciName ? name : undefined,
      description: desc,
      url: window.location.href,
      guidelineSubject: {
        '@type': 'MedicalCondition',
        name: humanize(protocol.metadata?.primary_goal || slug),
      },
      evidenceLevel: protocol.evidence_level || 'Level III',
      guidelineDate: protocol.updated_at
        ? new Date(protocol.updated_at.seconds
            ? protocol.updated_at.seconds * 1000
            : protocol.updated_at).toISOString().split('T')[0]
        : undefined,
      publisher: {
        '@type': 'Organization',
        name: 'ReGen PEPT',
        url: 'https://www.regenpept.com',
      },
    };
    // Remove undefined keys
    Object.keys(jsonLd).forEach(k => jsonLd[k] === undefined && delete jsonLd[k]);

    let scriptEl = document.getElementById('protocol-jsonld');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'protocol-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);

    return () => {
      document.title = 'ReGen PEPT | Premium Research Peptides';
      document.getElementById('protocol-jsonld')?.remove();
    };
  }, [protocol, slug]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  // ── Phase 7: Precomputed protocol metadata ─────────────────────────────────
  // Must stay BEFORE render guards to comply with Rules of Hooks.
  // Uses optional chaining so it's safe when protocol is null (returns empty/zero values).
  const precomputed = useMemo(() => {
    const blueprints = protocol?.phase_blueprints || protocol?.phases || [];
    let totalMg = 0;
    const compoundSet = new Set();
    let totalWeeks = 0;

    blueprints.forEach(ph => {
      const dur = ph.default_duration_weeks || ph.duration_weeks || 4;
      totalWeeks += dur;
      const drugs = ph.drugs || ph.compounds || ph.medications || ph.drugs_used || [];
      drugs.forEach(d => {
        const logic = d.dose_logic || {};
        const start = parseFloat(logic.starting_dose || logic.starting_weekly_dose || 0);
        const end   = parseFloat(logic.peak_dose || logic.max_dose || logic.maintenance_dose || start);
        totalMg += ((start + end) / 2) * dur;
        const cname = d.product_title || d.name || d.compound || d.product_slug;
        if (cname) compoundSet.add(cname.toLowerCase());
      });
    });

    return {
      totalMg:       +totalMg.toFixed(1),
      totalWeeks,
      compoundList:  [...compoundSet],
      phaseCount:    blueprints.length,
      primaryGoalKey: protocol?.metadata?.primary_goal
                      || protocol?.primary_goal
                      || protocol?.category
                      || '',
    };
  }, [protocol?.id]);

  // ── Unified phase source (handles both schema variants) ────────────────────
  // `phase_blueprints` is the v2 schema used by wm_001; `phases` is the legacy
  // schema used by wm_003. We normalise both into `activeBlueprintPhases` so
  // every downstream section (Weekly Dosing, Vial Requirements, Reconstitution,
  // Treatment Flow) works regardless of which field the Firestore doc uses.
  // NOTE: useMemo MUST remain above render guards to comply with Rules of Hooks.
  const activeBlueprintPhases = useMemo(() => {
    const phaseBlueprintsArr = Array.isArray(protocol?.phase_blueprints) ? protocol.phase_blueprints : [];
    if (phaseBlueprintsArr.length > 0) return phaseBlueprintsArr;

    // Map legacy `phases` array to the canonical phase_blueprints shape
    const phasesArr = Array.isArray(protocol?.phases) ? protocol.phases : [];
    return phasesArr.map((ph) => ({
      phase_title:            ph.name || ph.phase_name || '',
      default_duration_weeks: ph.duration_weeks || 4,
      clinical_goal:          ph.objective || '',
      clinical_purpose:       ph.objective ? [ph.objective] : [],
      clinical_events:        [],
      drugs: (ph.drugs || ph.compounds || ph.medications || []).map((d) => ({
        product_title:  d.name || d.product_name || d.compound || '',
        route:          d.dose_logic?.route_of_administration || d.route || 'subcutaneous',
        vial_strength:  d.vial_strength || d.dose_logic?.vial_strength || null,
        reconstitution: d.reconstitution || null,
        dose_logic: {
          starting_weekly_dose:     d.dose_logic?.starting_weekly_dose     ?? null,
          dose_per_administration:  d.dose_logic?.dose_per_administration  ?? null,
          dose_unit:                d.dose_logic?.dose_unit                || '',
          administration_frequency: d.dose_logic?.administration_frequency || d.frequency || '',
          route_of_administration:  d.dose_logic?.route_of_administration  || d.route    || 'subcutaneous',
          vials_required:           d.dose_logic?.vials_required            ?? null,
          administrations_per_week: d.dose_logic?.administrations_per_week  ?? null,
          vial_strength:            d.dose_logic?.vial_strength             || null,
          reconstitution_water_ml:  d.dose_logic?.reconstitution_water_ml   ?? null,
          final_concentration:      d.dose_logic?.final_concentration       ?? null,
        },
      })),
    }));
  }, [protocol?.id, protocol?.phase_blueprints, protocol?.phases]);

  // ── Render guards ──────────────────────────────────────────────────────────
  if (loading) return <ProtocolSkeleton />;
  if (notFound || !protocol) return <ProtocolNotFound slug={slug} />;

  // ── Derived values from actual DB document ─────────────────────────────────
  // Never show raw ID-like strings (e.g. "wm_001", "prot_003") as the visible name.
  // Priority: protocol_title → metadata.display_name → abbreviatedName → humanized slug.
  const _isRawId = (s = '') => /^[a-z]{1,5}[_-]\d{2,}/i.test(String(s).trim());
  const _rawName = protocol.protocol_name || protocol.name || '';
  const name = protocol.protocol_title
    || protocol.metadata?.display_name
    || protocol.metadata?.abbreviatedName
    || (_isRawId(_rawName) ? '' : _rawName)
    || humanize(slug);
  const tagline        = protocol.tagline || protocol.summary || protocol.description
    || protocol.metadata?.description || '';
  const primaryGoal    = protocol.metadata?.primary_goal || 'weight_management';
  const duration       = displayDuration(protocol);
  const intensity      = protocol.intensity || protocol.metadata?.intensity || 'Moderate';
  const phases         = displayPhases(protocol);
  const eligibility    = protocol.eligibility || protocol.eligibility_criteria || null;
  const contraindications = protocol.contraindications || [];
  const references     = protocol.references || protocol.literature || [];
  const targetPatient  = protocol.target_patient || protocol.patient_profile || '';
  const keyOutcomes    = protocol.key_outcomes || protocol.outcomes || [];
  const safetyNotes    = protocol.safety_notes || protocol.safety || '';

  // ── Scientific naming system ─────────────────────────────────────────────────
  const scientificName  = protocol.metadata?.scientificName || null;
  const shortCode       = protocol.metadata?.shortCode || null; // never fall back to protocol_id
  const version         = protocol.metadata?.version || protocol.protocol_version || null;
  const abbreviatedName = protocol.metadata?.abbreviatedName || null;

  // ── H1 display title: ALWAYS use scientificName — never an ID ────────────────
  // If scientificName is missing, warn clearly in the console so it can be fixed.
  if (!scientificName) {
    console.warn(
      `[ProtocolTemplate] ⚠️  metadata.scientificName is missing for protocol "${slug}".\n` +
      `  protocol.metadata =`, protocol.metadata, `\n` +
      `  Falling back to: "${name}"\n` +
      `  → Fix: add metadata.scientificName to the Firestore document "protocol_templates/${slug}".`
    );
  }
  const displayTitle = scientificName || name;

  // ── Derived economics ─────────────────────────────────────────────────────
  const economics = protocol.economics || {};
  const totalCost = economics.estimated_total_cost;
  const weeklyCost = economics.estimated_weekly_cost;
  const currency = economics.currency || 'USD';
  const goalMeta = getGoalMeta(primaryGoal);
  const GoalIcon = goalMeta.icon;

  // ── Status badge meta ──────────────────────────────────────────────────
  const status = protocol.status || protocol.regulatory_status || null;
  const statusColor = {
    approved: '#10b981',
    investigational: '#f59e0b',
    experimental: '#ef4444',
    ruo: '#64748b',
  }[status?.toLowerCase()] || '#64748b';

  return (
    <div className="proto-detail">

      {/* ── Sticky Scroll Header ─────────────────────────────────────── */}
      <div className={`proto-sticky-header${scrolled ? ' proto-sticky-header--visible' : ''}`}>
        <div className="container proto-sticky-header__inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: goalMeta.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <GoalIcon size={14} color="white" />
            </div>
            {shortCode && (
              <span style={{
                fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.07em',
                fontWeight: 700, color: '#64748b', flexShrink: 0,
              }}>
                {shortCode}
              </span>
            )}
            <span className="proto-sticky-header__name">{displayTitle}</span>
{/* status badge removed from sticky header */}
          </div>
          <button
            className="proto-sticky-header__pdf"
            onClick={() => handleExportPdf('sticky_header')}
          >
            <Download size={14} /> PDF
          </button>
        </div>
      </div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="proto-detail__hero">
        <div className="container">

          {/* ── Category Protocol Navigator ─────────────────────────── */}
          <CategoryProtocolNavigator
            currentSlug={slug}
            primaryGoal={primaryGoal}
            goalLabel={goalMeta.label}
            goalGradient={goalMeta.gradient}
          />

          {/* Icon + identity row */}
          <div className="proto-hero-identity">
            <div style={{
              width: 72, height: 72, borderRadius: 20, flexShrink: 0,
              background: goalMeta.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
            }}>
              <GoalIcon size={34} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              {/* ── Line 1: Clinical Category — uppercase, small, muted ── */}
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)',
                marginBottom: '0.45rem',
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              }}>
                {goalMeta.label}
              </div>

              {/* ── Line 2: Primary Strategy — h1, largest, bold ── */}
              <h1 className="proto-detail__hero-title" style={{
                margin: '0 0 0.3rem',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
              }}>
                {displayTitle}
              </h1>

              {/* ── Version chip only — subtitle, status badge removed ── */}
              {version && (
                <div style={{ marginTop: '0.3rem' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    letterSpacing: '0.06em',
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.12)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 5,
                    backdropFilter: 'blur(4px)',
                    color: 'rgba(255,255,255,0.8)',
                  }}>
                    Version {version}
                  </span>
                </div>
              )}
            </div>
          </div>

          {tagline && (
            <p className="proto-detail__hero-tagline">{tagline}</p>
          )}

          {/* Quick-stat pills — Duration, Phases, and Est. Total removed */}
          <div className="proto-detail__stats">
            <div className="proto-stat">
              <Zap size={14} />
              <span className="proto-stat__val">{intensity}</span>
              <span className="proto-stat__label">Intensity</span>
            </div>
          </div>

          {/* ── Protocol Visualization Charts ─────────────────────────── */}
          <ProtocolHeaderCharts protocol={protocol} onChartRef={handleChartRef} />

        </div>
      </div>



      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="proto-detail__body">
        <div className="container proto-detail__layout">
          {/* Left / main column — 8 cols */}
          <div className="proto-detail__main">

            {/* ── Target Patient Profile Accordion ─────────────────────── */}
            {targetPatient && (
              <SectionAccordion
                id={`${slug}_target_patient`}
                title="Target Patient Profile"
                icon={Users}
                accentColor="#7c3aed"
              >
                <p className="proto-section__text">{targetPatient}</p>
              </SectionAccordion>
            )}

            {/* Secondary timeline removed — hero chart (ProtocolHeaderCharts) is the single timeline source */}

            {/* ── Section 3: Weekly Dosing ──────────────────────────────── */}
            {activeBlueprintPhases.length > 0 && (() => {
              // Build flat week-by-week rows
              const rows = [];
              let wk = 1;
              activeBlueprintPhases.forEach((ph) => {
                const dur = ph.default_duration_weeks || 4;
                const drugs = ph.drugs || [];
                for (let w = 0; w < dur; w++) {
                  drugs.forEach((d) => {
                    rows.push({
                      week: wk + w,
                      phase: ph.phase_title || '',
                      compound: d.product_title || d.name || '—',
                      dose: d.dose_logic?.starting_weekly_dose
                        || d.dose_logic?.dose_per_administration
                        || '—',
                      unit: d.dose_logic?.dose_unit || '—',
                      route: d.route || '—',
                    });
                  });
                  if (!drugs.length) rows.push({ week: wk + w, phase: ph.phase_title || '', compound: '—', dose: '—', unit: '—', route: '—' });
                }
                wk += dur;
              });

              return (
                <SectionAccordion
                  id={`${slug}_weekly_dosing`}
                  title="Weekly Dosing"
                  icon={Zap}
                  accentColor="#0369a1"
                >

                  {/* Table */}
                  <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(0,54,102,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(0,54,102,0.05)' }}>
                          {['Week', 'Phase', 'Compound', 'Dose', 'Unit', 'Route'].map(h => (
                            <th key={h} style={{ padding: '0.6rem 0.9rem', textAlign: 'left', fontWeight: 700, color: '#003666', borderBottom: '1px solid rgba(0,54,102,0.12)', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,54,102,0.02)', transition: 'background 0.15s' }}>
                            <td style={{ padding: '0.55rem 0.9rem', fontWeight: 600, color: '#003666' }}>{r.week}</td>
                            <td style={{ padding: '0.55rem 0.9rem', color: '#64748b', fontSize: '0.78rem' }}>{r.phase}</td>
                            <td style={{ padding: '0.55rem 0.9rem', fontWeight: 500 }}>{r.compound}</td>
                            <td style={{ padding: '0.55rem 0.9rem', color: '#475569' }}>{r.dose}</td>
                            <td style={{ padding: '0.55rem 0.9rem', color: '#475569' }}>{r.unit}</td>
                            <td style={{ padding: '0.55rem 0.9rem' }}>
                              <span style={{
                                fontSize: '0.72rem', fontWeight: 600, borderRadius: 5,
                                padding: '0.2rem 0.5rem',
                                background: r.route?.toLowerCase().includes('sub') ? 'rgba(99,102,241,0.1)' : 'rgba(0,54,102,0.08)',
                                color: r.route?.toLowerCase().includes('sub') ? '#4f46e5' : '#003666',
                              }}>
                                {r.route}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionAccordion>
              );
            })()}

            {/* Vial requirements are shown in the sidebar Supply Engine (same Firebase data) */}



            {/* ── Section: Reconstitution Guide ─────────────────────────── */}
            {activeBlueprintPhases.length > 0 && (() => {
              // Collect unique compounds with reconstitution data
              const seen = new Set();
              const reconRows = [];
              activeBlueprintPhases.forEach((ph) => {
                (ph.drugs || []).forEach((d) => {
                  const key = d.product_title || d.name || 'Unknown';
                  if (seen.has(key)) return;
                  seen.add(key);
                  const strength = d.vial_strength || d.dose_logic?.vial_strength || null;
                  const water = d.reconstitution?.water_volume_ml ?? d.dose_logic?.reconstitution_water_ml ?? null;
                  const conc = d.reconstitution?.final_concentration ?? d.dose_logic?.final_concentration ?? null;
                  const notes = d.reconstitution?.notes ?? null;
                  reconRows.push({ compound: key, strength, water, conc, notes });
                });
              });
              // Only render if at least one row has reconstitution data
              const hasData = reconRows.some(r => r.water || r.conc || r.strength);
              if (!hasData) return null;
              return (
                <SectionAccordion
                  id={`${slug}_reconstitution`}
                  title="Reconstitution Guide"
                  icon={FlaskConical}
                  accentColor="#7c3aed"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reconRows.map((r, i) => (
                      <div key={i} style={{
                        borderRadius: 12, border: '1px solid #e2e8f0',
                        background: '#fafbff',
                        padding: '1.1rem 1.25rem',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '1rem',
                      }}>
                        {/* Compound name header */}
                        <div style={{ gridColumn: '1 / -1', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#003666' }}>{r.compound}</span>
                          {r.notes && (
                            <span style={{ marginLeft: '0.75rem', fontSize: '0.73rem', color: '#64748b', fontStyle: 'italic' }}>{r.notes}</span>
                          )}
                        </div>
                        {/* Metric cards */}
                        {[
                          { label: 'Vial Strength', value: r.strength, unit: '', color: '#7c3aed', bg: 'rgba(124,58,237,0.07)' },
                          { label: 'Add Water', value: r.water, unit: ' mL bacteriostatic', color: '#0369a1', bg: 'rgba(3,105,161,0.07)' },
                          { label: 'Final Concentration', value: r.conc, unit: '', color: '#047857', bg: 'rgba(4,120,87,0.07)' },
                        ].map(({ label, value, unit, color, bg }) => value ? (
                          <div key={label} style={{
                            borderRadius: 8, background: bg,
                            padding: '0.65rem 0.9rem',
                            border: `1px solid ${color}22`,
                          }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>
                              {label}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1rem', color, fontFamily: 'monospace' }}>
                              {value}{unit}
                            </div>
                          </div>
                        ) : null)}
                      </div>
                    ))}
                  </div>
                </SectionAccordion>
              );
            })()}


            {/* Phases accordion (detailed) — Section: Treatment Flow */}
            {activeBlueprintPhases.length > 0 && (() => {
              // Compute cumulative week ranges for each phase
              let cursor = 1;
              const phaseData = activeBlueprintPhases.map((ph) => {
                const dur = ph.default_duration_weeks || 4;
                const startWk = cursor;
                const endWk = cursor + dur - 1;
                cursor += dur;
                return {
                  ph,
                  weekRange: `Wk ${startWk}–${endWk}`,
                  clinicalGoal: Array.isArray(ph.clinical_purpose)
                    ? ph.clinical_purpose.join(' · ')
                    : (ph.clinical_goal || ph.objective || ''),
                };
              });

              return (
                <SectionAccordion
                  id={`${slug}_treatment_flow`}
                  title="Treatment Flow"
                  icon={Layers}
                  accentColor="#003666"
                >
                  <div className="proto-phases">
                    {phaseData.map(({ ph, weekRange, clinicalGoal }, i) => {
                      const bluePh = {
                        name: ph.phase_title,
                        phase_name: ph.phase_title,
                        duration_weeks: ph.default_duration_weeks,
                        objective: clinicalGoal,
                        drugs: (ph.drugs || []).map(d => ({
                          name: d.product_title,
                          dose: d.dose_logic?.starting_weekly_dose
                            ? `${d.dose_logic.starting_weekly_dose}${d.dose_logic.dose_unit} (start)`
                            : d.dose_logic?.dose_per_administration
                            ? `${d.dose_logic.dose_per_administration}${d.dose_logic.dose_unit}` : '',
                          frequency: d.dose_logic?.administration_frequency?.replace(/_/g, ' '),
                          route: d.route,
                        })),
                        notes: ph.clinical_events?.map(e => `Wk ${e.week}: ${e.title}`).join(' | '),
                      };
                      return (
                        <div key={i} ref={el => (phaseRefs.current[i] = el)}>
                          <PhaseAccordion
                            phase={bluePh}
                            index={i}
                            weekRange={weekRange}
                            clinicalGoal={clinicalGoal}
                          />
                        </div>
                      );
                    })}
                  </div>
                </SectionAccordion>
              );
            })()}

            {/* Legacy fallback — only shown when activeBlueprintPhases is empty (edge case) */}
            {phases.length > 0 && activeBlueprintPhases.length === 0 && (
              <SectionAccordion
                id={`${slug}_phases`}
                title="Protocol Phases"
                icon={Layers}
                accentColor="#003666"
              >
                <div className="proto-phases">
                  {phases.map((ph, i) => (<PhaseAccordion key={i} phase={ph} index={i} />))}
                </div>
              </SectionAccordion>
            )}

            {/* ── Phase 4: Monitoring Plan (redesigned) ────────────────── */}
            {protocol.monitoring_plan && (() => {
              const mp = protocol.monitoring_plan;
              const checkpoints = mp.scheduled_checkpoints || [];

              // Group label helper
              const checkpointGroup = (cp) => {
                const w = Number(cp.week);
                if (cp.type?.includes('baseline') || w === 0 || w <= 1) return 'baseline';
                if (cp.type?.includes('final') || cp.type?.includes('end')) return 'final';
                return 'mid';
              };

              const GROUP_META = {
                baseline: { label: 'Baseline', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
                mid:      { label: 'Mid-Protocol', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
                final:    { label: 'Final', color: '#047857', bg: '#f0fdf4', border: '#bbf7d0' },
              };

              const checkpointTypeColor = (type) => {
                if (!type) return { bg: '#f1f5f9', color: '#64748b' };
                const t = type.toLowerCase();
                if (t.includes('lab') || t.includes('blood')) return { bg: '#eff6ff', color: '#1d4ed8' };
                if (t.includes('imaging') || t.includes('scan')) return { bg: '#faf5ff', color: '#7c3aed' };
                if (t.includes('consult') || t.includes('clinical')) return { bg: '#fff7ed', color: '#c2410c' };
                return { bg: '#f1f5f9', color: '#475569' };
              };

              return (
                <SectionAccordion
                  id={`${slug}_monitoring`}
                  title="Monitoring & Follow-Up"
                  icon={TestTube}
                  accentColor="#047857"
                >

                  {/* Baseline Labs Checklist */}
                  {mp.baseline_required?.length > 0 && (
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #1d4ed8',
                      borderRadius: 10,
                      padding: '1rem 1.25rem',
                      marginBottom: '1.5rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <CheckCircle2 size={15} color="#1d4ed8" />
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1d4ed8' }}>
                          Baseline Labs Required
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {mp.baseline_required.map((lab, i) => (
                          <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            fontSize: '0.77rem', fontWeight: 600,
                            background: '#fff', border: '1px solid #bfdbfe',
                            borderRadius: 6, padding: '0.3rem 0.65rem', color: '#1e40af',
                          }}>
                            <CheckCircle2 size={11} color="#60a5fa" />
                            {lab.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Checkpoint Cards */}
                  {checkpoints.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {checkpoints.map((cp, i) => {
                        const grp = checkpointGroup(cp);
                        const gm = GROUP_META[grp];
                        const tc = checkpointTypeColor(cp.type);
                        return (
                          <div key={i} style={{
                            display: 'grid',
                            gridTemplateColumns: '72px 1fr',
                            borderRadius: 10,
                            border: `1px solid ${gm.border}`,
                            overflow: 'hidden',
                          }}>
                            {/* Week badge column */}
                            <div style={{
                              background: gm.bg,
                              display: 'flex', flexDirection: 'column',
                              alignItems: 'center', justifyContent: 'center',
                              padding: '0.75rem 0.4rem',
                              borderRight: `2px solid ${gm.border}`,
                            }}>
                              <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: gm.color, letterSpacing: '0.06em', lineHeight: 1 }}>WK</span>
                              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: gm.color, lineHeight: 1.1 }}>{cp.week ?? '—'}</span>
                              <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', color: gm.color, opacity: 0.7, marginTop: '0.2rem', textAlign: 'center' }}>{gm.label}</span>
                            </div>

                            {/* Content column */}
                            <div style={{ background: '#fff', padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                                {cp.type && (
                                  <span style={{
                                    fontSize: '0.68rem', fontWeight: 700,
                                    background: tc.bg, color: tc.color,
                                    borderRadius: 5, padding: '0.18rem 0.5rem',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                  }}>
                                    {cp.type.replace(/_/g, ' ')}
                                  </span>
                                )}
                              </div>
                              {cp.purpose && (
                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.81rem', color: '#334155', fontWeight: 500, lineHeight: 1.45 }}>
                                  {cp.purpose}
                                </p>
                              )}
                              {(cp.labs || []).length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                  {cp.labs.map((l, j) => (
                                    <span key={j} style={{
                                      fontSize: '0.69rem', fontWeight: 600,
                                      background: '#f1f5f9', color: '#475569',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: 4, padding: '0.15rem 0.45rem',
                                    }}>
                                      {l.replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SectionAccordion>
              );
            })()}

            {/* ── Expected Outcomes Accordion ───────────────────────────── */}
            {protocol.expected_outcomes && (() => {
              const eo = protocol.expected_outcomes;
              const qr = eo.quantitative_ranges || {};
              const qrKeys = Object.keys(qr);
              // General outcomes can be an array of strings at the top level
              const generalOutcomes = Array.isArray(eo) ? eo : (eo.general || []);
              const hasContent = qrKeys.length > 0 || generalOutcomes.length > 0;
              if (!hasContent) return null;

              // Color palette cycling for timeline cards
              const RANGE_COLORS = [
                { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', label: '#1d4ed8' },
                { bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a', label: '#15803d' },
                { bg: '#faf5ff', border: '#e9d5ff', accent: '#9333ea', label: '#7e22ce' },
                { bg: '#fff7ed', border: '#fed7aa', accent: '#f97316', label: '#c2410c' },
                { bg: '#ecfdf5', border: '#a7f3d0', accent: '#10b981', label: '#065f46' },
              ];

              return (
                <SectionAccordion
                  id={`${slug}_outcomes`}
                  title="Expected Outcomes"
                  icon={TrendingDown}
                  accentColor="#10b981"
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* General outcomes list */}
                    {generalOutcomes.length > 0 && (
                      <div style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderLeft: '4px solid #16a34a',
                        borderRadius: 10,
                        padding: '1rem 1.25rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <CheckCircle2 size={14} color="#16a34a" />
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#15803d' }}>
                            Clinical Goals
                          </span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.83rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          {generalOutcomes.map((item, i) => (
                            <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Quantitative ranges — week-by-week cards */}
                    {qrKeys.length > 0 && (
                      <>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                          Quantitative Milestones
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {qrKeys.map((key, i) => {
                            const metrics = qr[key];
                            const clr = RANGE_COLORS[i % RANGE_COLORS.length];
                            const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                            return (
                              <div key={key} style={{
                                background: clr.bg,
                                border: `1px solid ${clr.border}`,
                                borderLeft: `4px solid ${clr.accent}`,
                                borderRadius: 10,
                                overflow: 'hidden',
                              }}>
                                {/* Period header */}
                                <div style={{
                                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                                  padding: '0.65rem 1rem',
                                  borderBottom: `1px solid ${clr.border}`,
                                }}>
                                  <Calendar size={13} color={clr.accent} />
                                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: clr.label }}>{label}</span>
                                </div>
                                {/* Metric rows */}
                                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                  {Object.entries(metrics).map(([metric, range]) => (
                                    <div key={metric} style={{
                                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                      fontSize: '0.8rem', flexWrap: 'wrap', gap: '0.25rem',
                                    }}>
                                      <span style={{ color: '#374151', fontWeight: 500 }}>
                                        {metric.replace(/_/g, ' ')}
                                      </span>
                                      <span style={{
                                        background: clr.accent, color: '#fff',
                                        borderRadius: 6, padding: '0.15rem 0.6rem',
                                        fontWeight: 700, fontSize: '0.74rem',
                                        whiteSpace: 'nowrap',
                                      }}>
                                        {typeof range === 'object' && range !== null
                                          ? `${range.min ?? ''}–${range.max ?? ''} ${range.unit ?? ''}`.trim()
                                          : String(range)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </SectionAccordion>
              );
            })()}

            {/* ── Eligibility & Contraindications Accordion ─────────────── */}
            {(eligibility || contraindications.length > 0) && (
              <SectionAccordion
                id={`${slug}_eligibility`}
                title="Eligibility & Contraindications"
                icon={ShieldCheck}
                accentColor="#b45309"
              >
                {eligibility && (
                  <div style={{ marginBottom: contraindications.length > 0 ? '1.5rem' : 0 }}>
                    <EligibilityBlock eligibility={eligibility} />
                  </div>
                )}

                {contraindications.length > 0 && (
                  <div className="proto-contraindication-card">
                    <div className="proto-contraindication-card__header">
                      <AlertTriangle size={18} />
                      <span>Contraindications</span>
                    </div>
                    <div className="proto-criteria-list">
                      {contraindications.map((c, i) => (
                        <span key={i} className="proto-badge proto-badge--warn">
                          <AlertCircle size={11} /> {humanize(fmt(c))}
                        </span>
                      ))}
                    </div>
                    {(protocol.eligibility_rules?.relative_cautions || []).length > 0 && (
                      <>
                        <div className="proto-contraindication-card__sub">Relative Cautions</div>
                        <div className="proto-criteria-list">
                          {protocol.eligibility_rules.relative_cautions.map((c, i) => (
                            <span key={i} className="proto-badge proto-badge--caution">
                              {humanize(c)}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </SectionAccordion>
            )}

            {/* ── Safety Profile Accordion ──────────────────────────── */}
            {(safetyNotes || protocol.safety_profile) && (
              <SectionAccordion
                id={`${slug}_safety`}
                title="Safety Profile"
                icon={ShieldCheck}
                accentColor="#dc2626"
              >
                {safetyNotes && (
                  <p className="proto-section__text" style={{ marginBottom: '1.25rem' }}>{safetyNotes}</p>
                )}

                {protocol.safety_profile && (() => {
                  const sp = protocol.safety_profile;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                      {/* Adverse Events */}
                      {(sp.adverse_events?.common?.length > 0 || sp.adverse_events?.serious?.length > 0) && (
                        <div style={{
                          background: '#fff7ed',
                          border: '1px solid #fed7aa',
                          borderLeft: '4px solid #f97316',
                          borderRadius: 10,
                          padding: '1rem 1.25rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <AlertTriangle size={14} color="#f97316" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c2410c' }}>
                              Adverse Events
                            </span>
                          </div>
                          {sp.adverse_events.common?.length > 0 && (
                            <div style={{ marginBottom: '0.6rem' }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>Common</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                {sp.adverse_events.common.map((ae, i) => (
                                  <span key={i} style={{ background: '#ffedd5', color: '#c2410c', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>{ae}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {sp.adverse_events.serious?.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>Serious (report immediately)</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                {sp.adverse_events.serious.map((ae, i) => (
                                  <span key={i} style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>{ae}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Drug Interactions */}
                      {sp.drug_interactions?.length > 0 && (
                        <div style={{
                          background: '#faf5ff',
                          border: '1px solid #e9d5ff',
                          borderLeft: '4px solid #9333ea',
                          borderRadius: 10,
                          padding: '1rem 1.25rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <AlertCircle size={14} color="#9333ea" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7e22ce' }}>
                              Drug Interactions
                            </span>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.83rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            {sp.drug_interactions.map((di, i) => (
                              <li key={i}>{di}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Monitoring Required */}
                      {sp.monitoring_required?.length > 0 && (
                        <div style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          borderLeft: '4px solid #2563eb',
                          borderRadius: 10,
                          padding: '1rem 1.25rem',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <CheckCircle2 size={14} color="#2563eb" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1d4ed8' }}>
                              Recommended Monitoring
                            </span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {sp.monitoring_required.map((m, i) => (
                              <span key={i} style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 6, fontWeight: 600 }}>{m}</span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })()}
              </SectionAccordion>
            )}

            {/* ── References Accordion ──────────────────────────────── */}
            {references.length > 0 && (
              <SectionAccordion
                id={`${slug}_references`}
                title="Clinical References"
                icon={BookOpen}
                accentColor="#0369a1"
                defaultOpen={false}
              >
                <ol className="proto-references">
                  {references.map((r, i) => (
                    <li key={i}>
                      {typeof r === 'string' ? (
                        r.startsWith('http') ? (
                          <a href={r} target="_blank" rel="noopener noreferrer">{r}</a>
                        ) : r
                      ) : (
                        <span>
                          {r.title || r.citation || JSON.stringify(r)}
                          {r.url && (
                            <>
                              {' '}—{' '}
                              <a href={r.url} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </>
                          )}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </SectionAccordion>
            )}
            {/* ── Related Protocols — Phase 9: clinical similarity engine ── */}
            {protocol?.id && <RelatedProtocolsSection protocolId={protocol.id} />}
          </div>

          {/* Right / sidebar — 4 cols sticky */}
          <aside className="proto-detail__sidebar">

            {/* Protocol Summary Widget removed — cost metrics are already shown in the Hero stat pills */}

            {/* Protocol Pricing and Expected/Key Outcomes removed from sidebar.
                 Duration → Hero stat pill.
                 Total cost → Hero stat pill + Protocol Summary widget.
                 Outcomes → Hero Overview bar (Clinical Effects chips).
            */}


            {/* Supply Engine — vial calculator + bundle CTA */}
            {Array.isArray(protocol.phase_blueprints) && protocol.phase_blueprints.length > 0 && (
              <div className="proto-sidebar-card">
                <h3 className="proto-sidebar-card__title" style={{ marginBottom: '0.75rem' }}>
                  <Package size={15} /> Full Cycle Supply
                </h3>
                <ProtocolSupplyEngine
                  phase_blueprints={protocol.phase_blueprints}
                  products={products || []}
                  region={region || 'US'}
                  tier={isProfessional ? 'clinic' : 'retail'}
                  updateCart={(items) => {
                    if (updateCart) {
                      updateCart(items);
                      // Surface total to mobile sticky bar
                      const total = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);
                      setStickyTotal(total);
                      setBundleAdded(true);
                      setTimeout(() => setBundleAdded(false), 3000);
                    }
                  }}
                  protocolName={name}
                />
              </div>
            )}

            {/* Accessories are already included inside ProtocolSupplyEngine above */}

            {/* PDF Export */}
            <button
              className="proto-sidebar-cta proto-sidebar-cta--pdf"
              onClick={() => handleExportPdf('sidebar')}
            >
              <Download size={16} /> Download as PDF <ChevronRight size={14} />
            </button>

            {/* Build a Custom Protocol button removed — feature deprecated */}
          </aside>
        </div>
      </div>

      {/* ── Included Peptides ─────────────────────────────────────────── */}
      {(() => {
        // Extract unique compounds from v2 phase_blueprints OR legacy phases
        const allCompounds = (protocol?.phase_blueprints || protocol?.phases || [])
          .flatMap(ph => ph.drugs || ph.compounds || ph.drugs_used || []);

        // Deduplicate by slug/name
        const seen = new Set();
        const uniqueCompounds = allCompounds.filter(d => {
          const key = d.product_slug || d.slug || d.name || d.product_title;
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (!uniqueCompounds.length) return null;

        // Accent colors by category keyword
        const accentFor = (cat = '') => {
          const c = cat.toLowerCase();
          if (c.includes('weight') || c.includes('metabolic')) return '#10B981';
          if (c.includes('healing') || c.includes('recovery'))  return '#00A3E0';
          if (c.includes('aging') || c.includes('longevity'))   return '#A78BFA';
          if (c.includes('cognitive') || c.includes('neuro'))   return '#22D3EE';
          if (c.includes('muscle') || c.includes('performance'))return '#F59E0B';
          if (c.includes('hormonal'))                           return '#F97316';
          return '#00A3E0';
        };

        // Enrich with product catalog data when available
        const enrichedCards = uniqueCompounds.map(d => {
          const slugKey = d.product_slug || d.slug || d.name || d.product_title;
          const match = (products || []).find(p =>
            p.slug === slugKey || p.id === slugKey ||
            (p.displayName || p.name || '').toLowerCase() === (d.product_title || d.name || '').toLowerCase()
          );
          const cat    = match?.category || d.category || '';
          const color  = accentFor(cat);
          return {
            name:        match?.displayName || match?.name || d.product_title || d.name || slugKey,
            slug:        match?.slug || slugKey,
            role:        match?.shortDescription || match?.subtitle || cat || 'Research Compound',
            description: match?.description || match?.shortDescription || d.description || '',
            color,
            dosage:      d.dosage || d.dose || '',
            frequency:   d.frequency || '',
          };
        });

        return (
          <div style={{
            maxWidth: '1280px', margin: '0 auto 3rem', padding: '0 1.5rem',
          }}>
            {/* Section header */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                <FlaskConical size={18} style={{ color: '#00A3E0' }} />
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: '#00A3E0',
                }}>Protocol Compounds</span>
              </div>
              <h2 style={{
                fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 800,
                color: '#fff', margin: 0, letterSpacing: '-0.02em',
              }}>
                Included Peptides
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.35rem' }}>
                {enrichedCards.length} active compound{enrichedCards.length !== 1 ? 's' : ''} in this protocol
              </p>
            </div>

            {/* Card grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.1rem',
            }}>
              {enrichedCards.map((peptide, idx) => (
                <IncludedPeptideCard
                  key={peptide.slug || idx}
                  peptide={peptide}
                  onClick={() => navigate(`/peptides/${peptide.slug}`)}
                />
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── RUO Disclaimer footer ─────────────────────────────────────── */}
      <div className="proto-ruo-footer">
        <span className="proto-ruo-footer__dot" />
        For Laboratory Research Use Only (RUO). Not for diagnostic or therapeutic use.
        All compounds shown are investigational unless otherwise stated.
      </div>

      {/* ── Mobile sticky checkout bar ───────────────────────────────── */}
      {Array.isArray(protocol.phase_blueprints) && protocol.phase_blueprints.length > 0 && (
        <div className="proto-sticky-mobile-bar" style={{
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '0.5px solid rgba(226,232,240,0.8)',
          boxShadow: 'none',
        }}>
          <div className="proto-sticky-mobile-bar__inner">
            <div className="proto-sticky-mobile-bar__info">
              <span className="proto-sticky-mobile-bar__label" style={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
                {name}
              </span>
              {stickyTotal > 0 && (
                <span className="proto-sticky-mobile-bar__price">
                  ${stickyTotal.toFixed(0)} total
                </span>
              )}
            </div>
            <button
              className={`proto-sticky-mobile-bar__btn${bundleAdded ? ' proto-sticky-mobile-bar__btn--success' : ''}`}
              onClick={() => {
                if (!bundleAdded) {
                  trackEvent('add_to_cart', {
                    protocol_slug: slug,
                    protocol_name: protocol?.name || slug,
                    value: stickyTotal || 0,
                    currency: 'USD',
                    location: 'mobile_sticky_bar',
                  });
                }
                const supplySection = document.querySelector('.proto-sidebar-card:has(.pse-root)');
                if (supplySection) {
                  supplySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  navigate('/cart');
                }
              }}
            >
              {bundleAdded ? (
                <><CheckCircle2 size={16} /> Added!</>
              ) : (
                <><ShoppingCart size={16} /> Get Bundle</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
