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
  Trash2
} from 'lucide-react';
import { resolveVariantClinicalImage, resolveProtocolClinicalImage } from '@/utils/clinicalImageResolver';
import {
  useSharedCatalogState,
  SHIPPING_DESTINATIONS,
} from '../../../../hooks/data/useSharedCatalogState';

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
    selectedCategory, setSelectedCategory,
    dosageFilter, setDosageFilter,
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

  // ── Clinic Portal Registration Modal State ───────────────────────────────
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const [registerForm, setRegisterForm] = React.useState({
    clinicName: catalogMeta?.recipientName || '',
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
          includePrices,
          priceTier: priceSource,
          currency: currentCurrency,
          recipientName: catalogMeta?.recipientName,
          recipientType: catalogMeta?.recipientType,
          isExWorks: false,
          incoterm: 'DAP',
          showKitPrice: true,
          kitSize: 10,
          showDescription: true,
          showSupplier: false,
          showDosage: true,
          showPresentation: true,
          showPurity: true,
          shippingNote: `Delivered Priority Cold-Chain Freight (${activeShipping.flag} ${activeShipping.label}): +${currencySymbol}${shippingCost.toFixed(2)} ${currentCurrency}`,
          supplierFilter: catalogMeta?.supplierId || null,
          category: catalogMeta?.category || null,
          accountManagerName: catalogMeta?.accountManagerName || 'Atlas Commercial Desk',
          accountManagerEmail: catalogMeta?.accountManagerEmail || 'commercial@atlashealth.com'
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
              if (data.type === 'done' && data.meta?.url) finalUrl = data.meta.url;
              else if (data.type === 'error') throw new Error(data.message);
            } catch (e) {
              console.warn('NDJSON parsing chunk error:', e);
            }
          }
        }
        if (done) break;
      }

      if (finalUrl) {
        try {
          const pdfRes = await fetch(finalUrl);
          const pdfBlob = await pdfRes.blob();
          const blobUrl = window.URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `Atlas_Health_Official_Catalog_${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
        } catch {
          window.open(finalUrl, '_blank');
        }
      } else {
        throw new Error('PDF generation completed without returning a valid URL.');
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
      doc.text('Commercial Desk: orders@atlas-solutions.com', 14, 28);

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
      doc.text(`Destination: ${activeShipping.flag} ${activeShipping.label}`, 120, 57);
      doc.text(`Payment: Wire Transfer (IBAN) / Credit Card (Stripe)`, 120, 62);

      const tableRows = cartItems.map((item, idx) => {
        const isBulk = item.quantity >= 10 && item.tier10UnitPrice && item.tier10UnitPrice > 0;
        const itemUnitPrice = (isBulk ? item.tier10UnitPrice : item.price) * fxMultiplier;
        const itemTotal = item.quantity * itemUnitPrice;
        return [
          idx + 1,
          item.productName,
          `${item.dosage || 'Standard'} • Format: ${item.presentation || 'Vial'}${isBulk ? ' (10+ Tier Rate)' : ''}`,
          item.quantity,
          `${currencySymbol}${itemUnitPrice.toFixed(2)} ${currentCurrency}`,
          `${currencySymbol}${itemTotal.toFixed(2)} ${currentCurrency}`
        ];
      });

      doc.autoTable({
        startY: 70,
        head: [['#', 'Formulation', 'Presentation & Dosage', 'Qty', 'Unit Price', 'Total']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 54, 102], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 55, fontStyle: 'bold' },
          2: { cellWidth: 55 },
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
      doc.text('Quotation valid for 30 calendar days from issue date. Cold-chain guaranteed under WHO/GDP standards.', 14, 285);

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
          accountManagerName: catalogMeta?.accountManagerName || 'Atlas Commercial Desk',
          accountManagerEmail: catalogMeta?.accountManagerEmail || '',
          accountManagerId: catalogMeta?.accountManagerId || '',
          source: 'shared_catalog'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record draft order');
      }

      setPlacedOrderCode(data.orderCode);
      // Trigger WhatsApp
      handleConfirmWhatsApp();
    } catch (err) {
      console.error('Error placing draft order:', err);
      setOrderSubmitError(err.message || 'Error processing order inquiry.');
      // Fallback: still open WhatsApp
      handleConfirmWhatsApp();
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleOpenWhatsAppCheckout = () => {
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
          background-color: #f8fafc;
          padding: 3px 10px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 0.8rem;
          color: #334155;
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
        /* Executive Header Card */
        .header-card {
          background: linear-gradient(135deg, #00284d 0%, #003666 55%, #0284c7 100%);
          color: #ffffff;
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px -5px rgba(0, 54, 102, 0.25);
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
        @media (max-width: 768px) {
          .catalog-container {
            padding: 10px 8px 105px 8px;
          }
          .header-card {
            padding: 16px 14px;
            border-radius: 12px;
          }
          .header-card h1 {
            font-size: 1.35rem !important;
          }
          .product-card {
            padding: 12px 10px;
            margin-bottom: 10px;
            border-radius: 10px;
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
        }
        @media (max-width: 640px) {
          .topbar-inner {
            padding: 8px 10px;
            gap: 8px;
          }
          .topbar-brand {
            width: 100%;
            justify-content: space-between;
          }
          .topbar-brand-title {
            font-size: 0.85rem;
          }
          .portal-verified-badge {
            display: none !important;
          }
          .topbar-actions {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .topbar-destination {
            padding: 3px 6px;
            flex-shrink: 0;
          }
          .topbar-destination select {
            max-width: 86px !important;
            font-size: 0.72rem !important;
          }
          .currency-btn {
            padding: 3px 6px;
            font-size: 0.72rem;
          }
          .topbar-cart-pill {
            padding: 4px 8px;
            font-size: 0.74rem;
            flex-shrink: 0;
          }
          .topbar-signin-btn {
            padding: 4px 8px;
            font-size: 0.72rem;
            flex-shrink: 0;
          }
          .topbar-apply-btn {
            padding: 4px 8px;
            font-size: 0.72rem;
            flex-shrink: 0;
            white-space: nowrap;
          }
          .variant-card {
            padding: 10px 8px !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
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
          .cart-drawer-card {
            max-width: calc(100vw - 20px) !important;
            margin: 0 10px !important;
            padding: 14px !important;
            max-height: 55vh !important;
          }
          .checkout-form-grid {
            grid-template-columns: 1fr !important;
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
            {/* Destination Selector */}
            <div className="topbar-destination">
              <span style={{ marginRight: '5px' }}>✈️</span>
              <select
                value={selectedShipping}
                onChange={(e) => setSelectedShipping(e.target.value)}
                style={{
                  background: 'transparent',
                  color: '#0f172a',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  maxWidth: '170px'
                }}
              >
                {SHIPPING_DESTINATIONS.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.flag} {d.code} (+{currencySymbol}{currentCurrency === 'EUR' ? d.costEUR : d.costUSD})
                  </option>
                ))}
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
            </div>

            {/* Top Cart Pill (if active) */}
            {cartTotalUnits > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="topbar-cart-pill"
                title="Review Order"
              >
                <Package size={14} />
                <span>{cartTotalUnits} Vials</span>
                <span>•</span>
                <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
              </button>
            )}

            {/* Provider Sign In & Registration Actions */}
            <a
              href="/auth/login"
              className="topbar-signin-btn"
              title="Provider Authentication"
            >
              <Lock size={13} color="#003666" />
              <span>Sign In</span>
            </a>

            <button
              type="button"
              onClick={() => { setRegisterSubmitted(false); setRegisterError(''); setIsRegisterModalOpen(true); }}
              className="topbar-apply-btn"
            >
              <Building2 size={13} />
              <span>Apply for Portal Access</span>
            </button>
          </div>
        </div>
      </header>

      <div className="catalog-container">
        {/* Executive Header Card */}
        <div className="header-card">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ flex: '1 1 560px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#93c5fd', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                <Sparkles size={14} />
                <span>Clinical Portfolio & Therapeutic Vademecum</span>
              </div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                Official Clinical Formulations & Product Portfolio
              </h1>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: '#e0f2fe', lineHeight: 1.45, maxWidth: '640px' }}>
                Analytical-grade lyophilized peptide vials, multi-dose presentations, and standardized therapeutic protocols. Verified direct delivery terms for authorized healthcare institutions.
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px', fontSize: '0.8rem', color: '#ffffff' }}>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '6px', fontWeight: 600 }}>
                  📅 Effective: {catalogMeta.issuedAt || catalogMeta.iat 
                    ? new Date(catalogMeta.issuedAt || catalogMeta.iat).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '6px', fontWeight: 600 }}>
                  🏷️ {priceTierLabel}
                </span>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '6px', fontWeight: 600 }}>
                  {isProtocolCatalog 
                    ? `📋 ${protocols.length} Clinical Protocols`
                    : `📦 ${products.length} Formulations • ${totalVariants} Presentations`}
                </span>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '6px', fontWeight: 600 }}>
                  ❄️ 2–8°C GDP Cold-Chain Certified
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
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
              <span style={{ fontSize: '0.72rem', color: '#bae6fd', paddingLeft: '4px' }}>
                Complete Vademecum (PDF with COA References)
              </span>
            </div>
          </div>
        </div>

        {/* Commercial Incoterms Banner */}
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.82rem',
          color: '#1e40af'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem' }}>
              DAP
            </span>
            <span style={{ fontWeight: 700, color: '#1e3a8a' }}>
              Commercial Terms: Direct Delivery (DAP)
            </span>
            <span style={{ color: '#93c5fd' }}>•</span>
            <span style={{ color: '#3b82f6' }}>
              All unit and kit prices are quoted in {currentCurrency}. Certified cold-chain courier freight is calculated based on destination at checkout.
            </span>
          </div>
          <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.78rem' }}>
            Atlas Commercial Desk
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

        {/* Search & Filter Bar */}
        <div className="filter-bar">
          <div className="catalog-search-box">
            <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search peptide, dosage (e.g. 10mg), category..."
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
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Smart Filters & Category Filters in smooth horizontal scroll row */}
          <div className="chips-scroll-container">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`category-chip ${selectedCategory === 'all' ? 'active' : 'inactive'}`}
            >
              All Formulations ({products.length})
            </button>

            <button
              onClick={() => setDosageFilter(dosageFilter === 'kits' ? 'all' : 'kits')}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                backgroundColor: dosageFilter === 'kits' ? '#16a34a' : '#f0fdf4',
                color: dosageFilter === 'kits' ? '#ffffff' : '#15803d',
                borderColor: dosageFilter === 'kits' ? '#15803d' : '#bbf7d0',
                transition: 'all 0.15s ease'
              }}
            >
              📦 10-Pack Kits
            </button>

            <button
              onClick={() => setDosageFilter(dosageFilter === 'high_dose' ? 'all' : 'high_dose')}
              style={{
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                backgroundColor: dosageFilter === 'high_dose' ? '#7c3aed' : '#f5f3ff',
                color: dosageFilter === 'high_dose' ? '#ffffff' : '#6d28d9',
                borderColor: dosageFilter === 'high_dose' ? '#6d28d9' : '#ddd6fe',
                transition: 'all 0.15s ease'
              }}
            >
              💪 High Dose (≥10mg)
            </button>

            {categories.filter(c => c !== 'all').map(cat => {
              const label = {
                peptide: 'Peptides',
                weight_loss: 'Metabolic & GLP-1',
                longevity: 'Longevity & Bioregulators',
                supplement: 'Bioregulators & Supplements',
                nutricosmetics: 'Aesthetic & Skin',
                clinical_supplies: 'Clinical Supplies',
                raw_material: 'Raw Materials'
              }[cat] || cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-chip ${selectedCategory === cat ? 'active' : 'inactive'}`}
                >
                  {label}
                </button>
              );
            })}
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
                            {prod.requiresColdChain && (
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                backgroundColor: '#eff6ff',
                                color: '#2563eb',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                border: '1px solid #bfdbfe'
                              }}>
                                <Snowflake size={12} /> 2-8°C Cold Chain
                              </span>
                            )}
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
                        {prod.variants.map((v, vIdx) => {
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 220px' }}>
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
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                                    {v.dosage || v.name || 'Standard Presentation'}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ textTransform: 'capitalize' }}>Format: {v.presentation || 'Vial'}</span>
                                    <span>•</span>
                                    <span style={{ color: '#16a34a', fontWeight: 600 }}>In Stock (Available)</span>
                                  </div>
                                </div>
                              </div>

                              {includePrices && (
                                <div className="variant-pricing-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                  {/* Single Unit (1-9) Box & Counter */}
                                  <div className="single-unit-box" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '4px 8px',
                                  }}>
                                    <div style={{ textAlign: 'right' }}>
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
                                          width: '26px',
                                          height: '26px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          background: 'transparent',
                                          border: 'none',
                                          cursor: cart[v.id]?.quantity ? 'pointer' : 'default',
                                          fontWeight: 800,
                                          color: cart[v.id]?.quantity ? '#0f172a' : '#cbd5e1'
                                        }}
                                        title="Decrease 1 Unit"
                                      >
                                        -
                                      </button>
                                      <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800, fontSize: '0.82rem', color: cart[v.id]?.quantity ? '#003666' : '#64748b' }}>
                                        {cart[v.id]?.quantity || 0}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => updateQuantity(v, prod, 1)}
                                        style={{
                                          width: '26px',
                                          height: '26px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          background: '#003666',
                                          color: '#ffffff',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          fontWeight: 800
                                        }}
                                        title="Add 1 Single Unit"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* 10-Unit Pack Volume Price & Direct Kit Action Button */}
                                  {kitDisplayPrice > 0 && (
                                    <div className="kit-pack-box" style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px',
                                      backgroundColor: '#f0fdf4',
                                      borderRadius: '8px',
                                      padding: '4px 10px',
                                      border: '1px solid #bbf7d0',
                                    }}>
                                      <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
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

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <button
                                          type="button"
                                          onClick={() => updateQuantity(v, prod, 10)}
                                          className="add-kit-btn"
                                          title="Add 1 Full Pack of 10 Vials at Discount"
                                        >
                                          + Add Kit (10)
                                        </button>

                                        {(cart[v.id]?.quantity || 0) >= 10 && (
                                          <button
                                            type="button"
                                            onClick={() => updateQuantity(v, prod, -10)}
                                            className="remove-kit-btn"
                                            title="Remove 1 Kit (10 Vials)"
                                          >
                                            -1 Kit
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div className="mobile-hide" style={{ fontSize: '0.825rem', color: '#475569' }}>
              <strong>{catalogMeta.accountManagerName || 'Atlas Commercial Desk'}</strong> • {catalogMeta.accountManagerEmail || 'commercial@atlashealth.com'}
            </div>

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
          </div>

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
              style={{
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              <MessageSquare size={16} />
              <span>{cartTotalUnits > 0 ? `WhatsApp Order (${cartTotalUnits})` : 'Inquire via WhatsApp'}</span>
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
                  style={{
                    flex: 1,
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
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
                  <MessageSquare size={14} />
                  <span>Send Order</span>
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
          <div style={{
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    Confirm Clinical Order Inquiry
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                    Direct dispatch & pro-forma processing
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
                  Total Estimated Order
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d' }}>
                  {cartTotalUnits} units • {currencySymbol}{grandTotal.toFixed(2)} {currentCurrency}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                {activeShipping.flag} {activeShipping.code} Destination
              </div>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Clinic / Doctor Name *
                </label>
                <input
                  type="text"
                  value={checkoutForm.clinicName}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, clinicName: e.target.value })}
                  placeholder="e.g. Lotusland Regenerative Clinic"
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
                  Delivery Address & City / Country
                </label>
                <input
                  type="text"
                  value={checkoutForm.deliveryAddress}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryAddress: e.target.value })}
                  placeholder="Street, Medical Building, City, Country"
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
                  Special Instructions / Courier Notes
                </label>
                <textarea
                  rows={2}
                  value={checkoutForm.deliveryNotes}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryNotes: e.target.value })}
                  placeholder="e.g. Priority cold-chain delivery required"
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

            {/* Placed Order Notification Banner */}
            {placedOrderCode && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.825rem',
                color: '#15803d',
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <div>
                  <strong>Order Draft #{placedOrderCode} registered in portal.</strong> Our operations team and your account manager have been dispatched an immediate alert.
                </div>
              </div>
            )}

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
                <MessageSquare size={18} />
                <span>{isSubmittingOrder ? 'Registering Draft & Opening WhatsApp...' : 'Submit Order & Send via WhatsApp 🚀'}</span>
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
                <span>{isGeneratingProForma ? 'Generating PDF...' : '📄 Download Official Pro-Forma (PDF)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clinic Portal Access Registration Modal ──────────────────────── */}
      {isRegisterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmittingRegister) {
              setIsRegisterModalOpen(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              padding: '28px',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              disabled={isSubmittingRegister}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '1.2rem',
                fontWeight: 700,
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close modal"
            >
              ✕
            </button>

            {registerSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 8px' }}>
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
                  Our medical compliance team will review your professional license and practice credentials within 24 business hours. You will receive your dedicated portal sign-in credentials via email.
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
                    padding: '10px 24px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284c7'
                    }}
                  >
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Institutional Portal Access Application
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Certified medical clinics, practitioners & healthcare organizations only.
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.45, margin: '8px 0 16px' }}>
                  Apply for institutional tier pricing, clinical dosing documentation, cold-chain logistics, and automated prescription processing.
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
                      marginBottom: '16px'
                    }}
                  >
                    ⚠️ {registerError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Clinic / Practice Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Longevity Institute"
                        value={registerForm.clinicName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, clinicName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Lead Practitioner / Contact *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. / Director Full Name"
                        value={registerForm.contactName}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, contactName: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Professional Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="practitioner@clinic.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, phone: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Country of Practice
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. United States, Spain, Mexico"
                        value={registerForm.country}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, country: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Clinical Specialty
                      </label>
                      <select
                        value={registerForm.specialty}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, specialty: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          backgroundColor: '#ffffff'
                        }}
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Medical License / NPI / Reg. ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. MD-12345678 (Optional)"
                        value={registerForm.licenseNumber}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Est. Monthly Peptide Volume
                      </label>
                      <select
                        value={registerForm.estimatedMonthlyVolume}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, estimatedMonthlyVolume: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <option value="10 - 25 vials / month">10 - 25 vials / month</option>
                        <option value="25 - 100 vials / month">25 - 100 vials / month (Standard Practice)</option>
                        <option value="100 - 500 vials / month">100 - 500 vials / month (Multi-Doctor Clinic)</option>
                        <option value="500+ vials / month">500+ vials / month (Institutional Supply)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Additional Clinical Requirements or Specific Formulations
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specify any target formulations, recurring protocol requirements or compound purity needs..."
                      value={registerForm.notes}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, notes: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setIsRegisterModalOpen(false)}
                      disabled={isSubmittingRegister}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '9px 18px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
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
                        padding: '10px 22px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: isSubmittingRegister ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: isSubmittingRegister ? 0.7 : 1
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
