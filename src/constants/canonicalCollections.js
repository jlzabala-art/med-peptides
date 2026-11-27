/**
 * Canonical Firestore collection registry for RegenPept / Atlas Health.
 *
 * Centralizes SSOT collection names and documents legacy aliases so audits
 * and repositories converge onto a single set of collection identifiers.
 */

export const COLLECTIONS = Object.freeze({
  PRODUCTS: 'products',
  CATALOG: 'catalog',
  CLIENT_AGREEMENTS: 'client_agreements',
  SHARED_PRICING_LINKS: 'shared_pricing_links',
  PRESCRIPTIONS: 'prescriptions',
  ORDERS: 'orders',
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  QUOTATIONS: 'quotations',
  B2B_QUOTES: 'b2b_quotes',
  SUPPLIERS: 'suppliers',
  PROTOCOLS: 'protocols',
  META: '_meta',
});

export const DEPRECATED_COLLECTION_ALIASES = Object.freeze({
  product_catalog: COLLECTIONS.PRODUCTS,
  catalog_items: COLLECTIONS.PRODUCTS,
  pricing_agreements: COLLECTIONS.CLIENT_AGREEMENTS,
  share_links: COLLECTIONS.SHARED_PRICING_LINKS,
  rx_orders: COLLECTIONS.PRESCRIPTIONS,
  quotes: COLLECTIONS.QUOTATIONS,
  b2b_quotations: COLLECTIONS.B2B_QUOTES,
});

export function resolveCanonicalCollection(name) {
  const key = String(name || '').trim();
  if (!key) return '';
  return DEPRECATED_COLLECTION_ALIASES[key] || key;
}
