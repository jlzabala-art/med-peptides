"use client";

import React, { useState } from 'react';
import { ChevronDown, Check } from '@/lib/icons';
import notifier from '../../../services/NotificationService';

// Unified taxonomy of pricing tiers across customer categories
export const CUSTOMER_TIERS = {
  // Wholesalers
  wholesaler: [
    { id: 'tier_b2b_clinic', label: 'Clinic B2B Preferred', margin: 25, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { id: 'standard', label: 'Standard Wholesale', margin: 20, color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
    { id: 'premium', label: 'Tier 1 Enterprise', margin: 35, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' }
  ],
  // Clinics
  clinic: [
    { id: 'clinic_partner', label: 'Accredited Partner', margin: 25, color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
    { id: 'clinic_vip', label: 'VIP Hospital Network', margin: 30, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
    { id: 'clinic_standard', label: 'Standard Clinic', margin: 20, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' }
  ],
  // Patients & Individuals
  patient: [
    { id: 'retail', label: 'Standard Retail (RRP)', margin: 0, color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
    { id: 'patient_vip', label: 'Patient Loyalty Club', margin: 10, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' }
  ]
};

export function resolveCustomerTier(customer, type = 'wholesaler') {
  const tiers = CUSTOMER_TIERS[type] || CUSTOMER_TIERS.wholesaler;
  const currentId = customer?.pricingTier || customer?.tier || customer?.priceTier;

  const found = tiers.find(t => t.id === currentId);
  if (found) return found;

  // Fallback default tier
  return tiers[0];
}

/**
 * PricingTierSelectorCell
 * Renders an interactive GCP-styled pricing tier pill with quick dropdown switching.
 */
export default function PricingTierSelectorCell({
  customer,
  customerType = 'wholesaler',
  onUpdate
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const availableTiers = CUSTOMER_TIERS[customerType] || CUSTOMER_TIERS.wholesaler;
  const activeTier = resolveCustomerTier(customer, customerType);

  const handleSelectTier = async (newTier) => {
    setIsOpen(false);
    if (newTier.id === activeTier.id) return;

    setSaving(true);
    try {
      if (onUpdate && customer?.id) {
        await onUpdate(customer.id, {
          pricingTier: newTier.id,
          tier: newTier.id,
          discountMargin: newTier.margin
        });
      }
      notifier.success(`Pricing Tier updated to "${newTier.label}" (${newTier.margin}% margin)`);
    } catch (err) {
      notifier.error(err.message || 'Failed to update pricing tier.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        disabled={saving}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 9px',
          borderRadius: '14px',
          fontSize: '0.74rem',
          fontWeight: 700,
          backgroundColor: activeTier.bg,
          color: activeTier.color,
          border: `1px solid ${activeTier.border}`,
          cursor: saving ? 'wait' : 'pointer',
          transition: 'all 0.15s ease',
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
        }}
        title={`Click to change pricing tier. Current margin: ${activeTier.margin}%`}
      >
        <span>{activeTier.label}</span>
        <span style={{
          backgroundColor: 'rgba(0,0,0,0.06)',
          padding: '1px 5px',
          borderRadius: '10px',
          fontSize: '0.68rem',
          fontWeight: 800
        }}>
          +{activeTier.margin}%
        </span>
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>

      {isOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              zIndex: 999,
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
              minWidth: '220px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              animation: 'fadeIn 0.12s ease'
            }}
          >
            <div style={{ padding: '4px 8px', fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Assign Pricing Tier
            </div>
            {availableTiers.map(t => {
              const isSelected = t.id === activeTier.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTier(t)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? t.color : '#334155',
                    backgroundColor: isSelected ? t.bg : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background 0.1s'
                  }}
                  onMouseOver={e => !isSelected && (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseOut={e => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{t.label}</span>
                    <span style={{ fontSize: '0.70rem', color: '#64748b' }}>({t.margin}%)</span>
                  </div>
                  {isSelected && <Check size={14} color={t.color} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
