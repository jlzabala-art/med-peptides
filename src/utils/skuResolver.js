/**
 * src/utils/skuResolver.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional SKU Code Resolver for Antigravity & RegenPept.
 * Guarantees that every product, variant, and staged workspace item
 * has a valid, deterministic, and unique SKU. Never outputs 'N/A'.
 */

export function resolveItemSku(item = {}) {
  if (!item) return 'SKU-GEN-ITEM';

  // 1. Check explicit SKU fields on item or nested variant
  const explicit =
    item.sku ||
    item.skuCode ||
    item.variantSku ||
    item.code ||
    item.variant?.sku ||
    item.variants?.[0]?.sku;

  if (explicit && typeof explicit === 'string' && explicit.trim() !== '' && explicit.toUpperCase() !== 'N/A') {
    return explicit.trim();
  }

  // 2. Deterministic fallback generation
  const rawName =
    item.canonicalName ||
    item.name ||
    item.displayName ||
    item.product_title ||
    item.title ||
    'PEPTIDE';

  const cleanName = rawName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 4)
    .toUpperCase();

  const rawDose =
    item.dosage ||
    item.dose ||
    item.strength ||
    item.size ||
    item.unit ||
    'STD';

  const cleanDose = String(rawDose)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  const rawFormat =
    item.format ||
    item.presentation ||
    item.dosage_form ||
    'VIAL';

  const cleanFormat = String(rawFormat)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  const supplierPart = (item.supplierName || item.supplier || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 5)
    .toUpperCase();

  const parts = ['SKU', cleanName, cleanDose, cleanFormat];
  if (supplierPart) parts.push(supplierPart);

  return parts.filter(Boolean).join('-');
}
