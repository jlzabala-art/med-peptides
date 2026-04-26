/**
 * phase2_missingVariants.mjs
 *
 * Creates MISSING product documents in Firestore for dosages that exist
 * in the PDF but have no product doc in the database.
 *
 * Each new product is cloned from the base product of the same peptide,
 * with updated dosage, pricing (master from PDF), and supplier metadata.
 *
 * Usage: node scripts/phase2_missingVariants.mjs
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sa = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

// ── Missing products from PDF ─────────────────────────────────────────────────
// Format: { newId, cloneFromId, dosage, size, form, label, master: {perUnit, kit} }
const MISSING_PRODUCTS = [
  // Retatrutide
  {
    newId: 'Retatrutide-15mg-vial',
    cloneFromId: 'Retatrutide-10mg-vial',
    dosage: '15mg/vial', size: '15mg', form: 'vial', label: '15mg vial',
    master: { perUnit: 120, kit: 720 },
  },
  {
    newId: 'Retatrutide-20mg-vial',
    cloneFromId: 'Retatrutide-10mg-vial',
    dosage: '20mg/vial', size: '20mg', form: 'vial', label: '20mg vial',
    master: { perUnit: 130, kit: 850 },
  },
  // Tirzepatide
  {
    newId: 'Tirzepatide-5mg-vial',
    cloneFromId: 'Tirzepatide-10mg-vial',
    dosage: '5mg/vial', size: '5mg', form: 'vial', label: '5mg vial',
    master: { perUnit: 40, kit: 280 },
  },
  {
    newId: 'Tirzepatide-60mg-vial',
    cloneFromId: 'Tirzepatide-30mg-vial',
    dosage: '60mg/vial', size: '60mg', form: 'vial', label: '60mg vial',
    master: { perUnit: 270, kit: 1550 },
  },
  // Semaglutide
  {
    newId: 'Semaglutide-2mg-vial',
    cloneFromId: 'Semaglutide-5mg-vial',
    dosage: '2mg/vial', size: '2mg', form: 'vial', label: '2mg vial',
    master: { perUnit: 25, kit: 150 },
  },
  {
    newId: 'Semaglutide-10mg-vial',
    cloneFromId: 'Semaglutide-5mg-vial',
    dosage: '10mg/vial', size: '10mg', form: 'vial', label: '10mg vial',
    master: { perUnit: 70, kit: 400 },
  },
  // AOD-9604
  {
    newId: 'AOD-9604-5mg-vial',
    cloneFromId: 'AOD-9604-2mg-vial',
    dosage: '5mg/vial', size: '5mg', form: 'vial', label: '5mg vial',
    master: { perUnit: 90, kit: 480 },
  },
  // BPC-157
  {
    newId: 'BPC-157-2mg-vial',
    cloneFromId: 'BPC-157-5mg-vial',
    dosage: '2mg/vial', size: '2mg', form: 'vial', label: '2mg vial',
    master: { perUnit: 15, kit: 90 },
  },
  {
    newId: 'BPC-157-10mg-vial',
    cloneFromId: 'BPC-157-5mg-vial',
    dosage: '10mg/vial', size: '10mg', form: 'vial', label: '10mg vial',
    master: { perUnit: 40, kit: 250 },
  },
  // Ipamorelin
  {
    newId: 'Ipamorelin-5mg-vial',
    cloneFromId: 'Ipamorelin-2mg-vial',
    dosage: '5mg/vial', size: '5mg', form: 'vial', label: '5mg vial',
    master: { perUnit: 40, kit: 250 },
  },
  {
    newId: 'Ipamorelin-10mg-vial',
    cloneFromId: 'Ipamorelin-2mg-vial',
    dosage: '10mg/vial', size: '10mg', form: 'vial', label: '10mg vial',
    master: { perUnit: 35, kit: 260 },
  },
  // Hexarelin
  {
    newId: 'Hexarelin-5mg-vial',
    cloneFromId: 'Hexarelin-2mg-vial',
    dosage: '5mg/vial', size: '5mg', form: 'vial', label: '5mg vial',
    master: { perUnit: 40, kit: 260 },
  },
  // PE-22-28
  {
    newId: 'PE-22_28-2mg-vial',
    cloneFromId: 'PE-22_28-10mg-vial',
    dosage: '2mg/vial', size: '2mg', form: 'vial', label: '2mg vial',
    master: { perUnit: 25, kit: 145 },
  },
  {
    newId: 'PE-22_28-5mg-vial',
    cloneFromId: 'PE-22_28-10mg-vial',
    dosage: '5mg/vial', size: '5mg', form: 'vial', label: '5mg vial',
    master: { perUnit: 35, kit: 200 },
  },
  // GHK-Cu (PDF has 2mg, DB only has 50mg)
  {
    newId: 'GHK-Cu_(Copper_Peptide)-2mg-vial',
    cloneFromId: 'GHK-Cu_(Copper_Peptide)-50mg-vial',
    dosage: '2mg/vial', size: '2mg', form: 'vial', label: '2mg vial',
    master: { perUnit: 40, kit: 200 },
  },
  {
    newId: 'GHK-Cu_(Copper_Peptide)-5mg-vial',
    cloneFromId: 'GHK-Cu_(Copper_Peptide)-50mg-vial',
    dosage: '5mg/vial', size: '5mg', form: 'vial', label: '5mg vial',
    master: { perUnit: 60, kit: 300 },
  },
  // CJC-1295 without DAC + Ipamorelin combo (new product)
  {
    newId: 'CJC-1295_without_DAC_Ipamorelin-5-5mg-vial',
    cloneFromId: 'CJC-1295_without_DAC_(Modified_GRF_1-29)-2mg-vial',
    dosage: '5mg | 5mg / vial', size: '5mg | 5mg', form: 'vial', label: '5mg | 5mg vial',
    nameOverride: 'CJC-1295 without DAC + Ipamorelin',
    master: { perUnit: 70, kit: 380 },
  },
  {
    newId: 'CJC-1295_without_DAC_Ipamorelin-10-10mg-vial',
    cloneFromId: 'CJC-1295_without_DAC_(Modified_GRF_1-29)-2mg-vial',
    dosage: '10mg | 10mg / vial', size: '10mg | 10mg', form: 'vial', label: '10mg | 10mg vial',
    nameOverride: 'CJC-1295 without DAC + Ipamorelin',
    master: { perUnit: 130, kit: 650 },
  },
  // BPC-157 + TB-500 combo
  {
    newId: 'BPC-157_TB-500-5-5mg-vial',
    cloneFromId: 'BPC-157-5mg-vial',
    dosage: '5mg | 5mg / vial', size: '5mg | 5mg', form: 'vial', label: '5mg | 5mg vial',
    nameOverride: 'BPC-157 + TB-500',
    master: { perUnit: 90, kit: 480 },
  },
  // 5-Amino-1MQ 2mg vial (PDF lists it, DB only has 50mg tablet)
  {
    newId: '5-AMINO_1_MQ-2mg-vial',
    cloneFromId: '5-AMINO_1_MQ-50mg-tablet',
    dosage: '2mg/vial', size: '2mg', form: 'vial', label: '2mg vial',
    master: { perUnit: 30, kit: 150 },
  },
  // HCG 10000iu
  {
    newId: 'HCG-10000iu-vial',
    cloneFromId: 'HCG-5000iu-vial',
    dosage: '10000iu/vial', size: '10000iu', form: 'vial', label: '10000iu vial',
    master: { perUnit: null, kit: 585 },
  },
];

// ── Pricing tier multipliers (based on existing DB patterns) ──────────────────
// retail ≈ master × 1.15 (approx), clinic ≈ retail × 0.85, wholesale ≈ retail × 0.77
function buildPricing(master) {
  const retail = {
    perUnit: master.perUnit ? +(master.perUnit * 1.15).toFixed(2) : null,
    kit: master.kit ? +(master.kit * 1.15).toFixed(2) : null,
  };
  const clinic = {
    perUnit: retail.perUnit ? +(retail.perUnit * 0.85).toFixed(2) : null,
    kit: retail.kit ? +(retail.kit * 0.85).toFixed(2) : null,
  };
  const wholesale = {
    perUnit: retail.perUnit ? +(retail.perUnit * 0.77).toFixed(2) : null,
    kit: retail.kit ? +(retail.kit * 0.77).toFixed(2) : null,
  };
  return { retail, clinic, wholesale, master };
}

async function main() {
  let created = 0;
  let skipped = 0;
  const errors = [];

  for (const item of MISSING_PRODUCTS) {
    try {
      // Check if already exists
      const existing = await db.collection('products').doc(item.newId).get();
      if (existing.exists) {
        console.log(`⏭️  ${item.newId} — already exists, skipping`);
        skipped++;
        continue;
      }

      // Clone from base product
      const baseDoc = await db.collection('products').doc(item.cloneFromId).get();
      if (!baseDoc.exists) {
        console.error(`❌ Clone source not found: ${item.cloneFromId}`);
        errors.push(item.newId);
        continue;
      }

      const baseData = baseDoc.data();

      // Build new product doc
      const newProduct = {
        ...baseData,
        dosage: item.dosage,
        name: item.nameOverride || baseData.name,
        supplier: 'RegenPept',
        supplierUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Clear legacy price fields - use variant subcollection
        perVialPriceUSD: item.master.perUnit,
        kitPriceUSD: item.master.kit,
        guestVialPrice: buildPricing(item.master).retail.perUnit,
        guestKitPrice: buildPricing(item.master).retail.kit,
        proVialPrice: buildPricing(item.master).clinic.perUnit,
        proKitPrice: buildPricing(item.master).clinic.kit,
        _migratedFrom: 'phase2_missingVariants',
        _migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        isDefault: false,
      };

      await db.collection('products').doc(item.newId).set(newProduct);

      // Create default variant
      const pricing = buildPricing(item.master);
      const variantDoc = {
        label: item.label,
        size: item.size,
        form: item.form,
        isDefault: true,
        dosage: item.dosage,
        stock: { available: true, quantity: null },
        pricing,
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('products').doc(item.newId)
        .collection('variants').doc('default').set(variantDoc);

      console.log(`✅ Created ${item.newId} → master $${item.master.perUnit}/$${item.master.kit}`);
      created++;
    } catch (e) {
      console.error(`❌ ${item.newId}: ${e.message}`);
      errors.push(item.newId);
    }
  }

  console.log(`\n── Done ──`);
  console.log(`Created: ${created} | Skipped: ${skipped} | Errors: ${errors.length}`);
  if (errors.length) console.log('Errors:', errors);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
