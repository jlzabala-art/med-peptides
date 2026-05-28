/**
 * seedSupplementsToFirestore.mjs
 *
 * Uploads all entries from src/data/supplements.js → Firestore `supplements/`
 * Each document uses a slug derived from the supplement name as its ID.
 *
 * Usage:
 *   node src/scripts/seedSupplementsToFirestore.mjs
 *
 * Requirements:
 *   - firebase-admin installed  (npm install firebase-admin)
 *   - serviceAccountKey.json present at src/scripts/serviceAccountKey.json
 *     OR set GOOGLE_APPLICATION_CREDENTIALS env var to its path.
 *
 * Run from project root:
 *   node src/scripts/seedSupplementsToFirestore.mjs
 */

import { readFileSync }     from 'fs';
import { createRequire }    from 'module';
import { fileURLToPath }    from 'url';
import { dirname, join }    from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }     from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ─── Service Account ──────────────────────────────────────────────────────────
const serviceKeyPath = join(__dirname, 'serviceAccountKey.json');
let credential;
try {
  const raw = readFileSync(serviceKeyPath, 'utf-8');
  credential = cert(JSON.parse(raw));
  console.log('🔑  Using serviceAccountKey.json');
} catch {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('🔑  Using GOOGLE_APPLICATION_CREDENTIALS');
  } else {
    console.error('❌  No credentials found.');
    console.error('    Place serviceAccountKey.json in src/scripts/ or set GOOGLE_APPLICATION_CREDENTIALS.');
    process.exit(1);
  }
}

initializeApp({ credential, projectId: 'med-peptides-app' });
const db = getFirestore();

// ─── Load supplements data ────────────────────────────────────────────────────
// We use createRequire to import the CommonJS-style supplements.js
const require = createRequire(import.meta.url);
// supplements.js uses named export — we transpile on-the-fly via eval trick,
// but the cleaner path: read as text and extract the array.
const supplementsRaw = readFileSync(
  join(__dirname, '../data/supplements.js'),
  'utf-8'
);

// Extract the array literal from the ES module export
// supplements.js: export const supplements = [ ... ];
const match = supplementsRaw.match(/export\s+const\s+supplements\s*=\s*(\[[\s\S]*\]);?\s*$/m);
if (!match) {
  console.error('❌  Could not parse supplements.js — expected: export const supplements = [...]');
  process.exit(1);
}

let supplements;
try {
   
  supplements = eval(match[1]);
} catch (e) {
  console.error('❌  Failed to evaluate supplements array:', e.message);
  process.exit(1);
}

if (!Array.isArray(supplements) || supplements.length === 0) {
  console.error('❌  supplements array is empty or invalid');
  process.exit(1);
}

console.log(`\n📦  Found ${supplements.length} supplement entries in supplements.js\n`);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toSlug(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sanitize(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) => (v === undefined ? null : v)));
}

// ─── Consolidate: one doc per unique name, variants as sub-documents ──────────
function buildDocs(entries) {
  const byName = new Map();

  entries.forEach((s, i) => {
    const nameKey = s.name.toLowerCase().trim();
    const slug    = toSlug(s.name);

    if (!byName.has(nameKey)) {
      byName.set(nameKey, {
        slug,
        name:             s.name,
        category:         s.category   || 'Other',
        desc:             s.desc       || '',
        objective:        s.objective  || '',
        goals:            Array.isArray(s.goals)            ? s.goals            : [],
        tags:             Array.isArray(s.tags)             ? s.tags             : [],
        semanticKeywords: Array.isArray(s.semanticKeywords) ? s.semanticKeywords : [],
        synonyms:         Array.isArray(s.synonyms)         ? s.synonyms         : [],
        clinical_benefits:Array.isArray(s.clinical_benefits)? s.clinical_benefits: [],
        mechanisms:       Array.isArray(s.mechanisms)       ? s.mechanisms       : [],
        image:            s.image   || '/assets/vials/generic-supplement.png',
        type:             s.type    || 'supplement',
        status:           s.status  || 'active',
        analytics_usage_score: s.analytics_usage_score ?? 0,
        usage_score:           s.usage_score           ?? 0,
        search_count:          s.search_count          ?? 0,
        seeded_at:        new Date().toISOString(),
        variants: [],
      });
    }

    // Always add this dosage/quantity as a variant
    const doc = byName.get(nameKey);
    const variantSlug = `${slug}-${toSlug(s.dosage || 'std')}-${toSlug(s.quantity || 'std')}-${i}`;
    // priceUSD is the canonical price field in supplements.js;
    // perVialPriceUSD is used by legacy/products.js.backup entries.
    const resolvedPrice = s.priceUSD ?? s.perVialPriceUSD ?? null;
    doc.variants.push({
      id:              variantSlug,
      dosage:          s.dosage    || null,
      quantity:        s.quantity  || null,
      priceUSD:        resolvedPrice,
      perVialPriceUSD: resolvedPrice,  // kept for backwards compat
      kitPriceUSD:     s.kitPriceUSD ?? null,
      status:          s.status    || 'active',
    });
  });

  // Denormalize the cheapest variant price onto the parent doc so
  // clients don't need to fetch the variants subcollection just for pricing.
  for (const doc of byName.values()) {
    const prices = doc.variants
      .map((v) => v.priceUSD)
      .filter((p) => p != null && p > 0);
    doc.lowestPriceUSD = prices.length ? Math.min(...prices) : null;
  }

  return Array.from(byName.values());
}

// ─── Commit in Firestore batches of 500 ───────────────────────────────────────
async function commitBatch(ops) {
  const BATCH_SIZE = 500;
  for (let i = 0; i < ops.length; i += BATCH_SIZE) {
    const chunk = ops.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    chunk.forEach(({ ref, data }) => batch.set(ref, data, { merge: true }));
    await batch.commit();
    console.log(`  ✔  Committed ${chunk.length} operations (batch ${Math.floor(i / BATCH_SIZE) + 1})`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  const docs = buildDocs(supplements);
  console.log(`🧪  Consolidated into ${docs.length} unique supplement documents\n`);

  const ops = [];

  for (const doc of docs) {
    const { variants, ...parentData } = doc;
    const docRef = db.collection('supplements').doc(doc.slug);

    // Parent doc (no variants array — kept in subcollection)
    ops.push({ ref: docRef, data: sanitize(parentData) });

    // Variants subcollection
    for (const variant of variants) {
      const varRef = docRef.collection('variants').doc(variant.id);
      ops.push({ ref: varRef, data: sanitize(variant) });
    }

    console.log(`  📄  ${doc.slug}  (${variants.length} variant${variants.length !== 1 ? 's' : ''})`);
  }

  console.log(`\n🚀  Writing ${ops.length} total Firestore operations…\n`);
  await commitBatch(ops);

  console.log(`\n✅  Seed complete!`);
  console.log(`    ${docs.length} supplements → Firestore collection "supplements/"`);
  console.log(`    Variants stored as subcollection supplements/{slug}/variants/{id}\n`);
}

seed().catch(err => {
  console.error('\n❌  Seed failed:', err.message || err);
  process.exit(1);
});
