/**
 * fix_all_protocol_defined.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Deep recursive scan: replaces EVERY occurrence of "protocol_defined" 
 * anywhere in the protocol document (dose_logic, variantRef, route, etc.)
 * then pushes all 25 protocols to Firestore.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const PROTO_DIR = join(ROOT, 'export', 'protocols');
const DRY_RUN   = process.argv.includes('--dry-run');

// ── Firebase init ──────────────────────────────────────────────────────────
const SA_KEY = join(ROOT, 'med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
const key    = JSON.parse(readFileSync(SA_KEY, 'utf8'));
key.project_id = key.project_id.toLowerCase(); // fix case sensitivity
if (!getApps().length) initializeApp({ credential: cert(key), projectId: 'med-peptides-app' });
const db = getFirestore();

// ── Resolution maps ────────────────────────────────────────────────────────
const ROUTE_BY_PRODUCT = {
  // Immune
  'thymosin': 'subcutaneous',
  'tb-500':   'subcutaneous',
  'tb_500':   'subcutaneous',
  'tb500':    'subcutaneous',
  'kpv':      'subcutaneous',
  // Metabolic / longevity
  'mots':     'subcutaneous',
  'retatrutide': 'subcutaneous',
  'ss-31':    'subcutaneous',
  'ss_31':    'subcutaneous',
  'ss 31':    'subcutaneous',
  'elamipretide': 'subcutaneous',
  'ghk':      'subcutaneous',
  'epitalon': 'subcutaneous',
  'epithalon':'subcutaneous',
  'dsip':     'subcutaneous',
  'bpc':      'subcutaneous',
  'pinealon': 'subcutaneous',
  // Nasal peptides
  'selank':   'intranasal',
  'semax':    'intranasal',
};

const DOSE_UNIT_BY_PRODUCT = {
  'selank':   'mcg',
  'semax':    'mcg',
  'sermorelin':  'mcg',
  'ipamorelin':  'mcg',
  'gonadorelin': 'mcg',
  'kisspeptin':  'mcg',
  'mots':     'mg',
  'elamipretide': 'mg',
  'ss-31':    'mg',
  'ss_31':    'mg',
  'ss 31':    'mg',
  'epitalon': 'mg',
  'epithalon':'mg',
  'dsip':     'mg',
  'ghk':      'mg',
  'bpc':      'mg',
  'pinealon': 'mg',
  'kpv':      'mg',
  'thymosin': 'mg',
  'tb':       'mg',
  'retatrutide': 'mg',
};

const FREQ_BY_PRODUCT = {
  'retatrutide': 'weekly',
};

function normalizeId(str = '') {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function lookupMap(map, productId = '', productTitle = '') {
  const ids = [
    normalizeId(productId),
    normalizeId(productTitle),
  ];
  for (const id of ids) {
    for (const [key, val] of Object.entries(map)) {
      if (id.includes(normalizeId(key))) return val;
    }
  }
  return null;
}

/**
 * Recursively walk any object/array and replace "protocol_defined" values.
 * Uses the nearest parent drug's productId / product_title for lookup.
 */
function deepReplace(node, path, drugCtx, changes) {
  if (node === null || node === undefined) return node;

  if (typeof node === 'string') {
    if (node !== 'protocol_defined') return node;

    // Determine what field this is based on the last path segment
    const field = path.split('.').pop();
    let resolved = null;

    if (field === 'route') {
      resolved = lookupMap(ROUTE_BY_PRODUCT, drugCtx.productId, drugCtx.product_title);
    } else if (field === 'dose_unit' || field === 'weekly_dose_unit') {
      resolved = lookupMap(DOSE_UNIT_BY_PRODUCT, drugCtx.productId, drugCtx.product_title);
    } else if (field === 'administration_frequency') {
      resolved = lookupMap(FREQ_BY_PRODUCT, drugCtx.productId, drugCtx.product_title);
    }

    if (resolved) {
      changes.push(`  ✅  [${path}] "${node}" → "${resolved}" (${drugCtx.productId || drugCtx.product_title})`);
      return resolved;
    } else {
      changes.push(`  ⚠️  [${path}] = "protocol_defined" — unknown resolution for "${drugCtx.productId || drugCtx.product_title}"`);
      return node; // leave as is, will be reported
    }
  }

  if (Array.isArray(node)) {
    return node.map((item, i) => deepReplace(item, `${path}[${i}]`, drugCtx, changes));
  }

  if (typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = deepReplace(v, `${path}.${k}`, drugCtx, changes);
    }
    return out;
  }

  return node;
}

// ── Main ───────────────────────────────────────────────────────────────────
const files = readdirSync(PROTO_DIR).filter(
  f => f.endsWith('.json') && !f.includes('bundle')
);

let totalChanges = 0;
let totalFiles   = 0;
let remaining    = 0;
const firestoreQueue = [];

for (const file of files) {
  const filePath = join(PROTO_DIR, file);
  const protocol = JSON.parse(readFileSync(filePath, 'utf8'));
  const fileChanges = [];

  // Process each drug in each phase
  for (const phase of (protocol.phase_blueprints || [])) {
    for (let di = 0; di < (phase.drugs || []).length; di++) {
      const drug = phase.drugs[di];
      // Build context for lookup
      const ctx = {
        productId:     drug.productId || drug.product_id || drug.product_slug || '',
        product_title: drug.product_title || drug.name || '',
      };
      phase.drugs[di] = deepReplace(drug, `phase[${phase.phase_id||'?'}].drug[${di}]`, ctx, fileChanges);
    }
  }

  // Count resolved vs remaining
  const leftover = fileChanges.filter(c => c.includes('⚠️')).length;
  const fixed    = fileChanges.filter(c => c.includes('✅')).length;

  if (fileChanges.length > 0) {
    console.log(`\n📄 ${file}:`);
    fileChanges.forEach(l => console.log(l));
    totalChanges += fixed;
    remaining    += leftover;
    totalFiles++;

    if (!DRY_RUN) {
      writeFileSync(filePath, JSON.stringify(protocol, null, 2), 'utf8');
    }
  }

  if (protocol.protocol_id) {
    firestoreQueue.push({ id: protocol.protocol_id, data: protocol });
  }
}

// ── Firestore push ─────────────────────────────────────────────────────────
if (!DRY_RUN) {
  console.log(`\n🔥 Pushing all ${firestoreQueue.length} protocols to Firestore...`);
  let batch = db.batch(), count = 0;
  for (const { id, data } of firestoreQueue) {
    batch.set(db.collection('protocols').doc(id), { ...data, _last_synced_at: new Date().toISOString() }, { merge: true });
    count++;
    if (count >= 450) { await batch.commit(); batch = db.batch(); count = 0; }
  }
  if (count > 0) await batch.commit();
  console.log('✅  Firestore updated.');
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`📊 Summary:`);
console.log(`   Files touched:   ${totalFiles}`);
console.log(`   Values fixed:    ${totalChanges}`);
console.log(`   Unresolved:      ${remaining}`);
if (DRY_RUN) console.log(`\n   ⚠️  DRY RUN`);
else         console.log(`\n   🔥 Local + Firestore updated`);
