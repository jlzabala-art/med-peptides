'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  Trash2,
  Minus,
  Plus,
  Printer,
  Loader2,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import InternationalPhoneInput from '@/components/ui/InternationalPhoneInput';
import { COUNTRIES } from '@/data/countries';
import { SHIPPING_DESTINATIONS } from '@/constants/peptideCategories';

/**
 * PeptidesOrderDrawer
 * Slide-in B2B Proforma Request drawer, cart item adjustment, address form, and printable quote.
 */
export default function PeptidesOrderDrawer({
  isOrderDrawerOpen = false,
  setIsOrderDrawerOpen,
  cartItems = {},
  setCartItems,
  updateItemQuantity,
  hasRestoredCart = false,
  setHasRestoredCart,
  formatPrice = val => `$${val}`,
  isEs = false,
  referralCode = 'CAT-RX-7482',
  submittedOrderData = null,
  setSubmittedOrderData,
  totalCartCount = 0,
  totalCartValueUsd = 0,
  grandTotalCartValueUsd = 0,
  activeShippingCorridor,
  shippingDest = 'EU',
  handleShippingDestChange,
  currencySymbol = '$',
  shippingCostCurrentCurrency = 0,
  handlePrintProforma,
  orderForm = {},
  setOrderForm,
  handleSubmitOrder,
  submittingOrder = false,
  isLookingUpUser = false,
  lookupUserResult = null,
  handleEmailLookup,
  handleOrderViaWhatsApp
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const drawerPanelRef = useRef(null);

  useEffect(() => {
    if (!confirmClear) return undefined;
    const t = setTimeout(() => setConfirmClear(false), 4000);
    return () => clearTimeout(t);
  }, [confirmClear]);

  useEffect(() => {
    if (!isOrderDrawerOpen) return undefined;
    const previousActive = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus drawer on open so keyboard input never leaks to background search bar
    const focusTimer = setTimeout(() => {
      if (drawerPanelRef.current) {
        drawerPanelRef.current.focus();
      }
    }, 10);

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOrderDrawerOpen(false);
        return;
      }
      if (e.key === 'Tab' && drawerPanelRef.current) {
        const focusable = drawerPanelRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown, true);
      if (previousActive && typeof previousActive.focus === 'function') {
        previousActive.focus();
      }
    };
  }, [isOrderDrawerOpen, setIsOrderDrawerOpen]);

  const vialUnitLabel = isEs
    ? (totalCartCount === 1 ? 'Vial' : 'Viales')
    : (totalCartCount === 1 ? 'Vial' : 'Vials');

  return (
    <>
      {/* ── Quick Order Request Drawer ── */}
      {isOrderDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isEs ? 'Solicitar Proforma B2B' : 'Request B2B Proforma'}
          onClick={() => setIsOrderDrawerOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1200,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div
            ref={drawerPanelRef}
            tabIndex={-1}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              animation: 'slideInRight 0.2s ease-out',
              outline: 'none'
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc'
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEs ? 'Solicitar Proforma B2B' : 'Request B2B Proforma'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {isEs ? 'Código de Referencia:' : 'Reference Code:'}{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>{referralCode}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOrderDrawerOpen(false)}
                aria-label={isEs ? 'Cerrar panel de proforma' : 'Close proforma drawer'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {submittedOrderData ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  {isEs ? '¡Solicitud de Proforma Recibida!' : 'Proforma Request Received!'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  {isEs
                    ? `Referencia: ${submittedOrderData.referenceId}. Su perfil de clínica ha sido registrado en Atlas Health.`
                    : `Reference: ${submittedOrderData.referenceId}. Your clinic profile has been registered in the Atlas Health network.`}
                </p>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '14px',
                    textAlign: 'left',
                    marginBottom: '1.5rem',
                    fontSize: '0.80rem'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                    {isEs ? '🔐 Próximos accesos a tarifas B2B:' : '🔐 Future Access Instructions:'}
                  </div>
                  <div style={{ color: '#475569', lineHeight: 1.5 }}>
                    {isEs
                      ? `Al ingresar con su correo (${submittedOrderData.customerEmail}), el sistema recordará automáticamente sus datos de facturación, tarifas preferenciales de clínica y pedidos anteriores.`
                      : `When signing in with your email (${submittedOrderData.customerEmail}), the portal will automatically apply your verified clinic tier and saved formulations.`}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (setSubmittedOrderData) setSubmittedOrderData(null);
                    setIsOrderDrawerOpen(false);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {isEs ? 'Volver al Catálogo' : 'Return to Catalog'}
                </button>
              </div>
            ) : (
              <>
                {/* Drawer Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                  {/* Selected Items */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#334155',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {isEs
                          ? `Formulaciones Seleccionadas (${totalCartCount} ${vialUnitLabel})`
                          : `Selected Formulations (${totalCartCount} ${vialUnitLabel})`}
                      </h4>
                      {Object.keys(cartItems).length > 0 && (
                        confirmClear ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setCartItems({});
                                setConfirmClear(false);
                              }}
                              style={{
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '4px',
                                padding: '3px 8px',
                                color: '#dc2626',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {isEs ? 'Confirmar' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmClear(false)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#64748b',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              {isEs ? 'Cancelar' : 'Cancel'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmClear(true)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              fontSize: '0.74rem',
                              fontWeight: 650,
                              cursor: 'pointer'
                            }}
                          >
                            {isEs ? 'Vaciar' : 'Clear all'}
                          </button>
                        )
                      )}
                    </div>

                    {hasRestoredCart && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          color: '#065f46',
                          marginBottom: '8px'
                        }}
                      >
                        <span>Restored previous session draft ✓</span>
                        <button
                          type="button"
                          onClick={() => setHasRestoredCart && setHasRestoredCart(false)}
                          style={{ background: 'transparent', border: 'none', color: '#065f46', cursor: 'pointer', padding: 0 }}
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {Object.keys(cartItems).length === 0 ? (
                      <div
                        style={{
                          padding: '1.5rem',
                          textAlign: 'center',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px dashed #cbd5e1',
                          color: '#64748b',
                          fontSize: '0.82rem'
                        }}
                      >
                        Your order request is currently empty. Use the &quot;+1 Vial&quot; or &quot;+Pack ×10&quot; buttons in the table to add items.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {Object.values(cartItems).map(item => {
                          const p = item.product;
                          const lineTotal = (item.quantity1x * p.unitPrice) + (item.quantity10x * (p.pack10Price || p.unitPrice * 8.5));
                          return (
                            <div
                              key={p.id}
                              style={{
                                padding: '10px 12px',
                                background: '#f8fafc',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                                    {p.productName}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                                    {p.dosage} • Lyophilized Vial (10R)
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                                    {formatPrice(lineTotal)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCartItems(prev => {
                                        const copy = { ...prev };
                                        delete copy[p.id];
                                        return copy;
                                      });
                                    }}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#94a3b8',
                                      cursor: 'pointer',
                                      padding: '2px 4px'
                                    }}
                                    title="Remove item"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              {/* Incremental Controls inside Drawer */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px dashed #e2e8f0' }}>
                                {/* 1x Single Vial Controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '0.70rem', color: '#64748b', fontWeight: 600 }}>1x Vial:</span>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff' }}>
                                    <button
                                      type="button"
                                      aria-label={isEs ? `Reducir 1x ${p.productName}` : `Decrease 1x ${p.productName}`}
                                      onClick={() => updateItemQuantity(p.id, '1x', -1)}
                                      disabled={item.quantity1x <= 0}
                                      style={{
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '3px 6px',
                                        cursor: item.quantity1x <= 0 ? 'not-allowed' : 'pointer',
                                        color: item.quantity1x <= 0 ? '#cbd5e1' : '#334155'
                                      }}
                                    >
                                      <Minus size={11} />
                                    </button>
                                    <span style={{ padding: '0 6px', fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 700 }}>
                                      {item.quantity1x}
                                    </span>
                                    <button
                                      type="button"
                                      aria-label={isEs ? `Aumentar 1x ${p.productName}` : `Increase 1x ${p.productName}`}
                                      onClick={() => updateItemQuantity(p.id, '1x', 1)}
                                      style={{ border: 'none', background: 'transparent', padding: '3px 6px', cursor: 'pointer', color: '#334155' }}
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                </div>

                                {/* 10x Pack Controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '0.70rem', color: '#047857', fontWeight: 700 }}>Pack ×10:</span>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #a7f3d0', borderRadius: '4px', background: '#f0fdf4' }}>
                                    <button
                                      type="button"
                                      aria-label={isEs ? `Reducir Pack 10 ${p.productName}` : `Decrease Pack 10 ${p.productName}`}
                                      onClick={() => updateItemQuantity(p.id, '10x', -1)}
                                      disabled={item.quantity10x <= 0}
                                      style={{
                                        border: 'none',
                                        background: 'transparent',
                                        padding: '3px 6px',
                                        cursor: item.quantity10x <= 0 ? 'not-allowed' : 'pointer',
                                        color: item.quantity10x <= 0 ? '#cbd5e1' : '#047857'
                                      }}
                                    >
                                      <Minus size={11} />
                                    </button>
                                    <span style={{ padding: '0 6px', fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 700, color: '#047857' }}>
                                      {item.quantity10x}
                                    </span>
                                    <button
                                      type="button"
                                      aria-label={isEs ? `Aumentar Pack 10 ${p.productName}` : `Increase Pack 10 ${p.productName}`}
                                      onClick={() => updateItemQuantity(p.id, '10x', 1)}
                                      style={{ border: 'none', background: 'transparent', padding: '3px 6px', cursor: 'pointer', color: '#047857' }}
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Smart Pack x10 Savings Nudge when user has 5-9 single vials */}
                              {item.quantity1x >= 5 && item.quantity1x < 10 && (() => {
                                const pack10Cost = p.pack10Price || p.unitPrice * 8.5;
                                const current1xCost = item.quantity1x * p.unitPrice;
                                const extraCost = pack10Cost - current1xCost;
                                const perVial10x = pack10Cost / 10;
                                const savingsPct = Math.round((1 - perVial10x / p.unitPrice) * 100);
                                if (savingsPct <= 0) return null;
                                return (
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '8px',
                                      padding: '6px 8px',
                                      borderRadius: '5px',
                                      background: '#ecfdf5',
                                      border: '1px solid #a7f3d0',
                                      fontSize: '0.70rem',
                                      color: '#065f46'
                                    }}
                                  >
                                    <span>
                                      {extraCost <= 0
                                        ? (isEs
                                            ? `💡 Un Pack ×10 sale más barato que ${item.quantity1x} viales sueltos (-${savingsPct}%/vial)`
                                            : `💡 A Pack ×10 costs less than ${item.quantity1x} single vials (-${savingsPct}%/vial)`)
                                        : (isEs
                                            ? `💡 Por +${formatPrice(extraCost)} llévate Pack ×10 (-${savingsPct}%/vial)`
                                            : `💡 Upgrade to Pack ×10 for +${formatPrice(extraCost)} (-${savingsPct}%/vial)`)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCartItems(prev => {
                                          const existing = prev[p.id];
                                          if (!existing) return prev;
                                          return {
                                            ...prev,
                                            [p.id]: {
                                              ...existing,
                                              quantity1x: 0,
                                              quantity10x: (existing.quantity10x || 0) + 1
                                            }
                                          };
                                        });
                                      }}
                                      style={{
                                        background: '#059669',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '3px 8px',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0
                                      }}
                                    >
                                      {isEs ? 'Cambiar a ×10' : 'Switch to ×10'}
                                    </button>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })}

                        <div
                          style={{
                            marginTop: '0.75rem',
                            padding: '12px 14px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.80rem', color: '#475569' }}>
                            <span>{isEs ? `Subtotal Formulaciones (${totalCartCount} viales):` : `Subtotal Formulations (${totalCartCount} vials):`}</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>
                              {formatPrice(totalCartValueUsd)}
                            </span>
                          </div>
                          {activeShippingCorridor && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.80rem', color: '#0369a1' }}>
                                <span>
                                  {activeShippingCorridor.flag}{' '}
                                  {isEs
                                    ? `Envío Express ${activeShippingCorridor.labelEs} (≤2 kg · ${activeShippingCorridor.rateBadge}):`
                                    : `Express Courier ${activeShippingCorridor.labelEn} (≤2 kg · ${activeShippingCorridor.rateBadge}):`}
                                </span>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                                  +{currencySymbol}{shippingCostCurrentCurrency.toFixed(2)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                                  {isEs ? 'Destino (≤2 kg):' : 'Destination (≤2 kg):'}
                                </span>
                                {Object.values(SHIPPING_DESTINATIONS).map(corridor => {
                                  const isSel = shippingDest === corridor.id;
                                  return (
                                    <button
                                      key={corridor.id}
                                      type="button"
                                      onClick={() => handleShippingDestChange && handleShippingDestChange(corridor.id)}
                                      style={{
                                        border: isSel ? '1px solid #0284c7' : '1px solid #cbd5e1',
                                        background: isSel ? '#e0f2fe' : '#ffffff',
                                        color: isSel ? '#0369a1' : '#475569',
                                        fontWeight: isSel ? 750 : 600,
                                        fontSize: '0.66rem',
                                        padding: '2px 7px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px'
                                      }}
                                    >
                                      <span>{corridor.flag}</span>
                                      <span>{isEs ? corridor.labelEs : corridor.labelEn}</span>
                                      <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>({corridor.rateBadge})</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <div
                            style={{
                              paddingTop: '8px',
                              borderTop: '1px solid #cbd5e1',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                              {isEs ? 'Total Estimado:' : 'Estimated Total:'}
                            </span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: '1.10rem', color: '#0284c7' }}>
                              {formatPrice(grandTotalCartValueUsd)}
                            </span>
                          </div>
                        </div>

                        {/* 1-Click Proforma PDF / Print button */}
                        <button
                          type="button"
                          onClick={handlePrintProforma}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 650,
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                          title="Generate official printable B2B proforma sheet"
                        >
                          <Printer size={14} />
                          <span>Print / Save PDF Proforma Quote</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Contact Form */}
                  <form id="b2b-proforma-form" onSubmit={handleSubmitOrder}>
                    {/* Anti-Spam Bot Trap */}
                    <div style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
                      <input
                        type="text"
                        name="company_fax"
                        tabIndex={-1}
                        autoComplete="off"
                        value={orderForm.company_fax || ''}
                        onChange={e => setOrderForm && setOrderForm(prev => ({ ...prev, company_fax: e.target.value }))}
                      />
                    </div>

                    {/* Section 1: Contact */}
                    <h4 style={{ fontSize: '0.80rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>1.</span> Institutional Contact
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={orderForm.name || ''}
                          onChange={e => setOrderForm && setOrderForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Dr. Full Name / Procurement Lead"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                            Practice / Clinic Name
                          </label>
                          <input
                            type="text"
                            value={orderForm.clinicName || ''}
                            onChange={e => setOrderForm && setOrderForm(prev => ({ ...prev, clinicName: e.target.value }))}
                            placeholder="Clinic / Lab Name"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569' }}>
                              Work Email *
                            </label>
                            {isLookingUpUser && (
                              <span style={{ fontSize: '0.68rem', color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Loader2 size={10} className="animate-spin" /> {isEs ? 'Buscando...' : 'Checking...'}
                              </span>
                            )}
                            {!isLookingUpUser && lookupUserResult && (
                              <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <CheckCircle2 size={11} /> {isEs ? 'Cuenta Verificada' : 'Verified Account'}
                              </span>
                            )}
                          </div>
                          <input
                            type="email"
                            required
                            value={orderForm.email || ''}
                            onChange={e => setOrderForm && setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                            onBlur={e => handleEmailLookup && handleEmailLookup(e.target.value)}
                            placeholder="doctor@clinic.com"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: `1px solid ${lookupUserResult ? '#86efac' : '#cbd5e1'}`,
                              backgroundColor: lookupUserResult ? '#f0fdf4' : '#ffffff',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Phone / WhatsApp (International) *
                        </label>
                        <InternationalPhoneInput
                          value={orderForm.phone || ''}
                          onChange={val => setOrderForm && setOrderForm(prev => ({ ...prev, phone: val }))}
                          countryHint={orderForm.phoneCountryCode || 'ES'}
                          placeholder="Phone number"
                          required
                        />
                      </div>
                    </div>

                    {/* Section 2: Delivery Destination */}
                    <h4 style={{ fontSize: '0.80rem', fontWeight: 750, color: '#0f172a', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>2.</span> Shipping & Delivery Destination
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Destination Country *
                        </label>
                        <select
                          value={orderForm.country || 'Spain'}
                          onChange={e => {
                            const selectedName = e.target.value;
                            const match = COUNTRIES.find(c => c.name === selectedName);
                            if (setOrderForm) {
                              setOrderForm(prev => ({
                                ...prev,
                                country: selectedName,
                                phoneCountryCode: match?.code || prev.phoneCountryCode
                              }));
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem',
                            backgroundColor: '#ffffff',
                            color: '#0f172a'
                          }}
                        >
                          {COUNTRIES.map(c => (
                            <option key={c.code} value={c.name}>
                              {c.flag} {c.name} ({c.dial_code})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Street Address Line 1 *
                        </label>
                        <input
                          type="text"
                          required
                          value={orderForm.addressLine1 || ''}
                          onChange={e => setOrderForm && setOrderForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                          placeholder="Street address, building number, medical tower..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Suite / Floor / Department (Optional)
                        </label>
                        <input
                          type="text"
                          value={orderForm.addressLine2 || ''}
                          onChange={e => setOrderForm && setOrderForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                          placeholder="Suite 400, Floor 3, Clinic Reception..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={orderForm.city || ''}
                            onChange={e => setOrderForm && setOrderForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="City"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                            State / Province / Region
                          </label>
                          <input
                            type="text"
                            value={orderForm.state || ''}
                            onChange={e => setOrderForm && setOrderForm(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="State or Region"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Postal Code / ZIP *
                        </label>
                        <input
                          type="text"
                          required
                          value={orderForm.postalCode || ''}
                          onChange={e => setOrderForm && setOrderForm(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="Postal / ZIP code"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                    </div>

                    {/* Section 3: Notes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 650, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Order Notes / Compounding Specifications
                        </label>
                        <textarea
                          rows={2}
                          value={orderForm.notes || ''}
                          onChange={e => setOrderForm && setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any specific batch, concentration, or delivery notes..."
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>
                    </div>
                  </form>
                </div>

                {/* Drawer Sticky Footer with Fixed Action Buttons (Google Cloud Golden UX) */}
                <div
                  style={{
                    flexShrink: 0,
                    padding: '12px 18px',
                    background: '#ffffff',
                    borderTop: '1px solid #e2e8f0',
                    boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: 10
                  }}
                >
                  <button
                    type="submit"
                    form="b2b-proforma-form"
                    disabled={submittingOrder || Object.keys(cartItems).length === 0}
                    style={{
                      padding: '12px',
                      background: Object.keys(cartItems).length === 0 ? '#94a3b8' : '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.90rem',
                      cursor: Object.keys(cartItems).length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: Object.keys(cartItems).length > 0 ? '0 1px 3px rgba(2, 132, 199, 0.3)' : 'none',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {submittingOrder
                      ? (isEs ? 'Enviando Solicitud...' : 'Submitting Proforma Request...')
                      : (isEs ? 'Solicitar Proforma B2B →' : 'Submit Proforma Request →')}
                    {!submittingOrder && <ArrowRight size={16} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleOrderViaWhatsApp}
                    disabled={Object.keys(cartItems).length === 0}
                    style={{
                      padding: '10px',
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      cursor: Object.keys(cartItems).length === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <MessageCircle size={16} />
                    <span>{isEs ? 'Enviar Pedido por WhatsApp' : 'Send Order via WhatsApp'}</span>
                  </button>

                  <p style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: 'center', margin: '2px 0 0 0', lineHeight: 1.3 }}>
                    {isEs
                      ? 'Facturación proforma institucional con trazabilidad analítica HPLC y documentación aduanera.'
                      : 'Upon submission, our medical logistics team will issue an official B2B proforma invoice with HPLC COA.'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Official Printable Proforma Document (@media print) */}
      <div className="peptides-printable-proforma" style={{ display: 'none' }}>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            .peptides-printable-proforma, .peptides-printable-proforma * {
              visibility: visible !important;
            }
            .peptides-printable-proforma {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              padding: 2cm !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            @page {
              size: A4;
              margin: 1.5cm;
            }
          }
        `
          }}
        />

        {/* Proforma Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0284c7', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18pt', fontWeight: 800, color: '#0284c7' }}>ATLAS HEALTH SERVICES</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '9pt', color: '#64748b' }}>
              ATLAS HEALTH SERVICES • CLINICAL DIVISION • OFFICIAL PROFORMA QUOTE
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '8.5pt', color: '#64748b' }}>
              Certified Lyophilized Peptides • ≥99.0% HPLC Analytical Purity
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10pt', fontWeight: 700, color: '#0f172a' }}>
              PROFORMA ESTIMATE
            </div>
            <div style={{ fontSize: '8.5pt', color: '#64748b', marginTop: '2px' }}>
              Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '8.5pt', color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
              Attributed Wholesaler: Nikolaos Psathas (NP Labs)
            </div>
            <div style={{ fontSize: '8pt', fontFamily: 'monospace', color: '#64748b' }}>
              Ref Code: {referralCode || 'CAT-RX-7482'}
            </div>
          </div>
        </div>

        {/* Client & Shipping Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <div>
            <div style={{ fontSize: '8pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>INSTITUTIONAL CLIENT</div>
            <div style={{ fontSize: '10pt', fontWeight: 700, marginTop: '2px' }}>{orderForm.name || 'Clinical Practitioner'}</div>
            {orderForm.clinicName && <div style={{ fontSize: '9pt', color: '#334155' }}>{orderForm.clinicName}</div>}
            <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{orderForm.email || 'Email not specified'}</div>
            <div style={{ fontSize: '8.5pt', color: '#64748b' }}>{orderForm.phone || 'Phone not specified'}</div>
          </div>
          <div>
            <div style={{ fontSize: '8pt', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>DELIVERY DESTINATION</div>
            <div style={{ fontSize: '9pt', color: '#0f172a', fontWeight: 600 }}>{orderForm.country || 'International'}</div>
            <div style={{ fontSize: '8.5pt', color: '#334155' }}>{orderForm.addressLine1 || 'Pending delivery address'}</div>
            {orderForm.addressLine2 && <div style={{ fontSize: '8.5pt', color: '#334155' }}>{orderForm.addressLine2}</div>}
            <div style={{ fontSize: '8.5pt', color: '#64748b' }}>
              {[orderForm.city, orderForm.state, orderForm.postalCode].filter(Boolean).join(', ')}
            </div>
          </div>
        </div>

        {/* Selected Items Table */}
        {/* eslint-disable-next-line no-restricted-syntax */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '9pt' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
              <th style={{ padding: '8px 10px', width: '5%' }}>#</th>
              <th style={{ padding: '8px 10px', width: '45%' }}>Formulation & Dosage</th>
              <th style={{ padding: '8px 10px', width: '20%' }}>Packaging & Quantity</th>
              <th style={{ padding: '8px 10px', width: '15%', textAlign: 'right' }}>Unit / Pack Price</th>
              <th style={{ padding: '8px 10px', width: '15%', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(cartItems).map((item, idx) => {
              const p = item.product;
              const lineTotal = (item.quantity1x * p.unitPrice) + (item.quantity10x * (p.pack10Price || p.unitPrice * 8.5));
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.productName}</div>
                    <div style={{ fontSize: '8pt', color: '#64748b' }}>{p.dosage} • Lyophilized Vial (10R) • ≥99.0% HPLC</div>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    {item.quantity1x > 0 && <div>{item.quantity1x}x Single Vial</div>}
                    {item.quantity10x > 0 && <div style={{ color: '#047857', fontWeight: 600 }}>{item.quantity10x}x Pack ×10 (-15% Vol.)</div>}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace' }}>
                    {item.quantity1x > 0 && <div>{formatPrice(p.unitPrice)}</div>}
                    {item.quantity10x > 0 && <div style={{ color: '#047857' }}>{formatPrice(p.pack10Price || p.unitPrice * 8.5)}</div>}
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>
                    {formatPrice(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '1px solid #cbd5e1' }}>
              <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 650, fontSize: '9pt', color: '#475569' }}>
                SUBTOTAL FORMULATIONS:
              </td>
              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, fontSize: '9.5pt', color: '#0f172a', fontFamily: 'monospace' }}>
                {formatPrice(totalCartValueUsd)}
              </td>
            </tr>
            {activeShippingCorridor && (
              <tr style={{ borderTop: '1px solid #f1f5f9' }}>
                <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 650, fontSize: '9pt', color: '#0369a1' }}>
                  EXPRESS COURIER LOGISTICS ({activeShippingCorridor.labelEn.toUpperCase()} ≤2 KG · {activeShippingCorridor.rateBadge} BASE):
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, fontSize: '9.5pt', color: '#0284c7', fontFamily: 'monospace' }}>
                  +{currencySymbol}{shippingCostCurrentCurrency.toFixed(2)}
                </td>
              </tr>
            )}
            <tr style={{ borderTop: '2px solid #0f172a' }}>
              <td colSpan={4} style={{ padding: '10px', textAlign: 'right', fontWeight: 800, fontSize: '10pt', color: '#0f172a' }}>
                ESTIMATED PROFORMA TOTAL:
              </td>
              <td style={{ padding: '10px', textAlign: 'right', fontWeight: 900, fontSize: '11pt', color: '#0284c7', fontFamily: 'monospace' }}>
                {formatPrice(grandTotalCartValueUsd)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Logistics & Quality Regulatory Terms */}
        <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '8pt', color: '#64748b', lineHeight: 1.5 }}>
          <strong>Logistics & Regulatory Terms:</strong> All peptide vials are manufactured under cGMP standards with certified analytical purity (≥99.0% HPLC). Lyophilized sterile formulations are vacuum-sealed for maximum room-temperature stability and dispatched via express medical courier. Official proforma invoice and analytical COA documentation will be issued upon formal order confirmation.
        </div>
      </div>
    </>
  );
}
