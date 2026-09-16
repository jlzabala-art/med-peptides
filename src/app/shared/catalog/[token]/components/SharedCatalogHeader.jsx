'use client';

import React from 'react';
import { Download, ClipboardList, Clock } from 'lucide-react';
import Interactive3DScanCard from '@/components/catalog/Interactive3DScanCard';
import PharmaBarcodeStamp from '@/components/catalog/PharmaBarcodeStamp';

/** Returns { daysLeft, urgency } where urgency is 'ok' | 'warning' | 'critical' | 'expired' */
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
  ok:       { bg: 'rgba(34,197,94,0.18)',  border: '#4ade80', color: '#bbf7d0' },
  warning:  { bg: 'rgba(234,179,8,0.22)',  border: '#fde047', color: '#fef08a' },
  critical: { bg: 'rgba(239,68,68,0.22)',  border: '#f87171', color: '#fecaca' },
  expired:  { bg: 'rgba(100,116,139,0.2)', border: '#94a3b8', color: '#cbd5e1' },
};

const DEFAULT_PHARMA_MARGIN_THEME = {
  tierCode: 'INSTITUTIONAL',
  tierLabel: 'Lyophilized Formulations',
  gradient: 'linear-gradient(135deg, #00284d 0%, #004d80 50%, #003366 100%)',
  borderColor: 'rgba(255, 255, 255, 0.2)',
  glow: 'rgba(0, 0, 0, 0.2)',
  accentColor: '#93c5fd',
  pillBg: 'rgba(255, 255, 255, 0.12)',
};

/**
 * SharedCatalogHeader — Executive header card with dynamic pharma margin theme,
 * 3D holographic QR scan card, PDF download button, and protocol toggle.
 * Theme gradient changes based on the active pricing tier (margin %).
 */
export default function SharedCatalogHeader({
  pharmaMarginTheme,
  isProtocolCatalog,
  catalogMeta,
  products,
  protocols,
  totalVariants,
  priceTierLabel,
  isGeneratingPdf,
  handleDownloadPdf,
  catalogCode,
  batchCode,
  shareUrl,
  showProtocolsUnderProducts,
  setShowProtocolsUnderProducts,
  setActiveTab,
}) {
  const validity = useValidityCountdown(catalogMeta);
  const theme = pharmaMarginTheme || DEFAULT_PHARMA_MARGIN_THEME;
  return (
    <>
      {/* Executive Header Card with Dynamic Pharma Margin Theme & Optimized Laptop Layout */}
      <div
        className="header-card"
        style={{
          background: theme.gradient,
          border: `1px solid ${theme.borderColor}`,
          boxShadow: `0 12px 32px -6px rgba(0, 0, 0, 0.38), 0 0 20px ${theme.glow}`
        }}
      >
        <div className="header-card-inner">
          <div className="header-card-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.2, color: '#ffffff' }}>
                Official Clinical Peptide Catalog
              </h1>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                color: theme.accentColor,
                backgroundColor: theme.pillBg,
                border: `1px solid ${theme.borderColor}`,
                padding: '3px 10px',
                borderRadius: '12px',
                letterSpacing: '0.02em'
              }}>
                {isProtocolCatalog ? 'Peptides & Protocols' : theme.tierLabel}
              </span>
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: '#e0f2fe', lineHeight: 1.4, maxWidth: '580px' }}>
              Analytical-grade lyophilized peptide vials, multi-dose presentations, and standardized therapeutic protocols. Verified direct delivery terms for authorized healthcare institutions.
            </p>

            <div className="header-meta-container">
              <span className="header-meta-pill">
                📅 {catalogMeta.issuedAt || catalogMeta.iat
                  ? new Date(catalogMeta.issuedAt || catalogMeta.iat).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
              <span className="header-meta-pill" style={{ borderColor: theme.borderColor, color: theme.accentColor }}>
                🏷️ {priceTierLabel} ({theme.tierCode})
              </span>
              {/* Validity countdown pill */}
              {validity && (
                <span
                  className="header-meta-pill"
                  title={`Prices valid until ${validity.expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}
                  style={{
                    backgroundColor: URGENCY_STYLES[validity.urgency].bg,
                    borderColor: URGENCY_STYLES[validity.urgency].border,
                    color: URGENCY_STYLES[validity.urgency].color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    animation: validity.urgency === 'critical' ? 'pulse 2s infinite' : 'none',
                  }}
                >
                  <Clock size={11} />
                  {validity.urgency === 'expired'
                    ? 'Prices Expired'
                    : validity.daysLeft === 1
                    ? 'Prices valid for 1 day'
                    : `Prices valid for ${validity.daysLeft} days`}
                </span>
              )}
              <span className="header-meta-pill pill-full">
                {isProtocolCatalog
                  ? `📋 ${protocols.length} Clinical Protocols`
                  : `📦 ${products.length} Products • ${totalVariants} Verified Variants`}
              </span>
            </div>
          </div>

          <div className="header-card-actions">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              style={{
                backgroundColor: '#ffffff',
                color: '#00284d',
                border: 'none',
                borderRadius: '10px',
                padding: '11px 18px',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: isGeneratingPdf ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Download size={16} />
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF'}</span>
            </button>
            <PharmaBarcodeStamp catalogCode={catalogCode} batchCode={batchCode} theme="dark" width={195} height={24} />
          </div>

          {/* 3D Holographic Interactive Scan Card */}
          <div className="header-card-qr">
            <Interactive3DScanCard url={shareUrl} catalogCode={catalogCode} batchCode={batchCode} recipientName={catalogMeta?.recipientName} />
          </div>
        </div>
      </div>

      {/* View Switcher Tabs (Only if dedicated protocol catalog) */}
      {isProtocolCatalog && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('protocols')}
            className="tab-button active"
          >
            <ClipboardList size={16} />
            <span>Clinical Protocols ({protocols.length})</span>
          </button>
        </div>
      )}
    </>
  );
}
