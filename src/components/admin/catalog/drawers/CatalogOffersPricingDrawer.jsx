"use client";

import React, { useMemo } from 'react';
import StandardDrawer from '../../../ui/StandardDrawer';
import VariantAccordion from '../VariantAccordion';
import VariantCompetitorComparisonTable from '../VariantCompetitorComparisonTable';
import { 
  buildSharedCols, 
  buildPeptideColumns, 
  buildGeneticTestColumns, 
  buildApiColumns 
} from '../columns/catalogColumns';
import { UploadCloud, FileText, Share2, Layers, TrendingUp, Copy, Star } from 'lucide-react';
import InlineEditableCell from '../../../ui/InlineEditableCell';
import notifier from '../../../../services/NotificationService';
import { useAppSettings } from '../../../../hooks/useAppSettings';
import { updateProduct, createVariant, updateVariant, getVariants } from '../../../../repositories/productRepository';
import { resolveChannelPrice, calculateMarginMetrics } from '../../../../utils/commercialPricingHelper';
import { calculateTotalMg } from '../../../../utils/calculateTotalMg';
import { PRESENTATION_LABELS } from '../../../../constants/presentationTypes';

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
  const [drawerTab, setDrawerTab] = React.useState('offers'); // 'offers' | 'competitors'
  const [loadingVariants, setLoadingVariants] = React.useState(false);

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
  }, [isOpen, selectedProduct?.id]);

  const isTest = selectedProduct?.category?.toLowerCase().includes('test') || 
                 selectedProduct?.product_type?.toLowerCase().includes('test') || 
                 selectedProduct?.product_type === 'dna_testing_kit' || 
                 selectedProduct?.product_type === 'biomarker_testing_kit' ||
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

  // 4. Update variant fields inline
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

      if (commercialChannel === 'cost') {
        return (
          <InlineEditableCell
            value={converted}
            type="number"
            prefix={currencySymbol}
            format={(val) => (val != null && !isNaN(val)) ? `${currencySymbol}${Number(val).toFixed(2)}` : '—'}
            onSave={(newVal) => updateVariantField(v.id, priceField, Number(newVal))}
          />
        );
      }

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#003666' }}>
            {converted != null && !isNaN(converted) ? `${currencySymbol}${Number(converted).toFixed(2)}` : '—'}
          </span>
          {res.isAuto && (
            <span style={{ fontSize: '0.65rem', color: '#64748b', background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px' }}>
              auto
            </span>
          )}
        </div>
      );
    }
  }), [priceHeader, priceField, commercialChannel, priceView, displayCurrency, settings, currencySymbol]);

  const activeMgCol = useMemo(() => ({
    key: 'price_per_mg',
    header: commercialChannel === 'cost' ? 'Cost / mg' : 'Price / mg',
    width: '105px',
    nowrap: true,
    render: (v) => {
      const res = resolveChannelPrice(v, commercialChannel, priceView);
      const rawUsd = res.price;
      const totalMg = calculateTotalMg(v) || calculateTotalMg(selectedProduct) || (v.format === 'nasal_spray' ? 500 : null);
      if (!rawUsd || !totalMg || totalMg <= 0) return <span style={{ color: '#94a3b8' }}>—</span>;
      let convertedPerMg = rawUsd / totalMg;
      if (displayCurrency === 'EUR') {
        convertedPerMg *= (settings?.exchangeRates?.euro || 0.92);
      }
      if (displayCurrency === 'AED') {
        convertedPerMg *= (settings?.exchangeRates?.uae || 3.67);
      }
      return (
        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#003666' }}>
          {currencySymbol}{convertedPerMg.toFixed(2)}/mg
        </span>
      );
    }
  }), [commercialChannel, priceView, displayCurrency, settings, currencySymbol, selectedProduct]);

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
    header: 'Quick Actions',
    width: '160px',
    align: 'right',
    nowrap: true,
    render: (v) => {
      const isPref = v.isPreferred || v.isDefault;
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
          <button
            type="button"
            title="Clone / Duplicate this variant with custom pricing or supplier"
            onClick={(e) => {
              e.stopPropagation();
              handleCloneVariant(v);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '3px 7px',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#334155',
              transition: 'all 0.15s ease'
            }}
          >
            <Copy size={11} style={{ color: '#0284c7' }} />
            <span>Clone</span>
          </button>
          <button
            type="button"
            title={isPref ? "Preferred default variant" : "Set as default variant"}
            onClick={(e) => {
              e.stopPropagation();
              handleSetPreferredVariant(v.id);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              background: isPref ? '#fef3c7' : '#ffffff',
              border: isPref ? '1px solid #fde68a' : '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '3px 7px',
              cursor: 'pointer',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: isPref ? '#b45309' : '#64748b',
              transition: 'all 0.15s ease'
            }}
          >
            {isPref ? (
              <>
                <Star size={11} fill="#f59e0b" color="#f59e0b" />
                <span>Default</span>
              </>
            ) : (
              <>
                <Star size={11} />
                <span>Set Default</span>
              </>
            )}
          </button>
        </div>
      );
    }
  }), [handleSetPreferredVariant, handleCloneVariant]);

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
    marginCol,
    waterfallCols,
    actionCol,
    presentationOptions,
    euroRate: Number(settings?.exchangeRates?.euro || 0.92),
    aedRate: Number(settings?.exchangeRates?.uae || 3.67),
    isApi
  };

  const peptideCols = useMemo(() => buildPeptideColumns(columnParams), [columnParams]);
  const testCols = useMemo(() => buildGeneticTestColumns(columnParams), [columnParams]);
  const apiCols = useMemo(() => buildApiColumns(columnParams), [columnParams]);

  if (!isOpen || !selectedProduct) return null;

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      width={activeDrawer === 'offers' ? "1050px" : "1100px"}
      actions={
        activeDrawer === 'offers' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                if (onOpenImportPriceList) {
                  const suppId = selectedProduct?.supplierId || selectedProduct?.supplierPricing?.supplierId || selectedProduct?.suppliers?.[0] || 'supplier-lotusland';
                  const cat = selectedProduct?.category || '';
                  onOpenImportPriceList({ productId: selectedProduct?.id, supplierId: suppId, category: cat });
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#0284c7',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '7px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.15s ease'
              }}
            >
              <UploadCloud size={14} style={{ color: '#0284c7' }} />
              <span>Import Price List</span>
            </button>

            <button
              onClick={() => handleExportProductPdf && handleExportProductPdf({ 
                currency: displayCurrency, 
                priceView, 
                commercialChannel, 
                groupBy: 'supplier' 
              })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#003666',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '7px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={14} style={{ color: '#0284c7' }} />
              <span>Export PDF</span>
              <Share2 size={12} style={{ opacity: 0.6 }} />
            </button>
          </div>
        ) : null
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
              columns={isTest ? testCols : peptideCols}
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
            />
          </div>
        )}
      </div>
    </StandardDrawer>
  );
}
