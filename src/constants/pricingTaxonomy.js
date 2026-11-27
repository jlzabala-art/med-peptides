/**
 * pricingTaxonomy.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Scalable 2-level Clinical Pricing Taxonomy (Theme Group -> Canonical Schedules).
 * Golden Rule: "1 Brand / Line = 1 Screen". Markets (Global/UAE/Qatar) and
 * subcategories (Hair, Specialties) live inside the canonical screen via query params.
 */

export const PRICING_GROUPS = Object.freeze([
  {
    id: 'peptides-hormones',
    hubMacroId: 'peptides',
    labelEn: 'Peptides & Hormones',
    labelEs: 'Péptidos & Hormonas',
    shortEn: 'Peptides & BHRT',
    shortEs: 'Péptidos & BHRT',
    iconKey: 'peptides',
    items: [
      { id: 'peptides', href: '/pricing/peptides', labelEn: 'Peptide Vials & Kits', labelEs: 'Viales y Péptidos', badge: 'cGMP' },
      { id: 'pens', href: '/pricing/pens', labelEn: 'Peptide Pens (U-100)', labelEs: 'Plumas U-100', badge: '27 Pens' },
      { id: 'pellets', href: '/pricing/pellets', labelEn: 'Subcutaneous Hormone Pellets', labelEs: 'Pellets Hormonales', badge: 'EU GMP' },
      { id: 'bhrt', href: '/pricing/bhrt', labelEn: 'Bioidentical HRT & Hormones', labelEs: 'BHRT y Hormonas', badge: 'EU GMP' },
    ],
  },
  {
    id: 'genomics',
    hubMacroId: 'genomics',
    labelEn: 'Genetic Tests',
    labelEs: 'Tests Genéticos',
    shortEn: 'Genetics',
    shortEs: 'Genética',
    iconKey: 'genomics',
    items: [
      { id: '24genetics', href: '/pricing/24genetics', labelEn: '24Genetics DNA Panels', labelEs: '24Genetics ADN', badge: 'CE-IVD' },
    ],
  },
  {
    id: 'derma-collagen',
    hubMacroId: 'cosmetics',
    labelEn: 'Derma & Collagen',
    labelEs: 'Derma & Capilar',
    shortEn: 'Derma & Hair',
    shortEs: 'Derma & Capilar',
    iconKey: 'derma',
    items: [
      { id: 'colway', href: '/pricing/colway', labelEn: 'Colway Derma & Hair', labelEs: 'Colway Derma y Capilar', badge: 'UAE / QA' },
      { id: 'fillers', href: '/pricing/fillers', labelEn: 'Boosters & Fillers', labelEs: 'Boosters y Fillers', badge: 'CE' },
      { id: 'larimedical', href: '/pricing?tab=larimedical', labelEn: 'Larimide & Larimedical', labelEs: 'Larimide y Larimedical', badge: '145 SKUs' },
    ],
  },
]);

export function findPricingGroupByFormat(activeFormat) {
  if (!activeFormat) return null;
  const norm = String(activeFormat).toLowerCase();
  const aliasMap = {
    'dnlab-pens': 'pens',
    'pharmapolis-hrt': 'bhrt',
    'nplab-hormones': 'bhrt',
    hormones: 'bhrt',
    '24genomics-qatar': '24genetics',
    'colway-hair': 'colway',
    'colway-qatar': 'colway',
  };
  const resolved = aliasMap[norm] || norm;
  return PRICING_GROUPS.find((g) => g.items.some((item) => item.id === resolved)) || null;
}

export function findPricingGroupById(groupId) {
  if (!groupId) return null;
  return PRICING_GROUPS.find((g) => g.id === groupId || g.hubMacroId === groupId) || null;
}
