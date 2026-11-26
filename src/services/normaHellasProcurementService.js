/**
 * services/normaHellasProcurementService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative procurement reconciliation for Norma Hellas S.A. imports
 * executed on behalf of Magenta Pharma Medicine Trading LLC / Mediluxe.
 *
 * Source: Official Google Drive Import Orders 1 through 7 (Sep 2025 – Nov 2026).
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const NORMA_HELLAS_METADATA = {
  supplierName: 'Norma Hellas S.A.',
  supplierAddress: '54 Menandrou Street, 10431 Athens, Greece',
  contactPerson: 'Mr. Spiropoulos',
  manufacturer: 'EVER Pharma (Germany) / Norma Hellas S.A.',
  productName: 'Testosterone Enanthate / Norma Oily Inj. 250 mg/mL',
  presentation: '1 mL Ampoules (Box of 1 ampoule)',
  storage: 'Store between 15°C - 25°C',
  unitPriceEur: 4.99,
  buyer: {
    name: 'Magenta Pharma Medicine Trading LLC',
    facility: 'Magenta RX Plus Compounding Pharmacy L.L.C',
    address: 'Warehouse 6, DIP 2 / Al Wasl Club, Dubai, UAE',
    trn: '100574948400003',
    contacts: ['Jan Erick Alomia (Pharmacy Director)', 'Samantha Marie P. Bernabe (Procurements)', 'Lynn Iglesia']
  },
  importerCorridor: {
    name: 'Mediluxe Health Solutions FZE / Medical Guild Trading FZC',
    trn: '104906198700003',
    hub: 'Dubai Silicon Oasis / IFZA Business Park, Dubai, UAE'
  }
};

export const NORMA_HELLAS_IMPORTS = [
  {
    id: 'import-1',
    importNumber: 1,
    poNumber: 'MRX2025-244 / MRX2025-401',
    poDate: '2025-09-12',
    deliveryDate: '2025-12-24',
    quantity: 500,
    unitPriceEur: 4.99,
    totalEur: 2495.00,
    batchNumber: 'G3WT1E',
    expiryDate: '2028-04',
    status: 'delivered',
    mohPermit: 'Approved (Semi-Controlled Permit Dec 2025)',
    notes: 'Initial validation batch under ministerial import control permit.'
  },
  {
    id: 'import-2',
    importNumber: 2,
    poNumber: 'PI-1 / Proof of Payment',
    poDate: '2026-01-12',
    deliveryDate: '2026-01-26',
    quantity: 500,
    unitPriceEur: 4.99,
    totalEur: 2495.00,
    batchNumber: 'F8XG1A',
    expiryDate: '2027-04',
    status: 'delivered',
    mohPermit: 'Import Control Verified',
    notes: 'Regular replenishment batch for clinical compounding.'
  },
  {
    id: 'import-3',
    importNumber: 3,
    poNumber: 'P00077',
    poDate: '2026-04-07',
    deliveryDate: '2026-04-16',
    quantity: 500,
    unitPriceEur: 4.99,
    totalEur: 2495.00,
    batchNumber: 'F8XG1A',
    expiryDate: '2027-04',
    status: 'delivered',
    mohPermit: 'Permit 8:4:2026 Verified',
    notes: 'Q2 clinical quota delivery to Al Wasl compound.'
  },
  {
    id: 'import-4',
    importNumber: 4,
    poNumber: 'P00280',
    poDate: '2026-06-21',
    deliveryDate: '2026-06-30',
    quantity: 500,
    unitPriceEur: 4.99,
    totalEur: 2495.00,
    batchNumber: 'G3WT1E',
    expiryDate: '2028-04',
    status: 'delivered',
    mohPermit: 'June Import Control Approved',
    notes: 'Mid-year clinical maintenance allocation.'
  },
  {
    id: 'import-5',
    importNumber: 5,
    poNumber: 'P00457',
    poDate: '2026-09-09',
    deliveryDate: '2026-09-18',
    quantity: 500,
    unitPriceEur: 4.99,
    totalEur: 2495.00,
    batchNumber: 'G3WT1E',
    expiryDate: '2028-04',
    status: 'delivered',
    mohPermit: 'September Import Control Approved',
    notes: 'Late summer compounding replenishment.'
  },
  {
    id: 'import-6',
    importNumber: 6,
    poNumber: 'P00552-2026-0146',
    poDate: '2026-10-26',
    deliveryDate: '2026-11-04',
    quantity: 1000,
    unitPriceEur: 4.99,
    totalEur: 4990.00,
    batchNumber: 'G4BJ1A',
    expiryDate: '2028-08',
    status: 'delivered',
    mohPermit: 'October Import Control Approved',
    notes: 'Scale-up batch (+100% volume increase to 1,000 units).'
  },
  {
    id: 'import-7',
    importNumber: 7,
    poNumber: 'PRX00035-2026-0206',
    poDate: '2026-11-25',
    deliveryDate: '2026-12-05 (Est.)',
    quantity: 1500,
    unitPriceEur: 4.99,
    totalEur: 7485.00,
    batchNumber: 'G4BJ1A / In Allocation',
    expiryDate: '2028-08',
    status: 'processing',
    mohPermit: 'Processing with MOH / In Customs Logistics',
    notes: 'Active order (+200% volume increase to 1,500 units).'
  }
];

export function getNormaHellasProcurementStats() {
  const totalUnits = NORMA_HELLAS_IMPORTS.reduce((sum, imp) => sum + imp.quantity, 0);
  const totalEur = NORMA_HELLAS_IMPORTS.reduce((sum, imp) => sum + imp.totalEur, 0);
  const totalCompletedUnits = NORMA_HELLAS_IMPORTS
    .filter(i => i.status === 'delivered')
    .reduce((sum, imp) => sum + imp.quantity, 0);
  const pendingUnits = totalUnits - totalCompletedUnits;

  return {
    totalOrders: NORMA_HELLAS_IMPORTS.length,
    totalUnits,
    totalCompletedUnits,
    pendingUnits,
    totalEur,
    unitPriceEur: NORMA_HELLAS_METADATA.unitPriceEur,
    activeBatchesCount: 3,
    latestBatch: 'G4BJ1A'
  };
}
