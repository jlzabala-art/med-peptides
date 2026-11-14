'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink, FileDown, Search, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import TabSkeleton from '@/components/ui/TabSkeleton';
import ProductDetailInline from './ProductDetailInline';

/**
 * PriceScheduleSkuTable
 * ─────────────────────────────────────────────────────────────────────────────
 * Live SKU DataTable for an active Price Schedule catalog.
 * Follows Golden Rules #1, #3, #4, #8, #11, #30.
 */
export default function PriceScheduleSkuTable({
  group,
  tier,
  priceFor,
  formatPrice,
  isAdmin
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setSelectedBrand('all');

    if (group.id === 'aesthetic-injectables') {
      import('@/data/aestheticInjectablesRegistry')
        .then(mod => {
          if (!isMounted) return;
          setProducts(mod.getAestheticInjectablesCatalog() || []);
          setLoading(false);
        })
        .catch(() => {
          if (!isMounted) return;
          setProducts([]);
          setLoading(false);
        });
      return () => { isMounted = false; };
    }

    fetch(`/api/catalog/public?category=${encodeURIComponent(group.fetchGroup)}&limit=100`)
      .then(res => (res.ok ? res.json() : { products: [] }))
      .then(data => {
        if (!isMounted) return;
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setProducts([]);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [group.id, group.fetchGroup]);

  // Distinct brand/manufacturer categories in catalog
  const availableBrands = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.brand) set.add(p.brand);
      else if (p.manufacturer) set.add(p.manufacturer.split(' ')[0]);
    });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedBrand && selectedBrand !== 'all') {
      list = list.filter(p => p.brand === selectedBrand || p.manufacturer?.toLowerCase().includes(selectedBrand.toLowerCase()));
    }
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.canonicalName || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q) ||
      (p.indication || '').toLowerCase().includes(q) ||
      (p.technology || '').toLowerCase().includes(q) ||
      (p.subcategory || '').toLowerCase().includes(q) ||
      (p.dosage || '').toLowerCase().includes(q)
    );
  }, [products, search, selectedBrand]);

  // Export current SKU table view to CSV
  const handleExportCsv = () => {
    try {
      const headers = ['Code/SKU', 'Product Name', 'Dosage/Volume', 'Availability', `Price (${group.currency})`];
      if (isAdmin) headers.push('Estimated Cost');

      const rows = filtered.map(p => {
        const resolved = priceFor(p);
        const amount = resolved.price ?? p.price ?? 0;
        const cost = resolved.costPrice ?? (p.price ? +(p.price / 1.3225).toFixed(2) : 0);
        const rowData = [
          `"${p.id || ''}"`,
          `"${(p.name || p.canonicalName || '').replace(/"/g, '""')}"`,
          `"${(p.dosage || '').replace(/"/g, '""')}"`,
          p.inStock ? 'Active' : 'Draft',
          amount
        ];
        if (isAdmin) rowData.push(cost);
        return rowData.join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${group.id}_price_schedule_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${filtered.length} SKUs to CSV ✓`);
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'id',
        label: 'Code / SKU',
        width: '18%',
        render: (val, row) => <CopyableId value={row.id} />
      },
      {
        key: 'name',
        label: 'Product / Formulation',
        width: isAdmin ? '32%' : '44%',
        render: (val, row) => (
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
              {row.name || row.canonicalName || row.id}
            </div>
            {row.dosage && (
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                {row.dosage}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'status',
        label: 'Availability',
        width: '16%',
        render: (val, row) => (
          <StatusBadge status={row.inStock ? 'active' : 'draft'} />
        )
      },
      {
        key: 'price',
        label: tier === 'guest' ? 'Wholesale (Cost × 1.3225)' : 'Your Tier Price',
        width: isAdmin ? '18%' : '22%',
        render: (val, row) => {
          const resolved = priceFor(row);
          const amount = resolved.price ?? row.price;
          return (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                {formatPrice(amount, group.currency)}
              </div>
              <div style={{ fontSize: 10, color: '#0284c7', fontWeight: 600 }}>
                {resolved.label || 'Wholesale'}
              </div>
            </div>
          );
        }
      }
    ];

    if (isAdmin) {
      cols.push({
        key: 'adminCost',
        label: 'Cost & Margin',
        width: '16%',
        render: (val, row) => {
          const resolved = priceFor(row);
          const cost = resolved.costPrice ?? (row.price ? +(row.price / 1.3225).toFixed(2) : null);
          return (
            <div style={{ fontSize: 11 }}>
              <div style={{ color: '#475569' }}>
                Cost: <strong>{formatPrice(cost, group.currency)}</strong>
              </div>
              <div style={{ color: '#15803d', fontWeight: 600 }}>
                +15% Platform +15% WS
              </div>
            </div>
          );
        }
      });
    }

    return cols;
  }, [group.currency, priceFor, formatPrice, tier, isAdmin]);

  return (
    <div style={{ marginTop: 20 }}>
      {/* Header controls: Search SKU + Brand Filter + CSV Export */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 12,
        paddingBottom: 8, borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Live References ({filtered.length} SKUs)
          </span>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            · Currency: <strong>{group.currency}</strong>
          </span>
          <span style={{ fontSize: 11, color: '#003666', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '1px 8px', borderRadius: 12, fontWeight: 600 }}>
            Click any row to expand technical specs
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${group.label} SKUs...`}
              style={{
                padding: '6px 10px 6px 28px',
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                width: 220,
                background: '#fff'
              }}
            />
            <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 9, top: 9 }} />
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title="Export filtered references to CSV"
          >
            <FileDown size={13} color="#0284c7" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Brand Filters if multiple brands in group */}
      {availableBrands.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginRight: 4 }}>Brand:</span>
          <button
            type="button"
            onClick={() => setSelectedBrand('all')}
            style={{
              padding: '3px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              border: selectedBrand === 'all' ? '1px solid var(--color-primary, #003666)' : '1px solid #cbd5e1',
              background: selectedBrand === 'all' ? 'var(--color-primary, #003666)' : '#fff',
              color: selectedBrand === 'all' ? '#fff' : '#475569'
            }}
          >
            All Brands
          </button>
          {availableBrands.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBrand(b)}
              style={{
                padding: '3px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                border: selectedBrand === b ? '1px solid var(--color-primary, #003666)' : '1px solid #cbd5e1',
                background: selectedBrand === b ? 'var(--color-primary, #003666)' : '#fff',
                color: selectedBrand === b ? '#fff' : '#475569'
              }}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <TabSkeleton lines={6} />
      ) : products.length === 0 ? (
        <div style={{
          padding: '32px 20px', textAlign: 'center', background: '#f8fafc',
          borderRadius: 10, border: '1px dashed #cbd5e1', margin: '12px 0'
        }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px 0' }}>
            Real-time catalog synchronization for this specialized line is active in the dedicated workspace.
          </p>
          <Link href={group.route} style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              color: '#fff', background: 'var(--color-primary, #003666)', border: 'none', cursor: 'pointer'
            }}>
              <span>Open Dedicated Price List</span>
              <ExternalLink size={13} />
            </button>
          </Link>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          pagination={true}
          pageSize={10}
          globalSearch={false}
          expandableRender={(row) => <ProductDetailInline row={row} group={group} />}
        />
      )}
    </div>
  );
}
