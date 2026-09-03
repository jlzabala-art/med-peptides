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
    description: '103 variants portfolio (Peptides & Research Supplies)'
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
    description: 'European Peptide Formulations'
  }
];
