'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Printer, Sparkles, Layers, List } from 'lucide-react';
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
    return {
      isBlend: true,
      mainTitle: 'GLOW Blend (3-Peptide Stack)',
      compositionLine: 'BPC-157 (10 mg) + TB-500 (10 mg) + GHK-Cu (50 mg)',
      primaryDose: '70 mg Total',
      subDose: '10 / 10 / 50 mg'
    };
  }

  if (upperName.startsWith('KLOW')) {
    return {
      isBlend: true,
      mainTitle: 'KLOW Blend (4-Peptide Stack)',
      compositionLine: 'BPC-157 (10 mg) + TB-500 (10 mg) + GHK-Cu (50 mg) + KPV (10 mg)',
      primaryDose: '80 mg Total',
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

    return {
      isBlend: true,
      mainTitle: baseTitle,
      compositionLine: paired,
      primaryDose: numericSum > 0 ? `${numericSum} mg Total` : doseParts.join(' + '),
      subDose: doseParts.map(d => d.replace(/\s*mg/i, '')).join(' / ') + ' mg'
    };
  }

  if (doseParts.length > 1) {
    const numericSum = doseParts.reduce((acc, part) => {
      const m = part.match(/(\d+(?:\.\d+)?)\s*mg/i);
      return m ? acc + parseFloat(m[1]) : acc;
    }, 0);
    return {
      isBlend: true,
      mainTitle: nameStr,
      compositionLine: null,
      primaryDose: numericSum > 0 ? `${numericSum} mg Total` : doseParts.join(' · '),
      subDose: doseParts.join(' + ')
    };
  }

  return {
    isBlend: false,
    mainTitle: nameStr,
    compositionLine: null,
    primaryDose: doseStr || '—',
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
  const [groupByCategory, setGroupByCategory] = useState(false);

  useEffect(() => {
    if (lang === 'es' || lang === 'en') {
      setPdfLang(lang);
    }
  }, [lang]);

  const isEs = pdfLang === 'es';

  const qrTargetUrl = useMemo(() => {
    const base = 'https://www.atlashealth-services.com/pricing/peptides';
    const params = new URLSearchParams();
    if (isDistributor) params.set('mode', 'distributor');
    if (isEs) params.set('lang', 'es');
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [isDistributor, isEs]);

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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.25rem 1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <style>{`
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
            max-width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .pdf-preview-no-print {
            display: none !important;
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

      {/* ── Top Floating Action Dock (GCP Sticky Action Bar) ── */}
      <div
        className="pdf-preview-no-print"
        style={{
          width: '100%',
          maxWidth: '940px',
          background: '#ffffff',
          borderRadius: '8px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '1rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
          position: 'sticky',
          top: 0,
          zIndex: 20
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: '#e8f0fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={16} color="#1a73e8" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.90rem', color: '#202124', lineHeight: 1.2 }}>
              {isEs ? 'Vista Previa Oficial de Tarifa B2B (A4)' : 'Official B2B Price Schedule Preview (A4)'}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{isEs ? 'Listo para Imprimir o Guardar en PDF' : 'A4 Print & PDF Export Ready'}</span>
              <span>•</span>
              <span style={{ fontWeight: 700, color: '#1a73e8' }}>
                {products.length} {isEs ? 'Formulaciones en' : 'Formulations in'} {currency}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Grouping Mode Switcher */}
          <div style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
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
                fontSize: '0.72rem',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: !groupByCategory ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <List size={12} />
              <span>{isEs ? 'Lista Continua' : 'Continuous'}</span>
            </button>
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
                fontSize: '0.72rem',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: groupByCategory ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Layers size={12} />
              <span>{isEs ? 'Por Categoría' : 'By Category'}</span>
            </button>
          </div>

          {/* Language Toggle Inside PDF Preview */}
          <div style={{
            display: 'inline-flex',
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
            style={{
              display: 'inline-flex',
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
            style={{
              display: 'inline-flex',
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

      {/* ── Document Container (Google Cloud Console A4 Layout) ── */}
      <div
        className="official-price-pdf-preview"
        style={{
          width: '100%',
          maxWidth: '940px',
          background: '#ffffff',
          borderRadius: '6px',
          padding: '2.25rem 2.75rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
          color: '#202124',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Document Header (GCP Two-Column Key-Value Resource Block) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '2.5px solid #003666',
          paddingBottom: '14px',
          marginBottom: '16px'
        }}>
          <div style={{ flex: 1, paddingRight: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#0d9488'
              }} />
              <span style={{ fontSize: '8.5pt', fontWeight: 800, color: '#003666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {isEs ? 'ATLAS HEALTH SERVICES · SUMINISTRO CLÍNICO' : 'ATLAS HEALTH SERVICES · CLINICAL SUPPLY'}
              </span>
            </div>
            <h1 style={{ margin: '5px 0 3px 0', fontSize: '16.5pt', fontWeight: 900, color: '#003666', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              {isEs
                ? 'Formulaciones de Péptidos Bioactivos · Tarifa Oficial B2B'
                : 'Bioactive Peptide Formulations · Official Price Schedule'}
            </h1>
            <p style={{ margin: 0, fontSize: '8.2pt', color: '#5f6368', lineHeight: 1.4 }}>
              {isEs
                ? 'Viales Liofilizados Estériles Certificados (Vidrio Borosilicato 10R USP Tipo I) · Pureza Analítica ≥99.0% HPLC'
                : 'Certified Lyophilized Bioactive Vials (10R Borosilicate USP Type I Glass) · Sterile Analytical Release ≥99.0% HPLC'}
            </p>
          </div>

          <div style={{
            textAlign: 'right',
            minWidth: '225px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '8px 12px'
          }}>
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
              <span>{isEs ? 'LOGÍSTICA:' : 'LOGISTICS:'}</span>
              <span style={{ fontWeight: 600, color: '#475569' }}>
                {isEs ? 'Despacho Express UE & EAU' : 'UAE & EU Express Dispatch'}
              </span>
            </div>
          </div>
        </div>

        {/* GCP 4-Card Summary Strip (Rule #22 & Rule #8) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          marginBottom: '16px'
        }}>
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
              {isEs ? 'Ventaja Caja ×10' : 'Box ×10 Advantage'}
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

        {/* Official Pricing Table (GCP Dense Table Pattern - Zero Truncation) */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '8pt',
          marginBottom: '18px',
          tableLayout: 'fixed'
        }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderTop: '1.5px solid #cbd5e1', borderBottom: '2px solid #cbd5e1' }}>
              <th style={{ padding: '7px 5px', textAlign: 'center', width: '28px', fontWeight: 800, color: '#475569' }}>#</th>
              <th style={{ padding: '7px 8px', textAlign: 'left', width: '34%', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Principio Activo & Composición' : 'Peptide Active Principle & Composition'}
              </th>
              <th style={{ padding: '7px 6px', textAlign: 'center', width: '14%', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Concentración' : 'Strength'}
              </th>
              <th style={{ padding: '7px 8px', textAlign: 'left', width: '17%', fontWeight: 700, color: '#475569' }}>
                {isEs ? 'Clase Terapéutica' : 'Therapeutic Class'}
              </th>
              <th style={{ padding: '7px 8px', textAlign: 'right', width: '11%', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Vial (1x)' : 'Single (1x)'}
              </th>
              <th style={{ padding: '7px 8px', textAlign: 'right', width: '14%', fontWeight: 800, color: '#137333' }}>
                {isEs ? 'Caja ×10 Viales' : 'Box of 10 (×10)'}
              </th>
              <th style={{ padding: '7px 5px', textAlign: 'center', width: '65px', fontWeight: 800, color: '#137333' }}>
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
                      <td style={{ padding: '6px 5px', textAlign: 'center', fontFamily: 'monospace', color: '#64748b', fontSize: '7.2pt', verticalAlign: 'middle' }}>
                        {rowNum}
                      </td>
                      <td style={{
                        padding: '6px 8px',
                        color: '#0f172a',
                        verticalAlign: 'middle',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal'
                      }}>
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
                      <td style={{
                        padding: '6px 6px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        verticalAlign: 'middle',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal'
                      }}>
                        <div style={{ fontWeight: 800, fontSize: '7.6pt', color: '#1a73e8', lineHeight: 1.25 }}>
                          {parsedBlend.primaryDose}
                        </div>
                        {parsedBlend.subDose && (
                          <div style={{ fontSize: '6.4pt', color: '#475569', fontWeight: 600, marginTop: '1px', lineHeight: 1.2 }}>
                            ({parsedBlend.subDose})
                          </div>
                        )}
                      </td>
                      <td style={{
                        padding: '6px 8px',
                        color: '#475569',
                        fontSize: '7.3pt',
                        verticalAlign: 'middle',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: 1.25
                      }}>
                        {categoryLabel}
                      </td>
                      <td style={{
                        padding: '6px 8px',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                        fontWeight: 750,
                        color: '#202124',
                        fontVariantNumeric: 'tabular-nums',
                        verticalAlign: 'middle'
                      }}>
                        {formatPrice(p.unitPrice)}
                      </td>
                      <td style={{
                        padding: '6px 8px',
                        textAlign: 'right',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        color: '#137333',
                        fontVariantNumeric: 'tabular-nums',
                        verticalAlign: 'middle'
                      }}>
                        <div>{formatPrice(p10)}</div>
                        <div style={{ fontSize: '6.5pt', color: '#5f6368', fontWeight: 500 }}>
                          ({formatPrice(perUnit)}/vial)
                        </div>
                      </td>
                      <td style={{ padding: '6px 5px', textAlign: 'center', verticalAlign: 'middle' }}>
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
        <div style={{
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
        }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '7pt', color: '#0f172a', fontWeight: 700 }}>
              <span>● {isEs ? 'Certificado de Análisis (COA) por Lote' : 'Batch Certificate of Analysis (COA)'}</span>
              <span>● {isEs ? 'Modelos Moleculares 3D & Reconstitución' : '3D Molecular Models & Reconstitution Math'}</span>
              <span>● {isEs ? 'Solicitud Proforma Online Directa' : 'Instant Online Proforma Ordering'}</span>
            </div>
          </div>

          {/* Official QR Code Replacing Plain URL */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '8px 10px',
            flexShrink: 0
          }}>
            <QRCodeSVG
              value={qrTargetUrl}
              size={68}
              level="M"
              includeMargin={false}
            />
            <div style={{ maxWidth: '115px', fontSize: '6.6pt', lineHeight: 1.35, color: '#334155' }}>
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '8px',
          fontSize: '7pt',
          color: '#64748b'
        }}>
          <div style={{ fontWeight: 700, color: '#334155' }}>
            Atlas Health Services · Mediluxe B2B Clinical Supply Division
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
