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
import { db } from '../../firebase';
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
            ? `📦 Stock propio`
            : s.type === 'prescription'
              ? `💊 Rx: ${s.patientName || '—'} (Dr. ${s.doctorName || '—'})`
              : `🛒 Order B2C: ${s.patientName || '—'}`}
          {' · '}
          {s.quantity} u.
        </div>
      ))}
    </div>
  );
}

// ── Aggregated items panel ────────────────────────────────────────────────────
function AggregatedItemsPanel({ items }) {
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
        {(items || []).length} líneas · {(items || []).reduce((s, i) => s + (i.quantity || 0), 0)}{' '}
        unidades totales
      </div>
    </div>
  );
}

// ── Action buttons per status ──────────────────────────────────────────────────
function BulkActions({ order, onUpdate }) {
  const [acting, setActing] = useState(false);

  const next = {
    submitted: {
      label: 'Confirmar pedido',
      nextStatus: 'confirmed',
      icon: CheckCircle2,
      color: 'var(--color-success)',
    },
    confirmed: { label: 'Marcar enviado', nextStatus: 'shipped', icon: Truck, color: '#f59e0b' },
    shipped: {
      label: 'Marcar entregado',
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
      {acting ? 'Guardando…' : next.label}
    </button>
  );
}

// ── Bulk order card ───────────────────────────────────────────────────────────
function BulkOrderCard({ order, onUpdate }) {
  const [open, setOpen] = useState(order.status === 'submitted'); // auto-open new ones

  const createdDate = order.createdAt?.toDate
    ? order.createdAt
        .toDate()
        .toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
  const submittedDate = order.submittedAt?.toDate
    ? order.submittedAt.toDate().toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const isNew = order.status === 'submitted';

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: '18px',
        border: `1.5px solid ${isNew ? 'rgba(99,102,241,0.3)' : '#f1f5f9'}`,
        boxShadow: isNew ? '0 4px 20px rgba(99,102,241,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
      }}
    >
      {/* NEW badge ribbon */}
      {isNew && (
        <div
          style={{
            background: 'var(--surface)',
            padding: '0.3rem 1.25rem',
            fontSize: '0.65rem',
            fontWeight: 800,
            color: 'var(--color-bg-surface)',
            letterSpacing: '0.07em',
          }}
        >
          🔔 NUEVO PEDIDO B2B — Requiere confirmación
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          background: isNew ? 'rgba(99,102,241,0.02)' : 'var(--color-bg-surface)',
        }}
        onClick={() => setOpen((v) => !v)}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            flexShrink: 0,
            background: 'rgba(99,102,241,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Layers size={18} color="#6366f1" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
            {order.wholesalerName || 'Wholesaler'} — Bulk Order
          </div>
          <div
            style={{
              fontSize: '0.67rem',
              color: 'var(--color-text-tertiary)',
              fontWeight: 600,
              marginTop: '0.1rem',
              display: 'flex',
              gap: '0.4rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Clock size={9} /> Enviado: {submittedDate}
            <span>· {order.wholesalerEmail || '—'}</span>
            {order.source_prescription_ids?.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                · <ClipboardList size={9} /> {order.source_prescription_ids.length} Rx
              </span>
            )}
            {order.source_order_ids?.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                · <ShoppingBag size={9} /> {order.source_order_ids.length} orders
              </span>
            )}
            <span>· {order.aggregated_items?.length || 0} líneas</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <BulkBadge status={order.status} />
          {open ? (
            <ChevronUp size={14} color="var(--color-border)" />
          ) : (
            <ChevronDown size={14} color="var(--color-border)" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f8fafc' }}>
          {/* Progress */}
          <div style={{ marginTop: '0.85rem', marginBottom: '1rem' }}>
            <StatusProgress status={order.status} />
          </div>

          {/* Aggregated items */}
          {order.aggregated_items?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={sLabel}>📦 Ítems agregados</div>
              <div style={{ marginTop: '0.5rem' }}>
                <AggregatedItemsPanel items={order.aggregated_items} />
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
                marginBottom: '1rem',
              }}
            >
              <span style={{ fontWeight: 700 }}>Nota del wholesaler:</span> {order.notes}
            </div>
          )}

          {/* References */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {order.source_prescription_ids?.map((id) => (
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
                💊 Rx/{id.slice(0, 8)}…
              </span>
            ))}
            {order.source_order_ids?.map((id) => (
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
                🛒 Order/{id.slice(0, 8)}…
              </span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <BulkActions order={order} onUpdate={onUpdate} />
          </div>
        </div>
      )}
    </div>
  );
}

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
  };

  // Filtered
  const filtered = orders.filter((o) => filterStatus === 'all' || o.status === filterStatus);

  // Stats
  const stats = {
    submitted: orders.filter((o) => o.status === 'submitted').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    total: orders.length,
  };

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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99,102,241,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Layers size={20} color="#6366f1" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: 'var(--color-danger)',
                  color: 'var(--color-bg-surface)',
                  fontSize: '0.55rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
              Bulk Orders B2B
            </h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
              {stats.total} total · {stats.submitted} pendientes · {stats.confirmed} confirmados ·{' '}
              {stats.shipped} en tránsito · {stats.delivered} entregados
            </p>
          </div>
        </div>
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
          <Plus size={14} /> Crear Bulk Order
        </button>
      </div>

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
              {stats.submitted} pedido{stats.submitted > 1 ? 's' : ''} B2B esperando confirmación
            </div>
            <div style={{ fontSize: '0.7rem', color: '#fca5a5', fontWeight: 600 }}>
              Confirma los pedidos para que el wholesaler pueda proceder.
            </div>
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `Todos (${stats.total})`, color: 'var(--color-primary)' },
          { key: 'submitted', label: `Pendiente (${stats.submitted})`, color: '#6366f1' },
          {
            key: 'confirmed',
            label: `Confirmado (${stats.confirmed})`,
            color: 'var(--color-success)',
          },
          { key: 'shipped', label: `En tránsito (${stats.shipped})`, color: '#f59e0b' },
          {
            key: 'delivered',
            label: `Entregado (${stats.delivered})`,
            color: 'var(--color-success)',
          },
        ].map((f) => (
          <button
            key={f.key}
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

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: 80,
                borderRadius: '18px',
                background: 'var(--surface)',
                backgroundSize: '200% 100%',
                animation: 'bkAdShimmer 1.5s infinite',
              }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-tertiary)' }}>
          <Layers size={40} strokeWidth={1.2} style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
            {filterStatus !== 'all'
              ? 'No hay bulk orders con ese estado.'
              : 'Aún no hay bulk orders de wholesalers.'}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.4rem' }}>
            Los bulk orders aparecerán aquí cuando los wholesalers los envíen.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((order) => (
            <BulkOrderCard key={order.id} order={order} onUpdate={handleUpdate} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes bkAdShimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    
      <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.8, background: 'var(--surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', pointerEvents: 'none', zIndex: 1000, boxShadow: 'var(--shadow-sm)' }}>
        Widget: AdminBulkOrdersTab | Props: none
      </div>
    
</div>
  );
}
