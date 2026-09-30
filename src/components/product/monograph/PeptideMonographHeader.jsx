"use client";

import React, { useState } from 'react';
import { Copy, Check, Printer, Share2, ShieldCheck, FileText, FlaskConical, ExternalLink } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'react-hot-toast';

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
  onOpenPreviewModal,
  onOpenCoaModal,
  onOpenShare
}) {
  const [copied, setCopied] = useState(false);

  // Clean primary and generic names to prevent duplicate printing like "PT-141 (Bremelanotide) Bremelanotide"
  const rawName = product.canonicalName || product.name || 'PT-141';
  const rawScientific = product.scientificName || product.chemical_name || 'Bremelanotide';

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

  const isPt141 = slug?.toLowerCase().includes('pt-141') || slug?.toLowerCase().includes('pt141') || primaryName?.toLowerCase().includes('pt-141');

  // FDA reference formulation details (Vyleesi)
  const hasFdaRef = isPt141 || product.hasFdaReference;
  const fdaRefBrand = product.referenceBrand || 'Vyleesi® (bremelanotide)';
  const fdaRefYear = product.referenceApprovalYear || '2019';

  // Quality & Presentation metadata
  const availableStrengths = product.availableStrengths || '5 mg | 10 mg | 20 mg';
  const presentation = product.presentationFormat || 'Lyophilized vial';
  const verifiedPurity = product.purity || '≥99% (99.4% HPLC verified)';
  const supplier = product.supplierName || 'Lotusland';
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
            {/* Field 1: Presentation */}
            <div className="pds-summary-cell">
              <span className="pds-summary-label">Presentation</span>
              <strong className="pds-summary-value">{presentation}</strong>
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

            {/* Field 4: Batch Record */}
            <div className="pds-summary-cell">
              <span className="pds-summary-label">Verified Batch (CoA)</span>
              <div
                onClick={onOpenCoaModal}
                role={onOpenCoaModal ? "button" : undefined}
                tabIndex={onOpenCoaModal ? 0 : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: onOpenCoaModal ? 'pointer' : 'default'
                }}
                title={onOpenCoaModal ? "Click to view Certificate of Analysis" : undefined}
              >
                <code style={{ fontFamily: 'monospace', fontWeight: 800, color: '#003666', fontSize: '0.80rem' }}>
                  {batchCode}
                </code>
                {onOpenCoaModal && (
                  <ExternalLink size={12} color="#003666" style={{ opacity: 0.7 }} />
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
    </header>
  );
}
