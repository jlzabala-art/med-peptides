/**
 * seedViaRest.mjs
 * Seeds Firestore via REST API using the Firebase CLI's cached access token.
 * No service account key required.
 *
 * Usage (from project root):
 *   node scripts/seedViaRest.mjs           # real write
 *   node scripts/seedViaRest.mjs --dry-run # preview only
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

const PROJECT_ID = 'med-peptides-app';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const DRY_RUN = process.argv.includes('--dry-run');

// ── Get auth token from Firebase CLI cache ────────────────────────────────────
function getToken() {
  // 1. Explicit env var
  if (process.env.FIREBASE_TOKEN) return process.env.FIREBASE_TOKEN;
  if (process.env.GCLOUD_ACCESS_TOKEN) return process.env.GCLOUD_ACCESS_TOKEN;

  // 2. Firebase CLI cached token
  try {
    const configPath = resolve(homedir(), '.config/configstore/firebase-tools.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    const tokens = config.tokens || {};
    if (tokens.access_token && Date.now() < tokens.expires_at) {
      return tokens.access_token;
    }
    if (tokens.access_token) {
      console.warn('⚠️  Token may be expired — will try anyway');
      return tokens.access_token;
    }
  } catch (e) {
    console.error('Could not read Firebase CLI token cache:', e.message);
  }
  return null;
}

const token = getToken();
if (!token) {
  console.error('❌ No auth token found. Run `npx firebase-tools login` first.');
  process.exit(1);
}
console.log(`✅ Auth token acquired (${token.slice(0, 20)}...)\n`);

// ── Load seed data ────────────────────────────────────────────────────────────
const seedData = JSON.parse(readFileSync('scripts/seed_data.json', 'utf-8'));
console.log(`📦 Seeding ${seedData.length} products...`);
if (DRY_RUN) console.log('   [DRY-RUN mode — no actual writes]\n');

// ── Convert JS value → Firestore REST value ──────────────────────────────────
function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreDoc(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v);
  return { fields };
}

// ── Write / upsert a document via REST PATCH ──────────────────────────────────
async function writeDoc(path, docId, data) {
  if (DRY_RUN) {
    process.stdout.write('.');
    return;
  }
  const url = `${FIRESTORE_BASE}/${path}/${docId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toFirestoreDoc(data)),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err.slice(0, 300)}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
let productOk = 0, productFail = 0, variantOk = 0, variantFail = 0;

for (const { productDoc, variants } of seedData) {
  const { id: productId, ...productData } = productDoc;
  process.stdout.write(`  → ${productId.padEnd(40)} `);

  try {
    await writeDoc('products', productId, productData);
    productOk++;

    for (const variant of variants) {
      const { id: variantId, ...variantData } = variant;
      try {
        await writeDoc(`products/${productId}/variants`, variantId, variantData);
        variantOk++;
      } catch (e) {
        variantFail++;
        process.stdout.write(`\n    ❌ Variant ${variantId}: ${e.message}\n`);
      }
    }
    console.log(`✅ (${variants.length} variants)`);
  } catch (e) {
    productFail++;
    console.log(`❌ ${e.message}`);
  }
}

console.log(`\n── Seed Complete ──────────────────────────────────`);
console.log(`  Products:  ${productOk} ✅  ${productFail} ❌`);
console.log(`  Variants:  ${variantOk} ✅  ${variantFail} ❌`);
console.log(`  Total docs written: ${productOk + variantOk}`);
