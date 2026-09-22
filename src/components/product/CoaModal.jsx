"use client";

import React, { useEffect } from 'react';
import { generateCoaData } from '@/services/coaGeneratorService';
import { ShieldCheck, FileText, Printer, X, CheckCircle2 } from '@/lib/icons';

/**
 * CoaModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Certificate of Analysis (COA) Viewer & Printable Document.
 * Fully responsive on Mobile and Laptop with clean Vanilla CSS / print styles.
 */
export default function CoaModal({ product, variant, isOpen, onClose }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const coa = generateCoaData(product, variant);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '12px',
        overflowY: 'auto'
      }}
      onClick={onClose}
      data-print-modal="true"
    >
      {/* Modal Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Bar (Hidden on print) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: '#003666',
            color: '#ffffff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            flexShrink: 0
          }}
          data-print-hide="true"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="#38bdf8" />
            <span style={{ fontWeight: 800, fontSize: '0.90rem', letterSpacing: '0.02em' }}>
              Certificate of Analysis (COA) Preview
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s'
              }}
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                border: 'none',
                cursor: 'pointer'
              }}
              title="Close Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          id="printable-coa-document"
          style={{
            padding: '24px',
            overflowY: 'auto',
            fontSize: '12px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
          data-print-body="true"
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #0f172a',
              paddingBottom: '16px',
              gap: '12px',
              marginBottom: '20px'
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                {coa.company}
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 600 }}>
                Analytical Chemistry & Quality Release Laboratory • {coa.labStandard}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: '#0f172a', color: '#ffffff', fontFamily: 'monospace', fontWeight: 800, fontSize: '11px' }}>
                {coa.documentId}
              </span>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
                Date: {coa.signedDate}
              </div>
            </div>
          </div>

          {/* Product Meta Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px'
            }}
          >
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Product Name</span>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{coa.productName}</strong>
            </div>
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Batch / Lot #</span>
              <strong style={{ fontSize: '13px', color: '#003666', fontFamily: 'monospace' }}>{coa.lotNumber}</strong>
            </div>
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Molecular Mass</span>
              <span style={{ fontSize: '12px', color: '#334155', fontFamily: 'monospace', fontWeight: 700 }}>{coa.molecularWeight}</span>
            </div>
            <div>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>CAS Registry</span>
              <span style={{ fontSize: '12px', color: '#334155', fontFamily: 'monospace', fontWeight: 700 }}>{coa.casNumber}</span>
            </div>
          </div>

          {/* Analytical Release Specifications */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 10px 0' }}>
              <ShieldCheck size={16} color="#0d9488" />
              <span>Release Test Results & Specifications</span>
            </h2>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>Test Parameter</th>
                    <th style={{ padding: '8px 12px' }}>Release Specification</th>
                    <th style={{ padding: '8px 12px' }}>Observed Result</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {coa.tests.map((t, idx) => (
                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{t.parameter}</td>
                      <td style={{ padding: '8px 12px', color: '#475569', fontFamily: 'monospace', fontSize: '10px' }}>{t.specification}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>{t.result}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 900, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conclusion & Quality Seal */}
          <div
            style={{
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            <div style={{ flex: 1, minWidth: '220px' }}>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Quality Disposition</span>
              <p style={{ color: '#334155', fontSize: '11px', margin: '4px 0', lineHeight: 1.4, fontWeight: 500 }}>
                {coa.conclusion}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 800, fontSize: '11px', marginTop: '6px' }}>
                <CheckCircle2 size={14} />
                <span>Dual-Stage RP-HPLC Release Verified</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 800, fontSize: '15px', color: '#1e293b', display: 'block' }}>
                  Elena Vance
                </span>
                <span style={{ fontWeight: 800, fontSize: '11px', color: '#0f172a', display: 'block' }}>
                  {coa.qaOfficer}
                </span>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>
                  {coa.qaTitle}
                </span>
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  border: '2px solid #003666',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '8px', fontFamily: 'monospace', fontWeight: 900, textTransform: 'uppercase', color: '#003666' }}>QA SEAL</div>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#0d9488', margin: '2px 0' }}>[VERIFIED]</div>
                <div style={{ fontSize: '7px', fontFamily: 'monospace', color: '#64748b' }}>{coa.signedDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
