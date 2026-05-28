#!/usr/bin/env node
/**
 * migrate-dosage-schema.js
 *
 * Migrates each drug in every protocol's phase_blueprints from the complex
 * nested `dose_logic` map to a flat, readable dosing schema:
 *
 *  BEFORE (nested):
 *    drug.dose_logic.administration_frequency = "3x_week"
 *    drug.dose_logic.dose_per_administration  = 5
 *    drug.dose_logic.dose_unit                = "mg"
 *    drug.dose_logic.selected_strength        = "5mg"
 *    drug.dose_logic.starting_intensity       = "standard"
 *    drug.dose_logic.administration_days_default = ["Mon","Wed","Fri"]
 *    ...12 more fields
 *
 *  AFTER (flat on drug):
 *    drug.frequency          = "3x_week"
 *    drug.injections_per_week = 3
 *    drug.dose_per_injection = 5          // numeric, null if intensity-only
 *    drug.dose_unit          = "mg"       // "mg"|"mcg"|"iu"|null
 *    drug.weekly_dose        = 15         // pre-computed, null if intensity-only
 *    drug.intensity_level    = "standard" // null if real dose present
 *    drug.administration_days = ["Mon","Wed","Fri"]
 *    drug.timing_hint        = null
 *    // dose_logic field REMOVED
 *
 * Run:  node scripts/migrate-dosage-schema.js [--dry-run]
 *
 * Requirements:
 *   npm install firebase-admin   (only needed for this script)
 *   GOOGLE_APPLICATION_CREDENTIALS=<path-to-service-account.json>
 *    OR use `firebase login` + Application Default Credentials
 */

const admin = require('firebase-admin');

const DRY_RUN = process.argv.includes('--dry-run');

// ── Init Firebase ──────────────────────────────────────────────────────────────
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'med-peptides-app',
  });
} catch (e) {
  // Already initialized
}

const db = admin.firestore();

// ── Frequency → injections/week ────────────────────────────────────────────────
function parseFrequency(freq = '') {
  const f = String(freq).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (f === 'daily' || f === '7x' || f === '7xweek' || f === 'everyday') return 7;
  if (f === 'twicedaily' || f === 'twice_daily' || f === 'twiceperday' ||
      f === 'bd' || f === 'bid') return 14; // 2x per day = 14 per week
  if (f === 'dailyevening' || f === 'dailymorning') return 7;
  if (f === '6x' || f === '6xweek') return 6;
  if (f === '5x' || f === '5xweek') return 5;
  if (f === '4x' || f === '4xweek') return 4;
  if (f === '3x' || f === '3xweek' || f === '3xweekly' || f.includes('thrice')) return 3;
  if (f === '2x' || f === '2xweek' || f === '2xweekly' || f.includes('twice')) return 2;
  if (f === '1x' || f === '1xweek' || f === 'weekly' || f === 'onceweekly') return 1;
  if (f === 'bimonthly' || f === 'every2weeks' || f === 'fortnightly') return 0.5;
  if (f === 'monthly' || f === 'oncemonth') return 0.25;
  // Nx_week pattern
  const m = f.match(/^(\d+)x/);
  if (m) return parseInt(m[1], 10);
  // protocol_defined → treat as weekly fallback
  if (f === 'protocoldefined') return 1;
  return 1;
}

// ── Parse dose string to numeric value + unit ──────────────────────────────────
function parseDoseString(val) {
  if (val === undefined || val === null || val === '') return null;
  if (typeof val === 'number' && !isNaN(val) && val > 0) {
    return { value: val, unit: 'mg' };
  }
  const s = String(val).toLowerCase().trim();
  // "nasal" or text-only → intensity-based, skip
  if (/^[a-z]+$/.test(s) && !s.match(/\d/)) return null;
  const m = s.match(/^(\d+\.?\d*)\s*(mcg|µg|ug|mg|iu|units?)?/);
  if (!m) return null;
  const value = parseFloat(m[1]);
  if (isNaN(value) || value <= 0) return null;
  const unit = m[2] || 'mg';
  // Normalize unit
  const normUnit = (unit === 'mcg' || unit === 'µg' || unit === 'ug') ? 'mcg' : unit.replace(/s$/, '');
  return { value, unit: normUnit };
}

// ── Convert any dose to mg for weekly_dose computation ──────────────────────────
function toMg(value, unit) {
  if (unit === 'mcg') return value / 1000;
  return value; // mg, iu → as-is
}

// ── Migrate a single drug object ───────────────────────────────────────────────
function migrateDrug(drug) {
  const dl = drug.dose_logic || {};

  // --- frequency ---
  const frequency = dl.administration_frequency || dl.frequency || drug.dosing_frequency || 'weekly';
  const injections_per_week = parseFrequency(frequency);

  // --- administration days ---
  const rawDays = dl.administration_days_default || dl.administration_days || drug.administration_days || [];
  const administration_days = Array.isArray(rawDays) && rawDays.length > 0 ? rawDays : null;

  // --- timing hint ---
  const timing_hint = dl.timing_hint || drug.timing_hint || null;

  // --- dose resolution (priority order) ---
  //  1. dose_per_administration (numeric per-injection)
  //  2. starting_daily_dose     (cog_001 Semax case — also per injection since freq=daily)
  //  3. selected_strength       (string like "5mg")
  //  4. weekly_dose / weekly_total_mg / starting_weekly_dose (already weekly)
  let dose_per_injection = null;
  let dose_unit = null;
  let weekly_dose = null;

  const rawUnit = dl.dose_unit || drug.dose_unit || '';
  const isProtocolDefined = rawUnit === 'protocol_defined' || rawUnit === '';

  // Try dose_per_administration
  let parsed = parseDoseString(dl.dose_per_administration);
  if (parsed) {
    dose_per_injection = parsed.value;
    dose_unit = parsed.unit;
  }

  // Try starting_daily_dose (cog_001 Semax)
  if (!parsed) {
    parsed = parseDoseString(dl.starting_daily_dose);
    if (parsed) {
      dose_per_injection = parsed.value;
      dose_unit = parsed.unit;
    }
  }

  // Try selected_strength
  if (!parsed) {
    parsed = parseDoseString(dl.selected_strength);
    if (parsed) {
      dose_per_injection = parsed.value;
      dose_unit = parsed.unit;
    }
  }

  // Try weekly values → back-compute per-injection
  if (!parsed) {
    const wParsed = parseDoseString(dl.starting_weekly_dose || dl.weekly_dose || dl.weekly_total_mg || dl.default_weekly_dose);
    if (wParsed && injections_per_week > 0) {
      weekly_dose = wParsed.value;
      dose_unit = wParsed.unit;
      dose_per_injection = parseFloat((wParsed.value / injections_per_week).toFixed(3));
    }
  }

  // Compute weekly_dose if we have per-injection
  if (dose_per_injection !== null && weekly_dose === null) {
    weekly_dose = parseFloat((dose_per_injection * injections_per_week).toFixed(3));
  }

  // If dose_unit was "protocol_defined", it's intensity-based
  if (isProtocolDefined && dose_per_injection === null) {
    dose_unit = null;
  } else if (dose_unit && !isProtocolDefined) {
    // keep the resolved unit
  }

  // --- intensity level ---
  const intensity_level = dl.starting_intensity || dl.intensity || dl.intensity_level || drug.intensity_level || null;

  // --- peak dose (optional, for escalating protocols) ---
  let peak_dose_per_injection = null;
  const peakParsed = parseDoseString(dl.possible_daily_dose || dl.peak_dose || dl.max_weekly_dose);
  if (peakParsed) {
    // If max_weekly_dose, convert to per-injection
    const fieldName = dl.possible_daily_dose ? 'per_injection' : 'weekly';
    if (fieldName === 'weekly' && injections_per_week > 0) {
      peak_dose_per_injection = parseFloat((peakParsed.value / injections_per_week).toFixed(3));
    } else {
      peak_dose_per_injection = peakParsed.value;
    }
  }

  // --- route ---
  const route = dl.route || drug.route || null;

  // Build new flat drug object (drop dose_logic)
  const newDrug = {
    product_id:           drug.product_id    || null,
    product_title:        drug.product_title || drug.name || null,
    product_slug:         drug.product_slug  || null,
    route,
    frequency,
    injections_per_week,
    dose_per_injection,          // null → intensity-only protocol
    dose_unit,                   // "mg" | "mcg" | "iu" | null
    weekly_dose,                 // pre-computed for engine (null if intensity-only)
    peak_dose_per_injection,     // null unless protocol defines a peak
    intensity_level,             // null unless intensity-based
    administration_days,
    timing_hint,
  };

  // Remove null values to keep Firestore clean
  return Object.fromEntries(Object.entries(newDrug).filter(([, v]) => v !== null));
}

// ── Migrate a full protocol document ───────────────────────────────────────────
function migrateProtocol(docId, data) {
  const blueprints = data.phase_blueprints;
  if (!Array.isArray(blueprints) || blueprints.length === 0) {
    console.log(`  [SKIP] ${docId} — no phase_blueprints`);
    return null;
  }

  let changed = false;
  const newBlueprints = blueprints.map((phase, pi) => {
    const drugs = phase.drugs;
    if (!Array.isArray(drugs)) return phase;
    const newDrugs = drugs.map((drug, di) => {
      if (!drug.dose_logic) return drug; // already migrated or no dose_logic
      const migrated = migrateDrug(drug);
      console.log(`    Phase ${pi + 1} / Drug "${migrated.product_title || di}": migrated`);
      changed = true;
      return migrated;
    });
    return { ...phase, drugs: newDrugs };
  });

  if (!changed) {
    console.log(`  [SKIP] ${docId} — no dose_logic found, already clean`);
    return null;
  }

  return { phase_blueprints: newBlueprints };
}

// ── Main ────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔬 Dosage Schema Migration${DRY_RUN ? ' (DRY RUN — no writes)' : ''}\n`);

  const snapshot = await db.collection('protocols').get();
  console.log(`Found ${snapshot.size} protocol documents.\n`);

  const batch = db.batch();
  let updateCount = 0;

  for (const docSnap of snapshot.docs) {
    const docId = docSnap.id;
    const data = docSnap.data();
    console.log(`Processing: ${docId}`);

    const update = migrateProtocol(docId, data);
    if (update) {
      if (!DRY_RUN) {
        batch.update(docSnap.ref, update);
      }
      updateCount++;
    }
    console.log('');
  }

  if (updateCount === 0) {
    console.log('✅ No documents needed migration.');
    process.exit(0);
  }

  if (DRY_RUN) {
    console.log(`\n⚡ DRY RUN complete. ${updateCount} documents would be updated.`);
    console.log('   Run without --dry-run to apply changes.\n');
  } else {
    await batch.commit();
    console.log(`\n✅ Migration complete. ${updateCount} documents updated.\n`);
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
