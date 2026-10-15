/**
 * ingest_lotusland_peptide_apis.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Ingests all 51 Lotusland Bulk API (Raw Material) Peptides into Firestore.
 * 
 * Rules:
 * 1. Strictly 'raw_material' (Bulk API Powder), NEVER 'finished_product'.
 * 2. Table of Truth (Image 3 - 35 items): Uses 'Unit Cost g with Discount' directly as net cost,
 *    records MOQ in grams, and lead time 'In stock'.
 * 3. Previous items (Images 1 & 2 - 16 unique items): Net cost = Price * 0.95 (5% discount).
 * 4. Dual / Hybrid products: If product already has finished products (e.g. vials), marks
 *    availableTypes: ['finished_product', 'raw_material'] and isHybrid: true.
 * 5. Writes to both embedded variants[] array and products/{id}/variants/{variantId} subcollection.
 * 6. Creates quotation document in supplier_quotations.
 * 7. Recalculates _meta/catalog_facets.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!getApps().length) {
  const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

// ── 35 Items from Table of Truth (Quotation. API by LotusLand) ───────────────
const TRUTH_TABLE_ITEMS = [
  {
    name: 'IGF-1 LR3',
    productId: 'igf-1-lr3',
    rawName: 'IGF',
    moq: 0.1,
    leadTime: 'In stock',
    grossCostPerGram: 27000.00,
    discountPercent: 28,
    netCostPerGram: 19440.00,
    category: 'growth_hormone',
    goals: ['muscle_recovery', 'anti_aging']
  },
  {
    name: 'Alprostadil',
    productId: 'alprostadil',
    rawName: 'Alprostadil',
    moq: 1,
    leadTime: 'In stock',
    grossCostPerGram: 4930.00,
    discountPercent: 28,
    netCostPerGram: 3549.60,
    category: 'sexual_health',
    goals: ['sexual_wellness']
  },
  {
    name: 'hCG',
    productId: 'hcg',
    rawName: 'HCG',
    moq: 1,
    leadTime: 'In stock',
    grossCostPerGram: 23200.00,
    discountPercent: 28,
    netCostPerGram: 16704.00,
    category: 'hormone_optimization',
    goals: ['vitality', 'fertility']
  },
  {
    name: 'Melanotan II',
    productId: 'melanotan-ii',
    rawName: 'Melanotan',
    moq: 1,
    leadTime: 'In stock',
    grossCostPerGram: 1218.00,
    discountPercent: 28,
    netCostPerGram: 876.96,
    category: 'cosmetic_tanning',
    goals: ['skin_pigmentation', 'libido']
  },
  {
    name: 'MGF',
    productId: 'mgf',
    rawName: 'MGF',
    moq: 1,
    leadTime: 'In stock',
    grossCostPerGram: 3240.00,
    discountPercent: 28,
    netCostPerGram: 2332.80,
    category: 'muscle_recovery',
    goals: ['muscle_hypertrophy', 'tissue_repair']
  },
  {
    name: 'Sermorelin',
    productId: 'sermorelin',
    rawName: 'Sermorelin',
    moq: 1,
    leadTime: 'In stock',
    grossCostPerGram: 2750.00,
    discountPercent: 28,
    netCostPerGram: 1980.00,
    category: 'growth_hormone',
    goals: ['gh_optimization', 'vitality']
  },
  {
    name: 'Oxytocin',
    productId: 'oxytocin',
    rawName: 'Oxytocin',
    moq: 1,
    leadTime: 'In stock',
    grossCostPerGram: 460.00,
    discountPercent: 28,
    netCostPerGram: 331.20,
    category: 'neuro_wellness',
    goals: ['mood_bonding', 'stress_reduction']
  },
  {
    name: 'Humanin',
    productId: 'humanin',
    rawName: 'Humamin',
    moq: 2,
    leadTime: 'In stock',
    grossCostPerGram: 4600.00,
    discountPercent: 28,
    netCostPerGram: 3312.00,
    category: 'mitochondrial_health',
    goals: ['cellular_longevity', 'neuroprotection']
  },
  {
    name: 'CJC-1295 (No DAC)',
    productId: 'cjc-1295-no-dac',
    rawName: 'CJC-1295 Acetate',
    moq: 5,
    leadTime: 'In stock',
    grossCostPerGram: 4300.00,
    discountPercent: 28,
    netCostPerGram: 3096.00,
    category: 'growth_hormone',
    goals: ['gh_optimization', 'recovery']
  },
  {
    name: 'AOD-9604',
    productId: 'aod-9604',
    rawName: 'AOD 9604 Acetate',
    moq: 5,
    leadTime: 'In stock',
    grossCostPerGram: 2856.00,
    discountPercent: 28,
    netCostPerGram: 2056.32,
    category: 'metabolism_weight',
    goals: ['fat_loss', 'cartilage_repair']
  },
  {
    name: 'Thymosin Alpha-1',
    productId: 'thymosin-alpha-1',
    rawName: 'Thymosin Alpha',
    moq: 5,
    leadTime: 'In stock',
    grossCostPerGram: 2843.00,
    discountPercent: 28,
    netCostPerGram: 2046.67,
    category: 'immune_modulation',
    goals: ['immune_defense', 'longevity']
  },
  {
    name: 'DSIP',
    productId: 'dsip',
    rawName: 'DSIP',
    moq: 3,
    leadTime: 'In stock',
    grossCostPerGram: 1160.00,
    discountPercent: 28,
    netCostPerGram: 835.20,
    category: 'sleep_recovery',
    goals: ['deep_sleep', 'circadian_rhythm']
  },
  {
    name: 'Thymosin Beta-4',
    productId: 'thymosin-beta-4',
    rawName: 'Thymosin Beta',
    moq: 10,
    leadTime: 'In stock',
    grossCostPerGram: 2442.00,
    discountPercent: 28,
    netCostPerGram: 1757.95,
    category: 'tissue_repair',
    goals: ['cellular_healing', 'tissue_regeneration']
  },
  {
    name: 'TB-500',
    productId: 'tb-500',
    rawName: 'TB500',
    moq: 10,
    leadTime: 'In stock',
    grossCostPerGram: 1281.00,
    discountPercent: 28,
    netCostPerGram: 922.26,
    category: 'tissue_repair',
    goals: ['injury_recovery', 'flexibility']
  },
  {
    name: 'Ipamorelin',
    productId: 'ipamorelin',
    rawName: 'Ipamorelin',
    moq: 5,
    leadTime: 'In stock',
    grossCostPerGram: 1420.00,
    discountPercent: 28,
    netCostPerGram: 1022.40,
    category: 'growth_hormone',
    goals: ['gh_release', 'body_composition']
  },
  {
    name: 'Selank',
    productId: 'selank',
    rawName: 'Selank',
    moq: 20,
    leadTime: 'In stock',
    grossCostPerGram: 640.00,
    discountPercent: 28,
    netCostPerGram: 460.80,
    category: 'nootropics',
    goals: ['anxiolytic', 'focus_cognition']
  },
  {
    name: 'Epithalon',
    productId: 'epithalon',
    rawName: 'Epitahalon',
    moq: 20,
    leadTime: 'In stock',
    grossCostPerGram: 598.00,
    discountPercent: 28,
    netCostPerGram: 430.59,
    category: 'longevity',
    goals: ['telomere_lengthening', 'pineal_rejuvenation']
  },
  {
    name: 'Semax',
    productId: 'semax',
    rawName: 'Semax',
    moq: 20,
    leadTime: 'In stock',
    grossCostPerGram: 640.00,
    discountPercent: 28,
    netCostPerGram: 460.80,
    category: 'nootropics',
    goals: ['bdnf_activation', 'memory_retention']
  },
  {
    name: 'Kisspeptin-10',
    productId: 'kisspeptin-10',
    rawName: 'Kisspeptin',
    moq: 5,
    leadTime: 'In stock',
    grossCostPerGram: 1300.00,
    discountPercent: 28,
    netCostPerGram: 936.00,
    category: 'hormone_optimization',
    goals: ['lh_fsh_stimulation', 'fertility']
  },
  {
    name: 'PT-141 (Bremelanotide)',
    productId: 'pt-141',
    rawName: 'Bremelanotide',
    moq: 15,
    leadTime: 'In stock',
    grossCostPerGram: 978.00,
    discountPercent: 28,
    netCostPerGram: 704.29,
    category: 'sexual_health',
    goals: ['libido_activation', 'mc4r_agonist']
  },
  {
    name: 'KPV',
    productId: 'kpv',
    rawName: 'KPV',
    moq: 5,
    leadTime: 'In stock',
    grossCostPerGram: 854.00,
    discountPercent: 28,
    netCostPerGram: 614.71,
    category: 'anti_inflammatory',
    goals: ['gut_healing', 'mast_cell_stabilization']
  },
  {
    name: 'Tesamorelin',
    productId: 'tesamorelin',
    rawName: 'Tesamorelin',
    moq: 15,
    leadTime: 'In stock',
    grossCostPerGram: 2819.00,
    discountPercent: 28,
    netCostPerGram: 2029.54,
    category: 'growth_hormone',
    goals: ['visceral_fat_loss', 'gh_optimization']
  },
  {
    name: 'BPC-157',
    productId: 'bpc-157',
    rawName: 'BPC-157',
    moq: 15,
    leadTime: 'In stock',
    grossCostPerGram: 780.00,
    discountPercent: 28,
    netCostPerGram: 561.60,
    category: 'tissue_repair',
    goals: ['tendon_gut_healing', 'angiogenesis']
  },
  {
    name: 'SS-31 (Elamipretide)',
    productId: 'ss-31',
    rawName: 'SS-31',
    moq: 10,
    leadTime: 'In stock',
    grossCostPerGram: 780.00,
    discountPercent: 28,
    netCostPerGram: 561.60,
    category: 'mitochondrial_health',
    goals: ['cardiolipin_protection', 'atp_restoration']
  },
  {
    name: 'Tirzepatide',
    productId: 'tirzepatide',
    rawName: 'Tirzepatide',
    moq: 40,
    leadTime: 'In stock',
    grossCostPerGram: 450.00,
    discountPercent: 28,
    netCostPerGram: 324.00,
    category: 'metabolism_weight',
    goals: ['glp1_gip_dual_agonist', 'metabolic_optimization']
  },
  {
    name: 'GHK-Cu',
    productId: 'ghk-cu',
    rawName: 'GHK-Cu',
    moq: 50,
    leadTime: 'In stock',
    grossCostPerGram: 96.00,
    discountPercent: 28,
    netCostPerGram: 69.27,
    category: 'skin_hair_regeneration',
    goals: ['collagen_synthesis', 'stem_cell_activation']
  },
  {
    name: 'MOTS-C',
    productId: 'mots-c',
    rawName: 'Mots C',
    moq: 50,
    leadTime: 'In stock',
    grossCostPerGram: 1188.00,
    discountPercent: 28,
    netCostPerGram: 855.18,
    category: 'mitochondrial_health',
    goals: ['metabolic_flexibility', 'ampk_activation']
  },
  {
    name: 'Retatrutide',
    productId: 'retatrutide',
    rawName: 'Retatrutide',
    moq: 40,
    leadTime: 'In stock',
    grossCostPerGram: 1160.00,
    discountPercent: 28,
    netCostPerGram: 835.20,
    category: 'metabolism_weight',
    goals: ['triple_glp1_gip_gcgr_agonist', 'hepatic_fat_reduction']
  },
  {
    name: 'Dihexa',
    productId: 'dihexa',
    rawName: 'Dihexa Acetate',
    moq: 5,
    leadTime: 'In stock',
    grossCostPerGram: 353.00,
    discountPercent: 28,
    netCostPerGram: 253.80,
    category: 'nootropics',
    goals: ['synaptogenesis', 'hgfa_activation']
  },
  {
    name: 'GHRP-2',
    productId: 'ghrp-2',
    rawName: 'GHRP-2',
    moq: 2,
    leadTime: 'In stock',
    grossCostPerGram: 1450.00,
    discountPercent: 28,
    netCostPerGram: 1044.00,
    category: 'growth_hormone',
    goals: ['gh_secretagogue', 'vitality']
  },
  {
    name: 'Palmitoyl Tripeptide-5 (Syn-Coll API)',
    productId: 'palmitoyl-tripeptide-5',
    rawName: 'Palmitoyl Tripeptide -5',
    moq: 2,
    leadTime: 'In stock',
    grossCostPerGram: 1350.00,
    discountPercent: 28,
    netCostPerGram: 972.00,
    category: 'skin_anti_aging',
    goals: ['tgf_beta_activation', 'collagen_restoration']
  },
  {
    name: 'Argireline Acetate (Acetyl Hexapeptide-8 API)',
    productId: 'argireline-acetate',
    rawName: 'Argireline Acetate',
    moq: 2,
    leadTime: 'In stock',
    grossCostPerGram: 1150.00,
    discountPercent: 28,
    netCostPerGram: 828.00,
    category: 'skin_anti_aging',
    goals: ['snare_complex_inhibition', 'botox_like_relaxation']
  },
  {
    name: 'Nonapeptide-1 (Melanostatine-5 API)',
    productId: 'nonapeptide-1',
    rawName: 'Nonapeptide',
    moq: 2,
    leadTime: 'In stock',
    grossCostPerGram: 1350.00,
    discountPercent: 28,
    netCostPerGram: 972.00,
    category: 'skin_anti_aging',
    goals: ['melanin_inhibition', 'skin_brightening']
  },
  {
    name: 'Acetylhexapeptide',
    productId: 'acetylhexapeptide',
    rawName: 'Acetylhexapeptide',
    moq: 2,
    leadTime: 'In stock',
    grossCostPerGram: 1150.00,
    discountPercent: 28,
    netCostPerGram: 828.00,
    category: 'skin_anti_aging',
    goals: ['expression_wrinkle_reduction', 'muscle_relaxation']
  },
  {
    name: 'SLU-PP-332',
    productId: 'slu-pp-332',
    rawName: 'SLUPP-332',
    moq: 5,
    leadTime: 'In stock',
    grossCostPerGram: 160.00,
    discountPercent: 28,
    netCostPerGram: 115.20,
    category: 'exercise_mimetics',
    goals: ['err_alpha_agonist', 'endurance_mitochondrial_biogenesis']
  }
];

// ── 16 Unique Items from Images 1 & 2 (5% Cost Discount Rule) ────────────────
const ADDITIONAL_ITEMS_5PCT = [
  {
    name: '5-Amino-1MQ',
    productId: '5-amino-1mq',
    moq: 5,
    sellingPrice: 23.85,
    netCostPerGram: 22.66,
    category: 'metabolism_weight',
    goals: ['nnmt_inhibition', 'fat_loss']
  },
  {
    name: 'Cartalax',
    productId: 'cartalax',
    moq: 5,
    sellingPrice: 2365.13,
    netCostPerGram: 2246.87,
    category: 'tissue_repair',
    goals: ['cartilage_regeneration', 'joint_health']
  },
  {
    name: 'Thymogen',
    productId: 'thymogen',
    moq: 5,
    sellingPrice: 2583.75,
    netCostPerGram: 2454.56,
    category: 'immune_modulation',
    goals: ['thymus_peptide', 't_cell_activation']
  },
  {
    name: 'Testagen',
    productId: 'testagen',
    moq: 5,
    sellingPrice: 2369.10,
    netCostPerGram: 2250.65,
    category: 'hormone_optimization',
    goals: ['testicular_peptide', 'testosterone_support']
  },
  {
    name: 'Cagrilintide',
    productId: 'cagrilintide',
    moq: 5,
    sellingPrice: 2365.13,
    netCostPerGram: 2246.87,
    category: 'metabolism_weight',
    goals: ['amylin_analogue', 'satiety_signaling']
  },
  {
    name: 'HMG',
    productId: 'hmg',
    moq: 5,
    sellingPrice: 1272.00,
    netCostPerGram: 1208.40,
    category: 'hormone_optimization',
    goals: ['gonadotropin', 'spermatogenesis']
  },
  {
    name: 'ARA-290',
    productId: 'ara-290',
    moq: 5,
    sellingPrice: 2146.50,
    netCostPerGram: 2039.18,
    category: 'anti_inflammatory',
    goals: ['innate_repair_receptor', 'neuropathic_pain']
  },
  {
    name: 'Cardiogen',
    productId: 'cardiogen',
    moq: 5,
    sellingPrice: 2663.25,
    netCostPerGram: 2530.09,
    category: 'cardiovascular',
    goals: ['myocardial_bioregulation', 'vascular_health']
  },
  {
    name: 'Pinealon',
    productId: 'pinealon',
    moq: 5,
    sellingPrice: 2444.63,
    netCostPerGram: 2322.40,
    category: 'nootropics',
    goals: ['brain_bioregulation', 'cognitive_protection']
  },
  {
    name: 'PE-22-28',
    productId: 'pe-22-28',
    moq: 5,
    sellingPrice: 2424.75,
    netCostPerGram: 2303.51,
    category: 'neuro_wellness',
    goals: ['trek1_antagonist', 'rapid_antidepressant']
  },
  {
    name: 'PEG-MGF',
    productId: 'peg-mgf',
    moq: 5,
    sellingPrice: 6519.00,
    netCostPerGram: 6193.05,
    category: 'muscle_recovery',
    goals: ['pegylated_mgf', 'satellite_cell_activation']
  },
  {
    name: 'Thymulin',
    productId: 'thymulin',
    moq: 5,
    sellingPrice: 1987.50,
    netCostPerGram: 1888.13,
    category: 'immune_modulation',
    goals: ['zinc_dependent_thymic_hormone', 'immune_senescence']
  },
  {
    name: 'SNAP-8',
    productId: 'snap-8',
    moq: 5,
    sellingPrice: 556.50,
    netCostPerGram: 528.68,
    category: 'skin_anti_aging',
    goals: ['octapeptide_botox_mimetic', 'expression_wrinkles']
  },
  {
    name: 'MK-677',
    productId: 'mk-677',
    moq: 5,
    sellingPrice: 55.65,
    netCostPerGram: 52.87,
    category: 'growth_hormone',
    goals: ['ghrelin_receptor_agonist', 'gh_igf1_booster']
  },
  {
    name: 'Prostamax',
    productId: 'prostamax',
    moq: 5,
    sellingPrice: 2583.75,
    netCostPerGram: 2454.56,
    category: 'mens_health',
    goals: ['prostate_bioregulation', 'urinary_wellness']
  },
  {
    name: 'GW-501516',
    productId: 'gw501516',
    moq: 5,
    sellingPrice: 23.85,
    netCostPerGram: 22.66,
    category: 'exercise_mimetics',
    goals: ['ppar_delta_agonist', 'fatty_acid_oxidation']
  }
];

async function ingestAllLotuslandPeptideAPIs() {
  console.log(`\n======================================================`);
  console.log(`🧪 BATCH INGESTION: 51 Lotusland Bulk API (Raw Material) Peptides`);
  console.log(`======================================================\n`);

  const now = new Date().toISOString();
  let updatedProducts = 0;
  let createdProducts = 0;
  let createdVariants = 0;

  // Process 35 Truth Table items
  for (const item of TRUTH_TABLE_ITEMS) {
    const pRef = db.collection('products').doc(item.productId);
    const pDoc = await pRef.get();

    const moqGrams = item.moq;
    const netCost = item.netCostPerGram;
    const grossCost = item.grossCostPerGram;
    const batchTotalCost = Math.round(netCost * moqGrams * 100) / 100;
    const wholesalePerGram = Math.round(netCost * 1.25 * 100) / 100;
    const clinicPerGram = Math.round(netCost * 1.40 * 100) / 100;
    const retailPerGram = Math.round(netCost * 1.70 * 100) / 100;

    const variantId = `lotusland-${item.productId}-bulk-api-${moqGrams}g`;

    const variantPayload = {
      id: variantId,
      docId: variantId,
      productId: item.productId,
      canonicalId: item.productId,
      name: `${item.name} Bulk API Powder (${moqGrams}g MOQ)`,
      sku: `LOTUS-${item.productId.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${moqGrams}G-API`,
      
      // 🧪 STRICT API / RAW MATERIAL IDENTIFIERS
      type: 'raw_material',
      productType: 'raw_material',
      format: 'bulk_api',
      presentation: 'Bulk API Powder',
      presentationName: 'Bulk API Powder',
      dosage: `${moqGrams}g (Bulk API)`,
      dose: `${moqGrams}g`,
      unitOfMeasure: 'g',
      unit: 'g',
      
      // ⚖️ Mass & MOQ
      quantity: moqGrams,
      weightGrams: moqGrams,
      packageWeight: `${moqGrams}g`,
      moq: moqGrams,
      moqGrams: moqGrams,
      moqUnit: 'g',

      // 💰 Financial Breakdown
      pricePerGram: netCost,
      grossPricePerGram: grossCost,
      discountPercent: item.discountPercent || 28,
      costPrice: netCost,
      supplierCost: netCost,
      unit_cost: netCost,
      cost_per_gram: netCost,
      cost_1: netCost,
      cost_10: netCost,
      totalBatchCost: batchTotalCost,
      
      unit_price: netCost,
      price: netCost,
      wholesalePrice: wholesalePerGram,
      clinicPrice: clinicPerGram,
      retailPrice: retailPerGram,
      currency: 'USD',

      pricing: {
        master: {
          pricePerGram: netCost,
          perUnit: netCost,
          supplierCost: netCost,
          packageTotal: batchTotalCost,
          currency: 'USD'
        },
        wholesale: {
          pricePerGram: wholesalePerGram,
          perUnit: wholesalePerGram,
          packageTotal: Math.round(wholesalePerGram * moqGrams * 100) / 100,
          currency: 'USD'
        },
        clinic: {
          pricePerGram: clinicPerGram,
          perUnit: clinicPerGram,
          packageTotal: Math.round(clinicPerGram * moqGrams * 100) / 100,
          currency: 'USD'
        },
        retail: {
          pricePerGram: retailPerGram,
          perUnit: retailPerGram,
          packageTotal: Math.round(retailPerGram * moqGrams * 100) / 100,
          currency: 'USD'
        }
      },

      supplierId: 'supplier-lotusland',
      supplierName: 'Lotusland Limited',
      supplier: 'LotusLand',
      stockType: 'on_demand',
      stock: 100,
      inStock: true,
      isDemand: true,
      leadTime: item.leadTime || 'In stock',
      status: 'active',
      isActive: true,
      updatedAt: now,
      createdAt: now
    };

    if (pDoc.exists) {
      const pData = pDoc.data();
      const existingVariants = Array.isArray(pData.variants) ? [...pData.variants] : [];
      
      // Replace existing variant with same ID or lotusland bulk_api variant
      const filteredVariants = existingVariants.filter(v => 
        v.id !== variantId && !(v.supplierId === 'supplier-lotusland' && v.format === 'bulk_api')
      );
      filteredVariants.push(variantPayload);

      // Check if product has finished products
      const hasFinished = filteredVariants.some(v => v.type === 'finished_product' || v.format === 'vial' || (v.presentation && v.presentation.toLowerCase().includes('vial')));
      const availableTypes = hasFinished ? ['finished_product', 'raw_material'] : ['raw_material'];
      const isHybrid = hasFinished;
      const primaryType = hasFinished ? 'dual' : 'raw_material';

      const suppliers = Array.from(new Set([...(pData.suppliers || []), 'LotusLand', 'Lotusland Limited']));
      const supplierIds = Array.from(new Set([...(pData.supplierIds || []), 'supplier-lotusland']));

      await pRef.set({
        variants: filteredVariants,
        variantsCount: filteredVariants.length,
        activeVariantCount: filteredVariants.length,
        availableTypes,
        isHybrid,
        primaryType,
        suppliers,
        supplierIds,
        updatedAt: now
      }, { merge: true });

      // Subcollection variant
      await pRef.collection('variants').doc(variantId).set(variantPayload, { merge: true });
      updatedProducts++;
    } else {
      // Create new parent product
      const newProduct = {
        id: item.productId,
        name: item.name,
        title: item.name,
        canonicalName: item.name,
        slug: item.productId,
        type: 'raw_material',
        primaryType: 'raw_material',
        productType: 'raw_material',
        availableTypes: ['raw_material'],
        isHybrid: false,
        category: item.category || 'raw_material',
        status: 'published',
        isActive: true,
        supplierId: 'supplier-lotusland',
        supplierName: 'Lotusland Limited',
        suppliers: ['LotusLand', 'Lotusland Limited'],
        supplierIds: ['supplier-lotusland'],
        variants: [variantPayload],
        variantsCount: 1,
        activeVariantCount: 1,
        hasCOA: true,
        requiresColdChain: true,
        createdAt: now,
        updatedAt: now
      };
      await pRef.set(newProduct);
      await pRef.collection('variants').doc(variantId).set(variantPayload, { merge: true });
      createdProducts++;
    }
    createdVariants++;
    console.log(`✔ [TRUTH TABLE] Ingested ${item.name} (${item.productId}) -> MOQ ${moqGrams}g, Net Cost $${netCost}/g`);
  }

  // Process 16 Additional Items (5% discount rule)
  for (const item of ADDITIONAL_ITEMS_5PCT) {
    const pRef = db.collection('products').doc(item.productId);
    const pDoc = await pRef.get();

    const moqGrams = item.moq;
    const netCost = item.netCostPerGram;
    const grossCost = item.sellingPrice;
    const batchTotalCost = Math.round(netCost * moqGrams * 100) / 100;
    const wholesalePerGram = Math.round(netCost * 1.20 * 100) / 100;
    const clinicPerGram = Math.round(netCost * 1.35 * 100) / 100;
    const retailPerGram = item.sellingPrice;

    const variantId = `lotusland-${item.productId}-bulk-api-${moqGrams}g`;

    const variantPayload = {
      id: variantId,
      docId: variantId,
      productId: item.productId,
      canonicalId: item.productId,
      name: `${item.name} Bulk API Powder (${moqGrams}g MOQ)`,
      sku: `LOTUS-${item.productId.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${moqGrams}G-API`,
      
      // 🧪 STRICT API / RAW MATERIAL IDENTIFIERS
      type: 'raw_material',
      productType: 'raw_material',
      format: 'bulk_api',
      presentation: 'Bulk API Powder',
      presentationName: 'Bulk API Powder',
      dosage: `${moqGrams}g (Bulk API)`,
      dose: `${moqGrams}g`,
      unitOfMeasure: 'g',
      unit: 'g',
      
      // ⚖️ Mass & MOQ
      quantity: moqGrams,
      weightGrams: moqGrams,
      packageWeight: `${moqGrams}g`,
      moq: moqGrams,
      moqGrams: moqGrams,
      moqUnit: 'g',

      // 💰 Financial Breakdown
      pricePerGram: netCost,
      grossPricePerGram: grossCost,
      discountPercent: 5,
      costPrice: netCost,
      supplierCost: netCost,
      unit_cost: netCost,
      cost_per_gram: netCost,
      cost_1: netCost,
      cost_10: netCost,
      totalBatchCost: batchTotalCost,
      
      unit_price: retailPerGram,
      price: retailPerGram,
      wholesalePrice: wholesalePerGram,
      clinicPrice: clinicPerGram,
      retailPrice: retailPerGram,
      currency: 'USD',

      pricing: {
        master: {
          pricePerGram: netCost,
          perUnit: netCost,
          supplierCost: netCost,
          packageTotal: batchTotalCost,
          currency: 'USD'
        },
        wholesale: {
          pricePerGram: wholesalePerGram,
          perUnit: wholesalePerGram,
          packageTotal: Math.round(wholesalePerGram * moqGrams * 100) / 100,
          currency: 'USD'
        },
        clinic: {
          pricePerGram: clinicPerGram,
          perUnit: clinicPerGram,
          packageTotal: Math.round(clinicPerGram * moqGrams * 100) / 100,
          currency: 'USD'
        },
        retail: {
          pricePerGram: retailPerGram,
          perUnit: retailPerGram,
          packageTotal: Math.round(retailPerGram * moqGrams * 100) / 100,
          currency: 'USD'
        }
      },

      supplierId: 'supplier-lotusland',
      supplierName: 'Lotusland Limited',
      supplier: 'LotusLand',
      stockType: 'on_demand',
      stock: 100,
      inStock: true,
      isDemand: true,
      leadTime: 'In stock',
      status: 'active',
      isActive: true,
      updatedAt: now,
      createdAt: now
    };

    if (pDoc.exists) {
      const pData = pDoc.data();
      const existingVariants = Array.isArray(pData.variants) ? [...pData.variants] : [];
      
      const filteredVariants = existingVariants.filter(v => 
        v.id !== variantId && !(v.supplierId === 'supplier-lotusland' && v.format === 'bulk_api')
      );
      filteredVariants.push(variantPayload);

      const hasFinished = filteredVariants.some(v => v.type === 'finished_product' || v.format === 'vial' || (v.presentation && v.presentation.toLowerCase().includes('vial')));
      const availableTypes = hasFinished ? ['finished_product', 'raw_material'] : ['raw_material'];
      const isHybrid = hasFinished;
      const primaryType = hasFinished ? 'dual' : 'raw_material';

      const suppliers = Array.from(new Set([...(pData.suppliers || []), 'LotusLand', 'Lotusland Limited']));
      const supplierIds = Array.from(new Set([...(pData.supplierIds || []), 'supplier-lotusland']));

      await pRef.set({
        variants: filteredVariants,
        variantsCount: filteredVariants.length,
        activeVariantCount: filteredVariants.length,
        availableTypes,
        isHybrid,
        primaryType,
        suppliers,
        supplierIds,
        updatedAt: now
      }, { merge: true });

      await pRef.collection('variants').doc(variantId).set(variantPayload, { merge: true });
      updatedProducts++;
    } else {
      const newProduct = {
        id: item.productId,
        name: item.name,
        title: item.name,
        canonicalName: item.name,
        slug: item.productId,
        type: 'raw_material',
        primaryType: 'raw_material',
        productType: 'raw_material',
        availableTypes: ['raw_material'],
        isHybrid: false,
        category: item.category || 'raw_material',
        status: 'published',
        isActive: true,
        supplierId: 'supplier-lotusland',
        supplierName: 'Lotusland Limited',
        suppliers: ['LotusLand', 'Lotusland Limited'],
        supplierIds: ['supplier-lotusland'],
        variants: [variantPayload],
        variantsCount: 1,
        activeVariantCount: 1,
        hasCOA: true,
        requiresColdChain: true,
        createdAt: now,
        updatedAt: now
      };
      await pRef.set(newProduct);
      await pRef.collection('variants').doc(variantId).set(variantPayload, { merge: true });
      createdProducts++;
    }
    createdVariants++;
    console.log(`✔ [5% DISCOUNT] Ingested ${item.name} (${item.productId}) -> Price $${grossCost}/g, Net Cost $${netCost}/g`);
  }

  // ── Write Official Supplier Quotation Document ──────────────────────────────
  const quotationId = 'SQ-LOTUS-2026-API-002';
  const quotationData = {
    id: quotationId,
    quotationNumber: 'QT-LOTUS-2026-API-OCT',
    supplierId: 'supplier-lotusland',
    supplierName: 'Lotusland Limited',
    status: 'accepted',
    type: 'supplier_quotation',
    format: 'bulk_api',
    currency: 'USD',
    createdAt: now,
    financialSummary: {
      subtotalUSD: 414340.90,
      discountPercentage: 28,
      discountUSD: 116015.45,
      totalUSD: 298325.45
    },
    itemsCount: 35,
    leadTime: 'In stock',
    notes: 'Lotusland Authorized API Quotation with 28% discount applied directly to Unit Cost/g.'
  };

  console.log(`\nWriting supplier quotation "${quotationId}"...`);
  await db.collection('supplier_quotations').doc(quotationId).set(quotationData, { merge: true });
  console.log(`✔ Supplier quotation registered successfully.`);

  // ── Recalculate Catalog Facets (_meta/catalog_facets) ────────────────────────
  console.log(`\nUpdating _meta/catalog_facets...`);
  const productsSnap = await db.collection('products').get();
  const categories = {};
  const suppliers = {};
  const types = {};
  let totalProducts = 0;
  let totalVariants = 0;

  productsSnap.forEach(doc => {
    const p = doc.data();
    if (p.status === 'archived') return;
    totalProducts++;
    const cat = p.category || 'other';
    categories[cat] = (categories[cat] || 0) + 1;
    const supp = p.supplierName || p.supplierId || 'other';
    suppliers[supp] = (suppliers[supp] || 0) + 1;
    const t = p.type || p.primaryType || 'finished_product';
    types[t] = (types[t] || 0) + 1;
    if (Array.isArray(p.variants)) {
      totalVariants += p.variants.length;
    }
  });

  await db.collection('_meta').doc('catalog_facets').set({
    totalProducts,
    totalVariants,
    categories,
    suppliers,
    types,
    lastUpdated: now
  }, { merge: true });

  console.log(`✔ _meta/catalog_facets updated: ${totalProducts} products, ${totalVariants} variants.`);
  console.log(`\n======================================================`);
  console.log(`🎉 INGESTION COMPLETE!`);
  console.log(`   Products Updated: ${updatedProducts}`);
  console.log(`   Products Created: ${createdProducts}`);
  console.log(`   Total API Variants Created/Updated: ${createdVariants}`);
  console.log(`======================================================\n`);
}

ingestAllLotuslandPeptideAPIs().catch(err => {
  console.error('❌ Ingestion failed:', err);
  process.exit(1);
});
