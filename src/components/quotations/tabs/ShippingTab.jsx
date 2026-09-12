'use client';

import React from 'react';
import { Truck, MapPin, Snowflake, ShieldCheck, Box, Phone, User, Clock } from 'lucide-react';

export default function ShippingTab({ quotation, quotationId }) {
  if (!quotation) return null;

  const addr = quotation.shippingAddress || quotation.address || {};
  const coldChain = quotation.compliance?.requiresColdChain ?? (quotation.requiresColdChain !== false);
  const storage = quotation.compliance?.storageCondition || 'refrigerated';
  const recipientName = addr.recipientName || quotation.clientName || quotation.patientName || quotation.recipientName || '';
  const recipientPhone = addr.phone || quotation.patientPhone || quotation.contactPhone || '';
  const deliveryInstructions = quotation.deliveryInstructions || addr.deliveryInstructions || null;

  return (
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Cold Chain & Logistics Protocol */}
      <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 10, padding: '14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
          <Snowflake size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#134e4a' }}>
            Cold-Chain Logistics Protocol: {coldChain ? 'Required (2°C - 8°C)' : 'Standard Ambient'}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#0f766e', marginTop: 2 }}>
            Storage condition: {storage} · Insulated packaging with monitored temperature data loggers.
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <MapPin size={14} color="var(--color-primary, #003666)" />
          <span>Delivery & Facility Address</span>
        </div>
        
        {recipientName && (
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={14} color="#64748b" />
            {recipientName}
            {recipientPhone && (
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748b' }}>
                · {recipientPhone}
              </span>
            )}
          </div>
        )}

        <div style={{ fontSize: '0.84rem', color: '#0f172a', lineHeight: 1.5 }}>
          {addr.full || addr.formatted ? (
            <div>{addr.full || addr.formatted}</div>
          ) : addr.street ? (
            <>
              <div>{addr.street}</div>
              <div>{addr.city}, {addr.state} {addr.postalCode}</div>
              <div>{addr.country || 'ES'}</div>
            </>
          ) : (
            <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
              Standard direct clinic / client fulfillment address on file.
            </div>
          )}
        </div>
      </div>

      {/* Delivery Instructions (from Zoho Bigin / CRM) */}
      {deliveryInstructions && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 10, padding: '14px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Clock size={14} color="#d97706" />
            <span>Delivery Instructions & Access Schedule</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#78350f', lineHeight: 1.5, fontWeight: 500 }}>
            {deliveryInstructions}
          </div>
        </div>
      )}
    </div>
  );
}
