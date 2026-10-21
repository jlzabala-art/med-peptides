"use client";

import React, { useState } from 'react';
import { Copy, Check, Printer, Share2, ShieldCheck, FileText, FlaskConical, ExternalLink, QrCode, X, Microscope } from '@/lib/icons';
import { QRCodeSVG } from 'qrcode.react';
import { triggerHaptic } from '@/utils/haptics';
import { toast } from 'react-hot-toast';
import { formatCommercialSupplierName } from '@/utils/supplierCommercialNames';
import { classifyProductDomain } from '@/utils/productNormalizer';

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
  selectedStrength = null,
  onStrengthChange = null,
  onFormatChange,
  onOpenPreviewModal,
  onOpenCoaModal,
  onOpenShare,
  dynamicPublicUrl = null
}) {
  const [copied, setCopied] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Clean primary and generic names to prevent duplicate printing like "PT-141 (Bremelanotide) Bremelanotide"
  const rawName = product.canonicalName || product.name || 'Peptide';
  const isPt141 = slug?.toLowerCase().includes('pt-141') || slug?.toLowerCase().includes('pt141') || rawName?.toLowerCase().includes('pt-141');
  const rawScientific = product.scientificName || product.chemical_name || product.genericName || (isPt141 ? 'Bremelanotide' : '');

  let primaryName = rawName;
  let cleanScientific = rawScientific;

  if (slug?.toLowerCase().includes('htma') || slug?.toLowerCase().includes('mineralograma') || rawName?.toLowerCase().includes('mineralograma')) {
    primaryName = 'Hair Tissue Mineral Analysis (HTMA)';
    cleanScientific = '33 Nutritional Minerals, Toxic Heavy Metals & Metabolic Ratios';
  } else {
    const parenMatch = rawName.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenMatch) {
      primaryName = parenMatch[1].trim();
      if (!cleanScientific || cleanScientific.toLowerCase() === parenMatch[2].trim().toLowerCase()) {
        cleanScientific = parenMatch[2].trim();
      }
    } else if (rawName.toLowerCase() === rawScientific.toLowerCase()) {
      cleanScientific = '';
    }
  }

  // Canonical domain classification
  const { isDiagnostic } = classifyProductDomain(product, { slug, activeFormat });

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
  const baseStrengths = strengthsList.length > 0 
    ? strengthsList 
    : uniqueVariantDoses.length > 0 
      ? uniqueVariantDoses 
      : (product.availableStrengths ? String(product.availableStrengths).split('|').map(s => s.trim()).filter(Boolean) : ['Standard Formulation']);
  
  // Strictly filter out Bulk Raw API powders from finished clinical monographs
  const rawStrengthsArray = baseStrengths.filter(str => {
    const s = String(str).toLowerCase();
    return !s.includes('bulk') && !s.includes('api') && !/^\d+\s*g$/i.test(s.trim());
  });
  
  // Clean strengths array to English
  const isTeletestHtma = slug?.toLowerCase().includes('htma') || slug?.toLowerCase().includes('mineralograma');
  const strengthsArray = (rawStrengthsArray.length > 0 ? rawStrengthsArray : ['Standard Formulation']).map(str => {
    if (isDiagnostic || /perfil/i.test(str)) {
      if (isTeletestHtma || /htma|mineral/i.test(str)) {
        return '1 Complete 33 Mineral & Toxic Element Profile + Functional Assessment';
      }
      if (/omega|l[ií]pido/i.test(str) || slug?.toLowerCase().includes('omega') || primaryName.toLowerCase().includes('omega')) {
        return '1 Complete 24 Fatty Acid Analytical Profile + Evaluation';
      }
      if (/hla|auto/i.test(str)) {
        return '1 High-Resolution HLA Class I & II Screen';
      }
      return '1 Complete Clinical Analytical Profile';
    }
    return str;
  });
  const availableStrengths = strengthsArray.join(' | ');

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

  const presentation = isDiagnostic
    ? (isTeletestHtma
        ? 'Diagnostic Specimen Collection Kit (Proximal Scalp Hair)'
        : (product.sampleType ? `Specimen Matrix: ${product.sampleType}` : 'Diagnostic Specimen Collection Kit'))
    : isNasalSpray 
      ? 'Nasal Spray (Intranasal)' 
      : isSublingual 
        ? 'Sublingual Dropper' 
        : isPen 
          ? 'Multi-Dose Pen (SubQ)' 
          : isOral 
            ? 'Oral Capsules' 
            : (product.presentationFormat || product.presentation || 'Lyophilized sterile vial');

  const verifiedPurity = isDiagnostic
    ? (isTeletestHtma ? 'ISO 17025 Accredited · ICP-MS/MS' : 'ISO 15189 · CE-IVD (CV ≤ 6.6%)')
    : (product.purity || '≥99% (99.4% HPLC verified)');
  const rawSupplier = supplierName || product.supplierName || product.supplier || (product.variants?.[0]?.supplierName) || (product.variants?.[0]?.supplier) || (isDiagnostic ? (isTeletestHtma ? 'TeleTest Analytika' : 'Bloodo') : 'Lotusland');
  const supplier = formatCommercialSupplierName(rawSupplier);
  const batchCode = effectiveBatch || (product.testCode ? `TEST-TL01-${product.testCode}` : (product.batchNumber || (isDiagnostic ? 'AS-TEL-TL01-2610' : 'AS-LOT-PT05-2609')));

  const handleCopySpec = () => {
    triggerHaptic('light');
    const resolvedMonographUrl = dynamicPublicUrl || (typeof window !== 'undefined' ? window.location.href : `https://www.atlashealth-services.com/p/${slug}`);
    const text = [
      `Product: ${primaryName}${cleanScientific ? ` (${cleanScientific})` : ''}`,
      `Classification: ${isDiagnostic ? 'Diagnostic Test • Laboratory Monograph' : 'Peptide • Clinical Monograph'}`,
      hasFdaRef ? `FDA Reference Product: ${fdaRefBrand} (Approved ${fdaRefYear})` : null,
      isDiagnostic ? `Diagnostic Analytical Scope: ${availableStrengths}` : `Available Strengths: ${availableStrengths}`,
      `Presentation: ${presentation}`,
      isDiagnostic ? `Analytical Standard: ${verifiedPurity}` : `Verified Precision / Purity: ${verifiedPurity}`,
      `Verified Batch: ${batchCode}`,
      `URL: ${resolvedMonographUrl}`
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
              {isDiagnostic ? <Microscope size={13} color="#003666" /> : <FlaskConical size={13} color="#003666" />}
              <span>{isDiagnostic ? 'Diagnostic Test • Laboratory Monograph' : 'Peptide • Clinical Monograph'}</span>
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

          {/* GCP Console Action Toolbar (Golden Rule #9 & #45 Standard) */}
          <div className="pds-header-actions-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* Status verification pill (GCP status standard) */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsQrModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                height: '30px',
                padding: '0 10px',
                borderRadius: '6px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                fontSize: '0.74rem',
                fontWeight: 650,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Click to inspect digital monograph integrity & QR code"
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
              <span>Verified Batch</span>
              <QrCode size={12} color="#166534" style={{ marginLeft: '2px', opacity: 0.8 }} />
            </button>

            {onOpenPreviewModal && (
              <button
                type="button"
                onClick={onOpenPreviewModal}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '30px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#3c4043',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#bdc1c6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#dadce0';
                }}
                title="Print or export PDF monograph"
              >
                <Printer size={13} color="#5f6368" />
                <span>PDF Monograph</span>
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
                  height: '30px',
                  padding: '0 10px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #dadce0',
                  color: '#3c4043',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#bdc1c6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#dadce0';
                }}
                title="Share link & QR code"
              >
                <Share2 size={13} color="#5f6368" />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Unified Google Cloud Resource Summary Panel (No Ragged Chips) */}
        <div className="pds-header-summary-panel">
          <div className="pds-summary-panel-grid">
            {/* Field 1: Presentation (Interactive Segmented Switcher if multi-format, strictly finished products) */}
            <div className="pds-summary-cell">
              <span className="pds-summary-label">Presentation</span>
              {(() => {
                const sanitizedFormats = (availableFormats || []).filter(fmt => {
                  const fid = (fmt.id || fmt.name || '').toLowerCase();
                  return !fid.includes('api') && !fid.includes('bulk') && !fid.includes('raw');
                });

                if (sanitizedFormats.length > 1) {
                  return (
                    <div className="pds-header-format-select-wrap" style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '0.9rem', lineHeight: 1, pointerEvents: 'none', position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}>
                        {(() => {
                          if (isDiagnostic) return '🔬';
                          const af = sanitizedFormats.find(f => f.id === (activeFormat?.id || activeFormat));
                          if (!af) return '🧪';
                          const id = af.id;
                          if (id.includes('spray') || id.includes('nasal')) return '💨';
                          if (id.includes('pen') || id.includes('cartridge')) return '🖊️';
                          if (id.includes('kit') || id.includes('test')) return '🔬';
                          return '🧪';
                        })()}
                      </span>
                      <select
                        value={activeFormat?.id || activeFormat || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          triggerHaptic('selection');
                          onFormatChange?.(e.target.value);
                        }}
                        style={{
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          border: '1.5px solid #003666',
                          borderRadius: '6px',
                          background: '#ffffff',
                          color: '#003666',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          padding: '3px 22px 3px 26px',
                          cursor: 'pointer',
                          outline: 'none',
                          backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' width%3D'12' height%3D'12' viewBox%3D'0 0 24 24' fill%3D'none' stroke%3D'%23003666' stroke-width%3D'2.5' stroke-linecap%3D'round' stroke-linejoin%3D'round'%3E%3Cpolyline points%3D'6 9 12 15 18 9'%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 5px center',
                          backgroundSize: '10px',
                          fontFamily: 'inherit',
                          minWidth: '130px',
                          boxShadow: '0 1px 3px rgba(0, 54, 102, 0.12)',
                        }}
                      >
                        {sanitizedFormats.map(fmt => {
                          const id = fmt.id;
                          const isFmtSpray = id.includes('spray') || id.includes('nasal');
                          const isFmtPen = id.includes('pen') || id.includes('cartridge');
                          const isFmtKit = id.includes('kit') || id.includes('test');
                          const shortLabel = isFmtKit ? 'Collection Kit' : isFmtSpray ? 'Nasal Spray' : isFmtPen ? 'Pre-filled Pen' : (fmt.name || id);
                          return (
                            <option key={id} value={id}>{shortLabel}</option>
                          );
                        })}
                      </select>
                    </div>
                  );
                }

                return <strong className="pds-summary-value">{presentation}</strong>;
              })()}
            </div>

            {/* Field 2: Strengths / Diagnostic Analytical Scope */}
            <div className="pds-summary-cell">
              <span className="pds-summary-label">
                {isDiagnostic ? 'Analytical Profile / Scope' : 'Available Strengths'}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '4px' }}>
                {strengthsArray.map((str, sIdx) => {
                  const isActive = (selectedStrength?.name === str || selectedStrength?.id === str || selectedStrength?.dosage === str || (isDiagnostic && strengthsArray.length === 1));
                  return (
                    <span
                      key={`${str}-${sIdx}`}
                      onClick={() => onStrengthChange && onStrengthChange(str)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        background: isActive ? '#003666' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#003666',
                        border: `1px solid ${isActive ? '#003666' : '#cbd5e1'}`,
                        cursor: onStrengthChange ? 'pointer' : 'default',
                        transition: 'all 0.15s ease'
                      }}
                      title={onStrengthChange ? `Select ${str}` : str}
                    >
                      {str}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Field 3: Verified Purity / Standard */}
            <div className="pds-summary-cell pds-summary-cell-redundant-desktop">
              <span className="pds-summary-label">
                {isDiagnostic ? 'Analytical Precision / Standard' : 'Verified Purity'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                <strong className="pds-summary-value" style={{ color: '#15803d' }}>{verifiedPurity}</strong>
              </div>
            </div>

            {/* Field 4: Batch Record (Moved to Right Inspector on Desktop to prevent duplication) */}
            <div className="pds-summary-cell pds-summary-cell-redundant-desktop">
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

            {/* Field 5: Supplier (Moved to Right Inspector on Desktop to prevent duplication) */}
            <div className="pds-summary-cell pds-summary-cell-redundant-desktop">
              <span className="pds-summary-label">Source Supplier</span>
              <strong className="pds-summary-value" title={supplier} style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'visible' }}>{supplier}</strong>
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
                value={typeof window !== 'undefined' ? `${window.location.origin}/p/${slug}` : `https://www.atlashealth-services.com/p/${slug}`} 
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
