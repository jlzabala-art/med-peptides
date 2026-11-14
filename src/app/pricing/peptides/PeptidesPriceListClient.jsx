'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';

// Extracted Domain Constants
import {
  CATEGORY_MAP,
  FDA_FILTERS,
  getCategoryIcon
} from '@/constants/peptideCategories';

// Extracted UI Components
import PeptidesTopAppBar from '@/components/pricing/peptides/PeptidesTopAppBar';
import PeptidesPageHeader from '@/components/pricing/peptides/PeptidesPageHeader';
import PeptidesSidebarRail from '@/components/pricing/peptides/PeptidesSidebarRail';
import PeptidesFilterToolbar from '@/components/pricing/peptides/PeptidesFilterToolbar';
import PeptidesKpiSummaryBar from '@/components/pricing/peptides/PeptidesKpiSummaryBar';
import PeptidesNavDrawer from '@/components/pricing/peptides/PeptidesNavDrawer';
import PeptidesFilterSheets from '@/components/pricing/peptides/PeptidesFilterSheets';
import PeptidesOrderDrawer from '@/components/pricing/peptides/PeptidesOrderDrawer';
import PeptidesBottomCartDock from '@/components/pricing/peptides/PeptidesBottomCartDock';
import PeptideMobileCard from '@/components/pricing/peptides/PeptideMobileCard';
import { getPeptidesColumns, renderPeptideClinicalDetail } from '@/components/pricing/peptides/PeptidesTableColumns';

// Extracted Business Logic Hooks
import { usePeptidesFilters } from '@/hooks/pricing/usePeptidesFilters';
import { usePeptidesCart } from '@/hooks/pricing/usePeptidesCart';

import '../colway/ColwayPriceList.css';

// Lazy-loaded heavy drawers (SSR disabled to shrink initial JS bundle & accelerate LCP/TTI)
const PeptidePricePdfPreviewModal = dynamic(() => import('@/components/pricing/PeptidePricePdfPreviewModal'), { ssr: false });
const PeptideSpecsDrawer = dynamic(() => import('@/components/pricing/PeptideSpecsDrawer'), { ssr: false });
const ClinicalProtocolDrawer = dynamic(() => import('@/components/pricing/ClinicalProtocolDrawer'), { ssr: false });
const AtlasAiCopilotDrawer = dynamic(() => import('@/components/pricing/AtlasAiCopilotDrawer'), { ssr: false });
const PublicInstitutionalInquiryDrawer = dynamic(() => import('@/components/shared/PublicInstitutionalInquiryDrawer'), { ssr: false });

export default function PeptidesPriceListClient({
  initialProducts = [],
  referralCode = 'CAT-RX-7482',
  isDistributor = false,
  initialLang = 'en',
  initialCurrency = 'USD',
  initialDest = 'EU',
  trackingCode = null
}) {
  // Modal / Drawer UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
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
  const [isMobileKpiExpanded, setIsMobileKpiExpanded] = useState(false);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(true);

  // Order submission & contact form state
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [, setFormErrors] = useState({});
  const [submittedOrderData, setSubmittedOrderData] = useState(null);
  const [isLookingUpUser, setIsLookingUpUser] = useState(false);
  const [lookupUserResult, setLookupUserResult] = useState(null);

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

  // Business Logic: URL Synchronization & Filtering Hook
  const {
    lang,
    isEs,
    currency,
    shippingDest,
    searchQuery,
    setSearchQuery,
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
  } = usePeptidesFilters({
    initialProducts,
    initialLang,
    initialCurrency,
    initialDest,
    setOrderForm
  });

  // Contact form validation gate
  const validateOrderForm = useCallback(() => {
    const errors = {};
    if (!orderForm.name || orderForm.name.trim().length < 2) errors.name = 'Contact name is required.';
    if (!orderForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email.trim())) errors.email = 'Valid work email required.';
    const phoneDigits = (orderForm.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) errors.phone = 'Valid international phone required.';
    if (!orderForm.country || !orderForm.country.trim()) errors.country = 'Destination country is required.';
    if (!orderForm.addressLine1 || orderForm.addressLine1.trim().length < 4) errors.addressLine1 = 'Street address required.';
    if (!orderForm.city || orderForm.city.trim().length < 2) errors.city = 'City is required.';
    if (!orderForm.postalCode || orderForm.postalCode.trim().length < 2) errors.postalCode = 'Postal / ZIP code required.';

    setFormErrors(errors);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const el = document.getElementById(`order-field-${errorKeys[0]}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { el.focus(); } catch { /* not focusable */ }
      }
      toast.error('Please complete all required fields (marked with *).');
      return false;
    }
    return true;
  }, [orderForm]);

  // Business Logic: Cart Management Hook
  const {
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
  } = usePeptidesCart({
    referralCode,
    isDistributor,
    shippingDest,
    currency,
    currencySymbol,
    fxRate,
    formatPrice,
    processedProducts,
    orderForm,
    validateOrderForm
  });

  // Auth context & user info
  const authContext = useAuth?.() || {};
  const authUser = authContext?.user || null;
  const authProfile = authContext?.userProfile || null;
  const authRole = authContext?.activeRole || authProfile?.role || null;

  const handleLogout = async () => {
    try {
      if (authContext?.logout) await authContext.logout();
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
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
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
    if (!validateOrderForm()) return;

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
          trackingCode: trackingCode || (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('tc') : null) || referralCode,
          catalogId: trackingCode || (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('tc') : null) || null,
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
  }, [lang, setSearchQuery]);

  return (
    <div className="colway-price-root peptides-b2b-portal">
      {/* ── Screen Navigation Bar ── */}
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
        {/* Page Header (Consolidated Hero & Action Toolbar) */}
        <PeptidesPageHeader
          isDistributor={isDistributor}
          isEs={isEs}
          copied={copied}
          setInquiryProductContext={setInquiryProductContext}
          setIsInquiryDrawerOpen={setIsInquiryDrawerOpen}
          setIsPdfPreviewOpen={setIsPdfPreviewOpen}
          handleShareSchedule={handleShareSchedule}
        />

        {/* Responsive Layout Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .gcp-pricing-portal-layout { display: flex; gap: 1.25rem; align-items: flex-start; width: 100%; }
          .gcp-pricing-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.85rem; position: sticky; top: 72px; }
          .gcp-pricing-workspace { flex: 1; min-width: 0; display: flex; flex-direction: column; }
          .gcp-search-and-category-block { order: 1; width: 100%; min-width: 0; }
          .gcp-kpis-summary-block { order: 2; width: 100%; min-width: 0; }
          .mobile-only-filter-selectors { order: 3; display: none; width: 100%; min-width: 0; }
          .mobile-only-secondary-toggle { display: none; }
          .gcp-table-block { order: 4; width: 100%; min-width: 0; }
          .mobile-only-category-selector, .mobile-nav-drawer-trigger, .mobile-only-header-actions { display: none; }
          @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          .screen-nav-bar.peptides-screen-nav-bar { position: sticky !important; top: 0 !important; z-index: 100 !important; background: #002b4d !important; backdrop-filter: blur(8px) !important; border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important; box-shadow: 0 4px 16px rgba(0, 30, 60, 0.22) !important; }
          .peptides-nav-container { display: flex; align-items: center; justify-content: space-between; }
          .desktop-only-utilities { display: inline-flex; align-items: center; gap: 6px; }
          .desktop-only-currency { display: inline-flex; align-items: center; gap: 8px; }
          .peptides-kpis-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.85rem; }
          .gcp-search-and-category-block { position: relative; z-index: 40; }
          .gcp-table-block table tbody tr:nth-child(even) { background-color: #fafbfc; }
          .gcp-table-block table tbody tr:hover { background-color: #f0f7ff !important; }
          @media (max-width: 1024px) {
            .gcp-pricing-portal-layout { flex-direction: column; gap: 0.85rem; width: 100% !important; max-width: 100% !important; min-width: 0 !important; align-items: stretch !important; }
            .gcp-pricing-sidebar { display: none !important; }
            .gcp-pricing-workspace { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .gcp-search-and-category-block { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .gcp-kpis-summary-block { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .mobile-nav-drawer-trigger { display: inline-flex !important; }
            .mobile-only-category-selector { display: block !important; }
            .peptides-kpis-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
            .gcp-table-block { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .ptr-container { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .data-table-mobile-cards { width: 100% !important; max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
            .peptide-mobile-tiles-grid { width: 100% !important; max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 768px) {
            .mobile-hide, .desktop-only-utilities, .desktop-only-currency { display: none !important; }
            .mobile-only-header-actions, .mobile-only-sticky-bar { display: inline-flex !important; }
            .peptides-b2b-portal .peptides-nav-container { padding: 6px 12px !important; gap: 8px !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center !important; justify-content: space-between !important; height: 48px !important; }
            .peptides-b2b-portal .peptides-nav-left { width: auto !important; flex: 0 1 auto !important; min-width: 0 !important; display: flex !important; align-items: center !important; justify-content: flex-start !important; gap: 8px !important; }
            .peptides-b2b-portal .peptides-nav-actions { width: auto !important; flex: 0 0 auto !important; display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center !important; justify-content: flex-end !important; gap: 6px !important; }
            .peptides-main-container { padding: 0.5rem 0.75rem 6.5rem 0.75rem !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
            .peptides-page-header { margin-bottom: 0.6rem !important; }
            .peptides-hero-title { font-size: 1.05rem !important; line-height: 1.24 !important; }
            .peptides-hero-subtitle { display: none !important; }
            .mobile-only-secondary-toggle { display: block !important; width: 100% !important; margin-bottom: 6px !important; }
            .peptides-secondary-filters-subbar.mobile-secondary-collapsed { display: none !important; }
            .peptides-secondary-filters-subbar.mobile-secondary-expanded { display: flex !important; width: 100% !important; margin-bottom: 8px !important; }
            .mobile-only-filter-selectors { display: block !important; margin-top: 4px !important; margin-bottom: 6px !important; order: 3 !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
            .gcp-search-and-category-block { order: 1 !important; margin-bottom: 0.75rem !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .gcp-kpis-summary-block { order: 2 !important; padding: 0.5rem 0.65rem !important; margin-bottom: 0.5rem !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .mobile-kpi-summary-strip { display: flex !important; width: 100% !important; min-width: 0 !important; }
            .peptides-kpis-grid.mobile-kpi-collapsed { display: none !important; }
            .peptides-kpis-grid.mobile-kpi-expanded { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; margin-top: 8px !important; width: 100% !important; min-width: 0 !important; }
            .peptide-mobile-tiles-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 8px !important; width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
            .gcp-table-block { order: 4 !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .ptr-container { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .data-table-mobile-cards { width: 100% !important; max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
            .peptides-kpi-card { padding: 0.55rem 0.65rem !important; }
            .peptides-kpi-val { font-size: 1.15rem !important; }
          }
        ` }} />

        {/* ── 2-Column Portal Layout ── */}
        <div className="gcp-pricing-portal-layout">
          {/* Left Navigation Rail / Sidebar */}
          <PeptidesSidebarRail
            isSidebarOpen={isSidebarOpen}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedFdaStatus={selectedFdaStatus}
            setSelectedFdaStatus={setSelectedFdaStatus}
            processedProducts={processedProducts}
            isEs={isEs}
          />

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
              <div style={{ background: '#e8f0fe', border: '1px solid #c2e7ff', borderRadius: '8px', padding: '10px 14px', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
                  <span style={{ fontSize: '0.80rem', color: '#1a73e8', fontWeight: 600 }}>
                    {isEs
                      ? `Aviso de Tarifas: Algunos precios han sido actualizados de acuerdo con las tarifas vigentes del catálogo desde la cotización original emitida${priceDriftNotice.issuedAt ? ` el ${new Date(priceDriftNotice.issuedAt).toLocaleDateString()}` : ''}.`
                      : `Price Schedule Notice: Some prices have been updated according to current catalog rates since this schedule was issued${priceDriftNotice.issuedAt ? ` on ${new Date(priceDriftNotice.issuedAt).toLocaleDateString()}` : ''}.`}
                  </span>
                </div>
                <button type="button" onClick={() => setPriceDriftNotice(null)} style={{ background: 'transparent', border: 'none', color: '#1a73e8', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', padding: '2px 8px' }} title={isEs ? 'Descartar aviso' : 'Dismiss notice'}>×</button>
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

            {/* Single Mobile FDA Regulatory Filter Selector (Category is controlled by top chip strip) */}
            <div className="mobile-only-filter-selectors">
              <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '8px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 1px 2px rgba(60,64,67,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>⚖️ {isEs ? 'Estatus Regulatorio / FDA' : 'FDA Regulatory Status'}</span>
                  </span>
                  {selectedFdaStatus !== 'all' && (
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFdaStatus('all'); }} style={{ border: 'none', background: '#f1f5f9', color: '#475569', fontSize: '0.66rem', fontWeight: 700, cursor: 'pointer', padding: '1px 6px', borderRadius: '4px' }}>
                      {isEs ? 'Limpiar ×' : 'Clear ×'}
                    </button>
                  )}
                </div>
                <button type="button" onClick={() => setIsFdaSheetOpen(true)} style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: selectedFdaStatus !== 'all' ? '1.5px solid #1a73e8' : '1px solid #cbd5e1', background: selectedFdaStatus !== 'all' ? '#f0f7ff' : '#ffffff', color: selectedFdaStatus !== 'all' ? '#1a73e8' : '#1e293b', fontSize: '0.80rem', fontWeight: selectedFdaStatus !== 'all' ? 750 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', textAlign: 'left' }}>
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
            <div className="gcp-table-block" style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflowX: 'clip', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
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
                        setSelectedFdaStatus('all');
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
                  stickyTopOffset={64}
                  lang={lang}
                  groupByKey={groupByCategory ? 'categoryKey' : null}
                  renderGroupHeader={(catKey, firstRow, count) => {
                    const meta = CATEGORY_MAP[catKey] || firstRow?.categoryMeta || CATEGORY_MAP.general_health;
                    const title = isEs ? (meta.labelEs || meta.label) : (meta.labelEn || meta.label);
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#e8f0fe', borderRadius: '6px', padding: '6px 10px', scrollMarginTop: '64px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#1a73e8', display: 'inline-flex', alignItems: 'center' }}>{getCategoryIcon(catKey, 14)}</span>
                          <span style={{ fontWeight: 800, fontSize: '0.76rem', color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</span>
                        </div>
                        <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#1a73e8', background: '#ffffff', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '10px' }}>
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

      {/* Lazy-Loaded Official Institutional Price Schedule PDF Preview Modal */}
      {isPdfPreviewOpen && (
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
      )}

      {/* Lazy-Loaded Technical Specs & Clinical Monograph Drawer */}
      {Boolean(selectedSpecsProduct) && (
        <PeptideSpecsDrawer
          isOpen={Boolean(selectedSpecsProduct)}
          onClose={() => setSelectedSpecsProduct(null)}
          product={selectedSpecsProduct}
          onAddToCart={handleAddToCart}
          currency={currency}
          currencySymbol={currencySymbol}
        />
      )}

      {/* Lazy-Loaded Clinical Protocol Dossier Drawer */}
      {Boolean(selectedProtocol) && (
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
      )}

      {/* Lazy-Loaded Atlas AI Clinical Copilot Drawer */}
      {isAtlasAiOpen && (
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
      )}

      {/* Lazy-Loaded Institutional B2B Inquiry Drawer */}
      {isInquiryDrawerOpen && (
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
      )}

      {/* Unified Public Footer */}
      <div style={{ pointerEvents: 'none', userSelect: 'none', opacity: 0.85 }}>
        <PublicUnifiedFooter />
      </div>
    </div>
  );
}
