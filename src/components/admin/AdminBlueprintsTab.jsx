import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Activity,
  Clock,
  Layers,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

// ── Complexity badge colours ──────────────────────────────────────────────────
const COMPLEXITY_STYLE = {
  standard: { bg: '#e0f2fe', color: '#0369a1', label: 'Standard' },
  moderate: { bg: '#fef9c3', color: '#854d0e', label: 'Moderate' },
  advanced: { bg: '#fce7f3', color: '#9d174d', label: 'Advanced' },
};

// ── Confidence score colour ───────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 90) return 'var(--color-success)';
  if (score >= 75) return '#ca8a04';
  return 'var(--color-danger)';
}

// ── Phase row ─────────────────────────────────────────────────────────────────
function PhaseRow({ phase }) {
  return (
    <div
      style={{
        borderLeft: '3px solid var(--primary)',
        paddingLeft: '1rem',
        marginBottom: '0.75rem',
        background: 'var(--color-bg-app)',
        borderRadius: '0 8px 8px 0',
        padding: '0.75rem 1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
          Phase {phase.phase_number}: {phase.phase_title}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Weeks {phase.start_week}–{phase.end_week}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {(phase.drugs_used || []).map((drug, i) => (
          <div
            key={i}
            style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.75rem',
              fontSize: '0.78rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.1rem',
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{drug.product_slug}</span>
            {drug.selected_strength && (
              <span style={{ color: 'var(--text-muted)' }}>{drug.selected_strength}</span>
            )}
            {drug.weekly_dose && (
              <span style={{ color: 'var(--text-muted)' }}>Dose: {drug.weekly_dose}</span>
            )}
            {drug.dosing_frequency && (
              <span style={{ color: 'var(--text-muted)' }}>{drug.dosing_frequency}</span>
            )}
            {drug.vials_required_for_phase && (
              <span style={{ color: 'var(--text-muted)' }}>
                {drug.vials_required_for_phase} vial{drug.vials_required_for_phase !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Blueprint card ────────────────────────────────────────────────────────────
function BlueprintCard({ blueprint, onToggleActive }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const complexity = COMPLEXITY_STYLE[blueprint.complexity_level] || COMPLEXITY_STYLE.standard;

  async function handleToggle() {
    setSaving(true);
    await onToggleActive(blueprint.id, !blueprint.active);
    setSaving(false);
  }

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow 0.2s',
        opacity: blueprint.active ? 1 : 0.65,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <BookOpen size={20} color="white" />
        </div>

        {/* Title block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {blueprint.protocol_title}
            </h3>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-md)',
                background: complexity.bg,
                color: complexity.color,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {complexity.label}
            </span>
          </div>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {blueprint.primary_goal}
          </p>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {/* Confidence score */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: scoreColor(blueprint.confidence_score),
              }}
            >
              {blueprint.confidence_score}
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Conf.
            </div>
          </div>

          {/* Active toggle */}
          <button
            onClick={handleToggle}
            disabled={saving}
            title={blueprint.active ? 'Deactivate blueprint' : 'Activate blueprint'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.9rem',
              cursor: saving ? 'wait' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: blueprint.active ? '#dcfce7' : '#fee2e2',
              color: blueprint.active ? 'var(--color-success)' : 'var(--color-danger)',
              transition: 'all 0.2s',
            }}
          >
            {blueprint.active ? (
              <>
                <CheckCircle2 size={14} /> Active
              </>
            ) : (
              <>
                <XCircle size={14} /> Inactive
              </>
            )}
          </button>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
            }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          padding: '0.6rem 1.5rem',
          background: 'var(--color-bg-app)',
          borderTop: '1px solid var(--border)',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          flexWrap: 'wrap',
        }}
      >
        {[
          { icon: <Clock size={13} />, label: `${blueprint.protocol_duration_weeks}w` },
          { icon: <Layers size={13} />, label: `${blueprint.number_of_phases} phases` },
          {
            icon: <TrendingUp size={13} />,
            label: blueprint.economics?.total_protocol_cost_estimate
              ? `$${blueprint.economics.total_protocol_cost_estimate.toLocaleString()}`
              : 'N/A cost',
          },
          {
            icon: <Activity size={13} />,
            label: blueprint.protocol_last_reviewed_at
              ? `Reviewed: ${blueprint.protocol_last_reviewed_at}`
              : 'Unreviewed',
          },
          { icon: <FlaskConical size={13} />, label: blueprint.protocol_id },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {/* Summary */}
          {blueprint.overview_summary && (
            <p
              style={{
                margin: '0 0 1.25rem',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}
            >
              {blueprint.overview_summary}
            </p>
          )}

          {/* Expected outcomes */}
          {blueprint.expected_outcomes?.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4
                style={{
                  margin: '0 0 0.5rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                }}
              >
                Expected Outcomes
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {blueprint.expected_outcomes.map((o, i) => (
                  <span
                    key={i}
                    style={{
                      background: 'var(--color-success-bg)',
                      color: 'var(--color-success)',
                      border: '1px solid #bbf7d0',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.2rem 0.65rem',
                      fontSize: '0.78rem',
                    }}
                  >
                    {o}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Phases */}
          <h4
            style={{
              margin: '0 0 0.75rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
            }}
          >
            Protocol Phases
          </h4>
          {(blueprint.phases || []).map((phase, i) => (
            <PhaseRow key={i} phase={phase} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main tab component ────────────────────────────────────────────────────────
export default function AdminBlueprintsTab() {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | active | inactive
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchBlueprints() {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDocs(collection(db, 'blueprints'));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by confidence score descending
        data.sort((a, b) => (b.confidence_score || 0) - (a.confidence_score || 0));
        setBlueprints(data);
      } catch (err) {
        console.error('Error loading blueprints:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBlueprints();
  }, []);

  async function handleToggleActive(docId, newValue) {
    try {
      await updateDoc(doc(db, 'blueprints', docId), { active: newValue });
      setBlueprints((prev) => prev.map((b) => (b.id === docId ? { ...b, active: newValue } : b)));
    } catch (err) {
      console.error('Error toggling blueprint:', err);
      alert('Error updating blueprint status: ' + err.message);
    }
  }

  const filtered = blueprints.filter((b) => {
    const matchesFilter =
      filter === 'all' || (filter === 'active' && b.active) || (filter === 'inactive' && !b.active);
    const matchesSearch =
      !search ||
      b.protocol_title?.toLowerCase().includes(search.toLowerCase()) ||
      b.primary_goal?.toLowerCase().includes(search.toLowerCase()) ||
      b.protocol_id?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeCount = blueprints.filter((b) => b.active).length;
  const inactiveCount = blueprints.length - activeCount;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}
        >
          <BookOpen size={28} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Blueprint Catalog</h2>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage and review all prescribable protocol blueprints.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          {
            label: 'Total',
            value: blueprints.length,
            color: 'var(--primary)',
            bg: 'var(--primary-light)',
          },
          { label: 'Active', value: activeCount, color: 'var(--color-success)', bg: '#dcfce7' },
          { label: 'Inactive', value: inactiveCount, color: 'var(--color-danger)', bg: '#fee2e2' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: stat.bg,
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 90,
            }}
          >
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>
              {stat.value}
            </span>
            <span style={{ fontSize: '0.75rem', color: stat.color, fontWeight: 600 }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Activity
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search blueprints…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '2.25rem',
              padding: '0.65rem 0.75rem 0.65rem 2.25rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status filter buttons */}
        {['all', 'active', 'inactive'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.6rem 1.1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid',
              borderColor: filter === f ? 'var(--primary)' : 'var(--border)',
              background: filter === f ? 'var(--primary)' : 'white',
              color: filter === f ? 'white' : 'var(--text-main)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <Activity size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Loading blueprints…</p>
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#fee2e2',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            marginBottom: '1rem',
          }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && blueprints.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <BookOpen size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <p style={{ fontWeight: 600 }}>No blueprints found in Firestore.</p>
          <p style={{ fontSize: '0.85rem' }}>
            Run the migration script to populate the blueprints collection.
          </p>
        </div>
      )}

      {/* Blueprint cards */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((bp) => (
            <BlueprintCard key={bp.id} blueprint={bp} onToggleActive={handleToggleActive} />
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && blueprints.length > 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No blueprints match your current filters.
        </div>
      )}
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminBlueprintsTab | Props: none
      </div>
    
</div>
  );
}
