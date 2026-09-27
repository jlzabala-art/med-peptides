export const PRODUCT_CATEGORIES = [
  { id: 'peptide',                   label: 'Peptides', icon: '💊' },
  { id: 'raw_material',              label: 'Bulk APIs & Raw Materials', icon: '⚗️' },
  { id: 'aesthetic_injectables',     label: 'Aesthetic Injectables', icon: '💉' },
  { id: 'diagnostic_test',           label: 'Diagnostic Tests', icon: '🩸' },
  { id: 'genomics_biomarkers',       label: 'Genomics & Biomarkers', icon: '🧬' },
  { id: 'nutricosmetics',            label: 'Nutricosmetics', icon: '🌿' },
  { id: 'cosmetics',                 label: 'Cosmeceuticals & Skincare', icon: '🧴' },
  { id: 'clinical_supplies',         label: 'Clinical Supplies', icon: '🩺' },
  { id: 'iv_drips',                  label: 'IV Drips & Protocols', icon: '💧' },
  { id: 'corporate_services',        label: 'B2B Services', icon: '💼' },
  { id: 'supplement',                label: 'Supplements', icon: '💎' },
  { id: 'compounding_material',      label: 'Compounding Materials', icon: '🧪' },
  { id: 'hormone',                   label: 'Hormones', icon: '⚡' },
];

const CATEGORY_ALIASES = {
  'api_raw_material': 'raw_material',
  'api_raw_materials': 'raw_material',
  'Aesthetic Injectables': 'aesthetic_injectables',
  'skincare': 'cosmetics',
  'service': 'corporate_services',
  'logistics_service': 'corporate_services',
  'medical_supplies': 'clinical_supplies',
  'diagnostic': 'diagnostic_test',
};

export function getCategoryLabel(categoryId) {
  if (!categoryId) return 'Uncategorized';
  const resolvedId = CATEGORY_ALIASES[categoryId] || categoryId;
  const cat = PRODUCT_CATEGORIES.find(c => c.id === resolvedId);
  if (cat) return cat.label;
  // Fallback: convert snake_case → Title Case for any future IDs not yet in the list
  return resolvedId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export const CATEGORY_SUBCATEGORIES = {
  peptide: [
    { value: 'Lyophilized Peptide APIs', label: '🧬 Lyophilized Peptide APIs' },
    { value: 'Bulk API Powder', label: '⚖️ Bulk API Powder' },
    { value: 'Reconstitution Diluents', label: '💧 Reconstitution Diluents' },
    { value: 'Injectable Ready', label: '💉 Injectable Ready' },
    { value: 'Nasal Sprays', label: '👃 Nasal Sprays' },
    { value: 'Oral & Sublingual', label: '💊 Oral & Sublingual' },
    { value: 'Topical & Cosmeceutical', label: '✨ Topical & Cosmeceutical' },
    { value: 'Topical Oil', label: '🧴 Topical Oil' }
  ],
  supplement: [
    { value: 'Oral & Sublingual', label: '💊 Oral & Sublingual' },
    { value: 'Bulk API Powder', label: '⚖️ Bulk API Powder' }
  ],
  hormone: [
    { value: 'Injectable Ready', label: '💉 Injectable Ready' },
    { value: 'Topical & Cosmeceutical', label: '✨ Topical & Cosmeceutical' },
    { value: 'Topical Oil', label: '🧴 Topical Oil' },
    { value: 'Oral & Sublingual', label: '💊 Oral & Sublingual' }
  ],
  diagnostic_test: [
    { value: 'DNA Test', label: '🧬 DNA Test' },
    { value: 'Blood Test', label: '🩸 Blood Test' },
    { value: 'Swab Test', label: '🧪 Swab Test' }
  ],
  medical_device_consumable: [
    { value: 'Injection Accessories', label: '💉 Injection Accessories' },
    { value: 'Cold-Chain Storage', label: '❄️ Cold-Chain Storage' }
  ],
  service: [
    { value: 'Membership', label: '💳 Membership' },
    { value: 'Subscription', label: '📅 Subscription' }
  ],
  skincare: [
    { value: 'Sterile Mesotherapy Solutions', label: '💉 Sterile Mesotherapy Solutions' },
    { value: 'Topical & Cosmeceutical', label: '✨ Topical & Cosmeceutical' },
    { value: 'Topical Oil', label: '🧴 Topical Oil' }
  ],
  excipient_vehicle: [
    { value: 'Reconstitution Diluents', label: '💧 Reconstitution Diluents' },
    { value: 'Bulk API Powder', label: '⚖️ Bulk API Powder' }
  ],
  apparel: [
    { value: 'Clothing', label: '👕 Clothing' },
    { value: 'Accessories', label: '🧢 Accessories' }
  ]
};
