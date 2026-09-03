/**
 * PHASE 6 — Normalise `presentation` field on ALL variants
 *
 * Uses src/constants/presentationTypes.js as the single source of truth.
 *
 * Run (dry-run):  node scripts/migration/06_normalise_presentation.mjs
 * Run (execute):  node scripts/migration/06_normalise_presentation.mjs --execute
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { readFileSync, writeFileSync }   from 'fs';
import { join, dirname }                 from 'path';
import { fileURLToPath }                 from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

// ── Import taxonomy (CJS-compatible inline copy since Admin scripts are ESM) ──
// PRESENTATION_ALIASES + inferPresentation duplicated here to avoid transpilation
const VALID_PRESENTATIONS = new Set([
  'vial','pen','nasal_spray','capsule','tablet','cream',
  'bottle','kit','bundle','digital','blood_test','dna_test','box'
]);

const ALIASES = {
  'pre-filled pen':'pen','prefilled pen':'pen','pre filled pen':'pen',
  'single use pen':'pen','single-use pen':'pen','singleuse pen':'pen',
  'reconstitution pen':'pen','multi-dose pen':'pen','multidose pen':'pen',
  'injection pen':'pen','auto-injector':'pen',
  'nasal spray':'nasal_spray','nasal_spray':'nasal_spray','nasal-spray':'nasal_spray',
  'spray':'nasal_spray','intranasal spray':'nasal_spray',
  'capsule':'capsule','capsules':'capsule','cap':'capsule','oral capsule':'capsule',
  'tablet':'tablet','tablets':'tablet','tab':'tablet','pill':'tablet','oral tablet':'tablet',
  'vial':'vial','vials':'vial','lyophilised vial':'vial','lyophilized vial':'vial',
  'powder vial':'vial','injectable vial':'vial','ampoule':'vial',
  'cream':'cream','gel':'cream','topical cream':'cream','topical gel':'cream','topical':'cream',
  'bottle':'bottle','liquid bottle':'bottle','dropper':'bottle','tincture':'bottle',
  'kit':'kit','starter kit':'kit','collection kit':'kit','saliva collection kit':'kit',
  'saliva collection kit x2':'kit','saliva collection kit x4':'kit','test kit':'kit',
  'bundle':'bundle','pack':'bundle','combo':'bundle',
  'digital subscription':'digital','subscription':'digital','digital service':'digital',
  'saas':'digital','platform access':'digital',
  'blood test':'blood_test','blood analysis':'blood_test','blood draw kit':'blood_test',
  'lab test':'blood_test','serum':'blood_test',
  'dna test':'dna_test','dna_test':'dna_test','genetic test':'dna_test',
  'genetics test':'dna_test','saliva test':'dna_test',
  'box':'box','boxed':'box',
};

function inferPresentation(text) {
  const t = (text || '').toLowerCase();
  const direct = ALIASES[t.trim()];
  if (direct) return direct;
  if (/nasal.?spray|intranasal/i.test(t))          return 'nasal_spray';
  if (/pre.?fill|prefill|single.?use.?pen|auto.?inject/i.test(t)) return 'pen';
  if (/\bpen\b/i.test(t))                           return 'pen';
  if (/capsule|cap\b/i.test(t))                     return 'capsule';
  if (/tablet|tab\b|\bpill\b/i.test(t))             return 'tablet';
  if (/cream|gel\b|topical/i.test(t))               return 'cream';
  if (/\bbottle\b|\btincture\b|\bdropper\b/i.test(t)) return 'bottle';
  if (/blood.?(test|draw|analys)/i.test(t))         return 'blood_test';
  if (/\btest\b/i.test(t))                          return 'blood_test';
  if (/dna|genetic|saliva.?kit/i.test(t))           return 'dna_test';
  if (/digital|subscription|platform/i.test(t))    return 'digital';
  if (/bundle|pack\b|combo/i.test(t))               return 'bundle';
  if (/\bkit\b/i.test(t))                           return 'kit';
  if (/\bbox\b|syringe/i.test(t))                   return 'box';
  if (/spray/i.test(t))                             return 'nasal_spray';
  // Supplement/oral inference (mushroom, enzyme, LDN, SPU, d3 vitamin, supplement)
  if (/mushroom|fungi|\bspu\b|serrapeptase|naltrexone|lion.?mane|supplement|vitamin d/i.test(t)) return 'capsule';
  if (/vial|ampoule|powder|lyophil/i.test(t))      return 'vial';
  return null;
}

function normalise(raw) {
  if (!raw) return null;
  const lowered = raw.trim().toLowerCase();
  if (VALID_PRESENTATIONS.has(lowered)) return lowered;
  if (ALIASES[lowered]) return ALIASES[lowered];
  return inferPresentation(raw);
}

// ── Load all products (for name-based inference fallback) ─────────────────────
const prodSnap = await db.collection('products').get();
const productNames = {};
prodSnap.forEach(d => { productNames[d.id] = d.data().canonicalName || d.data().name || ''; });

// ── Load all variants ─────────────────────────────────────────────────────────
console.log('🔍  Loading all variants…');
const varSnap = await db.collectionGroup('variants').get();
console.log(`    Loaded ${varSnap.size} variants`);

// ── Classify each variant ─────────────────────────────────────────────────────
const toUpdate   = [];   // needs writing
const alreadyOk  = [];   // already canonical
const unknown    = [];   // cannot resolve

for (const doc of varSnap.docs) {
  const d          = doc.data();
  const raw        = d.presentation;
  const productId  = doc.ref.parent.parent.id;
  const productName = productNames[productId] || '';
  const label      = d.label || '';

  // Try to normalise from current presentation field
  let canonical = normalise(raw);

  // Fallback 1: infer from variant label
  if (!canonical) canonical = inferPresentation(label);

  // Fallback 2: infer from product name
  if (!canonical) canonical = inferPresentation(productName);

  // Fallback 3: supplier-level defaults (e.g. all Bloodo = blood tests, all Fagron = DNA tests)
  if (!canonical) {
    const sid = d.supplierId || d.supplier || '';
    if (sid === 'supplier-bloodo')           canonical = 'blood_test';
    if (sid === 'supplier-fagron-genomics')  canonical = 'dna_test';
  }

  // Fallback 4: product-ID-level overrides for known edge cases with empty labels
  if (!canonical) {
    const PRODUCT_ID_OVERRIDES = {
      'glutathione':         'vial',      // injectable glutathione
      'ldn':                 'capsule',   // Low Dose Naltrexone (oral)
      'vit-d3':              'capsule',   // Vitamin D3 (oral)
      'vit-d3-10000iu-k2':   'capsule',
      'lions-mane-mushroom': 'capsule',
      'serrapeptase-300000spu': 'capsule',
      'nad-500-mg':          'vial',      // injectable NAD+
      'nad-1000-mg':         'vial',
    };
    const pid = doc.ref.parent.parent.id;
    if (PRODUCT_ID_OVERRIDES[pid]) canonical = PRODUCT_ID_OVERRIDES[pid];
  }

  if (canonical) {
    if (raw === canonical) {
      alreadyOk.push({ id: doc.id, canonical });
    } else {
      toUpdate.push({
        ref: doc.ref, id: doc.id, productId, productName,
        label, raw: raw || '(missing)', canonical,
        supplierId: d.supplierId || d.supplier,
      });
    }
  } else {
    unknown.push({
      id: doc.id, productId, productName, label,
      raw: raw || '(missing)', supplierId: d.supplierId || d.supplier,
    });
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════');
console.log('  PRESENTATION NORMALISATION — DRY RUN');
console.log('══════════════════════════════════════════════════');
console.log(`  Already canonical (skip) : ${alreadyOk.length}`);
console.log(`  Will update              : ${toUpdate.length}`);
console.log(`  Cannot resolve (unknown) : ${unknown.length}`);

// Group updates by raw → canonical for review
const groupedUpdates = {};
toUpdate.forEach(u => {
  const key = `"${u.raw}" → "${u.canonical}"`;
  if (!groupedUpdates[key]) groupedUpdates[key] = { count: 0, examples: [] };
  groupedUpdates[key].count++;
  if (groupedUpdates[key].examples.length < 2) groupedUpdates[key].examples.push(`[${u.supplierId}] ${u.productName}`);
});
console.log('\nMappings to apply:');
Object.entries(groupedUpdates).sort((a,b) => b[1].count - a[1].count).forEach(([k, v]) => {
  console.log(`  ${k} ×${v.count}`);
  v.examples.forEach(e => console.log(`    e.g. ${e}`));
});

if (unknown.length) {
  console.log('\n⚠️  Cannot resolve:');
  unknown.slice(0, 15).forEach(u =>
    console.log(`  [${u.supplierId}] ${u.productId} | raw: "${u.raw}" | label: "${u.label}"`)
  );
  if (unknown.length > 15) console.log(`  ...and ${unknown.length - 15} more`);
}

// ── Write log ─────────────────────────────────────────────────────────────────
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const logPath = join(__dirname, `presentation_normalise_plan_${ts}.json`);
writeFileSync(logPath, JSON.stringify({ toUpdate: toUpdate.map(u => ({ ...u, ref: undefined })), unknown }, null, 2));
console.log(`\n📄  Plan → ${logPath}`);

// ── Execute ───────────────────────────────────────────────────────────────────
const EXECUTE = process.argv.includes('--execute');
if (!EXECUTE) { console.log('\n⚠️  DRY RUN — pass --execute to apply.'); process.exit(0); }

console.log('\n🚀  Applying…');
let done = 0, errors = [];
const BATCH_SIZE = 400;
for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
  const batch = db.batch();
  const chunk = toUpdate.slice(i, i + BATCH_SIZE);
  for (const u of chunk) {
    batch.update(u.ref, { presentation: u.canonical, updatedAt: new Date() });
  }
  try {
    await batch.commit();
    done += chunk.length;
    console.log(`  ✅  batch ${Math.floor(i/BATCH_SIZE)+1}: wrote ${chunk.length}`);
  } catch (e) { errors.push(e.message); console.error('  ❌', e.message); }
}

console.log('\n══════════════════════════════════════════════════');
console.log('  COMPLETE');
console.log('══════════════════════════════════════════════════');
console.log(`  Updated : ${done}`);
console.log(`  Skipped : ${unknown.length}`);
console.log(`  Errors  : ${errors.length}`);
