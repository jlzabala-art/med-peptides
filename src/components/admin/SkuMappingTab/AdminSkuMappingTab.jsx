import { useLocation } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Check,
  X,
  Database,
  Info,
  Search,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

/**
 * AdminSkuMappingTab.jsx
 *
 * Dense Google Cloud Console-themed dashboard tab for reviewing and managing
 * Firebase ↔ Zoho Books SKU mappings.
 * Features:
 *   - Clean flat GCP Console light-theme layout (no rounded cards or emojis).
 *   - Status icons with browser-native tooltips.
 *   - Checkboxes for bulk actions (Confirm, Reject, Push, Dry Run Push).
 *   - Expandable tree rows with chevrons to display side-by-side details
 *     and trigger manual refetches logged to Firestore.
 */

const AGENT_URL = 'https://europe-west1-med-peptides-app.cloudfunctions.net/skuSyncAgent';

// STATUS META mapping to Lucide icons and colors
const STATUS_META = {
  pending: {
    label: 'Pending Review',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.06)',
    icon: HelpCircle,
    border: '#f59e0b',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'var(--color-success)',
    bg: 'rgba(16,185,129,0.06)',
    icon: CheckCircle2,
    border: 'var(--color-success)',
  },
  rejected: {
    label: 'Rejected',
    color: 'var(--color-danger)',
    bg: 'rgba(239,68,68,0.06)',
    icon: XCircle,
    border: 'var(--color-danger)',
  },
  synced: {
    label: 'Synced to Zoho',
    color: '#1a73e8',
    bg: 'rgba(26,115,232,0.06)',
    icon: RefreshCw,
    border: '#1a73e8',
  },
  error: {
    label: 'Sync Error',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.06)',
    icon: AlertTriangle,
    border: '#f43f5e',
  },
  zoho_only: {
    label: 'Zoho Only',
    color: '#5f6368',
    bg: 'rgba(95,99,104,0.06)',
    icon: Database,
    border: '#5f6368',
  },
  firebase_only: {
    label: 'Firebase Only',
    color: '#fbbc04',
    bg: 'rgba(251,188,4,0.06)',
    icon: Database,
    border: '#fbbc04',
  },
};

async function callAgent(mode, extra = {}, token) {
  const resp = await fetch(AGENT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ mode, ...extra }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export default function AdminSkuMappingTab() {
  const { user, userProfile } = useAuth();
  const [mappings, setMappings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [syncingRowId, setSyncingRowId] = useState(null);
  const [log, setLog] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const deepLinkSearch = params.get('search');

  useEffect(() => {
    if (deepLinkSearch) {
      setSearchQuery(deepLinkSearch);
    }
  }, [deepLinkSearch]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedRowIds, setExpandedRowIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [edits, setEdits] = useState({});

  const addLog = (msg, type = 'info') =>
    setLog((prev) => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 30));

  const getToken = async () => user?.getIdToken?.();

  // Create standard request body for agents (explicitly adding email for audit logging)
  const agentBody = (mode, extra = {}) => ({
    mode,
    userProfile: userProfile
      ? {
          role: userProfile.role,
          uid: userProfile.uid || user?.uid,
          email: userProfile.email || user?.email,
        }
      : { role: 'admin', uid: user?.uid, email: user?.email },
    ...extra,
  });

  // ── Load current status ───────────────────────────────────────────────────
  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await callAgent('status', agentBody('status'), token);
      setMappings(data.records || []);
      setStats(data.statusCounts || null);
      addLog(`Loaded ${data.total || 0} mappings`, 'success');
    } catch (e) {
      addLog(`Failed to load mappings: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    loadStatus();
  }, []);

  const handleEditChange = (id, field, value) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const handleCopyField = (mappingId, m, sourcePrefix, targetPrefix, field) => {
    const sourceField = `${sourcePrefix}_${field}`;
    const targetField = `${targetPrefix}_${field}`;
    
    let val = edits[mappingId]?.[sourceField];
    if (val === undefined) {
      if (sourceField === 'firebase_category' && field === 'category') val = m.category || '';
      else if (sourceField === 'zoho_category' && field === 'category') val = m.zoho_category || m.category || '';
      else if (sourceField === 'firebase_sale_usd' && field === 'sale_price') val = m.guest_usd || 0;
      else if (sourceField === 'zoho_sale_aed' && field === 'sale_price') val = m.guest_aed || 0;
      else val = m[sourceField] || '';
    }

    // Handle currency conversion
    if (field === 'sale_price') {
      if (sourcePrefix === 'firebase') {
        // USD to AED
        val = (parseFloat(val) || 0) * 3.673;
        handleEditChange(mappingId, 'guest_aed', val.toFixed(2));
      } else {
        // AED to USD
        val = (parseFloat(val) || 0) / 3.673;
        handleEditChange(mappingId, 'guest_usd', val.toFixed(2));
      }
      return;
    }

    if (field === 'purchase_price') {
      if (sourcePrefix === 'firebase') {
        // USD to AED
        val = (parseFloat(val) || 0) * 3.673;
        handleEditChange(mappingId, 'zoho_purchase_rate', val.toFixed(2));
      } else {
        // AED to USD
        val = (parseFloat(val) || 0) / 3.673;
        handleEditChange(mappingId, 'firebase_purchase_usd', val.toFixed(2));
      }
      return;
    }

    handleEditChange(mappingId, targetField, val);
  };

  const handleSaveAndSync = async (m) => {
    const editData = edits[m.id] || {};
    // If nothing edited, fallback to existing values
    const payload = {
      mappingId: m.id,
      firebase_name: editData.firebase_name !== undefined ? editData.firebase_name : m.firebase_name,
      zoho_name: editData.zoho_name !== undefined ? editData.zoho_name : m.zoho_name,
      firebase_category: editData.firebase_category !== undefined ? editData.firebase_category : (m.category || ''),
      zoho_category: editData.zoho_category !== undefined ? editData.zoho_category : (m.zoho_category || m.category || ''),
      firebase_sku: editData.firebase_sku !== undefined ? editData.firebase_sku : m.firebase_sku,
      zoho_sku: editData.zoho_sku !== undefined ? editData.zoho_sku : m.zoho_sku,
      guest_usd: editData.guest_usd !== undefined ? editData.guest_usd : m.guest_usd,
      guest_aed: editData.guest_aed !== undefined ? editData.guest_aed : m.guest_aed,
      firebase_purchase_usd: editData.firebase_purchase_usd !== undefined ? editData.firebase_purchase_usd : m.firebase_purchase_usd,
      zoho_purchase_rate: editData.zoho_purchase_rate !== undefined ? editData.zoho_purchase_rate : m.zoho_purchase_rate,
      firebase_description: editData.firebase_description !== undefined ? editData.firebase_description : m.firebase_description,
      zoho_description: editData.zoho_description !== undefined ? editData.zoho_description : m.zoho_description,
      firebase_purchase_description: editData.firebase_purchase_description !== undefined ? editData.firebase_purchase_description : m.firebase_purchase_description,
      zoho_purchase_description: editData.zoho_purchase_description !== undefined ? editData.zoho_purchase_description : m.zoho_purchase_description,
      firebase_supplier_name: editData.firebase_supplier_name !== undefined ? editData.firebase_supplier_name : m.firebase_supplier_name,
      zoho_vendor_name: editData.zoho_vendor_name !== undefined ? editData.zoho_vendor_name : m.zoho_vendor_name,
    };

    setSyncingRowId(m.id);
    addLog(`Saving edits and syncing mapping ${m.id.slice(-8)}...`, 'info');
    try {
      const token = await getToken();
      await callAgent('sync_and_save', agentBody('sync_and_save', payload), token);
      addLog(`✅ Saved and synced mapping ${m.id.slice(-8)}`, 'success');
      // Clear edits for this row on success
      setEdits(prev => {
        const next = { ...prev };
        delete next[m.id];
        return next;
      });
      await loadStatus();
    } catch (e) {
      addLog(`Sync failed: ${e.message}`, 'error');
    } finally {
      setSyncingRowId(null);
    }
  };

  // ── Run discovery ─────────────────────────────────────────────────────────
  async function runDiscover() {
    setLoading(true);
    addLog('🔍 Starting AI discovery — fetching both catalogs...', 'info');
    try {
      const token = await getToken();
      const data = await callAgent(
        'discover',
        agentBody('discover', { aedRate: 3.67, useAI: false }),
        token
      );
      addLog(
        `Discovery complete: ${data.matched || 0} matched (${data.auto_confirmed || 0} auto-confirmed, ${data.needs_review || 0} need review)`,
        'success'
      );
      await loadStatus();
    } catch (e) {
      addLog(`Discovery failed: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Confirm / Reject mapping ──────────────────────────────────────────────
  async function handleAction(mappingId, action) {
    setActionId(mappingId);
    try {
      const token = await getToken();
      await callAgent('confirm', agentBody('confirm', { mappingId, action }), token);
      addLog(
        `${action === 'confirm' ? '✅ Confirmed' : '❌ Rejected'} mapping ${mappingId.slice(-8)}`,
        action === 'confirm' ? 'success' : 'warn'
      );
      await loadStatus();
    } catch (e) {
      addLog(`Action failed: ${e.message}`, 'error');
    } finally {
      setActionId(null);
    }
  };

  // ── Bulk Actions Handler ──────────────────────────────────────────────────
  async function handleBulkAction(action) {
    setLoading(true);
    addLog(`Starting bulk action '${action}' for ${selectedIds.length} items...`, 'info');
    try {
      const token = await getToken();
      if (action === 'confirm' || action === 'reject') {
        await callAgent(
          'confirm_bulk',
          agentBody('confirm_bulk', { mappingIds: selectedIds, action }),
          token
        );
        addLog(
          `Bulk ${action === 'confirm' ? 'Confirm' : 'Reject'} completed for ${selectedIds.length} mappings`,
          'success'
        );
      } else if (action === 'push' || action === 'push_dry') {
        const dryRun = action === 'push_dry';
        const data = await callAgent(
          'push_bulk',
          agentBody('push_bulk', { mappingIds: selectedIds, dryRun }),
          token
        );
        addLog(
          `${dryRun ? '[DRY RUN] ' : ''}Bulk Pushed: ${data.pushed ?? 0}, Failed: ${data.failed ?? 0}`,
          'success'
        );
      }
      setSelectedIds([]);
      await loadStatus();
    } catch (e) {
      addLog(`Bulk action failed: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Row selection helpers ──────────────────────────────────────────────────
  const baseFiltered = filter === 'all' 
    ? mappings 
    : mappings.filter((m) => m.status === filter);
        
  const filtered = baseFiltered.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (m.firebase_name || '').toLowerCase().includes(q) ||
           (m.zoho_name || '').toLowerCase().includes(q) ||
           (m.firebase_sku || '').toLowerCase().includes(q) ||
           (m.zoho_sku || '').toLowerCase().includes(q);
  });

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const handleSelectRow = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    const visibleIds = filtered.map((m) => m.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleRowExpanded = (id) => {
    setExpandedRowIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const formatDate = (ts) => {
    if (!ts) return 'Never';
    if (typeof ts === 'string') return new Date(ts).toLocaleString();
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
    if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleString();
    return 'Never';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🔄 SKU Synchronization</h2>
          <p style={styles.subtitle}>Firebase Catalog ↔ Zoho Books (MEDILUXE · 662274409 · AED)</p>
        </div>
        <div style={styles.headerActions}>
          <div title="Reloads current status without triggering any sync or AI logic" style={{ display: 'inline-block' }}>
            <button style={styles.btnGcpSecondary} onClick={loadStatus} disabled={loading}>
              <RefreshCw size={14} style={{ marginRight: 6, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>
          <div title="Uses Atlas AI to rescan Firebase and Zoho catalogs to find new matches" style={{ display: 'inline-block' }}>
            <button style={styles.btnGcpPrimary} onClick={runDiscover} disabled={loading}>
              <Search size={14} style={{ marginRight: 6 }} />
              Find Matches
            </button>
          </div>
        </div>
      </div>

      {/* GCP Flat Stats cards */}
      {stats && (
        <div style={styles.statsRow}>
          {Object.entries(STATUS_META).map(([key, meta]) => {
            const IconComponent = meta.icon;
            return (
              <div
                key={key}
                style={{
                  ...styles.statCard,
                  borderTop: `3px solid ${meta.color}`,
                  cursor: 'pointer',
                }}
                onClick={() => setFilter(filter === key ? 'all' : key)}
              >
                <div style={styles.statCardHeader}>
                  <span style={styles.statCardLabel}>{meta.label}</span>
                  <IconComponent size={14} style={{ color: meta.color }} />
                </div>
                <span style={styles.statCardValue}>{stats[key] || 0}</span>
              </div>
            );
          })}
          <div style={{ ...styles.statCard, borderTop: '3px solid #5f6368' }}>
            <div style={styles.statCardHeader}>
              <span style={styles.statCardLabel}>Total Records</span>
              <Database size={14} style={{ color: '#5f6368' }} />
            </div>
            <span style={styles.statCardValue}>{mappings.length}</span>
          </div>
        </div>
      )}

      {/* Compact Filters / Actions Bar */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#3c4043' }}>Filter View:</span>
          <select 
            value={filter} 
            onChange={(e) => {
              setFilter(e.target.value);
            }}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              border: '1px solid #dadce0',
              borderRadius: '4px',
              backgroundColor: '#fff',
              color: '#202124',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '180px'
            }}
          >
            <option value="all">All Mappings ({mappings.length})</option>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label} ({mappings.filter((m) => m.status === key).length})
              </option>
            ))}
          </select>
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#dadce0', margin: '0 8px' }}></div>
        
        <div style={{ position: 'relative', flex: 1, minWidth: 250, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#5f6368' }} />
          <input 
            type="text" 
            placeholder="Search by Name or SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 4, border: '1px solid #dadce0', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Sticky Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div style={styles.bulkBar}>
          <div style={styles.bulkText}>
            <Info size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            {selectedIds.length} mapping{selectedIds.length > 1 ? 's' : ''} selected
          </div>
          <div style={styles.bulkActions}>
            <button
              style={styles.btnGcpSuccessBorder}
              onClick={() => handleBulkAction('confirm')}
              disabled={loading}
            >
              Bulk Confirm
            </button>
            <button
              style={styles.btnGcpDangerBorder}
              onClick={() => handleBulkAction('reject')}
              disabled={loading}
            >
              Bulk Reject
            </button>
            <button
              style={styles.btnGcpSecondary}
              onClick={() => handleBulkAction('push_dry')}
              disabled={loading}
            >
              Dry Run Push
            </button>
            <button
              style={styles.btnGcpPrimary}
              onClick={() => handleBulkAction('push')}
              disabled={loading}
            >
              Push Selected
            </button>
            <button style={styles.btnGcpGray} onClick={() => setSelectedIds([])} disabled={loading}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableWrapper}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            {mappings.length === 0
              ? 'No mappings discovered yet. Click "Run Discovery" to scan catalogs.'
              : `No mappings match the active filter: ${filter}`}
          </div>
        ) : (
          <>
            <table className="gcp-table" style={styles.table}>
            <thead>
              <tr style={{ borderBottom: '1px solid #dadce0' }}>
                <th style={{ width: '30px', padding: '8px 10px' }}></th>
                <th style={{ width: '40px', padding: '8px 10px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 && filtered.every((m) => selectedIds.includes(m.id))
                    }
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={styles.th}>Product Details</th>
                <th style={styles.th}>Confidence</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((m) => {
                const isZohoOnly = m.status === 'zoho_only';
                const isFirebaseOnly = m.status === 'firebase_only';
                
                let meta;
                if (isZohoOnly) meta = { icon: Database, color: '#5f6368', label: 'In Zoho Only' };
                else if (isFirebaseOnly) meta = { icon: Database, color: '#fbbc04', label: 'In Firebase Only' };
                else meta = STATUS_META[m.status] || STATUS_META.pending;

                const IconComponent = meta.icon;
                const isActing = actionId === m.id;
                const isExpanded = expandedRowIds.includes(m.id);
                const isSelected = selectedIds.includes(m.id);

                return (
                  <React.Fragment key={m.id}>
                    <tr
                      style={{
                        ...styles.tr,
                        backgroundColor: isSelected
                          ? '#f4f8fe'
                          : isExpanded
                            ? 'var(--color-bg-app)'
                            : 'transparent',
                      }}
                    >
                      {/* Toggle Chevron */}
                      <td
                        style={{
                          padding: '8px 10px',
                          verticalAlign: 'middle',
                          textAlign: 'center',
                        }}
                      >
                        <button
                          type="button"
                          style={styles.chevronBtn}
                          onClick={() => toggleRowExpanded(m.id)}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>

                      {/* Checkbox */}
                      <td
                        style={{
                          padding: '8px 10px',
                          verticalAlign: 'middle',
                          textAlign: 'center',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(m.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Product Details (Dual Line) */}
                      <td
                        style={{ ...styles.td, cursor: 'pointer' }}
                        onClick={() => toggleRowExpanded(m.id)}
                      >
                        {/* Firebase Line */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', width: 65 }}>Firebase</span>
                          <div style={styles.productName}>{m.firebase_name || <span style={{color: '#9aa0a6', fontStyle: 'italic'}}>Missing</span>}</div>
                          <code style={styles.sku}>{m.firebase_sku || '—'}</code>
                        </div>
                        {/* Zoho Line */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#34a853', textTransform: 'uppercase', width: 65 }}>Zoho</span>
                          <div style={styles.productName}>{m.zoho_name || <span style={{color: '#9aa0a6', fontStyle: 'italic'}}>Missing</span>}</div>
                          <code style={styles.sku}>{m.zoho_sku || '—'}</code>
                        </div>
                      </td>
                      {/* Match Confidence */}
                      <td style={styles.td}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: 12,
                          fontWeight: 700,
                          background:
                            (m.match_confidence || 0) >= 85
                              ? 'rgba(16,185,129,0.1)'
                              : (m.match_confidence || 0) >= 60
                                ? 'rgba(245,158,11,0.1)'
                                : 'rgba(239,68,68,0.1)',
                          color:
                            (m.match_confidence || 0) >= 85
                              ? '#10b981'
                              : (m.match_confidence || 0) >= 60
                                ? '#f59e0b'
                                : '#ef4444',
                        }}>
                          {m.match_confidence || 0}%
                        </span>
                      </td>

                      {/* Status Icon with Tooltip */}
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span
                          title={`${meta.label} - Click row details for options`}
                          style={{
                            display: 'inline-flex',
                            verticalAlign: 'middle',
                            color: meta.color,
                          }}
                        >
                          <IconComponent size={18} />
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td style={styles.td}>
                        {m.status === 'pending' ? (
                          <div style={styles.actionBtns}>
                            <button
                              style={styles.quickConfirmBtn}
                              onClick={() => handleAction(m.id, 'confirm')}
                              disabled={isActing}
                              title="Confirm Match"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              style={styles.quickRejectBtn}
                              onClick={() => handleAction(m.id, 'reject')}
                              disabled={isActing}
                              title="Reject Match"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : m.status === 'confirmed' ? (
                          <span style={{ color: '#1a73e8', fontSize: 11, fontWeight: 500 }}>
                            Ready
                          </span>
                        ) : m.status === 'synced' ? (
                          <span
                            style={{ color: 'var(--color-success)', fontSize: 11, fontWeight: 500 }}
                          >
                            Synced
                          </span>
                        ) : (
                          <span
                            style={{ color: 'var(--color-danger)', fontSize: 11, fontWeight: 500 }}
                          >
                            Error
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Side-by-Side Tree Detail Panel */}
                    {isExpanded && (
                      <tr style={styles.trExpanded}>
                        <td colSpan={6} style={{ padding: 0 }}>
                          <div style={{ ...styles.detailPanel, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                              {/* Unified Mapping Details Card */}
                              <div style={styles.detailCard}>
                                <span style={styles.detailCardTitle}>Mapping Details</span>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 32px 1fr', gap: '16px', alignItems: 'center' }}>
                                  {/* Header Row */}
                                  <div style={{ fontWeight: 600, color: '#5f6368', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Firebase Catalog</div>
                                  <div></div>
                                  <div style={{ fontWeight: 600, color: '#5f6368', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Zoho Books Item</div>
                                  {/* Row 1: Name */}
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Product Name</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.firebase_name !== undefined ? edits[m.id].firebase_name : (m.firebase_name || '')}
                                      onChange={(e) => handleEditChange(m.id, 'firebase_name', e.target.value)}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                                    <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'name')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                                    <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'name')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                                  </div>
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Item Name</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.zoho_name !== undefined ? edits[m.id].zoho_name : (m.zoho_name || '')}
                                      onChange={(e) => handleEditChange(m.id, 'zoho_name', e.target.value)}
                                    />
                                  </div>

                                  {/* Row 2: Category */}
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Category</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.firebase_category !== undefined ? edits[m.id].firebase_category : (m.category || '')}
                                      onChange={(e) => handleEditChange(m.id, 'firebase_category', e.target.value)}
                                      placeholder="No category set"
                                    />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                                    <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'category')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                                    <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'category')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                                  </div>
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Category / Group</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.zoho_category !== undefined ? edits[m.id].zoho_category : (m.zoho_category || m.category || '')}
                                      onChange={(e) => handleEditChange(m.id, 'zoho_category', e.target.value)}
                                      placeholder="No category set"
                                    />
                                  </div>

                                  {/* Row 3: SKU */}
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Firebase SKU</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.firebase_sku !== undefined ? edits[m.id].firebase_sku : (m.firebase_sku || '')}
                                      onChange={(e) => handleEditChange(m.id, 'firebase_sku', e.target.value)}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                                    <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'sku')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                                    <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'sku')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                                  </div>
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Zoho SKU</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.zoho_sku !== undefined ? edits[m.id].zoho_sku : (m.zoho_sku || '')}
                                      onChange={(e) => handleEditChange(m.id, 'zoho_sku', e.target.value)}
                                    />
                                  </div>

                                  {/* Row 4: Sale Price */}
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Sale Price (USD)</span>
                                    <input
                                      type="number"
                                      style={styles.editInput}
                                      value={edits[m.id]?.guest_usd !== undefined ? edits[m.id].guest_usd : (m.guest_usd || 0)}
                                      onChange={(e) => handleEditChange(m.id, 'guest_usd', e.target.value)}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                                    <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'sale_price')} style={styles.copyBtn} title="Copy and Convert to AED"><ArrowRight size={14} /></button>
                                    <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'sale_price')} style={styles.copyBtn} title="Copy and Convert to USD"><ArrowLeft size={14} /></button>
                                  </div>
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Sale Rate (AED)</span>
                                    <input
                                      type="number"
                                      style={styles.editInput}
                                      value={edits[m.id]?.guest_aed !== undefined ? edits[m.id].guest_aed : (m.guest_aed || 0)}
                                      onChange={(e) => handleEditChange(m.id, 'guest_aed', e.target.value)}
                                    />
                                  </div>

                                  {/* Row 5: Purchase Price */}
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Purchase Price (USD)</span>
                                    <input
                                      type="number"
                                      style={styles.editInput}
                                      value={edits[m.id]?.firebase_purchase_usd !== undefined ? edits[m.id].firebase_purchase_usd : (m.firebase_purchase_usd || 0)}
                                      onChange={(e) => handleEditChange(m.id, 'firebase_purchase_usd', e.target.value)}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                                    <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'purchase_price')} style={styles.copyBtn} title="Copy and Convert to AED"><ArrowRight size={14} /></button>
                                    <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'purchase_price')} style={styles.copyBtn} title="Copy and Convert to USD"><ArrowLeft size={14} /></button>
                                  </div>
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Purchase Rate (AED)</span>
                                    <input
                                      type="number"
                                      style={styles.editInput}
                                      value={edits[m.id]?.zoho_purchase_rate !== undefined ? edits[m.id].zoho_purchase_rate : (m.zoho_purchase_rate || 0)}
                                      onChange={(e) => handleEditChange(m.id, 'zoho_purchase_rate', e.target.value)}
                                    />
                                  </div>

                                  {/* Row 6: Sale Description */}
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Sale Description</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.firebase_description !== undefined ? edits[m.id].firebase_description : (m.firebase_description || '')}
                                      onChange={(e) => handleEditChange(m.id, 'firebase_description', e.target.value)}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                                    <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'description')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                                    <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'description')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                                  </div>
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Sale Description</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.zoho_description !== undefined ? edits[m.id].zoho_description : (m.zoho_description || '')}
                                      onChange={(e) => handleEditChange(m.id, 'zoho_description', e.target.value)}
                                    />
                                  </div>

                                  {/* Row 7: Purchase Description */}
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Purchase Description</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.firebase_purchase_description !== undefined ? edits[m.id].firebase_purchase_description : (m.firebase_purchase_description || '')}
                                      onChange={(e) => handleEditChange(m.id, 'firebase_purchase_description', e.target.value)}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                                    <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'purchase_description')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                                    <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'purchase_description')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                                  </div>
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Purchase Description</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.zoho_purchase_description !== undefined ? edits[m.id].zoho_purchase_description : (m.zoho_purchase_description || '')}
                                      onChange={(e) => handleEditChange(m.id, 'zoho_purchase_description', e.target.value)}
                                    />
                                  </div>

                                  {/* Row 8: Supplier */}
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Supplier Name</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.firebase_supplier_name !== undefined ? edits[m.id].firebase_supplier_name : (m.firebase_supplier_name || '')}
                                      onChange={(e) => handleEditChange(m.id, 'firebase_supplier_name', e.target.value)}
                                    />
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginTop: 14 }}>
                                    <button onClick={() => handleCopyField(m.id, m, 'firebase', 'zoho', 'supplier')} style={styles.copyBtn} title="Copy to Zoho"><ArrowRight size={14} /></button>
                                    <button onClick={() => handleCopyField(m.id, m, 'zoho', 'firebase', 'supplier')} style={styles.copyBtn} title="Copy to Firebase"><ArrowLeft size={14} /></button>
                                  </div>
                                  <div style={styles.detailField}>
                                    <span style={styles.detailLabel}>Preferred Vendor Name</span>
                                    <input
                                      type="text"
                                      style={styles.editInput}
                                      value={edits[m.id]?.zoho_vendor_name !== undefined ? edits[m.id].zoho_vendor_name : (m.zoho_vendor_name || '')}
                                      onChange={(e) => handleEditChange(m.id, 'zoho_vendor_name', e.target.value)}
                                    />
                                  </div>

                                  {/* Row 9: IDs / Links */}
                                  <div style={{ ...styles.detailField, paddingTop: 12, borderTop: '1px solid #f1f3f4', marginTop: 8 }}>
                                    <span style={styles.detailLabel}>IDs</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                      <span style={styles.monoId}>{m.firebase_product_id}</span>
                                      {m.firebase_variant_id && <span style={styles.monoId}>{m.firebase_variant_id}</span>}
                                    </div>
                                  </div>
                                  <div style={{ paddingTop: 12, borderTop: '1px solid #f1f3f4', marginTop: 8 }}></div>
                                  <div style={{ ...styles.detailField, paddingTop: 12, borderTop: '1px solid #f1f3f4', marginTop: 8 }}>
                                    <span style={styles.detailLabel}>Zoho Item ID</span>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={styles.monoId}>{m.zoho_item_id}</span>
                                      <a
                                        href={`https://erp.mediluxeme.com/app/662274409#/inventory/items/${m.zoho_item_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={styles.detailLink}
                                      >
                                        <ExternalLink size={13} style={{ marginRight: 4 }} />
                                        Edit
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Card 3: Match Metadata & Local Actions (Full Width) */}
                            <div style={styles.detailCard}>
                              <span style={styles.detailCardTitle}>Engine Metadata & Actions</span>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>AI Match Confidence</span>
                                <span style={styles.detailValueBold}>
                                  {m.match_confidence || 0}%
                                </span>
                              </div>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Match Method</span>
                                <span style={styles.detailValue}>
                                  <code style={{ fontSize: 11 }}>{m.match_method}</code>
                                </span>
                              </div>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Last Synchronized</span>
                                <span style={styles.detailValue}>
                                  {formatDate(m.last_synced_at)}
                                </span>
                              </div>
                              {m.match_reasoning && (
                                <div style={styles.detailField}>
                                  <span style={styles.detailLabel}>Engine Reasoning</span>
                                  <p style={styles.detailReasoning}>{m.match_reasoning}</p>
                                </div>
                              )}
                              
                              {/* Category Mismatch Warning */}
                              {(() => {
                                const fbCat = (edits[m.id]?.firebase_category !== undefined ? edits[m.id].firebase_category : (m.category || '')).trim().toLowerCase();
                                const zhCat = (edits[m.id]?.zoho_category !== undefined ? edits[m.id].zoho_category : (m.zoho_category || m.category || '')).trim().toLowerCase();
                                const mismatch = fbCat && zhCat && fbCat !== zhCat;
                                return mismatch ? (
                                  <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', borderRadius: 4, fontSize: 12, display: 'flex', alignItems: 'center' }}>
                                    <AlertTriangle size={14} style={{ marginRight: 6 }} />
                                    <span>Categories do not match. They must be the same to synchronize.</span>
                                  </div>
                                ) : null;
                              })()}

                              <div
                                style={{
                                  display: 'flex',
                                  gap: 8,
                                  marginTop: 'auto',
                                  paddingTop: 8,
                                }}
                              >
                                <button
                                  style={{
                                    ...styles.btnGcpPrimary, 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    opacity: (() => {
                                      const fbCat = (edits[m.id]?.firebase_category !== undefined ? edits[m.id].firebase_category : (m.category || '')).trim().toLowerCase();
                                      const zhCat = (edits[m.id]?.zoho_category !== undefined ? edits[m.id].zoho_category : (m.zoho_category || m.category || '')).trim().toLowerCase();
                                      return (fbCat && zhCat && fbCat !== zhCat) ? 0.5 : 1;
                                    })()
                                  }}
                                  onClick={() => handleSaveAndSync(m)}
                                  disabled={syncingRowId === m.id || (() => {
                                    const fbCat = (edits[m.id]?.firebase_category !== undefined ? edits[m.id].firebase_category : (m.category || '')).trim().toLowerCase();
                                    const zhCat = (edits[m.id]?.zoho_category !== undefined ? edits[m.id].zoho_category : (m.zoho_category || m.category || '')).trim().toLowerCase();
                                    return (fbCat && zhCat && fbCat !== zhCat);
                                  })()}
                                >
                                  <RefreshCw
                                    size={13}
                                    style={{
                                      marginRight: 6,
                                      animation: syncingRowId === m.id ? 'spin 1s linear infinite' : 'none',
                                    }}
                                  />
                                  {syncingRowId === m.id ? 'Saving...' : 'Save & Sync'}
                                </button>
                                {m.status === 'pending' && (
                                  <>
                                    <button
                                      style={styles.btnGcpSuccessBorder}
                                      onClick={() => handleAction(m.id, 'confirm')}
                                      disabled={isActing}
                                    >
                                      Confirm Match
                                    </button>
                                    <button
                                      style={styles.btnGcpDangerBorder}
                                      onClick={() => handleAction(m.id, 'reject')}
                                      disabled={isActing}
                                    >
                                      Reject Match
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '16px', borderTop: '1px solid #dadce0' }}>
              <button
                style={{ ...styles.btnGcpSecondary, marginRight: 8, padding: '4px 8px' }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span style={{ fontSize: 12, color: '#5f6368', margin: '0 8px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                style={{ ...styles.btnGcpSecondary, marginLeft: 8, padding: '4px 8px' }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
          </>
        )}
      </div>

      {/* Activity log */}
      {log.length > 0 && (
        <div style={styles.logPanel}>
          <div style={styles.logTitle}>System Execution Logs</div>
          <div style={styles.logList}>
            {log.map((entry, i) => (
              <div
                key={i}
                style={{
                  ...styles.logEntry,
                  color:
                    entry.type === 'error'
                      ? '#dc3545'
                      : entry.type === 'success'
                        ? '#1e7e34'
                        : entry.type === 'warn'
                          ? 'var(--color-warning)'
                          : '#5f6368',
                }}
              >
                <span style={styles.logTs}>[{entry.ts}]</span> {entry.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles (Google Cloud Console Light Design Tokens) ────────────────────────
const styles = {
  container: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    background: 'var(--color-bg-surface)',
    fontFamily: 'Inter, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 16,
    borderBottom: '1px solid #dadce0',
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#202124',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: 13,
    color: '#5f6368',
  },
  headerActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
  },
  statCard: {
    background: 'var(--color-bg-surface)',
    border: '1px solid #dadce0',
    borderRadius: 4,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.15)',
  },
  statCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: '#5f6368',
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#202124',
  },
  tabsRow: {
    display: 'flex',
    borderBottom: '1px solid #dadce0',
    gap: 4,
  },
  tabButton: {
    border: 'none',
    background: 'none',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: '#5f6368',
    bottomBorder: '2px solid transparent',
    marginBottom: '-1px',
  },
  tabButtonActive: {
    color: '#1a73e8',
    borderBottom: '2px solid #1a73e8',
    fontWeight: 600,
  },
  bulkBar: {
    background: '#e8f0fe',
    border: '1px solid #1a73e8',
    borderRadius: 4,
    padding: '10px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(60,64,67,0.1)',
  },
  bulkText: {
    color: '#1a73e8',
    fontWeight: 600,
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
  },
  bulkActions: {
    display: 'flex',
    gap: 8,
  },
  tableWrapper: {
    border: '1px solid #dadce0',
    borderRadius: 4,
    background: 'var(--color-bg-surface)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    padding: '7px 12px',
    textAlign: 'left',
    color: '#5f6368',
    fontWeight: 700,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #dadce0',
    background: 'var(--color-bg-app)',
  },
  tr: {
    borderBottom: '1px solid #dadce0',
    transition: 'background-color 0.15s',
  },
  trExpanded: {
    background: 'var(--color-bg-app)',
    borderBottom: '1px solid #dadce0',
  },
  td: {
    padding: '6px 12px',
    color: '#3c4043',
    verticalAlign: 'middle',
  },
  chevronBtn: {
    background: 'none',
    border: 'none',
    padding: 4,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5f6368',
    borderRadius: 4,
    hover: {
      background: '#e8eaed',
    },
  },
  productName: {
    fontWeight: 600,
    color: '#202124',
    maxWidth: 240,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sku: {
    background: '#f1f3f4',
    padding: '2px 6px',
    borderRadius: 2,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#3c4043',
  },
  confidence: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    padding: '3px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
  },
  actionBtns: {
    display: 'flex',
    gap: 4,
  },
  quickConfirmBtn: {
    padding: '4px 8px',
    borderRadius: 4,
    border: '1px solid #10b981',
    background: 'rgba(16,185,129,0.04)',
    color: 'var(--color-success)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRejectBtn: {
    padding: '4px 8px',
    borderRadius: 4,
    border: '1px solid #ef4444',
    background: 'rgba(239,68,68,0.04)',
    color: 'var(--color-danger)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailPanel: {
    padding: '16px 24px',
    background: 'var(--color-bg-app)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
    borderBottom: '1px solid #dadce0',
  },
  detailCard: {
    background: 'var(--color-bg-surface)',
    border: '1px solid #dadce0',
    borderRadius: 4,
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)',
  },
  detailCardTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#5f6368',
    letterSpacing: '0.05em',
    paddingBottom: 6,
    borderBottom: '1px solid #f1f3f4',
  },
  detailField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: '#80868b',
  },
  editInput: {
    padding: '4px 8px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: 'inherit',
    color: '#202124',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '2px',
    background: '#fff',
  },
  detailValue: {
    fontSize: 13,
    color: '#202124',
  },
  detailValueBold: {
    fontSize: 13,
    fontWeight: 600,
    color: '#202124',
  },
  detailReasoning: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.5,
    color: '#3c4043',
    fontStyle: 'italic',
  },

  copyBtn: {
    background: 'none',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5f6368',
    backgroundColor: '#f8f9fa',
    transition: 'all 0.2s ease',
  },
  monoId: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#5f6368',
    background: '#f1f3f4',
    padding: '1px 4px',
    borderRadius: 2,
    wordBreak: 'break-all',
  },
  detailLink: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: 650,
    fontSize: 12,
    display: 'inline-flex',
    alignItems: 'center',
  },
  btnGcpPrimary: {
    padding: '8px 16px',
    borderRadius: 4,
    border: 'none',
    background: '#1a73e8',
    color: 'var(--color-bg-surface)',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 13,
    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
  },
  btnGcpSecondary: {
    padding: '8px 16px',
    borderRadius: 4,
    border: '1px solid #dadce0',
    background: 'var(--color-bg-surface)',
    color: '#1a73e8',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 13,
  },
  btnGcpGray: {
    padding: '8px 16px',
    borderRadius: 4,
    border: '1px solid #dadce0',
    background: 'var(--color-bg-surface)',
    color: '#3c4043',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 13,
  },
  btnGcpSuccessBorder: {
    padding: '6px 12px',
    borderRadius: 4,
    border: '1px solid #10b981',
    background: 'var(--color-bg-surface)',
    color: 'var(--color-success)',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 12,
  },
  btnGcpDangerBorder: {
    padding: '6px 12px',
    borderRadius: 4,
    border: '1px solid #ef4444',
    background: 'var(--color-bg-surface)',
    color: 'var(--color-danger)',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 12,
  },
  empty: {
    padding: '48px 24px',
    textAlign: 'center',
    color: '#5f6368',
    fontSize: 14,
  },
  logPanel: {
    background: 'var(--color-bg-app)',
    borderRadius: 4,
    padding: '14px 18px',
    border: '1px solid #dadce0',
  },
  logTitle: {
    color: '#5f6368',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 8,
  },
  logList: {
    maxHeight: 180,
    overflowY: 'auto',
  },
  logEntry: {
    fontSize: 12,
    fontFamily: 'monospace',
    padding: '2px 0',
    lineHeight: 1.6,
  },
  logTs: {
    color: '#80868b',
    marginRight: 8,
  },
};
