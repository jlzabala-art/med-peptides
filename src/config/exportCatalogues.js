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
    id: 'magenta',
    supplierId: 'supplier-magenta',
    brandName: 'Magenta Medical (Pens & Sprays)',
    catalogueFilter: null,
    flag: '🇦🇪',
    defaultCurrency: 'AED',
    warehouse: 'UAE Hub - Dubai',
    defaultCostMarginAvailable: true,
    variantCount: 101,
    description: '101 variants portfolio (Pre-filled Pens, 3 mL Refill Cartridges & Nasal Sprays)'
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
