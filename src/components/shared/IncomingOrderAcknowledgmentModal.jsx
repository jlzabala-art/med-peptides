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
  Clock
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
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(220, 38, 38, 0.4)',
          border: '2px solid #ef4444',
          position: 'relative'
        }}
      >
        {/* Urgent Critical Header */}
        <div
          style={{
            backgroundColor: '#fef2f2',
            borderBottom: '1px solid #fecaca',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTopLeftRadius: '14px',
            borderTopRightRadius: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                animation: 'pulse 2s infinite'
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
                  🚨 New Incoming Order Draft: {currentOrder.code || currentOrder.orderId || currentOrder.id}
                </h2>
                {pendingCount > 1 && (
                  <span
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    1 of {pendingCount} Pending
                  </span>
                )}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 }}>
                Shared Catalog Inquiry • Immediate Reception Acknowledgment Required
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Unclosable Mandate Alert Banner */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <ShieldCheck size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.825rem', color: '#92400e', lineHeight: 1.45 }}>
              <strong>Mandatory Protocol:</strong> As per institutional compliance, all shared catalog orders require explicit human reception before dispatch or communication. <strong>This screen cannot be dismissed or bypassed until you confirm reception.</strong>
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
                fontSize: '0.825rem',
                marginBottom: '16px'
              }}
            >
              ⚠️ {submitError}
            </div>
          )}

          {/* Customer / Practice Details Card */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '16px'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.04em' }}>
              🏥 Client & Practice Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} color="#64748b" />
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{currentOrder.customerName}</span>
              </div>
              {currentOrder.customerEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} color="#64748b" />
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{currentOrder.customerEmail}</span>
                </div>
              )}
              {currentOrder.customerPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} color="#64748b" />
                  <span style={{ color: '#334155' }}>{currentOrder.customerPhone}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#64748b" />
                <span style={{ color: '#334155' }}>
                  {currentOrder.shippingDestination} ({currentOrder.shippingCode || 'DAP'})
                </span>
              </div>
            </div>

            {currentOrder.customerAddress && (
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b' }}>
                📍 <strong>Delivery Address:</strong> {currentOrder.customerAddress}
              </div>
            )}

            {currentOrder.customerNotes && (
              <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
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
              padding: '16px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📦 Formulations Specification ({currentOrder.totalUnits} Units Total)
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Currency: <strong>{currentOrder.currency}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
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
                    fontSize: '0.825rem',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.productName}</span>
                    <span style={{ color: '#64748b', marginLeft: '6px' }}>({item.dosage})</span>
                    <div style={{ fontSize: '0.72rem', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
                      {item.kits > 0 && <span>📦 {item.kits} Kit{item.kits > 1 ? 's' : ''} (10 pk)</span>}
                      {item.kits > 0 && item.singleUnits > 0 && <span> + </span>}
                      {item.singleUnits > 0 && <span>🧪 {item.singleUnits} Single Vial{item.singleUnits > 1 ? 's' : ''}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#003666' }}>
                      {currentOrder.currencySymbol || '$'}{Number(item.totalPrice || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      ×{item.quantity} units @ {currentOrder.currencySymbol || '$'}{Number(item.unitPrice || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Products Subtotal:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                  {currentOrder.currencySymbol || '$'}{Number(currentOrder.subtotal || 0).toFixed(2)} {currentOrder.currency}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Freight ({currentOrder.shippingDestination}):</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>
                  +{currentOrder.currencySymbol || '$'}{Number(currentOrder.shippingCost || 0).toFixed(2)} {currentOrder.currency}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', fontWeight: 800, color: '#003666', marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                <span>Grand Total:</span>
                <span>
                  {currentOrder.currencySymbol || '$'}{Number(currentOrder.grandTotal || 0).toFixed(2)} {currentOrder.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Optional Reception Notes */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
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
                fontSize: '0.825rem',
                color: '#0f172a'
              }}
            />
          </div>

          {/* Mandatory Confirmation Action Button */}
          <div>
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
                padding: '14px 20px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                opacity: isSubmitting ? 0.75 : 1,
                transition: 'all 0.15s ease'
              }}
            >
              <CheckCircle2 size={20} />
              <span>
                {isSubmitting
                  ? 'Confirming Reception...'
                  : '📥 Confirm Reception & Mark as Read'}
              </span>
            </button>
            <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
              Clicking this button marks the order as read in the database, logs your user ID as recipient, and unlocks the portal interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
