/**
 * variantTimelineHelper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Utility functions for capturing, categorizing, and formatting variant
 * change audit entries (timeline).
 */

const FIELD_LABELS = {
  unit_price: 'Unit Cost Price',
  price: 'Master Unit Price',
  cost_10: 'Tier 10 (Kit) Cost',
  cost_50: 'Tier 50 Cost',
  cost_100: 'Tier 100 Cost',
  wholesale: 'Wholesale Price',
  clinic: 'Clinic Price',
  retail: 'Retail Price',
  wholesale_margin: 'Wholesale Margin (%)',
  clinic_margin: 'Clinic Margin (%)',
  retail_margin: 'Retail Margin (%)',
  discountPercent: 'Supplier Discount (%)',
  supplierDiscount: 'Supplier Discount (%)',
  dosage: 'Dosage / Strength',
  doseMg: 'Active Dosage (mg)',
  weight: 'Raw API Weight',
  format: 'Presentation Format',
  presentation: 'Presentation Type',
  kitSize: 'Kit Size / Quantity',
  supplierId: 'Supplier / Laboratory',
  supplierName: 'Supplier Name',
  status: 'Variant Status',
  stock: 'Stock Count',
  purity: 'HPLC Purity Grade',
  coa_available: 'CoA Certificate Status',
  isPreferred: 'Default Preferred Status'
};

const CATEGORIES = {
  unit_price: 'pricing',
  price: 'pricing',
  cost_10: 'pricing',
  cost_50: 'pricing',
  cost_100: 'pricing',
  wholesale: 'pricing',
  clinic: 'pricing',
  retail: 'pricing',
  wholesale_margin: 'pricing',
  clinic_margin: 'pricing',
  retail_margin: 'pricing',
  discountPercent: 'pricing',
  supplierDiscount: 'pricing',
  dosage: 'formulation',
  doseMg: 'formulation',
  weight: 'formulation',
  format: 'formulation',
  presentation: 'formulation',
  kitSize: 'formulation',
  supplierId: 'supplier',
  supplierName: 'supplier',
  status: 'logistics',
  stock: 'logistics',
  purity: 'regulatory',
  coa_available: 'regulatory',
  isPreferred: 'logistics'
};

/**
 * Creates an immutable timeline entry for a variant edit.
 */
export function createVariantTimelineEntry({ field, previousValue, newValue, user, currency = 'USD' }) {
  const fieldLabel = FIELD_LABELS[field] || field;
  const category = CATEGORIES[field] || 'general';

  const entry = {
    id: `tl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    field,
    fieldLabel,
    category,
    previousValue: previousValue !== undefined ? previousValue : null,
    newValue: newValue !== undefined ? newValue : null,
    currency,
    author: user?.email || user?.displayName || 'Admin Operator',
    authorId: user?.uid || 'admin'
  };

  // Generate automated human summary note
  if (category === 'pricing') {
    const prevNum = Number(previousValue || 0);
    const newNum = Number(newValue || 0);
    const diffPct = prevNum > 0 ? (((newNum - prevNum) / prevNum) * 100).toFixed(1) : null;
    const diffText = diffPct ? ` (${diffPct > 0 ? '+' : ''}${diffPct}%)` : '';
    entry.note = `${fieldLabel} changed from $${prevNum.toFixed(2)} to $${newNum.toFixed(2)}${diffText}`;
  } else if (field === 'coa_available') {
    entry.note = `CoA Certificate verified status changed to ${newValue ? 'Verified' : 'Unverified'}`;
  } else if (field === 'isPreferred') {
    entry.note = `Variant was ${newValue ? 'set as default preferred' : 'removed from default preferred'}`;
  } else {
    entry.note = `${fieldLabel} updated from "${previousValue || 'empty'}" to "${newValue || 'empty'}"`;
  }

  return entry;
}

/**
 * Formats a value for display in the timeline diff pills.
 */
export function formatTimelineValue(val, field) {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (field && (field === 'discountPercent' || field === 'supplierDiscount')) {
    const num = Number(val);
    if (!isNaN(num)) return `${num}%`;
  }
  if (field && (field.includes('price') || field.includes('cost') || field === 'wholesale' || field === 'clinic' || field === 'retail')) {
    const num = Number(val);
    if (!isNaN(num)) return `$${num.toFixed(2)}`;
  }
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  return String(val);
}
