import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
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
  Info
} from "lucide-react";

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

const AGENT_URL = "https://europe-west1-med-peptides-app.cloudfunctions.net/skuSyncAgent";

// STATUS META mapping to Lucide icons and colors
const STATUS_META = {
  pending: {
    label: "Pending Review",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    icon: HelpCircle,
    border: "#f59e0b"
  },
  confirmed: {
    label: "Confirmed",
    color: "var(--color-success)",
    bg: "rgba(16,185,129,0.06)",
    icon: CheckCircle2,
    border: "var(--color-success)"
  },
  rejected: {
    label: "Rejected",
    color: "var(--color-danger)",
    bg: "rgba(239,68,68,0.06)",
    icon: XCircle,
    border: "var(--color-danger)"
  },
  synced: {
    label: "Synced to Zoho",
    color: "#1a73e8",
    bg: "rgba(26,115,232,0.06)",
    icon: RefreshCw,
    border: "#1a73e8"
  },
  error: {
    label: "Sync Error",
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.06)",
    icon: AlertTriangle,
    border: "#f43f5e"
  }
};

async function callAgent(mode, extra = {}, token) {
  const resp = await fetch(AGENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [expandedRowIds, setExpandedRowIds] = useState([]);

  const addLog = (msg, type = "info") =>
    setLog(prev => [{ msg, type, ts: new Date().toLocaleTimeString() }, ...prev].slice(0, 30));

  const getToken = async () => user?.getIdToken?.();

  // Create standard request body for agents (explicitly adding email for audit logging)
  const agentBody = (mode, extra = {}) => ({
    mode,
    userProfile: userProfile
      ? { role: userProfile.role, uid: userProfile.uid || user?.uid, email: userProfile.email || user?.email }
      : { role: "admin", uid: user?.uid, email: user?.email },
    ...extra,
  });

  // ── Load current status ───────────────────────────────────────────────────
  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await callAgent("status", agentBody("status"), token);
      setMappings(data.records || []);
      setStats(data.statusCounts || null);
      addLog(`Loaded ${data.total || 0} mappings`, "success");
    } catch (e) {
      addLog(`Failed to load mappings: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // ── Run discovery ─────────────────────────────────────────────────────────
  const runDiscover = async () => {
    setLoading(true);
    addLog("🔍 Starting AI discovery — fetching both catalogs...", "info");
    try {
      const token = await getToken();
      const data = await callAgent("discover", agentBody("discover", { aedRate: 3.67, useAI: false }), token);
      addLog(`Discovery complete: ${data.matched || 0} matched (${data.auto_confirmed || 0} auto-confirmed, ${data.needs_review || 0} need review)`, "success");
      await loadStatus();
    } catch (e) {
      addLog(`Discovery failed: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Confirm / Reject mapping ──────────────────────────────────────────────
  const handleAction = async (mappingId, action) => {
    setActionId(mappingId);
    try {
      const token = await getToken();
      await callAgent("confirm", agentBody("confirm", { mappingId, action }), token);
      addLog(`${action === "confirm" ? "✅ Confirmed" : "❌ Rejected"} mapping ${mappingId.slice(-8)}`, action === "confirm" ? "success" : "warn");
      await loadStatus();
    } catch (e) {
      addLog(`Action failed: ${e.message}`, "error");
    } finally {
      setActionId(null);
    }
  };

  // ── Push all confirmed to Zoho ─────────────────────────────────────────────
  const pushAllConfirmed = async (dryRun = false) => {
    setLoading(true);
    addLog(dryRun ? "🧪 Dry run push for all confirmed mappings..." : "🚀 Pushing all confirmed mappings to Zoho Books...", "info");
    try {
      const token = await getToken();
      const data = await callAgent("push", agentBody("push", { dryRun }), token);
      addLog(`${dryRun ? "[DRY RUN] " : ""}Pushed: ${data.pushed ?? 0}, Failed: ${data.failed ?? 0}`, "success");
      if (!dryRun) await loadStatus();
    } catch (e) {
      addLog(`Push failed: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Bulk Actions Handler ──────────────────────────────────────────────────
  const handleBulkAction = async (action) => {
    setLoading(true);
    addLog(`Starting bulk action '${action}' for ${selectedIds.length} items...`, "info");
    try {
      const token = await getToken();
      if (action === "confirm" || action === "reject") {
        await callAgent("confirm_bulk", agentBody("confirm_bulk", { mappingIds: selectedIds, action }), token);
        addLog(`Bulk ${action === "confirm" ? "Confirm" : "Reject"} completed for ${selectedIds.length} mappings`, "success");
      } else if (action === "push" || action === "push_dry") {
        const dryRun = action === "push_dry";
        const data = await callAgent("push_bulk", agentBody("push_bulk", { mappingIds: selectedIds, dryRun }), token);
        addLog(`${dryRun ? "[DRY RUN] " : ""}Bulk Pushed: ${data.pushed ?? 0}, Failed: ${data.failed ?? 0}`, "success");
      }
      setSelectedIds([]);
      await loadStatus();
    } catch (e) {
      addLog(`Bulk action failed: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Manual Refetch single Zoho item ──────────────────────────────────────
  const handleRefetch = async (mappingId, zohoItemId) => {
    setSyncingRowId(mappingId);
    addLog(`Syncing Zoho item ${zohoItemId} directly from Zoho Books API...`, "info");
    try {
      const token = await getToken();
      const data = await callAgent("refetch", agentBody("refetch", { mappingId, zoho_item_id: zohoItemId }), token);
      addLog(data.reply || `Refetched Zoho item ${zohoItemId} successfully`, data.updated ? "success" : "info");
      await loadStatus();
    } catch (e) {
      addLog(`Sync failed: ${e.message}`, "error");
    } finally {
      setSyncingRowId(null);
    }
  };

  // ── Row selection helpers ──────────────────────────────────────────────────
  const filtered = filter === "all" ? mappings : mappings.filter(m => m.status === filter);
  const confirmedCount = mappings.filter(m => m.status === "confirmed").length;

  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filtered.map(m => m.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleRowExpanded = (id) => {
    setExpandedRowIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const formatDate = (ts) => {
    if (!ts) return "Never";
    if (typeof ts === "string") return new Date(ts).toLocaleString();
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
    if (ts._seconds) return new Date(ts._seconds * 1000).toLocaleString();
    return "Never";
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
          <button style={styles.btnGcpSecondary} onClick={loadStatus} disabled={loading}>
            ↻ Refresh
          </button>
          <button style={styles.btnGcpSecondary} onClick={() => pushAllConfirmed(true)} disabled={loading || confirmedCount === 0}>
            🧪 Dry Run Push All
          </button>
          <button style={styles.btnGcpSecondary} onClick={() => pushAllConfirmed(false)} disabled={loading || confirmedCount === 0}>
            🚀 Push All Confirmed {confirmedCount > 0 ? `(${confirmedCount})` : ""}
          </button>
          <button style={styles.btnGcpPrimary} onClick={runDiscover} disabled={loading}>
            {loading ? "⏳ Running..." : "🔍 Run Discovery"}
          </button>
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
                style={{ ...styles.statCard, borderTop: `3px solid ${meta.color}`, cursor: "pointer" }}
                onClick={() => setFilter(filter === key ? "all" : key)}
              >
                <div style={styles.statCardHeader}>
                  <span style={styles.statCardLabel}>{meta.label}</span>
                  <IconComponent size={14} style={{ color: meta.color }} />
                </div>
                <span style={styles.statCardValue}>{stats[key] || 0}</span>
              </div>
            );
          })}
          <div style={{ ...styles.statCard, borderTop: "3px solid #5f6368" }}>
            <div style={styles.statCardHeader}>
              <span style={styles.statCardLabel}>Total Records</span>
              <Database size={14} style={{ color: "#5f6368" }} />
            </div>
            <span style={styles.statCardValue}>{mappings.length}</span>
          </div>
        </div>
      )}

      {/* GCP Horizontal Tabs for filtering */}
      <div style={styles.tabsRow}>
        <button
          onClick={() => setFilter("all")}
          style={filter === "all" ? { ...styles.tabButton, ...styles.tabButtonActive } : styles.tabButton}
        >
          All Mappings ({mappings.length})
        </button>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={filter === key ? { ...styles.tabButton, ...styles.tabButtonActive } : styles.tabButton}
          >
            {meta.label} ({mappings.filter(m => m.status === key).length})
          </button>
        ))}
      </div>

      {/* Sticky Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div style={styles.bulkBar}>
          <div style={styles.bulkText}>
            <Info size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
            {selectedIds.length} mapping{selectedIds.length > 1 ? "s" : ""} selected
          </div>
          <div style={styles.bulkActions}>
            <button
              style={styles.btnGcpSuccessBorder}
              onClick={() => handleBulkAction("confirm")}
              disabled={loading}
            >
              Bulk Confirm
            </button>
            <button
              style={styles.btnGcpDangerBorder}
              onClick={() => handleBulkAction("reject")}
              disabled={loading}
            >
              Bulk Reject
            </button>
            <button
              style={styles.btnGcpSecondary}
              onClick={() => handleBulkAction("push_dry")}
              disabled={loading}
            >
              Dry Run Push
            </button>
            <button
              style={styles.btnGcpPrimary}
              onClick={() => handleBulkAction("push")}
              disabled={loading}
            >
              Push Selected
            </button>
            <button
              style={styles.btnGcpGray}
              onClick={() => setSelectedIds([])}
              disabled={loading}
            >
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
              ? "No mappings discovered yet. Click \"Run Discovery\" to scan catalogs."
              : `No mappings match the active filter: ${filter}`}
          </div>
        ) : (
          <table className="gcp-table" style={styles.table}>
            <thead>
              <tr style={{ borderBottom: "1px solid #dadce0" }}>
                <th style={{ width: "30px", padding: "8px 10px" }}></th>
                <th style={{ width: "40px", padding: "8px 10px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && filtered.every(m => selectedIds.includes(m.id))}
                    onChange={handleSelectAll}
                    style={{ cursor: "pointer" }}
                  />
                </th>
                <th style={styles.th}>Firebase Product</th>
                <th style={styles.th}>SKU (Firebase)</th>
                <th style={styles.th}>Zoho Item</th>
                <th style={styles.th}>SKU (Zoho)</th>
                <th style={styles.th}>Confidence</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const meta = STATUS_META[m.status] || STATUS_META.pending;
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
                          ? "#f4f8fe"
                          : isExpanded
                          ? "var(--color-bg-app)"
                          : "transparent"
                      }}
                    >
                      {/* Toggle Chevron */}
                      <td style={{ padding: "8px 10px", verticalAlign: "middle", textAlign: "center" }}>
                        <button
                          type="button"
                          style={styles.chevronBtn}
                          onClick={() => toggleRowExpanded(m.id)}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>

                      {/* Checkbox */}
                      <td style={{ padding: "8px 10px", verticalAlign: "middle", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(m.id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>

                      {/* Firebase Name */}
                      <td
                        style={{ ...styles.td, cursor: "pointer" }}
                        onClick={() => toggleRowExpanded(m.id)}
                      >
                        <div style={styles.productName}>{m.firebase_name}</div>
                      </td>

                      {/* Firebase SKU */}
                      <td style={styles.td}>
                        <code style={styles.sku}>{m.firebase_sku || "—"}</code>
                      </td>

                      {/* Zoho Name */}
                      <td
                        style={{ ...styles.td, cursor: "pointer" }}
                        onClick={() => toggleRowExpanded(m.id)}
                      >
                        <div style={styles.productName}>{m.zoho_name}</div>
                      </td>

                      {/* Zoho SKU */}
                      <td style={styles.td}>
                        <code style={styles.sku}>{m.zoho_sku || "—"}</code>
                      </td>

                      {/* Match Confidence */}
                      <td style={styles.td}>
                        <div style={styles.confidence}>
                          <div style={styles.confidenceBarWrapper}>
                            <div
                              style={{
                                ...styles.confidenceBar,
                                width: `${m.match_confidence || 0}%`,
                                background:
                                  m.match_confidence >= 85
                                    ? "var(--color-success)"
                                    : m.match_confidence >= 60
                                    ? "#f59e0b"
                                    : "var(--color-danger)"
                              }}
                            />
                          </div>
                          <span style={{ color: "#5f6368", fontSize: 12 }}>{m.match_confidence || 0}%</span>
                        </div>
                      </td>

                      {/* Status Icon with Tooltip */}
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <span
                          title={`${meta.label} - Click row details for options`}
                          style={{ display: "inline-flex", verticalAlign: "middle", color: meta.color }}
                        >
                          <IconComponent size={18} />
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td style={styles.td}>
                        {m.status === "pending" ? (
                          <div style={styles.actionBtns}>
                            <button
                              style={styles.quickConfirmBtn}
                              onClick={() => handleAction(m.id, "confirm")}
                              disabled={isActing}
                              title="Confirm Match"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              style={styles.quickRejectBtn}
                              onClick={() => handleAction(m.id, "reject")}
                              disabled={isActing}
                              title="Reject Match"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : m.status === "confirmed" ? (
                          <span style={{ color: "#1a73e8", fontSize: 11, fontWeight: 500 }}>Ready</span>
                        ) : m.status === "synced" ? (
                          <span style={{ color: "var(--color-success)", fontSize: 11, fontWeight: 500 }}>Synced</span>
                        ) : (
                          <span style={{ color: "var(--color-danger)", fontSize: 11, fontWeight: 500 }}>Error</span>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Side-by-Side Tree Detail Panel */}
                    {isExpanded && (
                      <tr style={styles.trExpanded}>
                        <td colSpan={9} style={{ padding: 0 }}>
                          <div style={styles.detailPanel}>
                            {/* Card 1: Firebase Product */}
                            <div style={styles.detailCard}>
                              <span style={styles.detailCardTitle}>Firebase Catalog Details</span>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Product Name</span>
                                <span style={styles.detailValueBold}>{m.firebase_name}</span>
                              </div>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Firebase SKU</span>
                                <div>
                                  <code style={styles.sku}>{m.firebase_sku || "—"}</code>
                                </div>
                              </div>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Document ID</span>
                                <span style={styles.monoId}>{m.firebase_product_id}</span>
                              </div>
                              {m.firebase_variant_id && (
                                <div style={styles.detailField}>
                                  <span style={styles.detailLabel}>Variant ID</span>
                                  <span style={styles.monoId}>{m.firebase_variant_id}</span>
                                </div>
                              )}
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Guest Catalog Price</span>
                                <span style={styles.detailValue}>${(m.guest_usd || 0).toFixed(2)} USD</span>
                              </div>
                            </div>

                            {/* Card 2: Zoho Books Item */}
                            <div style={styles.detailCard}>
                              <span style={styles.detailCardTitle}>Zoho Books Item Details</span>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Item Name</span>
                                <span style={styles.detailValueBold}>{m.zoho_name}</span>
                              </div>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Zoho SKU</span>
                                <div>
                                  <code style={styles.sku}>{m.zoho_sku || "—"}</code>
                                </div>
                              </div>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Zoho Item ID</span>
                                <span style={styles.monoId}>{m.zoho_item_id}</span>
                              </div>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Zoho Books Rate</span>
                                <span style={styles.detailValue}>{(m.guest_aed || 0).toFixed(2)} AED</span>
                              </div>
                              <div style={{ marginTop: "auto", paddingTop: 8 }}>
                                <a
                                  href={`https://books.zoho.me/app#/items/${m.zoho_item_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={styles.detailLink}
                                >
                                  <ExternalLink size={13} style={{ marginRight: 4 }} />
                                  Edit in Zoho Books
                                </a>
                              </div>
                            </div>

                            {/* Card 3: Match Metadata & Local Actions */}
                            <div style={styles.detailCard}>
                              <span style={styles.detailCardTitle}>Engine Metadata & Actions</span>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>AI Match Confidence</span>
                                <span style={styles.detailValueBold}>{m.match_confidence || 0}%</span>
                              </div>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Match Method</span>
                                <span style={styles.detailValue}><code style={{ fontSize: 11 }}>{m.match_method}</code></span>
                              </div>
                              <div style={styles.detailField}>
                                <span style={styles.detailLabel}>Last Synchronized</span>
                                <span style={styles.detailValue}>{formatDate(m.last_synced_at)}</span>
                              </div>
                              {m.match_reasoning && (
                                <div style={styles.detailField}>
                                  <span style={styles.detailLabel}>Engine Reasoning</span>
                                  <p style={styles.detailReasoning}>{m.match_reasoning}</p>
                                </div>
                              )}
                              <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 8 }}>
                                <button
                                  style={styles.btnGcpSecondary}
                                  onClick={() => handleRefetch(m.id, m.zoho_item_id)}
                                  disabled={syncingRowId === m.id}
                                >
                                  <RefreshCw
                                    size={13}
                                    style={{
                                      marginRight: 4,
                                      animation: syncingRowId === m.id ? "spin 1s linear infinite" : "none"
                                    }}
                                  />
                                  {syncingRowId === m.id ? "Syncing..." : "Sync from Zoho"}
                                </button>
                                {m.status === "pending" && (
                                  <>
                                    <button
                                      style={styles.btnGcpSuccessBorder}
                                      onClick={() => handleAction(m.id, "confirm")}
                                      disabled={isActing}
                                    >
                                      Confirm Match
                                    </button>
                                    <button
                                      style={styles.btnGcpDangerBorder}
                                      onClick={() => handleAction(m.id, "reject")}
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
                    entry.type === "error"
                      ? "#dc3545"
                      : entry.type === "success"
                      ? "#1e7e34"
                      : entry.type === "warn"
                      ? "var(--color-warning)"
                      : "#5f6368"
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
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    background: "var(--color-bg-surface)",
    fontFamily: "Inter, -apple-system, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 16,
    borderBottom: "1px solid #dadce0"
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#202124"
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 13,
    color: "#5f6368"
  },
  headerActions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap"
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12
  },
  statCard: {
    background: "var(--color-bg-surface)",
    border: "1px solid #dadce0",
    borderRadius: 4,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    boxShadow: "0 1px 2px 0 rgba(60,64,67,0.15)"
  },
  statCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "#5f6368"
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: 700,
    color: "#202124"
  },
  tabsRow: {
    display: "flex",
    borderBottom: "1px solid #dadce0",
    gap: 4
  },
  tabButton: {
    border: "none",
    background: "none",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    color: "#5f6368",
    bottomBorder: "2px solid transparent",
    marginBottom: "-1px"
  },
  tabButtonActive: {
    color: "#1a73e8",
    borderBottom: "2px solid #1a73e8",
    fontWeight: 600
  },
  bulkBar: {
    background: "#e8f0fe",
    border: "1px solid #1a73e8",
    borderRadius: 4,
    padding: "10px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 10,
    boxShadow: "0 2px 4px rgba(60,64,67,0.1)"
  },
  bulkText: {
    color: "#1a73e8",
    fontWeight: 600,
    fontSize: 13,
    display: "flex",
    alignItems: "center"
  },
  bulkActions: {
    display: "flex",
    gap: 8
  },
  tableWrapper: {
    border: "1px solid #dadce0",
    borderRadius: 4,
    background: "var(--color-bg-surface)",
    overflow: "hidden"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13
  },
  th: {
    padding: "10px 14px",
    textAlign: "left",
    color: "#5f6368",
    fontWeight: 700,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #dadce0",
    background: "var(--color-bg-app)"
  },
  tr: {
    borderBottom: "1px solid #dadce0",
    transition: "background-color 0.15s"
  },
  trExpanded: {
    background: "var(--color-bg-app)",
    borderBottom: "1px solid #dadce0"
  },
  td: {
    padding: "10px 14px",
    color: "#3c4043",
    verticalAlign: "middle"
  },
  chevronBtn: {
    background: "none",
    border: "none",
    padding: 4,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#5f6368",
    borderRadius: 4,
    hover: {
      background: "#e8eaed"
    }
  },
  productName: {
    fontWeight: 600,
    color: "#202124",
    maxWidth: 240,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  sku: {
    background: "#f1f3f4",
    padding: "2px 6px",
    borderRadius: 2,
    fontSize: 11,
    fontFamily: "monospace",
    color: "#3c4043"
  },
  confidence: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  confidenceBarWrapper: {
    width: 50,
    height: 4,
    background: "#e8eaed",
    borderRadius: 2,
    overflow: "hidden"
  },
  confidenceBar: {
    height: "100%",
    borderRadius: 2,
    transition: "width 0.3s"
  },
  badge: {
    padding: "3px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600
  },
  actionBtns: {
    display: "flex",
    gap: 4
  },
  quickConfirmBtn: {
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #10b981",
    background: "rgba(16,185,129,0.04)",
    color: "var(--color-success)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  quickRejectBtn: {
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #ef4444",
    background: "rgba(239,68,68,0.04)",
    color: "var(--color-danger)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  detailPanel: {
    padding: "16px 24px",
    background: "var(--color-bg-app)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
    borderBottom: "1px solid #dadce0"
  },
  detailCard: {
    background: "var(--color-bg-surface)",
    border: "1px solid #dadce0",
    borderRadius: 4,
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    boxShadow: "0 1px 2px 0 rgba(60,64,67,0.1)"
  },
  detailCardTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    color: "#5f6368",
    letterSpacing: "0.05em",
    paddingBottom: 6,
    borderBottom: "1px solid #f1f3f4"
  },
  detailField: {
    display: "flex",
    flexDirection: "column",
    gap: 2
  },
  detailLabel: {
    fontSize: 11,
    color: "#80868b"
  },
  detailValue: {
    fontSize: 13,
    color: "#202124"
  },
  detailValueBold: {
    fontSize: 13,
    fontWeight: 600,
    color: "#202124"
  },
  detailReasoning: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.5,
    color: "#3c4043",
    fontStyle: "italic"
  },
  monoId: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#5f6368",
    background: "#f1f3f4",
    padding: "1px 4px",
    borderRadius: 2,
    wordBreak: "break-all"
  },
  detailLink: {
    color: "#1a73e8",
    textDecoration: "none",
    fontWeight: 650,
    fontSize: 12,
    display: "inline-flex",
    alignItems: "center"
  },
  btnGcpPrimary: {
    padding: "8px 16px",
    borderRadius: 4,
    border: "none",
    background: "#1a73e8",
    color: "var(--color-bg-surface)",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 13,
    boxShadow: "0 1px 2px 0 rgba(60,64,67,0.3)"
  },
  btnGcpSecondary: {
    padding: "8px 16px",
    borderRadius: 4,
    border: "1px solid #dadce0",
    background: "var(--color-bg-surface)",
    color: "#1a73e8",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 13
  },
  btnGcpGray: {
    padding: "8px 16px",
    borderRadius: 4,
    border: "1px solid #dadce0",
    background: "var(--color-bg-surface)",
    color: "#3c4043",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 13
  },
  btnGcpSuccessBorder: {
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid #10b981",
    background: "var(--color-bg-surface)",
    color: "var(--color-success)",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 12
  },
  btnGcpDangerBorder: {
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid #ef4444",
    background: "var(--color-bg-surface)",
    color: "var(--color-danger)",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 12
  },
  empty: {
    padding: "48px 24px",
    textAlign: "center",
    color: "#5f6368",
    fontSize: 14
  },
  logPanel: {
    background: "var(--color-bg-app)",
    borderRadius: 4,
    padding: "14px 18px",
    border: "1px solid #dadce0"
  },
  logTitle: {
    color: "#5f6368",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8
  },
  logList: {
    maxHeight: 180,
    overflowY: "auto"
  },
  logEntry: {
    fontSize: 12,
    fontFamily: "monospace",
    padding: "2px 0",
    lineHeight: 1.6
  },
  logTs: {
    color: "#80868b",
    marginRight: 8
  }
};
