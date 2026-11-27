'use client';

import { useState, useMemo, useCallback } from 'react';
import { ATLAS_MARGIN_RATES, resolveAllPrices } from '@/lib/pricing/pricingCore';
import { usePricing } from '@/hooks/usePricing';
import { useSyncedTableParams } from '@/hooks/useSyncedTableParams';

export function useBrandPriceSchedule({
  initialProducts = [],
  initialCategory = 'all',
  defaultMarkupPct = 32.25,
  fxRate = 1,
} = {}) {
  const { market: sessionMarket, countryCode } = usePricing();
  const [markupPct, setMarkupPct] = useState(defaultMarkupPct);
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useSyncedTableParams({ defaultCategory: initialCategory });
  const [scopeMode, setScopeMode] = useState('global'); // 'global' | 'filtered'
  const [itemOverrides, setItemOverrides] = useState({});

  const handleUpdateProductPrice = useCallback(
    (productId, tier, newPrice) => {
      const numPrice = Number(newPrice);
      if (Number.isNaN(numPrice) || numPrice < 0) return null;
      const priceInAed = Number((numPrice / fxRate).toFixed(2));

      let updatedFields = {};
      setItemOverrides((prev) => {
        const existing = prev[productId] || {};
        const prod = initialProducts.find((p) => p.id === productId);
        const landed = prod?.landedCostAed || 1;

        if (tier === 'landed') {
          updatedFields = { landedCostAed: priceInAed };
          return {
            ...prev,
            [productId]: { ...existing, landedCostAed: priceInAed },
          };
        }
        if (tier === 'wholesale') {
          const markup = Number((((priceInAed - landed) / landed) * 100).toFixed(1));
          updatedFields = { wholesalePriceAed: priceInAed };
          return {
            ...prev,
            [productId]: {
              ...existing,
              wholesalePrice: priceInAed,
              wholesaleMarkupPct: markup,
            },
          };
        }
        if (tier === 'clinic') {
          const wholesale =
            existing.wholesalePrice ??
            Number((landed * (1 + (existing.wholesaleMarkupPct ?? markupPct) / 100)).toFixed(2));
          const margin =
            wholesale > 0
              ? Number((((priceInAed - wholesale) / wholesale) * 100).toFixed(1))
              : 25;
          updatedFields = { clinicPriceAed: priceInAed };
          return {
            ...prev,
            [productId]: {
              ...existing,
              clinicPrice: priceInAed,
              clinicMarginPct: margin,
            },
          };
        }
        if (tier === 'retail') {
          updatedFields = { retailPriceAed: priceInAed };
          return {
            ...prev,
            [productId]: { ...existing, retailPrice: priceInAed },
          };
        }
        return prev;
      });

      return updatedFields;
    },
    [fxRate, initialProducts, markupPct]
  );

  const handleResetOverrides = useCallback(() => {
    setItemOverrides({});
  }, []);

  const hasCustomOverrides = useMemo(
    () => Object.keys(itemOverrides).length > 0,
    [itemOverrides]
  );

  const processedProducts = useMemo(() => {
    return initialProducts.map((p, idx) => {
      const ov = itemOverrides[p.id] || {};
      const resolvedMarket = resolveAllPrices(p, { market: sessionMarket, countryCode });
      const useRegional = resolvedMarket.isMarketOverride;
      const landed = ov.landedCostAed ?? Number((useRegional && resolvedMarket.cost != null ? resolvedMarket.cost : p.landedCostAed) || 0);
      const itemMarkupPct = ov.wholesaleMarkupPct ?? markupPct;

      const distributor =
        ov.distributorPrice ??
        (useRegional && resolvedMarket.distributor != null
          ? resolvedMarket.distributor
          : Number((landed * (1 + ATLAS_MARGIN_RATES.DISTRIBUTOR_MARKUP)).toFixed(2)));

      const wholesale =
        ov.wholesalePrice ??
        (useRegional && resolvedMarket.wholeseller != null
          ? resolvedMarket.wholeseller
          : Number((landed * ATLAS_MARGIN_RATES.WHOLESELLER_COMPOUND).toFixed(2)));

      const marginAed = Number((wholesale - landed).toFixed(2));
      const marginPct =
        wholesale > 0 ? Number(((marginAed / wholesale) * 100).toFixed(1)) : 0;

      const recommendedClinic =
        ov.clinicPrice ??
        (useRegional && resolvedMarket.clinic != null
          ? resolvedMarket.clinic
          : (p.clinicPriceAed != null
            ? Number(p.clinicPriceAed)
            : Number((wholesale * 1.25).toFixed(2))));

      const recommendedRetail =
        ov.retailPrice ??
        (useRegional && resolvedMarket.retail != null
          ? resolvedMarket.retail
          : (p.retailPriceAed != null
            ? Number(p.retailPriceAed)
            : Number((recommendedClinic * 1.3).toFixed(2))));

      const retailMarginPct =
        recommendedRetail > 0
          ? Number(
              (((recommendedRetail - recommendedClinic) / recommendedRetail) * 100).toFixed(1)
            )
          : 0;

      return {
        ...p,
        itemNumber: idx + 1,
        calculatedLanded: landed,
        calculatedDistributor: distributor,
        calculatedWholesale: wholesale,
        calculatedMarginAed: marginAed,
        calculatedMarginPct: marginPct,
        appliedMarkupPct: itemMarkupPct,
        recommendedClinic,
        recommendedRetail,
        calculatedRetailMarginPct: retailMarginPct,
        hasCustomOverride: Boolean(itemOverrides[p.id]),
      };
    });
  }, [initialProducts, markupPct, itemOverrides, sessionMarket, countryCode]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return processedProducts.filter((p) => {
      const matchesSearch =
        !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.keyActives && p.keyActives.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === 'all' ||
        (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

      return matchesSearch && matchesCat;
    });
  }, [processedProducts, searchQuery, selectedCategory]);

  const hasActiveFilters = Boolean(searchQuery.trim() || selectedCategory !== 'all');
  const kpiSourceProducts =
    scopeMode === 'filtered' && hasActiveFilters ? filteredProducts : processedProducts;

  const totals = useMemo(() => {
    const totalLanded = kpiSourceProducts.reduce((sum, p) => sum + p.calculatedLanded, 0);
    const totalWholesale = kpiSourceProducts.reduce((sum, p) => sum + p.calculatedWholesale, 0);
    const totalMargin = Number((totalWholesale - totalLanded).toFixed(2));
    const avgMarginPct =
      totalWholesale > 0 ? Number(((totalMargin / totalWholesale) * 100).toFixed(1)) : 0;
    return {
      totalLanded,
      totalWholesale,
      totalMargin,
      avgMarginPct,
      count: kpiSourceProducts.length,
    };
  }, [kpiSourceProducts]);

  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [initialProducts]);

  return {
    markupPct,
    setMarkupPct,
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
  };
}
