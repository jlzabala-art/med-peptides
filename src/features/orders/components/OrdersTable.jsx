'use client';
import OrderDetailsPanel from './OrderDetailsPanel';


import { usePathname, useRouter } from 'next/navigation';
import { EMAILJS_CONFIG } from '@/config/emailjs';
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Package from "lucide-react/dist/esm/icons/package";
import Truck from "lucide-react/dist/esm/icons/truck";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Download from "lucide-react/dist/esm/icons/download";
import CheckCheck from "lucide-react/dist/esm/icons/check-check";
import Send from "lucide-react/dist/esm/icons/send";
import Mail from "lucide-react/dist/esm/icons/mail";
import Users from "lucide-react/dist/esm/icons/users";
import X from "lucide-react/dist/esm/icons/x";
import Eye from "lucide-react/dist/esm/icons/eye";
import Building from "lucide-react/dist/esm/icons/building";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Receipt from "lucide-react/dist/esm/icons/receipt";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import Search from "lucide-react/dist/esm/icons/search";
import Archive from "lucide-react/dist/esm/icons/archive";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Clock from "lucide-react/dist/esm/icons/clock";
import Activity from "lucide-react/dist/esm/icons/activity";

import PaginationControl from '../../../components/common/PaginationControl';
import React, { useState, useEffect, useRef } from 'react';
import orderRepository from '../../../repositories/orderRepository';
import { db, auth, functions } from '../../../firebase';


import notifier from '../../../services/NotificationService';
import { logAction } from '../../../services/auditLogger';
import { fetchOrdersAction } from '../../../actions/ordersActions';
import useOrders from '../../../hooks/data/useOrders';















import { exportToCSV } from '../../../utils/exportUtils';


import { httpsCallable } from 'firebase/functions';
import DataTable from '../../../components/ui/DataTable';
import AppActionGroup from '../../../components/ui/AppActionGroup';
import AppFilterBar from '../../../components/ui/AppFilterBar';
import PageHeader from '../../../components/ui/PageHeader';
import GlobalSearchBar from '../../../components/ui/GlobalSearchBar';
import DataTableSkeleton from '../../../components/ui/skeletons/DataTableSkeleton';
import CopyableId from '../../../components/ui/CopyableId';
import StatusChip from '../../../components/ui/StatusChip';
import InlineEditableCell from '../../../components/ui/InlineEditableCell';

// ── Uniform KPI Summary Bar ───────────────────────────────────────────────────
function UniformKPIs({ data, globalMetrics }) {
  const total = globalMetrics?.total ?? data.length;
  const pending = globalMetrics?.pending ?? data.filter(d => ['Pending', 'Processing'].includes(d.status)).length;
  const shipped = globalMetrics?.shipped ?? data.filter(d => ['Shipped'].includes(d.status)).length;
  const completed = globalMetrics?.completed ?? data.filter(d => ['Completed', 'Delivered'].includes(d.status)).length;
  
  const totalRevenue = globalMetrics?.totalRevenue ?? data.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);

  const stats = [
    { label: 'Total Orders', value: total, color: '#3b82f6', icon: <ShoppingCart size={16} /> },
    { label: 'Pending Processing', value: pending, color: '#f59e0b', icon: <Clock size={16} /> },
    { label: 'Shipped', value: shipped, color: '#8b5cf6', icon: <Truck size={16} /> },
    { label: 'Revenue (Loaded)', value: `$${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`, color: '#059669', icon: <Activity size={16} /> },
  ];

  return (
    <div className="orders-kpi-grid">
      {stats.map((s, i) => (
        <div key={i} className="orders-kpi-card">
          <div className="orders-kpi-header">
            <div className="orders-kpi-icon-wrap" style={{ color: s.color, background: s.color + '18' }}>
              {s.icon}
            </div>
            <span className="orders-kpi-label">{s.label}</span>
          </div>
          <div className="orders-kpi-value">
            {s.value}
          </div>
        </div>
      ))}
      <style jsx>{`
        .orders-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .orders-kpi-card {
          background: #ffffff;
          padding: 1rem 1.15rem;
          border-radius: 12px;
          border: 1px solid var(--border, #e2e8f0);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          min-width: 0;
          box-sizing: border-box;
        }
        .orders-kpi-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .orders-kpi-icon-wrap {
          padding: 6px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .orders-kpi-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted, #64748b);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .orders-kpi-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-main, #0f172a);
          line-height: 1.1;
        }
        @media (max-width: 768px) {
          .orders-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.65rem;
          }
          .orders-kpi-card {
            padding: 0.85rem;
          }
          .orders-kpi-value {
            font-size: 1.25rem;
          }
          .orders-kpi-label {
            font-size: 0.68rem;
          }
        }
      `}</style>
    </div>
  );
}

// ── Smart Chips ───────────────────────────────────────────────────────────────
function SmartChips({ activeChip, setActiveChip }) {
  const chips = [
    { id: 'All', label: 'All Orders', icon: <Package size={14} /> },
    { id: 'Processing', label: 'Processing', icon: <Clock size={14} /> },
    { id: 'Shipped', label: 'Shipped', icon: <Truck size={14} /> },
    { id: 'Completed', label: 'Completed', icon: <CheckCheck size={14} /> },
  ];

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.25rem' }}>
      {chips.map(chip => (
        <button
          key={chip.id}
          onClick={() => setActiveChip(chip.id)}
          style={{
            padding: '0.45rem 0.9rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
            background: activeChip === chip.id ? '#003666' : 'white',
            color: activeChip === chip.id ? 'white' : '#64748b',
            border: activeChip === chip.id ? '1px solid #003666' : '1px solid #e2e8f0',
          }}
          onMouseEnter={e => { if (activeChip !== chip.id) e.currentTarget.style.borderColor = '#94a3b8' }}
          onMouseLeave={e => { if (activeChip !== chip.id) e.currentTarget.style.borderColor = '#e2e8f0' }}
        >
          {chip.icon} {chip.label}
        </button>
      ))}
    </div>
  );
}

// Template for admin-side order confirmation email to customer/doctor
const EMAILJS_CONFIRM_TEMPLATE = EMAILJS_CONFIG.TEMPLATES.ORDER_CONFIRMATION;

export default function OrdersTable({ 
  role = 'admin', 
  initialOrders = [], 
  globalMetrics = null,
  buyerId = null, 
  accountManagerId = null, 
  doctorId = null, 
  readOnly = false, 
  viewMode = 'admin' 
}) {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [confirmModal, setConfirmModal] = useState(null); // order object
  const [viewModal, setViewModal] = useState(null); // order object
  const [sendTo, setSendTo] = useState({ customer: true, doctor: false });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState('');

  // Pagination State (Local UI + Infinite Scroll format)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const pathname = usePathname();
  const targetId = new URLSearchParams(location.search).get('orderId');
  const rowRefs = useRef({});

  // Pre-populate search from deep-link orderId param
  useEffect(() => {
    if (targetId && !searchTerm) {
      setSearchTerm(targetId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  /* ── Fetch (Reactivity via useOrders) ───────────────────────────────── */
  const filters = {};
  if (buyerId) filters.buyerId = buyerId;
  if (accountManagerId) filters.accountManagerId = accountManagerId;
  if (doctorId) filters.doctorId = doctorId;

  const { data: orders, loading, error, loadMore: fetchMoreOrders, hasMore } = useOrders(
    filters,
    { pageSize: 50, realtime: true, orderByDesc: true },
    initialOrders
  );

  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing');
    const highValueOrders = orders.filter(o => o.total > 500);
    window.dispatchEvent(new CustomEvent('admin-context-update', {
      detail: {
        page: 'orders',
        totalOrders: orders.length,
        pendingCount: pendingOrders.length,
        highValueCount: highValueOrders.length,
        recentPending: pendingOrders.slice(0, 5).map(o => ({ id: o.id, customer: o.customerName || o.customerEmail, total: o.total, status: o.status })),
        summary: `Orders dashboard: ${orders.length} total orders loaded.`
      }
    }));
  }, [orders]);

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
      await orderRepository.updateOrder(confirmModal.id, {
        status: 'Confirmed',
        confirmedAt: new Date(),
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

      // 3. Update local state (Handled by onSnapshot)
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
    notifier.confirmCritical(
      `Are you sure you want to archive order #${order.orderNumber || order.id.substring(0,8).toUpperCase()}?`,
      async () => {
        try {
          await orderRepository.archiveOrder(order.id);
          notifier.success('Order archived.');
        } catch (err) {
          console.error('Archive error:', err);
          notifier.error('Failed to archive order.');
        }
      }
    );
  };

  const handleDeleteOrder = async (order) => {
    notifier.confirmCritical(
      `Are you sure you want to DELETE order #${order.orderNumber || order.id.substring(0,8).toUpperCase()}? This action cannot be undone.`,
      async () => {
        try {
          await orderRepository.deleteOrder(order.id);
          notifier.success('Order deleted.');
        } catch (err) {
          console.error('Delete error:', err);
          notifier.error('Failed to delete order.');
        }
      }
    );
  };

  /* ── Filtered orders ─────────────────────────────────────────────────── */
  const filtered = orders.filter((o) => {
    const matchesStatus =
      filterStatus === 'All' || o.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesSource = filterSource === 'All' || (o.source && o.source.toLowerCase() === filterSource.toLowerCase());
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

    return matchesStatus && matchesSearch && matchesDate && matchesSource;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, dateRange]);

  const totalItems = filtered.length;
  // Infinite scroll style: 0 to N
  const paginatedOrders = filtered.slice(
    0,
    currentPage * rowsPerPage
  );

  const hasMoreItems = paginatedOrders.length < totalItems;

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleExportCSV = () => {
    const exportData =
      selectedOrderIds.length > 0
        ? filtered.filter((o) => selectedOrderIds.includes(o.id))
        : filtered;
    if (exportData.length === 0) return notifier.info('No orders to export');

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
      width: readOnly ? '75%' : '60%',
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
              <CopyableId value={o.orderId || o.id} displayValue={`#${orderNum}`} />
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
      width: readOnly ? '25%' : '22%',
      render: (o) => (
        <InlineEditableCell
          value={o.status || 'Pending'}
          type="select"
          options={[
            { label: 'Pending', value: 'Pending' },
            { label: 'Processing', value: 'Processing' },
            { label: 'Shipped', value: 'Shipped' },
            { label: 'Delivered', value: 'Delivered' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Cancelled', value: 'Cancelled' }
          ]}
          format={(val) => <StatusChip status={val} />}
          onSave={async (newStatus) => {
            try {
              await orderRepository.updateOrder(o.id, { status: newStatus });
              notifier.success('Order status updated');
              await logAction(auth.currentUser?.uid || 'unknown', 'admin', 'ORDER_STATUS_UPDATE', o.id, `Changed status to ${newStatus}`);
            } catch (err) {
              console.error(err);
              notifier.error('Failed to update status');
              throw err;
            }
          }}
        />
      ),
    },
  ];

  if (!readOnly) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '18%',
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

  const renderOrderDetails = (o) => <OrderDetailsPanel order={o} />;

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'All', value: 'All' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Processing', value: 'Processing' },
        { label: 'Shipped', value: 'Shipped' },
        { label: 'Delivered', value: 'Delivered' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' },
      ],
      value: filterStatus,
      onChange: setFilterStatus,
    },
  ];

  const activeFilters = [];
  if (filterStatus !== 'All') {
    activeFilters.push({ key: 'status', label: 'Status', value: filterStatus, onRemove: () => setFilterStatus('All') });
  }

  return (
    <div style={{ padding: '0 2rem 2rem 2rem' }}>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Orders"
        subtitle="Manage and track all customer orders"
        actions={
          <button
            className="gcp-btn gcp-btn--primary"
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={16} /> Export CSV
          </button>
        }
      />

      {/* ── KPI Summary Bar ───────────────────────────────────────────────── */}
      <UniformKPIs data={orders} globalMetrics={globalMetrics} />

      {/* ── Search & Filters ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1rem' }}>
        <GlobalSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by customer name, email, or order ID..."
          resultCount={filtered.length}
          namespace="admin-orders"
          size="lg"
          filters={activeFilters}
          filterOptions={filterOptions}
        />
      </div>

      {/* ── Status Chips ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SmartChips activeChip={filterStatus} setActiveChip={setFilterStatus} />
      </div>

      {/* ── Data Table ────────────────────────────────────────────────────── */}
      <div className="gcp-table-container">
        {loading ? (
          <DataTableSkeleton rows={8} cols={3} />
        ) : (
          <DataTable
            columns={columns}
            data={paginatedOrders}
            keyField={(o) => o.id}
            expandableRender={renderOrderDetails}
            selectable={!readOnly}
            selectedIds={selectedOrderIds}
            onSelectionChange={setSelectedOrderIds}
            globalSearch={false}
            emptyState={{
              icon: <Package size={40} />,
              title: 'No orders found',
              subtitle: activeFilters.length > 0 || searchTerm
                ? 'Try adjusting your search or clearing the filters.'
                : 'Orders will appear here once customers place them.',
              action: (activeFilters.length > 0 || searchTerm)
                ? { label: 'Clear filters', onClick: () => { setSearchTerm(''); setFilterStatus('All'); } }
                : null,
            }}
          />
        )}
      </div>

      {/* ── Load More ─────────────────────────────────────────────────────── */}
      {hasMoreItems && !loading && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button className="gcp-btn gcp-btn--secondary" onClick={loadMore}>
            Load more orders
          </button>
        </div>
      )}

      {/* ── Confirm / Email Modal ─────────────────────────────────────────── */}
      {confirmModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => { if (!sending) setConfirmModal(null); }}
        >
          <div
            style={{
              background: 'white', borderRadius: '16px', padding: '2rem',
              maxWidth: 480, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 700 }}>
              Confirm Order
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.9rem' }}>
              Order #{confirmModal.orderNumber || confirmModal.id?.substring(0, 8).toUpperCase()} —{' '}
              <strong>${parseFloat(confirmModal.total || 0).toFixed(2)}</strong>
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Send confirmation email to:</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={sendTo.customer} onChange={(e) => setSendTo(prev => ({ ...prev, customer: e.target.checked }))} />
                <span style={{ fontSize: '0.875rem' }}>Customer ({confirmModal.customer?.email || 'N/A'})</span>
              </label>
              {confirmModal.doctorEmail && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sendTo.doctor} onChange={(e) => setSendTo(prev => ({ ...prev, doctor: e.target.checked }))} />
                  <span style={{ fontSize: '0.875rem' }}>Doctor ({confirmModal.doctorEmail})</span>
                </label>
              )}
            </div>

            {sendResult && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: sendResult.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: sendResult.startsWith('✅') ? '#16a34a' : '#dc2626', fontSize: '0.875rem' }}>
                {sendResult}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="gcp-btn gcp-btn--secondary" disabled={sending} onClick={() => setConfirmModal(null)}>Cancel</button>
              <button className="gcp-btn gcp-btn--primary" disabled={sending} onClick={handleConfirm}>
                {sending ? 'Confirming…' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View / Detail Modal ───────────────────────────────────────────── */}
      {viewModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setViewModal(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: '16px', padding: '2rem',
              maxWidth: 640, width: '95%', maxHeight: '85vh', overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Order Details</h3>
              <button
                onClick={() => setViewModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>
            <OrderDetailsPanel order={viewModal} />
          </div>
        </div>
      )}
    </div>
  );
}
