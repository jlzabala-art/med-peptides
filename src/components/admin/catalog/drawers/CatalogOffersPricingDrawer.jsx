"use client";

import React, { useMemo } from 'react';
import StandardDrawer from '../../../ui/StandardDrawer';
import VariantAccordion from '../VariantAccordion';
import VariantCompetitorComparisonTable from '../VariantCompetitorComparisonTable';
import { 
  buildSharedCols, 
  buildPeptideColumns, 
  buildGeneticTestColumns,
  buildGenomicsColumns,
  buildServiceColumns,
  buildApiColumns 
} from '../columns/catalogColumns';
import { UploadCloud, FileText, Share2, Layers, TrendingUp, Copy, Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Maximize2, Minimize2 } from '@/lib/icons';
import InlineEditableCell from '../../../ui/InlineEditableCell';
import notifier from '../../../../services/NotificationService';
import { useAppSettings } from '../../../../hooks/useAppSettings';
import { updateProduct, createVariant, updateVariant, getVariants } from '../../../../repositories/productRepository';
import { resolveChannelPrice, calculateMarginMetrics } from '../../../../utils/commercialPricingHelper';
import { calculateTotalMg } from '../../../../utils/calculateTotalMg';
import { PRESENTATION_LABELS } from '../../../../constants/presentationTypes';
import { useWorkspaceStore } from '../../../../stores/useWorkspaceStore';

/**
 * CatalogOffersPricingDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * Modular slide-over drawer for inspecting and editing:
 *  - Supplier variant agreements & pricing matrix (offers)
 *  - Pricing visibility rules (pricing)
 *  - Market benchmark & competitor intelligence (competitors)
 */
export default function CatalogOffersPricingDrawer({
  isOpen,
  activeDrawer,
  onClose,
  selectedProduct,
  setSelectedProduct,
  products = [],
  displayCurrency = 'USD',
  setDisplayCurrency,
  priceView = 'single',
  setPriceView,
  commercialChannel = 'cost',
  setCommercialChannel,
  filterSupplier = [],
  resolveSupplierName,
  handleExportProductPdf,
  onOpenImportPriceList,
  refresh
}) {
  const { settings } = useAppSettings();
  const addItem = useWorkspaceStore((s) => s.addItem);
  const setDrawerOpen = useWorkspaceStore((s) => s.setDrawerOpen);
  const [drawerTab, setDrawerTab] = React.useState('offers'); // 'offers' | 'competitors'
  const [loadingVariants, setLoadingVariants] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Next / Previous product index resolution
  const currentIndex = useMemo(() => {
    if (!products || products.length === 0 || !selectedProduct) return -1;
    return products.findIndex(p => 
      (p.id && selectedProduct.id && String(p.id).toLowerCase() === String(selectedProduct.id).toLowerCase()) ||
      (p.slug && selectedProduct.slug && String(p.slug).toLowerCase() === String(selectedProduct.slug).toLowerCase()) ||
      (p.canonicalName && selectedProduct.canonicalName && String(p.canonicalName).toLowerCase() === String(selectedProduct.canonicalName).toLowerCase())
    );
  }, [products, selectedProduct]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < products.length - 1;

  const handlePrevProduct = React.useCallback(() => {
    if (hasPrev) {
      setSelectedProduct(products[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, products, setSelectedProduct]);

  const handleNextProduct = React.useCallback(() => {
    if (hasNext) {
      setSelectedProduct(products[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, products, setSelectedProduct]);

  // Keyboard navigation: [ or ArrowLeft -> Prev, ] or ArrowRight -> Next
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      if (e.key === 'ArrowLeft' || e.key === '[') {
        e.preventDefault();
        handlePrevProduct();
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        e.preventDefault();
        handleNextProduct();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevProduct, handleNextProduct]);

  React.useEffect(() => {
    if (activeDrawer === 'competitors') {
      setDrawerTab('competitors');
    } else {
      setDrawerTab('offers');
    }
  }, [activeDrawer]);

  // Load subcollection variants on demand if not already present
  React.useEffect(() => {
    let isCancelled = false;
    if (!isOpen || !selectedProduct?.id) return;

    if (!selectedProduct.variants || selectedProduct.variants.length === 0) {
      setLoadingVariants(true);
      getVariants(selectedProduct.id).then(vars => {
        if (!isCancelled && vars && vars.length > 0) {
          const supps = Array.from(new Set(vars.map(v => v.supplierId || v.supplier).filter(Boolean)));
          setSelectedProduct(prev => ({
            ...prev,
            variants: vars,
            variantsCount: vars.length,
            suppliers: supps
          }));
        }
      }).catch(err => {
        console.error("Failed to load subcollection variants:", err);
      }).finally(() => {
        if (!isCancelled) setLoadingVariants(false);
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, selectedProduct?.id]);

  const isGenomics = selectedProduct?.category?.toLowerCase().includes('genom') || 
                     selectedProduct?.category?.toLowerCase().includes('biomarker') || 
                     selectedProduct?.category === 'genomics_biomarkers' ||
                     selectedProduct?.product_type === 'genomics_biomarkers' ||
                     selectedProduct?.product_type === 'dna_testing_kit' || 
                     selectedProduct?.product_type === 'biomarker_testing_kit' ||
                     selectedProduct?.primaryType === 'genomics_biomarkers' ||
                     selectedProduct?.availableTypes?.includes('genomics_biomarkers');

  const isService = selectedProduct?.category?.toLowerCase().includes('service') || 
                    selectedProduct?.category?.toLowerCase().includes('subscription') || 
                    selectedProduct?.productType === 'service' || 
                    selectedProduct?.primaryType === 'service' ||
                    selectedProduct?.product_type === 'service';

  const isTest = isGenomics ||
                 selectedProduct?.category?.toLowerCase().includes('test') || 
                 selectedProduct?.product_type?.toLowerCase().includes('test') || 
                 selectedProduct?.availableTypes?.includes('diagnostic') ||
                 selectedProduct?.primaryType === 'diagnostic';

  const isApi = selectedProduct?.category?.toLowerCase().includes('api') || 
                selectedProduct?.product_type?.toLowerCase().includes('api') ||
                selectedProduct?.productType === 'raw_material' ||
                selectedProduct?.type === 'raw_material' ||
                selectedProduct?.availableTypes?.includes('raw_material') ||
                selectedProduct?.primaryType === 'raw_material';

  // 1. Sort and resolve variants strictly filtered by selected suppliers if active
  const hasExplicitPreferred = (selectedProduct?.variants || []).some(vx => vx.isDefault === true || vx.isPreferred === true);
  const sortedVariants = useMemo(() => {
    if (!selectedProduct?.variants) return [];
    const allVars = selectedProduct.variants || [];
    return allVars
      .filter(v => {
        // Exclude empty stubs if a canonical variant with same supplier and dosage already has pricing
        const isStub = v.id && v.id.startsWith('var_') && !v.unit_price && !v.cost && !v.price && !v.cost_tiers && !v.pricing?.acquisition?.tiers?.length;
        if (isStub) {
          const normDose = String(v.dosage || v.dose || '').toLowerCase().replace(/\s+/g, '').replace(/\/vial/g, '');
          const hasRealVariant = allVars.some(other => 
            other.id !== v.id &&
            (other.supplierId === v.supplierId || other.supplier === v.supplier) &&
            String(other.dosage || other.dose || '').toLowerCase().replace(/\s+/g, '').replace(/\/vial/g, '') === normDose &&
            (other.unit_price || other.cost || other.price || other.cost_tiers || other.pricing?.acquisition?.tiers?.length)
          );
          if (hasRealVariant) return false;
        }

        if (!filterSupplier || filterSupplier.length === 0) return true;
        const vSup = String(v.supplierId || v.supplier || '').toLowerCase().trim();
        const vSupName = String(v.supplierName || '').toLowerCase().trim();
        return filterSupplier.some(f => {
          const fl = String(f).toLowerCase().trim();
          return vSup === fl || vSup.includes(fl) || fl.includes(vSup) || (vSupName && vSupName.includes(fl));
        });
      })
      .map((v, idx) => {
        const hasCOA = !!v.hasCOA;
        const isPreferred = v.isDefault === true || v.isPreferred === true || (!hasExplicitPreferred && idx === 0);
        return { ...v, hasCOA, isPreferred };
      })
      .sort((a, b) => (a.pricePerMg ?? Infinity) - (b.pricePerMg ?? Infinity));
  }, [selectedProduct?.variants, filterSupplier, hasExplicitPreferred]);

  const activeSuppliersCount = useMemo(() => {
    const set = new Set(sortedVariants.map(v => v.supplierId || v.supplier || v.supplierName).filter(Boolean));
    return set.size;
  }, [sortedVariants]);

  // 2. Set preferred variant
  const handleSetPreferredVariant = async (variantId) => {
    if (!selectedProduct) return;
    try {
      const updatedVariants = (selectedProduct.variants || []).map(vx => ({
        ...vx,
        isDefault: vx.id === variantId,
        isPreferred: vx.id === variantId
      }));

      setSelectedProduct(prev => ({
        ...prev,
        variants: updatedVariants,
        defaultVariantId: variantId,
        preferredVariantId: variantId
      }));

      await updateProduct(selectedProduct.id, {
        defaultVariantId: variantId,
        preferredVariantId: variantId
      }, { strict: false });

      const targetVar = selectedProduct.variants?.find(vx => vx.id === variantId);
      const suppLabel = targetVar ? (targetVar.supplierName || resolveSupplierName(targetVar) || 'Variant') : 'Variant';
      notifier.success(`Variant from "${suppLabel}" set as default/preferred`);
      if (refresh) refresh();
    } catch (error) {
      console.error("Failed to set preferred variant:", error);
      notifier.error("Failed to set preferred variant: " + error.message);
    }
  };

  // 3. Clone variant
  const handleCloneVariant = async (sourceVariant) => {
    if (!selectedProduct) return;
    try {
      const newVariantId = `var-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newVariant = {
        ...sourceVariant,
        id: newVariantId,
        productId: selectedProduct.id,
        sku: sourceVariant.sku ? `${sourceVariant.sku}-COPY` : '',
        isDefault: false,
        isPreferred: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createVariant(selectedProduct.id, newVariant, { id: newVariantId, strict: false });
      const updatedVariants = [...(selectedProduct.variants || []), newVariant];

      setSelectedProduct(prev => ({
        ...prev,
        variants: updatedVariants
      }));

      // Parent variants array is no longer persisted

      const suppLabel = sourceVariant.supplierName || resolveSupplierName(sourceVariant) || 'Variant';
      notifier.success(`Cloned variant from ${suppLabel}. You can now edit supplier, dosage, or pricing inline.`);
      if (refresh) refresh();
    } catch (error) {
      console.error("Failed to clone variant:", error);
      notifier.error("Failed to clone variant: " + error.message);
    }
  };

  // 5. Add variant to Workspace
  const handleAddToWorkspace = React.useCallback((variant) => {
    if (!selectedProduct) return;
    const resolvedPrice = resolveChannelPrice(variant, 'clinic', 'unit').price || 0;
    addItem({
      id: variant.id,
      productId: selectedProduct.id,
      variantId: variant.id,
      canonicalName: selectedProduct.name || selectedProduct.displayName || 'Unknown Product',
      sku: variant.sku || '',
      dosage: variant.dosage || variant.dose || '',
      format: variant.format || variant.dosage_form || 'Vial',
      quantity: 1,
      unitPrice: resolvedPrice,
      price: resolvedPrice,
      supplierCost: variant.unit_price || variant.cost_tiers?.cost_1 || 0,
      supplierId: variant.supplierId || variant.supplier || '',
      supplierName: variant.supplierName || '',
      category: selectedProduct.category || '',
      presentation: variant.presentation || '',
      pricing: variant.pricing,
    }, null, { openDrawer: true });
    const variantLabel = variant.dosage || variant.dose || variant.sku || 'variant';
    notifier.success(`✓ ${selectedProduct.name || 'Product'} (${variantLabel}) added to Workspace`);
  }, [selectedProduct, addItem]);

  // 6. Update variant fields inline
  const updateVariantField = async (variantId, field, value) => {
    if (!selectedProduct) return;
    let dbPayload = {};
    const euroRate = Number(settings?.exchangeRates?.euro || 0.92);
    const aedRate = Number(settings?.exchangeRates?.uae || 3.67);

    if (field === 'unit_price' || field === 'cost_10' || field === 'cost_50' || field === 'cost_100') {
      const inputVal = Number(value);
      let baseUSD = inputVal;
      if (displayCurrency === 'EUR') {
        baseUSD = Number((inputVal / euroRate).toFixed(2));
      } else if (displayCurrency === 'AED') {
        baseUSD = Number((inputVal / aedRate).toFixed(2));
      }

      if (field === 'unit_price') {
        const unitUSD = baseUSD;
        const unitEUR = Number((unitUSD * euroRate).toFixed(2));
        const unitAED = Number((unitUSD * aedRate).toFixed(2));

        dbPayload = {
          unit_price: unitUSD,
          price: unitUSD,
          price_eur: unitEUR,
          price_aed: unitAED,
          'cost_tiers.cost_1': unitUSD,
          'cost_tiers.cost_10': Number((unitUSD * 10).toFixed(2)),
          'cost_tiers.cost_50': Number((unitUSD * 50).toFixed(2)),
          'cost_tiers.cost_100': Number((unitUSD * 100).toFixed(2)),
          kit_price_eur: Number((unitEUR * 10).toFixed(2)),
          kit_price_aed: Number((unitAED * 10).toFixed(2)),
        };
      } else if (field === 'cost_10') {
        const kitUSD = baseUSD;
        const kitEUR = Number((kitUSD * euroRate).toFixed(2));
        const kitAED = Number((kitUSD * aedRate).toFixed(2));
        const unitUSD = Number((kitUSD / 10).toFixed(2));
        const unitEUR = Number((kitEUR / 10).toFixed(2));
        const unitAED = Number((kitAED / 10).toFixed(2));

        dbPayload = {
          cost_10: kitUSD,
          kit_price_eur: kitEUR,
          kit_price_aed: kitAED,
          unit_price: unitUSD,
          price: unitUSD,
          price_eur: unitEUR,
          price_aed: unitAED,
          'cost_tiers.cost_1': unitUSD,
          'cost_tiers.cost_10': kitUSD,
          'cost_tiers.cost_50': Number((kitUSD * 5).toFixed(2)),
          'cost_tiers.cost_100': Number((kitUSD * 10).toFixed(2)),
        };
      } else if (field === 'cost_50') {
        dbPayload = {
          cost_50: baseUSD,
          'cost_tiers.cost_50': baseUSD,
        };
      } else if (field === 'cost_100') {
        dbPayload = {
          cost_100: baseUSD,
          'cost_tiers.cost_100': baseUSD,
        };
      }
    } else {
      dbPayload = { [field]: value };
    }

    try {
      const updatedVariants = (selectedProduct.variants || []).map(v => {
        if (v.id === variantId) {
          return { ...v, ...dbPayload };
        }
        return v;
      });

      setSelectedProduct(prev => ({
        ...prev,
        variants: updatedVariants
      }));

      // We don't save the variants array back to the parent product anymore

      notifier.success("Variant updated successfully");
      if (refresh) refresh();
    } catch (error) {
      console.error("Failed to update variant:", error);
      notifier.error("Failed to update variant: " + error.message);
    }
  };

  // 5. Build dynamic columns based on channel, currency, volume tier, and settings
  const currencySymbol = displayCurrency === 'EUR' ? '€' : displayCurrency === 'AED' ? 'AED ' : '$';
  const priceField = priceView === 'kit' || priceView === 'tier_10' ? 'cost_10' : priceView === 'tier_50' ? 'cost_50' : priceView === 'tier_100' ? 'cost_100' : 'unit_price';

  const priceHeader = useMemo(() => {
    const tierLabel = (priceView === 'kit' || priceView === 'tier_10') ? 'Kit (x10)' : priceView === 'tier_50' ? 'Tier (x50)' : priceView === 'tier_100' ? 'Tier (x100)' : 'Unit (x1)';
    const channelLabel = commercialChannel === 'cost' ? 'Cost' : commercialChannel === 'wholesale' ? 'Wholesale' : commercialChannel === 'clinic' ? 'Clinic' : 'Retail';
    return `${channelLabel} ${tierLabel}`;
  }, [priceView, commercialChannel]);

  // Group pricing benchmarks: separate Finished vs Bulk API, find best price in each group and calculate diff
  const variantBenchmarks = useMemo(() => {
    const variants = selectedProduct?.variants || [];
    const euroRate = Number(settings?.exchangeRates?.euro || 0.92);
    const aedRate = Number(settings?.exchangeRates?.uae || 3.67);

    // 1. Analyze each variant
    const analyzed = variants.map(v => {
      const pStr = (v.formatLabel || v.format || v.presentation || v.presentationName || v.productType || v.type || '').toLowerCase();
      const isApi = v.type === 'raw_material' || 
                    v.productType === 'raw_material' || 
                    v.format === 'bulk_api' || 
                    pStr.includes('bulk') || 
                    pStr.includes('api') || 
                    pStr.includes('powder') || 
                    v.unit === 'g' || 
                    v.unitOfMeasure === 'g';

      const res = resolveChannelPrice(v, commercialChannel, priceView);
      const rawUsd = Number(res.price) || 0;
      let converted = rawUsd;
      if (displayCurrency === 'EUR') converted = rawUsd * euroRate;
      if (displayCurrency === 'AED') converted = rawUsd * aedRate;

      const totalMg = calculateTotalMg(v) || calculateTotalMg(selectedProduct);
      let rateDisplay = null;
      let normRate = null;

      if (converted > 0) {
        if (isApi) {
          // Bulk API: the supplier price is ALREADY per gram ($/g).
          // One thing is the MOQ (minimum order quantity), and another is the price per gram.
          // Do NOT divide by MOQ grams!
          const pricePerGram = converted;
          normRate = pricePerGram;
          rateDisplay = `${currencySymbol}${pricePerGram.toFixed(2)}/g`;
        } else if (totalMg && totalMg > 0) {
          // Finished: normalize per mg
          const pricePerMg = converted / totalMg;
          normRate = pricePerMg;
          if (pricePerMg < 0.01) {
            rateDisplay = `${currencySymbol}${pricePerMg.toFixed(4)}/mg`;
          } else {
            rateDisplay = `${currencySymbol}${pricePerMg.toFixed(2)}/mg`;
          }
        }
      }

      return {
        id: v.id,
        isApi,
        converted,
        totalMg,
        normRate,
        rateDisplay
      };
    });

    // 2. Find min normRate in finished pool and in bulk API pool
    const finishedPool = analyzed.filter(a => !a.isApi && a.normRate && a.normRate > 0);
    const apiPool = analyzed.filter(a => a.isApi && a.normRate && a.normRate > 0);

    const minFinished = finishedPool.length > 0 ? Math.min(...finishedPool.map(a => a.normRate)) : null;
    const minApi = apiPool.length > 0 ? Math.min(...apiPool.map(a => a.normRate)) : null;

    // 3. Map benchmarks by variant id
    const benchmarkMap = new Map();
    analyzed.forEach(a => {
      if (!a.normRate) {
        benchmarkMap.set(a.id, { rateDisplay: a.rateDisplay, isBest: false, diffPct: null, isApi: a.isApi });
        return;
      }
      const baseline = a.isApi ? minApi : minFinished;
      const isBest = baseline && Math.abs(a.normRate - baseline) < 0.0001;
      let diffPct = null;
      if (!isBest && baseline && baseline > 0) {
        diffPct = Math.round(((a.normRate - baseline) / baseline) * 100);
      }
      benchmarkMap.set(a.id, {
        rateDisplay: a.rateDisplay,
        isBest,
        diffPct,
        isApi: a.isApi
      });
    });

    return benchmarkMap;
  }, [selectedProduct?.variants, commercialChannel, priceView, displayCurrency, settings, currencySymbol, selectedProduct]);

  const activePriceCol = useMemo(() => ({
    key: 'active_price',
    header: priceHeader,
    width: '130px',
    nowrap: true,
    sortValue: (v) => {
      const res = resolveChannelPrice(v, commercialChannel, priceView);
      return res.price || 0;
    },
    render: (v) => {
      const res = resolveChannelPrice(v, commercialChannel, priceView);
      const rawUsd = res.price;
      let converted = rawUsd;
      if (converted != null && !isNaN(converted)) {
        if (displayCurrency === 'EUR') converted = rawUsd * (settings?.exchangeRates?.euro || 0.92);
        if (displayCurrency === 'AED') converted = rawUsd * (settings?.exchangeRates?.uae || 3.67);
      }

      const bm = variantBenchmarks.get(v.id);

      const renderRateBadge = () => {
        if (!bm) return null;

        // For Bulk API: show MOQ batch total (if MOQ > 1) and Best / +X% diff badge
        if (bm.isApi) {
          const rawMoq = v.moq || v.minimum_order_quantity_g || v.weightGrams;
          const moqVal = Number(rawMoq) || parseFloat(String(v.weight || v.size || '').replace(/[^0-9.]/g, '')) || 0;
          const batchTotal = (moqVal > 1 && converted > 0) ? (converted * moqVal) : null;

          return (
            <span style={{ fontSize: '0.67rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '1px', lineHeight: 1 }}>
              {batchTotal != null && (
                <span style={{ color: '#64748b', fontSize: '0.65rem' }}>
                  • Batch ({moqVal}g): {currencySymbol}{batchTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
              {bm.isBest && (
                <span style={{ color: '#15803d', background: '#dcfce7', padding: '0 4px', borderRadius: '3px', fontWeight: 700, fontSize: '0.60rem' }}>
                  Best
                </span>
              )}
              {!bm.isBest && bm.diffPct != null && bm.diffPct > 0 && (
                <span style={{ color: '#b45309', background: '#fef3c7', padding: '0 4px', borderRadius: '3px', fontWeight: 600, fontSize: '0.60rem' }}>
                  +{bm.diffPct}%
                </span>
              )}
            </span>
          );
        }

        // For Finished products: show • $X.XX/mg and Best / +X% badge
        if (!bm.rateDisplay) return null;
        return (
          <span style={{ fontSize: '0.67rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '1px', lineHeight: 1 }}>
            <span style={{ color: '#0284c7' }}>• {bm.rateDisplay}</span>
            {bm.isBest && (
              <span style={{ color: '#15803d', background: '#dcfce7', padding: '0 4px', borderRadius: '3px', fontWeight: 700, fontSize: '0.60rem' }}>
                Best
              </span>
            )}
            {!bm.isBest && bm.diffPct != null && bm.diffPct > 0 && (
              <span style={{ color: '#b45309', background: '#fef3c7', padding: '0 4px', borderRadius: '3px', fontWeight: 600, fontSize: '0.60rem' }}>
                +{bm.diffPct}%
              </span>
            )}
          </span>
        );
      };

      const formatPrice = (val) => {
        if (val == null || isNaN(val)) return '—';
        return `${currencySymbol}${Number(val).toFixed(2)}${bm?.isApi ? '/g' : ''}`;
      };

      if (commercialChannel === 'cost') {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
            <InlineEditableCell
              value={converted}
              type="number"
              format={formatPrice}
              onSave={(newVal) => updateVariantField(v.id, priceField, Number(newVal))}
            />
            {renderRateBadge()}
          </div>
        );
      }

      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#003666' }}>
              {formatPrice(converted)}
            </span>
            {res.isAuto && (
              <span style={{ fontSize: '0.65rem', color: '#64748b', background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px' }}>
                auto
              </span>
            )}
          </div>
          {renderRateBadge()}
        </div>
      );
    }
  }), [priceHeader, priceField, commercialChannel, priceView, displayCurrency, settings, currencySymbol, variantBenchmarks]);

  const activeMgCol = useMemo(() => ({
    key: 'price_per_mg',
    header: commercialChannel === 'cost' ? 'Cost / mg' : 'Price / mg',
    width: '105px',
    nowrap: true,
    render: (v) => {
      const bm = variantBenchmarks.get(v.id);
      if (!bm?.rateDisplay) return <span style={{ color: '#94a3b8' }}>—</span>;
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#003666' }}>
            {bm.rateDisplay}
          </span>
          {bm.isBest && (
            <span style={{ color: '#15803d', background: '#dcfce7', padding: '0 4px', borderRadius: '3px', fontWeight: 700, fontSize: '0.60rem' }}>
              Best
            </span>
          )}
          {!bm.isBest && bm.diffPct != null && bm.diffPct > 0 && (
            <span style={{ color: '#b45309', background: '#fef3c7', padding: '0 4px', borderRadius: '3px', fontWeight: 600, fontSize: '0.60rem' }}>
              +{bm.diffPct}%
            </span>
          )}
        </div>
      );
    }
  }), [commercialChannel, variantBenchmarks]);

  const activeMonthlyCol = useMemo(() => ({
    key: 'price_per_month',
    header: commercialChannel === 'cost' ? 'Cost / mo' : 'Price / mo',
    width: '110px',
    nowrap: true,
    render: (v) => {
      const res = resolveChannelPrice(v, commercialChannel, priceView);
      const rawUsd = res.price;
      if (!rawUsd || rawUsd <= 0) return <span style={{ color: '#94a3b8' }}>—</span>;

      const interval = (v.billingInterval || v.cadence || v.billingCycle || '').toLowerCase();
      const months = v.periodMonths || (interval.includes('annual') || interval.includes('year') ? 12 : 1);

      let convertedPerMonth = rawUsd / months;
      if (displayCurrency === 'EUR') {
        convertedPerMonth *= (settings?.exchangeRates?.euro || 0.92);
      }
      if (displayCurrency === 'AED') {
        convertedPerMonth *= (settings?.exchangeRates?.uae || 3.67);
      }

      const isAnnual = months === 12;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#003666' }}>
            {currencySymbol}{convertedPerMonth.toFixed(2)}/mo
          </span>
          {isAnnual && (
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#059669' }}>
              Billed annually
            </span>
          )}
        </div>
      );
    }
  }), [commercialChannel, priceView, displayCurrency, settings, currencySymbol]);

  const marginCol = useMemo(() => {
    if (commercialChannel === 'cost' || commercialChannel === 'all') return null;
    return {
      key: 'margin_metrics',
      header: 'Gross Margin',
      width: '115px',
      nowrap: true,
      render: (v) => {
        const costRes = resolveChannelPrice(v, 'cost', priceView);
        const sellRes = resolveChannelPrice(v, commercialChannel, priceView);
        const metrics = calculateMarginMetrics(costRes.price, sellRes.price);
        if (metrics.marginPct == null) return <span style={{ color: '#94a3b8' }}>—</span>;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: metrics.isPositive ? '#059669' : '#dc2626',
            }}>
              {metrics.marginPct}%
            </span>
            <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
              +{currencySymbol}{metrics.profitDelta} profit
            </span>
          </div>
        );
      }
    };
  }, [commercialChannel, priceView, currencySymbol]);

  const waterfallCols = useMemo(() => {
    if (commercialChannel !== 'all') return [];
    const convert = (price) => {
      if (price == null || isNaN(price)) return null;
      if (displayCurrency === 'EUR') return price * (settings?.exchangeRates?.euro || 0.92);
      if (displayCurrency === 'AED') return price * (settings?.exchangeRates?.uae || 3.67);
      return price;
    };
    return [
      {
        key: 'cost_master',
        header: 'Cost (Master)',
        width: '100px',
        render: (v) => {
          const res = resolveChannelPrice(v, 'cost', priceView);
          const p = convert(res.price);
          return <span style={{ fontWeight: 700, color: '#475569' }}>{p != null ? `${currencySymbol}${p.toFixed(2)}` : '—'}</span>;
        }
      },
      {
        key: 'wholesale_b2b',
        header: 'Wholesale',
        width: '110px',
        render: (v) => {
          const res = resolveChannelPrice(v, 'wholesale', priceView);
          const p = convert(res.price);
          return <span style={{ fontWeight: 700, color: '#2563eb' }}>{p != null ? `${currencySymbol}${p.toFixed(2)}` : '—'}</span>;
        }
      },
      {
        key: 'clinic_doc',
        header: 'Clinic',
        width: '100px',
        render: (v) => {
          const res = resolveChannelPrice(v, 'clinic', priceView);
          const p = convert(res.price);
          return <span style={{ fontWeight: 700, color: '#059669' }}>{p != null ? `${currencySymbol}${p.toFixed(2)}` : '—'}</span>;
        }
      },
      {
        key: 'retail_public',
        header: 'Retail',
        width: '100px',
        render: (v) => {
          const res = resolveChannelPrice(v, 'retail', priceView);
          const p = convert(res.price);
          return <span style={{ fontWeight: 700, color: '#7c3aed' }}>{p != null ? `${currencySymbol}${p.toFixed(2)}` : '—'}</span>;
        }
      }
    ];
  }, [commercialChannel, priceView, currencySymbol, displayCurrency, settings]);

  const actionCol = useMemo(() => ({
    key: 'actions',
    header: 'Actions',
    width: '120px',
    align: 'right',
    nowrap: true,
    render: (v) => {
      const isPref = v.isPreferred || v.isDefault;
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
          {/* Add to Workspace */}
          <button
            type="button"
            title="Add to Workspace / Quotation"
            aria-label="Add to Workspace"
            onClick={(e) => { e.stopPropagation(); handleAddToWorkspace(v); }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px',
              background: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px',
              cursor: 'pointer', color: '#15803d',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)', transition: 'all 0.15s ease',
              flexShrink: 0
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#bbf7d0'; e.currentTarget.style.borderColor = '#4ade80'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#dcfce7'; e.currentTarget.style.borderColor = '#86efac'; }}
          >
            <ShoppingCart size={13} />
          </button>
          {/* Clone */}
          <button
            type="button"
            title="Clone variant"
            aria-label="Clone variant"
            onClick={(e) => { e.stopPropagation(); handleCloneVariant(v); }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', background: '#f8fafc',
              border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)', transition: 'all 0.15s ease', flexShrink: 0
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          >
            <Copy size={13} style={{ color: '#0284c7' }} />
          </button>
          {/* Set preferred */}
          <button
            type="button"
            title={isPref ? 'Default variant (Active)' : 'Set as default variant'}
            aria-label={isPref ? 'Default variant (Active)' : 'Set as default variant'}
            onClick={(e) => { e.stopPropagation(); handleSetPreferredVariant(v.id); }}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px',
              background: isPref ? '#fef3c7' : '#ffffff',
              border: isPref ? '1px solid #fde68a' : '1px solid #e2e8f0',
              borderRadius: '6px', cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)', transition: 'all 0.15s ease', flexShrink: 0
            }}
            onMouseOver={(e) => { if (!isPref) { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; } }}
            onMouseOut={(e) => { if (!isPref) { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
          >
            <Star size={13} fill={isPref ? '#f59e0b' : 'none'} color={isPref ? '#f59e0b' : '#94a3b8'} />
          </button>
        </div>
      );
    }
  }), [handleSetPreferredVariant, handleCloneVariant, handleAddToWorkspace]);

  const presentationOptions = useMemo(() => {
    return Object.entries(PRESENTATION_LABELS).map(([value, label]) => ({
      value,
      label
    }));
  }, []);

  // 6. Build Columns
  const columnParams = {
    selectedProduct,
    priceView,
    displayCurrency,
    commercialChannel,
    resolveSupplierName,
    updateVariantField,
    handleSetPreferredVariant,
    handleCloneVariant,
    activePriceCol,
    activeMgCol,
    activeMonthlyCol,
    marginCol,
    waterfallCols,
    actionCol,
    presentationOptions,
    euroRate: Number(settings?.exchangeRates?.euro || 0.92),
    aedRate: Number(settings?.exchangeRates?.uae || 3.67),
    isApi
  };

  const peptideCols = useMemo(() => buildPeptideColumns(columnParams), [columnParams]);
  const testCols = useMemo(() => buildGenomicsColumns(columnParams), [columnParams]);
  const apiCols = useMemo(() => buildApiColumns(columnParams), [columnParams]);
  const serviceCols = useMemo(() => buildServiceColumns(columnParams), [columnParams]);
  const activeVariantCols = isService ? serviceCols : (isGenomics || isTest ? testCols : (isApi ? apiCols : peptideCols));

  if (!isOpen || !selectedProduct) return null;

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      width={isExpanded ? "min(1360px, 96vw)" : "clamp(480px, 62vw, 880px)"}
      expandable={false}
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {currentIndex !== -1 && products.length > 1 && (
            <div
              className="catalog-drawer-stepper"
              data-testid="product-stepper"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '7px',
                padding: '2px 4px',
                marginRight: '4px'
              }}
            >
              <button
                type="button"
                onClick={handlePrevProduct}
                disabled={!hasPrev}
                title="Previous product (← or [)"
                aria-label="Previous product"
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '3px 4px',
                  cursor: hasPrev ? 'pointer' : 'not-allowed',
                  opacity: hasPrev ? 1 : 0.35,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  color: '#0f172a'
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', minWidth: '45px', textAlign: 'center', userSelect: 'none' }}>
                {currentIndex + 1} / {products.length}
              </span>
              <button
                type="button"
                onClick={handleNextProduct}
                disabled={!hasNext}
                title="Next product (→ or ])"
                aria-label="Next product"
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '3px 4px',
                  cursor: hasNext ? 'pointer' : 'not-allowed',
                  opacity: hasNext ? 1 : 0.35,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  color: '#0f172a'
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
          {activeDrawer === 'offers' && (
            <>
              <button
                onClick={() => {
                  if (onOpenImportPriceList) {
                    const suppId = selectedProduct?.supplierId || selectedProduct?.supplierPricing?.supplierId || selectedProduct?.suppliers?.[0] || 'supplier-lotusland';
                    const cat = selectedProduct?.category || '';
                    onOpenImportPriceList({ productId: selectedProduct?.id, supplierId: suppId, category: cat });
                  }
                }}
                title="Import Price List"
                aria-label="Import Price List"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0284c7',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <UploadCloud size={14} style={{ color: '#0284c7' }} />
                <span className="hidden sm:inline">Import Price List</span>
              </button>

              <button
                onClick={() => handleExportProductPdf && handleExportProductPdf({ 
                  currency: displayCurrency, 
                  priceView, 
                  commercialChannel, 
                  groupBy: 'supplier' 
                })}
                title="Export Product PDF"
                aria-label="Export Product PDF"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.5rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#003666',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <FileText size={14} style={{ color: '#0284c7' }} />
                <span className="hidden sm:inline">Export PDF</span>
                <Share2 size={12} className="hidden sm:inline" style={{ opacity: 0.6 }} />
              </button>
            </>
          )}

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="hidden sm:inline-flex"
            title={isExpanded ? "Collapse to standard width" : "Expand to wide comparison view"}
            aria-label={isExpanded ? "Collapse drawer width" : "Expand drawer width"}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.35rem',
              width: '32px',
              height: '32px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      }
      title={
        activeDrawer === 'pricing' ? `Pricing Visibility: ${selectedProduct?.canonicalName}` :
        activeDrawer === 'competitors' ? `Competitors: ${selectedProduct?.canonicalName}` :
        selectedProduct?.canonicalName || 'Product Suppliers'
      }
      subtitle={
        activeDrawer === 'pricing' ? 'Manage pricing rules and tier visibility' :
        activeDrawer === 'competitors' ? 'Track and compare market prices' :
        activeDrawer === 'offers' ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span>{loadingVariants ? 'Loading variants...' : `${sortedVariants.length} variants`}</span>
            <span>•</span>
            <span>{activeSuppliersCount} {activeSuppliersCount === 1 ? 'supplier' : 'suppliers'}</span>
            {filterSupplier && filterSupplier.length > 0 && (
              <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600, backgroundColor: '#f0f9ff', padding: '1px 6px', borderRadius: '4px' }}>
                Filtered
              </span>
            )}
          </div>
        ) :
        `Available from ${activeSuppliersCount} suppliers`
      }
    >
      <div style={{ padding: '0.5rem 0.25rem', width: '100%' }}>
        {loadingVariants && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0' }}>
            <div className="skeleton" style={{ height: '36px', width: '100%', borderRadius: '8px' }} />
            <div className="skeleton" style={{ height: '120px', width: '100%', borderRadius: '8px' }} />
            <div className="skeleton" style={{ height: '120px', width: '100%', borderRadius: '8px' }} />
          </div>
        )}
        {/* Navigation Tabs when viewing Finished Peptides */}
        {!isTest && !isApi && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '1rem',
            padding: '4px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            width: 'fit-content',
          }}>
            <button
              type="button"
              onClick={() => setDrawerTab('offers')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: drawerTab === 'offers' ? 700 : 500,
                backgroundColor: drawerTab === 'offers' ? '#ffffff' : 'transparent',
                color: drawerTab === 'offers' ? '#003666' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: drawerTab === 'offers' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Layers size={14} />
              <span>Supplier Variants & Sourcing</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawerTab('competitors')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.78rem',
                fontWeight: drawerTab === 'competitors' ? 700 : 500,
                backgroundColor: drawerTab === 'competitors' ? '#ffffff' : 'transparent',
                color: drawerTab === 'competitors' ? '#003666' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: drawerTab === 'competitors' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <TrendingUp size={14} />
              <span>Competitor Comparison</span>
            </button>
          </div>
        )}

        {drawerTab === 'offers' && (
          <div className="flex flex-col gap-3">
            <VariantAccordion
              sortedVariants={sortedVariants}
              selectedProduct={selectedProduct}
              priceView={priceView}
              setPriceView={setPriceView}
              displayCurrency={displayCurrency}
              setDisplayCurrency={setDisplayCurrency}
              commercialChannel={commercialChannel}
              setCommercialChannel={setCommercialChannel}
              columns={activeVariantCols}
              apiColumns={apiCols}
              resolveSupplierName={resolveSupplierName}
              onExportPdf={handleExportProductPdf}
              isApi={isApi}
              updateVariantField={updateVariantField}
            />
          </div>
        )}

        {drawerTab === 'competitors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Automatic Variant-level Competitor Table */}
            <VariantCompetitorComparisonTable
              product={selectedProduct}
              variants={sortedVariants}
              channel={commercialChannel}
              mode="full"
            />
          </div>
        )}
      </div>
    </StandardDrawer>
  );
}
