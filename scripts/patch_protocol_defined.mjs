/**
 * patch_protocol_defined.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Replaces all "protocol_defined" placeholder values with real clinical data.
 * 2. Writes corrected JSON files to disk.
 * 3. Pushes the corrected phase_blueprints to Firestore (source of truth).
 *
 * Usage:
 *   node scripts/patch_protocol_defined.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const PROTO_DIR = join(ROOT, 'export', 'protocols');
const SA_KEY    = join(ROOT, 'med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
const DRY_RUN   = process.argv.includes('--dry-run');

// ── Firebase init ─────────────────────────────────────────────────────────────
const app = initializeApp({ credential: cert(SA_KEY) });
const db  = getFirestore(app);

// ── Known real values per peptide/drug ────────────────────────────────────────
// dose_unit: authoritative unit for each product
const KNOWN_DOSE_UNIT = {
  // Nasal peptides
  'selank':       'mcg',
  'semax':        'mcg',
  // GH secretagogues
  'sermorelin':   'mcg',
  'ipamorelin':   'mcg',
  'gonadorelin':  'mcg',
  'kisspeptin':   'mcg',
  // Mitochondrial / metabolic peptides
  'mots-c':       'mg',
  'mots_c':       'mg',
  'mots c':       'mg',
  'elamipretide': 'mg',
  'ss-31':        'mg',
  'ss_31':        'mg',
  'ss 31':        'mg',
  // Longevity / epigenetic
  'epitalon':     'mg',
  'epithalon':    'mg',
  'dsip':         'mg',
  // Skin
  'ghk-cu':       'mg',
  'ghk_cu':       'mg',
  'ghk cu':       'mg',
};

// route: real administration route per product
const KNOWN_ROUTE = {
  // Immune
  'thymosin alpha 1':  'subcutaneous',
  'thymosin_alpha_1':  'subcutaneous',
  'tb 500':            'subcutaneous',
  'tb_500':            'subcutaneous',
  'tb500':             'subcutaneous',
  'kpv':               'subcutaneous',
  // Metabolic / longevity
  'mots-c':            'subcutaneous',
  'mots_c':            'subcutaneous',
  'mots c':            'subcutaneous',
  'retatrutide':       'subcutaneous',
  'ss-31':             'subcutaneous',
  'ss_31':             'subcutaneous',
  'ss 31':             'subcutaneous',
  // Skin
  'ghk-cu':            'subcutaneous',
  'ghk_cu':            'subcutaneous',
  'ghk cu':            'subcutaneous',
  'epitalon':          'subcutaneous',
  'epithalon':         'subcutaneous',
  'epithalon':         'subcutaneous',
  // Sleep
  'selank':            'intranasal',
  'dsip':              'subcutaneous',
};

// administration_frequency: real frequency per product
const KNOWN_FREQUENCY = {
  'retatrutide':   'weekly',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeKey(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

function lookupByName(map, drug) {
  const candidates = [
    drug.product_slug,
    drug.product_title,
    drug.product_id,
    drug.name,
  ].filter(Boolean).map(normalizeKey);

  for (const c of candidates) {
    if (map[c]) return map[c];
    // Try partial / prefix match
    for (const [key, val] of Object.entries(map)) {
      if (c.includes(key) || key.includes(c)) return val;
    }
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = readdirSync(PROTO_DIR).filter(
  f => f.endsWith('.json') && !f.includes('bundle')
);

let totalFiles   = 0;
let totalChanges = 0;
const firestoreUpdates = [];

for (const file of files) {
  const filePath = join(PROTO_DIR, file);
  const protocol = JSON.parse(readFileSync(filePath, 'utf8'));
  let modified = false;
  const fileLog = [];

  for (const phase of (protocol.phase_blueprints || [])) {
    for (const drug of (phase.drugs || [])) {

      // ── Fix dose_unit in dose_logic ──────────────────────────────────────
      const dl = drug.dose_logic;
      if (dl && dl.dose_unit === 'protocol_defined') {
        const real = lookupByName(KNOWN_DOSE_UNIT, drug);
        if (real) {
          dl.dose_unit = real;
          fileLog.push(`  ✅  ${drug.product_slug||drug.product_title}: dose_unit = "${real}"`);
          modified = true;
          totalChanges++;
        } else {
          fileLog.push(`  ⚠️  ${drug.product_slug||drug.product_title}: dose_unit unknown — needs manual review`);
        }
      }

      // ── Fix administration_frequency in dose_logic ───────────────────────
      if (dl && dl.administration_frequency === 'protocol_defined') {
        const real = lookupByName(KNOWN_FREQUENCY, drug);
        if (real) {
          dl.administration_frequency = real;
          fileLog.push(`  ✅  ${drug.product_slug||drug.product_title}: administration_frequency = "${real}"`);
          modified = true;
          totalChanges++;
        } else {
          fileLog.push(`  ⚠️  ${drug.product_slug||drug.product_title}: administration_frequency unknown`);
        }
      }

      // ── Fix route on drug itself ──────────────────────────────────────────
      if (drug.route === 'protocol_defined') {
        const real = lookupByName(KNOWN_ROUTE, drug);
        if (real) {
          drug.route = real;
          fileLog.push(`  ✅  ${drug.product_slug||drug.product_title}: route = "${real}"`);
          modified = true;
          totalChanges++;
        } else {
          fileLog.push(`  ⚠️  ${drug.product_slug||drug.product_title}: route unknown`);
        }
      }
    }
  }

  if (fileLog.length > 0) {
    console.log(`\n📄 ${file}:`);
    fileLog.forEach(l => console.log(l));
  }

  if (!modified) continue;
  totalFiles++;

  if (!DRY_RUN) {
    writeFileSync(filePath, JSON.stringify(protocol, null, 2), 'utf8');
  }

  const protocolId = protocol.protocol_id;
  if (protocolId) {
    firestoreUpdates.push({ protocolId, phase_blueprints: protocol.phase_blueprints });
  } else {
    console.warn(`  ⚠️  No protocol_id in ${file} — Firestore update skipped`);
  }
}

// ── Firestore push ────────────────────────────────────────────────────────────
if (!DRY_RUN && firestoreUpdates.length > 0) {
  console.log(`\n🔥 Pushing ${firestoreUpdates.length} protocol(s) to Firestore...`);
  let batch = db.batch();
  let batchCount = 0;

  for (const { protocolId, phase_blueprints } of firestoreUpdates) {
    const ref = db.collection('protocols').doc(protocolId);
    batch.update(ref, { phase_blueprints });
    batchCount++;

    if (batchCount >= 450) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }
  if (batchCount > 0) await batch.commit();
  console.log('✅  Firestore updated.');
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`📊 Summary:`);
console.log(`   Files modified:   ${totalFiles}`);
console.log(`   Values replaced:  ${totalChanges}`);
if (DRY_RUN) console.log(`\n   ⚠️  DRY RUN — no files or Firestore written`);
else         console.log(`\n   ✅  Local files + Firestore updated`);
