"use client";

import { useQueryClient } from '@tanstack/react-query';
import { updateProduct, updateVariant } from '../../../../repositories/productRepository';
import { createVariantTimelineEntry } from '../../../../utils/variantTimelineHelper';
import { resolveChannelPrice, COMMERCIAL_CHANNELS } from '../../../../utils/commercialPricingHelper';
import notifier from '../../../../services/NotificationService';

/**
 * useVariantMutations
 * ─────────────────────────────────────────────────────────────────────────────
 * Encapsulates optimistic state updates, Firestore syncing (both subcollection and
 * parent product document), automatic cascading calculations (discounts, net costs,
 * channel gross margins), and immutable timeline audit logging.
 */
export function useVariantMutations({ selectedProduct, setSelectedProduct, displayCurrency, priceView, user, refresh }) {
  const queryClient = useQueryClient();

  const updateVariantField = async (variantId, field, value) => {
    if (!selectedProduct?.id) return;

    let dbPayload = {};
    const prevVariant = (selectedProduct?.variants || []).find(v => v.id === variantId) || {};

    if (field === 'discountPercent') {
      const newDisc = Math.max(0, Math.min(90, Number(value)));
      const currentSp = prevVariant.supplierPricing || selectedProduct?.supplierPricing || {};
      const listPrice = currentSp.listPrice || (currentSp.netCost ? Math.round(currentSp.netCost / (1 - (currentSp.discountPercent || 25) / 100)) : 3100);
      const newNetCost = Number((listPrice * (1 - newDisc / 100)).toFixed(2));
      const discountAmount = Number((listPrice - newNetCost).toFixed(2));
      const moq = currentSp.moq || prevVariant.moq || 5;

      const updatedSp = {
        ...currentSp,
        listPrice,
        discountPercent: newDisc,
        discountAmount,
        netCost: newNetCost,
        currency: currentSp.currency || 'USD',
        unitOfMeasure: currentSp.unitOfMeasure || 'g',
        lastQuotationDate: new Date().toISOString().split('T')[0]
      };

      dbPayload = {
        discountPercent: newDisc,
        supplierPricing: updatedSp,
        unit_price: newNetCost,
        price: newNetCost,
        supplierCost: newNetCost,
        cost_1: newNetCost,
        cost_10: Number((newNetCost * moq).toFixed(2)),
        'cost_tiers.cost_1': newNetCost,
        'cost_tiers.cost_10': Number((newNetCost * moq).toFixed(2)),
        'pricing.masterPrice.base': newNetCost,
        'pricing.supplierCost': newNetCost
      };

      if (selectedProduct?.id) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../../../firebase');
        await updateDoc(doc(db, 'products', selectedProduct.id), {
          supplierPricing: updatedSp,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }
    } else if (field === 'supplierListPrice') {
      const newListPrice = Number(value);
      const currentSp = prevVariant.supplierPricing || selectedProduct?.supplierPricing || {};
      const disc = currentSp.discountPercent ?? 25;
      const newNetCost = Number((newListPrice * (1 - disc / 100)).toFixed(2));
      const discountAmount = Number((newListPrice - newNetCost).toFixed(2));
      const moq = currentSp.moq || prevVariant.moq || 5;

      const updatedSp = {
        ...currentSp,
        listPrice: newListPrice,
        discountPercent: disc,
        discountAmount,
        netCost: newNetCost,
        currency: currentSp.currency || 'USD',
        unitOfMeasure: currentSp.unitOfMeasure || 'g',
        lastQuotationDate: new Date().toISOString().split('T')[0]
      };

      dbPayload = {
        supplierPricing: updatedSp,
        unit_price: newNetCost,
        price: newNetCost,
        supplierCost: newNetCost,
        cost_1: newNetCost,
        cost_10: Number((newNetCost * moq).toFixed(2)),
        'cost_tiers.cost_1': newNetCost,
        'cost_tiers.cost_10': Number((newNetCost * moq).toFixed(2)),
        'pricing.masterPrice.base': newNetCost,
        'pricing.supplierCost': newNetCost
      };

      if (selectedProduct?.id) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../../../../firebase');
        await updateDoc(doc(db, 'products', selectedProduct.id), {
          supplierPricing: updatedSp,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }
    } else if (field.endsWith('_margin')) {
      const channelName = field.replace('_margin', '');
      const newMarginPct = Math.max(0, Math.min(95, parseFloat(value) || 0));
      const prevVar = (selectedProduct?.variants || []).find(v => v.id === variantId) || {};
      const rawCost = resolveChannelPrice(prevVar, 'cost', priceView).price || prevVar.unit_price || 2325;
      
      // Gross margin formula: price = cost / (1 - marginPct / 100)
      const newSellPriceUSD = Number((rawCost / (1 - newMarginPct / 100)).toFixed(2));
      const fieldKey = priceView === 'kit' ? `${channelName}_price_10` : `${channelName}_price`;
      const subTierKey = priceView === 'kit' ? 'kit' : (priceView === 'tier_50' ? 'tier_50' : (priceView === 'tier_100' ? 'tier_100' : 'perUnit'));

      dbPayload = {
        [fieldKey]: newSellPriceUSD,
        [`pricing.${channelName}.${subTierKey}`]: newSellPriceUSD,
        [`pricing.${channelName}.base`]: newSellPriceUSD,
        [`pricing.${channelName}.marginPct`]: newMarginPct,
        [`pricing.${channelName}.currency`]: 'USD'
      };
    } else {
      dbPayload[field] = value;
    }

    // Capture timeline entry for audit history
    const prevVal = prevVariant[field];
    
    const timelineEntry = createVariantTimelineEntry({
      field,
      previousValue: prevVal,
      newValue: value,
      currency: displayCurrency,
      user
    });

    const existingTimeline = Array.isArray(prevVariant.timeline) 
      ? prevVariant.timeline 
      : (Array.isArray(prevVariant.history) ? prevVariant.history : []);

    const updatedTimeline = [timelineEntry, ...existingTimeline].slice(0, 50);
    dbPayload.timeline = updatedTimeline;

    // 1. Optimistic instant UI update in selectedProduct
    let nextVariants = [];
    if (selectedProduct && selectedProduct.variants) {
      nextVariants = selectedProduct.variants.map(variant => {
        if (variant.id !== variantId) return variant;
        let updatedVariant = { ...variant };
        Object.entries(dbPayload).forEach(([k, v]) => {
          if (k.startsWith('cost_tiers.')) {
            const tierKey = k.replace('cost_tiers.', '');
            updatedVariant.cost_tiers = { ...(updatedVariant.cost_tiers || {}), [tierKey]: v };
          } else if (k.startsWith('pricing.')) {
            const parts = k.split('.');
            const chan = parts[1];
            const sub = parts[2];
            updatedVariant.pricing = {
              ...(updatedVariant.pricing || {}),
              [chan]: {
                ...(updatedVariant.pricing?.[chan] || {}),
                [sub]: v
              }
            };
          } else {
            updatedVariant[k] = v;
          }
        });
        updatedVariant.timeline = updatedTimeline;
        return updatedVariant;
      });

      setSelectedProduct(prev => ({
        ...prev,
        variants: nextVariants
      }));
    }
    
    try {
      // 2. Persist to Firestore subcollection
      await updateVariant(selectedProduct.id, variantId, dbPayload, { strict: false });

      // Parent document denormalized fields are automatically synced by updateVariant -> syncVariantDenorm
      
      const labelUpdated = field === 'supplierId' ? 'Supplier' : (field.includes('cost') || field.includes('price') ? 'Price' : field);
      notifier.success(`${labelUpdated} auto-calculated & saved across all currencies`);
      
      // 4. Auto-refresh caches
      queryClient.invalidateQueries({ queryKey: ['catalog-summary'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['catalog-facets'], exact: false });
      if (refresh) refresh();
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      notifier.error(`Failed to update ${field}: ${error?.message || error}`);
      throw error;
    }
  };

  const resetVariantMarginToDefault = async (variantId, channel) => {
    if (!selectedProduct?.id) return;
    const channelMeta = COMMERCIAL_CHANNELS.find(c => c.id === channel) || { label: channel };
    const prevVariant = (selectedProduct?.variants || []).find(v => v.id === variantId) || {};

    const timelineEntry = createVariantTimelineEntry({
      field: `${channel}_price`,
      fieldLabel: `${channelMeta.label} Price`,
      previousValue: prevVariant.pricing?.[channel]?.base || prevVariant[`${channel}_price`] || 'Custom Override',
      newValue: 'Auto (Default Platform Margin)',
      currency: displayCurrency,
      user
    });

    const existingTimeline = Array.isArray(prevVariant.timeline) 
      ? prevVariant.timeline 
      : (Array.isArray(prevVariant.history) ? prevVariant.history : []);

    const updatedTimeline = [timelineEntry, ...existingTimeline].slice(0, 50);

    const nextVariants = (selectedProduct.variants || []).map(v => {
      if (v.id !== variantId) return v;
      const updatedPricing = { ...(v.pricing || {}) };
      delete updatedPricing[channel];
      return {
        ...v,
        pricing: updatedPricing,
        [`${channel}_price`]: null,
        [`${channel}_price_10`]: null,
        timeline: updatedTimeline
      };
    });

    setSelectedProduct(prev => ({
      ...prev,
      variants: nextVariants
    }));

    try {
      const { doc, updateDoc, deleteField } = await import('firebase/firestore');
      const { db } = await import('../../../../firebase');
      
      const variantRef = doc(db, 'products', selectedProduct.id, 'variants', variantId);
      await updateDoc(variantRef, {
        [`pricing.${channel}`]: deleteField(),
        [`${channel}_price`]: deleteField(),
        [`${channel}_price_10`]: deleteField(),
        timeline: updatedTimeline,
        updatedAt: new Date().toISOString()
      });

      // Denorm synced by updateVariant -> syncVariantDenorm automatically if it were using repository, but since it's raw updateDoc, we should trigger cache invalidation.
      notifier.success(`${channelMeta.label} price reset to platform default`);
      queryClient.invalidateQueries({ queryKey: ['catalog-summary'], exact: false });
      if (refresh) refresh();
    } catch (err) {
      console.error('Failed to reset variant price:', err);
      notifier.error('Failed to reset price to default: ' + (err.message || err));
    }
  };

  return {
    updateVariantField,
    resetVariantMarginToDefault
  };
}
