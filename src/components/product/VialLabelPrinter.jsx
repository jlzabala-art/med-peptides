/* eslint-disable no-unused-vars */
import { useRef } from 'react';
import { Printer, X } from 'lucide-react';

/**
 * VialLabelPrinter
 * Renders a print-optimised 2×1-inch vial label and triggers the browser print dialog.
 *
 * Props:
 *  - product        {object}      — full product record
 *  - selectedVariant {object|null} — currently selected variant
 *  - onClose        {function}    — close handler (for modal mode)
 */
export default function VialLabelPrinter({ product, selectedVariant, onClose }) {
  const labelRef = useRef(null);

  if (!product) return null;

  const variantDosage = selectedVariant?.dosage || selectedVariant?.strength || product.dosage || '';
  const storageTemp   = product.storage_conditions?.dry || '−20°C to −80°C';
  const mw            = product.molecular_weight ? `MW: ${product.molecular_weight} Da` : null;
  const lot           = `LOT-${new Date().getFullYear()}-${(product.id || product.name || '').slice(0, 4).toUpperCase()}`;
  const productUrl    = `https://Med-Peptides-app-27a3a.web.app/product/${product.slug || product.name?.toLowerCase().replace(/\s+/g, '-')}`;

  const handlePrint = () => {
    const printStyle = `
      @media print {
        body * { visibility: hidden !important; }
        #vial-label-root, #vial-label-root * { visibility: visible !important; }
        #vial-label-root {
          position: fixed !important;
          top: 0 !important; left: 0 !important;
          width: 2in !important; height: 1in !important;
          margin: 0 !important; padding: 0 !important;
          page-break-after: always !important;
        }
        @page { size: 2in 1in; margin: 0; }
      }
    `;
    const styleEl = document.createElement('style');
    styleEl.id = 'vial-label-print-style';
    styleEl.innerHTML = printStyle;
    document.head.appendChild(styleEl);
    window.print();
    setTimeout(() => document.getElementById('vial-label-print-style')?.remove(), 1500);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      <div style={{
        background: 'white', borderRadius: '20px', padding: '2rem',
        width: '100%', maxWidth: '420px', margin: '1rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column', gap: '1.5rem',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: '8px', background: 'rgba(0,54,102,0.08)', color: 'var(--primary)' }}>
              <Printer size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>Vial Label Printer</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>2×1 inch · Standard vial label</div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Label Preview */}
        <div style={{
          border: '2px dashed var(--border)',
          borderRadius: '12px',
          padding: '1rem',
          background: 'var(--color-bg-app)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* 2×1 inch label at 96dpi = 192×96px for on-screen preview */}
          <div
            id="vial-label-root"
            ref={labelRef}
            style={{
              width: '192px',
              height: '96px',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              background: 'white',
              padding: '5px 7px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: "'Inter', system-ui, sans-serif",
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top stripe */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            }} />

            {/* Content */}
            <div style={{ marginTop: '5px' }}>
              <div style={{ fontWeight: 900, fontSize: '9px', color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                {product.name}
              </div>
              {variantDosage && (
                <div style={{ fontSize: '7.5px', fontWeight: 700, color: 'var(--primary)', marginTop: '1px' }}>
                  {variantDosage}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {/* Bottom-left info */}
              <div>
                {mw && (
                  <div style={{ fontSize: '6px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{mw}</div>
                )}
                <div style={{ fontSize: '6px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Store: {storageTemp}
                </div>
                <div style={{ fontSize: '6px', color: 'var(--color-text-tertiary)' }}>{lot}</div>
                <div style={{ fontSize: '5.5px', color: 'var(--color-text-tertiary)', marginTop: '1px' }}>
                  FOR IN-VITRO RESEARCH ONLY
                </div>
              </div>

              {/* QR Code placeholder (visual indicator) */}
              <div style={{
                width: '30px', height: '30px',
                border: '1.5px solid #e2e8f0',
                borderRadius: '3px',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gridTemplateRows: 'repeat(5, 1fr)',
                gap: '1px',
                padding: '2px',
                background: 'white',
                flexShrink: 0,
              }}>
                {/* Stylised QR pattern for preview */}
                {[1,1,1,0,1, 1,0,1,1,0, 1,0,1,0,1, 0,1,0,1,1, 1,1,0,0,1].map((v, i) => (
                  <div key={i} style={{ background: v ? '#0f172a' : 'white', borderRadius: '0.5px' }} />
                ))}
              </div>
            </div>

            {/* Bottom stripe */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
              background: 'var(--primary)',
              opacity: 0.3,
            }} />
          </div>
        </div>

        {/* Info row */}
        <div style={{
          display: 'flex', gap: '0.5rem',
          padding: '0.75rem',
          background: 'rgba(0,163,224,0.04)',
          borderRadius: '10px',
          border: '1px solid rgba(0,163,224,0.15)',
        }}>
          <Printer size={14} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Set your printer to <strong>2×1 inch label stock</strong> (e.g. Avery 5167 / Dymo 99010).
            The label will auto-scale to fit.
          </div>
        </div>

        {/* Print button */}
        <button
          onClick={handlePrint}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
            width: '100%', padding: '0.9rem',
            background: 'var(--primary)', color: 'white',
            border: 'none', borderRadius: '12px',
            fontWeight: 800, fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,54,102,0.25)',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,54,102,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,54,102,0.25)'; }}
        >
          <Printer size={16} />
          Print Vial Label
        </button>
      </div>
    </div>
  );
}
