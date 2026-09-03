#!/usr/bin/env node
/**
 * phase5_create_categories.mjs
 * 
 * Creates the `categories` collection in Firestore and renames
 * `category` → `categoryId` on all products.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

// ═══ Category definitions (English names) ════════════════════════════════
const CATEGORIES = [
  // --- Core product types ---
  { id: 'peptide', name: 'Peptides', icon: '💉', order: 1, group: 'core' },
  { id: 'supplement', name: 'Supplements', icon: '💊', order: 2, group: 'core' },
  { id: 'api_raw_material', name: 'API / Raw Materials', icon: '🧪', order: 3, group: 'core' },

  // --- Testing & diagnostics ---
  { id: 'test_kit', name: 'Test Kits', icon: '🔬', order: 10, group: 'testing' },
  { id: 'dna_test', name: 'DNA Tests', icon: '🧬', order: 11, group: 'testing' },
  { id: 'biomarker_test', name: 'Biomarker Tests', icon: '📊', order: 12, group: 'testing' },
  { id: 'blood_analysis', name: 'Blood Analysis', icon: '🩸', order: 13, group: 'testing' },
  { id: 'proteomics', name: 'Proteomics', icon: '🔎', order: 14, group: 'testing' },

  // --- Supplement sub-categories ---
  { id: 'immune_support', name: 'Immune Support', icon: '🛡️', order: 20, group: 'supplements' },
  { id: 'metabolic_and_weight', name: 'Metabolic & Weight', icon: '⚖️', order: 21, group: 'supplements' },
  { id: 'hormonal_optimization', name: 'Hormonal Optimization', icon: '🔄', order: 22, group: 'supplements' },
  { id: 'longevity_and_antiaging', name: 'Longevity & Anti-Aging', icon: '⏳', order: 23, group: 'supplements' },
  { id: 'cognitive_and_mood', name: 'Cognitive & Mood', icon: '🧠', order: 24, group: 'supplements' },
  { id: 'hair_loss_and_androgenic', name: 'Hair Loss & Androgenic', icon: '💇', order: 25, group: 'supplements' },
  { id: 'recovery_and_repair', name: 'Recovery & Repair', icon: '🩹', order: 26, group: 'supplements' },
  { id: 'dermatology_and_skin', name: 'Dermatology & Skin', icon: '✨', order: 27, group: 'supplements' },
  { id: 'adaptogens_and_botanicals', name: 'Adaptogens & Botanicals', icon: '🌿', order: 28, group: 'supplements' },
  { id: 'vitamins_and_antioxidants', name: 'Vitamins & Antioxidants', icon: '🍊', order: 29, group: 'supplements' },
  { id: 'metabolic_and_blood_sugar', name: 'Metabolic & Blood Sugar', icon: '📉', order: 30, group: 'supplements' },
  { id: 'nutraceutical', name: 'Nutraceutical & Functional', icon: '🥗', order: 31, group: 'supplements' },

  // --- Compounding & equipment ---
  { id: 'excipients_and_vehicles', name: 'Excipients & Vehicles', icon: '🧴', order: 40, group: 'compounding' },
  { id: 'excipients_and_bases', name: 'Excipients & Bases', icon: '🫧', order: 41, group: 'compounding' },
  { id: 'capsules_and_consumables', name: 'Capsules & Consumables', icon: '💎', order: 42, group: 'compounding' },
  { id: 'other_compounding_material', name: 'Other Compounding Materials', icon: '🔩', order: 43, group: 'compounding' },
  { id: 'research_supplies', name: 'Research Supplies', icon: '🏗️', order: 44, group: 'compounding' },

  // --- Pharma APIs ---
  { id: 'sedatives_and_anesthetics', name: 'Sedatives & Anesthetics', icon: '💤', order: 50, group: 'pharma' },
  { id: 'antimicrobials', name: 'Antimicrobials', icon: '🦠', order: 51, group: 'pharma' },
  { id: 'hormones_and_endocrinology', name: 'Hormones & Endocrinology', icon: '⚗️', order: 52, group: 'pharma' },

  // --- Delivery formats ---
  { id: 'prefilled_peptide_pens', name: 'Prefilled Peptide Pens', icon: '🖊️', order: 60, group: 'delivery' },

  // --- Other ---
  { id: 'subscription', name: 'Subscriptions', icon: '🔁', order: 70, group: 'other' },
  { id: 'equipment', name: 'Equipment', icon: '⚙️', order: 71, group: 'other' },
  { id: 'other', name: 'Other', icon: '📦', order: 99, group: 'other' }
];

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  CREAR COLECCIÓN categories + RENOMBRAR category→categoryId ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ── Step 1: Create categories collection ────────────────────────────
  console.log('━━━ 1. CREAR COLECCIÓN categories ━━━\n');
  
  let created = 0;
  let skipped = 0;
  
  for (const cat of CATEGORIES) {
    const docRef = db.collection('categories').doc(cat.id);
    const existing = await docRef.get();
    
    if (existing.exists) {
      console.log(`  ⏭️  ${cat.id} already exists`);
      skipped++;
      continue;
    }
    
    await docRef.set({
      name: cat.name,
      slug: cat.id,
      icon: cat.icon,
      displayOrder: cat.order,
      group: cat.group,
      isActive: true,
      productCount: 0, // Will be updated below
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    console.log(`  ✅ Created: ${cat.id} → "${cat.name}"`);
    created++;
  }
  
  console.log(`\n  Total: ${created} created, ${skipped} skipped\n`);

  // ── Step 2: Rename category → categoryId on products ────────────────
  console.log('━━━ 2. RENOMBRAR category → categoryId ━━━\n');
  
  const products = await db.collection('products').get();
  let renamed = 0;
  let alreadyDone = 0;
  let noCategory = 0;
  let processed = 0;
  
  // Collect category counts
  const categoryCounts = {};
  
  for (const doc of products.docs) {
    const data = doc.data();
    
    // Already has categoryId → skip
    if (data.categoryId) {
      alreadyDone++;
      const catId = data.categoryId;
      categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
      
      // Clean up old category field if still present
      if (data.category !== undefined) {
        await doc.ref.update({
          category: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp()
        });
      }
      processed++;
      continue;
    }
    
    const category = data.category;
    
    if (!category) {
      noCategory++;
      processed++;
      continue;
    }
    
    // Validate category exists in our definitions
    const validCategory = CATEGORIES.find(c => c.id === category);
    
    const updateData = {
      categoryId: category,
      category: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp()
    };
    
    if (!validCategory) {
      // Unknown category → keep it as-is but flag
      updateData._categoryUnknown = true;
      console.log(`  ⚠️  ${doc.id}: unknown category "${category}" → stored as categoryId anyway`);
    }
    
    await doc.ref.update(updateData);
    renamed++;
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    
    processed++;
    if (processed % 100 === 0) {
      process.stdout.write(`  Processed ${processed}/${products.size}...\r`);
    }
  }
  
  console.log(`  ✅ Renamed: ${renamed}`);
  console.log(`  ⏭️  Already had categoryId: ${alreadyDone}`);
  console.log(`  ⚠️  No category: ${noCategory}\n`);

  // ── Step 3: Update productCount on categories ───────────────────────
  console.log('━━━ 3. ACTUALIZAR productCount ━━━\n');
  
  let countsUpdated = 0;
  for (const [catId, count] of Object.entries(categoryCounts)) {
    const catRef = db.collection('categories').doc(catId);
    const catDoc = await catRef.get();
    
    if (catDoc.exists) {
      await catRef.update({ productCount: count, updatedAt: FieldValue.serverTimestamp() });
      countsUpdated++;
    }
  }
  
  console.log(`  ✅ Product counts updated on ${countsUpdated} categories\n`);

  // ── Summary ─────────────────────────────────────────────────────────
  console.log('══════════════════════════════════════════════════════════════');
  console.log('                        SUMMARY');
  console.log('══════════════════════════════════════════════════════════════\n');
  console.log(`  Categories created:     ${created}`);
  console.log(`  Products renamed:       ${renamed}`);
  console.log(`  Already had categoryId: ${alreadyDone}`);
  console.log(`  No category at all:     ${noCategory}`);
  console.log(`  Counts updated:         ${countsUpdated}`);
  
  console.log('\n  Category distribution:');
  const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  for (const [catId, count] of sorted) {
    const catDef = CATEGORIES.find(c => c.id === catId);
    const name = catDef ? catDef.name : '???';
    console.log(`    ${count}x ${catId} (${name})`);
  }
  
  console.log('\n══════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
