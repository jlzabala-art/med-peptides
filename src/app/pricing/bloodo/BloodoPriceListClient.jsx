'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Award,
  Check,
  Droplets,
  ExternalLink,
  FileText,
  HeartPulse,
  Microscope,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';
import EmptyState from '@/components/ui/EmptyState';
import PageHeroCard from '@/components/ui/PageHeroCard';
import PricingScheduleMobileCard from '@/components/pricing/shared/PricingScheduleMobileCard';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import { buildSchedulePdfBlob } from '@/lib/pdf/schedulePdfBuilder';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import CatalogPricingBridgeBar from '@/components/shared/CatalogPricingBridgeBar';
import ActivePricingContextBadge from '@/components/pricing/shared/ActivePricingContextBadge';
import { usePricingViewMode } from '@/hooks/pricing/usePricingViewMode';
import { usePricing } from '@/hooks/usePricing';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import { FX_RATES_FROM_EUR, CURRENCY_SYMBOLS } from '@/constants/fxRates';

export default function BloodoPriceListClient({
  initialProducts = [],
  initialLang = 'en',
  initialCurrency = 'EUR',
}) {
  const { viewMode, handleViewModeChange } = usePricingViewMode();
  const { isAdmin, pricingRole, resolve: resolveProduct } = usePricing();
  const [localLang, setLocalLang] = useState(initialLang);
  const [localCurrency, setLocalCurrency] = useState(initialCurrency);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState({});
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

  const workspace = usePublicWorkspace?.() || {};
  const { addToWorkspaceCart } = workspace;
  const lang = workspace?.lang || localLang;
  const currency = workspace?.currency || localCurrency;
  const isEs = lang === 'es';

  useEffect(() => {
    const detail = {
      contextType: 'catalog',
      storageKey: 'pricing-bloodo',
      contextAnchor: {
        sectionTitle: isEs
          ? 'Bloodo™ Diagnóstico Capilar en Sangre (CE-IVDR · ISO 15189) — Tarifa B2B'
          : 'Bloodo™ Capillary Blood Diagnostics (CE-IVDR · ISO 15189) — B2B Price Schedule',
        keyActives: 'NAD+ Intracellular, Testosterone+, Diurnal Cortisol CAR, Omega-3/6 Ratio, HbA1c, 25-OH Vitamin D',
        mechanisms: isEs
          ? 'Kits de gota de sangre seca (DBS) validados CE-IVDR con análisis LC-MS/MS/HPLC en laboratorio ISO 15189 y resultados en 48–72h. Tarifas mayoristas B2B oficiales.'
          : 'CE-IVDR validated Dried Blood Spot (DBS) kits analyzed via LC-MS/MS/HPLC in ISO 15189 accredited European lab with 48–72h turnaround. Official B2B wholesale schedule.',
      },
    };
    window.dispatchEvent(new CustomEvent('set-public-atlas-context', { detail }));
  }, [isEs]);

  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'pricing',
        category: 'bloodo',
        title: isEs ? 'Tarifa Oficial Bloodo™ B2B' : 'Official Bloodo™ B2B Price Schedule',
        itemsCount: initialProducts.length,
        tier: 'wholeseller_15_15',
      },
    },
    [isEs, initialProducts.length]
  );

  const formatPrice = useCallback(
    (eurVal) => {
      const rate = FX_RATES_FROM_EUR[currency] || 1.0;
      const converted = (Number(eurVal) || 0) * rate;
      const symbol = CURRENCY_SYMBOLS[currency] || '€';
      return `${symbol}${converted.toFixed(2)}`;
    },
    [currency]
  );

  const handleQtyChange = useCallback(
    (product, delta) => {
      setCartItems((prev) => {
        const nextQty = Math.max(0, (prev[product.id] || 0) + delta);
        const next = { ...prev, [product.id]: nextQty };
        if (nextQty === 0) delete next[product.id];
        return next;
      });
      if (delta > 0 && typeof addToWorkspaceCart === 'function') {
        const resolved = resolveProduct(product);
        addToWorkspaceCart({
          id: product.id,
          name: product.name,
          sku: product.sku,
          priceEur: resolved.primaryPrice ?? product.wholesalePriceEur,
          quantity: 1,
          type: 'diagnostic',
        });
      }
    },
    [addToWorkspaceCart, resolveProduct]
  );

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hay = `${p.name} ${p.nameEs} ${p.sku} ${p.biomarker} ${p.methodology}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  const cartSummary = useMemo(() => {
    let count = 0;
    let totalEur = 0;
    Object.entries(cartItems).forEach(([id, qty]) => {
      const item = initialProducts.find((p) => p.id === id);
      if (!item || !qty) return;
      const resolved = resolveProduct(item);
      count += qty;
      totalEur += qty * (Number(resolved.primaryPrice ?? item.wholesalePriceEur) || 0);
    });
    return { count, totalEur, formatted: formatPrice(totalEur) };
  }, [cartItems, initialProducts, formatPrice, resolveProduct]);

  const handleShare = async () => {
    const url = `https://www.atlashealth-services.com/pricing/bloodo?lang=${lang}&currency=${currency}`;
    const text = isEs
      ? `Tarifa Oficial B2B · Kits Bloodo™ Diagnóstico Capilar (CE-IVDR / ISO 15189)\nPrecios mayoristas actualizados (${currency}):\n${url}`
      : `Official B2B Price Schedule · Bloodo™ Capillary Blood Diagnostics (CE-IVDR / ISO 15189)\nUpdated wholesale schedule (${currency}):\n${url}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: isEs ? 'Tarifa Oficial B2B · Bloodo™' : 'Official B2B Price Schedule · Bloodo™',
          text,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast.success(isEs ? 'Enlace de tarifa copiado ✓' : 'Price schedule link copied ✓');
    }
  };

  const categoryFilters = useMemo(
    () => [
      { id: 'all', label: isEs ? `Todos (${initialProducts.length})` : `All (${initialProducts.length})` },
      { id: 'bioenergetics', label: isEs ? 'Bioenergética (NAD+)' : 'Bioenergetics (NAD+)' },
      { id: 'endocrine', label: isEs ? 'Endocrino' : 'Endocrine' },
      { id: 'lipidomics', label: 'Omega-3/6' },
      { id: 'metabolic', label: 'HbA1c' },
      { id: 'micronutrients', label: isEs ? 'Vitamina D' : 'Vitamin D' },
    ],
    [isEs, initialProducts.length]
  );

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: isEs ? 'Panel Diagnóstico & Biomarcador' : 'Diagnostic Panel & Biomarker',
        align: 'left',
        width: '36%',
        render: (_val, row) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={row.image}
              alt={row.name}
              style={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                objectFit: 'cover',
                border: '1px solid #e2e8f0',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
              <Link
                href={`/p/${encodeURIComponent(row.slug)}`}
                style={{ fontSize: '0.86rem', fontWeight: 700, color: '#202124', textDecoration: 'none' }}
              >
                {isEs ? row.nameEs : row.name}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <CopyableId value={row.sku} />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{row.biomarker}</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'methodology',
        label: isEs ? 'Método & Plazo' : 'Methodology & TAT',
        align: 'left',
        width: '20%',
        render: (_val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>{row.methodology}</span>
            <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
              ISO 15189 · {row.turnaround}
            </span>
          </div>
        ),
      },
      {
        key: 'wholesalePriceEur',
        label:
          pricingRole === 'distributor'
            ? 'Distributor (+15%)'
            : pricingRole === 'clinic'
              ? (isEs ? 'Tarifa Clínica' : 'Clinic Rate')
              : pricingRole === 'retail'
                ? (isEs ? 'PVP / Paciente' : 'Retail Rate')
                : (isEs ? 'Wholeseller B2B' : 'B2B Wholeseller'),
        align: 'right',
        width: '16%',
        render: (_val, row) => {
          const resolved = resolveProduct(row);
          const activePrice = resolved.primaryPrice ?? row.wholesalePriceEur;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                {formatPrice(activePrice)}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 600 }}>
                {isAdmin && resolved.cost
                  ? `Cost ${formatPrice(resolved.cost)} · Dist ${formatPrice(resolved.distributor)}`
                  : (resolved.primaryLabel || (isEs ? 'Tarifa B2B Oficial' : 'Official B2B Rate'))}
              </span>
            </div>
          );
        },
      },
      {
        key: 'clinicPriceEur',
        label: isEs ? 'Clínica / PVP Ref.' : 'Clinic / Retail Ref.',
        align: 'right',
        width: '14%',
        render: (_val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.76rem', color: '#64748b' }}>
            <span>
              {isEs ? 'Clínica:' : 'Clinic:'} <strong style={{ color: '#334155' }}>{formatPrice(row.clinicPriceEur)}</strong>
            </span>
            <span>
              PVP: {formatPrice(row.retailPriceEur)}
            </span>
          </div>
        ),
      },
      {
        key: 'actions',
        label: isEs ? 'Cotización' : 'Quote',
        align: 'right',
        width: '14%',
        render: (_val, row) => {
          const qty = cartItems[row.id] || 0;
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
              {qty > 0 ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #dadce0', borderRadius: '6px', background: '#ffffff' }}>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(row, -1)}
                    aria-label="Remove one"
                    style={{ padding: '5px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#3c4043' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0 6px' }}>{qty}</span>
                  <button
                    type="button"
                    onClick={() => handleQtyChange(row, 1)}
                    aria-label="Add one"
                    style={{ padding: '5px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#1a73e8' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="gcp-btn-secondary"
                  onClick={() => handleQtyChange(row, 1)}
                  style={{ fontSize: '0.74rem', padding: '5px 10px', minHeight: '34px' }}
                >
                  <Plus size={13} />
                  <span>{isEs ? 'Añadir' : 'Add'}</span>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [isEs, formatPrice, cartItems, handleQtyChange]
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '88px' }}>
      <PublicUnifiedHeader
        track="products"
        lang={lang}
        onLangChange={(nextLang) => {
          setLocalLang(nextLang);
          workspace?.setLang?.(nextLang);
        }}
        currency={currency}
        onCurrencyChange={(nextCurr) => {
          setLocalCurrency(nextCurr);
          workspace?.setCurrency?.(nextCurr);
        }}
        brandHref="/"
        loginRedirect="/pricing/bloodo"
        hideAiButton={false}
        hideContactButton={true}
        mobileTitle="Bloodo™ Diagnostics"
        mobileSubtitle={`CE-IVDR · ${initialProducts.length} Kits`}
        breadcrumb={[
          { label: isEs ? 'Tarifas B2B' : 'B2B Schedules', href: '/pricing' },
          { label: 'Bloodo™ Diagnostics' },
        ]}
      />

      <CatalogPricingBridgeBar
        activeMode={viewMode === 'cards' ? 'catalog' : 'pricing'}
        slug="bloodo"
        lang={lang}
        onViewModeChange={handleViewModeChange}
      />

      <main className="atlas-page-shell" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '88px' }}>
        <PageHeroCard
          badge={isEs ? 'Diagnóstico Capilar CE-IVDR · ISO 15189' : 'CE-IVDR Capillary Diagnostics · ISO 15189'}
          title={isEs ? 'Tarifa Oficial B2B · Kits Diagnósticos Bloodo™' : 'Official B2B Price Schedule · Bloodo™ Diagnostics'}
          subtitle={
            isEs
              ? 'Paneles de gota de sangre seca (DBS) con análisis LC-MS/MS europeo acreditado ISO 15189 y resultados en 48–72 horas. Tarifa mayorista oficial para clínicas.'
              : 'Precision Dried Blood Spot (DBS) kits analyzed via ISO 15189 accredited European LC-MS/MS reference lab with 48–72h turnaround. Official clinic & wholesale schedule.'
          }
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <ActivePricingContextBadge currency={currency} lang={lang} />
              <button type="button" className="gcp-btn-secondary" onClick={() => setIsPdfPreviewOpen(true)}>
                <FileText size={14} />
                <span>{isEs ? 'Tarifa PDF' : 'Download PDF'}</span>
              </button>
              <button type="button" className="gcp-btn-secondary" onClick={handleShare}>
                <Share2 size={14} />
                <span>{isEs ? 'Compartir' : 'Share'}</span>
              </button>
              <button type="button" className="gcp-btn-primary" onClick={() => setIsInquiryOpen(true)}>
                <ShoppingCart size={14} />
                <span>
                  {cartSummary.count > 0
                    ? `${isEs ? 'Solicitar Presupuesto' : 'Request Quote'} (${cartSummary.count} · ${cartSummary.formatted})`
                    : (isEs ? 'Solicitar Presupuesto' : 'Request Quote')}
                </span>
              </button>
            </div>
          }
        />

        {/* 3-Point Clinical Decision Strip (Matches Pellets UX) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem', color: '#334155' }}>
          <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', fontWeight: 600 }}>
            ✓ {isEs ? 'Laboratorio Europeo ISO 15189 (LC-MS/MS)' : 'ISO 15189 European Reference Lab (LC-MS/MS)'}
          </span>
          <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', fontWeight: 600 }}>
            ✓ {isEs ? 'Muestra Capilar DBS Indolora (Sin venopunción)' : 'Painless Capillary DBS (No phlebotomy)'}
          </span>
          <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', fontWeight: 600 }}>
            ✓ {isEs ? 'Informe Cuantitativo en 48–72 Horas' : '48–72h Digital Quantitative Report'}
          </span>
        </div>

        {/* Scope Indicator + 2x2 Mobile KPIs (Rule #22) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{
              fontSize: '0.70rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '999px',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
            }}>
              {filteredProducts.length === initialProducts.length
                ? `${isEs ? 'Base completa' : 'Entire Database'} (${initialProducts.length} Kits)`
                : `${isEs ? 'Filtro activo' : 'Matching Active Filters'} (${filteredProducts.length} / ${initialProducts.length} Kits)`}
            </span>
          </div>
          <div className="atlas-kpi-grid-2x2">
          {[
            { icon: Microscope, label: isEs ? 'Paneles Activos' : 'Active Panels', val: `${initialProducts.length} Kits CE-IVDR`, sub: 'NAD+, Testosterone, Cortisol, HbA1c' },
            { icon: Award, label: isEs ? 'Acreditación Lab' : 'Lab Accreditation', val: 'ISO 15189', sub: isEs ? 'Referencia Europea LC-MS/MS' : 'European Reference LC-MS/MS' },
            { icon: Droplets, label: isEs ? 'Tecnología Toma' : 'Sample Method', val: 'Capillary DBS', sub: isEs ? 'Indoloro en yema del dedo' : 'Painless finger-prick kit' },
            { icon: HeartPulse, label: isEs ? 'Plazo Resultados' : 'Turnaround Time', val: '48 – 72 Hours', sub: isEs ? 'Informe cuantitativo digital' : 'Direct quantitative portal report' },
          ].map((kpi, idx) => (
            <div key={idx} style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <kpi.icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>{kpi.label}</div>
                <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{kpi.val}</div>
                <div style={{ fontSize: '0.72rem', color: '#5f6368' }}>{kpi.sub}</div>
              </div>
            </div>
          ))}
          </div>
        </section>

        {/* GlobalSearchBar (Rule #7) */}
        <GlobalSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={isEs ? 'Buscar biomarcador, SKU o test Bloodo™...' : 'Search biomarker, SKU or Bloodo™ test...'}
          resultCount={filteredProducts.length}
          filters={categoryFilters.map((f) => ({
            id: f.id,
            label: f.label,
            active: selectedCategory === f.id,
            onClick: () => setSelectedCategory(f.id),
          }))}
          size="lg"
        />

        {/* DataTable (Rule #3) */}
        <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '10px', overflow: 'hidden' }}>
          {filteredProducts.length === 0 ? (
            <EmptyState
              icon={Activity}
              title={isEs ? 'No se encontraron paneles Bloodo™' : 'No Bloodo™ panels matched'}
              subtitle={isEs ? 'Prueba limpiando los filtros o la búsqueda.' : 'Try clearing your search or category filter.'}
              action={{
                label: isEs ? 'Limpiar filtros' : 'Reset filters',
                onClick: () => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                },
              }}
            />
          ) : (
            <DataTable
              columns={columns}
              data={filteredProducts}
              rowKey={(row) => row.id}
              forceCardsView={viewMode === 'cards'}
              mobileCardComponent={PricingScheduleMobileCard}
              mobileCardProps={{
                isEs,
                getTitle: (r) => (isEs ? (r.nameEs || r.name) : r.name),
                getBrand: (r) => r.category || 'CE-IVDR',
                getSku: (r) => r.sku || r.id,
                getMeta: (r) => `${r.biomarker || ''} · ${r.turnaround || '48–72h'}`,
                getPrice: (r) => formatPrice(r.wholesalePriceEur),
                getSecondaryPrice: (r) => `${isEs ? 'Clínica Ref:' : 'Clinic Ref:'} ${formatPrice(r.clinicPriceEur)}`,
                getQuoteCount: (r) => cartItems?.[r.id] || 0,
                onAddQuote: (r) => {
                  handleQtyChange(r, 1);
                  toast.success(isEs ? `${r.nameEs || r.name} añadido` : `Added ${r.name}`);
                },
              }}
              expandableRender={(row) => (
                <div style={{ padding: '12px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: '1 1 360px', fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                    <strong>{isEs ? 'Descripción clínica:' : 'Clinical overview:'}</strong>{' '}
                    {isEs ? (row.descriptionEs || row.description || row.biomarker) : (row.description || row.biomarker)}
                  </div>
                  <Link
                    href={`/p/${encodeURIComponent(row.slug)}`}
                    className="gcp-btn-secondary"
                    style={{ fontSize: '0.74rem', padding: '5px 10px', textDecoration: 'none' }}
                  >
                    <FileText size={13} />
                    <span>{isEs ? 'Abrir Ficha Clínica' : 'Open Clinical Monograph'}</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              )}
            />
          )}
        </div>
      </main>

      <PublicUnifiedFooter />

      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        contextType="pricing"
        entityName="Bloodo™ Capillary Blood Diagnostics (B2B)"
        lang={lang}
      />

      <DocumentPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        printable={false}
        getPdfBlob={() =>
          buildSchedulePdfBlob({
            title: isEs ? 'ATLAS HEALTH — DIAGNÓSTICO CAPILAR BLOODO™' : 'ATLAS HEALTH — BLOODO™ CAPILLARY DIAGNOSTICS',
            subtitle: `CE-IVDR Dried Blood Spot (DBS) · ISO 15189 LC-MS/MS · ${currency}`,
            metaLine: `Panels: ${filteredProducts.length}  |  Turnaround: 48–72h  |  Currency: ${currency}`,
            documentRef: 'DOC-BLOODO-2026-V1',
            currency,
            tierLabel: 'Public B2B Schedule',
            isGuest: true,
            head: [
              'SKU',
              isEs ? 'Kit Diagnóstico' : 'Diagnostic Kit',
              isEs ? 'Biomarcador' : 'Biomarker',
              `B2B (${currency})`,
              `Clinic Ref (${currency})`,
            ],
            body: filteredProducts.map((r) => [
              r.sku || r.id,
              isEs ? (r.nameEs || r.name) : r.name,
              r.biomarker || 'Capillary DBS',
              formatPrice(r.wholesalePriceEur),
              formatPrice(r.clinicPriceEur),
            ]),
          })
        }
        downloadName={`Bloodo_Diagnostics_Schedule_${currency}.pdf`}
        title={isEs ? 'Bloodo™ Diagnóstico Capilar — Tarifa Oficial PDF' : 'Bloodo™ Capillary Diagnostics — Official PDF'}
        subtitle={`${filteredProducts.length} ${isEs ? 'kits' : 'kits'} · ${currency}`}
      />
    </div>
  );
}
