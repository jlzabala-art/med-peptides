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
  Layers,
  ChevronDown,
  ChevronUp,
  Info
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
import { fetchWholesalerCommissionsAction } from '../../../actions/wholesalerActions';
import { toast } from 'react-hot-toast';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'reconciled'
  const [collectionFilter, setCollectionFilter] = useState('all'); // 'all' | 'vials' | 'colway' | 'bloodo' | 'ultraman'
  const [scopeMode, setScopeMode] = useState('filtered'); // 'filtered' | 'global'
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Wholesaler identifier from auth or defaults to Nikolas for QA
  const effectiveWholesalerId = useMemo(() => {
    if (!user) return data.wholesalerId || 'np-labs-international';
    const email = String(user.email || '').toLowerCase();
    const isNikolas = email.includes('nikol') || email.includes('nplabs') || email === 'jlzabala@gmail.com';
    return isNikolas ? 'np-labs-international' : (user.uid || 'np-labs-international');
  }, [user, data.wholesalerId]);

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

      // 3. Search Query
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
  }, [data.orders, statusFilter, collectionFilter, searchQuery]);

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
    link.setAttribute('download', `wholesaler_commissions_${data.referralCode || 'NP-LABS'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Commissions ledger CSV downloaded');
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
      width: '13%',
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
      width: '21%',
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
      width: '10%',
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
      width: '12%',
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
      width: '12%',
      render: (row) => <StatusBadge status={row.payoutStatus || 'pending'} />
    }
  ], [expandedRowId]);

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
        subtitle={`Live ledger for ${data.wholesalerName || 'Wholesaler Partner'} · Referral Code: ${data.referralCode || 'CAT-RX-7482'}`}
        breadcrumbItems={[
          { label: 'Wholesaler Portal', href: '/wholesaler' },
          { label: 'Commissions & Payouts' }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
          subtitle="Awaiting next disbursement cycle"
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

        {/* Filter Chips Bar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '4px 2px'
        }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
            Payout Status:
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

          {(statusFilter !== 'all' || collectionFilter !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCollectionFilter('all');
                setSearchQuery('');
              }}
              style={{
                marginLeft: 'auto',
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
