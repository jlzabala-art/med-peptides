import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * 🧬 AUTHORITATIVE CATALOG SEEDER: LYOPHILIZED PEPTIDES APIs & RAW MATERIALS
 * Populates Firestore collection "products" with high-purity Active Pharmaceutical Ingredients (APIs).
 */
export const LYOPHILIZED_PEPTIDES_API_CATALOG = [
  {
    id: 'api-bpc157-lyo',
    name: 'BPC-157 Lyophilized API',
    canonicalName: 'BPC-157',
    productType: 'raw_material',
    category: 'Regenerative & Tissue Repair',
    subcategory: 'Lyophilized Peptide APIs',
    description: 'High-purity lyophilized pentadecapeptide (Body Protection Compound 157) in vacuum-sealed vials for clinical compounding and regenerative formulations.',
    isActive: true,
    status: 'published',
    requiresColdChain: true,
    requiresPrescription: true,
    molecular: {
      casNumber: '137525-51-0',
      sequence: 'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
      molecularFormula: 'C62H98N16O22',
      molecularWeight: 1419.55,
      halfLife: '4-6 hours'
    },
    apiSpecs: {
      purityPercentage: 99.4,
      grade: 'pharma_compounding',
      counterIon: 'acetate',
      appearance: 'White lyophilized cake',
      solubility: 'Soluble in Bacteriostatic Water / Sterile Saline',
      endotoxins: '< 0.2 EU/mg',
      storageConditionLyophilized: '-20°C (Dry, Dark, Vacuum Sealed)',
      storageConditionReconstituted: '2°C to 8°C (Refrigerated)',
      shelfLifeMonthsLyophilized: 36,
      shelfLifeDaysReconstituted: 30,
      reconstitutionGuide: {
        diluentRecommended: 'Bacteriostatic Water (0.9% Benzyl Alcohol)',
        volumeRecommendedMl: 2.0,
        instructions: 'Inject 2.0 mL BAC Water slowly down the glass wall. Swirl gently until dissolved. Yields 2,500 mcg/mL (250 mcg per 0.1 mL).'
      }
    },
    variants: [
      {
        id: 'api-bpc157-5mg',
        name: 'BPC-157 5mg Lyophilized Vial',
        dosage: '5 mg',
        format: 'lyophilized_vial',
        supplier: 'Fagron Compounding',
        supplierName: 'Fagron Compounding Pharmacy',
        stock: 150,
        inStock: true,
        moq: 1,
        purity: 99.4,
        pricing: {
          masterPrice: { base: 65.00, currency: 'USD' },
          retailPrice: { base: 120.00, currency: 'USD' },
          clinicPrice: { base: 75.00, currency: 'USD' },
          wholesalePrice: { base: 55.00, currency: 'USD' }
        },
        cost_tiers: { cost_1: 42.00, cost_10: 36.00, cost_50: 29.00 }
      },
      {
        id: 'api-bpc157-10mg',
        name: 'BPC-157 10mg Lyophilized Vial',
        dosage: '10 mg',
        format: 'lyophilized_vial',
        supplier: 'Fagron Compounding',
        supplierName: 'Fagron Compounding Pharmacy',
        stock: 220,
        inStock: true,
        moq: 1,
        purity: 99.5,
        pricing: {
          masterPrice: { base: 110.00, currency: 'USD' },
          retailPrice: { base: 195.00, currency: 'USD' },
          clinicPrice: { base: 130.00, currency: 'USD' },
          wholesalePrice: { base: 95.00, currency: 'USD' }
        },
        cost_tiers: { cost_1: 68.00, cost_10: 59.00, cost_50: 48.00 }
      },
      {
        id: 'api-bpc157-1g-bulk',
        name: 'BPC-157 API Bulk Powder 1000mg (1g)',
        dosage: '1000 mg (1g)',
        format: 'bulk_powder_gram',
        supplier: 'NP LABS',
        supplierName: 'NP LABS Compounding',
        stock: 12,
        inStock: true,
        moq: 1,
        purity: 99.6,
        pricing: {
          masterPrice: { base: 2800.00, currency: 'USD' },
          retailPrice: { base: 4500.00, currency: 'USD' },
          clinicPrice: { base: 3400.00, currency: 'USD' },
          wholesalePrice: { base: 2400.00, currency: 'USD' }
        },
        cost_tiers: { cost_1: 1800.00, cost_10: 1500.00 }
      }
    ]
  },
  {
    id: 'api-tb500-lyo',
    name: 'TB-500 (Thymosin Beta-4) Lyophilized API',
    canonicalName: 'TB-500',
    productType: 'raw_material',
    category: 'Regenerative & Tissue Repair',
    subcategory: 'Lyophilized Peptide APIs',
    description: 'Synthetic active fragment of Thymosin Beta-4. Promotes actin regulation, angiogenesis, and deep muscular-tendon remodeling.',
    isActive: true,
    status: 'published',
    requiresColdChain: true,
    requiresPrescription: true,
    molecular: {
      casNumber: '77591-33-4',
      sequence: 'Ac-Ser-Asp-Lys-Pro-Asp-Met-Ala-Glu-Ile-Glu-Lys-Phe-Asp-Lys-Ser-Lys-Leu-Lys-Lys-Thr-Glu-Thr-Gln-Glu-Lys-Asn-Pro-Leu-Pro-Ser-Lys-Glu-Thr-Ile-Glu-Gln-Glu-Lys-Gln-Ala-Gly-Glu-Ser',
      molecularFormula: 'C212H350N56O78S',
      molecularWeight: 4963.50,
      halfLife: '24-36 hours'
    },
    apiSpecs: {
      purityPercentage: 99.2,
      grade: 'pharma_compounding',
      counterIon: 'acetate',
      appearance: 'White lyophilized powder',
      solubility: 'Soluble in Sterile / Bacteriostatic Water',
      storageConditionLyophilized: '-20°C',
      storageConditionReconstituted: '2°C to 8°C',
      shelfLifeMonthsLyophilized: 36,
      shelfLifeDaysReconstituted: 28,
      reconstitutionGuide: {
        diluentRecommended: 'Bacteriostatic Water USP',
        volumeRecommendedMl: 2.0,
        instructions: 'Reconstitute 5mg or 10mg with 2.0 mL BAC Water.'
      }
    },
    variants: [
      {
        id: 'api-tb500-5mg',
        name: 'TB-500 5mg Lyophilized Vial',
        dosage: '5 mg',
        format: 'lyophilized_vial',
        supplier: 'Fagron Compounding',
        supplierName: 'Fagron Compounding Pharmacy',
        stock: 95,
        inStock: true,
        moq: 1,
        purity: 99.2,
        pricing: {
          masterPrice: { base: 75.00, currency: 'USD' },
          retailPrice: { base: 140.00, currency: 'USD' },
          clinicPrice: { base: 85.00, currency: 'USD' },
          wholesalePrice: { base: 62.00, currency: 'USD' }
        },
        cost_tiers: { cost_1: 45.00, cost_10: 38.00 }
      },
      {
        id: 'api-tb500-10mg',
        name: 'TB-500 10mg Lyophilized Vial',
        dosage: '10 mg',
        format: 'lyophilized_vial',
        supplier: 'Fagron Compounding',
        supplierName: 'Fagron Compounding Pharmacy',
        stock: 140,
        inStock: true,
        moq: 1,
        purity: 99.3,
        pricing: {
          masterPrice: { base: 130.00, currency: 'USD' },
          retailPrice: { base: 230.00, currency: 'USD' },
          clinicPrice: { base: 155.00, currency: 'USD' },
          wholesalePrice: { base: 110.00, currency: 'USD' }
        },
        cost_tiers: { cost_1: 78.00, cost_10: 68.00 }
      }
    ]
  },
  {
    id: 'api-tirzepatide-lyo',
    name: 'Tirzepatide Dual GIP/GLP-1 API Lyophilized',
    canonicalName: 'Tirzepatide',
    productType: 'raw_material',
    category: 'Metabolic & Weight Management',
    subcategory: 'Lyophilized Peptide APIs',
    description: 'Dual GIP and GLP-1 receptor agonist peptide API for metabolic and glucose-dependent insulinotropic compounding.',
    isActive: true,
    status: 'published',
    requiresColdChain: true,
    requiresPrescription: true,
    molecular: {
      casNumber: '2023788-19-2',
      molecularFormula: 'C225H348N48O68',
      molecularWeight: 4813.45,
      halfLife: '5 days'
    },
    apiSpecs: {
      purityPercentage: 99.6,
      grade: 'pharma_compounding',
      counterIon: 'acetate',
      appearance: 'White crystalline lyophilized cake',
      solubility: 'Soluble in BAC Water (pH 7.0-7.5)',
      storageConditionLyophilized: '-20°C',
      storageConditionReconstituted: '2°C to 8°C',
      shelfLifeMonthsLyophilized: 24,
      shelfLifeDaysReconstituted: 45,
      reconstitutionGuide: {
        diluentRecommended: 'Bacteriostatic Water (0.9% Benzyl Alcohol)',
        volumeRecommendedMl: 2.0,
        instructions: 'Reconstitute 10mg with 2.0 mL BAC Water (5.0 mg/mL) or 15mg with 3.0 mL BAC Water.'
      }
    },
    variants: [
      {
        id: 'api-tirz-10mg',
        name: 'Tirzepatide 10mg Lyophilized Vial',
        dosage: '10 mg',
        format: 'lyophilized_vial',
        supplier: 'Magenta',
        supplierName: 'Magenta Compounding',
        stock: 310,
        inStock: true,
        moq: 1,
        purity: 99.6,
        pricing: {
          masterPrice: { base: 145.00, currency: 'USD' },
          retailPrice: { base: 275.00, currency: 'USD' },
          clinicPrice: { base: 175.00, currency: 'USD' },
          wholesalePrice: { base: 125.00, currency: 'USD' }
        },
        cost_tiers: { cost_1: 85.00, cost_10: 72.00, cost_50: 58.00 }
      },
      {
        id: 'api-tirz-15mg',
        name: 'Tirzepatide 15mg Lyophilized Vial',
        dosage: '15 mg',
        format: 'lyophilized_vial',
        supplier: 'Magenta',
        supplierName: 'Magenta Compounding',
        stock: 250,
        inStock: true,
        moq: 1,
        purity: 99.7,
        pricing: {
          masterPrice: { base: 195.00, currency: 'USD' },
          retailPrice: { base: 360.00, currency: 'USD' },
          clinicPrice: { base: 235.00, currency: 'USD' },
          wholesalePrice: { base: 165.00, currency: 'USD' }
        },
        cost_tiers: { cost_1: 110.00, cost_10: 95.00, cost_50: 79.00 }
      },
      {
        id: 'api-tirz-1g-bulk',
        name: 'Tirzepatide API Bulk Raw Powder 1000mg (1g)',
        dosage: '1000 mg (1g)',
        format: 'bulk_powder_gram',
        supplier: 'Magenta',
        supplierName: 'Magenta Compounding',
        stock: 8,
        inStock: true,
        moq: 1,
        purity: 99.8,
        pricing: {
          masterPrice: { base: 5800.00, currency: 'USD' },
          retailPrice: { base: 8900.00, currency: 'USD' },
          clinicPrice: { base: 6900.00, currency: 'USD' },
          wholesalePrice: { base: 4900.00, currency: 'USD' }
        },
        cost_tiers: { cost_1: 3600.00, cost_10: 3100.00 }
      }
    ]
  },
  {
    id: 'api-nadplus-lyo',
    name: 'NAD+ (Nicotinamide Adenine Dinucleotide) Lyophilized API',
    canonicalName: 'NAD+',
    productType: 'raw_material',
    category: 'Cellular Longevity & Mitochondria',
    subcategory: 'Lyophilized Peptide APIs',
    description: 'Essential cellular coenzyme for sirtuin activation, DNA repair (PARP), and mitochondrial bioenergetics. Ultra-stable lyophilized cake.',
    isActive: true,
    status: 'published',
    requiresColdChain: true,
    requiresPrescription: true,
    molecular: {
      casNumber: '53-84-9',
      molecularFormula: 'C21H27N7O14P2',
      molecularWeight: 663.43
    },
    apiSpecs: {
      purityPercentage: 99.5,
      grade: 'pharma_compounding',
      counterIon: 'free_base',
      appearance: 'White to faint yellow lyophilized cake',
      solubility: 'Freely soluble in Sterile Saline 0.9% or Sterile Water',
      storageConditionLyophilized: '-20°C (Hygroscopic, keep desiccated)',
      storageConditionReconstituted: '2°C to 8°C (Protect from light)',
      shelfLifeMonthsLyophilized: 24,
      shelfLifeDaysReconstituted: 21,
      reconstitutionGuide: {
        diluentRecommended: '0.9% Sodium Chloride for Injection',
        volumeRecommendedMl: 10.0,
        instructions: 'Reconstitute 500mg or 1000mg with 10 mL 0.9% NaCl for IV Infusion or SubQ protocol compounding.'
      }
    },
    variants: [
      {
        id: 'api-nad-500mg',
        name: 'NAD+ 500mg Lyophilized IV/SubQ Vial',
        dosage: '500 mg',
        format: 'lyophilized_vial',
        supplier: 'NP LABS',
        supplierName: 'NP LABS Compounding',
        stock: 180,
        inStock: true,
        moq: 1,
        purity: 99.5,
        pricing: {
          masterPrice: { base: 120.00, currency: 'USD' },
          retailPrice: { base: 220.00, currency: 'USD' },
          clinicPrice: { base: 145.00, currency: 'USD' },
          wholesalePrice: { base: 98.00, currency: 'USD' }
        },
        cost_tiers: { cost_1: 65.00, cost_10: 55.00, cost_50: 44.00 }
      },
      {
        id: 'api-nad-1000mg',
        name: 'NAD+ 1000mg (1g) Lyophilized IV Vial',
        dosage: '1000 mg',
        format: 'lyophilized_vial',
        supplier: 'NP LABS',
        supplierName: 'NP LABS Compounding',
        stock: 120,
        inStock: true,
        moq: 1,
        purity: 99.7,
        pricing: {
          masterPrice: { base: 195.00, currency: 'USD' },
          retailPrice: { base: 360.00, currency: 'USD' },
          clinicPrice: { base: 240.00, currency: 'USD' },
          wholesalePrice: { base: 165.00, currency: 'USD' }
        },
        cost_tiers: { cost_1: 110.00, cost_10: 94.00, cost_50: 78.00 }
      }
    ]
  },
  {
    id: 'api-bac-water',
    name: 'Bacteriostatic Water for Injection USP (0.9% Benzyl Alcohol)',
    canonicalName: 'BAC Water',
    productType: 'raw_material',
    category: 'Reconstitution Diluents',
    subcategory: 'Reconstitution Diluents',
    description: 'Sterile, non-pyrogenic water containing 0.9% (9 mg/mL) benzyl alcohol added as a bacteriostatic preservative for multiple-dose reconstitution of lyophilized peptides.',
    isActive: true,
    status: 'published',
    requiresColdChain: false,
    requiresPrescription: false,
    apiSpecs: {
      purityPercentage: 100,
      grade: 'gmp',
      appearance: 'Clear, colorless liquid',
      storageConditionLyophilized: '15°C to 25°C (Room Temp)',
      storageConditionReconstituted: '15°C to 25°C',
      shelfLifeMonthsLyophilized: 36,
      shelfLifeDaysReconstituted: 28
    },
    variants: [
      {
        id: 'bac-water-30ml',
        name: 'Bacteriostatic Water USP 30mL Vial',
        dosage: '30 mL',
        format: 'lyophilized_vial',
        supplier: 'Fagron Compounding',
        supplierName: 'Fagron Compounding Pharmacy',
        stock: 500,
        inStock: true,
        moq: 1,
        pricing: {
          masterPrice: { base: 12.00, currency: 'USD' },
          retailPrice: { base: 22.00, currency: 'USD' },
          clinicPrice: { base: 15.00, currency: 'USD' },
          wholesalePrice: { base: 9.50, currency: 'USD' }
        },
        cost_tiers: { cost_1: 6.00, cost_10: 4.80, cost_50: 3.50 }
      }
    ]
  }
];

/**
 * Executes direct upload of lyophilized API products to Firestore
 */
export async function seedLyophilizedPeptidesToFirestore() {
  if (!db) throw new Error("Firestore instance not found");
  
  console.log(`[SeedAPI] Seeding ${LYOPHILIZED_PEPTIDES_API_CATALOG.length} Lyophilized Peptides APIs to Firestore...`);
  
  for (const product of LYOPHILIZED_PEPTIDES_API_CATALOG) {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, {
      ...product,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });
    console.log(`[SeedAPI] Seeded: ${product.name} (${product.id})`);
  }
  
  return { success: true, count: LYOPHILIZED_PEPTIDES_API_CATALOG.length };
}
