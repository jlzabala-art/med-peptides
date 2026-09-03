export const PRODUCT_FORMATS = [
  { id: 'vial', label: 'Vial' },
  { id: 'prefilled_pen', label: 'Pre-filled Pen' },
  { id: 'capsule', label: 'Capsule' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'cream', label: 'Cream' },
  { id: 'nasal_spray', label: 'Nasal Spray' },
  { id: 'troche', label: 'Troche' },
  { id: 'sublingual', label: 'Sublingual Drops' },
  { id: 'patch', label: 'Patch' },
  { id: 'gummy', label: 'Gummy' },
  { id: 'powder', label: 'Powder' },
  { id: 'topical_oil', label: 'Topical Oil' }
];

export function getFormatLabel(formatId) {
  if (!formatId) return 'Unknown';
  const format = PRODUCT_FORMATS.find(f => f.id === formatId);
  return format ? format.label : formatId;
}
