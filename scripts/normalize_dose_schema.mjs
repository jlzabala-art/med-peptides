/**
 * normalize_dose_schema.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalizes every dose_logic block inside phase_blueprints across all
 * protocol JSON files in export/protocols/.
 *
 * Canonical dose_logic schema after normalization:
 *   {
 *     starting_weekly_dose:  <number>,   // primary dose amount per week
 *     dose_unit:             <string>,   // "mg" | "mcg" | "IU" | etc.
 *     administration_frequency: <string>,// "daily" | "3x_weekly" | "weekly" | etc.
 *     dose_per_administration: <number>, // (optional) single-injection dose
 *     max_weekly_dose:       <number>,   // (optional)
 *     timing_hint:           <string>,   // (optional)
 *     ...rest                            // other keys are kept as-is
 *   }
 *
 * Non-canonical keys removed/replaced:
 *   intensity / starting_intensity → starting_weekly_dose (via intensity table)
 *   selected_strength ("10mg")     → starting_weekly_dose + dose_unit (parsed)
 *   weekly_dose                    → starting_weekly_dose (renamed)
 *   default_weekly_dose            → starting_weekly_dose (if no starting_weekly_dose)
 *   weekly_dose_unit               → dose_unit (renamed)
 *
 * Usage:
 *   node scripts/normalize_dose_schema.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const PROTO_DIR = join(ROOT, 'export', 'protocols');
const DRY_RUN   = process.argv.includes('--dry-run');

// ── Intensity label → approximate weekly dose mapping ────────────────────────
// These are clinical approximations used when the JSON only has a label.
const INTENSITY_DOSE_MAP = {
  // GLP-1 / weight management
  'low':              { amount: 0.25, unit: 'mg' },
  'standard':         { amount: 0.5,  unit: 'mg' },
  'standard_plus':    { amount: 1.0,  unit: 'mg' },
  'moderate':         { amount: 1.0,  unit: 'mg' },
  'high':             { amount: 2.0,  unit: 'mg' },
  'maintenance':      { amount: 1.0,  unit: 'mg' },
  // Peptide intensity labels
  'conservative':     { amount: 100,  unit: 'mcg' },
  'therapeutic':      { amount: 200,  unit: 'mcg' },
  'aggressive':       { amount: 300,  unit: 'mcg' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parses a strength string like "10mg", "2.5 mg", "300mcg" into { amount, unit }.
 */
function parseStrengthString(str) {
  if (!str) return null;
  const m = String(str).match(/^([0-9.]+)\s*(mcg|mg|iu|IU|g|ml|mL)?$/i);
  if (!m) return null;
  return { amount: parseFloat(m[1]), unit: (m[2] || 'mg').toLowerCase() };
}

/**
 * Normalizes a single dose_logic object to the canonical schema.
 * Returns { normalized, changes[] } where changes is a list of human-readable diffs.
 */
function normalizeDoseLogic(logic, context) {
  if (!logic || typeof logic !== 'object') return { normalized: logic, changes: [] };

  const out    = { ...logic };
  const changes = [];

  // 1. Rename weekly_dose_unit → dose_unit
  if ('weekly_dose_unit' in out && !('dose_unit' in out)) {
    out.dose_unit = out.weekly_dose_unit;
    delete out.weekly_dose_unit;
    changes.push('weekly_dose_unit → dose_unit');
  }

  // 2. Rename weekly_dose → starting_weekly_dose (if no starting_weekly_dose yet)
  //    If starting_weekly_dose already exists, weekly_dose is a redundant duplicate — remove it.
  if ('weekly_dose' in out) {
    if (!('starting_weekly_dose' in out)) {
      out.starting_weekly_dose = out.weekly_dose;
      changes.push(`weekly_dose(${out.weekly_dose}) → starting_weekly_dose`);
    } else {
      changes.push(`weekly_dose removed (duplicate of starting_weekly_dose)`);
    }
    delete out.weekly_dose;
  }

  // 2b. weekly_dose_unit → dose_unit (rename; or remove if redundant)
  if ('weekly_dose_unit' in out) {
    if (!('dose_unit' in out) || out.dose_unit === 'protocol_defined') {
      out.dose_unit = out.weekly_dose_unit;
      changes.push(`weekly_dose_unit(${out.weekly_dose_unit}) → dose_unit`);
    } else {
      changes.push(`weekly_dose_unit removed (duplicate of dose_unit)`);
    }
    delete out.weekly_dose_unit;
  }

  // 3. default_weekly_dose → starting_weekly_dose (if still missing)
  if ('default_weekly_dose' in out && !('starting_weekly_dose' in out)) {
    out.starting_weekly_dose = out.default_weekly_dose;
    delete out.default_weekly_dose;
    changes.push(`default_weekly_dose(${out.starting_weekly_dose}) → starting_weekly_dose`);
  } else if ('default_weekly_dose' in out) {
    // starting_weekly_dose already exists — keep default_weekly_dose as max hint
    // but rename it to be explicit
    out.max_weekly_dose = out.max_weekly_dose ?? out.default_weekly_dose;
    delete out.default_weekly_dose;
    changes.push('default_weekly_dose removed (absorbed into max_weekly_dose)');
  }

  // 4. selected_strength "10mg" → starting_weekly_dose + dose_unit
  //    Skip if value is not a numeric strength (e.g. "nasal", "topical")
  if ('selected_strength' in out && !('starting_weekly_dose' in out)) {
    const parsed = parseStrengthString(out.selected_strength);
    if (parsed) {
      out.starting_weekly_dose = parsed.amount;
      // Always use the parsed unit from the strength string; override placeholders
      const existingUnit = out.dose_unit;
      const useUnit = (!existingUnit || existingUnit === 'protocol_defined') ? parsed.unit : existingUnit;
      out.dose_unit = useUnit;
      changes.push(`selected_strength("${logic.selected_strength}") → starting_weekly_dose(${parsed.amount}) + dose_unit(${useUnit})`);
    }
    delete out.selected_strength;
  } else if ('selected_strength' in out) {
    // starting_weekly_dose already present, just remove the alias
    delete out.selected_strength;
    changes.push('selected_strength alias removed (starting_weekly_dose already present)');
  }

  // 5. intensity / starting_intensity label → starting_weekly_dose
  for (const key of ['intensity', 'starting_intensity']) {
    if (!(key in out)) continue;
    const label = String(out[key]).toLowerCase().trim();
    if (!('starting_weekly_dose' in out)) {
      const mapped = INTENSITY_DOSE_MAP[label];
      if (mapped) {
        out.starting_weekly_dose = mapped.amount;
        out.dose_unit            = out.dose_unit || mapped.unit;
        changes.push(`${key}("${label}") → starting_weekly_dose(${mapped.amount} ${mapped.unit})`);
      } else {
        // Store as a note so we don't lose the info
        out.intensity_label = out.intensity_label || label;
        changes.push(`${key}("${label}") → intensity_label (no numeric map found)`);
      }
    } else {
      // starting_weekly_dose already set — store as label only
      out.intensity_label = out.intensity_label || label;
      changes.push(`${key} demoted to intensity_label (starting_weekly_dose already present)`);
    }
    delete out[key];
  }

  // 6. Ensure dose_unit has a fallback
  if (!('dose_unit' in out) && ('starting_weekly_dose' in out || 'dose_per_administration' in out)) {
    out.dose_unit = 'mg';
    changes.push('dose_unit defaulted to "mg"');
  }

  // 7. Normalize administration_frequency to snake_case lower
  if ('administration_frequency' in out && typeof out.administration_frequency === 'string') {
    const orig = out.administration_frequency;
    const norm = orig.toLowerCase().replace(/[\s-]+/g, '_');
    if (norm !== orig) {
      out.administration_frequency = norm;
      changes.push(`administration_frequency "${orig}" → "${norm}"`);
    }
  }

  return { normalized: out, changes };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = readdirSync(PROTO_DIR).filter(
  f => f.endsWith('.json') && !f.includes('bundle')
);

let totalFiles    = 0;
let totalDrugs    = 0;
let totalChanges  = 0;

for (const file of files) {
  const filePath = join(PROTO_DIR, file);
  const protocol = JSON.parse(readFileSync(filePath, 'utf8'));
  let fileModified = false;
  const fileLog    = [];

  for (const phase of (protocol.phase_blueprints || [])) {
    for (const drug of (phase.drugs || [])) {
      if (!drug.dose_logic) continue;
      totalDrugs++;

      const { normalized, changes } = normalizeDoseLogic(
        drug.dose_logic,
        `${file} / ${phase.phase_name || phase.phase_id} / ${drug.product_slug || drug.product_title}`
      );

      if (changes.length > 0) {
        drug.dose_logic = normalized;
        fileModified    = true;
        totalChanges   += changes.length;
        fileLog.push({
          drug: drug.product_slug || drug.product_title || '(unknown)',
          changes,
        });
      }
    }
  }

  if (fileLog.length > 0) {
    console.log(`\n📄 ${file}:`);
    for (const entry of fileLog) {
      console.log(`  🔬 ${entry.drug}`);
      for (const c of entry.changes) {
        console.log(`     → ${c}`);
      }
    }
  }

  if (fileModified) {
    totalFiles++;
    if (!DRY_RUN) {
      writeFileSync(filePath, JSON.stringify(protocol, null, 2), 'utf8');
    }
  }
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`📊 Summary:`);
console.log(`   Protocol files scanned: ${files.length}`);
console.log(`   Files modified:         ${totalFiles}`);
console.log(`   Drug entries scanned:   ${totalDrugs}`);
console.log(`   Field changes applied:  ${totalChanges}`);
if (DRY_RUN) console.log(`\n   ⚠️  DRY RUN — no files were written`);
else         console.log(`\n   ✅  All files written to disk`);
