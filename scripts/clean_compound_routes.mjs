#!/usr/bin/env node
/**
 * clean_compound_routes.mjs
 * Removes the "_or_protocol_defined" suffix from route fields in all protocol JSONs.
 * Then pushes the cleaned files to Firestore.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROTOCOLS_DIR = join(__dirname, '..', 'export', 'protocols');
const PROJECT_ID = 'med-peptides-app';

// ─── Firestore Init ──────────────────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: applicationDefault(),
    projectId: PROJECT_ID,
  });
}
const db = admin.firestore();

// ─── Deep-fix compound route values ─────────────────────────────────────────
function deepFix(obj) {
  if (typeof obj === 'string') {
    // Strip any "_or_protocol_defined" suffix
    if (obj.includes('_or_protocol_defined')) {
      return obj.replace(/_or_protocol_defined$/, '');
    }
    // Also strip bare "protocol_defined"
    if (obj === 'protocol_defined') {
      return null; // caller decides what to do
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepFix);
  }
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = deepFix(v);
    }
    return out;
  }
  return obj;
}

// ─── Main ────────────────────────────────────────────────────────────────────
const files = readdirSync(PROTOCOLS_DIR).filter(f => f.endsWith('.json'));
let totalFixed = 0;

for (const file of files) {
  const filePath = join(PROTOCOLS_DIR, file);
  const raw = readFileSync(filePath, 'utf8');
  const original = JSON.parse(raw);
  const fixed = deepFix(original);

  const beforeStr = JSON.stringify(original);
  const afterStr = JSON.stringify(fixed);

  if (beforeStr !== afterStr) {
    writeFileSync(filePath, JSON.stringify(fixed, null, 2));
    console.log(`✅ Fixed: ${file}`);
    totalFixed++;
  }
}

console.log(`\n📊 Files fixed: ${totalFixed}`);

// ─── Push all to Firestore ───────────────────────────────────────────────────
console.log(`\n🔥 Pushing all ${files.length} protocols to Firestore...`);
const batch = db.batch();

for (const file of files) {
  const filePath = join(PROTOCOLS_DIR, file);
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  const docId = data.id || file.replace('.json', '');
  const ref = db.collection('protocols').doc(docId);
  batch.set(ref, data, { merge: true });
}

await batch.commit();
console.log('✅ Firestore updated successfully.\n');
