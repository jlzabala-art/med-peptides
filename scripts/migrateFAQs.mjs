/**
 * migrateFAQs.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * MODELO: IDs directos — sin colección intermediaria en runtime.
 *
 * ESTRATEGIA:
 *   1. Lee `products` → construye mapa name→product_id
 *   2. Lee `protocol_templates` → construye mapa product_id→[protocol_id…]
 *   3. Lee `peptide_faq` (479 docs)
 *   4. Lee `faq_peptide_mapping` UNA SOLA VEZ (solo para resolver nombres históricos)
 *   5. Por cada FAQ: resuelve product_ids[] y protocol_ids[] y escribe en peptide_faq
 *   6. Por cada product: construye faq_ids[] y escribe en products
 *   → faq_peptide_mapping ya NO se lee en runtime; solo se usa aquí durante migración
 *
 * Dry-run: node scripts/migrateFAQs.mjs --dry-run
 * Real:    node scripts/migrateFAQs.mjs
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { createRequire }                 from 'module';
import { fileURLToPath }                 from 'url';
import path                              from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require   = createRequire(import.meta.url);
const svcAcct   = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

const DRY_RUN = process.argv.includes('--dry-run');
if (DRY_RUN) console.log('🧪  DRY-RUN — no writes to Firestore\n');

if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(str = '') {
  return str.toLowerCase()
    .replace(/_/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Commit [ref, data] pairs in safe 400-op chunks */
async function commitChunked(pairs, opType = 'update', label = '') {
  const CHUNK = 400;
  for (let i = 0; i < pairs.length; i += CHUNK) {
    const batch = db.batch();
    pairs.slice(i, i + CHUNK).forEach(([ref, data]) => {
      if (opType === 'update') batch.update(ref, data);
      else batch.set(ref, data, { merge: true });
    });
    await batch.commit();
    const done = Math.min(i + CHUNK, pairs.length);
    if (label) process.stdout.write(`\r   ${label}: ${done}/${pairs.length}   `);
  }
  if (label) console.log('');
}

// ─── 1. Load products ─────────────────────────────────────────────────────────

console.log('📦 Loading products…');
const productsSnap = await db.collection('products').get();

// name key → { product_id, name }
const byName = new Map();
productsSnap.docs.forEach(doc => {
  const name = doc.data().name || '';
  const info = { product_id: doc.id, name };
  const keys = new Set([
    normalize(name),
    normalize(doc.id.replace(/-\d+mg.*$/, '').replace(/-\d+ml.*$/, ''))  // strip dosage from ID
  ].filter(Boolean));
  keys.forEach(k => { if (!byName.has(k)) byName.set(k, info); });
});
console.log(`   → ${productsSnap.size} products (${byName.size} name keys)`);

function resolveProduct(rawName) {
  if (!rawName || rawName === 'undefined') return null;
  const key = normalize(rawName);
  if (byName.has(key)) return byName.get(key);
  // fuzzy: name contains query or vice-versa
  for (const [k, info] of byName) {
    if (k.includes(key) || key.includes(k)) return info;
  }
  return null;
}

// ─── 2. Load protocols (product_id → [protocol_id…]) ─────────────────────────

console.log('📦 Loading protocols…');
const protocolsSnap = await db.collection('protocol_templates').get();

/** @type {Map<string, string[]>} */
const protocolsByProduct = new Map();
protocolsSnap.docs.forEach(doc => {
  const d = doc.data();
  const pid = d.protocol_id;
  if (!pid) return;
  const productIds = [];
  (d.products_used || []).forEach(p => {
    if (p?.product_id) productIds.push(p.product_id);
    else if (typeof p === 'string') productIds.push(p);
  });
  (d.phase_blueprints || []).forEach(ph => {
    (ph.drugs || []).forEach(drug => {
      if (drug.product_id) productIds.push(drug.product_id);
    });
  });
  productIds.forEach(productId => {
    if (!protocolsByProduct.has(productId)) protocolsByProduct.set(productId, []);
    const arr = protocolsByProduct.get(productId);
    if (!arr.includes(pid)) arr.push(pid);
  });
});
console.log(`   → ${protocolsSnap.size} protocols indexed`);

// ─── 3 & 4. Load FAQs + mapping (one-time name resolver) ─────────────────────

console.log('📦 Loading peptide_faq…');
const faqSnap = await db.collection('peptide_faq').get();
console.log(`   → ${faqSnap.size} FAQ docs`);

console.log('📦 Loading faq_peptide_mapping (one-time resolver only)…');
const mappingSnap = await db.collection('faq_peptide_mapping').get();
console.log(`   → ${mappingSnap.size} mapping docs`);

// faqId → [peptideName…]   (one FAQ can map to multiple products)
const mappingByFaqId = new Map();
mappingSnap.docs.forEach(doc => {
  const { faqId, peptideName } = doc.data();
  if (!faqId) return;
  if (!mappingByFaqId.has(faqId)) mappingByFaqId.set(faqId, []);
  mappingByFaqId.get(faqId).push(peptideName);
});

// ─── 5. Build enriched FAQ docs ───────────────────────────────────────────────

console.log('\n🔧 Resolving FAQs…');

/** @type {Map<string, Set<string>>} product_id → faq_ids */
const faqsForProduct = new Map();

const faqPairs = [];          // [ref, update] for peptide_faq
const unresolvedNames = new Set();

for (const doc of faqSnap.docs) {
  const faqId    = doc.id;
  const rawNames = mappingByFaqId.get(faqId) || [];

  const productIds  = [];
  const protocolIds = [];

  rawNames.forEach(rawName => {
    const resolved = resolveProduct(rawName);
    if (!resolved) { unresolvedNames.add(rawName); return; }

    if (!productIds.includes(resolved.product_id)) {
      productIds.push(resolved.product_id);

      // Build reverse index: product → faq_ids
      if (!faqsForProduct.has(resolved.product_id))
        faqsForProduct.set(resolved.product_id, new Set());
      faqsForProduct.get(resolved.product_id).add(faqId);
    }

    // Attach related protocols
    (protocolsByProduct.get(resolved.product_id) || []).forEach(pid => {
      if (!protocolIds.includes(pid)) protocolIds.push(pid);
    });
  });

  const isGlobal = productIds.length === 0 && rawNames.length === 0;

  faqPairs.push([doc.ref, {
    product_ids:  productIds,
    protocol_ids: protocolIds,
    is_global:    isGlobal,
    _enrichedAt:  new Date().toISOString()
  }]);
}

// ─── 6. Build product patches (faq_ids[]) ─────────────────────────────────────

const productPairs = [];
productsSnap.docs.forEach(doc => {
  const faqIds = Array.from(faqsForProduct.get(doc.id) || []);
  productPairs.push([doc.ref, {
    faq_ids:     faqIds,
    _enrichedAt: new Date().toISOString()
  }]);
});

// ─── DRY-RUN preview ──────────────────────────────────────────────────────────

if (DRY_RUN) {
  const withProducts = faqPairs.filter(([, u]) => u.product_ids.length > 0);
  const globals      = faqPairs.filter(([, u]) => u.is_global);
  withProducts.slice(0, 10).forEach(([ref, u]) => {
    console.log(`  ✓ [${ref.id}] → [${u.product_ids.join(', ')}]`);
  });
  if (withProducts.length > 10) console.log(`  … and ${withProducts.length - 10} more`);

  console.log(`\n  FAQs with products: ${withProducts.length}`);
  console.log(`  Global FAQs:        ${globals.length}`);
  console.log(`  Products with FAQs: ${faqsForProduct.size}`);
}

// ─── Commit ───────────────────────────────────────────────────────────────────

if (!DRY_RUN) {
  console.log(`\n💾 Writing ${faqPairs.length} FAQ docs…`);
  await commitChunked(faqPairs, 'update', 'FAQs');

  console.log(`💾 Writing ${productPairs.length} product docs (faq_ids[])…`);
  await commitChunked(productPairs, 'update', 'Products');

  console.log('✅  Migration complete');
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(52));
console.log(`📊  SUMMARY ${DRY_RUN ? '(dry-run)' : '(committed)'}`);
console.log(`    FAQ docs processed:   ${faqPairs.length}`);
console.log(`    Products patched:      ${productPairs.length}`);
console.log(`    Unresolved names:      ${unresolvedNames.size}`);
if (unresolvedNames.size) {
  console.log('    (skipped names):');
  [...unresolvedNames].forEach(n => console.log(`      - "${n}"`));
}
console.log('─'.repeat(52));
