/**
 * migrateFAQAssociations.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Enriquece cada doc de `peptide_faq` con:
 *   - product_ids[]       → IDs canónicos de productos asociados
 *   - product_names[]     → nombres legibles (para display/search)
 *   - protocol_ids[]      → IDs de protocolos que usan esos productos
 *   - mapping_type        → "exact_product" | "family" | "generic"
 *
 * Fuentes de datos:
 *   1. faq_peptide_mapping  → peptideName → faqId mappings
 *   2. products_canonical   → name / aliases → product_id resolution
 *   3. protocol_templates   → products_used[] → protocol linkage
 *
 * Usage:
 *   node scripts/migrateFAQAssociations.mjs [--dry-run]
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const DRY_RUN = process.argv.includes('--dry-run');

// ── Firebase init ────────────────────────────────────────────────────────────
if (!getApps().length) {
  try {
    const svc = require(resolve(__dirname, '../serviceAccountKey.json'));
    initializeApp({ credential: cert(svc) });
    console.log('✅ Firebase Admin (serviceAccountKey.json)');
  } catch {
    initializeApp();
    console.log('✅ Firebase Admin (ADC)');
  }
}
const db = getFirestore();
if (DRY_RUN) console.log('🔍 DRY RUN — no writes will be made\n');

// ── Name normalizer (mirrors discoveryEngine.js logic) ──────────────────────
const NAME_ALIASES = {
  '5-amino 1 mq':   '5-amino-1mq',
  '5-amino 1mq':    '5-amino-1mq',
  '5-amino-1mq':    '5-amino-1mq',
  'cjc-1295 without dac (modified grf 1-29)': 'cjc-1295 without dac',
  'fst-344 (follistatin)': 'fst-344',
  'hgh':            'hgh 10iu',
  'igf-1 lr3':      'igf-lr3',
  'mk-677 (ibutamoren)': 'mk-677',
  'mt2 (melanotan ii)': 'mt2',
  'pt-141 (bremelanotide)': 'pt-141',
  'tb-500 (thymosin β4)': 'thymosin b4 (tb-500)',
  'thymosin b4 (tb-500)': 'thymosin b4 (tb-500)',
};

function normalizeName(name) {
  if (!name) return '';
  const lower = name.toLowerCase().trim().replace(/\s+/g, ' ');
  if (NAME_ALIASES[lower]) return NAME_ALIASES[lower];
  const numberNorm = lower.replace(/(\d)\s+(\w)/g, '$1$2').replace(/(\w)\s+(\d)/g, '$1$2');
  if (NAME_ALIASES[numberNorm]) return NAME_ALIASES[numberNorm];
  return lower.replace(/\s*\([^)]+\)\s*$/, '').trim() || lower;
}

// ── Load all data ────────────────────────────────────────────────────────────
async function loadAllData() {
  console.log('📥 Loading data from Firestore...');
  const [faqSnap, mappingSnap, productSnap, protocolSnap] = await Promise.all([
    db.collection('peptide_faq').get(),
    db.collection('faq_peptide_mapping').get(),
    db.collection('products_canonical').get(),
    db.collection('protocol_templates').get(),
  ]);

  console.log(`   peptide_faq:          ${faqSnap.docs.length} docs`);
  console.log(`   faq_peptide_mapping:  ${mappingSnap.docs.length} docs`);
  console.log(`   products_canonical:   ${productSnap.docs.length} docs`);
  console.log(`   protocol_templates:   ${protocolSnap.docs.length} docs\n`);

  return { faqSnap, mappingSnap, productSnap, protocolSnap };
}

// ── Build name → product_id lookup ──────────────────────────────────────────
function buildProductLookup(productSnap) {
  // Map: normalizedName → { product_id, display_name }
  const lookup = new Map();

  for (const doc of productSnap.docs) {
    const data = doc.data();
    const id = doc.id;
    const displayName = data.name || data.product_name || id;

    // Register by doc ID
    lookup.set(normalizeName(id), { product_id: id, display_name: displayName });
    // Register by name
    if (data.name) lookup.set(normalizeName(data.name), { product_id: id, display_name: displayName });
    // Register aliases if present
    if (Array.isArray(data.aliases)) {
      data.aliases.forEach(a => lookup.set(normalizeName(a), { product_id: id, display_name: displayName }));
    }
    // Register slug
    if (data.slug) lookup.set(normalizeName(data.slug), { product_id: id, display_name: displayName });
    // Register product_id field
    if (data.product_id) lookup.set(normalizeName(data.product_id), { product_id: id, display_name: displayName });
  }

  return lookup;
}

// ── Build product_id → protocol_ids[] lookup ────────────────────────────────
function buildProtocolLookup(protocolSnap) {
  // Map: product_id → Set<protocol_id>
  const lookup = new Map();

  for (const doc of protocolSnap.docs) {
    const data = doc.data();
    if (!data.protocol_id) continue;

    const products = Array.isArray(data.products_used) ? data.products_used : [];
    for (const p of products) {
      const pid = (typeof p === 'string' ? p : p?.product_id)?.toLowerCase().trim();
      if (!pid) continue;
      if (!lookup.has(pid)) lookup.set(pid, new Set());
      lookup.get(pid).add(data.protocol_id);
    }
  }

  return lookup;
}

// ── Build faqId → [{ product_id, display_name, mapping_type }] ──────────────
function buildFaqProductMap(mappingSnap, productLookup) {
  const map = new Map(); // faqId → [{ product_id, display_name, mapping_type }]

  for (const doc of mappingSnap.docs) {
    const m = doc.data();
    const faqId = m.faqId;
    const mappingType = m.mappingType || 'exact_product';
    if (!faqId) continue;

    const names = Array.isArray(m.peptideName) ? m.peptideName : [m.peptideName];
    for (const rawName of names) {
      if (!rawName) continue;
      const norm = normalizeName(rawName);
      const resolved = productLookup.get(norm);

      if (!map.has(faqId)) map.set(faqId, []);

      if (resolved) {
        // Canonical match found
        const existing = map.get(faqId);
        if (!existing.find(e => e.product_id === resolved.product_id)) {
          existing.push({ product_id: resolved.product_id, display_name: resolved.display_name, mapping_type: mappingType });
        }
      } else {
        // No canonical match — store the raw name as a fallback label
        const existing = map.get(faqId);
        const fallbackId = norm.replace(/\s+/g, '_');
        if (!existing.find(e => e.product_id === fallbackId)) {
          existing.push({ product_id: fallbackId, display_name: rawName, mapping_type: 'name_only' });
        }
        // Uncomment to debug unresolved names:
        // console.warn(`   ⚠️  Unresolved: "${rawName}" → "${norm}"`);
      }
    }
  }

  return map;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const { faqSnap, mappingSnap, productSnap, protocolSnap } = await loadAllData();

  const productLookup  = buildProductLookup(productSnap);
  const protocolLookup = buildProtocolLookup(protocolSnap);
  const faqProductMap  = buildFaqProductMap(mappingSnap, productLookup);

  console.log(`🗺️  Product lookup entries:  ${productLookup.size}`);
  console.log(`🗺️  Protocol lookup entries: ${protocolLookup.size}`);
  console.log(`🗺️  FAQ→product mappings:   ${faqProductMap.size}\n`);

  let updated = 0, skipped = 0, noMapping = 0, errors = 0;
  const BATCH_SIZE = 20;
  let batch = db.batch();
  let batchCount = 0;

  const flush = async () => {
    if (batchCount > 0 && !DRY_RUN) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  };

  for (const doc of faqSnap.docs) {
    const faqId = doc.id;
    const faqData = doc.data();
    const associations = faqProductMap.get(faqId) || [];

    if (associations.length === 0) {
      noMapping++;
      continue;
    }

    // Build product_ids[], product_names[], protocol_ids[]
    const product_ids = [...new Set(associations.map(a => a.product_id))];
    const product_names = [...new Set(associations.map(a => a.display_name))];
    const mapping_type = associations[0]?.mapping_type || 'exact_product';

    // Resolve protocol IDs for all associated products
    const protocolSet = new Set();
    for (const pid of product_ids) {
      const protocols = protocolLookup.get(pid.toLowerCase());
      if (protocols) protocols.forEach(p => protocolSet.add(p));
    }
    const protocol_ids = [...protocolSet];

    // Check if already up-to-date (avoid unnecessary writes)
    const existingIds = faqData.product_ids || [];
    const alreadyCurrent =
      existingIds.length === product_ids.length &&
      product_ids.every(id => existingIds.includes(id));

    if (alreadyCurrent && (faqData.protocol_ids || []).length === protocol_ids.length) {
      skipped++;
      continue;
    }

    const productLabel = product_names.join(', ').slice(0, 80);
    console.log(`✅ ${faqId.padEnd(45)} → [${product_ids.join(', ')}]${protocol_ids.length ? ` | protocols: ${protocol_ids.join(', ')}` : ''}`);

    if (!DRY_RUN) {
      batch.update(doc.ref, {
        product_ids,
        product_names,
        protocol_ids,
        mapping_type,
        faq_updated_at: FieldValue.serverTimestamp(),
      });
      batchCount++;
      if (batchCount >= BATCH_SIZE) await flush();
    }
    updated++;
  }

  await flush();

  console.log('\n─────────────────────────────────────');
  console.log(`  Updated    : ${updated}`);
  console.log(`  Skipped    : ${skipped} (already current)`);
  console.log(`  No mapping : ${noMapping} (generic FAQs)`);
  console.log(`  Errors     : ${errors}`);
  if (DRY_RUN) console.log('\n  ⚠️  DRY RUN — nothing was written');
  console.log('─────────────────────────────────────\n');
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });
