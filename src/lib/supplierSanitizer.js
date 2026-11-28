const SUPPLIER_TEXT_REGEX = /\b(lotusland(\s+limited)?|lotus\s*land|pharmapolis(\s+compounding\s+pharmacy)?(\s+bulgaria)?|np\s*labs?|dn\s*labs?|fagron|bioblend|ilapo|internationale\s+ludwigs[- ]arzneimittel)\b/gi;

export function scrubSupplierText(val) {
  if (typeof val !== 'string') return val;
  return val
    .replace(/\s*·\s*(Lotusland|Lotus\s*Land|Pharmapolis|NP\s*Labs?|DN\s*Labs?|Fagron|BioBlend|ilapo|Internationale\s+Ludwigs[- ]Arzneimittel)[^·]*/gi, '')
    .replace(SUPPLIER_TEXT_REGEX, 'EU GMP Facility')
    .replace(/\(\s*Bulgaria\s*\)/gi, '(EU)')
    .replace(/\bBulgaria\b/gi, 'EU')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function scrubSku(sku) {
  if (typeof sku !== 'string') return sku;
  return sku
    .replace(/^SKU-PHARM-/i, 'SKU-EU-')
    .replace(/^SKU-NPLAB-/i, 'SKU-EU-')
    .replace(/^SKU-DN-/i, 'SKU-AT-');
}

/**
 * Zero-Trust server/client sanitizer for public catalog & pricing payloads.
 * When `isAdmin` is false, strips all supplier identifiers, wholesale cost fields,
 * country-of-origin hints, and supplier SKU prefixes from the serialized payload.
 */
export function sanitizePublicProductForViewer(product, { isAdmin = false } = {}) {
  if (!product || typeof product !== 'object') return product;

  if (isAdmin) {
    return {
      ...product,
      adminSupplierLabel:
        product.supplierName ||
        product.supplier ||
        product.manufacturer ||
        product.brand ||
        null,
    };
  }

  const sanitized = { ...product };
  delete sanitized.supplier;
  delete sanitized.supplierName;
  delete sanitized.supplierId;
  delete sanitized.manufacturer;
  delete sanitized.vendor;
  delete sanitized.vendorName;
  delete sanitized.originCountry;
  delete sanitized.supplierOffers;
  delete sanitized.availableSuppliers;
  delete sanitized.activeSupplierId;
  delete sanitized.activeSupplierName;
  delete sanitized.dispensingPharmacy;
  delete sanitized.supplierSku;
  delete sanitized.supplierRef;
  delete sanitized.costPriceEur;
  delete sanitized.pharmapolisPrice;
  delete sanitized.nplabPrice;
  delete sanitized.adminSupplierLabel;

  if (sanitized.sku) sanitized.sku = scrubSku(sanitized.sku);
  if (sanitized.name) sanitized.name = scrubSupplierText(sanitized.name);
  if (sanitized.canonicalName) sanitized.canonicalName = scrubSupplierText(sanitized.canonicalName);
  if (sanitized.commercialName) sanitized.commercialName = scrubSupplierText(sanitized.commercialName);
  if (sanitized.displayName) sanitized.displayName = scrubSupplierText(sanitized.displayName);
  if (sanitized.brand) sanitized.brand = scrubSupplierText(sanitized.brand);
  if (sanitized.provenance) sanitized.provenance = scrubSupplierText(sanitized.provenance);
  if (sanitized.laboratory) sanitized.laboratory = scrubSupplierText(sanitized.laboratory);
  if (sanitized.shortDescription) sanitized.shortDescription = scrubSupplierText(sanitized.shortDescription);
  if (sanitized.description) sanitized.description = scrubSupplierText(sanitized.description);
  if (sanitized.clinicalFocus) sanitized.clinicalFocus = scrubSupplierText(sanitized.clinicalFocus);

  if (Array.isArray(sanitized.variants)) {
    sanitized.variants = sanitized.variants.map((v) => {
      if (!v || typeof v !== 'object') return v;
      const cv = { ...v };
      delete cv.supplier;
      delete cv.supplierName;
      delete cv.supplierId;
      delete cv.supplierSku;
      delete cv.netTransferPriceEur;
      delete cv.distributorDiscountPct;
      if (cv.sku) cv.sku = scrubSku(cv.sku);
      if (cv.name) cv.name = scrubSupplierText(cv.name);
      if (cv.pricing && typeof cv.pricing === 'object') {
        const vp = { ...cv.pricing };
        delete vp.master;
        cv.pricing = vp;
      }
      return cv;
    });
  }

  if (sanitized.pricing && typeof sanitized.pricing === 'object') {
    const cleanPricing = { ...sanitized.pricing };
    delete cleanPricing.costPriceEur;
    delete cleanPricing.supplierCost;
    delete cleanPricing.master;
    sanitized.pricing = cleanPricing;
  }

  if (sanitized.equipmentSpecs && typeof sanitized.equipmentSpecs === 'object') {
    const scrubEquipmentItem = (it) => {
      if (!it || typeof it !== 'object') return it;
      const copy = { ...it };
      delete copy.netTransferPriceEur;
      delete copy.distributorDiscountPct;
      delete copy.master;
      return copy;
    };
    const specs = { ...sanitized.equipmentSpecs };
    delete specs.netTransferPriceEur;
    delete specs.distributorDiscountPct;
    if (specs.commercialTerms) {
      const ct = { ...specs.commercialTerms };
      delete ct.standardDiscountPct;
      delete ct.sparesDiscountPct;
      delete ct.chillerDiscountPct;
      specs.commercialTerms = ct;
    }
    for (const key of ['vacuumPumps', 'chambersAndManifolds', 'factoryOptions', 'associatedServices', 'labwareConsumables', 'sparePartKits']) {
      if (Array.isArray(specs[key])) {
        specs[key] = specs[key].map(scrubEquipmentItem);
      }
    }
    sanitized.equipmentSpecs = specs;
  }

  return sanitized;
}
