'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FileText, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import EmptyState from '@/components/ui/EmptyState';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';

// Extracted Domain Constants
import {
  CATEGORY_MAP,
  FDA_FILTERS,
  MEDICAL_SPECIALTIES,
  getCategoryIcon
} from '@/constants/peptideCategories';

// Extracted UI Components
import PeptidesTopAppBar from '@/components/pricing/peptides/PeptidesTopAppBar';
import PeptidesPageHeader from '@/components/pricing/peptides/PeptidesPageHeader';
import CatalogPricingBridgeBar from '@/components/shared/CatalogPricingBridgeBar';
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
import { usePricing } from '@/hooks/usePricing';

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
  initialSpecialty = 'all',
  initialViewMode = 'table',
  trackingCode = null
}) {
  // Modal / Drawer UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState(initialViewMode === 'cards' ? 'cards' : 'table');

  const handleViewModeChange = useCallback((nextMode) => {
    const normalized = nextMode === 'cards' ? 'cards' : 'table';
    setViewMode(normalized);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (normalized === 'cards') url.searchParams.set('view', 'cards');
      else url.searchParams.delete('view');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Laptop power-user keyboard shortcuts: '[' or Cmd/Ctrl+B toggles sidebar; 'Escape' closes drawers
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onKeyDown = (e) => {
      const tag = String(e.target?.tagName || '').toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen((v) => !v);
        return;
      }
      if (!isInput && e.key === '[') {
        e.preventDefault();
        setIsSidebarOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        setIsPdfPreviewOpen(false);
        setIsAtlasAiOpen(false);
        setIsInquiryDrawerOpen(false);
        setIsOrderDrawerOpen(false);
        setSelectedSpecsProduct(null);
        setSelectedProtocol(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const [copied, setCopied] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
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
  const [formErrors, setFormErrors] = useState({});
  const [submittedOrderData, setSubmittedOrderData] = useState(null);
  const [isLookingUpUser, setIsLookingUpUser] = useState(false);
  const [lookupUserResult, setLookupUserResult] = useState(null);

  const [orderForm, setOrderForm] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    phoneCountryCode: initialDest === 'US' ? 'us' : initialDest === 'AE' ? 'ae' : 'es',
    country: initialDest === 'US' ? 'United States' : initialDest === 'AE' ? 'United Arab Emirates' : 'Spain',
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
    selectedSpecialty,
    setSelectedSpecialty,
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
    initialSpecialty,
    setOrderForm
  });

  // Contact form validation gate (bilingual EN/ES)
  const validateOrderForm = useCallback(() => {
    const errors = {};
    if (!orderForm.name || orderForm.name.trim().length < 2) errors.name = isEs ? 'El nombre de contacto es obligatorio.' : 'Contact name is required.';
    if (!orderForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email.trim())) errors.email = isEs ? 'Se requiere un correo profesional válido.' : 'Valid work email required.';
    const phoneDigits = (orderForm.phone || '').replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) errors.phone = isEs ? 'Se requiere un teléfono internacional válido.' : 'Valid international phone required.';
    if (!orderForm.country || !orderForm.country.trim()) errors.country = isEs ? 'El país de destino es obligatorio.' : 'Destination country is required.';
    if (!orderForm.addressLine1 || orderForm.addressLine1.trim().length < 4) errors.addressLine1 = isEs ? 'La dirección es obligatoria.' : 'Street address required.';
    if (!orderForm.city || orderForm.city.trim().length < 2) errors.city = isEs ? 'La ciudad es obligatoria.' : 'City is required.';
    if (!orderForm.postalCode || orderForm.postalCode.trim().length < 2) errors.postalCode = isEs ? 'El código postal es obligatorio.' : 'Postal / ZIP code required.';

    setFormErrors(errors);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const el = document.getElementById(`order-field-${errorKeys[0]}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { el.focus(); } catch { /* not focusable */ }
      }
      toast.error(isEs ? 'Completa todos los campos obligatorios (marcados con *).' : 'Please complete all required fields (marked with *).');
      return false;
    }
    return true;
  }, [orderForm, isEs]);

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
    isEs,
    shippingDest,
    currency,
    currencySymbol,
    fxRate,
    formatPrice,
    processedProducts,
    orderForm,
    validateOrderForm
  });

  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'peptides_pricing',
        name: isEs
          ? `Tarifa Oficial de Péptidos (${currency} · ${shippingDest})`
          : `Official Peptides Wholesale Schedule (${currency} · ${shippingDest})`,
        currency,
        shippingDest,
        tier: isDistributor ? 'distributor' : 'wholesale',
        activeCategory: selectedCategory,
        fdaFilter: selectedFdaStatus,
        visibleCount: filteredProducts.length,
        corridorSummary:
          shippingDest === 'US'
            ? 'USA Express $25 flat (≤2 kg), 3–5 business days, cold-pack insulated, Pack ×10 volume savings (-15% to -52%), RP-HPLC ≥99.0% CoA'
            : shippingDest === 'AE'
            ? 'UAE / GCC Express $80 (≤2 kg), 3–5 business days, cold-pack insulated, Pack ×10 volume savings'
            : 'Europe Express €60 (≤2 kg), 2–4 business days, cold-pack insulated, Pack ×10 volume savings',
      },
      bottomBar: {
        // Mutual exclusion: hide GlobalBottomStickyBar while PeptidesBottomCartDock is active
        hidden: totalCartCount > 0,
        summaryTitle: isEs ? 'Tarifa Oficial de Péptidos' : 'Official Peptides Schedule',
        summarySubtitle: `${currency} · ${shippingDest} · Atlas Health Services`,
        atlasAiLabel: isEs ? 'Consultar a Atlas AI' : 'Ask Atlas AI',
        onOpenAtlasAi: () => setIsAtlasAiOpen(true),
        showSections: true,
        sectionsLabel: isEs ? 'Categorías' : 'Categories',
        onOpenSections: () => {
          if (typeof window !== 'undefined' && window.innerWidth <= 900) {
            setIsCategorySheetOpen(true);
          } else {
            setIsSidebarOpen((prev) => !prev);
          }
        },
        primaryAction: {
          label: isEs ? 'Tarifa PDF' : 'PDF Schedule',
          onClick: () => setIsPdfPreviewOpen(true),
        },
      },
    },
    [isEs, totalCartCount, currency, shippingDest, isDistributor, selectedCategory, selectedFdaStatus, filteredProducts.length]
  );

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

  const handleCopyWhatsAppPitch = async () => {
    if (typeof window === 'undefined') return;
    const specObj = selectedSpecialty && selectedSpecialty !== 'all' ? MEDICAL_SPECIALTIES[selectedSpecialty] : null;
    const specTitle = specObj
      ? (isEs ? specObj.labelEs : specObj.labelEn)
      : (isEs ? 'Péptidos Clínicos Liofilizados' : 'Clinical Lyophilized Peptides');
    const url = window.location.href;
    const pitch = isEs
      ? `Buenos días Dr./Dra.,\n\nComparto el enlace directo a nuestra tarifa oficial B2B para clínicas de ${specTitle} (${currency}):\n\n• Tarifario ${specTitle}:\n${url}\n\nIncluye viales liofilizados estériles (10R) con pureza analítica ≥99,0% HPLC, ahorro por volumen en Pack ×10, ficha técnica y CoA por lote.\n\nQuedo a su disposición para cualquier consulta o proforma.`
      : `Good morning Dr.,\n\nI am sharing a direct link to our official physician & clinic B2B schedule for ${specTitle} (${currency}):\n\n• ${specTitle} Schedule:\n${url}\n\nIncludes sterile 10R lyophilized peptide vials (≥99.0% HPLC verified), Pack ×10 volume pricing, clinical monographs, and batch CoAs.\n\nPlease let me know if you need any CoAs or proforma coordination.`;
    try {
      await navigator.clipboard.writeText(pitch);
      setCopiedPitch(true);
      toast.success(isEs ? 'Mensaje para WhatsApp copiado ✓' : 'WhatsApp physician pitch copied ✓');
      setTimeout(() => setCopiedPitch(false), 2500);
    } catch {
      toast.error(isEs ? 'No se pudo copiar el mensaje' : 'Could not copy pitch');
    }
  };

  const handleOpenPatientQr = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('open-global-qr-modal', {
      detail: {
        url: `${window.location.origin}/vials?view=patient${isEs ? '&lang=es' : ''}`,
        title: isEs ? 'QR Guía para Pacientes' : 'Patient Directory QR Code',
        subtitle: isEs
          ? 'Guía compartible para pacientes: reconstitución y uso (sin precios B2B)'
          : 'Shareable patient-only peptide & reconstitution guides (no B2B pricing)',
      },
    }));
  };

  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (Object.keys(cartItems).length === 0) {
      toast.error(isEs ? 'Tu proforma está vacía. Selecciona productos primero.' : 'Your order request is empty. Please select products first.');
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
      const activeFx = fxRate || 1;
      const subtotalActive = Number((subtotalUsd * activeFx).toFixed(2));
      const finalShippingActive = totalUnits > 0 ? Number(shippingCostCurrentCurrency.toFixed(2)) : 0;
      const finalGrandTotalActive = Number((subtotalActive + finalShippingActive).toFixed(2));

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
          shippingCode: shippingDest,
          referralCode: referralCode || 'CAT-RX-7482',
          trackingCode: trackingCode || (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('tc') : null) || referralCode,
          catalogId: trackingCode || (typeof window !== 'undefined' ? new URL(window.location.href).searchParams.get('tc') : null) || null,
          source: 'public_peptides_price_schedule',
          collection: 'vials',
          subtotal: subtotalActive,
          shippingCost: finalShippingActive,
          shippingCostEur: activeShippingCorridor?.eurCost || 60,
          grandTotal: finalGrandTotalActive,
          totalAmountUsd: finalGrandTotalUsd,
          totalUnits,
          currency,
          currencySymbol,
          company_fax: orderForm.company_fax || ''
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Could not submit order proforma');
      }

      const resData = await res.json().catch(() => ({}));
      const assignedRef = resData.orderCode || resData.orderId || resData.orderNumber || resData.id || `PO-${referralCode || 'B2B'}-${Date.now().toString().slice(-4)}`;

      setSubmittedOrderData({
        referenceId: assignedRef,
        customerName: orderForm.name,
        customerEmail: orderForm.email,
        customerPhone: orderForm.phone,
        itemsCount: totalUnits,
        grandTotal: finalGrandTotalActive,
        grandTotalUsd: finalGrandTotalUsd,
        currency,
        currencySymbol,
        shippingDestination: fullAddress
      });

      toast.success(
        isEs
          ? '¡Solicitud de proforma enviada! Nuestro equipo logístico médico te contactará en menos de 24 horas.'
          : 'Proforma request submitted! Our medical logistics team will contact you within 24 hours.'
      );
      setCartItems({});
      try {
        localStorage.removeItem(storageKey);
      } catch (storageErr) {
        console.warn('Could not clear storage cart:', storageErr);
      }
    } catch (err) {
      console.error('Order submission error:', err);
      toast.error(err.message || (isEs ? 'No se pudo enviar el pedido. Inténtalo de nuevo.' : 'Unable to send order. Please try again or contact support.'));
    } finally {
      setSubmittingOrder(false);
    }
  };

  const { isAdmin, pricingRole, market: sessionMarket, isSimulating, resolve: resolveProduct } = usePricing();

  // Sync shipping corridor automatically when Admin simulates a Market or logged-in user has a regional market
  useEffect(() => {
    if (!isSimulating && sessionMarket === 'global') return;
    const mappedDest = sessionMarket === 'us' ? 'US' : (sessionMarket === 'uae' || sessionMarket === 'qatar') ? 'AE' : 'EU';
    if (mappedDest !== shippingDest) {
      handleShippingDestChange(mappedDest);
    }
  }, [sessionMarket, isSimulating]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = useMemo(() => {
    return getPeptidesColumns({
      cartItems,
      handleAddToCart,
      updateItemQuantity,
      formatPrice,
      currency,
      isEs,
      isAdmin,
      pricingRole,
      resolveProduct
    });
  }, [formatPrice, handleAddToCart, updateItemQuantity, currency, cartItems, isEs, isAdmin, pricingRole, resolveProduct]);

  const handleRenderExpandable = useCallback((row) => {
    return renderPeptideClinicalDetail(row, {
      lang,
      currency,
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
  }, [lang, currency, setSearchQuery]);

  // Listen to bottom navigation dock 'Filters' button event
  useEffect(() => {
    const handleOpenFilters = () => {
      setIsCategorySheetOpen(true);
    };
    window.addEventListener('atlas-open-page-filters', handleOpenFilters);
    return () => window.removeEventListener('atlas-open-page-filters', handleOpenFilters);
  }, []);

  return (
    <div className="colway-price-root atlas-page-bg peptides-b2b-portal">
      {/* ── Unified Atlas Public Header (Same shell across all 5 clinical & pricing screens) ── */}
      <PublicUnifiedHeader
        brandHref="/pricing"
        loginRedirect="/pricing/peptides"
        lang={lang}
        onLangChange={handleLanguageChange}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        hideAiButton={false}
        hideContactButton={true}
        breadcrumb={[
          { label: isEs ? 'Tarifas B2B' : 'B2B Schedules', href: '/pricing' },
          { label: isEs ? 'Péptidos Clínicos' : 'Clinical Peptides' },
        ]}
      />

      {/* ── Unified Clinical Format Switcher (1-Click Navigation & Inline Table/Cards Toggle) ── */}
      <CatalogPricingBridgeBar
        activeMode={viewMode === 'cards' ? 'catalog' : 'pricing'}
        slug="peptides"
        lang={lang}
        onViewModeChange={handleViewModeChange}
      />

      <main className="atlas-page-shell peptides-main-container">
        {/* Page Header (Consolidated Hero & Action Toolbar) */}
        <PeptidesPageHeader
          isDistributor={isDistributor}
          isEs={isEs}
          copied={copied}
          copiedPitch={copiedPitch}
          setInquiryProductContext={setInquiryProductContext}
          setIsInquiryDrawerOpen={setIsInquiryDrawerOpen}
          setIsPdfPreviewOpen={setIsPdfPreviewOpen}
          handleShareSchedule={handleShareSchedule}
          handleCopyWhatsAppPitch={handleCopyWhatsAppPitch}
          handleOpenPatientQr={handleOpenPatientQr}
        />

        {/* Responsive Layout Styles (Google Cloud Mobile UX Standard) */}
        <style dangerouslySetInnerHTML={{ __html: `
          .gcp-pricing-portal-layout { display: flex; gap: 1.25rem; align-items: flex-start; width: 100%; }
          .gcp-pricing-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 0.85rem; position: sticky; top: 72px; }
          .gcp-pricing-workspace { flex: 1; min-width: 0; display: flex; flex-direction: column; }
          .gcp-search-and-category-block { order: 1; width: 100%; min-width: 0; }
          .gcp-kpis-summary-block { order: 2; width: 100%; min-width: 0; }
          .gcp-table-block { order: 3; width: 100%; min-width: 0; }
          .peptides-mobile-category-strip, .peptides-mobile-quick-filters-rail, .peptides-hero-mobile-meta-toggle { display: none; }
          .mobile-only-category-selector, .mobile-nav-drawer-trigger, .mobile-only-header-actions { display: none; }
          .peptides-hero-actions-wrap { width: 100%; display: flex; flex-direction: column; gap: 8px; }
          .peptides-hero-actions-grid { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
          .peptides-hero-btn { height: 36px; padding: 0 13px; border-radius: 6px; font-size: 0.80rem; font-weight: 650; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; }
          .peptides-hero-btn-primary { font-weight: 750; }
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
            .peptides-mobile-category-strip { display: flex !important; align-items: center; gap: 6px; overflow-x: auto; padding: 2px 22px 6px 0; scrollbar-width: none; -webkit-overflow-scrolling: touch; -webkit-mask-image: linear-gradient(to right, #000 88%, transparent 100%); mask-image: linear-gradient(to right, #000 88%, transparent 100%); }
            .peptides-mobile-category-strip::-webkit-scrollbar { display: none; }
            .peptides-mob-cat-pill { display: inline-flex; align-items: center; gap: 5px; padding: 8px 12px; min-height: 40px; border-radius: 999px; border: 1px solid #dadce0; background: #ffffff; color: #3c4043; font-size: 0.75rem; font-weight: 700; white-space: nowrap; flex-shrink: 0; cursor: pointer; }
            .peptides-mob-cat-pill.active { background: #e8f0fe; border-color: #1a73e8; color: #1a73e8; }
            .peptides-mob-cat-count { font-size: 0.65rem; background: #f1f5f9; color: #475569; padding: 1px 6px; border-radius: 999px; font-variant-numeric: tabular-nums; }
            .peptides-mob-cat-pill.active .peptides-mob-cat-count { background: #1a73e8; color: #ffffff; }
            .peptides-mobile-quick-filters-rail { display: none !important; }
            .peptides-mob-rail-chip { display: inline-flex; align-items: center; justify-content: space-between; gap: 5px; padding: 8px 11px; min-height: 44px; border-radius: 8px; border: 1px solid #dadce0; background: #ffffff; color: #3c4043; font-size: 0.75rem; font-weight: 700; cursor: pointer; min-width: 0; }
            .peptides-mob-rail-chip.active { border-color: #1a73e8; background: #e8f0fe; color: #1a73e8; }
            .peptides-kpis-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
            .gcp-table-block { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .ptr-container { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .data-table-mobile-cards { width: 100% !important; max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
            .peptide-mobile-tiles-grid { width: 100% !important; max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 768px) {
            .mobile-hide, .desktop-only-utilities, .desktop-only-currency { display: none !important; }
            .mobile-only-header-actions, .mobile-only-sticky-bar { display: inline-flex !important; }
            .peptides-page-header { margin-bottom: 0.55rem !important; }
            .peptides-mobile-category-strip { display: flex !important; margin-bottom: 6px !important; }
            .peptides-mobile-quick-filters-rail { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 6px !important; margin-bottom: 6px !important; }
            .gcp-kpis-summary-block { display: block !important; padding: 8px 10px !important; margin-bottom: 0.6rem !important; }
            .gcp-kpis-summary-block .mobile-kpi-summary-strip { display: flex !important; }
            .gcp-kpis-summary-block .mobile-kpi-collapsed { display: none !important; }
            .gcp-kpis-summary-block .mobile-scope-hidden { display: none !important; }
            .peptides-b2b-portal .peptides-nav-container { padding: 6px 12px !important; gap: 8px !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center !important; justify-content: space-between !important; height: 48px !important; }
            .peptides-b2b-portal .peptides-nav-left { width: auto !important; flex: 0 1 auto !important; min-width: 0 !important; display: flex !important; align-items: center !important; justify-content: flex-start !important; gap: 8px !important; }
            .peptides-b2b-portal .peptides-nav-actions { width: auto !important; flex: 0 0 auto !important; display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center !important; justify-content: flex-end !important; gap: 6px !important; }
            .peptides-main-container { padding: 0.5rem 0.5rem 6.5rem 0.5rem !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; box-sizing: border-box !important; }
            .gcp-search-and-category-block { order: 1 !important; margin-bottom: 0.4rem !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
            .gcp-table-block { order: 2 !important; width: 100% !important; max-width: 100% !important; min-width: 0 !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; border: 1px solid #e2e8f0 !important; border-radius: 8px !important; }
            .gcp-table-block table { min-width: 650px !important; }
            .ptr-container { width: 100% !important; max-width: 100% !important; min-width: 0 !important; }
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
            {/* Search, Mobile Category Strip & Unified Filter Rail */}
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
              selectedFdaStatus={selectedFdaStatus}
              setSelectedFdaStatus={setSelectedFdaStatus}
              setIsFdaSheetOpen={setIsFdaSheetOpen}
              setIsCategorySheetOpen={setIsCategorySheetOpen}
              shippingDest={shippingDest}
              handleShippingDestChange={handleShippingDestChange}
              selectedStrength={selectedStrength}
              setSelectedStrength={setSelectedStrength}
              selectedSpecialty={selectedSpecialty}
              setSelectedSpecialty={setSelectedSpecialty}
              groupByCategory={groupByCategory}
              setGroupByCategory={setGroupByCategory}
              currency={currency}
              isDistributor={isDistributor}
              onOpenAtlasAi={() => setIsAtlasAiOpen(true)}
              onOpenBulkQuote={() => {
                setInquiryProductContext({
                  productName: isEs ? 'Cotización Volumen 50+ Viales' : 'Custom Bulk Quote (50+ / 100+ Vials)',
                  dosage: `${shippingDest} · ${currency}`,
                  unitPrice: 0,
                  pack10Price: 0,
                });
                setIsInquiryDrawerOpen(true);
              }}
              onExportCsv={() => {
                try {
                  const headers = ['Peptide', 'Strength', 'Category', 'FDA Status', `Unit (${currency})`, `Pack x10 (${currency})`, 'Savings %'];
                  const rows = filteredProducts.map((p) => {
                    const unit = formatPrice ? formatPrice(p.unitPrice || p.wholesalePriceUsd || 0) : '';
                    const pack = formatPrice ? formatPrice(p.pack10Price || 0) : '';
                    const savePct = p.savingsPct ? `${p.savingsPct}%` : '';
                    return [
                      `"${String(p.name || p.productName || '').replace(/"/g, '""')}"`,
                      `"${String(p.dosage || p.strength || '').replace(/"/g, '""')}"`,
                      `"${String(p.categoryLabel || p.categoryKey || '').replace(/"/g, '""')}"`,
                      `"${String(p.fdaStatus || 'Research').replace(/"/g, '""')}"`,
                      `"${unit}"`,
                      `"${pack}"`,
                      `"${savePct}"`,
                    ].join(',');
                  });
                  const csv = [headers.join(','), ...rows].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Atlas_Peptides_${shippingDest}_${currency}_Schedule.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success(isEs ? 'Tarifa CSV descargada ✓' : 'CSV Schedule exported ✓');
                } catch {
                  toast.error(isEs ? 'Error al exportar CSV' : 'Could not export CSV');
                }
              }}
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

            {/* Peptide DataTable or Unified Visual Cards Grid */}
            <div className="gcp-table-block" style={{ background: viewMode === 'cards' ? 'transparent' : '#ffffff', borderRadius: '10px', border: viewMode === 'cards' ? 'none' : '1px solid #e2e8f0', overflowX: 'clip', boxShadow: viewMode === 'cards' ? 'none' : '0 1px 3px rgba(0,0,0,0.03)' }}>
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
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
                        setSelectedSpecialty('all');
                      }
                    }}
                  />
                </div>
              ) : viewMode === 'cards' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '12px',
                    width: '100%'
                  }}
                >
                  {filteredProducts.map((row) => (
                    <PeptideMobileCard
                      key={row.id}
                      row={row}
                      handleAddToCart={handleAddToCart}
                      updateItemQuantity={updateItemQuantity}
                      cartItems={cartItems}
                      formatPrice={formatPrice}
                      currency={currency}
                      currencySymbol={currencySymbol}
                      lang={lang}
                      onOpenSpecs={setSelectedSpecsProduct}
                      onOpenAi={(prod) => {
                        setAiContextProduct(prod);
                        setIsAtlasAiOpen(true);
                      }}
                      onInquire={(prod) => {
                        setInquiryProductContext(prod);
                        setIsInquiryDrawerOpen(true);
                      }}
                      onFilterByPeptide={(name) => {
                        setSearchQuery(name);
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                    />
                  ))}
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
                  mobileView="cards"
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
        formErrors={formErrors}
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

      {/* Bottom Sheets (Category, FDA Status, Shipping Corridor & Dosage for Mobile) */}
      <PeptidesFilterSheets
        isCategorySheetOpen={isCategorySheetOpen}
        setIsCategorySheetOpen={setIsCategorySheetOpen}
        isFdaSheetOpen={isFdaSheetOpen}
        setIsFdaSheetOpen={setIsFdaSheetOpen}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedFdaStatus={selectedFdaStatus}
        setSelectedFdaStatus={setSelectedFdaStatus}
        shippingDest={shippingDest}
        setShippingDest={handleShippingDestChange}
        selectedStrength={selectedStrength}
        setSelectedStrength={setSelectedStrength}
        selectedSpecialty={selectedSpecialty}
        setSelectedSpecialty={setSelectedSpecialty}
        groupByCategory={groupByCategory}
        setGroupByCategory={setGroupByCategory}
        processedProducts={processedProducts}
        filteredCount={filteredProducts.length}
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
                    : (isEs ? `Tarifa Oficial de Péptidos B2B (${processedProducts.length} Formulaciones)` : `Official Peptide B2B Schedule (${processedProducts.length} Formulations)`),
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
      <div>
        <PublicUnifiedFooter />
      </div>
    </div>
  );
}
