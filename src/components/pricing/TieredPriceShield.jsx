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

  // Direct costPriceEur, costPrice or cost (e.g. from Compounding / TrichoTest / Peptides / Colway registry)
  if (typeof product.costPriceEur === 'number' && product.costPriceEur > 0) {
    landedCost = product.costPriceEur;
  } else if (typeof product.costPrice === 'number' && product.costPrice > 0) {
    landedCost = product.costPrice;
  } else if (typeof product.cost === 'number' && product.cost > 0) {
    landedCost = product.cost;
  }

  // Direct explicit Firestore tier fields on product or primary variant
  const v0 = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants[0] : null;
  if (!landedCost && typeof v0?.costPrice === 'number' && v0.costPrice > 0) {
    landedCost = v0.costPrice;
  }
  if (typeof product.wholesalePrice === 'number' && product.wholesalePrice > 0) {
    wholesalePrice = product.wholesalePrice;
  } else if (typeof v0?.wholesalePrice === 'number' && v0.wholesalePrice > 0) {
    wholesalePrice = v0.wholesalePrice;
  }
  if (typeof product.clinicPrice === 'number' && product.clinicPrice > 0) {
    clinicPrice = product.clinicPrice;
  } else if (typeof v0?.clinicPrice === 'number' && v0.clinicPrice > 0) {
    clinicPrice = v0.clinicPrice;
  }
  if (typeof product.retailPrice === 'number' && product.retailPrice > 0) {
    retailPrice = product.retailPrice;
  } else if (typeof v0?.retailPrice === 'number' && v0.retailPrice > 0) {
    retailPrice = v0.retailPrice;
  }

  // Direct pricing object in Firestore schema
  if (product.pricing && typeof product.pricing === 'object') {
    if (typeof product.pricing.supplierCost === 'number' && product.pricing.supplierCost > 0) landedCost = product.pricing.supplierCost;
    if (typeof product.pricing.wholesale === 'number' && product.pricing.wholesale > 0) wholesalePrice = product.pricing.wholesale;
    if (typeof product.pricing.clinic === 'number' && product.pricing.clinic > 0) clinicPrice = product.pricing.clinic;
    if (typeof product.pricing.retail === 'number' && product.pricing.retail > 0) retailPrice = product.pricing.retail;
  }

  // Authoritative Bloodo™ Capillary Biomarker Kits (matches Firestore products collection: Wholeseller = Cost + 15% + 15%)
  if (
    id.includes('bloodo') ||
    id === 'cortisol-test' ||
    id === 'hemoglobin-a1c-hba1c-test' ||
    id === 'omega-ratio-test' ||
    id === 'testosterone-test' ||
    id === 'vitamin-d-test'
  ) {
    if (id.includes('nad')) {
      landedCost = 199.00;
      wholesalePrice = 263.18; // 199.00 * 1.15 * 1.15
      clinicPrice = 288.55;
      retailPrice = 298.50;
    } else if (id.includes('testosterone') || id.includes('testosterona')) {
      landedCost = 49.50;
      wholesalePrice = 65.46;  // 49.50 * 1.15 * 1.15
      clinicPrice = 74.25;
      retailPrice = 99.00;
    } else if (id.includes('cortisol')) {
      landedCost = 39.50;
      wholesalePrice = 52.24;  // 39.50 * 1.15 * 1.15
      clinicPrice = 59.25;
      retailPrice = 79.00;
    } else if (id.includes('hba1c') || id.includes('hemoglobin')) {
      landedCost = 29.50;
      wholesalePrice = 39.01;  // 29.50 * 1.15 * 1.15
      clinicPrice = 44.25;
      retailPrice = 59.00;
    } else if (id.includes('omega')) {
      landedCost = 39.50;
      wholesalePrice = 52.24;  // 39.50 * 1.15 * 1.15
      clinicPrice = 59.25;
      retailPrice = 79.00;
    } else if (id.includes('vitamin-d') || id.includes('vitd') || id.includes('vit-d')) {
      landedCost = 29.50;
      wholesalePrice = 39.01;  // 29.50 * 1.15 * 1.15
      clinicPrice = 44.25;
      retailPrice = 59.00;
    }
    return {
      cost: landedCost,
      wholesaler: wholesalePrice,
      clinic: clinicPrice,
      retail: retailPrice,
      isCompounded: false,
      isBloodo: true
    };
  }

  // Cost-Plus Rule: When cost price is registered:
  // - Wholeseller: +20% over cost (cost * 1.20)
  // - Clinic / Doctor: +30% over cost (cost * 1.30) unless explicit clinicPrice exists
  if (landedCost && landedCost > 0) {
    if (!wholesalePrice) wholesalePrice = Math.round(landedCost * 1.20 * 100) / 100;
    if (!clinicPrice) clinicPrice = Math.round(landedCost * 1.30 * 100) / 100;
    if (!retailPrice) {
      retailPrice = (typeof product.priceEur === 'number' && product.priceEur > clinicPrice)
        ? product.priceEur
        : (typeof product.price === 'number' && product.price > clinicPrice)
        ? product.price
        : Math.round(landedCost * 1.60 * 100) / 100;
    }

    return {
      cost: landedCost,
      wholesaler: wholesalePrice,
      clinic: clinicPrice,
      retail: retailPrice,
      isCompounded: Boolean(product.isCompounded)
    };
  }

  if (typeof product.priceEur === 'number' && product.priceEur > 0) {
    clinicPrice = product.priceEur;
  }

  // Direct EUR / base price overrides
  if (!clinicPrice) {
    if (typeof product.price === 'number' && product.price > 0) {
      clinicPrice = product.price;
    } else if (typeof product.originalPrice === 'number' && product.originalPrice > 0) {
      clinicPrice = product.originalPrice;
    } else {
      const id = (product.id || product.slug || product.canonicalId || product.name || '').toLowerCase();
      
      // 1. Bloodo™ Capillary Biomarker Panels (Capillary DBS LC-MS/MS — Wholeseller: Cost + 15% + 15%)
      if (id.includes('nad') || id.includes('bloodo-nad')) {
        clinicPrice = 288.55;
        wholesalePrice = 263.18;
        retailPrice = 298.50;
        landedCost = 199.00;
      } else if (id.includes('testosterone') || id.includes('testosterona')) {
        clinicPrice = 74.25;
        wholesalePrice = 65.46;
        retailPrice = 99.00;
        landedCost = 49.50;
      } else if (id.includes('cortisol')) {
        clinicPrice = 59.25;
        wholesalePrice = 52.24;
        retailPrice = 79.00;
        landedCost = 39.50;
      } else if (id.includes('hba1c') || id.includes('hemoglobin') || id.includes('glucose') || id.includes('glicacion')) {
        clinicPrice = 44.25;
        wholesalePrice = 39.01;
        retailPrice = 59.00;
        landedCost = 29.50;
      } else if (id.includes('omega') || id.includes('lipid')) {
        clinicPrice = 59.25;
        wholesalePrice = 52.24;
        retailPrice = 79.00;
        landedCost = 39.50;
      } else if (id.includes('vitamin-d') || id.includes('vitd') || id.includes('vit-d')) {
        clinicPrice = 44.25;
        wholesalePrice = 39.01;
        retailPrice = 59.00;
        landedCost = 29.50;
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
      else if (id.includes('colvita')) {
        clinicPrice = capsCount === 120 ? 56.00 : 31.00;
        wholesalePrice = capsCount === 120 ? 46.00 : 25.00;
        retailPrice = capsCount === 120 ? 112.00 : 64.00;
      }
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

export function normalizeRoleTierKey(rawRoleOrTier) {
  if (!rawRoleOrTier) return null;
  const r = String(rawRoleOrTier).toLowerCase().trim();
  if (r === 'cost' || r === 'b2b-dir' || r === 'master') return 'cost';
  if (r.includes('whole') || r === 'supplier' || r === 'distributor') return 'wholesaler';
  if (r.includes('clinic') || r.includes('doctor') || r === 'b2b' || r === 'practitioner' || r === 'fagron_clinic' || r === 'compounding_pharmacy' || r === 'medical_director') return 'clinic';
  if (r.includes('retail') || r.includes('patient') || r === 'public' || r === 'guest') return 'retail';
  return null;
}

export default function TieredPriceShield({
  product,
  currency = 'EUR',
  onUnlockRequest,
  compact = false,
  isEs = false,
  adminSimulationTier = null,
  onSelectAdminSimulationTier = null,
  onResolvedRoleChange = null,
  embedded = false,
  capsCount = 60
}) {
  const { user } = useAuth();
  const { is } = useRoleAccess();
  const [localPreview, setLocalPreview] = React.useState(null);
  const [catalogContext, setCatalogContext] = React.useState(null);
  const [urlContext, setUrlContext] = React.useState(null);
  const [liveSyncedContext, setLiveSyncedContext] = React.useState(null);
  const [syncedCurrency, setSyncedCurrency] = React.useState(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedCur = localStorage.getItem('atlas_portal_currency');
      if (storedCur && ['EUR', 'USD', 'AED'].includes(storedCur.toUpperCase())) {
        setSyncedCurrency(storedCur.toUpperCase());
      }
    } catch (_) {}

    const handleCurrencyEvent = (e) => {
      const nextCur = e?.detail;
      if (nextCur && ['EUR', 'USD', 'AED'].includes(String(nextCur).toUpperCase())) {
        setSyncedCurrency(String(nextCur).toUpperCase());
      }
    };
    window.addEventListener('atlas-currency-changed', handleCurrencyEvent);
    return () => window.removeEventListener('atlas-currency-changed', handleCurrencyEvent);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedPreview = localStorage.getItem('atlas_b2b_verified_preview');
      if (storedPreview) setLocalPreview(JSON.parse(storedPreview));
    } catch (_) {}

    let parsedCatCtx = null;
    try {
      const storedCat = localStorage.getItem('atlas_shared_catalog_context');
      if (storedCat) {
        parsedCatCtx = JSON.parse(storedCat);
        setCatalogContext(parsedCatCtx);
      }
    } catch (_) {}

    let parsedUrlCtx = null;
    try {
      const sp = new URLSearchParams(window.location.search);
      const uTier = sp.get('tier') || sp.get('priceSource') || sp.get('role');
      const uCat = sp.get('cat') || sp.get('catalogId');
      const uMarkup = sp.get('markup');
      const uCur = sp.get('cur') || sp.get('currency');
      if (uTier || uCat || uMarkup || uCur) {
        parsedUrlCtx = {
          tier: normalizeRoleTierKey(uTier),
          catalogId: uCat || '',
          markupPercent: uMarkup ? Number(uMarkup) : 0,
          currency: uCur ? uCur.toUpperCase() : null
        };
        setUrlContext(parsedUrlCtx);
      }
    } catch (_) {}

    // Live check with Firebase so if the user registers or their role/pricingChannel changes, we display the updated role price
    const targetCat = parsedUrlCtx?.catalogId || parsedCatCtx?.catalogId || '';
    const targetUid = user?.uid || parsedCatCtx?.recipientUserId || '';
    const targetEmail = user?.email || parsedCatCtx?.recipientEmail || '';

    if (targetCat || targetUid || targetEmail) {
      const q = new URLSearchParams();
      if (targetCat) q.set('cat', targetCat);
      if (targetUid) q.set('uid', targetUid);
      if (targetEmail) q.set('email', targetEmail);
      fetch(`/api/catalog/context-tier?${q.toString()}`)
        .then(r => r.json())
        .then(data => {
          if (data && data.ok && data.tier) {
            setLiveSyncedContext(data);
          }
        })
        .catch(() => {});
    }
  }, [user?.uid, user?.email]);

  const tiers = useMemo(() => resolveProductTierPricing(product, capsCount), [product, capsCount]);

  // Determine user authorization & role hierarchy
  const isAdmin = is('admin') || is('medical_director') || (localPreview?.role === 'admin');
  const authChannelTier = normalizeRoleTierKey(user?.pricingChannel || user?.priceTier || user?.role);
  const isWholesaler = authChannelTier === 'wholesaler' || is('wholesaler') || is('supplier') || is('distributor');
  const isDoctor = authChannelTier === 'clinic' || is('doctor') || is('clinic') || is('fagron_clinic') || is('compounding_pharmacy');
  const isPatient = authChannelTier === 'retail' || is('patient');

  // Resolve exclusive single role tier to display:
  // 1. Admin simulation selector (when Admin explicitly clicks a tier pill)
  // 2. Live Firebase user / catalog recipient role (auto-updates if conditions change in Firebase)
  // 3. Authenticated user's Firebase role/pricingChannel
  // 4. Shared catalog URL parameter (?tier=...) or persisted shared catalog context
  // 5. Verified B2B preview
  // 6. Default visitor role without login ('wholesaler' — shows Wholeseller price = Cost + 15% + 15%)
  let activeTierKey = 'wholesaler';
  if (isAdmin && adminSimulationTier) {
    activeTierKey = adminSimulationTier;
  } else if (liveSyncedContext?.tier) {
    activeTierKey = liveSyncedContext.tier;
  } else if (user) {
    if (isWholesaler && !isAdmin) activeTierKey = 'wholesaler';
    else if (isDoctor && !isAdmin) activeTierKey = 'clinic';
    else if (isPatient && !isAdmin) activeTierKey = 'retail';
    else if (isAdmin) activeTierKey = 'wholesaler';
  } else if (urlContext?.tier) {
    activeTierKey = urlContext.tier;
  } else if (catalogContext?.priceSource) {
    activeTierKey = normalizeRoleTierKey(catalogContext.priceSource) || 'wholesaler';
  } else if (localPreview?.role) {
    activeTierKey = normalizeRoleTierKey(localPreview.role) || 'wholesaler';
  }

  const markupPercent = Number(
    liveSyncedContext?.markupPercent ??
    urlContext?.markupPercent ??
    catalogContext?.priceMarkupPercent ??
    0
  );
  // Bloodo™ wholesaler tier already includes the full +15% over cost + 15% margin, so never double-apply markupFactor
  const markupFactor = (!user && markupPercent > 0 && !tiers?.isBloodo && activeTierKey === 'cost')
    ? (1 + markupPercent / 100)
    : 1;
  const effectiveCurrency = syncedCurrency || urlContext?.currency || currency || 'EUR';

  const currentAmountRaw = tiers ? (tiers[activeTierKey] ?? tiers.wholesaler ?? tiers.clinic ?? 0) : 0;
  const currentAmount = Math.round(currentAmountRaw * markupFactor * 100) / 100;

  React.useEffect(() => {
    if (typeof onResolvedRoleChange === 'function' && currentAmount > 0) {
      onResolvedRoleChange({
        tierKey: activeTierKey,
        unitPrice: currentAmount,
        currency: effectiveCurrency
      });
    }
  }, [activeTierKey, currentAmount, effectiveCurrency, onResolvedRoleChange]);

  if (!tiers || (!tiers.clinic && !tiers.wholesaler && !tiers.retail)) {
    return null;
  }

  const tierMeta = {
    cost: {
      label: isEs ? 'COSTE DE ORIGEN (EXW)' : 'LANDED COST (EXW)',
      badge: isEs ? 'Coste Interno' : 'Internal Cost',
      badgeBg: '#fef2f2',
      badgeColor: '#dc2626',
      badgeBorder: '#fee2e2',
      incoterm: 'EXW',
      amount: Math.round((tiers.cost || 0) * markupFactor * 100) / 100
    },
    wholesaler: {
      label: isEs ? 'TARIFA MAYORISTA B2B (EXW)' : 'WHOLESALE B2B TIER (EXW)',
      badge: isAdmin ? (isEs ? 'Mayorista (+15%+15%)' : 'Wholesaler (+15%+15%)') : (isEs ? 'Mayorista B2B' : 'Wholesale B2B'),
      badgeBg: '#fff7ed',
      badgeColor: '#c2410c',
      badgeBorder: '#ffedd5',
      incoterm: 'Wholesale EXW',
      amount: Math.round((tiers.wholesaler || 0) * markupFactor * 100) / 100
    },
    clinic: {
      label: isEs ? 'TARIFA CLÍNICA / MÉDICO' : 'CLINICAL / PRACTITIONER TIER',
      badge: isAdmin ? (isEs ? 'Clínica / Médico (+35%)' : 'Clinic / Doctor') : (isEs ? 'Clínica / Médico' : 'Clinical B2B'),
      badgeBg: '#f0fdfa',
      badgeColor: '#0d9488',
      badgeBorder: '#ccfbf1',
      incoterm: 'Clinical B2B',
      amount: Math.round((tiers.clinic || 0) * markupFactor * 100) / 100
    },
    retail: {
      label: isEs ? 'TARIFA OFICIAL (PVP)' : 'OFFICIAL UNIT PRICE (RRP)',
      badge: isEs ? 'PVP Oficial' : 'Official RRP',
      badgeBg: '#f5f3ff',
      badgeColor: '#7c3aed',
      badgeBorder: '#ede9fe',
      incoterm: isEs ? 'PVP Final' : 'Unit Price',
      amount: Math.round((tiers.retail || 0) * markupFactor * 100) / 100
    }
  };

  const currentTier = tierMeta[activeTierKey] || tierMeta.retail;
  const formattedPrice = formatTierPrice(currentTier.amount, effectiveCurrency);

  // ── CASE 1: COMPACT LIST VIEW ──
  if (compact) {
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

  // ── CASE 2: SINGLE ROLE-SPECIFIC PRICE CARD VIEW ──
  return (
    <div style={{
      marginBottom: embedded ? '6px' : '0.65rem',
      padding: embedded ? '8px 10px' : '8px 12px',
      borderRadius: '8px',
      background: embedded ? '#ffffff' : '#f8fafc',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease'
    }}>
      {/* Top Header: Role Tier Label + Role Badge */}
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
          {activeTierKey === 'wholesaler' && <Sparkles size={12} color="#c2410c" />}
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

      {/* Exclusive Role Price Display */}
      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
          <span style={{ fontSize: '1.22rem', fontWeight: 850, color: '#0f172a', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
            {formattedPrice}
          </span>
          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
            {isEs ? '/ kit completo' : '/ complete kit'}
          </span>
        </div>

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
