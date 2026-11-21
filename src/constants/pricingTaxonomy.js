/**
 * pricingTaxonomy.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Scalable 2-level Clinical Pricing Taxonomy (Theme Group -> Schedules).
 * Adding a new schedule/country/lab requires only adding 1 entry to a group
 * below, keeping top-level navigation clean even at 40+ price schedules.
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
      { id: 'pens', href: '/pricing/pens', labelEn: 'Peptide Pen Dosing Guide', labelEs: 'Guía Plumas U-100', badge: '27 Pens' },
      { id: 'dnlab-pens', href: '/pricing/dnlab-pens', labelEn: 'DNLab Pens Schedule', labelEs: 'Tarifa DNLab Pens', badge: 'U-100' },
      { id: 'pellets', href: '/pricing/pellets', labelEn: 'Subcutaneous Hormone Pellets', labelEs: 'Pellets Hormonales', badge: 'EU GMP' },
      { id: 'nplab-hormones', href: '/pricing/nplab-hormones', labelEn: 'NP Lab Hormones', labelEs: 'Hormonas NP Lab', badge: 'BHRT' },
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
      { id: '24genetics', href: '/pricing/24genetics', labelEn: '24Genetics Global Panels', labelEs: '24Genetics Global', badge: 'CE-IVD' },
      { id: '24genomics-qatar', href: '/pricing/24genomics-qatar', labelEn: '24Genetics Qatar', labelEs: '24Genetics Qatar', badge: 'QA' },
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
      { id: 'colway', href: '/pricing/colway', labelEn: 'Colway UAE Derma', labelEs: 'Colway UAE', badge: 'UAE' },
      { id: 'colway-hair', href: '/pricing/colway-hair', labelEn: 'Colway Hair & Trichology', labelEs: 'Colway Capilar', badge: 'TRICHO' },
      { id: 'colway-qatar', href: '/pricing/colway-qatar', labelEn: 'Colway Qatar', labelEs: 'Colway Qatar', badge: 'QA' },
    ],
  },
]);

export function findPricingGroupByFormat(activeFormat) {
  if (!activeFormat) return null;
  return PRICING_GROUPS.find((g) => g.items.some((item) => item.id === activeFormat)) || null;
}

export function findPricingGroupById(groupId) {
  if (!groupId) return null;
  return PRICING_GROUPS.find((g) => g.id === groupId || g.hubMacroId === groupId) || null;
}
