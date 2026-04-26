import React, { useMemo, useState, useCallback } from 'react';
import { ShoppingCart, Package, FlaskConical, Syringe, Droplets, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { trackEvent } from '../../hooks/useAnalytics';
import { resolveProductId } from '../../data/compoundIndex';

// ─────────────────────────────────────────────────────────────────────────────
// resolvePrice — tier-aware price resolver
// Falls back gracefully if the product has no price map.
// ─────────────────────────────────────────────────────────────────────────────
// Normalize a string for matching: lowercase, strip non-alphanumeric
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolvePrice(product, region = 'US', tier = 'retail') {
  if (!product) return 0;

  // ── NEW: read from defaultVariant.pricing (primary schema) ────────────────
  // Shape: defaultVariant.pricing.retailPrice  = { base: N, byCountry: {} }
  //                               .clinicPrice  = { base: N, ... }
  //                               .wholesalePrice = { base: N, ... }
  const dv = product.defaultVariant || (product.variants && product.variants[0]);
  if (dv?.pricing) {
    const tierKey =
      tier === 'clinic'    ? 'clinicPrice'
      : tier === 'wholesale' ? 'wholesalePrice'
      : 'retailPrice';
    const tierObj = dv.pricing[tierKey];
    if (tierObj != null) {
      // byCountry override if available
      const countryVal = tierObj.byCountry?.[region];
      if (countryVal != null && countryVal > 0) return countryVal;
      if (tierObj.base != null && tierObj.base > 0) return tierObj.base;
    }
    // Fallback to retailPrice.base
    const retail = dv.pricing.retailPrice;
    if (retail?.base != null && retail.base > 0) return retail.base;
    // Any numeric value in the pricing object
    for (const v of Object.values(dv.pricing)) {
      const b = typeof v === 'object' ? v?.base : v;
      if (b != null && b > 0) return b;
    }
  }

  // ── LEGACY: flat pricing map on the product doc itself ───────────────────
  const map = product.pricing || product.price_map || product.prices || {};
  if (map[region]?.[tier] != null) return map[region][tier];
  if (map[region]?.retail  != null) return map[region].retail;

  // ── Last resort: flat scalar fields (covers current Firestore schema) ────
  // Try standard generic fields first
  if (product.price      > 0) return product.price;
  if (product.base_price > 0) return product.base_price;
  if (product.unit_price > 0) return product.unit_price;

  // Firestore legacy scalar fields actually present on product docs
  if (tier === 'clinic' || tier === 'wholesale') {
    const pro = product.proVialPrice != null ? parseFloat(product.proVialPrice) : NaN;
    if (!isNaN(pro) && pro > 0) return pro;
  }
  const guest = product.guestVialPrice != null ? parseFloat(product.guestVialPrice) : NaN;
  if (!isNaN(guest) && guest > 0) return guest;
  const perVial = product.perVialPriceUSD != null ? parseFloat(product.perVialPriceUSD) : NaN;
  if (!isNaN(perVial) && perVial > 0) return perVial;

  // Check defaultVariant/variants for any of the same legacy fields
  const dv2 = product.defaultVariant || (product.variants && product.variants[0]);
  if (dv2) {
    const dvGuest = dv2.guestVialPrice != null ? parseFloat(dv2.guestVialPrice) : NaN;
    if (!isNaN(dvGuest) && dvGuest > 0) return dvGuest;
    const dvPer   = dv2.perVialPriceUSD != null ? parseFloat(dv2.perVialPriceUSD) : NaN;
    if (!isNaN(dvPer)   && dvPer   > 0) return dvPer;
  }

  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Standard accessory items appended to every protocol bundle
// ─────────────────────────────────────────────────────────────────────────────
const STANDARD_ACCESSORIES = [
  { id: 'bac_water_10ml',  label: 'Bacteriostatic Water 10 mL', qty: 1, icon: Droplets,    unitPrice: 8 },
  { id: 'insulin_syringe', label: 'Insulin Syringes 1 mL (x10)',qty: 1, icon: Syringe,     unitPrice: 12 },
  { id: 'alcohol_pads',    label: 'Alcohol Prep Pads (x50)',    qty: 1, icon: Package,      unitPrice: 6 },
];

// ─────────────────────────────────────────────────────────────────────────────
// derivePhaseSupply — returns phase-grouped supply data.
// Each phase has: { phaseTitle, durationWeeks, compounds[] }
// Each compound row has vials, unit info, and the raw product object for
// catalog price lookup. Uses vials_required from Firebase as canonical source.
// ─────────────────────────────────────────────────────────────────────────────
function derivePhaseSupply(phase_blueprints = []) {
  return phase_blueprints.map((ph, phIdx) => {
    const dur = ph.default_duration_weeks || ph.duration_weeks || 4;
    const phaseTitle = ph.phase_title || ph.name || `Phase ${phIdx + 1}`;

    // Support both `drugs_used` (new Firestore schema post-migration)
    // and legacy `drugs` field — prefer drugs_used when present.
    const drugList = ph.drugs_used || ph.drugs || [];

    const compounds = drugList.map((d, dIdx) => {
      const logic = d.dose_logic || {};
      const key   = d.productId || d.product_slug || d.product_title || `drug_${phIdx}_${dIdx}`;

      // Canonical vials from Firebase
      const canonicalVials =
        logic.vials_required != null ? Number(logic.vials_required)
        : d.vials_required   != null ? Number(d.vials_required)
        : null;

      const freq = logic.administration_frequency || 'once_weekly';
      const dosingPerWeek =
        freq.includes('daily') ? 7
        : freq.includes('twice') ? 2
        : freq.includes('three') ? 3
        : 1;

      const doseAmount = parseFloat(
        logic.starting_weekly_dose || logic.dose_per_administration || 0
      );
      const vialSize = parseFloat(d.vial_size_mg || logic.vial_strength || 5);

      let vialsNeeded;
      if (canonicalVials !== null && !isNaN(canonicalVials)) {
        vialsNeeded = canonicalVials;
      } else {
        const totalDose = doseAmount * dosingPerWeek * dur;
        vialsNeeded = totalDose > 0 ? Math.ceil(totalDose / vialSize) : 1;
      }

      return {
        key,
        label:        d.product_title || d.product_slug || key,
        slug:         d.product_slug  || key,
        // productId is the direct Firestore product doc ID — set by migration
        productId:    d.productId     || null,
        unit:         logic.dose_unit || 'mg',
        doseAmount,
        dosingPerWeek,
        vialSize,
        vialsNeeded,
        totalWeeks:   dur,
        product:      d,
      };
    });

    return { phaseTitle, durationWeeks: dur, compounds };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ProtocolSupplyEngine
// ─────────────────────────────────────────────────────────────────────────────
const ProtocolSupplyEngine = React.memo(function ProtocolSupplyEngine({
  phase_blueprints = [],
  products = [],          // full product catalog from App state
  region   = 'US',
  tier     = 'retail',    // 'retail' | 'clinic' | 'wholesale'
  updateCart,             // (items: [{id, qty, ...}]) => void
  protocolName = '',
}) {
  const [added, setAdded] = useState(false);
  const [accessories, setAccessories] = useState(
    STANDARD_ACCESSORIES.map(a => ({ ...a, checked: true }))
  );
  // All phases collapsed by default — empty Set means nothing open
  const [openPhases, setOpenPhases] = useState(new Set());
  const togglePhase = useCallback((idx) => {
    setOpenPhases(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }, []);
  // Accessories global toggle & collapsible state
  const [includeAccessories, setIncludeAccessories] = useState(true);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);

  // ── Phase-grouped supply (memoized) ──────────────────────────────────────
  const phases = useMemo(() => derivePhaseSupply(phase_blueprints), [phase_blueprints]);

  // Build a lookup map: Firestore product ID → product object
  // Also indexes by normalized product name and all variant _docId values
  // so blueprints that store only a name or a dosage-specific doc ID resolve correctly.
  const productById = useMemo(() => {
    const map = {};
    for (const p of products) {
      if (!p) continue;
      // Primary: exact Firestore doc id (e.g. 'BPC-157-2mg-vial')
      if (p.id)   map[p.id]   = p;
      // Also index by normalized name (e.g. 'bpc157', 'bpc-157')
      if (p.name) {
        const nName = norm(p.name);
        if (nName) map[nName] = p;
      }
      // Also index by each variant's _docId (sibling dosage docs)
      if (Array.isArray(p.variants)) {
        for (const v of p.variants) {
          if (v?._docId && !map[v._docId]) map[v._docId] = p;
        }
      }
    }
    return map;
  }, [products]);

  // Enrich each compound in each phase with catalog prices
  const enrichedPhases = useMemo(() => {
    return phases.map((ph) => {
      const compounds = ph.compounds.map((item) => {
        // ── STRATEGY 0: direct productId from blueprint drug entry (post-migration) ──
        // This is the fastest and most reliable path — zero slug ambiguity.
        let catalogProduct = item.productId ? productById[item.productId] : null;
        let matchedVia = catalogProduct ? 'productId' : 'none';

        // ── STRATEGY 1: canonical index lookup (deterministic, O(1)) ──────────
        if (!catalogProduct) {
          const indexedId = resolveProductId(item.slug);
          catalogProduct = indexedId ? productById[indexedId] : null;
          if (catalogProduct) matchedVia = 'index';
        }

        // ── STRATEGY 2: fuzzy fallback (normalized string matching) ───────────
        if (!catalogProduct) {
          const normSlug  = norm(item.slug);
          const normLabel = norm(item.label);
          // Fast O(1) map lookups first (productById is keyed by norm(name))
          catalogProduct = productById[normSlug] || productById[normLabel] || null;
          if (catalogProduct) { matchedVia = 'fuzzy-map'; }
        }
        if (!catalogProduct) {
          const normSlug  = norm(item.slug);
          const normLabel = norm(item.label);
          catalogProduct = products.find((p) => {
            if (!p) return false;
            const pid   = norm(p.id);
            const pname = norm(p.name);
            const pdisp = norm(p.displayName);
            return (
              pid === normSlug  ||
              pid === normLabel ||
              pname === normSlug  ||
              pname === normLabel ||
              pdisp === normSlug  ||
              pdisp === normLabel ||
              (normSlug  && pid.includes(normSlug))  ||
              (normLabel && pid.includes(normLabel))
            );
          });
          if (catalogProduct) matchedVia = 'fuzzy';
        }

        const unitPrice = catalogProduct ? resolvePrice(catalogProduct, region, tier) : 0;
        return {
          ...item,
          unitPrice,
          lineTotal: unitPrice * item.vialsNeeded,
          catalogProduct,
          _matchedVia: matchedVia,
        };
      });
      const phaseTotal = compounds.reduce((s, c) => s + c.lineTotal, 0);
      return { ...ph, compounds, phaseTotal };
    });
  }, [phases, products, productById, region, tier]);

  // Flat list of all enriched compounds (for cart payload)
  const allCompounds = useMemo(
    () => enrichedPhases.flatMap(ph => ph.compounds),
    [enrichedPhases]
  );

  // Totals
  const compoundTotal = useMemo(
    () => allCompounds.reduce((s, c) => s + c.lineTotal, 0),
    [allCompounds]
  );
  const accessoryTotal = useMemo(
    () => accessories.filter(a => a.checked).reduce((sum, a) => sum + a.unitPrice * a.qty, 0),
    [accessories]
  );
  const bundleTotal = compoundTotal + accessoryTotal;
  const hasPrices = compoundTotal > 0;

  // ── Bundle add to cart ────────────────────────────────────────────────────
  const handleLoadBundle = useCallback(() => {
    if (!updateCart) return;
    const items = [];

    allCompounds.forEach((item) => {
      if (item.catalogProduct) {
        items.push({
          // Prefer the direct productId, then catalog match, then slug
          id:       item.productId || item.catalogProduct.id || item.slug,
          slug:     item.slug,
          name:     item.label,
          qty:      item.vialsNeeded,
          price:    item.unitPrice,
          source:   'protocol_bundle',
          protocol: protocolName,
        });
      }
    });

    accessories.filter(a => a.checked).forEach((a) => {
      items.push({
        id:       a.id,
        slug:     a.id,
        name:     a.label,
        qty:      a.qty,
        price:    a.unitPrice,
        source:   'protocol_accessory',
        protocol: protocolName,
      });
    });

    updateCart(items);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);

    trackEvent('add_to_cart', {
      protocol_name: protocolName,
      items_count: items.length,
      value: bundleTotal,
      currency: 'USD',
      location: 'supply_engine',
    });
  }, [allCompounds, accessories, updateCart, protocolName, bundleTotal]);

  const toggleAccessory = (id) => {
    setAccessories(prev =>
      prev.map(a => a.id === id ? { ...a, checked: !a.checked } : a)
    );
  };

  if (!phases.length) return null;


  return (
    <>
      <style>{`
        .pse-root {
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── Tier badge ── */
        .pse-tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 0.2rem 0.55rem;
          border-radius: 20px;
          margin-bottom: 0.9rem;
        }
        .pse-tier-retail    { background: #f1f5f9; color: #475569; }
        .pse-tier-clinic    { background: #eff6ff; color: #1d4ed8; }
        .pse-tier-wholesale { background: #f0fdf4; color: #065f46; }

        /* ── Phase block accordion ── */
        .pse-phase {
          margin-bottom: 0.35rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .pse-phase-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.55rem 0.65rem;
          background: #f8fafc;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease;
          margin-bottom: 0;
        }
        .pse-phase-header:hover { background: #f1f5f9; }
        .pse-phase-header--open { background: #eff6ff; }
        .pse-phase-chevron {
          flex-shrink: 0;
          color: #94a3b8;
          transition: transform 0.22s ease;
          display: flex;
          align-items: center;
        }
        .pse-phase-chevron--open { transform: rotate(90deg); color: #003666; }
        .pse-phase-title {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #003666;
          flex: 1;
        }
        .pse-phase-badge {
          font-size: 0.58rem;
          font-weight: 700;
          color: #64748b;
          background: #e2e8f0;
          border-radius: 20px;
          padding: 0.1rem 0.45rem;
          white-space: nowrap;
        }
        .pse-phase-summary-amount {
          font-size: 0.72rem;
          font-weight: 800;
          color: #003666;
          font-family: 'JetBrains Mono', monospace;
        }
        .pse-phase-meta {
          font-size: 0.65rem;
          color: #94a3b8;
          font-weight: 500;
        }
        /* ── Accordion body ── */
        .pse-phase-body {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.28s cubic-bezier(0.4, 0, 0.2, 1),
                      padding 0.2s ease;
          padding: 0 0.65rem;
        }
        .pse-phase-body--open {
          max-height: 800px;
          padding: 0.5rem 0.65rem 0.6rem;
        }

        /* ── Cart table ── */
        .pse-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }
        .pse-table th {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 0.3rem 0.5rem;
          border-bottom: 0.5px solid #e2e8f0;
          text-align: left;
        }
        .pse-table td {
          padding: 0.5rem 0.5rem;
          border-bottom: 0.5px solid #f1f5f9;
          color: #334155;
          vertical-align: middle;
        }
        .pse-table tr:last-child td { border-bottom: none; }
        .pse-compound-name {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.78rem;
        }
        .pse-compound-meta {
          font-size: 0.63rem;
          color: #94a3b8;
          margin-top: 0.1rem;
        }
        .pse-vial-count {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 900;
          font-size: 0.9rem;
          color: #003666;
          text-align: center;
        }
        .pse-unit-price {
          font-size: 0.75rem;
          color: #64748b;
          text-align: right;
        }
        .pse-subtotal {
          font-weight: 700;
          color: #065f46;
          text-align: right;
          font-size: 0.82rem;
        }
        .pse-price-dash {
          color: #cbd5e1;
          text-align: right;
        }

        /* ── Phase subtotal row ── */
        .pse-phase-subtotal {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 0.5rem;
          padding: 0.3rem 0.5rem 0;
          margin-top: 0.1rem;
        }
        .pse-phase-subtotal-label {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 700;
        }
        .pse-phase-subtotal-amount {
          font-size: 0.8rem;
          font-weight: 800;
          color: #334155;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── Global accessories toggle ── */
        .pse-acc-global-toggle {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-top: 0.7rem;
          padding: 0.35rem 0.5rem;
          border-radius: 7px;
          background: #f8fafc;
          border: 0.5px solid #e2e8f0;
          cursor: pointer;
          user-select: none;
          transition: background 0.15s ease;
        }
        .pse-acc-global-toggle:hover { background: #f1f5f9; }
        .pse-acc-global-checkbox {
          width: 14px; height: 14px;
          border-radius: 3px;
          border: 1.5px solid #cbd5e1;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .pse-acc-global-checkbox--on { background: #003666; border-color: #003666; }
        .pse-acc-global-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.03em;
        }

        /* ── Accessories collapsible card ── */
        .pse-accessories {
          margin-top: 0.55rem;
          border-radius: 8px;
          border: 0.5px solid #e9eef5;
          background: #f8fafc;
          overflow: hidden;
        }
        .pse-accessories-header {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          width: 100%;
          padding: 0.5rem 0.7rem;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease;
        }
        .pse-accessories-header:hover { background: #f1f5f9; }
        .pse-accessories-header-label {
          flex: 1;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #94a3b8;
        }
        .pse-accessories-header-meta {
          font-size: 0.63rem;
          color: #94a3b8;
          font-weight: 500;
        }
        .pse-accessories-chevron {
          flex-shrink: 0; color: #cbd5e1;
          transition: transform 0.22s ease;
          display: flex; align-items: center;
        }
        .pse-accessories-chevron--open { transform: rotate(90deg); color: #64748b; }
        /* Collapsible body */
        .pse-accessories-body {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.24s cubic-bezier(0.4,0,0.2,1),
                      opacity 0.2s ease,
                      padding 0.2s ease;
          padding: 0 0.7rem;
        }
        .pse-accessories-body--open {
          max-height: 400px;
          opacity: 1;
          padding: 0.35rem 0.7rem 0.6rem;
        }
        /* Accessory item row */
        .pse-acc-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.28rem 0;
          cursor: pointer;
          user-select: none;
          border-bottom: 0.5px solid #f0f4f8;
        }
        .pse-acc-row:last-child { border-bottom: none; }
        .pse-acc-row:hover { opacity: 0.8; }
        .pse-acc-check {
          width: 14px; height: 14px;
          border-radius: 3px;
          border: 1.5px solid #cbd5e1;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .pse-acc-check--on { background: #003666; border-color: #003666; }
        .pse-acc-label { font-size: 0.73rem; color: #475569; flex: 1; }
        .pse-acc-price { font-size: 0.68rem; font-weight: 700; color: #94a3b8; }

        /* ── Order summary ── */
        .pse-order-summary {
          margin-top: 0.85rem;
          border-top: 1px solid #e2e8f0;
          padding-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .pse-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.77rem;
          color: #64748b;
        }
        .pse-summary-row--total {
          margin-top: 0.35rem;
          padding-top: 0.4rem;
          border-top: 0.5px solid #e2e8f0;
          font-size: 0.9rem;
          font-weight: 900;
          color: #0f172a;
        }
        .pse-summary-amount {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
        }
        .pse-summary-row--total .pse-summary-amount {
          font-size: 1.25rem;
          color: #003666;
        }

        /* ── CTA button ── */
        .pse-bundle-btn {
          margin-top: 0.9rem;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.85rem 1.2rem;
          background: linear-gradient(135deg, #003666, #0057a8);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 4px 20px rgba(0, 54, 102, 0.3);
        }
        .pse-bundle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0, 54, 102, 0.4);
        }
        .pse-bundle-btn:active { transform: translateY(0); }
        .pse-bundle-btn--success {
          background: linear-gradient(135deg, #065f46, #10b981);
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
          pointer-events: none;
        }

        /* ── No-price notice ── */
        .pse-no-price-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: #fffbeb;
          border: 0.5px solid #fde68a;
          border-radius: 8px;
          padding: 0.5rem 0.65rem;
          margin-top: 0.5rem;
          font-size: 0.7rem;
          color: #92400e;
          line-height: 1.4;
        }
      `}</style>

      <div className="pse-root">

        {/* Tier badge */}
        <span className={`pse-tier-badge pse-tier-${tier}`}>
          <Package size={10} />
          {tier === 'clinic' ? 'Clinic Pricing' : tier === 'wholesale' ? 'Wholesale' : 'Retail Pricing'}
        </span>

        {/* ── Phase-grouped compound tables (accordion) ── */}
        {enrichedPhases.map((ph, phIdx) => {
          const isOpen = openPhases.has(phIdx);
          return (
            <div key={phIdx} className="pse-phase">

              {/* Phase header — clickable toggle */}
              <button
                className={`pse-phase-header${isOpen ? ' pse-phase-header--open' : ''}`}
                onClick={() => togglePhase(phIdx)}
                aria-expanded={isOpen}
              >
                <span className={`pse-phase-chevron${isOpen ? ' pse-phase-chevron--open' : ''}`}>
                  <ChevronRight size={13} />
                </span>
                <span className="pse-phase-title">{ph.phaseTitle}</span>
                <span className="pse-phase-badge">{ph.compounds.length} compound{ph.compounds.length !== 1 ? 's' : ''} · {ph.durationWeeks}wk</span>
                {ph.phaseTotal > 0 && (
                  <span className="pse-phase-summary-amount">${ph.phaseTotal.toFixed(0)}</span>
                )}
              </button>

              {/* Accordion body */}
              <div className={`pse-phase-body${isOpen ? ' pse-phase-body--open' : ''}`}>
                <table className="pse-table">
                  <thead>
                    <tr>
                      <th>Compound</th>
                      <th style={{ textAlign: 'center' }}>Vials</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ph.compounds.map((item) => (
                      <tr key={item.key}>
                        <td>
                          <div className="pse-compound-name">{item.label}</div>
                          {item.doseAmount > 0 && (
                            <div className="pse-compound-meta">
                              {item.doseAmount}{item.unit} · {item.dosingPerWeek}×/wk
                            </div>
                          )}
                        </td>
                        <td className="pse-vial-count">{item.vialsNeeded}</td>
                        <td className="pse-unit-price">
                          {item.unitPrice > 0 ? `$${item.unitPrice.toFixed(2)}` : <span className="pse-price-dash">—</span>}
                        </td>
                        <td className="pse-subtotal">
                          {item.unitPrice > 0
                            ? `$${item.lineTotal.toFixed(0)}`
                            : <span className="pse-price-dash">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {ph.phaseTotal > 0 && (
                  <div className="pse-phase-subtotal">
                    <span className="pse-phase-subtotal-label">Phase subtotal</span>
                    <span className="pse-phase-subtotal-amount">${ph.phaseTotal.toFixed(0)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* No-price notice */}
        {allCompounds.some(i => i.unitPrice === 0) && (
          <div className="pse-no-price-notice">
            <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            Some compounds are not yet in the catalog. Vial quantities are still shown for planning.
          </div>
        )}

        {/* ── Global accessories toggle ── */}
        <div
          className="pse-acc-global-toggle"
          onClick={() => setIncludeAccessories(v => !v)}
          role="checkbox"
          aria-checked={includeAccessories}
        >
          <div className={`pse-acc-global-checkbox${includeAccessories ? ' pse-acc-global-checkbox--on' : ''}`}>
            {includeAccessories && <CheckCircle2 size={8} color="#fff" />}
          </div>
          <span className="pse-acc-global-label">Include recommended accessories</span>
        </div>

        {/* ── Accessories collapsible accordion ── */}
        {includeAccessories && (
          <div className="pse-accessories">
            {/* Header / toggle */}
            <button
              className="pse-accessories-header"
              onClick={() => setAccessoriesOpen(v => !v)}
              aria-expanded={accessoriesOpen}
            >
              <span className={`pse-accessories-chevron${accessoriesOpen ? ' pse-accessories-chevron--open' : ''}`}>
                <ChevronRight size={12} />
              </span>
              <span className="pse-accessories-header-label">Accessories (optional)</span>
              <span className="pse-accessories-header-meta">
                {accessories.length} items · ${accessoriesOpen
                  ? accessories.filter(a => a.checked).reduce((s, a) => s + a.unitPrice * a.qty, 0).toFixed(0)
                  : accessoryTotal.toFixed(0)}
              </span>
            </button>

            {/* Lazy-rendered body — only mounted when open */}
            <div className={`pse-accessories-body${accessoriesOpen ? ' pse-accessories-body--open' : ''}`}>
              {accessoriesOpen && accessories.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.id} className="pse-acc-row" onClick={() => toggleAccessory(a.id)}>
                    <div className={`pse-acc-check${a.checked ? ' pse-acc-check--on' : ''}`}>
                      {a.checked && <CheckCircle2 size={9} color="#fff" />}
                    </div>
                    <Icon size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
                    <span className="pse-acc-label">{a.label}</span>
                    <span className="pse-acc-price">${a.unitPrice} · qty {a.qty}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Order Summary ── */}
        <div className="pse-order-summary">
          <div className="pse-summary-row">
            <span>Compounds</span>
            <span className="pse-summary-amount">
              {hasPrices ? `$${compoundTotal.toFixed(0)}` : '—'}
            </span>
          </div>
          {includeAccessories && (
            <div className="pse-summary-row">
              <span>Accessories</span>
              <span className="pse-summary-amount">
                {accessoryTotal > 0 ? `$${accessoryTotal.toFixed(0)}` : '—'}
              </span>
            </div>
          )}
          <div className="pse-summary-row pse-summary-row--total">
            <span>Total</span>
            <span className="pse-summary-amount">
              {(() => {
                const total = compoundTotal + (includeAccessories ? accessoryTotal : 0);
                return total > 0 ? `$${total.toFixed(0)}` : '—';
              })()}
            </span>
          </div>
        </div>

        {/* ── Load to Cart CTA ── */}
        <button
          className={`pse-bundle-btn${added ? ' pse-bundle-btn--success' : ''}`}
          onClick={handleLoadBundle}
          disabled={!updateCart || added}
        >
          {added ? (
            <><CheckCircle2 size={17} /> Bundle Added to Cart</>
          ) : (
            <><ShoppingCart size={17} /> Load Full Cycle to Cart <ChevronRight size={14} /></>
          )}
        </button>

        {/* RUO disclaimer */}
        <p style={{
          margin: '0.6rem 0 0',
          fontSize: '0.6rem',
          color: '#94a3b8',
          lineHeight: 1.4,
          borderTop: '0.5px solid #f1f5f9',
          paddingTop: '0.5rem',
        }}>
          For Laboratory Research Use Only (RUO). Vial counts are estimates based on standard dosing
          parameters. Individual protocols may vary. Not for diagnostic or therapeutic use.
        </p>
      </div>
    </>
  );
});

export default ProtocolSupplyEngine;
