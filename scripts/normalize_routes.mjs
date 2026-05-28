#!/usr/bin/env node
/**
 * normalize_routes.mjs
 * Normalizes abbreviated/inconsistent route values to canonical lowercase strings.
 * Then pushes to Firestore.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROTO_DIR = join(ROOT, 'export', 'protocols');

// ── Canonical route map ──────────────────────────────────────────────────────
const ROUTE_MAP = {
  // Abbreviations → canonical
  'SC': 'subcutaneous',
  'IN': 'intranasal',
  'TOP': 'topical',
  'IM': 'intramuscular',
  'IV': 'intravenous',
  'SL': 'sublingual',
  // Variants → canonical
  'subcutaneous,': 'subcutaneous',
  'intranasal,': 'intranasal',
  'oral_or_sublingual': 'oral_or_sublingual', // keep as-is (valid variant)
  'topical_or_subcutaneous': 'topical_or_subcutaneous', // keep as-is (valid variant)
  'localized_optional': 'localized_optional', // keep as-is
};

function normalizeRoute(val) {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim().replace(/,$/, ''); // remove trailing comma if any
  return ROUTE_MAP[trimmed] ?? trimmed.toLowerCase();
}

function deepNormalize(obj) {
  if (Array.isArray(obj)) return obj.map(deepNormalize);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'route' && typeof v === 'string') {
        out[k] = normalizeRoute(v);
      } else {
        out[k] = deepNormalize(v);
      }
    }
    return out;
  }
  return obj;
}

// ── Firebase init ────────────────────────────────────────────────────────────
const SA_KEY = join(ROOT, 'med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
let credential;
try {
  const key = JSON.parse(readFileSync(SA_KEY, 'utf8'));
  key.project_id = key.project_id.toLowerCase();
  credential = cert(key);
  console.log('🔑 Using service account credential');
} catch {
  credential = applicationDefault();
  console.log('🔑 Using Application Default Credentials');
}

if (!getApps().length) {
  initializeApp({ credential, projectId: 'med-peptides-app' });
}
const db = getFirestore();

// ── Process files ────────────────────────────────────────────────────────────
const files = readdirSync(PROTO_DIR).filter(
  f => f.endsWith('.json') && !f.includes('audit') && !f.includes('bundle')
);

let totalFixed = 0;
let batch = db.batch();
let batchSize = 0;

for (const file of files) {
  const filePath = join(PROTO_DIR, file);
  const original = JSON.parse(readFileSync(filePath, 'utf8'));
  const fixed = deepNormalize(original);

  const changed = JSON.stringify(original) !== JSON.stringify(fixed);
  if (changed) {
    writeFileSync(filePath, JSON.stringify(fixed, null, 2));
    console.log(`✅ Normalized routes in: ${file}`);
    totalFixed++;
  }

  const docId = fixed.protocol_id;
  if (!docId) {
    console.warn(`  ⚠️  ${file}: no protocol_id — skipped`);
    continue;
  }

  batch.set(db.collection('protocols').doc(docId), { ...fixed, _last_synced_at: new Date().toISOString() }, { merge: true });
  batchSize++;

  if (batchSize >= 450) {
    await batch.commit();
    batch = db.batch();
    batchSize = 0;
    console.log('  🔄 Batch committed, continuing...');
  }
}

if (batchSize > 0) await batch.commit();

console.log(`\n📊 Files normalized: ${totalFixed} / ${files.length}`);
console.log(`🔥 Firestore updated at project med-peptides-app\n`);
