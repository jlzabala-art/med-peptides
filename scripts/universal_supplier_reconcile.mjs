/**
 * universal_supplier_reconcile.mjs
 * 
 * Herramienta unificada para importar o actualizar el catálogo de cualquier
 * proveedor usando un archivo JSON como Source of Truth (SOT).
 * 
 * Uso:
 *   node scripts/universal_supplier_reconcile.mjs --supplier=<id> --file=<ruta.json>
 *   node scripts/universal_supplier_reconcile.mjs --supplier=<id> --file=<ruta.json> --backup
 *   node scripts/universal_supplier_reconcile.mjs --supplier=<id> --file=<ruta.json> --live
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, readFileSync } from 'fs';
import * as readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sa = require(path.join(__dirname, 'serviceAccountKey.json'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

// Helpers de normalización
const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const normD = s => (s || '')
  .toLowerCase()
  .replace(/\s+/g, '')
  .replace(/mcg\/ta[b]*/g, 'mcg')
  .replace(/\/vial/g, '')
  .replace(/\/bottle/g, '')
  .replace(/\/tablet/g, '')
  .replace(/iu\/vial/g, 'iu')
  .replace(/,/g, '')
  .replace(/\|/g, '+')
  .replace(/\//g, '+');

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Extraer unidades del string quantity
function extractUnits(quantityStr) {
  const qtyStr = (quantityStr || '').toLowerCase();
  const res = {};
  if (qtyStr.includes('vial / kit')) {
    const match = qtyStr.match(/(\d+)\s+vial/);
    if (match) res.unitsPerKit = parseInt(match[1]);
  } else if (qtyStr.includes('tabs / bottle') || qtyStr.includes('caps / bottle')) {
    const match = qtyStr.match(/(\d+)\s+(tabs|caps)/);
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

// ── Adaptadores por Proveedor ────────────────────────────────────────────────
// Agrega nuevos adaptadores aquí si el JSON del proveedor tiene un formato distinto
const ADAPTERS = {
  lotusland: {
    supplierId: 'OLlBbQjgrj6tY7GmM2Jo',
    supplierName: 'Lotusland Limited',
    catalogBrand: 'RegenPept',
    mapRecord: (item) => ({
      productName: item.product,
      dosage: item.dosage,
      presentation: item.presentation,
      quantity: item.quantity,
      perUnitCostUSD: item.perVialPriceUSD,
      perKitCostUSD: item.perKitPriceUSD,
      raw: item
    })
  },
  default: {
    supplierId: 'UNKNOWN',
    supplierName: 'Generic Supplier',
    catalogBrand: 'GenericBrand',
    mapRecord: (item) => ({
      productName: item.productName || item.product,
      dosage: item.dosage || item.dose,
      presentation: item.presentation || item.type,
      quantity: item.quantity,
      perUnitCostUSD: item.perUnitCostUSD || item.cost,
      perKitCostUSD: item.perKitCostUSD,
      raw: item
    })
  }
};

// ── Lógica Principal ────────────────────────────────────────────────────────

function mkVarId(supplierSlug, productName, dosage) {
  const prodSlug = slugify(productName);
  const doseSlug = slugify(
    (dosage || '').replace(/\s*\/\s*(vial|bottle|tablet|capsule)/gi, '')
      .replace(/\s*\|\s*/g, '-')
      .trim()
  );
  return `${supplierSlug}-${prodSlug}-${doseSlug}`;
}

function mkPayload(adapter, stdItem) {
  const p = {
    supplierId: adapter.supplierId,
    supplierName: adapter.supplierName,
    catalogBrand: adapter.catalogBrand,
    supplierUnitCostUSD: stdItem.perUnitCostUSD ?? null,
    supplierKitCostUSD: stdItem.perKitCostUSD ?? null,
    supplierCurrency: 'USD',
    supplierCostSource: 'universal_import_json',
    supplierCostSourceDate: new Date().toISOString().split('T')[0],
    supplierCostUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    dosage: stdItem.dosage,
    normalizedDosage: normD(stdItem.dosage),
    dosageForm: stdItem.presentation === 'vial' ? 'Lyophilized vial' : stdItem.presentation === 'bottle' ? 'Tablet' : 'Other',
    packageType: stdItem.presentation,
    quantity: stdItem.quantity,
    activeForSupplier: true,
    sourceOfTruthMismatch: false,
    supplier: adapter.supplierName,
    productName: stdItem.productName,
    pricing: {
      master: {
        perUnit: stdItem.perUnitCostUSD ?? null,
        kit: stdItem.perKitCostUSD ?? null,
        currency: 'USD'
      }
    }
  };
  const units = extractUnits(stdItem.quantity);
  Object.assign(p, units);
  return p;
}

async function fetchData(adapter) {
  console.log('   Querying products and collectionGroup variants…');
  const prodSnap = await db.collection('products').get();
  const dbProds = prodSnap.docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() }));

  const varSnap = await db.collectionGroup('variants').get();
  const dbVars = [];
  const targetSupplierName = adapter.supplierName.toLowerCase();
  
  for (const doc of varSnap.docs) {
    const data = doc.data();
    const sn = (data.supplier || data.supplierName || '').toLowerCase();
    
    // Check if variant belongs to target supplier
    if (sn !== targetSupplierName && !sn.includes(targetSupplierName.split(' ')[0])) continue;

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

async function main() {
  const args = process.argv.slice(2);
  const supplierArg = args.find(a => a.startsWith('--supplier='))?.split('=')[1];
  const fileArg = args.find(a => a.startsWith('--file='))?.split('=')[1];
  const mode = args.includes('--live') ? 'live'
             : args.includes('--backup') ? 'backup' : 'dry-run';

  if (!supplierArg || !fileArg) {
    console.error('Error: missing required arguments.');
    console.error('Usage: node universal_supplier_reconcile.mjs --supplier=<id> --file=<ruta.json> [--live | --backup]');
    process.exit(1);
  }

  const adapterName = ADAPTERS[supplierArg] ? supplierArg : 'default';
  const adapter = ADAPTERS[adapterName];
  if (adapterName === 'default') {
    console.warn(`⚠️  Warning: Adapter for '${supplierArg}' not found. Using 'default' generic adapter.`);
    adapter.supplierName = supplierArg.charAt(0).toUpperCase() + supplierArg.slice(1);
  }

  const JSON_PATH = path.resolve(fileArg);
  let JSON_DATA;
  try {
    JSON_DATA = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
  } catch (err) {
    console.error(`Error reading JSON file at ${JSON_PATH}:`, err.message);
    process.exit(1);
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`  UNIVERSAL SYNC: ${adapter.supplierName.toUpperCase()} — ${mode.toUpperCase()}`);
  console.log('═'.repeat(70) + '\n');

  const { dbProds, dbVars } = await fetchData(adapter);
  console.log(`   Variants in DB for ${adapter.supplierName}: ${dbVars.length}`);
  console.log(`   JSON source variants: ${JSON_DATA.length}\n`);

  const toCreate = [];
  const toDelete = [];
  const toCorrect = [];
  const toDeactivate = [];
  const unchanged = [];
  const matchedVarRefs = new Set();
  
  // Custom Canonical map if needed (future feature, empty for now except exact matches)
  const canonicalProductMap = {};

  for (const rawItem of JSON_DATA) {
    const stdItem = adapter.mapRecord(rawItem);
    if (!stdItem.productName) {
      console.warn('⚠️  Skipping item with no productName:', rawItem);
      continue;
    }

    const canonId = canonicalProductMap[stdItem.productName] || null;
    let parentProd = canonId ? dbProds.find(p => p.id === canonId) : null;
    
    if (!parentProd) {
      parentProd = dbProds.find(p => norm(p.name) === norm(stdItem.productName) || norm(p.title) === norm(stdItem.productName));
    }

    if (!parentProd) {
      toCreate.push({ stdItem, productAction: 'create_product', canonId: canonId || slugify(stdItem.productName) });
      continue;
    }

    const itemDoseNorm = normD(stdItem.dosage);
    const targetVarId = mkVarId(supplierArg, stdItem.productName, stdItem.dosage);

    const candidates = dbVars.filter(v => v.productId === parentProd.id && normD(v.dosage) === itemDoseNorm);
    const existingTarget = candidates.find(v => v.id === targetVarId);

    if (existingTarget) {
      matchedVarRefs.add(existingTarget.ref.path);

      const sameCost = existingTarget.supplierUnitCostUSD === stdItem.perUnitCostUSD && existingTarget.supplierKitCostUSD === stdItem.perKitCostUSD;
      const samePres = existingTarget.presentation === stdItem.presentation;
      const sameQty = existingTarget.quantity === stdItem.quantity;
      const sameActive = existingTarget.activeForSupplier === true;
      const sameProdName = existingTarget.data.productName === stdItem.productName;

      if (!sameCost || !samePres || !sameQty || !sameActive || !sameProdName) {
        toCorrect.push({ ref: existingTarget.ref, stdItem, parentProd });
      } else {
        unchanged.push({ ref: existingTarget.ref, stdItem });
      }

      for (const dup of candidates) {
        if (dup.id !== targetVarId) {
          toDelete.push(dup);
          matchedVarRefs.add(dup.ref.path);
        }
      }
    } else {
      if (candidates.length > 0) {
        candidates.sort((a,b) => (b.activeForSupplier ? 1 : 0) - (a.activeForSupplier ? 1 : 0));
        const oldVar = candidates[0];
        toCreate.push({ stdItem, productAction: 'migrate_variant', parentProd, targetVarId, oldVar });
        matchedVarRefs.add(oldVar.ref.path);

        for (const c of candidates) {
          toDelete.push(c);
          matchedVarRefs.add(c.ref.path);
        }
      } else {
        toCreate.push({ stdItem, productAction: 'use_existing_product', parentProd, targetVarId });
      }
    }
  }

  for (const fv of dbVars) {
    if (!matchedVarRefs.has(fv.ref.path) && fv.activeForSupplier !== false) {
      toDeactivate.push(fv);
    }
  }

  console.log('─'.repeat(70));
  console.log(`✅ Unchanged:           ${unchanged.length}`);
  console.log(`🟡 To correct/update:   ${toCorrect.length}`);
  console.log(`🔵 To create/migrate:   ${toCreate.length}`);
  console.log(`🟠 To delete/migrate:   ${toDelete.length}`);
  console.log(`❌ To deactivate:       ${toDeactivate.length}`);
  console.log('─'.repeat(70));

  if (toCreate.length) {
    console.log('\n🔵 TO CREATE / MIGRATE TO STABLE ID:');
    for (const { stdItem, productAction, targetVarId, oldVar } of toCreate) {
      console.log(`   ➕ ${stdItem.productName} [${stdItem.dosage}] → ID: ${targetVarId} (${productAction === 'migrate_variant' ? 'Migrate from ' + oldVar.id : 'New'})`);
    }
  }
  if (toCorrect.length) {
    console.log('\n🟡 TO CORRECT/UPDATE (AT STABLE ID):');
    for (const { ref, stdItem } of toCorrect) {
      console.log(`   ✏️  Update: ${stdItem.productName} [${stdItem.dosage}] (Path: ${ref.path})`);
    }
  }
  if (toDeactivate.length) {
    console.log('\n❌ TO DEACTIVATE (NOT IN JSON SOT):');
    for (const fv of toDeactivate) {
      console.log(`   🗑️  Deactivate: ${fv.productName} [${fv.dosage}] (ID: ${fv.id})`);
    }
  }

  if (mode === 'backup') {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const bp = path.join(__dirname, `${supplierArg}_backup_${ts}.json`);
    writeFileSync(bp, JSON.stringify({
      timestamp: new Date().toISOString(),
      toCreate: toCreate.map(c => c.stdItem),
      toDelete: toDelete.map(d => ({ id: d.id, path: d.ref.path, data: d.data })),
      toCorrect: toCorrect.map(c => ({ path: c.ref.path, stdItem: c.stdItem })),
      toDeactivate: toDeactivate.map(d => ({ id: d.id, path: d.ref.path, data: d.data }))
    }, null, 2));
    console.log(`\n💾 Backup saved to: ${bp}`);
    process.exit(0);
  }

  if (mode === 'live') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ans = await new Promise(res => rl.question(`\n⚠️  LIVE: Performing stable ID migration for ${adapter.supplierName}. Type CONFIRM to apply: `, res));
    rl.close();
    if (ans.trim() !== 'CONFIRM') {
      console.log('❌ Aborted.');
      process.exit(0);
    }

    let batch = db.batch(), cnt = 0;
    const flush = async () => { if (cnt) { await batch.commit(); batch = db.batch(); cnt = 0; } };

    console.log('\n🔵 Ensuring canonical product names...');
    for (const rawItem of JSON_DATA) {
      const stdItem = adapter.mapRecord(rawItem);
      const canonId = canonicalProductMap[stdItem.productName];
      let parentProd = canonId ? dbProds.find(p => p.id === canonId) : null;
      if (!parentProd) {
        parentProd = dbProds.find(p => norm(p.name) === norm(stdItem.productName) || norm(p.title) === norm(stdItem.productName));
      }
      if (parentProd && parentProd.name !== stdItem.productName) {
        await parentProd.ref.update({
          name: stdItem.productName,
          canonicalName: stdItem.productName,
          updatedAt: new Date().toISOString()
        });
        console.log(`   ✏️  Renamed Product: ${parentProd.name} → ${stdItem.productName}`);
        parentProd.name = stdItem.productName;
      }
    }

    console.log('\n🔵 Creating / migrating variants to stable IDs...');
    for (const { stdItem, productAction, canonId, parentProd, targetVarId, oldVar } of toCreate) {
      let finalProd = parentProd;
      if (productAction === 'create_product') {
        const prodRef = db.collection('products').doc(canonId);
        await prodRef.set({
          name: stdItem.productName,
          canonicalName: stdItem.productName,
          status: 'published',
          isActive: true,
          category: 'Peptides',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log(`   ✅ Created Product: ${stdItem.productName} (ID: ${canonId})`);
        finalProd = { id: canonId, ref: prodRef, name: stdItem.productName };
        dbProds.push(finalProd);
      }

      if (!finalProd) continue;

      const newVarRef = finalProd.ref.collection('variants').doc(targetVarId || mkVarId(supplierArg, stdItem.productName, stdItem.dosage));
      const payload = mkPayload(adapter, stdItem);
      payload.createdAt = admin.firestore.FieldValue.serverTimestamp();
      payload.createdBy = 'universal_supplier_reconcile.mjs';

      if (oldVar && oldVar.data && oldVar.data.createdAt) {
        payload.createdAt = oldVar.data.createdAt;
        if (oldVar.data.createdBy) payload.createdBy = oldVar.data.createdBy;
      }

      await newVarRef.set(payload);
      console.log(`   ✅ Wrote Stable ID Variant: ${stdItem.productName} [${stdItem.dosage}] (ID: ${newVarRef.id})`);
    }

    console.log('\n🟡 Updating existing stable ID variants...');
    for (const { ref, stdItem } of toCorrect) {
      const payload = mkPayload(adapter, stdItem);
      payload.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      payload.updatedBy = 'universal_supplier_reconcile.mjs';
      batch.update(ref, payload);
      cnt++; if (cnt >= 400) await flush();
      console.log(`   ✅ Updated Variant: ${stdItem.productName} [${stdItem.dosage}]`);
    }

    console.log('\n🟠 Deleting old/migrated/duplicate variants...');
    for (const v of toDelete) {
      batch.delete(v.ref);
      cnt++; if (cnt >= 400) await flush();
      console.log(`   🗑️  Deleted Old Variant: ${v.productName} [${v.dosage}] (ID: ${v.id})`);
    }

    console.log('\n❌ Deactivating obsolete variants not in JSON SOT...');
    for (const fv of toDeactivate) {
      batch.update(fv.ref, {
        activeForSupplier: false,
        catalogStatus: 'not_in_json',
        deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        deactivatedBy: 'universal_supplier_reconcile.mjs'
      });
      cnt++; if (cnt >= 400) await flush();
      console.log(`   🗑️  Deactivated Variant: ${fv.productName} [${fv.dosage}]`);
    }

    await flush();
    console.log('\n✅ Stable ID migration completed successfully. Run dry-run to verify final state.');
  }

  if (mode === 'dry-run') {
    console.log('\n📋 CHECKLIST:');
    console.log(`   ${toCreate.length === 0 ? '✅' : '❌'} Missing variants to create: ${toCreate.length}`);
    console.log(`   ${toCorrect.length === 0 ? '✅' : '❌'} Cost/detail updates pending: ${toCorrect.length}`);
    console.log(`   ${toDelete.length === 0 ? '✅' : '❌'} Old variants to delete: ${toDelete.length}`);
    console.log(`   ${toDeactivate.length === 0 ? '✅' : '❌'} Obsolete variants to deactivate: ${toDeactivate.length}`);
    console.log(`\n   Steps:`);
    console.log(`     node scripts/universal_supplier_reconcile.mjs --supplier=${supplierArg} --file="${fileArg}" --backup`);
    console.log(`     node scripts/universal_supplier_reconcile.mjs --supplier=${supplierArg} --file="${fileArg}" --live`);
    console.log(`     node scripts/universal_supplier_reconcile.mjs --supplier=${supplierArg} --file="${fileArg}"      (re-validate)\n`);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
