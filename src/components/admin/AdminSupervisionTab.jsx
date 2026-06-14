/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
/**
 * AdminSupervisionTab.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 8 — Administrative Supervision Monitor
 *
 * Shows:
 *  - KPI cards: total active, pending, paused, revoked relationships
 *  - Alert list: pending relationships older than 7 days (bottleneck flag)
 *  - Relationship table with quick-action buttons (activate / pause / revoke)
 *  - Refresh button
 */

import React, { useEffect, useState, useCallback } from 'react';
import { getAllRelationships, updateRelationshipStatus } from '../../services/assignmentService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import notifier from '../../services/NotificationService';
import { db } from '../../firebase';
import { MetricCard, StatusChip } from '../ui';

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(isoString) {
  if (!isoString) return null;
  const diff = Date.now() - new Date(isoString).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ label, value, color, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#1a1a2e',
        border: `1px solid ${color}33`,
        borderRadius: 12,
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flex: '1 1 160px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${color}22`;
          e.currentTarget.style.borderColor = `${color}77`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = `${color}33`;
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `${color}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{label}</div>
        {onClick && (
          <div
            style={{
              fontSize: 10,
              color: `${color}99`,
              marginTop: 4,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            View in AI →
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminSupervisionTab({ onNavigateToClinicalAI }) {
  const [relationships, setRelationships] = useState([]);
  const [userMap, setUserMap] = useState({}); // uid → { displayName, email, role }
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Load users for name resolution ─────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const map = {};
      snap.forEach((d) => {
        const u = d.data();
        map[d.id] = {
          displayName: u.displayName || u.name || u.email || d.id,
          email: u.email || '',
          role: u.role || 'unknown',
        };
      });
      setUserMap(map);
    } catch (_) {
      // non-blocking
    }
  }, []);

  // ── Load all relationships ──────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rels] = await Promise.all([getAllRelationships(), loadUsers()]);
      // Sort: pending first, then active, then others — newest first within group
      const sorted = [...rels].sort((a, b) => {
        const order = { pending: 0, active: 1, paused: 2, revoked: 3 };
        const byStatus = (order[a.status] ?? 9) - (order[b.status] ?? 9);
        if (byStatus !== 0) return byStatus;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setRelationships(sorted);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function handleAction(relId, newStatus) {
    setActionLoading(relId + newStatus);
    try {
      await updateRelationshipStatus(relId, newStatus);
      await loadData();
    } catch (e) {
      notifier.info('Error: ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const counts = relationships.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const alerts = relationships.filter((r) => {
    if (r.status !== 'pending') return false;
    const age = daysSince(r.createdAt);
    return age !== null && age >= 7;
  });

  const filtered =
    statusFilter === 'all' ? relationships : relationships.filter((r) => r.status === statusFilter);

  const userName = (uid) => userMap[uid]?.displayName || uid;

  // ── Styles ───────────────────────────────────────────────────────────────────
  const s = {
    root: {
      padding: '28px 32px',
      background: '#0f0f1a',
      minHeight: '100%',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: 'var(--color-border)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 28,
    },
    title: { fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 },
    subtitle: { fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 },
    refreshBtn: {
      padding: '8px 18px',
      borderRadius: 8,
      border: '1px solid #334155',
      background: 'transparent',
      color: 'var(--color-text-tertiary)',
      cursor: 'pointer',
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    kpiRow: { display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 },
    alertBox: {
      background: '#1c1208',
      border: '1px solid #f59e0b44',
      borderRadius: 12,
      padding: '14px 20px',
      marginBottom: 24,
    },
    alertTitle: { color: '#fbbf24', fontWeight: 600, fontSize: 14, marginBottom: 10 },
    alertItem: {
      fontSize: 13,
      color: '#d4a44c',
      padding: '4px 0',
      borderBottom: '1px solid #f59e0b22',
    },
    filterRow: {
      display: 'flex',
      gap: 8,
      marginBottom: 16,
      flexWrap: 'wrap',
    },
    filterBtn: (active) => ({
      padding: '5px 14px',
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
      border: active ? 'none' : '1px solid #334155',
      background: active ? '#6366f1' : 'transparent',
      color: active ? 'var(--color-bg-surface)' : 'var(--color-text-tertiary)',
      cursor: 'pointer',
    }),
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      fontSize: 13,
    },
    th: {
      textAlign: 'left',
      padding: '10px 14px',
      color: 'var(--color-text-secondary)',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      borderBottom: '1px solid #1e293b',
      letterSpacing: '0.06em',
    },
    td: (i) => ({
      padding: '12px 14px',
      borderBottom: '1px solid #1e293b',
      background: i % 2 === 0 ? '#111827' : '#0f172a',
      verticalAlign: 'middle',
    }),
    actionBtn: (color) => ({
      padding: '4px 10px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      border: 'none',
      background: `${color}22`,
      color,
      cursor: 'pointer',
      marginRight: 4,
    }),
    emptyState: {
      textAlign: 'center',
      padding: '48px 0',
      color: 'var(--color-text-secondary)',
      fontSize: 14,
    },
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Supervision Monitor</h2>
          <p style={s.subtitle}>Live overview of all doctor-patient relationships</p>
        </div>
        <button style={s.refreshBtn} onClick={loadData} disabled={loading}>
          {loading ? '⟳ Loading…' : '⟳ Refresh'}
        </button>
      </div>

      {/* KPI Cards */}
      <div style={s.kpiRow}>
        <MetricCard
          title="Active"
          value={counts.active || 0}
          color="var(--color-success)"
          icon="✅"
          onClick={() =>
            onNavigateToClinicalAI?.({
              filter: 'active',
              label: 'Active Relationships',
              icon: '✅',
              count: counts.active || 0,
              note: 'Patients with active medical supervision',
            })
          }
        />
        <MetricCard
          title="Pending"
          value={counts.pending || 0}
          color="#f59e0b"
          icon="⏳"
          onClick={() =>
            onNavigateToClinicalAI?.({
              filter: 'pending',
              label: 'Pending Relationships',
              icon: '⏳',
              count: counts.pending || 0,
              note: 'Awaiting confirmation from both parties',
            })
          }
        />
        <MetricCard
          title="Paused"
          value={counts.paused || 0}
          color="#6366f1"
          icon="⏸"
          onClick={() =>
            onNavigateToClinicalAI?.({
              filter: 'paused',
              label: 'Paused Relationships',
              icon: '⏸',
              count: counts.paused || 0,
              note: 'Supervision temporarily suspended',
            })
          }
        />
        <MetricCard
          title="Revoked"
          value={counts.revoked || 0}
          color="var(--color-danger)"
          icon="🚫"
          onClick={() =>
            onNavigateToClinicalAI?.({
              filter: 'revoked',
              label: 'Revoked Relationships',
              icon: '🚫',
              count: counts.revoked || 0,
              note: 'Relationships revoked by admin or physician',
            })
          }
        />
        <MetricCard
          title="Total"
          value={relationships.length}
          color="var(--color-text-tertiary)"
          icon="🔗"
          onClick={() =>
            onNavigateToClinicalAI?.({
              filter: 'all',
              label: 'All Relationships',
              icon: '🔗',
              count: relationships.length,
              note: 'Global overview of the supervision system',
            })
          }
        />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={s.alertBox}>
          <div style={s.alertTitle}>
            ⚠️ Bottleneck Alerts — {alerts.length} pending relationship
            {alerts.length > 1 ? 's' : ''} older than 7 days
          </div>
          {alerts.map((r) => (
            <div key={r.id} style={s.alertItem}>
              {userName(r.patientId)} ↔ {userName(r.doctorId)}
              <span style={{ marginLeft: 10, color: '#f59e0b80' }}>
                ({daysSince(r.createdAt)}d ago — initiated by {r.initiatedByRole})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ color: 'var(--color-danger)', marginBottom: 16, fontSize: 13 }}>
          Error: {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={s.filterRow}>
        {['all', 'active', 'pending', 'paused', 'revoked'].map((f) => (
          <button
            key={f}
            style={s.filterBtn(statusFilter === f)}
            onClick={() => setStatusFilter(f)}
          >
            {f === 'all' ? `All (${relationships.length})` : `${f} (${counts[f] || 0})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={s.emptyState}>Loading relationships…</div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>No relationships match the selected filter.</div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #1e293b' }}>
          <table className="gcp-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Physician</th>
                <th>Status</th>
                <th>Initiated By</th>
                <th>Age</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const age = daysSince(r.createdAt);
                const isLoading = (k) => actionLoading === r.id + k;
                return (
                  <tr key={r.id}>
                    <td style={s.td(i)}>
                      <div style={{ fontWeight: 600 }}>{userName(r.patientId)}</div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
                        {userMap[r.patientId]?.email}
                      </div>
                    </td>
                    <td style={s.td(i)}>
                      <div style={{ fontWeight: 600 }}>{userName(r.doctorId)}</div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
                        {userMap[r.doctorId]?.email}
                      </div>
                    </td>
                    <td style={s.td(i)}>
                      <StatusChip status={r.status} />
                    </td>
                    <td style={s.td(i)}>
                      <span
                        style={{ textTransform: 'capitalize', color: 'var(--color-text-tertiary)' }}
                      >
                        {r.initiatedByRole}
                      </span>
                    </td>
                    <td style={s.td(i)}>
                      <span
                        style={{
                          color:
                            age >= 7 && r.status === 'pending'
                              ? '#f59e0b'
                              : 'var(--color-text-secondary)',
                        }}
                      >
                        {age !== null ? `${age}d` : '—'}
                      </span>
                    </td>
                    <td style={s.td(i)}>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>
                        {r.notes || '—'}
                      </span>
                    </td>
                    <td style={s.td(i)}>
                      {r.status === 'pending' && (
                        <button
                          style={s.actionBtn('var(--color-success)')}
                          onClick={() => handleAction(r.id, 'active')}
                          disabled={isLoading('active')}
                        >
                          {isLoading('active') ? '…' : 'Activate'}
                        </button>
                      )}
                      {r.status === 'active' && (
                        <button
                          style={s.actionBtn('#6366f1')}
                          onClick={() => handleAction(r.id, 'paused')}
                          disabled={isLoading('paused')}
                        >
                          {isLoading('paused') ? '…' : 'Pause'}
                        </button>
                      )}
                      {r.status === 'paused' && (
                        <button
                          style={s.actionBtn('var(--color-success)')}
                          onClick={() => handleAction(r.id, 'active')}
                          disabled={isLoading('active')}
                        >
                          {isLoading('active') ? '…' : 'Reactivate'}
                        </button>
                      )}
                      {r.status !== 'revoked' && (
                        <button
                          style={s.actionBtn('var(--color-danger)')}
                          onClick={() => {
                            notifier.confirmCritical('Revoke this relationship?', async () => {
                              handleAction(r.id, 'revoked');
                            });
                          }}
                          disabled={isLoading('revoked')}
                        >
                          {isLoading('revoked') ? '…' : 'Revoke'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminSupervisionTab | Props: none
      </div>
    
</div>
  );
}
