/**
 * supplierComparison.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal multi-supplier price comparison & sourcing engine for Atlas.
 *
 * Supports:
 *  1. Native `supplierOffers` map on canonical products/variants (N suppliers).
 *  2. Legacy separate-document supplier records linked by shared `canonicalKey`
 *     (or normalized productType + name + strength).
 *  3. Multi-currency normalization (EUR / USD / AED) to a common comparison base.
 */

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const DEFAULT_FX_TO_EUR = Object.freeze({
  EUR: 1,
  USD: 0.92,
  AED: 0.25,
  GBP: 1.17,
});

export function convertToEur(amount, currency = 'EUR', fxToEur = DEFAULT_FX_TO_EUR) {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return null;
  const cur = String(currency || 'EUR').toUpperCase().trim();
  const rate = Number(fxToEur?.[cur] ?? DEFAULT_FX_TO_EUR[cur] ?? 1);
  return round2(num * rate);
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/17β-|17b-/g, '')
    .replace(/\b(pellet|pellets|vial|vials|pen|pens|capsules?|cream|gel)\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function computeCanonicalKey(doc = {}) {
  if (doc.canonicalKey) {
    return String(doc.canonicalKey).replace(/^nplab-/, '').trim();
  }
  const pType = String(doc.productType || doc.type || 'product').toLowerCase().trim();
  const baseSlug = slugify(doc.canonicalName || doc.name || doc.id || '');
  const strengthSlug = slugify(doc.strength || doc.dosage || '');
  return [pType, baseSlug, strengthSlug].filter(Boolean).join(':');
}

function inferSupplierId(doc = {}) {
  if (doc.supplierId) return String(doc.supplierId).trim();
  const label = String(doc.brand || doc.supplier || doc.supplierName || '').toLowerCase();
  if (label.includes('pharmapolis')) return 'supplier-pharmapolis';
  if (label.includes('np lab') || label.includes('nplab')) return 'supplier-nplabs';
  if (label.includes('lotusland')) return 'supplier-lotusland';
  if (label.includes('fagron')) return 'supplier-fagron';
  return label ? `supplier-${slugify(label)}` : 'supplier-unknown';
}

function inferSupplierName(doc = {}, supplierId = '') {
  if (doc.brand && !doc.brand.toLowerCase().includes('atlas')) return doc.brand;
  if (doc.supplierName) return doc.supplierName;
  if (doc.supplier) return doc.supplier;
  if (supplierId === 'supplier-pharmapolis') return 'Pharmapolis';
  if (supplierId === 'supplier-nplabs' || supplierId === 'supplier-nplab') return 'NP LABS';
  if (supplierId === 'supplier-lotusland') return 'LotusLand';
  if (supplierId === 'supplier-fagron') return 'Fagron';
  return supplierId || 'Unknown Supplier';
}

function extractLegacyCost(doc = {}) {
  const candidates = [
    doc?.pricing?.master?.perUnit,
    doc?.pricing?.costPriceEur,
    doc?.costPriceEur,
    doc?.cost_tiers?.cost_1,
    doc?.cost_1,
    doc?.cost,
    doc?.pricing?.price_eur,
    doc?.unit_price,
  ];
  for (const c of candidates) {
    const num = Number(c);
    if (Number.isFinite(num) && num > 0) return round2(num);
  }
  return null;
}

/**
 * Extracts normalized supplier offers from a product or variant document.
 * Handles both `doc.supplierOffers` map and single-supplier legacy documents.
 */
export function extractNormalizedOffers(doc = {}, fxToEur = DEFAULT_FX_TO_EUR) {
  const offers = [];
  const preferredId = doc.preferredSupplierId || null;

  if (doc.supplierOffers && typeof doc.supplierOffers === 'object') {
    for (const [key, raw] of Object.entries(doc.supplierOffers)) {
      if (!raw || raw.isActive === false) continue;
      const supplierId = raw.supplierId || key;
      const currency = String(raw.currency || doc.pricing?.currency || 'EUR').toUpperCase();
      const costPrice = Number(raw.costPrice ?? raw.costEur ?? raw.perUnit ?? 0);
      if (!Number.isFinite(costPrice) || costPrice <= 0) continue;

      offers.push({
        docId: doc.id || null,
        supplierId,
        supplierName: raw.supplierName || inferSupplierName(doc, supplierId),
        sku: raw.sku || doc.sku || doc.id || '',
        costPrice: round2(costPrice),
        currency,
        costEur: convertToEur(costPrice, currency, fxToEur),
        wholesaleEur: raw.wholesaleEur ?? doc.pricing?.clinic?.perUnit ?? doc.pricing?.wholesalePriceEur ?? null,
        packPrice: raw.packPrice ?? null,
        packUnits: raw.packUnits ?? null,
        leadTimeDays: raw.leadTimeDays ?? doc.leadTimeDays ?? null,
        certification: raw.certification || (supplierId === 'supplier-pharmapolis' ? 'EU_GMP' : 'STANDARD'),
        moq: raw.moq ?? 1,
        lastUpdatedAt: raw.lastUpdatedAt || doc.updatedAt || null,
        isPreferred: Boolean(raw.isPreferred || (preferredId && preferredId === supplierId)),
        isActive: true,
      });
    }
  }

  // Fallback to legacy single-supplier fields if no supplierOffers entries were found
  if (offers.length === 0) {
    const costPrice = extractLegacyCost(doc);
    if (costPrice != null) {
      const supplierId = inferSupplierId(doc);
      const currency = String(
        doc.costCurrency || doc.pricing?.master?.currency || doc.pricing?.currency || doc.currency || 'EUR'
      ).toUpperCase();

      offers.push({
        docId: doc.id || null,
        supplierId,
        supplierName: inferSupplierName(doc, supplierId),
        sku: doc.sku || doc.id || '',
        costPrice,
        currency,
        costEur: convertToEur(costPrice, currency, fxToEur),
        wholesaleEur: doc.pricing?.clinic?.perUnit ?? doc.pricing?.wholesalePriceEur ?? null,
        packPrice: doc.pricing?.pack10PriceEur ?? null,
        packUnits: doc.pricing?.pack10PriceEur ? 10 : null,
        leadTimeDays: doc.leadTimeDays ?? null,
        certification: supplierId === 'supplier-pharmapolis' ? 'EU_GMP' : 'STANDARD',
        moq: 1,
        lastUpdatedAt: doc.updatedAt || null,
        isPreferred: Boolean(preferredId && preferredId === supplierId),
        isActive: true,
      });
    }
  }

  return offers;
}

/**
 * Selects the active supplier offer for a product/variant based on sourcing policy.
 * @param {Object} item - Product or variant containing `supplierOffers`
 * @param {Object} opts - { requireEuGmp, preferLowestCost, preferredSupplierId, fxToEur }
 */
export function resolveActiveSupplierOffer(item = {}, opts = {}) {
  const {
    requireEuGmp = false,
    preferLowestCost = false,
    preferredSupplierId = item?.preferredSupplierId || null,
    fxToEur = DEFAULT_FX_TO_EUR,
  } = opts;

  let offers = extractNormalizedOffers(item, fxToEur).filter((o) => o.costEur != null);
  if (offers.length === 0) return null;

  if (requireEuGmp) {
    const gmpOffers = offers.filter((o) => String(o.certification).toUpperCase() === 'EU_GMP');
    if (gmpOffers.length > 0) offers = gmpOffers;
  }

  if (!preferLowestCost && preferredSupplierId) {
    const preferred = offers.find((o) => o.supplierId === preferredSupplierId);
    if (preferred) return preferred;
  }

  if (!preferLowestCost) {
    const flagged = offers.find((o) => o.isPreferred);
    if (flagged) return flagged;
  }

  return [...offers].sort((a, b) => a.costEur - b.costEur)[0];
}

/**
 * Groups products by `canonicalKey` and compares all supplier offers side by side.
 */
export function buildSupplierComparisonRows(products = [], opts = {}) {
  const { fxToEur = DEFAULT_FX_TO_EUR, productTypeFilter = 'all' } = opts;
  const groups = new Map();

  for (const doc of products) {
    if (!doc) continue;

    // Skip multi-variant family summary docs when individual SKU docs exist
    if (Array.isArray(doc.variants) && doc.variants.length > 1) continue;

    const pType = String(doc.productType || doc.type || 'product').toLowerCase().trim();
    if (productTypeFilter !== 'all' && pType !== productTypeFilter) continue;

    const canonicalKey = computeCanonicalKey(doc);
    if (!canonicalKey) continue;

    const docOffers = extractNormalizedOffers(doc, fxToEur);
    if (docOffers.length === 0) continue;

    if (!groups.has(canonicalKey)) {
      groups.set(canonicalKey, {
        id: canonicalKey,
        canonicalKey,
        name: String(doc.name || canonicalKey).replace(/\s*·.*$/, '').trim(),
        productType: pType,
        category: doc.category || pType,
        hormoneType: doc.hormoneType || pType,
        strength: doc.strength || doc.dosage || '',
        strengthValue: Number(doc.strengthValue) || 0,
        preferredSupplierId: doc.preferredSupplierId || null,
        offerMap: new Map(),
        docIds: [],
      });
    }

    const group = groups.get(canonicalKey);
    if (doc.id) group.docIds.push(doc.id);
    if (doc.preferredSupplierId && !group.preferredSupplierId) {
      group.preferredSupplierId = doc.preferredSupplierId;
    }

    for (const offer of docOffers) {
      const existing = group.offerMap.get(offer.supplierId);
      if (!existing || offer.costEur < existing.costEur) {
        group.offerMap.set(offer.supplierId, offer);
      }
    }
  }

  const rows = [];
  for (const group of groups.values()) {
    const offers = Array.from(group.offerMap.values()).sort(
      (a, b) => (a.costEur ?? Infinity) - (b.costEur ?? Infinity)
    );
    const bestOffer = offers[0] || null;
    const secondBestOffer = offers[1] || null;

    let maxSpreadEur = null;
    let maxSpreadPct = null;
    if (offers.length >= 2) {
      const highest = offers[offers.length - 1];
      if (bestOffer?.costEur > 0 && highest?.costEur != null) {
        maxSpreadEur = round2(highest.costEur - bestOffer.costEur);
        maxSpreadPct = Number(((maxSpreadEur / bestOffer.costEur) * 100).toFixed(1));
      }
    }

    // Backward-compatible Pharmapolis vs NP LABS fields
    const pharmOffer = group.offerMap.get('supplier-pharmapolis') || null;
    const npOffer = group.offerMap.get('supplier-nplabs') || group.offerMap.get('supplier-nplab') || null;
    const pCost = pharmOffer?.costEur ?? null;
    const nCost = npOffer?.costEur ?? null;

    let deltaEur = null;
    let deltaPct = null;
    let cheaperSupplier = bestOffer?.supplierId?.replace(/^supplier-/, '') || 'single';
    let overlapStatus = offers.length >= 2 ? 'multi' : 'single';

    if (pCost != null && nCost != null) {
      overlapStatus = 'both';
      deltaEur = round2(pCost - nCost);
      deltaPct = nCost > 0 ? Number(((deltaEur / nCost) * 100).toFixed(1)) : 0;
      if (Math.abs(deltaEur) < 0.01) cheaperSupplier = 'tie';
      else cheaperSupplier = deltaEur < 0 ? 'pharmapolis' : 'nplabs';
    } else if (nCost != null) {
      overlapStatus = 'nplabs_only';
      cheaperSupplier = 'nplabs';
    } else if (pCost != null) {
      overlapStatus = 'pharmapolis_only';
      cheaperSupplier = 'pharmapolis';
    }

    rows.push({
      id: group.id,
      canonicalKey: group.canonicalKey,
      name: group.name,
      productType: group.productType,
      category: group.category,
      hormoneType: group.hormoneType,
      strength: group.strength,
      strengthValue: group.strengthValue,
      preferredSupplierId: group.preferredSupplierId,
      docIds: group.docIds,
      offers,
      supplierCount: offers.length,
      bestOffer,
      secondBestOffer,
      maxSpreadEur,
      maxSpreadPct,
      pharmapolis: pharmOffer,
      nplabs: npOffer,
      pharmapolisCostEur: pCost,
      nplabsCostEur: nCost,
      deltaEur,
      deltaPct,
      cheaperSupplier,
      overlapStatus,
    });
  }

  return rows.sort((a, b) => {
    if (b.supplierCount !== a.supplierCount) return b.supplierCount - a.supplierCount;
    const hCmp = String(a.hormoneType).localeCompare(String(b.hormoneType));
    if (hCmp !== 0) return hCmp;
    return (a.strengthValue || 0) - (b.strengthValue || 0);
  });
}
