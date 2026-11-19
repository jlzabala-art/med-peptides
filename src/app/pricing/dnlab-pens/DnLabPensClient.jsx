'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Share2,
  Sliders,
  Info,
  Clock,
  ChevronRight,
  ChevronDown,
  Activity,
  Calculator,
  Check,
  Plus,
  Minus,
  Trash2,
  ThermometerSnowflake,
  ShieldCheck,
  LayoutGrid,
  List,
} from '@/lib/icons';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import PenDialVisualizer from '@/components/reconstitution/PenDialVisualizer';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import {
  generateAtlasPensDossierPdf,
  formatAtlasPenSku,
  computePerMlRatio,
} from '@/lib/pdf/pensDossierPdf';
import './dnlab-pens.css';

function scaleDoseBreakdown(breakdown = '', baseClicks = 10, targetClicks = 10) {
  if (!breakdown) return `${targetClicks} units active`;
  const base = Number(baseClicks) || 10;
  const target = Number(targetClicks) || base;
  if (base <= 0 || Math.abs(target - base) < 0.01) return breakdown;
  const ratio = target / base;

  return String(breakdown).replace(
    /(\d+(?:\.\d+)?)\s*(mcg|mg|iu)\b/gi,
    (_, numStr, unit) => {
      const scaled = parseFloat(numStr) * ratio;
      const rounded = scaled >= 100 ? Math.round(scaled) : Number(scaled.toFixed(2));
      return `${rounded} ${unit}`;
    }
  );
}

function getCalculatorUrlForPen(row, variant, lang = 'en') {
  const baseName = String(row?.name || 'BPC-157').split('/')[0].split('(')[0].trim();
  const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const firstStrengthMatch = String(variant?.concentration || '').match(/\d+(?:\.\d+)?\s*(?:mg|mcg|iu)/i);
  const strength = firstStrengthMatch ? firstStrengthMatch[0].replace(/\s+/g, '') : '10mg';
  const params = new URLSearchParams({
    peptide: slug || 'bpc-157',
    format: 'pen',
    strength,
  });
  if (lang === 'es') params.set('lang', 'es');
  return `/calculator?${params.toString()}`;
}

function getDosesPerPen(variant) {
  const totalU = Number(variant?.totalUnits) || 300;
  const doseU = Number(variant?.clicksPerDose || variant?.recommendedDoseUnits) || 10;
  return Math.max(1, Math.floor(totalU / Math.max(1, doseU)));
}

/**
 * PenEditorialCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Signature Swiss-Clinic visual dosing card (inspired by LXV Peptide Pen Guide).
 * Renders cleanly full-width (Rule #70: zero odd orphan cards!) on desktop & mobile:
 *  - Colored specialty circle number + Peptide Name + Copyable Atlas SKU + right mg/mL ratio
 *  - Interactive variant switcher pills when multiple strengths exist
 *  - Hero 3-Metric strip with 3px vertical specialty accent bars: DOSE | U-100 PEN DIAL | FREQUENCY
 *  - Secondary 3-column strip: CYCLE DURATION | YIELD / PEN | tinted PEN SPEC pill
 *  - Protocol Builder (+ Protocol / qty stepper) + expandable Live Dial Simulator
 */
function PenEditorialCard({
  row,
  displayIndex,
  activeVariantIdx = 0,
  onSelectVariant,
  protocolQty = 0,
  onSetProtocolQty,
  isExpanded = false,
  onToggleExpand,
  renderDetailPanel,
  onPrescribe,
  isEs,
  lang,
}) {
  const variants = Array.isArray(row.variants) && row.variants.length > 0 ? row.variants : [{}];
  const safeIdx = Math.min(activeVariantIdx, variants.length - 1);
  const variant = variants[safeIdx] || variants[0];
  const accentColor = row.categoryColor || '#1d4ed8';
  const atlasSku = formatAtlasPenSku(row.sku, displayIndex);
  const perMlRatio = computePerMlRatio(variant.concentration, variant.volume);
  const clicksLabel = variant.clicksRange || String(variant.clicksPerDose || 10);
  const yieldLabel =
    variant.dosesPerPenLabel ||
    `${getDosesPerPen(variant)} ${isEs ? 'dosis' : 'doses'}`;
  const calcHref = getCalculatorUrlForPen(row, variant, lang);

  return (
    <article
      className={`atlas-pen-editorial-card ${protocolQty > 0 ? 'in-protocol' : ''}`}
      style={protocolQty > 0 ? { borderColor: accentColor } : undefined}
    >
      {/* Card Header Row */}
      <div className="atlas-pen-ec-head">
        <div className="atlas-pen-ec-identity">
          <span
            className="atlas-pen-ec-circle"
            style={{ backgroundColor: accentColor }}
          >
            {displayIndex}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 className="atlas-pen-ec-title">{row.name}</h3>
              <CopyableId value={atlasSku} displayValue={atlasSku} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
              <span
                style={{
                  fontSize: '0.67rem',
                  fontWeight: 700,
                  color: accentColor,
                  background: row.categoryBg || '#f1f5f9',
                  border: `1px solid ${row.categoryBorder || '#e2e8f0'}`,
                  padding: '1px 7px',
                  borderRadius: '999px',
                }}
              >
                {row.category}
              </span>
              <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                {variant.volume || '3 mL'} · {variant.totalUnits || 300} IU
              </span>
            </div>
          </div>
        </div>

        <div className="atlas-pen-ec-ratio-wrap">
          <span className="atlas-pen-ec-ratio">{perMlRatio}</span>
          {variants.length > 1 && (
            <div className="atlas-pen-ec-variant-pills" role="group" aria-label={isEs ? 'Concentración' : 'Strength'}>
              {variants.map((v, idx) => {
                const active = idx === safeIdx;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onSelectVariant?.(idx)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: active ? `1.5px solid ${accentColor}` : '1px solid #cbd5e1',
                      background: active ? (row.categoryBg || '#eff6ff') : '#ffffff',
                      color: active ? accentColor : '#475569',
                      fontSize: '0.70rem',
                      fontWeight: active ? 800 : 650,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {v.concentration}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Hero 3-Metric Row with Signature 3px Vertical Specialty Accent Bars */}
      <div className="atlas-pen-ec-metrics">
        <div className="atlas-pen-ec-metric" style={{ '--pen-accent': accentColor }}>
          <span className="atlas-pen-ec-metric-label">{isEs ? 'DOSIS ACTIVA' : 'DOSE'}</span>
          <span className="atlas-pen-ec-metric-val">{variant.doseBreakdown}</span>
        </div>

        <div className="atlas-pen-ec-metric" style={{ '--pen-accent': accentColor }}>
          <span className="atlas-pen-ec-metric-label">{isEs ? 'DIAL PEN (U-100)' : 'U-100 PEN DIAL'}</span>
          <span className="atlas-pen-ec-metric-val">
            {clicksLabel} {isEs ? 'clics' : 'clicks'}
          </span>
        </div>

        <div className="atlas-pen-ec-metric" style={{ '--pen-accent': accentColor }}>
          <span className="atlas-pen-ec-metric-label">{isEs ? 'FRECUENCIA' : 'FREQUENCY'}</span>
          <span className="atlas-pen-ec-metric-val">{variant.frequency}</span>
        </div>
      </div>

      {/* Secondary 3-Column Row: CYCLE DURATION | YIELD / PEN | TINTED PEN SPEC PILL */}
      <div className="atlas-pen-ec-secondary">
        <div className="atlas-pen-ec-sec-item">
          <span className="atlas-pen-ec-sec-label">{isEs ? 'DURACIÓN DEL CICLO' : 'CYCLE DURATION'}</span>
          <span className="atlas-pen-ec-sec-val">{variant.cycleDuration || '4 to 6 weeks'}</span>
        </div>

        <div className="atlas-pen-ec-sec-item">
          <span className="atlas-pen-ec-sec-label">{isEs ? 'RENDIMIENTO / PEN' : 'YIELD / PEN'}</span>
          <span className="atlas-pen-ec-sec-val">{yieldLabel}</span>
        </div>

        <div className="atlas-pen-ec-spec-pill">
          <span className="atlas-pen-ec-sec-label">
            {protocolQty > 0
              ? (isEs ? 'PLUMAS EN PROTOCOLO' : 'PENS IN PROTOCOL')
              : (isEs ? 'PRESENTACIÓN' : 'PEN SPECIFICATION')}
          </span>
          <span className="atlas-pen-ec-spec-val" style={{ color: accentColor }}>
            {protocolQty > 0
              ? `${protocolQty} × ${variant.concentration} (${variant.volume || '3 mL'})`
              : `${variant.concentration} · ${variant.volume || '3 mL'} Pen`}
          </span>
        </div>
      </div>

      {/* Clinical Footnote + Action Utility Bar */}
      <div className="atlas-pen-ec-footer">
        <p className="atlas-pen-ec-footnote">
          <strong>{isEs ? 'Indicaciones y momento:' : 'Clinical notes & timing:'}</strong>{' '}
          {row.description}{' '}
          {row.timing && (
            <span style={{ color: '#0369a1', fontWeight: 650 }}>
              ({isEs ? 'Momento' : 'Timing'}: {row.timing}.)
            </span>
          )}
        </p>

        <div className="atlas-pen-ec-actions">
          {/* Protocol Builder Toggle / Stepper (feeds Supply Summary & 1-Page Protocol PDF) */}
          {protocolQty > 0 ? (
            <div className="atlas-pen-ec-stepper" style={{ borderColor: accentColor }}>
              <button
                type="button"
                onClick={() => onSetProtocolQty?.(protocolQty - 1)}
                aria-label={isEs ? 'Quitar 1 pen' : 'Decrease pens'}
              >
                <Minus size={13} />
              </button>
              <span style={{ color: accentColor }}>
                {protocolQty} {protocolQty === 1 ? 'pen' : 'pens'}
              </span>
              <button
                type="button"
                onClick={() => onSetProtocolQty?.(protocolQty + 1)}
                aria-label={isEs ? 'Añadir 1 pen' : 'Increase pens'}
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="gcp-btn-secondary atlas-pen-ec-btn"
              onClick={() => onSetProtocolQty?.(1)}
            >
              <Plus size={13} />
              <span>{isEs ? 'Añadir a Guía PDF' : 'Add to Protocol'}</span>
            </button>
          )}

          <button
            type="button"
            className={`gcp-btn-secondary atlas-pen-ec-btn ${isExpanded ? 'is-open' : ''}`}
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
          >
            <Sliders size={13} />
            <span>{isExpanded ? (isEs ? 'Ocultar Simulador' : 'Hide Dial Sim') : (isEs ? 'Simulador Dial' : 'Dial Simulator')}</span>
            <ChevronDown
              size={13}
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
            />
          </button>

          <Link href={calcHref} className="gcp-btn-secondary atlas-pen-ec-btn" style={{ textDecoration: 'none' }}>
            <Calculator size={13} />
            <span>{isEs ? 'Guía Paciente' : 'Patient Guide'}</span>
          </Link>

          <button
            type="button"
            className="gcp-btn-secondary atlas-pen-ec-btn"
            onClick={() => onPrescribe?.(row)}
          >
            <span>{isEs ? 'Prescribir' : 'Prescribe'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Interactive Dial Simulator & Clinical Specs */}
      {isExpanded && renderDetailPanel && (
        <div style={{ borderTop: '1px solid #e2e8f0' }}>
          {renderDetailPanel(row)}
        </div>
      )}
    </article>
  );
}

export default function DnLabPensClient({
  initialProducts = [],
  initialCurrency = 'USD',
  initialLang = 'en',
}) {
  const workspace = usePublicWorkspace();
  const [localLang, setLocalLang] = useState(initialLang === 'es' ? 'es' : 'en');
  const lang = workspace?.lang || localLang || 'en';
  const isEs = lang === 'es';
  const currency = workspace?.currency || initialCurrency || 'USD';

  useEffect(() => {
    if (initialLang === 'es' && workspace?.setLang && workspace?.lang !== 'es') {
      workspace.setLang('es');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLangChange = useCallback(
    (nextLang) => {
      const normalized = nextLang === 'es' ? 'es' : 'en';
      setLocalLang(normalized);
      if (workspace?.setLang) workspace.setLang(normalized);
    },
    [workspace]
  );

  const handleCurrencyChange = useCallback(
    (nextCur) => {
      if (workspace?.setCurrency) workspace.setCurrency(nextCur);
    },
    [workspace]
  );

  const [viewMode, setViewMode] = useState('cards'); // 'cards' (default editorial brochure) | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedItemForInquiry, setSelectedItemForInquiry] = useState(null);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Per-row interactive variant index, expanded simulator state, dial slider, & protocol selection
  const [selectedVariantIdx, setSelectedVariantIdx] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const [dialSettings, setDialSettings] = useState({});
  // Protocol Builder: { [productId]: { variantIdx: number, qty: number } }
  const [protocolSelection, setProtocolSelection] = useState({});

  const categories = useMemo(() => {
    const counts = new Map();
    initialProducts.forEach((p) => {
      if (p.category) counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });
    return [
      { id: 'ALL', label: isEs ? 'Todas las Plumas' : 'All Pens', count: initialProducts.length },
      ...Array.from(counts.entries()).map(([cat, count]) => ({ id: cat, label: cat, count })),
    ];
  }, [initialProducts, isEs]);

  const filteredProducts = useMemo(() => {
    let list = initialProducts;
    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery && searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const atlasSku = formatAtlasPenSku(p.sku, p.itemNumber).toLowerCase();
        return (
          (p.name || '').toLowerCase().includes(q) ||
          atlasSku.includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.timing || '').toLowerCase().includes(q) ||
          (p.variants || []).some(
            (v) =>
              (v.concentration || '').toLowerCase().includes(q) ||
              (v.doseBreakdown || '').toLowerCase().includes(q)
          )
        );
      });
    }
    return list;
  }, [initialProducts, selectedCategory, searchQuery]);

  // Group filtered products by therapeutic specialty for the Visual Cards view
  const groupedProducts = useMemo(() => {
    const map = new Map();
    filteredProducts.forEach((p) => {
      const cat = p.category || (isEs ? 'Péptidos Clínicos' : 'Clinical Peptides');
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(p);
    });
    return Array.from(map.entries());
  }, [filteredProducts, isEs]);

  // Resolved protocol items for SUPPLY SUMMARY & 1-Page Personalized PDF
  const protocolItemsList = useMemo(() => {
    const out = [];
    for (const [productId, entry] of Object.entries(protocolSelection)) {
      if (!entry || entry.qty <= 0) continue;
      const product = initialProducts.find((p) => p.id === productId);
      if (!product) continue;
      const variants = product.variants || [{}];
      const vIdx = Math.min(entry.variantIdx ?? (selectedVariantIdx[productId] ?? 0), variants.length - 1);
      out.push({
        product,
        variant: variants[vIdx] || variants[0],
        qty: entry.qty,
      });
    }
    return out;
  }, [protocolSelection, initialProducts, selectedVariantIdx]);

  const totalProtocolPens = useMemo(
    () => protocolItemsList.reduce((acc, it) => acc + it.qty, 0),
    [protocolItemsList]
  );

  const totalVariantsCount = useMemo(
    () => initialProducts.reduce((acc, p) => acc + (p.variants?.length || 1), 0),
    [initialProducts]
  );

  const handleSetProtocolQty = useCallback(
    (productId, nextQty) => {
      setProtocolSelection((prev) => {
        const next = { ...prev };
        if (nextQty <= 0) {
          delete next[productId];
        } else {
          next[productId] = {
            variantIdx: selectedVariantIdx[productId] ?? prev[productId]?.variantIdx ?? 0,
            qty: nextQty,
          };
        }
        return next;
      });
    },
    [selectedVariantIdx]
  );

  const handleSelectVariantForProduct = useCallback((productId, vIdx) => {
    setSelectedVariantIdx((prev) => ({ ...prev, [productId]: vIdx }));
    setProtocolSelection((prev) => {
      if (!prev[productId]) return prev;
      return { ...prev, [productId]: { ...prev[productId], variantIdx: vIdx } };
    });
  }, []);

  const handleExportPdf = useCallback(
    async ({ forceFullFormulary = false } = {}) => {
      if (isExportingPdf) return;
      setIsExportingPdf(true);
      try {
        const useProtocol = !forceFullFormulary && protocolItemsList.length > 0;
        await generateAtlasPensDossierPdf({
          products: filteredProducts.length > 0 ? filteredProducts : initialProducts,
          protocolItems: useProtocol ? protocolItemsList : [],
          selectedVariants: selectedVariantIdx,
          lang,
          selectedCategory,
        });
        toast.success(
          useProtocol
            ? (isEs
                ? `Guía visual de protocolo (${totalProtocolPens} pens) lista ✓`
                : `Personalized pen dosing guide (${totalProtocolPens} pens) ready ✓`)
            : (isEs
                ? 'Guía clínica visual PDF lista para previsualización ✓'
                : 'Visual clinical pen dosing guide ready for preview ✓')
        );
      } catch (err) {
        console.error('[PensPDF] Error generating PDF:', err);
        toast.error(isEs ? 'No se pudo generar el PDF' : 'Could not generate PDF');
      } finally {
        setIsExportingPdf(false);
      }
    },
    [
      isExportingPdf,
      protocolItemsList,
      filteredProducts,
      initialProducts,
      selectedVariantIdx,
      lang,
      selectedCategory,
      isEs,
      totalProtocolPens,
    ]
  );

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const shareUrlObj = new URL('/pricing/pens', window.location.origin);
    if (lang === 'es') shareUrlObj.searchParams.set('lang', 'es');
    if (currency !== 'USD') shareUrlObj.searchParams.set('currency', currency);
    const shareUrl = shareUrlObj.toString();

    const title = isEs
      ? 'Atlas Health Services · Guía Visual de Plumas Precargadas de Péptidos'
      : 'Atlas Health Services · Peptide Pen Dosing Guide & Clinical Formulary';
    const text = isEs
      ? 'Guía clínica oficial de Atlas Health Services para plumas precargadas multidosis: dosis activa, clics U-100, frecuencia y rendimiento por pluma.'
      : 'Official Atlas Health Services clinical dosing guide for multi-dose pre-filled peptide pens: exact dose, U-100 dial clicks, frequency, and pen yield.';

    const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');
    if (isMobile && typeof navigator?.share === 'function') {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      toast.success(isEs ? 'Enlace de catálogo Atlas copiado ✓' : 'Atlas portfolio link copied ✓');
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {
      toast.error(isEs ? 'No se pudo copiar el enlace' : 'Copy failed');
    }
  }, [lang, currency, isEs]);

  // Register contextual state for Atlas AI & mutual exclusion with Supply Summary Dock (Rule #69)
  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'pens_pricing',
        name: isEs ? 'Guía de Plumas Precargadas' : 'Peptide Pen Dosing Guide',
      },
      bottomBar: {
        hidden: protocolItemsList.length > 0,
        summaryTitle: isEs ? 'Guía de Plumas Precargadas' : 'Peptide Pen Dosing Guide',
        summarySubtitle: `${filteredProducts.length} ${isEs ? 'fórmulas' : 'formulas'} · 100 clicks = 1 mL`,
        atlasAiLabel: isEs ? 'Consultar a Atlas AI' : 'Ask Atlas AI',
        primaryAction: {
          label: isEs ? 'Guía PDF' : 'Export PDF Guide',
          onClick: () => handleExportPdf(),
        },
      },
    },
    [isEs, filteredProducts.length, protocolItemsList.length, handleExportPdf]
  );

  // Master-Detail Live Dial Simulator (used inside both Visual Cards and Compact Table)
  const renderDetailPanel = useCallback(
    (row) => {
      const variants = Array.isArray(row.variants) && row.variants.length > 0 ? row.variants : [];
      const activeIdx = Math.min(selectedVariantIdx[row.id] ?? 0, Math.max(0, variants.length - 1));
      const currentVariant = variants[activeIdx] || {};
      const defaultClicks = Number(currentVariant.clicksPerDose || currentVariant.recommendedDoseUnits) || 10;
      const sliderKey = `${row.id}::${currentVariant.id || activeIdx}`;
      const currentUnits = dialSettings[sliderKey] ?? defaultClicks;
      const totalUnitsInCartridge = Number(currentVariant.totalUnits) || 300;
      const totalDosesAtSetting = Math.max(1, Math.floor(totalUnitsInCartridge / Math.max(1, currentUnits)));
      const volumeMl = Number((currentUnits * 0.01).toFixed(2));
      const dynamicDoseBreakdown = scaleDoseBreakdown(currentVariant.doseBreakdown, defaultClicks, currentUnits);
      const calcHref = getCalculatorUrlForPen(row, currentVariant, lang);
      const sliderMax = Math.max(50, defaultClicks);

      return (
        <div className="dnlab-detail-panel">
          {/* Left: Clinical Profile & Visual Pen Dial */}
          <div className="dnlab-detail-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="#003666" />
                <h4 style={{ margin: 0, fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Especificaciones & Dial Visual' : 'Clinical Specs & Visual Dial'}
                </h4>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '999px' }}>
                {row.purity}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {row.timing && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '0.76rem', color: '#334155' }}>
                  <Clock size={14} color="#003666" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    <b>{isEs ? 'Momento Óptimo:' : 'Optimal Timing:'}</b> {row.timing}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '0.76rem', color: '#334155' }}>
                <ThermometerSnowflake size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <b>{isEs ? 'Conservación / BUD:' : 'Cold-Chain / BUD:'}</b> {row.storage}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '0.76rem', color: '#334155' }}>
                <Info size={14} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <b>{isEs ? 'Aguja Estándar:' : 'Pen Needle Standard:'}</b> {row.needle}
                </span>
              </div>
            </div>

            <PenDialVisualizer
              penClicks={currentUnits}
              volumeMl={volumeMl}
              totalDoses={totalDosesAtSetting}
              strengthLabel={`${currentVariant.concentration || ''} (${currentVariant.volume || '3 mL'})`}
              isCartridge={false}
              lang={lang}
            />
          </div>

          {/* Right: Live Proportional Click-to-Dose Simulator */}
          <div className="dnlab-detail-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="#1a73e8" />
                <h4 style={{ margin: 0, fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Simulador Interactivo de Clics' : 'Live Click-to-Dose Simulator'}
                </h4>
              </div>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
                {currentVariant.volume || '3 mL'} · {totalUnitsInCartridge} IU
              </span>
            </div>

            {variants.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {isEs ? 'Concentración:' : 'Strength:'}
                </span>
                {variants.map((v, idx) => {
                  const isSel = idx === activeIdx;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectVariantForProduct(row.id, idx)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '7px',
                        border: isSel ? '1.5px solid #003666' : '1px solid #cbd5e1',
                        background: isSel ? '#003666' : '#ffffff',
                        color: isSel ? '#ffffff' : '#334155',
                        fontSize: '0.73rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {v.concentration} ({v.volume || '3 mL'})
                    </button>
                  );
                })}
              </div>
            )}

            <div className="dnlab-dial-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', gap: '8px' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155' }}>
                  {isEs ? 'Ajuste del Dial (1 clic = 0.01 mL):' : 'Dial Setting (1 click = 0.01 mL):'}
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#003666', fontVariantNumeric: 'tabular-nums' }}>
                  {currentUnits} {isEs ? 'clics' : 'clicks'} ({volumeMl.toFixed(2)} mL)
                </span>
              </div>

              <input
                type="range"
                min="2"
                max={sliderMax}
                step="1"
                value={currentUnits}
                onChange={(e) => setDialSettings((prev) => ({ ...prev, [sliderKey]: Number(e.target.value) }))}
                className="dnlab-slider"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
                <span>2 {isEs ? 'clics' : 'clicks'}</span>
                <button
                  type="button"
                  onClick={() => setDialSettings((prev) => ({ ...prev, [sliderKey]: defaultClicks }))}
                  style={{
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#003666',
                    borderRadius: '999px',
                    padding: '2px 9px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isEs ? `Estándar (${defaultClicks} clics)` : `Standard (${defaultClicks} clicks)`}
                </button>
                <span>{sliderMax} {isEs ? 'clics' : 'clicks'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 750 }}>
                  {isEs ? 'Dosis Activa Real / Inyección' : 'Live Active Dose / Injection'}
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginTop: '3px', fontVariantNumeric: 'tabular-nums' }}>
                  {dynamicDoseBreakdown}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
                  {currentVariant.frequency}
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '10px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.66rem', color: '#047857', textTransform: 'uppercase', fontWeight: 750 }}>
                  {isEs ? 'Rendimiento del Pen' : 'Est. Yield per Pen'}
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#065f46', marginTop: '3px', fontVariantNumeric: 'tabular-nums' }}>
                  {totalDosesAtSetting} {isEs ? 'dosis' : 'doses'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#047857', marginTop: '2px' }}>
                  {isEs ? 'Estabilidad 30 días en frío (BUD)' : '30-day cold-chain BUD once pierced'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
              <Link
                href={calcHref}
                className="gcp-btn-primary"
                style={{ flex: '1 1 170px', justifyContent: 'center', fontSize: '0.78rem', padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Calculator size={14} />
                <span>{isEs ? 'Guía Paciente (QR / URL)' : 'Patient Guide (QR / URL)'}</span>
              </Link>
              <Link
                href={`/labels?search=${encodeURIComponent(row.name)}`}
                className="gcp-btn-secondary"
                style={{ justifyContent: 'center', fontSize: '0.76rem', padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <span>Labels Studio</span>
              </Link>
            </div>
          </div>
        </div>
      );
    },
    [selectedVariantIdx, dialSettings, isEs, lang, handleSelectVariantForProduct]
  );

  // Compact Table Mode Columns (Optional toggle for physicians who prefer dense spreadsheet view)
  const tableColumns = useMemo(
    () => [
      {
        key: 'name',
        header: isEs ? 'Péptido & Formulación' : 'Peptide & Formulation',
        width: '260px',
        render: (val, row) => {
          const atlasSku = formatAtlasPenSku(row.sku, row.itemNumber);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span className="atlas-pen-num-badge">#{String(row.itemNumber || '').padStart(2, '0')}</span>
                <span style={{ fontWeight: 750, color: '#0f172a', fontSize: '0.88rem' }}>{row.name}</span>
              </div>
              <CopyableId value={atlasSku} displayValue={atlasSku} />
            </div>
          );
        },
      },
      {
        key: 'variantsMatrix',
        header: isEs
          ? 'Concentración / Vol.  ·  Pauta de Dial (Clics)  ·  Rendimiento / Pen'
          : 'Strength & Volume  ·  Dial Dosing Protocol  ·  Yield / Pen',
        render: (val, row) => (
          <div className="atlas-pen-variant-matrix">
            {(row.variants || []).map((v, idx) => {
              const clicksLabel = v.clicksRange || String(v.clicksPerDose || 10);
              const durationLabel = v.dosesPerPenLabel || `${getDosesPerPen(v)} ${isEs ? 'dosis' : 'doses'}`;
              return (
                <div
                  key={v.id}
                  className="atlas-pen-variant-matrix-row"
                  style={idx > 0 ? { borderTop: '1px dashed #e2e8f0', paddingTop: '7px' } : undefined}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className="atlas-pen-strength-pill" style={{ width: 'fit-content' }}>{v.concentration}</span>
                    <span style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 650 }}>
                      {computePerMlRatio(v.concentration, v.volume)} · {v.volume || '3 mL'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 750, color: '#0f172a', fontSize: '0.78rem' }}>
                      <span style={{ color: '#003666' }}>{clicksLabel} {isEs ? 'clics' : 'clicks'}</span> · {v.doseBreakdown}
                    </span>
                    <span style={{ fontSize: '0.69rem', color: '#64748b' }}>{v.frequency}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#065f46', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 7px', borderRadius: '6px' }}>
                      {durationLabel}
                    </span>
                    {v.cycleDuration && (
                      <span style={{ fontSize: '0.66rem', color: '#64748b' }}>{v.cycleDuration}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: '132px',
        render: (val, row) => {
          const qty = protocolSelection[row.id]?.qty || 0;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="gcp-btn-secondary"
                style={{
                  padding: '5px 9px',
                  fontSize: '0.72rem',
                  fontWeight: 750,
                  borderColor: qty > 0 ? '#1a73e8' : undefined,
                  background: qty > 0 ? '#e8f0fe' : undefined,
                  color: qty > 0 ? '#1a73e8' : undefined,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSetProtocolQty(row.id, qty + 1);
                }}
              >
                {qty > 0 ? `${qty} pen${qty > 1 ? 's' : ''}` : '+ PDF'}
              </button>
              <button
                type="button"
                className="gcp-btn-secondary"
                style={{ padding: '5px 10px', fontSize: '0.72rem', fontWeight: 700 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItemForInquiry(row);
                  setIsInquiryDrawerOpen(true);
                }}
              >
                {isEs ? 'Prescribir' : 'Prescribe'}
              </button>
            </div>
          );
        },
      },
    ],
    [isEs, protocolSelection, handleSetProtocolQty]
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: isEs ? 'Tarifas B2B' : 'B2B Schedules', href: '/pricing' },
      { label: isEs ? 'Guía de Plumas de Péptidos' : 'Peptide Pen Dosing Guide' },
    ],
    [isEs]
  );

  let cardRunningIndex = 0;

  return (
    <div className="dnlab-page-root atlas-page-bg">
      <PublicUnifiedHeader
        lang={lang}
        onLangChange={handleLangChange}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        hideAiButton={true}
        hideContactButton={true}
        hideCopyButton={true}
        breadcrumb={breadcrumbItems}
      />

      {/* ── EXECUTIVE DARK NAVY BROCHURE HEADER (Matches A4 PDF 1-to-1) ── */}
      <section className="atlas-pens-exec-banner">
        <div className="atlas-pens-exec-inner">
          <div className="atlas-pens-exec-top">
            <div style={{ minWidth: 0 }}>
              <div className="atlas-pens-exec-eyebrow">
                <span>ATLAS HEALTH SERVICES</span>
                <span>·</span>
                <span>{isEs ? 'FORMULARIO CLÍNICO' : 'CLINICAL FORMULARY'}</span>
                <span>·</span>
                <span>{initialProducts.length} {isEs ? 'Fórmulas' : 'Formulas'} ({totalVariantsCount} SKUs)</span>
              </div>
              <h1 className="atlas-pens-exec-title">
                {isEs ? 'GUÍA DE PLUMAS DE PÉPTIDOS' : 'PEPTIDE PEN DOSING GUIDE'}
              </h1>
              <p className="atlas-pens-exec-sub">
                {isEs
                  ? 'Protocolo clínico oficial · dosis activa, clics del dial U-100, frecuencia, duración y rendimiento por pen (≥99.2% HPLC · 2°C–8°C).'
                  : 'Official clinical formulary · active dose, U-100 dial clicks, frequency, cycle duration and yield per pen (≥99.2% HPLC · 2°C–8°C).'}
              </p>
            </div>

            {/* Signature U-100 Conversion Pill */}
            <div className="atlas-pens-conversion-pill">
              <span className="atlas-pens-conv-label">
                {isEs ? 'CONVERSIÓN DIAL U-100' : 'U-100 PEN CONVERSION'}
              </span>
              <span className="atlas-pens-conv-val">
                {isEs ? '100 clics = 1 mL' : '100 clicks = 1 mL'}
              </span>
              <span className="atlas-pens-conv-sub">
                {isEs ? '1 clic = 1 UI = 0.01 mL · Agujas 31G/32G 4mm' : '1 click = 1 IU = 0.01 mL · 31G/32G 4mm Needles'}
              </span>
            </div>
          </div>

          <div className="atlas-pens-exec-actions">
            <button
              type="button"
              className="atlas-exec-btn-primary"
              disabled={isExportingPdf}
              onClick={() => handleExportPdf()}
            >
              <FileText size={14} />
              <span>
                {isExportingPdf
                  ? (isEs ? 'Generando PDF...' : 'Generating PDF...')
                  : protocolItemsList.length > 0
                    ? (isEs
                        ? `Exportar Guía de Protocolo (${totalProtocolPens} pens)`
                        : `Export Protocol Guide PDF (${totalProtocolPens} pens)`)
                    : (isEs ? 'Exportar Guía Visual PDF (A4)' : 'Export Visual Dosing Guide PDF')}
              </span>
            </button>

            <button type="button" className="atlas-exec-btn-ghost" onClick={handleShare}>
              {copiedLink ? <Check size={14} color="#93c5fd" /> : <Share2 size={14} />}
              <span>{copiedLink ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Compartir' : 'Share')}</span>
            </button>

            <Link
              href={`/calculator?format=pen${isEs ? '&lang=es' : ''}`}
              className="atlas-exec-btn-ghost"
              style={{ textDecoration: 'none' }}
            >
              <Calculator size={14} />
              <span>{isEs ? 'Calculadora Paciente' : 'Patient Calculator'}</span>
            </Link>

            <Link href="/pricing" className="atlas-exec-btn-ghost" style={{ textDecoration: 'none' }}>
              <ChevronRight size={14} />
              <span>{isEs ? 'Todas las Tarifas' : 'All Schedules'}</span>
            </Link>
          </div>
        </div>
      </section>

      <main className="dnlab-container">
        {/* Search + View Mode Switcher Row */}
        <div className="atlas-pens-toolbar-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <GlobalSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              searchScope="local"
              namespace="atlas-pens"
              size="lg"
              resultCount={filteredProducts.length}
              lang={lang}
            />
          </div>

          <div className="atlas-pens-view-switch" role="group" aria-label={isEs ? 'Modo de vista' : 'View mode'}>
            <button
              type="button"
              className={viewMode === 'cards' ? 'active' : ''}
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid size={14} />
              <span>{isEs ? 'Guía Visual' : 'Visual Guide'}</span>
            </button>
            <button
              type="button"
              className={viewMode === 'table' ? 'active' : ''}
              onClick={() => setViewMode('table')}
            >
              <List size={14} />
              <span>{isEs ? 'Tabla Compacta' : 'Compact Table'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Strip (Horizontal Scroll on Mobile) */}
        <div className="dnlab-filters-row">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`dnlab-filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span>{cat.label}</span>
              <span className="dnlab-filter-pill-count">{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Tip Banner for Physicians on Building a 1-Page Custom Patient Protocol PDF */}
        {protocolItemsList.length === 0 && (
          <div className="atlas-pens-protocol-hint">
            <ShieldCheck size={15} color="#003666" style={{ flexShrink: 0 }} />
            <span>
              {isEs
                ? 'Consejo clínico: pulsa "+ Añadir a Guía PDF" en las plumas de un paciente para armar su Supply Summary y exportar una guía visual personalizada de 1 página.'
                : 'Physician tip: click "+ Add to Protocol" on any pens below to assemble a custom Supply Summary and export a clean 1-page visual dosing guide PDF.'}
            </span>
          </div>
        )}

        {/* ── MAIN CONTENT: VISUAL EDITORIAL CARDS (DEFAULT) OR COMPACT TABLE ── */}
        {viewMode === 'cards' ? (
          <div className="atlas-pens-editorial-list">
            {groupedProducts.map(([catName, catItems]) => (
              <section key={catName} className="atlas-pens-specialty-section">
                <div className="atlas-pens-specialty-heading">
                  <span>{catName}</span>
                  <span className="atlas-pens-specialty-count">
                    {catItems.length} {isEs ? (catItems.length === 1 ? 'fórmula' : 'fórmulas') : (catItems.length === 1 ? 'formula' : 'formulas')}
                  </span>
                </div>

                <div className="atlas-pens-cards-stack">
                  {catItems.map((row) => {
                    cardRunningIndex += 1;
                    const idxNum = cardRunningIndex;
                    const activeVarIdx = selectedVariantIdx[row.id] ?? 0;
                    const protocolQty = protocolSelection[row.id]?.qty || 0;
                    const isExpanded = Boolean(expandedCards[row.id]);
                    return (
                      <PenEditorialCard
                        key={row.id}
                        row={row}
                        displayIndex={idxNum}
                        activeVariantIdx={activeVarIdx}
                        onSelectVariant={(vIdx) => handleSelectVariantForProduct(row.id, vIdx)}
                        protocolQty={protocolQty}
                        onSetProtocolQty={(nextQ) => handleSetProtocolQty(row.id, nextQ)}
                        isExpanded={isExpanded}
                        onToggleExpand={() =>
                          setExpandedCards((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                        }
                        renderDetailPanel={renderDetailPanel}
                        onPrescribe={(item) => {
                          setSelectedItemForInquiry(item);
                          setIsInquiryDrawerOpen(true);
                        }}
                        isEs={isEs}
                        lang={lang}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <DataTable
            columns={tableColumns}
            data={filteredProducts}
            keyField="id"
            groupByKey="category"
            renderGroupHeader={(catName, firstRow, count) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                background: '#e8f0fe',
                borderRadius: '6px',
                padding: '6px 12px',
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {catName}
                </span>
                <span style={{ fontSize: '0.67rem', fontWeight: 750, color: '#1a73e8', background: '#ffffff', border: '1px solid #bfdbfe', padding: '1px 8px', borderRadius: '999px' }}>
                  {count}
                </span>
              </div>
            )}
            expandableRender={renderDetailPanel}
            initialRowsPerPage={25}
            itemNoun={isEs ? 'plumas' : 'pens'}
            lang={lang}
            statusText={isEs ? 'Portafolio Clínico Atlas Health actualizado' : 'Atlas Health Clinical Pens Portfolio up to date'}
          />
        )}

        {/* Executive Verification Footer Note */}
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '1.5rem' }}>
          {isEs
            ? 'Verificar siempre la concentración dispensada y la calibración U-100 del dial antes de administrar. Uso exclusivo para profesionales sanitarios.'
            : 'Verify the dispensed concentration and U-100 pen dial calibration before administration. For licensed healthcare professionals & clinics.'}
        </p>
      </main>

      {/* ── FLOATING SUPPLY SUMMARY DOCK (LXV Signature when physician selects protocol pens) ── */}
      {protocolItemsList.length > 0 && (
        <aside className="atlas-pens-supply-dock" aria-label="Protocol Supply Summary">
          <div className="atlas-pens-supply-dock-inner">
            <div className="atlas-pens-supply-summary-col">
              <span className="atlas-pens-supply-kicker">
                {isEs ? 'RESUMEN DE SUMINISTRO (SUPPLY SUMMARY)' : 'SUPPLY SUMMARY'}
              </span>
              <div className="atlas-pens-supply-pills">
                {protocolItemsList.map((it) => {
                  const color = it.product.categoryColor || '#1d4ed8';
                  const shortName = it.product.name.split('(')[0].trim();
                  return (
                    <span key={it.product.id} className="atlas-pens-supply-item" style={{ color }}>
                      <strong>{shortName}</strong> {it.qty} {it.qty === 1 ? 'pen' : 'pens'}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="atlas-pens-supply-actions">
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setProtocolSelection({})}
                style={{ width: '38px', height: '38px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                title={isEs ? 'Limpiar protocolo' : 'Clear protocol'}
                aria-label={isEs ? 'Limpiar protocolo' : 'Clear protocol'}
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => {
                  setSelectedItemForInquiry(null);
                  setIsInquiryDrawerOpen(true);
                }}
                style={{ minHeight: '38px', padding: '0 12px', fontSize: '0.77rem', fontWeight: 700 }}
              >
                {isEs ? 'Prescribir Lote' : 'Prescribe'}
              </button>
              <button
                type="button"
                className="gcp-btn-primary"
                disabled={isExportingPdf}
                onClick={() => handleExportPdf()}
                style={{ minHeight: '38px', padding: '0 14px', fontSize: '0.78rem', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={14} />
                <span>
                  {isEs ? `Guía PDF (${totalProtocolPens})` : `Protocol PDF (${totalProtocolPens})`}
                </span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Institutional Inquiry Drawer (White-Label Atlas Context) */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="pens_clinical_formulary"
        brandType="atlas_pens"
        lang={lang}
        initialEntity={
          selectedItemForInquiry
            ? {
                name: `${selectedItemForInquiry.name} (${formatAtlasPenSku(selectedItemForInquiry.sku, selectedItemForInquiry.itemNumber)})`,
                currency,
                selectedItemsSummary: (selectedItemForInquiry.variants || [])
                  .map((v) => `${selectedItemForInquiry.name} ${v.concentration}/${v.volume || '3 mL'} (${v.clicksRange || v.clicksPerDose} clicks · ${v.doseBreakdown})`)
                  .join(' | '),
              }
            : protocolItemsList.length > 0
              ? {
                  name: isEs ? `Protocolo Personalizado (${totalProtocolPens} Pens)` : `Custom Pen Protocol (${totalProtocolPens} Pens)`,
                  currency,
                  selectedItemsSummary: protocolItemsList
                    .map((it) => `${it.qty}x ${it.product.name} ${it.variant.concentration}/${it.variant.volume || '3 mL'} (${it.variant.clicksRange || it.variant.clicksPerDose} clicks)`)
                    .join(' | '),
                }
              : null
        }
      />

      <PublicUnifiedFooter />
    </div>
  );
}
