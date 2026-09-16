'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  FileText,
  MessageSquare,
  Download
} from 'lucide-react';

/**
 * IncomingOrderAcknowledgmentModal
 * Unclosable modal takeover for Admin and Account Managers.
 * Triggers when a new draft order is submitted via shared catalog.
 * Cannot be closed or dismissed until explicitly confirmed as read.
 */
export default function IncomingOrderAcknowledgmentModal() {
  const { user, activeRole } = useAuth();
  const [unacknowledgedOrders, setUnacknowledgedOrders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [receptionNotes, setReceptionNotes] = useState('');
  const [submitError, setSubmitError] = useState('');

  const isEligibleRole = [
    'admin',
    'super_admin',
    'account_manager',
    'wholesaler',
    'commercial'
  ].includes(activeRole?.toLowerCase());

  useEffect(() => {
    if (!isEligibleRole || !user) return;

    // Listen in real-time to unacknowledged draft orders
    try {
      const q = query(
        collection(db, 'orders'),
        where('status', '==', 'draft'),
        where('requiresAcknowledgment', '==', true),
        where('acknowledged', '==', false),
        limit(10)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setUnacknowledgedOrders(orders);
        },
        (error) => {
          console.warn('[IncomingOrderAcknowledgment] Snapshot listener fallback:', error);
          // Fallback query if compound index is building
          const fallbackQ = query(
            collection(db, 'orders'),
            where('status', '==', 'draft'),
            limit(20)
          );
          onSnapshot(fallbackQ, (fallbackSnap) => {
            const filtered = fallbackSnap.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((o) => o.requiresAcknowledgment && !o.acknowledged);
            setUnacknowledgedOrders(filtered);
          });
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('[IncomingOrderAcknowledgment] Error subscribing:', err);
    }
  }, [isEligibleRole, user]);

  if (!isEligibleRole || unacknowledgedOrders.length === 0) {
    return null;
  }

  const currentOrder = unacknowledgedOrders[0];
  const pendingCount = unacknowledgedOrders.length;

  const handleAcknowledge = async () => {
    if (!currentOrder) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/orders/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: currentOrder.id,
          acknowledgedBy: user?.email || user?.displayName || 'Authorized Manager',
          receptionNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to acknowledge order');
      }

      setReceptionNotes('');
      // The real-time listener will remove this order from unacknowledgedOrders
    } catch (err) {
      console.error('[IncomingOrderAcknowledgment] Acknowledge error:', err);
      setSubmitError(err.message || 'Error acknowledging order reception. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadProFormaPdf = async (order) => {
    setIsGeneratingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header Banner
      doc.setFillColor(0, 54, 102);
      doc.rect(0, 0, 210, 32, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('REGENPEPT PEPTIDE THERAPEUTICS', 14, 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(210, 230, 255);
      doc.text('Advanced Clinical Solutions • Global Logistics & Distribution', 14, 19);
      doc.text('PRO-FORMA INVOICE', 196, 13, { align: 'right' });
      doc.text(`Order Ref: #${order.orderCode || order.id}`, 196, 19, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 196, 25, { align: 'right' });

      // Bill To & Terms
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('BILL TO & RECIPIENT CLINIC:', 14, 44);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Clinic / Doctor: ${order.customerName || 'Direct Clinical Account'}`, 14, 50);
      if (order.customerEmail) doc.text(`Email: ${order.customerEmail}`, 14, 55);
      if (order.customerPhone) doc.text(`Phone: ${order.customerPhone}`, 14, 60);
      if (order.customerAddress) doc.text(`Delivery: ${order.customerAddress}`, 14, 65);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('COMMERCIAL & DISPATCH TERMS:', 118, 44);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Pricing Tier: ${order.priceTierLabel || 'Institutional Direct (+30% Margin)'}`, 118, 50);
      doc.text(`Destination: ${order.shippingDestination || 'Standard Dispatch'}`, 118, 55);
      doc.text(`Source Catalog: ${order.catalogCode || order.catalogTitle || 'Standard Catalog'}`, 118, 60);
      doc.text(`Status: Official Draft Order Review`, 118, 65);

      const items = Array.isArray(order.items) ? order.items : [];
      const tableRows = items.map((item, idx) => {
        const qty = item.quantity || 1;
        const unit = item.unitPrice ?? item.price ?? 0;
        const total = item.totalPrice ?? (qty * unit);
        return [
          idx + 1,
          item.productName || item.name || 'Product',
          item.dosage || 'Standard',
          qty,
          `$${Number(unit).toFixed(2)}`,
          `$${Number(total).toFixed(2)}`
        ];
      });

      doc.autoTable({
        startY: 74,
        head: [['#', 'Item Formulation', 'Dosage / Spec', 'Qty', 'Unit Price', 'Total Amount']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 54, 102], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [15, 23, 42] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 70, fontStyle: 'bold' },
          2: { cellWidth: 35 },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
        },
        margin: { left: 14, right: 14 }
      });

      const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : 140;

      // Summary Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(120, finalY, 76, 28, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(120, finalY, 76, 28, 2, 2, 'S');

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('Subtotal:', 124, finalY + 7);
      doc.text(`$${Number(order.subtotal || 0).toFixed(2)}`, 192, finalY + 7, { align: 'right' });

      doc.text('Freight / Shipping:', 124, finalY + 13);
      doc.text(`+$${Number(order.shippingCost || 0).toFixed(2)}`, 192, finalY + 13, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(0, 54, 102);
      doc.text('Grand Total:', 124, finalY + 22);
      doc.text(`$${Number(order.grandTotal ?? order.total ?? 0).toFixed(2)} USD`, 192, finalY + 22, { align: 'right' });

      doc.save(`ProForma_${order.orderCode || order.id}.pdf`);
    } catch (err) {
      console.error('Failed to generate Pro-Forma PDF:', err);
      alert('Failed to generate Pro-Forma PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getWhatsAppHref = (order) => {
    const rawPhone = order.customerPhone || '';
    const cleanPhone = rawPhone.replace(/[^\d+]/g, '').replace('+', '');
    const clientName = order.customerName || 'Doctor';
    const code = order.orderCode || order.id;
    const total = order.currencySymbol ? `${order.currencySymbol}${Number(order.grandTotal || 0).toFixed(2)}` : `$${Number(order.grandTotal || 0).toFixed(2)} USD`;
    const message = `Hello ${clientName}, this is RegenPept Clinical Operations. We have received your order inquiry (#${code}) totaling ${total}. Our dispatch team is reviewing delivery lead times for ${order.shippingDestination || 'your destination'}. Thank you!`;
    const encoded = encodeURIComponent(message);
    return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  };

  const currencyCode = currentOrder.currency || 'AED';
  const formatMoney = (val) => {
    const num = Number(val || 0);
    return `${currencyCode} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '640px',
          width: '100%',
          maxHeight: 'min(90vh, 760px)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(220, 38, 38, 0.4)',
          border: '2px solid #ef4444',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Urgent Critical Header (Fixed) */}
        <div
          style={{
            flexShrink: 0,
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#991b1b', margin: 0, wordBreak: 'break-all' }}>
                  🚨 New Incoming Order Draft: {currentOrder.code || currentOrder.orderId || currentOrder.id}
                </h2>
                {pendingCount > 1 && (
                  <span
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    1 of {pendingCount} Pending
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#b91c1c', fontWeight: 600 }}>
                Shared Catalog Inquiry • Immediate Reception Acknowledgment Required
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {/* Unclosable Mandate Alert Banner */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <ShieldCheck size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: '#92400e', lineHeight: 1.45 }}>
              <strong>Mandatory Protocol:</strong> As per institutional compliance, all shared catalog orders require explicit human reception before dispatch or communication. <strong>This screen cannot be dismissed until you confirm reception.</strong>
            </div>
          </div>

          {submitError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                marginBottom: '14px'
              }}
            >
              ⚠️ {submitError}
            </div>
          )}

          {/* Source Catalog & Applied Pricing Tier Card */}
          <div
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ExternalLink size={14} color="#2563eb" />
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Source Catalog & Applied Pricing Tier
                </span>
              </div>
              <span
                style={{
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid #93c5fd'
                }}
              >
                🛡️ {currentOrder.priceTierLabel || 'Institutional Direct'} {currentOrder.priceMarkupPercent > 0 ? `(+${currentOrder.priceMarkupPercent}% Margin)` : ''}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.8rem', color: '#1e3a8a', marginTop: '2px' }}>
              <div>
                <strong>Catalog Batch / ID:</strong>{' '}
                <code style={{ backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 700 }}>
                  {currentOrder.catalogCode || currentOrder.catalogId || 'Direct Shared Link'}
                </code>
              </div>
              {(currentOrder.catalogToken || currentOrder.catalogId) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <a
                    href={`/shared/catalog/${currentOrder.catalogToken || currentOrder.catalogId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline', fontSize: '0.78rem' }}
                  >
                    🔗 View Origin Shared Catalog & Prices &rarr;
                  </a>
                </div>
              )}
            </div>
            {currentOrder.catalogTitle && (
              <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontStyle: 'italic', marginTop: '2px' }}>
                🏷️ Reference: {currentOrder.catalogTitle}
              </div>
            )}
          </div>

          {/* Customer / Practice Details Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '14px'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
              🏥 Client & Practice Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={15} color="#64748b" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{currentOrder.customerName}</span>
              </div>
              {currentOrder.customerEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <Mail size={15} color="#64748b" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#0284c7', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentOrder.customerEmail}
                  </span>
                </div>
              )}
              {currentOrder.customerPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={15} color="#64748b" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#334155' }}>{currentOrder.customerPhone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={15} color="#64748b" style={{ flexShrink: 0 }} />
                <span style={{ color: '#334155' }}>
                  {currentOrder.shippingDestination} ({currentOrder.shippingCode || 'DAP'})
                </span>
              </div>
            </div>

            {currentOrder.customerAddress && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#64748b' }}>
                📍 <strong>Delivery Address:</strong> {currentOrder.customerAddress}
              </div>
            )}

            {currentOrder.customerNotes && (
              <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                💬 <strong>Notes:</strong> &ldquo;{currentOrder.customerNotes}&rdquo;
              </div>
            )}
          </div>

          {/* Formulations & Units Breakdown */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📦 Formulations Specification ({currentOrder.totalUnits} Units Total)
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Currency: <strong>{currencyCode}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
              {(currentOrder.items || []).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ minWidth: 0, paddingRight: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {item.productName || item.name}
                      <span style={{ color: '#64748b', marginLeft: '6px', fontWeight: 500 }}>({item.dosage || 'Standard'})</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
                      {item.kits > 0 && <span>📦 {item.kits} Kit{item.kits > 1 ? 's' : ''} (10 pk)</span>}
                      {item.kits > 0 && item.singleUnits > 0 && <span> + </span>}
                      {item.singleUnits > 0 && <span>🧪 {item.singleUnits} Single Vial{item.singleUnits > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: '#003666' }}>
                      {formatMoney(item.totalPrice ?? item.total)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      ×{item.quantity} units @ {formatMoney(item.unitPrice ?? item.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Products Subtotal:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                  {formatMoney(currentOrder.subtotal)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Freight ({currentOrder.shippingDestination}):</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>
                  +{formatMoney(currentOrder.shippingCost || 0)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, color: '#003666', marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                <span>Grand Total:</span>
                <span>
                  {formatMoney(currentOrder.grandTotal ?? currentOrder.totalAmount ?? currentOrder.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Optional Reception Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
              Internal Reception Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Contacting clinic via WhatsApp, batch release verified..."
              value={receptionNotes}
              onChange={(e) => setReceptionNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                color: '#0f172a',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Sticky Action Footer (Always Visible on Laptop & Mobile) */}
        <div
          style={{
            flexShrink: 0,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 20px',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Quick Actions: WhatsApp Client & Pro-Forma PDF */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px', marginBottom: '8px' }}>
            <a
              href={getWhatsAppHref(currentOrder)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: '#25D366',
                color: '#ffffff',
                padding: '9px 12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                transition: 'opacity 0.15s ease'
              }}
            >
              <MessageSquare size={16} />
              <span>WhatsApp Reply</span>
            </a>

            <button
              type="button"
              onClick={() => handleDownloadProFormaPdf(currentOrder)}
              disabled={isGeneratingPdf}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                padding: '9px 12px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Download size={16} color="#0284c7" />
              <span>{isGeneratingPdf ? 'Generating...' : 'Pro-Forma PDF'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAcknowledge}
            disabled={isSubmitting}
            style={{
              width: '100%',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
              opacity: isSubmitting ? 0.75 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={18} />
            <span>
              {isSubmitting
                ? 'Confirming Reception...'
                : '📥 Confirm Reception & Mark as Read'}
            </span>
          </button>
          <p style={{ textAlign: 'center', margin: '6px 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
            Clicking marks this draft as read, records your manager ID, and unlocks the portal.
          </p>
        </div>
      </div>
    </div>
  );
}
