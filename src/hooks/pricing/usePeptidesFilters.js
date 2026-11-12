'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  CATEGORY_MAP,
  CATEGORY_ORDER,
  DOSAGE_STRENGTHS,
  SHIPPING_DESTINATIONS,
  FDA_FILTERS,
  resolveProductFda,
  getFdaFilterBucket,
  parseDoseNum
} from '@/constants/peptideCategories';

/**
 * usePeptidesFilters
 * Business logic hook for:
 * - URL query param synchronization (?lang=, ?currency=, ?dest=)
 * - Multi-currency conversion rates (USD, EUR, AED)
 * - Debounced search (150ms)
 * - Multi-attribute filtering (category, FDA regulatory status, dosage strength)
 * - Automated Price Drift detection for tracked partner shares
 */
export function usePeptidesFilters({
  initialProducts = [],
  initialLang = 'en',
  initialCurrency = 'USD',
  initialDest = 'EU',
  setOrderForm
}) {
  const [currency, setCurrency] = useState(initialCurrency || 'USD');
  const [shippingDest, setShippingDest] = useState(initialDest || 'EU');
  const [lang, setLang] = useState(initialLang || 'en');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFdaStatus, setSelectedFdaStatus] = useState('all');
  const [selectedStrength, setSelectedStrength] = useState('all');
  const [scopeMode, setScopeMode] = useState('filtered');
  const [priceDriftNotice, setPriceDriftNotice] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const pLang = (url.searchParams.get('lang') || '').toLowerCase();
      const resolvedLang = (pLang === 'es' || pLang === 'en') ? pLang : 'en';
      setLang(resolvedLang);

      const pCurr = (url.searchParams.get('currency') || url.searchParams.get('curr') || '').toUpperCase();
      const resolvedCurr = (pCurr === 'USD' || pCurr === 'EUR' || pCurr === 'AED') ? pCurr : 'USD';
      setCurrency(resolvedCurr);

      const pDest = (url.searchParams.get('dest') || url.searchParams.get('region') || '').toUpperCase();
      const resolvedDest = (pDest === 'EU' || pDest === 'US' || pDest === 'AE') ? pDest : 'EU';
      setShippingDest(resolvedDest);

      const trackCode = url.searchParams.get('tc') || url.searchParams.get('ref') || url.searchParams.get('code');
      if (trackCode && (trackCode.startsWith('CAT-') || trackCode.startsWith('RP-'))) {
        fetch(`/api/catalog/shares?code=${encodeURIComponent(trackCode)}`)
          .then(res => (res.ok ? res.json() : null))
          .then(data => {
            if (data?.item?.priceSnapshot) {
              const snapshot = data.item.priceSnapshot;
              let hasDrift = false;
              for (const [prodId, snapVal] of Object.entries(snapshot)) {
                const currentProd = (initialProducts || []).find(p => p.id === prodId || p.sku === prodId);
                if (currentProd) {
                  const currentPrice = currentProd.retail_price || currentProd.price || currentProd.calculatedPrice;
                  if (currentPrice && snapVal && Math.abs(currentPrice - snapVal) > 0.05) {
                    hasDrift = true;
                    break;
                  }
                }
              }
              if (hasDrift) {
                setPriceDriftNotice({
                  issuedAt: data.item.issuedAt,
                  recipientName: data.item.recipientName
                });
              }
            }
          })
          .catch(() => {});
      }

      url.searchParams.set('lang', resolvedLang);
      url.searchParams.set('currency', resolvedCurr);
      url.searchParams.set('dest', resolvedDest);
      window.history.replaceState({}, '', url.toString());
    }
  }, [initialProducts]);

  const isEs = lang === 'es';

  const activeFilterChips = useMemo(() => {
    const list = [];
    if (selectedCategory !== 'all') {
      list.push({
        key: 'category',
        label: isEs ? 'Categoría' : 'Category',
        value: isEs ? (CATEGORY_MAP[selectedCategory]?.labelEs || selectedCategory) : (CATEGORY_MAP[selectedCategory]?.labelEn || selectedCategory),
        onRemove: () => setSelectedCategory('all')
      });
    }
    if (selectedFdaStatus !== 'all') {
      const fdaMatch = FDA_FILTERS.find(f => f.id === selectedFdaStatus);
      list.push({
        key: 'fda',
        label: isEs ? 'Estatus FDA' : 'FDA Status',
        value: isEs ? (fdaMatch?.labelEs || selectedFdaStatus) : (fdaMatch?.labelEn || selectedFdaStatus),
        onRemove: () => setSelectedFdaStatus('all')
      });
    }
    if (selectedStrength !== 'all') {
      const strengthMatch = DOSAGE_STRENGTHS.find(s => s.id === selectedStrength);
      list.push({
        key: 'strength',
        label: isEs ? 'Dosis' : 'Strength',
        value: strengthMatch?.label || selectedStrength,
        onRemove: () => setSelectedStrength('all')
      });
    }
    return list;
  }, [selectedCategory, selectedFdaStatus, selectedStrength, isEs]);

  const handleLanguageChange = (nextLang) => {
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_portal_lang', nextLang);
        localStorage.setItem('atlas_catalog_lang', nextLang);
        window.dispatchEvent(new CustomEvent('atlas-language-changed', { detail: { lang: nextLang } }));
      } catch {
        // Ignore storage errors
      }
      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLang);
      url.searchParams.set('currency', currency);
      url.searchParams.set('dest', shippingDest);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleCurrencyChange = (nextCurrency) => {
    setCurrency(nextCurrency);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      url.searchParams.set('currency', nextCurrency);
      url.searchParams.set('dest', shippingDest);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleShippingDestChange = (nextDest) => {
    setShippingDest(nextDest);
    const destObj = SHIPPING_DESTINATIONS.find(d => d.id === nextDest);
    if (destObj && typeof setOrderForm === 'function') {
      setOrderForm(prev => ({
        ...prev,
        country: destObj.defaultCountry,
        phoneCountryCode: destObj.defaultPhoneCode
      }));
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      url.searchParams.set('currency', currency);
      url.searchParams.set('dest', nextDest);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    const onLangChange = (e) => {
      if (e?.detail?.lang && (e.detail.lang === 'en' || e.detail.lang === 'es')) {
        setLang(e.detail.lang);
      }
    };
    window.addEventListener('atlas-language-changed', onLangChange);
    return () => window.removeEventListener('atlas-language-changed', onLangChange);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fxRate = useMemo(() => {
    if (currency === 'EUR') return 0.92;
    if (currency === 'AED') return 3.6725;
    return 1;
  }, [currency]);

  const currencySymbol = useMemo(() => {
    if (currency === 'EUR') return '€';
    if (currency === 'AED') return 'AED ';
    return '$';
  }, [currency]);

  const formatPrice = useCallback((usdAmount) => {
    if (usdAmount == null || isNaN(usdAmount)) return '—';
    const converted = usdAmount * fxRate;
    return `${currencySymbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, [currencySymbol, fxRate]);

  const processedProducts = useMemo(() => {
    const mapped = initialProducts.map((p) => {
      const nameLower = (p.productName || '').toLowerCase();
      let categoryKey = p.primaryGoal || 'general_health';

      if (nameLower.includes('bac water') || nameLower.includes('bacteriostatic') || nameLower.includes('water') || nameLower.includes('diluent') || nameLower.includes('solvent') || nameLower.includes('saline')) {
        categoryKey = 'supplies';
      } else if (nameLower.includes('semaglutide') || nameLower.includes('tirzepatide') || nameLower.includes('retatrutide') || nameLower.includes('aod') || nameLower.includes('cagrilintide') || nameLower.includes('survodutide')) {
        categoryKey = 'metabolic';
      } else if (nameLower.includes('bpc') || nameLower.includes('tb-500') || nameLower.includes('kpv') || nameLower.includes('thymosin beta')) {
        categoryKey = 'repair';
      } else if (nameLower.includes('epithalon') || nameLower.includes('mots-c') || nameLower.includes('ss-31') || nameLower.includes('humanin') || nameLower.includes('foxo4') || nameLower.includes('nad')) {
        categoryKey = 'longevity';
      } else if (nameLower.includes('semax') || nameLower.includes('selank') || nameLower.includes('dihexa') || nameLower.includes('oxytocin') || nameLower.includes('pinealon')) {
        categoryKey = 'neuro';
      } else if (nameLower.includes('cjc') || nameLower.includes('ipamorelin') || nameLower.includes('sermorelin') || nameLower.includes('ghrp') || nameLower.includes('hexarelin') || nameLower.includes('tesamorelin')) {
        categoryKey = 'growth_hormone';
      } else if (nameLower.includes('ghk') || nameLower.includes('ahk') || nameLower.includes('snap-8')) {
        categoryKey = 'cosmetic';
      }

      const fdaStatus = resolveProductFda(p);
      const fdaBucket = getFdaFilterBucket(p);
      const meta = CATEGORY_MAP[categoryKey] || CATEGORY_MAP.general_health;

      return {
        ...p,
        categoryKey,
        categoryMeta: {
          ...meta,
          label: isEs ? meta.labelEs : meta.labelEn
        },
        fdaStatus,
        fdaBucket
      };
    });

    const sorted = [...mapped].sort((a, b) => {
      const catA = CATEGORY_ORDER.indexOf(a.categoryKey) !== -1 ? CATEGORY_ORDER.indexOf(a.categoryKey) : 99;
      const catB = CATEGORY_ORDER.indexOf(b.categoryKey) !== -1 ? CATEGORY_ORDER.indexOf(b.categoryKey) : 99;
      if (catA !== catB) return catA - catB;

      const nameA = (a.productName || '').trim();
      const nameB = (b.productName || '').trim();
      const comp = nameA.localeCompare(nameB);
      if (comp !== 0) return comp;

      return parseDoseNum(a.dosage) - parseDoseNum(b.dosage);
    });

    return sorted.map((p, idx) => ({
      ...p,
      itemNumber: idx + 1
    }));
  }, [initialProducts, isEs]);

  const filteredProducts = useMemo(() => {
    return processedProducts.filter(p => {
      const q = debouncedSearchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (p.productName || '').toLowerCase().includes(q) ||
        (p.dosage || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p.categoryMeta.label || '').toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || p.categoryKey === selectedCategory;
      const matchesFda = selectedFdaStatus === 'all' || p.fdaBucket === selectedFdaStatus;

      let matchesStrength = true;
      if (selectedStrength !== 'all') {
        const d = (p.dosage || '').toLowerCase();
        if (selectedStrength === '5mg') {
          matchesStrength = d.includes('5 mg') || d.includes('5mg') || d.includes('5.0');
        } else if (selectedStrength === '10mg') {
          matchesStrength = d.includes('10 mg') || d.includes('10mg');
        } else if (selectedStrength === '20mg_plus') {
          matchesStrength = d.includes('15') || d.includes('20') || d.includes('30') || d.includes('50') || d.includes('60') || d.includes('100');
        }
      }

      return matchesSearch && matchesCat && matchesFda && matchesStrength;
    });
  }, [processedProducts, debouncedSearchQuery, selectedCategory, selectedFdaStatus, selectedStrength]);

  return {
    lang,
    setLang,
    isEs,
    currency,
    setCurrency,
    shippingDest,
    setShippingDest,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedFdaStatus,
    setSelectedFdaStatus,
    selectedStrength,
    setSelectedStrength,
    scopeMode,
    setScopeMode,
    priceDriftNotice,
    setPriceDriftNotice,
    activeFilterChips,
    handleLanguageChange,
    handleCurrencyChange,
    handleShippingDestChange,
    fxRate,
    currencySymbol,
    formatPrice,
    processedProducts,
    filteredProducts
  };
}
