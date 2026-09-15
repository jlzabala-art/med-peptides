'use client';

import React from 'react';
import {
  Building2,
  Lock,
  Clock,
  Download,
  MessageSquare,
  Search,
  CheckCircle2,
  FlaskConical,
  ShieldCheck,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
  Snowflake,
  ClipboardList,
  Sparkles,
  ExternalLink,
  Trash2,
  Filter,
  Send,
  Check,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { resolveVariantClinicalImage, resolveProtocolClinicalImage } from '@/utils/clinicalImageResolver';
import { sortVariantsAscending } from '@/utils/variantSorter';
import {
  useSharedCatalogState,
  SHIPPING_DESTINATIONS,
} from '../../../../hooks/data/useSharedCatalogState';
import AlgoliaRecommendCrossSell from '@/components/catalog/AlgoliaRecommendCrossSell';
import Interactive3DScanCard from '@/components/catalog/Interactive3DScanCard';
import PharmaBarcodeStamp from '@/components/catalog/PharmaBarcodeStamp';
import { generatePharmaCatalogCode, generatePharmaBatchCode } from '@/utils/pharmaBarcode';
import { buildTranslator, getPersistedLang, persistLang, SUPPORTED_LANGS } from './catalogI18n';

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
      const validContactEmail = catalogMeta?.accountManagerEmail && catalogMeta.accountManagerEmail !== 'orders@atlas-solutions.com' && catalogMeta.accountManagerEmail !== 'commercial@atlashealth.com'
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
          catalogId: catalogMeta?.catalogId,
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
      <style>{`
        .catalog-container {
          max-width: 1160px;
          margin: 0 auto;
          padding: 24px 16px;
        }
        /* Sandboxed Institutional Topbar */
        .institutional-topbar {
          background-color: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .topbar-inner {
          max-width: 1160px;
          margin: 0 auto;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .topbar-brand-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #003666;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .portal-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          borderRadius: 6px;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        .topbar-row-logistics {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .topbar-row-access {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .topbar-currency-toggle {
          display: inline-flex;
          background-color: #f1f5f9;
          padding: 2px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .currency-btn {
          padding: 4px 10px;
          border-radius: 6px;
          border: none;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .currency-btn.active {
          background-color: #003666;
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 54, 102, 0.2);
        }
        .currency-btn.inactive {
          background: transparent;
          color: #64748b;
        }
        .topbar-destination {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #f8fafc;
          padding: 5px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          color: #334155;
          min-width: 180px;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .topbar-destination:hover {
          background-color: #f1f5f9;
          border-color: #cbd5e1;
        }
        .topbar-destination select {
          background: transparent;
          color: #0f172a;
          border: none;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          outline: none;
          width: 100%;
          white-space: nowrap;
        }
        .topbar-cart-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .topbar-cart-pill:hover {
          background-color: #dbeafe;
        }
        .topbar-signin-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #ffffff;
          border: 1px solid #cbd5e1;
          color: #334155;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .topbar-signin-btn:hover {
          background-color: #f8fafc;
          border-color: #94a3b8;
        }
        .topbar-apply-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #003666 0%, #0284c7 100%);
          border: none;
          color: #ffffff;
          padding: 7px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 54, 102, 0.25);
          transition: all 0.15s ease;
        }
        .topbar-apply-btn:hover {
          opacity: 0.95;
          box-shadow: 0 3px 10px rgba(0, 54, 102, 0.35);
        }
        .access-label-compact {
          display: none;
        }
        /* Executive Header Card */
        .header-card {
          background: linear-gradient(135deg, #00284d 0%, #003666 55%, #0284c7 100%);
          color: #ffffff;
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px -5px rgba(0, 54, 102, 0.25);
        }
        .header-meta-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
          font-size: 0.8rem;
          color: #ffffff;
        }
        .header-meta-pill {
          background-color: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(4px);
          padding: 6px 14px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.8rem;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .header-card-right {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 18px;
          justify-content: flex-end;
        }
        .header-card-qr {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .tab-button {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }
        .tab-button.active {
          background: #003666;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(0, 54, 102, 0.25);
        }
        .tab-button.inactive {
          background: #ffffff;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }
        .tab-button.inactive:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .filter-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #ffffff;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .catalog-search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          background-color: #f8fafc;
          padding: 0 14px;
          height: 44px;
          box-sizing: border-box;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: all 0.15s ease;
        }
        .catalog-search-box:focus-within {
          border-color: #0284c7;
          background-color: #ffffff;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.12);
        }
        .chips-scroll-container {
          display: flex;
          align-items: center;
          gap: 6px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 2px 0 4px 0;
          scrollbar-width: none;
          width: 100%;
        }
        .chips-scroll-container::-webkit-scrollbar {
          display: none;
        }
        .product-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 18px 20px;
          margin-bottom: 14px;
          transition: all 0.15s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .product-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .category-chip {
          padding: 6px 14px;
          border-radius: 16px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          white-space: nowrap;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .category-chip.active {
          background: #003666;
          color: #ffffff;
        }
        .category-chip.inactive {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .product-desc-clamp {
          font-size: 0.825rem;
          color: #475569;
          margin: 4px 0 0 0;
          line-height: 1.4;
          max-width: 780px;
        }
        .add-kit-btn {
          background-color: #16a34a;
          color: #ffffff;
          border: none;
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 0.74rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 1px 3px rgba(22, 163, 74, 0.25);
          transition: all 0.15s ease;
        }
        .add-kit-btn:hover {
          background-color: #15803d;
        }
        .remove-kit-btn {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
        }
        .cart-mobile-backdrop {
          display: none;
        }
        .cart-drawer-wrapper {
          position: fixed;
          bottom: 74px;
          left: 0;
          right: 0;
          pointer-events: none;
          z-index: 60;
        }
        .cart-drawer-container {
          maxWidth: 1120px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          justify-content: flex-end;
          width: 100%;
          box-sizing: border-box;
        }
        .cart-drawer-card {
          pointer-events: auto;
          max-width: 450px;
          width: 100%;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border: 1px solid #e2e8f0;
          padding: 16px;
          max-height: 500px;
          overflow-y: auto;
        }
        .mobile-drag-indicator {
          display: none;
        }

        .variant-info-col {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1 1 220px;
        }
        .variant-pricing-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .single-unit-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 6px 10px;
        }
        .kit-pack-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          padding: 6px 12px;
        }

        @media (max-width: 768px) {
          .catalog-container {
            padding: 10px 8px 115px 8px;
          }
          .header-card {
            padding: 16px 14px;
            border-radius: 12px;
          }
          .header-card h1 {
            font-size: 1.35rem !important;
          }
          .header-meta-container {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
            width: 100% !important;
            margin-top: 14px !important;
          }
          .header-meta-pill {
            width: 100% !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            padding: 8px 10px !important;
            font-size: 0.74rem !important;
            border-radius: 8px !important;
            white-space: nowrap !important;
          }
          .header-meta-pill.pill-full {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            font-size: 0.78rem !important;
            font-weight: 700 !important;
            background-color: rgba(255, 255, 255, 0.22) !important;
            border: 1px solid rgba(255, 255, 255, 0.28) !important;
            padding: 9px 12px !important;
          }
          .product-card {
            padding: 12px 10px !important;
            margin-bottom: 12px !important;
            border-radius: 10px !important;
          }
          .variants-section-container {
            padding: 8px 6px !important;
            border-radius: 8px !important;
          }
          .variant-card {
            padding: 10px 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            margin-bottom: 6px !important;
          }
          .variant-info-col {
            flex: 0 0 auto !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin-bottom: 2px !important;
          }
          .variant-pricing-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 6px !important;
          }
          .single-unit-box {
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 8px 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .kit-pack-box {
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 8px 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .catalog-search-box {
            width: 100% !important;
            flex: 1 1 100% !important;
          }
          .category-dropdown-container {
            width: 100% !important;
            flex: 1 1 100% !important;
            min-width: 0 !important;
          }
          .product-desc-clamp {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 0.78rem;
          }
          .mobile-hide {
            display: none !important;
          }
          .cart-mobile-backdrop {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            background-color: rgba(15, 23, 42, 0.55) !important;
            backdrop-filter: blur(4px) !important;
            z-index: 998 !important;
          }
          .cart-drawer-wrapper {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            pointer-events: none !important;
            z-index: 999 !important;
          }
          .cart-drawer-container {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .cart-drawer-card {
            pointer-events: auto !important;
            max-width: 100vw !important;
            width: 100vw !important;
            margin: 0 !important;
            border-radius: 20px 20px 0 0 !important;
            border: none !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.25) !important;
            padding: 12px 16px max(18px, env(safe-area-inset-bottom, 18px)) 16px !important;
            max-height: 84vh !important;
            overflow-y: auto !important;
          }
          .mobile-drag-indicator {
            display: block !important;
            width: 40px !important;
            height: 4px !important;
            border-radius: 2px !important;
            background-color: #cbd5e1 !important;
            margin: 0 auto 10px auto !important;
          }
        }
        @media (max-width: 768px) {
          .topbar-inner {
            padding: 8px 12px !important;
            gap: 10px !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .topbar-brand {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
          }
          .topbar-brand-title {
            font-size: 0.88rem !important;
          }
          .portal-verified-badge {
            display: none !important;
          }
          .topbar-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .topbar-row-logistics {
            width: 100% !important;
            display: flex !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
          }
          .topbar-row-access {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          .topbar-destination {
            flex: 1 1 100% !important;
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            padding: 7px 12px !important;
            font-size: 0.82rem !important;
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            border-radius: 8px !important;
          }
          .topbar-destination select {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 0.82rem !important;
            white-space: nowrap !important;
          }
          .topbar-currency-toggle {
            flex-shrink: 0 !important;
          }
          .currency-btn {
            padding: 5px 8px !important;
            font-size: 0.72rem !important;
          }
          .topbar-cart-pill {
            flex-shrink: 0 !important;
            padding: 5px 8px !important;
            font-size: 0.72rem !important;
          }
          .topbar-signin-btn,
          .topbar-apply-btn {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            min-height: 38px !important;
            padding: 6px 10px !important;
            font-size: 0.76rem !important;
            border-radius: 8px !important;
            box-sizing: border-box !important;
            white-space: nowrap !important;
          }
          .access-label-full {
            display: none !important;
          }
          .access-label-compact {
            display: inline !important;
          }
          .chips-scroll-container {
            flex-wrap: wrap !important;
          }
          .header-card-right {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 14px !important;
            margin-top: 14px !important;
          }
          .header-card-actions {
            width: 100% !important;
            margin-top: 0 !important;
            align-items: center !important;
          }
          .header-card-actions button {
            width: 100% !important;
            justify-content: center !important;
            min-height: 42px !important;
          }
          .header-card-qr {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
          }
          .dock-wrapper {
            padding: 8px 10px max(12px, env(safe-area-inset-bottom, 12px)) 10px !important;
          }
          .dock-content {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .dock-actions {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: 1fr 2fr !important;
            gap: 6px !important;
          }
          .dock-actions button {
            justify-content: center !important;
            min-height: 44px !important;
          }
          .checkout-form-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-modal-card {
            padding: 16px 14px !important;
            border-radius: 14px !important;
          }
        }

        /* Institutional Portal Access Modal */
        .access-modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
        }
        .access-modal-card {
          background-color: #ffffff;
          border-radius: 16px;
          max-width: 620px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
          border: 1px solid #e2e8f0;
          padding: 26px 28px;
          position: relative;
          box-sizing: border-box;
        }
        .access-modal-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 6px;
          padding-right: 44px;
        }
        .access-modal-close-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          border: none;
          background: #f1f5f9;
          cursor: pointer;
          color: #64748b;
          font-size: 1.1rem;
          font-weight: 700;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          z-index: 2;
        }
        .access-modal-close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        .access-form-section {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 12px;
        }
        .access-section-title {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0284c7;
          margin: 0 0 10px 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .access-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .access-field-label {
          display: block;
          font-size: 0.76rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 5px;
        }
        .access-input-control {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 0.86rem;
          color: #0f172a;
          background-color: #ffffff;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .access-input-control:focus {
          outline: none;
          border-color: #003666;
          box-shadow: 0 0 0 3px rgba(0, 54, 102, 0.12);
        }
        .access-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 14px;
        }
        @media (max-width: 640px) {
          .access-modal-card {
            padding: 20px 16px !important;
            border-radius: 14px !important;
            max-height: 92vh !important;
          }
          .access-modal-header {
            padding-right: 36px !important;
          }
          .access-modal-close-btn {
            top: 14px !important;
            right: 14px !important;
            width: 32px !important;
            height: 32px !important;
          }
          .access-form-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .access-input-control {
            font-size: 16px !important;
            padding: 11px 12px !important;
            min-height: 44px !important;
          }
          .access-actions-row {
            flex-direction: column-reverse !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .access-actions-row button {
            width: 100% !important;
            justify-content: center !important;
            min-height: 44px !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>

      {/* Sandboxed Institutional Navigation Topbar */}
      <header className="institutional-topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <img 
              src="/atlas-health-logo.png" 
              alt="Atlas Health" 
              style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="topbar-brand-title">
              <span>ATLAS HEALTH</span>
              <span style={{ fontWeight: 400, color: '#94a3b8' }}>•</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }} className="mobile-hide">Clinical Formulations</span>
            </div>
            <span className="portal-verified-badge">
              <ShieldCheck size={12} />
              <span>Verified Portal</span>
            </span>
          </div>

          <div className="topbar-actions">
            {/* Line 1: Logistics Controls (Destination, Currency, Cart) */}
            <div className="topbar-row-logistics">
              {/* Destination Selector */}
              <div className="topbar-destination">
                <span>✈️</span>
                <select
                  value={selectedShipping}
                  onChange={(e) => setSelectedShipping(e.target.value)}
                  style={{
                    background: 'transparent',
                    color: '#0f172a',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                    width: '100%',
                    whiteSpace: 'nowrap'
                  }}
                  title={activeShipping.label}
                >
                  {SHIPPING_DESTINATIONS.map(d => {
                    const cost = currentCurrency === 'EUR' ? d.costEUR : currentCurrency === 'AED' ? (d.costAED || Math.round(d.costUSD * 3.6725)) : d.costUSD;
                    return (
                      <option key={d.id} value={d.id}>
                        {d.flag} {d.code} (+{currencySymbol}{cost})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Currency Toggle */}
              <div className="topbar-currency-toggle">
                <button
                  type="button"
                  onClick={() => setCurrentCurrency('USD')}
                  className={`currency-btn ${currentCurrency === 'USD' ? 'active' : 'inactive'}`}
                >
                  $ USD
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentCurrency('EUR')}
                  className={`currency-btn ${currentCurrency === 'EUR' ? 'active' : 'inactive'}`}
                >
                  € EUR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentCurrency('AED')}
                  className={`currency-btn ${currentCurrency === 'AED' ? 'active' : 'inactive'}`}
                >
                  AED
                </button>
              </div>

              {/* Top Cart Pill (if active) */}
              {cartTotalUnits > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="topbar-cart-pill"
                  title={t('order.title', 'Review Order')}
                >
                  <Package size={14} />
                  <span>{cartTotalUnits} Vials</span>
                  <span>•</span>
                  <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
                </button>
              )}
            </div>

            {/* Language toggle EN / ES */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
              {SUPPORTED_LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => handleLangToggle(l)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.15s ease',
                    backgroundColor: lang === l ? '#003666' : 'transparent',
                    color:           lang === l ? '#ffffff' : '#64748b',
                    borderColor:     lang === l ? '#003666' : '#cbd5e1',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  {l === 'en' ? '🇬🇧 EN' : '🇪🇸 ES'}
                </button>
              ))}
            </div>

            {/* Line 2: Clinical Provider Access & Registration / Sign Out */}
            <div className="topbar-row-access">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await logout();
                    } catch (e) {
                      console.error('Sign out error:', e);
                    }
                  }}
                  className="topbar-signin-btn"
                  title={`Sign Out (${user.email || 'Provider'})`}
                >
                  <LogOut size={13} color="#b91c1c" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <a
                  href="/login"
                  className="topbar-signin-btn"
                  title="Provider Authentication"
                >
                  <Lock size={13} color="#003666" />
                  <span>Sign In</span>
                </a>
              )}

              {isAuthenticated ? (
                <a
                  href={
                    activeRole === 'admin' ? '/admin' :
                    activeRole === 'doctor' || activeRole === 'medical_director' ? '/doctor' :
                    activeRole === 'wholesaler' ? '/wholesaler' :
                    activeRole === 'supplier' ? '/supplier' :
                    activeRole === 'clinic' ? '/clinic' : '/patient'
                  }
                  className="topbar-apply-btn"
                  style={{ textDecoration: 'none' }}
                >
                  <Building2 size={13} />
                  <span className="access-label-full">Open My Portal</span>
                  <span className="access-label-compact">My Portal</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => { setRegisterSubmitted(false); setRegisterError(''); setIsRegisterModalOpen(true); }}
                  className="topbar-apply-btn"
                >
                  <Building2 size={13} />
                  <span className="access-label-full">Apply for Portal Access</span>
                  <span className="access-label-compact">Portal Access</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="catalog-container">
        {/* Executive Header Card */}
        <div className="header-card">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ flex: '1 1 560px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.2, color: '#ffffff' }}>
                  Official Clinical Peptide Catalog
                </h1>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#93c5fd', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '12px' }}>
                  {isProtocolCatalog ? 'Peptides & Protocols' : 'Lyophilized Formulations'}
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: '#e0f2fe', lineHeight: 1.45, maxWidth: '640px' }}>
                Analytical-grade lyophilized peptide vials, multi-dose presentations, and standardized therapeutic protocols. Verified direct delivery terms for authorized healthcare institutions.
              </p>
              
              <div className="header-meta-container">
                <span className="header-meta-pill">
                  📅 {catalogMeta.issuedAt || catalogMeta.iat 
                    ? new Date(catalogMeta.issuedAt || catalogMeta.iat).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span className="header-meta-pill">
                  🏷️ {priceTierLabel}
                </span>
                <span className="header-meta-pill pill-full">
                  {isProtocolCatalog 
                    ? `📋 ${protocols.length} Clinical Protocols`
                    : `📦 ${products.length} Products • ${totalVariants} Verified Variants`}
                </span>
              </div>
            </div>

            <div className="header-card-right">
              <div className="header-card-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#003666',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '13px 22px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: isGeneratingPdf ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Download size={17} />
                  <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF'}</span>
                </button>
                <PharmaBarcodeStamp catalogCode={catalogCode} batchCode={batchCode} theme="dark" width={200} height={26} />
              </div>

              {/* 3D Holographic Interactive Scan Card */}
              <div className="header-card-qr">
                <Interactive3DScanCard url={shareUrl} catalogCode={catalogCode} batchCode={batchCode} recipientName={catalogMeta?.recipientName} />
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs (Only if dedicated protocol catalog or both exist explicitly) */}
        {isProtocolCatalog && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('protocols')}
              className="tab-button active"
            >
              <ClipboardList size={16} />
              <span>Clinical Protocols ({protocols.length})</span>
            </button>
          </div>
        )}

        {/* Search, Category Dropdown & Packaging Mode Controls */}
        <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
            {/* Search Input for product & dosage */}
            <div className="catalog-search-box" style={{ flex: '1 1 260px' }}>
              <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by product, active compound, dosage (e.g. 5mg)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  color: '#0f172a',
                  width: '100%',
                  height: '100%'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dedicated Canonical Goals Multi-Select Popover */}
            <div className="category-dropdown-container" style={{
              position: 'relative',
              flex: '0 1 290px',
              minWidth: '220px',
              boxSizing: 'border-box'
            }}>
              <button
                type="button"
                onClick={() => setIsGoalDropdownOpen(prev => !prev)}
                style={{
                  width: '100%',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  backgroundColor: selectedGoals.length > 0 ? '#eff6ff' : '#ffffff',
                  border: selectedGoals.length > 0 ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <Filter size={15} color={selectedGoals.length > 0 ? '#1d4ed8' : '#0284c7'} style={{ flexShrink: 0 }} />
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: selectedGoals.length > 0 ? '#1e40af' : '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {selectedGoals.length === 0
                      ? `All Clinical Goals (${products.length})`
                      : selectedGoals.length === 1
                      ? `${availableGoals.find(g => g.id === selectedGoals[0])?.label || selectedGoals[0]}`
                      : `${selectedGoals.length} Goals Selected`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {selectedGoals.length > 0 && (
                    <span style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}>
                      {selectedGoals.length}
                    </span>
                  )}
                  <ChevronDown size={14} color="#64748b" style={{ transform: isGoalDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                </div>
              </button>

              {/* Popover Dropdown */}
              {isGoalDropdownOpen && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                    onClick={() => setIsGoalDropdownOpen(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '320px',
                    maxWidth: '92vw',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0',
                    zIndex: 1000,
                    padding: '10px',
                    maxHeight: '380px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 8px', borderBottom: '1px solid #f1f5f9', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Clinical Goals (Multi-Select)
                      </span>
                      {selectedGoals.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => clearGoals()}
                          style={{ border: 'none', background: 'transparent', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Reset All
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Select one or more</span>
                      )}
                    </div>

                    <div
                      onClick={() => clearGoals()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: selectedGoals.length === 0 ? '#f0fdf4' : 'transparent',
                        marginBottom: '4px'
                      }}
                    >
                      <span style={{ fontSize: '0.82rem', fontWeight: selectedGoals.length === 0 ? 800 : 600, color: selectedGoals.length === 0 ? '#15803d' : '#1e293b' }}>
                        ✨ All Clinical Goals
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>({products.length})</span>
                    </div>

                    {availableGoals?.map(goal => {
                      const isChecked = selectedGoals.includes(goal.id);
                      return (
                        <div
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: isChecked ? '#eff6ff' : 'transparent',
                            transition: 'background 0.12s ease',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent onClick
                              style={{ accentColor: '#003666', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
                            />
                            <span style={{
                              fontSize: '0.82rem',
                              fontWeight: isChecked ? 700 : 500,
                              color: isChecked ? '#1e40af' : '#1e293b',
                              lineHeight: 1.3,
                              wordBreak: 'break-word'
                            }}>
                              {goal.label}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: isChecked ? '#2563eb' : '#64748b',
                            backgroundColor: isChecked ? '#dbeafe' : '#f1f5f9',
                            padding: '2px 6px',
                            borderRadius: '6px',
                            flexShrink: 0
                          }}>
                            {goal.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Dedicated Packaging & Format Dropdown */}
            <div className="format-dropdown-container" style={{
              position: 'relative',
              flex: '0 1 240px',
              minWidth: '200px',
              boxSizing: 'border-box'
            }}>
              <button
                type="button"
                onClick={() => setIsFormatDropdownOpen(prev => !prev)}
                style={{
                  width: '100%',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  backgroundColor: (packagingMode !== 'all' || dosageFilter === 'high_dose') ? '#f0fdf4' : '#ffffff',
                  border: (packagingMode !== 'all' || dosageFilter === 'high_dose') ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0 12px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>
                    {dosageFilter === 'high_dose' ? '💪' : packagingMode === 'kits' ? '📦' : packagingMode === 'units' ? '🧪' : '✨'}
                  </span>
                  <span style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: (packagingMode !== 'all' || dosageFilter === 'high_dose') ? '#15803d' : '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {dosageFilter === 'high_dose'
                      ? 'High Dose (≥10mg)'
                      : packagingMode === 'kits'
                      ? '10-Vial Kits'
                      : packagingMode === 'units'
                      ? 'Single Vials (1–9)'
                      : 'All Formats & Kits'}
                  </span>
                </div>
                <ChevronDown size={14} color="#64748b" style={{ transform: isFormatDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>

              {isFormatDropdownOpen && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                    onClick={() => setIsFormatDropdownOpen(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '270px',
                    maxWidth: '92vw',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0',
                    zIndex: 1000,
                    padding: '8px',
                  }}>
                    <div style={{ padding: '4px 8px 6px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Format & Presentation
                      </span>
                    </div>

                    {[
                      { id: 'all', label: 'All Formats', icon: '✨', desc: 'Single vials & 10-vial kits' },
                      { id: 'kits', label: '10-Vial Kits', icon: '📦', desc: 'Bulk volume best savings' },
                      { id: 'units', label: 'Single Vials (1–9)', icon: '🧪', desc: 'Individual test vials' },
                      { id: 'high_dose', label: 'High Dose (≥10mg)', icon: '💪', desc: 'Concentrated formulations' },
                    ].map(opt => {
                      const isSelected = opt.id === 'high_dose'
                        ? dosageFilter === 'high_dose'
                        : (packagingMode === opt.id && dosageFilter !== 'high_dose');
                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            if (opt.id === 'high_dose') {
                              setDosageFilter('high_dose');
                              setPackagingMode('all');
                            } else {
                              setDosageFilter('all');
                              setPackagingMode(opt.id);
                            }
                            setIsFormatDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                            transition: 'background 0.12s ease',
                            marginBottom: '2px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.95rem' }}>{opt.icon}</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#15803d' : '#1e293b' }}>
                                {opt.label}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                {opt.desc}
                              </span>
                            </div>
                          </div>
                          {isSelected && <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.82rem' }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content 1: Products */}
        {activeTab === 'products' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredProducts.length === 0 ? (
              <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                No formulations found matching your query.
              </div>
            ) : (
              filteredProducts.map(prod => {
                const startingPrice = (prod.minPrice > 0 ? prod.minPrice : (prod.variants[0]?.price || 0)) * fxMultiplier;
                return (
                  <div key={prod.id} className="product-card" style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s ease',
                  }}>
                    {/* Product Master Header */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '14px', flex: '1 1 300px' }}>
                        <img
                          src={resolveVariantClinicalImage(prod.variants[0], prod)}
                          alt={prod.canonicalName}
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            border: '1px solid #e2e8f0',
                            flexShrink: 0,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                              {prod.canonicalName}
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: '#f0fdf4',
                              color: '#16a34a',
                              padding: '3px 8px',
                              borderRadius: '5px',
                              border: '1px solid #bbf7d0'
                            }}>
                              {prod.purity}
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              backgroundColor: '#f8fafc',
                              color: '#64748b',
                              padding: '3px 8px',
                              borderRadius: '5px',
                              border: '1px solid #e2e8f0'
                            }}>
                              {prod.category}
                            </span>
                          </div>

                          {prod.description && (
                            <p className="product-desc-clamp">
                              {prod.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {includePrices && prod.variants.length > 0 && (
                        <div className="mobile-hide" style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          textAlign: 'right',
                          minWidth: '130px'
                        }}>
                          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Starting From
                          </div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#003666' }}>
                            {currencySymbol}{startingPrice.toFixed(2)} <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>{currentCurrency}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hanging Variant Presentations Section */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #edf2f7',
                      borderRadius: '10px',
                      padding: '14px',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        paddingBottom: '8px',
                        borderBottom: '1px solid #e2e8f0',
                      }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Package size={14} color="#0284c7" /> Available Formats & Dosages ({prod.variants.length})
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
                          Verified Analytical Grade
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {sortVariantsAscending(prod.variants).map((v, vIdx) => {
                          const displayPrice = (v.price > 0 ? v.price : 0) * fxMultiplier;
                          const tier10Rate = (v.tier10UnitPrice && v.tier10UnitPrice > 0 ? v.tier10UnitPrice : (v.price > 0 ? v.price * 0.9 : 0)) * fxMultiplier;
                          const kitDisplayPrice = (v.kitPrice && v.kitPrice > 0 ? v.kitPrice : tier10Rate * 10) * fxMultiplier;
                          
                          // Dynamic unit format plural (e.g. Pens, Sprays, Bottles, Vials)
                          const formatLower = (v.presentation || '').toLowerCase();
                          const unitPlural = formatLower.includes('pen') ? 'Pens'
                            : formatLower.includes('spray') ? 'Sprays'
                            : (formatLower.includes('capsule') || formatLower.includes('bottle')) ? 'Bottles'
                            : (formatLower.includes('serum') || formatLower.includes('topical')) ? 'Units'
                            : 'Vials';

                          const savingsPct = displayPrice > 0 && tier10Rate > 0 && tier10Rate < displayPrice
                            ? Math.round((1 - (tier10Rate / displayPrice)) * 100)
                            : 0;

                          const stockRaw = (v.stockType || v.availability || prod.stockType || 'on_demand').toLowerCase();
                          const isOutOfStock = stockRaw.includes('out') || stockRaw.includes('agotado');
                          const isDemand = stockRaw.includes('demand') || stockRaw.includes('pedido') || !stockRaw;

                          const showUnits = packagingMode === 'all' || packagingMode === 'units';
                          const showKits = (packagingMode === 'all' || packagingMode === 'kits') && kitDisplayPrice > 0;
                          const kitsInCart = Math.floor((cart[v.id]?.quantity || 0) / 10);

                          return (
                            <div
                              key={v.id || vIdx}
                              className="variant-card"
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '10px 14px',
                                gap: '12px',
                              }}
                            >
                              <div className="variant-info-col">
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  backgroundColor: '#eff6ff',
                                  color: '#0284c7',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                  flexShrink: 0,
                                }}>
                                  #{vIdx + 1}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', lineHeight: 1.2 }}>
                                    {v.dosage || v.name || 'Standard Presentation'}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                                    <span style={{ textTransform: 'capitalize' }}>Format: {v.presentation || 'Vial'}</span>
                                    <span>•</span>
                                    {isOutOfStock ? (
                                      <span style={{ color: '#dc2626', fontWeight: 700 }}>🔴 Out of Stock</span>
                                    ) : isDemand ? (
                                      <span style={{ color: '#d97706', fontWeight: 600 }}>🟡 On Demand (3–7 Days)</span>
                                    ) : (
                                      <span style={{ color: '#16a34a', fontWeight: 600 }}>🟢 In Stock</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {includePrices && (
                                <div className="variant-pricing-actions">
                                  {/* Single Unit (1-9) Box & Counter */}
                                  {showUnits && (
                                    <div className="single-unit-box">
                                      <div>
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                                          Single (1–9)
                                        </div>
                                        <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#003666' }}>
                                          {currencySymbol}{displayPrice.toFixed(2)} <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{currentCurrency}</span>
                                        </div>
                                      </div>
                                      <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        padding: '1px',
                                        marginLeft: '2px'
                                      }}>
                                        <button
                                          type="button"
                                          onClick={() => updateQuantity(v, prod, -1)}
                                          disabled={!cart[v.id]?.quantity}
                                          style={{
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: cart[v.id]?.quantity ? 'pointer' : 'default',
                                            fontWeight: 800,
                                            fontSize: '1rem',
                                            color: cart[v.id]?.quantity ? '#0f172a' : '#cbd5e1'
                                          }}
                                          title="Decrease 1 Unit"
                                        >
                                          -
                                        </button>
                                        <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 800, fontSize: '0.85rem', color: cart[v.id]?.quantity ? '#003666' : '#64748b' }}>
                                          {cart[v.id]?.quantity || 0}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => updateQuantity(v, prod, 1)}
                                          style={{
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#003666',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontWeight: 800,
                                            fontSize: '1rem'
                                          }}
                                          title="Add 1 Unit"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* 10-Unit Pack Volume Price & Direct Kit Action Button */}
                                  {showKits && (
                                    <div className="kit-pack-box">
                                      <div>
                                        <div style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <span>📦 Pack ×10 {unitPlural}</span>
                                          {savingsPct > 0 && (
                                            <span style={{ backgroundColor: '#16a34a', color: '#ffffff', fontSize: '0.6rem', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>
                                              -{savingsPct}%
                                            </span>
                                          )}
                                        </div>
                                        <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#15803d', marginTop: '1px' }}>
                                          {currencySymbol}{kitDisplayPrice.toFixed(2)} <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#166534' }}>/ pack</span>
                                        </div>
                                        <div style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 600 }}>
                                          ({currencySymbol}{tier10Rate.toFixed(2)} / unit)
                                        </div>
                                      </div>

                                      <div>
                                        {kitsInCart >= 1 ? (
                                          <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '6px',
                                            border: '1px solid #86efac',
                                            padding: '1px',
                                          }}>
                                            <button
                                              type="button"
                                              onClick={() => updateQuantity(v, prod, -10)}
                                              style={{
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 800,
                                                color: '#166534',
                                                fontSize: '1rem'
                                              }}
                                              title="Remove 1 Kit (-10)"
                                            >
                                              -
                                            </button>
                                            <span style={{ minWidth: '48px', textAlign: 'center', fontWeight: 800, fontSize: '0.78rem', color: '#15803d' }}>
                                              {kitsInCart} Kit{kitsInCart > 1 ? 's' : ''}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => updateQuantity(v, prod, 10)}
                                              style={{
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#16a34a',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 800,
                                                fontSize: '1rem'
                                              }}
                                              title="Add 1 Kit (+10)"
                                            >
                                              +
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => updateQuantity(v, prod, 10)}
                                            className="add-kit-btn"
                                            style={{
                                              minHeight: '34px',
                                              padding: '6px 14px',
                                              fontSize: '0.78rem',
                                              fontWeight: 800,
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '5px',
                                              borderRadius: '6px'
                                            }}
                                          >
                                            + Add Kit (10)
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Live Order Status Indicator for this specific presentation */}
                              {(cart[v.id]?.quantity || 0) > 0 && (
                                <div style={{
                                  width: '100%',
                                  marginTop: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: '6px',
                                  backgroundColor: '#f0fdf4',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '6px',
                                  padding: '5px 10px',
                                  fontSize: '0.78rem'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700 }}>
                                    <CheckCircle2 size={13} color="#16a34a" />
                                    <span>In Order: <strong>{cart[v.id].quantity} {unitPlural}</strong></span>
                                    {Math.floor(cart[v.id].quantity / 10) > 0 && (
                                      <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                                        {Math.floor(cart[v.id].quantity / 10)} Kit{Math.floor(cart[v.id].quantity / 10) > 1 ? 's' : ''} (10 pk)
                                        {cart[v.id].quantity % 10 > 0 ? ` + ${cart[v.id].quantity % 10} Single Vial(s)` : ''}
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ color: '#15803d', fontWeight: 800 }}>
                                    Item Subtotal: {currencySymbol}{(cart[v.id].quantity * (cart[v.id].quantity >= 10 && v.tier10UnitPrice ? v.tier10UnitPrice : v.price) * fxMultiplier).toFixed(2)} {currentCurrency}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab Content 2: Protocols */}
        {activeTab === 'protocols' && (
          <div>
            {filteredProtocols.length === 0 ? (
              <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                No clinical protocols registered matching the criteria.
              </div>
            ) : (
              filteredProtocols.map(proto => (
                <div key={proto.id} className="product-card">
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <img
                      src={resolveProtocolClinicalImage(proto)}
                      alt={proto.title}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '1px solid #e2e8f0',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                            {proto.title}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor: '#f3e8ff',
                            color: '#7c3aed',
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {proto.goal}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> {proto.duration}
                        </span>
                      </div>

                      {proto.description && (
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 12px 0', lineHeight: '1.4' }}>
                          {proto.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {proto.compounds && proto.compounds.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {proto.compounds.map((c, idx) => (
                        <span key={idx} style={{
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          color: '#334155',
                          fontWeight: 600
                        }}>
                          🧪 {typeof c === 'string' ? c : (c.name || c.drugName || 'Peptide')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Action Bar & Order Calculator */}
      <div className="dock-wrapper" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '12px 0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        zIndex: 50
      }}>
        <div className="dock-content" style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
            {catalogMeta.accountManagerName && catalogMeta.accountManagerName !== 'Atlas Commercial Desk' && (
              <div className="mobile-hide" style={{ fontSize: '0.825rem', color: '#475569' }}>
                <strong>{catalogMeta.accountManagerName}</strong>
                {catalogMeta.accountManagerEmail && catalogMeta.accountManagerEmail !== 'orders@atlas-solutions.com' && catalogMeta.accountManagerEmail !== 'commercial@atlashealth.com' && (
                  <span> • {catalogMeta.accountManagerEmail}</span>
                )}
              </div>
            )}

            {cartTotalUnits > 0 && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '4px 12px',
                borderRadius: '8px',
              }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d' }}>
                  🛒 Order Estimate: {cartTotalUnits} units • {currencySymbol}{grandTotal.toFixed(2)} {currentCurrency} (Incl. {activeShipping.flag} Freight)
                </span>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isCartOpen ? 'Hide' : 'Review'}
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '0 4px'
                  }}
                >
                  Reset
                </button>
              </div>
            )}

            <div className="dock-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {cartTotalUnits > 0 && (
              <button
                onClick={handleCopyOrderSummary}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '9px 14px',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <ClipboardList size={15} color="#0284c7" />
                <span>{copiedToast ? 'Copied ✓' : 'Copy Order'}</span>
              </button>
            )}

            <button
              onClick={handleOpenWhatsAppCheckout}
              disabled={cartTotalUnits === 0}
              title={cartTotalUnits === 0 ? 'Add formulations to order before submitting' : 'Submit formal order'}
              style={{
                backgroundColor: cartTotalUnits === 0 ? '#94a3b8' : '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: cartTotalUnits === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: cartTotalUnits === 0 ? 'none' : '0 4px 12px rgba(22, 163, 74, 0.25)',
                opacity: cartTotalUnits === 0 ? 0.65 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { if (cartTotalUnits > 0) e.currentTarget.style.backgroundColor = '#15803d'; }}
              onMouseLeave={(e) => { if (cartTotalUnits > 0) e.currentTarget.style.backgroundColor = '#16a34a'; }}
            >
              <Send size={16} />
              <span>{cartTotalUnits > 0 ? `Submit Order (${cartTotalUnits}) 🚀` : 'Submit Order'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cart Items Breakdown Drawer/Modal */}
      {isCartOpen && cartItems.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '72px',
          left: 0,
          right: 0,
          pointerEvents: 'none',
          zIndex: 60
        }}>
          <div style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div className="cart-drawer-card" style={{
              pointerEvents: 'auto',
              maxWidth: '440px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              border: '1px solid #e2e8f0',
              padding: '16px',
              maxHeight: '440px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                  📋 Selected Formulations & Units
                </span>
                <button
                  onClick={() => setIsCartOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#64748b' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cartItems.map(item => {
                  const isBulk = item.quantity >= 10 && item.tier10UnitPrice && item.tier10UnitPrice > 0;
                  const itemUnitPrice = (isBulk ? item.tier10UnitPrice : item.price) * fxMultiplier;
                  const kits = Math.floor(item.quantity / 10);
                  const singles = item.quantity % 10;
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.825rem',
                        backgroundColor: '#f8fafc',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.productName}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px', flexWrap: 'wrap' }}>
                          <span>{item.dosage}</span>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span>{currencySymbol}{itemUnitPrice.toFixed(2)}/unit</span>
                          {isBulk && (
                            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.65rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                              10+ Rate
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          {kits > 0 && (
                            <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                              📦 {kits} Kit{kits > 1 ? 's' : ''} (10 pk)
                            </span>
                          )}
                          {kits > 0 && singles > 0 && <span style={{ color: '#94a3b8' }}>+</span>}
                          {singles > 0 && (
                            <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                              🧪 {singles} Single Vial{singles > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Inline qty controls in drawer */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '1px' }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item, { canonicalName: item.productName }, -1)}
                            style={{ width: '22px', height: '22px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem', color: '#64748b' }}
                            title="Decrease 1"
                          >
                            -
                          </button>
                          <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 800, fontSize: '0.78rem', color: '#0f172a' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item, { canonicalName: item.productName }, 1)}
                            style={{ width: '22px', height: '22px', border: 'none', background: '#003666', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '0.8rem' }}
                            title="Add 1"
                          >
                            +
                          </button>
                        </div>

                        <div style={{ textAlign: 'right', minWidth: '70px' }}>
                          <div style={{ fontWeight: 800, color: '#003666', fontSize: '0.85rem' }}>
                            {currencySymbol}{(item.quantity * itemUnitPrice).toFixed(2)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item, { canonicalName: item.productName }, -item.quantity)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: '2px', display: 'flex', alignItems: 'center' }}
                          title="Remove from Order"
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Algolia AI Synergies & Reconstitution Supplies Cross-Sell */}
              <AlgoliaRecommendCrossSell
                cartItems={cartItems}
                products={products}
                onAddToCart={(variant, product) => updateQuantity(variant, product, 1)}
                currencySymbol={currencySymbol}
                fxMultiplier={fxMultiplier}
                currentCurrency={currentCurrency}
              />

              {/* Shipping Destination selector in Drawer */}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  ✈️ Shipping Destination:
                </span>
                <select
                  value={selectedShipping}
                  onChange={(e) => setSelectedShipping(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    backgroundColor: '#f8fafc'
                  }}
                >
                  {SHIPPING_DESTINATIONS.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.flag} {d.label} (+{currencySymbol}{currentCurrency === 'EUR' ? d.costEUR : d.costUSD} {currentCurrency})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>Formulations Subtotal:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{currencySymbol}{cartTotalPrice.toFixed(2)} {currentCurrency}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
                  <span>Freight ({activeShipping.flag} {activeShipping.code}):</span>
                  <span style={{ fontWeight: 700, color: '#0284c7' }}>
                    +{currencySymbol}{shippingCost.toFixed(2)} {currentCurrency}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                  <span style={{ fontWeight: 800, color: '#334155', fontSize: '0.88rem' }}>Grand Total Estimate:</span>
                  <span style={{ fontWeight: 800, color: '#15803d', fontSize: '1.1rem' }}>{currencySymbol}{grandTotal.toFixed(2)} {currentCurrency}</span>
                </div>
              </div>

              {/* Drawer Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadProFormaPdf()}
                  disabled={isGeneratingProForma}
                  style={{
                    flex: 1,
                    backgroundColor: '#f8fafc',
                    color: '#003666',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  <span>{isGeneratingProForma ? 'Generating...' : '📄 Pro-Forma PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsAppCheckout}
                  disabled={cartTotalUnits === 0}
                  title={cartTotalUnits === 0 ? 'Add formulations to order before submitting' : 'Submit formal order'}
                  style={{
                    flex: 1,
                    backgroundColor: cartTotalUnits === 0 ? '#94a3b8' : '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: cartTotalUnits === 0 ? 'not-allowed' : 'pointer',
                    opacity: cartTotalUnits === 0 ? 0.65 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={14} />
                  <span>Submit Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
}
