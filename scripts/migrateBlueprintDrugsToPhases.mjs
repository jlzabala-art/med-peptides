/**
 * migrateBlueprintDrugsToPhases.mjs
 * ──────────────────────────────────────────────────────────────────────────
 * For protocols that use the `phase_blueprints[].drugs[]` schema (16 docs),
 * this script converts them into the `phases[].drugs_used[]` structure that
 * the protocol engine expects.
 *
 * Mapping rules (phase_blueprints.drugs → phases.drugs_used):
 *   product_id           → product_slug  (engine reads product_slug)
 *   product_title        → product_title (kept for display)
 *   route                → route
 *   dose_logic.administration_frequency → dosing_frequency
 *   dose_logic.starting_weekly_dose     → weekly_dose (with dose_unit suffix)
 *   dose_logic.administration_days_default → (discarded; computed by engine)
 *
 * The script PRESERVES the existing `phase_blueprints` array untouched.
 * It only ADDS / REPLACES the `phases` array so the engine can process them.
 *
 * Usage:
 *   node scripts/migrateBlueprintDrugsToPhases.mjs --dry-run   # inspect only
 *   node scripts/migrateBlueprintDrugsToPhases.mjs              # write to Firestore
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const DRY_RUN = process.argv.includes('--dry-run');

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

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts a phase_blueprints drug entry into the drugs_used format.
 */
function convertDrug(bpDrug) {
  const dl = bpDrug.dose_logic || {};
  const freq = dl.administration_frequency || 'daily';
  const startDose = dl.starting_weekly_dose;
  const doseUnit = dl.dose_unit || 'mg';

  // Build weekly_dose string (e.g. "2.5mg") — used by engine's parseDosage()
  let weeklyDose = undefined;
  if (startDose !== undefined && doseUnit !== 'protocol_defined') {
    weeklyDose = `${startDose}${doseUnit}`;
  }

  const drug = {
    product_slug: bpDrug.product_id || '', // engine matches on product_slug
    product_title: bpDrug.product_title || '',
    route: bpDrug.route || 'subcutaneous',
    dosing_frequency: freq,
  };

  if (weeklyDose) drug.weekly_dose = weeklyDose;

  // Preserve any extra dose_logic fields for reference
  if (dl.dose_unit) drug.dose_unit = dl.dose_unit;
  if (dl.timing_hint) drug.timing_hint = dl.timing_hint;

  return drug;
}

/**
 * Converts phase_blueprints array → phases array.
 * Keeps phase_duration_weeks from blueprint if available.
 */
function convertBlueprints(bps, protocolDurationWeeks) {
  const numPhases = bps.length;
  const fallbackPerPhase = Math.max(4, Math.round((protocolDurationWeeks || numPhases * 4) / numPhases));

  let currentStart = 1;
  return bps.map((bp) => {
    const phaseDur = bp.phase_duration_weeks || fallbackPerPhase;
    const startWeek = currentStart;
    const endWeek = startWeek + phaseDur - 1;
    currentStart = endWeek + 1;

    return {
      phase_title: bp.phase_title || bp.phase_key || `Phase ${startWeek}`,
      phase_key: bp.phase_key || '',
      phase_duration_weeks: phaseDur,
      start_week: startWeek,
      end_week: endWeek,
      phase_objective: bp.phase_objective || '',
      drugs_used: (bp.drugs || []).map(convertDrug),
    };
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (DRY_RUN) console.log('\n🔍 DRY RUN — no writes will be made\n');

  const snap = await db.collection('protocol_templates').get();
  console.log(`📦 Loaded ${snap.docs.length} protocol documents\n`);

  let migrated = 0, skipped = 0, errors = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const id = doc.id;

    const bps = data.phase_blueprints || [];
    const existingPhases = data.phases || [];

    // Skip if already has drugs_used
    const alreadyHasDrugsUsed = existingPhases.some(p => Array.isArray(p.drugs_used) && p.drugs_used.length > 0);
    if (alreadyHasDrugsUsed) {
      console.log(`⏭️  ${id.padEnd(20)} — already has drugs_used, skipping`);
      skipped++;
      continue;
    }

    // Skip if no phase_blueprints with drugs
    const bpDrugsCount = bps.reduce((acc, bp) => acc + (bp.drugs?.length || 0), 0);
    if (bpDrugsCount === 0) {
      console.log(`❌ ${id.padEnd(20)} — no phase_blueprints.drugs to migrate`);
      skipped++;
      continue;
    }

    try {
      const newPhases = convertBlueprints(bps, data.protocol_duration_weeks);

      console.log(`\n✅ ${id}`);
      newPhases.forEach(p => {
        console.log(`   Phase "${p.phase_title}" (wk ${p.start_week}-${p.end_week}): ${p.drugs_used.length} drugs`);
        p.drugs_used.forEach(d => console.log(`     - ${d.product_title} | route: ${d.route} | freq: ${d.dosing_frequency} | dose: ${d.weekly_dose || 'protocol_defined'}`));
      });

      if (!DRY_RUN) {
        await doc.ref.update({
          phases: newPhases,
          migrated_from_blueprints_at: FieldValue.serverTimestamp(),
        });
      }
      migrated++;
    } catch (e) {
      console.error(`❌ Error migrating ${id}:`, e.message);
      errors++;
    }
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`  Migrated : ${migrated}`);
  console.log(`  Skipped  : ${skipped}`);
  console.log(`  Errors   : ${errors}`);
  if (DRY_RUN) console.log('\n  ⚠️  DRY RUN — nothing was written');
  console.log('═══════════════════════════════════════════\n');
}

main().catch(e => { console.error('❌ Fatal:', e); process.exit(1); });
