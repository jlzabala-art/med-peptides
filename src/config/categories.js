export const PRODUCT_CATEGORIES = [
  { id: 'peptide',                   label: 'Peptides' },
  { id: 'supplement',                label: 'Supplements' },
  { id: 'hormone',                   label: 'Hormones' },
  { id: 'excipient_vehicle',         label: 'Excipients & Vehicles' },
  { id: 'medical_device_consumable', label: 'Consumables & Devices' },
  { id: 'diagnostic_test',           label: 'Diagnostic Tests' },
  { id: 'service',                   label: 'Services & Subscriptions' },
  { id: 'skincare',                  label: 'Skincare & Topicals' },
  { id: 'apparel',                   label: 'Apparel & Merch' },
];

export function getCategoryLabel(categoryId) {
  if (!categoryId) return 'Uncategorized';
  const cat = PRODUCT_CATEGORIES.find(c => c.id === categoryId);
  // Fallback: convert snake_case → Title Case for any future IDs not yet in the list
  if (!cat) return categoryId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return cat.label;
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
