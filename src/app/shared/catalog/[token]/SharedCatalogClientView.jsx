'use client';

import React from 'react';
import {
  CheckCircle2,
  FlaskConical,
  ShieldCheck,
  Package,
  ClipboardList,
  Trash2,
  Send,
  X,
  Lock,
  Building2,
  Download,
  MessageSquare,
  Search
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { resolveVariantClinicalImage } from '@/utils/clinicalImageResolver';
import { sortVariantsAscending } from '@/utils/variantSorter';
import {
  useSharedCatalogState,
  SHIPPING_DESTINATIONS,
} from '../../../../hooks/data/useSharedCatalogState';
import AlgoliaRecommendCrossSell from '@/components/catalog/AlgoliaRecommendCrossSell';
import PharmaBarcodeStamp from '@/components/catalog/PharmaBarcodeStamp';
import { generatePharmaCatalogCode, generatePharmaBatchCode } from '@/utils/pharmaBarcode';
import { buildTranslator, getPersistedLang, persistLang, SUPPORTED_LANGS } from './catalogI18n';
import { ProtocolPreviewModal } from '@/components/protocol/ProtocolPreviewModal';
// ── Extracted sub-components ──────────────────────────────────────────────────
import SharedCatalogStyles from './components/SharedCatalogStyles';
import SharedCatalogTopNav from './components/SharedCatalogTopNav';
import SharedCatalogHeader from './components/SharedCatalogHeader';
import SharedCatalogFilterBar from './components/SharedCatalogFilterBar';
import SharedCatalogProductCard from './components/SharedCatalogProductCard';
import SharedCatalogProductListRow from './components/SharedCatalogProductListRow';
import SharedCatalogFloatingDock from './components/SharedCatalogFloatingDock';
import PublicAtlasAIDrawer from '@/components/shared/PublicAtlasAIDrawer';

function getPharmaMarginTheme(priceSource, meta = {}) {
  const margin = Number(meta?.margin || meta?.marginPercent || 0);
  const src = (priceSource || meta?.priceSource || '').toLowerCase();

  if (src === 'cost' || src === 'b2b-dir') {
    return {
      tierCode: 'INSTITUTIONAL DIRECT',
      tierLabel: 'Institutional Direct',
      gradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #047857 100%)',
      borderColor: 'rgba(52, 211, 153, 0.35)',
      glow: 'rgba(16, 185, 129, 0.25)',
      accentColor: '#6ee7b7',
      pillBg: 'rgba(6, 78, 59, 0.6)',
    };
  }
  if (src === 'wholesaler' || src === 'wholeseller') {
    return {
      tierCode: margin ? `WHOLESALE (+${margin}%)` : 'WHOLESALE',
      tierLabel: margin ? `Wholesale (+${margin}%)` : 'Wholesale Portfolio',
      gradient: 'linear-gradient(135deg, #00284d 0%, #003666 50%, #0284c7 100%)',
      borderColor: 'rgba(56, 189, 248, 0.35)',
      glow: 'rgba(14, 165, 233, 0.25)',
      accentColor: '#7dd3fc',
      pillBg: 'rgba(2, 132, 199, 0.25)',
    };
  }
  if (src === 'clinic') {
    return {
      tierCode: margin ? `CLINICAL (+${margin}%)` : 'CLINICAL',
      tierLabel: margin ? `Clinical (+${margin}%)` : 'Clinical Healthcare Terms',
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
      borderColor: 'rgba(165, 180, 252, 0.35)',
      glow: 'rgba(99, 102, 241, 0.25)',
      accentColor: '#c7d2fe',
      pillBg: 'rgba(67, 56, 202, 0.25)',
    };
  }
  if (src === 'retail') {
    return {
      tierCode: 'REFERENCE',
      tierLabel: 'Reference Portfolio (MSRP)',
      gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)',
      borderColor: 'rgba(212, 212, 216, 0.35)',
      glow: 'rgba(161, 161, 170, 0.25)',
      accentColor: '#e4e4e7',
      pillBg: 'rgba(63, 63, 70, 0.3)',
    };
  }
  return {
    tierCode: 'INSTITUTIONAL',
    tierLabel: 'Verified Institutional Terms',
    gradient: 'linear-gradient(135deg, #00284d 0%, #004d80 50%, #003366 100%)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    glow: 'rgba(0, 0, 0, 0.2)',
    accentColor: '#93c5fd',
    pillBg: 'rgba(255, 255, 255, 0.12)',
  };
}

function getRelatedProtocols(product, allProtocols) {
  if (!allProtocols || allProtocols.length === 0 || !product) return [];
  const prodNameLower = (product.canonicalName || product.name || '').toLowerCase().trim();
  const prodSlugLower = (product.slug || product.id || '').toLowerCase().trim();
  const cleanTokens = prodNameLower
    .replace(/[^a-z0-9\s-]/gi, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !['vial', 'mg', 'peptide', 'blend', 'spray', 'capsule', 'pen', 'solution'].includes(t));

  return allProtocols.filter(proto => {
    const compounds = Array.isArray(proto.compounds) ? proto.compounds : [];
    const hasMatchingCompound = compounds.some(c => {
      const cName = (typeof c === 'string' ? c : (c?.name || c?.drugName || '')).toLowerCase();
      if (!cName) return false;
      if (cName.includes(prodNameLower) || prodNameLower.includes(cName)) return true;
      return cleanTokens.some(tok => cName.includes(tok));
    });
    if (hasMatchingCompound) return true;
    const titleLower = (proto.title || proto.name || '').toLowerCase();
    if (titleLower.includes(prodNameLower) || (prodSlugLower && titleLower.includes(prodSlugLower))) return true;
    if (cleanTokens.length > 0 && cleanTokens.some(tok => titleLower.includes(tok))) return true;
    return false;
  });
}

export default function SharedCatalogClientView({
  catalogMeta,
  products = [],
  protocols = [],
  currency = 'USD',
  priceSource = 'wholesaler',
  includePrices = true
}) {
  const {
    activeTab, setActiveTab,
    searchQuery, setSearchQuery,
    selectedGoal, setSelectedGoal,
    selectedGoals, setSelectedGoals,
    toggleGoal, clearGoals,
    availableGoals,
    selectedCategory, setSelectedCategory,
    dosageFilter, setDosageFilter,
    packagingMode, setPackagingMode,
    routeFilter, setRouteFilter,
    currentCurrency, setCurrentCurrency,
    selectedShipping, setSelectedShipping,
    activeShipping,
    shippingCost,
    fxMultiplier,
    currencySymbol,
    isCartOpen, setIsCartOpen,
    isCheckoutModalOpen, setIsCheckoutModalOpen,
    copiedToast,
    isGeneratingPdf, setIsGeneratingPdf,
    isGeneratingProForma, setIsGeneratingProForma,
    checkoutForm, setCheckoutForm,
    cart,
    cartItems,
    cartTotalUnits,
    cartTotalPrice,
    grandTotal,
    updateQuantity,
    clearCart,
    categories,
    filteredProducts,
    filteredProtocols,
    totalVariants,
    priceTierLabel,
    handleCopyOrderSummary,
    handleConfirmWhatsApp,
    isProtocolCatalog,
  } = useSharedCatalogState({
    catalogMeta,
    products,
    protocols,
    currency,
    priceSource,
    includePrices,
  });

  const { user, activeRole, logout } = useAuth();
  const isAuthenticated = Boolean(user && user.uid && activeRole !== 'guest');

  const catalogId = catalogMeta?.catalogId || 'catalog';
  const [shareUrl, setShareUrl] = React.useState('');

  // ── Language toggle (EN by default, ES optional) ──────────────────────────
  const [lang, setLang] = React.useState('en');
  React.useEffect(() => {
    const persisted = getPersistedLang();
    setLang(persisted);
  }, []);
  const t = buildTranslator(lang);
  const handleLangToggle = (newLang) => {
    setLang(newLang);
    persistLang(newLang);
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const cleanPath = catalogMeta?.catalogId ? `/c/${catalogMeta.catalogId}` : window.location.pathname;
      setShareUrl(`${origin}${cleanPath}`);
    }
  }, [catalogMeta?.catalogId]);

  const catalogCode = React.useMemo(() => {
    return catalogMeta?.catalogCode || catalogMeta?.batchCode || generatePharmaCatalogCode({
      supplierId: catalogMeta?.supplierId,
      catalogueFilter: catalogMeta?.catalogueFilter,
      issuedAt: catalogMeta?.issuedAt || catalogMeta?.iat,
      priceMarkupPercent: catalogMeta?.priceMarkupPercent || 0,
      prefix: 'RP'
    });
  }, [catalogMeta]);
  const batchCode = catalogCode;

  const [isGoalDropdownOpen, setIsGoalDropdownOpen] = React.useState(false);
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = React.useState(false);

  const pharmaMarginTheme = React.useMemo(() => {
    return getPharmaMarginTheme(priceSource, catalogMeta);
  }, [priceSource, catalogMeta]);

  const [showProtocolsUnderProducts, setShowProtocolsUnderProducts] = React.useState(false);
  const [onlyWithProtocols, setOnlyWithProtocols] = React.useState(false);
  const [selectedPublicProtocol, setSelectedPublicProtocol] = React.useState(null);

  const productsWithProtocolsCount = React.useMemo(() => {
    if (!protocols || protocols.length === 0) return 0;
    return (filteredProducts || []).filter(prod => getRelatedProtocols(prod, protocols).length > 0).length;
  }, [filteredProducts, protocols]);

  const displayedProducts = React.useMemo(() => {
    if (!onlyWithProtocols) return filteredProducts || [];
    return (filteredProducts || []).filter(prod => getRelatedProtocols(prod, protocols).length > 0);
  }, [filteredProducts, onlyWithProtocols, protocols]);

  // Dual view mode: 'list' (default) vs 'cards'
  const [viewMode, setViewMode] = React.useState('list');
  const [expandedProductIds, setExpandedProductIds] = React.useState(() => new Set());
  const toggleExpandedProduct = React.useCallback((id) => {
    setExpandedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const groupedProducts = React.useMemo(() => {
    if (!displayedProducts || displayedProducts.length === 0) return [];

    const activeGoalBuckets = selectedGoals && selectedGoals.length > 0
      ? availableGoals.filter(g => selectedGoals.includes(g.id))
      : availableGoals;

    const groups = [];
    const placedProductIds = new Set();

    (activeGoalBuckets || []).forEach(goal => {
      const matching = displayedProducts.filter(p => p.canonicalGoals?.includes(goal.id));
      if (matching.length > 0) {
        matching.forEach(p => placedProductIds.add(p.id));
        groups.push({
          goal,
          products: matching
        });
      }
    });

    const remainder = displayedProducts.filter(p => !placedProductIds.has(p.id));
    if (remainder.length > 0) {
      groups.push({
        goal: { id: 'other', label: 'General Formulations & Research Standards', count: remainder.length },
        products: remainder
      });
    }

    return groups;
  }, [displayedProducts, availableGoals, selectedGoals]);

  // ── Clinic Portal Registration Modal State ───────────────────────────────
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const [registerForm, setRegisterForm] = React.useState({
    clinicName: '', // Always generic and empty by default, never pre-filled with vendor/portal names
    contactName: '',
    email: '',
    phone: '',
    country: '',
    specialty: 'Anti-Aging & Longevity Medicine',
    licenseNumber: '',
    estimatedMonthlyVolume: '25 - 100 vials / month',
    notes: ''
  });
  const [isSubmittingRegister, setIsSubmittingRegister] = React.useState(false);
  const [registerSubmitted, setRegisterSubmitted] = React.useState(false);
  const [registerApplicationId, setRegisterApplicationId] = React.useState('');
  const [registerError, setRegisterError] = React.useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!registerForm.clinicName || !registerForm.contactName || !registerForm.email) {
      setRegisterError('Please complete all required fields (Clinic Name, Lead Practitioner, Professional Email).');
      return;
    }
    setIsSubmittingRegister(true);
    setRegisterError('');
    try {
      const res = await fetch('/api/portal/access-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...registerForm,
          referralSource: `shared_catalog_${catalogMeta?.catalogId || 'direct'}`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }
      setRegisterApplicationId(data.id || '');
      setRegisterSubmitted(true);
    } catch (err) {
      console.error('Registration submission error:', err);
      setRegisterError(err.message || 'Error submitting application. Please try again.');
    } finally {
      setIsSubmittingRegister(false);
    }
  };

  // ── Telemetry: Page-view beacon — fires once on mount, non-blocking ─────────
  React.useEffect(() => {
    if (!catalogMeta?.catalogId) return;
    const payload = JSON.stringify({
      event: 'view',
      id: catalogMeta.catalogId,
      viewedAt: new Date().toISOString(),
      referrer: (typeof document !== 'undefined' ? document.referrer : '') || '',
      screen: typeof window !== 'undefined'
        ? `${window.innerWidth}x${window.innerHeight}`
        : null,
      userAgent: typeof navigator !== 'undefined'
        ? navigator.userAgent.slice(0, 150)
        : '',
    });
    // sendBeacon is fire-and-forget, won't block navigation or main thread
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/catalog/tracking-logs',
        new Blob([payload], { type: 'application/json' })
      );
    } else {
      // Fallback for environments that don't support sendBeacon
      fetch('/api/catalog/tracking-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only — intentionally omitting catalogMeta to fire once

  // ── Telemetry: Report cart interactions to backend for engagement tracking ──
  React.useEffect(() => {
    if (!catalogMeta?.catalogId || !cartItems || cartItems.length === 0) return;
    const timer = setTimeout(() => {
      fetch('/api/catalog/tracking-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'cart_update',
          catalogId: catalogMeta.catalogId,
          cartItemsCount: cartItems.length,
          cartItems: cartItems.map(c => ({
            name: c.productName || 'Compound',
            qty: c.quantity || 1,
            price: c.unitPrice || 0
          }))
        })
      }).catch(() => {});
    }, 2500);
    return () => clearTimeout(timer);
  }, [cartItems, catalogMeta?.catalogId]);

  // ── Catalog PDF download — uses fetch+NDJSON streaming ──
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: 'catalog',
          productIds: products.map(p => p.id),
          batchCode,
          includePrices,
          priceTier: priceSource,
          currency: currentCurrency,
          recipientName: catalogMeta?.recipientName,
          recipientType: catalogMeta?.recipientType,
          isExWorks: false,
          incoterm: 'DAP',
          showKitPrice: true,
          kitSize: 10,
          showPricePerMg: false,
          showWarehouse: false,
          showDescription: true,
          showSupplier: false,
          showDosage: true,
          showPresentation: true,
          showPurity: true,
          shippingNote: `Delivered Priority Freight ([${activeShipping.code}] ${(activeShipping.label || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim()}): +${currencySymbol}${shippingCost.toFixed(2)} ${currentCurrency}`,
          supplierFilter: catalogMeta?.supplierId || null,
          category: catalogMeta?.category || null,
          accountManagerName: catalogMeta?.accountManagerName && catalogMeta.accountManagerName !== 'Atlas Commercial Desk' ? catalogMeta.accountManagerName : null,
          accountManagerEmail: catalogMeta?.accountManagerEmail && catalogMeta.accountManagerEmail !== 'orders@atlas-solutions.com' ? catalogMeta.accountManagerEmail : null
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let finalUrl = null;
      let directBase64 = null;
      let downloadFilename = `Atlas_Health_Official_Catalog_${new Date().toISOString().split('T')[0]}.pdf`;

      while (true) {
        const { value, done } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.type === 'done') {
                if (data.filename) downloadFilename = data.filename;
                if (data.pdfBase64) directBase64 = data.pdfBase64;
                if (data.meta?.url) finalUrl = data.meta.url;
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (e) {
              console.warn('NDJSON parsing chunk error:', e);
            }
          }
        }
        if (done) break;
      }

      if (directBase64) {
        try {
          const byteCharacters = atob(directBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = downloadFilename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        } catch (b64Err) {
          console.warn('Direct base64 blob dump failed, falling back to URL:', b64Err);
          if (finalUrl) window.open(finalUrl, '_blank');
        }
      } else if (finalUrl) {
        try {
          const pdfRes = await fetch(finalUrl);
          const pdfBlob = await pdfRes.blob();
          const blobUrl = window.URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = downloadFilename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        } catch {
          window.open(finalUrl, '_blank');
        }
      } else {
        throw new Error('PDF generation completed without returning a valid URL or payload.');
      }
    } catch (err) {
      console.error('Error downloading PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // ── Pro-forma PDF — uses dynamic imports ──
  const handleDownloadProFormaPdf = async (customDetails = {}) => {
    if (cartItems.length === 0) return;
    setIsGeneratingProForma(true);
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const quoteId = `EST-${Date.now().toString(36).substring(2, 8).toUpperCase()}`;
      const clinicName = customDetails.clinicName || checkoutForm.clinicName || catalogMeta?.recipientName || 'Valued Clinical Partner';
      const address = customDetails.deliveryAddress || checkoutForm.deliveryAddress || '';
      const cityCountry = customDetails.cityCountry || checkoutForm.cityCountry || '';
      const vat = customDetails.vatTaxId || checkoutForm.vatTaxId || '';

      doc.setFillColor(0, 54, 102);
      doc.rect(0, 0, 210, 36, 'F');
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 36, 210, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('ATLAS HEALTH', 14, 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(224, 242, 254);
      doc.text('Official Clinical Formulations & Specialty Quotation', 14, 22);
      const validContactEmail = catalogMeta?.accountManagerEmail &&
        catalogMeta.accountManagerEmail !== 'orders@atlas-solutions.com' &&
        catalogMeta.accountManagerEmail !== 'commercial@atlashealth.com' &&
        catalogMeta.accountManagerEmail !== 'jose@mediluxeme.com'
        ? catalogMeta.accountManagerEmail
        : null;
      if (validContactEmail) {
        doc.text(`Contact: ${validContactEmail}`, 14, 28);
      } else {
        doc.text('Institutional Orders & Dispensation Verification', 14, 28);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('PRO-FORMA INVOICE', 196, 15, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(200, 220, 245);
      doc.text(`Quote Ref: #${quoteId}`, 196, 22, { align: 'right' });
      doc.text(`Issue Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 196, 28, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('BILL TO & RECIPIENT:', 14, 46);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Clinic / Doctor: ${clinicName}`, 14, 52);
      if (vat) doc.text(`VAT / Tax ID: ${vat}`, 14, 57);
      if (address || cityCountry) doc.text(`Address: ${address}${cityCountry ? `, ${cityCountry}` : ''}`, 14, vat ? 62 : 57);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('COMMERCIAL & LOGISTICS TERMS:', 120, 46);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Pricing Tier: Clinical / Healthcare Provider`, 120, 52);
      const cleanDestLabel = (activeShipping.label || '').replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
      doc.text(`Destination: [${activeShipping.code}] ${cleanDestLabel}`, 120, 57);
      doc.text(`Payment: Wire Transfer (IBAN) / Credit Card (Stripe)`, 120, 62);

      const tableRows = cartItems.map((item, idx) => {
        const isBulk = item.quantity >= 10 && item.tier10UnitPrice && item.tier10UnitPrice > 0;
        const itemUnitPrice = (isBulk ? item.tier10UnitPrice : item.price) * fxMultiplier;
        const itemTotal = item.quantity * itemUnitPrice;
        const kits = Math.floor(item.quantity / 10);
        const singles = item.quantity % 10;
        const formatLabel = item.presentation || 'Vial';
        const packDesc = kits > 0
          ? `${kits} Kit${kits > 1 ? 's' : ''} (10 pk)${singles > 0 ? ` + ${singles} Single${singles > 1 ? 's' : ''}` : ''}`
          : `${singles} Single ${formatLabel}${singles > 1 ? 's' : ''}`;

        return [
          idx + 1,
          item.productName,
          `${item.dosage || 'Standard'}\nFormat: ${formatLabel} • ${packDesc}${isBulk ? ' [10+ Rate]' : ''}`,
          item.quantity,
          `${currencySymbol}${itemUnitPrice.toFixed(2)} ${currentCurrency}`,
          `${currencySymbol}${itemTotal.toFixed(2)} ${currentCurrency}`
        ];
      });

      doc.autoTable({
        startY: 70,
        head: [['#', 'Formulation', 'Presentation & Packaging', 'Qty', 'Unit Price', 'Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 54, 102], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 52, fontStyle: 'bold' },
          2: { cellWidth: 58 },
          3: { cellWidth: 16, halign: 'center' },
          4: { cellWidth: 26, halign: 'right' },
          5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
      });

      const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : 160;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(120, finalY, 76, 36, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(120, finalY, 76, 36, 2, 2, 'S');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Products Subtotal:', 125, finalY + 8);
      doc.text(`${currencySymbol}${cartTotalPrice.toFixed(2)}`, 190, finalY + 8, { align: 'right' });

      doc.text(`Freight (${activeShipping.code}):`, 125, finalY + 16);
      doc.text(`+${currencySymbol}${shippingCost.toFixed(2)}`, 190, finalY + 16, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(0, 54, 102);
      doc.text('Grand Total:', 125, finalY + 28);
      doc.text(`${currencySymbol}${grandTotal.toFixed(2)} ${currentCurrency}`, 190, finalY + 28, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('CONFIDENTIAL CLINICAL QUOTATION', 14, 280);
      doc.setFont('helvetica', 'normal');
      doc.text('Quotation valid for 30 calendar days from issue date. Analytical purity and clinical specifications verified.', 14, 285);

      doc.save(`Atlas_Health_ProForma_${quoteId}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating pro-forma PDF:', err);
    } finally {
      setIsGeneratingProForma(false);
    }
  };

  const [isSubmittingOrder, setIsSubmittingOrder] = React.useState(false);
  const [placedOrderCode, setPlacedOrderCode] = React.useState('');
  const [orderSubmitError, setOrderSubmitError] = React.useState('');

  const handlePlaceOrderDraft = async () => {
    if (cartItems.length === 0) return;
    setIsSubmittingOrder(true);
    setOrderSubmitError('');

    try {
      const res = await fetch('/api/orders/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          customerName: checkoutForm.clinicName || catalogMeta?.recipientName || 'Clinical Client',
          customerEmail: checkoutForm.email || '',
          customerPhone: checkoutForm.phone || '',
          customerAddress: checkoutForm.deliveryAddress || '',
          customerVat: checkoutForm.vatTaxId || '',
          customerNotes: checkoutForm.deliveryNotes || '',
          shippingDestination: activeShipping.label,
          shippingCode: activeShipping.code,
          shippingCost,
          subtotal: cartTotalPrice,
          grandTotal,
          currency: currentCurrency,
          currencySymbol,
          totalUnits: cartTotalUnits,
          catalogId: catalogMeta?.catalogId || '',
          catalogCode: catalogCode || '',
          catalogToken: token || '',
          catalogTitle: catalogMeta?.title || (catalogMeta?.recipientName ? `Catalog for ${catalogMeta.recipientName}` : 'Shared Catalog'),
          priceTier: catalogMeta?.priceTier || priceSource || 'wholesale',
          priceTierLabel: pharmaMarginTheme?.tierLabel || 'Institutional Direct',
          priceTierCode: pharmaMarginTheme?.tierCode || '',
          priceMarkupPercent: Number(catalogMeta?.priceMarkupPercent || 0),
          priceSource: priceSource || 'wholesale',
          supplierFilter: catalogMeta?.supplierId || '',
          categoryFilter: catalogMeta?.category || '',
          accountManagerName: (catalogMeta?.accountManagerName && catalogMeta.accountManagerName !== 'Atlas Commercial Desk') ? catalogMeta.accountManagerName : '',
          accountManagerEmail: (catalogMeta?.accountManagerEmail && catalogMeta.accountManagerEmail !== 'orders@atlas-solutions.com') ? catalogMeta.accountManagerEmail : '',
          accountManagerId: catalogMeta?.accountManagerId || '',
          source: 'shared_catalog'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record draft order');
      }

      setPlacedOrderCode(data.orderCode);
    } catch (err) {
      console.error('Error placing draft order:', err);
      setOrderSubmitError(err.message || 'Error submitting order to the platform.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleOpenWhatsAppCheckout = () => {
    if (cartTotalUnits === 0) return;
    setIsCheckoutModalOpen(true);
  };


  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      paddingBottom: '90px'
    }}>
      <SharedCatalogStyles />

      {/* Sandboxed Institutional Navigation Topbar */}
      <SharedCatalogTopNav
        isAuthenticated={isAuthenticated}
        user={user}
        logout={logout}
        activeRole={activeRole}
        selectedShipping={selectedShipping}
        setSelectedShipping={setSelectedShipping}
        currentCurrency={currentCurrency}
        setCurrentCurrency={setCurrentCurrency}
        currencySymbol={currencySymbol}
        activeShipping={activeShipping}
        cartTotalUnits={cartTotalUnits}
        grandTotal={grandTotal}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        t={t}
        lang={lang}
        handleLangToggle={handleLangToggle}
        setRegisterSubmitted={setRegisterSubmitted}
        setRegisterError={setRegisterError}
        setIsRegisterModalOpen={setIsRegisterModalOpen}
      />

      <div className="catalog-container">
        {/* Executive Header Card with Dynamic Pharma Margin Theme */}
        <SharedCatalogHeader
          pharmaMarginTheme={pharmaMarginTheme}
          isProtocolCatalog={isProtocolCatalog}
          catalogMeta={catalogMeta}
          products={products}
          protocols={protocols}
          totalVariants={totalVariants}
          priceTierLabel={priceTierLabel}
          isGeneratingPdf={isGeneratingPdf}
          handleDownloadPdf={handleDownloadPdf}
          catalogCode={catalogCode}
          batchCode={batchCode}
          shareUrl={shareUrl}
          showProtocolsUnderProducts={showProtocolsUnderProducts}
          setShowProtocolsUnderProducts={setShowProtocolsUnderProducts}
          setActiveTab={setActiveTab}
          t={t}
        />

        {/* Search, Goals & Format Controls */}
        <SharedCatalogFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isGoalDropdownOpen={isGoalDropdownOpen}
          setIsGoalDropdownOpen={setIsGoalDropdownOpen}
          selectedGoals={selectedGoals}
          clearGoals={clearGoals}
          availableGoals={availableGoals}
          toggleGoal={toggleGoal}
          products={products}
          isFormatDropdownOpen={isFormatDropdownOpen}
          setIsFormatDropdownOpen={setIsFormatDropdownOpen}
          packagingMode={packagingMode}
          setPackagingMode={setPackagingMode}
          dosageFilter={dosageFilter}
          setDosageFilter={setDosageFilter}
          routeFilter={routeFilter}
          setRouteFilter={setRouteFilter}
          protocols={protocols}
          productsWithProtocolsCount={productsWithProtocolsCount}
          onlyWithProtocols={onlyWithProtocols}
          setOnlyWithProtocols={setOnlyWithProtocols}
          showProtocolsUnderProducts={showProtocolsUnderProducts}
          setShowProtocolsUnderProducts={setShowProtocolsUnderProducts}
          displayedProducts={displayedProducts}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* ── MAIN CONTENT: Products (Grouped by Goals) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {displayedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔬</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>No formulations found</div>
              <p style={{ color: '#64748b', marginTop: '6px', fontSize: '0.9rem' }}>Try adjusting your search or category filters.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); clearGoals(); setPackagingMode('all'); setDosageFilter('all'); setOnlyWithProtocols(false); }}
                style={{ marginTop: '14px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '9px 18px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            groupedProducts.map(group => (
              <section key={group.goal.id} className="proto-goal-section" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Goal Section Header */}
                <div className="proto-goal-section-header" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      color: '#003666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FlaskConical size={16} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#003666', letterSpacing: '-0.01em' }}>
                        {group.goal.label}
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                        {group.products.length} {group.products.length === 1 ? 'formulation available' : 'formulations available'}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    background: '#eff6ff',
                    color: '#003666',
                    border: '1px solid #bfdbfe'
                  }}>
                    {group.products.length}
                  </span>
                </div>

                {/* Items: List Mode (Default) vs Cards Mode */}
                {viewMode === 'list' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {group.products.map(prod => (
                      <SharedCatalogProductListRow
                        key={prod.id}
                        prod={prod}
                        isExpanded={expandedProductIds.has(prod.id)}
                        onToggleExpand={() => toggleExpandedProduct(prod.id)}
                        includePrices={includePrices}
                        fxMultiplier={fxMultiplier}
                        currentCurrency={currentCurrency}
                        currencySymbol={currencySymbol}
                        packagingMode={packagingMode}
                        cart={cart}
                        updateQuantity={updateQuantity}
                        protocols={protocols}
                        setSelectedPublicProtocol={setSelectedPublicProtocol}
                        catalogMeta={catalogMeta}
                        t={t}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {group.products.map(prod => (
                      <SharedCatalogProductCard
                        key={prod.id}
                        prod={prod}
                        includePrices={includePrices}
                        fxMultiplier={fxMultiplier}
                        currentCurrency={currentCurrency}
                        currencySymbol={currencySymbol}
                        packagingMode={packagingMode}
                        cart={cart}
                        updateQuantity={updateQuantity}
                        showProtocolsUnderProducts={false}
                        protocols={protocols}
                        setSelectedPublicProtocol={setSelectedPublicProtocol}
                        catalogMeta={catalogMeta}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>

        {/* Algolia Cross-sell (optional) */}
        {cartItems.length > 0 && !isProtocolCatalog && (
          <div style={{ marginTop: '24px' }}>
            <AlgoliaRecommendCrossSell cartItems={cartItems} catalogProducts={products} onAddProduct={(prod, variant) => updateQuantity(variant, prod, 1)} />
          </div>
        )}

      </div> {/* end .catalog-container */}

      {/* ── Floating Bottom Dock ── */}
      <SharedCatalogFloatingDock
        catalogMeta={catalogMeta}
        cartTotalUnits={cartTotalUnits}
        grandTotal={grandTotal}
        currencySymbol={currencySymbol}
        currentCurrency={currentCurrency}
        activeShipping={activeShipping}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        clearCart={clearCart}
        handleCopyOrderSummary={handleCopyOrderSummary}
        copiedToast={copiedToast}
        handleOpenWhatsAppCheckout={handleOpenWhatsAppCheckout}
      />

      {/* ── Cart Review Drawer ── */}
      {isCartOpen && (
        <>
          <div className="cart-mobile-backdrop" onClick={() => setIsCartOpen(false)} />
          <div className="cart-drawer-wrapper">
            <div className="cart-drawer-container">
              <div className="cart-drawer-card">
                <div className="mobile-drag-indicator" />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={16} color="#003666" />
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Order Estimate</span>
                    <span style={{ backgroundColor: '#003666', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.74rem', fontWeight: 800 }}>{cartTotalUnits}</span>
                  </div>
                  <button type="button" onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}>
                    <X size={18} />
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.85rem' }}>No formulations added yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {cartItems.map(item => {
                      const isBulk = item.quantity >= 10 && item.tier10UnitPrice && item.tier10UnitPrice > 0;
                      const itemUnitPrice = (isBulk ? item.tier10UnitPrice : item.price) * fxMultiplier;
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', padding: '8px 12px', border: '1px solid #e2e8f0', fontSize: '0.825rem' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.dosage} • {item.quantity} {item.presentation || 'vials'}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                            <div style={{ fontWeight: 800, color: '#003666', minWidth: '56px', textAlign: 'right' }}>{currencySymbol}{(item.quantity * itemUnitPrice).toFixed(2)}</div>
                            <button type="button" onClick={() => updateQuantity({ id: item.variantId, price: item.price, tier10UnitPrice: item.tier10UnitPrice, presentation: item.presentation, dosage: item.dosage }, { id: item.productId, canonicalName: item.productName }, -item.quantity)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {cartItems.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                      <span>Subtotal ({cartTotalUnits} units)</span>
                      <span style={{ fontWeight: 700 }}>{currencySymbol}{cartTotalPrice.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                      <span>{activeShipping.flag} Freight ({activeShipping.code})</span>
                      <span style={{ fontWeight: 700 }}>+{currencySymbol}{shippingCost.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, color: '#003666', paddingTop: '4px', borderTop: '1px dashed #e2e8f0' }}>
                      <span>Grand Total (Estimate)</span>
                      <span>{currencySymbol}{grandTotal.toFixed(2)} {currentCurrency}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIsCartOpen(false); handleOpenWhatsAppCheckout(); }}
                      style={{ width: '100%', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '11px', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)' }}
                    >
                      <Send size={15} />
                      Submit Order to Platform 🚀
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {/* Checkout & Delivery Modal (Fase 3) */}
      {isCheckoutModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 100
        }}>
          <div className="checkout-modal-card" style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
            padding: '24px'
          }}>
            {placedOrderCode ? (
              <div style={{ textAlign: 'center', padding: '12px 6px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: '#16a34a'
                }}>
                  <CheckCircle2 size={36} />
                </div>

                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  Order Submitted to Platform!
                </h2>
                
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: '#003666',
                  marginBottom: '16px'
                }}>
                  Ref: #{placedOrderCode}
                </div>

                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  color: '#334155',
                  lineHeight: '1.5',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                    <CheckCircle2 size={16} color="#16a34a" /> Notification Activated in Operations Desk
                  </div>
                  <div>
                    Your order has been recorded as <strong>Pending Approval</strong>. Administration and operations have received the alert to verify inventory, issue the final pro-forma invoice, and coordinate dispatch.
                  </div>
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '0.78rem', color: '#64748b' }}>
                    Client: <strong>{checkoutForm.clinicName || catalogMeta?.recipientName}</strong> • Total: <strong>{currencySymbol}{grandTotal.toFixed(2)} {currentCurrency} ({cartTotalUnits} units)</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleDownloadProFormaPdf()}
                    disabled={isGeneratingProForma}
                    style={{
                      width: '100%',
                      backgroundColor: '#003666',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 20px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(0, 54, 102, 0.25)'
                    }}
                  >
                    <Download size={18} />
                    <span>{isGeneratingProForma ? 'Generating PDF...' : 'Download Official Pro-Forma (PDF)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmWhatsApp}
                    style={{
                      width: '100%',
                      backgroundColor: '#f0fdf4',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      borderRadius: '10px',
                      padding: '11px 20px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <MessageSquare size={17} color="#16a34a" />
                    <span>Send Backup Copy via WhatsApp (Optional)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      setPlacedOrderCode('');
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      border: 'none',
                      padding: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    Close & Continue Browsing Catalog
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                        Confirm & Submit Order to Platform
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                        Direct portal registration and immediate operations dispatch alert
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutModalOpen(false)}
                    style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Order Estimate Summary Badge */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                      Estimated Order Total
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>
                      {cartTotalUnits} units • {currencySymbol}{grandTotal.toFixed(2)} {currentCurrency}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                    {activeShipping.flag} Destination {activeShipping.code}
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Clinic / Medical Professional *
                    </label>
                    <input
                      type="text"
                      value={checkoutForm.clinicName}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, clinicName: e.target.value })}
                      placeholder="e.g. Longevity Medical Clinic / Practice Name"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Contact Person
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.contactPerson}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, contactPerson: e.target.value })}
                        placeholder="Dr. Smith"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          color: '#0f172a',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        VAT / Tax ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.vatTaxId}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, vatTaxId: e.target.value })}
                        placeholder="e.g. EU123456789"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          color: '#0f172a',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Professional Email
                      </label>
                      <input
                        type="email"
                        value={checkoutForm.email}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                        placeholder="practitioner@clinic.com"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          color: '#0f172a',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={checkoutForm.phone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          color: '#0f172a',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Delivery Address, City / Country
                    </label>
                    <input
                      type="text"
                      value={checkoutForm.deliveryAddress}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryAddress: e.target.value })}
                      placeholder="Street, Medical Facility, City, Country"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Special Instructions / Delivery Notes
                    </label>
                    <textarea
                      rows={2}
                      value={checkoutForm.deliveryNotes}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryNotes: e.target.value })}
                      placeholder="e.g. Preferred clinic delivery hours..."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        color: '#0f172a',
                        boxSizing: 'border-box',
                        resize: 'none'
                      }}
                    />
                  </div>
                </div>

                {orderSubmitError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '0.825rem',
                    color: '#b91c1c',
                    marginTop: '14px'
                  }}>
                    ⚠️ {orderSubmitError}
                  </div>
                )}

                {/* Modal Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={handlePlaceOrderDraft}
                    disabled={isSubmittingOrder}
                    style={{
                      width: '100%',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 20px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: isSubmittingOrder ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                      opacity: isSubmittingOrder ? 0.75 : 1,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Package size={18} />
                    <span>{isSubmittingOrder ? 'Submitting Order to Platform...' : '🚀 Submit Order to Platform'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadProFormaPdf()}
                    disabled={isGeneratingProForma}
                    style={{
                      width: '100%',
                      backgroundColor: '#f8fafc',
                      color: '#003666',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Download size={16} />
                    <span>{isGeneratingProForma ? 'Generating PDF...' : '📄 Download Draft Pro-Forma (PDF)'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Clinic Portal Access Registration Modal ──────────────────────── */}
      {isRegisterModalOpen && (
        <div
          className="access-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingRegister) {
              setIsRegisterModalOpen(false);
            }
          }}
        >
          <div className="access-modal-card">
            {/* Close Button */}
            <button
              type="button"
              className="access-modal-close-btn"
              onClick={() => setIsRegisterModalOpen(false)}
              disabled={isSubmittingRegister}
              aria-label="Close application modal"
            >
              ✕
            </button>

            {registerSubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: '#16a34a'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  Institutional Application Received
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 16px' }}>
                  Thank you for submitting your practice details. Your application has been logged under reference:
                </p>
                {registerApplicationId && (
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#f1f5f9',
                      border: '1px dashed #cbd5e1',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#003666',
                      fontSize: '0.95rem',
                      marginBottom: '16px'
                    }}
                  >
                    REF: {registerApplicationId}
                  </div>
                )}
                <p style={{ color: '#64748b', fontSize: '0.825rem', lineHeight: 1.5, margin: '0 0 24px' }}>
                  Our medical compliance team will review your professional credentials within 24 business hours. You will receive your dedicated portal sign-in instructions via email.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterModalOpen(false);
                    setRegisterSubmitted(false);
                  }}
                  style={{
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px 26px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Return to Shared Catalog
                </button>
              </div>
            ) : (
              <div>
                <div className="access-modal-header">
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284c7',
                      flexShrink: 0
                    }}
                  >
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
                      Institutional Portal Access Application
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                      Certified medical clinics, practitioners & healthcare organizations only.
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.45, margin: '6px 0 16px' }}>
                  Apply for verified clinic pricing, clinical dosing documentation, cold-chain logistics, and automated prescription replenishment.
                </p>

                {registerError && (
                  <div
                    style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '0.825rem',
                      marginBottom: '14px'
                    }}
                  >
                    ⚠️ {registerError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Practice & Contact Details */}
                  <div className="access-form-section">
                    <div className="access-section-title">
                      <Building2 size={13} />
                      <span>Practice & Contact Information</span>
                    </div>

                    <div className="access-form-grid" style={{ marginBottom: '10px' }}>
                      <div className="access-field-group">
                        <label className="access-field-label">
                          Clinic / Practice Name <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Longevity Medical Clinic / Practice Name"
                          value={registerForm.clinicName}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, clinicName: e.target.value }))}
                          className="access-input-control"
                        />
                      </div>

                      <div className="access-field-group">
                        <label className="access-field-label">
                          Lead Practitioner / Contact <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Dr. / Director Full Name"
                          value={registerForm.contactName}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, contactName: e.target.value }))}
                          className="access-input-control"
                        />
                      </div>
                    </div>

                    <div className="access-form-grid">
                      <div className="access-field-group">
                        <label className="access-field-label">
                          Professional Email <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="practitioner@clinic.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          className="access-input-control"
                        />
                      </div>

                      <div className="access-field-group">
                        <label className="access-field-label">
                          Phone / WhatsApp
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="access-input-control"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clinical Profile & Requirements */}
                  <div className="access-form-section">
                    <div className="access-section-title">
                      <ShieldCheck size={13} />
                      <span>Clinical Profile & Monthly Volume</span>
                    </div>

                    <div className="access-form-grid" style={{ marginBottom: '10px' }}>
                      <div className="access-field-group">
                        <label className="access-field-label">
                          Country of Practice
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. United States, Spain, Mexico, UAE"
                          value={registerForm.country}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, country: e.target.value }))}
                          className="access-input-control"
                        />
                      </div>

                      <div className="access-field-group">
                        <label className="access-field-label">
                          Clinical Specialty
                        </label>
                        <select
                          value={registerForm.specialty}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, specialty: e.target.value }))}
                          className="access-input-control"
                          style={{ backgroundColor: '#ffffff' }}
                        >
                          <option value="Anti-Aging & Longevity Medicine">Anti-Aging & Longevity Medicine</option>
                          <option value="Endocrinology & Metabolic Health">Endocrinology & Metabolic Health</option>
                          <option value="Sports Medicine & Orthopedics">Sports Medicine & Orthopedics</option>
                          <option value="Functional & Integrative Medicine">Functional & Integrative Medicine</option>
                          <option value="Medical Aesthetic & Dermatology">Medical Aesthetic & Dermatology</option>
                          <option value="Clinical Compounding & Pharmacy">Clinical Compounding & Pharmacy</option>
                          <option value="Biomedical Research Institute">Biomedical Research Institute</option>
                          <option value="Other Clinical Specialty">Other Clinical Specialty</option>
                        </select>
                      </div>
                    </div>

                    <div className="access-form-grid">
                      <div className="access-field-group">
                        <label className="access-field-label">
                          Medical License / NPI / Reg. ID <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. MD-12345678"
                          value={registerForm.licenseNumber}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                          className="access-input-control"
                        />
                      </div>

                      <div className="access-field-group">
                        <label className="access-field-label">
                          Est. Monthly Peptide Volume
                        </label>
                        <select
                          value={registerForm.estimatedMonthlyVolume}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, estimatedMonthlyVolume: e.target.value }))}
                          className="access-input-control"
                          style={{ backgroundColor: '#ffffff' }}
                        >
                          <option value="10 - 25 vials / month">10 - 25 vials / month</option>
                          <option value="25 - 100 vials / month">25 - 100 vials / month (Standard Practice)</option>
                          <option value="100 - 500 vials / month">100 - 500 vials / month (Multi-Doctor Clinic)</option>
                          <option value="500+ vials / month">500+ vials / month (Institutional Supply)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Specific Formulations / Notes */}
                  <div>
                    <label className="access-field-label">
                      Additional Clinical Requirements or Specific Formulations <span style={{ fontWeight: 400, color: '#94a3b8' }}>(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specify any target formulations, recurring protocol requirements or compound purity needs..."
                      value={registerForm.notes}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="access-input-control"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="access-actions-row">
                    <button
                      type="button"
                      onClick={() => setIsRegisterModalOpen(false)}
                      disabled={isSubmittingRegister}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingRegister}
                      style={{
                        backgroundColor: '#003666',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 24px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: isSubmittingRegister ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        opacity: isSubmittingRegister ? 0.7 : 1,
                        boxShadow: '0 2px 6px rgba(0, 54, 102, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ShieldCheck size={16} />
                      <span>{isSubmittingRegister ? 'Submitting Application...' : 'Submit Portal Application'}</span>
                    </button>
                  </div>
                </form>

                <div
                  style={{
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Lock size={12} color="#94a3b8" />
                  <span>
                    Strictly confidential. Medical credentials and license data are reviewed exclusively by our compliance division.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public Protocol Dossier Modal */}
      {selectedPublicProtocol && (
        <ProtocolPreviewModal
          protocol={selectedPublicProtocol}
          onClose={() => setSelectedPublicProtocol(null)}
          updateCart={updateQuantity}
          localTier={priceSource}
          audienceType={activeRole === 'patient' ? 'patient' : 'doctor'}
        />
      )}

      {/* Sandboxed, Strictly English Public Atlas AI Research Copilot */}
      <PublicAtlasAIDrawer
        contextType="catalog"
        catalogInventory={products.map(p => ({
          name: p.canonicalName,
          category: p.category,
          purity: p.purity,
          variantsCount: p.variants?.length || 0,
        }))}
        storageKey={`catalog_${catalogId}`}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
      />
    </div>
  );
}
