/**
 * pelletComparison.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure comparison engine for subcutaneous hormone pellets across suppliers
 * (Pharmapolis Bulgaria vs. NP LABS) keyed by `canonicalKey`.
 */

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function extractSupplierCostEur(doc) {
  const val =
    doc?.pricing?.master?.perUnit ??
    doc?.pricing?.costPriceEur ??
    doc?.costPriceEur ??
    doc?.pricing?.price_eur ??
    null;
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? round2(num) : null;
}

function isNpLabsDoc(doc) {
  const sid = String(doc?.supplierId || '').toLowerCase();
  const brand = String(doc?.brand || doc?.supplier || doc?.supplierName || '').toLowerCase();
  return sid === 'supplier-nplabs' || sid === 'supplier-nplab' || brand.includes('np lab') || brand.includes('nplab');
}

function isPharmapolisDoc(doc) {
  const sid = String(doc?.supplierId || '').toLowerCase();
  const brand = String(doc?.brand || doc?.supplier || doc?.supplierName || '').toLowerCase();
  return sid === 'supplier-pharmapolis' || brand.includes('pharmapolis');
}

/**
 * Groups pellet product documents by `canonicalKey` and compares Pharmapolis vs. NP LABS base costs.
 * @param {Array<Object>} products
 * @returns {Array<Object>}
 */
export function buildPelletComparisonRows(products = []) {
  const groups = new Map();

  for (const doc of products) {
    if (!doc) continue;
    const isPellet =
      doc.productType === 'pellet' ||
      doc.type === 'pellet' ||
      doc.isPellet === true ||
      doc.is_pellet === true;
    if (!isPellet) continue;

    // Skip multi-variant family summary docs (pharmapolis-hormone-36..40) when individual pellet docs exist
    if (Array.isArray(doc.variants) && doc.variants.length > 1) continue;

    const canonicalKey = String(doc.canonicalKey || doc.id || '')
      .replace(/^nplab-/, '')
      .trim();
    if (!canonicalKey) continue;

    if (!groups.has(canonicalKey)) {
      groups.set(canonicalKey, {
        id: canonicalKey,
        canonicalKey,
        name: doc.name?.replace(/\s*·.*$/, '') || canonicalKey,
        hormoneType: doc.hormoneType || 'hormone',
        strength: doc.strength || '',
        strengthValue: Number(doc.strengthValue) || 0,
        pharmapolis: null,
        nplabs: null,
      });
    }

    const entry = groups.get(canonicalKey);
    const costEur = extractSupplierCostEur(doc);

    if (isNpLabsDoc(doc)) {
      entry.nplabs = {
        id: doc.id,
        sku: doc.sku || doc.id,
        costEur,
        wholesaleEur: doc.pricing?.clinic?.perUnit ?? doc.pricing?.wholesalePriceEur ?? null,
      };
    } else if (isPharmapolisDoc(doc)) {
      entry.pharmapolis = {
        id: doc.id,
        sku: doc.sku || doc.id,
        costEur,
        wholesaleEur: doc.pricing?.clinic?.perUnit ?? doc.pricing?.wholesalePriceEur ?? null,
        pack10UnitEur: doc.pricing?.pack10PriceEur ? round2(doc.pricing.pack10PriceEur / 10) : null,
      };
    }
  }

  const rows = [];
  for (const entry of groups.values()) {
    const pCost = entry.pharmapolis?.costEur ?? null;
    const nCost = entry.nplabs?.costEur ?? null;

    let deltaEur = null;
    let deltaPct = null;
    let cheaperSupplier = 'single';
    let overlapStatus = 'pharmapolis_only';

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
      ...entry,
      pharmapolisCostEur: pCost,
      nplabsCostEur: nCost,
      deltaEur,
      deltaPct,
      cheaperSupplier,
      overlapStatus,
    });
  }

  return rows.sort((a, b) => {
    const hCmp = String(a.hormoneType).localeCompare(String(b.hormoneType));
    if (hCmp !== 0) return hCmp;
    return (a.strengthValue || 0) - (b.strengthValue || 0);
  });
}
