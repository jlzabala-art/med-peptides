"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  CheckCircle2,
  Printer,
  MessageSquare,
  ShieldCheck,
  Building2,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useB2BOrder } from '@/hooks/useB2BOrder';
import { useAuth } from '@/context/AuthContext';
import { triggerHaptic } from '@/utils/haptics';
import CopyableId from '@/components/ui/CopyableId';
import toast from 'react-hot-toast';

export default function UnifiedOrderDrawer({ lang = 'es' }) {
  const isEs = lang === 'es';
  const { user, activeRole } = useAuth();
  const {
    items,
    totalCount,
    subtotal,
    isDrawerOpen,
    closeDrawer,
    updateQty,
    removeItem,
    clearOrder
  } = useB2BOrder();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [form, setForm] = useState(() => ({
    clinicName: activeRole === 'clinic' ? (user?.displayName || '') : '',
    contactName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    deliveryAddress: '',
    vatTaxId: '',
    deliveryNotes: ''
  }));

  const handleClose = () => {
    setOrderSuccess(null);
    closeDrawer();
  };

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDrawerOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error(isEs ? 'El pedido no contiene artículos' : 'Your order is empty');
      return;
    }

    if (!form.contactName.trim() || !form.email.trim()) {
      toast.error(isEs ? 'Indique nombre de contacto y email' : 'Please provide contact name and email');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      const res = await fetch('/api/orders/create-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: items.map((item) => ({
            id: item.productId || item.id,
            name: item.name,
            productName: item.name,
            dosage: item.dosage,
            presentation: item.presentation,
            quantity: Number(item.quantity) || 1,
            price: Number(item.unitPrice) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            sku: item.sku || ''
          })),
          customerName: form.clinicName || form.contactName || 'Valued B2B Partner',
          customerEmail: form.email,
          customerPhone: form.phone,
          customerAddress: form.deliveryAddress,
          customerVat: form.vatTaxId,
          customerNotes: form.deliveryNotes,
          subtotal: Number(subtotal.toFixed(2)),
          grandTotal: Number(subtotal.toFixed(2)),
          currency: 'EUR',
          currencySymbol: '€',
          totalUnits: totalCount,
          priceTier: activeRole || 'clinic',
          priceTierLabel: activeRole === 'wholesaler' ? 'Mayorista B2B' : 'Practitioner B2B',
          source: 'unified_b2b_drawer'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al procesar el pedido');
      }

      setOrderSuccess({
        orderCode: data.orderCode || data.orderId,
        grandTotal: subtotal,
        customerName: form.clinicName || form.contactName,
        customerEmail: form.email,
        itemsCount: totalCount
      });

      clearOrder();
      triggerHaptic('success');
      toast.success(isEs ? '¡Orden generada con éxito!' : 'Order created successfully!');
    } catch (err) {
      console.error('[UnifiedOrderDrawer] Error creating order:', err);
      toast.error(err.message || (isEs ? 'Error al enviar pedido' : 'Failed to submit order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleWhatsApp = () => {
    if (!orderSuccess) return;
    const msg = encodeURIComponent(
      `Hola Atlas Health, he generado el pedido B2B *${orderSuccess.orderCode}* para ${orderSuccess.customerName} (${orderSuccess.itemsCount} uds, Total €${orderSuccess.grandTotal.toFixed(2)}). ¿Podrían confirmar despacho?`
    );
    window.open(`https://wa.me/34689255018?text=${msg}`, '_blank');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        transition: 'opacity 0.2s ease'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* ── HEADER ── */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: '#003666',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                {isEs ? 'Tramitación de Pedido B2B' : 'B2B Purchase Order'}
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 500 }}>
                {isEs ? 'Tarifas oficiales según credenciales profesionales' : 'Verified institutional pricing'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Cerrar"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── CONTENT AREA ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {orderSuccess ? (
            /* ── SUCCESS STATE ── */
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  border: '2px solid #bbf7d0'
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                {isEs ? '¡Orden Generada con Éxito!' : 'Order Draft Created!'}
              </h3>
              <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                {isEs
                  ? 'Su solicitud de suministro ha sido registrada en el sistema clínico. Hemos asignado el siguiente identificador:'
                  : 'Your supply order has been registered in the clinical system with identifier:'}
              </p>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  {isEs ? 'Código de Orden / Purchase Order' : 'Purchase Order Code'}
                </span>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <CopyableId value={orderSuccess.orderCode} />
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#334155' }}>
                  <strong>{orderSuccess.itemsCount}</strong> {isEs ? 'artículos' : 'units'} •{' '}
                  <strong>€{orderSuccess.grandTotal.toFixed(2)}</strong> (EXW)
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  <MessageSquare size={16} />
                  <span>{isEs ? 'Confirmar Despacho por WhatsApp' : 'Confirm Dispatch via WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={15} />
                  <span>{isEs ? 'Imprimir / Descargar Comprobante' : 'Print / Download Order Receipt'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    marginTop: '0.5rem',
                    background: 'none',
                    border: 'none',
                    color: '#003666',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  {isEs ? '← Volver al Catálogo' : '← Back to Catalog'}
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* ── EMPTY STATE ── */
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}
              >
                <ShoppingBag size={28} />
              </div>
              <h4 style={{ margin: '0 0 0.5rem', color: '#1e293b', fontSize: '1.05rem', fontWeight: 700 }}>
                {isEs ? 'Su pedido está vacío' : 'Your order is currently empty'}
              </h4>
              <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.82rem', maxWidth: '300px', marginInline: 'auto' }}>
                {isEs
                  ? 'Añada productos o monografías desde las tablas o tarjetas de las colecciones para tramitar un pedido.'
                  : 'Add items from collections or product datasheets to assemble your purchase order.'}
              </p>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  background: '#003666',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isEs ? 'Explorar Productos' : 'Browse Products'}
              </button>
            </div>
          ) : (
            /* ── ORDER ITEMS LIST & CUSTOMER FORM ── */
            <div>
              {/* Product list */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isEs ? 'Artículos Seleccionados' : 'Selected Products'} ({totalCount})
                  </span>
                  <button
                    type="button"
                    onClick={clearOrder}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={12} />
                    <span>{isEs ? 'Vaciar' : 'Clear'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {item.dosage ? `${item.dosage} • ` : ''}{item.presentation}
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 750, color: '#003666', marginTop: '2px' }}>
                          €{Number(item.unitPrice).toFixed(2)} / ud
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Qty Selector */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            background: '#ffffff',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, -1)}
                            style={{
                              padding: '4px 8px',
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer'
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '22px', textAlign: 'center' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item.id, 1)}
                            style={{
                              padding: '4px 8px',
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              cursor: 'pointer'
                            }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Eliminar"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal Banner */}
              <div
                style={{
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                  {isEs ? 'Subtotal Estimado (EXW)' : 'Estimated Subtotal (EXW)'}
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 850, color: '#003666' }}>
                  €{subtotal.toFixed(2)}
                </span>
              </div>

              {/* Customer and Shipping Details Form */}
              <form onSubmit={handleSubmitOrder}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                  <Building2 size={15} color="#003666" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 750, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isEs ? 'Datos de la Clínica / Profesional' : 'Practitioner / Clinic Information'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      {isEs ? 'Nombre de la Clínica o Entidad' : 'Clinic / Entity Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={isEs ? 'Ej. Clínica Regenerativa Sanitas' : 'e.g. Atlas Longevity Center'}
                      value={form.clinicName}
                      onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                        {isEs ? 'Nombre de Contacto *' : 'Contact Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. / Lic."
                        value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.82rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                        {isEs ? 'NIF / CIF / Tax ID' : 'Tax ID / VAT Number'}
                      </label>
                      <input
                        type="text"
                        placeholder={isEs ? 'B12345678' : 'VAT-XXXX'}
                        value={form.vatTaxId}
                        onChange={(e) => setForm({ ...form, vatTaxId: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.82rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                        {isEs ? 'Email de Contacto *' : 'Email Address *'}
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="medico@clinica.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.82rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                        {isEs ? 'Teléfono / WhatsApp' : 'Phone / WhatsApp'}
                      </label>
                      <input
                        type="tel"
                        placeholder="+34 ..."
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.82rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      {isEs ? 'Dirección de Entrega' : 'Delivery Address'}
                    </label>
                    <input
                      type="text"
                      placeholder={isEs ? 'Calle, Ciudad, Código Postal, País' : 'Street address, city, postal code, country'}
                      value={form.deliveryAddress}
                      onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>
                      {isEs ? 'Notas del Pedido / Instrucciones' : 'Order Notes / Delivery Instructions'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={isEs ? 'Lote específico, horario de entrega, referencia interna...' : 'Batch number request, delivery hours, internal reference...'}
                      value={form.deliveryNotes}
                      onChange={(e) => setForm({ ...form, deliveryNotes: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        boxSizing: 'border-box',
                        resize: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    background: isSubmitting ? '#94a3b8' : '#003666',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 750,
                    fontSize: '0.92rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'background 0.15s ease',
                    boxShadow: '0 2px 8px rgba(0, 54, 102, 0.25)'
                  }}
                >
                  <Send size={16} />
                  <span>
                    {isSubmitting
                      ? (isEs ? 'Generando Orden...' : 'Generating Order...')
                      : (isEs ? 'Confirmar Pedido (Generar PO)' : 'Confirm Order (Generate PO)')}
                  </span>
                </button>

                <p style={{ margin: '8px 0 0', fontSize: '0.65rem', color: '#64748b', textAlign: 'center' }}>
                  {isEs
                    ? '🔒 Al confirmar, se generará una Orden de Compra (PO) y su Account Manager coordinará factura proforma y logística.'
                    : '🔒 Submitting creates an official Purchase Order. Your account manager will coordinate proforma invoice and fulfillment.'}
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
