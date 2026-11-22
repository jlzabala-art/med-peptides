'use client';

import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useCurrencyConverter } from '@/hooks/pricing/useCurrencyConverter';
import { useBrandPriceSchedule } from '@/hooks/pricing/useBrandPriceSchedule';
import { updateProductSchedulePriceAction } from '@/actions/pricingActions';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import PageHeroCard from '@/components/ui/PageHeroCard';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import ClinicalFormatSwitcher from './ClinicalFormatSwitcher';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import PricingKpiStrip from './PricingKpiStrip';
import PricingDataTable from './PricingDataTable';
import PricingExportModal from './PricingExportModal';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal';
import { buildSchedulePdfBlob } from '@/lib/pdf/schedulePdfBuilder';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';

export default function ModularPriceSchedule({
  initialProducts = [],
  initialCategory = 'all',
  config = {},
  topShellSlot = null,
}) {
  const {
    sectionLabel = 'B2B Wholesale',
    navCurrentLabel = 'Colway UAE Price Schedule',
    loginRedirect = '/pricing/colway',
    brandLeft = 'ATLAS HEALTH',
    brandRight = 'COLWAY CLINICAL DERMA',
    documentTitle = 'COLWAY CLINICAL CELLULAR & TRICHOLOGY PORTFOLIO',
    documentSubtitle = 'Official UAE B2B Wholesaler Price Schedule · Biologically Active Collagen & Peptides',
    documentRef = 'DOC-UAE-COL-2026-V1',
    defaultCurrency = 'AED',
    availableCurrencies = ['AED', 'USD', 'EUR'],
    defaultMarkupPct = 32.25,
    skuPrefixPattern = /^SKU-COLWAY-/i,
    searchPlaceholder = 'Search formulations by product name, SKU, or active ingredient...',
    storageNamespace = 'colway_uae_pricing',
    exportBrandTitle = 'Colway UAE',
    exportFilePrefix = 'Colway_UAE_Price_Schedule',
    whatsappHeader = '*COLWAY CLINICAL DERMA — OFFICIAL UAE B2B WHOLESALE SCHEDULE*',
    persistInlineEdits = true,
  } = config;

  const { user } = useAuth();
  const { is, effectiveRole } = useRoleAccess();
  const workspace = usePublicWorkspace?.() || null;
  const t = workspace?.t || ((en) => en);

  const isAdmin = is('admin') || is('medical_director');
  const isDistributor = is('distributor');
  const isWholesaler = is('wholesaler') || is('wholeseller') || isAdmin;
  const isClinicOrDoctor =
    is('doctor') ||
    is('clinic') ||
    is('fagron_clinic') ||
    is('medical_director') ||
    isWholesaler ||
    isDistributor;
  const isGuest = !user || effectiveRole === 'guest';
  const canViewLanded = Boolean(isAdmin);

  const [copied, setCopied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState(config.defaultViewMode || 'table');
  const showLandedCost = true;

  const { currency, setCurrency, fxRate, formatPrice } = useCurrencyConverter({
    defaultCurrency,
    currencies: availableCurrencies,
  });

  const {
    markupPct,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    scopeMode,
    setScopeMode,
    hasActiveFilters,
    hasCustomOverrides,
    processedProducts,
    filteredProducts,
    totals,
    categories,
    handleUpdateProductPrice,
    handleResetOverrides,
  } = useBrandPriceSchedule({
    initialProducts,
    initialCategory,
    defaultMarkupPct,
    fxRate,
  });

  const handleSaveInlinePrice = useCallback(
    async (productId, tier, newValue) => {
      const updatedPatch = handleUpdateProductPrice(productId, tier, newValue);
      if (!updatedPatch || !persistInlineEdits || !isAdmin) return;

      const res = await updateProductSchedulePriceAction({
        productId,
        pricingPatch: updatedPatch,
      });
      if (res?.ok) {
        toast.success('Price updated in Firestore');
      } else {
        toast.error(res?.error || 'Saved locally (Firestore sync failed)');
      }
    },
    [handleUpdateProductPrice, isAdmin, persistInlineEdits]
  );

  useRegisterAtlasContext(
    {
      mode: 'pricing_schedule',
      contextType: 'catalog',
      storageKey: `pricing-${documentRef || loginRedirect}`,
      contextAnchor: {
        sectionTitle: `${brandLeft} — ${brandRight}`,
        code: documentRef,
        currency,
        isGuest,
        selectedCategory,
        keyActives: documentSubtitle,
        mechanisms: isGuest
          ? `Public Wholeseller B2B Price Schedule in ${currency} (${filteredProducts.length} SKUs).`
          : `Authorized Price Schedule in ${currency} (${filteredProducts.length} SKUs).`,
      },
      catalogInventory: filteredProducts.slice(0, 40).map((p) => ({
        sku: p.sku,
        name: p.name,
        category: p.category,
        volume: p.volume,
        wholesellerPrice: formatPrice(p.calculatedWholesale),
        ...(isGuest ? {} : { clinicPrice: formatPrice(p.recommendedClinic), retailMsrp: formatPrice(p.recommendedRetail) }),
      })),
      bottomBar: {
        summaryTitle: `${brandRight} · ${filteredProducts.length} SKUs`,
        summarySubtitle: `${currency} · ${isGuest ? 'Public Wholeseller Schedule' : 'Authorized Partner Schedule'}`,
        atlasAiLabel: 'Ask Atlas AI',
        secondaryAction: {
          label: 'Export CSV',
          onClick: () => setIsExportModalOpen(true),
        },
        primaryAction: {
          label: 'Preview PDF',
          onClick: () => setIsPdfPreviewOpen(true),
        },
      },
    },
    [brandLeft, brandRight, documentRef, loginRedirect, currency, isGuest, selectedCategory, documentSubtitle, filteredProducts, formatPrice]
  );

  const handlePrint = () => {
    setIsPdfPreviewOpen(true);
  };

  const getSchedulePdfBlob = useCallback(() => {
    const showClinic = !isGuest && isClinicOrDoctor;
    const showRetail = !isGuest;

    const head = isAdmin
      ? ['#', 'SKU', 'Product', `Cost (${currency})`, `Wholeseller (${currency})`, `Distributor (${currency})`, `Clinic (${currency})`, `Retail MSRP (${currency})`]
      : isGuest
        ? ['#', 'SKU', 'Product', `Wholeseller (${currency})`]
        : showClinic
          ? ['#', 'SKU', 'Product', `Wholeseller (${currency})`, `Clinic (${currency})`, `Retail MSRP (${currency})`]
          : ['#', 'SKU', 'Product', `Wholeseller (${currency})`, `Retail MSRP (${currency})`];

    const body = filteredProducts.map((p) => {
      const sku = String(p.sku || '').replace(skuPrefixPattern, '');
      const base = [p.itemNumber, sku, p.name];
      if (isAdmin) {
        return [
          ...base,
          formatPrice(p.calculatedLanded),
          formatPrice(p.calculatedWholesale),
          formatPrice(p.calculatedDistributor),
          formatPrice(p.recommendedClinic),
          formatPrice(p.recommendedRetail),
        ];
      }
      if (isGuest) {
        return [...base, formatPrice(p.calculatedWholesale)];
      }
      if (showClinic) {
        return [
          ...base,
          formatPrice(p.calculatedWholesale),
          formatPrice(p.recommendedClinic),
          formatPrice(p.recommendedRetail),
        ];
      }
      return [
        ...base,
        formatPrice(p.calculatedWholesale),
        formatPrice(p.recommendedRetail),
      ];
    });

    const rightAlignCols = [];
    for (let i = 3; i < head.length; i += 1) {
      rightAlignCols.push(i);
    }

    const tierLabel = isAdmin
      ? 'Admin Master Schedule'
      : isGuest
        ? 'Public Wholeseller Schedule'
        : showClinic
          ? 'Authenticated Clinic & Partner Schedule'
          : 'Authenticated Partner Schedule';

    return buildSchedulePdfBlob({
      title: `${brandLeft} — ${brandRight}`,
      subtitle: documentSubtitle,
      metaLine: `Ref: ${documentRef}  |  Currency: ${currency}  |  Items: ${filteredProducts.length}`,
      documentRef,
      currency,
      tierLabel,
      isGuest,
      accountLabel: user?.email || user?.displayName || null,
      rightAlignCols,
      head,
      body,
    });
  }, [isAdmin, isGuest, isClinicOrDoctor, currency, filteredProducts, skuPrefixPattern, formatPrice, brandLeft, brandRight, documentSubtitle, documentRef, user]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(t('Price Sheet link copied to clipboard', 'Enlace copiado al portapapeles'));
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleCopyWhatsappPitch = () => {
    if (typeof window === 'undefined' || !navigator.clipboard) return;
    const sampleItems = filteredProducts.slice(0, 8).map((p) => {
      const name = p.name || p.canonicalName || 'Formulation';
      const strength = p.strength ? ` (${p.strength})` : '';
      return `• ${name}${strength}`;
    });
    const moreCount = Math.max(0, filteredProducts.length - sampleItems.length);
    const pitch = [
      `Hi! Here is an overview of our EU GMP ${exportBrandTitle} clinical schedule:`,
      '',
      ...sampleItems,
      ...(moreCount > 0 ? [`• ...plus ${moreCount} additional standardized preparations`] : []),
      '',
      `Full catalog link (no pricing exposed externally unless logged in):`,
      window.location.href,
      '',
      'Let me know which formulations or strengths you would like to review for your clinic.',
    ].join('\n');
    navigator.clipboard.writeText(pitch);
    toast.success(t('WhatsApp Pitch (no prices) copied!', '¡Pitch de WhatsApp (sin precios) copiado!'));
  };

  const handleWhatsAppShare = () => {
    const shareUrl =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://www.atlashealth-services.com${loginRedirect}`;
    const text = encodeURIComponent(
      `${whatsappHeader}\n\n` +
        processedProducts
          .map(
            (p) =>
              `• ${p.name} (${p.volume || 'Unit'}): ${formatPrice(p.calculatedWholesale)}`
          )
          .join('\n') +
        `\n\nFull verified catalog:\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSyncWorkspaceQuote = useCallback((product, nextQty) => {
    if (!workspace?.syncRfqItem || !product) return;
    const key = `schedule:${storageNamespace}:${product.id || product.sku}`;
    const unitPrice = Number(product.calculatedWholesale || product.recommendedClinic || product.recommendedRetail || 0);
    workspace.syncRfqItem(
      {
        id: key,
        sku: product.sku || product.id,
        name: product.name,
        unitPrice: Number((unitPrice * (fxRate || 1)).toFixed(2)),
        source: storageNamespace,
        href: loginRedirect,
      },
      nextQty
    );
  }, [workspace, storageNamespace, fxRate, loginRedirect]);

  const getWorkspaceQty = useCallback((product) => {
    const key = `schedule:${storageNamespace}:${product?.id || product?.sku}`;
    const found = (workspace?.rfqItems || []).find((x) => (x.id || x.sku) === key);
    return found ? Number(found.qty || 0) : 0;
  }, [workspace?.rfqItems, storageNamespace]);

  return (
    <div className="colway-price-root atlas-page-bg">
      <PublicUnifiedHeader
        brandHref="/pricing"
        loginRedirect={loginRedirect}
        currency={currency}
        onCurrencyChange={(c) => {
          setCurrency(c);
          workspace?.setCurrency?.(c);
        }}
        breadcrumb={[
          { label: sectionLabel || t('B2B Schedules', 'Tarifas B2B'), href: '/pricing' },
          { label: navCurrentLabel },
        ]}
      />

      <ClinicalFormatSwitcher
        activeFormat={config.switcherFormat || loginRedirect.replace('/pricing/', '')}
        currency={currency}
      />

      <main className="atlas-page-shell">
        <PageHeroCard
          brandLeft={brandLeft}
          brandRight={brandRight}
          title={documentTitle}
          subtitle={documentSubtitle}
          metaItems={[
            { label: t('DOCUMENT REF:', 'REF. DOCUMENTO:'), value: documentRef, mono: true },
            { label: t('CURRENCY:', 'MONEDA:'), value: currency, mono: true },
          ]}
          actions={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="gcp-btn-secondary" onClick={() => setIsPdfPreviewOpen(true)} style={{ height: '36px', padding: '0 12px', fontSize: '0.76rem', fontWeight: 650 }}>
                {t('Preview PDF', 'Vista Previa PDF')}
              </button>
              <button type="button" className="gcp-btn-secondary" onClick={handleCopyLink} style={{ height: '36px', padding: '0 12px', fontSize: '0.76rem', fontWeight: 650 }}>
                {copied ? t('Copied', 'Copiado') : t('Share', 'Compartir')}
              </button>
              <button type="button" className="gcp-btn-secondary" onClick={handleCopyWhatsappPitch} style={{ height: '36px', padding: '0 12px', fontSize: '0.76rem', fontWeight: 650 }} title={t('Copy clinical WhatsApp pitch without prices', 'Copiar resumen clínico para WhatsApp sin precios')}>
                📋 {t('WhatsApp Pitch', 'Pitch WhatsApp')}
              </button>
              <button type="button" className="gcp-btn-primary" onClick={() => setIsExportModalOpen(true)} style={{ height: '36px', padding: '0 13px', fontSize: '0.76rem', fontWeight: 750 }}>
                {t('Export / Print', 'Exportar / Imprimir')}
              </button>
            </div>
          }
        />

        {topShellSlot}

        {/* Rule #7: GlobalSearchBar always first above KPIs and data controls */}
        <div className="no-print" style={{ marginBottom: '1rem' }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={searchPlaceholder}
            resultCount={filteredProducts.length}
            totalCount={processedProducts.length}
            size="lg"
            storageNamespace={storageNamespace}
            filters={
              selectedCategory !== 'all'
                ? [
                    {
                      key: 'category',
                      label: 'Category',
                      value: selectedCategory,
                      onRemove: () => setSelectedCategory('all'),
                    },
                  ]
                : []
            }
          />
        </div>

        <PricingKpiStrip
          isGuest={isGuest}
          isClinicOrDoctor={isClinicOrDoctor}
          isWholesaler={isWholesaler}
          isAdmin={isAdmin}
          totals={totals}
          totalCount={processedProducts.length}
          filteredCount={filteredProducts.length}
          hasActiveFilters={hasActiveFilters}
          scopeMode={scopeMode}
          setScopeMode={setScopeMode}
          markupPct={markupPct}
          hasCustomOverrides={hasCustomOverrides}
          formatPrice={formatPrice}
        />

        <div className="controls-strip no-print">
          <div className="controls-left">
            <div className="category-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'all' ? t('All Formulations', 'Todas las Formulaciones') : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="controls-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '2px', borderRadius: '7px', border: '1px solid #cbd5e1' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#003666' : '#64748b',
                  fontSize: '0.73rem',
                  fontWeight: viewMode === 'table' ? 750 : 600,
                  cursor: 'pointer',
                  boxShadow: viewMode === 'table' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                }}
              >
                {t('Table', 'Tabla')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                  color: viewMode === 'cards' ? '#003666' : '#64748b',
                  fontSize: '0.73rem',
                  fontWeight: viewMode === 'cards' ? 750 : 600,
                  cursor: 'pointer',
                  boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(15,23,42,0.08)' : 'none',
                }}
              >
                {t('Cards', 'Tarjetas')}
              </button>
            </div>

            {hasCustomOverrides && (
              <button
                type="button"
                onClick={() => {
                  handleResetOverrides();
                  toast.success('Price overrides reset');
                }}
                style={{
                  fontSize: '0.74rem',
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px',
                  border: '1px solid #fde68a',
                  background: '#fffbeb',
                  color: '#b45309',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <RotateCcw size={14} />
                <span>{t('Reset Overrides', 'Restablecer Precios')}</span>
              </button>
            )}

          </div>
        </div>

        <PricingDataTable
          products={filteredProducts}
          viewMode={viewMode}
          skuPrefixPattern={skuPrefixPattern}
          loginRedirect={loginRedirect}
          currency={currency}
          fxRate={fxRate}
          formatPrice={formatPrice}
          isAdmin={isAdmin}
          isWholesaler={isWholesaler}
          isClinicOrDoctor={isClinicOrDoctor}
          isGuest={isGuest}
          canViewLanded={canViewLanded}
          showLandedCost={showLandedCost}
          totals={totals}
          onSaveInlinePrice={handleSaveInlinePrice}
          getWorkspaceQty={getWorkspaceQty}
          onSyncWorkspaceQuote={handleSyncWorkspaceQuote}
          onResetFilters={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
        />
      </main>

      <PricingExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        brandTitle={exportBrandTitle}
        filePrefix={exportFilePrefix}
        products={filteredProducts}
        currency={currency}
        fxRate={fxRate}
        markupPct={markupPct}
        canViewMaster={isWholesaler}
        isGuest={isGuest}
        onPrint={handlePrint}
      />

      <DocumentPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        getPdfBlob={getSchedulePdfBlob}
        downloadName={`${exportFilePrefix}_${currency}.pdf`}
        title={documentTitle}
        subtitle={`${filteredProducts.length} SKUs · ${currency}`}
      />

      <PublicUnifiedFooter lang="en" />
    </div>
  );
}
