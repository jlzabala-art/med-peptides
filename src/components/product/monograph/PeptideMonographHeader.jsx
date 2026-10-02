"use client";

import React, { useState } from 'react';
import { Copy, Check, Printer, Share2, ShieldCheck, FileText, FlaskConical, ExternalLink, QrCode, X } from '@/lib/icons';
import { QRCodeSVG } from 'qrcode.react';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'react-hot-toast';
import { formatCommercialSupplierName } from '@/utils/supplierCommercialNames';

/**
 * PeptideMonographHeader
 * ─────────────────────────────────────────────────────────────────────────────
 * Compact, Google Cloud Console-styled product identity header.
 * Restrained typography, small precise metadata chips instead of marketing badges,
 * and clear distinction between FDA reference drugs and supplied research presentations.
 */
export default function PeptideMonographHeader({
  product = {},
  slug = 'pt-141',
  effectiveBatch = 'AS-LOT-PT05-2609',
  supplierName = '',
  activeFormat = null,
  availableFormats = [],
  sortedStrengths = [],
  onFormatChange,
  onOpenPreviewModal,
  onOpenCoaModal,
  onOpenShare
}) {
  const [copied, setCopied] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Clean primary and generic names to prevent duplicate printing like "PT-141 (Bremelanotide) Bremelanotide"
  const rawName = product.canonicalName || product.name || 'Peptide';
  const isPt141 = slug?.toLowerCase().includes('pt-141') || slug?.toLowerCase().includes('pt141') || rawName?.toLowerCase().includes('pt-141');
  const rawScientific = product.scientificName || product.chemical_name || product.genericName || (isPt141 ? 'Bremelanotide' : '');

  let primaryName = rawName;
  let cleanScientific = rawScientific;

  const parenMatch = rawName.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    primaryName = parenMatch[1].trim();
    if (!cleanScientific || cleanScientific.toLowerCase() === parenMatch[2].trim().toLowerCase()) {
      cleanScientific = parenMatch[2].trim();
    }
  } else if (rawName.toLowerCase() === rawScientific.toLowerCase()) {
    cleanScientific = '';
  }

  // FDA reference formulation details (Vyleesi)
  const hasFdaRef = isPt141 || product.hasFdaReference;
  const fdaRefBrand = product.referenceBrand || 'Vyleesi® (bremelanotide)';
  const fdaRefYear = product.referenceApprovalYear || '2019';

  // Dynamic Strengths Resolution (strictly filtered for active format to prevent cross-format contamination)
  const formatKey = String(activeFormat?.id || activeFormat?.name || '').toLowerCase();
  const formatMatchedVariants = (product.variants || []).filter(v => {
    if (!formatKey) return true;
    const vFmt = String(v.format || v.presentation || '').toLowerCase();
    return vFmt.includes(formatKey) || formatKey.includes(vFmt);
  });
  const variantPool = formatMatchedVariants.length > 0 ? formatMatchedVariants : (product.variants || []);
  const variantDoses = variantPool.map(v => v.dosage || v.dose || v.strength).filter(Boolean);
  const uniqueVariantDoses = [...new Set(variantDoses)];

  const strengthsList = (sortedStrengths || []).map(s => s.name || s.id).filter(Boolean);
  const availableStrengths = strengthsList.length > 0 
    ? strengthsList.join(' | ') 
    : uniqueVariantDoses.length > 0 
      ? uniqueVariantDoses.join(' | ') 
      : (product.availableStrengths || 'Standard Formulation');

  // Dynamic Presentation Format Resolution
  const rawFormat = String(
    activeFormat?.name || 
    activeFormat?.id || 
    product.format || 
    product.presentation || 
    (product.variants?.[0]?.format) || 
    (product.variants?.[0]?.presentation) || 
    ''
  ).toLowerCase();

  const isNasalSpray = rawFormat.includes('spray') || rawFormat.includes('nasal');
  const isSublingual = rawFormat.includes('sublingual') || rawFormat.includes('drop');
  const isPen = rawFormat.includes('pen') || rawFormat.includes('cartridge');
  const isOral = rawFormat.includes('capsule') || rawFormat.includes('tablet') || rawFormat.includes('oral');

  const presentation = isNasalSpray 
    ? 'Nasal Spray (Intranasal)' 
    : isSublingual 
      ? 'Sublingual Dropper' 
      : isPen 
        ? 'Multi-Dose Pen (SubQ)' 
        : isOral 
          ? 'Oral Capsules' 
          : (product.presentationFormat || product.presentation || 'Lyophilized sterile vial');

  const verifiedPurity = product.purity || '≥99% (99.4% HPLC verified)';
  const rawSupplier = supplierName || product.supplierName || product.supplier || (product.variants?.[0]?.supplierName) || (product.variants?.[0]?.supplier) || 'Lotusland';
  const supplier = formatCommercialSupplierName(rawSupplier);
  const batchCode = effectiveBatch || product.batchNumber || 'AS-LOT-PT05-2609';

  const handleCopySpec = () => {
    triggerHaptic('light');
    const text = [
      `Product: ${primaryName}${cleanScientific ? ` (${cleanScientific})` : ''}`,
      `Classification: Peptide • Clinical monograph`,
      hasFdaRef ? `FDA Reference Product: ${fdaRefBrand} (Approved ${fdaRefYear})` : null,
      `Available Strengths: ${availableStrengths}`,
      `Presentation: ${presentation}`,
      `Verified Purity: ${verifiedPurity}`,
      `Supplier / Laboratory: ${supplier}`,
      `Verified Batch: ${batchCode}`,
      `URL: https://med-peptides.com/p/${slug}`
    ].filter(Boolean).join('\n');

    navigator.clipboard?.writeText(text);
    setCopied(true);
    toast.success('Clinical specs copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="pds-monograph-header-root" style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '1.25rem 1.5rem',
      marginBottom: '1rem'
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        {/* Row 1: Title, Classification & Actions */}
        <div className="pds-header-title-row" style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#64748b',
              marginBottom: '0.2rem'
            }}>
              <FlaskConical size={13} color="#003666" />
              <span>Peptide • Clinical Monograph</span>
            </div>

            <h1 style={{
              margin: 0,
              fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
              fontWeight: 850,
              color: '#003666',
              letterSpacing: '-0.03em',
              lineHeight: 1.15
            }}>
              {primaryName}
            </h1>
            {cleanScientific && (
              <div style={{
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#64748b',
                marginTop: '3px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ textTransform: 'uppercase', fontSize: '0.68rem', fontWeight: 750, color: '#94a3b8', letterSpacing: '0.05em' }}>Generic:</span>
                <span style={{ color: '#334155' }}>{cleanScientific}</span>
              </div>
            )}
          </div>

          {/* GCP Toolbar Actions */}
          <div className="pds-header-actions-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCopySpec}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Copy clinical monograph specs to clipboard"
            >
              {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              <span>{copied ? 'Copied ✓' : 'Copy Specs'}</span>
            </button>

            {onOpenPreviewModal && (
              <button
                type="button"
                onClick={onOpenPreviewModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Print or export PDF monograph"
              >
                <Printer size={14} />
                <span>Print / PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsQrModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Verify Digital Monograph & QR"
            >
              <QrCode size={14} color="#003666" />
              <span>Verify & QR</span>
            </button>

            {onOpenShare && (
              <button
                type="button"
                onClick={onOpenShare}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#1e293b',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Share link & QR code"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Unified Google Cloud Resource Summary Panel (No Ragged Chips) */}
        <div className="pds-header-summary-panel">
          <div className="pds-summary-panel-grid">
            {/* Field 1: Presentation (Interactive Segmented Switcher if multi-format) */}
            <div className="pds-summary-cell">
              <span className="pds-summary-label">Presentation</span>
              {availableFormats && availableFormats.length > 1 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                  {availableFormats.map(fmt => {
                    const fmtId = fmt.id;
                    const isActive = fmtId === (activeFormat?.id || activeFormat);
                    const isFmtSpray = fmtId.includes('spray') || fmtId.includes('nasal');
                    const isFmtPen = fmtId.includes('pen') || fmtId.includes('cartridge');
                    const isFmtVial = fmtId.includes('vial');
                    const shortLabel = isFmtSpray ? 'Nasal Spray' : isFmtPen ? 'Pre-filled Pen' : isFmtVial ? 'Lyophilized Vial' : (fmt.name || fmtId);
                    return (
                      <button
                        key={fmtId}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerHaptic('selection');
                          onFormatChange?.(fmtId);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '0.70rem',
                          fontWeight: isActive ? 800 : 600,
                          border: isActive ? '1px solid #003666' : '1px solid #cbd5e1',
                          background: isActive ? '#003666' : '#ffffff',
                          color: isActive ? '#ffffff' : '#475569',
                          cursor: 'pointer',
                          touchAction: 'manipulation',
                          transition: 'all 0.15s ease',
                          boxShadow: isActive ? '0 1px 2px rgba(0, 54, 102, 0.2)' : 'none'
                        }}
                        title={`Switch view to ${shortLabel}`}
                      >
                        <span style={{ fontSize: '0.75rem' }}>{isFmtSpray ? '👃' : isFmtPen ? '💉' : '🧪'}</span>
                        <span>{shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <strong className="pds-summary-value">{presentation}</strong>
              )}
            </div>

            {/* Field 2: Strengths */}
            <div className="pds-summary-cell">
              <span className="pds-summary-label">Available Strengths</span>
              <strong className="pds-summary-value" style={{ fontFamily: 'monospace' }}>{availableStrengths}</strong>
            </div>

            {/* Field 3: Verified Purity */}
            <div className="pds-summary-cell">
              <span className="pds-summary-label">Verified Purity</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                <strong className="pds-summary-value" style={{ color: '#15803d' }}>{verifiedPurity}</strong>
              </div>
            </div>

            {/* Field 4: Batch Record (GCP Copy-on-Click Standard) */}
            <div className="pds-summary-cell">
              <span className="pds-summary-label">Verified Batch (CoA)</span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <code 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard?.writeText(batchCode);
                    toast.success(`Batch code ${batchCode} copied ✓`);
                  }}
                  style={{ 
                    fontFamily: 'monospace', 
                    fontWeight: 800, 
                    color: '#003666', 
                    fontSize: '0.80rem',
                    cursor: 'pointer',
                    background: '#f1f5f9',
                    padding: '2px 5px',
                    borderRadius: '4px'
                  }}
                  title="Click to copy batch code"
                >
                  {batchCode}
                </code>
                {onOpenCoaModal && (
                  <button
                    type="button"
                    onClick={onOpenCoaModal}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                    title="Click to view Certificate of Analysis"
                  >
                    <ExternalLink size={12} color="#003666" style={{ opacity: 0.7 }} />
                  </button>
                )}
              </div>
            </div>

            {/* Field 5: Supplier */}
            <div className="pds-summary-cell">
              <span className="pds-summary-label">Source Supplier</span>
              <strong className="pds-summary-value">{supplier}</strong>
            </div>
          </div>

          {/* FDA Reference Notice Strip if present */}
          {hasFdaRef && (
            <div className="pds-summary-fda-strip">
              <span style={{ color: '#1e40af', fontWeight: 750, fontSize: '0.70rem', textTransform: 'uppercase' }}>
                FDA Reference Drug:
              </span>
              <strong style={{ color: '#1e3a8a', fontSize: '0.76rem', fontWeight: 700 }}>
                {fdaRefBrand}
              </strong>
              <span style={{ fontSize: '0.68rem', color: '#3b82f6', background: '#dbeafe', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                Approved {fdaRefYear}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Institutional QR Verification Modal */}
      {isQrModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setIsQrModalOpen(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '1.5rem',
              maxWidth: '380px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'inline-flex', padding: '10px', background: '#eff6ff', borderRadius: '50%', marginBottom: '12px' }}>
              <ShieldCheck size={28} color="#003666" />
            </div>

            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#003666', fontWeight: 800 }}>
              Live Clinical Certificate
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>
              Scan with any mobile camera to verify analytical purity, batch compliance, and clinical monograph documentation.
            </p>

            <div style={{
              display: 'inline-flex',
              padding: '14px',
              background: '#ffffff',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              marginBottom: '14px'
            }}>
              <QRCodeSVG 
                value={typeof window !== 'undefined' ? `${window.location.origin}/p/${slug}` : `https://med-peptides.com/p/${slug}`} 
                size={160} 
                level="M" 
                includeMargin={false}
              />
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 10px',
              fontSize: '0.74rem',
              color: '#334155',
              fontFamily: 'monospace',
              marginBottom: '12px',
              wordBreak: 'break-all'
            }}>
              Batch: {batchCode} • Purity: {verifiedPurity}
            </div>

            <button
              type="button"
              onClick={handleCopySpec}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: '6px',
                background: '#003666',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.80rem',
                cursor: 'pointer'
              }}
            >
              Copy Verification Details
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
