import { useState, useCallback, useMemo } from 'react';
import { useFirestoreData } from '../useFirestoreData';

/**
 * useOrderBuilder
 * Unifies the state for building B2B orders and Prescriptions.
 */
export function useOrderBuilder({ initialTier = 'tier_0' } = {}) {
  const { data: pricingData } = useFirestoreData('settings', 'pricing');
  
  const [selectedTarget, setSelectedTarget] = useState(null); // The Patient or Clinic receiving the order
  const [draftItems, setDraftItems] = useState([]);
  const [importedSources, setImportedSources] = useState([]); // { type: 'prescription'|'b2c_order', id: string, data: any }
  
  // Determine pricing tier
  const pricingTier = useMemo(() => {
    // If target has a specific tier, use it, otherwise fallback to initial
    return selectedTarget?.pricingTier || initialTier;
  }, [selectedTarget, initialTier]);

  // Pricing calculations
  const totals = useMemo(() => {
    let subtotal = 0;
    
    draftItems.forEach(item => {
      // Logic for calculating price based on pricingTier and product prices
      // If we don't have product details, we might need them injected or fetched
      // For now, we will assume item.price is either injected or we use a base price
      let unitPrice = 0;
      if (item.prices && item.prices[pricingTier]) {
        unitPrice = item.prices[pricingTier];
      } else if (item.price) {
         unitPrice = item.price;
      }
      subtotal += (unitPrice * (item.quantity || 1));
    });

    const tax = subtotal * 0.05; // 5% tax example
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  }, [draftItems, pricingTier]);

  const addItem = useCallback((item) => {
    setDraftItems(prev => {
      const existingIndex = prev.findIndex(i => i.id === item.id && i.sourceId === item.sourceId);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: copy[existingIndex].quantity + (item.quantity || 1)
        };
        return copy;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const updateItemQuantity = useCallback((id, sourceId, quantity) => {
    setDraftItems(prev => prev.map(item => {
      if (item.id === id && item.sourceId === sourceId) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    }));
  }, []);

  const removeItem = useCallback((id, sourceId) => {
    setDraftItems(prev => prev.filter(item => !(item.id === id && item.sourceId === sourceId)));
  }, []);

  const importSource = useCallback((sourceType, sourceId, sourceData, items) => {
    // Check if already imported
    if (importedSources.find(s => s.id === sourceId)) return;
    
    setImportedSources(prev => [...prev, { type: sourceType, id: sourceId, data: sourceData }]);
    
    // Add items tagging their source
    items.forEach(item => {
      addItem({ ...item, sourceId, sourceType });
    });
  }, [addItem, importedSources]);

  const removeSource = useCallback((sourceId) => {
    setImportedSources(prev => prev.filter(s => s.id !== sourceId));
    setDraftItems(prev => prev.filter(item => item.sourceId !== sourceId));
  }, []);

  const clear = useCallback(() => {
    setSelectedTarget(null);
    setDraftItems([]);
    setImportedSources([]);
  }, []);

  return {
    selectedTarget,
    setSelectedTarget,
    draftItems,
    setDraftItems,
    importedSources,
    pricingTier,
    totals,
    addItem,
    updateItemQuantity,
    removeItem,
    importSource,
    removeSource,
    clear
  };
}
