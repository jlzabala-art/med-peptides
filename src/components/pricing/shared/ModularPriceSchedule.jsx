'use client';

import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Download,
  Eye,
  EyeOff,
  FileText,
  Layers,
  Printer,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useCurrencyConverter } from '@/hooks/pricing/useCurrencyConverter';
import { useBrandPriceSchedule } from '@/hooks/pricing/useBrandPriceSchedule';
import { updateProductSchedulePriceAction } from '@/actions/pricingActions';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PricingTopBar from './PricingTopBar';
import PricingKpiStrip from './PricingKpiStrip';
import PricingDataTable from './PricingDataTable';
import PricingExportModal from './PricingExportModal';

export default function ModularPriceSchedule({
  initialProducts = [],
  initialCategory = 'all',
  config = {},
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
    defaultMarkupPct = 15,
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

  const isAdmin = is('admin');
  const isWholesaler = is('wholesaler') || isAdmin;
  const isClinicOrDoctor =
    is('doctor') ||
    is('clinic') ||
    is('fagron_clinic') ||
    is('medical_director') ||
    isWholesaler;
  const isGuest = !user || effectiveRole === 'guest';
  const canViewLanded = Boolean(isAdmin);

  const [viewMode, setViewMode] = useState('table');
  const [copied, setCopied] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [showLandedCost, setShowLandedCost] = useState(false);

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

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Price Sheet link copied to clipboard');
      setTimeout(() => setCopied(false), 2200);
    }
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

  return (
    <div className="colway-price-root">
      <PricingTopBar
        sectionLabel={sectionLabel}
        currentLabel={navCurrentLabel}
        loginRedirect={loginRedirect}
        currency={currency}
        setCurrency={setCurrency}
        availableCurrencies={availableCurrencies}
        copied={copied}
        onCopyLink={handleCopyLink}
        onWhatsAppShare={handleWhatsAppShare}
        onOpenExport={() => setIsExportModalOpen(true)}
        onPrint={handlePrint}
      />

      <main className="price-sheet-container">
        <header className="document-header">
          <div className="header-meta-row">
            <div className="institutional-identity">
              <div className="brand-pairing">
                <div className="brand-pill-atlas">{brandLeft}</div>
                <span className="partner-cross">×</span>
                <div className="brand-pill-colway">{brandRight}</div>
              </div>
              <h1 className="document-title">{documentTitle}</h1>
              <p className="document-subtitle">{documentSubtitle}</p>
            </div>

            <div className="document-stamp-box">
              <div className="stamp-item">
                <span className="stamp-label">DOCUMENT REF:</span>
                <span className="stamp-value font-mono">{documentRef}</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">CURRENCY:</span>
                <span className="stamp-value font-mono">{currency}</span>
              </div>
            </div>
          </div>
        </header>

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

        {/* Rule #7: GlobalSearchBar always first above data controls */}
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
                  {cat === 'all' ? 'All Formulations' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="controls-right">
            {canViewLanded && (
              <button
                type="button"
                onClick={() => setShowLandedCost((prev) => !prev)}
                className={`action-btn ${showLandedCost ? 'action-active' : 'action-ghost'}`}
                style={{
                  fontSize: '0.74rem',
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px',
                  border: showLandedCost ? '1px solid #0d9488' : '1px solid #e2e8f0',
                  background: showLandedCost ? '#f0fdfa' : '#ffffff',
                  color: showLandedCost ? '#0d9488' : '#64748b',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {showLandedCost ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showLandedCost ? 'Hide Landed CIF' : 'Show Landed CIF'}</span>
              </button>
            )}

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
                <span>Reset Overrides</span>
              </button>
            )}

            <div className="view-switcher">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              >
                <FileText size={14} />
                <span>Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              >
                <Layers size={14} />
                <span>Cards</span>
              </button>
            </div>
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
          canViewLanded={canViewLanded}
          showLandedCost={showLandedCost}
          totals={totals}
          onSaveInlinePrice={handleSaveInlinePrice}
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
        onPrint={handlePrint}
      />

      <div className="mobile-floating-bar no-print">
        <div className="mobile-floating-inner">
          <div className="mobile-currency-pills">
            {availableCurrencies.map((cur) => (
              <button
                key={cur}
                type="button"
                onClick={() => setCurrency(cur)}
                className={`mobile-pill ${currency === cur ? 'active' : ''}`}
              >
                {cur}
              </button>
            ))}
          </div>

          <div className="mobile-action-buttons">
            <button
              type="button"
              onClick={() => setViewMode((prev) => (prev === 'table' ? 'cards' : 'table'))}
              className="mobile-btn mobile-btn-ghost"
            >
              {viewMode === 'table' ? <Layers size={14} /> : <FileText size={14} />}
              <span>{viewMode === 'table' ? 'Cards' : 'Table'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="mobile-btn mobile-btn-accent"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="mobile-btn mobile-btn-primary"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      <PublicUnifiedFooter lang="en" />
    </div>
  );
}
