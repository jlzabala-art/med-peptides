'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText,
  Share2,
  Check,
  CheckCircle2,
  Eye,
  Mail,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import PublicInstitutionalInquiryDrawer from '@/components/shared/PublicInstitutionalInquiryDrawer';
import ClinicalProtocolDrawer from '@/components/pricing/ClinicalProtocolDrawer';
import AtlasAiCopilotDrawer from '@/components/pricing/AtlasAiCopilotDrawer';
import PeptideSpecsDrawer from '@/components/pricing/PeptideSpecsDrawer';
import PeptidePricePdfPreviewModal from '@/components/pricing/PeptidePricePdfPreviewModal';

// Extracted Domain Constants
import {
  CATEGORY_MAP,
  CATEGORY_ORDER,
  DOSAGE_STRENGTHS,
  SHIPPING_DESTINATIONS,
  FDA_FILTERS,
  getCategoryIcon,
  resolveProductFda,
  getFdaFilterBucket,
  parseDoseNum
} from '@/constants/peptideCategories';

// Extracted UI Components
import PeptideMobileCard from '@/components/pricing/peptides/PeptideMobileCard';
import PeptidesTopAppBar from '@/components/pricing/peptides/PeptidesTopAppBar';
import PeptidesFilterToolbar from '@/components/pricing/peptides/PeptidesFilterToolbar';
import PeptidesKpiSummaryBar from '@/components/pricing/peptides/PeptidesKpiSummaryBar';
import PeptidesNavDrawer from '@/components/pricing/peptides/PeptidesNavDrawer';
import PeptidesFilterSheets from '@/components/pricing/peptides/PeptidesFilterSheets';
import PeptidesOrderDrawer from '@/components/pricing/peptides/PeptidesOrderDrawer';
import PeptidesBottomCartDock from '@/components/pricing/peptides/PeptidesBottomCartDock';
import { getPeptidesColumns, renderPeptideClinicalDetail } from '@/components/pricing/peptides/PeptidesTableColumns';

import '../colway/ColwayPriceList.css';

export default function PeptidesPriceListClient({
  initialProducts = [],
  referralCode = 'CAT-RX-7482',
  isDistributor = false,
  initialLang = 'en',
  initialCurrency = 'USD',
  initialDest = 'EU',
  trackingCode = null
}) {
  const [currency, setCurrency] = useState(initialCurrency || 'USD'); // USD, EUR, AED
  const [shippingDest, setShippingDest] = useState(initialDest || 'EU'); // EU (€60), US ($25), AE ($80)
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFdaStatus, setSelectedFdaStatus] = useState('all');
  const [selectedStrength, setSelectedStrength] = useState('all'); // 'all' | '5mg' | '10mg' | '20mg_plus'
  const [scopeMode, setScopeMode] = useState('filtered'); // 'filtered' | 'global' (Scope Switcher per Golden Rule #22)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Collapsible filter sidebar for 100% desktop width
  const [copied, setCopied] = useState(false);
  const [hasRestoredCart, setHasRestoredCart] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [selectedSpecsProduct, setSelectedSpecsProduct] = useState(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [isAtlasAiOpen, setIsAtlasAiOpen] = useState(false);
  const [aiContextProduct, setAiContextProduct] = useState(null);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);
  const [inquiryProductContext, setInquiryProductContext] = useState(null);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [isFdaSheetOpen, setIsFdaSheetOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isMobileMoreMenuOpen, setIsMobileMoreMenuOpen] = useState(false);
  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false);
  const [trackingCodeState] = useState(trackingCode);
  const [priceDriftNotice, setPriceDriftNotice] = useState(null);
  const [isMobileKpiExpanded, setIsMobileKpiExpanded] = useState(false);

  // Strict English default ('en') unless ?lang=es is explicitly in the URL or selected via top button
  const [lang, setLang] = useState(initialLang || 'en');

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

      // Price Drift check for tracked B2B shared links
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

      // Always ensure ?lang= & ?currency= & ?dest= are explicitly visible in the browser URL
      url.searchParams.set('lang', resolvedLang);
      url.searchParams.set('currency', resolvedCurr);
      url.searchParams.set('dest', resolvedDest);
      window.history.replaceState({}, '', url.toString());
    }
  }, [initialProducts]);

  const isEs = lang === 'es';

  // Active filter chips structured for Google Cloud Standard <GlobalSearchBar>
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
        // Ignore storage errors in restricted contexts
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
    if (destObj) {
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

  // Debounce search query to keep main thread at 60fps on mobile (150ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Order Drawer State
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [cartItems, setCartItems] = useState({});
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [, setFormErrors] = useState({});
  const [submittedOrderData, setSubmittedOrderData] = useState(null);
  const [isLookingUpUser, setIsLookingUpUser] = useState(false);
  const [lookupUserResult, setLookupUserResult] = useState(null);

  const authContext = useAuth?.() || {};
  const authUser = authContext?.user || null;
  const authProfile = authContext?.userProfile || null;
  const authRole = authContext?.activeRole || authProfile?.role || null;

  const handleLogout = async () => {
    try {
      if (authContext?.logout) {
        await authContext.logout();
      }
      toast.success(isEs ? 'Sesión cerrada correctamente' : 'Logged out successfully');
      window.location.reload();
    } catch (err) {
      console.warn('[logout]', err);
      window.location.href = '/login';
    }
  };

  const getUserInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'U';
  };

  const effectiveDisplayName = authProfile?.fullName || authProfile?.displayName || authProfile?.name || authUser?.displayName || (authUser?.email ? authUser.email.split('@')[0] : 'User');
  const effectiveInitials = getUserInitials(effectiveDisplayName, authUser?.email);
  const effectiveRoleLabel = authRole === 'admin'
    ? 'ADMIN PORTAL'
    : (authRole === 'doctor' || authRole === 'clinic' ? 'CLINICAL PORTAL' : (authRole === 'wholeseller' ? 'WHOLESALER B2B' : (authRole ? `${authRole.toUpperCase()} PORTAL` : 'CLIENT B2B')));
  const avatarBgColor = authRole === 'admin' ? '#16a34a' : (authRole === 'doctor' || authRole === 'clinic' ? '#0d9488' : '#003666');

  const [orderForm, setOrderForm] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    phoneCountryCode: 'es',
    country: 'Spain',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
    company_fax: '' // Anti-spam Honeypot
  });

  // Autofill form if user is already authenticated
  useEffect(() => {
    if (authUser && !orderForm.email) {
      setOrderForm(prev => ({
        ...prev,
        email: authUser.email || '',
        name: prev.name || authProfile?.name || authUser.displayName || '',
        clinicName: prev.clinicName || authProfile?.clinicName || '',
        phone: prev.phone || authProfile?.phone || ''
      }));
    }
  }, [authUser, authProfile]);

  const handleEmailLookup = async (rawEmail) => {
    if (!rawEmail || !rawEmail.includes('@') || rawEmail.length < 5) return;
    setIsLookingUpUser(true);
    try {
      const res = await fetch(`/api/users/lookup?email=${encodeURIComponent(rawEmail.trim())}`);
      const data = await res.json();
      if (data?.found && data.user) {
        setLookupUserResult(data.user);
        setOrderForm(prev => ({
          ...prev,
          name: prev.name || data.user.name || '',
          clinicName: prev.clinicName || data.user.clinicName || '',
          phone: prev.phone || data.user.phone || '',
          country: data.user.country || prev.country,
          addressLine1: prev.addressLine1 || data.user.addressLine1 || '',
          city: prev.city || data.user.city || '',
          state: prev.state || data.user.state || '',
          postalCode: prev.postalCode || data.user.postalCode || ''
        }));
      } else {
        setLookupUserResult(null);
      }
    } catch (err) {
      console.warn('[handleEmailLookup] Lookup error:', err);
    } finally {
      setIsLookingUpUser(false);
    }
  };

  // Field Validator
  const validateOrderForm = useCallback(() => {
    const errors = {};
    if (!orderForm.name || orderForm.name.trim().length < 2) {
      errors.name = 'Contact name is required.';
    }
    if (!orderForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email.trim())) {
      errors.email = 'Valid work email required (e.g. doctor@clinic.com).';
    }
    const phoneDigits = (orderForm.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      errors.phone = 'Valid international phone with country code required.';
    }
    if (!orderForm.country || !orderForm.country.trim()) {
      errors.country = 'Destination country is required.';
    }
    if (!orderForm.addressLine1 || orderForm.addressLine1.trim().length < 4) {
      errors.addressLine1 = 'Street address line 1 is required.';
    }
    if (!orderForm.city || orderForm.city.trim().length < 2) {
      errors.city = 'City is required.';
    }
    if (!orderForm.postalCode || orderForm.postalCode.trim().length < 2) {
      errors.postalCode = 'Postal / ZIP code is required.';
    }

    setFormErrors(errors);

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const el = document.getElementById(`order-field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { el.focus(); } catch { /* not focusable */ }
      }
      toast.error('Please complete all required fields (marked with *).');
      return false;
    }
    return true;
  }, [orderForm]);

  const storageKey = `atlas_peptides_b2b_cart_${referralCode || 'CAT-RX-7482'}`;

  // Persist current tier & referral to localStorage
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

  // Hydrate cart & contact on initial mount
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
        const savedContact = localStorage.getItem('atlas_peptides_b2b_contact');
        if (savedContact) {
          const parsedContact = JSON.parse(savedContact);
          if (parsedContact && typeof parsedContact === 'object') {
            setOrderForm(prev => ({ ...prev, ...parsedContact, company_fax: '' }));
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

  // Sync contact info to localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const toSave = { ...orderForm };
      delete toSave.company_fax;
      localStorage.setItem('atlas_peptides_b2b_contact', JSON.stringify(toSave));
    } catch (err) {
      console.warn('Could not save contact draft:', err);
    }
  }, [orderForm]);

  // Currency conversions (Base USD)
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

  // Map, categorize and sort products
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

  // Filtering with debounced query
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

  const handlePrintProforma = useCallback(() => {
    if (Object.keys(cartItems).length === 0) {
      toast.error('Please select formulations before printing or saving a PDF proforma.');
      return;
    }
    window.print();
  }, [cartItems]);

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

    if (!validateOrderForm()) {
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

  const handleShareSchedule = async () => {
    if (typeof window === 'undefined') return;
    const shareUrlObj = new URL(window.location.href);
    shareUrlObj.searchParams.set('lang', lang);
    shareUrlObj.searchParams.set('currency', currency);
    shareUrlObj.searchParams.set('dest', shippingDest);
    if (selectedCategory && selectedCategory !== 'all') {
      shareUrlObj.searchParams.set('category', selectedCategory);
    }
    const shareUrl = shareUrlObj.toString();

    const shareTitle = isEs
      ? `Tarifario Oficial de Viales de Péptidos B2B (${currency}) · Atlas Health Services`
      : `Official Clinical Peptide Vials B2B Schedule (${currency}) · Atlas Health Services`;
    const shareText = isEs
      ? `Consulta el tarifario oficial mayorista y para clínicas de péptidos liofilizados certificados (≥99.0% HPLC) en ${currency} con descuentos en Pack ×10.`
      : `View the official wholesale and clinic price schedule for certified lyophilized peptides (≥99.0% HPLC) in ${currency} with Pack ×10 volume savings.`;

    const isMobileDevice = window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');

    if (isMobileDevice && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(
        isEs
          ? `Enlace copiado con idioma (${lang.toUpperCase()}), divisa (${currency}) y destino (${shippingDest}) ✓`
          : `Schedule link copied with language (${lang.toUpperCase()}), currency (${currency}) & destination (${shippingDest}) ✓`
      );
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(isEs ? 'No se pudo copiar el enlace' : 'Could not copy link');
    }
  };

  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (Object.keys(cartItems).length === 0) {
      toast.error('Your order request is empty. Please select products first.');
      return;
    }

    if (!validateOrderForm()) {
      return;
    }

    setSubmittingOrder(true);
    try {
      const itemsPayload = Object.values(cartItems).map(item => {
        const totalVials = item.quantity1x + (item.quantity10x * 10);
        const packPrice = item.product.pack10Price || (item.product.unitPrice * 8.5);
        const subtotal = (item.quantity1x * item.product.unitPrice) + (item.quantity10x * packPrice);
        return {
          id: item.product.id,
          productId: item.product.productId,
          name: item.product.productName,
          productName: item.product.productName,
          dosage: item.product.dosage,
          presentation: item.product.presentation || 'Lyophilized Vial (10R)',
          quantity: totalVials,
          quantity1x: item.quantity1x,
          quantity10x: item.quantity10x,
          totalVials,
          unitPrice: item.product.unitPrice,
          unitPriceUsd: item.product.unitPrice,
          tier10UnitPrice: packPrice / 10,
          subtotal,
          subtotalUsd: subtotal
        };
      });

      const fullAddress = [
        orderForm.addressLine1,
        orderForm.addressLine2,
        orderForm.city,
        orderForm.state,
        orderForm.postalCode,
        orderForm.country
      ].filter(Boolean).join(', ');

      const totalUnits = itemsPayload.reduce((acc, i) => acc + i.totalVials, 0);
      const subtotalUsd = totalCartValueUsd;
      const finalShippingUsd = totalUnits > 0 ? shippingCostUsd : 0;
      const finalGrandTotalUsd = subtotalUsd + finalShippingUsd;

      const res = await fetch('/api/orders/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: itemsPayload,
          items: itemsPayload,
          contact: orderForm,
          customerName: orderForm.name,
          customerEmail: orderForm.email,
          customerPhone: orderForm.phone,
          customerAddress: fullAddress,
          customerNotes: orderForm.notes,
          shippingDestination: orderForm.country || 'International Express Medical Courier',
          referralCode: referralCode || 'CAT-RX-7482',
          trackingCode: trackingCodeState || (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('tc') : null) || referralCode,
          catalogId: trackingCodeState || (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('tc') : null) || null,
          source: 'public_peptides_price_schedule',
          collection: 'vials',
          subtotal: subtotalUsd,
          shippingCost: finalShippingUsd,
          shippingCostEur: 60,
          grandTotal: finalGrandTotalUsd,
          totalAmountUsd: finalGrandTotalUsd,
          totalUnits,
          currency: 'USD',
          currencySymbol: '$',
          company_fax: orderForm.company_fax || ''
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Could not submit order proforma');
      }

      const resData = await res.json().catch(() => ({}));
      const assignedRef = resData.orderNumber || resData.id || `PO-${referralCode || 'DISTRIBUTOR-15'}-${Date.now().toString().slice(-4)}`;

      setSubmittedOrderData({
        referenceId: assignedRef,
        customerName: orderForm.name,
        customerEmail: orderForm.email,
        customerPhone: orderForm.phone,
        itemsCount: totalUnits,
        grandTotal: finalGrandTotalUsd,
        currency: 'USD',
        shippingDestination: fullAddress
      });

      toast.success('Proforma request submitted! Our medical logistics team will contact you within 24 hours.');
      setCartItems({});
      try {
        localStorage.removeItem(storageKey);
      } catch (storageErr) {
        console.warn('Could not clear storage cart:', storageErr);
      }
    } catch (err) {
      console.error('Order submission error:', err);
      toast.error(err.message || 'Unable to send order. Please try again or contact support.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // DataTable columns
  const columns = useMemo(() => {
    return getPeptidesColumns({
      cartItems,
      handleAddToCart,
      updateItemQuantity,
      formatPrice,
      currency,
      isEs
    });
  }, [formatPrice, handleAddToCart, updateItemQuantity, currency, cartItems, isEs]);

  // Master-Detail Expandable Clinical Summary Row for Desktop DataTable
  const handleRenderExpandable = useCallback((row) => {
    return renderPeptideClinicalDetail(row, {
      lang,
      onOpenSpecs: setSelectedSpecsProduct,
      onOpenAi: (prod) => {
        setAiContextProduct(prod);
        setIsAtlasAiOpen(true);
      },
      onInquire: (prod) => {
        setInquiryProductContext(prod);
        setIsInquiryDrawerOpen(true);
      },
      onFilterByPeptide: (name) => {
        setSearchQuery(name);
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }
    });
  }, [lang]);

  return (
    <div className="colway-price-root peptides-b2b-portal">
      {/* ── Screen Navigation Bar (Google Cloud Console AppBar) ── */}
      <PeptidesTopAppBar
        setIsNavDrawerOpen={setIsNavDrawerOpen}
        lang={lang}
        handleLanguageChange={handleLanguageChange}
        isAtlasAiOpen={isAtlasAiOpen}
        setIsAtlasAiOpen={setIsAtlasAiOpen}
        currency={currency}
        handleCurrencyChange={handleCurrencyChange}
        authUser={authUser}
        authRole={authRole}
        avatarBgColor={avatarBgColor}
        effectiveInitials={effectiveInitials}
        effectiveDisplayName={effectiveDisplayName}
        effectiveRoleLabel={effectiveRoleLabel}
        handleLogout={handleLogout}
        isCurrencySheetOpen={isCurrencySheetOpen}
        setIsCurrencySheetOpen={setIsCurrencySheetOpen}
        isMobileMoreMenuOpen={isMobileMoreMenuOpen}
        setIsMobileMoreMenuOpen={setIsMobileMoreMenuOpen}
        setIsPdfPreviewOpen={setIsPdfPreviewOpen}
        handleShareSchedule={handleShareSchedule}
        copied={copied}
        setInquiryProductContext={setInquiryProductContext}
        setIsInquiryDrawerOpen={setIsInquiryDrawerOpen}
      />

      <main className="peptides-main-container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 1.25rem 4rem 1.25rem' }}>
        {/* Page Header (Consolidated with TopBar Navigation - No Duplicate Breadcrumb) */}
        <div className="peptides-page-header" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              {/* Consolidated GCP Status Strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 750,
                  color: isDistributor ? '#137333' : '#1a73e8',
                  background: isDistributor ? '#e6f4ea' : '#e8f0fe',
                  border: isDistributor ? '1px solid #ceead6' : '1px solid #c2e7ff',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isDistributor ? '#137333' : '#1a73e8', display: 'inline-block' }} />
                  <span>{isDistributor ? (isEs ? 'Tarifa Oficial Distribuidor' : 'Official Distributor Schedule') : (isEs ? 'Tarifa Mayorista' : 'Wholesale Schedule')}</span>
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 650,
                  color: '#137333',
                  background: '#e6f4ea',
                  border: '1px solid #ceead6',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={11} />
                  <span>≥99.0% HPLC</span>
                </span>
              </div>
              <h1 className="peptides-hero-title" style={{
                fontSize: 'clamp(1.12rem, 3vw, 1.60rem)',
                fontWeight: 800,
                color: '#202124',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: 1.22,
                textWrap: 'balance',
                maxWidth: '820px'
              }}>
                {isDistributor
                  ? (isEs ? 'Viales Clínicos de Péptidos Certificados • Distribuidor B2B' : 'Certified Clinical Peptide Vials • Distributor B2B')
                  : (isEs ? 'Viales Clínicos de Péptidos Certificados • Mayoristas y Clínicas' : 'Certified Clinical Peptide Vials • Wholesaler & Clinic')
                }
              </h1>
              <p className="peptides-hero-subtitle" style={{ fontSize: '0.84rem', color: '#5f6368', marginTop: '3px', marginBottom: 0, maxWidth: '850px', lineHeight: 1.4 }}>
                {isDistributor
                  ? (isEs
                      ? 'Lista oficial B2B para distribuidores de viales liofilizados certificados (Borosilicato 10R) con pureza verificada y ahorro por volumen.'
                      : 'Official B2B distributor price list for certified lyophilized peptide vials (10R Borosilicate) with verified analytical purity and volume tiers.')
                  : (isEs
                      ? 'Tarifa oficial institucional y mayorista para péptidos bioactivos liofilizados estériles con ahorro por volumen en packs de 10 viales.'
                      : 'Official institutional and wholesale price schedule for sterile lyophilized bioactive peptides with manufacturer 10-pack volume savings.')
                }
              </p>
            </div>

            {/* Right-Aligned Page Header Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setInquiryProductContext(null);
                  setIsInquiryDrawerOpen(true);
                }}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  fontSize: '0.80rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                  transition: 'background 0.15s ease'
                }}
                title={isEs ? 'Consultar información técnica o solicitud B2B' : 'Institutional Inquiry & Support'}
              >
                <Mail size={14} color="#5f6368" />
                <span>{isEs ? 'Consultar' : 'Inquire'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPdfPreviewOpen(true)}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#3c4043',
                  fontSize: '0.80rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                  transition: 'background 0.15s ease'
                }}
                title={isEs ? 'Previsualizar y exportar tarifa oficial PDF' : 'Preview and export official PDF price schedule'}
              >
                <Eye size={14} color="#5f6368" />
                <span>{isEs ? 'PDF' : 'PDF Schedule'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareSchedule}
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: copied ? '1px solid #1a73e8' : '1px solid #dadce0',
                  background: copied ? '#e8f0fe' : '#ffffff',
                  color: copied ? '#1a73e8' : '#3c4043',
                  fontSize: '0.80rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
                  transition: 'all 0.15s ease'
                }}
                title={isEs ? 'Copiar enlace verificado de tarifa' : 'Copy verified price list link'}
              >
                {copied ? <Check size={14} color="#1a73e8" /> : <Share2 size={14} color="#5f6368" />}
                <span>{copied ? (isEs ? 'Copiado' : 'Copied') : (isEs ? 'Compartir' : 'Share')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Layout Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .gcp-pricing-portal-layout {
            display: flex;
            gap: 1.25rem;
            align-items: flex-start;
            width: 100%;
          }
          .gcp-pricing-sidebar {
            width: 240px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            position: sticky;
            top: 72px;
          }
          .gcp-pricing-workspace {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
          }
          .gcp-search-and-category-block {
            order: 1;
          }
          .gcp-kpis-summary-block {
            order: 2;
          }
          .mobile-only-filter-selectors {
            order: 3;
          }
          .gcp-table-block {
            order: 4;
          }
          .mobile-only-category-selector {
            display: none;
          }
          .mobile-nav-drawer-trigger {
            display: none;
          }
          .mobile-only-filter-selectors {
            display: none;
          }
          .mobile-only-category-strip {
            display: none;
          }
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
          .screen-nav-bar.peptides-screen-nav-bar {
            position: sticky !important;
            top: 0 !important;
            z-index: 100 !important;
            background: #002b4d !important;
            backdrop-filter: blur(8px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
            box-shadow: 0 4px 16px rgba(0, 30, 60, 0.22) !important;
          }
          .peptides-nav-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .desktop-only-utilities {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .desktop-only-currency {
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .mobile-only-header-actions {
            display: none;
          }
          .peptides-kpis-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.85rem;
          }
          @media (max-width: 1024px) {
            .gcp-pricing-portal-layout {
              flex-direction: column;
              gap: 0.85rem;
            }
            .gcp-pricing-sidebar {
              display: none !important;
            }
            .mobile-nav-drawer-trigger {
              display: inline-flex !important;
            }
            .mobile-only-filter-selectors {
              display: none !important;
            }
            .mobile-only-category-strip {
              display: flex !important;
            }
            .mobile-only-category-selector {
              display: block !important;
            }
            .peptides-kpis-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 10px !important;
            }
          }
          @media (max-width: 640px) {
            .mobile-only-filter-selectors {
              display: none !important;
            }
          }
          @media (max-width: 768px) {
            .mobile-hide {
              display: none !important;
            }
            .desktop-only-utilities {
              display: none !important;
            }
            .desktop-only-currency {
              display: none !important;
            }
            .mobile-only-header-actions {
              display: inline-flex !important;
            }
            .mobile-only-sticky-bar {
              display: flex !important;
            }
            .screen-nav-bar.peptides-screen-nav-bar {
              position: sticky !important;
              top: 0 !important;
              z-index: 100 !important;
            }
            .peptides-b2b-portal .peptides-nav-container {
              padding: 6px 12px !important;
              gap: 8px !important;
              flex-direction: row !important;
              flex-wrap: nowrap !important;
              align-items: center !important;
              justify-content: space-between !important;
              height: 48px !important;
            }
            .peptides-b2b-portal .peptides-nav-left {
              width: auto !important;
              flex: 0 1 auto !important;
              min-width: 0 !important;
              display: flex !important;
              align-items: center !important;
              justify-content: flex-start !important;
              gap: 8px !important;
            }
            .peptides-b2b-portal .nav-brand span {
              font-size: 0.82rem !important;
              white-space: nowrap !important;
            }
            .peptides-b2b-portal .peptides-nav-actions {
              width: auto !important;
              flex: 0 0 auto !important;
              display: flex !important;
              flex-direction: row !important;
              flex-wrap: nowrap !important;
              align-items: center !important;
              justify-content: flex-end !important;
              gap: 6px !important;
            }
            .peptides-main-container {
              padding: 0.5rem 0.65rem 3.5rem 0.65rem !important;
            }
            .peptides-hero-title {
              font-size: 1.05rem !important;
              line-height: 1.2 !important;
            }
            .peptides-hero-subtitle {
              display: none !important;
            }
            .mobile-only-filter-selectors {
              grid-template-columns: 1fr 1fr !important;
              gap: 6px !important;
              margin-top: 6px !important;
            }
            .gcp-search-and-category-block {
              order: 1 !important;
              margin-bottom: 0.75rem !important;
            }
            .gcp-kpis-summary-block {
              order: 2 !important;
              padding: 0.5rem 0.65rem !important;
              margin-bottom: 0.5rem !important;
            }
            .mobile-kpi-summary-strip {
              display: flex !important;
            }
            .peptides-kpis-grid.mobile-kpi-collapsed {
              display: none !important;
            }
            .peptides-kpis-grid.mobile-kpi-expanded {
              display: grid !important;
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 8px !important;
              margin-top: 8px !important;
            }
            .peptide-mobile-tiles-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              gap: 8px !important;
            }
            .mobile-only-filter-selectors {
              order: 3 !important;
            }
            .gcp-table-block {
              order: 4 !important;
            }
            .peptides-kpi-card {
              padding: 0.55rem 0.65rem !important;
            }
            .peptides-kpi-val {
              font-size: 1.15rem !important;
            }
          }
          @media (max-width: 390px) {
            .peptides-share-label {
              display: none !important;
            }
          }
        ` }} />

        {/* ── 2-Column Portal Layout ── */}
        <div className="gcp-pricing-portal-layout">
          {/* Left Navigation Rail / Sidebar */}
          <aside className="gcp-pricing-sidebar" style={{ display: isSidebarOpen ? 'flex' : 'none' }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              padding: '12px 0',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 14px', marginBottom: '8px' }}>
                {isEs ? 'Categorías de Péptidos' : 'Peptide Categories'}
              </div>
              <div className="gcp-categories-horizontal" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 14px',
                    borderRadius: '0 4px 4px 0',
                    border: 'none',
                    borderLeft: selectedCategory === 'all' ? '3px solid #1a73e8' : '3px solid transparent',
                    background: selectedCategory === 'all' ? '#e8f0fe' : 'transparent',
                    color: selectedCategory === 'all' ? '#1a73e8' : '#3c4043',
                    fontSize: '0.78rem',
                    fontWeight: selectedCategory === 'all' ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { if (selectedCategory !== 'all') e.currentTarget.style.background = '#f1f3f4'; }}
                  onMouseLeave={e => { if (selectedCategory !== 'all') e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{isEs ? 'Todas las Formulaciones' : 'All Formulations'}</span>
                  <span style={{
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    background: selectedCategory === 'all' ? '#1a73e8' : '#e8eaed',
                    color: selectedCategory === 'all' ? '#ffffff' : '#3c4043',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {processedProducts.length}
                  </span>
                </button>

                {CATEGORY_ORDER.map(key => {
                  const meta = CATEGORY_MAP[key];
                  if (!meta) return null;
                  const count = processedProducts.filter(p => p.categoryKey === key).length;
                  if (count === 0) return null;
                  const isSelected = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedCategory(key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        borderRadius: '0 4px 4px 0',
                        border: 'none',
                        borderLeft: isSelected ? `3px solid ${meta.color || '#1a73e8'}` : '3px solid transparent',
                        background: isSelected ? meta.bg : 'transparent',
                        color: isSelected ? meta.color : '#3c4043',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f3f4'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px' }}>
                          {getCategoryIcon(key, 14)}
                        </span>
                        <span>{isEs ? meta.labelEs : meta.labelEn}</span>
                      </div>
                      <span style={{
                        fontSize: '0.70rem',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        background: isSelected ? (meta.color || '#1a73e8') : '#e8eaed',
                        color: isSelected ? '#ffffff' : '#3c4043',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div style={{ height: '1px', background: '#e2e8f0', margin: '12px 0 10px 0' }} />

              {/* FDA Regulatory Status Filter Rail */}
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 14px', marginBottom: '8px' }}>
                {isEs ? 'Estatus Regulatorio FDA' : 'FDA Regulatory Status'}
              </div>
              <div className="gcp-categories-horizontal" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {FDA_FILTERS.map(f => {
                  const isSelected = selectedFdaStatus === f.id;
                  const count = f.id === 'all'
                    ? processedProducts.length
                    : processedProducts.filter(p => p.fdaBucket === f.id).length;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFdaStatus(f.id)}
                      title={isEs ? (f.tooltipEs || f.labelEs) : (f.tooltipEn || f.labelEn)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        borderRadius: '0 4px 4px 0',
                        border: 'none',
                        borderLeft: isSelected ? `3px solid ${f.color || '#1a73e8'}` : '3px solid transparent',
                        background: isSelected ? (f.id === 'all' ? '#e8f0fe' : (f.id === 'fda_503a' ? '#ecfdf5' : f.id === 'fda_approved' ? '#eff6ff' : f.id === 'clinical_ind' ? '#fffbeb' : '#f1f5f9')) : 'transparent',
                        color: isSelected ? (f.id === 'all' ? '#1a73e8' : (f.color || '#3c4043')) : '#3c4043',
                        fontSize: '0.77rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f3f4'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.80rem', flexShrink: 0 }}>{f.icon}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isEs ? f.labelEs : f.labelEn}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.70rem',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        background: isSelected ? (f.id === 'all' ? '#1a73e8' : (f.color || '#5f6368')) : '#e8eaed',
                        color: isSelected ? '#ffffff' : '#3c4043',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Main Data Workspace Area */}
          <div className="gcp-pricing-workspace">
            {/* Search & Category Filter Block */}
            <PeptidesFilterToolbar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              lang={lang}
              filteredProducts={filteredProducts}
              processedProducts={processedProducts}
              activeFilterChips={activeFilterChips}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              shippingDest={shippingDest}
              handleShippingDestChange={handleShippingDestChange}
              selectedStrength={selectedStrength}
              setSelectedStrength={setSelectedStrength}
              groupByCategory={groupByCategory}
              setGroupByCategory={setGroupByCategory}
            />

            {/* Price Drift Notice */}
            {priceDriftNotice && (
              <div
                style={{
                  background: '#e8f0fe',
                  border: '1px solid #c2e7ff',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
                  <span style={{ fontSize: '0.80rem', color: '#1a73e8', fontWeight: 600 }}>
                    {isEs
                      ? `Aviso de Tarifas: Algunos precios han sido actualizados de acuerdo con las tarifas vigentes del catálogo desde la cotización original emitida${priceDriftNotice.issuedAt ? ` el ${new Date(priceDriftNotice.issuedAt).toLocaleDateString()}` : ''}.`
                      : `Price Schedule Notice: Some prices have been updated according to current catalog rates since this schedule was issued${priceDriftNotice.issuedAt ? ` on ${new Date(priceDriftNotice.issuedAt).toLocaleDateString()}` : ''}.`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPriceDriftNotice(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#1a73e8',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '2px 8px'
                  }}
                  title={isEs ? 'Descartar aviso' : 'Dismiss notice'}
                >
                  ×
                </button>
              </div>
            )}

            {/* 4 KPIs with Scope Switcher */}
            <PeptidesKpiSummaryBar
              filteredProducts={filteredProducts}
              processedProducts={processedProducts}
              totalCartCount={totalCartCount}
              totalCartValueUsd={totalCartValueUsd}
              formatPrice={formatPrice}
              scopeMode={scopeMode}
              setScopeMode={setScopeMode}
              isMobileKpiExpanded={isMobileKpiExpanded}
              setIsMobileKpiExpanded={setIsMobileKpiExpanded}
              setSelectedCategory={setSelectedCategory}
              selectedFdaStatus={selectedFdaStatus}
              setSelectedFdaStatus={setSelectedFdaStatus}
              setSearchQuery={setSearchQuery}
              setIsOrderDrawerOpen={setIsOrderDrawerOpen}
              isEs={isEs}
            />

            {/* Dual Mobile Dropdown Selectors (Triggers for bottom sheets) */}
            <div className="mobile-only-filter-selectors">
              {/* Category Bottom Sheet Trigger */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🧬 {isEs ? 'Categoría' : 'Category'}</span>
                  </span>
                  {selectedCategory !== 'all' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory('all');
                      }}
                      style={{
                        border: 'none',
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}
                      title={isEs ? 'Limpiar filtro de categoría' : 'Clear category filter'}
                    >
                      {isEs ? 'Limpiar ×' : 'Clear ×'}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategorySheetOpen(true)}
                  style={{
                    width: '100%',
                    padding: '7px 9px',
                    borderRadius: '6px',
                    border: selectedCategory !== 'all' ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                    background: selectedCategory !== 'all' ? '#f0f7ff' : '#ffffff',
                    color: selectedCategory !== 'all' ? '#1a73e8' : '#1e293b',
                    fontSize: '0.80rem',
                    fontWeight: selectedCategory !== 'all' ? 750 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedCategory === 'all'
                      ? (isEs ? `🌐 Todas las Categorías (${processedProducts.length})` : `🌐 All Categories (${processedProducts.length})`)
                      : `${CATEGORY_MAP[selectedCategory]?.icon || '🧬'} ${isEs ? CATEGORY_MAP[selectedCategory]?.labelEs : CATEGORY_MAP[selectedCategory]?.labelEn} (${processedProducts.filter(p => p.categoryKey === selectedCategory).length})`
                    }
                  </span>
                  <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
                </button>
              </div>

              {/* FDA Regulatory Status Bottom Sheet Trigger */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>⚖️ {isEs ? 'Estatus FDA' : 'FDA Status'}</span>
                  </span>
                  {selectedFdaStatus !== 'all' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFdaStatus('all');
                      }}
                      style={{
                        border: 'none',
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}
                      title={isEs ? 'Limpiar filtro FDA' : 'Clear FDA filter'}
                    >
                      {isEs ? 'Limpiar ×' : 'Clear ×'}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsFdaSheetOpen(true)}
                  style={{
                    width: '100%',
                    padding: '7px 9px',
                    borderRadius: '6px',
                    border: selectedFdaStatus !== 'all' ? '1.5px solid #1a73e8' : '1px solid #cbd5e1',
                    background: selectedFdaStatus !== 'all' ? '#f0f7ff' : '#ffffff',
                    color: selectedFdaStatus !== 'all' ? '#1a73e8' : '#1e293b',
                    fontSize: '0.80rem',
                    fontWeight: selectedFdaStatus !== 'all' ? 750 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFdaStatus === 'all'
                      ? (isEs ? `🌐 Toda Regulación (${processedProducts.length})` : `🌐 All Regulatory (${processedProducts.length})`)
                      : `${FDA_FILTERS.find(f => f.id === selectedFdaStatus)?.icon || '⚖️'} ${isEs ? FDA_FILTERS.find(f => f.id === selectedFdaStatus)?.labelEs : FDA_FILTERS.find(f => f.id === selectedFdaStatus)?.labelEn} (${processedProducts.filter(p => p.fdaBucket === selectedFdaStatus).length})`
                    }
                  </span>
                  <ChevronDown size={14} color="#64748b" style={{ flexShrink: 0 }} />
                </button>
              </div>
            </div>

            {/* Peptide DataTable */}
            <div className="gcp-table-block" style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem' }}>
                  <EmptyState
                    icon={FileText}
                    title={isEs ? 'No se encontraron formulaciones de péptidos' : 'No peptide formulations found'}
                    subtitle={isEs ? 'Prueba a ajustar tu búsqueda o filtro de categoría para ver las formulaciones disponibles.' : 'Try adjusting your keyword search or category filter to discover available formulations.'}
                    action={{
                      label: isEs ? 'Limpiar Filtros' : 'Clear Filters',
                      onClick: () => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setSelectedStrength('all');
                      }
                    }}
                  />
                </div>
              ) : (
                <DataTable
                  data={filteredProducts}
                  columns={columns}
                  keyField="id"
                  pageSize={150}
                  initialRowsPerPage={150}
                  showPagination={true}
                  sortable={true}
                  stickyTopOffset={0}
                  lang={lang}
                  groupByKey={groupByCategory ? 'categoryKey' : null}
                  renderGroupHeader={(catKey, firstRow, count) => {
                    const meta = CATEGORY_MAP[catKey] || firstRow?.categoryMeta || CATEGORY_MAP.general_health;
                    const title = isEs ? (meta.labelEs || meta.label) : (meta.labelEn || meta.label);
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        background: '#e8f0fe',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        scrollMarginTop: '64px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#1a73e8', display: 'inline-flex', alignItems: 'center' }}>
                            {getCategoryIcon(catKey, 14)}
                          </span>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '0.76rem',
                            color: '#1a73e8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}>
                            {title}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          color: '#1a73e8',
                          background: '#ffffff',
                          border: '1px solid #bfdbfe',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          {count} {isEs ? 'formulaciones' : 'formulations'}
                        </span>
                      </div>
                    );
                  }}
                  expandableRender={handleRenderExpandable}
                  mobileCardComponent={PeptideMobileCard}
                  mobileCardProps={{
                    handleAddToCart,
                    updateItemQuantity,
                    cartItems,
                    formatPrice,
                    currency,
                    currencySymbol,
                    lang,
                    onOpenSpecs: setSelectedSpecsProduct,
                    onOpenAi: (prod) => {
                      setAiContextProduct(prod);
                      setIsAtlasAiOpen(true);
                    },
                    onInquire: (prod) => {
                      setInquiryProductContext(prod);
                      setIsInquiryDrawerOpen(true);
                    },
                    onFilterByPeptide: (name) => {
                      setSearchQuery(name);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Quick Order Request Drawer & Printable Proforma */}
      <PeptidesOrderDrawer
        isOrderDrawerOpen={isOrderDrawerOpen}
        setIsOrderDrawerOpen={setIsOrderDrawerOpen}
        cartItems={cartItems}
        setCartItems={setCartItems}
        updateItemQuantity={updateItemQuantity}
        hasRestoredCart={hasRestoredCart}
        setHasRestoredCart={setHasRestoredCart}
        formatPrice={formatPrice}
        isEs={isEs}
        referralCode={referralCode}
        submittedOrderData={submittedOrderData}
        setSubmittedOrderData={setSubmittedOrderData}
        totalCartCount={totalCartCount}
        totalCartValueUsd={totalCartValueUsd}
        grandTotalCartValueUsd={grandTotalCartValueUsd}
        activeShippingCorridor={activeShippingCorridor}
        shippingDest={shippingDest}
        handleShippingDestChange={handleShippingDestChange}
        currencySymbol={currencySymbol}
        shippingCostCurrentCurrency={shippingCostCurrentCurrency}
        handlePrintProforma={handlePrintProforma}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        handleSubmitOrder={handleSubmitOrder}
        submittingOrder={submittingOrder}
        isLookingUpUser={isLookingUpUser}
        lookupUserResult={lookupUserResult}
        handleEmailLookup={handleEmailLookup}
        storageKey={storageKey}
        handleOrderViaWhatsApp={handleOrderViaWhatsApp}
        currency={currency}
      />

      {/* Floating Bottom Cart Dock */}
      <PeptidesBottomCartDock
        totalCartCount={totalCartCount}
        totalCartValueUsd={totalCartValueUsd}
        formatPrice={formatPrice}
        currencySymbol={currencySymbol}
        shippingCostCurrentCurrency={shippingCostCurrentCurrency}
        activeShippingCorridor={activeShippingCorridor}
        isEs={isEs}
        setCartItems={setCartItems}
        setIsOrderDrawerOpen={setIsOrderDrawerOpen}
      />

      {/* Navigation & Filter Drawer (Mobile) */}
      <PeptidesNavDrawer
        isNavDrawerOpen={isNavDrawerOpen}
        setIsNavDrawerOpen={setIsNavDrawerOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedFdaStatus={selectedFdaStatus}
        setSelectedFdaStatus={setSelectedFdaStatus}
        selectedStrength={selectedStrength}
        setSelectedStrength={setSelectedStrength}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        processedProducts={processedProducts}
        isEs={isEs}
      />

      {/* Bottom Sheets (Category & FDA Status for Mobile) */}
      <PeptidesFilterSheets
        isCategorySheetOpen={isCategorySheetOpen}
        setIsCategorySheetOpen={setIsCategorySheetOpen}
        isFdaSheetOpen={isFdaSheetOpen}
        setIsFdaSheetOpen={setIsFdaSheetOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedFdaStatus={selectedFdaStatus}
        setSelectedFdaStatus={setSelectedFdaStatus}
        processedProducts={processedProducts}
        isEs={isEs}
      />

      {/* Official Institutional Price Schedule PDF Preview Modal */}
      <PeptidePricePdfPreviewModal
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        products={filteredProducts}
        currency={currency}
        currencySymbol={currencySymbol}
        formatPrice={formatPrice}
        isDistributor={isDistributor}
        lang={lang}
      />

      {/* Technical Specs & Clinical Monograph Drawer */}
      <PeptideSpecsDrawer
        isOpen={Boolean(selectedSpecsProduct)}
        onClose={() => setSelectedSpecsProduct(null)}
        product={selectedSpecsProduct}
        onAddToCart={handleAddToCart}
        currency={currency}
        currencySymbol={currencySymbol}
      />

      {/* Clinical Protocol Dossier Drawer */}
      <ClinicalProtocolDrawer
        isOpen={Boolean(selectedProtocol)}
        onClose={() => setSelectedProtocol(null)}
        protocol={selectedProtocol}
        onAddProtocol={handleAddProtocolPreset}
        formatPrice={formatPrice}
        currency={currency}
        currencySymbol={currencySymbol}
        isDistributor={isDistributor}
      />

      {/* Atlas AI Clinical Copilot Drawer */}
      <AtlasAiCopilotDrawer
        isOpen={isAtlasAiOpen}
        onClose={() => {
          setIsAtlasAiOpen(false);
          setAiContextProduct(null);
        }}
        currency={currency}
        currencySymbol={currencySymbol}
        formatPrice={formatPrice}
        products={processedProducts}
        cartItems={cartItems}
        totalCartCount={totalCartCount}
        totalCartValueUsd={totalCartValueUsd}
        isDistributor={isDistributor}
        lang={lang}
        activeCategory={selectedCategory}
        activeCategoryLabel={selectedCategory !== 'all' ? (isEs ? CATEGORY_MAP[selectedCategory]?.labelEs : CATEGORY_MAP[selectedCategory]?.labelEn) : null}
        contextProduct={aiContextProduct}
        onAddToCart={handleAddToCart}
        onOpenSpecs={setSelectedSpecsProduct}
      />

      {/* Institutional B2B Inquiry Drawer */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => {
          setIsInquiryDrawerOpen(false);
          setInquiryProductContext(null);
        }}
        contextType="peptides_b2b_schedule"
        brandType="peptides_b2b"
        lang={lang}
        initialEntity={
          inquiryProductContext
            ? {
                name: `${inquiryProductContext.productName} ${inquiryProductContext.dosage || ''}`.trim(),
                currency,
                selectedItemsSummary: `${inquiryProductContext.productName} ${inquiryProductContext.dosage || ''} (${formatPrice(inquiryProductContext.unitPrice)} / vial · Pack ×10: ${formatPrice(inquiryProductContext.pack10Price)})`
              }
            : {
                name: selectedCategory !== 'all'
                  ? (isEs ? CATEGORY_MAP[selectedCategory]?.labelEs : CATEGORY_MAP[selectedCategory]?.labelEn)
                  : (isEs ? 'Tarifa Oficial de Péptidos B2B (109 Formulaciones)' : 'Official Peptide B2B Schedule (109 Formulations)'),
                currency,
                selectedItemsSummary: totalCartCount > 0
                  ? Object.values(cartItems)
                      .map(it => `${it.product.productName} ${it.product.dosage} (${it.quantity1x > 0 ? `${it.quantity1x}x Vial` : ''}${it.quantity1x > 0 && it.quantity10x > 0 ? ' + ' : ''}${it.quantity10x > 0 ? `${it.quantity10x}x Pack×10` : ''})`)
                      .join(', ')
                  : ''
              }
        }
      />

      {/* Unified Public Footer */}
      <div style={{ pointerEvents: 'none', userSelect: 'none', opacity: 0.85 }}>
        <PublicUnifiedFooter />
      </div>
    </div>
  );
}
