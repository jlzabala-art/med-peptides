'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ShieldCheck,
  ThermometerSnowflake,
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
  Layers,
  Syringe,
} from '@/lib/icons';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';
import PageHeroCard from '@/components/ui/PageHeroCard';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import PenDialVisualizer from '@/components/reconstitution/PenDialVisualizer';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import { generateAtlasPensDossierPdf, formatAtlasPenSku } from '@/lib/pdf/pensDossierPdf';
import './dnlab-pens.css';

/**
 * Proportionally scales a clinical doseBreakdown string (e.g. "200 mcg BPC-157 / 300 mcg TB-500")
 * whenever the physician drags the click-dial slider away from the default clicksPerDose.
 */
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
  const baseName = String(row?.name || 'BPC-157').split('/')[0].trim();
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
 * Dedicated Mobile Card for Atlas Pre-filled Pens Portfolio (Rule #23)
 */
function PenMobileCard({
  row,
  expandableRender,
  isEs,
  lang,
  onPrescribe,
}) {
  const [expanded, setExpanded] = useState(false);
  const variants = Array.isArray(row.variants) && row.variants.length > 0 ? row.variants : [];
  const primaryVariant = variants[0] || {};
  const atlasSku = formatAtlasPenSku(row.sku, row.itemNumber);
  const dosesPerPen = getDosesPerPen(primaryVariant);
  const calcHref = getCalculatorUrlForPen(row, primaryVariant, lang);

  return (
    <div className="atlas-pen-mcard">
      <div className="atlas-pen-mcard-top">
        <div className="atlas-pen-mcard-header">
          <div className="atlas-pen-mcard-title-wrap">
            <span className="atlas-pen-num-badge">
              #{String(row.itemNumber || '').padStart(2, '0')}
            </span>
            <span className="atlas-pen-mcard-title">{row.name}</span>
          </div>
          <button
            type="button"
            className="atlas-pen-mcard-expand"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={isEs ? 'Ver simulador y detalles clínicos' : 'Toggle clinical details & dial simulator'}
          >
            <ChevronDown
              size={16}
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.16s ease' }}
            />
          </button>
        </div>

        <div className="atlas-pen-mcard-meta">
          <span
            style={{
              fontSize: '0.67rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '999px',
              backgroundColor: row.categoryBg || '#f1f5f9',
              color: row.categoryColor || '#1e293b',
              border: `1px solid ${row.categoryBorder || '#e2e8f0'}`,
            }}
          >
            {row.category}
          </span>
          <CopyableId value={atlasSku} displayValue={atlasSku} />
        </div>

        {/* All Available Variants (Strength + Dial Clicks + Est. Duration) */}
        <div className="atlas-pen-mcard-variants">
          {variants.map((v) => {
            const vDoses = getDosesPerPen(v);
            return (
              <div key={v.id} className="atlas-pen-mcard-variant-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span className="atlas-pen-strength-pill">{v.concentration}</span>
                  {v.label && (
                    <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#475569' }}>
                      {v.label}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.73rem', color: '#0f172a', fontWeight: 650, marginTop: '3px' }}>
                  {v.clicksPerDose} {isEs ? 'clics' : 'clicks'} ({v.doseBreakdown})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap', marginTop: '3px', fontSize: '0.69rem', color: '#64748b' }}>
                  <span>{v.frequency}</span>
                  <span style={{ color: '#047857', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {vDoses} {isEs ? 'dosis' : 'doses'} · ~{v.daysSupply || vDoses}d
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {row.timing && (
          <div style={{ fontSize: '0.70rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={12} color="#0284c7" style={{ flexShrink: 0 }} />
            <span>{row.timing}</span>
          </div>
        )}
      </div>

      {/* Clean Monochrome Footer Actions (Rule #40 & #57) */}
      <div className="atlas-pen-mcard-actions">
        <button
          type="button"
          className="atlas-pen-mcard-btn"
          onClick={() => setExpanded((v) => !v)}
        >
          <Sliders size={13} />
          <span>{expanded ? (isEs ? 'Ocultar Dial' : 'Hide Dial') : (isEs ? 'Simulador' : 'Dial Sim')}</span>
        </button>
        <Link href={calcHref} className="atlas-pen-mcard-btn">
          <Calculator size={13} />
          <span>{isEs ? 'Guía' : 'Guide'}</span>
        </Link>
        <button
          type="button"
          className="atlas-pen-mcard-btn primary-subtle"
          onClick={() => onPrescribe?.(row)}
        >
          <span>{isEs ? 'Prescribir' : 'Prescribe'}</span>
        </button>
      </div>

      {expanded && expandableRender && (
        <div style={{ borderTop: '1px solid #e2e8f0' }}>
          {expandableRender(row)}
        </div>
      )}
    </div>
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

  const handleLangChange = useCallback((nextLang) => {
    const normalized = nextLang === 'es' ? 'es' : 'en';
    setLocalLang(normalized);
    if (workspace?.setLang) workspace.setLang(normalized);
  }, [workspace]);

  const handleCurrencyChange = useCallback((nextCur) => {
    if (workspace?.setCurrency) workspace.setCurrency(nextCur);
  }, [workspace]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [scopeMode, setScopeMode] = useState('all'); // 'all' | 'filtered'
  const [selectedItemForInquiry, setSelectedItemForInquiry] = useState(null);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Per-row interactive variant index & dial slider state
  const [selectedVariantIdx, setSelectedVariantIdx] = useState({});
  const [dialSettings, setDialSettings] = useState({});

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

  // Filtered Products
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

  // KPIs with Scope Switcher (Rule #22)
  const kpiDataset = scopeMode === 'filtered' ? filteredProducts : initialProducts;
  const totalVariantsCount = useMemo(
    () => kpiDataset.reduce((acc, p) => acc + (p.variants?.length || 1), 0),
    [kpiDataset]
  );

  const handleExportPdf = useCallback(async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await generateAtlasPensDossierPdf({
        products: filteredProducts.length > 0 ? filteredProducts : initialProducts,
        lang,
        selectedCategory,
      });
      toast.success(
        isEs
          ? 'Dossier clínico PDF listo para previsualización ✓'
          : 'Clinical PDF formulary ready for preview ✓'
      );
    } catch (err) {
      console.error('[PensPDF] Error generating PDF:', err);
      toast.error(isEs ? 'No se pudo generar el PDF' : 'Could not generate PDF');
    } finally {
      setIsExportingPdf(false);
    }
  }, [isExportingPdf, filteredProducts, initialProducts, lang, selectedCategory, isEs]);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const shareUrlObj = new URL('/pricing/pens', window.location.origin);
    if (lang === 'es') shareUrlObj.searchParams.set('lang', 'es');
    if (currency !== 'USD') shareUrlObj.searchParams.set('currency', currency);
    const shareUrl = shareUrlObj.toString();

    const title = isEs
      ? 'Atlas Health Services · Formulario Clínico de Plumas Precargadas (3 mL)'
      : 'Atlas Health Services · Pre-filled Multi-Dose Peptide Pens Formulary (3 mL)';
    const text = isEs
      ? 'Portafolio clínico oficial de Atlas Health Services para plumas precargadas multidosis con dosificación por clics, duración por pen y protocolos clínicos.'
      : 'Official Atlas Health Services clinical formulary for 3 mL pre-filled multi-dose peptide pens with click-dial dosing, treatment duration per pen, and clinical protocols.';

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

  // Register contextual state for Atlas AI & GlobalBottomStickyBar (Rule #69)
  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'pens_pricing',
        name: isEs ? 'Formulario de Plumas Precargadas' : 'Pre-filled Peptide Pens Formulary',
      },
      bottomBar: {
        summaryTitle: isEs ? 'Plumas Precargadas (3 mL)' : 'Pre-filled Peptide Pens (3 mL)',
        summarySubtitle: `${filteredProducts.length} ${isEs ? 'fórmulas' : 'formulas'} · Atlas Health Services`,
        atlasAiLabel: isEs ? 'Consultar a Atlas AI' : 'Ask Atlas AI',
        primaryAction: {
          label: isEs ? 'Dossier PDF' : 'PDF Formulary',
          onClick: handleExportPdf,
        },
      },
    },
    [isEs, filteredProducts.length, handleExportPdf]
  );

  // Table Columns (Golden Rule #3: clean inline # badge, all variants visible, clear Est. Duration / Pen, monochrome action)
  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: isEs ? 'Péptido & Formulación' : 'Peptide & Formulation',
        render: (val, row) => {
          const atlasSku = formatAtlasPenSku(row.sku, row.itemNumber);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                <span className="atlas-pen-num-badge">
                  #{String(row.itemNumber || '').padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 750, color: '#0f172a', fontSize: '0.90rem' }}>
                  {row.name}
                </span>
                <CopyableId value={atlasSku} displayValue={atlasSku} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: row.categoryBg || '#f1f5f9',
                    color: row.categoryColor || '#1e293b',
                    border: `1px solid ${row.categoryBorder || '#e2e8f0'}`,
                  }}
                >
                  {row.category}
                </span>
                <span style={{ fontSize: '0.71rem', color: '#64748b' }}>
                  3 mL (300 IU){row.variants?.length > 1 ? ` · ${row.variants.length} ${isEs ? 'opciones' : 'options'}` : ''}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: 'variants',
        header: isEs ? 'Concentración (3 mL)' : 'Strengths (3 mL)',
        render: (val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {(row.variants || []).map((v) => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span className="atlas-pen-strength-pill">{v.concentration}</span>
                {v.label && (
                  <span style={{ fontSize: '0.71rem', color: '#64748b' }}>{v.label}</span>
                )}
              </div>
            ))}
          </div>
        ),
      },
      {
        key: 'protocol',
        header: isEs ? 'Pauta de Dial & Momento' : 'Dial Dosing & Timing',
        render: (val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {(row.variants || []).map((v, idx) => (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                  paddingTop: idx > 0 ? '4px' : 0,
                  borderTop: idx > 0 ? '1px dashed #e2e8f0' : 'none',
                }}
              >
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.80rem' }}>
                  {v.clicksPerDose} {isEs ? 'clics' : 'clicks'} ({v.doseBreakdown})
                </span>
                <span style={{ fontSize: '0.71rem', color: '#64748b' }}>{v.frequency}</span>
              </div>
            ))}
            {row.timing && (
              <div style={{ fontSize: '0.69rem', color: '#0369a1', fontWeight: 600 }}>
                {isEs ? 'Momento:' : 'Timing:'} {row.timing}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'duration',
        header: isEs ? 'Duración / Pen' : 'Est. Duration / Pen',
        width: '175px',
        render: (val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {(row.variants || []).map((v, idx) => {
              const doses = getDosesPerPen(v);
              return (
                <div
                  key={v.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    paddingTop: idx > 0 ? '4px' : 0,
                    borderTop: idx > 0 ? '1px dashed #e2e8f0' : 'none',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.73rem',
                      fontWeight: 750,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      width: 'fit-content',
                      fontVariantNumeric: 'tabular-nums',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Clock size={11} color="#059669" />
                    <span>
                      {doses} {isEs ? 'dosis' : 'doses'} · ~{v.daysSupply || doses}d
                    </span>
                  </span>
                  {v.cycleDuration && (
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {isEs ? 'Ciclo:' : 'Cycle:'} {v.cycleDuration}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: '148px',
        render: (val, row) => {
          const calcHref = getCalculatorUrlForPen(row, row.variants?.[0], lang);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <Link
                href={calcHref}
                className="gcp-btn-secondary"
                onClick={(e) => e.stopPropagation()}
                style={{ padding: '5px 8px', fontSize: '0.73rem', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                title={isEs ? 'Abrir guía visual del paciente' : 'Open interactive patient pen guide'}
              >
                <Calculator size={13} />
              </Link>
              <button
                type="button"
                className="gcp-btn-secondary"
                style={{ padding: '5px 11px', fontSize: '0.74rem', fontWeight: 700 }}
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
    [isEs, lang]
  );

  // Master-Detail Expandable View (Rule #4) with Variant Switcher + Live Proportional Click Calculator + PenDialVisualizer
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

      return (
        <div className="dnlab-detail-panel">
          {/* Left: Clinical Profile & Cold-Chain Specifications */}
          <div className="dnlab-detail-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={17} color="#003666" />
                <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Mecanismo & Especificaciones Clínicas' : 'Mechanism & Clinical Specifications'}
                </h4>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '999px' }}>
                {row.purity}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.55 }}>
              {row.description}
            </p>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {row.timing && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '0.77rem', color: '#334155' }}>
                  <Clock size={14} color="#003666" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    <b>{isEs ? 'Momento Óptimo:' : 'Optimal Timing:'}</b> {row.timing}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '0.77rem', color: '#334155' }}>
                <ThermometerSnowflake size={14} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <b>{isEs ? 'Conservación / BUD:' : 'Cold-Chain / BUD:'}</b> {row.storage}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '0.77rem', color: '#334155' }}>
                <Info size={14} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <b>{isEs ? 'Aguja Estándar:' : 'Pen Needle Standard:'}</b> {row.needle}
                </span>
              </div>
            </div>

            {/* Embedded Compact Visual Pen Dial (Zero Vial/Syringe wording) */}
            <div style={{ marginTop: '4px' }}>
              <PenDialVisualizer
                penClicks={currentUnits}
                volumeMl={volumeMl}
                totalDoses={totalDosesAtSetting}
                strengthLabel={currentVariant.concentration || '3 mL'}
                isCartridge={false}
                lang={lang}
              />
            </div>
          </div>

          {/* Right: Interactive Variant Switcher + Live Proportional Click-to-Dose Calculator */}
          <div className="dnlab-detail-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={17} color="#1a73e8" />
                <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Simulador Clínico de Clics del Dial' : 'Live Clinical Click-Dial Simulator'}
                </h4>
              </div>
              <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
                {currentVariant.volume || '3 mL'} · {totalUnitsInCartridge} IU
              </span>
            </div>

            {/* Variant Selector when pen has multiple concentrations */}
            {variants.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  {isEs ? 'Opción:' : 'Variant:'}
                </span>
                {variants.map((v, idx) => {
                  const isSel = idx === activeIdx;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantIdx((prev) => ({ ...prev, [row.id]: idx }))}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: isSel ? '1.5px solid #003666' : '1px solid #cbd5e1',
                        background: isSel ? '#003666' : '#ffffff',
                        color: isSel ? '#ffffff' : '#334155',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {v.concentration} {v.label ? `· ${v.label}` : ''}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="dnlab-dial-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                  {isEs ? 'Ajuste del Dial (1 clic = 0.01 mL):' : 'Dial Setting (1 click = 0.01 mL):'}
                </span>
                <span style={{ fontSize: '1.20rem', fontWeight: 800, color: '#003666', fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}>
                  {currentUnits} {isEs ? 'clics' : 'clicks'} ({volumeMl.toFixed(2)} mL)
                </span>
              </div>

              <input
                type="range"
                min="2"
                max="50"
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
                  {isEs ? `Restablecer estándar (${defaultClicks} clics)` : `Reset standard (${defaultClicks} clicks)`}
                </button>
                <span>50 {isEs ? 'clics' : 'clicks'}</span>
              </div>
            </div>

            {/* Live Recalculated Active Dose & Treatment Supply (Symmetric 2-col grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 750 }}>
                  {isEs ? 'Dosis Activa Real / Inyección' : 'Live Active Dose / Injection'}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginTop: '3px', fontVariantNumeric: 'tabular-nums' }}>
                  {dynamicDoseBreakdown}
                </div>
                <div style={{ fontSize: '0.69rem', color: '#64748b', marginTop: '2px' }}>
                  {currentVariant.frequency}
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: '10px 12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: '0.68rem', color: '#047857', textTransform: 'uppercase', fontWeight: 750 }}>
                  {isEs ? 'Rendimiento del Pen (3 mL)' : 'Est. Yield per Pen (3 mL)'}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#065f46', marginTop: '3px', fontVariantNumeric: 'tabular-nums' }}>
                  {totalDosesAtSetting} {isEs ? 'dosis' : 'doses'}
                  {currentVariant.cycleDuration ? ` · ${currentVariant.cycleDuration}` : ''}
                </div>
                <div style={{ fontSize: '0.69rem', color: '#047857', marginTop: '2px' }}>
                  {isEs ? 'Estabilidad 30 días en frío tras apertura' : '30-day cold-chain BUD after first use'}
                </div>
              </div>
            </div>

            {/* Action Buttons: Patient Visual Guide + Prescribe + Labels Studio */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              <Link
                href={calcHref}
                className="gcp-btn-primary"
                style={{ flex: '1 1 180px', justifyContent: 'center', fontSize: '0.78rem', padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Calculator size={14} />
                <span>{isEs ? 'Guía Paciente (QR / URL)' : 'Patient Guide (QR / URL)'}</span>
              </Link>
              <button
                type="button"
                className="gcp-btn-secondary"
                style={{ flex: '1 1 140px', justifyContent: 'center', fontSize: '0.78rem', padding: '8px 12px', fontWeight: 700 }}
                onClick={() => {
                  setSelectedItemForInquiry(row);
                  setIsInquiryDrawerOpen(true);
                }}
              >
                {isEs ? 'Solicitar para Clínica' : 'Request for Clinic'}
              </button>
              <Link
                href={`/labels?search=${encodeURIComponent(row.name)}`}
                className="gcp-btn-secondary"
                style={{ justifyContent: 'center', fontSize: '0.76rem', padding: '8px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <span>{isEs ? 'Labels Studio' : 'Labels Studio'}</span>
              </Link>
            </div>
          </div>
        </div>
      );
    },
    [selectedVariantIdx, dialSettings, isEs, lang]
  );

  const breadcrumbItems = useMemo(
    () => [
      { label: isEs ? 'Tarifas B2B' : 'B2B Schedules', href: '/pricing' },
      { label: isEs ? 'Plumas Precargadas' : 'Pre-filled Peptide Pens' },
    ],
    [isEs]
  );

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

      <main className="dnlab-container">
        {/* Canonical Google Cloud Institutional Hero Card (100% Atlas Health · Zero Supplier Exposure) */}
        <PageHeroCard
          className="atlas-pens-hero"
          brandLeft="ATLAS HEALTH"
          brandRight={isEs ? 'FORMULARIO CLÍNICO' : 'CLINICAL FORMULARY'}
          badges={['≥99.2% HPLC', '3 mL · 300 IU', 'Cold-Chain 2–8°C']}
          title={
            isEs
              ? 'Plumas Precargadas Multidosis de Péptidos · Formulario Clínico'
              : 'Pre-filled Multi-Dose Peptide Pens · Clinical Formulary'
          }
          subtitle={
            isEs
              ? 'Portafolio oficial de Atlas Health Services en cartucho estéril de 3 mL (300 UI) con dosificación mecánica por clics (1 clic = 0.01 mL), estabilidad en cadena de frío y protocolos listos para prescripción médica.'
              : 'Official Atlas Health Services sterile 3 mL (300 IU) multi-dose pen portfolio with mechanical click-dial dosing (1 click = 0.01 mL), validated cold-chain stability, and ready-to-prescribe clinical protocols.'
          }
          metaItems={[
            { label: 'REF:', value: 'DOC-ATL-PENS-2026', mono: true },
            { label: isEs ? 'FRÍO:' : 'COLD-CHAIN:', value: '2°C – 8°C', mono: true },
            { label: isEs ? 'AGUJA:' : 'NEEDLE:', value: '31G / 32G 4mm', mono: true },
          ]}
          actions={
            <div className="atlas-pens-hero-actions">
              <button
                type="button"
                className="gcp-btn-primary"
                disabled={isExportingPdf}
                onClick={handleExportPdf}
                style={{ minHeight: '38px', padding: '0 14px', fontSize: '0.80rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={14} />
                <span>
                  {isExportingPdf
                    ? (isEs ? 'Generando PDF...' : 'Generating PDF...')
                    : (isEs ? 'Exportar Dossier PDF (A4)' : 'Export Clinical PDF (A4)')}
                </span>
              </button>
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handleShare}
                style={{ minHeight: '38px', padding: '0 13px', fontSize: '0.80rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {copiedLink ? <Check size={14} color="#1a73e8" /> : <Share2 size={14} />}
                <span>{copiedLink ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Compartir' : 'Share')}</span>
              </button>
              <Link
                href={`/calculator?format=pen${isEs ? '&lang=es' : ''}`}
                className="gcp-btn-secondary"
                style={{ minHeight: '38px', padding: '0 13px', fontSize: '0.80rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <Calculator size={14} />
                <span>{isEs ? 'Guía de Uso / Dial' : 'Pen Dosing Guide'}</span>
              </Link>
              <Link
                href="/pricing"
                className="gcp-btn-secondary"
                style={{ minHeight: '38px', padding: '0 13px', fontSize: '0.80rem', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
              >
                <ChevronRight size={14} />
                <span>{isEs ? 'Todas las Tarifas' : 'All Schedules'}</span>
              </Link>
            </div>
          }
        />

        {/* 4 KPIs with Scope Switcher (Golden Rule #22 · 4×1 Desktop / 2×2 Mobile) */}
        <section className="atlas-pens-kpi-wrap">
          <div className="atlas-pens-kpi-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Layers size={14} color="#003666" />
              <span>{isEs ? 'Resumen del Portafolio' : 'Portfolio Summary & Scope'}</span>
            </div>
            <div className="atlas-pens-scope-switch">
              <button
                type="button"
                className={scopeMode === 'all' ? 'active' : ''}
                onClick={() => setScopeMode('all')}
              >
                {isEs ? `Todo (${initialProducts.length})` : `Entire Portfolio (${initialProducts.length})`}
              </button>
              <button
                type="button"
                className={scopeMode === 'filtered' ? 'active' : ''}
                onClick={() => setScopeMode('filtered')}
              >
                {isEs ? `Filtrado (${filteredProducts.length})` : `Filtered (${filteredProducts.length})`}
              </button>
            </div>
          </div>

          <div className="dnlab-kpi-grid">
            <div className="dnlab-kpi-card">
              <div className="dnlab-kpi-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                <Package size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="dnlab-kpi-val">{kpiDataset.length}</div>
                <div className="dnlab-kpi-label">{isEs ? 'Plumas Formuladas' : 'Formulated Pens'}</div>
              </div>
            </div>

            <div className="dnlab-kpi-card">
              <div className="dnlab-kpi-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
                <Syringe size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="dnlab-kpi-val">{totalVariantsCount}</div>
                <div className="dnlab-kpi-label">{isEs ? 'Variantes (3 mL)' : 'Strength SKUs (3 mL)'}</div>
              </div>
            </div>

            <div className="dnlab-kpi-card">
              <div className="dnlab-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <ShieldCheck size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="dnlab-kpi-val">≥ 99.2%</div>
                <div className="dnlab-kpi-label">{isEs ? 'Pureza HPLC COA' : 'HPLC Purity COA'}</div>
              </div>
            </div>

            <div className="dnlab-kpi-card">
              <div className="dnlab-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <ThermometerSnowflake size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="dnlab-kpi-val">2°C – 8°C</div>
                <div className="dnlab-kpi-label">{isEs ? 'Frío · 30d BUD' : 'Cold-Chain · 30d BUD'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Priority Search Bar (Golden Rule #7) */}
        <div style={{ marginBottom: '0.75rem' }}>
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

        {/* Category Filter Pills — Horizontal Scrollable Strip on Mobile (Rule #23 & #29) */}
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

        {/* Main Tabular View + Dedicated Mobile Card (Golden Rule #3, #4, #23) */}
        <DataTable
          columns={columns}
          data={filteredProducts}
          keyField="id"
          expandableRender={renderDetailPanel}
          mobileCardComponent={PenMobileCard}
          mobileCardProps={{
            isEs,
            lang,
            onPrescribe: (item) => {
              setSelectedItemForInquiry(item);
              setIsInquiryDrawerOpen(true);
            },
          }}
          initialRowsPerPage={25}
          itemNoun={isEs ? 'plumas' : 'pens'}
          lang={lang}
          statusText={isEs ? 'Portafolio Clínico Atlas Health actualizado' : 'Atlas Health Clinical Pens Portfolio up to date'}
        />
      </main>

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
                  .map((v) => `${selectedItemForInquiry.name} ${v.concentration} (${v.clicksPerDose} clicks · ${v.doseBreakdown})`)
                  .join(' | '),
              }
            : null
        }
      />

      <PublicUnifiedFooter />
    </div>
  );
}
