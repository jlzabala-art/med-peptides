"use client";

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

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getAllRelationships, updateRelationshipStatus } from '../../services/assignmentService';
import { collection, getDocs } from 'firebase/firestore';
import notifier from '../../services/NotificationService';
import { db } from '../../firebase';
import { RefreshCw, Activity } from '@/lib/icons';

import { MetricCard } from '../ui';
import DataTable from '../ui/DataTable';
import PageHeader from '../ui/PageHeader';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import StatusBadge from '../ui/StatusBadge';
import CopyableId from '../ui/CopyableId';

// ── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(isoString) {
  if (!isoString) return null;
  const diff = Date.now() - new Date(isoString).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminSupervisionTab({ isSubTab = false, onNavigateToClinicalAI }) {
  const [relationships, setRelationships] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
  }

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

  const filtered = useMemo(() => {
    let res = relationships;
    if (statusFilter) {
      res = res.filter(r => r.status === statusFilter);
    }
    return res;
  }, [relationships, statusFilter]);

  const userName = (uid) => userMap[uid]?.displayName || uid;

  // ── Search & Filters Integration ─────────────────────────────────────────────
  const activeFilters = [];
  if (statusFilter) {
    activeFilters.push({
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onRemove: () => setStatusFilter('')
    });
  }

  const filterOptions = [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { label: 'Todos', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Paused', value: 'paused' },
        { label: 'Revoked', value: 'revoked' }
      ],
      value: statusFilter,
      onChange: setStatusFilter
    }
  ];

  // ── Styles ───────────────────────────────────────────────────────────────────
  const s = {
    root: {
      padding: '0 2rem 2rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
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

  const columns = useMemo(() => [
    {
      key: 'id',
      header: 'ID',
      render: (val, row) => <CopyableId value={row.id} />
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{userName(row.patientId)}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
            {userMap[row.patientId]?.email}
          </div>
        </div>
      )
    },
    {
      key: 'physician',
      header: 'Physician',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{userName(row.doctorId)}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 11 }}>
            {userMap[row.doctorId]?.email}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (val, row) => <StatusBadge status={row.status} />
    },
    {
      key: 'initiatedByRole',
      header: 'Initiated By',
      render: (val) => <span style={{ textTransform: 'capitalize', color: 'var(--color-text-tertiary)' }}>{val}</span>
    },
    {
      key: 'age',
      header: 'Age',
      render: (val, row) => {
        const age = daysSince(row.createdAt);
        return (
          <span style={{ color: age >= 7 && row.status === 'pending' ? '#f59e0b' : 'var(--color-text-secondary)' }}>
            {age !== null ? `${age}d` : '—'}
          </span>
        );
      }
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (val) => <span style={{ color: 'var(--color-text-secondary)', fontSize: 12 }}>{val || '—'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, r) => {
        const isLoading = (k) => actionLoading === r.id + k;
        return (
          <div>
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
          </div>
        );
      }
    }
  ], [userMap, actionLoading]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>
      {/* Header (Golden Rule #9) */}
      <PageHeader
        title="Supervisión"
        subtitle="Monitoreo de relaciones"
        actions={
          <button className="gcp-btn-secondary" onClick={loadData} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            {loading ? 'Cargando…' : 'Refresh'}
          </button>
        }
      />

      {/* Global Search & Filters (Golden Rule #7) */}
      <div>
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por paciente, médico o notas..."
          resultCount={filtered.length}
          namespace="admin-supervision"
          size="lg"
          filters={activeFilters}
          filterOptions={filterOptions}
        />
      </div>

      {/* KPI Cards */}
      <div style={s.kpiRow}>
        <MetricCard
          title="Active"
          value={counts.active || 0}
          color="var(--color-success)"
          icon="✅"
          onClick={() => {
            setStatusFilter('active');
            onNavigateToClinicalAI?.({
              filter: 'active',
              label: 'Active Relationships',
              icon: '✅',
              count: counts.active || 0,
              note: 'Patients with active medical supervision',
            });
          }}
        />
        <MetricCard
          title="Pending"
          value={counts.pending || 0}
          color="#f59e0b"
          icon="⏳"
          onClick={() => {
            setStatusFilter('pending');
            onNavigateToClinicalAI?.({
              filter: 'pending',
              label: 'Pending Relationships',
              icon: '⏳',
              count: counts.pending || 0,
              note: 'Awaiting confirmation from both parties',
            });
          }}
        />
        <MetricCard
          title="Paused"
          value={counts.paused || 0}
          color="#6366f1"
          icon="⏸"
          onClick={() => {
            setStatusFilter('paused');
            onNavigateToClinicalAI?.({
              filter: 'paused',
              label: 'Paused Relationships',
              icon: '⏸',
              count: counts.paused || 0,
              note: 'Supervision temporarily suspended',
            });
          }}
        />
        <MetricCard
          title="Revoked"
          value={counts.revoked || 0}
          color="var(--color-danger)"
          icon="🚫"
          onClick={() => {
            setStatusFilter('revoked');
            onNavigateToClinicalAI?.({
              filter: 'revoked',
              label: 'Revoked Relationships',
              icon: '🚫',
              count: counts.revoked || 0,
              note: 'Relationships revoked by admin or physician',
            });
          }}
        />
        <MetricCard
          title="Total"
          value={relationships.length}
          color="var(--color-text-tertiary)"
          icon="🔗"
          onClick={() => {
            setStatusFilter('');
            onNavigateToClinicalAI?.({
              filter: 'all',
              label: 'All Relationships',
              icon: '🔗',
              count: relationships.length,
              note: 'Global overview of the supervision system',
            });
          }}
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

      {/* Table */}
      {loading ? (
        <div style={s.emptyState}>Loading relationships…</div>
      ) : filtered.length === 0 ? (
        <div style={s.emptyState}>No relationships match the selected filter.</div>
      ) : (
        <div className="gcp-table-container gcp-table-container--dark">
          <DataTable
            columns={columns}
            data={filtered}
            keyField={(row) => row.id}
            globalSearch={true}
            searchQuery={searchQuery}
          />
        </div>
      )}
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminSupervisionTab | Props: none
      </div>
    
    </div>
  );
}
