"use client";

import { useEffect, useCallback, useRef } from 'react';

/**
 * useProductsContextBridge
 * 
 * Manages the 3-level context hierarchy for the Atlas Health Product Catalog:
 * - Level 1 (Macro): Entire catalog / filtered view (KPIs, stock alerts, categories)
 * - Level 2 (Micro): Individual Compound / Product focus (Drawers, row selection, pharmacology, formats)
 * - Level 3 (Nano): Specific SKU / Variant focus (Presentation, dosage, margins, price simulations)
 * 
 * Dispatches 'admin-context-update' events listened by PortalLayout -> ClinicalAssistant.
 */
export function useProductsContextBridge({
  products = [],
  globalMetrics = null,
  activeFilters = {},
  selectedProduct = null,
  selectedVariant = null,
  activeDrawer = null,
  role = 'admin'
} = {}) {
  const lastDispatchedRef = useRef(null);

  const dispatchContext = useCallback((levelOverride = null, extra = {}) => {
    if (typeof window === 'undefined') return;

    let level = 1;
    let payload = {};

    const activeProd = extra.product || selectedProduct;
    const activeVar = extra.variant || selectedVariant;

    if (activeVar && activeProd) {
      // ── Level 3: Nano / Variant Focus ─────────────────────────────────────
      level = 3;
      const cost = activeVar.cost ?? activeVar.unit_cost ?? activeVar.pricing?.masterPrice?.base ?? 0;
      const retail = activeVar.unit_price ?? activeVar.price ?? activeVar.retailPrice ?? 0;
      const wholesale = activeVar.wholesalePrice ?? activeVar.wholesale_price ?? 0;
      const clinic = activeVar.clinicPrice ?? activeVar.clinic_price ?? 0;
      const tier10 = activeVar.cost_tiers?.cost_10 ?? activeVar.price_per_kit_10 ?? 0;

      let marginPct = 0;
      if (Number(retail) > 0 && Number(cost) > 0) {
        marginPct = Math.round(((Number(retail) - Number(cost)) / Number(retail)) * 100);
      }

      payload = {
        level: 3,
        page: 'products',
        isCatalogContext: true,
        isProductContext: true,
        isVariantContext: true,
        entityName: `${activeProd.canonicalName || activeProd.name} (${activeVar.dosage || ''} ${activeVar.presentation || ''})`,
        productName: activeProd.canonicalName || activeProd.name,
        product: activeProd,
        variant: activeVar,
        sku: activeVar.sku || activeVar.id,
        dosage: activeVar.dosage || activeVar.dose,
        presentation: activeVar.presentation || activeVar.form,
        supplier: activeVar.supplier || activeProd.supplier || 'Atlas Verified',
        stock: activeVar.stock ?? activeProd.stock ?? 0,
        pricing: {
          cost,
          wholesale,
          clinic,
          retail,
          tier10,
          marginPct
        },
        summary: `Variant Focus: ${activeProd.canonicalName || activeProd.name} - ${activeVar.dosage || ''} ${activeVar.presentation || ''} (SKU: ${activeVar.sku || 'N/A'}). Unit Cost: $${cost}, Retail: $${retail}, Margin: ${marginPct}%. Stock: ${activeVar.stock ?? 'Available'}.`,
        quickActions: [
          { label: '📊 Margin Simulator', prompt: `Simulate margins for ${activeProd.canonicalName || activeProd.name} (${activeVar.dosage || ''}): What happens if the cost of $${cost} changes by 10%?` },
          { label: '📝 Draft RFQ', prompt: `Draft a Request for Quotation (RFQ) for 100 units of SKU ${activeVar.sku || activeVar.id || activeProd.name}` },
          { label: '🏷️ Compare Sources', prompt: `Compare available supplier sources for ${activeVar.dosage || ''} of ${activeProd.name}` }
        ]
      };
    } else if (activeProd) {
      // ── Level 2: Micro / Product Focus ────────────────────────────────────
      level = 2;
      const variants = activeProd.variants || [];
      const prodName = activeProd.canonicalName || activeProd.displayName || activeProd.name || 'Product';

      payload = {
        level: 2,
        page: 'products',
        isCatalogContext: true,
        isProductContext: true,
        isVariantContext: false,
        entityName: prodName,
        productName: prodName,
        product: activeProd,
        cas: activeProd.cas || activeProd.casNumber || 'N/A',
        category: activeProd.category || 'Peptides',
        variantCount: variants.length,
        variants: variants.slice(0, 10).map(v => ({
          dosage: v.dosage || v.dose,
          presentation: v.presentation || v.form,
          cost: v.cost ?? v.unit_cost,
          retail: v.retailPrice ?? v.retail_price,
          wholesale: v.wholesalePrice ?? v.wholesale_price,
          supplier: v.supplier || v.supplierName || 'Atlas'
        })),
        pharmacology: activeProd.pharmacology || {},
        summary: `Product Focus: ${prodName} (CAS: ${activeProd.cas || 'N/A'}). Category: ${activeProd.category || 'General'}. Formats: ${variants.length} available variants. Primary target: ${activeProd.target || 'Peptide receptor'}.`,
        quickActions: [
          { label: '📄 Official Monograph', prompt: `Generate the official clinical monograph and datasheet for ${prodName}` },
          { label: '🏷️ Pricing Matrix', prompt: `Show the complete pricing matrix (cost, clinic, wholesale, retail) for ${prodName}` },
          { label: '🔗 Clinical Protocols', prompt: `Which clinical protocols in our database feature ${prodName} and what are their titles?` },
          { label: '🧪 Reconstitution Guide', prompt: `What is the recommended reconstitution protocol and stability parameter for ${prodName}?` }
        ]
      };
    } else {
      // ── Level 1: Macro / Catalog Level ────────────────────────────────────
      level = 1;
      const totalCount = globalMetrics?.totalProducts || products.length;
      const lowStockCount = globalMetrics?.lowStockCount || products.filter(p => (p.stock || 0) < 20).length;
      const outOfStockCount = globalMetrics?.outOfStockCount || products.filter(p => (p.stock || 0) === 0).length;
      const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

      payload = {
        level: 1,
        page: 'products',
        isCatalogContext: true,
        isProductContext: false,
        isVariantContext: false,
        label: 'Product Catalog',
        totalProducts: totalCount,
        lowStockCount,
        outOfStockCount,
        activeFilters,
        categories: categories.slice(0, 8),
        summary: `Catalog View: ${totalCount} compounds indexed (${lowStockCount} low stock, ${outOfStockCount} out of stock). Active category: ${activeFilters.category || 'All'}.`,
        quickActions: [
          { label: '⚠️ Low Stock Alerts', prompt: 'Which products currently have low or critical stock levels requiring replenishment?' },
          { label: '📋 Price List PDF', prompt: 'Generate a structured price list table for all in-stock catalog products' },
          { label: '📊 Turnover Overview', prompt: 'Generate an executive summary of catalog inventory and primary therapeutic categories' },
          { label: '⚖️ Compare GLP-1/GIP', prompt: 'Compare GLP-1 receptor agonists and dual GIP/GLP-1 analogues in our catalog' }
        ]
      };
    }

    // Deduplicate rapid identical dispatches
    const signature = `${payload.level}:${payload.productName || 'catalog'}:${payload.sku || 'none'}:${activeDrawer || 'none'}`;
    if (lastDispatchedRef.current === signature) return;
    lastDispatchedRef.current = signature;

    window.dispatchEvent(
      new CustomEvent('admin-context-update', {
        detail: payload
      })
    );
  }, [selectedProduct, selectedVariant, products, globalMetrics, activeFilters, activeDrawer]);

  useEffect(() => {
    dispatchContext();
  }, [dispatchContext]);

  return {
    dispatchContext,
    setLevel2: (product) => dispatchContext(2, { product, variant: null }),
    setLevel3: (variant, product) => dispatchContext(3, { variant, product }),
    resetToLevel1: () => dispatchContext(1, { product: null, variant: null })
  };
}
