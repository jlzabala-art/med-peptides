"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Share2, 
  Check, 
  Copy,
  MessageCircle,
  Mail,
  FlaskConical, 
  Dna, 
  ShieldCheck, 
  Snowflake, 
  AlertTriangle, 
  Activity,
  FileText,
  Sliders,
  Layers,
  Thermometer,
  Eye
} from '@/lib/icons';
import { getPeptideScientificData } from '../../../../utils/knownPeptideData';
import { getProductAvailableTypes } from '../../../../utils/productNormalizer';
import notifier from '../../../../services/NotificationService';

export default function ProductDatasheetDrawer({ product, isOpen, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPdf, setCopiedPdf] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ── Delivery Triad Detection (vial, single_cartridge_pen, double_cartridge_pen) ──
  const defaultFormat = React.useMemo(() => {
    if (!product) return 'vial';
    const pName = (product?.canonicalName || product?.name || '').toLowerCase();
    const pPres = (product?.presentation || product?.format || '').toLowerCase();
    const variants = product?.variants || [];
    
    const hasDouble = variants.some(v => /double|dual|two.?chamber/i.test(v.presentation || v.format || ''));
    if (hasDouble || /double|dual|two.?chamber/i.test(pName) || /double|dual|two.?chamber/i.test(pPres)) {
      return 'double_cartridge_pen';
    }

    const hasSingle = variants.some(v => /single|cartridge|\bpen\b|pre.?fill/i.test(v.presentation || v.format || ''));
    if (hasSingle || /single.?cartridge|cartridge|\bpen\b|pre.?fill/i.test(pName) || /single.?cartridge|cartridge|\bpen\b|pre.?fill/i.test(pPres)) {
      return 'single_cartridge_pen';
    }

    return 'vial';
  }, [product]);

  const [selectedFormat, setSelectedFormat] = useState(defaultFormat);

  useEffect(() => {
    setSelectedFormat(defaultFormat);
  }, [defaultFormat]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Ensure the drawer always starts scrolled at the very top (0px)
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose?.();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !product || !mounted) return null;

  const name = product.canonicalName || product.name || 'Clinical Product';
  const types = getProductAvailableTypes(product);
  const primaryType = types[0] || product.category || 'Product';

  // ── Category Archetype Detection ──
  const catRaw = (product.category || product.subcategory || primaryType || '').toLowerCase();
  const nameRaw = (name || '').toLowerCase();
  const presRaw = (product.presentation || product.format || '').toLowerCase();

  const isDevice = /pen|device|needle|syringe|injector|accessory|consumable|bac water|supplies/i.test(catRaw) ||
                   /pen|device|needle|syringe|injector/i.test(nameRaw) ||
                   /empty.?pen|injector/i.test(presRaw);

  const isPreFilledPen = isDevice && (/pre.?fill|peptide.?pen|cartridge/i.test(nameRaw) || /pre.?fill/i.test(presRaw) || /cartridge/i.test(presRaw));

  const isDiagnostic = /diagnostic|genomic|dna|test|saliva|blood|biomarker|panel/i.test(catRaw) ||
                       /test|dna|genomic|screen|biomarker/i.test(nameRaw);

  const isSmallMolecule = /small.?molecule|nootropic|longevity|metabolic|supplement|vitamin|capsule/i.test(catRaw) ||
                          /nad\+|nmn|metformin|resveratrol|curcumin|melatonin|methylene/i.test(nameRaw);

  const isPeptide = !isDevice && !isDiagnostic && !isSmallMolecule;

  // ── Scientific & Regulatory Data ──
  const sciData = getPeptideScientificData(name) || product.scientificData || {};
  const rawCas = product.casNumber || product.cas || product.cas_number || product.molecular?.casNumber || sciData.casNumber;
  const cleanCas = (!rawCas || /available on request/i.test(rawCas)) ? (sciData.casNumber || null) : rawCas;
  const casNumber = cleanCas || 'N/A';
  const formula = product.molecularFormula || sciData.molecularFormula || 'Synthetic Polypeptide';
  const weight = product.molecularWeight || sciData.molecularWeight;
  const target = product.targetSystem || sciData.targetSystem || 'Cellular Receptor Signaling';
  const mechanism = product.mechanismOfAction || sciData.mechanismOfAction || product.description || 'Targeted formulation engineered for physiological modulation and tissue homeostasis.';

  const handleDownloadPdf = async () => {
    setDownloading(true);
    notifier.info(`Generating official clinical PDF for ${name} (${selectedFormat === 'double_cartridge_pen' ? 'Double Cartridge' : selectedFormat === 'single_cartridge_pen' ? 'Single Cartridge' : 'Vial'})...`);
    try {
      const url = `/api/product-sheet/${product.id}?format=${selectedFormat}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('PDF generation failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const formatSuffix = selectedFormat === 'double_cartridge_pen' ? '_double_cartridge' : selectedFormat === 'single_cartridge_pen' ? '_single_cartridge' : '_vial';
      a.download = `${(name || product.id).replace(/\s+/g, '_').toLowerCase()}${formatSuffix}_datasheet.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      notifier.success(`Downloaded datasheet for ${name}.`);
    } catch (err) {
      console.warn('Fallback opening PDF:', err);
      window.open(`/api/product-sheet/${product.id}?format=${selectedFormat}`, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${product.slug || product.id}` : '';
  const pdfUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/product-sheet/${product.id}?format=${selectedFormat}` : '';

  const handleCopy = async (text, type = 'link') => {
    let ok = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = false;
      }
    }
    if (!ok) {
      try {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.left = '-9999px';
        el.style.top = '-9999px';
        document.body.appendChild(el);
        el.focus();
        el.select();
        ok = document.execCommand('copy');
        document.body.removeChild(el);
      } catch (e) {
        console.warn('Fallback copy failed:', e);
      }
    }
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      setCopiedPdf(true);
      setTimeout(() => setCopiedPdf(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${name} — Ficha Técnica Atlas Solutions`,
          text: `Ficha técnica oficial de Atlas Solutions para ${name}.`,
          url: shareUrl,
        });
      } catch {
        // User dismissed system sheet
      }
    } else {
      handleCopy(shareUrl, 'link');
    }
  };

  // Badge label by archetype
  const archetypeBadge = isDevice 
    ? (isPreFilledPen ? 'Compounded Pre-filled Pen' : 'Medical Device')
    : isDiagnostic
      ? 'Genomics & Diagnostic'
      : isSmallMolecule
        ? 'Small Molecule API'
        : 'Peptide Active Ingredient';

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100050,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.15s ease'
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '5px',
                background: '#003666',
                color: '#ffffff',
                letterSpacing: '0.04em'
              }}>
                Atlas Solutions
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '5px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe'
              }}>
                {archetypeBadge}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '5px',
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0'
              }}>
                Clinical Specification
              </span>
            </div>

            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.25,
              wordBreak: 'break-word'
            }}>
              {name}
            </h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
            aria-label="Close datasheet"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              minWidth: '36px',
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── MONOGRAPH BODY (SCROLLABLE & CATEGORY-ADAPTIVE) ── */}
        <div 
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            background: '#f8fafc',
            WebkitOverflowScrolling: 'touch'
          }}
        >

          {/* ══════════════════════════════════════════════════════════
              ARCHETYPE A: MEDICAL DEVICES & INJECTION PENS
             ══════════════════════════════════════════════════════════ */}
          {isDevice && (
            <>
              {/* HS Classification & Device Specs Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Proposed HS Tariff Code
                  </span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#003666', fontFamily: 'monospace' }}>
                    {isPreFilledPen ? '3004.90' : '9018.31'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Regulatory Designation
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                    {isPreFilledPen ? 'Compounded Pen Formulation' : 'Empty Injection Device'}
                  </span>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Official Customs & Clinical Definition
                  </span>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                    {isPreFilledPen 
                      ? 'Patient-specific compounded sterile peptide preparation, supplied in a pre-filled multidose injection pen for subcutaneous administration.'
                      : 'Pen-type injection device for subcutaneous administration, supplied without medicinal product.'
                    }
                  </p>
                </div>
              </div>

              {/* Technical & Mechanical Specifications */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={16} color="#003666" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Engineering & Cartridge Compatibility
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>Cartridge Type</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>Standard 3.0 mL Cartridges</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>Dose Selector Increments</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>0.01 mL / 0.05 mL Audible Clicks</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>Sterilization Standard</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>Ethylene Oxide (EtO) / Gamma</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>Device Reusability</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>Single-Patient Multidose</div>
                  </div>
                </div>
              </div>

              {/* Maintenance & Handling Guidelines */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="#0d9488" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Handling & Storage Guidelines
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  Store device at controlled room temperature (15°C to 25°C) protected from excessive moisture. 
                  Always remove and safely discard the injection needle immediately after each administration. Never store device with needle attached to prevent leakage and bacterial contamination.
                </p>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              ARCHETYPE B: GENOMICS & DIAGNOSTIC KITS
             ══════════════════════════════════════════════════════════ */}
          {isDiagnostic && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Assay Methodology
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#003666' }}>
                    NGS & DNA Microarray
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Laboratory Turnaround
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0d9488' }}>
                    15–20 Business Days
                  </span>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Specimen Matrix & Preservation
                  </span>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.45 }}>
                    Non-invasive Buccal Saliva Swab or Capillary Blood Spot (DBS). Includes stabilizing lysis buffer ensuring sample integrity at room temperature for up to 6 months.
                  </p>
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Dna size={16} color="#7c3aed" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Clinical Scope & Deliverables
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  Comprehensive polygenic risk evaluation covering pharmacogenomics (CYP enzyme metabolism for peptide & drug interactions), longevity biomarkers, metabolic traits, and cellular recovery profiles. Delivered via HIPAA & GDPR compliant encrypted medical portal.
                </p>
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              ARCHETYPE C: PEPTIDES & BIOLOGICALS
             ══════════════════════════════════════════════════════════ */}
          {(isPeptide || isSmallMolecule) && (
            <>
              {/* Quick Scientific Spec Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    CAS Registry Number
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#003666', fontFamily: 'monospace' }}>
                    {casNumber}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Molecular Weight
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    {weight ? `${weight} Da` : (isSmallMolecule ? 'Small Molecule' : 'Synthetic Polypeptide')}
                  </span>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Molecular Formula
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#334155', fontFamily: 'monospace' }}>
                    {formula}
                  </span>
                </div>
              </div>

              {/* Target System & Pharmacology */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={16} color="#0d9488" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Primary Biological Target & Mechanism
                  </span>
                </div>
                
                <div style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#f0fdfa',
                  border: '1px solid #ccfbf1',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#0f766e'
                }}>
                  {target}
                </div>

                <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                  {mechanism}
                </p>
              </div>

              {/* Clinical Delivery & Preparation Protocol Triad (Vial, Single Cartridge, Double Cartridge) */}
              {!isDiagnostic && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sliders size={16} color="#003666" />
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Clinical Delivery Format & Protocol
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#0d9488', fontWeight: 700 }}>
                      {selectedFormat === 'double_cartridge_pen' && '🔄 Dual-Chamber In-Pen System'}
                      {selectedFormat === 'single_cartridge_pen' && '🖊️ Ready-to-Use Liquid Pen'}
                      {selectedFormat === 'vial' && '🧪 Manual Reconstitution Vial'}
                    </span>
                  </div>

                  {/* 3-Option Segmented Control */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    background: '#f8fafc',
                    padding: '4px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <button
                      type="button"
                      onClick={() => setSelectedFormat('vial')}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: selectedFormat === 'vial' ? '1px solid #cbd5e1' : '1px solid transparent',
                        background: selectedFormat === 'vial' ? '#ffffff' : 'transparent',
                        boxShadow: selectedFormat === 'vial' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                        color: selectedFormat === 'vial' ? '#003666' : '#64748b',
                        fontWeight: selectedFormat === 'vial' ? 800 : 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>🧪</span>
                      <span>Vial</span>
                      <span style={{ fontSize: '0.62rem', color: selectedFormat === 'vial' ? '#2563eb' : '#94a3b8', fontWeight: 700 }}>
                        Lyophilized
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFormat('single_cartridge_pen')}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: selectedFormat === 'single_cartridge_pen' ? '1px solid #cbd5e1' : '1px solid transparent',
                        background: selectedFormat === 'single_cartridge_pen' ? '#ffffff' : 'transparent',
                        boxShadow: selectedFormat === 'single_cartridge_pen' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                        color: selectedFormat === 'single_cartridge_pen' ? '#003666' : '#64748b',
                        fontWeight: selectedFormat === 'single_cartridge_pen' ? 800 : 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>🖊️</span>
                      <span>Single Cartridge</span>
                      <span style={{ fontSize: '0.62rem', color: selectedFormat === 'single_cartridge_pen' ? '#16a34a' : '#94a3b8', fontWeight: 700 }}>
                        Ready Liquid
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFormat('double_cartridge_pen')}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '8px',
                        border: selectedFormat === 'double_cartridge_pen' ? '1px solid #cbd5e1' : '1px solid transparent',
                        background: selectedFormat === 'double_cartridge_pen' ? '#ffffff' : 'transparent',
                        boxShadow: selectedFormat === 'double_cartridge_pen' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                        color: selectedFormat === 'double_cartridge_pen' ? '#003666' : '#64748b',
                        fontWeight: selectedFormat === 'double_cartridge_pen' ? 800 : 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>🔄</span>
                      <span>Double Cartridge</span>
                      <span style={{ fontSize: '0.62rem', color: selectedFormat === 'double_cartridge_pen' ? '#7c3aed' : '#94a3b8', fontWeight: 700 }}>
                        Dual-Chamber
                      </span>
                    </button>
                  </div>

                  {/* ── FORMAT 1: VIAL (LYOPHILIZED POWDER) ── */}
                  {selectedFormat === 'vial' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1d4ed8',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        width: 'fit-content'
                      }}>
                        <span>🧪 Manual Reconstitution Protocol · External Diluent Required</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#003666' }}>1.</strong>
                          <span><strong>Aseptic Septum Preparation:</strong> Disinfect vial rubber septum with 70% isopropyl alcohol and allow to air dry completely.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#003666' }}>2.</strong>
                          <span><strong>Diluent Introduction:</strong> Aseptically draw 1.0 mL – 2.0 mL of sterile 0.9% Bacteriostatic Water. Direct needle slowly down the inner glass wall to minimize shear stress.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#003666' }}>3.</strong>
                          <span><strong>Gentle Swirling:</strong> Swirl vial in a gentle circular wrist motion until crystal clear. <em>Do NOT shake or vortex violently</em> to protect peptide molecular integrity.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#003666' }}>4.</strong>
                          <span><strong>Administration:</strong> Draw calculated volume using calibrated 30G/31G subcutaneous insulin syringes. Discard syringe immediately after administration.</span>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: '#eff6ff',
                        border: '1px solid #dbeafe',
                        fontSize: '0.78rem',
                        color: '#1e40af'
                      }}>
                        <Thermometer size={16} style={{ flexShrink: 0 }} />
                        <span><strong>Storage:</strong> Lyophilized powder: store at -20°C (or 2°C–8°C). Reconstituted solution: refrigerate at 2°C–8°C (stable up to 28 days). Do not freeze reconstituted solution.</span>
                      </div>
                    </div>
                  )}

                  {/* ── FORMAT 2: SINGLE CARTRIDGE (READY-TO-USE PRE-FILLED PEN) ── */}
                  {selectedFormat === 'single_cartridge_pen' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#15803d',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        width: 'fit-content'
                      }}>
                        <span>🖊️ Zero Reconstitution Required · Pre-dissolved Liquid Formulation</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#16a34a' }}>1.</strong>
                          <span><strong>Zero Dilution Required:</strong> Pre-dissolved sterile aqueous formulation in standardized 3.0 mL cartridge. No manual mixing or diluent required.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#16a34a' }}>2.</strong>
                          <span><strong>Visual Inspection:</strong> Check transparent cartridge window. Formulation must be clear, colorless, and free of visible particulates or cloudiness.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#16a34a' }}>3.</strong>
                          <span><strong>Needle Attachment & Priming:</strong> Attach sterile 31G/32G (4mm–6mm) pen needle. Dial 1–2 test clicks, point upward, and press button until a steady droplet emerges to purge air.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#16a34a' }}>4.</strong>
                          <span><strong>Dose Setting & Injection:</strong> Dial prescribed dose on micro-stepper selector. Insert needle at 90° subcutaneously, depress button fully, and <em>hold for 6–10 seconds</em> before withdrawing.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#16a34a' }}>5.</strong>
                          <span><strong>Needle Disposal:</strong> Unscrew and discard needle into a sharps container immediately following administration. Never store pen with needle attached.</span>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: '#f0fdf4',
                        border: '1px solid #dcfce7',
                        fontSize: '0.78rem',
                        color: '#166534'
                      }}>
                        <Thermometer size={16} style={{ flexShrink: 0 }} />
                        <span><strong>Storage:</strong> Unused pen: refrigerate at 2°C–8°C (do not freeze). In-use pen: controlled room temperature (&lt;25°C / 77°F) or refrigerated for 30–56 days protected from direct light.</span>
                      </div>
                    </div>
                  )}

                  {/* ── FORMAT 3: DOUBLE CARTRIDGE (DUAL-CHAMBER IN-DEVICE RECONSTITUTION) ── */}
                  {selectedFormat === 'double_cartridge_pen' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#faf5ff',
                        border: '1px solid #e9d5ff',
                        color: '#7e22ce',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        width: 'fit-content'
                      }}>
                        <span>🔄 Automated In-Device Reconstitution · Dual-Chamber Bypass Cartridge</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#7c3aed' }}>1.</strong>
                          <span><strong>Dual-Chamber System:</strong> Chamber 1 (front) contains lyophilized peptide powder; Chamber 2 (rear) contains pre-measured bacteriostatic diluent, separated by internal bypass seal.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#7c3aed' }}>2.</strong>
                          <span><strong>In-Device Mechanical Mixing:</strong> <em>Zero external syringes or diluent needles required.</em> Hold pen upright with cartridge pointing upward. Screw cartridge holder clockwise into pen body until it reaches the stop lock.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#7c3aed' }}>3.</strong>
                          <span><strong>Automated Bypass:</strong> The mechanical forward plunger drives diluent through the middle bypass channel directly into the powder chamber.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#7c3aed' }}>4.</strong>
                          <span><strong>Gentle Dissolution:</strong> Invert pen slowly up and down 5–10 times. Wait 3–5 minutes for full dissolution into a clear solution. Do NOT shake violently to avoid foaming.</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <strong style={{ minWidth: '18px', color: '#7c3aed' }}>5.</strong>
                          <span><strong>Priming & Subcutaneous Delivery:</strong> Attach sterile 31G/32G pen needle, dial 1–2 priming clicks to purge air, select prescribed dose, and inject subcutaneously at 90° (holding for 6–10s).</span>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: '#faf5ff',
                        border: '1px solid #f3e8ff',
                        fontSize: '0.78rem',
                        color: '#6b21a8'
                      }}>
                        <Thermometer size={16} style={{ flexShrink: 0 }} />
                        <span><strong>Storage:</strong> Unmixed dual cartridge: refrigerate at 2°C–8°C. Once mixed in-pen: refrigerate at 2°C–8°C (stable for 28–30 days). Protect from freezing and direct light.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── Universal Clinical Disclaimer & Contraindications Box ── */}
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} color="#dc2626" />
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Clinical Contraindications & Precautions
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.45 }}>
              {isDevice
                ? 'Device intended exclusively for single-patient administration. Do not reuse single-use needle attachments. Ensure sterile technique during cartridge replacement.'
                : 'Contraindicated in individuals with known hypersensitivity to active formulation components. Patients with active malignancy must obtain clinical oncology clearance prior to therapy.'
              }
            </p>
          </div>

        </div>

        {/* ── STICKY ACTIONS FOOTER (THUMB-ZONE) ── */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          gap: '10px',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 18px',
              background: '#003666',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.8 : 1,
              transition: 'background 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 54, 102, 0.2)'
            }}
          >
            <Download size={16} />
            <span>{downloading ? 'Generating PDF...' : 'Download Official PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            aria-label="Share clinical monograph"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 18px',
              background: '#f8fafc',
              color: '#003666',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ── Share Clinical Monograph (Lateral Drawer on Desktop / Bottom Sheet on Mobile) ── */}
      {isShareOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100065,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: isMobile ? 'flex-end' : 'flex-end',
            alignItems: isMobile ? 'center' : 'stretch',
            background: isMobile ? 'rgba(15, 23, 42, 0.65)' : 'rgba(15, 23, 42, 0.45)',
            backdropFilter: isMobile ? 'blur(6px)' : 'blur(4px)',
            WebkitBackdropFilter: isMobile ? 'blur(6px)' : 'blur(4px)',
            animation: 'fadeIn 0.15s ease'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsShareOpen(false);
          }}
        >
          <div
            style={isMobile ? {
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              borderBottom: 'none',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh',
              animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            } : {
              width: '100%',
              maxWidth: '460px',
              height: '100%',
              background: '#ffffff',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.25)',
              borderLeft: '1px solid #e2e8f0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInRight 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tactile Bottom Sheet Drag Handle (Mobile Only) */}
            {isMobile && (
              <div
                style={{
                  width: '44px',
                  height: '5px',
                  borderRadius: '3px',
                  background: '#cbd5e1',
                  alignSelf: 'center',
                  marginTop: '12px',
                  marginBottom: '4px'
                }}
              />
            )}

            {/* Header: Title & Close */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '12px 20px 14px 20px' : '18px 20px',
                borderBottom: '1px solid #f1f5f9',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                    Share Clinical Monograph
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                    Atlas Solutions • {name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Close share sheet"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Direct Monograph Link Box */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Direct Monograph URL:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      fontSize: '0.82rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(shareUrl, 'link')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      background: copiedLink ? '#16a34a' : '#003666',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
                {copiedLink && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.76rem', color: '#16a34a', fontWeight: 700 }}>
                    ✓ Link copied to clipboard. Ready to share with clinicians or patients.
                  </p>
                )}
              </div>

              {/* Quick Communication Channels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                  Instant Sharing Channels:
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Atlas Solutions — Official Clinical Monograph:\n*${name}*\n${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      background: '#25D366',
                      color: '#ffffff',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)'
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp</span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`Atlas Solutions Clinical Monograph — ${name}`)}&body=${encodeURIComponent(`Hello,\n\nPlease find attached the official clinical monograph from Atlas Solutions for ${name}:\n\n${shareUrl}\n\nBest regards,\nAtlas Solutions`)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      background: '#0284c7',
                      color: '#ffffff',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                    }}
                  >
                    <Mail size={18} />
                    <span>Email</span>
                  </a>
                </div>

                {/* Native mobile share if supported */}
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Share2 size={16} />
                    <span>More Options (Device Native Share)</span>
                  </button>
                )}

                {/* Copy PDF URL */}
                <button
                  type="button"
                  onClick={() => handleCopy(pdfUrl, 'pdf')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '11px',
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <FileText size={15} color="#dc2626" />
                  <span>{copiedPdf ? '✓ PDF Link Copied' : 'Copy Direct Official PDF Link'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Sheet Footer */}
            <div
              style={{
                padding: '12px 20px 24px 20px',
                borderTop: '1px solid #f1f5f9',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
