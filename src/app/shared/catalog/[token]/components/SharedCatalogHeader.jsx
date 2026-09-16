'use client';

import React from 'react';
import { Download, ClipboardList } from 'lucide-react';
import Interactive3DScanCard from '@/components/catalog/Interactive3DScanCard';
import PharmaBarcodeStamp from '@/components/catalog/PharmaBarcodeStamp';

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
  return (
    <>
      {/* Executive Header Card with Dynamic Pharma Margin Theme & Optimized Laptop Layout */}
      <div
        className="header-card"
        style={{
          background: pharmaMarginTheme.gradient,
          border: `1px solid ${pharmaMarginTheme.borderColor}`,
          boxShadow: `0 12px 32px -6px rgba(0, 0, 0, 0.38), 0 0 20px ${pharmaMarginTheme.glow}`
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
                color: pharmaMarginTheme.accentColor,
                backgroundColor: pharmaMarginTheme.pillBg,
                border: `1px solid ${pharmaMarginTheme.borderColor}`,
                padding: '3px 10px',
                borderRadius: '12px',
                letterSpacing: '0.02em'
              }}>
                {isProtocolCatalog ? 'Peptides & Protocols' : pharmaMarginTheme.tierLabel}
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
              <span className="header-meta-pill" style={{ borderColor: pharmaMarginTheme.borderColor, color: pharmaMarginTheme.accentColor }}>
                🏷️ {priceTierLabel} ({pharmaMarginTheme.tierCode})
              </span>
              <span className="header-meta-pill pill-full">
                {isProtocolCatalog
                  ? `📋 ${protocols.length} Clinical Protocols`
                  : `📦 ${products.length} Products • ${totalVariants} Verified Variants`}
              </span>
              {protocols.length > 0 && !isProtocolCatalog && (
                <button
                  type="button"
                  onClick={() => setShowProtocolsUnderProducts(prev => !prev)}
                  className="header-meta-pill"
                  style={{
                    background: showProtocolsUnderProducts ? 'rgba(167, 139, 250, 0.28)' : 'rgba(255, 255, 255, 0.12)',
                    borderColor: showProtocolsUnderProducts ? '#a78bfa' : 'rgba(255, 255, 255, 0.2)',
                    color: showProtocolsUnderProducts ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer'
                  }}
                  title="Toggle public clinical protocol links under catalog products"
                >
                  📋 Protocols: {showProtocolsUnderProducts ? 'Enabled ✓' : 'Hidden'}
                </button>
              )}
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
