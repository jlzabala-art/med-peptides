/**
 * strictFilterEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical, single source of truth for multi-dimensional strict variant & product filtering.
 * Enforces Golden Rule #2 (authoritative Firestore data) and eliminates cross-supplier contamination.
 */

// Known supplier manufacturing profiles & constraints
export const SUPPLIER_CONSTRAINTS = {
  lotusland: {
    allowedPresentations: ['vial', 'lyophilized vial', 'powder', 'bottle', 'bulk powder', 'tablet'],
    disallowedPresentations: ['pen', 'pre-filled pen', 'cartridge', 'refill cartridge', 'spray', 'nasal spray']
  }
};

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

  // 1. ── SOURCING & SUPPLIER FILTER (STRICT VARIANT LEVEL) ───────────────────
  const targetSupplier = filters.supplierFilter || filters.supplierId || filters.supplier;
  if (targetSupplier && targetSupplier !== 'all' && targetSupplier !== 'All') {
    const normTarget = normalizeSupplierKey(targetSupplier);
    const isLotusQuery = normTarget.includes('lotus');

    const vSupplierText = `${v.supplier || ''} ${v.supplierName || ''} ${v.supplierId || ''}`.toLowerCase();
    const pSupplierText = `${p.supplier || ''} ${p.supplierName || ''} ${p.supplierId || ''} ${(Array.isArray(p.supplierIds) ? p.supplierIds : []).join(' ')}`.toLowerCase();

    const isLotusVariant = vSupplierText.includes('lotus') || v.supplierId === 'OLlBbQjgrj6tY7GmM2Jo';
    const isLotusProduct = pSupplierText.includes('lotus') || p.supplierId === 'OLlBbQjgrj6tY7GmM2Jo' || (Array.isArray(p.supplierIds) && p.supplierIds.some(s => String(s).toLowerCase().includes('lotus')));

    const pres = String(v.presentation || v.format || '').toLowerCase();
    const vName = String(v.name || '').toLowerCase();
    const pName = String(p.canonicalName || p.name || '').toLowerCase();

    // Check specific supplier constraints
    if (isLotusQuery) {
      // Lotus Land strictly provides Vials / Lyophilized Powder / Bottles / Boxes / Kits — never Pre-filled Pens or Cartridges
      if (pres.includes('pen') || vName.includes('pen') || pres.includes('cartridge')) {
        return false;
      }
      if (v.supplier || v.supplierName || v.supplierId) {
        if (!isLotusVariant) return false;
      } else if (!isLotusProduct) {
        return false;
      }
    } else {
      // Generic supplier matching
      const vClean = vSupplierText.replace(/[^a-z0-9]/g, '');
      const pClean = pSupplierText.replace(/[^a-z0-9]/g, '');
      const targetClean = String(targetSupplier).toLowerCase().replace(/[^a-z0-9]/g, '');

      const vMatch = vClean.includes(targetClean) || vSupplierText.includes(String(targetSupplier).toLowerCase());
      const pMatch = pClean.includes(targetClean) || pSupplierText.includes(String(targetSupplier).toLowerCase());

      if (v.supplier || v.supplierName || v.supplierId) {
        if (!vMatch) return false;
      } else if (!pMatch) {
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

    if (vCatBrand) {
      if (!vCatBrand.includes(normTargetCat)) return false;
    } else if (pCatBrand) {
      if (!pCatBrand.includes(normTargetCat)) return false;
    } else {
      // Neither variant nor product has a matching catalogue brand
      return false;
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
    if (!vCat.includes(normTargetCat) && !normTargetCat.includes(vCat)) {
      return false;
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
