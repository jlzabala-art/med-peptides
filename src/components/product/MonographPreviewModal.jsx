"use client";

import React, { useEffect, useState } from 'react';
import './MonographPreviewModal.css';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Eye, FileText, Check, ShieldCheck, Tag, Box, Copy } from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import { generateDiscreetBatchCode } from '../../utils/discreetBatchHelper';
import { prefetchPdf } from '../../utils/pdfPrefetch';

import { getReconstitutionBaseline, parseMgFromPresentation } from '../../utils/reconstitutionBaseline';

export default function MonographPreviewModal({
  isOpen,
  onClose,
  product,
  slug,
  supplierName,
  activeFormat,
  selectedStrength,
  availableFormats = [],
  sortedStrengths = [],
  dynamicPublicUrl,
  labelQueryString = '',
  initialBatch = null,
  version = null,
  updatedAtDate = null,
  isCosmetic = false,
}) {
  const [activeTab, setActiveTab] = useState('monograph'); // 'monograph' | 'shipping' | 'client'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Computed values needed by the second useEffect — must be derived before any hooks
  const _monographPdfUrl = isOpen && product
    ? `/api/product-sheet/${encodeURIComponent(product?.id || slug)}?format=vial`
    : null;

  // Low-priority background prefetch for the active tab's PDF
  // NOTE: all useEffects must be declared BEFORE any early return
  useEffect(() => {
    if (isOpen && _monographPdfUrl) {
      prefetchPdf(_monographPdfUrl);
    }
  }, [isOpen, _monographPdfUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !product) return null;

  const docVersion = version || (product.version ? (String(product.version).startsWith('v') ? product.version : `v${product.version}`) : 'v2.4');
  const docUpdatedDate = updatedAtDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const name = product.canonicalName || product.name || 'Clinical Peptide';
  const category = (product.category || 'Metabolic & Endocrine Axis').toUpperCase();
  const targetSystem = product.targetSystem || product.primaryReceptor || product.target || 'GLP-1 / GIP / Glucagon Tri-Agonist';
  const cas = product.cas || product.casNumber || product.molecular?.casNumber || '2381089-83-2';
  const formula = product.molecularFormula || product.molecular?.molecularFormula || product.molecular?.formula || product.formula || 'C221H342N46O68';
  const mw = product.molecularWeight || product.molecular?.molecularWeight || '4731.33';
  const purity = (product.purity || '99.0').replace(/[^0-9.]/g, '') || '99.0';
  const formatName = activeFormat?.name || 'Vial (Lyophilized)';
  const isBlend = Boolean(
    product?.isBlend ||
    String(product?.category || '').toLowerCase().includes('blend') ||
    String(name || '').includes('+') ||
    String(name || '').includes('/') ||
    String(slug || '').includes('klow') ||
    String(slug || '').includes('glow')
  );
  const doseName = selectedStrength?.name || selectedStrength?.dosage || selectedStrength?.dose || (typeof selectedStrength === 'string' ? selectedStrength : null) || product.dosage || '10 mg';

  let rawLot = (typeof initialBatch !== 'undefined' && initialBatch ? initialBatch : null) || product.vialCode || product.batchNumber || product.batch;
  if (!rawLot || String(rawLot).toLowerCase().includes('suppl') || String(rawLot).toLowerCase().includes('dummy') || String(rawLot).toLowerCase().includes('sample')) {
    rawLot = generateDiscreetBatchCode({ slug, dose: doseName, supplier: supplierName });
  }
  const lot = rawLot;

  // Direct PDF Download Endpoints
  const monographPdfUrl = `/api/product-sheet/${encodeURIComponent(product?.id || slug)}?format=vial`;
  const shippingLabelPdfUrl = `/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=shipping&download=1${labelQueryString}`;
  const shippingSheetPdfUrl = `/api/vial-label/${encodeURIComponent(slug)}?format=sheet_a4&type=shipping&download=1${labelQueryString}`;
  const clientLabelPdfUrl = `/api/vial-label/${encodeURIComponent(slug)}?format=38x90&type=client&download=1${labelQueryString}`;
  const clientSheetPdfUrl = `/api/vial-label/${encodeURIComponent(slug)}?format=sheet_a4&type=client&download=1${labelQueryString}`;

  const clean = (s) => String(s || '').trim().replace(/^supplier[-_]/i, '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').toLowerCase();
  const suppCode = supplierName || product?.supplierName || product?.supplier || 'lotusland';
  const vSuffix = `${clean(slug)}_${clean(doseName)}_${clean(formatName)}_${clean(suppCode)}_${clean(lot)}`;

  const currentDownloadUrl = activeTab === 'shipping'
    ? shippingLabelPdfUrl
    : activeTab === 'client'
      ? clientLabelPdfUrl
      : monographPdfUrl;

  const currentFilename = activeTab === 'shipping'
    ? `shipping_label_${vSuffix}_38x90.pdf`
    : activeTab === 'client'
      ? `client_vial_label_${vSuffix}_38x90.pdf`
      : `${vSuffix}_monograph_a4.pdf`;

  // (prefetch useEffect moved above the early return — see above)

  const handleCopyLink = async () => {
    triggerHaptic('light');
    if (dynamicPublicUrl) {
      await navigator.clipboard?.writeText(dynamicPublicUrl).catch(() => {});
      setCopied(true);
      toast.success('Digital verification link copied ✓');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="mpm-overlay"
      data-print-modal="true"
      role="dialog"
      aria-modal="true"
      aria-label={`Clinical Monograph & Label Preview for ${name}`}
    >
      <div className="mpm-container">
        
        {/* ── Top Header & Tab Navigation ── */}
        <div data-print-hide="true" className="mpm-top-bar">
          <div className="mpm-top-row">
            <div className="mpm-title-cluster">
              <div className="mpm-icon-badge">
                <Eye size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span className="mpm-title-text">PDF Print &amp; Download Preview</span>
                  <span className="mpm-tag-supplier">{supplierName}</span>
                </div>
                <div className="mpm-sub-text">
                  {isCosmetic
                    ? `${name} • ${selectedStrength?.name || product?.volume || '250 mL'}`
                    : `${name} • ${doseName} (${formatName})`
                  }
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mpm-close-btn"
              aria-label="Close Preview"
            >
              <X size={20} />
            </button>
          </div>

          {/* Segmented Control Tabs */}
          <div className="mpm-tabs-bar">
            <button
              type="button"
              onClick={() => { triggerHaptic('selection'); setActiveTab('monograph'); }}
              className={`mpm-tab-btn ${activeTab === 'monograph' ? 'active' : ''}`}
            >
              <FileText size={14} />
              <span className="mpm-tab-long">{isCosmetic ? '1. Product Dossier (A4)' : '1. Monograph Dossier (A4)'}</span>
              <span className="mpm-tab-short">{isCosmetic ? '1. Dossier' : '1. Monograph'}</span>
            </button>

            {!isCosmetic && (
              <button
                type="button"
                onClick={() => { triggerHaptic('selection'); setActiveTab('shipping'); }}
                className={`mpm-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              >
                <Box size={14} />
                <span className="mpm-tab-long">2. Shipping Label (38×90)</span>
                <span className="mpm-tab-short">2. Shipping</span>
              </button>
            )}

            {!isCosmetic && (
              <button
                type="button"
                onClick={() => { triggerHaptic('selection'); setActiveTab('client'); }}
                className={`mpm-tab-btn ${activeTab === 'client' ? 'active' : ''}`}
              >
                <Tag size={14} />
                <span className="mpm-tab-long">3. Client Vial Label (38×90)</span>
                <span className="mpm-tab-short">3. Client Vial</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable Document Canvas ── */}
        <div className="mpm-body-canvas">
          
          {/* TAB 1: Monograph A4 Dossier Preview */}
          {activeTab === 'monograph' && (
            <div 
              id="printable-monograph-document"
              data-print-body="true"
              className="mpm-sheet"
            >
              {/* Header */}
              <div>
                <div className="mpm-sheet-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="mpm-brand-label">ATLAS SERVICES PHARMACEUTICAL GROUP</span>
                      <span style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '3px', fontFamily: 'monospace' }}>
                        Analytical Monograph
                      </span>
                    </div>
                    <h1 className="mpm-doc-title">{name}</h1>
                    <p className="mpm-doc-subtitle">Clinical Technical Monograph &amp; Administration Dossier</p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', display: 'block', fontFamily: 'monospace' }}>Controlled Doc · {docVersion}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', display: 'block', fontFamily: 'monospace' }}>PDS-{slug.toUpperCase()}</span>
                    <span style={{ fontSize: '0.62rem', color: '#475569', display: 'block', marginTop: '2px' }}>
                      Updated: {docUpdatedDate}
                    </span>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#0f766e', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.1rem 0.4rem', borderRadius: '3px', display: 'inline-block', marginTop: '0.2rem' }}>
                      {supplierName} Qualified
                    </span>
                  </div>
                </div>

                {/* Meta Ribbon */}
                <div className="mpm-meta-grid" style={{ margin: '0.75rem 0' }}>
                  <div className="mpm-meta-item">
                    <span className="k">{isCosmetic ? 'Product Type' : 'Class / Axis'}</span>
                    <span className="v">{category}</span>
                  </div>
                  <div className="mpm-meta-item">
                    <span className="k">{isCosmetic ? 'Active System' : 'Target Receptor'}</span>
                    <span className="v" style={{ fontSize: '0.7rem' }}>{targetSystem}</span>
                  </div>
                  <div className="mpm-meta-item">
                    <span className="k">Batch Number</span>
                    <span className="v" style={{ fontFamily: 'monospace' }}>{lot}</span>
                  </div>
                  <div className="mpm-meta-item">
                    <span className="k">Purity Grade</span>
                    <span className="v" style={{ color: '#15803d' }}>≥ {purity}% (RP-HPLC)</span>
                  </div>
                </div>

                {/* 1. Molecular Specs — hidden for cosmetics */}
                {!isCosmetic && (
                <div style={{ margin: '0.75rem 0' }}>
                  <div className="mpm-section-heading">1. Molecular &amp; Chemical Specifications</div>
                  <div className="mpm-specs-table-wrap">
                    <table className="mpm-table">
                      <tbody>
                        <tr>
                          <td style={{ width: '25%', fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>CAS Registry:</td>
                          <td style={{ width: '25%', fontFamily: 'monospace', fontWeight: 700 }}>{cas}</td>
                          <td style={{ width: '25%', fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>Molecular Weight:</td>
                          <td style={{ width: '25%', fontFamily: 'monospace', fontWeight: 700 }}>{mw} Da</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>Formula:</td>
                          <td style={{ fontFamily: 'monospace' }}>{formula}</td>
                          <td style={{ fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>Compound Identity:</td>
                          <td>Synthetic Agonist</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

                {/* 1b. Cosmetic Product Summary — shown only for cosmetics */}
                {isCosmetic && product && (
                <div style={{ margin: '0.75rem 0' }}>
                  <div className="mpm-section-heading">1. Cosmeceutical Product Summary</div>
                  <div className="mpm-specs-table-wrap">
                    <table className="mpm-table">
                      <tbody>
                        <tr>
                          <td style={{ width: '30%', fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>Brand / Supplier:</td>
                          <td style={{ fontWeight: 700 }}>{supplierName || product?.brand || product?.supplier || 'Colway'}</td>
                          <td style={{ width: '30%', fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>Volume / Size:</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{product?.volume || selectedStrength?.name || '250 mL'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>Formulation Type:</td>
                          <td>{product?.technical_specs?.formulation_type || (slug?.includes('shampoo') ? 'Aqueous Surfactant Gel' : 'O/W Cosmetic Emulsion')}</td>
                          <td style={{ fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>pH Range:</td>
                          <td style={{ fontFamily: 'monospace' }}>{product?.technical_specs?.ph_range || '5.0–6.0'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>Shelf Life:</td>
                          <td>{product?.technical_specs?.shelf_life || '24 months (unopened)'}</td>
                          <td style={{ fontWeight: 700, color: '#64748b', background: '#f8fafc' }}>Regulatory:</td>
                          <td>EU Reg. 1223/2009</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

                {/* 2. Formulations Matrix — hidden for cosmetics */}
                {!isCosmetic && (
                <div style={{ margin: '0.75rem 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div className="mpm-section-heading" style={{ margin: 0 }}>2. Available Presentations Matrix</div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                      Selected: <strong>{doseName}</strong> ({formatName})
                    </span>
                  </div>

                  <div className="mpm-specs-table-wrap">
                    <table className="mpm-table">
                      <thead>
                        <tr>
                          <th>Strength</th>
                          <th>Format</th>
                          <th>Diluent / Vehicle</th>
                          <th>Resulting Conc.</th>
                          <th>Route</th>
                          <th style={{ textAlign: 'right' }}>Purity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableFormats.flatMap((fmt) => {
                          const compatStrengths = sortedStrengths.filter((s) => !fmt.strengths || fmt.strengths.includes(s.id));
                          const list = compatStrengths.length > 0 ? compatStrengths : [{ id: 'std', name: 'Standard Dose' }];
                          const isPenOrCart = fmt.id.includes('pen') || fmt.id.includes('cartridge');
                          const isOral = fmt.id.includes('capsule') || fmt.id.includes('tablet') || fmt.id.includes('oral');
                          const isSpray = fmt.id.includes('spray') || fmt.id.includes('nasal');

                          return list.map((st) => {
                            const isActive = fmt.id === activeFormat?.id && st.id === selectedStrength?.id;
                            const mgVal = parseMgFromPresentation(st.name || st.id);
                            const baseline = getReconstitutionBaseline(mgVal, isBlend);

                            const diluent = isPenOrCart ? 'Pre-filled Solution' : isOral ? 'Solid Dose' : isSpray ? 'Metered Spray' : baseline.diluent;
                            const conc = isPenOrCart ? 'Pre-formulated' : isOral ? 'Unit Dose' : isSpray ? 'Metered Dose' : baseline.conc;
                            const route = isOral ? 'Oral' : isSpray ? 'Intranasal' : isPenOrCart ? 'SubQ Pen' : 'SubQ';

                            return (
                              <tr key={`${fmt.id}-${st.id}`} className={isActive ? 'active-row' : ''}>
                                <td style={{ fontWeight: 700 }}>
                                  {st.name} {isActive && <span style={{ color: '#15803d', marginLeft: '3px' }}>●</span>}
                                </td>
                                <td>{fmt.name}</td>
                                <td style={{ fontFamily: 'monospace', color: '#475569' }}>{diluent}</td>
                                <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{conc}</td>
                                <td>{route}</td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: '#15803d' }}>≥ {purity}%</td>
                              </tr>
                            );
                          });
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

                {/* 3. Reconstitution Directives — hidden for cosmetics */}
                {!isCosmetic && (
                <div style={{ margin: '0.75rem 0' }}>
                  <div className="mpm-section-heading">3. Reconstitution &amp; Storage Directives</div>
                  <div className="mpm-directives-box">
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.15rem' }}>Lyophilized Solid Storage (Unopened):</strong>
                      <span style={{ color: '#475569', lineHeight: 1.3 }}>Store in a cool, dry place or 2°C–8°C (stable up to 24 months). Ambient transit/delivery is completely safe.</span>
                    </div>
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.15rem' }}>Reconstituted Solution:</strong>
                      <span style={{ color: '#475569', lineHeight: 1.3 }}>Reconstitute with Bacteriostatic Water. Maintain refrigerated at 2°C to 8°C. Do not freeze. Stable 28 days.</span>
                    </div>
                  </div>
                </div>
                )}

                {/* 3b. Cosmetics Storage & Application — shown only for cosmetics */}
                {isCosmetic && (
                <div style={{ margin: '0.75rem 0' }}>
                  <div className="mpm-section-heading">2. Storage &amp; Application Directives</div>
                  <div className="mpm-directives-box">
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.15rem' }}>Storage (Unopened):</strong>
                      <span style={{ color: '#475569', lineHeight: 1.3 }}>Store below 25°C in a cool, dry place away from direct sunlight. Do not freeze. Shelf life: {product?.technical_specs?.shelf_life || '24 months'}.</span>
                    </div>
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.15rem' }}>Application Protocol:</strong>
                      <span style={{ color: '#475569', lineHeight: 1.3 }}>{product?.application_protocol?.how_to_use || 'Apply to wet hair/scalp. Massage gently for 2–3 minutes. Rinse thoroughly. For best results, use as directed in the full product protocol.'}</span>
                    </div>
                  </div>
                </div>
                )}
              </div>

              {/* Sheet Footer */}
              <div className="mpm-sheet-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.25rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                    {dynamicPublicUrl ? (
                      <QRCodeSVG value={dynamicPublicUrl} size={50} level="M" />
                    ) : (
                      <div style={{ width: 50, height: 50, background: '#f1f5f9' }} />
                    )}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', color: '#0f172a' }}>
                      Scan For Live Digital Certificate
                    </strong>
                    <span style={{ fontSize: '0.64rem', color: '#64748b', display: 'block' }}>
                      Camera lookup opens analytical COA, batch purity, and verified release testing.
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.65rem', color: '#64748b' }}>
                  <strong style={{ color: '#334155', display: 'block' }}>Atlas Services Clinical Group</strong>
                  <span>Dual RP-HPLC &amp; LC-MS Analytical Standard</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Shipping Label (38×90mm) */}
          {activeTab === 'shipping' && (
            <div className="mpm-label-card-wrap">
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: '#0f172a', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  📦 38 × 90 mm Discreet Shipping Label (PDF)
                </span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0.35rem 0 0 0' }}>
                  Outer box packaging label with scannable barcode and QR code.
                </p>
              </div>

              <div className="mpm-label-physical">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                  <div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>DESTINATION BATCH</span>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', display: 'block', letterSpacing: '0.04em' }}>{lot}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0f766e', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    38×90mm
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.3rem 0' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#334155', display: 'block' }}>SCAN QR FOR GUIDE</span>
                    <p style={{ fontSize: '0.64rem', color: '#64748b', margin: '0.15rem 0 0 0', lineHeight: 1.25, fontFamily: 'sans-serif' }}>
                      Camera scan resolves directly to the verified clinical monograph without revealing commercial branding on packaging.
                    </p>
                    <div style={{ marginTop: '0.4rem', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem', color: '#0f172a' }}>
                      * {lot} *
                    </div>
                  </div>

                  <div style={{ padding: '0.35rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', flexShrink: 0 }}>
                    {dynamicPublicUrl ? (
                      <QRCodeSVG value={dynamicPublicUrl} size={64} level="M" />
                    ) : (
                      <div style={{ width: 64, height: 64, background: '#f1f5f9' }} />
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b', fontFamily: 'sans-serif' }}>
                  <span>Authorized Cold-Chain Logistics</span>
                  <span>Reconstituted: Store at 2–8°C</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a
                  href={shippingSheetPdfUrl}
                  download={`shipping_sheet_${vSuffix}_a4.pdf`}
                  className="mpm-btn-download"
                  style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' }}
                  title="Download A4 Printable Sheet (×8 Labels)"
                >
                  <FileText size={14} /> Sheet (A4 ×8 Labels PDF)
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: Client Vial Label (38×90mm) */}
          {activeTab === 'client' && (
            <div className="mpm-label-card-wrap">
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: '#0f766e', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🏷️ 38 × 90 mm Client Vial Adhesion Label (PDF)
                </span>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0.35rem 0 0 0' }}>
                  Adhesive label for customer vial with dose, purity, and reconstitution spaces.
                </p>
              </div>

              <div className="mpm-label-physical client-mode">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                  <div>
                    <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#0f766e', letterSpacing: '0.05em', textTransform: 'uppercase' }}>ATLAS CLINICAL LAB</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', display: 'block', lineHeight: 1.1 }}>{name}</span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803d' }}>Dose: {doseName}</span>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.65rem' }}>
                    <span style={{ color: '#64748b', display: 'block', fontFamily: 'monospace' }}>LOT: {lot}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>Purity: ≥ {purity}%</span>
                    <span style={{ color: '#0f766e', fontWeight: 600, display: 'block' }}>{supplierName}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0' }}>
                  <div style={{ flex: 1, fontSize: '0.65rem', fontFamily: 'monospace', color: '#334155', lineHeight: 1.35 }}>
                    <div>Reconstitute: 2.0 mL BAC Water</div>
                    <div>
                      Conc: {(() => {
                        const m = doseName.match(/(\d+(?:\.\d+)?)\s*mg/i);
                        return m ? (parseFloat(m[1]) / 2.0).toFixed(1) : '5.0';
                      })()} mg/mL · SubQ
                    </div>
                    <div>Recon Date: [ ___ / ___ / 2026 ]</div>
                    <div>Discard: 28 Days post-recon (2-8°C)</div>
                  </div>

                  <div style={{ padding: '0.35rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', flexShrink: 0 }}>
                    {dynamicPublicUrl ? (
                      <QRCodeSVG value={dynamicPublicUrl} size={58} level="M" />
                    ) : (
                      <div style={{ width: 58, height: 58, background: '#f1f5f9' }} />
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.35rem', textAlign: 'center', fontSize: '0.6rem', color: '#64748b', fontFamily: 'monospace' }}>
                  For Research &amp; Clinical Administration • Protect From Light
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a
                  href={clientSheetPdfUrl}
                  download={`client_sheet_${vSuffix}_a4.pdf`}
                  className="mpm-btn-download"
                  style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' }}
                  title="Download A4 Printable Sheet (×8 Client Labels)"
                >
                  <FileText size={14} /> Sheet (A4 ×8 Labels PDF)
                </a>
              </div>
            </div>
          )}

        </div>

        {/* ── Sticky Bottom Action Bar ── */}
        <div data-print-hide="true" className="mpm-bottom-bar">
          <button
            type="button"
            onClick={onClose}
            className="mpm-btn-cancel"
          >
            Close
          </button>

          <div className="mpm-actions-cluster">
            {/* Primary Download PDF Button with Zero-Latency Background Prefetch */}
            <a
              href={currentDownloadUrl}
              download={currentFilename}
              onMouseEnter={() => prefetchPdf(currentDownloadUrl)}
              onTouchStart={() => prefetchPdf(currentDownloadUrl)}
              className="mpm-btn-download"
              title="Download PDF file directly to device"
            >
              <Download size={14} />
              <span className="mpm-btn-label-long">Download PDF</span>
              <span className="mpm-btn-label-short">PDF</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
