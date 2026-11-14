'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Package } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import InlineEditableCell from '@/components/ui/InlineEditableCell';
import EmptyState from '@/components/ui/EmptyState';

export default function PricingDataTable({
  products = [],
  viewMode = 'table',
  skuPrefixPattern = /^SKU-COLWAY-/i,
  loginRedirect = '/pricing/colway',
  currency = 'AED',
  fxRate = 1,
  formatPrice,
  isAdmin = false,
  isWholesaler = false,
  isClinicOrDoctor = false,
  canViewLanded = false,
  showLandedCost = false,
  totals,
  onSaveInlinePrice,
  onResetFilters,
}) {
  const router = useRouter();

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'itemNumber',
        label: '#',
        width: '54px',
        minWidth: '50px',
        nowrap: true,
        sortable: true,
        render: (val, row) => (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.80rem',
              color: '#64748b',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {val ?? row?.itemNumber}
          </span>
        ),
      },
      {
        key: 'sku',
        label: 'SKU',
        width: '13%',
        sortable: true,
        render: (val, row) => {
          const rawSku = val ?? row?.sku ?? '';
          const simpleSku = rawSku.replace(skuPrefixPattern, '');
          return (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                alignItems: 'flex-start',
              }}
            >
              <CopyableId value={simpleSku} />
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 650,
                  color: '#0d9488',
                  background: '#f0fdfa',
                  border: '1px solid #a7f3d0',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  letterSpacing: '0.02em',
                  textTransform: 'lowercase',
                }}
              >
                {row?.category}
              </span>
            </div>
          );
        },
      },
      {
        key: 'name',
        label: 'Product',
        width: canViewLanded && showLandedCost ? '26%' : '32%',
        sortable: true,
        render: (_, row) => {
          const detailUrl = `/p/${row.slug || row.id}`;
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: 0,
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(detailUrl);
              }}
              title="Click to view detailed clinical formulation & product specs"
            >
              {row?.image && (
                <img
                  src={row.image}
                  alt={row.name}
                  style={{
                    width: '42px',
                    height: '42px',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    padding: '2px',
                    flexShrink: 0,
                  }}
                  loading="lazy"
                />
              )}
              <div style={{ minWidth: 0, lineHeight: 1.3 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                  {row.name}
                </div>
                {row.volume && (
                  <div style={{ fontSize: '0.73rem', color: '#64748b' }}>
                    {row.volume}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: 'stockStatus',
        label: 'Status',
        width: '12%',
        sortable: true,
        render: (val) => (
          <StatusBadge
            status={String(val || '').toLowerCase().includes('out') ? 'error' : 'active'}
            customLabel={val || 'In Stock'}
          />
        ),
      },
    ];

    if (canViewLanded && showLandedCost) {
      cols.push({
        key: 'calculatedLanded',
        label: `Landed CIF (${currency})`,
        width: '12%',
        align: 'right',
        sortable: true,
        render: (val, row) => {
          const displayVal = Number((Number(val || 0) * fxRate).toFixed(2));
          if (!isAdmin) {
            return <span className="font-mono font-semibold">{formatPrice(val)}</span>;
          }
          return (
            <InlineEditableCell
              value={displayVal}
              type="number"
              align="right"
              format={() => formatPrice(val)}
              onSave={(newVal) => onSaveInlinePrice?.(row.id, 'landed', newVal)}
            />
          );
        },
      });
    }

    cols.push({
      key: 'calculatedWholesale',
      label: `Wholesale (${currency})`,
      width: '13%',
      align: 'right',
      sortable: true,
      render: (val, row) => {
        if (!isWholesaler) {
          return (
            <Link href={`/login?redirect=${loginRedirect}&tier=wholesale`} className="b2b-lock-pill">
              <Lock size={11} /> <span>Sign In</span>
            </Link>
          );
        }
        const displayVal = Number((Number(val || 0) * fxRate).toFixed(2));
        if (!isAdmin) {
          return (
            <span className="font-mono font-bold text-emerald-700">
              {formatPrice(val)}
            </span>
          );
        }
        return (
          <InlineEditableCell
            value={displayVal}
            type="number"
            align="right"
            format={() => (
              <span className="font-mono font-bold text-emerald-700">
                {formatPrice(val)}
              </span>
            )}
            onSave={(newVal) => onSaveInlinePrice?.(row.id, 'wholesale', newVal)}
          />
        );
      },
    });

    cols.push({
      key: 'recommendedClinic',
      label: `Clinic (${currency})`,
      width: '12%',
      align: 'right',
      sortable: true,
      render: (val, row) => {
        if (!isClinicOrDoctor) {
          return (
            <Link href={`/login?redirect=${loginRedirect}&tier=clinic`} className="b2b-lock-pill">
              <Lock size={11} /> <span>Sign In</span>
            </Link>
          );
        }
        const displayVal = Number((Number(val || 0) * fxRate).toFixed(2));
        if (!isAdmin) {
          return <span className="font-mono">{formatPrice(val)}</span>;
        }
        return (
          <InlineEditableCell
            value={displayVal}
            type="number"
            align="right"
            format={() => formatPrice(val)}
            onSave={(newVal) => onSaveInlinePrice?.(row.id, 'clinic', newVal)}
          />
        );
      },
    });

    cols.push({
      key: 'recommendedRetail',
      label: `Retail MSRP (${currency})`,
      width: '12%',
      align: 'right',
      sortable: true,
      render: (val, row) => {
        const displayVal = Number((Number(val || 0) * fxRate).toFixed(2));
        if (!isAdmin) {
          return <span className="font-mono font-bold">{formatPrice(val)}</span>;
        }
        return (
          <InlineEditableCell
            value={displayVal}
            type="number"
            align="right"
            format={() => <span className="font-mono font-bold">{formatPrice(val)}</span>}
            onSave={(newVal) => onSaveInlinePrice?.(row.id, 'retail', newVal)}
          />
        );
      },
    });

    return cols;
  }, [
    canViewLanded,
    currency,
    formatPrice,
    fxRate,
    isAdmin,
    isClinicOrDoctor,
    isWholesaler,
    loginRedirect,
    onSaveInlinePrice,
    router,
    showLandedCost,
    skuPrefixPattern,
  ]);

  const renderExpandedDetail = (row) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        padding: '1rem 1.25rem',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Key Bioactive Compounds
        </div>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.83rem', color: '#0f172a', lineHeight: 1.45 }}>
          {row.keyActives || 'Clinical bioactive formulation'}
        </p>
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Clinical Indication &amp; Role
        </div>
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.83rem', color: '#0f172a', lineHeight: 1.45 }}>
          {row.clinicalFocus || row.subtitle || 'Professional clinic & homecare protocol'}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.6rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Presentation &amp; Margin
          </div>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.83rem', color: '#334155' }}>
            {row.presentation || row.volume || 'Standard Clinical Pack'} · Spread: {row.calculatedRetailMarginPct}% MSRP
          </p>
        </div>
        <div>
          <Link
            href={`/p/${row.slug || row.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#003666',
              textDecoration: 'none',
            }}
          >
            <span>Open Full Product Dossier</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No formulations match your filters"
        subtitle="Clear the active search or category filters to view the full price schedule."
        action={
          onResetFilters
            ? { label: 'Reset Filters', onClick: onResetFilters }
            : undefined
        }
      />
    );
  }

  return (
    <>
      {viewMode === 'table' && (
        <div className="no-print">
          <DataTable
            columns={columns}
            data={products}
            rowKey="id"
            expandableRender={renderExpandedDetail}
            pageSize={25}
          />
        </div>
      )}

      {viewMode === 'cards' && (
        <div className="product-cards-grid no-print">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <div className="card-image-wrap">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="card-product-img" />
                ) : (
                  <div className="card-placeholder-img">
                    <Package size={32} className="text-slate-400" />
                  </div>
                )}
                <span className="card-category-badge">{p.category}</span>
              </div>

              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <CopyableId value={(p.sku || '').replace(skuPrefixPattern, '')} />
                  {p.volume && (
                    <span
                      style={{
                        fontSize: '0.70rem',
                        fontWeight: 700,
                        color: '#0369a1',
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {p.volume}
                    </span>
                  )}
                </div>
                <h3 className="card-title" style={{ marginTop: '6px', marginBottom: '8px' }}>
                  <Link href={`/p/${p.slug || p.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {p.name}
                  </Link>
                </h3>

                <div className="card-clinical-focus">
                  <strong>Clinical Role:</strong> {p.clinicalFocus}
                </div>

                <div className="card-pricing-strip">
                  {isWholesaler ? (
                    <div className="price-item highlight">
                      <span className="price-item-label">Wholesaler</span>
                      <span className="price-item-val font-mono text-emerald-700 font-bold">
                        {formatPrice(p.calculatedWholesale)}
                      </span>
                    </div>
                  ) : (
                    <div className="price-item">
                      <span className="price-item-label">Wholesale Rate</span>
                      <Link href={`/login?redirect=${loginRedirect}&tier=wholesale`} className="b2b-lock-pill">
                        <Lock size={11} /> <span>Sign In</span>
                      </Link>
                    </div>
                  )}

                  {isClinicOrDoctor ? (
                    <div className="price-item">
                      <span className="price-item-label">Recommended Clinic</span>
                      <span className="price-item-val font-mono">
                        {formatPrice(p.recommendedClinic)}
                      </span>
                    </div>
                  ) : (
                    <div className="price-item">
                      <span className="price-item-label">Clinic Rate</span>
                      <Link href={`/login?redirect=${loginRedirect}&tier=clinic`} className="b2b-lock-pill">
                        <Lock size={11} /> <span>Sign In</span>
                      </Link>
                    </div>
                  )}

                  <div className="price-item">
                    <span className="price-item-label">Retail MSRP</span>
                    <span className="price-item-val font-mono font-bold text-slate-800">
                      {formatPrice(p.recommendedRetail)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Print-Only CSS Grid Schedule (No raw HTML <table> tags per Golden Rule #3) */}
      <div className="print-only-table-wrap" style={{ marginTop: '1rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 130px 1fr 90px 110px 110px 110px',
            gap: '8px',
            padding: '8px 10px',
            borderBottom: '2px solid #0f172a',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        >
          <div>#</div>
          <div>SKU</div>
          <div>Product Formulation</div>
          <div>Volume</div>
          <div style={{ textAlign: 'right' }}>Wholesale</div>
          <div style={{ textAlign: 'right' }}>Clinic</div>
          <div style={{ textAlign: 'right' }}>MSRP</div>
        </div>
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '40px 130px 1fr 90px 110px 110px 110px',
              gap: '8px',
              padding: '7px 10px',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '0.76rem',
              alignItems: 'center',
            }}
          >
            <div className="font-mono">{p.itemNumber}</div>
            <div className="font-mono">{(p.sku || '').replace(skuPrefixPattern, '')}</div>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div>{p.volume}</div>
            <div className="font-mono" style={{ textAlign: 'right', fontWeight: 700 }}>
              {isWholesaler ? formatPrice(p.calculatedWholesale) : 'B2B Only'}
            </div>
            <div className="font-mono" style={{ textAlign: 'right' }}>
              {isClinicOrDoctor ? formatPrice(p.recommendedClinic) : 'Clinic Only'}
            </div>
            <div className="font-mono" style={{ textAlign: 'right', fontWeight: 700 }}>
              {formatPrice(p.recommendedRetail)}
            </div>
          </div>
        ))}
        {isWholesaler && totals && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderTop: '2px solid #0f172a',
              marginTop: '4px',
            }}
          >
            <span>Portfolio Aggregate Wholesale Basket ({totals.count} SKUs)</span>
            <span className="font-mono">{formatPrice(totals.totalWholesale)}</span>
          </div>
        )}
      </div>
    </>
  );
}
