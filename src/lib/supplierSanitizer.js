const SUPPLIER_TEXT_REGEX = /\b(pharmapolis(\s+compounding\s+pharmacy)?(\s+bulgaria)?|np\s*labs?|dn\s*labs?|fagron|bioblend)\b/gi;

export function scrubSupplierText(val) {
  if (typeof val !== 'string') return val;
  return val
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
  delete sanitized.costPriceEur;
  delete sanitized.pharmapolisPrice;
  delete sanitized.nplabPrice;
  delete sanitized.adminSupplierLabel;

  if (sanitized.sku) sanitized.sku = scrubSku(sanitized.sku);
  if (sanitized.name) sanitized.name = scrubSupplierText(sanitized.name);
  if (sanitized.canonicalName) sanitized.canonicalName = scrubSupplierText(sanitized.canonicalName);
  if (sanitized.shortDescription) sanitized.shortDescription = scrubSupplierText(sanitized.shortDescription);
  if (sanitized.description) sanitized.description = scrubSupplierText(sanitized.description);
  if (sanitized.clinicalFocus) sanitized.clinicalFocus = scrubSupplierText(sanitized.clinicalFocus);

  if (sanitized.pricing && typeof sanitized.pricing === 'object') {
    const cleanPricing = { ...sanitized.pricing };
    delete cleanPricing.costPriceEur;
    delete cleanPricing.supplierCost;
    sanitized.pricing = cleanPricing;
  }

  return sanitized;
}
