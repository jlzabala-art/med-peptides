// src/skills/product_system.js
/**
 * Product System Skill
 * -------------------------------------------------
 * Responsibilities:
 *  • Parse raw product feeds (CSV/JSON)
 *  • Normalize attributes (units, purity, form)
 *  • Generate deterministic SKU for each variant
 *  • Map business goals to products
 *  • Provide lookup helpers for other skills
 */

// Example schema definitions (can be extended via TypeScript in the future)
export const ProductType = {
  PEPTIDE: 'peptide',
  SUPPLEMENT: 'supplement',
};

/** Parse a raw feed (array of objects) into internal product objects */
export async function parseProductFeed(rawFeed) {
  // Assume rawFeed is an array of JSON rows or CSV rows already parsed
  return rawFeed.map((row) => ({
    id: row.id ?? generateId(),
    type: row.type ?? ProductType.PEPTIDE,
    name: row.name?.trim() ?? 'Unnamed',
    attributes: row.attributes ?? {},
    variants: row.variants ?? [],
    goals: row.goals ?? [],
  }));
}

/** Normalizes attribute values (e.g., mg → g, purity percentages) */
export function normalizeAttributes(product) {
  const normalized = { ...product };
  // Simple example: ensure all dose units are in milligrams
  if (normalized.attributes.dose && typeof normalized.attributes.dose === 'string') {
    const match = normalized.attributes.dose.match(/([\d.]+)\s*(mg|g)/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      normalized.attributes.doseMg = unit === 'g' ? value * 1000 : value;
    }
  }
  return normalized;
}

/** Generate deterministic SKUs for each variant */
export function generateVariantSKUs(product) {
  const base = product.id;
  return product.variants.map((variant, idx) => {
    const sku = `${base}-${idx + 1}`;
    return { ...variant, sku };
  });
}

/** Resolve high‑level business goals (e.g., high‑purity) to product flags */
export function resolveGoalMapping(product) {
  const goalMap = {};
  product.goals.forEach((g) => {
    if (g.toLowerCase().includes('purity')) goalMap.highPurity = true;
    if (g.toLowerCase().includes('fast')) goalMap.fastRelease = true;
  });
  return { ...product, goalMap };
}

/** Validate that required fields exist */
export function validateProductSchema(product) {
  if (!product.id) throw new Error('Product must have an id');
  if (!product.name) throw new Error('Product must have a name');
  if (!Array.isArray(product.variants)) throw new Error('Product variants must be an array');
  return true;
}

/** Helper to get a product by SKU (used by other skills) */
export function getProductBySKU(sku, catalog) {
  for (const prod of catalog) {
    const variant = prod.variants.find((v) => v.sku === sku);
    if (variant) return { product: prod, variant };
  }
  return null;
}

/** Helper to get variant by internal id */
export function getVariantById(variantId, catalog) {
  for (const prod of catalog) {
    const variant = prod.variants.find((v) => v.id === variantId);
    if (variant) return { product: prod, variant };
  }
  return null;
}

/** Simple ID generator for demo purposes */
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
