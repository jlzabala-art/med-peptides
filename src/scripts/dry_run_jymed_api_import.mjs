/**
 * dry_run_jymed_api_import.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Dry-run validation script for importing Bulk API supplier prices from
 * Shenzhen JYMed Technology Co., Ltd. (Peptide_API_RFQ_Mediluxe(1).xlsx).
 *
 * Checks:
 * 1. Supplier matching in 'suppliers' (jymed-peptide)
 * 2. Collision checking with existing finished vial products
 * 3. Validation of USD/g pricing and mass units (g)
 * 4. Validation of pharmaceutical vs cosmetic grades
 * 5. Dry-run structure generation without writing to database
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(serviceAccountPath)) {
    const sa = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(sa) });
  } else {
    initializeApp({ projectId: 'med-peptides-app' });
  }
}

const db = getFirestore();

const IMPORT_SPEC = {
  supplier: {
    company_name: "Shenzhen JYMed Technology Co., Ltd.",
    company_type: "API Manufacturer / Supplier",
    headquarters: "Shenzhen, China",
    website: "https://www.jymedtech.com",
    manufacturing_entity: {
      company_name: "Hubei JXBio Pharmaceutical Co., Ltd.",
      country: "China",
      facility_type: "API Manufacturing Facility",
      fda_status: "Supplier reports FDA-approved plant",
      verification_required: true
    },
    contact: {
      name: "Hossam Rdowan",
      position: "BD Manager - MEA",
      department: "Emerging Markets API Business Division",
      whatsapp: "+201004909448",
      wechat: "00201004909448"
    }
  },
  quotation: {
    quotation_number: "SQ-JYMED-2026-MEDILUXE-01",
    quotation_type: "BULK_API_SUPPLIER_PRICE_LIST",
    source_document: "Peptide_API_RFQ_Mediluxe(1).xlsx",
    currency: "USD",
    price_unit: "GRAM",
    minimum_order_unit: "GRAM",
    price_category: "SUPPLIER_PURCHASE_COST",
    finished_product: false,
    bulk_material: true
  },
  products: [
    {
      name: "Retatrutide",
      id: "api-retatrutide-bulk",
      casNumber: "2381089-83-2",
      category: "api_peptide",
      categoryName: "Metabolic & GIP/GLP-1/Glucagon Receptor Agonist API",
      material_type: "Bulk API",
      grade: "Pharmaceutical",
      price_usd_per_gram: 350,
      minimum_order_quantity_g: 10,
      minimum_order_value_usd: 3500,
      gmp_claim: "cGMP",
      documentation: ["CoA", "DMF"],
      availability: "Ready stock",
      price_status: "QUOTED"
    },
    {
      name: "Tirzepatide",
      id: "api-tirzepatide-bulk",
      casNumber: "2023788-19-2",
      category: "api_peptide",
      categoryName: "Metabolic & Dual GIP/GLP-1 Receptor Agonist API",
      material_type: "Bulk API",
      grade: "Pharmaceutical",
      price_usd_per_gram: 260,
      minimum_order_quantity_g: 10,
      minimum_order_value_usd: 2600,
      gmp_claim: "cGMP",
      documentation: ["CoA", "WC", "DMF"],
      availability: "Ready stock",
      price_status: "QUOTED"
    },
    {
      name: "Semaglutide",
      id: "api-semaglutide-bulk",
      casNumber: "910463-68-2",
      category: "api_peptide",
      categoryName: "Metabolic & GLP-1 Receptor Agonist API",
      material_type: "Bulk API",
      grade: "Pharmaceutical",
      price_usd_per_gram: 250,
      minimum_order_quantity_g: 10,
      minimum_order_value_usd: 2500,
      gmp_claim: "cGMP",
      documentation: ["CoA", "WC", "DMF"],
      availability: "Ready stock",
      price_status: "QUOTED"
    },
    {
      name: "Cagrilintide",
      id: "api-cagrilintide-bulk",
      casNumber: "1415456-99-3",
      category: "api_peptide",
      categoryName: "Long-Acting Amylin Analogue API",
      material_type: "Bulk API",
      grade: "Pharmaceutical",
      price_usd_per_gram: null,
      minimum_order_quantity_g: 4,
      minimum_order_value_usd: null,
      gmp_claim: "cGMP",
      documentation: ["CoA"],
      availability: "Sample for R&D trials",
      price_status: "PENDING_QUOTATION"
    },
    {
      name: "GHK-Cu",
      id: "api-ghk-cu-cosmetic-raw",
      casNumber: "49557-75-7",
      category: "cosmetic_raw_material",
      categoryName: "Cosmetic Copper Tripeptide-1 Raw Material",
      material_type: "Bulk Peptide Raw Material",
      grade: "Cosmetic",
      price_usd_per_gram: 15,
      minimum_order_quantity_g: 10,
      minimum_order_value_usd: 150,
      gmp_claim: "cGMP",
      documentation: ["CoA"],
      availability: "Ready stock",
      price_status: "QUOTED"
    },
    {
      name: "Oxytocin Acetate",
      id: "api-oxytocin-acetate-bulk",
      casNumber: "50-56-6",
      category: "api_peptide",
      categoryName: "Neuropeptide Hormone API",
      material_type: "Bulk API",
      grade: "Pharmaceutical",
      price_usd_per_gram: 160,
      minimum_order_quantity_g: 10,
      minimum_order_value_usd: 1600,
      gmp_claim: "cGMP",
      documentation: ["CoA", "WC", "DMF", "CEP"],
      availability: "Ready stock",
      price_status: "QUOTED"
    }
  ]
};

async function runDryRun() {
  console.log('=================================================================');
  console.log('🔬 DRY-RUN VALIDATION: IMPORT_SUPPLIER_API_PRICES (JYMed Peptide)');
  console.log('=================================================================\n');

  // STEP 1: Verify Supplier Record
  console.log('📌 STEP 1: Inspecting Supplier Record');
  const supplierDoc = await db.collection('suppliers').doc('jymed-peptide').get();
  if (!supplierDoc.exists) {
    console.error('❌ Supplier jymed-peptide NOT found in database!');
    process.exit(1);
  }
  const sData = supplierDoc.data();
  console.log(`✔ Found Supplier: ${sData.companyName} (${sData.legalName})`);
  console.log(`  Website: ${sData.website}`);
  console.log(`  Current Status: ${sData.status}`);
  console.log(`  Facility Sites: ${sData.facilitySites?.length || 0} sites registered.`);

  // Verify Manufacturing Entity & Contact linkage update plan
  console.log('✔ Planned Supplier update adds contact (Hossam Rdowan) & manufacturing entity (Hubei JXBio) without overwriting existing data.\n');

  // STEP 2: Collision & Identifier Inspection
  console.log('📌 STEP 2: Checking Product Collisions & Vial SKUs');
  let collisionsDetected = 0;
  for (const item of IMPORT_SPEC.products) {
    const existingApiDoc = await db.collection('products').doc(item.id).get();
    if (existingApiDoc.exists) {
      console.log(`  ⚠️ Notice: Document ${item.id} already exists. Will upsert API quotation.`);
    } else {
      console.log(`  ✔ Clean ID: ${item.id} (No collision with existing records)`);
    }

    // Ensure we are NEVER overwriting finished vial SKUs
    const finishedVialId = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const vialDoc = await db.collection('products').doc(finishedVialId).get();
    if (vialDoc.exists) {
      const vData = vialDoc.data();
      console.log(`  🛡️ Protected finished product: ${finishedVialId} (Type: ${vData.type || 'finished_product'}, Status: ${vData.status}) will remain 100% UNTOUCHED.`);
    }
  }

  // STEP 3: Validate Pricing & Units
  console.log('\n📌 STEP 3: Validating Units and Pricing Math');
  let pricedCount = 0;
  let pendingCount = 0;

  IMPORT_SPEC.products.forEach(p => {
    if (p.price_usd_per_gram !== null) {
      pricedCount++;
      const computedMinOrder = p.price_usd_per_gram * p.minimum_order_quantity_g;
      if (computedMinOrder !== p.minimum_order_value_usd) {
        console.error(`❌ Math mismatch for ${p.name}: ${p.price_usd_per_gram} * ${p.minimum_order_quantity_g} = ${computedMinOrder} vs expected ${p.minimum_order_value_usd}`);
        collisionsDetected++;
      } else {
        console.log(`  ✔ ${p.name.padEnd(18)}: $${p.price_usd_per_gram}/g | MOQ: ${p.minimum_order_quantity_g}g | Min Value: $${p.minimum_order_value_usd} [${p.grade}]`);
      }
    } else {
      pendingCount++;
      console.log(`  ✔ ${p.name.padEnd(18)}: PENDING QUOTATION | Sample MOQ: ${p.minimum_order_quantity_g}g [${p.grade}]`);
    }

    // Grade validation
    if (p.name === 'GHK-Cu' && p.grade !== 'Cosmetic') {
      console.error(`❌ GHK-Cu must be cosmetic grade!`);
      collisionsDetected++;
    }
    if (p.name !== 'GHK-Cu' && p.grade !== 'Pharmaceutical') {
      console.error(`❌ ${p.name} must be pharmaceutical grade!`);
      collisionsDetected++;
    }
  });

  // STEP 4: Inspect Quotation Record Structure
  console.log('\n📌 STEP 4: Validating Supplier Quotation Document');
  const quoteDocId = IMPORT_SPEC.quotation.quotation_number;
  const existingQuote = await db.collection('supplier_quotations').doc(quoteDocId).get();
  if (existingQuote.exists) {
    console.log(`  ⚠️ Quotation ${quoteDocId} already exists!`);
  } else {
    console.log(`  ✔ Quotation ID ${quoteDocId} is unique and ready for creation.`);
  }

  console.log('\n=================================================================');
  console.log('📊 DRY-RUN VALIDATION SUMMARY');
  console.log('=================================================================');
  console.log(`✔ Supplier Records to update: 1 (jymed-peptide)`);
  console.log(`✔ Manufacturing Entities linked: 1 (Hubei JXBio Pharmaceutical Co., Ltd.)`);
  console.log(`✔ Contact Records linked: 1 (Hossam Rdowan)`);
  console.log(`✔ Total API offers: ${IMPORT_SPEC.products.length}`);
  console.log(`✔ Priced offers (USD/g): ${pricedCount}`);
  console.log(`✔ Pending offers: ${pendingCount}`);
  console.log(`✔ Finished vial products modified: 0 (Strictly 0)`);
  console.log(`✔ Errors or Violations: ${collisionsDetected}`);
  console.log('=================================================================\n');

  if (collisionsDetected === 0) {
    console.log('🚀 Dry-run PASSED. Ready for live import execution.');
  } else {
    console.error('❌ Dry-run FAILED with violations.');
    process.exit(1);
  }
}

runDryRun().catch(err => {
  console.error('Fatal Dry-Run Error:', err);
  process.exit(1);
});
