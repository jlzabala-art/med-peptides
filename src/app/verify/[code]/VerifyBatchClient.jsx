"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function VerifyBatchClient({ code, verification, baseUrl }) {
  const [copied, setCopied] = useState(false);
  const verifyUrl = `${baseUrl}/verify/${encodeURIComponent(code)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(verifyUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      fontFamily: 'Inter, -apple-system, sans-serif',
      padding: '2.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <style>{`
        @media print {
          .verify-no-print { display: none !important; }
          body { background: white !important; }
          .verify-card { box-shadow: none !important; border: 1px solid #94a3b8 !important; }
        }
      `}</style>

      {/* Main Certificate Card */}
      <div className="verify-card" style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Header Ribbon */}
        <div style={{
          backgroundColor: '#003666',
          color: 'white',
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: '#93c5fd', textTransform: 'uppercase' }}>
              Quality Assurance & Certificate of Analysis
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Atlas Health Authenticity Portal
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '999px',
            padding: '0.35rem 0.85rem',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}>
            ISO 9001 / cGMP
          </div>
        </div>

        {/* Verification Success Banner */}
        <div style={{
          backgroundColor: '#f0fdf4',
          borderBottom: '1px solid #bbf7d0',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#22c55e',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(34,197,94,0.3)',
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803d' }}>
              Authentic Clinical Batch Verified
            </div>
            <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '0.15rem' }}>
              Batch code <strong>{code}</strong> matches genuine analytical laboratory release standards.
            </div>
          </div>
        </div>

        {/* Product & Batch Specs */}
        <div style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Product Name</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{verification.productName}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Batch / Lot ID</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#003666', marginTop: '0.2rem', fontFamily: 'monospace' }}>{code}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Manufacturing Date</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginTop: '0.2rem' }}>{verification.mfgDate}</div>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Retest / Expiry</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', marginTop: '0.2rem' }}>{verification.expDate}</div>
            </div>
          </div>

          {/* Test Criteria Table */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              🔬 Analytical Testing Specifications (CoA)
            </h3>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.85rem' }}>Test Item</th>
                    <th style={{ padding: '0.6rem 0.85rem' }}>Result / Specification</th>
                    <th style={{ padding: '0.6rem 0.85rem', textAlign: 'right' }}>Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {verification.standards.map((std, idx) => (
                    <tr key={idx} style={{ borderBottom: idx !== verification.standards.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: '#1e293b' }}>{std.name}</td>
                      <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{std.value}</td>
                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem' }}>
                          ✓ {std.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom QR & Links */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <QRCodeSVG value={verifyUrl} size={64} level="M" />
              <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                <strong>Digital Verification Hash</strong><br />
                Timestamp: {new Date(verification.verifiedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="verify-no-print" style={{ display: 'flex', gap: '0.5rem' }}>
              {verification.productSlug && (
                <Link
                  href={`/p/${verification.productSlug}`}
                  style={{
                    backgroundColor: '#003666',
                    color: 'white',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  📄 View Product Sheet
                </Link>
              )}
              <button
                onClick={handlePrint}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '0.55rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🖨 Print CoA
              </button>
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  padding: '0.55rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied ? '✓ Copied' : '🔗 Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
