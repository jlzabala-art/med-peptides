/**
 * lotusland_reconcile.mjs — v4 (Dynamic JSON Source of Truth Reconciler with Stable Variant IDs)
 *
 * Modos:
 *   node scripts/lotusland_reconcile.mjs            (dry-run)
 *   node scripts/lotusland_reconcile.mjs --backup
 *   node scripts/lotusland_reconcile.mjs --live
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, readFileSync } from 'fs';
import * as readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);
const sa        = require(path.join(__dirname, 'serviceAccountKey.json'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const SUPPLIER_ID   = 'OLlBbQjgrj6tY7GmM2Jo';
const SUPPLIER_NAME = 'Lotusland Limited';
const CATALOG_BRAND = 'RegenPept';
const COST_SOURCE   = 'validation_import_json';
const COST_DATE     = '2026-08-02';

// ── Read JSON Source of Truth ──────────────────────────────────────────────────
const JSON_PATH = path.join(__dirname, '../AI Prompts/LotusLand Master Price List.json');
const JSON_DATA = JSON.parse(readFileSync(JSON_PATH, 'utf8'));

// Normalization Helpers
const norm = s => (s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const normD = s => (s||'')
  .toLowerCase()
  .replace(/\s+/g,'')
  .replace(/mcg\/ta[b]*/g,'mcg')
  .replace(/\/vial/g,'')
  .replace(/\/bottle/g,'')
  .replace(/\/tablet/g,'')
  .replace(/iu\/vial/g,'iu')
  .replace(/,/g,'')
  .replace(/\|/g,'+')
  .replace(/\//g,'+');

function extractUnits(item) {
  const qtyStr = (item.quantity || '').toLowerCase();
  const res = {};
  if (qtyStr.includes('vial / kit')) {
    const match = qtyStr.match(/(\d+)\s+vial/);
    if (match) res.unitsPerKit = parseInt(match[1]);
  } else if (qtyStr.includes('tabs / bottle')) {
    const match = qtyStr.match(/(\d+)\s+tabs/);
    if (match) {
      res.unitsPerPackage = parseInt(match[1]);
      res.costUnitLabel = 'bottle';
    }
  } else if (qtyStr.includes('bottles / box')) {
    const match = qtyStr.match(/(\d+)\s+bottles/);
    if (match) res.unitsPerKit = parseInt(match[1]);
  }
  return res;
}

// Canonical Parent Product IDs in Firestore
// ⚠️  Source of Truth: AI Prompts/LotusLand Master Price List.json (104 variants)
const canonicalProductMap = {
  // ── GLP-1 / Metabolic ───────────────────────────────────────────────────────
  'Glutathione':                                  'glutathione',
  'Retatrutide':                                  'retatrutide',
  'Tirzepatide':                                  'tirzepatide',
  'Semaglutide':                                  'semaglutide',
  'Cagrilintide':                                 'cagrilintide',
  // ── Repair / Recovery ──────────────────────────────────────────────────────
  'BPC-157':                                      'vallida_bpc-157-6mg_prefilled_pen_pen_3ml',
  'BPC-157 + TB-500':                             'BPC-157_TB-500-5-5mg-vial',
  'Thymosin β4 (TB-500)':                         'FBwoncHjo8lU94LtQ0zs',
  'AOD-9604':                                     'pod-pen-001',
  // ── Immune / Bioregulators ─────────────────────────────────────────────────
  'Thymosin Alpha 1':                             'TW4bNGbN2tTYKRiPqqBv',
  'Thymosin Alpha 1 + Thymalin':                  'lotusland-thymosinalpha1thymalin-10mg10mgvial',
  'Thymogen':                                     'x9LJ0UJXDSHf8Fuppzne',
  'Epithalon':                                    'magenta-epithalon-30mg-3ml-refill-cartridge-18',
  'Thymulin':                                     'thymulin',
  'Pinealon':                                     'pinealon',
  'KPV':                                          'pod-pen-013',
  'DSIP':                                         'pod-pen-006',
  // ── Growth / GH Axis ───────────────────────────────────────────────────────
  'HGH':                                          'hgh',
  'HMG':                                          'hmg',
  'IGF LR3':                                      '7xjPH5kTDXdU13rooufH',
  'MOTS-C':                                       'vallida_mots-c-30mg_prefilled_pen_pen_3ml',
  'PEG-MGF':                                      'peg-mgf',
  'Ipamorelin':                                   'ipamorelin',
  'Sermorelin':                                   'sermorelin',
  'Hexarelin':                                    'hexarelin',
  'Tesamorelin':                                  'tesamorelin',
  'GHRP-2':                                       'Um4X9hH3MLSvZx6WoOX4',
  'CJC-1295 without DAC':                         'lotusland-cjc1295withoutdac-10mgvial',
  'CJC-1295 without DAC + Ipamorelin':            'CJC-1295_without_DAC_Ipamorelin-5-5mg-vial',
  'CJC-1295 with DAC':                            '6mOhZxaGyFo46MwgACfH',
  // ── Neuro / Cognitive ──────────────────────────────────────────────────────
  'Selank':                                       'selank',
  'Semax':                                        'semax',
  'Snap-8':                                       'snap-8',
  'PE 22-28':                                     'pe-22-28',
  'SS-31':                                        'ss-31',
  // ── Longevity / NAD ────────────────────────────────────────────────────────
  'NAD+':                                         'nad',
  'NMN':                                          'nmn',
  '5-Amino-1MQ':                                  'lotusland-5amino1mq-10mgvial',
  'GHK-Cu (Human Copper)':                        'lotusland-ghkcuhumancopper-50mgvial',
  'GW501516':                                     'lotusland-gw501516-10mgtablet',
  'MK-677':                                       'lotusland-mk677-12mgtablet',
  'SLU-PP-332':                                   'oDniHVTWA3jgssukDaKp',
  // ── Blends / Combos ────────────────────────────────────────────────────────
  'GLOW (BPC-157 / TB-500 / GHK)':               'glow-bpc-157-tb-500-ghk-cu',
  'KLOW (BPC-157 / TB-500 / GHKCu / KPV)':       'lotusland-klowbpc157tb500ghkcukpv-10mg10mg75mg10mgvial',
  // ── Sexual / Fertility ─────────────────────────────────────────────────────
  'PT-141':                                       'pt-141',
  'MT2':                                          'o6jpvVugV0gVhpVNk5WX',
  'Oxytocin Acetate':                             'oxytocin-acetate',
  'Kisspeptin-10':                                'kisspeptin-10',
  'hCG':                                          'magenta-hcg-5-000-iu-2ml-refill-cartridge-60',
  // ── Anti-aging / Skin ──────────────────────────────────────────────────────
  'LL-37':                                        'lotusland-ll37-12mgvial',
  'PNC-27':                                       'pnc-27',
  'FOX-04':                                       'lotusland-fox04-12mgvial',
  'FST344':                                       'dXb2N7AgnA09fnQAn4Ih',
  'ARA-290':                                      'ara-290',
  // ── Bioregulators (Khavinson) ──────────────────────────────────────────────
  'Cartalax':                                     'cartalax',
  'Cardiogen':                                    'cardiogen',
  'Prostamax':                                    'prostamax',
  'Testagen':                                     'testagen',
  // ── Accessories ────────────────────────────────────────────────────────────
  'Starter Kit (Syringe + Bac Water)':            'starter-kit',
  'Insulin Syringes 1/2 ml - 31g x 8 mm 100 Counts': 'lotusland-insulinsyringes12ml31gx8mm-100countbox',
  'Bac Water':                                    'lotusland-bacteriostaticwater-30mlbottle',
  'Syringe + Bac Water Bundle':                   'lotusland-syringeandbacwaterbundle-100insulinsyringesone30mlbacwaterbottle',
};

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Build stable variant ID: lotusland-<product-slug>-<dose-slug>
// e.g. lotusland-bpc-157-5mg, lotusland-tirzepatide-10mg
const mkVarId = (productName, dosage) => {
  const prodSlug = slugify(productName);
  const doseSlug = slugify(
    dosage.replace(/\s*\/\s*(vial|bottle|tablet)/gi, '')
          .replace(/\s*\|\s*/g, '-')
          .trim()
  );
  return `lotusland-${prodSlug}-${doseSlug}`;
};

// Fetch all variants and products from Firestore
async function fetchData() {
  console.log('   Querying products and collectionGroup variants…');
  const prodSnap = await db.collection('products').get();
  const dbProds = prodSnap.docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() }));

  const varSnap = await db.collectionGroup('variants').get();
  const dbVars = [];
  for (const doc of varSnap.docs) {
    const data = doc.data();
    const sn = (data.supplier || '').toLowerCase();
    const isL = sn === 'lotusland' || sn === 'lotusland limited' || sn.includes('lotusland');
    if (!isL) continue;

    const pathParts = doc.ref.path.split('/');
    const pId = pathParts[1];
    const parentProd = dbProds.find(p => p.id === pId);

    dbVars.push({
      id: doc.id,
      ref: doc.ref,
      productId: pId,
      productName: parentProd ? (parentProd.name || parentProd.title) : data.productName || pId,
      dosage: data.dosage || data.strength || data.normalizedDosage || '',
      supplierUnitCostUSD: data.supplierUnitCostUSD ?? null,
      supplierKitCostUSD: data.supplierKitCostUSD ?? null,
      activeForSupplier: data.activeForSupplier ?? true,
      catalogStatus: data.catalogStatus ?? null,
      presentation: data.presentation || data.packageType || null,
      quantity: data.quantity || null,
      data
    });
  }

  return { dbProds, dbVars };
}

function mkPayload(item) {
  const p = {
    supplierId: SUPPLIER_ID,
    supplierName: SUPPLIER_NAME,
    catalogBrand: CATALOG_BRAND,
    supplierUnitCostUSD: item.perVialPriceUSD,
    supplierKitCostUSD: item.perKitPriceUSD,
    supplierCurrency: 'USD',
    supplierCostSource: COST_SOURCE,
    supplierCostSourceDate: COST_DATE,
    supplierCostUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    dosage: item.dosage,
    normalizedDosage: normD(item.dosage),
    dosageForm: item.presentation === 'vial' ? 'Lyophilized vial' : item.presentation === 'bottle' ? 'Tablet' : 'Other',
    packageType: item.presentation,
    quantity: item.quantity,
    activeForSupplier: true,
    sourceOfTruthMismatch: false,
    supplier: 'LotusLand',
    productName: item.product, // Ensure variant itself has the canonical product name reference
    pricing: {
      master: {
        perUnit: item.perVialPriceUSD,
        kit: item.perKitPriceUSD,
        currency: 'USD'
      }
    }
  };
  const units = extractUnits(item);
  Object.assign(p, units);
  return p;
}

async function main() {
  const mode = process.argv.includes('--live') ? 'live'
             : process.argv.includes('--backup') ? 'backup' : 'dry-run';

  console.log('\n' + '═'.repeat(70));
  console.log(`  LOTUSLAND RECONCILIATION v4 (STABLE IDs) — ${mode.toUpperCase()}`);
  console.log('═'.repeat(70) + '\n');

  const { dbProds, dbVars } = await fetchData();
  console.log(`   Lotusland variants in DB: ${dbVars.length}`);
  console.log(`   JSON source variants:    ${JSON_DATA.length}\n`);

  const toCreate = [];     // Variants to write under target ID
  const toDelete = [];     // Old variants to delete (since their ID is being changed)
  const toCorrect = [];    // Variants already at target ID but needing updates
  const toDeactivate = []; // Variants to deactivate (not in JSON SOT)
  const unchanged = [];
  const matchedVarRefs = new Set(); // track matched database documents

  for (const item of JSON_DATA) {
    const canonId = canonicalProductMap[item.product];
    let parentProd = dbProds.find(p => p.id === canonId);
    if (!parentProd) {
      parentProd = dbProds.find(p => norm(p.name) === norm(item.product) || norm(p.title) === norm(item.product));
    }

    if (!parentProd) {
      toCreate.push({ item, productAction: 'create_product', canonId: canonId || slugify(item.product) });
      continue;
    }

    const itemDoseNorm = normD(item.dosage);
    const targetVarId = mkVarId(item.product, item.dosage);

    // Find all database variants for this product with matching dosage
    const candidates = dbVars.filter(v => v.productId === parentProd.id && normD(v.dosage) === itemDoseNorm);

    // Let's check if the targetVarId already exists
    const existingTarget = candidates.find(v => v.id === targetVarId);

    if (existingTarget) {
      matchedVarRefs.add(existingTarget.ref.path);

      // Check if it needs details update
      const sameCost = existingTarget.supplierUnitCostUSD === item.perVialPriceUSD && existingTarget.supplierKitCostUSD === item.perKitPriceUSD;
      const samePres = existingTarget.presentation === item.presentation;
      const sameQty = existingTarget.quantity === item.quantity;
      const sameActive = existingTarget.activeForSupplier === true;
      const sameProdName = existingTarget.data.productName === item.product;

      if (!sameCost || !samePres || !sameQty || !sameActive || !sameProdName) {
        toCorrect.push({ ref: existingTarget.ref, item, parentProd });
      } else {
        unchanged.push({ ref: existingTarget.ref, item });
      }

      // Any other candidates with different IDs are duplicates or need migration to the target document
      for (const dup of candidates) {
        if (dup.id !== targetVarId) {
          toDelete.push(dup);
          matchedVarRefs.add(dup.ref.path);
        }
      }
    } else {
      // Target ID does not exist. We need to create it.
      // If we have an existing candidate with a different (random) ID, we migrate it (create new, delete old).
      if (candidates.length > 0) {
        // Sort active first to migrate the most relevant one
        candidates.sort((a,b) => (b.activeForSupplier ? 1 : 0) - (a.activeForSupplier ? 1 : 0));
        const oldVar = candidates[0];
        toCreate.push({ item, productAction: 'migrate_variant', parentProd, targetVarId, oldVar });
        matchedVarRefs.add(oldVar.ref.path);

        // Delete this migrated one and any other duplicate candidates
        for (const c of candidates) {
          toDelete.push(c);
          matchedVarRefs.add(c.ref.path);
        }
      } else {
        // Genuinely missing
        toCreate.push({ item, productAction: 'use_existing_product', parentProd, targetVarId });
      }
    }
  }

  // Identify obsolete variants in DB to deactivate
  for (const fv of dbVars) {
    if (!matchedVarRefs.has(fv.ref.path) && fv.activeForSupplier !== false) {
      toDeactivate.push(fv);
    }
  }

  // ── Print summary ─────────────────────────────────────────────────────────
  console.log('─'.repeat(70));
  console.log(`✅ Unchanged:           ${unchanged.length}`);
  console.log(`🟡 To correct/update:   ${toCorrect.length}`);
  console.log(`🔵 To create/migrate:   ${toCreate.length}`);
  console.log(`🟠 To delete/migrate:   ${toDelete.length}`);
  console.log(`❌ To deactivate:       ${toDeactivate.length}`);
  console.log('─'.repeat(70));

  if (toCreate.length) {
    console.log('\n🔵 TO CREATE / MIGRATE TO STABLE ID:');
    for (const { item, productAction, targetVarId, oldVar } of toCreate) {
      console.log(`   ➕ ${item.product} [${item.dosage}] → ID: ${targetVarId} (${productAction === 'migrate_variant' ? 'Migrate from ' + oldVar.id : 'New'})`);
    }
  }
  if (toDelete.length) {
    console.log('\n🟠 TO DELETE (MIGRATED / DUPLICATE):');
    for (const v of toDelete) {
      console.log(`   🗑️  Delete old variant: ${v.productName} [${v.dosage}] (ID: ${v.id})`);
    }
  }
  if (toCorrect.length) {
    console.log('\n🟡 TO CORRECT/UPDATE (AT STABLE ID):');
    for (const { ref, item } of toCorrect) {
      console.log(`   ✏️  Update: ${item.product} [${item.dosage}] (Path: ${ref.path})`);
    }
  }
  if (toDeactivate.length) {
    console.log('\n❌ TO DEACTIVATE (NOT IN JSON SOT):');
    for (const fv of toDeactivate) {
      console.log(`   🗑️  Deactivate: ${fv.productName} [${fv.dosage}] (ID: ${fv.id})`);
    }
  }

  // ── Backup ────────────────────────────────────────────────────────────────
  if (mode === 'backup') {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const bp = path.join(__dirname, `lotusland_backup_${ts}.json`);
    writeFileSync(bp, JSON.stringify({
      timestamp: new Date().toISOString(),
      toCreate,
      toDelete: toDelete.map(d => ({ id: d.id, path: d.ref.path, data: d.data })),
      toCorrect: toCorrect.map(c => ({ path: c.ref.path, item: c.item })),
      toDeactivate: toDeactivate.map(d => ({ id: d.id, path: d.ref.path, data: d.data }))
    }, null, 2));
    console.log(`\n💾 Backup saved to: ${bp}`);
    process.exit(0);
  }

  // ── Live ──────────────────────────────────────────────────────────────────
  if (mode === 'live') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ans = await new Promise(res => rl.question(`\n⚠️  LIVE: Performing stable ID migration. Type CONFIRM to apply: `, res));
    rl.close();
    if (ans.trim() !== 'CONFIRM') {
      console.log('❌ Aborted.');
      process.exit(0);
    }

    let batch = db.batch(), cnt = 0;
    const flush = async () => { if (cnt) { await batch.commit(); batch = db.batch(); cnt = 0; } };

    // Phase 1: Ensure canonical product naming in products collection
    console.log('\n🔵 Ensuring canonical product names...');
    for (const item of JSON_DATA) {
      const canonId = canonicalProductMap[item.product];
      let parentProd = dbProds.find(p => p.id === canonId);
      if (!parentProd) {
        parentProd = dbProds.find(p => norm(p.name) === norm(item.product) || norm(p.title) === norm(item.product));
      }
      if (parentProd && parentProd.name !== item.product) {
        await parentProd.ref.update({
          name: item.product,
          canonicalName: item.product,
          updatedAt: new Date().toISOString()
        });
        console.log(`   ✏️  Renamed Product: ${parentProd.name} → ${item.product}`);
        parentProd.name = item.product; // update locally
      }
    }

    // Phase 2: Create / migrate variants to stable IDs
    console.log('\n🔵 Creating / migrating variants to stable IDs...');
    for (const { item, productAction, canonId, parentProd, targetVarId, oldVar } of toCreate) {
      let finalProd = parentProd;
      if (productAction === 'create_product') {
        const prodRef = db.collection('products').doc(canonId);
        await prodRef.set({
          name: item.product,
          canonicalName: item.product,
          status: 'published',
          isActive: true,
          category: 'Peptides',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log(`   ✅ Created Product: ${item.product} (ID: ${canonId})`);
        finalProd = { id: canonId, ref: prodRef, name: item.product };
        dbProds.push(finalProd);
      }

      if (!finalProd) continue;

      const newVarRef = finalProd.ref.collection('variants').doc(targetVarId || mkVarId(item.product, item.dosage));
      const payload = mkPayload(item);
      payload.createdAt = admin.firestore.FieldValue.serverTimestamp();
      payload.createdBy = 'lotusland_reconcile.mjs_v4';

      // Keep original tracking info if migrating
      if (oldVar && oldVar.data && oldVar.data.createdAt) {
        payload.createdAt = oldVar.data.createdAt;
        if (oldVar.data.createdBy) payload.createdBy = oldVar.data.createdBy;
      }

      await newVarRef.set(payload);
      console.log(`   ✅ Wrote Stable ID Variant: ${item.product} [${item.dosage}] (ID: ${newVarRef.id})`);
    }

    // Phase 3: Correct existing stable ID variants
    console.log('\n🟡 Updating existing stable ID variants...');
    for (const { ref, item } of toCorrect) {
      const payload = mkPayload(item);
      payload.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      payload.updatedBy = 'lotusland_reconcile.mjs_v4';
      batch.update(ref, payload);
      cnt++; if (cnt >= 400) await flush();
      console.log(`   ✅ Updated Variant: ${item.product} [${item.dosage}]`);
    }

    // Phase 4: Delete old / migrated / duplicate variants
    console.log('\n🟠 Deleting old/migrated/duplicate variants...');
    for (const v of toDelete) {
      batch.delete(v.ref);
      cnt++; if (cnt >= 400) await flush();
      console.log(`   🗑️  Deleted Old Variant: ${v.productName} [${v.dosage}] (ID: ${v.id})`);
    }

    // Phase 5: Delete obsolete variants (not in JSON SOT)
    console.log('\n❌ Deleting obsolete variants not in JSON SOT...');
    for (const fv of toDeactivate) {
      batch.delete(fv.ref);
      cnt++; if (cnt >= 400) await flush();
      console.log(`   🗑️  Deleted Obsolete Variant: ${fv.productName} [${fv.dosage}] (ID: ${fv.id})`);
    }

    await flush();
    console.log('\n✅ Stable ID migration completed successfully. Run dry-run to verify final state.');
  }

  if (mode === 'dry-run') {
    const totalActive = unchanged.length + toCorrect.length;
    console.log('\n📋 CHECKLIST:');
    console.log(`   ${totalActive === 104 ? '✅' : '❌'} Active SOT matched variants: ${totalActive}/104`);
    console.log(`   ${toCreate.length === 0 ? '✅' : '❌'} Missing variants to create: ${toCreate.length}`);
    console.log(`   ${toCorrect.length === 0 ? '✅' : '❌'} Cost/detail updates pending: ${toCorrect.length}`);
    console.log(`   ${toDelete.length === 0 ? '✅' : '❌'} Old variants to delete: ${toDelete.length}`);
    console.log(`   ${toDeactivate.length === 0 ? '✅' : '❌'} Obsolete variants to delete: ${toDeactivate.length}`);
    console.log(`\n   Steps:`);
    console.log(`     node scripts/lotusland_reconcile.mjs --backup`);
    console.log(`     node scripts/lotusland_reconcile.mjs --live`);
    console.log(`     node scripts/lotusland_reconcile.mjs         (re-validate)\n`);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
