#!/usr/bin/env node
/**
 * import_bioblend_to_magenta_phases.mjs
 * 
 * Ingestion pipeline for BioBlend Compounding Pharmacy Price List (August 2026).
 * All items are loaded strictly under supplier Magenta (supplier-magenta).
 * 
 * Usage:
 *   node scripts/import_bioblend_to_magenta_phases.mjs --phase=1 [--live]
 *   node scripts/import_bioblend_to_magenta_phases.mjs --phase=2 [--live]
 *   node scripts/import_bioblend_to_magenta_phases.mjs --phase=3 [--live]
 *   node scripts/import_bioblend_to_magenta_phases.mjs --phase=4 [--live]
 *   node scripts/import_bioblend_to_magenta_phases.mjs --all [--live]
 */

import fs from 'fs';
import path from 'path';
import { adminDb } from '../src/lib/firebaseAdmin.js';

// Parse CLI flags
const args = process.argv.slice(2);
const isLive = args.includes('--live');
const isAll = args.includes('--all');
const phaseArg = args.find(a => a.startsWith('--phase='));
const targetPhase = isAll ? 'all' : (phaseArg ? phaseArg.split('=')[1] : '1');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║       BIOBLEND → MAGENTA PHASED CATALOG INGESTION ENGINE       ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log(` Mode: ${isLive ? '🚀 LIVE EXECUTION (Writing to Firestore)' : '🔍 DRY-RUN (Simulation only, pass --live to write)'}`);
console.log(` Target Phase: ${targetPhase.toUpperCase()}`);
console.log('──────────────────────────────────────────────────────────────────');

const DATA_FILE = path.join(process.cwd(), 'scripts', 'bioblend_catalog_data.json');
if (!fs.existsSync(DATA_FILE)) {
  console.error(`❌ Data file not found: ${DATA_FILE}. Run python3 scripts/generate_all_phases.py first.`);
  process.exit(1);
}

const catalogData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Slugify helper
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Clean dosage for ID
function cleanDosageId(dose) {
  return String(dose || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function executeIngestion() {
  if (!adminDb) {
    throw new Error('Firestore adminDb is not initialized.');
  }

  // 1. Fetch current catalog snapshot for matching
  console.log('📦 Fetching current Firestore products index...');
  const snap = await adminDb.collection('products').get();
  console.log(`   Indexed ${snap.size} existing products in Firestore.`);

  const catalogIndex = new Map();
  snap.forEach(doc => {
    const data = doc.data();
    const id = doc.id.toLowerCase();
    catalogIndex.set(id, { docId: doc.id, ref: doc.ref, data });
    if (data.slug) catalogIndex.set(data.slug.toLowerCase(), { docId: doc.id, ref: doc.ref, data });
    if (data.canonicalName) catalogIndex.set(data.canonicalName.toLowerCase().trim(), { docId: doc.id, ref: doc.ref, data });
    if (data.name) catalogIndex.set(data.name.toLowerCase().trim(), { docId: doc.id, ref: doc.ref, data });
  });

  const phasesToRun = targetPhase === 'all' 
    ? ['phase1', 'phase2', 'phase3', 'phase4'] 
    : [`phase${targetPhase}`];

  let totalProductsProcessed = 0;
  let totalProductsCreated = 0;
  let totalProductsUpdated = 0;
  let totalVariantsCreated = 0;

  for (const pKey of phasesToRun) {
    const phaseItems = catalogData[pKey];
    if (!phaseItems || phaseItems.length === 0) {
      console.warn(`⚠️ No items found for ${pKey}. Skipping.`);
      continue;
    }

    console.log(`\n==================================================================`);
    console.log(`▶ EXECUTING ${pKey.toUpperCase()} (${phaseItems.length} Products)`);
    console.log(`==================================================================`);

    for (const item of phaseItems) {
      totalProductsProcessed++;
      const searchKeys = [
        slugify(item.canonicalName || item.name),
        (item.canonicalName || '').toLowerCase().trim(),
        (item.name || '').toLowerCase().trim(),
        slugify(item.name)
      ].filter(Boolean);

      let matched = null;
      for (const k of searchKeys) {
        if (catalogIndex.has(k)) {
          matched = catalogIndex.get(k);
          break;
        }
      }

      const masterSlug = matched ? matched.data.slug || matched.docId : slugify(item.canonicalName || item.name);
      const isNew = !matched;

      if (isNew) {
        totalProductsCreated++;
      } else {
        totalProductsUpdated++;
      }

      // Generate variant objects
      const newVariants = [];
      for (const rawV of item.variants) {
        const doseClean = cleanDosageId(rawV.dose);
        const formatId = rawV.format || 'vial';
        const clinicAed = rawV.clinic_price_aed || 0;
        const patientAed = rawV.patient_price_aed || (clinicAed > 0 ? clinicAed * 2 : null);
        const usdPrice = clinicAed > 0 ? parseFloat((clinicAed / 3.6725).toFixed(2)) : null;

        // 1. Primary format (e.g. Pre-Filled Pen or Spray or Capsule or Cream)
        const primaryVariant = {
          id: `${masterSlug}-${formatId}-${doseClean}-magenta`,
          supplierId: 'supplier-magenta',
          supplierName: 'Magenta',
          dosage: rawV.dose,
          dose: rawV.dose,
          presentation: formatId,
          presentationName: rawV.formatName || formatId,
          fill_volume: rawV.volume || null,
          pack_size: rawV.pack_size || null,
          price_aed: clinicAed,
          costPrice: clinicAed,
          patientPrice_aed: patientAed,
          patientPrice: patientAed,
          unit_price: usdPrice,
          currency: 'AED',
          leadTime: '1-3 Days (Dubai Delivery)',
          status: 'active',
          inStock: true,
          hasCOA: false,
          updatedAt: new Date().toISOString()
        };
        newVariants.push(primaryVariant);

        // 2. If it's a pre-filled pen and has a refill cartridge price, generate the Refill Cartridge variant
        if (rawV.refill_price_aed && rawV.refill_price_aed > 0) {
          const refillAed = rawV.refill_price_aed;
          const refillUsd = parseFloat((refillAed / 3.6725).toFixed(2));
          const refillPatientAed = rawV.patient_price_aed ? (rawV.patient_price_aed - (clinicAed - refillAed)) : refillAed * 2;
          
          const refillVariant = {
            id: `${masterSlug}-cartridge-${doseClean}-magenta`,
            supplierId: 'supplier-magenta',
            supplierName: 'Magenta',
            dosage: rawV.dose,
            dose: rawV.dose,
            presentation: 'cartridge',
            presentationName: 'Refill Cartridge',
            fill_volume: rawV.volume || null,
            pack_size: rawV.pack_size || null,
            price_aed: refillAed,
            costPrice: refillAed,
            patientPrice_aed: refillPatientAed,
            patientPrice: refillPatientAed,
            unit_price: refillUsd,
            currency: 'AED',
            leadTime: '1-3 Days (Dubai Delivery)',
            status: 'active',
            inStock: true,
            hasCOA: false,
            updatedAt: new Date().toISOString()
          };
          newVariants.push(refillVariant);
        }
      }

      totalVariantsCreated += newVariants.length;

      console.log(`   ${isNew ? '✨ [NEW]' : '🔄 [UPDATE]'} ${item.name} (${newVariants.length} variants)`);
      newVariants.forEach(v => {
        console.log(`      • ${v.presentationName} | ${v.dosage} | Clinic: ${v.price_aed} AED (~$${v.unit_price} USD)${v.patientPrice_aed ? ` | Patient: ${v.patientPrice_aed} AED` : ''}`);
      });

      if (isLive) {
        const productRef = matched ? matched.ref : adminDb.collection('products').doc(masterSlug);
        const existingData = matched ? matched.data : {};
        const existingVariants = Array.isArray(existingData.variants) ? existingData.variants : [];

        // Deduplicate: remove older Magenta variants for this product with identical ID or (presentation + dose)
        const filteredVariants = existingVariants.filter(ev => {
          if (ev.supplierId !== 'supplier-magenta') return true;
          return !newVariants.some(nv => nv.id === ev.id || (nv.presentation === ev.presentation && nv.dosage === ev.dosage));
        });

        const mergedVariants = [...filteredVariants, ...newVariants];

        const productPayload = {
          name: existingData.name || item.name,
          canonicalName: existingData.canonicalName || item.canonicalName || item.name,
          slug: masterSlug,
          category: existingData.category || item.category,
          status: 'active',
          updatedAt: new Date().toISOString(),
          variants: mergedVariants
        };

        if (isNew) {
          productPayload.createdAt = new Date().toISOString();
          productPayload.supplierId = 'supplier-magenta';
          productPayload.supplierName = 'Magenta';
          productPayload.description = item.description || `Compounded formulation by Magenta. Available in specialized presentations.`;
        }

        await productRef.set(productPayload, { merge: true });

        // Also write to subcollection for dual query compatibility
        const batch = adminDb.batch();
        for (const nv of newVariants) {
          const varRef = productRef.collection('variants').doc(nv.id);
          batch.set(varRef, nv, { merge: true });
        }
        await batch.commit();

        // Update local index map
        catalogIndex.set(masterSlug, { docId: masterSlug, ref: productRef, data: productPayload });
      }
    }
  }

  // Update supplier-magenta metadata
  if (isLive) {
    console.log('\n🏥 Updating supplier-magenta stats in Firestore...');
    const magentaProductsSnap = await adminDb.collection('products').where('variants', '!=', null).get();
    let magentaProductCount = 0;
    let magentaVariantCount = 0;

    magentaProductsSnap.forEach(d => {
      const vars = d.data().variants || [];
      const magVars = vars.filter(v => v.supplierId === 'supplier-magenta');
      if (magVars.length > 0) {
        magentaProductCount++;
        magentaVariantCount += magVars.length;
      }
    });

    await adminDb.collection('suppliers').doc('supplier-magenta').set({
      name: 'Magenta',
      displayName: 'Magenta',
      companyName: 'Magenta Medical Supplies',
      currency: 'AED',
      defaultCurrency: 'AED',
      status: 'active',
      productsSupplied: magentaProductCount,
      variantsSupplied: magentaVariantCount,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`   Supplier stats updated: ${magentaProductCount} products, ${magentaVariantCount} variants.`);
  }

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                     INGESTION SUMMARY                          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log(` Total Master Products Processed: ${totalProductsProcessed}`);
  console.log(` Existing Catalog Products Enriched: ${totalProductsUpdated}`);
  console.log(` Brand New Products Created: ${totalProductsCreated}`);
  console.log(` Total Magenta Variants Prepared: ${totalVariantsCreated}`);
  console.log(` Status: ${isLive ? '✅ LIVE DATABASE WRITE COMPLETE' : '🔍 DRY-RUN COMPLETE (No changes written)'}`);
  console.log('──────────────────────────────────────────────────────────────────\n');
}

executeIngestion()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Ingestion failed:', err);
    process.exit(1);
  });
