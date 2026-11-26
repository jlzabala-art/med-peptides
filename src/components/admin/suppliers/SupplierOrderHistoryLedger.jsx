"use client";

import React, { useState, useMemo } from 'react';
import {
  Package,
  TrendingUp,
  FileCheck,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Printer,
} from '@/lib/icons';
import { DataTable, StatusBadge, CopyableId } from '../../ui';
import MetricCard from '../../ui/MetricCard';
import GlobalSearchBar from '../../ui/GlobalSearchBar';
import EmptyState from '../../ui/EmptyState';
import { useFirestoreDocument } from '../../../hooks/data/useFirestoreDocument';
import toast from 'react-hot-toast';

/**
 * SupplierOrderHistoryLedger
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable Supplier Order History & Documentary Ledger (modeled on LotuslandProcurementLedger).
 * Reads live from Firestore `supplier_portals/{portalSlug}` (Golden Rule #2) so Norma Hellas
 * and any future partner supplier share the exact same GCP-standard Admin tab & portal layout.
 */
export default function SupplierOrderHistoryLedger({ supplier, portalSlug }) {
  const resolvedSlug =
    portalSlug ||
    supplier?.partnerPortalSlug ||
    ((supplier?.id === 'supplier-norma-hellas' ||
      String(supplier?.name || supplier?.companyName || '').toLowerCase().includes('norma'))
      ? 'norma-hellas'
      : null);

  const { data: portal, loading } = useFirestoreDocument('supplier_portals', resolvedSlug, {
    realtime: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedPortal, setCopiedPortal] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const orders = useMemo(() => (Array.isArray(portal?.orders) ? portal.orders : []), [portal]);
  const activeOrder = portal?.activeOrder || null;
  const checklist = Array.isArray(activeOrder?.checklist) ? activeOrder.checklist : [];

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || String(o.status || '').toLowerCase() === statusFilter;
      const matchesQuery =
        !q ||
        String(o.poCode || '').toLowerCase().includes(q) ||
        String(o.batchCode || '').toLowerCase().includes(q) ||
        String(o.orderDate || '').toLowerCase().includes(q) ||
        String(o.note || '').toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, searchQuery, statusFilter]);

  const totals = useMemo(() => {
    const totalUnits = orders.reduce((acc, o) => acc + Number(o.quantity || 0), 0);
    const totalEur = orders.reduce((acc, o) => acc + Number(o.subtotalEur || 0), 0);
    const firstQty = Number(orders[0]?.quantity || 0);
    const lastQty = Number(orders[orders.length - 1]?.quantity || 0);
    const growthPct = firstQty > 0 ? Math.round(((lastQty - firstQty) / firstQty) * 100) : 0;
    return { totalUnits, totalEur, growthPct, count: orders.length };
  }, [orders]);

  const portalUrl = useMemo(() => {
    if (!resolvedSlug) return '';
    const token = portal?.accessToken || supplier?.partnerPortalToken || '';
    const base = `https://www.atlashealth-services.com/b2b/supplier/${encodeURIComponent(resolvedSlug)}`;
    return token ? `${base}?token=${encodeURIComponent(token)}&lang=en` : base;
  }, [resolvedSlug, portal?.accessToken, supplier?.partnerPortalToken]);

  const pitchUrl = useMemo(() => {
    const name = supplier?.name || supplier?.companyName || portal?.supplierName || '';
    return `https://www.atlashealth-services.com/partners/suppliers?lang=en&cur=EUR${
      name ? `&partner=${encodeURIComponent(name)}` : ''
    }`;
  }, [supplier?.name, supplier?.companyName, portal?.supplierName]);

  const copyText = async (url, kind) => {
    try {
      await navigator.clipboard.writeText(url);
      if (kind === 'portal') {
        setCopiedPortal(true);
        setTimeout(() => setCopiedPortal(false), 2000);
        toast.success('Private Supplier Portal link copied ✓');
      } else {
        setCopiedPitch(true);
        setTimeout(() => setCopiedPitch(false), 2000);
        toast.success('Supplier Partner Presentation link copied ✓');
      }
    } catch {
      toast.error('Could not copy link');
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'importNumber',
        label: 'Import #',
        header: 'Import #',
        render: (val) => <strong style={{ color: '#003666' }}>#{val}</strong>,
      },
      {
        key: 'poCode',
        label: 'PO / Reference',
        header: 'PO / Reference',
        render: (val) => <CopyableId value={val} displayValue={val} />,
      },
      {
        key: 'orderDate',
        label: 'Order Date',
        header: 'Order Date',
        render: (val) => <span style={{ whiteSpace: 'nowrap', color: '#334155' }}>{val}</span>,
      },
      {
        key: 'quantity',
        label: 'Quantity',
        header: 'Quantity',
        render: (val) => (
          <strong style={{ whiteSpace: 'nowrap', color: '#0f172a' }}>
            {Number(val || 0).toLocaleString('en-US')} units
          </strong>
        ),
      },
      {
        key: 'subtotalEur',
        label: 'Subtotal (EUR)',
        header: 'Subtotal (EUR)',
        render: (val) => (
          <strong style={{ whiteSpace: 'nowrap', color: '#003666' }}>
            €{Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        ),
      },
      {
        key: 'batchCode',
        label: 'Batch',
        header: 'Batch',
        render: (val) => (
          <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>
            {val || '—'}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        header: 'Status',
        render: (val) => <StatusBadge status={val || 'processing'} />,
      },
    ],
    []
  );

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
        Loading supplier order history from Firestore...
      </div>
    );
  }

  if (!portal || orders.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <EmptyState
          icon={Package}
          title="No order history portal linked yet"
          subtitle="You can still share the co-branded Atlas Supplier Partner Hub presentation with this supplier."
          action={{
            label: 'Copy Supplier Presentation Link',
            onClick: () => copyText(pitchUrl, 'pitch'),
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* ── TOP ACTION BAR: PORTAL & PRESENTATION LINKS ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '10px 14px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#003666' }}>
            {portal.supplierName} — Order History & Private Portal
          </div>
          <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
            {portal.productName} · €{Number(portal.unitPriceEur || 0).toFixed(2)} Ex-Works
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => copyText(pitchUrl, 'pitch')}
            className="gcp-btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '0.75rem' }}
          >
            {copiedPitch ? <Check size={13} color="#16a34a" /> : <Share2 size={13} />}
            <span>{copiedPitch ? 'Copied' : 'Copy Presentation'}</span>
          </button>

          {portalUrl && (
            <>
              <button
                type="button"
                onClick={() => copyText(portalUrl, 'portal')}
                className="gcp-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', fontSize: '0.75rem' }}
              >
                {copiedPortal ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                <span>{copiedPortal ? 'Copied' : 'Copy Portal URL'}</span>
              </button>

              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gcp-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', fontSize: '0.75rem', textDecoration: 'none' }}
              >
                <ExternalLink size={13} />
                <span>Open Live Portal</span>
              </a>
            </>
          )}
        </div>
      </div>

      {/* ── 4 GCP KPI CARDS (Rule #22) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
        <MetricCard
          title="Active Order"
          value={activeOrder ? `${Number(activeOrder.quantity || 0).toLocaleString('en-US')} uds` : '—'}
          subtitle={activeOrder?.poCode || 'No active PO'}
          icon={Clock}
          color="#d97706"
        />
        <MetricCard
          title="Total Volume"
          value={`${totals.totalUnits.toLocaleString('en-US')} uds`}
          subtitle={`${totals.count} consolidated imports`}
          icon={Package}
          color="#1a73e8"
        />
        <MetricCard
          title="Cumulative Value"
          value={`€${totals.totalEur.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Ex-Works total"
          icon={FileCheck}
          color="#0d9488"
        />
        <MetricCard
          title="Order Growth"
          value={`+${totals.growthPct}%`}
          subtitle="First vs. latest PO"
          icon={TrendingUp}
          color="#16a34a"
        />
      </div>

      {/* ── ACTIVE ORDER DOCUMENTARY CHECKLIST SNAPSHOT ── */}
      {checklist.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Import #{activeOrder?.importNumber} Documentary Status ({activeOrder?.poCode})
            </span>
            {portalUrl && (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1a73e8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Manage docs in portal</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
            {checklist.map((step) => (
              <div
                key={step.id}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: step.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}>
                    {step.stepNumber}. {step.owner === 'atlas' ? 'ATLAS' : 'SUPPLIER'}
                  </span>
                  <StatusBadge status={step.status} />
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>{step.titleEn}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEARCH & FILTER BAR (Rule #7) ── */}
      <GlobalSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by PO code, batch, date, or note..."
        size="md"
        resultCount={filteredOrders.length}
        filters={
          statusFilter !== 'all'
            ? [{ key: 'status', label: 'Status', value: statusFilter, onRemove: () => setStatusFilter('all') }]
            : []
        }
      />

      {/* ── CONSOLIDATED ORDERS DATATABLE (Rule #3) ── */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        rowKey="id"
        globalSearch={false}
        pageSize={20}
        emptyMessage="No matching orders."
      />
    </div>
  );
}
