/**
 * strictFilterEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical, single source of truth for multi-dimensional strict variant & product filtering.
 * Enforces Golden Rule #2 (authoritative Firestore data) and eliminates cross-supplier contamination.
 */

// Known supplier manufacturing profiles & constraints
export const SUPPLIER_CONSTRAINTS = {
  lotusland: {
    allowedPresentations: ['vial', 'lyophilized vial', 'powder', 'bottle', 'tablet', 'bulk api', 'bulk api powder', 'api'],
    disallowedPresentations: ['pen', 'pre-filled pen', 'cartridge', 'refill cartridge', 'spray', 'nasal spray']
  }
};

/**
 * Detects whether a variant or product represents Bulk API / Raw Material powder.
 */
export function isApiOrRawMaterialVariant(variant = {}, product = {}) {
  const v = variant || {};
  const p = product || {};
  const vName = String(v.name || v.dosage || v.dose || '').toLowerCase();
  const vPres = String(v.presentation || v.format || '').toLowerCase();
  const vType = String(v.type || v.productType || '').toLowerCase();
  const pName = String(p.canonicalName || p.name || '').toLowerCase();
  const pType = String(p.productType || p.primaryType || p.type || p.category || '').toLowerCase();

  // Finished presentations are strictly NEVER APIs (vials, cartridges, pens, sprays, oral capsules, bottles, boxes, kits)
  const isFinishedPres =
    vPres.includes('vial') ||
    vPres.includes('bottle') ||
    vPres.includes('cartridge') ||
    vPres.includes('pen') ||
    vPres.includes('spray') ||
    vPres.includes('nasal') ||
    vPres.includes('capsule') ||
    vPres.includes('tablet') ||
    vPres.includes('kit') ||
    vPres.includes('box') ||
    vName.includes('vial') ||
    vName.includes('cartridge') ||
    vName.includes('pen') ||
    vName.includes('capsule');

  if (isFinishedPres) {
    return false;
  }

  return (
    v.isApi === true ||
    vType === 'raw_material' ||
    vType === 'api_raw_material' ||
    vType === 'api' ||
    vPres.includes('bulk api') ||
    vPres.includes('bulk powder') ||
    vPres === 'api' ||
    vPres.includes('bulk api powder') ||
    vName.includes('bulk api') ||
    vName.includes('(bulk api)') ||
    pType === 'raw_material' ||
    pType === 'api_raw_material' ||
    pName.includes('(bulk api)') ||
    p.category === 'raw_material'
  );
}

/**
 * Normalizes supplier identifier/slug
 */
export function normalizeSupplierKey(supplierStr = '') {
  if (!supplierStr) return '';
  const s = String(supplierStr).toLowerCase().trim();
  return s.replace(/^supplier-/, '').replace(/[\s_]+/g, '-');
}

/**
 * Evaluates whether a specific variant strictly matches the given active filters.
 *
 * @param {Object} variant - Variant document or presentation object
 * @param {Object} product - Parent product document
 * @param {Object} filters - Active filter criteria:
 *   - supplierId / supplierFilter: string (e.g. 'supplier-lotusland', 'lotusland')
 *   - productType / productTypeFilter: string (e.g. 'peptide', 'raw_material', 'finished_product')
 *   - category / categoryFilter: string
 *   - onlyInStock: boolean
 *   - presentation: string
 *   - priceSource / priceTier: string
 * @returns {boolean}
 */
export function isVariantMatchingFilter(variant = {}, product = {}, filters = {}) {
  if (!variant && !product) return false;

  const v = variant || {};
  const p = product || {};

  // Global Check: Exclude Bulk APIs unless explicitly requesting an API or raw material catalog
  const isExplicitApiCatalog = 
    filters.catalogueFilter === 'raw_material' ||
    filters.catalogueFilter === 'api' ||
    filters.categoryFilter === 'raw_material' ||
    filters.category === 'raw_material' ||
    filters.productTypeFilter === 'raw_material' ||
    filters.productType === 'raw_material' ||
    filters.includeRawMaterials === true ||
    filters.includeApis === true;

  const isApi = isApiOrRawMaterialVariant(v, p);

  // If requesting raw materials/APIs, strictly reject finished goods/vials
  if (isExplicitApiCatalog && !isApi) {
    return false;
  }
  // If requesting standard/finished catalog, strictly reject raw materials/APIs
  if (!isExplicitApiCatalog && isApi) {
    return false;
  }

  // 1. ── SOURCING & SUPPLIER FILTER (STRICT VARIANT LEVEL) ───────────────────
  const targetSupplier = filters.supplierFilter || filters.supplierId || filters.supplier || filters.supplierIds;
  if (targetSupplier && targetSupplier !== 'all' && targetSupplier !== 'All') {
    const rawList = Array.isArray(targetSupplier)
      ? targetSupplier
      : String(targetSupplier).split(',');
    const supplierList = rawList
      .map(s => normalizeSupplierKey(s))
      .filter(Boolean);

    if (supplierList.length > 0) {
      const vSupplierText = `${v.supplier || ''} ${v.supplierName || ''} ${v.supplierId || ''}`.toLowerCase();
      const pSupplierText = `${p.supplier || ''} ${p.supplierName || ''} ${p.supplierId || ''} ${(Array.isArray(p.supplierIds) ? p.supplierIds : []).join(' ')}`.toLowerCase();
      const pres = String(v.presentation || v.format || '').toLowerCase();
      const vName = String(v.name || '').toLowerCase();

      // Check if variant matches ANY of the target suppliers under their specific constraints
      const matchesAnySupplier = supplierList.some(normTarget => {
        const isLotusQuery = normTarget.includes('lotus');
        if (isLotusQuery) {
          const isLotusVariant = vSupplierText.includes('lotus') || v.supplierId === 'OLlBbQjgrj6tY7GmM2Jo';
          const isLotusProduct = pSupplierText.includes('lotus') || p.supplierId === 'OLlBbQjgrj6tY7GmM2Jo' || (Array.isArray(p.supplierIds) && p.supplierIds.some(s => String(s).toLowerCase().includes('lotus')));

          // Lotus Land strictly provides Vials / Lyophilized Powder / Bottles / Boxes / Kits / Bulk APIs — never Pre-filled Pens or Cartridges
          if (pres.includes('pen') || vName.includes('pen') || pres.includes('cartridge')) {
            return false;
          }
          // Only exclude bulk APIs if this is NOT an explicit API catalog
          if (!isExplicitApiCatalog && (pres.includes('bulk api') || vName.includes('bulk api'))) {
            return false;
          }
          if (v.supplier || v.supplierName || v.supplierId) {
            return isLotusVariant;
          }
          return isLotusProduct;
        }

        // Generic supplier matching (e.g. magenta)
        const vClean = vSupplierText.replace(/[^a-z0-9]/g, '');
        const pClean = pSupplierText.replace(/[^a-z0-9]/g, '');
        const targetClean = String(normTarget).toLowerCase().replace(/[^a-z0-9]/g, '');

        const vMatch = vClean.includes(targetClean) || vSupplierText.includes(normTarget);
        const pMatch = pClean.includes(targetClean) || pSupplierText.includes(normTarget);

        if (v.supplier || v.supplierName || v.supplierId) {
          return vMatch;
        }
        return pMatch;
      });

      if (!matchesAnySupplier) {
        return false;
      }
    }
  }

  // 1.1 ── CATALOGUE / SOURCE FILTER (e.g. RegenPept) ─────────────────────────
  const targetCatalogue = filters.catalogueFilter || filters.sourceCatalogue || filters.catalogBrand;
  if (targetCatalogue && targetCatalogue !== 'all' && targetCatalogue !== 'All') {
    const normTargetCat = String(targetCatalogue).toLowerCase().trim();
    const vCatBrand = String(v.catalogBrand || v.sourceCatalogue || v.source_catalogue || '').toLowerCase().trim();
    const pCatBrand = String(p.catalogBrand || p.sourceCatalogue || p.source_catalogue || '').toLowerCase().trim();

    const isPeptide = String(p.category || '').toLowerCase().includes('peptide') ||
                      p.productType === 'peptide' ||
                      p.type === 'peptide' ||
                      p.primaryType === 'peptide';

    if (vCatBrand) {
      if (normTargetCat === 'magenta-peptides') {
        if (!vCatBrand.includes('magenta') || !isPeptide) return false;
      } else if (normTargetCat === 'magenta-compounding') {
        if (!vCatBrand.includes('magenta') || isPeptide) return false;
      } else if (!vCatBrand.includes(normTargetCat)) {
        const isLotusEquiv = (normTargetCat === 'regenpept' && vCatBrand.includes('lotusland')) ||
                             (normTargetCat === 'lotusland' && vCatBrand.includes('regenpept'));
        if (!isLotusEquiv) return false;
      }
    } else if (pCatBrand) {
      if (normTargetCat === 'magenta-peptides') {
        if (!pCatBrand.includes('magenta') || !isPeptide) return false;
      } else if (normTargetCat === 'magenta-compounding') {
        if (!pCatBrand.includes('magenta') || isPeptide) return false;
      } else if (!pCatBrand.includes(normTargetCat)) {
        const isLotusEquiv = (normTargetCat === 'regenpept' && pCatBrand.includes('lotusland')) ||
                             (normTargetCat === 'lotusland' && pCatBrand.includes('regenpept'));
        if (!isLotusEquiv) return false;
      }
    } else {
      // Neither variant nor product has an explicit catalogue brand
      const vSupplierStr = String(v.supplier || v.supplierName || v.supplierId || p.supplierId || (Array.isArray(p.supplierIds) ? p.supplierIds.join(' ') : '')).toLowerCase();
      const isLotus = vSupplierStr.includes('lotus');
      const isMagenta = vSupplierStr.includes('magenta');
      const isLarimedical = vSupplierStr.includes('larimedical');
      const isEuropeptides = vSupplierStr.includes('europeptides');

      if ((normTargetCat === 'regenpept' || normTargetCat === 'lotusland') && isLotus) {
        // Accept Lotusland as RegenPept
      } else if (normTargetCat === 'magenta-peptides') {
        if (!isMagenta || !isPeptide) return false;
      } else if (normTargetCat === 'magenta-compounding') {
        if (!isMagenta || isPeptide) return false;
      } else if (normTargetCat.includes('magenta') && isMagenta) {
        // Accept Magenta
      } else if (normTargetCat.includes('larimedical') && isLarimedical) {
        // Accept Larimedical
      } else if (normTargetCat.includes('europeptides') && isEuropeptides) {
        // Accept EuroPeptides
      } else if (vSupplierStr.includes(normTargetCat)) {
        // Generic match on supplier string
      } else {
        return false;
      }
    }
  }

  // 2. ── PRODUCT TYPE / SCOPE FILTER ─────────────────────────────────────────
  const targetProductType = filters.productTypeFilter || filters.productType || filters.type;
  if (targetProductType && targetProductType !== 'all' && targetProductType !== 'All') {
    const rawVType = v.type || v.productType || p.primaryType || p.productType || 'finished_product';
    const normVType = rawVType === 'api_raw_material' ? 'raw_material' : rawVType;
    if (normVType !== targetProductType && rawVType !== targetProductType) {
      return false;
    }
  }

  // 3. ── CATEGORY FILTER ────────────────────────────────────────────────────
  const targetCategory = filters.categoryFilter || filters.category;
  if (targetCategory && targetCategory !== 'all' && targetCategory !== 'All' && targetCategory !== 'All Categories') {
    const normTargetCat = String(targetCategory).toLowerCase().trim().replace(/s$/, '');
    const vCat = String(v.category || p.category || p.categoryId || '').toLowerCase().trim().replace(/s$/, '');

    if (normTargetCat === 'raw_material' || normTargetCat === 'api') {
      if (!isApi) {
        return false;
      }
    } else if (normTargetCat === 'peptide') {
      if (isApi) {
        return false;
      }
      if (!vCat.includes('peptide') && !normTargetCat.includes(vCat)) {
        return false;
      }
    } else {
      if (!vCat.includes(normTargetCat) && !normTargetCat.includes(vCat)) {
        return false;
      }
    }
  }

  // 4. ── PRESENTATION / FORMAT FILTER ───────────────────────────────────────
  const targetPresentation = filters.presentationFilter || filters.presentation;
  if (targetPresentation && targetPresentation !== 'all' && targetPresentation !== 'All') {
    const normTargetPres = String(targetPresentation).toLowerCase();
    const vPres = String(v.presentation || v.format || p.format || '').toLowerCase();
    if (!vPres.includes(normTargetPres)) {
      return false;
    }
  }

  // 5. ── STOCK & AVAILABILITY FILTER ────────────────────────────────────────
  if (filters.onlyInStock) {
    const isOutOfStock =
      v.inStock === false ||
      p.inStock === false ||
      v.outOfStock === true ||
      p.outOfStock === true ||
      v.status === 'out_of_stock' ||
      p.status === 'out_of_stock' ||
      (v.stock !== undefined && v.stock !== null && Number(v.stock) === 0);

    if (isOutOfStock) return false;
  }

  return true;
}

/**
 * Filters a product's variants strictly. If no variants match, returns an empty array.
 *
 * @param {Object} product - Product with variants array
 * @param {Object} filters - Active filter criteria
 * @returns {Array} List of matching variants
 */
export function filterProductVariantsStrictly(product = {}, filters = {}) {
  if (!product) return [];
  const rawVariants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : (Array.isArray(product.presentations) && product.presentations.length > 0 ? product.presentations : [product]);

  return rawVariants.filter(v => isVariantMatchingFilter(v, product, filters));
}

/**
 * Sanitizes strings for PDF WinAnsi / ASCII compatibility.
 * Replaces Greek letters, non-breaking spaces, and mathematical symbols to prevent encoding crashes.
 */
export function sanitizePdfText(str = '') {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/α/g, 'alpha')
    .replace(/Α/g, 'Alpha')
    .replace(/β/g, 'beta')
    .replace(/Β/g, 'Beta')
    .replace(/γ/g, 'gamma')
    .replace(/Γ/g, 'Gamma')
    .replace(/δ/g, 'delta')
    .replace(/Δ/g, 'Delta')
    .replace(/ε/g, 'epsilon')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/±/g, '+/-')
    .replace(/·/g, '-')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/‘/g, "'")
    .replace(/’/g, "'")
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x00-\x7F]/g, c => {
      // Fallback for remaining non-ASCII characters
      return '';
    });
}
