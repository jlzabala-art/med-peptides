'use client';

import React from 'react';
import { X, Printer, Sparkles, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';

export default function PeptidePricePdfPreviewModal({
  isOpen,
  onClose,
  products = [],
  currency = 'USD',
  currencySymbol = '$',
  formatPrice,
  isDistributor = false
}) {
  if (!isOpen) return null;

  // Format multi-line compound dosage into clean horizontal monospace tags
  const formatDosageDisplay = (rawDose) => {
    if (!rawDose) return '—';
    const str = String(rawDose).trim();
    if (str.includes('+')) {
      return str.split('+').map(s => s.trim()).join(' · ');
    }
    return str;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.25rem 1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .official-price-pdf-preview,
          .official-price-pdf-preview * {
            visibility: visible;
          }
          .official-price-pdf-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .pdf-preview-no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* ── Top Floating Action Dock (GCP Sticky Action Bar) ── */}
      <div
        className="pdf-preview-no-print"
        style={{
          width: '100%',
          maxWidth: '920px',
          background: '#ffffff',
          borderRadius: '8px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
          position: 'sticky',
          top: 0,
          zIndex: 20
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: '#e8f0fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={16} color="#1a73e8" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#202124', lineHeight: 1.2 }}>
              Official B2B Price Schedule Preview
            </div>
            <div style={{ fontSize: '0.74rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>A4 Print & Export Ready</span>
              <span>•</span>
              <span style={{ fontWeight: 700, color: '#1a73e8' }}>{products.length} Formulations in {currency}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#1a73e8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(60,64,67,0.3)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1557b0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1a73e8')}
          >
            <Printer size={15} />
            <span>Print / Save as PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              color: '#5f6368',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 650,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.borderColor = '#c6c6c6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#dadce0';
            }}
          >
            <X size={15} />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* ── Document Container (Google Cloud Console A4 Layout) ── */}
      <div
        className="official-price-pdf-preview"
        style={{
          width: '100%',
          maxWidth: '920px',
          background: '#ffffff',
          borderRadius: '6px',
          padding: '2.5rem 3rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          color: '#202124',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Document Header (GCP Two-Column Key-Value Resource Block) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2.5px solid #003666',
          paddingBottom: '16px',
          marginBottom: '18px'
        }}>
          <div style={{ flex: 1, paddingRight: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#0d9488'
              }} />
              <span style={{ fontSize: '9pt', fontWeight: 800, color: '#003666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ATLAS HEALTH SERVICES · CLINICAL SUPPLY
              </span>
            </div>
            <h1 style={{ margin: '6px 0 3px 0', fontSize: '18pt', fontWeight: 900, color: '#003666', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Bioactive Peptide Formulations · Official Price Schedule
            </h1>
            <p style={{ margin: 0, fontSize: '8.5pt', color: '#5f6368', lineHeight: 1.4 }}>
              Certified Lyophilized Bioactive Vials (10R Borosilicate USP Type I Glass) · Sterile Lyophilization
            </p>
          </div>

          <div style={{
            textAlign: 'right',
            minWidth: '220px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '8px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '7pt', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>SCHEDULE:</span>
              <span style={{
                fontSize: '7pt',
                fontWeight: 800,
                background: isDistributor ? '#e8f0fe' : '#f0fdf4',
                color: isDistributor ? '#1a73e8' : '#166534',
                padding: '1px 6px',
                borderRadius: '3px',
                textTransform: 'uppercase'
              }}>
                {isDistributor ? 'Distributor Tier' : 'Wholesaler B2B'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.5pt', color: '#64748b', marginBottom: '2px' }}>
              <span>REF CODE:</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 750, color: '#0f172a' }}>ATLAS-B2B-2026-Q4</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.5pt', color: '#64748b', marginBottom: '2px' }}>
              <span>BATCH COA:</span>
              <span style={{ fontWeight: 700, color: '#0d9488' }}>≥99.0% HPLC Validated</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.5pt', color: '#64748b' }}>
              <span>LOGISTICS:</span>
              <span style={{ fontWeight: 600, color: '#475569' }}>UAE &amp; EU Cold-Chain</span>
            </div>
          </div>
        </div>

        {/* GCP 4-Card Summary Strip (Rule #22 & Rule #8) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          marginBottom: '18px'
        }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
            <div style={{ fontSize: '7pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              Billing Currency
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 800, color: '#003666', marginTop: '2px' }}>
              {currency} ({currencySymbol})
            </div>
            <div style={{ fontSize: '6.8pt', color: '#16a34a', fontWeight: 700, marginTop: '1px' }}>
              ● Active Quote
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
            <div style={{ fontSize: '7pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              Catalog Depth
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 800, color: '#202124', marginTop: '2px' }}>
              {products.length} Items
            </div>
            <div style={{ fontSize: '6.8pt', color: '#5f6368', marginTop: '1px' }}>
              Sterile 10R Formulations
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
            <div style={{ fontSize: '7pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              Box ×10 Advantage
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 800, color: '#137333', marginTop: '2px' }}>
              Up to -44%
            </div>
            <div style={{ fontSize: '6.8pt', color: '#137333', fontWeight: 650, marginTop: '1px' }}>
              Wholesale volume tier
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
            <div style={{ fontSize: '7pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              Quality Release
            </div>
            <div style={{ fontSize: '11pt', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
              100% cGMP
            </div>
            <div style={{ fontSize: '6.8pt', color: '#0d9488', fontWeight: 650, marginTop: '1px' }}>
              Batch analytical COA
            </div>
          </div>
        </div>

        {/* Official Pricing Table (GCP Dense Table Pattern) */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '8.2pt',
          marginBottom: '20px',
          tableLayout: 'fixed'
        }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderTop: '1px solid #cbd5e1', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '8px 6px', textAlign: 'center', width: '30px', fontWeight: 800, color: '#475569' }}>#</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', width: '210px', fontWeight: 800, color: '#0f172a' }}>Peptide Active Principle</th>
              <th style={{ padding: '8px 8px', textAlign: 'center', width: '110px', fontWeight: 800, color: '#0f172a' }}>Strength</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', width: '130px', fontWeight: 700, color: '#475569' }}>Therapeutic Class</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', width: '105px', fontWeight: 800, color: '#0f172a' }}>Single Vial (1x)</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', width: '140px', fontWeight: 800, color: '#137333' }}>Box of 10 (Pack ×10)</th>
              <th style={{ padding: '8px 6px', textAlign: 'center', width: '75px', fontWeight: 800, color: '#137333' }}>Box Savings</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => {
              const p10 = p.pack10Price || (p.unitPrice * 10 * 0.85);
              const perUnit = p.tier10UnitPrice || (p.unitPrice * 0.85);
              const discountPct = Math.max(10, Math.round((1 - (p10 / (p.unitPrice * 10))) * 100));
              const targetSlug = p.slug || p.productId || '';
              const cleanDoseParam = (p.dosage || '').replace(/\s+/g, '').toLowerCase();
              const publicUrl = `/p/${encodeURIComponent(targetSlug)}${cleanDoseParam ? `?dose=${encodeURIComponent(cleanDoseParam)}` : ''}`;

              return (
                <tr
                  key={p.id || idx}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    height: '42px'
                  }}
                >
                  <td style={{ padding: '6px 6px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b', fontSize: '7.5pt' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '6px 10px', fontWeight: 750, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#0f172a',
                        textDecoration: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#1a73e8'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#0f172a'; }}
                      title={`Open official datasheet for ${p.productName} in new tab`}
                    >
                      {p.productName}
                    </a>
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '7.8pt',
                    color: '#1a73e8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {formatDosageDisplay(p.dosage)}
                  </td>
                  <td style={{
                    padding: '6px 10px',
                    color: '#5f6368',
                    fontSize: '7.6pt',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {p?.categoryMeta?.label || p.categoryKey || 'Clinical Peptide'}
                  </td>
                  <td style={{
                    padding: '6px 10px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontWeight: 750,
                    color: '#202124',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {formatPrice(p.unitPrice)}
                  </td>
                  <td style={{
                    padding: '6px 10px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    color: '#137333',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    <div>{formatPrice(p10)}</div>
                    <div style={{ fontSize: '6.8pt', color: '#5f6368', fontWeight: 500 }}>
                      ({formatPrice(perUnit)}/vial)
                    </div>
                  </td>
                  <td style={{ padding: '6px 6px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '7pt',
                      fontWeight: 800,
                      color: '#137333',
                      background: '#e6f4ea',
                      border: '1px solid #ceead6',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      -{discountPct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Regulatory & Quality Terms (Google Cloud SLA Pattern) */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '7.4pt',
          color: '#5f6368',
          lineHeight: 1.5,
          marginBottom: '16px'
        }}>
          <strong style={{ color: '#003666' }}>Quality Assurance &amp; Clinical Terms:</strong> All peptide vials are manufactured under cGMP standards with verified analytical purity (≥99.0% HPLC). Lyophilized sterile formulations are vacuum-sealed in USP Type I borosilicate glass for room-temperature transit stability. Storage post-reconstitution: 2°C – 8°C. Official proforma invoice and Certificate of Analysis (COA) are issued upon formal order confirmation.
        </div>

        {/* Audit & Verification Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '10px',
          fontSize: '7.2pt',
          color: '#9aa0a6'
        }}>
          <div>Atlas Health Services Ltd · clinical.ops@atlashealth-services.com</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1a73e8' }}>
            https://www.atlashealth-services.com/pricing/peptides
          </div>
          <div>Verified Institutional Schedule · Page 1 of 1</div>
        </div>
      </div>
    </div>
  );
}
