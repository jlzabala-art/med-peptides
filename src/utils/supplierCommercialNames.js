/**
 * supplierCommercialNames.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Commercial and Brand Display Names for Suppliers.
 * Translates backend supplier IDs/names to patient-facing/clinical commercial brands.
 * IMPORTANT: Strictly frontend presentation layer. Does NOT alter Firestore IDs.
 */

export function formatCommercialSupplierName(rawNameOrId) {
  if (!rawNameOrId) return '';
  const s = String(rawNameOrId).trim().toLowerCase();

  // Magenta -> Bioblend commercial brand (Dubai Compounding Pharmacy)
  if (s.includes('magenta')) {
    return 'Bioblend';
  }

  // Lotusland concrete commercial supplier
  if (s.includes('lotusland') || s.includes('lotus')) {
    return 'Lotusland';
  }

  if (s.includes('bioniq')) return 'Bioniq';
  if (s.includes('nplabs') || s.includes('np labs')) return 'NP Labs';
  if (s.includes('bloodo')) return 'Bloodo';
  if (s.includes('fagron')) return 'Fagron Iberia';

  return rawNameOrId;
}

export default formatCommercialSupplierName;
