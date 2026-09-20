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

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { sortVariantsAscending } from '@/utils/variantSorter';
import { GOAL_TYPES, VALID_GOALS, GOAL_LABELS } from '@/constants/goalTypes';
import { searchAlgolia } from '@/services/algoliaSearch';

/**
 * Reads a URL search param safely (client-side only, SSR returns default).
 */
function getUrlParam(key, fallback = '') {
  if (typeof window === 'undefined') return fallback;
  try {
    return new URLSearchParams(window.location.search).get(key) || fallback;
  } catch { return fallback; }
}

/**
 * Writes filter state back to the URL using replaceState (no re-render/router hop).
 * Keys with default values are removed from the URL to keep links clean.
 */
function syncFiltersToUrl(filters) {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const set = (k, v, def) => v && v !== def ? params.set(k, v) : params.delete(k);
    set('q',     filters.searchQuery,  '');
    set('goals', filters.selectedGoals.join(','), '');
    set('fmt',   filters.packagingMode, 'all');
    set('dose',  filters.dosageFilter,  'all');
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  } catch { /* non-blocking */ }
}

// ── Shipping destinations ─────────────────────────────────────────────────────
export const SHIPPING_DESTINATIONS = [
  { id: 'eu',     label: 'European Union (Express Courier 2–4 Days)',     costUSD: 78,  costEUR: 70,  costAED: 285, flag: '🇪🇺', code: 'EU',     leadTime: '2–4 Days' },
  { id: 'uk_ch',  label: 'UK & Switzerland (Priority Courier 3–5 Days)',  costUSD: 95,  costEUR: 85,  costAED: 350, flag: '🇬🇧', code: 'UK/CH',  leadTime: '3–5 Days' },
  { id: 'us_ca',  label: 'USA & Canada (Direct Courier 4–6 Days)',        costUSD: 115, costEUR: 105, costAED: 420, flag: '🇺🇸', code: 'USA/CA', leadTime: '4–6 Days' },
  { id: 'gcc',    label: 'GCC & Middle East (Express Courier UAE/KSA)',   costUSD: 110, costEUR: 100, costAED: 400, flag: '🇦🇪', code: 'GCC',    leadTime: '3–5 Days' },
  { id: 'latam',  label: 'Latin America (DHL Express)',                   costUSD: 145, costEUR: 130, costAED: 530, flag: '🌎', code: 'LATAM',  leadTime: '5–8 Days' },
  { id: 'intl',   label: 'Rest of World (Global Priority Express)',       costUSD: 165, costEUR: 150, costAED: 600, flag: '🌐', code: 'INTL',   leadTime: '5–9 Days' },
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
 * Resolves canonical clinical/wellness goals for any product or protocol.
 */
export function resolveProductCanonicalGoals(product) {
  if (!product) return [GOAL_TYPES.GENERAL_HEALTH];
  const goals = new Set();
  
  if (Array.isArray(product.canonicalGoals) && product.canonicalGoals.length > 0) {
    product.canonicalGoals.forEach(g => {
      const norm = String(g).toLowerCase().trim().replace(/[-\s]/g, '_');
      if (VALID_GOALS.has(norm)) goals.add(norm);
    });
  }
  if (Array.isArray(product.goals) && product.goals.length > 0) {
    product.goals.forEach(g => {
      const norm = String(g).toLowerCase().trim().replace(/[-\s]/g, '_');
      if (VALID_GOALS.has(norm)) goals.add(norm);
      else if (norm.includes('aging') || norm.includes('longevity')) goals.add(GOAL_TYPES.ANTI_AGING);
      else if (norm.includes('fat') || norm.includes('weight') || norm.includes('metabolic')) goals.add(GOAL_TYPES.FAT_LOSS);
      else if (norm.includes('repair') || norm.includes('recovery') || norm.includes('tissue') || norm.includes('injury')) goals.add(GOAL_TYPES.TISSUE_REPAIR);
      else if (norm.includes('cognit') || norm.includes('neuro') || norm.includes('focus') || norm.includes('sleep') || norm.includes('mood')) goals.add(GOAL_TYPES.COGNITIVE);
      else if (norm.includes('muscle') || norm.includes('growth') || norm.includes('hypertrophy') || norm.includes('gh')) goals.add(GOAL_TYPES.MUSCLE_GROWTH);
      else if (norm.includes('libido') || norm.includes('sexual') || norm.includes('hormon')) goals.add(GOAL_TYPES.LIBIDO_WELLNESS);
      else if (norm.includes('immune') || norm.includes('health') || norm.includes('wellness') || norm.includes('suppl')) goals.add(GOAL_TYPES.GENERAL_HEALTH);
    });
  }
  if (product.goal || product.primary_goal) {
    const norm = String(product.goal || product.primary_goal).toLowerCase().trim().replace(/[-\s]/g, '_');
    if (VALID_GOALS.has(norm)) goals.add(norm);
    else if (norm.includes('aging') || norm.includes('longevity')) goals.add(GOAL_TYPES.ANTI_AGING);
    else if (norm.includes('fat') || norm.includes('weight') || norm.includes('metabolic')) goals.add(GOAL_TYPES.FAT_LOSS);
    else if (norm.includes('repair') || norm.includes('recovery')) goals.add(GOAL_TYPES.TISSUE_REPAIR);
    else if (norm.includes('cognit') || norm.includes('neuro') || norm.includes('sleep')) goals.add(GOAL_TYPES.COGNITIVE);
    else if (norm.includes('muscle') || norm.includes('growth')) goals.add(GOAL_TYPES.MUSCLE_GROWTH);
    else if (norm.includes('libido') || norm.includes('sexual')) goals.add(GOAL_TYPES.LIBIDO_WELLNESS);
    else if (norm.includes('immune') || norm.includes('health')) goals.add(GOAL_TYPES.GENERAL_HEALTH);
  }
  if (goals.size === 0) {
    const cat = String(product.category || '').toLowerCase();
    const name = String(product.canonicalName || product.name || product.title || '').toLowerCase();
    if (cat.includes('weight') || name.includes('semaglutide') || name.includes('tirzepatide') || name.includes('retatrutide') || name.includes('aod') || name.includes('5-amino')) {
      goals.add(GOAL_TYPES.FAT_LOSS);
    } else if (cat.includes('longevity') || cat.includes('nutricosmetic') || name.includes('epitalon') || name.includes('nad') || name.includes('ghk')) {
      goals.add(GOAL_TYPES.ANTI_AGING);
    } else if (name.includes('bpc') || name.includes('tb-500') || name.includes('tb4') || name.includes('kpv')) {
      goals.add(GOAL_TYPES.TISSUE_REPAIR);
    } else if (name.includes('cjc') || name.includes('ipamorelin') || name.includes('sermorelin') || name.includes('tesamorelin') || name.includes('mk-677') || name.includes('hexarelin') || name.includes('igf')) {
      goals.add(GOAL_TYPES.MUSCLE_GROWTH);
    } else if (name.includes('selank') || name.includes('semax') || name.includes('dihexa') || name.includes('dsip')) {
      goals.add(GOAL_TYPES.COGNITIVE);
    } else if (name.includes('pt-141') || name.includes('kisspeptin') || name.includes('oxytocin')) {
      goals.add(GOAL_TYPES.LIBIDO_WELLNESS);
    } else {
      goals.add(GOAL_TYPES.GENERAL_HEALTH);
    }
  }
  return Array.from(goals);
}

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

  // ── Filters — initialized from URL params if present ──────────────────────
  const [activeTab,     setActiveTab]     = useState(isProtocolCatalog ? 'protocols' : 'products');
  const [searchQuery,   setSearchQuery]   = useState(() => getUrlParam('q', ''));
  const [selectedGoals, setSelectedGoals] = useState(() => {
    const raw = getUrlParam('goals', '');
    if (!raw) return [];
    return raw.split(',').filter(g => VALID_GOALS.has(g));
  });
  const [dosageFilter,  setDosageFilter]  = useState(() => getUrlParam('dose', 'all'));
  const [routeFilter,   setRouteFilter]   = useState('all');
  const [packagingMode, setPackagingMode] = useState(() => getUrlParam('fmt', 'all'));

  // ── Sync filter changes back to URL (debounced, non-blocking) ─────────────
  const syncTimerRef = useRef(null);
  useEffect(() => {
    clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncFiltersToUrl({ searchQuery, selectedGoals, packagingMode, dosageFilter });
    }, 400);
    return () => clearTimeout(syncTimerRef.current);
  }, [searchQuery, selectedGoals, packagingMode, dosageFilter]);

  // Algolia Instant Search integration with typo-tolerance & clinical synonyms
  const [algoliaMatchProductIds, setAlgoliaMatchProductIds] = useState(null);
  const [algoliaMatchProtoIds,   setAlgoliaMatchProtoIds]   = useState(null);
  const [isSearchingAlgolia,     setIsSearchingAlgolia]     = useState(false);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setAlgoliaMatchProductIds(null);
      setAlgoliaMatchProtoIds(null);
      setIsSearchingAlgolia(false);
      return;
    }

    let active = true;
    setIsSearchingAlgolia(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchAlgolia(q, { distinct: false, hitsPerPage: 40 });
        if (!active) return;
        if (res?.products?.length > 0 || res?.protocols?.length > 0) {
          const prodIds = new Set();
          res.products.forEach(p => {
            if (p.objectID) prodIds.add(String(p.objectID).toLowerCase());
            if (p.id) prodIds.add(String(p.id).toLowerCase());
            if (p.slug) prodIds.add(String(p.slug).toLowerCase());
            if (p.canonicalName) prodIds.add(String(p.canonicalName).toLowerCase());
          });
          const protoIds = new Set();
          res.protocols?.forEach(pr => {
            if (pr.objectID) protoIds.add(String(pr.objectID).toLowerCase());
            if (pr.id) protoIds.add(String(pr.id).toLowerCase());
            if (pr.slug) protoIds.add(String(pr.slug).toLowerCase());
          });
          setAlgoliaMatchProductIds(prodIds);
          setAlgoliaMatchProtoIds(protoIds);
        } else {
          setAlgoliaMatchProductIds(null);
          setAlgoliaMatchProtoIds(null);
        }
      } catch (err) {
        if (active) {
          setAlgoliaMatchProductIds(null);
          setAlgoliaMatchProtoIds(null);
        }
      } finally {
        if (active) setIsSearchingAlgolia(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Backward compatibility: selectedGoal is single string or 'all'
  const selectedGoal = selectedGoals.length === 1 ? selectedGoals[0] : (selectedGoals.length === 0 ? 'all' : selectedGoals[0]);
  const setSelectedGoal = useCallback((goalOrGoals) => {
    if (!goalOrGoals || goalOrGoals === 'all') {
      setSelectedGoals([]);
    } else if (Array.isArray(goalOrGoals)) {
      setSelectedGoals(goalOrGoals);
    } else {
      setSelectedGoals([goalOrGoals]);
    }
  }, []);

  const toggleGoal = useCallback((goalId) => {
    if (!goalId || goalId === 'all') {
      setSelectedGoals([]);
      return;
    }
    setSelectedGoals(prev =>
      prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
    );
  }, []);

  const clearGoals = useCallback(() => {
    setSelectedGoals([]);
  }, []);

  // Alias for backward compatibility
  const selectedCategory = selectedGoal;
  const setSelectedCategory = setSelectedGoal;

  // ── Currency & Shipping ───────────────────────────────────────────────────
  const [currentCurrency,    setCurrentCurrency]    = useState(currency || 'USD');
  const [selectedShipping,   setSelectedShipping]   = useState('eu');

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
  const getCleanClinicName = () => {
    const raw = catalogMeta?.recipientName || catalogMeta?.clientName || '';
    const lower = raw.toLowerCase();
    if (
      !raw ||
      lower.includes('lotusland') ||
      lower.includes('regenpept') ||
      lower.includes('valued partner') ||
      lower.includes('healthcare provider') ||
      lower.includes('client')
    ) {
      return '';
    }
    return raw;
  };

  const [checkoutForm, setCheckoutForm] = useState({
    clinicName:      getCleanClinicName(),
    contactPerson:   catalogMeta?.recipientContact || catalogMeta?.contactPerson || catalogMeta?.contactName || '',
    email:           catalogMeta?.recipientEmail || catalogMeta?.clientEmail || '',
    phone:           catalogMeta?.recipientPhone || catalogMeta?.clientPhone || '',
    vatTaxId:        catalogMeta?.vatTaxId || catalogMeta?.taxId || '',
    deliveryAddress: catalogMeta?.deliveryAddress || catalogMeta?.shippingAddress || '',
    cityCountry:     catalogMeta?.cityCountry || catalogMeta?.country || '',
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
  const fxMultiplier   = currentCurrency === 'EUR' ? 0.92 : currentCurrency === 'AED' ? 3.6725 : 1;
  const currencySymbol = currentCurrency === 'EUR' ? '€' : currentCurrency === 'AED' ? 'AED ' : '$';

  const activeShipping = useMemo(
    () => SHIPPING_DESTINATIONS.find(s => s.id === selectedShipping) || SHIPPING_DESTINATIONS[0],
    [selectedShipping]
  );

  const shippingCost = useMemo(
    () => currentCurrency === 'EUR' ? activeShipping.costEUR
        : currentCurrency === 'AED' ? (activeShipping.costAED || Math.round(activeShipping.costUSD * 3.6725))
        : activeShipping.costUSD,
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
    let text = `Order Inquiry (${catalogMeta?.catalogId || 'Atlas Catalog'})\n`;
    text += `Terms: DAP / Delivered (${activeShipping.flag} ${activeShipping.label}) • Currency: ${currentCurrency}\n\n`;
    cartItems.forEach((item, idx) => {
      const itemPrice = item.price * fxMultiplier;
      text += `${idx + 1}. ${item.productName} (${item.dosage}) × ${item.quantity} units = ${currencySymbol}${(item.quantity * itemPrice).toFixed(2)}\n`;
    });
    text += `\n📦 Total Estimated Units: ${cartTotalUnits} units\n`;
    text += `🏷️ Products Subtotal: ${currencySymbol}${cartTotalPrice.toFixed(2)} ${currentCurrency}\n`;
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

  // ── Enriched Products with Canonical Clinical Goals ───────────────────────
  const enrichedProducts = useMemo(() => {
    return products.map(p => ({
      ...p,
      canonicalGoals: resolveProductCanonicalGoals(p),
    }));
  }, [products]);

  const availableGoals = useMemo(() => {
    return Object.entries(GOAL_LABELS).map(([id, label]) => {
      const count = enrichedProducts.filter(p => p.canonicalGoals.includes(id)).length;
      return { id, label, count };
    }).filter(g => g.count > 0);
  }, [enrichedProducts]);

  const categories = useMemo(() => {
    return ['all', ...availableGoals.map(g => g.id)];
  }, [availableGoals]);

  const filteredProducts = useMemo(() => {
    return enrichedProducts
      .filter(p => {
        const matchGoal = selectedGoals.length === 0 || selectedGoals.some(g => p.canonicalGoals.includes(g));
        const cleanQuery = searchQuery.trim().toLowerCase();
        
        const isAlgoliaMatch = algoliaMatchProductIds && (
          (p.id && algoliaMatchProductIds.has(String(p.id).toLowerCase())) ||
          (p.slug && algoliaMatchProductIds.has(String(p.slug).toLowerCase())) ||
          (p.canonicalName && algoliaMatchProductIds.has(String(p.canonicalName).toLowerCase())) ||
          p.variants.some(v => v.id && algoliaMatchProductIds.has(String(v.id).toLowerCase()))
        );

        const matchQuery = !cleanQuery ||
          isAlgoliaMatch ||
          (p.canonicalName && p.canonicalName.toLowerCase().includes(cleanQuery)) ||
          (p.name && p.name.toLowerCase().includes(cleanQuery)) ||
          (p.description && p.description.toLowerCase().includes(cleanQuery)) ||
          p.variants.some(v =>
            (v.name && v.name.toLowerCase().includes(cleanQuery)) ||
            (v.dosage && v.dosage.toLowerCase().includes(cleanQuery))
          );

        let matchPackaging = true;
        if (packagingMode === 'kits' || dosageFilter === 'kits') {
          matchPackaging = p.variants.some(v => v.kitPrice && v.kitPrice > 0);
        }

        let matchDosage = true;
        if (dosageFilter === 'high_dose') {
          matchDosage = p.variants.some(v => {
            const textToMatch = `${v.dosage || ''} ${v.name || ''}`;
            const doseMatch = textToMatch.match(/(\d+(\.\d+)?)\s*mg/i);
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

        return matchGoal && matchQuery && matchPackaging && matchDosage && matchRoute;
      })
      .map(p => {
        let activeVariants = p.variants || [];

        // When High Dose filter is active, only show variants >= 10mg
        if (dosageFilter === 'high_dose') {
          activeVariants = activeVariants.filter(v => {
            const textToMatch = `${v.dosage || ''} ${v.name || ''}`;
            const doseMatch = textToMatch.match(/(\d+(\.\d+)?)\s*mg/i);
            return doseMatch && parseFloat(doseMatch[1]) >= 10;
          });
        }

        // When kits packaging mode is selected, only show variants with kit pricing
        if (packagingMode === 'kits' || dosageFilter === 'kits') {
          activeVariants = activeVariants.filter(v => v.kitPrice && v.kitPrice > 0);
        }

        // When route filter is active, only show variants matching the administration route
        if (routeFilter !== 'all' && ROUTE_MAP[routeFilter]) {
          const keywords = ROUTE_MAP[routeFilter];
          activeVariants = activeVariants.filter(v => {
            const pres = (v.presentation || '').toLowerCase();
            const vName = (v.name || '').toLowerCase();
            const desc = (p.description  || '').toLowerCase();
            const cat  = (p.category     || '').toLowerCase();
            return keywords.some(k => pres.includes(k) || vName.includes(k) || desc.includes(k) || cat.includes(k));
          });
        }

        const sortedVariants = sortVariantsAscending(activeVariants);
        const validPrices = sortedVariants.map(v => v.price > 0 ? v.price : null).filter(Boolean);
        const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : p.minPrice;
        return {
          ...p,
          minPrice: minPrice > 0 ? minPrice : p.minPrice,
          variants: sortedVariants
        };
      })
      .filter(p => (p.variants && p.variants.length > 0));
  }, [enrichedProducts, selectedGoals, searchQuery, dosageFilter, packagingMode, routeFilter, algoliaMatchProductIds]);

  const filteredProtocols = useMemo(() => {
    return protocols.filter(proto => {
      const protoGoals = resolveProductCanonicalGoals(proto);
      const matchGoal = selectedGoals.length === 0 || selectedGoals.some(g => protoGoals.includes(g));
      
      const isAlgoliaMatch = algoliaMatchProtoIds && (
        (proto.id && algoliaMatchProtoIds.has(String(proto.id).toLowerCase())) ||
        (proto.slug && algoliaMatchProtoIds.has(String(proto.slug).toLowerCase()))
      );

      const matchQuery = !searchQuery ||
        isAlgoliaMatch ||
        proto.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proto.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proto.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGoal && matchQuery;
    });
  }, [protocols, searchQuery, selectedGoals, algoliaMatchProtoIds]);


  const toggleExpand = useCallback((productId) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else                     next.add(productId);
      return next;
    });
  }, []);

  // ── Subtle institutional price tier label (no cost or internal margin exposure) ──
  const priceTierLabel = includePrices
    ? ({
        cost:        'Institutional Direct',
        wholesaler:  'Wholesale Portfolio',
        wholeseller: 'Wholesale Portfolio',
        clinic:      'Clinical Healthcare Provider',
        retail:      'Reference Portfolio (MSRP)',
      }[priceSource] || 'Verified Institutional Terms')
    : 'Clinical Vademecum (Reference Portfolio)';

  // ── WhatsApp checkout handler ─────────────────────────────────────────────
  const handleConfirmWhatsApp = useCallback(() => {
    const phone      = (catalogMeta?.accountManagerPhone || catalogMeta?.phone || '').replace(/[^\d]/g, '');
    const cId        = catalogMeta?.catalogId || 'Atlas Catalog';
    const manager    = catalogMeta?.accountManagerName || 'Atlas Commercial Desk';
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    let msg = `Hello ${manager},\n\nI am placing a formal inquiry from the clinical portfolio (Ref: ${cId}).\n\n`;

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
      msg += `🏷️ *Products Subtotal*: ${currencySymbol}${cartTotalPrice.toFixed(2)} ${currentCurrency}\n`;
      if (shippingCost > 0) {
        msg += `✈️ *Freight Destination*: ${activeShipping.flag} ${activeShipping.label} (+${currencySymbol}${shippingCost.toFixed(2)} ${currentCurrency})\n`;
      }
      msg += `💵 *Grand Total Estimate*: ${currencySymbol}${grandTotal.toFixed(2)} ${currentCurrency}\n\n`;
      msg += `Please confirm batch release, pro-forma confirmation, and payment details.\n`;
    } else {
      msg += `I would like to request availability and discuss an order under DAP (${activeShipping.flag} ${activeShipping.label}) terms.\n`;
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
    isSearchingAlgolia,
    selectedGoal, setSelectedGoal,
    selectedGoals, setSelectedGoals,
    toggleGoal, clearGoals,
    availableGoals,
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
    packagingMode,
    setPackagingMode,

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
