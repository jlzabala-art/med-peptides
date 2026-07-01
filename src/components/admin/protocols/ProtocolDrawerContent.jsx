import React, { useState } from 'react';
import {
  Clock,
  FlaskConical,
  ShieldCheck,
  Activity,
  Layers,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Pill,
  Stethoscope,
  Target,
  BarChart2,
} from 'lucide-react';
import StandardDrawerTabs from '../../common/StandardDrawerTabs';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ts) {
  if (!ts) return '—';
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '—';
  }
}

function get(obj, path, fallback = undefined) {
  return (
    path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj) ?? fallback
  );
}

const COMPLEXITY_MAP = {
  simple: { color: '#16a34a', bg: '#dcfce7', label: 'Simple' },
  minimal: { color: '#16a34a', bg: '#dcfce7', label: 'Minimal' },
  moderate: { color: '#d97706', bg: '#fef3c7', label: 'Moderate' },
  advanced: { color: '#dc2626', bg: '#fee2e2', label: 'Advanced' },
  complex: { color: '#7c3aed', bg: '#f5f3ff', label: 'Complex' },
};

function ComplexityBadge({ level }) {
  const c = COMPLEXITY_MAP[level?.toLowerCase()] || {
    color: '#64748b',
    bg: '#f1f5f9',
    label: level || 'N/A',
  };
  return (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 12,
        background: c.bg,
        color: c.color,
        fontSize: '0.7rem',
        fontWeight: 700,
      }}
    >
      {c.label}
    </span>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.7rem',
        fontWeight: 700,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '0.75rem',
        marginTop: '0.25rem',
      }}
    >
      {Icon && <Icon size={12} />}
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value || value === 'N/A' || value === '—') return null;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.83rem' }}>
      <span style={{ color: '#64748b', minWidth: 140, flexShrink: 0 }}>{label}</span>
      <span style={{ color: '#0f172a', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        marginBottom: '0.75rem',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.65rem 0.9rem',
          background: '#f8fafc',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.85rem',
          color: '#0f172a',
        }}
      >
        {title}
        {open ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
      </button>
      {open && <div style={{ padding: '0.85rem' }}>{children}</div>}
    </div>
  );
}

// ─── Tab: Overview ─────────────────────────────────────────────────────────────

function OverviewTab({ protocol }) {
  const meta = protocol.metadata || {};
  const safety = protocol.safety || protocol.safety_profile || {};
  const monitoring = protocol.monitoring_plan || protocol.monitoring || {};

  const description = meta.description || protocol.overview_summary || protocol.description || null;
  const primaryGoal = protocol.primary_goal || meta.primary_goal || null;
  const clinicalSummary = meta.clinical_summary || protocol.overview_summary || null;
  const targetOutcomes = protocol.expected_outcomes || meta.expected_outcomes || [];
  const complexity = protocol.complexity_level || meta.complexity_level || null;
  const riskClass = protocol.risk_class || null;
  const duration = protocol.protocol_duration_weeks
    ? `${protocol.protocol_duration_weeks} weeks`
    : null;
  const version = protocol.protocol_version || null;
  const washout = protocol.washout_recommended_weeks
    ? `${protocol.washout_recommended_weeks} weeks`
    : null;
  const physicianRequired = protocol.physician_supervision_required;
  const evidenceGrade = meta.evidence_grade || protocol.evidence_grade || null;

  // Contraindications
  const contraindications = safety.contraindications || protocol.contraindications || [];
  // Side effects
  const sideEffects = safety.known_side_effects || safety.side_effects || [];
  // Precautions
  const precautions = safety.precautions || [];

  // Monitoring checkpoints
  const checkpoints = monitoring.scheduled_checkpoints || monitoring.checkpoints || [];

  return (
    <div style={{ padding: '0.5rem 0' }}>
      {/* Description */}
      {description && (
        <div
          style={{
            fontSize: '0.85rem',
            color: '#334155',
            lineHeight: 1.65,
            marginBottom: '1.5rem',
            padding: '0.75rem',
            background: '#f8fafc',
            borderRadius: 8,
            borderLeft: '3px solid #6366f1',
          }}
        >
          {description}
        </div>
      )}

      {/* Primary Goal */}
      {primaryGoal && (
        <div style={{ marginBottom: '1.25rem' }}>
          <SectionTitle icon={Target}>Primary Goal</SectionTitle>
          <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: 0 }}>{primaryGoal}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div style={{ marginBottom: '1.25rem' }}>
        <SectionTitle icon={BarChart2}>Protocol Details</SectionTitle>
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0.75rem' }}>
          <InfoRow label="Therapeutic Category" value={protocol.therapeutic_category} />
          <InfoRow label="Duration" value={duration} />
          <InfoRow
            label="Number of Phases"
            value={protocol.phases?.length ? String(protocol.phases.length) : null}
          />
          <InfoRow label="Version" value={version} />
          <InfoRow label="Risk Class" value={riskClass?.replace(/_/g, ' ')} />
          <InfoRow label="Evidence Grade" value={evidenceGrade} />
          <InfoRow label="Washout Period" value={washout} />
          <InfoRow label="Last Reviewed" value={formatDate(protocol.protocol_last_reviewed_at)} />
          <InfoRow label="Created" value={formatDate(protocol.created_at)} />
          {physicianRequired && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginTop: '0.4rem',
                fontSize: '0.8rem',
                color: '#dc2626',
              }}
            >
              <AlertTriangle size={12} />
              Physician supervision required
            </div>
          )}
          {complexity && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Complexity:</span>
              <ComplexityBadge level={complexity} />
            </div>
          )}
        </div>
      </div>

      {/* Expected Outcomes */}
      {targetOutcomes.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <SectionTitle icon={CheckCircle}>Expected Outcomes</SectionTitle>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {targetOutcomes.map((o, i) => (
              <li
                key={i}
                style={{
                  fontSize: '0.83rem',
                  color: '#334155',
                  marginBottom: '0.3rem',
                  lineHeight: 1.5,
                }}
              >
                {typeof o === 'string' ? o : o.outcome || JSON.stringify(o)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety */}
      {(contraindications.length > 0 || sideEffects.length > 0 || precautions.length > 0) && (
        <div style={{ marginBottom: '1.25rem' }}>
          <SectionTitle icon={ShieldCheck}>Safety Profile</SectionTitle>

          {contraindications.length > 0 && (
            <Collapsible title={`⛔ Contraindications (${contraindications.length})`}>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {contraindications.map((c, i) => (
                  <li
                    key={i}
                    style={{ fontSize: '0.82rem', color: '#dc2626', marginBottom: '0.25rem' }}
                  >
                    {typeof c === 'string' ? c : c.condition || JSON.stringify(c)}
                  </li>
                ))}
              </ul>
            </Collapsible>
          )}

          {sideEffects.length > 0 && (
            <Collapsible title={`⚠️ Known Side Effects (${sideEffects.length})`}>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {sideEffects.map((s, i) => (
                  <li
                    key={i}
                    style={{ fontSize: '0.82rem', color: '#92400e', marginBottom: '0.25rem' }}
                  >
                    {typeof s === 'string' ? s : s.effect || JSON.stringify(s)}
                  </li>
                ))}
              </ul>
            </Collapsible>
          )}

          {precautions.length > 0 && (
            <Collapsible title={`🔶 Precautions (${precautions.length})`}>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {precautions.map((p, i) => (
                  <li
                    key={i}
                    style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '0.25rem' }}
                  >
                    {typeof p === 'string' ? p : p.note || JSON.stringify(p)}
                  </li>
                ))}
              </ul>
            </Collapsible>
          )}
        </div>
      )}

      {/* Monitoring Checkpoints */}
      {checkpoints.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <SectionTitle icon={Activity}>Monitoring Checkpoints</SectionTitle>
          {checkpoints.map((cp, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: '#f8fafc',
                borderRadius: 6,
                borderLeft: '2px solid #6366f1',
                fontSize: '0.82rem',
              }}
            >
              <span style={{ fontWeight: 600, color: '#6366f1', minWidth: 60 }}>
                {cp.week_number != null
                  ? `Week ${cp.week_number}`
                  : cp.timepoint || `Point ${i + 1}`}
              </span>
              <span style={{ color: '#334155' }}>
                {cp.test || cp.action || cp.description || JSON.stringify(cp)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Clinical Summary */}
      {clinicalSummary && (
        <div style={{ marginBottom: '1.25rem' }}>
          <SectionTitle icon={BookOpen}>Clinical Summary</SectionTitle>
          <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.65, margin: 0 }}>
            {clinicalSummary}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Clinical Timeline ─────────────────────────────────────────────────────

function TimelineTab({ protocol }) {
  const phases = protocol.phases ?? [];
  const PHASE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <SectionTitle icon={Layers}>Protocol Timeline</SectionTitle>

      {phases.length === 0 ? (
        <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
          No phases defined.
        </p>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Timeline spine */}
          <div
            style={{
              position: 'absolute',
              left: 11,
              top: 8,
              bottom: 8,
              width: 2,
              background: '#e2e8f0',
              zIndex: 0,
            }}
          />

          {phases.map((phase, idx) => {
            const color = PHASE_COLORS[idx % PHASE_COLORS.length];
            const objectives = phase.objectives || phase.goals || [];
            const items = phase.items || phase.compounds || [];
            const notes = phase.phase_notes || phase.notes || null;
            const biomarkers = phase.expected_biomarker_changes || [];

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: color,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'white',
                    marginTop: 2,
                  }}
                >
                  {idx + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                    {phase.phase_name || phase.label || phase.name || `Phase ${idx + 1}`}
                  </div>
                  {phase.duration_weeks && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      ⏱ {phase.duration_weeks} week{phase.duration_weeks !== 1 ? 's' : ''}
                      {phase.week_start != null && phase.week_end != null
                        ? ` (Weeks ${phase.week_start}–${phase.week_end})`
                        : ''}
                    </div>
                  )}

                  {/* Objective */}
                  {phase.objective && (
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: '#334155',
                        margin: '0 0 0.5rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {phase.objective}
                    </p>
                  )}

                  {/* Objective list */}
                  {objectives.length > 0 && (
                    <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.1rem' }}>
                      {objectives.map((o, j) => (
                        <li
                          key={j}
                          style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.2rem' }}
                        >
                          {typeof o === 'string' ? o : o.objective || JSON.stringify(o)}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Compounds count */}
                  {items.length > 0 && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        color: color,
                        background: `${color}18`,
                        padding: '2px 8px',
                        borderRadius: 12,
                        marginBottom: '0.4rem',
                      }}
                    >
                      <FlaskConical size={10} />
                      {items.length} compound{items.length !== 1 ? 's' : ''}
                    </div>
                  )}

                  {/* Biomarker changes */}
                  {biomarkers.length > 0 && (
                    <div style={{ marginTop: '0.4rem' }}>
                      {biomarkers.map((b, j) => (
                        <span
                          key={j}
                          style={{
                            display: 'inline-block',
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            background: '#f0fdf4',
                            color: '#16a34a',
                            borderRadius: 10,
                            marginRight: 4,
                            marginBottom: 4,
                          }}
                        >
                          📈 {typeof b === 'string' ? b : b.biomarker || JSON.stringify(b)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {notes && (
                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: '#64748b',
                        marginTop: '0.4rem',
                        fontStyle: 'italic',
                        borderLeft: '2px solid #e2e8f0',
                        paddingLeft: '0.5rem',
                      }}
                    >
                      {notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Supplements Section */}
      {(protocol.supplements || []).length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <SectionTitle icon={Pill}>Recommended Supplements</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {protocol.supplements.map((sup, i) => (
              <div
                key={i}
                style={{
                  padding: '0.65rem 0.85rem',
                  background: '#f0fdf4',
                  borderRadius: 8,
                  border: '1px solid #bbf7d0',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ fontWeight: 600, color: '#0f172a' }}>
                  {sup.name || sup.supplement_name}
                </div>
                {sup.dosage && <div style={{ color: '#475569' }}>Dosage: {sup.dosage}</div>}
                {sup.timing && (
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Timing: {sup.timing}</div>
                )}
                {sup.rationale && (
                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '0.75rem',
                      marginTop: '0.2rem',
                      fontStyle: 'italic',
                    }}
                  >
                    {sup.rationale}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Dosage & Logistics ────────────────────────────────────────────────────

function DosageTab({ protocol, products, onProductClick }) {
  const getProductDetails = (productId, productName) => {
    if (!productId) return { name: productName || 'Unknown Product' };
    return products.find((p) => p.id === productId) || { name: productName || 'Unknown Product' };
  };

  const phases = protocol.phases ?? [];
  const PHASE_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <SectionTitle icon={FlaskConical}>Dosage & Protocol Logistics</SectionTitle>

      {phases.length === 0 ? (
        <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
          No products defined.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {phases.map((phase, idx) => {
            const color = PHASE_COLORS[idx % PHASE_COLORS.length];
            const items = phase.items || phase.compounds || [];

            return (
              <div
                key={idx}
                style={{
                  borderRadius: 10,
                  border: `1px solid ${color}33`,
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {/* Phase header */}
                <div
                  style={{
                    padding: '0.65rem 1rem',
                    background: `${color}0f`,
                    borderBottom: `1px solid ${color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                    {phase.phase_name || phase.label || phase.name || `Phase ${idx + 1}`}
                  </span>
                  {phase.duration_weeks && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.73rem', color: '#64748b' }}>
                      {phase.duration_weeks}w
                    </span>
                  )}
                </div>

                {items.length === 0 ? (
                  <p
                    style={{
                      color: '#94a3b8',
                      fontStyle: 'italic',
                      fontSize: '0.82rem',
                      padding: '0.75rem 1rem',
                      margin: 0,
                    }}
                  >
                    No products in this phase.
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table
                      style={{
                        minWidth: 460,
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '0.82rem',
                      }}
                    >
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th
                            style={{
                              padding: '0.5rem 1rem',
                              textAlign: 'left',
                              color: '#64748b',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            Compound
                          </th>
                          <th
                            style={{
                              padding: '0.5rem 0.5rem',
                              textAlign: 'left',
                              color: '#64748b',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            Dosage
                          </th>
                          <th
                            style={{
                              padding: '0.5rem 0.5rem',
                              textAlign: 'left',
                              color: '#64748b',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            Frequency
                          </th>
                          <th
                            style={{
                              padding: '0.5rem 0.5rem',
                              textAlign: 'left',
                              color: '#64748b',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          >
                            Route
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, j) => {
                          const product = getProductDetails(
                            item.productId,
                            item.productName || item.product_name
                          );
                          const clickable = onProductClick && item.productId;
                          return (
                            <tr
                              key={j}
                              style={{
                                borderTop: '1px solid #f1f5f9',
                                cursor: clickable ? 'pointer' : 'default',
                                transition: 'background 0.1s',
                              }}
                              onClick={() => clickable && onProductClick(product)}
                              onMouseEnter={(e) => {
                                if (clickable) e.currentTarget.style.background = '#f8fafc';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '';
                              }}
                            >
                              <td
                                style={{
                                  padding: '0.7rem 1rem',
                                  fontWeight: 500,
                                  color: '#0f172a',
                                }}
                              >
                                {product.name}
                                {!item.productId && (
                                  <span
                                    style={{
                                      marginLeft: 6,
                                      fontSize: '0.65rem',
                                      padding: '1px 4px',
                                      background: '#fef08a',
                                      color: '#854d0e',
                                      borderRadius: 4,
                                    }}
                                  >
                                    Legacy
                                  </span>
                                )}
                                {clickable && (
                                  <ExternalLink
                                    size={10}
                                    color="#94a3b8"
                                    style={{ marginLeft: 4 }}
                                  />
                                )}
                              </td>
                              <td style={{ padding: '0.7rem 0.5rem', color: '#475569' }}>
                                {item.dosage || '—'}
                              </td>
                              <td style={{ padding: '0.7rem 0.5rem', color: '#475569' }}>
                                {item.frequency || item.schedule || '—'}
                              </td>
                              <td style={{ padding: '0.7rem 0.5rem', color: '#475569' }}>
                                {item.route || item.administration_route || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Phase notes */}
                {(phase.phase_notes || phase.notes || phase.clinical_notes) && (
                  <div
                    style={{
                      padding: '0.6rem 1rem',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '0.78rem',
                      color: '#64748b',
                      fontStyle: 'italic',
                      background: '#fafafa',
                    }}
                  >
                    📝 {phase.phase_notes || phase.notes || phase.clinical_notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function ProtocolDrawerContent({ protocol, products = [], onProductClick }) {
  const [activeTab, setActiveTab] = useState('overview');

  const statusMeta = {
    bg:
      protocol.status === 'active'
        ? '#dcfce7'
        : protocol.status === 'archived'
          ? '#f1f5f9'
          : '#fef9c3',
    color:
      protocol.status === 'active'
        ? '#166534'
        : protocol.status === 'archived'
          ? '#64748b'
          : '#854d0e',
    border:
      protocol.status === 'active'
        ? '#bbf7d0'
        : protocol.status === 'archived'
          ? '#e2e8f0'
          : '#fef08a',
    emoji: protocol.status === 'active' ? '🟢' : protocol.status === 'archived' ? '⚪' : '🟡',
    label:
      protocol.status === 'active'
        ? 'Active'
        : protocol.status === 'archived'
          ? 'Archived'
          : 'Draft',
  };

  const totalDuration = protocol.protocol_duration_weeks
    ? `${protocol.protocol_duration_weeks}w`
    : (protocol.phases || []).reduce((s, p) => s + (p.duration_weeks || 0), 0) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header chips */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <span
          style={{
            padding: '0.3rem 0.8rem',
            borderRadius: 20,
            background: statusMeta.bg,
            color: statusMeta.color,
            border: `1px solid ${statusMeta.border}`,
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {statusMeta.emoji} {statusMeta.label}
        </span>
        <span
          style={{
            fontSize: '0.78rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <Clock size={11} /> Created: {formatDate(protocol.created_at)}
        </span>
        <span
          style={{
            fontSize: '0.78rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <FlaskConical size={11} /> {(protocol.phases ?? []).length} Phase
          {(protocol.phases ?? []).length !== 1 ? 's' : ''}
        </span>
        {totalDuration > 0 && (
          <span
            style={{
              fontSize: '0.78rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Activity size={11} /> {totalDuration}w total
          </span>
        )}
        {(protocol.complexity_level || get(protocol, 'metadata.complexity_level')) && (
          <ComplexityBadge
            level={protocol.complexity_level || get(protocol, 'metadata.complexity_level')}
          />
        )}
        {protocol.physician_supervision_required && (
          <span
            style={{
              fontSize: '0.7rem',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              background: '#fee2e2',
              padding: '2px 6px',
              borderRadius: 10,
            }}
          >
            <Stethoscope size={10} /> Physician Required
          </span>
        )}
      </div>

      {/* Tabs */}
      <StandardDrawerTabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'timeline', label: 'Clinical Timeline' },
          { id: 'dosage', label: 'Dosage & Logistics' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '0.5rem' }}>
        {activeTab === 'overview' && <OverviewTab protocol={protocol} />}
        {activeTab === 'timeline' && <TimelineTab protocol={protocol} />}
        {activeTab === 'dosage' && (
          <DosageTab protocol={protocol} products={products} onProductClick={onProductClick} />
        )}
      </div>
    </div>
  );
}
