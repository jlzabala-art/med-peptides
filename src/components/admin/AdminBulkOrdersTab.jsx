/**
 * AdminBulkOrdersTab.jsx
 *
 * Admin view for wholesaler bulk orders submitted as formal B2B purchases.
 * Shows: status, wholesaler info, aggregated items, source traceability,
 * and actions: Confirm → Shipped → Delivered.
 *
 * Real-time listener on bulk_orders collection.
 * Admin also sees admin_notifications badge for new unread bulk orders.
 */

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  where,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { logAction } from '../../services/auditLogger';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Truck,
  Package,
  Clock,
  Eye,
  AlertCircle,
  Building,
  ClipboardList,
  ShoppingBag,
  PackageSearch,
  Filter,
  RefreshCw,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { BULK_STATUS, BULK_STATUS_META } from '../../config/prescriptionConfig';
import AdminBulkOrderBuilder from './AdminBulkOrderBuilder';
import B2BOrderApprovalsWidget from './gadgets/B2BOrderApprovalsWidget';
import GlobalLogisticsQueueWidget from './gadgets/GlobalLogisticsQueueWidget';
import ConversationThread from '../messaging/ConversationThread';
import DataTable from '../ui/DataTable';
import AdminPageHeader from './AdminPageHeader';
import { Card } from '../ui';

// ── Status badge ──────────────────────────────────────────────────────────────
function BulkBadge({ status }) {
  const m = BULK_STATUS_META[status] || BULK_STATUS_META.draft;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.7rem',
        borderRadius: 'var(--radius-sm)',
        background: m.bg,
        color: m.color,
        fontSize: '0.67rem',
        fontWeight: 800,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}
    >
      {m.emoji} {m.label}
    </span>
  );
}

// ── Status progress bar ───────────────────────────────────────────────────────
const STATUS_STEPS = ['submitted', 'confirmed', 'shipped', 'delivered'];
function StatusProgress({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
      {STATUS_STEPS.map((s, i) => {
        const m = BULK_STATUS_META[s];
        const done = i <= idx;
        return (
          <React.Fragment key={s}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: done ? m.bg : '#f1f5f9',
                color: done ? m.color : 'var(--color-border)',
                fontSize: '0.62rem',
                fontWeight: 800,
              }}
            >
              {m.emoji} {m.label}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <ArrowRight
                size={10}
                color={i < idx ? 'var(--color-border)' : 'var(--color-border)'}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Source breakdown row ──────────────────────────────────────────────────────
function SourceBreakdown({ sources }) {
  if (!sources?.length) return null;
  return (
    <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      {sources.map((s, i) => (
        <div
          key={i}
          style={{
            fontSize: '0.65rem',
            color: 'var(--color-text-tertiary)',
            fontWeight: 600,
            paddingLeft: '1.25rem',
          }}
        >
          {s.type === 'own'
            ? `📦 Own stock`
            : s.type === 'prescription'
              ? `💊 Rx: ${s.patientName || '—'} (Dr. ${s.doctorName || '—'})`
              : `🛒 B2C Order: ${s.patientName || '—'}`}
          {' · '}
          {s.quantity} u.
        </div>
      ))}
    </div>
  );
}

// ── Aggregated items panel ────────────────────────────────────────────────────
function AggregatedItemsPanel({ items, isEditable, onUpdateItemQuantity }) {
  const [openItems, setOpenItems] = useState(new Set());
  const toggle = (id) =>
    setOpenItems((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {(items || []).map((item, i) => {
        const key = `${item.type}__${item.id}__${i}`;
        const isOpen = openItems.has(key);
        return (
          <div
            key={key}
            style={{
              padding: '0.6rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-bg-app)',
              border: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{item.type === 'protocol' ? '🧬' : '💊'}</span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: 'var(--color-text-primary)',
                  flex: 1,
                }}
              >
                {item.name || item.id}
              </span>
              {isEditable ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUpdateItemQuantity(i, item.quantity - 1); }}
                    style={{ padding: '0.2rem 0.5rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >-</button>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      color: 'var(--color-primary)',
                      minWidth: 28,
                      textAlign: 'center',
                    }}
                  >
                    {item.quantity}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onUpdateItemQuantity(i, item.quantity + 1); }}
                    style={{ padding: '0.2rem 0.5rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >+</button>
                  <span style={{ fontSize: '0.67rem', color: 'var(--color-text-tertiary)', minWidth: 32 }}>
                    {item.unit}
                  </span>
                </div>
              ) : (
                <>
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      color: 'var(--color-primary)',
                      minWidth: 28,
                      textAlign: 'right',
                    }}
                  >
                    {item.quantity}
                  </span>
                  <span
                    style={{ fontSize: '0.67rem', color: 'var(--color-text-tertiary)', minWidth: 32 }}
                  >
                    {item.unit}
                  </span>
                </>
              )}
              {item.sources?.length > 0 && (
                <button
                  onClick={() => toggle(key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-tertiary)',
                    padding: '0.15rem',
                  }}
                >
                  {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              )}
            </div>
            {isOpen && <SourceBreakdown sources={item.sources} />}
          </div>
        );
      })}
      <div
        style={{
          textAlign: 'right',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--color-text-secondary)',
          marginTop: '0.25rem',
        }}
      >
        {(items || []).length} lines · {(items || []).reduce((s, i) => s + (i.quantity || 0), 0)}{' '}
        total units
      </div>
    </div>
  );
}

// ── Action buttons per status ──────────────────────────────────────────────────
function BulkActions({ order, onUpdate }) {
  const [acting, setActing] = useState(false);

  const next = {
    draft: {
      label: 'Submit Order',
      nextStatus: 'submitted',
      icon: CheckCircle2,
      color: '#6366f1',
    },
    submitted: {
      label: 'Confirm Order',
      nextStatus: 'confirmed',
      icon: CheckCircle2,
      color: 'var(--color-success)',
    },
    confirmed: { label: 'Mark Shipped', nextStatus: 'shipped', icon: Truck, color: '#f59e0b' },
    shipped: {
      label: 'Mark Delivered',
      nextStatus: 'delivered',
      icon: Package,
      color: '#6366f1',
    },
  }[order.status];

  if (!next) return null;

  async function handle() {
    setActing(true);
    try {
      await onUpdate(order.id, next.nextStatus);
    } finally {
      setActing(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={acting}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.6rem 1.1rem',
        borderRadius: '9px',
        border: 'none',
        background: next.color,
        color: 'var(--color-bg-surface)',
        cursor: acting ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        fontWeight: 800,
        fontSize: '0.78rem',
        opacity: acting ? 0.7 : 1,
        boxShadow: `0 4px 12px ${next.color}40`,
        transition: 'all 0.15s',
      }}
    >
      <next.icon size={13} />
      {acting ? 'Saving…' : next.label}
    </button>
  );
}

// ── Bulk order card ───────────────────────────────────────────────────────────
const renderOrderDetails = (order, onUpdate) => {
  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Progress */}
      <div style={{ marginBottom: '1.25rem' }}>
        <StatusProgress status={order.status} />
      </div>

      {/* Aggregated items */}
      {order.aggregated_items?.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={sLabel}>📦 Aggregated Items</div>
          <div style={{ marginTop: '0.5rem' }}>
            <AggregatedItemsPanel 
              items={order.aggregated_items} 
              isEditable={order.status === 'draft'}
              onUpdateItemQuantity={async (idx, newQty) => {
                if (newQty < 0) return;
                const updatedItems = [...order.aggregated_items];
                if (newQty === 0) {
                  updatedItems.splice(idx, 1);
                } else {
                  updatedItems[idx] = { ...updatedItems[idx], quantity: newQty };
                }
                const { doc, updateDoc } = await import('firebase/firestore');
                await updateDoc(doc(db, 'bulk_orders', order.id), {
                  aggregated_items: updatedItems,
                  updatedAt: serverTimestamp()
                });
              }}
            />
          </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(99,102,241,0.04)',
            border: '1px solid rgba(99,102,241,0.12)',
            fontSize: '0.78rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.55,
            marginBottom: '1.25rem',
          }}
        >
          <span style={{ fontWeight: 700 }}>Wholesaler Note:</span> {order.notes}
        </div>
      )}

      {/* Contextual Chat */}
      {order.status !== 'draft' && (
        <div style={{ marginTop: '1.5rem', height: '350px', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <div style={sLabel}>💬 Order Chat</div>
          <div style={{ marginTop: '0.5rem', height: 'calc(100% - 1.5rem)' }}>
            <ConversationThread 
              conversationId={`order_${order.id}`} 
              conversationType="order_support" 
              referenceId={order.id} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const sLabel = {
  fontSize: '0.63rem',
  fontWeight: 800,
  color: 'var(--color-text-tertiary)',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

// ── Main Tab ──────────────────────────────────────────────────────────────────
export default function AdminBulkOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilter] = useState('all');
  const [unreadCount, setUnread] = useState(0);
  const [showBuilder, setShowBuilder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Real-time listener
  useEffect(() => {
    const q = query(collection(db, 'bulk_orders'), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(all);
        setUnread(all.filter((o) => o.status === 'submitted').length);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  // Status transition
  async function handleUpdate(orderId, newStatus) {
    const event = {
      event:
        newStatus === 'confirmed' ? 'confirmed' : newStatus === 'shipped' ? 'shipped' : 'delivered',
      actorId: 'admin',
      actorRole: 'admin',
      note: '',
      timestamp: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'bulk_orders', orderId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
      ...(newStatus === 'delivered' ? { deliveredAt: serverTimestamp() } : {}),
      timeline: orders.find((o) => o.id === orderId)?.timeline
        ? [...orders.find((o) => o.id === orderId).timeline, event]
        : [event],
    });
    
    await logAction(
      auth.currentUser?.uid || 'unknown_admin',
      'admin',
      'BULK_ORDER_UPDATE',
      orderId,
      { newStatus }
    );
  }

  // Filtered
  const filtered = orders.filter((o) => 
    (filterStatus === 'all' || o.status === filterStatus) &&
    (o.wholesalerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.wholesalerEmail?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats
  const stats = {
    submitted: orders.filter((o) => o.status === 'submitted').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    total: orders.length,
  };

  const columns = [
    {
      key: 'wholesalerName',
      header: 'Wholesaler / Date',
      sortKey: 'wholesalerName',
      sortValue: (o) => o.wholesalerName?.toLowerCase() || '',
      render: (o) => {
        const submittedDate = o.submittedAt?.toDate
          ? o.submittedAt.toDate().toLocaleString('es-ES', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {o.wholesalerName || 'Wholesaler'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              {o.wholesalerEmail || '—'} • {submittedDate}
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      render: (o) => <BulkBadge status={o.status} />
    },
    {
      key: 'lines',
      header: 'Lines',
      render: (o) => (
        <span style={{ fontWeight: 700 }}>
          {o.aggregated_items?.length || 0} line items
        </span>
      )
    },
    {
      key: 'source',
      header: 'Traceability',
      render: (o) => (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {o.source_prescription_ids?.map((id) => (
            <span
              key={id}
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(0,54,102,0.06)',
                color: 'var(--color-primary)',
              }}
            >
              Rx/{id.slice(0, 8)}…
            </span>
          ))}
          {o.source_order_ids?.map((id) => (
            <span
              key={id}
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16,185,129,0.06)',
                color: 'var(--color-success)',
              }}
            >
              Order/{id.slice(0, 8)}…
            </span>
          ))}
          {(!o.source_prescription_ids?.length && !o.source_order_ids?.length) && (
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)' }}>Manual Order</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (o) => <BulkActions order={o} onUpdate={handleUpdate} />
    }
  ];

  if (showBuilder) {
    return (
      <AdminBulkOrderBuilder
        onBack={() => setShowBuilder(false)}
        onSuccess={() => setShowBuilder(false)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <AdminPageHeader
        title="Bulk Orders B2B"
        subtitle={`${stats.total} total · ${stats.submitted} pending · ${stats.confirmed} confirmed · ${stats.shipped} shipped · ${stats.delivered} delivered`}
        icon={Layers}
        actions={
          <button
            onClick={() => setShowBuilder(true)}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Plus size={14} /> Create Bulk Order
          </button>
        }
      />

      {/* Gadgets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <B2BOrderApprovalsWidget />
        <GlobalLogisticsQueueWidget />
      </div>

      {/* Alert for pending */}
      {stats.submitted > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,0.05)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          <AlertCircle size={16} color="var(--color-danger)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.82rem' }}>
              {stats.submitted} pending B2B order{stats.submitted > 1 ? 's' : ''} awaiting confirmation
            </div>
            <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 600 }}>
              Confirm the orders so the wholesaler can proceed.
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <Card style={{ overflow: 'visible', padding: 0 }}>
        {loading ? (
          <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ height: 80, borderRadius: '18px', background: '#f1f5f9' }} />
            <div style={{ height: 80, borderRadius: '18px', background: '#f1f5f9' }} />
          </div>
        ) : (
          <DataTable
            data={filtered}
            columns={columns}
            keyField="id"
            expandableRender={(o) => renderOrderDetails(o, handleUpdate)}
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by wholesaler name or email..."
            renderCustomFilters={() => (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: `All (${stats.total})`, color: 'var(--color-primary)' },
                  { key: 'draft', label: `Drafts (${orders.filter(o => o.status === 'draft').length})`, color: 'var(--color-text-tertiary)' },
                  { key: 'submitted', label: `Pending (${stats.submitted})`, color: '#6366f1' },
                  { key: 'confirmed', label: `Confirmed (${stats.confirmed})`, color: 'var(--color-success)' },
                  { key: 'shipped', label: `Shipped (${stats.shipped})`, color: '#f59e0b' },
                  { key: 'delivered', label: `Delivered (${stats.delivered})`, color: 'var(--color-success)' },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      border: `1px solid ${filterStatus === f.key ? f.color : 'var(--color-border)'}`,
                      background: filterStatus === f.key ? `${f.color}0d` : 'var(--color-bg-surface)',
                      color: filterStatus === f.key ? f.color : 'var(--color-text-secondary)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      transition: 'all 0.12s',
                      fontFamily: 'inherit',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
            emptyTitle="No bulk orders found"
            emptyDescription={filterStatus !== 'all' ? 'No bulk orders found with this status.' : 'No bulk orders from wholesalers yet.'}
          />
        )}
      </Card>

      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminBulkOrdersTab | Props: none
      </div>
    </div>
  );
}
