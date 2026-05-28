/**
 * patch_weekly_doses.mjs
 * ──────────────────────────────────────────────────────────────────
 * Reads every protocol JSON in export/protocols/, finds drugs_used
 * entries that have no numeric dose, resolves the dose from the
 * corresponding phase_blueprints entry (matched by product slug),
 * writes the enriched JSON back to disk, and patches Firestore.
 *
 * Usage:
 *   node scripts/patch_weekly_doses.mjs [--dry-run]
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

// ── Firebase init ─────────────────────────────────────────────────
const app = initializeApp({ credential: cert(SA_KEY) });
const db  = getFirestore(app);

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Derives a canonical weekly_dose number (in the drug's native unit)
 * from a dose_logic block.
 * Returns { amount: number, unit: string } or null.
 */
function resolveWeeklyDose(logic) {
  if (!logic) return null;
  const unit = logic.dose_unit || 'mg';

  // Case 1: explicitly has weekly dose
  if (logic.starting_weekly_dose != null) {
    return { amount: logic.starting_weekly_dose, unit };
  }

  // Case 2: daily dose — multiply by 7
  if (logic.starting_daily_dose != null) {
    const freq = (logic.administration_frequency || '').toLowerCase();
    const timesPerWeek = freq.includes('daily') || freq === 'every_day' ? 7 : 7;
    return { amount: logic.starting_daily_dose * timesPerWeek, unit };
  }

  // Case 3: per-administration dose + frequency
  if (logic.dose_per_administration != null) {
    const freq = (logic.administration_frequency || '').toLowerCase();
    let n = 1;
    if (freq.includes('daily'))  n = 7;
    else if (freq.includes('3x')) n = 3;
    else if (freq.includes('2x')) n = 2;
    else if (freq.includes('weekly') || freq.includes('1x')) n = 1;
    else if (freq.includes('eod') || freq.includes('other_day')) n = 3.5;
    return { amount: logic.dose_per_administration * n, unit };
  }

  // Case 4: selected_strength
  if (logic.selected_strength != null && !isNaN(Number(logic.selected_strength))) {
    return { amount: Number(logic.selected_strength), unit };
  }

  return null;
}

/**
 * Build a lookup map: product_slug → dose_logic, from phase_blueprints.
 */
function buildSlugToLogicMap(protocol) {
  const map = {};
  for (const phase of (protocol.phase_blueprints || [])) {
    for (const drug of (phase.drugs || [])) {
      // Try multiple slug-like identifiers
      const keys = [
        drug.product_slug,
        drug.product_id,
        drug.product_title?.toLowerCase().replace(/\s+/g, '_'),
        drug.product_title?.toLowerCase().replace(/[^a-z0-9]/g, ''),
      ].filter(Boolean);

      for (const k of keys) {
        if (!map[k]) map[k] = { dose_logic: drug.dose_logic, route: drug.route };
      }
    }
  }
  return map;
}

/**
 * Tries to find the right dose_logic for a drugs_used entry.
 */
function findLogicForDrug(drug, slugMap) {
  const candidates = [
    drug.product_slug,
    drug.productId?.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    drug.productId?.toLowerCase().replace(/[^a-z0-9]/g, ''),
    drug.name?.toLowerCase().replace(/\s+/g, '_'),
    drug.name?.toLowerCase().replace(/[^a-z0-9]/g, ''),
  ].filter(Boolean);

  for (const c of candidates) {
    if (slugMap[c]) return slugMap[c];
    // Partial match: check if any key starts with c or c starts with key
    for (const [key, val] of Object.entries(slugMap)) {
      if (key.startsWith(c) || c.startsWith(key)) return val;
    }
  }
  return null;
}

// ── Main patch logic ──────────────────────────────────────────────

const files = readdirSync(PROTO_DIR).filter(f => f.endsWith('.json') && !f.includes('bundle'));
let totalFixed = 0;
let totalSkipped = 0;

const firestoreBatch = db.batch();
let batchCount = 0;

for (const file of files) {
  const filePath = join(PROTO_DIR, file);
  const protocol = JSON.parse(readFileSync(filePath, 'utf8'));
  const slugMap  = buildSlugToLogicMap(protocol);
  let modified   = false;
  const fixes    = [];

  // Patch phases[].drugs_used
  for (const phase of (protocol.phases || [])) {
    const drugsKey = phase.drugs_used ? 'drugs_used' : phase.drugs ? 'drugs' : null;
    if (!drugsKey) continue;

    for (const drug of phase[drugsKey]) {
      const existing = drug.weekly_dose;
      const needsPatch =
        existing == null ||
        existing === '' ||
        (typeof existing === 'string' && (
          existing.toLowerCase().includes('todo') ||
          existing.toLowerCase().includes('calculated') ||
          existing.toLowerCase().includes('specify')
        ));

      if (!needsPatch) continue;

      const match = findLogicForDrug(drug, slugMap);
      if (!match) {
        fixes.push(`  ⚠️  No match for drug: ${drug.product_slug || drug.name || JSON.stringify(drug)}`);
        totalSkipped++;
        continue;
      }

      const resolved = resolveWeeklyDose(match.dose_logic);
      if (!resolved) {
        fixes.push(`  ⚠️  No resolvable dose for: ${drug.product_slug || drug.name}`);
        totalSkipped++;
        continue;
      }

      // Patch!
      drug.weekly_dose     = resolved.amount;
      drug.dose_unit       = resolved.unit;
      drug.route           = drug.route || match.route || 'subcutaneous';
      drug._dose_patched   = true;
      modified = true;
      totalFixed++;
      fixes.push(`  ✅  ${drug.product_slug || drug.name}: weekly_dose = ${resolved.amount} ${resolved.unit}`);
    }
  }

  if (fixes.length > 0) {
    console.log(`\n📄 ${file}:`);
    fixes.forEach(f => console.log(f));
  }

  if (!modified) continue;

  // Write patched JSON back to disk
  if (!DRY_RUN) {
    writeFileSync(filePath, JSON.stringify(protocol, null, 2), 'utf8');
  }

  // Queue Firestore patch
  const protocolId = protocol.protocol_id;
  if (!protocolId) {
    console.warn(`  ⚠️  No protocol_id in ${file} — skipping Firestore patch`);
    continue;
  }

  const ref = db.collection('protocols').doc(protocolId);

  // Build a minimal Firestore update: only patch phases array
  if (!DRY_RUN) {
    firestoreBatch.update(ref, { phases: protocol.phases });
    batchCount++;

    // Commit every 450 operations (Firestore limit is 500)
    if (batchCount >= 450) {
      await firestoreBatch.commit();
      batchCount = 0;
    }
  }
}

// Commit remaining batch
if (!DRY_RUN && batchCount > 0) {
  console.log(`\n🔥 Committing ${batchCount} Firestore updates...`);
  await firestoreBatch.commit();
  console.log('✅ Firestore patch complete.');
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`📊 Summary:`);
console.log(`   Fixed:   ${totalFixed} drug entries`);
console.log(`   Skipped: ${totalSkipped} drug entries (no match)`);
if (DRY_RUN) console.log(`   ⚠️  DRY RUN — no files or Firestore were modified`);
