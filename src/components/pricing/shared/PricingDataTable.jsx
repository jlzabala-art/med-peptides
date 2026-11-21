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
  isGuest = false,
  canViewLanded = false,
  showLandedCost = false,
  totals,
  onSaveInlinePrice,
  getWorkspaceQty,
  onSyncWorkspaceQuote,
  onResetFilters,
}) {
  const router = useRouter();

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'name',
        label: 'Product',
        width: isGuest ? '64%' : isAdmin ? '30%' : isClinicOrDoctor ? '42%' : '52%',
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
                {(row.volume || row.category) && (
                  <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '2px' }}>
                    {[row.volume, row.category].filter(Boolean).join(' · ')}
                  </div>
                )}
                {row.strengthTiers && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {row.strengthTiers.lowest && (
                      <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#0f766e', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '1px 6px', borderRadius: '4px' }}>
                        Low ({row.strengthTiers.lowest.strength}): €{Number(row.strengthTiers.lowest.priceEur).toFixed(2)}
                      </span>
                    )}
                    {row.strengthTiers.middle && (
                      <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '4px' }}>
                        Mid ({row.strengthTiers.middle.strength}): €{Number(row.strengthTiers.middle.priceEur).toFixed(2)}
                      </span>
                    )}
                    {row.strengthTiers.highest && (
                      <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '1px 6px', borderRadius: '4px' }}>
                        High ({row.strengthTiers.highest.strength}): €{Number(row.strengthTiers.highest.priceEur).toFixed(2)}
                      </span>
                    )}
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
        width: isGuest ? '16%' : isAdmin ? '10%' : '13%',
        sortable: true,
        render: (val) => (
          <StatusBadge
            status={String(val || '').toLowerCase().includes('out') ? 'error' : 'active'}
          />
        ),
      },
    ];

    if (!isGuest && canViewLanded && showLandedCost) {
      cols.push({
        key: 'calculatedLanded',
        label: `Cost (${currency})`,
        width: '11%',
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

    // Wholeseller (15% + 15%): Public default for guests, Wholesalers, and Admin
    cols.push({
      key: 'calculatedWholesale',
      label: `Wholeseller (${currency})`,
      width: isGuest ? '20%' : isAdmin ? '11%' : '15%',
      align: 'right',
      sortable: true,
      render: (val, row) => {
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

    // Distributor (+15%): Visible to Admin only
    if (!isGuest && isAdmin) {
      cols.push({
        key: 'calculatedDistributor',
        label: `Distributor (${currency})`,
        width: '11%',
        align: 'right',
        sortable: true,
        render: (val) => (
          <span className="font-mono font-bold text-blue-700">
            {formatPrice(val)}
          </span>
        ),
      });
    }

    if (!isGuest && isClinicOrDoctor) {
      cols.push({
        key: 'recommendedClinic',
        label: `Clinic (${currency})`,
        width: isAdmin ? '11%' : '15%',
        align: 'right',
        sortable: true,
        render: (val, row) => {
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
    }

    if (!isGuest) {
      cols.push({
        key: 'recommendedRetail',
        label: `Retail MSRP (${currency})`,
        width: isAdmin ? '12%' : '15%',
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
    }

    if (typeof onSyncWorkspaceQuote === 'function') {
      cols.push({
        key: 'workspaceQuote',
        label: 'Quote',
        width: '125px',
        align: 'right',
        render: (_, row) => {
          const q = typeof getWorkspaceQty === 'function' ? getWorkspaceQty(row) : 0;
          return q > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid #86efac', background: '#f0fdf4', borderRadius: '6px', padding: '2px 5px' }}
            >
              <button type="button" onClick={() => onSyncWorkspaceQuote(row, Math.max(0, q - 1))} style={{ border: 'none', background: 'transparent', fontWeight: 800, color: '#166534', cursor: 'pointer', minWidth: '22px', minHeight: '22px' }}>-</button>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#166534' }}>{q}</span>
              <button type="button" onClick={() => onSyncWorkspaceQuote(row, q + 1)} style={{ border: 'none', background: 'transparent', fontWeight: 800, color: '#166534', cursor: 'pointer', minWidth: '22px', minHeight: '22px' }}>+</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSyncWorkspaceQuote(row, 1);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#003666',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              + Add to Quote
            </button>
          );
        },
      });
    }

    return cols;
  }, [
    canViewLanded,
    currency,
    formatPrice,
    fxRate,
    getWorkspaceQty,
    isAdmin,
    isClinicOrDoctor,
    isGuest,
    isWholesaler,
    loginRedirect,
    onSyncWorkspaceQuote,
    onSaveInlinePrice,
    router,
    showLandedCost,
    skuPrefixPattern,
  ]);

  const renderExpandedDetail = (row) => {
    const simpleSku = (row.sku || row.id || '').replace(skuPrefixPattern, '');
    const hasStrengthVariants = Array.isArray(row.variants) && row.variants.some((v) => v.strength);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1rem 1.25rem',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              SKU / Reference
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.3rem', marginBottom: '0.6rem' }}>
              <CopyableId value={simpleSku} />
              {row.itemNumber && (
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>
                  #{row.itemNumber}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Key Bioactive Compounds
            </div>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.83rem', color: '#0f172a', lineHeight: 1.45 }}>
              {row.keyActives || 'Clinical bioactive formulation'}
            </p>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Formulation &amp; Scope
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
                {row.presentation || row.volume || 'Standard Pack'} · Spread: {row.calculatedRetailMarginPct}% MSRP
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

        {hasStrengthVariants && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
              All Standardized Strengths ({row.variants.length}) · Pack: {row.packSize || row.volume} · Prices incl. VAT (EUR) — Click any strength to copy Rx line
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {row.variants.map((v) => {
                const isRef = v.tierRole === 'lowest' || v.tierRole === 'middle' || v.tierRole === 'highest';
                const eurPrice = Number(v.costPriceEur || v.price_eur || 0).toFixed(2);
                const rxLine = `${row.name} — ${v.strength} (${row.packSize || row.volume || 'Pack'}) · €${eurPrice}`;
                return (
                  <button
                    key={v.id || v.strength}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(rxLine);
                      }
                    }}
                    title={`Click to copy: ${rxLine}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      background: isRef ? '#eff6ff' : '#ffffff',
                      border: isRef ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{v.strength}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#047857' }}>
                      €{eurPrice}
                    </span>
                    {isRef && (
                      <span style={{ fontSize: '0.60rem', fontWeight: 800, textTransform: 'uppercase', color: '#1d4ed8', background: '#dbeafe', padding: '0 4px', borderRadius: '3px' }}>
                        {v.tierRole}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

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

      {viewMode === 'cards' && (() => {
        const count = products.length;
        const desktopCols = count <= 1
          ? 1
          : count === 2
            ? 2
            : count % 4 === 0
              ? 4
              : count % 3 === 0
                ? 3
                : count >= 5
                  ? 4
                  : 3;
        const remainder = desktopCols > 1 ? count % desktopCols : 0;
        const fillerSpan = remainder > 0 ? desktopCols - remainder : 0;

        return (
        <div
          className={`product-cards-grid product-cards-grid--cols-${desktopCols} no-print`}
          style={{ '--grid-filler-span': fillerSpan }}
        >
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
                  <div className="price-item highlight">
                    <span className="price-item-label">Wholeseller ({currency})</span>
                    <span className="price-item-val font-mono text-emerald-700 font-bold">
                      {formatPrice(p.calculatedWholesale)}
                    </span>
                  </div>

                  {!isGuest && isClinicOrDoctor && (
                    <div className="price-item">
                      <span className="price-item-label">Recommended Clinic</span>
                      <span className="price-item-val font-mono">
                        {formatPrice(p.recommendedClinic)}
                      </span>
                    </div>
                  )}

                  {!isGuest && (
                    <div className="price-item">
                      <span className="price-item-label">Retail MSRP</span>
                      <span className="price-item-val font-mono font-bold text-slate-800">
                        {formatPrice(p.recommendedRetail)}
                      </span>
                    </div>
                  )}
                </div>

                {typeof onSyncWorkspaceQuote === 'function' && (() => {
                  const q = typeof getWorkspaceQty === 'function' ? getWorkspaceQty(p) : 0;
                  return (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      {q > 0 ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid #86efac', background: '#f0fdf4', borderRadius: '6px', padding: '2px 6px' }}>
                          <button type="button" onClick={() => onSyncWorkspaceQuote(p, Math.max(0, q - 1))} style={{ border: 'none', background: 'transparent', fontWeight: 800, color: '#166534', cursor: 'pointer', minWidth: '28px', minHeight: '28px' }}>-</button>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534' }}>{q} in Quote</span>
                          <button type="button" onClick={() => onSyncWorkspaceQuote(p, q + 1)} style={{ border: 'none', background: 'transparent', fontWeight: 800, color: '#166534', cursor: 'pointer', minWidth: '28px', minHeight: '28px' }}>+</button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSyncWorkspaceQuote(p, 1)}
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            minHeight: '36px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#003666',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          + Add to Quote Cart
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}

          {fillerSpan > 0 && (
            <div
              className="product-card product-card--summary-filler"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                border: '1px dashed #93c5fd',
                justifyContent: 'space-between',
                padding: '1.25rem',
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#1d4ed8',
                    background: '#dbeafe',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    marginBottom: '0.75rem',
                  }}
                >
                  Portfolio Concierge
                </span>
                <h3 className="card-title" style={{ marginBottom: '0.5rem', color: '#0f172a' }}>
                  Custom Clinic &amp; Wholesale Allocation
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                  Showing {count} {count === 1 ? 'formulation' : 'formulations'}. Combine mixed SKUs or request a tailored B2B cold-chain quotation directly with Atlas AI.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '1rem' }}>
                {onResetFilters && (
                  <button
                    type="button"
                    className="gcp-btn-secondary"
                    onClick={onResetFilters}
                    style={{ fontSize: '0.76rem', padding: '6px 12px', minHeight: '36px' }}
                  >
                    Show All Formulations
                  </button>
                )}
                <button
                  type="button"
                  className="gcp-btn-primary"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
                    }
                  }}
                  style={{ fontSize: '0.76rem', padding: '6px 12px', minHeight: '36px' }}
                >
                  Ask Atlas AI
                </button>
              </div>
            </div>
          )}
        </div>
        );
      })()}

      {/* Print-Only CSS Grid Schedule (No raw HTML <table> tags per Golden Rule #3) */}
      <div className="print-only-table-wrap" style={{ marginTop: '1rem' }}>
        {(() => {
          const showClinicCol = !isGuest && isClinicOrDoctor;
          const showRetailCol = !isGuest;
          const printGridColumns = isGuest
            ? '40px 130px 1fr 110px 140px'
            : showClinicCol
              ? '40px 130px 1fr 90px 110px 110px 110px'
              : '40px 130px 1fr 100px 120px 120px';
          return (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: printGridColumns,
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
                <div style={{ textAlign: 'right' }}>Wholeseller ({currency})</div>
                {showClinicCol && <div style={{ textAlign: 'right' }}>Clinic</div>}
                {showRetailCol && <div style={{ textAlign: 'right' }}>MSRP</div>}
              </div>
              {products.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: printGridColumns,
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
                    {formatPrice(p.calculatedWholesale)}
                  </div>
                  {showClinicCol && (
                    <div className="font-mono" style={{ textAlign: 'right' }}>
                      {formatPrice(p.recommendedClinic)}
                    </div>
                  )}
                  {showRetailCol && (
                    <div className="font-mono" style={{ textAlign: 'right', fontWeight: 700 }}>
                      {formatPrice(p.recommendedRetail)}
                    </div>
                  )}
                </div>
              ))}
            </>
          );
        })()}
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

      <style jsx>{`
        .print-only-table-wrap {
          display: none;
        }
        @media print {
          .print-only-table-wrap {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
