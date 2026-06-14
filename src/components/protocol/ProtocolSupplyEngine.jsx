import Package from "lucide-react/dist/esm/icons/package";
import Syringe from "lucide-react/dist/esm/icons/syringe";
import Droplets from "lucide-react/dist/esm/icons/droplets";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Info from "lucide-react/dist/esm/icons/info";
import Activity from "lucide-react/dist/esm/icons/activity";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Zap from "lucide-react/dist/esm/icons/zap";
import History from "lucide-react/dist/esm/icons/history";
/* eslint-disable no-undef, no-unused-vars */
import React, { useMemo, useState, useCallback } from 'react';












import { getPeptidePK } from '../../data/peptidePharmacokinetics';
import BottomSheet from '../shared/BottomSheet';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent, trackPurchaseIntent } from '../../hooks/useAnalytics';
import { resolveProductId } from '../../data/compoundIndex';
import { resolveProductPrice } from '../../utils/resolveProductPrice';
import { parseFrequencyToInjectionsPerWeek } from '../../utils/dosageUtils';
import { derivePhaseSupply, buildSupplyManifest, ACCESSORY_DEFS } from '../../utils/supplyMath';

// ── Number Ticker (Smooth counting animation) ───────────────────────────────────
const NumberTicker = ({ value, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  React.useEffect(() => {
    const duration = 300; // ms
    const frames = 20;
    const step = (value - displayValue) / frames;
    if (Math.abs(step) < 0.5) { setDisplayValue(value); return; }
    let current = displayValue;
    const interval = setInterval(() => {
      current += step;
      if ((step > 0 && current >= value) || (step < 0 && current <= value)) {
        current = value;
        clearInterval(interval);
      }
      setDisplayValue(current);
    }, duration / frames);
    return () => clearInterval(interval);
  }, [value]);
  return <span>{prefix}{Math.round(displayValue)}{suffix}</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Normalize a string for matching: lowercase, strip non-alphanumeric
// ─────────────────────────────────────────────────────────────────────────────
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// Price resolution — Data Model 2.0 compliant
// All pricing goes through the global resolveProductPrice() resolver.
// Direct field access (retailPrice, wholesalePrice, priceUSD …) is forbidden.
// ─────────────────────────────────────────────────────────────────────────────

// ACCESSORY_DEFS imported from supplyMath

// derivePhaseSupply moved to supplyMath.js

// ─────────────────────────────────────────────────────────────────────────────
// ExplainerContent — Shared Math & PK logic
// ─────────────────────────────────────────────────────────────────────────────
const ExplainerContent = ({ compound, pkData }) => {
  const {
    label,
    unit,
    doseAmount,
    maxDose,
    dosingPerWeek,
    vialSize,
    vialsNeeded,
    reconstitutionMl,
    totalWeeks,
    pkOptimized,
    pkReason
  } = compound;

  const weeklyDose = maxDose && maxDose > doseAmount ? (doseAmount + maxDose) / 2 : (doseAmount * (dosingPerWeek || 1));
  const totalRequirement = weeklyDose * totalWeeks;

  return (
    <div className="pse-explainer-content">
      {/* PK Header Section */}
      <div className="pse-explainer-section pse-explainer-section--pk">
        <div className="pse-tooltip-header">
          <Activity size={12} />
          <span>Pharmacokinetics</span>
        </div>
        <div className="pse-pk-grid">
          <div className="pse-pk-item">
            <span className="pse-pk-label">Half-Life</span>
            <span className="pse-pk-value">{pkData?.halfLife || 'Unknown'}</span>
          </div>
          {pkOptimized && (
            <div className="pse-pk-item pse-pk-item--optimized">
              <Zap size={10} className="pse-zap-icon" />
              <span>Sci-Optimized</span>
            </div>
          )}
        </div>
        {pkData?.notes && (
          <p className="pse-tooltip-note">
            {pkData.notes}
          </p>
        )}
        {pkOptimized && pkReason && (
          <p className="pse-pk-optimization-note">
            <strong>Adjustment:</strong> {pkReason}
          </p>
        )}
      </div>

      {/* Math Section */}
      <div className="pse-explainer-section">
        <div className="pse-tooltip-header">
          <FlaskConical size={12} />
          <span>Procurement Math</span>
        </div>
        <div className="pse-tooltip-row">
          <span>Weekly Dose</span>
          <span className="mono">{weeklyDose.toFixed(2)} {unit}</span>
        </div>
        <div className="pse-tooltip-row">
          <span>Protocol Duration</span>
          <span className="mono">{totalWeeks} Weeks</span>
        </div>
        <div className="pse-tooltip-row">
          <span>Total Requirement</span>
          <span className="mono">{totalRequirement.toFixed(1)} {unit}</span>
        </div>
        <div className="pse-tooltip-row pse-tooltip-row--highlight">
          <span>Vials (@{vialSize}mg)</span>
          <span className="mono">{vialsNeeded} Vial{vialsNeeded > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Reconstitution Section */}
      {reconstitutionMl > 0 && (
        <div className="pse-explainer-section pse-explainer-section--recon">
          <div className="pse-tooltip-header">
            <Droplets size={12} />
            <span>Reconstitution</span>
          </div>
          <div className="pse-tooltip-row">
            <span>BAC Water / Vial</span>
            <span className="mono">{reconstitutionMl} mL</span>
          </div>
          <p className="pse-tooltip-note">
            Mixing {vialSize}mg with {reconstitutionMl}mL yields <span className="mono">{(vialSize / (reconstitutionMl * 10)).toFixed(2)}mg</span> per 10-unit (0.1mL) mark.
          </p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VialExplainer — Responsive Premium Tooltip
// ─────────────────────────────────────────────────────────────────────────────
const VialExplainer = React.memo(({ compound }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const pkData = useMemo(() => getPeptidePK(compound.slug), [compound.slug]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  if (isMobile) {
    return (
      <>
        <div className="pse-explainer-root" onClick={handleToggle}>
          <Info size={13} className="pse-info-icon" />
        </div>
        <BottomSheet
          isOpen={isVisible}
          onClose={() => setIsVisible(false)}
          title={`${compound.label} Calculation`}
        >
          <div className="pse-mobile-explainer-wrapper">
            <ExplainerContent compound={compound} pkData={pkData} />
          </div>
        </BottomSheet>
      </>
    );
  }

  return (
    <div
      className="pse-explainer-root"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible); }}
    >
      <Info size={13} className="pse-info-icon" />

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="pse-tooltip"
          >
            <ExplainerContent compound={compound} pkData={pkData} />
            <div className="pse-tooltip-arrow" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// buildSupplyManifest moved to supplyMath.js

// ─────────────────────────────────────────────────────────────────────────────
// ProtocolSupplyEngine
// ─────────────────────────────────────────────────────────────────────────────
const ProtocolSupplyEngine = React.memo(function ProtocolSupplyEngine({
  phases: canonicalPhases = [], // New canonical v3 prop
  phase_blueprints = [],       // Legacy fallback
  products = [],          // full product catalog from App state
  region   = 'US',
  tier     = 'retail',    // 'retail' | 'clinic' | 'wholesale'
  updateCart,             // (items: [{id, qty, ...}]) => void
  protocolName = '',
  protocolGoal  = '',     // optional short description shown in cart bundle card
  dailyDose = null,       // from useDailyDose hook — clinic/global dose overrides
  onTotalChange,          // Callback to report the live total to parent
}) {
  const [added, setAdded] = useState(false);
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
  const [includeAccessories, setIncludeAccessories] = useState(false);
  const [accessoriesOpen, setAccessoriesOpen] = useState(false);
  // Procurement table open/closed (default collapsed)
  const [procurementOpen, setProcurementOpen] = useState(false);
  // Local tier override — lets user switch Retail/Clinic/Wholesale inline
  const [localTier, setLocalTier] = useState(tier);
  // Sync if parent prop changes
  const prevTierRef = React.useRef(tier);
  // React 18: removed ref check during render in favor of useEffect
  React.useEffect(() => {
    setLocalTier(tier);
  }, [tier]);

  // ── Living Calculator: Duration Scale ──
  const [durationScale, setDurationScale] = useState(1);
  const handleDurationIncrease = useCallback((e) => {
    e.stopPropagation();
    setDurationScale(prev => Math.min(prev + 0.5, 3)); // Max x3
  }, []);
  const handleDurationDecrease = useCallback((e) => {
    e.stopPropagation();
    setDurationScale(prev => Math.max(prev - 0.5, 0.5)); // Min x0.5
  }, []);

  // ── Phase-grouped supply (memoized) ──────────────────────────────────────
  const enginePhases = useMemo(() => {
    if (canonicalPhases && canonicalPhases.length > 0) {
      // Map canonical v3 phases to the internal engine format
      return canonicalPhases.map(ph => ({
        phaseTitle: ph.phase_name,
        durationWeeks: ph.end_week - ph.start_week + 1,
        compounds: ph.compounds.map(c => ({
          key: c.peptide_id,
          label: c.name,
          slug: c.product_slug || c.peptide_id,
          productId: c.productId || c.peptide_id,
          unit: c.schedule?.[0]?.dose?.unit || 'mg',
          doseAmount: c.schedule?.[0]?.dose?.amount || 0,
          dosingPerWeek: 1, // Placeholder, engine uses vialsNeeded mostly
          vialSize: c.vial_max_capacity_mg || 10,
          vialsNeeded: c.procurement?.vialCount || 1,
          reconstitutionMl: c.reconstitution_volume_ml || 2,
          totalWeeks: ph.end_week - ph.start_week + 1,
          product: c, // Pass back original for price resolution
        }))
      }));
    }
    return derivePhaseSupply(phase_blueprints, dailyDose);
  }, [canonicalPhases, phase_blueprints, dailyDose]);

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
    return enginePhases.map((ph) => {
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

        const scaledDurationWeeks = Math.max(1, Math.round(ph.durationWeeks * durationScale));
        const scaledVialsNeeded = Math.max(1, Math.ceil((item.vialsNeeded / (ph.durationWeeks || 1)) * scaledDurationWeeks));

        const unitPrice = catalogProduct
          ? (resolveProductPrice(catalogProduct, { tier: localTier, countryCode: region }).amount ?? 0)
          : 0;
        return {
          ...item,
          unitPrice,
          vialsNeeded: scaledVialsNeeded, // Scaled for live calculator
          lineTotal: unitPrice * scaledVialsNeeded,
          catalogProduct,
          _matchedVia: matchedVia,
        };
      });
      const phaseTotal = compounds.reduce((s, c) => s + c.lineTotal, 0);
      return { ...ph, durationWeeks: Math.max(1, Math.round(ph.durationWeeks * durationScale)), compounds, phaseTotal };
    });
  }, [enginePhases, products, productById, region, localTier, durationScale]);

  // Flat list of all enriched compounds (for cart payload)
  const allCompounds = useMemo(
    () => enrichedPhases.flatMap(ph => ph.compounds),
    [enrichedPhases]
  );

  // ── Supply manifest (deduplicated, with dynamic accessory qty) ────────────
  const manifest = useMemo(() => buildSupplyManifest(enrichedPhases), [enrichedPhases]);

  // Accessories state — driven by manifest quantities, user can toggle each
  const [accessories, setAccessories] = useState(() =>
    manifest.accessories.map(a => ({ ...a, checked: true }))
  );
  // Re-sync accessory quantities when manifest accessories change (avoiding object reference loops)
  const manifestAccessoriesKey = JSON.stringify(manifest.accessories.map(a => ({ id: a.id, qty: a.qty })));
  const prevAccessoriesKeyRef = React.useRef(manifestAccessoriesKey);
  // React 18: removed ref check during render in favor of useEffect
  React.useEffect(() => {
    setAccessories(prev =>
      manifest.accessories.map(a => {
        const existing = prev.find(p => p.id === a.id);
        return { ...a, checked: existing ? existing.checked : true };
      })
    );
  }, [manifestAccessoriesKey, manifest.accessories]);

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

  // Report live total to parent component for sticky bar
  React.useEffect(() => {
    if (onTotalChange) {
      const currentTotal = manifest.totals.compounds + (includeAccessories ? accessoryTotal : 0);
      onTotalChange(currentTotal);
    }
  }, [manifest.totals.compounds, accessoryTotal, includeAccessories, onTotalChange]);

  // ── Bundle add to cart ────────────────────────────────────────────────────
  // NOTE: executeAddToCart is inlined inside useCallback to avoid stale closures.
  // All mutable state (allCompounds, accessories, includeAccessories, totals) must
  // be listed in deps so the cart payload always reflects the current UI state.
  const handleLoadBundle = useCallback((forceIncludeAccessories) => {
    if (!updateCart) return;

    const incAcc = forceIncludeAccessories !== undefined
      ? Boolean(forceIncludeAccessories)
      : includeAccessories;

    const currentTotal = compoundTotal + (incAcc ? accessoryTotal : 0);
    const aggregatedCompounds = [];

    allCompounds.forEach((item) => {
      const productId = item.productId || item.catalogProduct?.id || item.slug;
      const normalizedLabel = (item.label || '').trim().toLowerCase();

      const existing = aggregatedCompounds.find(x =>
        (productId && x.id === productId) ||
        (x.label?.toLowerCase() === normalizedLabel)
      );

      if (existing) {
        existing.qty += (item.vialsNeeded || 1);
      } else {
        aggregatedCompounds.push({
          id:          productId,
          slug:        item.slug,
          label:       item.label,
          qty:         item.vialsNeeded || 1,
          price:       item.unitPrice || 0,
          source:      'protocol_bundle',
          protocol:    protocolName,
          isAccessory: false,
        });
      }
    });

    if (incAcc) {
      accessories.filter(a => a.checked).forEach((a) => {
        aggregatedCompounds.push({
          id:          a.id,
          slug:        a.id,
          label:       a.label,
          qty:         a.qty,
          price:       a.unitPrice,
          source:      'protocol_accessory',
          protocol:    protocolName,
          isAccessory: true,
        });
      });
    }

    const items = aggregatedCompounds;

    // Wrap in a bundle object for integrated price support in Cart.jsx
    updateCart({
      items,
      bundle: {
        id:          protocolName.toLowerCase().replace(/\s+/g, '-'),
        name:        protocolName,
        goal:        protocolGoal || undefined,
        bundleTotal: currentTotal,
        phases:      enrichedPhases.length,
        products:    items.map(p => ({
          productId:   p.id,
          label:       p.label || p.name,
          name:        p.label || p.name,
          qty:         p.qty,
          price:       p.price,
          isAccessory: p.isAccessory || p.source === 'protocol_accessory',
        })),
      },
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);

    trackEvent('add_to_cart', {
      protocol_name: protocolName,
      items_count:   items.length,
      value:         currentTotal,
      currency:      'USD',
      location:      'supply_engine',
    });

    trackPurchaseIntent({
      peptide_name: `Bundle: ${protocolName}`,
      protocol_id:  protocolName,
      value:        currentTotal,
      currency:     'USD',
    });
  }, [
    updateCart,
    includeAccessories,
    allCompounds,
    accessories,
    compoundTotal,
    accessoryTotal,
    enrichedPhases.length,
    protocolName,
    protocolGoal,
  ]);

  const toggleAccessory = (id) => {
    setAccessories(prev =>
      prev.map(a => a.id === id ? { ...a, checked: !a.checked } : a)
    );
  };

  if (!enginePhases.length) return null;


  return (
    <>
      <style>{`
        .pse-root {
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          gap: 0;
          padding-bottom: 90px;
        }
        @media (min-width: 769px) {
          .pse-root { padding-bottom: 0; }
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
        .pse-sticky-bottom-bar {
          position: sticky;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 1rem;
          margin: 1rem -1rem -1rem -1rem;
          border-top: 1px solid var(--color-border);
          border-radius: 0 0 12px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 10;
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.03);
          gap: 1rem;
        }
        .pse-sticky-total {
          display: flex;
          flex-direction: column;
        }
        .pse-sticky-label {
          font-size: 0.7rem;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .pse-sticky-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        .pse-bundle-btn {
          flex: 1;
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
        .pse-accessory-recommendation {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #eff6ff;
          border: 0.5px solid #bfdbfe;
          border-radius: 8px;
          padding: 0.65rem 0.75rem;
          margin-top: 1rem;
          font-size: 0.72rem;
          color: #1e40af;
          line-height: 1.4;
        }
        .pse-accessory-recommendation button {
          background: #1d4ed8;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
          font-size: 0.65rem;
          font-weight: 700;
          cursor: pointer;
          margin-left: auto;
          white-space: nowrap;
        }
        .pse-accessory-recommendation button:hover { background: #1e40af; }

        /* ── Procurement Table ── */
        .pse-procurement {
          margin-bottom: 0.75rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 12px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          transition: box-shadow 0.3s ease;
        }
        .pse-procurement:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
        }
        .pse-procurement-header-row {
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #003666 0%, #004d99 100%);
          gap: 0;
        }
        .pse-procurement-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.6rem 0.75rem;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          color: #fff;
        }
        /* ── Tier pill switcher ── */
        .pse-tier-pills {
          display: flex;
          gap: 0.25rem;
          padding: 0.45rem 0.6rem;
          flex-shrink: 0;
        }
        .pse-tier-pill {
          padding: 0.2rem 0.5rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.35);
          background: transparent;
          color: rgba(255,255,255,0.7);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .pse-tier-pill:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .pse-tier-pill--active {
          background: rgba(255,255,255,0.92);
          color: #003666;
          border-color: transparent;
        }
        .pse-procurement-header-title {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          flex: 1;
          color: rgba(255,255,255,0.92);
        }
        .pse-procurement-header-meta {
          font-size: 0.62rem;
          color: rgba(255,255,255,0.65);
          font-weight: 500;
        }
        .pse-procurement-chevron {
          flex-shrink: 0;
          color: rgba(255,255,255,0.6);
          transition: transform 0.22s ease;
          display: flex;
          align-items: center;
        }
        .pse-procurement-chevron--open { transform: rotate(90deg); color: rgba(255,255,255,0.9); }
        .pse-procurement-body {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .pse-procurement-body--open { max-height: 1200px; }
        .pse-ptable {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
        }
        .pse-ptable th {
          font-size: 0.58rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 0.4rem 0.6rem;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
          text-align: left;
          white-space: nowrap;
        }
        .pse-ptable th:not(:first-child) { text-align: center; }
        .pse-ptable td {
          padding: 0.45rem 0.6rem;
          border-bottom: 0.5px solid #f1f5f9;
          color: #334155;
          vertical-align: middle;
        }
        .pse-ptable tr:last-child td { border-bottom: none; }
        .pse-ptable td:not(:first-child) { text-align: center; }
        .pse-pt-name {
          font-weight: 700;
          color: #0f172a;
          font-size: 0.75rem;
          white-space: nowrap;
        }
        .pse-pt-meta {
          font-size: 0.6rem;
          color: #94a3b8;
          margin-top: 0.1rem;
        }
        .pse-pt-vials {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 900;
          font-size: 0.9rem;
          color: #003666;
        }
        .pse-pt-water {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          color: #0369a1;
          font-weight: 700;
        }
        .pse-pt-water--none { color: #cbd5e1; }
        .pse-pt-unit {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
        }
        .pse-pt-total {
          font-weight: 800;
          color: #065f46;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
        }
        .pse-pt-total--none { color: #cbd5e1; }
        /* ── Procurement Footer Receipt ── */
        .pse-procurement-footer-receipt {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          align-items: center;
          padding: 0.65rem 1rem;
          background: linear-gradient(135deg, #0a1628 0%, #003666 100%);
          border-top: 1px solid rgba(255,255,255,0.08);
          gap: 0;
        }
        .pse-pfr-col {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          padding: 0 0.5rem;
        }
        .pse-pfr-col--total {
          align-items: flex-end;
        }
        .pse-pfr-divider {
          width: 1px;
          height: 2.5rem;
          background: rgba(255,255,255,0.12);
          flex-shrink: 0;
        }
        .pse-pfr-label {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.58rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.5);
        }
        .pse-pfr-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.1;
        }
        .pse-pfr-value--grand {
          font-size: 1.2rem;
          color: #34d399;
          font-weight: 800;
        }
        .pse-pfr-sub {
          font-size: 0.55rem;
          color: rgba(255,255,255,0.35);
          font-weight: 500;
        }
        .pse-pfr-sub--tier {
          color: rgba(52, 211, 153, 0.7);
          font-weight: 600;
        }

        /* ── VialExplainer Content Styles ── */
        .pse-explainer-content {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .pse-explainer-section {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding-bottom: 0.6rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .pse-explainer-section:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }
        .pse-pk-grid {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.2rem;
        }
        .pse-pk-item {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.3rem 0.5rem;
          border-radius: 6px;
          flex: 1;
        }
        .pse-pk-label {
          font-size: 0.55rem;
          text-transform: uppercase;
          color: #94a3b8;
          font-weight: 700;
        }
        .pse-pk-value {
          font-size: 0.65rem;
          font-weight: 600;
          color: #f8fafc;
        }
        .pse-pk-item--optimized {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
          flex-direction: row;
          align-items: center;
          gap: 0.3rem;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
        }
        .pse-zap-icon {
          color: #10b981;
        }
        .pse-pk-optimization-note {
          font-size: 0.6rem;
          color: #34d399;
          margin-top: 0.3rem;
          line-height: 1.3;
        }
        .pse-pk-optimization-note strong {
          font-weight: 800;
        }
        .mono {
          font-family: 'JetBrains Mono', monospace;
        }
        .pse-mobile-explainer-wrapper {
          padding: 0 1rem 1rem;
          color: #0f172a;
        }
        .pse-mobile-explainer-wrapper .pse-explainer-section {
          border-bottom: 1px solid #e2e8f0;
        }
        .pse-mobile-explainer-wrapper .pse-tooltip-header {
          color: #475569;
        }
        .pse-mobile-explainer-wrapper .pse-pk-item {
          background: #f1f5f9;
        }
        .pse-mobile-explainer-wrapper .pse-pk-label {
          color: #64748b;
        }
        .pse-mobile-explainer-wrapper .pse-pk-value {
          color: #0f172a;
        }
        .pse-mobile-explainer-wrapper .pse-tooltip-row span:first-child {
          color: #475569;
        }
        .pse-mobile-explainer-wrapper .pse-tooltip-row span:last-child {
          color: #0f172a;
        }
        .pse-mobile-explainer-wrapper .pse-tooltip-row--highlight span:last-child {
          color: #059669;
        }
        .pse-mobile-explainer-wrapper .pse-tooltip-note {
          color: #64748b;
          border-left-color: #3b82f6;
        }
        .pse-mobile-explainer-wrapper .pse-pk-optimization-note {
          color: #059669;
        }

        /* ── VialExplainer Styles ── */
        .pse-explainer-root {
          position: relative;
          display: inline-flex;
          align-items: center;
          margin-left: 0.35rem;
          vertical-align: middle;
          cursor: help;
        }
        .pse-info-icon {
          color: #94a3b8;
          transition: color 0.15s ease;
        }
        .pse-explainer-root:hover .pse-info-icon {
          color: #003666;
        }
        .pse-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 12px;
          width: 240px;
          padding: 1rem;
          background: #1e293b;
          color: #f8fafc;
          border-radius: 12px;
          font-size: 0.7rem;
          line-height: 1.4;
          z-index: 10000;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
          pointer-events: none;
          text-align: left;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .pse-tooltip-header {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
          font-size: 0.6rem;
        }
        .pse-tooltip-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .pse-tooltip-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .pse-tooltip-row span:first-child {
          color: #94a3b8;
        }
        .pse-tooltip-row span:last-child {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
        }
        .pse-tooltip-row--highlight span:last-child {
          color: #34d399;
          font-weight: 800;
        }
        .pse-tooltip-note {
          margin-top: 0.4rem;
          font-size: 0.62rem;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
          border-left: 2px solid #003666;
          padding-left: 0.5rem;
        }
        .pse-tooltip-arrow {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 7px solid #1e293b;
        }
        .pse-sticky-footer {
          position: sticky;
          bottom: 0;
          background: #fff;
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
          z-index: 50;
        }
      `}</style>

      <div className="pse-body">
        {/* ── Interactive Duration Slider ── */}
        <div className="pse-duration-slider-container" style={{ padding: '0.5rem 0 1.5rem 0', borderBottom: '1px solid var(--color-border)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Protocol Duration</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brand)' }}>{durationScale === 1 ? 'Standard (4 Weeks)' : durationScale === 2 ? 'Extended (8 Weeks)' : durationScale === 3 ? 'Max (12 Weeks)' : `${durationScale * 4} Weeks`}</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="1" 
            value={durationScale} 
            onChange={(e) => setDurationScale(parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: 'var(--color-brand)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>
            <span>4 wks</span>
            <span>8 wks</span>
            <span>12 wks</span>
          </div>
        </div>

        {/* ── Items (Compounds/Phases) ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
          <span className={`pse-tier-badge pse-tier-${tier}`} style={{ marginBottom: 0 }}>
            <Package size={10} />
            {tier === 'clinic' ? 'Clinic Pricing' : tier === 'wholesale' ? 'Wholesale' : 'Retail Pricing'}
          </span>
          {/* Duration Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--color-bg-app)',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '0.2rem',
            gap: '0.4rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <button 
              onClick={handleDurationDecrease}
              disabled={durationScale <= 0.5}
              style={{
                width: '24px', height: '24px', borderRadius: '50%', border: 'none', 
                background: durationScale <= 0.5 ? 'transparent' : 'var(--color-bg-surface)',
                color: durationScale <= 0.5 ? 'var(--color-border)' : 'var(--color-text-secondary)',
                cursor: durationScale <= 0.5 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: durationScale <= 0.5 ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1, marginTop: '-2px' }}>-</span>
            </button>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0f172a', width: '38px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
              {durationScale === 1 ? '1x' : `${durationScale}x`}
            </span>
            <button 
              onClick={handleDurationIncrease}
              disabled={durationScale >= 3}
              style={{
                width: '24px', height: '24px', borderRadius: '50%', border: 'none', 
                background: durationScale >= 3 ? 'transparent' : 'var(--color-bg-surface)',
                color: durationScale >= 3 ? 'var(--color-border)' : 'var(--color-text-secondary)',
                cursor: durationScale >= 3 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: durationScale >= 3 ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1, marginTop: '-1px' }}>+</span>
            </button>
          </div>
        </div>

        {/* ── Procurement Summary Table ── */}
        {manifest.compounds.length > 0 && (
          <div className="pse-procurement">
            <div className="pse-procurement-header-row">
              <button
                className="pse-procurement-header"
                onClick={() => setProcurementOpen(v => !v)}
                aria-expanded={procurementOpen}
                style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', color: 'var(--color-bg-surface)', textAlign: 'left' }}
              >
                <span className={`pse-procurement-chevron${procurementOpen ? ' pse-procurement-chevron--open' : ''}`}>
                  <ChevronRight size={13} />
                </span>
                <span className="pse-procurement-header-title">Estimated Procurement</span>
                <span className="pse-procurement-header-meta">
                  {manifest.compounds.length} compound{manifest.compounds.length !== 1 ? 's' : ''}
                  {manifest.totals.grand > 0 && <span> · <NumberTicker value={manifest.totals.grand} prefix="$" /></span>}
                </span>
              </button>
              {/* Tier pills */}
              <div className="pse-tier-pills" onClick={e => e.stopPropagation()}>
                {(['retail', 'clinic', 'wholesale']).map(t => (
                  <button
                    key={t}
                    className={`pse-tier-pill${localTier === t ? ' pse-tier-pill--active' : ''}`}
                    onClick={() => setLocalTier(t)}
                  >
                    {t === 'retail' ? 'Retail' : t === 'clinic' ? 'Clinic' : 'Wholesale'}
                  </button>
                ))}
              </div>
            </div>

            <div className={`pse-procurement-body${procurementOpen ? ' pse-procurement-body--open' : ''}`}>
              <table className="pse-ptable">
                <thead>
                  <tr>
                    <th>Compound</th>
                    <th>Vials</th>
                    <th>BAC Water</th>
                    <th>Unit $</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {manifest.compounds.map((c) => (
                    <tr key={c.key}>
                      <td>
                        <div className="pse-pt-name">{c.label}</div>
                        {c.vialSizeMg > 0 && (
                          <div className="pse-pt-meta">{c.vialSizeMg} mg/vial · {c.dosingUnit}</div>
                        )}
                      </td>
                      <td className="pse-pt-vials">
                        {c.totalVials}
                        <VialExplainer compound={{
                          ...c,
                          vialSize: c.vialSizeMg,
                          unit: c.dosingUnit,
                          vialsNeeded: c.totalVials,
                          // Placeholder average weekly dose if not present in manifest
                          // In manifest we don't have per-week detail, but we can pass it
                          // if we enrich the manifest. For now we use what's there.
                          totalWeeks: enrichedPhases.reduce((sum, p) => sum + p.durationWeeks, 0)
                        }} />
                      </td>
                      <td>
                        {c.totalBacWaterMl > 0 ? (
                          <span className="pse-pt-water">{c.totalBacWaterMl} mL</span>
                        ) : (
                          <span className="pse-pt-water pse-pt-water--none">—</span>
                        )}
                      </td>
                      <td>
                        {c.unitPrice > 0 ? (
                          <span className="pse-pt-unit">${c.unitPrice.toFixed(2)}</span>
                        ) : (
                          <span className="pse-pt-total pse-pt-total--none">—</span>
                        )}
                      </td>
                      <td>
                        {c.lineTotal > 0 ? (
                          <span className="pse-pt-total">${c.lineTotal.toFixed(0)}</span>
                        ) : (
                          <span className="pse-pt-total pse-pt-total--none">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer: 3-column clinical receipt */}
              <div className="pse-procurement-footer-receipt">
                <div className="pse-pfr-col">
                  <span className="pse-pfr-label">
                    <Package size={11} /> Compounds
                  </span>
                  <span className="pse-pfr-value">
                    {manifest.totals.compounds > 0 ? `$${manifest.totals.compounds.toFixed(0)}` : '—'}
                  </span>
                  <span className="pse-pfr-sub">{manifest.compounds.length} items</span>
                </div>
                <div className="pse-pfr-divider" />
                <div className="pse-pfr-col">
                  <span className="pse-pfr-label">
                    <Droplets size={11} /> Accessories
                  </span>
                  <span className="pse-pfr-value">
                    {includeAccessories && accessoryTotal > 0 ? `$${accessoryTotal.toFixed(0)}` : '—'}
                  </span>
                  <span className="pse-pfr-sub">
                    {includeAccessories ? `${accessories.filter(a => a.checked).length} selected` : 'not included'}
                  </span>
                </div>
                <div className="pse-pfr-divider" />
                <div className="pse-pfr-col pse-pfr-col--total">
                  <span className="pse-pfr-label">
                    Estimated Total
                  </span>
                  <span className="pse-pfr-value pse-pfr-value--grand">
                    {(() => {
                      const total = manifest.totals.compounds + (includeAccessories ? accessoryTotal : 0);
                      return total > 0 ? <NumberTicker value={total} prefix="$" /> : '—';
                    })()}
                  </span>
                  <span className="pse-pfr-sub pse-pfr-sub--tier">
                    {localTier.charAt(0).toUpperCase() + localTier.slice(1)} pricing
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                          <div className="pse-compound-meta">
                            {item.doseAmount > 0 ? (
                              <>
                                {item.maxDose && item.maxDose !== item.doseAmount
                                  ? `${item.doseAmount} – ${item.maxDose}`
                                  : item.doseAmount}
                                {item.unit}
                              </>
                            ) : item.intensity ? (
                              <>{item.intensity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</>
                            ) : null}
                            {/* Frequency — always visible */}
                            {item.doseAmount > 0 || item.intensity ? ' · ' : ''}
                            <span style={{ whiteSpace: 'nowrap' }}>{item.dosingPerWeek}×/wk</span>
                          </div>
                        </td>
                        <td className="pse-vial-count">
                          {item.vialsNeeded}
                          <VialExplainer compound={item} />
                        </td>
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
            {includeAccessories && <CheckCircle2 size={8} color="var(--color-bg-surface)" />}
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
                      {a.checked && <CheckCircle2 size={9} color="var(--color-bg-surface)" />}
                    </div>
                    <Icon size={12} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
                    <span className="pse-acc-label">{a.label}</span>
                    <span className="pse-acc-price">${a.unitPrice} · qty {a.qty}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* ── Add to Cart CTA (Sticky on Mobile) ── */}
        <div className="pse-sticky-bottom-bar">
          <div className="pse-sticky-total">
            <span className="pse-sticky-label">Total Cost</span>
            <span className="pse-sticky-value">${grandTotal.toFixed(0)}</span>
          </div>
          <button
            className={`pse-bundle-btn pse-add-btn${added ? ' pse-bundle-btn--success' : ''}`}
            onClick={() => handleLoadBundle()}
            disabled={added}
            style={{
              background: added ? 'var(--color-success)' : 'linear-gradient(135deg, #003666 0%, #005aac 100%)',
              boxShadow: '0 4px 15px rgba(0,54,102,0.2)',
            }}
          >
            {added ? (
              <><CheckCircle2 size={18} /> Added to Order</>
            ) : (
              <><ShoppingCart size={18} /> Add Protocol Bundle to Order</>
            )}
          </button>
        </div>

        {/* RUO micro-note */}
        <p style={{
          margin: '0.6rem 0 0',
          fontSize: '0.6rem',
          color: 'var(--color-text-tertiary)',
          lineHeight: 1.4,
          borderTop: '0.5px solid #f1f5f9',
          paddingTop: '0.5rem',
        }}>
          Vial counts are estimates. Individual protocols may vary.
        </p>
      </div>
    </>
  );
});

export default ProtocolSupplyEngine;