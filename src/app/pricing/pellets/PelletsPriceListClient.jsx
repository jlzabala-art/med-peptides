'use client';

import React, { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const PelletPricePdfPreviewModal = dynamic(() => import('@/components/pricing/PelletPricePdfPreviewModal'), { ssr: false });
import {
  Syringe,
  ShieldCheck,
  Lock,
  Award,
  FileText,
  Download,
  Share2,
  Plus,
  Minus,
  Check,
  ExternalLink,
  Layers,
  X,
  Activity,
  CheckCircle2,
  ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { triggerHaptic } from '@/utils/haptics';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';
import EmptyState from '@/components/ui/EmptyState';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';

import './PelletsPriceList.css';

const FX_RATES_FROM_EUR = {
  EUR: 1.0,
  USD: 1.087,
  AED: 3.992
};

const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  AED: 'AED '
};

export default function PelletsPriceListClient({
  initialProducts = [],
  initialCurrency = 'USD',
  initialLang = 'en'
}) {
  const workspace = usePublicWorkspace();
  const currency = workspace?.currency || initialCurrency || 'USD';
  const lang = workspace?.lang || initialLang || 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState({}); // { [id]: { single: number, pack10: number } }
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [scopeMode, setScopeMode] = useState('all'); // 'all' | 'filtered'

  const isEs = lang === 'es';

  // Currency Converter
  const fxRate = FX_RATES_FROM_EUR[currency] || 1.0;
  const currencySymbol = CURRENCY_SYMBOLS[currency] || '€';

  const formatPrice = useCallback((eurAmount) => {
    if (eurAmount === null || eurAmount === undefined) return '—';
    const converted = Number(eurAmount) * fxRate;
    return `${currencySymbol}${converted.toFixed(2)}`;
  }, [fxRate, currencySymbol]);

  // Cart operations
  const handleAddToCart = useCallback((productId, type = 'single') => {
    triggerHaptic('selection');
    setCartItems(prev => {
      const current = prev[productId] || { single: 0, pack10: 0 };
      return {
        ...prev,
        [productId]: {
          ...current,
          [type]: (current[type] || 0) + 1
        }
      };
    });
    toast.success(isEs ? 'Añadido a la cotización' : 'Added to quote cart');
  }, [isEs]);

  const handleUpdateQuantity = useCallback((productId, type, delta) => {
    triggerHaptic('light');
    setCartItems(prev => {
      const current = prev[productId] || { single: 0, pack10: 0 };
      const nextVal = Math.max(0, (current[type] || 0) + delta);
      return {
        ...prev,
        [productId]: {
          ...current,
          [type]: nextVal
        }
      };
    });
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(item => {
      // Category filter
      if (selectedCategory === 'estrogen') {
        if (item.hormoneType !== 'estrogen' && item.hormoneType !== 'biest') return false;
      } else if (selectedCategory === 'androgen') {
        if (item.hormoneType !== 'androgen') return false;
      } else if (selectedCategory === 'progesterone') {
        if (item.hormoneType !== 'progesterone') return false;
      } else if (selectedCategory === 'synergy') {
        if (item.hormoneType !== 'synergy') return false;
      } else if (selectedCategory === 'trocar') {
        if (item.category !== 'Trocar Kits' && item.hormoneType !== 'instrument') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchSku = item.sku?.toLowerCase().includes(q);
        const matchDesc = item.shortDescription?.toLowerCase().includes(q);
        const matchStrength = item.strength?.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchDesc && !matchStrength) return false;
      }

      return true;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  // Cart Totals calculation
  const cartSummary = useMemo(() => {
    let totalItems = 0;
    let totalEur = 0;

    Object.entries(cartItems).forEach(([prodId, counts]) => {
      const product = initialProducts.find(p => p.id === prodId);
      if (!product) return;

      const singlePriceEur = product.pricing?.wholesalePriceEur || product.pricing?.price_eur || product.pricing?.costPriceEur || 0;
      const pack10PriceEur = product.pricing?.pack10PriceEur || (singlePriceEur * 10 * 0.90); // 10% discount for pack ×10

      if (counts.single > 0) {
        totalItems += counts.single;
        totalEur += counts.single * singlePriceEur;
      }
      if (counts.pack10 > 0) {
        totalItems += counts.pack10 * 10;
        totalEur += counts.pack10 * pack10PriceEur;
      }
    });

    return {
      totalItems,
      totalEur,
      formattedTotal: formatPrice(totalEur)
    };
  }, [cartItems, initialProducts, formatPrice]);

  // Listen to open-pellets-pdf-modal from GlobalBottomStickyBar and set Atlas context
  React.useEffect(() => {
    const handler = () => setIsPdfPreviewOpen(true);
    window.addEventListener('open-pellets-pdf-modal', handler);

    // Provide rich Pellets context to Atlas AI
    const detail = {
      contextType: 'catalog',
      storageKey: 'pricing-pellets',
      contextAnchor: {
        sectionTitle: isEs
          ? 'Pellets Hormonales Subcutáneos Pharmapolis (EU GMP) y Kits Quirúrgicos de Trócar'
          : 'Pharmapolis Subcutaneous Bioidentical Hormone Pellets & Surgical Trocar Kits',
        keyActives: '17β-Estradiol, Biest, Micronized Testosterone (USP), Progesterone (P4), Testosterone + Anastrozole, Single-Use Surgical Trocars (3.2mm & 4.5mm)',
        mechanisms: isEs
          ? 'Implantes cristalinos comprimidos estériles EU GMP, irradiación E-Beam validada SAL 10⁻⁶, liberación continua de orden cero durante 3.5 a 6 meses sin fluctuaciones, 0% primer paso hepático, tarifas mayoristas unitarias y packs de 10.'
          : 'EU GMP sterile crystalline compressed implants, validated E-Beam SAL 10⁻⁶, zero-order release kinetics over 3.5 to 6 months without peak/trough fluctuations, 0% hepatic first-pass bypass, wholesale unit and pack-of-10 institutional pricing tiers.',
      },
    };
    window.dispatchEvent(new CustomEvent('set-public-atlas-context', { detail }));

    return () => window.removeEventListener('open-pellets-pdf-modal', handler);
  }, [isEs]);

  // Share link handler (Bilingual WhatsApp-ready)
  const handleShare = async () => {
    const url = 'https://www.atlashealth-services.com/pricing/pellets';
    const text = isEs
      ? `Tarifa Oficial B2B · Pellets Hormonales Subcutáneos Pharmapolis (EU GMP)\nMonografías clínicas y precios mayoristas institucionales:\n${url}`
      : `Official B2B Price Schedule · Pharmapolis Subcutaneous Hormone Pellets (EU GMP)\nClinical monographs & institutional wholesale pricing:\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: isEs ? 'Tarifa Oficial B2B · Pellets Hormonales Subcutáneos' : 'Official B2B Price Schedule · Hormone Pellets',
          text,
          url
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      triggerHaptic('copy');
      toast.success(isEs ? 'Enlace y detalles copiados para compartir' : 'Price schedule details copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: initialProducts.length, estrogen: 0, androgen: 0, progesterone: 0, synergy: 0, trocar: 0 };
    initialProducts.forEach(p => {
      if (p.hormoneType === 'estrogen' || p.hormoneType === 'biest') counts.estrogen++;
      else if (p.hormoneType === 'androgen') counts.androgen++;
      else if (p.hormoneType === 'progesterone') counts.progesterone++;
      else if (p.hormoneType === 'synergy') counts.synergy++;
      else if (p.category === 'Trocar Kits' || p.hormoneType === 'instrument') counts.trocar++;
    });
    return counts;
  }, [initialProducts]);

  // DataTable columns definition (Strict Rule #3 & Rule #30 - Zero horizontal scroll)
  const columns = useMemo(() => [
    {
      key: 'itemNumber',
      label: '#',
      width: '45px',
      align: 'center',
      render: (val, row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.74rem', color: '#64748b' }}>
          {val || row.itemNumber}
        </span>
      )
    },
    {
      key: 'name',
      label: isEs ? 'Formulación & Dosis' : 'Formulation & Strength',
      width: '270px',
      render: (val, row) => {
        const isPellet = row.category !== 'Trocar Kits';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isPellet ? (
                <Link
                  href={`/p/${row.slug}`}
                  style={{
                    color: '#003666',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    textDecoration: 'none'
                  }}
                  className="hover:underline"
                >
                  {row.name}
                </Link>
              ) : (
                <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.84rem' }}>
                  {row.name}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                color: row.hormoneType === 'estrogen' ? '#be185d' : row.hormoneType === 'androgen' ? '#1d4ed8' : '#0d9488',
                backgroundColor: row.hormoneType === 'estrogen' ? '#fdf2f8' : row.hormoneType === 'androgen' ? '#eff6ff' : '#f0fdfa',
                border: `1px solid ${row.hormoneType === 'estrogen' ? '#fbcfe8' : row.hormoneType === 'androgen' ? '#bfdbfe' : '#ccfbf1'}`,
                padding: '1px 6px',
                borderRadius: '4px'
              }}>
                {row.strength}
              </span>
              {row.purity && (
                <span style={{ fontSize: '0.66rem', color: '#16a34a', fontWeight: 600 }}>
                  {row.purity}
                </span>
              )}
            </div>
            {/* Embedded SKU underneath to eliminate dedicated SKU column */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
              <CopyableId value={row.sku} displayValue={row.sku} />
              <span style={{ fontSize: '0.64rem', color: '#64748b' }}>
                {row.category === 'Trocar Kits' ? (isEs ? 'Instrumental' : 'Surgical Kit') : 'EU GMP Blister'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'trocarSize',
      label: isEs ? 'Trócar / Vía' : 'Trocar Cannula',
      width: '115px',
      render: (val) => (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.74rem',
          fontWeight: 700,
          color: '#334155',
          background: '#f1f5f9',
          border: '1px solid #e2e8f0',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          <Syringe size={11} color="#003666" />
          <span>{val}</span>
        </span>
      )
    },
    {
      key: 'duration',
      label: isEs ? 'Cinética' : 'Kinetics / Duration',
      width: '125px',
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
            {val}
          </span>
          {row.targetSerum && row.targetSerum !== 'N/A (Surgical Kit)' && (
            <span style={{ fontSize: '0.66rem', color: '#64748b' }}>
              Obj: {row.targetSerum}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'singlePrice',
      label: isEs ? 'Tarifa Unitaria' : 'Single Unit',
      width: '120px',
      align: 'right',
      render: (_, row) => {
        const eur = row.pricing?.wholesalePriceEur || row.pricing?.price_eur || row.pricing?.costPriceEur || 0;
        const currentQty = cartItems[row.id]?.single || 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
              {formatPrice(eur)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {currentQty > 0 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff' }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(row.id, 'single', -1)}
                    style={{ border: 'none', background: 'transparent', padding: '2px 6px', cursor: 'pointer' }}
                  >
                    <Minus size={11} />
                  </button>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0 4px' }}>{currentQty}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(row.id, 'single', 1)}
                    style={{ border: 'none', background: 'transparent', padding: '2px 6px', cursor: 'pointer' }}
                  >
                    <Plus size={11} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddToCart(row.id, 'single')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#003666',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={10} />
                  <span>{isEs ? 'Unidad' : 'Single'}</span>
                </button>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'pack10Price',
      label: isEs ? 'Pack ×10 (-10%)' : 'Pack ×10 Box (-10%)',
      width: '145px',
      align: 'right',
      render: (_, row) => {
        const eur = row.pricing?.wholesalePriceEur || row.pricing?.price_eur || row.pricing?.costPriceEur || 0;
        const pack10Eur = row.pricing?.pack10PriceEur || (eur * 10 * 0.90); // 10% institutional discount
        const currentQty = cartItems[row.id]?.pack10 || 0;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#16a34a' }}>
                {formatPrice(pack10Eur)}
              </span>
              <span style={{
                fontSize: '0.64rem',
                fontWeight: 700,
                color: '#166534',
                backgroundColor: '#dcfce7',
                border: '1px solid #bbf7d0',
                padding: '1px 5px',
                borderRadius: '3px'
              }}>
                -10%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {currentQty > 0 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff' }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(row.id, 'pack10', -1)}
                    style={{ border: 'none', background: 'transparent', padding: '2px 6px', cursor: 'pointer' }}
                  >
                    <Minus size={11} />
                  </button>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0 4px' }}>{currentQty}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(row.id, 'pack10', 1)}
                    style={{ border: 'none', background: 'transparent', padding: '2px 6px', cursor: 'pointer' }}
                  >
                    <Plus size={11} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAddToCart(row.id, 'pack10')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#166534',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={10} />
                  <span>{isEs ? 'Pack ×10' : 'Pack ×10'}</span>
                </button>
              )}
            </div>
          </div>
        );
      }
    }
  ], [isEs, formatPrice, cartItems, handleAddToCart, handleUpdateQuantity]);

  // Master Detail Render (Strict Rule #4)
  const expandableRender = useCallback((row) => (
    <div className="pellets-detail-panel">
      <div className="pellets-detail-col">
        <span className="pellets-detail-title">
          {isEs ? 'Perfil Clínico & Especificaciones Farmacéuticas' : 'Clinical Profile & Pharmaceutical Specs'}
        </span>
        <p className="pellets-detail-desc">
          {row.shortDescription}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.72rem', color: '#64748b' }}>
          <span><strong>{isEs ? 'Fabricante:' : 'Manufacturer:'}</strong> Pharmapolis Compounding (Bulgaria)</span>
          <span>•</span>
          <span><strong>{isEs ? 'Esterilidad:' : 'Sterility:'}</strong> E-Beam SAL 10⁻⁶</span>
          <span>•</span>
          <span><strong>{isEs ? 'Regulación:' : 'Regulation:'}</strong> POM / EU GMP</span>
        </div>
      </div>

      <div className="pellets-detail-col" style={{ alignItems: 'flex-start' }}>
        <span className="pellets-detail-title">
          {isEs ? 'Recursos Clínicos Relacionados' : 'Associated Clinical Resources'}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
          <Link
            href="/guides/hormone-pellets-implantation"
            target="_blank"
            className="pellets-guide-btn"
          >
            <Activity size={13} />
            <span>{isEs ? 'Ver Guía Gráfica de Implante con Trócar' : 'Open Interactive Trocar Guide'}</span>
            <ExternalLink size={12} />
          </Link>

          {row.category !== 'Trocar Kits' && (
            <Link
              href={`/p/${row.slug}`}
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.74rem',
                color: '#003666',
                fontWeight: 700,
                textDecoration: 'none',
                marginTop: '4px'
              }}
            >
              <FileText size={13} />
              <span>{isEs ? 'Abrir Monografía Completa (7 Secciones)' : 'Open Full Clinical Monograph (7 Tabs)'}</span>
              <ExternalLink size={12} />
            </Link>
          )}
        </div>
      </div>
    </div>
  ), [isEs]);

  // Contextual KPI values
  const activeCount = scopeMode === 'all' ? initialProducts.length : filteredProducts.length;

  return (
    <div className="pellets-price-page">
      {/* ── UNIFIED ATLAS PUBLIC HEADER ── */}
      <PublicUnifiedHeader
        currentApp="services"
        lang={lang}
        currency={currency}
        onCurrencyChange={(c) => workspace?.setCurrency?.(c)}
        onLangChange={(l) => workspace?.setLang?.(l)}
      />

      {/* ── GOOGLE CLOUD CONSOLE RESOURCE HEADER ── */}
      <div className="gcp-resource-page-header">
        <div className="gcp-resource-header-container">
          {/* Title Row with Status Pills */}
          <div className="gcp-resource-main-row">
            <div className="gcp-resource-title-group">
              <div className="gcp-resource-title-line">
                <div className="gcp-resource-icon-badge">
                  <Syringe size={16} />
                </div>
                <h1 className="gcp-resource-title">
                  {isEs
                    ? 'Pellets Hormonales Subcutáneos y Kits Quirúrgicos • Tarifa Oficial B2B'
                    : 'Subcutaneous Hormone Pellets & Surgical Trocar Kits • Official B2B Schedule'}
                </h1>
                <span className="gcp-status-pill gcp-status-active">
                  <span className="gcp-status-dot"></span>
                  <span>Pharmapolis EU GMP · Plovdiv (Bulgaria)</span>
                </span>
                <span className="gcp-status-pill gcp-status-category">
                  {isEs ? 'Cat. C · Pellets Subcutáneos' : 'Cat. C · Subcutaneous Pellets'}
                </span>
                <span className="gcp-status-pill gcp-status-pom">
                  <Lock size={11} />
                  <span>{isEs ? 'Uso Médico Exclusivo (POM)' : 'Prescription Only Medicine (POM)'}</span>
                </span>
                <div className="gcp-resource-sku-wrap">
                  <span className="gcp-resource-sku-label">REF:</span>
                  <CopyableId value="DOC-BG-PHARM-PELLET-2026" displayValue="DOC-BG-PHARM-PELLET-2026" />
                </div>
              </div>

              {/* Sub-line: Clinical Metadata Strip (Accurate Bioidentical Pellets Parameters) */}
              <div className="gcp-resource-meta-line">
                <span className="gcp-resource-meta-item">
                  <strong>{isEs ? 'Pureza:' : 'Purity:'}</strong> ≥ 99.5% USP/EP Bioidentical Pure
                </span>
                <span className="gcp-resource-meta-sep">•</span>
                <span className="gcp-resource-meta-item">
                  <strong>{isEs ? 'Cinética:' : 'Kinetics:'}</strong> {isEs ? 'Orden Cero 3.5 a 6 meses' : 'Zero-order 3.5 to 6 months'}
                </span>
                <span className="gcp-resource-meta-sep">•</span>
                <span className="gcp-resource-meta-item">
                  <strong>{isEs ? 'Esterilización:' : 'Sterilization:'}</strong> {isEs ? 'E-Beam Validada SAL 10⁻⁶' : 'Validated E-Beam SAL 10⁻⁶'}
                </span>
                <span className="gcp-resource-meta-sep">•</span>
                <span className="gcp-resource-meta-item">
                  <strong>{isEs ? 'Primer Paso Hepático:' : 'First-Pass:'}</strong> {isEs ? '0% (Absorción Subcutánea Directa)' : '0% (Hepatic Bypassed)'}
                </span>
              </div>
            </div>

            {/* Right Action Toolbar: Clean GCP 3-Button Standard (Currency/Lang handled by PublicUnifiedHeader) */}
            <div className="gcp-resource-action-toolbar">

              {/* Preview & Save PDF Schedule */}
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setIsPdfPreviewOpen(true)}
                title={isEs ? 'Vista Previa Oficial A4 / Guardar PDF' : 'Official A4 Preview / Save PDF'}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={13} color="#003666" />
                <span>{isEs ? 'Vista Previa Tarifa' : 'Preview Schedule'}</span>
              </button>

              {/* Share */}
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={handleShare}
                title={isEs ? 'Copiar enlace al portapapeles' : 'Copy link to clipboard'}
              >
                <Share2 size={13} />
                <span>{isEs ? 'Compartir' : 'Share'}</span>
              </button>

              {/* Request Allocation */}
              <button
                type="button"
                className="gcp-btn-primary"
                onClick={() => setIsInquiryDrawerOpen(true)}
              >
                <FileText size={13} />
                <span>{isEs ? 'Solicitar Asignación' : 'Request Allocation'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="pellets-price-container">
        {/* ── 4 KPIs with Scope Switcher (Strict Golden Rule #22) ── */}
        <div className="pellets-kpi-bar">
          <div className="pellets-kpi-header">
            <div className="pellets-kpi-title">
              <Award size={16} color="#003666" />
              <span>{isEs ? 'Resumen Métrico Institucional' : 'Institutional Summary & Scope'}</span>
            </div>

            {/* Scope Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {isEs ? 'Alcance:' : 'Scope:'}
              </span>
              <div className="gcp-segmented-switch">
                <button
                  type="button"
                  className={`gcp-segmented-btn ${scopeMode === 'all' ? 'active' : ''}`}
                  onClick={() => setScopeMode('all')}
                >
                  {isEs ? `Base Global (${initialProducts.length})` : `All Database (${initialProducts.length})`}
                </button>
                <button
                  type="button"
                  className={`gcp-segmented-btn ${scopeMode === 'filtered' ? 'active' : ''}`}
                  onClick={() => setScopeMode('filtered')}
                >
                  {isEs ? `Filtro Activo (${filteredProducts.length})` : `Filtered (${filteredProducts.length})`}
                </button>
              </div>
            </div>
          </div>

          <div className="pellets-kpi-grid">
            <div className="pellets-kpi-card">
              <span className="pellets-kpi-card-label">
                {isEs ? 'Formulaciones Disponibles' : 'Sterile Formulations'}
              </span>
              <span className="pellets-kpi-card-val">
                {activeCount} {isEs ? 'Líneas' : 'SKUs'}
              </span>
              <span className="pellets-kpi-card-sub">
                ≥99.5% USP Bioidentical Pure
              </span>
            </div>

            <div className="pellets-kpi-card">
              <span className="pellets-kpi-card-label">
                {isEs ? 'Rango Tarifario B2B' : 'Wholesale Price Range'}
              </span>
              <span className="pellets-kpi-card-val">
                {formatPrice(39.01)} – {formatPrice(77.90)}
              </span>
              <span className="pellets-kpi-card-sub">
                {isEs ? 'Tarifa mayorista oficial' : 'Official wholesale tariff'}
              </span>
            </div>

            <div className="pellets-kpi-card">
              <span className="pellets-kpi-card-label">
                {isEs ? 'Ahorro Pack ×10 Institucional' : 'Pack ×10 Tier Savings'}
              </span>
              <span className="pellets-kpi-card-val" style={{ color: '#16a34a' }}>
                -10% Volume Discount
              </span>
              <span className="pellets-kpi-card-sub">
                {isEs ? `Desde ${formatPrice(351.09)} / caja ×10` : `From ${formatPrice(351.09)} / 10-pack box`}
              </span>
            </div>

            <div className="pellets-kpi-card">
              <span className="pellets-kpi-card-label">
                {isEs ? 'Ventana Cinética Meseta' : 'Zero-Order Release'}
              </span>
              <span className="pellets-kpi-card-val">
                3.5 to 6 Months
              </span>
              <span className="pellets-kpi-card-sub">
                {isEs ? 'Sin picos ni valles séricos' : 'Steady state without fluctuations'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Content Layout with Left Sidebar Rail & Main Table ── */}
        <div className="pellets-content-layout">
          {/* Left Category Sidebar Rail */}
          <aside className="pellets-sidebar-rail">
            <div className="pellets-sidebar-title">
              <span>{isEs ? 'Categorías' : 'Categories'}</span>
              <Layers size={13} color="#64748b" />
            </div>

            <div className="pellets-category-list">
              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <span>{isEs ? 'Todas las Líneas' : 'All Formulations'}</span>
                <span className="pellets-cat-count">{categoryCounts.all}</span>
              </button>

              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'estrogen' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('estrogen')}
              >
                <span>{isEs ? '17β-Estradiol & Biest' : '17β-Estradiol & Biest'}</span>
                <span className="pellets-cat-count">{categoryCounts.estrogen}</span>
              </button>

              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'androgen' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('androgen')}
              >
                <span>{isEs ? 'Testosterona (T)' : 'Testosterone (T)'}</span>
                <span className="pellets-cat-count">{categoryCounts.androgen}</span>
              </button>

              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'progesterone' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('progesterone')}
              >
                <span>{isEs ? 'Progesterona (P4)' : 'Progesterone (P4)'}</span>
                <span className="pellets-cat-count">{categoryCounts.progesterone}</span>
              </button>

              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'synergy' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('synergy')}
              >
                <span>{isEs ? 'T + Anastrozol' : 'T + Anastrozole'}</span>
                <span className="pellets-cat-count">{categoryCounts.synergy}</span>
              </button>

              <button
                type="button"
                className={`pellets-cat-btn ${selectedCategory === 'trocar' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('trocar')}
              >
                <span>{isEs ? 'Kits de Trócar' : 'Trocar Kits'}</span>
                <span className="pellets-cat-count">{categoryCounts.trocar}</span>
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <Link
                href="/guides/hormone-pellets-implantation"
                target="_blank"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#0d9488',
                  textDecoration: 'none'
                }}
              >
                <Activity size={13} />
                <span>{isEs ? 'Guía Técnica de Trócar' : 'Interactive Trocar Guide'}</span>
                <ExternalLink size={11} />
              </Link>
            </div>
          </aside>

          {/* Main Table Column */}
          <div style={{ minWidth: 0 }}>
            {/* Global Search Bar (Strict Rule #6 & #7) */}
            <div className="pellets-filter-toolbar">
              <GlobalSearchBar
                namespace="pellets"
                searchScope="local"
                lang={lang}
                value={searchQuery}
                onChange={setSearchQuery}
                size="lg"
              />

              {/* Active Filter Chips (Rule #24) */}
              {(selectedCategory !== 'all' || searchQuery.trim()) && (
                <div className="pellets-active-chips">
                  {selectedCategory !== 'all' && (
                    <span className="pellets-chip">
                      <span>{isEs ? 'Categoría:' : 'Category:'} {selectedCategory}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory('all')}
                        className="pellets-chip-remove"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {searchQuery.trim() && (
                    <span className="pellets-chip">
                      <span>{isEs ? 'Búsqueda:' : 'Query:'} &ldquo;{searchQuery}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="pellets-chip-remove"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {isEs ? 'Limpiar filtros' : 'Reset filters'}
                  </button>
                </div>
              )}
            </div>

            {/* DataTable (Strict Rule #3 & Rule #4) */}
            {filteredProducts.length > 0 ? (
              <DataTable
                columns={columns}
                data={filteredProducts}
                expandableRender={expandableRender}
                pagination={false}
              />
            ) : (
              <EmptyState
                icon={Syringe}
                title={isEs ? 'No se encontraron formulaciones' : 'No formulations found'}
                subtitle={isEs
                  ? 'Prueba a cambiar los filtros de categoría o el término de búsqueda.'
                  : 'Try modifying your search criteria or category filter.'}
                action={{
                  label: isEs ? 'Restablecer filtros' : 'Reset Filters',
                  onClick: () => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* ── FLOATING BOTTOM CART / RFQ DOCK ── */}
      {cartSummary.totalItems > 0 && (
        <div className="pellets-cart-dock">
          <div className="pellets-cart-dock-inner">
            <div className="pellets-cart-summary">
              <span className="pellets-cart-badge">
                <ShoppingCart size={13} style={{ marginRight: '4px' }} />
                {cartSummary.totalItems} {isEs ? 'unidades' : 'units'}
              </span>
              <div className="pellets-cart-subtotal">
                <span className="pellets-cart-subtotal-lbl">
                  {isEs ? 'Subtotal Estimado Cotización' : 'Estimated RFQ Subtotal'}
                </span>
                <span className="pellets-cart-subtotal-val">
                  {cartSummary.formattedTotal}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="gcp-btn-secondary"
                onClick={() => setCartItems({})}
              >
                <span>{isEs ? 'Vaciar' : 'Clear'}</span>
              </button>

              <button
                type="button"
                className="gcp-btn-primary"
                onClick={() => setIsInquiryDrawerOpen(true)}
              >
                <CheckCircle2 size={14} />
                <span>{isEs ? 'Solicitar Asignación / Cotización Formal' : 'Request Allocation / Official Quote'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── B2B INQUIRY DRAWER ── */}
      {isInquiryDrawerOpen && (
        <PublicInstitutionalInquiryDrawer
          isOpen={isInquiryDrawerOpen}
          onClose={() => setIsInquiryDrawerOpen(false)}
          contextType="pellets_b2b_schedule"
          brandType="pharmapolis_pellets"
          lang={lang}
          customNotes={`Pharmapolis Subcutaneous Pellets RFQ Request. Currency: ${currency}. Selected items: ${JSON.stringify(cartItems)}`}
        />
      )}

      {/* ── OFFICIAL PRICE SCHEDULE PDF PREVIEW MODAL ── */}
      {isPdfPreviewOpen && (
        <PelletPricePdfPreviewModal
          isOpen={isPdfPreviewOpen}
          onClose={() => setIsPdfPreviewOpen(false)}
          products={initialProducts}
          currency={currency}
          currencySymbol={currencySymbol}
          formatPrice={formatPrice}
          lang={lang}
        />
      )}

      {/* ── FOOTER ── */}
      <PublicUnifiedFooter lang={lang} />
    </div>
  );
}
