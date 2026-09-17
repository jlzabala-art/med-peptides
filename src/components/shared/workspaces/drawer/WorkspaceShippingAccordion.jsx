"use client";

import React from 'react';
import {
  Truck,
  ChevronDown,
  ChevronRight,
  MapPin,
  FileText
} from '@/lib/icons';

const SHIPPING_OPTIONS = [
  { id: 'cold_chain', icon: '🧊', title: 'Cold-Chain Temp-Controlled', sub: '2°C - 8°C Thermal Packaging • Priority Overnight', cost: 35 },
  { id: 'express', icon: '🚚', title: 'Standard Express Courier', sub: '2-3 Business Days • Tracked Delivery', cost: 15 },
  { id: 'pickup', icon: '🏥', title: 'Clinic / Direct Facility Pickup', sub: 'On-site pickup at distribution hub', cost: 0 },
];

export default function WorkspaceShippingAccordion({
  isExpanded,
  onToggleExpand,
  activeWs,
  onUpdateShipping,
  stepperMode = false,
}) {
  const selectedMethod = activeWs?.shippingMethod || 'cold_chain';
  const shippingAddress = activeWs?.shippingAddress || '';
  const shippingNotes = activeWs?.shippingNotes || '';

  const activeOpt = SHIPPING_OPTIONS.find(o => o.id === selectedMethod) || SHIPPING_OPTIONS[0];

  return (
    <div
      style={{
        backgroundColor: stepperMode ? 'transparent' : '#ffffff',
        border: stepperMode ? 'none' : '1px solid #cbd5e1',
        borderRadius: stepperMode ? '0' : '12px',
        overflow: stepperMode ? 'visible' : 'hidden',
        boxShadow: stepperMode ? 'none' : '0 2px 6px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease',
        flex: stepperMode ? 1 : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header (Hidden in Stepper Mode) */}
      {!stepperMode && (
        <div
          onClick={onToggleExpand}
          style={{
            padding: '0.85rem 1.1rem',
            backgroundColor: '#ffffff',
            borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1 }}>
            {isExpanded ? <ChevronDown size={18} style={{ color: '#003666', flexShrink: 0 }} /> : <ChevronRight size={18} style={{ color: '#64748b', flexShrink: 0 }} />}
            <Truck size={17} style={{ flexShrink: 0, color: '#003666' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#003666', lineHeight: 1 }}>
              Cold-Chain & Logistics
            </span>
          </div>

          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0284c7', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '99px' }}>
            {activeOpt.icon} {activeOpt.cost === 0 ? 'Free' : `$${activeOpt.cost}`}
          </span>
        </div>
      )}

      {/* Body Content */}
      {(isExpanded || stepperMode) && (
        <div style={{
          padding: stepperMode ? '0.25rem 0' : '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          backgroundColor: stepperMode ? 'transparent' : '#ffffff',
          flex: stepperMode ? 1 : 'none',
        }}>
          {/* Shipping Option Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {SHIPPING_OPTIONS.map(opt => {
              const isSel = selectedMethod === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onUpdateShipping({ shippingMethod: opt.id })}
                  style={{
                    padding: '8px 11px',
                    borderRadius: '9px',
                    border: `1.5px solid ${isSel ? '#003666' : '#e2e8f0'}`,
                    backgroundColor: isSel ? '#f0f7ff' : '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                    touchAction: 'manipulation',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isSel ? '#003666' : '#0f172a' }}>{opt.title}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{opt.sub}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: isSel ? '#003666' : '#475569' }}>
                    {opt.cost === 0 ? 'Free' : `$${opt.cost}.00`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recipient Shipping Address & Delivery Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#475569', fontWeight: 700 }}>
              <MapPin size={13} /> Delivery Destination & Instructions
            </div>
            <input
              type="text"
              placeholder="Shipping street address, city, state, zip..."
              value={shippingAddress}
              onChange={(e) => onUpdateShipping({ shippingAddress: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <input
              type="text"
              placeholder="Delivery notes (e.g. Leave with clinic reception, call upon delivery)..."
              value={shippingNotes}
              onChange={(e) => onUpdateShipping({ shippingNotes: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.78rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
