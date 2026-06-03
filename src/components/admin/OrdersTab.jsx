import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { logAction } from '../../services/auditLogger';
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  CheckCheck,
  Send,
  Mail,
  Users,
  X,
  Eye,
  Building,
  Stethoscope,
  MapPin,
  Receipt,
  ExternalLink,
  Search,
  Archive,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { useLocation, useNavigate } from 'react-router-dom';
import { functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import DataTable from '../ui/DataTable';
import AppActionGroup from '../ui/AppActionGroup';
import AppStatusChip from '../ui/AppStatusChip';
import AppFilterBar from '../ui/AppFilterBar';
import AdminPageHeader from './AdminPageHeader';

// Template for admin-side order confirmation email to customer/doctor
const EMAILJS_CONFIRM_TEMPLATE = 'template_7unfks8';

export default function OrdersTab({ buyerId = null, accountManagerId = null, doctorId = null, readOnly = false }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [confirmModal, setConfirmModal] = useState(null); // order object
  const [viewModal, setViewModal] = useState(null); // order object
  const [sendTo, setSendTo] = useState({ customer: true, doctor: false });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState('');

  // Pagination State (Local UI)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const location = useLocation();
  const targetId = new URLSearchParams(location.search).get('orderId');
  const rowRefs = useRef({});

  // Pre-populate search from deep-link orderId param
  useEffect(() => {
    if (targetId && !searchTerm) {
      setSearchTerm(targetId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  /* ── Fetch ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerId, accountManagerId, doctorId]);

  async function fetchOrders() {
    try {
      setLoading(true);
      let qBuilder = collection(db, 'orders');
      if (buyerId) {
        qBuilder = query(qBuilder, where('paymentOwnerId', '==', buyerId));
      }
      if (accountManagerId) {
        qBuilder = query(qBuilder, where('accountManagerId', '==', accountManagerId));
      }
      if (doctorId) {
        qBuilder = query(qBuilder, where('doctorId', '==', doctorId));
      }
      const q = query(qBuilder, orderBy('createdAt', 'desc'), limit(500));
      const snap = await getDocs(q);
      const raw = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(raw); // Removed arbitrary items filter so all real orders show up
      // Inject data context for Atlas AI
      const pendingOrders = raw.filter(o => o.status === 'Pending' || o.status === 'Processing');
      const highValueOrders = raw.filter(o => o.total > 500);
      window.dispatchEvent(new CustomEvent('admin-context-update', {
        detail: {
          page: 'orders',
          totalOrders: raw.length,
          pendingCount: pendingOrders.length,
          highValueCount: highValueOrders.length,
          recentPending: pendingOrders.slice(0, 5).map(o => ({ id: o.id, customer: o.customerName || o.customerEmail, total: o.total, status: o.status })),
          summary: `Orders dashboard: ${raw.length} total orders loaded. ${pendingOrders.length} pending processing, ${highValueOrders.length} high-value orders (>$500).`
        }
      }));
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Auto-scroll to deep-linked order ───────────────────────────────── */
  useEffect(() => {
    if (!targetId || loading) return;
    const match = orders.find(
      (o) =>
        o.orderId === targetId ||
        o.id === targetId ||
        (o.orderNumber && o.orderNumber.includes(targetId))
    );
    if (match && rowRefs.current[match.id]) {
      setTimeout(() => {
        rowRefs.current[match.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [orders, loading, targetId]);

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const formatDate = (v) => {
    if (!v) return 'N/A';
    if (typeof v.toDate === 'function') return v.toDate().toLocaleDateString();
    if (v.seconds) return new Date(v.seconds * 1000).toLocaleDateString();
    const d = new Date(v);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
  };

  const isHighlighted = (o) =>
    targetId &&
    (o.orderId === targetId ||
      o.id === targetId ||
      (o.orderNumber && o.orderNumber.includes(targetId)));

  /* ── Confirm order ───────────────────────────────────────────────────── */
  async function handleConfirm() {
    if (!confirmModal) return;
    setSending(true);
    setSendResult('');
    try {
      // 1. Update Firestore status → 'Confirmed'
      await updateDoc(doc(db, 'orders', confirmModal.id), {
        status: 'Confirmed',
        confirmedAt: serverTimestamp(),
        confirmedBy: 'admin',
      });
      await logAction(
        auth.currentUser?.uid || 'unknown_admin',
        'admin',
        'ORDER_CONFIRM',
        confirmModal.id,
        { previousStatus: confirmModal.status, newStatus: 'Confirmed' }
      );

      // 2. Send emails via Cloud Function
      const orderId = confirmModal.orderId || confirmModal.id;
      const sendEmail = httpsCallable(functions, 'sendEmail');
      const recipients = [];
      if (sendTo.customer && confirmModal.customer?.email) {
        recipients.push({
          to: confirmModal.customer.email,
          name: confirmModal.customer.fullName || 'Customer',
        });
      }
      if (sendTo.doctor && confirmModal.doctorEmail) {
        recipients.push({
          to: confirmModal.doctorEmail,
          name: confirmModal.doctorName || 'Doctor',
        });
      }

      for (const r of recipients) {
        await sendEmail({
          templateId: EMAILJS_CONFIRM_TEMPLATE,
          templateParams: {
            to_email: r.to,
            to_name: r.name,
            order_id: orderId,
            order_total: `$${parseFloat(confirmModal.total || 0).toFixed(2)}`,
            order_date: formatDate(confirmModal.createdAt),
          }
        });
      }

      // 3. Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === confirmModal.id ? { ...o, status: 'Confirmed' } : o))
      );
      setSendResult(
        recipients.length > 0
          ? `✅ Order confirmed. Email sent to: ${recipients.map((r) => r.to).join(', ')}`
          : '✅ Order confirmed (no emails sent).'
      );
      setTimeout(() => {
        setConfirmModal(null);
        setSendResult('');
      }, 3000);
    } catch (err) {
      console.error('Confirm error:', err);
      setSendResult(`❌ Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  /* ── Archive & Delete ────────────────────────────────────────────────── */
  const handleArchive = async (order) => {
    try {
      if (!window.confirm(`Are you sure you want to archive order #${order.orderNumber || order.id.substring(0,8).toUpperCase()}?`)) return;
      await updateDoc(doc(db, 'orders', order.id), { status: 'Archived' });
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'Archived' } : o));
    } catch (err) {
      console.error('Archive error:', err);
      alert('Failed to archive order.');
    }
  };

  const handleDeleteOrder = async (order) => {
    try {
      if (!window.confirm(`Are you sure you want to DELETE order #${order.orderNumber || order.id.substring(0,8).toUpperCase()}? This action cannot be undone.`)) return;
      await deleteDoc(doc(db, 'orders', order.id));
      setOrders(orders.filter(o => o.id !== order.id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete order.');
    }
  };

  /* ── Filtered orders ─────────────────────────────────────────────────── */
  const filtered = orders.filter((o) => {
    const matchesStatus =
      filterStatus === 'All' || o.status?.toLowerCase() === filterStatus.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchLower ||
      (o.customer?.fullName || o.customer?.name || '').toLowerCase().includes(searchLower) ||
      (o.customer?.email || '').toLowerCase().includes(searchLower) ||
      (o.orderId || '').toLowerCase().includes(searchLower) ||
      (o.orderNumber || '').toLowerCase().includes(searchLower) ||
      (o.id || '').toLowerCase().includes(searchLower);

    let matchesDate = true;
    if (dateRange.start || dateRange.end) {
      const orderDate = o.createdAt?.seconds
        ? new Date(o.createdAt.seconds * 1000)
        : new Date(o.createdAt);
      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        if (orderDate < startDate) matchesDate = false;
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (orderDate > endDate) matchesDate = false;
      }
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, dateRange]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleExportCSV = () => {
    const exportData =
      selectedOrderIds.length > 0
        ? filtered.filter((o) => selectedOrderIds.includes(o.id))
        : filtered;
    if (exportData.length === 0) return alert('No orders to export');

    exportToCSV(exportData, `orders_export_${new Date().toISOString().slice(0, 10)}.csv`, [
      { header: 'Order ID', accessor: (o) => o.orderNumber || o.orderId || o.id.substring(0, 8) },
      { header: 'Date', accessor: (o) => formatDate(o.createdAt) },
      { header: 'Customer', accessor: (o) => o.customer?.fullName || o.customer?.name || '' },
      { header: 'Email', accessor: (o) => o.customer?.email || '' },
      { header: 'Status', accessor: (o) => o.status || 'Pending' },
      { header: 'Total', accessor: (o) => parseFloat(o.total || 0).toFixed(2) },
    ]);
  };

  /* ── 3-Column Paradigm & Expandable Rows ──────────────────────────────── */
  const columns = [
    {
      key: 'order',
      header: 'Order Details',
      sortKey: 'orderDateForSort',
      sortValue: (o) =>
        o.createdAt?.seconds ? o.createdAt.seconds : new Date(o.createdAt).getTime(),
      render: (o) => {
        const highlight = isHighlighted(o);
        const orderNum = o.orderNumber || o.orderId || o.id.substring(0, 8).toUpperCase();
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              style={{
                fontWeight: 700,
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {highlight && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    animation: 'pulse 2s infinite',
                  }}
                />
              )}
              #{orderNum}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('OPEN_ATLAS_CLINICAL_MODE', {
                    detail: { prompt: `Resume y analiza el pedido #${orderNum} del cliente ${o.customer?.fullName || o.customer?.name || 'Desconocido'}. ¿Hay alguna alerta logística o de stock?` }
                  }));
                }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', 
                  padding: '2px', color: 'var(--color-primary)', 
                  display: 'inline-flex', alignItems: 'center'
                }}
                title="Ask Atlas to analyze this order"
              >
                <Sparkles size={14} />
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', fontWeight: 600 }}>
              {o.customer?.fullName || o.customer?.name || '—'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
              {o.customer?.email || ''} • {formatDate(o.createdAt)}
            </div>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--color-primary)',
                marginTop: '2px',
              }}
            >
              Total: ${parseFloat(o.total || 0).toFixed(2)}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortKey: 'status',
      width: '140px',
      render: (o) => (
        <span
          style={{
            display: 'inline-flex',
            padding: '0.2rem 0.5rem',
            backgroundColor:
              o.status === 'Processing'
                ? 'rgba(59, 130, 246, 0.1)'
                : o.status === 'Shipped'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : o.status === 'Cancelled'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(107, 114, 128, 0.1)',
            color:
              o.status === 'Processing'
                ? '#3b82f6'
                : o.status === 'Shipped'
                  ? '#10b981'
                  : o.status === 'Cancelled'
                    ? '#ef4444'
                    : '#6b7280',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          {o.status || 'Pending'}
        </span>
      ),
    },
  ];

  if (!readOnly) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '120px',
      render: (o) => {
        const actions = [];
        const isConfirmed = ['confirmed', 'shipped', 'delivered'].includes(o.status?.toLowerCase());

        if (!isConfirmed) {
          actions.push({
            type: 'approve',
            onClick: () => {
              setConfirmModal(o);
              setSendTo({ customer: true, doctor: !!o.doctorEmail });
              setSendResult('');
            },
          });
        }

        actions.push({ type: 'view', onClick: () => setViewModal(o) });
        actions.push({ type: 'download', onClick: () => console.log('Download invoice', o.id) });
        actions.push({ type: 'archive', onClick: () => handleArchive(o) });
        actions.push({ type: 'delete', onClick: () => handleDeleteOrder(o) });

        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <AppActionGroup actions={actions} />
          </div>
        );
      },
    });
  }

  const renderOrderDetails = (o) => (
    <div
      style={{
        padding: '1rem',
        background: 'var(--color-bg-app)',
        borderTop: '1px solid var(--border)',
        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h5
            style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            <Stethoscope size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Routing / Doctor
          </h5>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {o.doctorName ? o.doctorName : 'Direct B2C Order'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
            {o.doctorEmail ? o.doctorEmail : 'No clinic assigned'}
          </div>
        </div>
        <div>
          <h5
            style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            <Users size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Assigned To
          </h5>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {o.accountManagerName || 'System Default'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
            {o.accountManagerId ? `ID: ${o.accountManagerId}` : 'Auto-assigned'}
          </div>
        </div>
        <div>
          <h5
            style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Shipping
          </h5>
          {o.shippingAddress ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', lineHeight: 1.4 }}>
              <div>{o.shippingAddress.address || o.shippingAddress.line1}</div>
              {(o.shippingAddress.city || o.shippingAddress.postal_code) && (
                <div>
                  {o.shippingAddress.city}, {o.shippingAddress.state}{' '}
                  {o.shippingAddress.postal_code}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>
              No shipping details provided
            </div>
          )}
        </div>
        <div>
          <h5
            style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            <Receipt size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Financials
          </h5>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
            Items: <strong>{o.items?.length || 0}</strong>
            <br />
            Subtotal: <strong>${parseFloat(o.subtotal || o.total || 0).toFixed(2)}</strong>
            <br />
            Total:{' '}
            <strong style={{ color: 'var(--color-primary)' }}>
              ${parseFloat(o.total || 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* ── Order Items List ── */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <h5 style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
          <Package size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Order Items
        </h5>
        {o.items && o.items.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {o.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-surface)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: '4px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} color="var(--color-text-tertiary)" />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{item.name || 'Unknown Product'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                      Qty: <strong>{item.quantity || 1}</strong> • SKU: {item.sku || item.productId || 'N/A'}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                    ${parseFloat((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                    (${parseFloat(item.price || 0).toFixed(2)} / ea)
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
            No item details available in this legacy order.
          </div>
        )}
      </div>
      
      {/* ── Additional Metadata ── */}
      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Stripe Payment Intent</span>
          <code style={{ fontSize: '0.8rem', background: 'var(--color-bg-surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}>
            {o.paymentIntentId || 'N/A'}
          </code>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Database Order ID</span>
          <code style={{ fontSize: '0.8rem', background: 'var(--color-bg-surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', color: 'var(--color-text-main)' }}>
            {o.id}
          </code>
        </div>
        {o.trackingNumber && (
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Tracking Number</span>
            <code style={{ fontSize: '0.8rem', background: 'var(--color-bg-surface)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', color: 'var(--color-primary)' }}>
              {o.trackingNumber}
            </code>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Auto-Refill (Zoho Subscriptions)</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: o.isSubscription ? 'var(--success)' : 'var(--text-muted)' }}>
            <input 
              type="checkbox" 
              checked={!!o.isSubscription} 
              onChange={async (e) => {
                const isSub = e.target.checked;
                try {
                  await updateDoc(doc(db, 'orders', o.id), { isSubscription: isSub });
                  setOrders(prev => prev.map(order => order.id === o.id ? { ...order, isSubscription: isSub } : order));
                } catch (err) {
                  console.error('Error toggling subscription:', err);
                }
              }} 
            />
            {o.isSubscription ? 'Enabled (Monthly)' : 'Disabled'}
          </label>
        </div>
      </div>
    </div>
  );

  const getActiveFilters = () => {
    const active = [];
    if (filterStatus && filterStatus !== 'All') {
      active.push({ label: 'Status', value: filterStatus, type: 'statusFilter' });
    }
    return active;
  };

  const handleFilterRemove = (f) => {
    if (f.type === 'statusFilter') setFilterStatus('All');
  };

  const renderCustomFilters = () => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        style={{
          padding: '0.4rem 0.75rem',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          backgroundColor: 'white',
          color: 'var(--text-main)',
          outline: 'none',
        }}
      >
        <option value="All">All Statuses</option>
        <option value="Processing">Processing</option>
        <option value="Shipped">Shipped</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* ── Deep-link banner ── */}
      {targetId && !loading && (
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: '#3b82f6', borderRadius: '8px', padding: '6px', display: 'flex' }}>
              <Package size={16} color="white" />
            </div>
            <div>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e40af' }}>
                🔔 Notification filter active
              </span>
              <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '1px' }}>
                Showing order{' '}
                <code style={{ background: 'rgba(59,130,246,0.12)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  #{targetId.slice(0, 8).toUpperCase()}
                </code>
                {' '}— click an order to see details
              </div>
            </div>
          </div>
          <button
            onClick={() => { setSearchTerm(''); navigate('/admin/orders', { replace: true }); }}
            style={{
              background: 'none', border: '1px solid #bfdbfe', borderRadius: '6px',
              padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600,
              color: '#3b82f6', cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            Clear filter ✕
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <AdminPageHeader
        title="Sales Orders"
        subtitle="Review, confirm, and manage your sales orders."
        icon={ShoppingCart}
      />


      {/* ── Table ── */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading orders…
        </div>
      ) : orders.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            background: 'var(--color-bg-app)',
            border: '1px dashed var(--border)',
          }}
        >
          <ShoppingCart
            size={48}
            color="var(--primary)"
            style={{ opacity: 0.2, marginBottom: '1rem' }}
          />
          <h3 style={{ margin: '0 0 0.5rem' }}>No Orders Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            No orders have been placed yet.
          </p>
        </div>
      ) : (
        <DataTable
          data={paginatedOrders}
          columns={columns}
          expandableRender={renderOrderDetails}
          selectedIds={selectedOrderIds}
          onSelectionChange={setSelectedOrderIds}
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          filters={getActiveFilters()}
          onFilterRemove={handleFilterRemove}
          renderCustomFilters={renderCustomFilters}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          totalItems={totalItems}
          renderBatchActions={(selected) => (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handleExportCSV}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.8rem',
                }}
              >
                <Download size={14} /> Export Selected
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm(`Are you sure you want to archive ${selectedOrderIds.length} orders?`)) return;
                  try {
                    const toArchive = [...selectedOrderIds];
                    for (const id of toArchive) {
                      await updateDoc(doc(db, 'orders', id), { status: 'Archived' });
                    }
                    setOrders(orders.map(o => toArchive.includes(o.id) ? { ...o, status: 'Archived' } : o));
                    setSelectedOrderIds([]);
                  } catch (err) {
                    console.error('Bulk archive error:', err);
                    alert('Failed to archive some orders.');
                  }
                }}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.8rem',
                  color: 'var(--color-warning)',
                  borderColor: 'var(--color-warning)'
                }}
              >
                <Archive size={14} /> Archive Selected
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm(`Are you sure you want to DELETE ${selectedOrderIds.length} orders? This cannot be undone.`)) return;
                  try {
                    const toDelete = [...selectedOrderIds];
                    for (const id of toDelete) {
                      await deleteDoc(doc(db, 'orders', id));
                    }
                    setOrders(orders.filter(o => !toDelete.includes(o.id)));
                    setSelectedOrderIds([]);
                  } catch (err) {
                    console.error('Bulk delete error:', err);
                    alert('Failed to delete some orders.');
                  }
                }}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.8rem',
                  color: 'var(--color-danger)',
                  borderColor: 'var(--color-danger)'
                }}
              >
                <Trash2 size={14} /> Delete Selected
              </button>
              <button
                onClick={() => {
                   alert("Bulk Convert to Invoices will be fully integrated with Zoho Books once the syncing module is active.");
                }}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.8rem',
                  color: '#10b981',
                  borderColor: '#10b981'
                }}
              >
                <FileText size={14} /> Convert to Invoices
              </button>
            </div>
          )}
        />
      )}

      {/* ── Confirm & Notify Modal ── */}
      {confirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setConfirmModal(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)',
              }}
            >
              <X size={20} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCheck size={22} color="var(--color-bg-surface)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Confirm Order
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  #
                  {confirmModal.orderNumber ||
                    confirmModal.orderId ||
                    confirmModal.id.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Order summary */}
            <div
              style={{
                background: 'var(--color-bg-app)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Customer
                </span>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {confirmModal.customer?.fullName || '—'}
                </span>
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}
              >
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Email
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                  {confirmModal.customer?.email || '—'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Total
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ${parseFloat(confirmModal.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Email recipient selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '0.75rem',
                }}
              >
                <Mail size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Send confirmation email to:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {/* Customer */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${sendTo.customer ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: sendTo.customer ? 'rgba(0,54,102,0.04)' : 'var(--color-bg-surface)',
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sendTo.customer}
                    onChange={(e) => setSendTo((s) => ({ ...s, customer: e.target.checked }))}
                    style={{ width: 16, height: 16 }}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      🛒 Customer — {confirmModal.customer?.fullName || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      {confirmModal.customer?.email || 'No email'}
                    </div>
                  </div>
                </label>
                {/* Doctor (only if assigned) */}
                {confirmModal.doctorEmail ? (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `2px solid ${sendTo.doctor ? '#0284c7' : 'var(--color-border)'}`,
                      background: sendTo.doctor
                        ? 'rgba(2,132,199,0.04)'
                        : 'var(--color-bg-surface)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sendTo.doctor}
                      onChange={(e) => setSendTo((s) => ({ ...s, doctor: e.target.checked }))}
                      style={{ width: 16, height: 16 }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        👨‍⚕️ Assigned Doctor — {confirmModal.doctorName || 'Doctor'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                        {confirmModal.doctorEmail}
                      </div>
                    </div>
                  </label>
                ) : (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px dashed #e2e8f0',
                      background: 'var(--color-bg-app)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--color-text-tertiary)',
                        fontSize: '0.85rem',
                      }}
                    >
                      <Users size={14} /> No doctor assigned to this order
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Result */}
            {sendResult && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: sendResult.startsWith('✅')
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${sendResult.startsWith('✅') ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  color: sendResult.startsWith('✅')
                    ? 'var(--color-success)'
                    : 'var(--color-danger)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                }}
              >
                {sendResult}
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #e2e8f0',
                  background: 'var(--color-bg-surface)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={sending}
                style={{
                  flex: 2,
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: 'var(--surface)',
                  color: 'var(--color-bg-surface)',
                  fontWeight: 800,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: sending ? 0.75 : 1,
                }}
              >
                {sending ? (
                  'Confirming…'
                ) : (
                  <>
                    <Send size={16} /> Confirm & Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Order Modal ── */}
      {viewModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)',
              padding: '2rem',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setViewModal(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)',
              }}
            >
              <X size={20} />
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Package size={22} color="var(--color-bg-surface)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  Order Details
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  #
                  {viewModal.orderNumber ||
                    viewModal.orderId ||
                    viewModal.id.substring(0, 8).toUpperCase()}{' '}
                  • {formatDate(viewModal.createdAt)}
                </p>
              </div>
              <div
                style={{
                  marginLeft: 'auto',
                  padding: '0.4rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,54,102,0.1)',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textTransform: 'capitalize',
                }}
              >
                {viewModal.status || 'Pending'}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              {/* Customer Info */}
              <div
                style={{
                  background: 'var(--color-bg-app)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Customer
                </h4>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {viewModal.customer?.fullName || viewModal.customer?.name || '—'}
                  {viewModal.customer?.id && (
                    <button
                      onClick={() => navigate('/admin/users')}
                      title="Go to Patient/User Profile"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {viewModal.customer?.email || '—'}
                </div>
              </div>

              {/* Assignment / Doctor Info */}
              <div
                style={{
                  background: 'var(--color-bg-app)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  <Stethoscope size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{' '}
                  Assigned Doctor/Clinic
                </h4>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {viewModal.doctorName || 'Not Assigned'}
                  {(viewModal.doctorId || viewModal.doctorEmail) && (
                    <button
                      onClick={() => navigate('/admin/users')}
                      title="Go to Doctor/Clinic Profile"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {viewModal.doctorEmail || '—'}
                </div>
              </div>

              {/* Shipping Info */}
              <div
                style={{
                  background: 'var(--color-bg-app)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Shipping
                </h4>
                {viewModal.shippingAddress ? (
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.4,
                    }}
                  >
                    {viewModal.shippingAddress.name && <div>{viewModal.shippingAddress.name}</div>}
                    <div>
                      {viewModal.shippingAddress.address || viewModal.shippingAddress.line1}
                    </div>
                    {(viewModal.shippingAddress.city || viewModal.shippingAddress.postal_code) && (
                      <div>
                        {viewModal.shippingAddress.city}, {viewModal.shippingAddress.state}{' '}
                        {viewModal.shippingAddress.postal_code}
                      </div>
                    )}
                    <div>{viewModal.shippingAddress.country}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>
                    No shipping details provided
                  </div>
                )}
                {viewModal.shippingMethod && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                    }}
                  >
                    Method: {viewModal.shippingMethod}
                  </div>
                )}
              </div>

              {/* Invoice & VAT */}
              <div
                style={{
                  background: 'var(--color-bg-app)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  <Receipt size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Billing
                  & VAT
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>
                      ${parseFloat(viewModal.subtotal || viewModal.total || 0).toFixed(2)}
                    </span>
                  </div>
                  {viewModal.shippingCost !== undefined && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Shipping:</span>
                      <span style={{ fontWeight: 600 }}>
                        ${parseFloat(viewModal.shippingCost || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: viewModal.vatAmount
                        ? 'var(--color-danger)'
                        : 'var(--color-text-secondary)',
                    }}
                  >
                    <span>VAT / Taxes:</span>
                    <span style={{ fontWeight: 600 }}>
                      {viewModal.vatAmount
                        ? `$${parseFloat(viewModal.vatAmount).toFixed(2)}`
                        : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#0f172a' }}>
              Order Items
            </h4>
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                marginBottom: '1.5rem',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                }}
              >
                <thead
                  style={{ background: 'var(--color-bg-app)', borderBottom: '1px solid #e2e8f0' }}
                >
                  <tr>
                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Item
                    </th>
                    <th style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>
                      Qty
                    </th>
                    <th
                      style={{
                        padding: '0.75rem',
                        color: 'var(--color-text-secondary)',
                        textAlign: 'right',
                      }}
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(viewModal.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td
                        style={{
                          padding: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {it.name || it.title || 'Unknown Product'}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--color-text-secondary)' }}>
                        x{it.quantity || 1}
                      </td>
                      <td
                        style={{
                          padding: '0.75rem',
                          color: 'var(--color-text-primary)',
                          textAlign: 'right',
                        }}
                      >
                        ${parseFloat(it.price || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {(!viewModal.items || viewModal.items.length === 0) && (
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          padding: '1rem',
                          textAlign: 'center',
                          color: 'var(--color-text-tertiary)',
                        }}
                      >
                        No items found
                      </td>
                    </tr>
                  )}
                  <tr style={{ background: 'var(--color-bg-app)', borderTop: '2px solid #e2e8f0' }}>
                    <td
                      colSpan={2}
                      style={{
                        padding: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-text-primary)',
                        textAlign: 'right',
                      }}
                    >
                      Total:
                    </td>
                    <td
                      style={{
                        padding: '0.75rem',
                        fontWeight: 800,
                        color: 'var(--color-primary)',
                        textAlign: 'right',
                      }}
                    >
                      ${parseFloat(viewModal.total || 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Assignment Action Block */}
            {!readOnly && viewMode === 'admin' && (
              <div
                style={{
                  background: 'rgba(59,130,246,0.05)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 0.75rem',
                    fontSize: '0.9rem',
                    color: '#1e3a8a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Building size={16} /> Assign & Notify Clinic / Wholesaler
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <select
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="">-- Select Partner --</option>
                    <option value="clinic_a">Wellness Clinic Alpha</option>
                    <option value="clinic_b">Dr. Smith Practice</option>
                    <option value="wholesale_1">MedSupplies Corp (Wholesaler)</option>
                  </select>
                  <button
                    onClick={() => {
                      alert('Assignment notification sent to selected partner.');
                      setViewModal(null);
                    }}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: 'var(--color-primary)',
                      color: 'var(--color-bg-surface)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Notify & Assign
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <div
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          opacity: 0.8,
          background: 'var(--surface)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          pointerEvents: 'none',
          zIndex: 1000,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        Widget: OrdersTab | Props: userId, viewMode, readOnly
      </div>
    </div>
  );
}
