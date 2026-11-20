'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../../../firebase';
import { DataTable, GlobalSearchBar, StatusBadge, CopyableId, MetricCard } from '../../ui';
import { buildSupplierComparisonRows } from '@/utils/supplierComparison';
import { Layers, CheckCircle, AlertTriangle, DollarSign, Download } from '@/lib/icons';

export default function PelletSupplierComparison({ defaultCategory = 'pellet' }) {
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(defaultCategory); // pellet | peptide | hormone | raw_material | all
  const [scopeFilter, setScopeFilter] = useState('all'); // all | multi | single
  const [savingKey, setSavingKey] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const colRef = collection(db, 'products');
      const q =
        categoryFilter === 'all'
          ? query(colRef, limit(150))
          : query(colRef, where('productType', '==', categoryFilter), limit(150));
      const snap = await getDocs(q);
      setRawProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('[SupplierBenchmark] Failed to load products:', err);
      toast.error('Failed to load supplier benchmark data');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const allRows = useMemo(
    () => buildSupplierComparisonRows(rawProducts, { productTypeFilter: categoryFilter }),
    [rawProducts, categoryFilter]
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allRows.filter((row) => {
      if (scopeFilter === 'multi' && row.supplierCount < 2) return false;
      if (scopeFilter === 'single' && row.supplierCount >= 2) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.canonicalKey.toLowerCase().includes(q) ||
        row.hormoneType.toLowerCase().includes(q) ||
        row.strength.toLowerCase().includes(q) ||
        row.offers.some((o) => o.supplierName.toLowerCase().includes(q))
      );
    });
  }, [allRows, searchQuery, scopeFilter]);

  const metrics = useMemo(() => {
    const multi = allRows.filter((r) => r.supplierCount >= 2);
    const avgSpreadPct =
      multi.length > 0
        ? (multi.reduce((acc, r) => acc + (r.maxSpreadPct || 0), 0) / multi.length).toFixed(1)
        : '0.0';
    const withPreferred = allRows.filter((r) => Boolean(r.preferredSupplierId)).length;
    return {
      total: allRows.length,
      overlapping: multi.length,
      avgSpreadPct: `${avgSpreadPct}%`,
      withPreferred,
    };
  }, [allRows]);

  const handleSetPreferred = async (row, supplierId) => {
    setSavingKey(`${row.canonicalKey}:${supplierId}`);
    try {
      const res = await fetch('/api/suppliers/set-preferred', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canonicalKey: row.canonicalKey,
          supplierId,
          docIds: row.docIds,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Failed to update preferred supplier');
      }
      toast.success(`Preferred supplier updated for ${row.name}`);
      await loadProducts();
    } catch (err) {
      toast.error(err.message || 'Could not save preferred supplier');
    } finally {
      setSavingKey(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Canonical Product',
        width: '26%',
        render: (_val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{row.name}</span>
            <CopyableId value={row.canonicalKey} />
          </div>
        ),
      },
      {
        key: 'supplierCount',
        header: 'Suppliers',
        width: '14%',
        render: (_val, row) => (
          <StatusBadge
            status={row.supplierCount >= 2 ? 'active' : 'inactive'}
            label={`${row.supplierCount} ${row.supplierCount === 1 ? 'Supplier' : 'Suppliers'}`}
          />
        ),
      },
      {
        key: 'bestOffer',
        header: 'Best Base Cost (EUR)',
        width: '18%',
        render: (_val, row) =>
          row.bestOffer ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 800, color: '#16a34a' }}>
                €{row.bestOffer.costEur.toFixed(2)} · {row.bestOffer.supplierName}
              </span>
              {row.bestOffer.bulkTier && (
                <span style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600 }}>
                  Batch ×{row.bestOffer.bulkTier.packsPerBatch}: €{Number(row.bestOffer.bulkTier.bulkOfferExclVatEur).toFixed(2)} (Prod €{Number(row.bestOffer.bulkTier.unitProductionCostEur).toFixed(2)})
                </span>
              )}
              {row.bestOffer.currency !== 'EUR' && (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Native: {row.bestOffer.currency} {row.bestOffer.costPrice.toFixed(2)}
                </span>
              )}
            </div>
          ) : (
            <span style={{ color: '#94a3b8' }}>—</span>
          ),
      },
      {
        key: 'secondBestOffer',
        header: '2nd Offer (EUR)',
        width: '18%',
        render: (_val, row) =>
          row.secondBestOffer ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                €{row.secondBestOffer.costEur.toFixed(2)} · {row.secondBestOffer.supplierName}
              </span>
              {row.secondBestOffer.certification === 'EU_GMP' && (
                <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
                  EU GMP Certified
                </span>
              )}
            </div>
          ) : (
            <span style={{ color: '#94a3b8' }}>Single source</span>
          ),
      },
      {
        key: 'maxSpreadEur',
        header: 'Cost Spread',
        width: '12%',
        render: (_val, row) =>
          row.maxSpreadEur != null ? (
            <span style={{ fontWeight: 700, color: row.maxSpreadPct > 10 ? '#dc2626' : '#d97706' }}>
              +€{row.maxSpreadEur.toFixed(2)} (+{row.maxSpreadPct}%)
            </span>
          ) : (
            <span style={{ color: '#94a3b8' }}>—</span>
          ),
      },
      {
        key: 'preferredSupplierId',
        header: 'Preferred',
        width: '12%',
        render: (_val, row) => {
          const prefId = row.preferredSupplierId;
          const prefOffer = prefId ? row.offers.find((o) => o.supplierId === prefId) : null;
          if (prefOffer) {
            return <StatusBadge status="po_created" label={prefOffer.supplierName} />;
          }
          return (
            <StatusBadge
              status="inactive"
              label={row.bestOffer ? `Auto (${row.bestOffer.supplierName})` : 'Unset'}
            />
          );
        },
      },
    ],
    []
  );

  const offerColumns = useMemo(
    () => [
      {
        key: 'supplierName',
        header: 'Supplier',
        width: '24%',
        render: (_val, offer) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{offer.supplierName}</span>
            <CopyableId value={offer.sku || offer.supplierId} />
          </div>
        ),
      },
      {
        key: 'costEur',
        header: 'Cost (EUR)',
        width: '16%',
        render: (_val, offer) => (
          <span style={{ fontWeight: 800, color: '#0f172a' }}>
            €{offer.costEur != null ? offer.costEur.toFixed(2) : '—'}
          </span>
        ),
      },
      {
        key: 'certification',
        header: 'Quality / GMP',
        width: '16%',
        render: (_val, offer) => (
          <StatusBadge
            status={offer.certification === 'EU_GMP' ? 'active' : 'pending'}
            label={offer.certification === 'EU_GMP' ? 'EU GMP' : 'International'}
          />
        ),
      },
      {
        key: 'leadTimeDays',
        header: 'Lead Time',
        width: '14%',
        render: (_val, offer) => (
          <span>{offer.leadTimeDays ? `${offer.leadTimeDays} days` : 'Standard'}</span>
        ),
      },
      {
        key: 'action',
        header: 'Sourcing Action',
        width: '30%',
        render: (_val, offer) => {
          const isPref = offer._parentPreferredId === offer.supplierId;
          const busy = savingKey === `${offer._canonicalKey}:${offer.supplierId}`;
          return (
            <button
              type="button"
              disabled={isPref || Boolean(savingKey)}
              onClick={() => handleSetPreferred(offer._parentRow, offer.supplierId)}
              className={isPref ? 'gcp-btn-secondary' : 'gcp-btn-primary'}
              style={{
                height: '30px',
                padding: '0 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: isPref ? 'default' : 'pointer',
              }}
            >
              {isPref ? 'Preferred ✓' : busy ? 'Saving...' : 'Set Preferred'}
            </button>
          );
        },
      },
    ],
    [savingKey]
  );

  const handleExportCsv = () => {
    const headers = [
      'Canonical Key',
      'Product',
      'Type',
      'Suppliers',
      'Best Supplier',
      'Best Cost EUR',
      '2nd Supplier',
      '2nd Cost EUR',
      'Spread EUR',
      'Spread %',
      'Preferred Supplier',
      'Bulk Batch MOQ',
      'Bulk Batch Cost EUR',
    ];
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      headers.map(escape).join(','),
      ...filteredRows.map((r) =>
        [
          r.canonicalKey,
          r.name,
          r.productType,
          r.supplierCount,
          r.bestOffer?.supplierName || '',
          r.bestOffer?.costEur ?? '',
          r.secondBestOffer?.supplierName || '',
          r.secondBestOffer?.costEur ?? '',
          r.maxSpreadEur ?? '',
          r.maxSpreadPct ?? '',
          r.preferredSupplierId || '',
          r.bestOffer?.bulkTier?.packsPerBatch ?? '',
          r.bestOffer?.bulkTier?.bulkOfferExclVatEur ?? '',
        ]
          .map(escape)
          .join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `atlas-supplier-benchmark-${categoryFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredRows.length} rows to CSV`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.875rem',
        }}
      >
        <MetricCard
          title="Canonical SKUs"
          value={metrics.total}
          subtitle={`Category: ${categoryFilter}`}
          icon={Layers}
        />
        <MetricCard
          title="Multi-Supplier SKUs"
          value={metrics.overlapping}
          subtitle="Comparable across ≥2 labs"
          icon={CheckCircle}
        />
        <MetricCard
          title="Avg. Cost Spread"
          value={metrics.avgSpreadPct}
          subtitle="Across comparable SKUs"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Explicitly Preferred"
          value={metrics.withPreferred}
          subtitle="Locked sourcing choice"
          icon={DollarSign}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 360px' }}>
          <GlobalSearchBar
            size="md"
            searchTerm={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search canonical products, strengths, or supplier names..."
            resultCount={filteredRows.length}
            namespace="admin-supplier-benchmark"
            filters={[
              {
                key: 'category',
                label: 'Category',
                value: categoryFilter,
                onRemove: categoryFilter !== 'all' ? () => setCategoryFilter('all') : undefined,
              },
              ...(scopeFilter !== 'all'
                ? [
                    {
                      key: 'scope',
                      label: 'Coverage',
                      value: scopeFilter === 'multi' ? 'Multi-Supplier (≥2)' : 'Single Source',
                      onRemove: () => setScopeFilter('all'),
                    },
                  ]
                : []),
            ]}
            filterOptions={[
              {
                key: 'category',
                label: 'Product Type',
                multiSelect: false,
                values: [categoryFilter],
                options: [
                  { value: 'pellet', label: 'Hormone Pellets' },
                  { value: 'peptide', label: 'Peptides' },
                  { value: 'hormone', label: 'Hormones (BHRT)' },
                  { value: 'raw_material', label: 'Raw Materials / APIs' },
                  { value: 'all', label: 'All Categories (Top 150)' },
                ],
                onChange: (vals) => setCategoryFilter(vals?.[0] || 'pellet'),
              },
              {
                key: 'scope',
                label: 'Supplier Coverage',
                multiSelect: false,
                values: [scopeFilter],
                options: [
                  { value: 'all', label: 'All SKUs' },
                  { value: 'multi', label: 'Comparable (≥2 Suppliers)' },
                  { value: 'single', label: 'Single Source Only' },
                ],
                onChange: (vals) => setScopeFilter(vals?.[0] || 'all'),
              },
            ]}
          />
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filteredRows.length === 0}
          className="gcp-btn-secondary"
          style={{
            height: '40px',
            padding: '0 14px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: filteredRows.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      <DataTable
        data={filteredRows}
        columns={columns}
        loading={loading}
        emptyMessage="No products found for this supplier benchmark filter."
        expandableRender={(row) => (
          <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
              Supplier Offers for {row.name} ({row.offers.length})
            </div>
            <DataTable
              data={row.offers.map((o) => ({
                ...o,
                id: `${row.canonicalKey}-${o.supplierId}`,
                _canonicalKey: row.canonicalKey,
                _parentPreferredId: row.preferredSupplierId,
                _parentRow: row,
              }))}
              columns={offerColumns}
              emptyMessage="No offers recorded."
            />
          </div>
        )}
      />
    </div>
  );
}
