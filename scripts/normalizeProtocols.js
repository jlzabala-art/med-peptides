/**
 * Phase 3 — Canonical Protocol Data Model Normalization
 *
 * Fills missing fields in protocolBlueprintsV2.json:
 *   - weekly_dose (string, e.g. "0.5mg")
 *   - dosing_frequency (string, e.g. "weekly")
 *   - route (string, e.g. "subcutaneous")
 *   - reconstitution_volume_ml (number, ml of bacteriostatic water)
 *
 * Rules:
 *   - Existing values are NEVER overwritten.
 *   - Values are derived from the canonical DRUG_DEFAULTS table below.
 *   - If a drug entry already specifies weekly_dose but not dosing_frequency,
 *     only dosing_frequency is back-filled (and vice-versa).
 *
 * Run: node scripts/normalizeProtocols.js
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL DRUG DEFAULTS TABLE
// Source: clinical reference + existing protocol data
// Fields:
//   route                  — primary administration route
//   dosing_frequency       — canonical dosing frequency for peptide-class drugs
//   weekly_dose            — canonical weekly dose string (null if weekly_dose
//                            is controlled per-protocol, e.g. GLP-1 escalation)
//   reconstitution_volume_ml — standard bac-water volume per vial (ml)
// ─────────────────────────────────────────────────────────────────────────────
const DRUG_DEFAULTS = {
  // ── GLP-1 / GIP agonists (weekly SQ; dose varies per escalation phase) ──
  'tirzepatide': {
    route: 'subcutaneous',
    dosing_frequency: 'weekly',
    weekly_dose: null,            // intentionally null — each phase specifies its own dose
    reconstitution_volume_ml: 1
  },
  'semaglutide': {
    route: 'subcutaneous',
    dosing_frequency: 'weekly',
    weekly_dose: null,
    reconstitution_volume_ml: 1
  },
  'retatrutide': {
    route: 'subcutaneous',
    dosing_frequency: 'weekly',
    weekly_dose: null,
    reconstitution_volume_ml: 1
  },
  'cagrilintide': {
    route: 'subcutaneous',
    dosing_frequency: 'weekly',
    weekly_dose: null,
    reconstitution_volume_ml: 1
  },

  // ── Mitochondrial / metabolic peptides ──
  'mots-c': {
    route: 'subcutaneous',
    dosing_frequency: null,       // varies by phase (3x_week / 2x_week)
    weekly_dose: null,
    reconstitution_volume_ml: 1
  },
  'ss-31': {
    route: 'subcutaneous',
    dosing_frequency: 'daily',
    weekly_dose: '5mg',
    reconstitution_volume_ml: 1
  },
  'nmn': {
    route: 'oral',
    dosing_frequency: 'daily',
    weekly_dose: '1750mg',        // 250mg/day × 7
    reconstitution_volume_ml: null // oral — no reconstitution
  },
  'nad': {
    route: 'intravenous',
    dosing_frequency: '2x_week',
    weekly_dose: '500mg',
    reconstitution_volume_ml: null // IV — diluted in saline bag, not bac-water
  },

  // ── Lipolytic fragment ──
  'aod-9604': {
    route: 'subcutaneous',
    dosing_frequency: 'daily',
    weekly_dose: '1.75mg',        // 250mcg × 7
    reconstitution_volume_ml: 2
  },

  // ── Tissue repair ──
  'bpc-157': {
    route: 'subcutaneous',
    dosing_frequency: null,       // varies by phase (daily / 3x_week)
    weekly_dose: null,
    reconstitution_volume_ml: 2
  },
  'tb-500': {
    route: 'subcutaneous',
    dosing_frequency: 'weekly',
    weekly_dose: '5mg',
    reconstitution_volume_ml: 2
  },
  'ara-290': {
    route: 'subcutaneous',
    dosing_frequency: '3x_week',
    weekly_dose: '6mg',
    reconstitution_volume_ml: 1
  },

  // ── Hormonal / GH-axis ──
  'cjc-1295-ipamorelin': {
    route: 'subcutaneous',
    dosing_frequency: 'daily',
    weekly_dose: '7mg',           // 1mg/day × 7
    reconstitution_volume_ml: 2
  },
  'ipamorelin': {
    route: 'subcutaneous',
    dosing_frequency: 'daily',
    weekly_dose: '3.5mg',         // 500mcg × 7
    reconstitution_volume_ml: 2
  },
  'tesamorelin': {
    route: 'subcutaneous',
    dosing_frequency: 'daily',
    weekly_dose: '14mg',          // 2mg/day × 7
    reconstitution_volume_ml: 2
  },

  // ── Cognitive / nootropic (intranasal) ──
  'semax': {
    route: 'intranasal',
    dosing_frequency: 'daily',
    weekly_dose: null,            // unit-dose spray; not mg-based weekly totals
    reconstitution_volume_ml: null
  },
  'selank': {
    route: 'intranasal',
    dosing_frequency: 'daily',
    weekly_dose: null,
    reconstitution_volume_ml: null
  },

  // ── Longevity / circadian ──
  'epithalon': {
    route: 'subcutaneous',
    dosing_frequency: 'daily',
    weekly_dose: '35mg',          // 5mg/day × 7
    reconstitution_volume_ml: 1
  },
  'pinealon': {
    route: 'subcutaneous',
    dosing_frequency: 'daily',
    weekly_dose: '2.1mg',         // 300mcg/day × 7
    reconstitution_volume_ml: 1
  },
  'dsip': {
    route: 'subcutaneous',
    dosing_frequency: 'daily',
    weekly_dose: '2.1mg',         // 300mcg/day × 7
    reconstitution_volume_ml: 1
  },

  // ── Immune / anti-inflammatory ──
  'thymosin-alpha-1': {
    route: 'subcutaneous',
    dosing_frequency: '2x_week',
    weekly_dose: '3.2mg',         // 1.6mg × 2
    reconstitution_volume_ml: 1
  },
  'kpv': {
    route: 'subcutaneous',
    dosing_frequency: 'daily',
    weekly_dose: '2.1mg',         // 300mcg/day × 7
    reconstitution_volume_ml: 1
  },

  // ── Skin / collagen ──
  'ghk-cu': {
    route: 'subcutaneous',
    dosing_frequency: '3x_week',
    weekly_dose: '1.5mg',         // 500mcg × 3
    reconstitution_volume_ml: 2
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZATION FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
function normalizeDrug(drug) {
  const defaults = DRUG_DEFAULTS[drug.product_slug];
  if (!defaults) {
    console.warn(`  ⚠️  No defaults found for: ${drug.product_slug}`);
    return drug;
  }

  const updated = { ...drug };
  let changes = [];

  if (defaults.route && !updated.route) {
    updated.route = defaults.route;
    changes.push('route');
  }
  if (defaults.dosing_frequency && !updated.dosing_frequency) {
    updated.dosing_frequency = defaults.dosing_frequency;
    changes.push('dosing_frequency');
  }
  if (defaults.weekly_dose && !updated.weekly_dose) {
    updated.weekly_dose = defaults.weekly_dose;
    changes.push('weekly_dose');
  }
  if (defaults.reconstitution_volume_ml != null && !updated.reconstitution_volume_ml) {
    updated.reconstitution_volume_ml = defaults.reconstitution_volume_ml;
    changes.push('reconstitution_volume_ml');
  }

  if (changes.length > 0) {
    console.log(`    ✔  ${drug.product_slug}: added [${changes.join(', ')}]`);
  }

  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const dataPath = path.join(__dirname, '../src/data/protocolBlueprintsV2.json');
const backupPath = path.join(__dirname, '../src/data/protocolBlueprintsV2.backup.json');

// 1. Read
const raw = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(raw);

// 2. Backup
fs.writeFileSync(backupPath, raw, 'utf8');
console.log(`\n✅ Backup saved → ${backupPath}\n`);

// 3. Normalize
let totalChanges = 0;
const normalized = data.map(protocol => {
  console.log(`\n▶ ${protocol.protocol_id} — ${protocol.protocol_title}`);
  return {
    ...protocol,
    phases: protocol.phases.map(phase => {
      console.log(`  Phase ${phase.phase_number}: ${phase.phase_title}`);
      return {
        ...phase,
        drugs_used: phase.drugs_used.map(drug => {
          const before = JSON.stringify(drug);
          const after = normalizeDrug(drug);
          if (JSON.stringify(after) !== before) totalChanges++;
          return after;
        })
      };
    })
  };
});

// 4. Write
fs.writeFileSync(dataPath, JSON.stringify(normalized, null, 2), 'utf8');
console.log(`\n✅ Normalization complete. ${totalChanges} drug entries updated.`);
console.log(`📄 Output → ${dataPath}\n`);
