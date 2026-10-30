"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, Package, Check, CheckCircle2, ShieldCheck, ArrowRight, X, Plus, Minus, Globe } from '@/lib/icons';
import CopyableId from '@/components/ui/CopyableId';
import { trackReferralVisitAction, fetchCollectionProductsAction } from '@/actions/vialsCatalogActions';
import { SUPPORTED_COLLECTIONS } from '@/constants/supportedCollections';

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

const SHIPPING_OPTIONS = [
  { code: 'EU', label: 'European Union (Express Tracked)', cost: 30 },
  { code: 'UK', label: 'United Kingdom (Express Tracked)', cost: 35 },
  { code: 'US', label: 'United States & Canada (Air Courier)', cost: 45 },
  { code: 'ROW', label: 'International / Worldwide (DHL Express)', cost: 55 }
];

export default function VialsCatalogClient({ initialVials = [], initialCollection = 'vials', referralInfo = null }) {
  const [activeCollection, setActiveCollection] = useState(initialCollection || 'vials');
  const [vials, setVials] = useState(initialVials);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('all');
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

  // Active referral tracking
  const activeWholesalerId = referralInfo?.wholesalerId || null;
  const activeReferralCode = referralInfo?.referralCode || activeWholesalerId;

  // Track visit on mount if referral is active
  useEffect(() => {
    if (activeWholesalerId) {
      try {
        localStorage.setItem('atlas_wholesaler_ref', activeWholesalerId);
        trackReferralVisitAction({
          wholesalerId: activeWholesalerId,
          referralCode: activeReferralCode,
          collection: activeCollection,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
        });
      } catch {
        // Safe localStorage fallback
      }
    }
  }, [activeWholesalerId, activeReferralCode, activeCollection]);

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
    if (activeWholesalerId) return activeWholesalerId;
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('atlas_wholesaler_ref') || null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const finalWholesalerId = activeWholesalerId || persistedRef;

  // Filtered vials
  const filteredVials = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return vials.filter(item => {
      const matchesSearch = !q ||
        item.productName.toLowerCase().includes(q) ||
        item.dosage.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));

      const matchesGoal = selectedGoal === 'all' ||
        item.primaryGoal === selectedGoal ||
        (Array.isArray(item.goals) && item.goals.includes(selectedGoal));

      return matchesSearch && matchesGoal;
    });
  }, [vials, searchQuery, selectedGoal]);

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

  const activeCurrency = activeCollection === 'vials' ? 'EUR' : 'USD';
  const activeCurrencySymbol = activeCollection === 'vials' ? '€' : '$';
  const grandTotal = Math.round((subtotal + (totalUnits > 0 ? selectedShipping.cost : 0)) * 100) / 100;

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
          priceTier: 'wholesale_cost_plus_15',
          priceTierLabel: 'Partner Cost +15% Schedule',
          priceSource: 'cost',
          priceMarkupPercent: 15,
          wholesalerId: finalWholesalerId || 'np-labs-international',
          referralCode: activeReferralCode || finalWholesalerId || 'CAT-RX-7482',
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
    } catch (err) {
      alert(`Error submitting order: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* ── Top Institutional Header ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#003666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '-0.5px'
            }}>
              CP
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#003666', letterSpacing: '-0.2px' }}>
                Clinical Formulations Directory
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                Lyophilized Peptide Vials • Direct Analytical Supply
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#f1f5f9',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#475569'
            }}>
              <Globe size={13} />
              <span>{activeCurrency} ({activeCurrencySymbol})</span>
            </div>

            <button
              onClick={() => setIsCartModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: totalUnits > 0 ? '#16a34a' : '#ffffff',
                color: totalUnits > 0 ? '#ffffff' : '#003666',
                border: totalUnits > 0 ? 'none' : '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: totalUnits > 0 ? '0 2px 8px rgba(22, 163, 74, 0.25)' : 'none'
              }}
            >
              <ShoppingCart size={16} />
              <span>Order Request</span>
              {totalUnits > 0 && (
                <span style={{
                  backgroundColor: '#ffffff',
                  color: '#16a34a',
                  borderRadius: '9999px',
                  padding: '1px 7px',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {totalUnits}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Catalog Workspace ── */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px 100px 20px' }}>
        
        {/* ── Multi-Collection Switcher (Golden Rule #7 & GCP Tabs) ── */}
        <div style={{ marginBottom: '20px' }}>
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
            <>
              <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '14px 18px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={22} color="#1d4ed8" style={{ flexShrink: 0 }} />
                  <div style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.45 }}>
                    <strong>{colInfo.title}:</strong> {colInfo.badge}. {colInfo.deliveryPledge} <strong>No upfront card payment required today</strong> — a verified secure payment link will be issued to your email and WhatsApp within 24 hours of placing your request.
                  </div>
                </div>
              </div>

              {activeCollection === 'vials' && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase'
                    }}>
                      Verified Partner Schedule (+15% Cost-Plus)
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#14532d', fontWeight: 700 }}>
                      Reference: {referralInfo?.partnerName || 'Nikolaos Psathas · NP Labs International'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#166534' }}>
                      • All peptide prices reflect exact <strong>+15% over NPLAB base cost</strong> in EUR (€).
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 600 }}>Partner Links:</span>
                    <CopyableId value={referralInfo?.shortCatalogUrl || 'https://www.atlashealth-services.com/c/CAT-RX-7482'} />
                    <CopyableId value={referralInfo?.referenceUrl || 'https://www.atlashealth-services.com/vials?ref=np-labs-international'} />
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {/* ── Search & Filter Bar (Google Cloud Rule #7: Search First) ── */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            position: 'relative',
            maxWidth: '100%',
            marginBottom: '16px'
          }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by peptide name (e.g. BPC-157, Tirzepatide, GHK-Cu, NAD+, Epithalon)..."
              style={{
                width: '100%',
                padding: '14px 44px 14px 46px',
                fontSize: '0.95rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Goal Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '16px'
          }}>
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
                      {vial.productName}
                    </h3>

                    {/* Format info */}
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                      {vial.presentation} • Lyophilized Cake
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

                  {/* Pricing and Action Section */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                    
                    {/* Price block */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#003666' }}>
                          {vial.currencySymbol || activeCurrencySymbol}{vial.unitPrice.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          / {(vial.unitNoun || 'vial').toLowerCase()}
                        </span>
                        {vial.baseCost > 0 && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#0369a1',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '4px',
                            padding: '1px 6px'
                          }}>
                            Cost {vial.currencySymbol || activeCurrencySymbol}{Number(vial.baseCost).toFixed(2)} +15%
                          </span>
                        )}
                      </div>

                      <div style={{
                        marginTop: '4px',
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
                        Pack x10: {vial.currencySymbol || activeCurrencySymbol}{vial.pack10Price.toFixed(2)} ({vial.currencySymbol || activeCurrencySymbol}{vial.tier10UnitPrice.toFixed(2)}/ea)
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Sticky Bottom Cart Bar (Appears when items are selected) ── */}
      {totalUnits > 0 && !isCartModalOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '800px',
          backgroundColor: '#003666',
          borderRadius: '16px',
          padding: '14px 22px',
          boxShadow: '0 12px 30px rgba(0, 54, 102, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          zIndex: 50,
          color: '#ffffff'
        }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: 600 }}>
              {totalUnits} Vials in Order Request
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              ${subtotal.toFixed(2)} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#bfdbfe' }}>USD</span>
            </div>
          </div>

          <button
            onClick={() => setIsCartModalOpen(true)}
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)'
            }}
          >
            <span>Proceed to Request</span>
            <ArrowRight size={16} />
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
          zIndex: 100
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
                        <span>Subtotal ({totalUnits} vials):</span>
                        <span>${subtotal.toFixed(2)} USD</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '8px' }}>
                        <span>Estimated Shipping:</span>
                        <span>${selectedShipping.cost.toFixed(2)} USD</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', fontWeight: 800, color: '#003666', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                        <span>Grand Total:</span>
                        <span>${grandTotal.toFixed(2)} USD</span>
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                              Email (for Payment Link) *
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="doctor@clinic.com"
                              style={{
                                width: '100%',
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
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+1 555 0192 / +34 600..."
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: formErrors.phone ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                fontSize: '0.85rem',
                                boxSizing: 'border-box'
                              }}
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
    </div>
  );
}
