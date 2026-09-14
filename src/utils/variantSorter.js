/**
 * variantSorter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Safely sorts product variants from smallest to largest:
 * 1. Numerical dosage value (e.g. 5 mg < 10 mg < 20 mg < 30 mg < 40 mg).
 *    Normalizes units: mcg = 0.001 mg, g = 1000 mg, % = 10 mg/g.
 * 2. Secondary sort: Unit price ascending ($60 < $90 < $130 < $170 < $230).
 * 3. Tertiary sort: Alphanumeric natural order.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function parseDosageNumber(dosageStr) {
  if (!dosageStr) return null;
  const str = String(dosageStr).toLowerCase().trim();
  const match = str.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|iu|ml|%)?/i);
  if (match) {
    const val = parseFloat(match[1]);
    const unit = (match[2] || 'mg').toLowerCase();
    if (unit === 'mcg') return val * 0.001;
    if (unit === 'g') return val * 1000;
    if (unit === '%') return val * 10;
    return val;
  }
  return null;
}

export function sortVariantsAscending(variants = []) {
  if (!Array.isArray(variants)) return [];
  return [...variants].sort((a, b) => {
    const doseA = parseDosageNumber(a.dosage || a.strength || a.name);
    const doseB = parseDosageNumber(b.dosage || b.strength || b.name);

    if (doseA !== null && doseB !== null && doseA !== doseB) {
      return doseA - doseB; // menor a mayor
    }
    if (doseA !== null && doseB === null) return -1;
    if (doseA === null && doseB !== null) return 1;

    const priceA = (a.price > 0 ? a.price : a.unit_price) || 0;
    const priceB = (b.price > 0 ? b.price : b.unit_price) || 0;
    if (priceA !== priceB) {
      return priceA - priceB;
    }

    return (a.dosage || a.name || '').localeCompare(b.dosage || b.name || '', undefined, { numeric: true });
  });
}
