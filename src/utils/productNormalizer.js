/**
 * ════════════════════════════════════════════════════════════════════════════════
 *  UNIVERSAL PRODUCT NORMALIZER
 *  src/utils/productNormalizer.js
 * ════════════════════════════════════════════════════════════════════════════════
 */

/**
 * Strips dosage and presentation keywords from raw product names
 * while preserving compound identifiers (e.g. BPC-157, CJC-1295, TB-500, AOD-9604, NAD+).
 */
export function normalizeProductTitle(rawName) {
  if (!rawName || typeof rawName !== 'string') return 'Unnamed Product';

  let clean = rawName
    // Remove dosages like "60mg", "60 mg", "5mg/vial", "1000mcg/ml", "10 mg/ml in 5 ml"
    .replace(/(?<![A-Za-z0-9-])\d+(?:\.\d+)?\s*(?:mg|mcg|iu|g|ml)(?:\s*\/\s*(?:vial|ml|amp))?(?:\s+in\s+\d+\s*ml)?/gi, '')
    // Remove combined dosages like "5mg + 5mg", "1000mcg + 2000mcg"
    .replace(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|iu)\s*\+\s*\d+(?:\.\d+)?\s*(?:mg|mcg|iu)\b/gi, '')
    // Remove presentation terms
    .replace(/\b(vial|pre-?filled-?pen|pre-?filled\s+pen|nasal\s+spray|cartridge|capsules?|caps|sustained\s+release|ampoule|injection|lyophilized|lyophilized\s+powder)\b/gi, '')
    // Remove trailing volume specs like "5ml", "15ml", "in 5 ml vial"
    .replace(/\b(?:in\s+)?\d+\s*ml\s*(?:vial|bottle|spray)?\b/gi, '')
    // Clean up punctuation and duplicate spaces
    .replace(/[\/|,·•-]\s*$/, '')
    .replace(/^\s*[\/|,·•-]/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If cleaning emptied the string, return fallback
  if (!clean || clean.length < 2) {
    return rawName.trim();
  }

  // Proper Title Case formatting
  return clean.replace(/\b([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Extracts and formats the dosage from product fields or ID/name strings
 */
export function extractProductDosage(product) {
  if (!product) return '';
  if (product.dose && typeof product.dose === 'string' && product.dose.trim()) {
    return product.dose.trim();
  }
  if (product.dosage && typeof product.dosage === 'string' && product.dosage.trim()) {
    return product.dosage.trim();
  }
  if (product.strength && typeof product.strength === 'string' && product.strength.trim()) {
    return product.strength.trim();
  }

  const str = `${product.label || ''} ${product.source_label || ''} ${product.objectID || ''} ${product.id || ''} ${product.name || ''} ${product.sku || ''}`;
  const doseMatch = str.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|iu|g|ml)(?:\s*(?:\+|\/)\s*\d+(?:\.\d+)?\s*(?:mg|mcg|iu|g|ml))?)/i);
  return doseMatch ? doseMatch[1].trim() : '';
}

/**
 * Extracts and formats the presentation format (Vial, Pre-filled Pen, Lyophilized Vial, etc.)
 */
export function extractProductPresentation(product) {
  if (!product) return 'Vial';
  const isRaw = product.type === 'raw_material' || 
                product.productType === 'raw_material' || 
                product.productType === 'api_raw_material' ||
                product.format === 'bulk_api';

  const pres = product.presentationName || product.presentation || product.format || product.form || product.presentationType;
  if (pres && typeof pres === 'string' && pres.trim()) {
    const p = pres.trim().toLowerCase();
    if (isRaw || /bulk|granel|api/i.test(p)) return 'Bulk API Powder';
    if (/pen/i.test(p)) return 'Pre-filled Pen';
    if (/lyophilized|liofilizado/i.test(p)) return 'Lyophilized Vial';
    if (/powder/i.test(p)) return isRaw ? 'Bulk API Powder' : 'Lyophilized Vial';
    if (/nasal/i.test(p)) return 'Nasal Spray';
    if (/capsule/i.test(p)) return 'Oral Capsule';
    if (/sublingual/i.test(p)) return 'Sublingual';
    if (/cartridge/i.test(p)) return 'Refill Cartridge';
    if (/cream|topical/i.test(p)) return 'Topical Cream';
    if (/oil/i.test(p)) return 'Topical Oil';
    return isRaw ? 'Bulk API Powder' : 'Vial';
  }

  const str = `${product.objectID || ''} ${product.id || ''} ${product.name || ''} ${product.sku || ''}`.toLowerCase();
  if (isRaw || /bulk|granel|api/i.test(str)) return 'Bulk API Powder';
  if (/pre-?filled-?pen|pen/i.test(str)) return 'Pre-filled Pen';
  if (/lyophilized|liofilizado/i.test(str)) return 'Lyophilized Vial';
  if (/vial/i.test(str)) return 'Vial';
  if (/nasal/i.test(str)) return 'Nasal Spray';
  if (/capsule|oral/i.test(str)) return 'Oral Capsule';
  if (/sublingual/i.test(str)) return 'Sublingual';
  if (/cartridge/i.test(str)) return 'Refill Cartridge';
  if (/cream|topical/i.test(str)) return 'Topical Cream';
  if (/oil/i.test(str)) return 'Topical Oil';
  return isRaw ? 'Bulk API Powder' : 'Vial';
}

/**
 * Returns all available types for a product
 * @param {Object} product
 * @returns {string[]}
 */
export function getProductAvailableTypes(product) {
  if (!product) return ['finished_product'];
  if (Array.isArray(product.availableTypes) && product.availableTypes.length > 0) {
    return product.availableTypes;
  }
  const primary = product.primaryType || product.type || product.productType;
  if (primary) return [primary];
  return [inferProductType(product)];
}

/**
 * Infers primary product type with 100% backward compatibility
 * @returns {'finished_product' | 'raw_material' | 'clinical_supplies' | 'diagnostic' | 'service' | 'dual'}
 */
export function inferProductType(product) {
  if (!product) return 'finished_product';
  if (product.primaryType) return product.primaryType;
  if (product.type && product.type !== 'dual') return product.type;
  if (product.productType && product.productType !== 'dual') return product.productType;
  if (product.isHybrid || product.productType === 'dual') return 'dual';

  // Check variants if available to detect dual / multi nature
  const variants = product.variants || [];
  if (variants.length > 1) {
    let hasRaw = false;
    let hasFinished = false;

    for (const v of variants) {
      const pStr = String(v.presentation || v.presentationName || v.format || '').toLowerCase();
      const isRaw = v.unitOfMeasure === 'g' || 
                    v.unitOfMeasure === 'kg' || 
                    v.supplierPricing?.unitOfMeasure === 'g' || 
                    pStr.includes('bulk') || 
                    pStr.includes('api') || 
                    pStr.includes('powder') || 
                    v.type === 'raw_material' ||
                    (typeof v.dosage === 'string' && v.dosage.toLowerCase().includes('moq'));

      const isFin = v.unitOfMeasure === 'unit' ||
                    v.unitOfMeasure === 'kit' ||
                    pStr.includes('pen') ||
                    pStr.includes('vial') ||
                    pStr.includes('spray') ||
                    pStr.includes('capsule') ||
                    v.type === 'finished_product';

      if (isRaw) hasRaw = true;
      if (isFin && !isRaw) hasFinished = true;
    }

    if (hasRaw && hasFinished) {
      return 'dual';
    }
  }

  const str = `${product.id || ''} ${product.name || ''} ${product.category || ''} ${product.subcategory || ''} ${product.presentation || ''} ${product.format || ''}`.toLowerCase();

  if (/syringe|needle|bac water|bacteriostatic|filter|vial adapter|diluent/i.test(str)) {
    if (/bac water|bacteriostatic|diluent/i.test(str)) return 'clinical_supplies';
    return 'clinical_supplies';
  }

  if (/test|dna|saliva|blood|diagnostic|biomarker/i.test(str)) {
    return 'diagnostic';
  }

  if (/consultation|service|session/i.test(str)) {
    return 'service';
  }

  if (/api|raw material|lyophilized|liofilizado|bulk|powder|materia prima/i.test(str) || product.apiSpecs || product.molecular) {
    return 'raw_material';
  }

  return 'finished_product';
}

/**
 * Infers subcategory with safe fallback
 */
export function inferProductSubcategory(product) {
  if (!product) return 'General';
  if (product.subcategory && typeof product.subcategory === 'string' && product.subcategory.trim()) {
    return product.subcategory.trim();
  }

  const type = inferProductType(product);
  const pres = extractProductPresentation(product);
  const str = `${product.name || ''} ${product.id || ''}`.toLowerCase();

  if (type === 'dual') {
    return 'Finished & Bulk API';
  }

  if (type === 'raw_material') {
    if (/bac water|diluent|solvent|acetic/i.test(str)) return 'Reconstitution Diluents';
    if (/bulk|granel|powder/i.test(pres)) return 'Bulk API Powder';
    return 'Lyophilized Peptide APIs';
  }

  if (type === 'clinical_supplies') {
    if (/cold|thermal|pack|temp/i.test(str)) return 'Cold-Chain Storage';
    return 'Injection Accessories';
  }

  // Finished products
  if (pres === 'Pre-filled Pen') return 'Injectable Ready';
  if (pres === 'Nasal Spray') return 'Nasal Sprays';
  if (pres === 'Oral Capsule' || pres === 'Sublingual') return 'Oral & Sublingual';
  if (pres === 'Topical Cream') return 'Topical & Cosmeceutical';
  if (pres === 'Topical Oil') return 'Topical Oil';

  return 'Injectable Ready';
}

/**
 * Resolves the genuine database supplier name
 */
export function extractProductSupplier(product) {
  if (!product) return '';

  const name = product.supplierName || product.supplier || product.manufacturer || product.vendor;
  if (name && typeof name === 'string' && name.trim() && name.trim() !== '—' && name.trim() !== '-') {
    return name.trim();
  }

  const sId = product.supplierId || product.supplier_id;
  if (sId && typeof sId === 'string') {
    const sIdLower = sId.toLowerCase();
    if (sIdLower.includes('lotusland')) return 'Lotusland';
    if (sIdLower.includes('nplabs') || sIdLower.includes('np-labs') || sIdLower.includes('np_labs')) return 'NP LABS';
    if (sIdLower.includes('europeptides')) return 'Europeptides';
    if (sIdLower.includes('pod') || sIdLower.includes('poland')) return 'POD Poland';
    if (sIdLower.includes('magenta')) return 'Magenta';
    if (sIdLower.includes('fusion')) return 'Fusion';
    if (sIdLower.includes('bioniq')) return 'Bioniq';
    if (sIdLower.includes('vallida')) return 'Vallida Labs';
    if (sIdLower.includes('fagron')) return 'Fagron';
    if (sIdLower.includes('24genetics')) return '24Genetics';
    if (sIdLower.includes('eterna')) return 'Eterna Diagnostics';
  }

  return '';
}

/**
 * Universal product normalization object
 */
export function normalizeProductMeta(product) {
  if (!product) return { name: '', dosage: '', presentation: 'Vial', supplier: '', category: 'Peptide', productType: 'finished_product', subcategory: 'Injectable Ready' };

  return {
    name: normalizeProductTitle(product.name || product.productName || product.canonicalName || product.title),
    dosage: extractProductDosage(product),
    presentation: extractProductPresentation(product),
    supplier: extractProductSupplier(product),
    category: product.category || product.classification || 'Peptide',
    productType: inferProductType(product),
    subcategory: inferProductSubcategory(product),
    casNumber: product.molecular?.casNumber || product.casNumber || null,
    purity: product.apiSpecs?.purityPercentage || product.purity || (inferProductType(product) === 'raw_material' ? 99.0 : null)
  };
}
