'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, ExternalLink, Sliders } from 'lucide-react';
import { getProductVariantsCompetitorReport, isFinishedPeptide } from '../../../services/algoliaCompetitorService';
import DataTable from '../../ui/DataTable';

/**
 * VariantCompetitorComparisonTable
 * ─────────────────────────────────────────────────────────────────────────────
 * Renders a variant-level market price comparison table for finished peptides
 * (vials, lyophilized injectable formulations) against top industry competitors.
 */
export default function VariantCompetitorComparisonTable({
  product = {},
  variants = [],
  channel = 'retail',
  onOpenPricingDrawer,
}) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if product qualifies for finished peptide competitor benchmark
  const targetVariants = useMemo(() => {
    const vars = variants.length > 0 ? variants : (product.variants || [product]);
    return vars.filter(v => isFinishedPeptide(v, product));
  }, [variants, product]);

  useEffect(() => {
    let isMounted = true;
    if (targetVariants.length === 0) {
      setReport(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getProductVariantsCompetitorReport({ product, variants: targetVariants, channel })
      .then(res => {
        if (isMounted) {
          setReport(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('[VariantCompetitorComparisonTable] Error loading report:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [product, targetVariants, channel]);

  if (targetVariants.length === 0) {
    return null; // Only render for finished peptide products
  }

  return (
    <div style={{
      marginTop: '0.5rem',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
    }}>
      {/* Header Bar */}
      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: '#eff6ff',
            color: '#0284c7',
          }}>
            <TrendingUp size={14} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>
              Competitor & Market Benchmark (Variant Level)
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '6px' }}>
              · Finished Vials vs US/EU Market
            </span>
          </div>
        </div>

        {report?.summary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: report.summary.cheaperCount > 0 ? '#dcfce7' : '#f1f5f9',
              color: report.summary.cheaperCount > 0 ? '#166534' : '#475569',
              border: `1px solid ${report.summary.cheaperCount > 0 ? '#bbf7d0' : '#e2e8f0'}`,
            }}>
              {report.summary.cheaperCount} of {report.summary.totalVariants} variants cheaper than web at +50% markup
            </span>

            {onOpenPricingDrawer && (
              <button
                type="button"
                onClick={() => onOpenPricingDrawer(product)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#003666',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Sliders size={12} />
                <span>Pricing Drawer</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table Body via Canonical DataTable (Golden Rule #3) */}
      {loading ? (
        <div style={{ padding: '1.25rem', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
          Analyzing real-time market competitors and calculating +50% target margins...
        </div>
      ) : report?.variants && report.variants.length > 0 ? (
        <DataTable
          data={report.variants}
          keyField="variantId"
          columns={[
            {
              id: 'variantLabel',
              header: 'Variant & Dosage',
              width: '24%',
              render: (vReport) => {
                const isCheaper = vReport.status === 'cheaper';
                const isHigher = vReport.status === 'higher';
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isCheaper ? '#10b981' : isHigher ? '#f59e0b' : '#64748b',
                      }} />
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{vReport.variantLabel}</span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
                        ({vReport.format})
                      </span>
                    </div>
                    {vReport.supplierName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '12px' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          color: '#0369a1',
                          backgroundColor: '#f0f9ff',
                          border: '1px solid #bae6fd',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          🏷️ {vReport.supplierName}
                        </span>
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              id: 'supplierCost',
              header: 'Supplier Cost / mg',
              width: '16%',
              render: (vReport) => {
                const cost = vReport.supplierCost || 0;
                return (
                  <div>
                    <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.82rem' }}>
                      {vReport.costPpm > 0 ? `$${vReport.costPpm.toFixed(2)}/mg` : (cost > 0 ? `$${cost.toFixed(2)}` : '—')}
                    </div>
                    {cost > 0 && (
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        ${cost.toFixed(2)} / unit
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              id: 'targetRetail',
              header: 'Target Retail / mg (+50%)',
              width: '18%',
              render: (vReport) => {
                const cost = vReport.supplierCost || 0;
                const retail = vReport.targetRetailPrice || (cost > 0 ? cost * 1.5 : 0);
                const profit = vReport.grossProfit || (retail - cost);
                return (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#003666', fontSize: '0.84rem' }}>
                        {vReport.targetRetailPpm > 0 ? `$${vReport.targetRetailPpm.toFixed(2)}/mg` : (retail > 0 ? `$${retail.toFixed(2)}` : '—')}
                      </span>
                      {profit > 0 && (
                        <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600, backgroundColor: '#f0fdf4', padding: '1px 4px', borderRadius: '4px' }}>
                          +${profit.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {retail > 0 && (
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        ${retail.toFixed(2)} / unit (+50%)
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              id: 'marketAvg',
              header: 'Market Avg / mg',
              width: '16%',
              render: (vReport) => {
                const dosageMg = vReport.dosageMg || 1;
                const minPpm = dosageMg > 0 && vReport.minPrice ? Number((vReport.minPrice / dosageMg).toFixed(2)) : 0;
                const maxPpm = dosageMg > 0 && vReport.maxPrice ? Number((vReport.maxPrice / dosageMg).toFixed(2)) : 0;
                return (
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>
                      {vReport.avgPpm > 0 ? `$${vReport.avgPpm.toFixed(2)}/mg` : `Avg: $${vReport.avgPrice.toFixed(2)}`}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {minPpm > 0 && maxPpm > 0 ? `Range: $${minPpm}–$${maxPpm}/mg` : `Unit Avg: $${vReport.avgPrice.toFixed(2)}`}
                    </div>
                  </div>
                );
              },
            },
            {
              id: 'competitors',
              header: 'Key Competitors ($/mg)',
              width: '26%',
              render: (vReport) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {vReport.competitors.map((comp, cIdx) => (
                    <a
                      key={cIdx}
                      href={comp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        fontSize: '0.68rem',
                        textDecoration: 'none',
                      }}
                      title={`Inspect ${comp.name}: $${comp.ppm ? comp.ppm.toFixed(2) + '/mg' : ''} ($${comp.price.toFixed(2)} unit)`}
                    >
                      <span style={{ fontWeight: 500 }}>{comp.name}:</span>
                      <strong style={{ color: '#0369a1' }}>
                        {comp.ppm > 0 ? `$${comp.ppm.toFixed(2)}/mg` : `$${comp.price.toFixed(2)}`}
                      </strong>
                      <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                        (${comp.price.toFixed(2)})
                      </span>
                      <ExternalLink size={9} style={{ opacity: 0.5 }} />
                    </a>
                  ))}
                </div>
              ),
            },
          ]}
        />
      ) : (
        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          No competitor listings found for these specific variant specifications.
        </div>
      )}
    </div>
  );
}
