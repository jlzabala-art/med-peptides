"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import MetricCard from '@/components/ui/MetricCard';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import { 
  ShoppingBag, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  ExternalLink, 
  Lock, 
  ArrowRight,
  Info,
  Clock,
  Sparkles
} from '@/lib/icons';
import toast from 'react-hot-toast';

export default function AdminShopifyTab() {
  const [loading, setLoading] = useState(true);
  const [storeStatus, setStoreStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeScope, setActiveScope] = useState('retail'); // 'retail' | 'all' | 'synced' | 'restricted'

  // Modals & Drawers
  const [dryRunReport, setDryRunReport] = useState(null);
  const [showDryRunModal, setShowDryRunModal] = useState(false);
  const [isProcessingSync, setIsProcessingSync] = useState(false);
  const [showConfirmSyncModal, setShowConfirmSyncModal] = useState(false);

  // Load Status and Products
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, productsRes] = await Promise.all([
        fetch('/api/shopify/status'),
        fetch(`/api/shopify/products?filter=all&limit=150`)
      ]);

      const statusJson = await statusRes.json();
      const productsJson = await productsRes.json();

      if (statusJson.success) setStoreStatus(statusJson);
      if (productsJson.success) setProducts(productsJson.items || []);
    } catch (err) {
      console.error('[AdminShopifyTab] Load Error:', err);
      toast.error('Failed to connect to Shopify Integration service');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // KPIs Calculation
  const kpis = useMemo(() => {
    const total = products.length;
    const retailReady = products.filter(p => p.compliance?.isAllowedOnShopify).length;
    const synced = products.filter(p => p.shopify?.syncStatus === 'synced').length;
    const errors = products.filter(p => p.shopify?.syncStatus === 'error').length;
    const restricted = total - retailReady;

    return {
      total,
      retailReady,
      synced,
      errors,
      restricted
    };
  }, [products]);

  // Filtered Products based on Scope and Search
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Scope filter
      if (activeScope === 'retail' && !p.compliance?.isAllowedOnShopify) return false;
      if (activeScope === 'synced' && p.shopify?.syncStatus !== 'synced') return false;
      if (activeScope === 'restricted' && p.compliance?.isAllowedOnShopify) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = String(p.name || '').toLowerCase();
      const sku = String(p.sku || '').toLowerCase();
      const category = String(p.category || '').toLowerCase();
      return name.includes(q) || sku.includes(q) || category.includes(q);
    });
  }, [products, activeScope, searchQuery]);

  // Handle Dry Run
  const handleRunDryRun = async (idsToTest = selectedIds) => {
    if (idsToTest.length === 0) {
      toast.error('Please select at least one product to test');
      return;
    }

    setIsProcessingSync(true);
    try {
      const res = await fetch('/api/shopify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: idsToTest, dryRun: true })
      });
      const data = await res.json();
      if (data.success) {
        setDryRunReport(data.report);
        setShowDryRunModal(true);
      } else {
        toast.error(data.error || 'Dry run simulation failed');
      }
    } catch (err) {
      toast.error('Network error executing simulation');
    } finally {
      setIsProcessingSync(false);
    }
  };

  // Handle Real Sync
  const handleExecuteSync = async () => {
    if (selectedIds.length === 0) return;

    setIsProcessingSync(true);
    try {
      const res = await fetch('/api/shopify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedIds, dryRun: false })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully synchronized ${data.successCount} product(s) to mediluxegulf.com!`);
        setShowConfirmSyncModal(false);
        setSelectedIds([]);
        loadData();
      } else {
        toast.error(data.error || 'Synchronization failed');
      }
    } catch (err) {
      toast.error('Failed to communicate with sync engine');
    } finally {
      setIsProcessingSync(false);
    }
  };

  // DataTable Columns definition with GCP standards
  const columns = useMemo(() => [
    {
      key: 'name',
      title: 'Product & Formulation',
      width: '30%',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem' }}>
            {row.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b' }}>
            <span>{row.category}</span>
            <span>•</span>
            <span>{row.form}</span>
          </div>
        </div>
      )
    },
    {
      key: 'sku',
      title: 'Atlas SKU',
      width: '14%',
      render: (row) => (
        <CopyableId value={row.sku} />
      )
    },
    {
      key: 'compliance',
      title: 'Regulatory Status',
      width: '18%',
      render: (row) => {
        const isAllowed = row.compliance?.isAllowedOnShopify;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <StatusBadge 
              status={isAllowed ? 'active' : 'inactive'} 
              label={row.compliance?.badgeLabel || (isAllowed ? 'Retail Ready' : 'Blocked')} 
            />
          </div>
        );
      }
    },
    {
      key: 'shopifyPriceAed',
      title: 'Price (AED)',
      width: '14%',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.86rem' }}>
            AED {Number(row.shopifyPriceAed || 0).toFixed(2)}
          </span>
          {row.priceEur > 0 && (
            <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
              Base: €{Number(row.priceEur).toFixed(2)}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'shopifyStatus',
      title: 'Shopify Channel',
      width: '14%',
      render: (row) => {
        const syncStatus = row.shopify?.syncStatus || 'unlinked';
        let badgeStatus = 'inactive';
        let label = 'Unlinked';

        if (syncStatus === 'synced') {
          badgeStatus = 'active';
          label = 'Synced (Live/Draft)';
        } else if (syncStatus === 'error') {
          badgeStatus = 'error';
          label = 'Sync Error';
        }

        return <StatusBadge status={badgeStatus} label={label} />;
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '10%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {row.compliance?.isAllowedOnShopify ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRunDryRun([row.id]);
              }}
              style={{
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#1a73e8',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Simulate
            </button>
          ) : (
            <span title="Restricted clinical item" style={{ color: '#94a3b8', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Lock size={12} /> Restricted
            </span>
          )}
        </div>
      )
    }
  ], []);

  // Master-Detail Expandable View
  const expandableRender = (row) => (
    <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, borderRadius: '6px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
              Shopify Channel Mapping · {row.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Destination Storefront: <strong>mediluxegulf.com</strong> · Currency: <strong>AED</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {row.compliance?.isAllowedOnShopify ? (
            <button
              type="button"
              onClick={() => {
                setSelectedIds([row.id]);
                setShowConfirmSyncModal(true);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: '#1a73e8',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Approve & Sync Product</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldAlert size={14} />
              <span>Blocked from retail sale: {row.compliance?.reasons?.[0] || 'Clinical Rx restriction'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #dadce0' }}>
          <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Regulatory Compliance Check
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.80rem', color: row.compliance?.isAllowedOnShopify ? '#15803d' : '#b91c1c', fontWeight: 600 }}>
            {row.compliance?.badgeLabel}
          </div>
          <div style={{ marginTop: '2px', fontSize: '0.72rem', color: '#475569' }}>
            {row.compliance?.suggestedAction}
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #dadce0' }}>
          <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Commercial Parameters (UAE)
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.80rem', color: '#1e293b', fontWeight: 600 }}>
            Retail Price: AED {Number(row.shopifyPriceAed).toFixed(2)}
          </div>
          <div style={{ marginTop: '2px', fontSize: '0.72rem', color: '#64748b' }}>
            Vendor: Mediluxe Health Solutions · Inventory policy: Continue when out of stock
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #dadce0' }}>
          <div style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Shopify Metadata Status
          </div>
          <div style={{ marginTop: '4px', fontSize: '0.80rem', color: '#1e293b', fontWeight: 600 }}>
            {row.shopify?.productId ? (
              <span style={{ fontFamily: 'monospace', fontSize: '0.74rem' }}>{row.shopify.productId}</span>
            ) : (
              'Not created yet in Shopify'
            )}
          </div>
          <div style={{ marginTop: '2px', fontSize: '0.72rem', color: '#64748b' }}>
            Last sync: {row.shopify?.lastSyncedAt ? new Date(row.shopify.lastSyncedAt).toLocaleString() : 'Never'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── PageHeader (Google Cloud UX) ────────────────────────────────────── */}
      <PageHeader
        title="Shopify Channel Integration"
        subtitle="Selective product synchronization for mediluxegulf.com (Dubai / UAE · Currency: AED)"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              style={{
                height: '36px',
                padding: '0 12px',
                borderRadius: '6px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#3c4043',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => handleRunDryRun()}
              disabled={selectedIds.length === 0 || isProcessingSync}
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: '6px',
                border: '1px solid #dadce0',
                background: '#ffffff',
                color: '#1a73e8',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selectedIds.length === 0 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Play size={14} />
              <span>Dry Run ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmSyncModal(true)}
              disabled={selectedIds.length === 0 || isProcessingSync}
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#1a73e8',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selectedIds.length === 0 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(26,115,232,0.3)'
              }}
            >
              <ShoppingBag size={14} />
              <span>Sync to Shopify ({selectedIds.length})</span>
            </button>
          </div>
        }
      />

      {/* ── Store Connection Banner ─────────────────────────────────────────── */}
      <div
        style={{
          background: storeStatus?.ping?.connected ? '#f0fdf4' : '#f8fafc',
          border: `1px solid ${storeStatus?.ping?.connected ? '#bbf7d0' : '#dadce0'}`,
          borderRadius: '8px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: storeStatus?.ping?.connected ? '#16a34a' : '#d97706'
            }}
          />
          <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#1e293b' }}>
            Storefront: mediluxegulf.com (UAE)
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            • Currency: <strong>AED</strong>
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            • Connection: {storeStatus?.ping?.connected ? 'GraphQL Live' : 'Staging Sandbox'}
          </span>
        </div>

        <a
          href="https://mediluxegulf.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.74rem',
            color: '#1a73e8',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600
          }}
        >
          <span>Visit Storefront</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* ── 4 Top KPIs (Golden Rule #22) ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <MetricCard
          title="Retail Ready (OTC)"
          value={kpis.retailReady}
          subtitle="Approved for online consumer sales"
          icon={CheckCircle2}
          color="#16a34a"
          onClick={() => setActiveScope('retail')}
        />
        <MetricCard
          title="Synced on Shopify"
          value={kpis.synced}
          subtitle="Active or Draft in mediluxegulf.com"
          icon={ShoppingBag}
          color="#2563eb"
          onClick={() => setActiveScope('synced')}
        />
        <MetricCard
          title="Clinical Restricted"
          value={kpis.restricted}
          subtitle="Protected B2B/Rx only (Hard-Blocked)"
          icon={Lock}
          color="#64748b"
          onClick={() => setActiveScope('restricted')}
        />
        <MetricCard
          title="Sync Errors / Alerts"
          value={kpis.errors}
          subtitle="Requires attention or resync"
          icon={AlertTriangle}
          color={kpis.errors > 0 ? '#dc2626' : '#64748b'}
          alert={kpis.errors > 0}
        />
      </div>

      {/* ── Scope Switcher & Search Bar (Golden Rule #7) ─────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          {/* Scope Switcher Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            {[
              { id: 'retail', label: 'Retail Ready (OTC)' },
              { id: 'synced', label: 'Synced on Shopify' },
              { id: 'all', label: 'All Atlas Products' },
              { id: 'restricted', label: 'Clinical Restricted' }
            ].map(scope => (
              <button
                key={scope.id}
                type="button"
                onClick={() => setActiveScope(scope.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeScope === scope.id ? '#ffffff' : 'transparent',
                  color: activeScope === scope.id ? '#0f172a' : '#64748b',
                  fontSize: '0.76rem',
                  fontWeight: activeScope === scope.id ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: activeScope === scope.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {scope.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Showing <strong>{filteredProducts.length}</strong> items in scope
          </div>
        </div>

        <GlobalSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search products by name, formulation, SKU, or category (Press ⌘K)..."
        />
      </div>

      {/* ── DataTable with Master-Detail (Golden Rule #3 & #4) ───────────────── */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        keyField="id"
        isLoading={loading}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        expandableRender={expandableRender}
        rowsPerPage={25}
      />

      {/* ── Dry Run Report Modal ────────────────────────────────────────────── */}
      {showDryRunModal && dryRunReport && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #dadce0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#1a73e8' }} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                  Shopify Dry-Run Simulation Results
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDryRunModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>READY TO SYNC</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16a34a' }}>{dryRunReport.readyCount}</div>
                </div>
                <div style={{ flex: 1, padding: '10px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 700 }}>BLOCKED BY RULES</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>{dryRunReport.blockedCount}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Product Simulation Details:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {dryRunReport.results.map((res) => (
                  <div
                    key={res.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: res.allowed ? '#ffffff' : '#fff1f2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                        {res.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: res.allowed ? '#16a34a' : '#dc2626' }}>
                        {res.allowed ? `✓ Verified: Ready for ${res.operation} (AED ${res.priceAed})` : `✗ Blocked: ${res.reasons.join(', ')}`}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.70rem', padding: '2px 8px', borderRadius: '4px', background: res.allowed ? '#dcfce7' : '#fee2e2', color: res.allowed ? '#15803d' : '#991b1b', fontWeight: 700 }}>
                      {res.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #dadce0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowDryRunModal(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #dadce0', background: '#ffffff', color: '#3c4043', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
              {dryRunReport.readyCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDryRunModal(false);
                    setShowConfirmSyncModal(true);
                  }}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#1a73e8', color: '#ffffff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Proceed to Approve & Sync
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Sync Modal ──────────────────────────────────────────────── */}
      {showConfirmSyncModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '520px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Authorize Shopify Synchronization
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Destination: mediluxegulf.com (Dubai / UAE)
                </div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
              You are about to synchronize <strong>{selectedIds.length} product(s)</strong> to Shopify. The regulatory safety filter will automatically ensure that only approved OTC products are published.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #dadce0', borderRadius: '8px', padding: '12px', fontSize: '0.74rem', color: '#475569' }}>
              ✓ Product records will be staged in <strong>Draft status</strong> on Shopify for marketing review.<br />
              ✓ AED prices and barcodes will be mapped directly from Atlas Health.<br />
              ✓ An immutable audit entry will be logged in <code>shopify_sync_logs</code>.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmSyncModal(false)}
                disabled={isProcessingSync}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #dadce0', background: '#ffffff', color: '#3c4043', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSync}
                disabled={isProcessingSync}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#1a73e8',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: isProcessingSync ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isProcessingSync ? <span>Synchronizing...</span> : <span>Confirm & Push to Shopify</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

