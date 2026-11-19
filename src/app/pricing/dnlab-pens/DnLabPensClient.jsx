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
  Copy,
  MessageCircle,
  ExternalLink,
} from '@/lib/icons';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';
import PageHeroCard from '@/components/ui/PageHeroCard';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ClinicalFormatSwitcher from '@/components/pricing/shared/ClinicalFormatSwitcher';
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

function getCalculatorUrlForPen(row, variant, lang = 'en', customClicks = null) {
  const baseName = String(row?.name || 'BPC-157').split('/')[0].split('(')[0].trim();
  const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const firstStrengthMatch = String(variant?.concentration || '').match(/\d+(?:\.\d+)?\s*(?:mg|mcg|iu)/i);
  const strength = firstStrengthMatch ? firstStrengthMatch[0].replace(/\s+/g, '') : '10mg';
  const volMatch = String(variant?.volume || '3 mL').match(/(\d+(?:\.\d+)?)/);
  const volNum = volMatch ? parseFloat(volMatch[1]) : 3;
  const clicksNum = Number(customClicks || variant?.clicksPerDose || variant?.recommendedDoseUnits) || 10;
  const firstTargetMatch = String(variant?.doseBreakdown || '').match(/(\d+(?:\.\d+)?)\s*(mg|mcg)/i);

  const params = new URLSearchParams({
    peptide: slug || 'bpc-157',
    format: 'pen',
    strength,
    vol: `${volNum}ml`,
    clicks: String(clicksNum),
  });
  if (firstTargetMatch) {
    params.set('target', `${firstTargetMatch[1]}${firstTargetMatch[2].toLowerCase()}`);
  }
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
      id={`pen-card-${row.id}`}
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
              <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>
                {variant.volume || '3 mL'} · {variant.totalUnits || 300} {isEs ? 'clics' : 'clicks'}
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
        <div className="atlas-pen-ec-metric atlas-pen-ec-metric-dose" style={{ '--pen-accent': accentColor }}>
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

      {/* Clinical Footnote + GCP Monochromatic Action Bar (1 Primary + 2 Monochrome Secondary = 1x3 Symmetric Row) */}
      <div className="atlas-pen-ec-footer">
        <p className="atlas-pen-ec-footnote">
          <strong>{isEs ? 'Momento y nota clínica:' : 'Timing & clinical note:'}</strong>{' '}
          {row.timing && (
            <span style={{ color: '#0f172a', fontWeight: 700 }}>
              {row.timing} ·{' '}
            </span>
          )}
          <span>{row.description}</span>
        </p>

        <div className="atlas-pen-ec-actions">
          {/* Primary Action: Protocol Builder Toggle / Stepper (Rules #40 & #57) */}
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
              className="gcp-btn-primary atlas-pen-ec-btn atlas-pen-ec-btn-primary"
              onClick={() => onSetProtocolQty?.(1)}
            >
              <Plus size={13} />
              <span>{isEs ? 'Protocolo' : 'Add to Protocol'}</span>
            </button>
          )}

          {/* Secondary Action 1 (Monochrome): Unified Dial Simulator & Specs */}
          <button
            type="button"
            className={`gcp-btn-secondary atlas-pen-ec-btn atlas-pen-ec-btn-mono ${isExpanded ? 'is-open' : ''}`}
            onClick={onToggleExpand}
            aria-expanded={isExpanded}
          >
            <Sliders size={13} />
            <span>{isExpanded ? (isEs ? 'Cerrar Dial' : 'Hide Dial') : (isEs ? 'Dial y Ficha' : 'Dial & Specs')}</span>
            <ChevronDown
              size={13}
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
            />
          </button>

          {/* Secondary Action 2 (Monochrome): Prescribe / Clinical Order */}
          <button
            type="button"
            className="gcp-btn-secondary atlas-pen-ec-btn atlas-pen-ec-btn-mono"
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
    if (searchQuery && searchQuery.trim().length >= 1) {
      const tokens = searchQuery
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      list = list.filter((p) => {
        const atlasSku = formatAtlasPenSku(p.sku, p.itemNumber).toLowerCase();
        const variantCorpus = (p.variants || [])
          .map(
            (v) =>
              `${v.label || ''} ${v.concentration || ''} ${v.volume || ''} ${computePerMlRatio(
                v.concentration,
                v.volume
              )} ${v.clicksRange || ''} ${v.clicksPerDose || ''} clicks ${v.doseBreakdown || ''} ${
                v.dosesPerPenLabel || ''
              } ${v.frequency || ''} ${v.cycleDuration || ''}`
          )
          .join(' ')
          .toLowerCase();
        const fullCorpus = `${p.itemNumber || ''} ${p.name || ''} ${atlasSku} ${(p.sku || '').toLowerCase()} ${
          p.category || ''
        } ${p.description || ''} ${p.timing || ''} ${p.needle || ''} ${p.storage || ''} ${variantCorpus}`.toLowerCase();
        return tokens.every((tok) => fullCorpus.includes(tok));
      });
    }
    return list;
  }, [initialProducts, selectedCategory, searchQuery]);

  // Live Local Suggestions for GlobalSearchBar dropdown (eliminates false "No clinical matches found"!)
  const penSearchSuggestions = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return [];
    return filteredProducts.map((p) => {
      const atlasSku = formatAtlasPenSku(p.sku, p.itemNumber);
      const variantsSummary = (p.variants || [])
        .map((v) => `${v.concentration}/${v.volume || '3 mL'} (${v.clicksRange || v.clicksPerDose} clicks)`)
        .join(' · ');
      return {
        id: p.id,
        key: p.id,
        name: `#${String(p.itemNumber || '').padStart(2, '0')} ${p.name}`,
        email: `${atlasSku} · ${variantsSummary}`,
        category: p.category || 'Peptide Pen',
        searchTerm: p.name.split('(')[0].trim(),
        onSelect: () => {
          if (typeof document !== 'undefined') {
            const el = document.getElementById(`pen-card-${p.id}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        },
      };
    });
  }, [filteredProducts, searchQuery]);

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

  // Structured catalog inventory & active protocol selection for Atlas AI
  const atlasCatalogInventory = useMemo(() => {
    return (initialProducts || []).map((p) => ({
      itemNumber: p.itemNumber,
      name: p.name,
      sku: formatAtlasPenSku(p.sku),
      category: p.category,
      timing: p.timing,
      needle: p.needle,
      storage: p.storage,
      purity: p.purity,
      variants: (p.variants || []).map((v) => ({
        label: v.label,
        concentration: v.concentration,
        volume: v.volume,
        ratioPerMl: computePerMlRatio(v.concentration, v.volume),
        totalUnits: v.totalUnits,
        clicksRange: v.clicksRange || String(v.clicksPerDose || ''),
        clicksPerDose: v.clicksPerDose,
        doseBreakdown: v.doseBreakdown,
        dosesPerPenLabel: v.dosesPerPenLabel,
        frequency: v.frequency,
        cycleDuration: v.cycleDuration,
      })),
    }));
  }, [initialProducts]);

  const atlasProtocolSelection = useMemo(() => {
    return protocolItemsList.map((item) => ({
      name: item.product.name,
      sku: formatAtlasPenSku(item.product.sku),
      category: item.product.category,
      concentration: item.variant.concentration,
      volume: item.variant.volume,
      ratioPerMl: computePerMlRatio(item.variant.concentration, item.variant.volume),
      clicksRange: item.variant.clicksRange || String(item.variant.clicksPerDose || ''),
      clicksPerDose: item.variant.clicksPerDose,
      doseBreakdown: item.variant.doseBreakdown,
      dosesPerPenLabel: item.variant.dosesPerPenLabel,
      frequency: item.variant.frequency,
      cycleDuration: item.variant.cycleDuration,
      timing: item.product.timing,
      qty: item.qty,
    }));
  }, [protocolItemsList]);

  // Register contextual state for Atlas AI & mutual exclusion with Supply Summary Dock (Rule #69)
  useRegisterAtlasContext(
    {
      contextType: 'pens_formulary',
      storageKey: 'pricing-pens-v2',
      lang,
      catalogInventory: atlasCatalogInventory,
      contextAnchor: {
        type: 'pens_pricing',
        lang,
        name: isEs
          ? `Guía de Bolígrafos Precargados · ${initialProducts.length} Fórmulas (${totalVariantsCount} SKUs)`
          : `Peptide Pen Dosing Guide · ${initialProducts.length} Formulas (${totalVariantsCount} SKUs)`,
        badgeLabel: 'U-100 · 2–8°C',
        sectionTitle: isEs
          ? 'Guía Clínica Armonizada de Bolígrafos Precargados (Estándar U-100)'
          : 'Atlas Health Pre-filled Multi-Dose Peptide Pens · U-100 Clinical Formulary',
        keyActives: isEs
          ? '20 bolígrafos multidosis estériles (38 presentaciones armonizadas en cartuchos de 2 mL, 2.4 mL y 3 mL): BPC-157/TB-500 (6/9, 7.5/7.5 y 15/22.5 mg), KPV (10 y 15 mg), CJC-1295 No DAC (3 y 30 mg), CJC-1295/Ipamorelin (3/6, 5/10 y 6/6 mg), IGF-1 LR3 (300 mcg y 3 mg), Ipamorelin (6 y 15 mg), MGF (2.4 mg), CJC/Ipamorelin/DSIP (3/6/6 mg), DSIP (2 mg), Epithalon (30 y 100 mg), Humanin (30 mg), MOTS-c (15, 30, 40 y 60 mg), NAD+ (300, 750 y 1050 mg), SS-31 Elamipretide (30 mg), GHK-Cu (30, 60 y 100 mg), GLOW Stack, KLOW Stack, hCG (5000 IU), Kisspeptin-10 (3 y 15 mg) y PT-141 (20 y 15 mg).'
          : '20 sterile multi-dose peptide pens (38 harmonized strength SKUs across 2 mL, 2.4 mL, and 3 mL cartridges): BPC-157/TB-500 (6/9, 7.5/7.5 & 15/22.5 mg), KPV (10 & 15 mg), CJC-1295 No DAC (3 & 30 mg), CJC-1295/Ipamorelin (3/6, 5/10 & 6/6 mg), IGF-1 LR3 (300 mcg & 3 mg), Ipamorelin (6 & 15 mg), MGF (2.4 mg), CJC/Ipamorelin/DSIP (3/6/6 mg), DSIP (2 mg), Epithalon (30 & 100 mg), Humanin (30 mg), MOTS-c (15, 30, 40 & 60 mg), NAD+ (300, 750 & 1050 mg), SS-31 Elamipretide (30 mg), GHK-Cu (30, 60 & 100 mg), GLOW Stack, KLOW Stack, hCG (5000 IU), Kisspeptin-10 (3 & 15 mg), and PT-141 (20 & 15 mg).',
        mechanisms: isEs
          ? 'Conversión mecánica U-100: 100 clics = 1 mL (1 clic = 0.01 mL). Cartuchos precargados estériles de uso individual multidosis listos para administrar (NO requieren reconstitución ni agua bacteriostática). Agujas 31G / 32G × 4 mm. Conservación en frío 2°C–8°C protegida de la luz (estabilidad 30 días tras primera punción).'
          : 'Mechanical U-100 dial conversion: 100 clicks = 1 mL (1 click = 0.01 mL). Single-patient multi-dose sterile pre-filled cartridges requiring ZERO reconstitution or bacteriostatic water mixing. Compatible with 31G / 32G × 4 mm pen needles. Refrigerated cold-chain 2°C–8°C protected from light (30-day BUD once pierced).',
        welcomeIntro: isEs
          ? 'Consulta cálculos exactos de clics U-100 a mg/mcg, comparativas entre presentaciones (MOTS-c 15/30/40/60 mg, NAD+ 300/750/1050 mg, GHK-Cu 30/60/100 mg, SS-31 30 mg), sinergias de combinación o revisión clínica de los bolígrafos añadidos a tu protocolo.'
          : 'Ask about exact U-100 click-to-dose math, strength comparisons across presentations (MOTS-c 15/30/40/60 mg, NAD+ 300/750/1050 mg, GHK-Cu 30/60/100 mg, SS-31 30 mg), safe multi-pen stacking, or a clinical review of the pens selected in your Supply Summary.',
        activeCategory: selectedCategory,
        searchQuery,
        filteredCount: filteredProducts.length,
        protocolSelection: atlasProtocolSelection,
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
    [
      isEs,
      lang,
      selectedCategory,
      searchQuery,
      filteredProducts.length,
      protocolItemsList.length,
      initialProducts.length,
      totalVariantsCount,
      atlasCatalogInventory,
      atlasProtocolSelection,
      handleExportPdf,
    ]
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
      const calcHref = getCalculatorUrlForPen(row, currentVariant, lang, currentUnits);
      const sliderMax = Math.max(50, defaultClicks);
      const patientInstructionText = isEs
        ? `${row.name} (${currentVariant.concentration} / ${currentVariant.volume || '3 mL'}) · Marcar ${currentUnits} clics en dial U-100 (${volumeMl.toFixed(2)} mL = ${dynamicDoseBreakdown}) · ${currentVariant.frequency}${row.timing ? ` (${row.timing})` : ''} · Aguja: ${row.needle || '31G × 4mm'} · Conservar en frío 2°C–8°C.`
        : `${row.name} (${currentVariant.concentration} / ${currentVariant.volume || '3 mL'}) · Dial ${currentUnits} clicks on U-100 pen (${volumeMl.toFixed(2)} mL = ${dynamicDoseBreakdown}) · ${currentVariant.frequency}${row.timing ? ` (${row.timing})` : ''} · Needle: ${row.needle || '31G × 4mm'} · Refrigerate 2°C–8°C.`;

      const handleCopyPatientInstructions = async () => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.atlashealth-services.com';
        const fullText = `${patientInstructionText}\n${isEs ? 'Guía visual paso a paso:' : 'Interactive step-by-step guide:'} ${origin}${calcHref}`;
        try {
          await navigator.clipboard.writeText(fullText);
          toast.success(isEs ? 'Instrucciones para el paciente copiadas ✓' : 'Patient dosing instructions copied ✓');
        } catch {
          toast.error(isEs ? 'No se pudo copiar' : 'Could not copy');
        }
      };

      const handleWhatsAppPatient = () => {
        if (typeof window === 'undefined') return;
        const origin = window.location.origin;
        const fullText = `${patientInstructionText}\n\n${isEs ? 'Guía visual interactiva:' : 'Interactive visual guide:'} ${origin}${calcHref}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank', 'noopener,noreferrer');
      };

      return (
        <div className="dnlab-detail-panel dnlab-detail-panel-unified">
          <div className="dnlab-detail-card">
            {/* Top Header & Purity / Cartridge Badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="#003666" />
                <h4 style={{ margin: 0, fontSize: '0.90rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Simulador Interactivo U-100 & Especificaciones' : 'Interactive U-100 Dial Simulator & Clinical Specs'}
                </h4>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
                  {currentVariant.volume || '3 mL'} · {totalUnitsInCartridge} {isEs ? 'clics' : 'clicks'}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '999px' }}>
                  {row.purity}
                </span>
              </div>
            </div>

            {/* Compact Clinical Specs Pill Strip */}
            <div className="dnlab-specs-pill-strip">
              {row.timing && (
                <div className="dnlab-spec-chip">
                  <Clock size={13} color="#003666" style={{ flexShrink: 0 }} />
                  <span><b>{isEs ? 'Momento:' : 'Timing:'}</b> {row.timing}</span>
                </div>
              )}
              <div className="dnlab-spec-chip">
                <ThermometerSnowflake size={13} color="#0284c7" style={{ flexShrink: 0 }} />
                <span><b>{isEs ? 'Frío / BUD:' : 'Cold-Chain:'}</b> {row.storage}</span>
              </div>
              <div className="dnlab-spec-chip">
                <Info size={13} color="#475569" style={{ flexShrink: 0 }} />
                <span><b>{isEs ? 'Aguja:' : 'Needle:'}</b> {row.needle}</span>
              </div>
            </div>

            {/* Variant Strength Switcher (if multiple strengths) */}
            {variants.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 750, color: '#64748b', textTransform: 'uppercase' }}>
                  {isEs ? 'Presentación:' : 'Strength:'}
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

            {/* Visual Pen Graphic (Clean, zero double parentheses) */}
            <PenDialVisualizer
              penClicks={currentUnits}
              volumeMl={volumeMl}
              totalDoses={totalDosesAtSetting}
              strengthLabel={currentVariant.concentration || '10 mg'}
              cartridgeVolume={currentVariant.volume || '3.0 mL'}
              isCartridge={false}
              lang={lang}
            />

            {/* Integrated Interactive Click Slider + Live Output Tiles */}
            <div className="dnlab-dial-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                  {isEs ? 'Ajustar Clics en Vivo (1 clic = 0.01 mL):' : 'Adjust Live Dial Setting (1 click = 0.01 mL):'}
                </span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#003666', fontVariantNumeric: 'tabular-nums' }}>
                  {currentUnits} {isEs ? 'clics' : 'clicks'} ({volumeMl.toFixed(2)} mL)
                </span>
              </div>

              <input
                type="range"
                min="1"
                max={sliderMax}
                step="1"
                value={currentUnits}
                onChange={(e) => setDialSettings((prev) => ({ ...prev, [sliderKey]: Number(e.target.value) }))}
                className="dnlab-slider"
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#64748b', marginTop: '6px' }}>
                <span>1 {isEs ? 'clic' : 'click'}</span>
                <button
                  type="button"
                  onClick={() => setDialSettings((prev) => ({ ...prev, [sliderKey]: defaultClicks }))}
                  style={{
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#003666',
                    borderRadius: '999px',
                    padding: '2px 10px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isEs ? `Restablecer (${defaultClicks} clics)` : `Reset Standard (${defaultClicks} clicks)`}
                </button>
                <span>{sliderMax} {isEs ? 'clics' : 'clicks'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.65rem' }}>
              <div style={{ background: '#f8fafc', padding: '9px 11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.64rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 750 }}>
                  {isEs ? 'Dosis Activa / Inyección' : 'Live Active Dose / Injection'}
                </div>
                <div style={{ fontSize: '0.83rem', fontWeight: 800, color: '#0f172a', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                  {dynamicDoseBreakdown}
                </div>
                <div style={{ fontSize: '0.67rem', color: '#64748b', marginTop: '2px' }}>
                  {currentVariant.frequency}
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '9px 11px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.64rem', color: '#047857', textTransform: 'uppercase', fontWeight: 750 }}>
                  {isEs ? 'Rendimiento a este Dial' : 'Est. Yield at This Dial'}
                </div>
                <div style={{ fontSize: '0.83rem', fontWeight: 800, color: '#065f46', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                  {totalDosesAtSetting} {isEs ? 'dosis nominales' : 'nominal doses'}
                </div>
                <div style={{ fontSize: '0.67rem', color: '#047857', marginTop: '2px' }}>
                  {isEs ? 'Estabilidad 30 días en frío (BUD)' : '30-day cold-chain BUD once pierced'}
                </div>
              </div>
            </div>

            {/* Inline Patient Instructions & 1-Click Share Box (Zero context switching!) */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.67rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {isEs ? 'Pauta Lista para Enviar al Paciente (Sin Salir de la Guía)' : 'Ready-to-Share Patient Instructions (Inline)'}
                </span>
                <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 650 }}>
                  100 clicks = 1.00 mL · {currentVariant.volume || '3 mL'}
                </span>
              </div>

              <div
                style={{
                  fontSize: '0.77rem',
                  lineHeight: 1.45,
                  color: '#0f172a',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '7px',
                  padding: '8px 10px',
                  fontWeight: 600,
                }}
              >
                {patientInstructionText}
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleCopyPatientInstructions}
                  className="gcp-btn-secondary"
                  style={{ flex: '1 1 140px', justifyContent: 'center', fontSize: '0.73rem', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <Copy size={13} />
                  <span>{isEs ? 'Copiar Pauta Paciente' : 'Copy Patient Guide'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppPatient}
                  className="gcp-btn-secondary"
                  style={{ flex: '1 1 135px', justifyContent: 'center', fontSize: '0.73rem', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <MessageCircle size={13} />
                  <span>{isEs ? 'WhatsApp Paciente' : 'WhatsApp Patient'}</span>
                </button>

                <Link
                  href={calcHref}
                  className="gcp-btn-secondary"
                  style={{ flex: '1 1 150px', justifyContent: 'center', fontSize: '0.73rem', padding: '6px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <Calculator size={13} />
                  <span>{isEs ? 'Calculadora Interactiva ↗' : 'Patient Calculator ↗'}</span>
                </Link>

                <Link
                  href={`/labels?search=${encodeURIComponent(row.name.split('(')[0].trim())}`}
                  className="gcp-btn-secondary"
                  style={{ justifyContent: 'center', fontSize: '0.73rem', padding: '6px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <span>Labels Studio ↗</span>
                </Link>
              </div>
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

      {/* ── UNIFIED CLINICAL FORMAT SWITCHER (1-Click Navigation Across Vials, Pens & Pellets) ── */}
      <ClinicalFormatSwitcher activeFormat="pens" lang={lang} currency={currency} />

      <main className="dnlab-container">
        {/* ── UNIFIED COMPACT GCP RESOURCE HERO (Consistent across all platform screens) ── */}
        <PageHeroCard
          brandRight={isEs ? 'FORMULARIO CLÍNICO' : 'CLINICAL FORMULARY'}
          badges={[
            'U-100: 100 clicks = 1 mL',
            '≥99.2% HPLC · 2–8°C',
          ]}
          metaItems={[{ label: 'REF:', value: 'DOC-ATL-PENS-2026', mono: true }]}
          title={
            isEs
              ? 'Bolígrafos Precargados de Péptidos · Guía Clínica de Dosificación'
              : 'Pre-filled Multi-Dose Peptide Pens · Clinical Dosing Guide'
          }
          subtitle={
            isEs
              ? `Formulario clínico armonizado (${initialProducts.length} fórmulas · ${totalVariantsCount} presentaciones en 2–3 mL) con dial mecánico U-100 (1 clic = 0.01 mL) y constructor de protocolo en PDF.`
              : `Harmonized clinical formulary (${initialProducts.length} formulas · ${totalVariantsCount} strength SKUs across 2–3 mL) with U-100 click-dial dosing (1 click = 0.01 mL) and 1-page PDF Protocol Builder.`
          }
          actions={
            <>
              <Link
                href={`/calculator?format=pen${isEs ? '&lang=es' : ''}`}
                className="gcp-btn-secondary"
                style={{ height: '36px', padding: '0 12px', fontSize: '0.78rem', fontWeight: 650, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Calculator size={14} color="#5f6368" />
                <span>{isEs ? 'Calculadora' : 'Calculator'}</span>
              </Link>

              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handleShare}
                style={{ height: '36px', padding: '0 12px', fontSize: '0.78rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedLink ? <Check size={14} color="#16a34a" /> : <Share2 size={14} color="#5f6368" />}
                <span>{copiedLink ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Compartir' : 'Share')}</span>
              </button>

              <button
                type="button"
                className="gcp-btn-primary"
                disabled={isExportingPdf}
                onClick={() => handleExportPdf()}
                style={{ height: '36px', padding: '0 13px', fontSize: '0.78rem', fontWeight: 750, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={14} />
                <span>
                  {isExportingPdf
                    ? (isEs ? 'Generando...' : 'Generating...')
                    : protocolItemsList.length > 0
                      ? (isEs ? `Protocolo PDF (${totalProtocolPens})` : `Protocol PDF (${totalProtocolPens})`)
                      : (isEs ? 'Exportar Guía PDF' : 'Export PDF Guide')}
                </span>
              </button>
            </>
          }
        />
        {/* ── 4 COMPACT GCP KPI SUMMARY CARDS + SCOPE INDICATOR (Rule #22) ── */}
        <section className="atlas-pens-kpi-section" aria-label="Portfolio Summary KPIs">
          <div className="atlas-pens-kpi-header">
            <span className="atlas-pens-kpi-kicker">
              {isEs ? 'RESUMEN DEL PORFOLIO Y ALCANCE' : 'PORTFOLIO SUMMARY & SCOPE'}
            </span>
            <span className="atlas-pens-kpi-scope-badge">
              {selectedCategory !== 'ALL' || searchQuery.trim()
                ? `${isEs ? 'Filtro Activo' : 'Active Filter'} (${filteredProducts.length} / ${initialProducts.length} Pens)`
                : `${isEs ? 'Formulario Completo' : 'Entire Formulary'} (${initialProducts.length} Pens · ${totalVariantsCount} SKUs)`}
            </span>
          </div>

          <div className="atlas-pens-kpi-grid">
            <div className="atlas-pens-kpi-card">
              <span className="atlas-pens-kpi-val">{filteredProducts.length}</span>
              <span className="atlas-pens-kpi-label">
                {isEs ? 'BOLÍGRAFOS FORMULADOS' : 'FORMULATED PENS'}
              </span>
            </div>

            <div className="atlas-pens-kpi-card">
              <span className="atlas-pens-kpi-val">
                {filteredProducts.reduce((acc, p) => acc + (p.variants?.length || 1), 0)}
              </span>
              <span className="atlas-pens-kpi-label">
                {isEs ? 'PRESENTACIONES (2–3 ML)' : 'STRENGTH SKUS (2–3 ML)'}
              </span>
            </div>

            <div className="atlas-pens-kpi-card">
              <span className="atlas-pens-kpi-val">100 clicks</span>
              <span className="atlas-pens-kpi-label">
                {isEs ? 'ESTÁNDAR U-100 (= 1 ML)' : 'U-100 DIAL (= 1.00 ML)'}
              </span>
            </div>

            <div className="atlas-pens-kpi-card">
              <span className="atlas-pens-kpi-val" style={{ color: '#059669' }}>≥ 99.2%</span>
              <span className="atlas-pens-kpi-label">
                {isEs ? 'PUREZA HPLC · 2°C–8°C' : 'HPLC PURITY · 2°C–8°C'}
              </span>
            </div>
          </div>
        </section>

        {/* ── SEARCH BAR + VIEW MODE SWITCHER (Rule #7) ── */}
        <div className="atlas-pens-toolbar-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <GlobalSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              searchScope="local"
              namespace="atlas-pens"
              size="lg"
              resultCount={filteredProducts.length}
              localSuggestions={penSearchSuggestions}
              localSuggestionsLabel={
                isEs
                  ? `Fórmulas Coincidentes en Guía (${filteredProducts.length})`
                  : `Matching Formulary Pens (${filteredProducts.length})`
              }
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
              <Link
                href={`/labels?search=${encodeURIComponent(protocolItemsList[0]?.product?.name?.split('(')[0]?.trim() || '')}`}
                onClick={() => {
                  try {
                    if (typeof window !== 'undefined') {
                      window.sessionStorage.setItem(
                        'atlas_prefill_pen_protocol_v1',
                        JSON.stringify(
                          protocolItemsList.map((it) => ({
                            id: it.product.id,
                            name: it.product.name,
                            sku: formatAtlasPenSku(it.product.sku, it.product.itemNumber),
                            concentration: it.variant.concentration,
                            volume: it.variant.volume,
                            clicksRange: it.variant.clicksRange || String(it.variant.clicksPerDose || 10),
                            doseBreakdown: it.variant.doseBreakdown,
                            frequency: it.variant.frequency,
                            qty: it.qty,
                          }))
                        )
                      );
                    }
                  } catch {
                    /* ignore storage quota */
                  }
                }}
                className="gcp-btn-secondary"
                style={{ minHeight: '38px', padding: '0 11px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <span>Labels Studio</span>
                <ExternalLink size={12} />
              </Link>
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
