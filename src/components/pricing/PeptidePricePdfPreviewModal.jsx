'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Printer, Sparkles, Layers, List, Smartphone, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { KNOWN_PEPTIDE_DATA } from '@/utils/knownPeptideData';

/**
 * Parses multi-component peptide blends (like GLOW, KLOW, CJC-1295 + Ipamorelin)
 * so neither the formulation name nor the individual milligram concentrations
 * are ever truncated with ellipses (...).
 */
export function parsePeptideBlendDisplay(productName = '', rawDose = '') {
  const nameStr = String(productName || '').trim();
  const doseStr = String(rawDose || '').trim();
  const upperName = nameStr.toUpperCase();

  // Explicit handling for GLOW & KLOW multi-peptide regenerative blends
  if (upperName.startsWith('GLOW')) {
    const mainTitle = 'GLOW Blend (3-Peptide Stack)';
    const primaryDose = '70 mg Total';
    return {
      isBlend: true,
      mainTitle,
      titleLine: mainTitle,
      compositionLine: 'BPC-157 (10 mg) + TB-500 (10 mg) + GHK-Cu (50 mg)',
      primaryDose,
      dosageMain: primaryDose,
      subDose: '10 / 10 / 50 mg'
    };
  }

  if (upperName.startsWith('KLOW')) {
    const mainTitle = 'KLOW Blend (4-Peptide Stack)';
    const primaryDose = '80 mg Total';
    return {
      isBlend: true,
      mainTitle,
      titleLine: mainTitle,
      compositionLine: 'BPC-157 (10 mg) + TB-500 (10 mg) + GHK-Cu (50 mg) + KPV (10 mg)',
      primaryDose,
      dosageMain: primaryDose,
      subDose: '10 / 10 / 50 / 10 mg'
    };
  }

  // Generic parenthetical or slash blend detection, e.g. "BPC-157 / TB-500" or "CJC-1295 + Ipamorelin"
  const parenMatch = nameStr.match(/^([^(]+)\(([^)]+)\)$/);
  const doseParts = doseStr.split(/[+·/]/).map(s => s.trim()).filter(Boolean);

  if (parenMatch && doseParts.length > 1) {
    const baseTitle = parenMatch[1].trim();
    const innerIngredients = parenMatch[2].split(/[/+]/).map(s => s.trim()).filter(Boolean);
    const paired = innerIngredients.map((ing, i) => (doseParts[i] ? `${ing} (${doseParts[i]})` : ing)).join(' + ');
    const numericSum = doseParts.reduce((acc, part) => {
      const m = part.match(/(\d+(?:\.\d+)?)\s*mg/i);
      return m ? acc + parseFloat(m[1]) : acc;
    }, 0);
    const primaryDose = numericSum > 0 ? `${numericSum} mg Total` : doseParts.join(' + ');

    return {
      isBlend: true,
      mainTitle: baseTitle,
      titleLine: baseTitle,
      compositionLine: paired,
      primaryDose,
      dosageMain: primaryDose,
      subDose: doseParts.map(d => d.replace(/\s*mg/i, '')).join(' / ') + ' mg'
    };
  }

  if (doseParts.length > 1) {
    const numericSum = doseParts.reduce((acc, part) => {
      const m = part.match(/(\d+(?:\.\d+)?)\s*mg/i);
      return m ? acc + parseFloat(m[1]) : acc;
    }, 0);
    const primaryDose = numericSum > 0 ? `${numericSum} mg Total` : doseParts.join(' · ');

    return {
      isBlend: true,
      mainTitle: nameStr,
      titleLine: nameStr,
      compositionLine: null,
      primaryDose,
      dosageMain: primaryDose,
      subDose: doseParts.join(' + ')
    };
  }

  return {
    isBlend: false,
    mainTitle: nameStr,
    titleLine: nameStr,
    compositionLine: null,
    primaryDose: doseStr || '—',
    dosageMain: doseStr || '—',
    subDose: null
  };
}

function resolveCasForPdf(productName = '', rowCas = null) {
  if (rowCas) return rowCas;
  const clean = (productName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const found = Object.entries(KNOWN_PEPTIDE_DATA).find(([k]) => {
    const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean.includes(kClean) || kClean.includes(clean);
  });
  return found?.[1]?.casNumber || null;
}

export default function PeptidePricePdfPreviewModal({
  isOpen,
  onClose,
  products = [],
  currency = 'USD',
  currencySymbol = '$',
  formatPrice,
  isDistributor = false,
  lang = 'en'
}) {
  const [pdfLang, setPdfLang] = useState(lang || 'en');
  const [groupByCategory, setGroupByCategory] = useState(true);
  // Mobile view mode: 'mobile' (3-column adaptive reader without collisions) or 'a4' (scaled A4 paper sheet viewer)
  const [mobileViewMode, setMobileViewMode] = useState('mobile');
  const [a4ZoomScale, setA4ZoomScale] = useState(0.45);

  useEffect(() => {
    if (lang === 'es' || lang === 'en') {
      setPdfLang(lang);
    }
  }, [lang]);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const updateScale = () => {
      const vw = window.innerWidth || 375;
      if (vw < 768) {
        const availableWidth = Math.max(300, vw - 20);
        setA4ZoomScale(Number(Math.min(0.95, availableWidth / 860).toFixed(3)));
      } else {
        setA4ZoomScale(1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isOpen]);

  const isEs = pdfLang === 'es';

  const qrTargetUrl = useMemo(() => {
    const base = 'https://www.atlashealth-services.com/pricing/peptides';
    const params = new URLSearchParams();
    if (isDistributor) params.set('mode', 'distributor');
    if (isEs) params.set('lang', 'es');
    if (currency && currency !== 'USD') params.set('currency', currency);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [isDistributor, isEs, currency]);

  const groupedSections = useMemo(() => {
    if (!groupByCategory) {
      return [{ key: 'all', title: null, items: products }];
    }
    const map = new Map();
    products.forEach((p) => {
      const catKey = p.categoryKey || 'general_health';
      const catTitle = isEs
        ? (p?.categoryMeta?.labelEs || p?.categoryMeta?.label || 'Péptidos Clínicos')
        : (p?.categoryMeta?.labelEn || p?.categoryMeta?.label || 'Clinical Peptides');
      if (!map.has(catKey)) {
        map.set(catKey, { key: catKey, title: catTitle, color: p?.categoryMeta?.color || '#003666', items: [] });
      }
      map.get(catKey).items.push(p);
    });
    return Array.from(map.values());
  }, [products, groupByCategory, isEs]);

  if (!isOpen) return null;

  let globalRowIndex = 0;

  return (
    <div
      className="pdf-modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.84)',
        backdropFilter: 'blur(6px)',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 1.5rem 0',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
      onClick={onClose}
    >
      <style>{`
        .pdf-mobile-only {
          display: none !important;
        }
        .pdf-desktop-only {
          display: inline-flex !important;
        }

        /* Mobile Adaptive Mode vs A4 Sheet Mode (< 768px) */
        @media (max-width: 767px) {
          .pdf-mobile-only {
            display: inline-flex !important;
          }
          .pdf-desktop-only {
            display: none !important;
          }
          .pdf-toolbar-shell {
            border-radius: 0 !important;
            padding: 8px 12px !important;
            margin-bottom: 10px !important;
            border-bottom: 1px solid #e2e8f0;
          }
          .pdf-toolbar-row1 {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .pdf-toolbar-row2 {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding-top: 6px;
            margin-top: 4px;
            border-top: 1px solid #f1f5f9;
          }

          /* Mode 1: 📱 Mobile Reader Mode (Zero Horizontal Collision) */
          .official-price-pdf-preview.is-mobile-reader {
            width: calc(100% - 16px) !important;
            max-width: 100% !important;
            padding: 14px 12px !important;
            border-radius: 8px !important;
            box-sizing: border-box !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-doc-header {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-doc-header-meta {
            width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
            text-align: left !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-col- desktop-only,
          .official-price-pdf-preview.is-mobile-reader .pdf-col-a4-only {
            display: none !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-col-principle {
            width: 50% !important;
            padding: 8px 6px !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-col-single {
            width: 21% !important;
            padding: 8px 4px !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-col-pack10 {
            width: 29% !important;
            padding: 8px 4px !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-mobile-inline-meta {
            display: flex !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-mobile-inline-savings {
            display: inline-block !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-qr-sla-footer {
            flex-direction: column !important;
            align-items: stretch !important;
            padding: 12px !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-qr-box {
            width: 100% !important;
            box-sizing: border-box !important;
            justify-content: flex-start !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-qr-text {
            max-width: none !important;
          }
          .official-price-pdf-preview.is-mobile-reader .pdf-bottom-legal {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
          }

          /* Mode 2: 📄 True A4 Sheet Viewer Mode (Auto-Scaled Paper Sheet) */
          .official-price-pdf-preview.is-a4-sheet {
            width: 860px !important;
            min-width: 860px !important;
            max-width: 860px !important;
            padding: 2rem 2.25rem !important;
            zoom: ${a4ZoomScale};
            transform-origin: top center;
            margin: 0 auto !important;
          }
        }

        /* Print Override — ALWAYS Print True Full 7-Column A4 Document */
        @media print {
          body * {
            visibility: hidden;
          }
          .official-price-pdf-preview,
          .official-price-pdf-preview * {
            visibility: visible;
          }
          .official-price-pdf-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            zoom: 1 !important;
            transform: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .pdf-preview-no-print {
            display: none !important;
          }
          .official-price-pdf-preview .pdf-col-a4-only {
            display: table-cell !important;
          }
          .official-price-pdf-preview .pdf-mobile-inline-meta,
          .official-price-pdf-preview .pdf-mobile-inline-savings {
            display: none !important;
          }
          .official-price-pdf-preview .pdf-kpi-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          .official-price-pdf-preview .pdf-doc-header {
            flex-direction: row !important;
          }
          .official-price-pdf-preview .pdf-qr-sla-footer {
            flex-direction: row !important;
          }
          .official-price-pdf-preview thead {
            display: table-header-group !important;
          }
          .official-price-pdf-preview tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      {/* ── Top Sticky Document Viewer AppBar (Google Drive / GCP Standard) ── */}
      <div
        className="pdf-preview-no-print pdf-toolbar-shell"
        style={{
          width: '100%',
          maxWidth: '940px',
          background: '#ffffff',
          borderRadius: '0 0 8px 8px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Row 1 on Mobile / Left Group on Desktop */}
        <div className="pdf-toolbar-row1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flex: '1 1 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {/* Mobile-first Close Icon Button on the Left (Google Drive Viewer Pattern) */}
            <button
              type="button"
              onClick={onClose}
              className="pdf-mobile-only"
              aria-label={isEs ? 'Cerrar visor' : 'Close viewer'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #dadce0',
                background: '#f8fafc',
                color: '#334155',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                padding: 0
              }}
            >
              <X size={16} />
            </button>

            <div className="pdf-desktop-only" style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: '#e8f0fe',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={16} color="#1a73e8" />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 800,
                fontSize: '0.86rem',
                color: '#202124',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {isEs ? 'Tarifa Oficial B2B (PDF A4)' : 'Official B2B Schedule (A4)'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontWeight: 700, color: '#1a73e8' }}>
                  {products.length} {isEs ? 'Viales' : 'Items'} · {currency}
                </span>
                <span className="pdf-desktop-only">• {isEs ? 'Listo para Imprimir o Guardar PDF' : 'A4 Print & PDF Export Ready'}</span>
              </div>
            </div>
          </div>

          {/* Mobile Row 1 Right: Language + Primary PDF Print/Save CTA */}
          <div className="pdf-mobile-only" style={{ alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              padding: '2px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0'
            }}>
              {['en', 'es'].map((code) => {
                const active = pdfLang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setPdfLang(code)}
                    style={{
                      border: 'none',
                      background: active ? '#1a73e8' : 'transparent',
                      color: active ? '#ffffff' : '#475569',
                      fontWeight: active ? 800 : 600,
                      fontSize: '0.68rem',
                      padding: '4px 7px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    {code}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#1a73e8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(26,115,232,0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              <Printer size={13} />
              <span>{isEs ? 'PDF / Imprimir' : 'Save PDF'}</span>
            </button>
          </div>
        </div>

        {/* Row 2 on Mobile / Right Controls on Desktop */}
        <div className="pdf-toolbar-row2" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Grouping Mode Switcher: By Category (Default) vs Continuous */}
          <div style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => setGroupByCategory(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                background: groupByCategory ? '#ffffff' : 'transparent',
                color: groupByCategory ? '#0f172a' : '#64748b',
                fontWeight: groupByCategory ? 700 : 500,
                fontSize: '0.71rem',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: groupByCategory ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Layers size={12} />
              <span>{isEs ? 'Categorías' : 'Categories'}</span>
            </button>
            <button
              type="button"
              onClick={() => setGroupByCategory(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                background: !groupByCategory ? '#ffffff' : 'transparent',
                color: !groupByCategory ? '#0f172a' : '#64748b',
                fontWeight: !groupByCategory ? 700 : 500,
                fontSize: '0.71rem',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: !groupByCategory ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <List size={12} />
              <span>{isEs ? 'Continua' : 'Continuous'}</span>
            </button>
          </div>

          {/* Mobile View Mode Switcher: 📱 Mobile Reader vs 📄 A4 Sheet */}
          <div className="pdf-mobile-only" style={{
            background: '#f1f5f9',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => setMobileViewMode('mobile')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                background: mobileViewMode === 'mobile' ? '#003666' : 'transparent',
                color: mobileViewMode === 'mobile' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.70rem',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <Smartphone size={12} />
              <span>{isEs ? 'Vista Móvil' : 'Mobile View'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileViewMode('a4')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                background: mobileViewMode === 'a4' ? '#003666' : 'transparent',
                color: mobileViewMode === 'a4' ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.70rem',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <FileText size={12} />
              <span>{isEs ? 'Hoja A4' : 'A4 Sheet'}</span>
            </button>
          </div>

          {/* Desktop-Only Language + Print + Close Controls */}
          <div className="pdf-desktop-only" style={{
            background: '#f1f5f9',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            {[
              { code: 'en', label: 'EN' },
              { code: 'es', label: 'ES' }
            ].map((item) => {
              const active = pdfLang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setPdfLang(item.code)}
                  style={{
                    border: 'none',
                    background: active ? '#1a73e8' : 'transparent',
                    color: active ? '#ffffff' : '#475569',
                    fontWeight: active ? 800 : 600,
                    fontSize: '0.72rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="pdf-desktop-only"
            style={{
              alignItems: 'center',
              gap: '6px',
              background: '#1a73e8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 14px',
              fontSize: '0.80rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(60,64,67,0.3)'
            }}
          >
            <Printer size={14} />
            <span>{isEs ? 'Imprimir / Guardar PDF' : 'Print / Save as PDF'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="pdf-desktop-only"
            style={{
              alignItems: 'center',
              gap: '4px',
              background: '#ffffff',
              border: '1px solid #dadce0',
              color: '#5f6368',
              borderRadius: '6px',
              padding: '7px 12px',
              fontSize: '0.80rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <X size={14} />
            <span>{isEs ? 'Cerrar' : 'Close'}</span>
          </button>
        </div>
      </div>

      {/* ── Document Container (Google Cloud Console A4 / Mobile Adaptive Layout) ── */}
      <div
        className={`official-price-pdf-preview ${mobileViewMode === 'a4' ? 'is-a4-sheet' : 'is-mobile-reader'}`}
        style={{
          width: '100%',
          maxWidth: '940px',
          background: '#ffffff',
          borderRadius: '6px',
          padding: '2.25rem 2.75rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          color: '#202124',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Document Header (GCP Two-Column Key-Value Resource Block) */}
        <div
          className="pdf-doc-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2.5px solid #003666',
            paddingBottom: '14px',
            marginBottom: '16px'
          }}
        >
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#0d9488',
                flexShrink: 0
              }} />
              <span style={{ fontSize: '8.2pt', fontWeight: 800, color: '#003666', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {isEs ? 'ATLAS HEALTH SERVICES · SUMINISTRO CLÍNICO' : 'ATLAS HEALTH SERVICES · CLINICAL SUPPLY'}
              </span>
            </div>
            <h1 style={{ margin: '5px 0 3px 0', fontSize: '15.5pt', fontWeight: 900, color: '#003666', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              {isEs
                ? 'Formulaciones de Péptidos Bioactivos · Tarifa Oficial B2B'
                : 'Bioactive Peptide Formulations · Official Price Schedule'}
            </h1>
            <p style={{ margin: 0, fontSize: '8pt', color: '#5f6368', lineHeight: 1.4 }}>
              {isEs
                ? 'Viales Liofilizados Estériles Certificados (Vidrio Borosilicato 10R USP Tipo I) · Pureza Analítica ≥99.0% HPLC'
                : 'Certified Lyophilized Bioactive Vials (10R Borosilicate USP Type I Glass) · Sterile Analytical Release ≥99.0% HPLC'}
            </p>
          </div>

          <div
            className="pdf-doc-header-meta"
            style={{
              textAlign: 'right',
              minWidth: '225px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '8px' }}>
              <span style={{ fontSize: '6.8pt', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                {isEs ? 'TARIFA:' : 'SCHEDULE:'}
              </span>
              <span style={{
                fontSize: '6.8pt',
                fontWeight: 800,
                background: isDistributor ? '#e8f0fe' : '#f0fdf4',
                color: isDistributor ? '#1a73e8' : '#166534',
                padding: '1px 6px',
                borderRadius: '3px',
                textTransform: 'uppercase'
              }}>
                {isDistributor
                  ? (isEs ? 'Nivel Distribuidor' : 'Distributor Tier')
                  : (isEs ? 'Mayorista & Clínicas' : 'Wholesaler B2B')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.2pt', color: '#64748b', marginBottom: '2px' }}>
              <span>{isEs ? 'CÓDIGO REF:' : 'REF CODE:'}</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 750, color: '#0f172a' }}>ATLAS-B2B-2026-Q4</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.2pt', color: '#64748b', marginBottom: '2px' }}>
              <span>{isEs ? 'PUREZA COA:' : 'BATCH COA:'}</span>
              <span style={{ fontWeight: 700, color: '#0d9488' }}>
                {isEs ? '≥99.0% HPLC Verificado' : '≥99.0% HPLC Validated'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.2pt', color: '#64748b' }}>
              <span>{isEs ? 'LOGÍSTICA:' : 'LOGÍSTICA / DISPATCH:'}</span>
              <span style={{ fontWeight: 600, color: '#475569' }}>
                {isEs ? 'Despacho Express UE & EAU' : 'UAE & EU Express Dispatch'}
              </span>
            </div>
          </div>
        </div>

        {/* GCP 4-Card Summary Strip (Rule #22 & Rule #8) */}
        <div
          className="pdf-kpi-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '16px'
          }}
        >
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 11px' }}>
            <div style={{ fontSize: '6.8pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              {isEs ? 'Divisa de Facturación' : 'Billing Currency'}
            </div>
            <div style={{ fontSize: '10.5pt', fontWeight: 800, color: '#003666', marginTop: '2px' }}>
              {currency} ({currencySymbol})
            </div>
            <div style={{ fontSize: '6.6pt', color: '#16a34a', fontWeight: 700, marginTop: '1px' }}>
              ● {isEs ? 'Tarifa Activa' : 'Active Quote'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 11px' }}>
            <div style={{ fontSize: '6.8pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              {isEs ? 'Formulaciones' : 'Catalog Depth'}
            </div>
            <div style={{ fontSize: '10.5pt', fontWeight: 800, color: '#202124', marginTop: '2px' }}>
              {products.length} {isEs ? 'Viales' : 'Items'}
            </div>
            <div style={{ fontSize: '6.6pt', color: '#5f6368', marginTop: '1px' }}>
              {isEs ? 'Viales Estériles 10R' : 'Sterile 10R Formulations'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 11px' }}>
            <div style={{ fontSize: '6.8pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              {isEs ? 'Ventaja Pack ×10' : 'Pack ×10 Advantage'}
            </div>
            <div style={{ fontSize: '10.5pt', fontWeight: 800, color: '#137333', marginTop: '2px' }}>
              -15% — -52%
            </div>
            <div style={{ fontSize: '6.6pt', color: '#137333', fontWeight: 650, marginTop: '1px' }}>
              {isEs ? 'Escala por volumen' : 'Wholesale volume tier'}
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '7px 11px' }}>
            <div style={{ fontSize: '6.8pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              {isEs ? 'Garantía Analítica' : 'Quality Release'}
            </div>
            <div style={{ fontSize: '10.5pt', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
              100% cGMP
            </div>
            <div style={{ fontSize: '6.6pt', color: '#0d9488', fontWeight: 650, marginTop: '1px' }}>
              {isEs ? 'Certificado COA por lote' : 'Batch analytical COA'}
            </div>
          </div>
        </div>

        {/* Official Pricing Table (GCP Dense Table Pattern - Zero Truncation & Mobile Collision-Free) */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '8pt',
          marginBottom: '18px',
          tableLayout: 'fixed'
        }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderTop: '1.5px solid #cbd5e1', borderBottom: '2px solid #cbd5e1' }}>
              <th className="pdf-col-a4-only" style={{ padding: '7px 5px', textAlign: 'center', width: '28px', fontWeight: 800, color: '#475569' }}>#</th>
              <th className="pdf-col-principle" style={{ padding: '7px 8px', textAlign: 'left', width: '34%', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Principio Activo & Composición' : 'Peptide Active Principle & Composition'}
              </th>
              <th className="pdf-col-a4-only" style={{ padding: '7px 6px', textAlign: 'center', width: '14%', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Concentración' : 'Strength'}
              </th>
              <th className="pdf-col-a4-only" style={{ padding: '7px 8px', textAlign: 'left', width: '17%', fontWeight: 700, color: '#475569' }}>
                {isEs ? 'Clase Terapéutica' : 'Therapeutic Class'}
              </th>
              <th className="pdf-col-single" style={{ padding: '7px 8px', textAlign: 'right', width: '11%', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Vial (1x)' : 'Single (1x)'}
              </th>
              <th className="pdf-col-pack10" style={{ padding: '7px 8px', textAlign: 'right', width: '14%', fontWeight: 800, color: '#137333' }}>
                {isEs ? 'Pack ×10 Viales' : 'Pack of 10 (×10)'}
              </th>
              <th className="pdf-col-a4-only" style={{ padding: '7px 5px', textAlign: 'center', width: '65px', fontWeight: 800, color: '#137333' }}>
                {isEs ? 'Ahorro' : 'Savings'}
              </th>
            </tr>
          </thead>
          <tbody>
            {groupedSections.map((section) => (
              <React.Fragment key={section.key}>
                {section.title && (
                  <tr style={{ background: '#e8f0fe', borderTop: '1.5px solid #bfdbfe', borderBottom: '1px solid #bfdbfe' }}>
                    <td
                      colSpan={7}
                      style={{
                        padding: '5px 10px',
                        fontWeight: 800,
                        fontSize: '7.8pt',
                        color: '#003666',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {section.title} ({section.items.length})
                    </td>
                  </tr>
                )}
                {section.items.map((p) => {
                  globalRowIndex += 1;
                  const rowNum = globalRowIndex;
                  const p10 = p.pack10Price || (p.unitPrice * 10 * 0.85);
                  const perUnit = p.tier10UnitPrice || (p.unitPrice * 0.85);
                  const discountPct = Math.max(10, Math.round((1 - (p10 / (p.unitPrice * 10))) * 100));
                  const targetSlug = p.slug || p.productId || '';
                  const cleanDoseParam = (p.dosage || '').replace(/\s+/g, '').toLowerCase();
                  const publicUrl = `/p/${encodeURIComponent(targetSlug)}${cleanDoseParam ? `?dose=${encodeURIComponent(cleanDoseParam)}` : ''}`;

                  const parsedBlend = parsePeptideBlendDisplay(p.productName, p.dosage);
                  const casNumber = resolveCasForPdf(p.productName, p.casNumber);
                  const categoryLabel = isEs
                    ? (p?.categoryMeta?.labelEs || p?.categoryMeta?.label || 'Péptido Clínico')
                    : (p?.categoryMeta?.labelEn || p?.categoryMeta?.label || 'Clinical Peptide');

                  return (
                    <tr
                      key={p.id || rowNum}
                      style={{
                        borderBottom: '1px solid #e2e8f0',
                        background: rowNum % 2 === 1 ? '#ffffff' : '#f8fafc'
                      }}
                    >
                      {/* Col 1 (A4): Row Index */}
                      <td className="pdf-col-a4-only" style={{ padding: '6px 5px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b', fontSize: '7.2pt', verticalAlign: 'middle' }}>
                        {rowNum}
                      </td>

                      {/* Col 2: Principle + Composition + (Mobile Inline Strength & Category) */}
                      <td
                        className="pdf-col-principle"
                        style={{
                          padding: '6px 8px',
                          color: '#0f172a',
                          verticalAlign: 'middle',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontWeight: 800,
                              fontSize: '8.1pt',
                              color: '#0f172a',
                              textDecoration: 'none'
                            }}
                          >
                            {parsedBlend.mainTitle}
                          </a>
                          {p.fdaStatus && (
                            <span style={{
                              fontSize: '6.2pt',
                              fontWeight: 700,
                              color: p.fdaStatus.colorScheme?.text || '#065f46',
                              background: p.fdaStatus.colorScheme?.bg || '#ecfdf5',
                              border: `1px solid ${p.fdaStatus.colorScheme?.border || '#6ee7b7'}`,
                              padding: '0px 4px',
                              borderRadius: '3px',
                              whiteSpace: 'nowrap'
                            }}>
                              {p.fdaStatus.shortBadge || '503A'}
                            </span>
                          )}
                        </div>

                        {/* Mobile Reader Inline Dose & Category Pill (Hidden in A4 mode & Print) */}
                        <div
                          className="pdf-mobile-inline-meta"
                          style={{
                            display: 'none',
                            alignItems: 'center',
                            gap: '5px',
                            flexWrap: 'wrap',
                            marginTop: '3px'
                          }}
                        >
                          <span style={{
                            fontSize: '6.8pt',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: '#1a73e8',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}>
                            {parsedBlend.primaryDose}{parsedBlend.subDose ? ` (${parsedBlend.subDose})` : ''}
                          </span>
                          <span style={{
                            fontSize: '6.5pt',
                            color: '#475569',
                            fontWeight: 600
                          }}>
                            {categoryLabel}
                          </span>
                        </div>

                        {parsedBlend.compositionLine && (
                          <div style={{
                            fontSize: '6.9pt',
                            fontWeight: 650,
                            color: '#1a73e8',
                            marginTop: '2px',
                            lineHeight: 1.3
                          }}>
                            {parsedBlend.compositionLine}
                          </div>
                        )}
                        {casNumber && (
                          <div style={{
                            fontSize: '6.4pt',
                            color: '#64748b',
                            fontFamily: 'monospace',
                            marginTop: '1px'
                          }}>
                            CAS: {casNumber}
                          </div>
                        )}
                      </td>

                      {/* Col 3 (A4): Strength */}
                      <td
                        className="pdf-col-a4-only"
                        style={{
                          padding: '6px 6px',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          verticalAlign: 'middle',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '7.6pt', color: '#1a73e8', lineHeight: 1.25 }}>
                          {parsedBlend.primaryDose}
                        </div>
                        {parsedBlend.subDose && (
                          <div style={{ fontSize: '6.4pt', color: '#475569', fontWeight: 600, marginTop: '1px', lineHeight: 1.2 }}>
                            ({parsedBlend.subDose})
                          </div>
                        )}
                      </td>

                      {/* Col 4 (A4): Therapeutic Class */}
                      <td
                        className="pdf-col-a4-only"
                        style={{
                          padding: '6px 8px',
                          color: '#475569',
                          fontSize: '7.3pt',
                          verticalAlign: 'middle',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                          lineHeight: 1.25
                        }}
                      >
                        {categoryLabel}
                      </td>

                      {/* Col 5: Single Vial (1x) */}
                      <td
                        className="pdf-col-single"
                        style={{
                          padding: '6px 8px',
                          textAlign: 'right',
                          fontFamily: 'monospace',
                          fontWeight: 750,
                          color: '#202124',
                          fontVariantNumeric: 'tabular-nums',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {formatPrice(p.unitPrice)}
                      </td>

                      {/* Col 6: Box of 10 (×10) + Mobile Inline Savings Badge */}
                      <td
                        className="pdf-col-pack10"
                        style={{
                          padding: '6px 8px',
                          textAlign: 'right',
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          color: '#137333',
                          fontVariantNumeric: 'tabular-nums',
                          verticalAlign: 'middle'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', flexWrap: 'wrap' }}>
                          <span>{formatPrice(p10)}</span>
                          <span
                            className="pdf-mobile-inline-savings"
                            style={{
                              display: 'none',
                              fontSize: '6.2pt',
                              fontWeight: 800,
                              color: '#137333',
                              background: '#e6f4ea',
                              border: '1px solid #ceead6',
                              padding: '0px 4px',
                              borderRadius: '3px'
                            }}
                          >
                            -{discountPct}%
                          </span>
                        </div>
                        <div style={{ fontSize: '6.4pt', color: '#5f6368', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          ({formatPrice(perUnit)}/vial)
                        </div>
                      </td>

                      {/* Col 7 (A4): Savings Badge */}
                      <td className="pdf-col-a4-only" style={{ padding: '6px 5px', textAlign: 'center', verticalAlign: 'middle' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '6.8pt',
                          fontWeight: 800,
                          color: '#137333',
                          background: '#e6f4ea',
                          border: '1px solid #ceead6',
                          padding: '1px 5px',
                          borderRadius: '4px'
                        }}>
                          -{discountPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Regulatory, Quality Terms & Official QR Verification Block (Google Cloud SLA Pattern) */}
        <div
          className="pdf-qr-sla-footer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '12px',
            pageBreakInside: 'avoid',
            breakInside: 'avoid'
          }}
        >
          <div style={{ flex: 1, fontSize: '7.4pt', color: '#475569', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 800, color: '#003666', fontSize: '8pt', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              {isEs
                ? 'Garantía de Calidad Analítica & Condiciones Clínicas'
                : 'Quality Assurance & Institutional Clinical Terms'}
            </div>
            <p style={{ margin: '0 0 6px 0' }}>
              {isEs
                ? 'Todos los viales de péptidos se fabrican bajo estándares cGMP con pureza analítica verificada (≥99.0% HPLC y espectrometría de masas). Las formulaciones liofilizadas estériles están selladas al vacío en vidrio de borosilicato USP Tipo I (10R) para máxima estabilidad térmica en tránsito. Conservación tras reconstitución: 2°C – 8°C.'
                : 'All peptide vials are manufactured under cGMP standards with verified analytical purity (≥99.0% HPLC and Mass Spectrometry). Lyophilized sterile formulations are vacuum-sealed in USP Type I 10R borosilicate glass for room-temperature transit stability. Storage post-reconstitution: 2°C – 8°C.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '7pt', color: '#0f172a', fontWeight: 700 }}>
              <span>● {isEs ? 'Certificado de Análisis (COA) por Lote' : 'Batch Certificate of Analysis (COA)'}</span>
              <span>● {isEs ? 'Modelos Moleculares 3D & Reconstitución' : '3D Molecular Models & Reconstitution Math'}</span>
              <span>● {isEs ? 'Solicitud Proforma Online Directa' : 'Instant Online Proforma Ordering'}</span>
            </div>
          </div>

          {/* Official QR Code Replacing Plain URL */}
          <div
            className="pdf-qr-box"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '8px 10px',
              flexShrink: 0
            }}
          >
            <QRCodeSVG
              value={qrTargetUrl}
              size={68}
              level="M"
              includeMargin={false}
            />
            <div className="pdf-qr-text" style={{ maxWidth: '115px', fontSize: '6.6pt', lineHeight: 1.35, color: '#334155' }}>
              <div style={{ fontWeight: 800, color: '#003666', fontSize: '7pt', marginBottom: '2px', textTransform: 'uppercase' }}>
                {isEs ? 'Catálogo Digital Vivo' : 'Live Digital Catalog'}
              </div>
              <div>
                {isEs
                  ? 'Escanee el código QR para abrir el catálogo interactivo, fichas técnicas y pedidos.'
                  : 'Scan QR code to open the interactive price schedule, datasheets & proforma cart.'}
              </div>
            </div>
          </div>
        </div>

        {/* Clean Institutional Footer (No Incorrect Email, QR Verified) */}
        <div
          className="pdf-bottom-legal"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '8px',
            fontSize: '7pt',
            color: '#64748b'
          }}
        >
          <div style={{ fontWeight: 700, color: '#334155' }}>
            Atlas Health Services · Clinical Supply Division
          </div>
          <div>
            {isEs
              ? 'Tarifa Institucional Verificada · Documento Oficial A4'
              : 'Verified Institutional Schedule · Official A4 Document'}
          </div>
        </div>
      </div>
    </div>
  );
}
