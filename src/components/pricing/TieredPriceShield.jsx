"use client";

import React, { useMemo } from 'react';
import { Lock, Unlock, ShieldCheck, Eye, Sparkles } from '@/lib/icons';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { triggerHaptic } from '@/utils/haptics';

const CURRENCY_RATES = {
  EUR: { symbol: '€', rate: 1.0, position: 'before' },
  USD: { symbol: '$', rate: 1.08, position: 'before' },
  AED: { symbol: 'AED', rate: 3.97, position: 'after' }
};

/**
 * Resolves all 4 price tiers for a product
 */
export function resolveProductTierPricing(product) {
  if (!product) return null;

  // Direct AED prices (e.g. from Colway official catalog enrichment)
  let landedCost = null;
  let wholesalePrice = null;
  let clinicPrice = null;
  let retailPrice = null;

  if (typeof product.landedCostAed === 'number' && product.landedCostAed > 0) {
    landedCost = Math.round((product.landedCostAed / 3.97) * 100) / 100;
  }
  if (typeof product.wholesalePriceAed === 'number' && product.wholesalePriceAed > 0) {
    wholesalePrice = Math.round((product.wholesalePriceAed / 3.97) * 100) / 100;
  }
  if (typeof product.clinicPriceAed === 'number' && product.clinicPriceAed > 0) {
    clinicPrice = Math.round((product.clinicPriceAed / 3.97) * 100) / 100;
  }
  if (typeof product.retailPriceAed === 'number' && product.retailPriceAed > 0) {
    retailPrice = Math.round((product.retailPriceAed / 3.97) * 100) / 100;
  }

  // Direct EUR / base price overrides
  if (!clinicPrice) {
    if (typeof product.price === 'number' && product.price > 0) {
      clinicPrice = product.price;
    } else {
      const id = (product.id || product.slug || '').toLowerCase();
      if (id.includes('diamond-cream')) clinicPrice = 64.00;
      else if (id.includes('diamond-peeling') || id.includes('diamond-exfoliat')) clinicPrice = 34.00;
      else if (id.includes('colvita')) clinicPrice = 31.00;
      else if (id.includes('vege')) clinicPrice = 25.00;
      else if (id.includes('shampoo')) clinicPrice = 29.00;
      else if (id.includes('conditioner')) clinicPrice = 29.00;
      else if (id.includes('wash')) clinicPrice = 29.00;
      else if (id.includes('lip')) clinicPrice = 4.50;
    }
  }

  // Derive missing tiers proportionally
  if (clinicPrice) {
    if (!landedCost) landedCost = Math.round(clinicPrice * 0.68 * 100) / 100;
    if (!wholesalePrice) wholesalePrice = Math.round(clinicPrice * 0.80 * 100) / 100;
    if (!retailPrice) retailPrice = Math.round(clinicPrice * 1.30 * 100) / 100;
  }

  return {
    cost: landedCost,
    wholesaler: wholesalePrice,
    clinic: clinicPrice,
    retail: retailPrice
  };
}

export function formatTierPrice(amount, currency = 'EUR') {
  if (typeof amount !== 'number' || isNaN(amount)) return null;
  const cfg = CURRENCY_RATES[currency] || CURRENCY_RATES.EUR;
  const converted = amount * cfg.rate;
  if (currency === 'AED') {
    return `${Math.round(converted).toLocaleString()} AED`;
  }
  return `${cfg.symbol}${converted.toFixed(2)}`;
}

export default function TieredPriceShield({
  product,
  currency = 'EUR',
  onUnlockRequest,
  compact = false,
  isEs = false,
  adminSimulationTier = null,
  onSelectAdminSimulationTier = null
}) {
  const { user } = useAuth();
  const { is, can } = useRoleAccess();

  const tiers = useMemo(() => resolveProductTierPricing(product), [product]);

  if (!tiers || (!tiers.clinic && !tiers.wholesaler)) {
    return null;
  }

  // Determine user authorization
  const isAuthenticated = Boolean(user);
  const isAdmin = is('admin');
  const isWholesaler = is('wholesaler');
  const isDoctor = is('doctor') || is('clinic') || is('medical_director') || is('fagron_clinic');
  const isPatient = is('patient');

  // Determine which tier to display
  let activeTierKey = 'clinic';
  if (isAdmin && adminSimulationTier) {
    activeTierKey = adminSimulationTier;
  } else if (isAdmin) {
    activeTierKey = adminSimulationTier || 'clinic';
  } else if (isWholesaler) {
    activeTierKey = 'wholesaler';
  } else if (isDoctor) {
    activeTierKey = 'clinic';
  } else if (isPatient) {
    activeTierKey = 'retail';
  }

  const tierMeta = {
    cost: {
      label: isEs ? 'COSTE DE ORIGEN (LANDED)' : 'LANDED COST (EXW)',
      badge: 'Internal Cost',
      badgeBg: '#fef2f2',
      badgeColor: '#dc2626',
      badgeBorder: '#fee2e2',
      incoterm: 'EXW',
      amount: tiers.cost
    },
    wholesaler: {
      label: isEs ? 'TARIFA MAYORISTA B2B (EXW)' : 'WHOLESALER B2B (EXW)',
      badge: isEs ? 'Mayorista (-20%)' : 'Wholesale Tier',
      badgeBg: '#fff7ed',
      badgeColor: '#c2410c',
      badgeBorder: '#ffedd5',
      incoterm: 'Ex-Works (EXW)',
      amount: tiers.wholesaler
    },
    clinic: {
      label: isEs ? 'PRACTITIONER B2B (EXW)' : 'PRACTITIONER B2B (EXW)',
      badge: 'Ex-Works (EXW)',
      badgeBg: '#f0fdfa',
      badgeColor: '#0d9488',
      badgeBorder: '#ccfbf1',
      incoterm: 'Ex-Works (EXW)',
      amount: tiers.clinic
    },
    retail: {
      label: isEs ? 'PVP RECOMENDADO (RRP)' : 'RECOMMENDED RETAIL (RRP)',
      badge: isEs ? 'IVA / Taxes Inc.' : 'MSRP / Retail',
      badgeBg: '#f5f3ff',
      badgeColor: '#7c3aed',
      badgeBorder: '#ede9fe',
      incoterm: isEs ? 'PVP Final' : 'Final RRP',
      amount: tiers.retail
    }
  };

  const currentTier = tierMeta[activeTierKey] || tierMeta.clinic;
  const formattedPrice = formatTierPrice(currentTier.amount, currency);

  // ── CASE 1: COMPACT LIST VIEW ──
  if (compact) {
    if (!isAuthenticated) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('light');
            if (onUnlockRequest) onUnlockRequest();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '5px',
            background: 'rgba(241, 245, 249, 0.9)',
            border: '1px solid #cbd5e1',
            color: '#475569',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title={isEs ? "Desbloquear tarifas profesionales en 1 clic" : "Unlock practitioner wholesale pricing"}
        >
          <Lock size={12} color="#0d9488" />
          <span>{isEs ? 'Ver B2B' : 'Unlock B2B'}</span>
        </button>
      );
    }

    return (
      <div style={{ textAlign: 'right', marginRight: '6px' }}>
        <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
          {currentTier.incoterm}
        </span>
        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
          {formattedPrice}
        </strong>
      </div>
    );
  }

  // ── CASE 2: UNLOCKED CARD VIEW (Authenticated) ──
  if (isAuthenticated) {
    return (
      <div style={{
        marginBottom: '0.65rem',
        padding: '8px 12px',
        borderRadius: '8px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s ease'
      }}>
        {/* Top Header: Tier Label + Incoterm Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{
            fontSize: '0.67rem',
            color: '#64748b',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isAdmin && <ShieldCheck size={13} color="#003666" />}
            {isWholesaler && <Sparkles size={12} color="#c2410c" />}
            {currentTier.label}
          </span>

          <span style={{
            fontSize: '0.66rem',
            color: currentTier.badgeColor,
            fontWeight: 750,
            background: currentTier.badgeBg,
            padding: '2px 7px',
            borderRadius: '4px',
            border: `1px solid ${currentTier.badgeBorder}`,
            whiteSpace: 'nowrap'
          }}>
            {currentTier.badge}
          </span>
        </div>

        {/* Big Price Display */}
        <div style={{ marginTop: '3px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: 850, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {formattedPrice}
          </span>

          {/* Admin Simulation Pill Selector (AGENTS.md Rule #14 & #22) */}
          {isAdmin && onSelectAdminSimulationTier && (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#ffffff', padding: '2px', borderRadius: '5px', border: '1px solid #cbd5e1' }}
              onClick={(e) => e.stopPropagation()}
            >
              {['cost', 'wholesaler', 'clinic', 'retail'].map((tierKey) => (
                <button
                  key={tierKey}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('light');
                    onSelectAdminSimulationTier(tierKey);
                  }}
                  style={{
                    background: activeTierKey === tierKey ? '#003666' : 'transparent',
                    color: activeTierKey === tierKey ? '#ffffff' : '#64748b',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '2px 5px',
                    fontSize: '0.60rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                  title={`Audit pricing as ${tierKey.toUpperCase()}`}
                >
                  {tierKey === 'cost' ? 'Cost' : tierKey === 'wholesaler' ? 'Whole' : tierKey === 'clinic' ? 'B2B' : 'RRP'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── CASE 3: LOCKED CARD VIEW (Unauthenticated / Public Visitors) ──
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        triggerHaptic('medium');
        if (onUnlockRequest) onUnlockRequest();
      }}
      style={{
        marginBottom: '0.65rem',
        padding: '8px 12px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: '1px solid #cbd5e1',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        transition: 'transform 0.15s ease, border-color 0.15s ease'
      }}
      title={isEs ? "Haga clic para desbloquear las tarifas profesionales B2B" : "Click to unlock practitioner B2B pricing"}
    >
      {/* Top Header: Locked label + Unlock CTA button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: 'rgba(13, 148, 136, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0d9488'
          }}>
            <Lock size={11} strokeWidth={2.5} />
          </div>
          <span style={{
            fontSize: '0.68rem',
            color: '#475569',
            fontWeight: 750,
            textTransform: 'uppercase',
            letterSpacing: '0.03em'
          }}>
            {isEs ? 'Tarifa Profesional B2B' : 'Practitioner B2B (EXW)'}
          </span>
        </div>

        {/* 1-Click Unlock Pill */}
        <span style={{
          fontSize: '0.66rem',
          color: '#0d9488',
          fontWeight: 750,
          background: '#f0fdfa',
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid #99f6e4',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 1px 2px rgba(13, 148, 136, 0.08)'
        }}>
          <Unlock size={10} />
          {isEs ? 'Desbloquear' : 'Unlock'}
        </span>
      </div>

      {/* Blurred Price Teaser */}
      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{
            fontSize: '1.15rem',
            fontWeight: 850,
            color: '#94a3b8',
            filter: 'blur(4px)',
            userSelect: 'none'
          }}>
            €58.00
          </span>
          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
            {isEs ? 'Ex-Works' : 'EXW'}
          </span>
        </div>

        <span style={{ fontSize: '0.68rem', color: '#0d9488', fontWeight: 600, textDecoration: 'underline' }}>
          {isEs ? 'Ver en 1-Clic →' : '1-Click Access →'}
        </span>
      </div>

      <p style={{ margin: '4px 0 0 0', fontSize: '0.64rem', color: '#64748b', lineHeight: 1.25 }}>
        {isEs
          ? 'Acceso directo para centros médicos, clínicas y distribuidores.'
          : 'Verified access for clinics, doctors and authorized wholesalers.'}
      </p>
    </div>
  );
}
