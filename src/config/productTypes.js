export const PRODUCT_TYPES = [
  { id: 'finished_product', label: '💊 Finished Product' },
  { id: 'raw_material',     label: '🧪 Raw Material & APIs' },
  { id: 'test',             label: '🔬 Diagnostic Tests' },
  { id: 'equipment',        label: '⚕️ Medical Equipment' },
  { id: 'subscription',     label: '📅 Subscriptions & Services' },
];

export function getProductTypeLabel(typeId) {
  if (!typeId) return 'Unknown';
  const type = PRODUCT_TYPES.find(t => t.id === typeId);
  if (!type) return typeId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return type.label;
}
