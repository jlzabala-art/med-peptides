'use client';

import React, { useState } from 'react';
import { Download, ShieldCheck, QrCode, Copy, Check, ExternalLink, FileText, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/** Returns { daysLeft, urgency, expiresAt } */
function useValidityCountdown(catalogMeta) {
  return React.useMemo(() => {
    const validityDays = Number(catalogMeta?.validityDays) || 0;
    if (!validityDays || (!catalogMeta?.issuedAt && !catalogMeta?.iat)) return null;
    const issuedAt = new Date(catalogMeta.issuedAt || catalogMeta.iat);
    const expiresAt = new Date(issuedAt.getTime() + validityDays * 24 * 60 * 60 * 1000);
    const daysLeft = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    let urgency = 'ok';
    if (daysLeft <= 0)  urgency = 'expired';
    else if (daysLeft <= 3)  urgency = 'critical';
    else if (daysLeft <= 10) urgency = 'warning';
    return { daysLeft, urgency, expiresAt };
  }, [catalogMeta]);
}

const URGENCY_STYLES = {
  ok:       { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
  warning:  { bg: '#fefce8', border: '#fef08a', color: '#a16207' },
  critical: { bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' },
  expired:  { bg: '#f8fafc', border: '#e2e8f0', color: '#64748b' },
};

/**
 * SharedCatalogHeader — Neutral, Professional Google Cloud UX Hero Card.
 * Matches PublicDatasheetView and PublicProtocolPage hero architecture:
 *  - Crisp white surface, 1px light border, refined typography.
 *  - Institutional verification badges & validity countdown.
 *  - Clean GCP console action buttons (Download PDF, Copy Link).
 *  - QR Code verification module on desktop + inline verification bar on mobile.
 *  - Removed the bulky products/protocols tab switch.
 */
export default function SharedCatalogHeader({
  pharmaMarginTheme,
  catalogMeta,
  products = [],
  protocols = [],
  totalVariants = 0,
  priceTierLabel = '',
  isGeneratingPdf = false,
  handleDownloadPdf,
  catalogCode,
  batchCode,
  shareUrl,
  t = (k, f) => f || k,
}) {
  const validity = useValidityCountdown(catalogMeta);
  const [copied, setCopied] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const rawRecipientName = catalogMeta?.recipientName || '';
  const isWholesaler = catalogMeta?.recipientType === 'wholeseller' || catalogMeta?.recipientType === 'wholesaler';
  const cleanRecipientName = isWholesaler && rawRecipientName.includes('·')
    ? rawRecipientName.split('·')[0].trim()
    : (isWholesaler && rawRecipientName.includes(' • ') ? rawRecipientName.split(' • ')[0].trim() : rawRecipientName);

  const verifiedCode = batchCode || catalogCode || 'RP-CATALOG';
  const activeShareUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(activeShareUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error('Failed to copy share URL:', e);
    }
  };

  const handleCopyCode = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(verifiedCode);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <>
      {/* ── Neutral Google Cloud UX Page Hero Card ── */}
      <section
        className="pds-hero-card"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.4rem 1.65rem',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          marginBottom: '1rem'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1.5rem',
          flexWrap: 'wrap'
        }}>
          
          {/* Left / Main Column */}
          <div style={{ flex: '1 1 600px', minWidth: 0 }}>
            
            {/* Badges Strip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '0.65rem'
            }}>
              <span style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '9999px',
                padding: '2px 9px',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                {isWholesaler ? 'WHOLESALE CATALOG' : 'CLINICAL CATALOG'}
              </span>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                borderRadius: '9999px',
                padding: '2px 9px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                <ShieldCheck size={12} color="#16a34a" />
                <span>Dual-Stage RP-HPLC & LC-MS Certified</span>
              </span>

              {/* Date / Validity badge */}
              <span style={{
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '9999px',
                padding: '2px 9px',
                fontSize: '0.70rem',
                fontWeight: 600
              }}>
                📅 {catalogMeta?.issuedAt || catalogMeta?.iat
                  ? new Date(catalogMeta.issuedAt || catalogMeta.iat).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>

              {validity && (
                <span
                  style={{
                    backgroundColor: URGENCY_STYLES[validity.urgency].bg,
                    borderColor: URGENCY_STYLES[validity.urgency].border,
                    color: URGENCY_STYLES[validity.urgency].color,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius: '9999px',
                    padding: '2px 9px',
                    fontSize: '0.70rem',
                    fontWeight: 700
                  }}
                >
                  ⏳ {validity.daysLeft > 0 ? `Valid for ${validity.daysLeft} days` : 'Terms under review'}
                </span>
              )}

              <span style={{
                background: '#eff6ff',
                color: '#003666',
                border: '1px solid #bfdbfe',
                borderRadius: '9999px',
                padding: '2px 9px',
                fontSize: '0.70rem',
                fontWeight: 700
              }}>
                📦 {products.length} Formulations • {totalVariants || products.length} SKUs
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              margin: '0 0 0.45rem 0',
              fontSize: '1.95rem',
              fontWeight: 800,
              color: '#003666',
              letterSpacing: '-0.025em',
              lineHeight: 1.2
            }}>
              {cleanRecipientName
                ? (isWholesaler
                    ? `Wholesale Peptide Catalog • ${cleanRecipientName}`
                    : `Clinical Peptide Catalog • ${cleanRecipientName}`)
                : 'Clinical Peptide Catalog'}
            </h1>

            {/* Description */}
            <p style={{
              margin: '0 0 1rem 0',
              fontSize: '0.90rem',
              color: '#475569',
              lineHeight: 1.55,
              maxWidth: '680px'
            }}>
              Analytical-grade lyophilized peptide vials, multi-dose presentations, and standardized therapeutic protocols. Verified direct delivery terms for authorized healthcare institutions.
            </p>

            {/* Action Buttons Strip (GCP Style) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#003666',
                  color: '#ffffff',
                  border: '1px solid #002244',
                  borderRadius: '8px',
                  padding: '7px 16px',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  cursor: isGeneratingPdf ? 'wait' : 'pointer',
                  boxShadow: '0 1px 3px rgba(0, 54, 102, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Download size={14} />
                <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Catalog (PDF)'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
                title="Copy direct web link to this catalog"
              >
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} color="#64748b" />}
                <span>{copied ? 'Link Copied ✓' : 'Copy Catalog Link'}</span>
              </button>
            </div>

            {/* Mobile Verification Bar (< 768px) */}
            <div className="catalog-mobile-verification-bar" style={{
              marginTop: '1rem',
              padding: '0.65rem 0.85rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <ShieldCheck size={15} color="#003666" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>
                  Batch Verified:
                </span>
                <code style={{ fontSize: '0.70rem', color: '#003666', background: '#eff6ff', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {verifiedCode}
                </code>
              </div>

              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#003666',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <QrCode size={13} />
                <span>View QR</span>
              </button>
            </div>

          </div>

          {/* Right Column: Clean Neutral QR Verification Box (Desktop ≥ 768px) */}
          <div className="catalog-desktop-qr-box" style={{
            flexShrink: 0,
            width: '160px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '5px'
          }}>
            <div
              onClick={() => setIsQrModalOpen(true)}
              style={{
                cursor: 'pointer',
                padding: '4px',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #f1f5f9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease'
              }}
              title="Click to enlarge QR code"
            >
              <QRCodeSVG value={activeShareUrl} size={110} level="M" />
            </div>

            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <ShieldCheck size={12} color="#003666" />
              <span>Verified Catalog</span>
            </div>

            <div style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 600 }}>
              Scan for live app
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              style={{
                marginTop: '4px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                fontWeight: 800,
                color: '#003666',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                width: '100%',
                justifyContent: 'center'
              }}
              title="Copy verified batch code"
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{verifiedCode}</span>
              <Copy size={10} color="#64748b" />
            </button>
          </div>

        </div>
      </section>

      {/* ── QR Enlarge Modal ── */}
      {isQrModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            onClick={() => setIsQrModalOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'relative',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '360px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#003666', fontWeight: 800, fontSize: '0.95rem' }}>
              <ShieldCheck size={18} />
              <span>Verified Institutional Catalog</span>
            </div>

            <div style={{ padding: '12px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <QRCodeSVG value={activeShareUrl} size={200} level="H" />
            </div>

            <div style={{ fontSize: '0.80rem', color: '#475569', lineHeight: 1.4 }}>
              Scan with mobile camera to open and synchronize this real-time catalog.
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              fontWeight: 800,
              color: '#003666'
            }}>
              {verifiedCode}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
