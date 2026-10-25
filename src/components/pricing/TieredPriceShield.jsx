"use client";

import React, { useMemo } from 'react';
import { Lock, Unlock, ShieldCheck, Eye, Sparkles } from '@/lib/icons';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { triggerHaptic } from '@/utils/haptics';
import { calculatePharmapolisCost } from '@/services/pharmapolisCostEngine.js';

const CURRENCY_RATES = {
  EUR: { symbol: '€', rate: 1.0, position: 'before' },
  USD: { symbol: '$', rate: 1.08, position: 'before' },
  AED: { symbol: 'AED', rate: 3.97, position: 'after' }
};

/**
 * Resolves all 4 price tiers for a product
 */
export function resolveProductTierPricing(product, capsCount = 60) {
  if (!product) return null;

  const id = (product.id || product.slug || product.canonicalId || product.name || '').toLowerCase();
  const brand = (product.brand || product.supplierName || product.supplier || '').toLowerCase();
  const isUltraPerson = id.includes('ultraperson') || id.includes('ultraman') || brand.includes('ultraperson') || brand.includes('ultraman');

  // Dynamic Pharmapolis Compounding Engine for UltraPerson / Ultraman products
  if (isUltraPerson && (product.activeIngredients?.length > 0 || product.ingredients?.length > 0)) {
    try {
      const report = calculatePharmapolisCost({
        activeIngredients: product.activeIngredients || product.ingredients,
        capsPerBottle: capsCount
      });
      const tpc = report.totalProductionCostEur;
      const wholesale = report.finalPricing.netSellingPriceEur; // Pharmapolis price with 15% margin
      const clinic = Math.round(wholesale * 1.30 * 100) / 100;  // B2B Practitioner
      const retail = Math.round(clinic * 1.35 * 100) / 100;     // RRP Recommended Retail

      return {
        cost: tpc,
        wholesaler: wholesale,
        clinic: clinic,
        retail: retail,
        perCapNet: report.finalPricing.netPerCapEur,
        capsCount: report.capsPerBottle
      };
    } catch (e) {
      console.warn('[TieredPriceShield] calculatePharmapolisCost error:', e);
    }
  }

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

  // Direct pricing object in Firestore schema
  if (product.pricing && typeof product.pricing === 'object') {
    if (typeof product.pricing.clinic === 'number' && product.pricing.clinic > 0) clinicPrice = product.pricing.clinic;
    if (typeof product.pricing.wholesale === 'number' && product.pricing.wholesale > 0) wholesalePrice = product.pricing.wholesale;
    if (typeof product.pricing.retail === 'number' && product.pricing.retail > 0) retailPrice = product.pricing.retail;
    if (typeof product.pricing.supplierCost === 'number' && product.pricing.supplierCost > 0) landedCost = product.pricing.supplierCost;
  }

  // Direct EUR / base price overrides
  if (!clinicPrice) {
    if (typeof product.price === 'number' && product.price > 0) {
      clinicPrice = product.price;
    } else if (typeof product.originalPrice === 'number' && product.originalPrice > 0) {
      clinicPrice = product.originalPrice;
    } else {
      const id = (product.id || product.slug || product.canonicalId || product.name || '').toLowerCase();
      
      // 1. Bloodo™ Diagnostic Panels (Capillary DBS LC-MS/MS)
      if (id.includes('nad') || id.includes('bloodo-nad')) {
        clinicPrice = 149.00;
        wholesalePrice = 119.00;
        retailPrice = 195.00;
        landedCost = 79.00;
      } else if (id.includes('testosterone') || id.includes('testosterona')) {
        clinicPrice = 115.00;
        wholesalePrice = 92.00;
        retailPrice = 149.00;
        landedCost = 62.00;
      } else if (id.includes('cortisol')) {
        clinicPrice = 129.00;
        wholesalePrice = 105.00;
        retailPrice = 169.00;
        landedCost = 72.00;
      } else if (id.includes('hba1c') || id.includes('hemoglobin') || id.includes('glucose') || id.includes('glicacion')) {
        clinicPrice = 69.00;
        wholesalePrice = 55.00;
        retailPrice = 89.00;
        landedCost = 38.00;
      } else if (id.includes('omega') || id.includes('lipid')) {
        clinicPrice = 119.00;
        wholesalePrice = 95.00;
        retailPrice = 159.00;
        landedCost = 65.00;
      } else if (id.includes('vitamin-d') || id.includes('vitd') || id.includes('vit-d')) {
        clinicPrice = 59.00;
        wholesalePrice = 47.00;
        retailPrice = 79.00;
        landedCost = 32.00;
      }
      
      // 2. TeleTest Laboratory Spain (HTMA, HLA, Toxicology)
      else if (id.includes('htma') || id.includes('mineralograma')) {
        clinicPrice = 125.00;
        wholesalePrice = 99.00;
        retailPrice = 165.00;
        landedCost = 68.00;
      } else if (id.includes('celiac') || id.includes('gluten') || id.includes('hla')) {
        clinicPrice = 140.00;
        wholesalePrice = 112.00;
        retailPrice = 185.00;
        landedCost = 75.00;
      } else if (id.includes('metabolizer') || id.includes('detox')) {
        clinicPrice = 175.00;
        wholesalePrice = 140.00;
        retailPrice = 230.00;
        landedCost = 95.00;
      } else if (id.includes('heavy-metals') || id.includes('pesados')) {
        clinicPrice = 135.00;
        wholesalePrice = 108.00;
        retailPrice = 179.00;
        landedCost = 72.00;
      }

      // 3. Fagron Genomics TeloTest™ & Genomics Platforms
      else if (id.includes('telotest') || id.includes('telomere')) {
        clinicPrice = 199.00;
        wholesalePrice = 159.00;
        retailPrice = 269.00;
        landedCost = 110.00;
      } else if (id.includes('trichotest')) {
        clinicPrice = 189.00;
        wholesalePrice = 149.00;
        retailPrice = 249.00;
        landedCost = 105.00;
      } else if (id.includes('nutrigen')) {
        clinicPrice = 220.00;
        wholesalePrice = 175.00;
        retailPrice = 295.00;
        landedCost = 120.00;
      } else if (id.includes('eterna')) {
        clinicPrice = 280.00;
        wholesalePrice = 220.00;
        retailPrice = 360.00;
        landedCost = 150.00;
      }

      // 4. Colway Official Cosmeceuticals
      else if (id.includes('diamond-cream')) clinicPrice = 64.00;
      else if (id.includes('diamond-peeling') || id.includes('diamond-exfoliat')) clinicPrice = 34.00;
      else if (id.includes('colvita')) clinicPrice = 31.00;
      else if (id.includes('vege')) clinicPrice = 25.00;
      else if (id.includes('shampoo')) clinicPrice = 29.00;
      else if (id.includes('conditioner')) clinicPrice = 29.00;
      else if (id.includes('wash')) clinicPrice = 29.00;
      else if (id.includes('lip')) clinicPrice = 4.50;

      // 5. Category-level clinical fallbacks
      else {
        const cat = (product.category || product.type || '').toLowerCase();
        if (cat.includes('test') || cat.includes('diagnostic') || cat.includes('biomarker')) {
          clinicPrice = 119.00;
          wholesalePrice = 95.00;
          retailPrice = 159.00;
          landedCost = 65.00;
        } else if (cat.includes('supplement') || cat.includes('nutra')) {
          clinicPrice = 38.00;
          wholesalePrice = 29.00;
          retailPrice = 55.00;
          landedCost = 18.00;
        } else {
          // Default peptide vial
          clinicPrice = 48.00;
          wholesalePrice = 38.00;
          retailPrice = 68.00;
          landedCost = 24.00;
        }
      }
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
  onSelectAdminSimulationTier = null,
  embedded = false,
  capsCount = 60
}) {
  const { user } = useAuth();
  const { is, can } = useRoleAccess();
  const [localPreview, setLocalPreview] = React.useState(null);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('atlas_b2b_verified_preview');
      if (stored) setLocalPreview(JSON.parse(stored));
    } catch (_) {}
  }, []);

  const tiers = useMemo(() => resolveProductTierPricing(product, capsCount), [product, capsCount]);

  if (!tiers || (!tiers.clinic && !tiers.wholesaler)) {
    return null;
  }

  // Determine user authorization & role hierarchy
  const isAuthenticated = Boolean(user) || Boolean(localPreview);
  const isAdmin = is('admin') || is('medical_director') || (localPreview?.role === 'admin');
  const isWholesaler = is('wholesaler') || is('supplier') || is('distributor') || (localPreview?.role === 'wholesaler');
  const isDoctor = is('doctor') || is('clinic') || is('medical_director') || is('fagron_clinic') || is('compounding_pharmacy') || (localPreview?.role === 'clinic');
  const isPatient = is('patient') || (localPreview?.role === 'patient');

  // Determine which tier to display based on canonical role
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
          title={isEs ? "Ver tarifas según perfil" : "View role-based pricing"}
        >
          <Lock size={12} color="#0d9488" />
          <span>{isEs ? 'Tarifas' : 'Pricing'}</span>
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
        marginBottom: embedded ? '6px' : '0.65rem',
        padding: embedded ? '6px 8px' : '8px 12px',
        borderRadius: '8px',
        background: embedded ? '#ffffff' : '#f8fafc',
        border: embedded ? '1px solid #e2e8f0' : '1px solid #e2e8f0',
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
        marginBottom: embedded ? '8px' : '0.65rem',
        padding: embedded ? '8px 10px' : '8px 12px',
        borderRadius: '8px',
        background: embedded ? '#ffffff' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: embedded ? '1px solid #cbd5e1' : '1px solid #cbd5e1',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: embedded ? 'none' : '0 1px 3px rgba(0,0,0,0.03)',
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

      {/* Retail Price for Public Guests + B2B Unlock Teaser */}
      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
            {isEs ? 'PVP Recomendado' : 'Public RRP'}
          </span>
          <span style={{ fontSize: '1.15rem', fontWeight: 850, color: '#0f172a' }}>
            {formatTierPrice(tiers.retail, currency)}
          </span>
          {tiers.perCapNet && (
            <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '6px' }}>
              ({formatTierPrice(tiers.retail / (tiers.capsCount || 60), currency)}/cap)
            </span>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.60rem', color: '#0d9488', fontWeight: 700, display: 'block' }}>
            {isEs ? 'B2B Clínica (EXW)' : 'Clinic Tier (EXW)'}
          </span>
          <span style={{ fontSize: '0.90rem', fontWeight: 800, color: '#0d9488', filter: 'blur(3.5px)', userSelect: 'none' }}>
            {formatTierPrice(tiers.clinic, currency)}
          </span>
        </div>
      </div>

      <p style={{ margin: '4px 0 0 0', fontSize: '0.64rem', color: '#64748b', lineHeight: 1.25 }}>
        {isEs
          ? 'Tarifa reducida disponible para centros médicos, clínicas y distribuidores.'
          : 'Verified wholesale rates available for clinics, doctors and authorized wholesalers.'}
      </p>
    </div>
  );
}
