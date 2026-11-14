'use client';

/**
 * hooks/pricing/usePriceTier.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Price Tier Resolver
 *
 * Business Rules:
 *  - Anonymous / unregistered  → wholesalerPrice = cost × 1.15 × 1.15 = cost × 1.3225
 *  - Registered user           → resolve tier from user.priceTier | user.role
 *  - Mediluxe internal staff   → see all tiers (cost, mediluxe, wholesale, clinic)
 *
 * Tier hierarchy (lowest → highest visibility):
 *   'guest'       – anonymous; can only see wholesalerPrice
 *   'wholesaler'  – registered wholesaler/distributor; wholesalePrice column
 *   'clinic'      – registered clinic/doctor; clinicPrice column
 *   'admin'       – internal; all columns visible
 *
 * Price column resolution per product:
 *   Each product is expected to have one or more of:
 *     product.pricing.masterPrice   (cost)
 *     product.pricing.mediluxePrice (cost × 1.15)
 *     product.pricing.wholesalePrice (cost × 1.3225 — public default)
 *     product.pricing.clinicPrice
 *     product.price_eur / product.costEur / product.unit_price (legacy flat fields)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────

export const MEDILUXE_EMAILS = new Set([
  'jose@mediluxem.com',
  'jose@mediluxeme.com',
  'kasia@mediluxeme.com',
  'business@mediluxeme.com',
]);

export const TIER_LABELS = {
  guest:      'Public Wholesale Price',
  wholesaler: 'Distributor Price',
  clinic:     'Clinic / Doctor Price',
  admin:      'Internal (All Tiers)',
};

export const TIER_COLORS = {
  guest:      { text: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  wholesaler: { text: '#0369a1', bg: '#eff6ff', border: '#bfdbfe' },
  clinic:     { text: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
  admin:      { text: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
};

// ─── Tier Resolution ──────────────────────────────────────────────────────────

/**
 * Resolves the pricing tier for a given authenticated user object.
 * @param {object|null} user  – Firebase user + Firestore fields
 * @returns {'guest'|'wholesaler'|'clinic'|'admin'}
 */
export function resolveUserTier(user) {
  if (!user) return 'guest';

  const email = (user.email || '').toLowerCase();
  if (MEDILUXE_EMAILS.has(email)) return 'admin';

  // Explicit priceTier field takes precedence
  const pt = (user.priceTier || '').toLowerCase();
  if (pt === 'admin')      return 'admin';
  if (pt === 'wholesaler' || pt === 'wholesale' || pt === 'distributor') return 'wholesaler';
  if (pt === 'clinic'     || pt === 'doctor'   || pt === 'medical')     return 'clinic';

  // Fall back to role field
  const role = (user.role || '').toLowerCase();
  if (role === 'admin' || role === 'pharmacist' || role === 'medical_director') return 'admin';
  if (role === 'doctor' || role === 'clinic' || role === 'sales' || role === 'operations') return 'clinic';
  if (role === 'wholeseller' || role === 'wholesaler' || role === 'distributor') return 'wholesaler';

  // Registered but no special tier → show wholesale price (better than nothing, safer than cost)
  return 'wholesaler';
}

// ─── Price Resolution per Product ─────────────────────────────────────────────

/**
 * Extracts the raw cost from a product using multiple legacy field patterns.
 * Returns NaN if cost cannot be determined.
 */
export function extractCost(product) {
  if (!product) return NaN;

  // Structured pricing object (new schema)
  const p = product.pricing;
  if (p) {
    const master = p.masterPrice ?? p.master?.perUnit ?? p.costPrice ?? p.cost;
    if (typeof master === 'number' && master > 0) return master;
  }

  // Legacy flat fields
  const legacy = product.price_eur ?? product.costEur ?? product.unit_price ??
                 product.cost ?? product.basePrice;
  if (typeof legacy === 'number' && legacy > 0) return legacy;

  return NaN;
}

/**
 * Resolves the display price for a product + tier.
 * @param {object} product   – Firestore product doc (normalized)
 * @param {'guest'|'wholesaler'|'clinic'|'admin'} tier
 * @returns {{ price: number|null, tierUsed: string, label: string }}
 */
export function resolvePriceForTier(product, tier) {
  if (!product) return { price: null, tierUsed: tier, label: TIER_LABELS[tier] };

  const p = product.pricing || {};

  // Admin sees all — return cost (most privileged view)
  if (tier === 'admin') {
    const cost = extractCost(product);
    const mediluxe = p.mediluxePrice ?? (isNaN(cost) ? null : +(cost * 1.15).toFixed(2));
    return {
      price: mediluxe ?? cost,
      costPrice: isNaN(cost) ? null : +cost.toFixed(2),
      mediluxePrice: mediluxe,
      wholesalePrice: p.wholesalePrice ?? (isNaN(cost) ? null : +(cost * 1.3225).toFixed(2)),
      clinicPrice: p.clinicPrice ?? null,
      tierUsed: 'admin',
      label: TIER_LABELS.admin,
    };
  }

  // Clinic price
  if (tier === 'clinic') {
    const clinic = p.clinicPrice ?? p.retailPrice;
    if (typeof clinic === 'number' && clinic > 0) {
      return { price: +clinic.toFixed(2), tierUsed: 'clinic', label: TIER_LABELS.clinic };
    }
    // Fall through to wholesale if clinic price not set
  }

  // Wholesale / guest price (default public price)
  const wholesale = p.wholesalePrice ?? p.publicPrice;
  if (typeof wholesale === 'number' && wholesale > 0) {
    return { price: +wholesale.toFixed(2), tierUsed: tier === 'clinic' ? 'wholesale_fallback' : tier, label: TIER_LABELS.guest };
  }

  // Compute from cost × 1.3225
  const cost = extractCost(product);
  if (!isNaN(cost)) {
    return {
      price: +(cost * 1.3225).toFixed(2),
      tierUsed: 'computed_wholesale',
      label: TIER_LABELS.guest,
    };
  }

  return { price: null, tierUsed: tier, label: TIER_LABELS[tier] };
}

// ─── React Hook ───────────────────────────────────────────────────────────────

/**
 * usePriceTier()
 *
 * Returns:
 *  - tier          : 'guest' | 'wholesaler' | 'clinic' | 'admin'
 *  - tierLabel     : Human-readable label for the current tier
 *  - tierColor     : { text, bg, border } CSS color tokens
 *  - isAuthenticated
 *  - isAdmin
 *  - priceFor(product) → { price: number|null, tierUsed, label, ...allPrices }
 *  - formatPrice(num, currency?) → formatted string
 */
export function usePriceTier() {
  const { user, loading } = useAuth();

  const tier = useMemo(() => resolveUserTier(user), [user]);

  const priceFor = useMemo(
    () => (product) => resolvePriceForTier(product, tier),
    [tier]
  );

  const formatPrice = (amount, currency = 'EUR', locale = 'en-EU') => {
    if (amount === null || amount === undefined || isNaN(amount)) return '—';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return {
    tier,
    tierLabel: TIER_LABELS[tier] ?? 'Unknown',
    tierColor: TIER_COLORS[tier] ?? TIER_COLORS.guest,
    isAuthenticated: !!user,
    isAdmin: tier === 'admin',
    isLoading: loading,
    user,
    priceFor,
    formatPrice,
  };
}
