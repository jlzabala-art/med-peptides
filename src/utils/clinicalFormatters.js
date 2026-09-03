/**
 * clinicalFormatters.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional formatting utilities for dosages, molecular weights, and purity.
 */

export function formatDosage(amount, fromUnit = 'mcg', targetUnit = 'auto') {
  const num = Number(amount);
  if (isNaN(num)) return '—';

  let mcg = fromUnit === 'mg' ? num * 1000 : num;

  if (targetUnit === 'mg' || (targetUnit === 'auto' && mcg >= 1000)) {
    const mg = (mcg / 1000);
    const formatted = Number.isInteger(mg) ? mg.toString() : parseFloat(mg.toFixed(2)).toString();
    return `${formatted} mg`;
  }
  return `${Math.round(mcg)} mcg`;
}

export function formatMolecularWeight(mw) {
  const num = Number(mw);
  if (isNaN(num) || num <= 0) return '—';
  return `${num.toFixed(2)} g/mol`;
}

export function formatPurity(purity) {
  const num = Number(purity);
  if (isNaN(num) || num <= 0) return '≥ 99.0%';
  return `${num.toFixed(2)}%`;
}

export function formatClinicalDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
