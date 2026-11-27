"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Search, ShoppingCart, Package, Check, CheckCircle2, ShieldCheck, ArrowRight, X, Plus, Minus, Globe, QrCode, SlidersHorizontal } from '@/lib/icons';
import { useRegisterAtlasContext } from '@/context/AtlasContextProvider';
import CopyableId from '@/components/ui/CopyableId';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import InternationalPhoneInput from '@/components/ui/InternationalPhoneInput';
import { fetchCollectionProductsAction } from '@/actions/vialsCatalogActions';
import { SUPPORTED_COLLECTIONS } from '@/constants/supportedCollections';
import { usePricing } from '@/hooks/usePricing';
import PriceDisplay from '@/components/pricing/PriceDisplay';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PageHeroCard from '@/components/ui/PageHeroCard';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';

const COLLECTIONS_LIST = [
  { id: 'vials', label: 'Peptides (Vials)', icon: '🧪' },
  { id: 'bloodo', label: 'Bloodo™ Diagnostics', icon: '🩸' },
  { id: 'colway', label: 'Colway® Dermocosmetics', icon: '✨' },
  { id: 'ultraman', label: 'UltraPerson™ Supplements', icon: '🌿' },
  { id: 'teletest', label: 'TeleTest® Lab Panels', icon: '🔬' }
];

const GOAL_OPTIONS = [
  { id: 'all', label: 'All Formulations' },
  { id: 'tissue_repair', label: 'Tissue Repair' },
  { id: 'anti_aging', label: 'Longevity & Cellular' },
  { id: 'fat_loss', label: 'Weight Management' },
  { id: 'cognitive', label: 'Cognitive & Neuro' },
  { id: 'general_health', label: 'General & Immunity' }
];

const SPECIALTY_FILTERS = {
  gynecology: {
    label: "Gynecology & Women's Health",
    keywords: [
      'kisspeptin', 'pt-141', 'bremelanotide', 'oxytocin',
      'bpc-157', 'tb-500', 'ghk-cu', 'epitalon', 'nad',
      'tirzepatide', 'semaglutide', 'retatrutide', 'aod-9604', 'glutathione'
    ]
  },
  dermatology: {
    label: 'Dermatology & Trichology',
    keywords: [
      'ghk-cu', 'bpc-157', 'tb-500', 'epitalon', 'glutathione',
      'melanotan', 'nad', 'thymulin', 'ahku'
    ]
  },
  longevity: {
    label: 'Longevity & Cellular Medicine',
    keywords: [
      'epitalon', 'nad', 'ss-31', 'mots-c', 'foxo4',
      'thymosin', 'ghk-cu', 'bpc-157', 'glutathione', 'selank', 'semax'
    ]
  },
  metabolic: {
    label: 'Metabolic & Endocrinology',
    keywords: [
      'tirzepatide', 'semaglutide', 'retatrutide', 'aod-9604',
      'tesamorelin', 'cjc-1295', 'ipamorelin', 'mots-c', '5-amino'
    ]
  },
  urology: {
    label: 'Urology & Andrology',
    keywords: [
      'pt-141', 'kisspeptin', 'oxytocin', 'gonadorelin',
      'bpc-157', 'nad'
    ]
  }
};

const SHIPPING_OPTIONS = [
  { code: 'EU', label: 'Europe Express Cold-Pack (≤2 kg)', cost: 65.22 },
  { code: 'US', label: 'United States Express Cold-Pack (≤2 kg)', cost: 25 },
  { code: 'AE', label: 'UAE / GCC Express Cold-Pack (≤2 kg)', cost: 80 },
  { code: 'ROW', label: 'International / Worldwide (DHL Express)', cost: 80 }
];

export default function VialsCatalogClient({ initialVials = [], initialCollection = 'vials', initialLang = 'en', initialCurrency = 'EUR', referralInfo = null, isPatientView = false }) {
  const { isAdmin, pricingRole, resolve: resolveProduct } = usePricing();
  const isEs = initialLang === 'es';
  const [activeCollection, setActiveCollection] = useState(initialCollection || 'vials');
  const [vials, setVials] = useState(initialVials);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [copiedSpecialtyUrl, setCopiedSpecialtyUrl] = useState(false);
  const [copiedWhatsAppMsg, setCopiedWhatsAppMsg] = useState(false);

  useEffect(() => {
    const onOpenFilters = () => setMobileFiltersOpen(true);
    window.addEventListener('open-catalog-filters', onOpenFilters);
    return () => window.removeEventListener('open-catalog-filters', onOpenFilters);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const goal = params.get('goal');
    const specialty = params.get('specialty')?.toLowerCase();
    if (q) setSearchQuery(q);
    if (goal && GOAL_OPTIONS.some((g) => g.id === goal)) setSelectedGoal(goal);
    if (specialty && SPECIALTY_FILTERS[specialty]) setSelectedSpecialty(specialty);
  }, []);
  const [cart, setCart] = useState({}); // { [vialId]: { vial, quantity } }
  const [quantities, setQuantities] = useState({}); // { [vialId]: count }
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);

  // Checkout form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  // Active opaque referral code tracking (strictly white-label on client)
  const activeReferralCode = referralInfo?.referralCode || 'CAT-RX-7482';

  // Persist referral code locally (visit is already tracked server-side in page.jsx to prevent double-counting)
  useEffect(() => {
    if (activeReferralCode) {
      try {
        localStorage.setItem('atlas_catalog_ref', activeReferralCode);
      } catch {
        // Safe localStorage fallback
      }
    }
  }, [activeReferralCode]);

  const handleSwitchCollection = async (slug) => {
    if (slug === activeCollection) return;
    setActiveCollection(slug);
    setIsLoadingCollection(true);
    setSearchQuery('');
    setSelectedGoal('all');
    try {
      const items = await fetchCollectionProductsAction(slug);
      setVials(items);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('collection', slug);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (err) {
      console.error('Error switching collection:', err);
    } finally {
      setIsLoadingCollection(false);
    }
  };

  // Read stored referral fallback from localStorage if missing in URL
  const [persistedRef] = useState(() => {
    if (activeReferralCode) return activeReferralCode;
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('atlas_catalog_ref') || 'CAT-RX-7482';
      } catch {
        return 'CAT-RX-7482';
      }
    }
    return 'CAT-RX-7482';
  });

  const finalReferralCode = activeReferralCode || persistedRef;

  // Filtered vials
  const filteredVials = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const specCfg = selectedSpecialty ? SPECIALTY_FILTERS[selectedSpecialty] : null;
    return vials.filter(item => {
      const nameLower = (item.productName || '').toLowerCase();
      const matchesSearch = !q ||
        nameLower.includes(q) ||
        (item.dosage || '').toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      const matchesGoal = selectedGoal === 'all' ||
        item.primaryGoal === selectedGoal ||
        (Array.isArray(item.goals) && item.goals.includes(selectedGoal));

      const matchesSpecialty = !specCfg ||
        specCfg.keywords.some((kw) => nameLower.includes(kw));

      return matchesSearch && matchesGoal && matchesSpecialty;
    });
  }, [vials, searchQuery, selectedGoal, selectedSpecialty]);

  // Quantity selector helpers
  const getSelectedQuantity = (vialId) => quantities[vialId] || 1;

  const handleQuantityChange = (vialId, delta) => {
    setQuantities(prev => {
      const current = prev[vialId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [vialId]: next };
    });
  };

  const handleSetExactQuantity = (vialId, qty) => {
    setQuantities(prev => ({
      ...prev,
      [vialId]: Math.max(1, Number(qty) || 1)
    }));
  };

  // Cart operations
  const handleAddToCart = (vial, count = null) => {
    const qty = count !== null ? count : getSelectedQuantity(vial.id);
    setCart(prev => {
      const existing = prev[vial.id]?.quantity || 0;
      return {
        ...prev,
        [vial.id]: {
          vial,
          quantity: existing + qty
        }
      };
    });
  };

  const handleUpdateCartQuantity = (vialId, newQty) => {
    if (newQty <= 0) {
      setCart(prev => {
        const next = { ...prev };
        delete next[vialId];
        return next;
      });
    } else {
      setCart(prev => ({
        ...prev,
        [vialId]: {
          ...prev[vialId],
          quantity: newQty
        }
      }));
    }
  };

  // Cart totals calculation
  const cartItemsArray = useMemo(() => Object.values(cart), [cart]);

  const { totalUnits, subtotal } = useMemo(() => {
    let units = 0;
    let sum = 0;
    cartItemsArray.forEach(({ vial, quantity }) => {
      units += quantity;
      // Volume pricing for 10 or more units of this item
      const isBulk = quantity >= 10;
      const effectiveUnitPrice = isBulk ? vial.tier10UnitPrice : vial.unitPrice;
      sum += quantity * effectiveUnitPrice;
    });
    return {
      totalUnits: units,
      subtotal: Math.round(sum * 100) / 100
    };
  }, [cartItemsArray]);

  const activeCurrency = ['EUR', 'USD', 'AED'].includes(String(initialCurrency || '').toUpperCase())
    ? String(initialCurrency).toUpperCase()
    : 'USD';
  const fxRate = activeCurrency === 'EUR' ? 0.92 : activeCurrency === 'AED' ? 3.6725 : 1;
  const activeCurrencySymbol = activeCurrency === 'EUR' ? '€' : activeCurrency === 'AED' ? 'AED ' : '$';
  const fmtAmount = (usdVal) => `${activeCurrencySymbol}${(Number(usdVal || 0) * fxRate).toFixed(2)}`;
  const grandTotal = Math.round((subtotal + (totalUnits > 0 ? selectedShipping.cost : 0)) * 100) / 100;

  useRegisterAtlasContext(
    {
      contextAnchor: {
        type: 'vials_directory',
        collection: activeCollection,
        view: isPatientView ? 'patient' : 'doctor',
        name: isPatientView ? 'Patient Peptide Guides' : (SUPPORTED_COLLECTIONS[activeCollection]?.title || 'Clinical Formulations'),
      },
      bottomBar: isPatientView
        ? {
            summaryTitle: 'Patient Peptide Guides',
            summarySubtitle: 'Reconstitution & Administration Reference',
            atlasAiLabel: 'Ask Atlas AI',
          }
        : {
            summaryTitle: SUPPORTED_COLLECTIONS[activeCollection]?.title || 'Clinical Formulations',
            summarySubtitle: `${vials.length} SKUs · Physician & Clinic Supply`,
            atlasAiLabel: 'Ask Atlas AI',
            primaryAction: {
              label: `Order Request${totalUnits > 0 ? ` (${totalUnits})` : ''}`,
              onClick: () => setIsCartModalOpen(true),
            },
          },
    },
    [activeCollection, isPatientView, vials.length, totalUnits]
  );

  // Checkout submission
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Please provide your full name or clinic name.';
    if (!formData.email.trim() || !formData.email.includes('@')) errors.email = 'Valid email address is required to receive the payment link.';
    if (!formData.phone.trim()) errors.phone = 'Phone number / WhatsApp is required for delivery coordination.';
    if (!formData.address.trim()) errors.address = 'Complete delivery address is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cartItemsArray.length === 0) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formattedCartItems = cartItemsArray.map(({ vial, quantity }) => {
        const isBulk = quantity >= 10;
        const effectiveUnitPrice = isBulk ? vial.tier10UnitPrice : vial.unitPrice;
        return {
          id: vial.id,
          productId: vial.productId,
          variantId: vial.variantId,
          productName: vial.productName,
          dosage: vial.dosage,
          presentation: vial.presentation,
          quantity,
          price: effectiveUnitPrice,
          unitPrice: effectiveUnitPrice,
          tier10UnitPrice: vial.tier10UnitPrice,
          total: Number((quantity * effectiveUnitPrice).toFixed(2))
        };
      });

      const res = await fetch('/api/orders/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: formattedCartItems,
          customerName: formData.name.trim(),
          customerEmail: formData.email.trim(),
          customerPhone: formData.phone.trim(),
          customerAddress: formData.address.trim(),
          customerNotes: formData.notes.trim(),
          shippingDestination: selectedShipping.label,
          shippingCode: selectedShipping.code,
          shippingCost: selectedShipping.cost,
          subtotal,
          grandTotal,
          currency: activeCurrency,
          currencySymbol: activeCurrencySymbol,
          totalUnits,
          priceTier: 'wholesale',
          priceTierLabel: 'Verified Wholesale Schedule',
          priceSource: 'wholeseller',
          priceMarkupPercent: 15,
          referralCode: finalReferralCode || 'CAT-RX-7482',
          catalogId: 'CAT-RX-7482',
          collection: activeCollection,
          paymentMethod: 'payment_link_24h',
          source: 'wholesaler_vials_public'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit order.');
      }

      setSubmittedOrder({
        orderCode: data.orderCode,
        orderId: data.orderId,
        customerName: formData.name,
        customerEmail: formData.email,
        totalUnits,
        grandTotal,
        itemsCount: cartItemsArray.length
      });

      // Clear cart
      setCart({});
      toast.success(isEs ? 'Solicitud de pedido registrada con éxito ✓' : 'Order request confirmed ✓');
    } catch (err) {
      toast.error(isEs ? `Error al enviar el pedido: ${err.message}` : `Error submitting order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <PublicUnifiedHeader
        brandHref={isPatientView ? '/vials?view=patient' : '/'}
        loginRedirect={isPatientView ? '/vials?view=patient' : '/vials'}
        hideCurrencySelector={true}
        hideAccountManager={true}
        breadcrumb={isPatientView
          ? [{ label: 'Patient Peptide Guides' }]
          : [
              { label: 'Catalog', href: '/pricing' },
              { label: 'Clinical Formulations Directory' },
            ]}
        extraActions={!isPatientView ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-global-qr-modal', {
                    detail: {
                      url: `${window.location.origin}/vials?collection=${encodeURIComponent(activeCollection)}&view=patient`,
                      title: 'Patient Directory QR Code',
                      subtitle: 'Shareable patient-only peptide & reconstitution guides (no B2B pricing)',
                    },
                  }));
                }
              }}
              className="puh-btn puh-btn-ghost"
              title="Share Patient Directory QR"
            >
              <QrCode size={14} />
              <span className="puh-btn-label">Patient QR</span>
            </button>
            <Link
              href={`/vials?collection=${encodeURIComponent(activeCollection)}&view=patient`}
              className="puh-btn puh-btn-ghost"
              style={{ textDecoration: 'none' }}
            >
              <span className="puh-btn-label">Patient View</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsCartModalOpen(true)}
              className="puh-btn"
              style={{
                background: '#2563eb',
                border: '1px solid #1d4ed8',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              <ShoppingCart size={14} />
              <span className="puh-btn-label">
                Order Request{totalUnits > 0 ? ` (${totalUnits})` : ''}
              </span>
            </button>
          </div>
        ) : null}
      />

      {/* ── Main Catalog Workspace ── */}
      <style>{`
        .vials-mobile-filter-bar { display: none; }
        .vials-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 16px;
        }
        .vials-checkout-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .vials-sticky-cart-bar {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 800px;
          background-color: #003666;
          border-radius: 14px;
          padding: 12px 20px;
          box-shadow: 0 12px 30px rgba(0, 54, 102, 0.35);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          z-index: 9910;
          color: #ffffff;
          box-sizing: border-box;
        }
        @media (max-width: 1023px) {
          .vials-sticky-cart-bar {
            bottom: calc(64px + env(safe-area-inset-bottom, 0px));
            width: calc(100% - 20px);
            padding: 10px 14px;
            border-radius: 12px;
          }
        }
        @media (max-width: 768px) {
          .vials-hero-wrap,
          .vials-notice-banner,
          .vials-desktop-filters {
            display: none !important;
          }
          .vials-mobile-filter-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 12px;
          }
          .vials-cards-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
          }
          .vials-checkout-two-col {
            grid-template-columns: minmax(0, 1fr);
          }
        }
      `}</style>
      <main className="atlas-page-shell" style={{ overflowX: 'hidden', paddingBottom: totalUnits > 0 ? '150px' : '84px' }}>
        <div className="vials-hero-wrap">
          <PageHeroCard
            brandLeft={isPatientView ? 'PATIENT GUIDE' : 'ATLAS HEALTH'}
            brandRight={isPatientView ? 'RECONSTITUTION & CARE' : (SUPPORTED_COLLECTIONS[activeCollection]?.title?.toUpperCase() || 'CLINICAL FORMULATIONS')}
            badges={isPatientView ? ['PATIENT EDUCATION', 'RECONSTITUTION GUIDES'] : ['≥99.0% HPLC', 'DIRECT SUPPLY']}
            title={isPatientView
              ? 'Patient Peptide & Reconstitution Guide Directory'
              : (SUPPORTED_COLLECTIONS[activeCollection]?.title || 'Clinical Formulations Directory')}
            subtitle={isPatientView
              ? 'Select your prescribed peptide below to open step-by-step reconstitution, storage, and administration guidance.'
              : (SUPPORTED_COLLECTIONS[activeCollection]?.description || 'Institutional sterile lyophilized peptides, clinical supplements, and regenerative formulations.')}
            metaItems={[
              { label: 'AUDIENCE:', value: isPatientView ? 'PATIENT GUIDE' : 'PHYSICIAN / CLINIC', mono: true },
              { label: 'PRODUCTS:', value: `${vials.length} SKUs`, mono: true },
            ]}
          />
        </div>

        {/* ── Multi-Collection Switcher (Desktop) ── */}
        <div className="vials-desktop-filters" style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
            Select Clinical Collection:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {COLLECTIONS_LIST.map(col => {
              const isSelected = activeCollection === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => handleSwitchCollection(col.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    border: isSelected ? '1.5px solid #003666' : '1px solid #cbd5e1',
                    backgroundColor: isSelected ? '#003666' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#334155',
                    boxShadow: isSelected ? '0 2px 6px rgba(0, 54, 102, 0.2)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{col.icon}</span>
                  <span>{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Collection Banner Notice */}
        {(() => {
          const colInfo = SUPPORTED_COLLECTIONS[activeCollection] || SUPPORTED_COLLECTIONS.vials;
          return (
            <div className="vials-notice-banner" style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <ShieldCheck size={22} color="#1d4ed8" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.45 }}>
                  <strong>{colInfo.title}:</strong> {colInfo.badge}. {colInfo.deliveryPledge} <strong>No upfront card payment required today</strong> — a verified secure payment link will be issued to your email and WhatsApp within 24 hours of placing your request.
                </div>
              </div>
              {!isPatientView && activeCollection === 'vials' && (
                <Link
                  href={`/pricing/peptides?currency=${encodeURIComponent(activeCurrency)}${isEs ? '&lang=es' : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span>{isEs ? 'Ver Tarifario B2B + PDF' : 'Official B2B Table & PDF'}</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          );
        })()}

        {/* ── Search & Filter Bar (Google Cloud Rule #7: Search First with GlobalSearchBar) ── */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            <GlobalSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={isEs ? 'Buscar péptido (ej. BPC-157, Tirzepatida, GHK-Cu, NAD+, Epithalon)...' : 'Search by peptide name (e.g. BPC-157, Tirzepatide, GHK-Cu, NAD+, Epithalon)...'}
              size="lg"
              resultCount={filteredVials.length}
              isLocalOnly={true}
              filters={[
                ...(activeCollection !== 'vials'
                  ? [{
                      key: 'collection',
                      label: isEs ? 'Colección' : 'Collection',
                      value: COLLECTIONS_LIST.find((c) => c.id === activeCollection)?.label || activeCollection,
                      onRemove: () => handleSwitchCollection('vials'),
                    }]
                  : []),
                ...(selectedGoal !== 'all'
                  ? [{
                      key: 'goal',
                      label: isEs ? 'Objetivo' : 'Goal',
                      value: GOAL_OPTIONS.find((g) => g.id === selectedGoal)?.label || selectedGoal,
                      onRemove: () => setSelectedGoal('all'),
                    }]
                  : []),
                ...(selectedSpecialty && SPECIALTY_FILTERS[selectedSpecialty]
                  ? [{
                      key: 'specialty',
                      label: isEs ? 'Especialidad' : 'Specialty',
                      value: SPECIALTY_FILTERS[selectedSpecialty].label,
                      onRemove: () => {
                        setSelectedSpecialty(null);
                        if (typeof window !== 'undefined') {
                          const url = new URL(window.location.href);
                          url.searchParams.delete('specialty');
                          window.history.replaceState({}, '', url.toString());
                        }
                      },
                    }]
                  : []),
              ]}
            />
          </div>

          {/* Mobile Compact Filter Trigger Bar */}
          <div className="vials-mobile-filter-bar">
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
              {filteredVials.length} {isEs ? 'referencias' : 'formulations'}
            </span>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="gcp-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '40px', padding: '6px 14px', fontSize: '0.80rem', fontWeight: 700 }}
            >
              <SlidersHorizontal size={14} />
              <span>{isEs ? 'Filtros y Colecciones' : 'Filters & Collections'}</span>
            </button>
          </div>

          {/* Goal Filter Chips + Specialty Selector (Desktop) */}
          <div className="vials-desktop-filters" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {selectedSpecialty && SPECIALTY_FILTERS[selectedSpecialty] && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecialty(null);
                    if (typeof window !== 'undefined') {
                      const url = new URL(window.location.href);
                      url.searchParams.delete('specialty');
                      window.history.replaceState({}, '', url.toString());
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid #0d9488',
                    backgroundColor: '#f0fdfa',
                    color: '#0f766e',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Clear specialty filter"
                >
                  <span>Specialty: {SPECIALTY_FILTERS[selectedSpecialty].label}</span>
                  <X size={13} />
                </button>
              )}
              {GOAL_OPTIONS.map(opt => {
                const isActive = selectedGoal === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedGoal(opt.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isActive ? '1px solid #003666' : '1px solid #e2e8f0',
                      backgroundColor: isActive ? '#003666' : '#ffffff',
                      color: isActive ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {!isPatientView && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <select
                  aria-label="Filter by clinical specialty"
                  value={selectedSpecialty || ''}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    setSelectedSpecialty(val);
                    if (typeof window !== 'undefined') {
                      const url = new URL(window.location.href);
                      if (val) url.searchParams.set('specialty', val);
                      else url.searchParams.delete('specialty');
                      window.history.replaceState({}, '', url.toString());
                    }
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">All Specialties</option>
                  {Object.entries(SPECIALTY_FILTERS).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window === 'undefined') return;
                    navigator.clipboard?.writeText(window.location.href);
                    setCopiedSpecialtyUrl(true);
                    setTimeout(() => setCopiedSpecialtyUrl(false), 2000);
                  }}
                  style={{
                    padding: '6px 11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: copiedSpecialtyUrl ? '#f0fdf4' : '#ffffff',
                    color: copiedSpecialtyUrl ? '#15803d' : '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedSpecialtyUrl ? 'Copied ✓' : 'Copy Filtered Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window === 'undefined') return;
                    const specTitle = selectedSpecialty && SPECIALTY_FILTERS[selectedSpecialty]
                      ? SPECIALTY_FILTERS[selectedSpecialty].label
                      : 'Clinical Peptide Vials';
                    const pitch = `Good morning Dr. [Last Name],\n\nAs a brief clinical reference for your ${specTitle} practice, I am sharing a direct link to our physician-only sterile lyophilized peptide formulary:\n\n• ${specTitle} Formulary:\n${window.location.href}\n\nBatch-verified USP/EP specifications and full monograph details are included. Should you require Certificates of Analysis (CoAs) or prescription coordination, please let me know.\n\nKind regards,\n[Your Name]`;
                    navigator.clipboard?.writeText(pitch);
                    setCopiedWhatsAppMsg(true);
                    setTimeout(() => setCopiedWhatsAppMsg(false), 2000);
                  }}
                  style={{
                    padding: '6px 11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: copiedWhatsAppMsg ? '#f0fdf4' : '#ffffff',
                    color: copiedWhatsAppMsg ? '#15803d' : '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {copiedWhatsAppMsg ? 'Pitch Copied ✓' : 'Copy WhatsApp Pitch'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
          Showing {filteredVials.length} verified formulation{filteredVials.length === 1 ? '' : 's'}
        </div>

        {isLoadingCollection ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '60px 24px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <Package size={36} color="#003666" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              Loading collection formulations...
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Retrieving verified analytical specifications and institutional terms.
            </div>
          </div>
        ) : filteredVials.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '2px dashed #e2e8f0',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <Package size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              No formulations match your search
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Try adjusting your search terms or clearing the active filters.
            </div>
            <button
              onClick={() => { setSearchQuery(''); setSelectedGoal('all'); }}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="vials-cards-grid">
            {filteredVials.map(vial => {
              const qty = getSelectedQuantity(vial.id);
              const inCartQty = cart[vial.id]?.quantity || 0;

              return (
                <div
                  key={vial.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: inCartQty > 0 ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  <div>
                    {/* Badge & Dosage Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        borderRadius: '9999px',
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {vial.purity}
                      </span>
                      <span style={{
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {vial.dosage}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '0 0 6px 0',
                      letterSpacing: '-0.2px'
                    }}>
                      <Link
                        href={`/p/${encodeURIComponent(vial.slug || vial.productId || vial.id)}${isPatientView ? '?view=patient' : ''}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {vial.productName}
                      </Link>
                    </h3>

                    {/* Format info */}
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                      {vial.presentation}{vial.collection === 'vials' && /vial/i.test(vial.presentation || '') ? ' • Lyophilized Cake' : ''}
                    </div>

                    {/* Description snippet */}
                    <p style={{
                      fontSize: '0.8rem',
                      color: '#475569',
                      lineHeight: 1.4,
                      margin: '0 0 16px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {vial.description}
                    </p>
                  </div>

                  {/* Pricing and Action Section (Physician) vs Patient Guide CTA */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                    {isPatientView ? (
                      <Link
                        href={`/p/${encodeURIComponent(vial.slug || vial.id)}?view=patient`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#0d9488',
                          color: '#ffffff',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                        }}
                      >
                        <span>Open Patient & Reconstitution Guide</span>
                        <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <>
                    {/* Price block */}
                    <div style={{ marginBottom: '12px' }}>
                      {(() => {
                        const resolved = resolveProduct(vial);
                        const fmtVial = (n) => fmtAmount(n);
                        if (isAdmin && resolved?.showTriple) {
                          return (
                            <PriceDisplay
                              resolved={resolved}
                              wholeseller={resolved.wholeseller ?? vial.unitPrice}
                              formatPrice={fmtVial}
                              isAdmin
                              variant="compact"
                            />
                          );
                        }
                        const displayPrice = resolved?.primaryPrice ?? vial.unitPrice;
                        return (
                          <>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003666' }}>
                                {fmtVial(displayPrice || 0)}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                / {(vial.unitNoun || 'vial').toLowerCase()}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                              {pricingRole === 'guest'
                                ? (isEs ? 'Tarifa clínica B2B' : 'Clinical B2B schedule')
                                : (resolved?.primaryLabel || (isEs ? 'Tarifa clínica B2B' : 'Clinical B2B schedule'))}
                            </span>
                          </>
                        );
                      })()}

                      <div style={{
                        marginTop: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        color: '#15803d',
                        backgroundColor: '#f0fdf4',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}>
                        Pack x10: {fmtAmount(vial.pack10Price)} ({fmtAmount(vial.tier10UnitPrice)}/ea)
                      </div>
                    </div>

                    {/* Quantity Selector + Add Button */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#ffffff'
                      }}>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(vial.id, -1)}
                          style={{
                            border: 'none',
                            background: 'none',
                            padding: '8px 10px',
                            cursor: 'pointer',
                            color: '#475569'
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) => handleSetExactQuantity(vial.id, e.target.value)}
                          style={{
                            width: '36px',
                            border: 'none',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            outline: 'none',
                            padding: 0
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(vial.id, 1)}
                          style={{
                            border: 'none',
                            background: 'none',
                            padding: '8px 10px',
                            cursor: 'pointer',
                            color: '#475569'
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(vial)}
                        style={{
                          flex: 1,
                          backgroundColor: '#003666',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '9px 12px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <Plus size={15} />
                        <span>Add</span>
                      </button>

                      <button
                        type="button"
                        title="Add full pack of 10 vials"
                        onClick={() => handleAddToCart(vial, 10)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '9px 10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        +10
                      </button>
                    </div>

                    {inCartQty > 0 && (
                      <div style={{
                        marginTop: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Check size={12} />
                        <span>{inCartQty} vial{inCartQty === 1 ? '' : 's'} in your order request</span>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Sticky Bottom Cart Bar (Appears when items are selected) ── */}
      {totalUnits > 0 && !isCartModalOpen && (
        <div className="vials-sticky-cart-bar">
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {totalUnits} {isEs ? (totalUnits === 1 ? 'Vial en Solicitud' : 'Viales en Solicitud') : (totalUnits === 1 ? 'Vial in Order Request' : 'Vials in Order Request')}
            </div>
            <div style={{ fontSize: '1.12rem', fontWeight: 800, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
              {fmtAmount(subtotal)} <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#bfdbfe' }}>{activeCurrency}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartModalOpen(true)}
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 16px',
              minHeight: '42px',
              fontSize: '0.86rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
            }}
          >
            <span>{isEs ? 'Continuar Pedido' : 'Proceed to Request'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* ── Express Checkout Modal / Drawer ── */}
      {isCartModalOpen && (
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
          zIndex: 10050
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0',
            padding: '24px',
            position: 'relative'
          }}>
            
            {/* Modal Close Button */}
            <button
              onClick={() => setIsCartModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>

            {/* Post-Submit Confirmation Screen */}
            {submittedOrder ? (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: '#f0fdf4',
                  border: '2px solid #bbf7d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: '#16a34a'
                }}>
                  <CheckCircle2 size={38} />
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                  Order Request Confirmed!
                </h2>
                
                <div style={{ margin: '0 0 16px 0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Order Reference: </span>
                  <CopyableId value={submittedOrder.orderCode} />
                </div>

                {/* 24-HOUR PAYMENT LINK PROMISE (Crucial Requirement) */}
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  color: '#14532d',
                  lineHeight: '1.5',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⏱️ Secure Payment Link Issued Within 24 Hours</span>
                  </div>
                  <p style={{ margin: '0 0 8px 0' }}>
                    Your order request has been successfully registered in our operations platform.
                  </p>
                  <p style={{ margin: '0 0 8px 0' }}>
                    Within a maximum of <strong>24 hours</strong>, you will receive a secure payment link via <strong>email ({submittedOrder.customerEmail})</strong> and <strong>WhatsApp</strong> to complete your payment and confirm immediate dispatch.
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#166534', borderTop: '1px dashed #bbf7d0', paddingTop: '8px', marginTop: '8px' }}>
                    Reserved allocation: <strong>{submittedOrder.totalUnits} vials</strong> for a total amount of <strong>${submittedOrder.grandTotal.toFixed(2)} USD</strong>.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { setSubmittedOrder(null); setIsCartModalOpen(false); }}
                  style={{
                    width: '100%',
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 20px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  Return to Catalog
                </button>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                  Order Request
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px 0' }}>
                  Review your formulations and enter dispatch coordinates.
                </p>

                {/* Items in Cart */}
                {cartItemsArray.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                    Your order request is currently empty.
                  </div>
                ) : (
                  <div>
                    <div style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      border: '1px solid #f1f5f9',
                      borderRadius: '10px',
                      padding: '10px',
                      marginBottom: '16px'
                    }}>
                      {cartItemsArray.map(({ vial, quantity }) => {
                        const isBulk = quantity >= 10;
                        const effectivePrice = isBulk ? vial.tier10UnitPrice : vial.unitPrice;
                        const itemTotal = quantity * effectivePrice;

                        return (
                          <div
                            key={vial.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              padding: '8px 0',
                              borderBottom: '1px solid #f8fafc'
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                                {vial.productName}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {vial.dosage} • ${effectivePrice.toFixed(2)}/vial
                                {isBulk && <span style={{ color: '#16a34a', marginLeft: '4px' }}>(Pack discount)</span>}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQuantity(vial.id, quantity - 1)}
                                  style={{ border: 'none', background: 'none', padding: '4px 6px', cursor: 'pointer' }}
                                >
                                  <Minus size={12} />
                                </button>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0 4px' }}>{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCartQuantity(vial.id, quantity + 1)}
                                  style={{ border: 'none', background: 'none', padding: '4px 6px', cursor: 'pointer' }}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <span style={{ fontSize: '0.85rem', fontWeight: 800, width: '60px', textAlign: 'right' }}>
                                ${itemTotal.toFixed(2)}
                              </span>

                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(vial.id, 0)}
                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Shipping Destination */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                        Shipping Destination:
                      </label>
                      <select
                        value={selectedShipping.code}
                        onChange={(e) => {
                          const found = SHIPPING_OPTIONS.find(o => o.code === e.target.value);
                          if (found) setSelectedShipping(found);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        {SHIPPING_OPTIONS.map(opt => (
                          <option key={opt.code} value={opt.code}>
                            {opt.label} — ${opt.cost.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Financial Summary */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '4px' }}>
                        <span>Subtotal ({totalUnits} {isEs ? 'viales' : 'vials'}):</span>
                        <span>{fmtAmount(subtotal)} {activeCurrency}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '8px' }}>
                        <span>{isEs ? 'Envío Estimado:' : 'Estimated Shipping:'}</span>
                        <span>{fmtAmount(selectedShipping.cost)} {activeCurrency}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', fontWeight: 800, color: '#003666', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                        <span>{isEs ? 'Total Estimado:' : 'Grand Total:'}</span>
                        <span>{fmtAmount(grandTotal)} {activeCurrency}</span>
                      </div>
                    </div>

                    {/* Contact & Dispatch Form */}
                    <form onSubmit={handleSubmitOrder}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                        
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            Full Name / Clinic Name *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Dr. John Smith / Wellness Institute"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: formErrors.name ? '1px solid #ef4444' : '1px solid #cbd5e1',
                              fontSize: '0.85rem',
                              boxSizing: 'border-box'
                            }}
                          />
                          {formErrors.name && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErrors.name}</span>}
                        </div>

                        <div className="vials-checkout-two-col">
                          <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                              Email (for Payment Link) *
                            </label>
                            <input
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="doctor@clinic.com"
                              style={{
                                width: '100%',
                                minHeight: '42px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: formErrors.email ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                fontSize: '0.85rem',
                                boxSizing: 'border-box'
                              }}
                            />
                            {formErrors.email && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErrors.email}</span>}
                          </div>

                          <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                              WhatsApp / Phone *
                            </label>
                            <InternationalPhoneInput
                              value={formData.phone}
                              onChange={(val) => setFormData({ ...formData, phone: typeof val === 'string' ? val : '' })}
                              countryHint={isEs ? 'ES' : 'AE'}
                              lang={isEs ? 'es' : 'en'}
                              placeholder={isEs ? '600 123 456' : '50 123 4567'}
                            />
                            {formErrors.phone && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErrors.phone}</span>}
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            Delivery Street Address, City, Postal Code & Country *
                          </label>
                          <textarea
                            rows="2"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Street, Building/Suite, City, Postcode, Country"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: formErrors.address ? '1px solid #ef4444' : '1px solid #cbd5e1',
                              fontSize: '0.85rem',
                              boxSizing: 'border-box',
                              resize: 'none'
                            }}
                          />
                          {formErrors.address && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErrors.address}</span>}
                        </div>

                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            Delivery Notes (Optional)
                          </label>
                          <input
                            type="text"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Special dispatch instructions, gate code, reception hours..."
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.85rem',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      {/* 24-HOUR PAYMENT NOTICE */}
                      <div style={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontSize: '0.78rem',
                        color: '#1e3a8a',
                        marginBottom: '18px',
                        lineHeight: 1.4
                      }}>
                        ⚡ <strong>No card payment required now.</strong> In less than 24 hours you will receive an official verification with a secure payment link directly to your WhatsApp and email.
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '13px 20px',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          opacity: isSubmitting ? 0.75 : 1,
                          boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Package size={18} />
                        <span>{isSubmitting ? 'Submitting Order Request...' : 'Confirm Order Request'}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile Filter Bottom Sheet (Google Cloud UX) ── */}
      {mobileFiltersOpen && (
        <div
          onClick={() => setMobileFiltersOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            zIndex: 10050,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '82vh',
              overflowY: 'auto',
              background: '#ffffff',
              borderRadius: '18px 18px 0 0',
              padding: '16px 18px 24px',
              boxShadow: '0 -8px 28px rgba(15, 23, 42, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? 'Filtros y Colecciones' : 'Filters & Collections'}
              </span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                style={{ border: 'none', background: '#f1f5f9', borderRadius: '999px', width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#334155' }}
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isEs ? 'Colección Clínica' : 'Clinical Collection'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {COLLECTIONS_LIST.map((col) => {
                  const isSelected = activeCollection === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => handleSwitchCollection(col.id)}
                      style={{
                        minHeight: '40px',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.80rem',
                        fontWeight: 700,
                        border: isSelected ? '1.5px solid #003666' : '1px solid #cbd5e1',
                        background: isSelected ? '#003666' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      {col.icon} {col.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isEs ? 'Objetivo Terapéutico' : 'Therapeutic Goal'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {GOAL_OPTIONS.map((opt) => {
                  const isActive = selectedGoal === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedGoal(opt.id)}
                      style={{
                        minHeight: '40px',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        border: isActive ? '1.5px solid #003666' : '1px solid #cbd5e1',
                        background: isActive ? '#003666' : '#ffffff',
                        color: isActive ? '#ffffff' : '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {!isPatientView && (
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {isEs ? 'Especialidad Médica' : 'Medical Specialty'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialty(null)}
                    style={{
                      minHeight: '40px',
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '0.80rem',
                      fontWeight: 600,
                      border: !selectedSpecialty ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                      background: !selectedSpecialty ? '#f0fdfa' : '#ffffff',
                      color: !selectedSpecialty ? '#0f766e' : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    {isEs ? 'Todas' : 'All'}
                  </button>
                  {Object.entries(SPECIALTY_FILTERS).map(([key, spec]) => {
                    const isActive = selectedSpecialty === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedSpecialty(key)}
                        style={{
                          minHeight: '40px',
                          padding: '6px 12px',
                          borderRadius: '999px',
                          fontSize: '0.80rem',
                          fontWeight: 600,
                          border: isActive ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                          background: isActive ? '#f0fdfa' : '#ffffff',
                          color: isActive ? '#0f766e' : '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        {spec.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="gcp-btn-primary"
              style={{ width: '100%', minHeight: '44px', fontSize: '0.88rem', fontWeight: 700, justifyContent: 'center' }}
            >
              {isEs ? `Ver ${filteredVials.length} referencias` : `Show ${filteredVials.length} formulations`}
            </button>
          </div>
        </div>
      )}

      <PublicUnifiedFooter />
    </div>
  );
}
