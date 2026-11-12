'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SHIPPING_DESTINATIONS } from '@/constants/peptideCategories';

/**
 * usePeptidesCart
 * Business logic hook for B2B Proforma cart management:
 * - Reactive state for 1x single vial and 10x pack items
 * - LocalStorage draft persistence & hydration (anti-abandonment)
 * - Regional courier rate calculation (EU, US, AE)
 * - Multi-currency totals & formatted WhatsApp B2B checkout dispatch
 */
export function usePeptidesCart({
  referralCode = 'CAT-RX-7482',
  isDistributor = false,
  shippingDest = 'EU',
  currency = 'USD',
  currencySymbol = '$',
  fxRate = 1,
  formatPrice,
  processedProducts = [],
  orderForm = {},
  validateOrderForm
}) {
  const [cartItems, setCartItems] = useState({});
  const [hasRestoredCart, setHasRestoredCart] = useState(false);
  const storageKey = `atlas_peptides_b2b_cart_${referralCode || 'CAT-RX-7482'}`;

  // Persist tier & referral
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_peptides_tier', isDistributor ? 'distributor' : 'wholesaler');
        localStorage.setItem('atlas_peptides_referral', referralCode || (isDistributor ? 'DISTRIBUTOR-15' : 'WHOLESALER-B2B'));
      } catch {
        // Ignore quota exceptions
      }
    }
  }, [isDistributor, referralCode]);

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = setTimeout(() => {
      try {
        const savedCart = localStorage.getItem(storageKey);
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            setCartItems(parsed);
            setHasRestoredCart(true);
          }
        }
      } catch (err) {
        console.warn('Could not restore cached cart:', err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [storageKey]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (Object.keys(cartItems).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(cartItems));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (err) {
      console.warn('Could not save cart:', err);
    }
  }, [cartItems, storageKey]);

  const updateItemQuantity = useCallback((productId, type, delta) => {
    setCartItems(prev => {
      const existing = prev[productId];
      if (!existing) return prev;
      const field = type === '10x' ? 'quantity10x' : 'quantity1x';
      const nextVal = Math.max(0, (existing[field] || 0) + delta);
      const otherField = type === '10x' ? 'quantity1x' : 'quantity10x';
      if (nextVal === 0 && (existing[otherField] || 0) === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: {
          ...existing,
          [field]: nextVal
        }
      };
    });
  }, []);

  const handleAddToCart = useCallback((product, packType) => {
    setCartItems(prev => {
      const current = prev[product.id] || { quantity1x: 0, quantity10x: 0, product };
      const updated = {
        ...current,
        [packType === '10x' ? 'quantity10x' : 'quantity1x']: current[packType === '10x' ? 'quantity10x' : 'quantity1x'] + 1
      };
      return { ...prev, [product.id]: updated };
    });
    toast.success(`Added ${product.productName} (${packType === '10x' ? 'Pack ×10' : '1x Vial'}) to request ✓`);
  }, []);

  const handlePrintProforma = useCallback(() => {
    if (Object.keys(cartItems).length === 0) {
      toast.error('Please select formulations before printing or saving a PDF proforma.');
      return;
    }
    window.print();
  }, [cartItems]);

  const totalCartCount = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity1x + (item.quantity10x * 10), 0);
  }, [cartItems]);

  const totalCartValueUsd = useMemo(() => {
    return Object.values(cartItems).reduce((sum, item) => {
      const p = item.product;
      const v1x = (item.quantity1x || 0) * (p.unitPrice || 0);
      const v10x = (item.quantity10x || 0) * (p.pack10Price || (p.unitPrice * 10 * 0.85));
      return sum + v1x + v10x;
    }, 0);
  }, [cartItems]);

  const activeShippingCorridor = useMemo(() => {
    return SHIPPING_DESTINATIONS.find(d => d.id === shippingDest) || SHIPPING_DESTINATIONS[0];
  }, [shippingDest]);

  const shippingCostUsd = useMemo(() => {
    return activeShippingCorridor.usdCost;
  }, [activeShippingCorridor]);

  const shippingCostCurrentCurrency = useMemo(() => {
    if (currency === 'EUR') return activeShippingCorridor.eurCost;
    if (currency === 'AED') return Math.round(activeShippingCorridor.usdCost * 3.6725 * 100) / 100;
    return activeShippingCorridor.usdCost;
  }, [currency, activeShippingCorridor]);

  const grandTotalCartValueUsd = useMemo(() => {
    return totalCartCount > 0 ? (totalCartValueUsd + shippingCostUsd) : 0;
  }, [totalCartCount, totalCartValueUsd, shippingCostUsd]);

  const handleAddProtocolPreset = useCallback((preset, isPack10 = false) => {
    let addedCount = 0;
    const itemsToAdd = {};

    preset.searchTerms.forEach(term => {
      const cleanTerm = term.toLowerCase().trim();
      const match = processedProducts.find(p => {
        const name = (p.productName || '').toLowerCase().trim();
        const dose = (p.dosage || '').toLowerCase();
        const isCleanMatch = (name === cleanTerm || name.startsWith(`${cleanTerm} `) || name.startsWith(`${cleanTerm}(`)) && !name.includes('+');
        return isCleanMatch && (preset.dosageFilter ? dose.includes(preset.dosageFilter) : true);
      }) || processedProducts.find(p => {
        const name = (p.productName || '').toLowerCase().trim();
        const dose = (p.dosage || '').toLowerCase();
        return name.includes(cleanTerm) && (preset.dosageFilter ? dose.includes(preset.dosageFilter) : true);
      }) || processedProducts.find(p => (p.productName || '').toLowerCase().includes(cleanTerm));

      if (match) {
        itemsToAdd[match.id] = match;
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setCartItems(prev => {
        const updated = { ...prev };
        Object.values(itemsToAdd).forEach(prod => {
          const current = updated[prod.id] || { quantity1x: 0, quantity10x: 0, product: prod };
          if (isPack10) {
            updated[prod.id] = {
              ...current,
              quantity10x: current.quantity10x + 1
            };
          } else {
            updated[prod.id] = {
              ...current,
              quantity1x: current.quantity1x + 1
            };
          }
        });
        return updated;
      });
      toast.success(`Added ${preset.name} (${addedCount} formulations${isPack10 ? ' · Pack ×10' : ''}) to request! ✓`);
    } else {
      toast.info(`Could not automatically locate items for ${preset.name}`);
    }
  }, [processedProducts]);

  const handleOrderViaWhatsApp = useCallback(() => {
    if (Object.keys(cartItems).length === 0) {
      toast.error('Please add formulations before ordering via WhatsApp');
      return;
    }

    if (typeof validateOrderForm === 'function' && !validateOrderForm()) {
      return;
    }

    const itemsListText = Object.values(cartItems).map(item => {
      const qty1x = item.quantity1x > 0 ? `${item.quantity1x}x 1x Vial` : null;
      const qty10x = item.quantity10x > 0 ? `${item.quantity10x}x Pack ×10` : null;
      const qtyStr = [qty1x, qty10x].filter(Boolean).join(', ');
      const lineTotal = (item.quantity1x * item.product.unitPrice) + (item.quantity10x * (item.product.pack10Price || item.product.unitPrice * 8.5));
      return `• ${item.product.productName} (${item.product.dosage || 'Lyophilized'}) [${qtyStr}] ── ${currencySymbol}${(lineTotal * fxRate).toFixed(2)}`;
    }).join('\n');

    const totalStr = `${formatPrice(grandTotalCartValueUsd)} (${currency})`;
    const clinicStr = orderForm.clinicName || orderForm.name ? `\nClinic: ${orderForm.clinicName || orderForm.name}` : '';
    const emailStr = orderForm.email ? `\nEmail: ${orderForm.email}` : '';
    const destinationStr = `\nDestination Corridor: ${activeShippingCorridor.flag} ${activeShippingCorridor.labelEn} (${orderForm.city ? `${orderForm.city}, ` : ''}${orderForm.country || activeShippingCorridor.defaultCountry})`;

    const message = `Hello, I would like to place this clinical peptide proforma request (Partner Code: ${referralCode || 'CAT-RX-7482'}):

${itemsListText}

Subtotal: ${formatPrice(totalCartValueUsd)}
Shipping (${activeShippingCorridor.labelEn} · Parcels ≤ 2 kg): ${currencySymbol}${shippingCostCurrentCurrency.toFixed(2)}
Grand Total: ${totalStr}${clinicStr}${emailStr}${destinationStr}

Please coordinate 24-hour proforma confirmation and secure payment link. Thank you!`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  }, [cartItems, currencySymbol, fxRate, formatPrice, grandTotalCartValueUsd, currency, orderForm, referralCode, totalCartValueUsd, shippingCostCurrentCurrency, activeShippingCorridor, validateOrderForm]);

  return {
    cartItems,
    setCartItems,
    hasRestoredCart,
    setHasRestoredCart,
    storageKey,
    updateItemQuantity,
    handleAddToCart,
    handlePrintProforma,
    totalCartCount,
    totalCartValueUsd,
    activeShippingCorridor,
    shippingCostUsd,
    shippingCostCurrentCurrency,
    grandTotalCartValueUsd,
    handleAddProtocolPreset,
    handleOrderViaWhatsApp
  };
}
