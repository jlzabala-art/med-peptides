/**
 * pelletComparison.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Backward-compatible pellet comparison wrapper backed by `supplierComparison.js`.
 */

import { buildSupplierComparisonRows } from './supplierComparison.js';

export function buildPelletComparisonRows(products = []) {
  return buildSupplierComparisonRows(
    products.filter(
      (doc) =>
        doc &&
        (doc.productType === 'pellet' ||
          doc.type === 'pellet' ||
          doc.isPellet === true ||
          doc.is_pellet === true)
    )
  );
}
