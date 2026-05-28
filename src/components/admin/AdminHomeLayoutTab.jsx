/* eslint-disable no-unused-vars */
/**
 * AdminHomeLayoutTab
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin panel for controlling which home sections are visible
 * for Guest and Professional users.
 *
 * Features:
 *  • Toggle each section on / off (locked sections always stay on)
 *  • Drag-to-reorder via up/down arrows (keyboard-safe)
 *  • Changes are persisted to Firestore: config/homeLayout
 *  • Live preview badge count (enabled / total)
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  Eye, EyeOff, ArrowUp, ArrowDown, Save, RotateCcw, Users, 
  Stethoscope, GripVertical, Loader2, Search, X, AlertCircle,
  Copy, Info, Monitor, History, RefreshCw, ShieldCheck, Layers, FlaskConical, Package, Tag, Globe, User, Link
} from 'lucide-react';
import { useHomeLayout, useLayoutHistory, ALL_ROLES, PRO_ROLES, GUEST_ROLES, DEFAULT_GUEST_SECTIONS, DEFAULT_PRO_SECTIONS } from '../../hooks/useHomeLayout';

const ROLE_METADATA = {
  admin:       { label: 'Admin',       icon: ShieldCheck, color: 'var(--color-danger)', bgLight: 'rgba(239,68,68,0.1)' },
  clinic:      { label: 'Clinic',      icon: Layers,      color: 'var(--color-success)', bgLight: 'rgba(16,185,129,0.1)' },
  doctor:      { label: 'Physician',      icon: FlaskConical,color: '#06b6d4', bgLight: 'rgba(6,182,212,0.1)' },
  wholesaler:  { label: 'Wholesaler',  icon: Package,     color: '#6366f1', bgLight: 'rgba(99,102,241,0.1)' },
  sales_agent: { label: 'Agent',       icon: Tag,         color: '#f59e0b', bgLight: 'rgba(245,158,11,0.1)' },
  staff:       { label: 'Staff',       icon: Users,       color: 'var(--color-text-secondary)', bgLight: 'rgba(100,116,139,0.1)' },
  patient:     { label: 'Patient',     icon: User,        color: '#8b5cf6', bgLight: 'rgba(139,92,246,0.1)' },
  guest:       { label: 'Guest',       icon: Globe,       color: '#ec4899', bgLight: 'rgba(236,72,153,0.1)' },
};

// ─── Layout History Drawer ────────────────────────────────────────────────────

function LayoutHistoryDrawer({ onClose, onRestore, saveLayout }) {
  const { versions, loading, fetchVersions, restoreVersion } = useLayoutHistory(saveLayout);
  const [restoring, setRestoring] = useState(null); // id of version being restored

  // Load on first open
  useState(() => { fetchVersions(); }, []);

  const handleRestore = async (v) => {
    if (!window.confirm(`Restore layout from "${v.versionLabel}"? This will overwrite the current layout.`)) return;
    setRestoring(v.id);
    try {
      await restoreVersion(v);
      onRestore();
      onClose();
    } catch (err) {
      console.error('Restore failed', err);
    } finally {
      setRestoring(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,20,50,0.3)',
          backdropFilter: 'blur(3px)',
        }}
      />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 9999,
        width: '100%', maxWidth: '420px',
        background: 'white',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.22s ease-out',
      }}>
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <History size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
              Version History
            </span>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.6rem',
              borderRadius: 'var(--radius-sm)', background: 'rgba(0,54,102,0.08)',
              color: 'var(--primary)', letterSpacing: '0.05em'
            }}>LAST 10</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={fetchVersions}
              title="Refresh history"
              style={{
                border: 'none', background: 'rgba(0,0,0,0.06)',
                borderRadius: 'var(--radius-sm)', padding: '0.35rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
              }}
            >
              <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            </button>
            <button
              onClick={onClose}
              style={{
                border: 'none', background: 'rgba(0,0,0,0.06)',
                borderRadius: 'var(--radius-sm)', padding: '0.35rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.5rem' }}>
          {loading && versions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Loading versions…
            </div>
          ) : versions.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: '0.88rem',
              background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border)',
            }}>
              No version history yet.<br />
              <span style={{ fontSize: '0.78rem' }}>Save a layout to create the first snapshot.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {versions.map((v, idx) => (
                <div
                  key={v.id}
                  style={{
                    padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: idx === 0 ? 'rgba(0,54,102,0.03)' : 'white',
                    display: 'flex', flexDirection: 'column', gap: '0.3rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {idx === 0 && (
                        <span style={{
                          fontSize: '0.62rem', fontWeight: 700,
                          color: 'var(--primary)', letterSpacing: '0.06em',
                          background: 'rgba(0,54,102,0.08)', padding: '0.1rem 0.5rem',
                          borderRadius: 'var(--radius-sm)', marginBottom: '0.3rem',
                          display: 'inline-block',
                        }}>LATEST</span>
                      )}
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                        {v.versionLabel || '—'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        by {v.createdBy}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestore(v)}
                      disabled={!!restoring}
                      style={{
                        flexShrink: 0,
                        padding: '0.4rem 0.85rem',
                        borderRadius: 'var(--radius-sm)', border: 'none',
                        background: restoring === v.id ? 'var(--border)' : 'rgba(0,54,102,0.08)',
                        color: restoring === v.id ? 'var(--text-muted)' : 'var(--primary)',
                        fontWeight: 700, fontSize: '0.78rem', cursor: restoring ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                      }}
                    >
                      {restoring === v.id
                        ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Restoring…</>
                        : <><RotateCcw size={12} /> Restore</>
                      }
                    </button>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Admin: {v.admin?.filter(s => s.enabled).length ?? '?'} · Clinic: {v.clinic?.filter(s => s.enabled).length ?? '?'} · Patient: {v.patient?.filter(s => s.enabled).length ?? '?'} · Guest: {v.guest?.filter(s => s.enabled).length ?? '?'} visible
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}



function LayoutPreviewModal({ layout, onClose }) {
  const [activeTab, setActiveTab] = useState('guest');
  const sections = layout[activeTab] || [];
  const visibleSections = sections.filter(s => s.enabled);

  // Trap focus within modal on open
  const tabBtnStyle = (active) => ({
    padding: '0.45rem 1rem',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    fontWeight: 700,
    fontSize: '0.82rem',
    cursor: 'pointer',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? 'white' : 'var(--text-muted)',
    transition: 'all 0.18s',
  });

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,20,50,0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={{
        background: 'white', borderRadius: 'var(--radius-md)',
        width: '100%', maxWidth: '560px',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        {/* Modal header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Monitor size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>
              Layout Preview
            </span>
            <span style={{
              fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.6rem',
              borderRadius: 'var(--radius-sm)', background: 'rgba(245,158,11,0.12)',
              color: '#b45309', letterSpacing: '0.05em'
            }}>UNSAVED DRAFT</span>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'rgba(0,0,0,0.06)',
              borderRadius: 'var(--radius-sm)', padding: '0.35rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
              transition: 'background 0.15s',
            }}
            title="Close preview"
          >
            <X size={16} />
          </button>
        </div>

        {/* Audience tabs */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', gap: '0.4rem',
          background: 'rgba(0,0,0,0.01)',
          overflowX: 'auto',
        }}>
          {ALL_ROLES.map(role => {
            const MetaIcon = ROLE_METADATA[role].icon;
            return (
              <button key={role} style={{...tabBtnStyle(activeTab === role), flexShrink: 0}} onClick={() => setActiveTab(role)}>
                <MetaIcon size={13} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                {ROLE_METADATA[role].label}
              </button>
            );
          })}
        </div>

        {/* Section list */}
        <div style={{ overflowY: 'auto', padding: '1rem 1.5rem', flex: 1 }}>
          <div style={{
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
            marginBottom: '0.75rem', letterSpacing: '0.06em'
          }}>
            {visibleSections.length} VISIBLE SECTION{visibleSections.length !== 1 ? 'S' : ''} · {sections.length - visibleSections.length} HIDDEN
          </div>

          {/* Visible sections */}
          {visibleSections.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {visibleSections.map((s, i) => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem 0.9rem', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16,185,129,0.04)',
                  border: '1px solid var(--border)',
                }}>
                  <span style={{
                    minWidth: '1.4rem', textAlign: 'center',
                    fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)'
                  }}>{i + 1}</span>
                  <Eye size={13} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', flex: 1 }}>{s.label}</span>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-success)',
                    background: 'rgba(16,185,129,0.12)', padding: '0.15rem 0.55rem',
                    borderRadius: 'var(--radius-sm)'
                  }}>VISIBLE</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '2rem', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: '0.85rem',
              background: 'rgba(239,68,68,0.04)', borderRadius: 'var(--radius-md)',
              border: '1px dashed rgba(239,68,68,0.2)', marginBottom: '1.25rem'
            }}>
              No visible sections — users would see an empty page.
            </div>
          )}

          {/* Hidden sections — collapsed */}
          {sections.filter(s => !s.enabled).length > 0 && (
            <details style={{ fontSize: '0.82rem' }}>
              <summary style={{
                cursor: 'pointer', color: 'var(--text-muted)',
                fontWeight: 600, marginBottom: '0.5rem', userSelect: 'none'
              }}>
                {sections.filter(s => !s.enabled).length} hidden section(s)
              </summary>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                {sections.filter(s => !s.enabled).map(s => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.55rem 0.9rem', borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.02)',
                    border: '1px solid var(--border)',
                    opacity: 0.6,
                  }}>
                    <EyeOff size={13} color="var(--color-danger)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)', flex: 1 }}>{s.label}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-danger)',
                      background: 'rgba(239,68,68,0.08)', padding: '0.15rem 0.55rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>HIDDEN</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Modal footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end',
          background: 'rgba(0,0,0,0.01)',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-sm)',
              background: 'var(--primary)', color: 'white',
              border: 'none', fontWeight: 700, fontSize: '0.88rem',
              cursor: 'pointer', transition: 'opacity 0.15s',
            }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function SectionBadge({ enabled, locked }) {
  if (locked) return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-sm)', background: 'rgba(0,54,102,0.08)',
      color: 'var(--primary)', letterSpacing: '0.05em'
    }}>LOCKED</span>
  );
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-sm)',
      background: enabled ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
      color: enabled ? 'var(--success, #10b981)' : 'var(--error, #ef4444)',
      letterSpacing: '0.05em',
    }}>
      {enabled ? 'VISIBLE' : 'HIDDEN'}
    </span>
  );
}

// ─── Single-section row ───────────────────────────────────────────────────────

const VISIBILITY_OPTS = [
  { value: 'all',     label: 'All devices' },
  { value: 'desktop', label: 'Desktop only' },
  { value: 'mobile',  label: 'Mobile only' },
];

function SectionRow({
  section, index, total, onToggle, onMove, onVisibilityChange, isFiltered,
  isDragging, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd,
}) {
  const canDrag = !section.locked && !isFiltered;

  return (
    <div
      draggable={canDrag}
      onDragStart={canDrag ? (e) => {
        e.dataTransfer.effectAllowed = 'move';
        // Transparent drag ghost — looks cleaner than the browser default
        const ghost = document.createElement('div');
        ghost.style.cssText = 'position:fixed;top:-200px;left:-200px;opacity:0;';
        document.body.appendChild(ghost);
        e.dataTransfer.setDragImage(ghost, 0, 0);
        setTimeout(() => ghost.remove(), 0);
        onDragStart(index);
      } : undefined}
      onDragOver={canDrag ? (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        onDragOver(index);
      } : undefined}
      onDrop={canDrag ? (e) => { e.preventDefault(); onDrop(index); } : undefined}
      onDragEnd={onDragEnd}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: isDragOver
          ? 'rgba(0,150,204,0.06)'
          : section.enabled ? 'white' : 'rgba(0,0,0,0.02)',
        border: isDragOver
          ? '1.5px solid var(--secondary)'
          : `1.5px solid ${section.enabled ? 'var(--border)' : 'rgba(0,0,0,0.06)'}`,
        opacity: isDragging ? 0.4 : section.enabled ? 1 : 0.6,
        transform: isDragging ? 'scale(0.98)' : 'scale(1)',
        boxShadow: isDragOver ? '0 0 0 3px rgba(0,150,204,0.18)' : 'none',
        transition: 'all 0.15s',
        marginBottom: isDragOver ? '0.25rem' : '0.5rem',
        borderTop: isDragOver ? '3px solid var(--secondary)' : undefined,
        position: 'relative',
        cursor: canDrag ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: 'none',
      }}
    >
      {/* Drag handle */}
      <GripVertical
        size={16}
        color={canDrag ? 'var(--text-muted)' : 'var(--border)'}
        style={{ flexShrink: 0, opacity: canDrag ? 1 : 0.3 }}
      />

      {/* Order number */}
      <div style={{
        minWidth: '1.5rem', textAlign: 'center',
        fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)'
      }}>
        {index + 1}
      </div>

      {/* Label and ID */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {section.label}
          {section.locked && <Info size={12} color="var(--primary)" title="Mandatory section" />}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {section.id}
        </div>
      </div>

      {/* Status badge */}
      <SectionBadge enabled={section.enabled} locked={section.locked} />

      {/* Visibility selector */}
      <select
        value={section.visibility ?? 'all'}
        onChange={(e) => onVisibilityChange(index, e.target.value)}
        disabled={section.locked}
        title="Control which devices show this section"
        style={{
          fontSize: '0.72rem', fontWeight: 600, padding: '0.28rem 0.55rem',
          borderRadius: '7px', border: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.02)', color: 'var(--text-muted)',
          cursor: section.locked ? 'not-allowed' : 'pointer',
          outline: 'none', flexShrink: 0,
        }}
      >
        {VISIBILITY_OPTS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Arrow buttons — keyboard / mouse fallback for accessibility */}
      <div style={{ display: 'flex', gap: '0.25rem', opacity: isFiltered ? 0.3 : 1 }}>
        <button
          onClick={() => onMove(index, -1)}
          disabled={index === 0 || section.locked || isFiltered}
          title={isFiltered ? 'Cannot reorder while searching' : 'Move up'}
          style={iconBtnStyle(index === 0 || section.locked || isFiltered)}
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1 || section.locked || isFiltered}
          title={isFiltered ? 'Cannot reorder while searching' : 'Move down'}
          style={iconBtnStyle(index === total - 1 || section.locked || isFiltered)}
        >
          <ArrowDown size={14} />
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggle(index)}
        disabled={section.locked}
        title={section.enabled ? 'Hide section' : 'Show section'}
        style={{
          ...iconBtnStyle(section.locked),
          background: section.locked
            ? 'rgba(0,0,0,0.03)'
            : section.enabled
              ? 'rgba(16,185,129,0.12)'
              : 'rgba(239,68,68,0.1)',
          color: section.locked ? 'var(--text-muted)' : section.enabled ? 'var(--color-success)' : 'var(--color-danger)',
          padding: '0.45rem',
          borderRadius: 'var(--radius-sm)',
          width: '32px', height: '32px'
        }}
      >
        {section.enabled ? <Eye size={15} /> : <EyeOff size={15} />}
      </button>
    </div>
  );
}

const iconBtnStyle = (disabled) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.35 : 1, transition: 'all 0.15s', color: 'var(--text-main)',
  width: '28px', height: '28px'
});

// ─── Panel per audience ───────────────────────────────────────────────────────

function AudiencePanel({ title, icon: Icon, accent, sections, onChange }) {
  const [search, setSearch]       = useState('');
  const [dragIdx, setDragIdx]     = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const enabledCount = sections.filter(s => s.enabled).length;

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const term = search.toLowerCase();
    return sections.filter(s =>
      s.label.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term)
    );
  }, [sections, search]);

  const isFiltered = !!search.trim();

  const handleToggle = useCallback((idx) => {
    if (sections[idx].locked) return;
    const next = sections.map((s, i) =>
      i === idx ? { ...s, enabled: !s.enabled } : s
    );
    onChange(next);
  }, [sections, onChange]);

  const handleVisibility = useCallback((idx, value) => {
    if (sections[idx].locked) return;
    const next = sections.map((s, i) =>
      i === idx ? { ...s, visibility: value } : s
    );
    onChange(next);
  }, [sections, onChange]);

  const handleMove = useCallback((idx, dir) => {
    const next = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    const reordered = next.map((s, i) => ({ ...s, order: i }));
    onChange(reordered);
  }, [sections, onChange]);

  // ─── Drag handlers ─────────────────────────────────────────────────────────

  const handleDragStart = useCallback((idx) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((idx) => {
    setDragOverIdx(idx);
  }, []);

  const handleDrop = useCallback((dropIdx) => {
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const next = [...sections];
    const [removed] = next.splice(dragIdx, 1);
    next.splice(dropIdx, 0, removed);
    const reordered = next.map((s, i) => ({ ...s, order: i }));
    onChange(reordered);
    setDragIdx(null);
    setDragOverIdx(null);
  }, [dragIdx, sections, onChange]);

  const handleDragEnd = useCallback(() => {
    setDragIdx(null);
    setDragOverIdx(null);
  }, []);
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: 'white',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Panel header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
            background: `${accent}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={accent} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {enabledCount} of {sections.length} sections visible
            </div>
          </div>
        </div>
        {/* Mini progress bar */}
        <div style={{ width: 80, height: 6, borderRadius: 'var(--radius-sm)', background: 'var(--border)' }}>
          <div style={{
            height: '100%', borderRadius: 'var(--radius-sm)',
            width: `${(enabledCount / sections.length) * 100}%`,
            background: accent, transition: 'width 0.4s',
          }} />
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search sections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              outline: 'none',
              background: 'var(--bg-light, #f8f9fa)',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = accent}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Section rows */}
      <div
        style={{ padding: '1rem 1rem 0.5rem', maxHeight: '500px', overflowY: 'auto' }}
        onDragLeave={() => setDragOverIdx(null)}
      >
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => {
            const originalIndex = sections.findIndex(s => s.id === section.id);
            return (
              <SectionRow
                key={section.id}
                section={section}
                index={originalIndex}
                total={sections.length}
                onToggle={handleToggle}
                onMove={handleMove}
                onVisibilityChange={handleVisibility}
                isFiltered={isFiltered}
                isDragging={dragIdx === originalIndex}
                isDragOver={dragOverIdx === originalIndex}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
              />
            );
          })
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No sections match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function AdminHomeLayoutTab() {
  const { layout, loading, saveLayout } = useHomeLayout();
  const [draft, setDraft]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState('admin');

  // Working copy: draft ∥ layout from Firestore
  const working = draft ?? layout;

  const handleSectionsChange = useCallback((sections) => {
    setDraft((prev) => ({ ...(prev ?? layout), [activeRoleTab]: sections }));
    setSaved(false);
    setError(null);
  }, [layout, activeRoleTab]);

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await saveLayout(draft);
      setDraft(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[AdminHomeLayoutTab] save failed', err);
      setError({ message: 'Failed to save layout changes. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm(`Reset ${ROLE_METADATA[activeRoleTab].label} layout to factory defaults? This will overwrite current changes.`)) return;
    const defaults = PRO_ROLES.includes(activeRoleTab) ? DEFAULT_PRO_SECTIONS : DEFAULT_GUEST_SECTIONS;
    handleSectionsChange(defaults);
  };

  const handleCopyToOther = () => {
    const targetRole = window.prompt(`Copy ${ROLE_METADATA[activeRoleTab].label} layout to which role?\nAvailable: ${ALL_ROLES.filter(r => r !== activeRoleTab).join(', ')}`);
    if (!targetRole || !ALL_ROLES.includes(targetRole)) return;
    if (!window.confirm(`Overwrite ${targetRole} layout with ${activeRoleTab}'s layout?`)) return;
    
    setDraft((prev) => ({ ...(prev ?? layout), [targetRole]: working[activeRoleTab] }));
    setSaved(false);
    setError(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem', gap: '1rem', color: 'var(--text-muted)' }}>
        <Loader2 size={28} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontWeight: 600 }}>Loading layout config…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: '1.5rem', color: 'var(--primary)' }}>
            Home Layout Manager
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Control which sections are visible on each home page. Changes go live instantly.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {error?.message && (
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 600,
              background: 'rgba(239,68,68,0.1)', padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <AlertCircle size={16} /> {error.message}
            </div>
          )}
          {draft && (
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b',
              background: 'rgba(245,158,11,0.1)', padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              ● Unsaved changes
            </span>
          )}
          {saved && (
            <span style={{
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-success)',
              background: 'rgba(16,185,129,0.1)', padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              ✓ Saved successfully
            </span>
          )}
          {/* History button */}
          <button
            onClick={() => setShowHistory(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1.2rem', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            title="View version history"
          >
            <History size={15} /> History
          </button>

          {/* Preview button — always available */}
          <button
            onClick={() => setPreviewing(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'transparent',
              color: 'var(--primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1.2rem', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            title="Preview the current layout (does not save)"
          >
            <Monitor size={15} /> Preview
          </button>

          <button
            onClick={handleSave}
            disabled={!draft || saving}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: draft ? 'var(--primary)' : 'var(--border)',
              color: draft ? 'white' : 'var(--text-muted)',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '0.7rem 1.4rem', fontWeight: 700, fontSize: '0.9rem',
              cursor: draft ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: draft ? '0 4px 12px rgba(0,54,102,0.2)' : 'none'
            }}
          >
            {saving
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
              : <><Save size={15} /> Save Layout</>
            }
          </button>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {previewing && (
        <LayoutPreviewModal layout={working} onClose={() => setPreviewing(false)} />
      )}

      {/* ── History Drawer ── */}
      {showHistory && (
        <LayoutHistoryDrawer
          onClose={() => setShowHistory(false)}
          onRestore={() => { setDraft(null); setSaved(true); setTimeout(() => setSaved(false), 3000); }}
          saveLayout={saveLayout}
        />
      )}

      {/* ── Role Tab Selector ── */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        {ALL_ROLES.map(role => {
          const meta = ROLE_METADATA[role];
          const Icon = meta.icon;
          const isActive = activeRoleTab === role;
          return (
            <button
              key={role}
              onClick={() => setActiveRoleTab(role)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0,
                padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${isActive ? meta.color : 'var(--border)'}`,
                background: isActive ? meta.bgLight : 'white',
                color: isActive ? meta.color : 'var(--text-muted)',
                fontWeight: isActive ? 800 : 600, fontSize: '0.85rem',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <Icon size={16} /> {meta.label} Layout
            </button>
          );
        })}
      </div>

      {/* ── Active Panel ── */}
      <div style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {ROLE_METADATA[activeRoleTab].label} HOME SETTINGS
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['clinic', 'doctor', 'wholesaler', 'sales_agent', 'staff', 'patient'].includes(activeRoleTab) && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/${activeRoleTab}`);
                  alert(`Copied: ${window.location.origin}/${activeRoleTab}`);
                }} 
                style={{ ...linkBtnStyle, color: 'var(--primary)' }} 
                title="Copy public landing page link"
              >
                <Link size={12} /> Copy URL
              </button>
            )}
            <button onClick={handleCopyToOther} style={linkBtnStyle} title="Copy to another role">
              <Copy size={12} /> Copy to...
            </button>
            <button onClick={handleReset} style={linkBtnStyle}>
              <RotateCcw size={12} /> Reset to Default
            </button>
          </div>
        </div>
        <AudiencePanel
          title={`${ROLE_METADATA[activeRoleTab].label} Users`}
          icon={ROLE_METADATA[activeRoleTab].icon}
          accent={ROLE_METADATA[activeRoleTab].color}
          sections={working[activeRoleTab] || []}
          onChange={handleSectionsChange}
        />
      </div>

      {/* ── Info footer ── */}
      <div style={{
        marginTop: '2rem', padding: '1rem 1.25rem',
        background: 'rgba(0,54,102,0.04)', borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(0,54,102,0.08)',
        fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7
      }}>
        <strong style={{ color: 'var(--text-main)' }}>Admin Tips: </strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem' }}>
          <li>Changes to <code>config/homeLayout</code> take effect immediately across the site.</li>
          <li>Sections marked <strong>LOCKED</strong> are mandatory and cannot be disabled.</li>
          <li>Reordering is disabled while searching to prevent accidental placement errors.</li>
          <li>Use <strong>Sync</strong> to quickly duplicate a layout between audiences.</li>
        </ul>
      </div>
    </div>
  );
}

const linkBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '0.35rem',
  background: 'transparent', border: 'none',
  color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600,
  cursor: 'pointer', padding: '0.3rem 0.5rem', borderRadius: 'var(--radius-sm)',
  transition: 'all 0.2s',
};

