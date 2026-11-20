/**
 * nplabPelletsRegistry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Official NP LABS International Compounding Pharmacy Hormone Pellets Catalogue
 * (16 Absorbable Bioidentical Hormone Pellets: Testosterone, Estradiol, Gestrinone).
 *
 * Uses shared `canonicalKey` values matching `pharmapolisPelletsRegistry.js`
 * so Atlas can compare supplier base costs (`costPriceEur` / `pricing.master.perUnit`)
 * side by side across Pharmapolis and NP LABS.
 */

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const NP_LABS_PELLETS_RAW = [
  // Testosterone Pellets
  { canonicalKey: 'testosterone-12-5mg-pellet', hormone: 'Testosterone', strength: '12.5 mg', strengthValue: 12.5, costEur: 45.00, sku: 'SKU-NPLAB-PEL-T-125' },
  { canonicalKey: 'testosterone-25mg-pellet',   hormone: 'Testosterone', strength: '25 mg',   strengthValue: 25,   costEur: 45.00, sku: 'SKU-NPLAB-PEL-T-25' },
  { canonicalKey: 'testosterone-50mg-pellet',   hormone: 'Testosterone', strength: '50 mg',   strengthValue: 50,   costEur: 45.00, sku: 'SKU-NPLAB-PEL-T-50' },
  { canonicalKey: 'testosterone-87-5mg-pellet', hormone: 'Testosterone', strength: '87.5 mg', strengthValue: 87.5, costEur: 50.00, sku: 'SKU-NPLAB-PEL-T-875' },
  { canonicalKey: 'testosterone-100mg-pellet',  hormone: 'Testosterone', strength: '100 mg',  strengthValue: 100,  costEur: 55.00, sku: 'SKU-NPLAB-PEL-T-100' },
  { canonicalKey: 'testosterone-200mg-pellet',  hormone: 'Testosterone', strength: '200 mg',  strengthValue: 200,  costEur: 57.00, sku: 'SKU-NPLAB-PEL-T-200' },

  // Estradiol Pellets
  { canonicalKey: 'estradiol-6mg-pellet',  hormone: 'Estradiol', strength: '6 mg',  strengthValue: 6,  costEur: 45.00, sku: 'SKU-NPLAB-PEL-E-6' },
  { canonicalKey: 'estradiol-10mg-pellet', hormone: 'Estradiol', strength: '10 mg', strengthValue: 10, costEur: 48.00, sku: 'SKU-NPLAB-PEL-E-10' },
  { canonicalKey: 'estradiol-15mg-pellet', hormone: 'Estradiol', strength: '15 mg', strengthValue: 15, costEur: 50.00, sku: 'SKU-NPLAB-PEL-E-15' },
  { canonicalKey: 'estradiol-18mg-pellet', hormone: 'Estradiol', strength: '18 mg', strengthValue: 18, costEur: 52.00, sku: 'SKU-NPLAB-PEL-E-18' },
  { canonicalKey: 'estradiol-20mg-pellet', hormone: 'Estradiol', strength: '20 mg', strengthValue: 20, costEur: 55.00, sku: 'SKU-NPLAB-PEL-E-20' },
  { canonicalKey: 'estradiol-25mg-pellet', hormone: 'Estradiol', strength: '25 mg', strengthValue: 25, costEur: 59.00, sku: 'SKU-NPLAB-PEL-E-25' },

  // Gestrinone Pellets
  { canonicalKey: 'gestrinone-10mg-pellet', hormone: 'Gestrinone', strength: '10 mg', strengthValue: 10, costEur: 55.00,  sku: 'SKU-NPLAB-PEL-G-10' },
  { canonicalKey: 'gestrinone-25mg-pellet', hormone: 'Gestrinone', strength: '25 mg', strengthValue: 25, costEur: 65.00,  sku: 'SKU-NPLAB-PEL-G-25' },
  { canonicalKey: 'gestrinone-40mg-pellet', hormone: 'Gestrinone', strength: '40 mg', strengthValue: 40, costEur: 85.00,  sku: 'SKU-NPLAB-PEL-G-40' },
  { canonicalKey: 'gestrinone-80mg-pellet', hormone: 'Gestrinone', strength: '80 mg', strengthValue: 80, costEur: 150.00, sku: 'SKU-NPLAB-PEL-G-80' },
];

export const NP_LABS_PELLETS = Object.fromEntries(
  NP_LABS_PELLETS_RAW.map((item) => {
    const id = `nplab-${item.canonicalKey}`;
    const master = round2(item.costEur);
    const wholesale = round2(master * 1.15);
    const clinic = round2(wholesale * 1.15);
    const retail = round2(master * 1.50);

    return [
      id,
      {
        id,
        slug: id,
        canonicalKey: item.canonicalKey,
        name: `${item.hormone} Pellet ${item.strength}`,
        canonicalName: `${item.hormone} Absorbable Bioidentical Pellet ${item.strength}`,
        commercialName: `${item.hormone} Pellet ${item.strength} · NP LABS`,
        brand: 'NP LABS',
        brandBadge: 'NP LABS International Compounding Pharmacy',
        category: 'Hormone Pellets',
        subcategory: `${item.hormone} Pellets`,
        type: 'pellet',
        productType: 'pellet',
        billingUnit: 'pellet',
        is_pellet: true,
        isPellet: true,
        dosageForm: 'Subcutaneous Sterile Pellet (Trocar Implant)',
        dispensingForm: 'Single-dose Sterile Pellet (1 Pellet)',
        supplierName: 'NP LABS International Compounding Pharmacy',
        supplier: 'NP LABS International Compounding Pharmacy',
        supplierId: 'supplier-nplabs',
        suppliers: ['supplier-nplabs'],
        supplierIds: ['supplier-nplabs'],
        status: 'published',
        sku: item.sku,
        strength: item.strength,
        strengthValue: item.strengthValue,
        strengthUnit: 'mg',
        hormoneType: item.hormone.toLowerCase(),
        pricing: {
          costPriceEur: master,
          price_eur: master,
          wholesalePriceEur: clinic,
          currency: 'EUR',
          master: { perUnit: master, kit: round2(master * 0.85 * 10), currency: 'EUR' },
          wholesale: { perUnit: wholesale, kit: round2(wholesale * 0.85 * 10), currency: 'EUR' },
          clinic: { perUnit: clinic, kit: round2(clinic * 0.85 * 10), currency: 'EUR' },
          retail: { perUnit: retail, kit: round2(retail * 0.85 * 10), currency: 'EUR' },
        },
        sourceCatalog: 'NP LABS Hormone Pellets Catalogue (Nov 2026)',
      },
    ];
  })
);

export function getAllNpLabsPellets() {
  return Object.values(NP_LABS_PELLETS);
}
