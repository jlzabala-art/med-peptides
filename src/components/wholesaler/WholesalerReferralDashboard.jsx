"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Share2, Copy, Check, ExternalLink, MessageCircle, Package, TrendingUp, Users, DollarSign } from '@/lib/icons';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import CopyableId from '../ui/CopyableId';
import EmptyState from '../ui/EmptyState';
import { MetricCard } from '../ui';
import { fetchWholesalerReferralStatsAction } from '@/actions/vialsCatalogActions';

const REFERRAL_COLLECTIONS = [
  { id: 'vials', label: 'Peptides & Vials', icon: '🧪', path: '/vials', shareMsg: 'Hello, here is the direct clinical catalog for lyophilized peptide vials (≥99% HPLC purity certified):' },
  { id: 'bloodo', label: 'Bloodo™ Diagnostics', icon: '🩸', path: '/vials?collection=bloodo', shareMsg: 'Hello, here is the direct clinical catalog for Bloodo™ CE-IVDR capillary blood diagnostic test kits:' },
  { id: 'colway', label: 'Colway® Dermocosmetics', icon: '✨', path: '/vials?collection=colway', shareMsg: 'Hello, here is the direct clinical catalog for Colway® bioactive native tropocollagen & dermocosmetics:' },
  { id: 'ultraman', label: 'UltraPerson™ Supplements', icon: '🌿', path: '/vials?collection=ultraman', shareMsg: 'Hello, here is the direct clinical catalog for UltraPerson™ precision longevity & metabolic supplements:' },
  { id: 'teletest', label: 'TeleTest® Lab Panels', icon: '🔬', path: '/vials?collection=teletest', shareMsg: 'Hello, here is the direct clinical catalog for TeleTest® clinical genomics & toxicology laboratory panels:' }
];

export default function WholesalerReferralDashboard({ wholesalerId }) {
  const [selectedCollection, setSelectedCollection] = useState('vials');
  const [tableCollectionFilter, setTableCollectionFilter] = useState('all');
  const [stats, setStats] = useState({
    visitsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    totalUnits: 0,
    conversionRate: '0.0%',
    collections: {},
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
  const activeColConfig = REFERRAL_COLLECTIONS.find(c => c.id === selectedCollection) || REFERRAL_COLLECTIONS[0];
  const referralUrl = wholesalerId
    ? `${origin}${activeColConfig.path}${activeColConfig.path.includes('?') ? '&' : '?'}ref=${encodeURIComponent(wholesalerId)}`
    : `${origin}${activeColConfig.path}`;

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      if (!wholesalerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetchWholesalerReferralStatsAction(wholesalerId);
        if (isMounted && res) {
          setStats(res);
        }
      } catch (err) {
        console.error('Error fetching referral stats:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();
    return () => { isMounted = false; };
  }, [wholesalerId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `${activeColConfig.shareMsg} ${referralUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filtered orders for table
  const displayedOrders = useMemo(() => {
    if (tableCollectionFilter === 'all') return stats.recentOrders;
    return stats.recentOrders.filter(o => (o.collection || 'vials').toLowerCase() === tableCollectionFilter);
  }, [stats.recentOrders, tableCollectionFilter]);

  // DataTable column definitions (Golden Rule #30: explicit column widths)
  const columns = useMemo(() => [
    {
      header: 'Order Ref',
      field: 'orderCode',
      width: '18%',
      render: (row) => <CopyableId value={row.orderCode} />
    },
    {
      header: 'Collection',
      field: 'collection',
      width: '16%',
      render: (row) => {
        const colId = (row.collection || 'vials').toLowerCase();
        const badgeConfig = {
          vials: { label: 'Peptides', bg: '#eff6ff', color: '#1d4ed8' },
          bloodo: { label: 'Bloodo™', bg: '#fef2f2', color: '#b91c1c' },
          colway: { label: 'Colway®', bg: '#fdf4ff', color: '#a21caf' },
          ultraman: { label: 'UltraPerson', bg: '#f0fdf4', color: '#15803d' },
          teletest: { label: 'TeleTest®', bg: '#fffbeb', color: '#b45309' }
        }[colId] || { label: colId, bg: '#f1f5f9', color: '#475569' };

        return (
          <span style={{
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: badgeConfig.bg,
            color: badgeConfig.color
          }}>
            {badgeConfig.label}
          </span>
        );
      }
    },
    {
      header: 'Date',
      field: 'createdAt',
      width: '16%',
      render: (row) => (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
      )
    },
    {
      header: 'Client',
      field: 'customerName',
      width: '22%',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f172a' }}>{row.customerName || 'Clinical Client'}</div>
          {row.customerEmail && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.customerEmail}</div>}
        </div>
      )
    },
    {
      header: 'Units',
      field: 'totalUnits',
      width: '12%',
      render: (row) => (
        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#003666' }}>
          {row.totalUnits || 0} unit{row.totalUnits === 1 ? '' : 's'}
        </span>
      )
    },
    {
      header: 'Amount',
      field: 'grandTotal',
      width: '12%',
      render: (row) => (
        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#16a34a' }}>
          ${Number(row.grandTotal || 0).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Status',
      field: 'status',
      width: '12%',
      render: (row) => <StatusBadge status={row.status || 'draft'} />
    }
  ], []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ── Multi-Collection Shareable Link Card ── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Share2 size={18} color="#003666" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#003666' }}>
                Multi-Collection Referral Link Generator
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
              Select any collection to generate your attributed referral link. Direct supply terms, verified batch quality, and 24h payment coordination.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleShareWhatsApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </button>

            <a
              href={referralUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none'
              }}
            >
              <span>Open Catalog</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Collection Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {REFERRAL_COLLECTIONS.map(col => {
            const isSelected = selectedCollection === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setSelectedCollection(col.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #003666' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#003666' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{col.icon}</span>
                <span>{col.label}</span>
              </button>
            );
          })}
        </div>

        {/* Copyable Input Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '6px 12px',
          gap: '10px'
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
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#003666',
              fontFamily: 'monospace'
            }}
          />
          <button
            onClick={handleCopyLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: copied ? '#16a34a' : '#003666',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 14px',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied ✓' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* ── 4 KPIs by Default (Golden Rule #22) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <MetricCard
          title="Link Visits"
          value={loading ? '…' : stats.visitsCount}
          subtitle="Unique visits tracked"
          icon={Users}
          color="#2563eb"
        />
        <MetricCard
          title="Orders Generated"
          value={loading ? '…' : stats.ordersCount}
          subtitle={`${stats.totalUnits} total units requested`}
          icon={Package}
          color="#16a34a"
          alert={stats.ordersCount > 0}
        />
        <MetricCard
          title="Total Revenue"
          value={loading ? '…' : `$${stats.totalRevenue.toFixed(2)}`}
          subtitle="Gross order volume (USD)"
          icon={DollarSign}
          color="#003666"
        />
        <MetricCard
          title="Conversion Rate"
          value={loading ? '…' : stats.conversionRate}
          subtitle="Visits converted into orders"
          icon={TrendingUp}
          color="#8b5cf6"
        />
      </div>

      {/* ── Attributed Orders Table (Golden Rule #3: Always DataTable) ── */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              Referred Sales History
            </h4>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Orders placed across all clinical collections with 24-hour payment coordination
            </span>
          </div>

          {/* Collection Filter Chips for Table */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {['all', 'vials', 'bloodo', 'colway', 'ultraman', 'teletest'].map(filterId => {
              const isSelected = tableCollectionFilter === filterId;
              const labels = {
                all: 'All Collections',
                vials: 'Peptides',
                bloodo: 'Bloodo',
                colway: 'Colway',
                ultraman: 'UltraPerson',
                teletest: 'TeleTest'
              };
              return (
                <button
                  key={filterId}
                  type="button"
                  onClick={() => setTableCollectionFilter(filterId)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #003666' : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? '#003666' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569'
                  }}
                >
                  {labels[filterId]}
                </button>
              );
            })}
          </div>
        </div>

        {displayedOrders.length === 0 && !loading ? (
          <EmptyState
            icon={Package}
            title="No referral orders recorded for this collection"
            subtitle="Share your link with clinics, physicians, or institutional buyers to begin capturing attributed orders."
            action={{
              label: 'Copy Referral Link',
              onClick: handleCopyLink,
              icon: Copy
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={displayedOrders}
            isLoading={loading}
            keyField="id"
            initialRowsPerPage={10}
            statusText="Synchronized with live orders ledger"
          />
        )}
      </div>

    </div>
  );
}
