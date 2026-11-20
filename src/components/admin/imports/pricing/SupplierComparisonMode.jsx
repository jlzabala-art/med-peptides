'use client';

import React, { useEffect, useMemo, useState } from 'react';
import GitCompare from 'lucide-react/dist/esm/icons/git-compare';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { buildSupplierComparisonRows } from '../../../../utils/supplierComparison';
import { DataTable, StatusBadge, CopyableId, GlobalSearchBar } from '../../../ui';

export default function SupplierComparisonMode({ products: injectedProducts = null }) {
  const [products, setProducts] = useState(injectedProducts || []);
  const [loading, setLoading] = useState(!injectedProducts);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (injectedProducts) {
      setProducts(injectedProducts);
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const q = query(collection(db, 'products'), limit(150));
        const snap = await getDocs(q);
        if (active) {
          setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error('[SupplierComparisonMode] Error loading canonical products:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [injectedProducts]);

  const comparableRows = useMemo(() => {
    const all = buildSupplierComparisonRows(products);
    const q = searchTerm.trim().toLowerCase();
    return all
      .filter((r) => r.supplierCount >= 2)
      .filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.canonicalKey.toLowerCase().includes(q) ||
          r.offers.some((o) => o.supplierName.toLowerCase().includes(q))
      );
  }, [products, searchTerm]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Canonical Product',
        render: (_v, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{row.name}</span>
            <CopyableId value={row.canonicalKey} />
          </div>
        ),
      },
      {
        key: 'bestOffer',
        header: 'Best Supplier Cost',
        render: (_v, row) =>
          row.bestOffer ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#16a34a" />
              <span style={{ fontWeight: 800, color: '#166534' }}>
                {row.bestOffer.supplierName}: €{row.bestOffer.costEur.toFixed(2)}
              </span>
            </div>
          ) : (
            '—'
          ),
      },
      {
        key: 'secondBestOffer',
        header: 'Alternative Offer',
        render: (_v, row) =>
          row.secondBestOffer ? (
            <span style={{ color: '#475569', fontWeight: 600 }}>
              {row.secondBestOffer.supplierName}: €{row.secondBestOffer.costEur.toFixed(2)}
            </span>
          ) : (
            '—'
          ),
      },
      {
        key: 'maxSpreadPct',
        header: 'Savings Potential',
        render: (_v, row) =>
          row.maxSpreadPct != null ? (
            <StatusBadge status="active" label={`Save ${row.maxSpreadPct}% (€${row.maxSpreadEur.toFixed(2)})`} />
          ) : (
            '—'
          ),
      },
    ],
    []
  );

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitCompare size={18} color="#0f172a" />
          <span style={{ fontWeight: 700, color: '#0f172a' }}>
            Live Multi-Supplier Comparison (Canonical Catalog)
          </span>
        </div>
        <StatusBadge status="po_created" label={`${comparableRows.length} Comparable SKUs`} />
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <GlobalSearchBar
          size="md"
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Filter by product, canonical key, or supplier..."
          resultCount={comparableRows.length}
          namespace="import-supplier-comparison"
        />
        <DataTable
          data={comparableRows}
          columns={columns}
          loading={loading}
          emptyMessage="No multi-supplier canonical SKUs found yet."
        />
      </div>
    </div>
  );
}
