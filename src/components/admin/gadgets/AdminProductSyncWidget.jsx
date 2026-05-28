/**
 * AdminProductSyncWidget.jsx
 *
 * Two-in-one admin gadget:
 *   1. PRODUCT SYNC: Triggers the skuSyncAgent Cloud Function to reconcile
 *      Firestore products ↔ Zoho Inventory SKUs. Shows last sync results.
 *
 *   2. PRODUCT VALIDATION: Displays pending products (status:'pending_review')
 *      and allows admin to Approve or Reject them inline, with notes.
 *
 * This is the "validate products" workflow the admin needs on the dashboard.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  Link2,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Box,
} from 'lucide-react';

// ── Cloud Function endpoint ───────────────────────────────────────────────────
const SKU_SYNC_URL = 'https://europe-west1-med-peptides-app.cloudfunctions.net/skuSyncAgent';

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending_review: {
      label: 'Pending Review',
      color: '#f59e0b',
      bg: 'var(--color-warning-bg)',
      emoji: '⏳',
    },
    active: { label: 'Active', color: 'var(--color-success)', bg: '#ecfdf5', emoji: '✅' },
    rejected: {
      label: 'Rejected',
      color: 'var(--color-danger)',
      bg: 'var(--color-danger-bg)',
      emoji: '❌',
    },
    draft: { label: 'Draft', color: 'var(--color-text-tertiary)', bg: '#f1f5f9', emoji: '📝' },
  };
  const m = map[status] || map.draft;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--radius-sm)',
        background: m.bg,
        color: m.color,
        fontSize: '0.65rem',
        fontWeight: 800,
      }}
    >
      {m.emoji} {m.label}
    </span>
  );
}

// ── Product validation card ────────────────────────────────────────────────────
function PendingProductCard({ product, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [acting, setActing] = useState(null); // 'approve' | 'reject'

  async function handleApprove() {
    setActing('approve');
    await onApprove(product.id, note);
    setActing(null);
  };
  async function handleReject() {
    setActing('reject');
    await onReject(product.id, note);
    setActing(null);
  };

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: '0.9rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          background: 'rgba(245,158,11,0.03)',
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0,
            overflow: 'hidden',
            background: 'var(--color-bg-app)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box size={18} color="var(--color-text-tertiary)" />
          )}
        </div>

        {/* Identity */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: '0.88rem',
              color: 'var(--color-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.name || product.displayName || '—'}
          </div>
          <div
            style={{
              fontSize: '0.68rem',
              color: 'var(--color-text-tertiary)',
              fontWeight: 600,
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'center',
              marginTop: '0.1rem',
            }}
          >
            {product.sku && <span>SKU: {product.sku}</span>}
            {product.category && (
              <>
                <span>·</span>
                <span>{product.category}</span>
              </>
            )}
            {product.createdAt?.toDate && (
              <>
                <span>·</span>
                <span>
                  {product.createdAt
                    .toDate()
                    .toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </span>
              </>
            )}
          </div>
        </div>

        <StatusBadge status={product.status || 'pending_review'} />
        {expanded ? (
          <ChevronUp size={14} color="var(--color-border)" />
        ) : (
          <ChevronDown size={14} color="var(--color-border)" />
        )}
      </div>

      {/* Expanded: details + validation actions */}
      {expanded && (
        <div style={{ padding: '0 1.1rem 1.1rem', borderTop: '1px solid #fef3c7' }}>
          {/* Product info grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.5rem',
              marginTop: '0.85rem',
              marginBottom: '0.85rem',
            }}
          >
            {[
              { label: 'Precio B2C', value: product.priceUSD ? `$${product.priceUSD}` : '—' },
              {
                label: 'Precio Prof.',
                value: product.professionalPrice ? `$${product.professionalPrice}` : '—',
              },
              {
                label: 'Precio WS',
                value: product.wholesalePrice ? `$${product.wholesalePrice}` : '—',
              },
              { label: 'SKU', value: product.sku || '—' },
              { label: 'Categoría', value: product.category || '—' },
              { label: 'Category', value: product.category || '—' },
              { label: 'Variants', value: product.variants?.length || 0 },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: 'var(--color-bg-app)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem 0.65rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    marginTop: '0.15rem',
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Admin notes */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Review note (optional)…"
            rows={2}
            style={{
              width: '100%',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid #e2e8f0',
              padding: '0.5rem 0.75rem',
              fontSize: '0.78rem',
              color: 'var(--color-text-primary)',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '0.75rem',
            }}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={handleReject}
              disabled={!!acting}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'rgba(239,68,68,0.05)',
                color: 'var(--color-danger)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: acting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) =>
                !acting && (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')
              }
              onMouseLeave={(e) =>
                !acting && (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')
              }
            >
              {acting === 'reject' ? (
                <Loader2 size={13} style={{ animation: 'syncSpin 1s linear infinite' }} />
              ) : (
                <ThumbsDown size={13} />
              )}
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={!!acting}
              style={{
                flex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary)',
                color: 'var(--color-bg-surface)',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: acting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) =>
                !acting && (e.currentTarget.style.transform = 'translateY(-1px)')
              }
              onMouseLeave={(e) => !acting && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {acting === 'approve' ? (
                <Loader2 size={13} style={{ animation: 'syncSpin 1s linear infinite' }} />
              ) : (
                <ThumbsUp size={13} />
              )}
              Approve & Publish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SKU Sync result row ───────────────────────────────────────────────────────
function SyncResultRow({ item }) {
  const statusColor =
    item.status === 'ok'
      ? 'var(--color-success)'
      : item.status === 'warning'
        ? '#f59e0b'
        : 'var(--color-danger)';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.5rem 0.75rem',
        borderRadius: '9px',
        background: 'var(--color-bg-app)',
        border: '1px solid #f1f5f9',
      }}
    >
      <span style={{ fontSize: '0.75rem', flexShrink: 0 }}>
        {item.status === 'ok' ? '✅' : item.status === 'warning' ? '⚠️' : '❌'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.name || item.sku}
        </div>
        {item.message && (
          <div
            style={{
              fontSize: '0.65rem',
              color: 'var(--color-text-secondary)',
              marginTop: '0.1rem',
            }}
          >
            {item.message}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: '0.62rem',
          fontWeight: 800,
          color: statusColor,
          background: `${statusColor}10`,
          padding: '0.15rem 0.45rem',
          borderRadius: '5px',
          flexShrink: 0,
        }}
      >
        {item.status?.toUpperCase()}
      </span>
    </div>
  );
}

// ── Main Widget ───────────────────────────────────────────────────────────────
export default function AdminProductSyncWidget({
  ownerId = 'admin',
  ownerType = 'admin',
  permissions = { canEdit: true, canExport: true },
  hideCosts = false,
}) {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResults, setSyncResults] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [activeTab, setActiveTab] = useState('validate'); // 'validate' | 'sync'

  // Real-time listener for pending products
  useEffect(() => {
    const q = query(collection(db, 'products'), where('status', 'in', ['pending_review', 'draft']));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPendingProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoadingPending(false);
      },
      () => setLoadingPending(false)
    );
    return () => unsub();
  }, []);

  // Approve product
  const handleApprove = useCallback(async (productId, note) => {
    await updateDoc(doc(db, 'products', productId), {
      status: 'active',
      reviewNote: note || '',
      reviewedAt: serverTimestamp(),
      publishedAt: serverTimestamp(),
    });
  }, []);

  // Reject product
  const handleReject = useCallback(async (productId, note) => {
    await updateDoc(doc(db, 'products', productId), {
      status: 'rejected',
      reviewNote: note || '',
      reviewedAt: serverTimestamp(),
    });
  }, []);

  // SKU Sync
  async function runSkuSync() {
    setSyncLoading(true);
    setSyncError(null);
    setSyncResults(null);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const res = await fetch(SKU_SYNC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'full_sync', dryRun: false }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSyncResults(json);
    } catch (err) {
      console.error('[AdminProductSyncWidget]', err);
      setSyncError('Error executing sync. Please try again.');
    } finally {
      setSyncLoading(false);
    }
  };

  const pendingCount = pendingProducts.length;

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #f1f5f9',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          background: '#fafbfc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Package size={17} color="var(--color-primary)" />
            Products
            {pendingCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--color-danger)',
                  color: 'var(--color-bg-surface)',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {pendingCount}
              </span>
            )}
          </h3>
          <p
            style={{
              margin: '0.2rem 0 0',
              fontSize: '0.72rem',
              color: 'var(--color-text-tertiary)',
            }}
          >
            {pendingCount > 0
              ? `${pendingCount} product${pendingCount > 1 ? 's' : ''} require validation`
              : 'All products validated ✓'}
            {' · '}Zoho Books
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('validate')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              border: `1.5px solid ${activeTab === 'validate' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background:
                activeTab === 'validate' ? 'rgba(0,54,102,0.06)' : 'var(--color-bg-surface)',
              color:
                activeTab === 'validate' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'inherit',
            }}
          >
            Validate {pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              border: `1.5px solid ${activeTab === 'sync' ? '#6366f1' : 'var(--color-border)'}`,
              background:
                activeTab === 'sync' ? 'rgba(99,102,241,0.06)' : 'var(--color-bg-surface)',
              color: activeTab === 'sync' ? '#6366f1' : 'var(--color-text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 700,
              fontFamily: 'inherit',
            }}
          >
            <Link2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Zoho Sync
          </button>
        </div>
      </div>

      <div style={{ padding: '1.25rem 1.5rem' }}>
        {/* ── TAB: VALIDATE ─────────────────────────────────────────────────── */}
        {activeTab === 'validate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {loadingPending ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 68,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface)',
                      backgroundSize: '200% 100%',
                      animation: 'syncShimmer 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            ) : pendingProducts.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2rem',
                  background: 'var(--color-bg-app)',
                  borderRadius: 'var(--radius-md)',
                  border: '2px dashed #e2e8f0',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                <CheckCircle2
                  size={32}
                  strokeWidth={1.2}
                  style={{ marginBottom: '0.5rem', color: 'var(--color-success)' }}
                />
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  No products pending validation
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  All products are active or approved
                </div>
              </div>
            ) : (
              pendingProducts.map((p) => (
                <PendingProductCard
                  key={p.id}
                  product={p}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))
            )}
          </div>
        )}

        {/* ── TAB: SKU SYNC ─────────────────────────────────────────────────── */}
        {activeTab === 'sync' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Sync action */}
            <div
              style={{
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                border: '1px solid rgba(99,102,241,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Link2 size={14} color="#6366f1" /> Zoho ↔ Firebase Sync
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--color-text-secondary)',
                    marginTop: '0.2rem',
                  }}
                >
                  Reconciles SKUs, prices, and stock between Zoho Inventory and Firestore
                </div>
              </div>
              <button
                onClick={runSkuSync}
                disabled={syncLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#6366f1',
                  color: 'var(--color-bg-surface)',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: syncLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                  opacity: syncLoading ? 0.7 : 1,
                }}
              >
                {syncLoading ? (
                  <>
                    <Loader2 size={13} style={{ animation: 'syncSpin 1s linear infinite' }} />{' '}
                    Syncing…
                  </>
                ) : (
                  <>
                    <Zap size={13} /> Run Sync
                  </>
                )}
              </button>
            </div>

            {/* Error */}
            {syncError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(239,68,68,0.06)',
                  color: 'var(--color-danger)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={14} /> {syncError}
              </div>
            )}

            {/* Sync results */}
            {syncResults && (
              <div>
                {/* Summary KPIs */}
                <div
                  style={{
                    display: 'flex',
                    gap: '0.6rem',
                    marginBottom: '0.85rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {[
                    {
                      label: 'Total processed',
                      value: syncResults.total || 0,
                      color: 'var(--color-primary)',
                    },
                    {
                      label: 'Synced OK',
                      value: syncResults.synced || 0,
                      color: 'var(--color-success)',
                    },
                    { label: 'Warnings', value: syncResults.warnings || 0, color: '#f59e0b' },
                    {
                      label: 'Errors',
                      value: syncResults.errors || 0,
                      color: 'var(--color-danger)',
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      style={{
                        flex: '1 1 80px',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: `${color}08`,
                        border: `1px solid ${color}18`,
                      }}
                    >
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color, lineHeight: 1 }}>
                        {value}
                      </div>
                      <div
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          color: 'var(--color-text-tertiary)',
                          marginTop: '0.2rem',
                        }}
                      >
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Item list */}
                {syncResults.items?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {syncResults.items.slice(0, 10).map((item, i) => (
                      <SyncResultRow key={i} item={item} />
                    ))}
                    {syncResults.items.length > 10 && (
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-text-tertiary)',
                          textAlign: 'center',
                          paddingTop: '0.3rem',
                        }}
                      >
                        + {syncResults.items.length - 10} más
                      </div>
                    )}
                  </div>
                )}

                {/* AI Summary */}
                {syncResults.summary && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99,102,241,0.04)',
                      border: '1px solid rgba(99,102,241,0.12)',
                      fontSize: '0.78rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                    }}
                  >
                    {syncResults.summary}
                  </div>
                )}
              </div>
            )}

            {/* Idle state */}
            {!syncLoading && !syncResults && !syncError && (
              <div
                style={{
                  textAlign: 'center',
                  color: 'var(--color-text-tertiary)',
                  fontSize: '0.82rem',
                  padding: '1rem 0',
                }}
              >
                Press "Run Sync" to reconcile Zoho ↔ Firestore
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes syncSpin    { to { transform: rotate(360deg); } }
        @keyframes syncShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    </div>
  );
}
