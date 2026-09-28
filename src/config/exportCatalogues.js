/**
 * exportCatalogues.js
 * 
 * Single source of truth for active exportable brand portfolios and catalogs.
 * Used by AdminCatalogTabClient, PriceListPdfDrawer, and Share workflows.
 */

export const EXPORT_CATALOGUES = [
  {
    id: 'regenpept',
    supplierId: 'supplier-lotusland',
    brandName: 'Lotusland / RegenPept',
    catalogueFilter: 'RegenPept',
    flag: '🇭🇰',
    defaultCurrency: 'USD',
    warehouse: 'Poland, USA, and UK',
    defaultCostMarginAvailable: true,
    variantCount: 104,
    description: '104 variants portfolio (Peptides & Research Supplies)'
  },
  {
    id: 'magenta-peptides',
    supplierId: 'supplier-magenta',
    brandName: 'Magenta Peptides (Clinical Peptides Portfolio)',
    catalogueFilter: 'Magenta-Peptides',
    catalogType: 'peptides',
    flag: '🇦🇪',
    defaultCurrency: 'AED',
    warehouse: 'UAE Hub - Dubai',
    defaultCostMarginAvailable: true,
    variantCount: 251,
    description: '251 variants clinical peptides portfolio (Pre-filled Pens, Refill Cartridges, SubQ Vials & Sprays)'
  },
  {
    id: 'magenta-compounding',
    supplierId: 'supplier-magenta',
    brandName: 'Magenta Compounding & Wellness (Cosmeceuticals, BHRT & IVNT)',
    catalogueFilter: 'Magenta-Compounding',
    catalogType: 'compounding',
    flag: '🇦🇪',
    defaultCurrency: 'AED',
    warehouse: 'UAE Hub - Dubai',
    defaultCostMarginAvailable: true,
    variantCount: 91,
    description: '91 variants portfolio (Medical Cosmeceuticals, Scalp TrichoSol, BHRT & IV Drips)'
  },
  {
    id: 'magenta',
    supplierId: 'supplier-magenta',
    brandName: 'Magenta Medical (Complete Master Portfolio)',
    catalogueFilter: 'Magenta',
    catalogType: 'all',
    flag: '🇦🇪',
    defaultCurrency: 'AED',
    warehouse: 'UAE Hub - Dubai',
    defaultCostMarginAvailable: true,
    variantCount: 366,
    description: 'Complete 366 variants vademecum (Peptides, Cosmeceuticals, BHRT, IVNT & Clinical Supplies)'
  },
  {
    id: 'larimedical',
    supplierId: 'supplier-larimedical',
    brandName: 'LARIMEDICAL (Sterilia)',
    catalogueFilter: null,
    flag: '🇪🇸',
    defaultCurrency: 'EUR',
    warehouse: 'EU Hub - Spain (Alcoy, Alicante)',
    defaultCostMarginAvailable: true,
    variantCount: 8,
    description: 'Sterile Mesotherapy Solutions (Spain)'
  },
  {
    id: 'europeptides',
    supplierId: 'supplier-europeptides',
    brandName: 'EuroPeptides',
    catalogueFilter: null,
    flag: '🇧🇬',
    defaultCurrency: 'EUR',
    warehouse: 'EU Hub - Bulgaria',
    defaultCostMarginAvailable: false,
    variantCount: 54,
    description: 'European Peptide Formulations'
  }
];
