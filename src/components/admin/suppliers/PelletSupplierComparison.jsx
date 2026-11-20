'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { DataTable, GlobalSearchBar, StatusBadge, CopyableId, MetricCard } from '../../ui';
import { buildPelletComparisonRows } from '@/utils/pelletComparison';
import { Layers, CheckCircle, AlertTriangle, DollarSign } from '@/lib/icons';

export default function PelletSupplierComparison() {
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all'); // all | both | nplabs_only | pharmapolis_only

  useEffect(() => {
    let active = true;
    async function loadPellets() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'products'),
          where('productType', '==', 'pellet'),
          limit(100)
        );
        const snap = await getDocs(q);
        if (!active) return;
        setRawProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('[PelletSupplierComparison] Failed to load pellets:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPellets();
    return () => {
      active = false;
    };
  }, []);

  const allRows = useMemo(() => buildPelletComparisonRows(rawProducts), [rawProducts]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allRows.filter((row) => {
      if (scopeFilter !== 'all' && row.overlapStatus !== scopeFilter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.canonicalKey.toLowerCase().includes(q) ||
        row.hormoneType.toLowerCase().includes(q) ||
        row.strength.toLowerCase().includes(q)
      );
    });
  }, [allRows, searchQuery, scopeFilter]);

  const metrics = useMemo(() => {
    const both = allRows.filter((r) => r.overlapStatus === 'both');
    const pharmCheaper = both.filter((r) => r.cheaperSupplier === 'pharmapolis').length;
    const npCheaper = both.filter((r) => r.cheaperSupplier === 'nplabs').length;
    return {
      total: allRows.length,
      overlapping: both.length,
      pharmCheaper,
      npCheaper,
    };
  }, [allRows]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Pellet Formulation',
        width: '24%',
        render: (_val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{row.name}</span>
            <CopyableId value={row.canonicalKey} />
          </div>
        ),
      },
      {
        key: 'overlapStatus',
        header: 'Coverage',
        width: '14%',
        render: (_val, row) => {
          const map = {
            both: { status: 'active', label: 'Both Suppliers' },
            pharmapolis_only: { status: 'po_created', label: 'Pharmapolis Only' },
            nplabs_only: { status: 'pending', label: 'NP LABS Only' },
          };
          const cfg = map[row.overlapStatus] || { status: 'inactive', label: row.overlapStatus };
          return <StatusBadge status={cfg.status} label={cfg.label} />;
        },
      },
      {
        key: 'pharmapolisCostEur',
        header: 'Pharmapolis Cost',
        width: '16%',
        render: (_val, row) =>
          row.pharmapolisCostEur != null ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>
                €{row.pharmapolisCostEur.toFixed(2)}
              </span>
              {row.pharmapolis?.wholesaleEur != null && (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  B2B: €{Number(row.pharmapolis.wholesaleEur).toFixed(2)}
                </span>
              )}
            </div>
          ) : (
            <span style={{ color: '#94a3b8' }}>—</span>
          ),
      },
      {
        key: 'nplabsCostEur',
        header: 'NP LABS Cost',
        width: '16%',
        render: (_val, row) =>
          row.nplabsCostEur != null ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>
                €{row.nplabsCostEur.toFixed(2)}
              </span>
              {row.nplabs?.wholesaleEur != null && (
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  B2B: €{Number(row.nplabs.wholesaleEur).toFixed(2)}
                </span>
              )}
            </div>
          ) : (
            <span style={{ color: '#94a3b8' }}>—</span>
          ),
      },
      {
        key: 'deltaEur',
        header: 'Pharmapolis vs NP LABS',
        width: '18%',
        render: (_val, row) => {
          if (row.deltaEur == null) return <span style={{ color: '#94a3b8' }}>Single source</span>;
          const isHigher = row.deltaEur > 0;
          return (
            <span
              style={{
                fontWeight: 700,
                color: isHigher ? '#dc2626' : '#16a34a',
              }}
            >
              {isHigher ? '+' : ''}€{row.deltaEur.toFixed(2)} ({isHigher ? '+' : ''}
              {row.deltaPct}%)
            </span>
          );
        },
      },
      {
        key: 'cheaperSupplier',
        header: 'Best Cost',
        width: '12%',
        render: (_val, row) => {
          if (row.cheaperSupplier === 'pharmapolis') {
            return <StatusBadge status="active" label="Pharmapolis" />;
          }
          if (row.cheaperSupplier === 'nplabs') {
            return <StatusBadge status="pending" label="NP LABS" />;
          }
          return <StatusBadge status="inactive" label="Tie" />;
        },
      },
    ],
    []
  );

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
          title="Canonical Pellet SKUs"
          value={metrics.total}
          subtitle="Firestore pellet catalog"
          icon={Layers}
        />
        <MetricCard
          title="Overlapping Strengths"
          value={metrics.overlapping}
          subtitle="Pharmapolis & NP LABS"
          icon={CheckCircle}
        />
        <MetricCard
          title="NP LABS Lower Cost"
          value={metrics.npCheaper}
          subtitle="Entry/low strengths"
          icon={AlertTriangle}
        />
        <MetricCard
          title="Pharmapolis Lower Cost"
          value={metrics.pharmCheaper}
          subtitle="High strengths"
          icon={DollarSign}
        />
      </div>

      <GlobalSearchBar
        size="md"
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search pellets by hormone, strength, or canonical key..."
        resultCount={filteredRows.length}
        namespace="admin-pellet-comparison"
        filters={[
          {
            key: 'scope',
            label: 'Filter',
            value:
              scopeFilter === 'all'
                ? 'All Pellets'
                : scopeFilter === 'both'
                ? 'Overlapping Only'
                : scopeFilter === 'nplabs_only'
                ? 'NP LABS Only'
                : 'Pharmapolis Only',
            onRemove: scopeFilter !== 'all' ? () => setScopeFilter('all') : undefined,
          },
        ]}
        filterOptions={[
          {
            key: 'scope',
            label: 'Coverage',
            multiSelect: false,
            values: [scopeFilter],
            options: [
              { value: 'all', label: 'All Pellets' },
              { value: 'both', label: 'Overlapping Only (12)' },
              { value: 'nplabs_only', label: 'NP LABS Only (Gestrinone)' },
              { value: 'pharmapolis_only', label: 'Pharmapolis Only' },
            ],
            onChange: (vals) => setScopeFilter(vals?.[0] || 'all'),
          },
        ]}
      />

      <DataTable
        data={filteredRows}
        columns={columns}
        loading={loading}
        emptyMessage="No pellet products found in Firestore."
      />
    </div>
  );
}
