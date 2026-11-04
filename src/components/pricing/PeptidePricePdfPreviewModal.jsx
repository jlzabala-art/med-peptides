'use client';

import React from 'react';
import { X, Printer, Download, Sparkles, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      {/* ── Top Floating Action Dock ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          background: '#ffffff',
          borderRadius: '8px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#1a73e8" />
          <span style={{ fontWeight: 800, fontSize: '0.90rem', color: '#202124' }}>
            Official Price Schedule Document Preview
          </span>
          <span style={{
            fontSize: '0.70rem',
            fontWeight: 750,
            background: '#e8f0fe',
            color: '#1a73e8',
            border: '1px solid #c2e7ff',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            Quoted in {currency} ({currencySymbol})
          </span>
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
              padding: '7px 14px',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(60,64,67,0.3)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1557b0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1a73e8')}
          >
            <Printer size={14} />
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
              padding: '7px 12px',
              fontSize: '0.80rem',
              fontWeight: 650,
              cursor: 'pointer'
            }}
          >
            <X size={15} />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* ── Document Container (A4 Printable Layout) ── */}
      <div
        className="official-price-pdf-preview"
        style={{
          width: '100%',
          maxWidth: '900px',
          background: '#ffffff',
          borderRadius: '4px',
          padding: '2.5rem 3rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          color: '#0f172a',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #003666', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
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
            <h1 style={{ margin: '6px 0 2px 0', fontSize: '18pt', fontWeight: 900, color: '#003666', letterSpacing: '-0.02em' }}>
              Bioactive Peptide Formulations · Official Price Schedule
            </h1>
            <p style={{ margin: 0, fontSize: '9pt', color: '#64748b' }}>
              Certified Lyophilized Bioactive Vials (10R Borosilicate USP Type I Glass) · Sterile Lyophilization
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '7.5pt',
              fontWeight: 800,
              background: '#e8f0fe',
              color: '#1a73e8',
              border: '1px solid #c2e7ff',
              padding: '3px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {isDistributor ? 'Official Distributor Schedule' : 'Official Wholesaler Schedule'}
            </span>
            <div style={{ fontSize: '8pt', color: '#64748b', marginTop: '4px' }}>
              Ref: ATLAS-B2B-2026-Q4
            </div>
            <div style={{ fontSize: '8pt', fontWeight: 700, color: '#0d9488', marginTop: '2px' }}>
              Purity: ≥99.0% HPLC Certified
            </div>
          </div>
        </div>

        {/* Currency & Quality Notification Bar */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '10px 14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '8.5pt'
        }}>
          <div>
            <strong>Billing Currency:</strong> All prices listed strictly in <strong>{currency} ({currencySymbol})</strong>.
          </div>
          <div style={{ color: '#137333', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={13} />
            <span>100% Analytical COA Included with Batch Release</span>
          </div>
        </div>

        {/* Official Pricing Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', marginBottom: '24px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '8px 10px', textAlign: 'center', width: '35px', fontWeight: 800, color: '#475569' }}>#</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 800, color: '#0f172a' }}>Peptide Active Principle</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', width: '70px', fontWeight: 800, color: '#0f172a' }}>Strength</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', width: '120px', fontWeight: 700, color: '#475569' }}>Therapeutic Class</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', width: '110px', fontWeight: 800, color: '#0f172a' }}>Single Vial (1x)</th>
              <th style={{ padding: '8px 10px', textAlign: 'right', width: '140px', fontWeight: 800, color: '#137333' }}>Box of 10 (Pack ×10)</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', width: '75px', fontWeight: 800, color: '#137333' }}>Box Savings</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => {
              const p10 = p.pack10Price || (p.unitPrice * 10 * 0.85);
              const perUnit = p.tier10UnitPrice || (p.unitPrice * 0.85);
              const discountPct = Math.max(10, Math.round((1 - (p10 / (p.unitPrice * 10))) * 100));

              return (
                <tr
                  key={p.id || idx}
                  style={{
                    borderBottom: '1px solid #e2e8f0',
                    background: idx % 2 === 0 ? '#ffffff' : '#f8fafc'
                  }}
                >
                  <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 750, color: '#0f172a' }}>
                    {p.productName}
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 700, color: '#1a73e8' }}>
                    {p.dosage || '—'}
                  </td>
                  <td style={{ padding: '7px 10px', color: '#64748b', fontSize: '7.8pt' }}>
                    {p?.categoryMeta?.label || p.categoryKey || 'Clinical Peptide'}
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                    {formatPrice(p.unitPrice)}
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 750, color: '#137333' }}>
                    <div>{formatPrice(p10)}</div>
                    <div style={{ fontSize: '7pt', color: '#137333' }}>({formatPrice(perUnit)}/vial)</div>
                  </td>
                  <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '7pt',
                      fontWeight: 800,
                      color: '#137333',
                      background: '#e6f4ea',
                      padding: '1px 5px',
                      borderRadius: '3px'
                    }}>
                      -{discountPct}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Regulatory & Logistics Footer */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '7.5pt',
          color: '#64748b',
          lineHeight: 1.5,
          marginBottom: '20px'
        }}>
          <strong>Regulatory & Quality Assurance Terms:</strong> All peptide vials are manufactured under cGMP standards with certified analytical purity (≥99.0% HPLC). Lyophilized sterile formulations are vacuum-sealed for room-temperature transit stability and dispatched via express medical courier. Official proforma invoice and Certificate of Analysis (COA) are issued upon formal order confirmation.
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '12px', fontSize: '7.5pt', color: '#94a3b8' }}>
          <div>Atlas Health Services Ltd · precision.support@atlashealth-services.com</div>
          <div>https://www.atlashealth-services.com/pricing/peptides</div>
          <div>Page 1 of 1 · Verified Schedule</div>
        </div>
      </div>
    </div>
  );
}

