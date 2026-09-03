/**
 * hooks/data/useSharedCatalogState.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Extraído de SharedCatalogClientView.jsx (S2-D — god file split).
 *
 * Encapsula todo el estado de negocio del catálogo compartido:
 *   - Cart (localStorage persistence)
 *   - Filters (search, category, dosage, route)
 *   - Shipping selection
 *   - Currency FX
 *   - Computed cart totals
 *   - Telemetry helper
 *   - Form and share logic
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

// ── Shipping destinations ─────────────────────────────────────────────────────
export const SHIPPING_DESTINATIONS = [
  { id: 'exw',    label: 'Ex-Works (EU Hub Pickup / No Freight)', costUSD: 0,  costEUR: 0,  flag: '🏭', code: 'EXW',    leadTime: 'Immediate' },
  { id: 'eu',     label: 'European Union (Express Hub 2–4 Days)', costUSD: 40, costEUR: 36, flag: '🇪🇺', code: 'EU',     leadTime: '2–4 Days' },
  { id: 'uk_ch',  label: 'UK & Switzerland (Priority Express)',   costUSD: 50, costEUR: 45, flag: '🇬🇧', code: 'UK/CH',  leadTime: '3–5 Days' },
  { id: 'us_ca',  label: 'USA & Canada (Air Courier Express)',    costUSD: 60, costEUR: 55, flag: '🇺🇸', code: 'USA/CA', leadTime: '4–6 Days' },
  { id: 'latam',  label: 'Latin America (DHL Express Courier)',   costUSD: 75, costEUR: 68, flag: '🌎', code: 'LATAM',  leadTime: '5–8 Days' },
  { id: 'intl',   label: 'Rest of World / International Express', costUSD: 85, costEUR: 78, flag: '🌐', code: 'INTL',   leadTime: '5–9 Days' },
];

// ── Administration route keyword map ─────────────────────────────────────────
const ROUTE_MAP = {
  injectable: ['vial', 'pre-filled pen', 'pen', 'subq'],
  nasal:      ['nasal spray', 'nasal', 'spray'],
  oral:       ['capsule', 'capsules', 'tablet', 'oral'],
  topical:    ['topical', 'serum', 'gel', 'cream'],
  longevity:  ['longevity', 'anti-aging', 'regeneration', 'antiaging'],
  metabolic:  ['metabolic', 'weight', 'fat', 'glucose', 'insulin'],
};

/**
 * @param {{
 *   catalogMeta: object,
 *   products: Array,
 *   protocols: Array,
 *   currency: string,
 *   priceSource: string,
 *   includePrices: boolean,
 * }} props
 */
export function useSharedCatalogState({
  catalogMeta,
  products = [],
  protocols = [],
  currency = 'USD',
  priceSource = 'wholesaler',
  includePrices = true,
}) {
  const isProtocolCatalog = Boolean(
    catalogMeta?.docType === 'protocol' ||
    catalogMeta?.isProtocolCatalog ||
    (products.length === 0 && protocols.length > 0)
  );

  const catalogId = catalogMeta?.catalogId || 'default';

  // ── Filters ────────────────────────────────────────────────────────────────
  const [activeTab,          setActiveTab]          = useState(isProtocolCatalog ? 'protocols' : 'products');
  const [searchQuery,        setSearchQuery]        = useState('');
  const [selectedCategory,   setSelectedCategory]   = useState('all');
  const [dosageFilter,       setDosageFilter]       = useState('all');
  const [routeFilter,        setRouteFilter]        = useState('all');

  // ── Currency & Shipping ───────────────────────────────────────────────────
  const [currentCurrency,    setCurrentCurrency]    = useState(currency || 'USD');
  const [selectedShipping,   setSelectedShipping]   = useState('exw');

  // ── UI toggles ────────────────────────────────────────────────────────────
  const [expandedProducts,      setExpandedProducts]      = useState(new Set());
  const [isCartOpen,            setIsCartOpen]            = useState(false);
  const [isCheckoutModalOpen,   setIsCheckoutModalOpen]   = useState(false);
  const [copiedToast,           setCopiedToast]           = useState(false);
  const [isGeneratingPdf,       setIsGeneratingPdf]       = useState(false);
  const [isGeneratingProForma,  setIsGeneratingProForma]  = useState(false);

  // ── Cart (localStorage persistence) ──────────────────────────────────────
  const [cart, setCart] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const key = `atlas_cart_${catalogId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [cartRecoveryBanner, setCartRecoveryBanner] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const key = `atlas_cart_${catalogId}`;
      const saved = localStorage.getItem(key);
      return Boolean(saved && Object.keys(JSON.parse(saved)).length > 0);
    } catch {
      return false;
    }
  });

  // ── Checkout form ─────────────────────────────────────────────────────────
  const [checkoutForm, setCheckoutForm] = useState({
    clinicName:      catalogMeta?.recipientName || '',
    contactPerson:   '',
    vatTaxId:        '',
    deliveryAddress: '',
    cityCountry:     '',
    deliveryNotes:   '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `atlas_cart_${catalogId}`;
    const hasItems = Object.keys(cart).length > 0;
    try {
      if (hasItems) localStorage.setItem(key, JSON.stringify(cart));
      else          localStorage.removeItem(key);
    } catch (e) {
      console.warn('[useSharedCatalogState] localStorage save error:', e);
    }
  }, [cart, catalogId]);

  // ── FX & Shipping ─────────────────────────────────────────────────────────
  const fxMultiplier   = currentCurrency === 'EUR' ? 0.92 : 1;
  const currencySymbol = currentCurrency === 'EUR' ? '€' : '$';

  const activeShipping = useMemo(
    () => SHIPPING_DESTINATIONS.find(s => s.id === selectedShipping) || SHIPPING_DESTINATIONS[0],
    [selectedShipping]
  );

  const shippingCost = useMemo(
    () => currentCurrency === 'EUR' ? activeShipping.costEUR : activeShipping.costUSD,
    [activeShipping, currentCurrency]
  );

  // ── Cart computed values ───────────────────────────────────────────────────
  const cartItems = useMemo(
    () => Object.values(cart).filter(item => item.quantity > 0),
    [cart]
  );

  const cartTotalUnits = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const getItemEffectiveUnitPrice = useCallback((item) => {
    const basePrice = item.price > 0 ? item.price : 0;
    if (item.quantity >= 10 && item.tier10UnitPrice && item.tier10UnitPrice > 0) {
      return item.tier10UnitPrice;
    }
    return basePrice;
  }, []);

  const cartTotalPrice = useMemo(
    () => cartItems.reduce((sum, item) => {
      const unitRate = getItemEffectiveUnitPrice(item) * fxMultiplier;
      return sum + (item.quantity * unitRate);
    }, 0),
    [cartItems, fxMultiplier, getItemEffectiveUnitPrice]
  );

  const grandTotal = useMemo(
    () => cartTotalPrice + (cartTotalUnits > 0 ? shippingCost : 0),
    [cartTotalPrice, cartTotalUnits, shippingCost]
  );

  // ── Cart mutations ────────────────────────────────────────────────────────
  const updateQuantity = useCallback((variant, product, delta) => {
    setCart(prev => {
      const current = prev[variant.id]?.quantity || 0;
      const next    = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[variant.id];
        return copy;
      }
      return {
        ...prev,
        [variant.id]: {
          id:              variant.id,
          productName:     product.canonicalName,
          dosage:          variant.dosage,
          presentation:    variant.presentation,
          price:           variant.price > 0 ? variant.price : 0,
          tier10UnitPrice: variant.tier10UnitPrice > 0 ? variant.tier10UnitPrice : null,
          kitPrice:        variant.kitPrice > 0 ? variant.kitPrice : null,
          quantity:        next,
        },
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
    try {
      const key = `atlas_cart_${catalogId}`;
      if (typeof window !== 'undefined') localStorage.removeItem(key);
    } catch (e) {
      console.warn('[useSharedCatalogState] localStorage remove error:', e);
    }
  }, [catalogId]);

  const recipientName = catalogMeta?.recipientName || 'Client';
  const destinationCode = activeShipping?.code || 'EXW';

  // ── Telemetry ─────────────────────────────────────────────────────────────
  const sendTelemetry = useCallback((action) => {
    if (typeof window === 'undefined') return;
    fetch('/api/catalog/analytics', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        catalogId,
        action,
        recipientName,
        destination:   destinationCode,
        currency:      currentCurrency,
        cartUnits:     cartTotalUnits,
        cartTotal:     cartTotalPrice,
        itemNames:     cartItems.map(i => i.productName),
      }),
    }).catch(() => {}); // silent — never blocks UX
  }, [catalogId, recipientName, destinationCode, currentCurrency, cartTotalUnits, cartTotalPrice, cartItems]);

  // Fire view telemetry once on mount
  useEffect(() => {
    sendTelemetry('view');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ── Copy order summary ────────────────────────────────────────────────────
  const handleCopyOrderSummary = useCallback(() => {
    if (cartItems.length === 0) return;
    let text = `Official Order Inquiry (${catalogMeta?.catalogId || 'Atlas Catalog'})\n`;
    text += `Terms: ${selectedShipping === 'exw' ? 'Ex-Works (EXW)' : `DAP / Delivered (${activeShipping.flag} ${activeShipping.label})`} • Currency: ${currentCurrency}\n\n`;
    cartItems.forEach((item, idx) => {
      const itemPrice = item.price * fxMultiplier;
      text += `${idx + 1}. ${item.productName} (${item.dosage}) × ${item.quantity} units = ${currencySymbol}${(item.quantity * itemPrice).toFixed(2)}\n`;
    });
    text += `\n📦 Total Estimated Units: ${cartTotalUnits} units\n`;
    text += `🏷️ Products Subtotal (EXW): ${currencySymbol}${cartTotalPrice.toFixed(2)} ${currentCurrency}\n`;
    if (shippingCost > 0) {
      text += `✈️ Freight (${activeShipping.flag} ${activeShipping.label}): +${currencySymbol}${shippingCost.toFixed(2)} ${currentCurrency}\n`;
    }
    text += `💵 Grand Total Estimate: ${currencySymbol}${grandTotal.toFixed(2)} ${currentCurrency}\n`;

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  }, [cartItems, catalogMeta?.catalogId, selectedShipping, activeShipping, currentCurrency, fxMultiplier, currencySymbol, cartTotalUnits, cartTotalPrice, shippingCost, grandTotal]);

  // ── Filter computed values ────────────────────────────────────────────────
  const totalVariants = useMemo(
    () => products.reduce((acc, p) => acc + (p.variants?.length || 0), 0),
    [products]
  );

  const categories = useMemo(() => {
    const set = new Set();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return ['all', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat   = selectedCategory === 'all' || p.category === selectedCategory;
      const matchQuery = !searchQuery ||
        p.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.variants.some(v =>
          v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.dosage?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      let matchDosage = true;
      if (dosageFilter === 'kits') {
        matchDosage = p.variants.some(v => v.kitPrice && v.kitPrice > 0);
      } else if (dosageFilter === 'high_dose') {
        matchDosage = p.variants.some(v => {
          const doseMatch = v.dosage?.match(/(\d+(\.\d+)?)\s*mg/i);
          return doseMatch && parseFloat(doseMatch[1]) >= 10;
        });
      }

      let matchRoute = true;
      if (routeFilter !== 'all' && ROUTE_MAP[routeFilter]) {
        const keywords = ROUTE_MAP[routeFilter];
        matchRoute = p.variants.some(v => {
          const pres = (v.presentation || '').toLowerCase();
          const desc = (p.description  || '').toLowerCase();
          const cat  = (p.category     || '').toLowerCase();
          return keywords.some(k => pres.includes(k) || desc.includes(k) || cat.includes(k));
        });
      }

      return matchCat && matchQuery && matchDosage && matchRoute;
    });
  }, [products, selectedCategory, searchQuery, dosageFilter, routeFilter]);

  const filteredProtocols = useMemo(() => {
    return protocols.filter(proto => {
      const matchQuery = !searchQuery ||
        proto.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proto.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proto.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [protocols, searchQuery]);

  const toggleExpand = useCallback((productId) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else                     next.add(productId);
      return next;
    });
  }, []);

  // ── Price tier label ──────────────────────────────────────────────────────
  const priceTierLabel = includePrices
    ? ({
        cost:        'Supplier Master Cost Tier',
        wholesaler:  'Wholesale / B2B Distribution Tier',
        wholeseller: 'Wholesale / B2B Distribution Tier', // legacy alias
        clinic:      'Clinical / Healthcare Provider Tier',
        retail:      'Retail / MSRP Recommended Tier',
      }[priceSource] || 'Official Commercial Tier')
    : 'Clinical Vademecum (Unpriced Portfolio)';

  // ── WhatsApp checkout handler ─────────────────────────────────────────────
  const handleConfirmWhatsApp = useCallback(() => {
    const phone      = (catalogMeta?.accountManagerPhone || catalogMeta?.phone || '').replace(/[^\d]/g, '');
    const cId        = catalogMeta?.catalogId || 'Atlas Catalog';
    const manager    = catalogMeta?.accountManagerName || 'Atlas Commercial Desk';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    let msg = `Hello ${manager},\n\nI am placing a formal inquiry from the official portfolio (Ref: ${cId}).\n\n`;

    if (checkoutForm.clinicName || checkoutForm.contactPerson) {
      msg += `🏥 *CLINIC / CLIENT DETAILS*:\n`;
      if (checkoutForm.clinicName)     msg += `• *Clinic*: ${checkoutForm.clinicName}\n`;
      if (checkoutForm.contactPerson)  msg += `• *Contact*: ${checkoutForm.contactPerson}\n`;
      if (checkoutForm.vatTaxId)       msg += `• *VAT/Tax ID*: ${checkoutForm.vatTaxId}\n`;
      if (checkoutForm.deliveryAddress || checkoutForm.cityCountry)
        msg += `• *Delivery Address*: ${checkoutForm.deliveryAddress}${checkoutForm.cityCountry ? `, ${checkoutForm.cityCountry}` : ''}\n`;
      if (checkoutForm.deliveryNotes)  msg += `• *Delivery Instructions*: ${checkoutForm.deliveryNotes}\n`;
      msg += `\n`;
    }

    if (cartItems.length > 0) {
      msg += `📋 *ORDER SPECIFICATION*:\n`;
      cartItems.forEach((item, idx) => {
        const isBulk        = item.quantity >= 10 && item.tier10UnitPrice && item.tier10UnitPrice > 0;
        const itemUnitPrice = (isBulk ? item.tier10UnitPrice : item.price) * fxMultiplier;
        msg += `${idx + 1}. ${item.productName} (${item.dosage}) × ${item.quantity} units = ${currencySymbol}${(item.quantity * itemUnitPrice).toFixed(2)} ${currentCurrency}${isBulk ? ' (10+ Volume Rate)' : ''}\n`;
      });
      msg += `\n📦 *Total Estimated Units*: ${cartTotalUnits} units\n`;
      msg += `🏷️ *Products Subtotal (EXW)*: ${currencySymbol}${cartTotalPrice.toFixed(2)} ${currentCurrency}\n`;
      if (shippingCost > 0) {
        msg += `✈️ *Freight Destination*: ${activeShipping.flag} ${activeShipping.label} (+${currencySymbol}${shippingCost.toFixed(2)} ${currentCurrency})\n`;
      } else {
        msg += `🏭 *Dispatch*: Ex-Works Pickup (EXW $0)\n`;
      }
      msg += `💵 *Grand Total Estimate*: ${currencySymbol}${grandTotal.toFixed(2)} ${currentCurrency}\n\n`;
      msg += `Please confirm batch release, pro-forma confirmation, and payment details.\n`;
    } else {
      msg += `I would like to request availability and discuss an order under ${selectedShipping === 'exw' ? 'Ex-Works (EXW)' : `DAP (${activeShipping.flag} ${activeShipping.label})`} terms.\n`;
    }

    if (currentUrl) msg += `\n🔗 *Catalog Access Link*:\n${currentUrl}\n`;
    msg += `\nThank you!`;

    const waUrl = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    sendTelemetry('open_whatsapp');
    setIsCheckoutModalOpen(false);
  }, [catalogMeta, checkoutForm, cartItems, fxMultiplier, currencySymbol, currentCurrency, cartTotalUnits, cartTotalPrice, shippingCost, activeShipping, grandTotal, selectedShipping, sendTelemetry]);

  return {
    // Filter state
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    selectedCategory, setSelectedCategory,
    dosageFilter, setDosageFilter,
    routeFilter, setRouteFilter,

    // Shipping & currency
    currentCurrency, setCurrentCurrency,
    selectedShipping, setSelectedShipping,
    activeShipping,
    shippingCost,
    fxMultiplier,
    currencySymbol,

    // UI state
    expandedProducts, toggleExpand,
    isCartOpen, setIsCartOpen,
    isCheckoutModalOpen, setIsCheckoutModalOpen,
    copiedToast,
    cartRecoveryBanner, setCartRecoveryBanner,
    isGeneratingPdf,
    isGeneratingProForma,
    checkoutForm, setCheckoutForm,

    // Cart
    cart,
    cartItems,
    cartTotalUnits,
    cartTotalPrice,
    grandTotal,
    getItemEffectiveUnitPrice,
    updateQuantity,
    clearCart,

    // Filters
    categories,
    filteredProducts,
    filteredProtocols,
    totalVariants,

    // Labels
    priceTierLabel,

    // Handlers
    sendTelemetry,
    handleCopyOrderSummary,
    handleConfirmWhatsApp,
    isProtocolCatalog,

    // PDF generation state setters (kept in view to avoid dynamic import coupling)
    setIsGeneratingPdf,
    setIsGeneratingProForma,
  };
}
