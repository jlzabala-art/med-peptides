/**
 * scripts/sync_invoice_api_prices_to_products.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Synchronizes the verified per-gram procurement prices from the 10 Lotusland
 * Commercial Invoices directly into the Firestore `products` catalog.
 *
 * Sets:
 *   - categoryId: 'raw_material'
 *   - category: 'api_raw_materials'
 *   - costPerGram (USD or EUR)
 *   - pricePerGram (with standard 15% wholesale compounding margin)
 *   - lastInvoiceRef (e.g. MY20260406021Y)
 *   - lastInvoiceDate
 *   - supplier: 'Lotusland Limited'
 *   - status: 'published'
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

if (!getApps().length) {
  const saPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(saPath)) {
    const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    initializeApp({ credential: cert(sa) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

// Master list of 41 APIs extracted from the 10 Lotusland Commercial Invoices
export const INVOICE_APIS = [
  {
    slug: 'api-enclomiphene',
    name: 'Enclomiphene Citrate API',
    canonicalName: 'Enclomiphene',
    costPerGram: 17.89, // bulk 500g rate; small pack is $50.00
    smallPackCostPerGram: 50.00,
    currency: 'USD',
    lastInvoiceRef: 'MY20260506021Y',
    lastInvoiceDate: '2026-05-06',
    casNumber: '15690-57-0',
    grade: 'USP / cGMP Pharmaceutical Grade',
    format: 'White Crystalline Powder',
    therapeuticClass: 'Endocrinology / SERM'
  },
  {
    slug: 'api-vip',
    name: 'VIP (Vasoactive Intestinal Peptide) API',
    canonicalName: 'Vasoactive Intestinal Peptide',
    costPerGram: 1947.75,
    currency: 'USD',
    lastInvoiceRef: 'MY20260506021Y',
    lastInvoiceDate: '2026-05-06',
    casNumber: '40077-57-4',
    grade: '≥99.0% HPLC Analytical Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Immune & CIRS Modulation'
  },
  {
    slug: 'api-5-amino-1mq',
    name: '5-Amino-1MQ API',
    canonicalName: '5-Amino-1MQ',
    costPerGram: 23.85,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '42464-96-0',
    grade: '≥98.5% NNMT Inhibitor Grade',
    format: 'Crystalline Powder',
    therapeuticClass: 'Metabolic & Fat Loss'
  },
  {
    slug: 'api-cartalax',
    name: 'Cartalax API',
    canonicalName: 'Cartalax (Ala-Glu-Asp)',
    costPerGram: 2365.13,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '161040-51-1',
    grade: '≥99.0% HPLC Bioregulator Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Cartilage Bioregulator'
  },
  {
    slug: 'api-thymogen',
    name: 'Thymogen (Glu-Trp) API',
    canonicalName: 'Thymogen',
    costPerGram: 2583.75,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '118428-85-6',
    grade: '≥99.0% HPLC Bioregulator Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Thymic Immune Bioregulator'
  },
  {
    slug: 'api-prostamax',
    name: 'Prostamax API',
    canonicalName: 'Prostamax',
    costPerGram: 2583.75,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    grade: '≥99.0% HPLC Bioregulator Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Prostate Bioregulator'
  },
  {
    slug: 'api-testagen',
    name: 'Testagen API',
    canonicalName: 'Testagen',
    costPerGram: 2369.10,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    grade: '≥99.0% HPLC Bioregulator Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Testicular Bioregulator'
  },
  {
    slug: 'api-cagrilintide',
    name: 'Cagrilintide Bulk API',
    canonicalName: 'Cagrilintide',
    costPerGram: 2365.13,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '1415456-99-3',
    grade: '≥99.0% HPLC Amylin Analog Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Weight Management / Dual Agonist'
  },
  {
    slug: 'api-hmg',
    name: 'HMG (Human Menopausal Gonadotropin) API',
    canonicalName: 'HMG',
    costPerGram: 1272.00,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '61489-71-2',
    grade: 'USP / cGMP Compounding Grade',
    format: 'Lyophilized Powder',
    therapeuticClass: 'Fertility & Endocrine'
  },
  {
    slug: 'api-mk-677',
    name: 'MK-677 (Ibutamoren) API',
    canonicalName: 'Ibutamoren',
    costPerGram: 55.65,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '159752-10-0',
    grade: '≥99.0% Oral Secretagogue Grade',
    format: 'Fine White Powder',
    therapeuticClass: 'GH Secretagogue / Anabolism'
  },
  {
    slug: 'api-gw-501516',
    name: 'GW-501516 (Cardarine) API',
    canonicalName: 'Cardarine',
    costPerGram: 23.85,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '317318-70-0',
    grade: '≥99.0% PPAR-δ Agonist Grade',
    format: 'Crystalline Powder',
    therapeuticClass: 'Endurance & Lipid Oxidation'
  },
  {
    slug: 'api-ara-290',
    name: 'ARA-290 (Cibinetide) API',
    canonicalName: 'Cibinetide',
    costPerGram: 2146.50,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '1208118-39-1',
    grade: '≥99.0% Innate Repair Receptor Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Neuropathic Pain & Repair'
  },
  {
    slug: 'api-cardiogen',
    name: 'Cardiogen API',
    canonicalName: 'Cardiogen',
    costPerGram: 2663.25,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '920014-72-8',
    grade: '≥99.0% HPLC Bioregulator Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Myocardial Bioregulator'
  },
  {
    slug: 'api-mt-2',
    name: 'Melanotan II (MT-2) API',
    canonicalName: 'Melanotan II',
    costPerGram: 898.35,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '121062-08-6',
    grade: '≥99.0% HPLC Certified',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Melanocortin Agonist'
  },
  {
    slug: 'api-pinealon',
    name: 'Pinealon API',
    canonicalName: 'Pinealon',
    costPerGram: 2444.63,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '161040-53-3',
    grade: '≥99.0% HPLC Bioregulator Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Neuroprotective Bioregulator'
  },
  {
    slug: 'api-pe-22-28',
    name: 'PE-22-28 API',
    canonicalName: 'PE-22-28',
    costPerGram: 2424.75,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '2418376-79-1',
    grade: '≥99.0% TREK-1 Channel Blocker Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Neuroplasticity & Mood'
  },
  {
    slug: 'api-peg-mgf',
    name: 'PEG-MGF API',
    canonicalName: 'PEG-MGF',
    costPerGram: 6519.00,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    grade: '≥99.0% Pegylated Splice Variant Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Muscle Hypertrophy & Repair'
  },
  {
    slug: 'api-snap-8',
    name: 'SNAP-8 Acetate API',
    canonicalName: 'SNAP-8',
    costPerGram: 556.50,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '868844-74-0',
    grade: '≥99.0% Cosmetic / Compounding Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Neuromuscular Peptide'
  },
  {
    slug: 'api-thymulin',
    name: 'Thymulin API',
    canonicalName: 'Thymulin',
    costPerGram: 1987.50,
    currency: 'USD',
    lastInvoiceRef: 'MY20260420101Y',
    lastInvoiceDate: '2026-04-20',
    casNumber: '63958-90-7',
    grade: '≥99.0% HPLC Zinc-Bound Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Thymic Immune Modulator'
  },
  {
    slug: 'api-dsip',
    name: 'DSIP (Delta Sleep-Inducing Peptide) Acetate API',
    canonicalName: 'DSIP',
    costPerGram: 803.25,
    currency: 'USD',
    lastInvoiceRef: 'MY20260414096Y',
    lastInvoiceDate: '2026-04-14',
    casNumber: '62568-57-4',
    grade: '≥99.0% HPLC Certified',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Neurology / Restorative Sleep'
  },
  {
    slug: 'api-igf-1-lr3',
    name: 'IGF-1 LR3 Bulk API',
    canonicalName: 'IGF-1 LR3',
    costPerGram: 21262.50, // $21.26 per mg
    currency: 'USD',
    lastInvoiceRef: 'MY20260414096Y',
    lastInvoiceDate: '2026-04-14',
    casNumber: '949837-92-9',
    grade: '≥98.5% Recombinant Human Long-R3',
    format: 'Lyophilized Powder',
    therapeuticClass: 'Growth Factors & Anabolism'
  },
  {
    slug: 'api-cjc-1295-no-dac',
    name: 'CJC-1295 (without DAC / Mod GRF 1-29) Acetate API',
    canonicalName: 'CJC-1295 No DAC',
    costPerGram: 2165.63,
    currency: 'USD',
    lastInvoiceRef: 'MY20260414096Y',
    lastInvoiceDate: '2026-04-14',
    casNumber: '863288-34-0',
    grade: '≥99.0% HPLC Certified',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'GHRH Secretagogue'
  },
  {
    slug: 'api-thymosin-alpha-1',
    name: 'Thymosin Alpha-1 Acetate API',
    canonicalName: 'Thymosin Alpha-1',
    costPerGram: 1470.00, // list was $1732.50, reduced to $1470.00 in bulk
    currency: 'USD',
    lastInvoiceRef: 'MY20260224021Y',
    lastInvoiceDate: '2026-02-24',
    casNumber: '62304-98-7',
    grade: '≥99.0% HPLC Certified',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Immunomodulation / Oncology'
  },
  {
    slug: 'api-hcg',
    name: 'HCG (Human Chorionic Gonadotropin) Pure API',
    canonicalName: 'HCG',
    costPerGram: 17850.00,
    currency: 'USD',
    lastInvoiceRef: 'MY20260406021Y',
    lastInvoiceDate: '2026-04-06',
    casNumber: '9002-61-3',
    grade: 'USP / cGMP Sterile Compounding Grade',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Endocrinology / Fertility'
  },
  {
    slug: 'api-humanin',
    name: 'Humanin API',
    canonicalName: 'Humanin',
    costPerGram: 3453.19,
    currency: 'USD',
    lastInvoiceRef: 'MY20260406021Y',
    lastInvoiceDate: '2026-04-06',
    casNumber: '330936-69-1',
    grade: '≥99.0% Mitochondrial Derived Peptide',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Mitochondrial Cytoprotection'
  },
  {
    slug: 'api-ipamorelin',
    name: 'Ipamorelin API',
    canonicalName: 'Ipamorelin',
    costPerGram: 338.63,
    currency: 'USD',
    lastInvoiceRef: 'MY20260406021Y',
    lastInvoiceDate: '2026-04-06',
    casNumber: '170851-70-4',
    grade: '≥99.0% HPLC Certified',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Selective GH Secretagogue'
  },
  {
    slug: 'api-mgf',
    name: 'MGF (Mechano Growth Factor) API',
    canonicalName: 'Mechano Growth Factor',
    costPerGram: 2551.50,
    currency: 'USD',
    lastInvoiceRef: 'MY20260406021Y',
    lastInvoiceDate: '2026-04-06',
    grade: '≥99.0% HPLC Certified',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Tissue Repair & Hypertrophy'
  },
  {
    slug: 'api-thymosin-beta-4',
    name: 'Thymosin Beta-4 / TB-500 Acetate API',
    canonicalName: 'Thymosin Beta-4',
    costPerGram: 1607.29,
    currency: 'USD',
    lastInvoiceRef: 'MY20260406021Y',
    lastInvoiceDate: '2026-04-06',
    casNumber: '77591-33-4',
    grade: '≥99.0% HPLC Certified',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Actin-Sequestering Repair'
  },
  {
    slug: 'api-aod-9604',
    name: 'AOD-9604 Acetate API',
    canonicalName: 'AOD-9604',
    costPerGram: 1475.52,
    currency: 'USD',
    lastInvoiceRef: 'MY20260309021Y',
    lastInvoiceDate: '2026-03-09',
    casNumber: '221231-10-3',
    grade: '≥99.0% HPLC Certified',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Lipolytic Fragment'
  },
  {
    slug: 'api-sermorelin',
    name: 'Sermorelin Acetate API',
    canonicalName: 'Sermorelin',
    costPerGram: 1318.81,
    currency: 'USD',
    lastInvoiceRef: 'MY20260309021Y',
    lastInvoiceDate: '2026-03-09',
    casNumber: '86168-78-7',
    grade: '≥99.0% HPLC Certified',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Pituitary GHRH Agonist'
  },
  {
    slug: 'api-kisspeptin-10',
    name: 'Kisspeptin-10 API',
    canonicalName: 'Kisspeptin-10',
    costPerGram: 750.00, // list $937, discounted $750.00
    currency: 'USD',
    lastInvoiceRef: 'MY20260224021Y',
    lastInvoiceDate: '2026-02-24',
    casNumber: '374675-21-5',
    grade: '≥99.0% GPR54 Receptor Agonist',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Hypothalamic-Pituitary-Gonadal Axis'
  },
  {
    slug: 'api-dihexa',
    name: 'Dihexa Acetate API',
    canonicalName: 'Dihexa',
    costPerGram: 254.80,
    currency: 'USD',
    lastInvoiceRef: 'MY20260224021Y',
    lastInvoiceDate: '2026-02-24',
    casNumber: '1401708-83-5',
    grade: '≥99.0% HGF/c-Met Modulator',
    format: 'Fine White Powder',
    therapeuticClass: 'Nootropic & Synaptogenesis'
  },
  {
    slug: 'api-kpv',
    name: 'KPV Acetate API',
    canonicalName: 'KPV',
    costPerGram: 604.70,
    currency: 'USD',
    lastInvoiceRef: 'MY20260224021Y',
    lastInvoiceDate: '2026-02-24',
    casNumber: '67727-97-3',
    grade: '≥99.0% C-Terminal Tripeptide',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Mucosal & Gut Anti-Inflammatory'
  },
  {
    slug: 'api-pt-141',
    name: 'PT-141 (Bremelanotide) Acetate API',
    canonicalName: 'Bremelanotide',
    costPerGram: 707.30,
    currency: 'USD',
    lastInvoiceRef: 'MY20260224021Y',
    lastInvoiceDate: '2026-02-24',
    casNumber: '189745-66-9',
    grade: '≥99.0% Melanocortin MC3R/MC4R',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Sexual Health & Neuroendocrine'
  },
  {
    slug: 'api-semax',
    name: 'Semax API',
    canonicalName: 'Semax',
    costPerGram: 550.00,
    currency: 'USD',
    lastInvoiceRef: 'MY20260204022Y',
    lastInvoiceDate: '2026-02-04',
    casNumber: '80714-61-0',
    grade: '≥99.0% ACTH 4-10 Analog',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Neuroprotection & BDNF'
  },
  {
    slug: 'api-selank',
    name: 'Selank API',
    canonicalName: 'Selank',
    costPerGram: 550.00,
    currency: 'USD',
    lastInvoiceRef: 'MY20260204022Y',
    lastInvoiceDate: '2026-02-04',
    casNumber: '129954-34-3',
    grade: '≥99.0% Tuftsin Analog',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Anxiolytic & Cognitive'
  },
  {
    slug: 'api-epithalon',
    name: 'Epithalon (Epitalon) API',
    canonicalName: 'Epithalon',
    costPerGram: 350.00,
    currency: 'USD',
    lastInvoiceRef: 'MY20260204022Y',
    lastInvoiceDate: '2026-02-04',
    casNumber: '307297-39-8',
    grade: '≥99.0% Pineal Telomerase Bioregulator',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Telomere & Longevity'
  },
  {
    slug: 'api-bpc-157',
    name: 'BPC-157 Acetate API',
    canonicalName: 'BPC-157',
    costPerGram: 600.00,
    currency: 'USD',
    lastInvoiceRef: 'MY20260204022Y',
    lastInvoiceDate: '2026-02-04',
    casNumber: '137525-51-0',
    grade: '≥99.0% Gastric Pentadecapeptide',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Angiogenesis & Tissue Repair'
  },
  {
    slug: 'api-tirzepatide',
    name: 'Tirzepatide Bulk API',
    canonicalName: 'Tirzepatide',
    costPerGram: 450.00,
    currency: 'USD',
    lastInvoiceRef: 'MY20260204022Y',
    lastInvoiceDate: '2026-02-04',
    casNumber: '2023788-19-2',
    grade: '≥99.0% Dual GIP/GLP-1 Agonist',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Endocrinology & Weight Management'
  },
  {
    slug: 'api-tesamorelin',
    name: 'Tesamorelin Acetate API',
    canonicalName: 'Tesamorelin',
    costPerGram: 2114.10, // list $2,818.80 less 25% discount = $2,114.10
    currency: 'USD',
    lastInvoiceRef: 'MY20260124018Y',
    lastInvoiceDate: '2025-01-24',
    casNumber: '218949-48-5',
    grade: '≥99.0% Trans-3-Hexenoyl GHRH',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Visceral Adiposity & GHRH'
  },
  {
    slug: 'api-mots-c',
    name: 'MOTS-c Acetate API',
    canonicalName: 'MOTS-c',
    costPerGram: 808.77, // €744.29 net after 25.6% discount converted to USD @ 1.0866
    costPerGramEur: 744.29,
    currency: 'USD',
    lastInvoiceRef: 'MY20251230038Y',
    lastInvoiceDate: '2025-12-30',
    casNumber: '1627580-64-6',
    grade: '≥99.0% Mitochondrial Derived Peptide',
    format: 'Lyophilized Bulk Powder',
    therapeuticClass: 'Metabolic & Mitochondrial Flexibility'
  }
];

async function syncApiPrices() {
  console.log(`🚀 Synchronizing ${INVOICE_APIS.length} API Raw Material prices from Lotusland invoices to Firestore 'products'...`);

  const batch = db.batch();
  let count = 0;

  for (const api of INVOICE_APIS) {
    const docRef = db.collection('products').doc(api.slug);
    
    // Calculate 15% standard wholesale markup
    const marginPct = 0.15;
    const wholesalePricePerGram = Math.round((api.costPerGram * (1 + marginPct)) * 100) / 100;

    const payload = {
      id: api.slug,
      slug: api.slug,
      name: api.name,
      productName: api.name,
      displayName: api.name,
      canonicalName: api.canonicalName,
      casNumber: api.casNumber || null,
      grade: api.grade,
      format: api.format,
      therapeuticClass: api.therapeuticClass,
      
      // Categorization for Master Catalog
      categoryId: 'raw_material',
      category: 'api_raw_materials',
      type: 'raw_api',
      productType: 'raw_api',
      
      // Pricing
      currency: api.currency,
      costPerGram: api.costPerGram,
      costPerGramEur: api.costPerGramEur || null,
      pricePerGram: wholesalePricePerGram,
      price: wholesalePricePerGram,
      basePrice: wholesalePricePerGram,
      unit: 'g',
      packUnits: 'g',
      
      // Commercial Margin
      marginPercent: 15.0,
      
      // Supplier & Provenance
      supplierId: 'OLlBbQjgrj6tY7GmM2Jo',
      supplierName: 'Lotusland Limited',
      supplierBrand: 'Lotusland Research / RegenPept',
      lastInvoiceRef: api.lastInvoiceRef,
      lastInvoiceDate: api.lastInvoiceDate,
      
      // Status
      status: 'published',
      isActive: true,
      updatedAt: new Date().toISOString()
    };

    batch.set(docRef, payload, { merge: true });
    count++;
    console.log(`  ✓ Synced ${api.name} -> Cost: $${api.costPerGram}/g | Wholesale: $${wholesalePricePerGram}/g (Ref: ${api.lastInvoiceRef})`);
  }

  await batch.commit();
  console.log(`\n🎉 SUCCESS: All ${count} API raw materials synchronized into Firestore 'products' catalog!`);
}

syncApiPrices().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
