'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Download,
  RefreshCw,
  Box,
  Truck,
  ChevronDown,
  ChevronUp,
  Info,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Printer,
  CheckCircle2
} from '@/lib/icons';
import {
  DataTable,
  MetricCard,
  StatusBadge,
  CopyableId,
  EmptyState,
  GlobalSearchBar
} from '../../../components/ui';
import PageHeader from '../../../components/ui/PageHeader';
import {
  fetchWholesalerCommissionsAction,
  reconcileWholesalerPayoutAction
} from '../../../actions/wholesalerActions';
import { toast } from 'react-hot-toast';

const REFERRAL_TARGETS = [
  { id: 'peptides', label: 'Peptides & Vials Schedule', path: '/pricing/peptides', shareMsg: 'Hello Dr., here is our direct B2B lyophilized peptide pricing schedule (≥99% HPLC purity certified, express courier dispatch):' },
  { id: 'vials', label: 'Clinical Vials Portfolio', path: '/vials', shareMsg: 'Hello Dr., here is our complete direct clinical vials catalog for practice dispensing:' },
  { id: 'colway', label: 'Colway® Dermocosmetics', path: '/pricing/colway', shareMsg: 'Hello, here is the official B2B schedule for Colway® bioactive native tropocollagen & dermocosmetics:' },
  { id: 'ultraman', label: 'UltraPerson™ Longevity', path: '/vials?collection=ultraman', shareMsg: 'Hello, here is the clinical catalog for UltraPerson™ precision longevity & metabolic supplements:' }
];

export default function WholesalerCommissionsClient({ initialData = null }) {
  const { user } = useAuth();
  const [data, setData] = useState(initialData || {
    wholesalerId: 'np-labs-international',
    wholesalerName: 'Nikolaos Psathas (NP Labs International)',
    referralCode: 'CAT-RX-7482',
    commissionRate: 0.15,
    kpis: {
      totalCommissions: 0,
      pendingPayoutCommissions: 0,
      paidCommissions: 0,
      totalRevenue: 0,
      totalUnits: 0,
      ordersCount: 0
    },
    orders: []
  });

  const [loading, setLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'reconciled'
  const [collectionFilter, setCollectionFilter] = useState('all'); // 'all' | 'vials' | 'colway' | 'bloodo' | 'ultraman'
  const [dateRange, setDateRange] = useState('all_time'); // 'all_time' | 'this_month' | 'last_30_days' | 'last_quarter'
  const [scopeMode, setScopeMode] = useState('filtered'); // 'filtered' | 'global'
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Link Generator State
  const [selectedCatalogTarget, setSelectedCatalogTarget] = useState('peptides');
  const [copiedLink, setCopiedLink] = useState(false);

  // Wholesaler identifier from auth or defaults to Nikolas for QA
  const effectiveWholesalerId = useMemo(() => {
    if (!user) return data.wholesalerId || 'np-labs-international';
    const email = String(user.email || '').toLowerCase();
    const isNikolas = email.includes('nikol') || email.includes('nplabs') || email === 'jlzabala@gmail.com';
    return isNikolas ? 'np-labs-international' : (user.uid || 'np-labs-international');
  }, [user, data.wholesalerId]);

  // Construct active referral URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
  const activeCatalog = REFERRAL_TARGETS.find(t => t.id === selectedCatalogTarget) || REFERRAL_TARGETS[0];
  const refCode = data.referralCode || 'CAT-RX-7482';
  const referralUrl = `${origin}${activeCatalog.path}${activeCatalog.path.includes('?') ? '&' : '?'}ref=${encodeURIComponent(refCode)}`;

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    toast.success('Referral link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `${activeCatalog.shareMsg} ${referralUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWholesalerCommissionsAction(effectiveWholesalerId);
      if (res && res.success) {
        setData(res);
        toast.success('Commissions ledger refreshed from live database');
      } else {
        toast.error('Could not refresh ledger');
      }
    } catch (err) {
      console.error('Refresh error:', err);
      toast.error('Failed to reload commissions');
    } finally {
      setLoading(false);
    }
  }, [effectiveWholesalerId]);

  // Payout Reconciliation Handler (Admin Settlement)
  const handleReconcileOrder = useCallback(async (orderId, orderCode) => {
    setReconciling(true);
    try {
      const res = await reconcileWholesalerPayoutAction({
        wholesalerId: effectiveWholesalerId,
        orderIds: [orderId],
        payoutReference: `PAYOUT-BANK-${Date.now().toString().slice(-6)}`,
        notes: `Bank disbursement settlement for order #${orderCode}`
      });

      if (res && res.success) {
        toast.success(`Commission for order #${orderCode} reconciled (+€${res.reconciledAmount.toFixed(2)})`);
        await handleRefresh();
      } else {
        toast.error(res?.error || 'Reconciliation failed');
      }
    } catch (err) {
      console.error('Reconciliation error:', err);
      toast.error('Failed to reconcile order');
    } finally {
      setReconciling(false);
    }
  }, [effectiveWholesalerId, handleRefresh]);

  // Batch reconcile all pending orders in current filtered view
  const handleReconcileAllPending = async () => {
    const pendingOrders = filteredOrders.filter(o => o.payoutStatus !== 'reconciled');
    if (pendingOrders.length === 0) {
      toast.info('No pending commissions in current view to reconcile');
      return;
    }

    setReconciling(true);
    try {
      const orderIds = pendingOrders.map(o => o.id || o.orderId);
      const res = await reconcileWholesalerPayoutAction({
        wholesalerId: effectiveWholesalerId,
        orderIds,
        payoutReference: `BATCH-DISBURSE-${new Date().toISOString().split('T')[0]}`,
        notes: `Batch monthly payout reconciliation for ${orderIds.length} orders`
      });

      if (res && res.success) {
        toast.success(`Successfully reconciled €${res.reconciledAmount.toFixed(2)} across ${res.ordersCount} orders!`);
        await handleRefresh();
      } else {
        toast.error(res?.error || 'Batch reconciliation failed');
      }
    } catch (err) {
      console.error('Batch reconciliation error:', err);
      toast.error('Failed to settle pending batch');
    } finally {
      setReconciling(false);
    }
  };

  // Filtered orders computation
  const filteredOrders = useMemo(() => {
    const list = data.orders || [];
    const query = searchQuery.trim().toLowerCase();

    return list.filter(order => {
      // 1. Status Filter
      if (statusFilter !== 'all') {
        const pStatus = (order.payoutStatus || 'pending').toLowerCase();
        if (pStatus !== statusFilter) return false;
      }

      // 2. Collection Filter
      if (collectionFilter !== 'all') {
        const col = (order.collection || 'vials').toLowerCase();
        if (col !== collectionFilter) return false;
      }

      // 3. Date Range Filter (Golden Rule #24)
      if (dateRange !== 'all_time' && order.createdAt) {
        const ordDate = new Date(order.createdAt);
        const now = new Date();
        if (dateRange === 'this_month') {
          if (ordDate.getMonth() !== now.getMonth() || ordDate.getFullYear() !== now.getFullYear()) return false;
        } else if (dateRange === 'last_30_days') {
          const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (ordDate < d30) return false;
        } else if (dateRange === 'last_quarter') {
          const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          if (ordDate < d90) return false;
        }
      }

      // 4. Search Query
      if (query) {
        const matchCode = String(order.orderCode || '').toLowerCase().includes(query);
        const matchName = String(order.customerName || '').toLowerCase().includes(query);
        const matchEmail = String(order.customerEmail || '').toLowerCase().includes(query);
        const matchItems = Array.isArray(order.items) && order.items.some(i =>
          String(i.name || i.productName || '').toLowerCase().includes(query)
        );
        if (!matchCode && !matchName && !matchEmail && !matchItems) return false;
      }

      return true;
    });
  }, [data.orders, statusFilter, collectionFilter, dateRange, searchQuery]);

  // Scope metrics: Switch between Active Filtered View vs Entire Database (Golden Rule #22)
  const activeMetrics = useMemo(() => {
    if (scopeMode === 'global') {
      return data.kpis;
    }

    const comms = Number(filteredOrders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0).toFixed(2));
    const rev = Number(filteredOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0).toFixed(2));
    const units = filteredOrders.reduce((sum, o) => sum + (o.totalUnits || 0), 0);
    const paid = Number(filteredOrders.filter(o => o.payoutStatus === 'reconciled' || o.payoutStatus === 'paid').reduce((sum, o) => sum + (o.commissionAmount || 0), 0).toFixed(2));
    const pending = Number((comms - paid).toFixed(2));

    return {
      totalCommissions: comms,
      pendingPayoutCommissions: Math.max(pending, 0),
      paidCommissions: paid,
      totalRevenue: rev,
      totalUnits: units,
      ordersCount: filteredOrders.length
    };
  }, [data.kpis, filteredOrders, scopeMode]);

  // Export to CSV
  const handleExportCsv = () => {
    const orders = filteredOrders;
    if (orders.length === 0) {
      toast.error('No orders available to export in current view');
      return;
    }

    const headers = ['Order Code', 'Date', 'Client', 'Email', 'Collection', 'Units', 'Subtotal', 'Shipping', 'Grand Total', 'Currency', 'Commission Rate', 'Commission Amount', 'Payout Status'];
    const rows = orders.map(o => [
      `"${o.orderCode}"`,
      `"${o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : ''}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerEmail || ''}"`,
      `"${o.collection || 'vials'}"`,
      o.totalUnits,
      o.subtotal,
      o.shippingCost,
      o.grandTotal,
      o.currency,
      '15%',
      o.commissionAmount,
      `"${o.payoutStatus || 'pending'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wholesaler_commissions_${refCode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Commissions ledger CSV downloaded');
  };

  // Print / PDF Statement Generator
  const handlePrintStatement = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=800');
    if (!printWindow) {
      toast.error('Please allow popups to open the PDF Commission Statement');
      return;
    }

    const statementDate = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
    const sym = '€';

    const orderRowsHtml = filteredOrders.map((o, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 8px 10px; font-weight: 700; font-family: monospace;">${o.orderCode}</td>
        <td style="padding: 8px 10px; color: #475569;">${o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
        <td style="padding: 8px 10px; font-weight: 600;">${o.customerName || 'Direct Clinic'}</td>
        <td style="padding: 8px 10px; text-align: center;">${o.totalUnits || 0}</td>
        <td style="padding: 8px 10px; text-align: right;">${sym}${Number(o.subtotal || 0).toFixed(2)}</td>
        <td style="padding: 8px 10px; text-align: right; font-weight: 700; color: #16a34a;">+${sym}${Number(o.commissionAmount || 0).toFixed(2)}</td>
        <td style="padding: 8px 10px; text-align: center; font-weight: 700; text-transform: uppercase; font-size: 11px; color: ${o.payoutStatus === 'reconciled' ? '#16a34a' : '#d97706'};">
          ${o.payoutStatus || 'pending'}
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Atlas Health · Commission Statement #${refCode}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 30px; color: #0f172a; line-height: 1.4; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #003666; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; color: #003666; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .kpi-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
          .kpi-title { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; }
          .kpi-val { font-size: 18px; font-weight: 800; color: #003666; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #003666; color: #ffffff; padding: 10px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
          @media print {
            body { margin: 15mm; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Atlas Health Services · Commission & Payout Statement</h1>
            <div class="subtitle">Official B2B Partner Remittance & Referral Settlement Statement</div>
            <div style="font-size: 12px; margin-top: 6px;">
              <strong>Partner:</strong> ${data.wholesalerName || 'NP Labs International'} · <strong>Referral Code:</strong> ${refCode}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 13px;">Date: ${statementDate}</div>
            <div style="font-size: 11px; color: #64748b;">Currency: EUR (€) · Rate: 15.0%</div>
            <button class="no-print" onclick="window.print()" style="margin-top: 8px; padding: 6px 14px; background: #003666; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 12px;">Print / Save as PDF</button>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-box">
            <div class="kpi-title">Total Earned</div>
            <div class="kpi-val" style="color: #16a34a;">${sym}${activeMetrics.totalCommissions.toFixed(2)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-title">Pending Disbursement</div>
            <div class="kpi-val" style="color: #d97706;">${sym}${activeMetrics.pendingPayoutCommissions.toFixed(2)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-title">Reconciled / Settled</div>
            <div class="kpi-val" style="color: #2563eb;">${sym}${activeMetrics.paidCommissions.toFixed(2)}</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-title">Referred Sales Vol.</div>
            <div class="kpi-val">${sym}${activeMetrics.totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order Code</th>
              <th>Date</th>
              <th>Clinic / Customer</th>
              <th style="text-align: center;">Vials</th>
              <th style="text-align: right;">Subtotal</th>
              <th style="text-align: right;">Commission (15%)</th>
              <th style="text-align: center;">Payout Status</th>
            </tr>
          </thead>
          <tbody>
            ${orderRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          <div>
            <strong>Atlas Health Services S.L.</strong> · European Registered Compounding & Distribution Hub<br>
            All commissions calculated strictly on formulation subtotal (excluding express freight logistics).
          </div>
          <div style="text-align: right;">
            Remittance coordination: accounting@atlashealth-services.com<br>
            Statement Reference: STMT-${refCode}-${new Date().toISOString().split('T')[0]}
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // DataTable column definitions (Golden Rule #30: Explicit column widths)
  const columns = useMemo(() => [
    {
      header: 'Order Ref',
      field: 'orderCode',
      width: '18%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CopyableId value={row.orderCode} />
          {row.items && row.items.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedRowId(expandedRowId === row.id ? null : row.id);
              }}
              title="Toggle line items breakdown"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: expandedRowId === row.id ? '#e0f2fe' : '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                width: '22px',
                height: '22px',
                cursor: 'pointer',
                color: '#0284c7'
              }}
            >
              {expandedRowId === row.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      )
    },
    {
      header: 'Date',
      field: 'createdAt',
      width: '12%',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {row.createdAt
            ? new Date(row.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—'}
        </span>
      )
    },
    {
      header: 'Clinic / Practitioner',
      field: 'customerName',
      width: '20%',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
            {row.customerName || 'Clinical Client'}
          </div>
          {row.customerEmail && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {row.customerEmail}
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Units',
      field: 'totalUnits',
      width: '9%',
      render: (row) => (
        <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#003666' }}>
          {row.totalUnits || 0} pcs
        </span>
      )
    },
    {
      header: 'Subtotal (Excl. Freight)',
      field: 'subtotal',
      width: '14%',
      render: (row) => {
        const sym = row.currency === 'EUR' ? '€' : '$';
        return (
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#334155' }}>
              {sym}{Number(row.subtotal || 0).toFixed(2)}
            </span>
            <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
              Freight: {sym}{Number(row.shippingCost || 60).toFixed(2)}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Commission (15%)',
      field: 'commissionAmount',
      width: '13%',
      render: (row) => {
        const sym = row.currency === 'EUR' ? '€' : '$';
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '3px 8px'
          }}>
            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#16a34a' }}>
              +{sym}{Number(row.commissionAmount || 0).toFixed(2)}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Payout Status',
      field: 'payoutStatus',
      width: '14%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <StatusBadge status={row.payoutStatus || 'pending'} />
          {row.payoutStatus !== 'reconciled' && (
            <button
              type="button"
              onClick={() => handleReconcileOrder(row.id || row.orderId, row.orderCode)}
              disabled={reconciling}
              title="Mark commission as reconciled/paid"
              style={{
                border: 'none',
                background: '#e0f2fe',
                color: '#0284c7',
                borderRadius: '4px',
                padding: '2px 5px',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: reconciling ? 'not-allowed' : 'pointer'
              }}
            >
              Settle
            </button>
          )}
        </div>
      )
    }
  ], [expandedRowId, reconciling, handleReconcileOrder]);

  // Master-Detail Row Renderer (Golden Rule #4 & Colway Specs Layout)
  const renderMasterDetail = (row) => {
    const sym = row.currency === 'EUR' ? '€' : '$';
    const items = Array.isArray(row.items) ? row.items : [];

    return (
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        margin: '6px 12px 14px 12px',
        padding: '16px',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={16} color="#003666" />
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Commissionable Order Breakdown & Prescription Specifications
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
            Order #{row.orderCode} · 15% Partner Referral Share
          </span>
        </div>

        {/* Line Items Breakdown (CSS Grid Rows - Fully Responsive & Golden Rule Compliant) */}
        {items.length > 0 ? (
          <div style={{ marginBottom: '14px', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(180px, 2fr) minmax(110px, 1fr) minmax(110px, 1fr) 50px minmax(80px, 1fr) minmax(90px, 1fr) minmax(110px, 1fr)',
              backgroundColor: '#edf2f7',
              borderBottom: '1px solid #cbd5e1',
              padding: '8px 10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#475569',
              alignItems: 'center'
            }}>
              <div>Item Formulation</div>
              <div>Dosage / Specs</div>
              <div>Format</div>
              <div style={{ textAlign: 'center' }}>Qty</div>
              <div style={{ textAlign: 'right' }}>Unit Price</div>
              <div style={{ textAlign: 'right' }}>Line Total</div>
              <div style={{ textAlign: 'right', color: '#16a34a' }}>Your 15% Share</div>
            </div>

            {/* Data rows */}
            {items.map((item, idx) => {
              const qty = Number(item.quantity || 1);
              const uPrice = Number(item.unitPrice || 0);
              const lineTotal = Number(item.lineTotal || (qty * uPrice));
              const itemComm = Number((lineTotal * 0.15).toFixed(2));

              return (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(180px, 2fr) minmax(110px, 1fr) minmax(110px, 1fr) 50px minmax(80px, 1fr) minmax(90px, 1fr) minmax(110px, 1fr)',
                    borderBottom: idx < items.length - 1 ? '1px solid #e2e8f0' : 'none',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {item.name || item.productName || 'Lyophilized Peptide Formulation'}
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.76rem' }}>
                    {item.dosage || item.strength || 'Standard Concentration'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.76rem' }}>
                    {item.presentation || item.type || 'Sterile Lyophilized Vial'}
                  </div>
                  <div style={{ textAlign: 'center', fontWeight: 700, color: '#003666' }}>
                    {qty}
                  </div>
                  <div style={{ textAlign: 'right', color: '#334155' }}>
                    {sym}{uPrice.toFixed(2)}
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    {sym}{lineTotal.toFixed(2)}
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>
                    +{sym}{itemComm.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '10px 0', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
            Direct formulation order: {row.totalUnits || 0} unit(s) across catalog portfolio.
          </div>
        )}

        {/* Logistics & Financial Reconciliation Footer */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Truck size={14} color="#003666" />
              <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#003666' }}>
                Express Medical Logistics & Handling
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Freight cost: <strong>{sym}{Number(row.shippingCost || 60).toFixed(2)}</strong> (Direct carrier dispatch fee, excluded from 15% commissions).
            </div>
            {row.deliveryAddress && (
              <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px' }}>
                Destination: {row.deliveryAddress}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Formulation Subtotal: <strong>{sym}{Number(row.subtotal || 0).toFixed(2)}</strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Carrier Freight: <strong>+{sym}{Number(row.shippingCost || 60).toFixed(2)}</strong>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
              Grand Total: {sym}{Number(row.grandTotal || 0).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
              Your 15% Commission: +{sym}{Number(row.commissionAmount || 0).toFixed(2)}
            </div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {/* ── Standard PageHeader (Golden Rule #9 & #16) ── */}
      <PageHeader
        title="Commissions & Referral Payouts"
        subtitle={`Live ledger for ${data.wholesalerName || 'Wholesaler Partner'} · Referral Code: ${refCode}`}
        breadcrumbItems={[
          { label: 'Wholesaler Portal', href: '/wholesaler' },
          { label: 'Commissions & Payouts' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#334155',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintStatement}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#ffffff',
                border: '1px solid #003666',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#003666',
                cursor: 'pointer'
              }}
            >
              <Printer size={14} />
              <span>Statement PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#003666',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* ── Referral Link Generator & WhatsApp Direct Share Card (Mejora #1) ── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={16} color="#003666" />
              <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#003666' }}>
                Your Attributed B2B Referral Link (Code: {refCode})
              </h4>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Clinics and physicians ordering via this link automatically credit a 15% formulation commission to your account.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              <MessageCircle size={14} />
              <span>WhatsApp Doctor</span>
            </button>

            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.78rem',
                textDecoration: 'none'
              }}
            >
              <span>Preview</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Target Catalog Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {REFERRAL_TARGETS.map(t => {
            const isSelected = selectedCatalogTarget === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedCatalogTarget(t.id)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #003666' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#003666' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#475569'
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Copyable Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          padding: '4px 10px',
          gap: '8px'
        }}>
          <input
            type="text"
            readOnly
            value={referralUrl}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#003666',
              fontFamily: 'monospace'
            }}
          />
          <button
            type="button"
            onClick={handleCopyReferralLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: copiedLink ? '#16a34a' : '#003666',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '5px 12px',
              fontWeight: 700,
              fontSize: '0.76rem',
              cursor: 'pointer'
            }}
          >
            {copiedLink ? <Check size={13} /> : <Copy size={13} />}
            <span>{copiedLink ? 'Copied ✓' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* ── Scope Indicator & Switcher (Golden Rule #22) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '8px 14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} color="#003666" />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
            Metrics Scope: <strong>{scopeMode === 'filtered' ? `Applied Filters View (${filteredOrders.length} orders)` : `Entire Database Ledger (${data.orders.length} orders)`}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
          <button
            type="button"
            onClick={() => setScopeMode('filtered')}
            style={{
              border: 'none',
              background: scopeMode === 'filtered' ? '#ffffff' : 'transparent',
              color: scopeMode === 'filtered' ? '#003666' : '#64748b',
              fontWeight: scopeMode === 'filtered' ? 800 : 600,
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: scopeMode === 'filtered' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Matching Filters ({filteredOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setScopeMode('global')}
            style={{
              border: 'none',
              background: scopeMode === 'global' ? '#ffffff' : 'transparent',
              color: scopeMode === 'global' ? '#003666' : '#64748b',
              fontWeight: scopeMode === 'global' ? 800 : 600,
              fontSize: '0.75rem',
              padding: '4px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: scopeMode === 'global' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            Entire Ledger ({data.orders.length})
          </button>
        </div>
      </div>

      {/* ── 4 Mandatory KPIs by Default (Golden Rule #22) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1rem'
      }}>
        <MetricCard
          title="Total Earned Commissions"
          value={loading ? '…' : `€${activeMetrics.totalCommissions.toFixed(2)}`}
          subtitle="15% fixed share on formulations"
          icon={DollarSign}
          color="#16a34a"
          alert={activeMetrics.totalCommissions > 0}
        />
        <MetricCard
          title="Pending Payout"
          value={loading ? '…' : `€${activeMetrics.pendingPayoutCommissions.toFixed(2)}`}
          subtitle="Ready for bank disbursement"
          icon={TrendingUp}
          color="#d97706"
        />
        <MetricCard
          title="Referred Sales Volume"
          value={loading ? '…' : `€${activeMetrics.totalRevenue.toFixed(2)}`}
          subtitle="Gross order revenue referred"
          icon={Package}
          color="#003666"
        />
        <MetricCard
          title="Attributed Orders"
          value={loading ? '…' : `${activeMetrics.ordersCount} Orders`}
          subtitle={`${activeMetrics.totalUnits} total vials / units delivered`}
          icon={Users}
          color="#8b5cf6"
        />
      </div>

      {/* ── Search & Filter Controls (Golden Rule #7, #24, #29) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <GlobalSearchBar
          placeholder="Search by order code, clinic practitioner, email, or formulation name..."
          onSearch={setSearchQuery}
          value={searchQuery}
          size="lg"
        />

        {/* Filter Chips Bar (Payout Status + Date Range Golden Rule #24 + Collections) */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '4px 2px'
        }}>
          {/* Date Filter (Golden Rule #24) */}
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
            Period:
          </span>
          {[
            { id: 'all_time', label: 'All Time' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_30_days', label: 'Last 30 Days' },
            { id: 'last_quarter', label: 'Last 90 Days' }
          ].map(opt => {
            const isSelected = dateRange === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDateRange(opt.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #003666' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#003666' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  transition: 'all 0.12s ease'
                }}
              >
                {opt.label}
              </button>
            );
          })}

          <div style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1', margin: '0 4px' }} />

          {/* Status Filter */}
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
            Status:
          </span>
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'pending', label: 'Pending Payout' },
            { id: 'approved', label: 'Approved' },
            { id: 'reconciled', label: 'Reconciled / Paid' }
          ].map(opt => {
            const isSelected = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #003666' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#003666' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  transition: 'all 0.12s ease'
                }}
              >
                {opt.label}
              </button>
            );
          })}

          <div style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1', margin: '0 4px' }} />

          {/* Collection Filter */}
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
            Collection:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'vials', label: 'Peptides' },
            { id: 'colway', label: 'Colway®' },
            { id: 'bloodo', label: 'Bloodo™' },
            { id: 'ultraman', label: 'UltraPerson™' }
          ].map(opt => {
            const isSelected = collectionFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCollectionFilter(opt.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #003666' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#003666' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  transition: 'all 0.12s ease'
                }}
              >
                {opt.label}
              </button>
            );
          })}

          {/* Action to Settle Pending in batch */}
          {activeMetrics.pendingPayoutCommissions > 0 && (
            <button
              type="button"
              onClick={handleReconcileAllPending}
              disabled={reconciling}
              style={{
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#16a34a',
                cursor: reconciling ? 'not-allowed' : 'pointer'
              }}
            >
              <CheckCircle2 size={13} />
              <span>Settle Pending (€{activeMetrics.pendingPayoutCommissions.toFixed(2)})</span>
            </button>
          )}

          {(statusFilter !== 'all' || collectionFilter !== 'all' || dateRange !== 'all_time' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCollectionFilter('all');
                setDateRange('all_time');
                setSearchQuery('');
              }}
              style={{
                border: 'none',
                background: 'none',
                color: '#dc2626',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Clear Filters ×
            </button>
          )}
        </div>
      </div>

      {/* ── Commissions DataTable (Golden Rule #3 & #30: No horizontal scroll) ── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {filteredOrders.length === 0 && !loading ? (
          <EmptyState
            icon={DollarSign}
            title="No orders found matching your filters"
            subtitle="Orders placed by clinics through your referral link or attributed wholesale code will appear here with instant 15% commission calculations."
            action={{
              label: 'Reset Filters',
              onClick: () => {
                setStatusFilter('all');
                setCollectionFilter('all');
                setDateRange('all_time');
                setSearchQuery('');
              }
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={filteredOrders}
            isLoading={loading}
            keyField="id"
            initialRowsPerPage={10}
            expandableRender={renderMasterDetail}
            statusText={`Synchronized with Firestore · ${filteredOrders.length} orders in ledger`}
          />
        )}
      </div>

    </div>
  );
}
