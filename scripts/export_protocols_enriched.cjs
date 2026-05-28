'use strict';
/**
 * export_protocols_enriched.cjs
 * Fetches all 25 protocols, fills missing fields, and exports to
 * export/protocols_all_enriched.json for manual review.
 *
 * Enrichments applied:
 *  1. Protocols with 0 phases: convert phase_blueprints → phases (with weekly_dose)
 *  2. Protocols with phases but no weekly_dose on drugs: inject calculated weekly_dose
 *  3. Missing expected_outcomes: inject category-based template
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

const SA_PATH = path.resolve(__dirname, '../Med-Peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))) });
const db = admin.firestore();

const OUT_FILE = path.resolve(__dirname, '../export/protocols_all_enriched.json');

// ── Frequency → weekly multiplier ────────────────────────────────────────────
const FREQ_MULT = {
  daily:        7,
  '5x_week':    5,
  '3x_week':    3,
  '2x_week':    2,
  once_weekly:  1,
  twice_weekly: 2,
  '4x_week':    4,
};

function calcWeeklyDose(doseLogic) {
  if (!doseLogic) return null;
  const { dose_per_administration, administration_frequency, dose_unit } = doseLogic;
  const mult = FREQ_MULT[administration_frequency] ?? null;
  if (!mult || !dose_per_administration) return null;
  return { value: dose_per_administration * mult, unit: dose_unit || 'mcg' };
}

// ── Convert phase_blueprints → phases format ─────────────────────────────────
function blueprintsToPhases(blueprints) {
  return (blueprints || []).map((bp, idx) => ({
    phase_number: idx + 1,
    phase_key:    bp.phase_key || `phase_${idx + 1}`,
    phase_title:  bp.phase_title || `Phase ${idx + 1}`,
    start_week:   bp.default_start_week || null,
    end_week:     (bp.default_start_week || 1) + (bp.default_duration_weeks || 8) - 1,
    objectives:   bp.objectives || [],
    clinical_purpose: bp.clinical_purpose || [],
    drugs_used: (bp.drugs || []).map(drug => {
      const wd = calcWeeklyDose(drug.dose_logic);
      return {
        product_slug:            drug.product_id || null,
        product_title:           drug.product_title || null,
        route:                   drug.route || null,
        dosing_frequency:        drug.dose_logic?.administration_frequency || null,
        dose_per_administration: drug.dose_logic?.dose_per_administration || null,
        dose_unit:               drug.dose_logic?.dose_unit || null,
        timing_hint:             drug.dose_logic?.timing_hint || null,
        weekly_dose:             wd ? `${wd.value} ${wd.unit}` : 'TODO: specify',
        vials_required_for_phase: null, // to be filled by user
      };
    }),
    _injected_from: 'phase_blueprints',
  }));
}

// ── Inject weekly_dose into existing phases ──────────────────────────────────
function enrichPhaseDrugs(phases) {
  return (phases || []).map(phase => ({
    ...phase,
    drugs_used: (phase.drugs_used || []).map(drug => {
      if (drug.weekly_dose) return drug; // already present
      // Try to calculate from available fields
      const doseLogic = {
        dose_per_administration: drug.dose_per_administration || null,
        administration_frequency: drug.dosing_frequency || null,
        dose_unit: drug.dose_unit || 'mcg',
      };
      const wd = calcWeeklyDose(doseLogic);
      return {
        ...drug,
        weekly_dose: wd ? `${wd.value} ${wd.unit}` : 'TODO: specify',
      };
    }),
  }));
}

// ── Default expected_outcomes per category ───────────────────────────────────
const DEFAULT_OUTCOMES = {
  'Cognitive Support': {
    qualitative: [
      'Improved focus and mental clarity',
      'Reduced cognitive fatigue',
      'Enhanced short-term memory',
      'Improved stress resilience',
    ],
    quantitative_ranges: [
      'Reduction in subjective brain fog score (1–10 scale)',
      'Improved performance on cognitive assessment tasks',
    ],
  },
  'Energy & Metabolism': {
    qualitative: [
      'Increased daily energy levels',
      'Reduced fatigue',
      'Improved mitochondrial efficiency',
      'Enhanced physical endurance',
    ],
    quantitative_ranges: [
      'Reduction in fatigue score',
      'Improved VO2 max or exercise tolerance',
    ],
  },
  'Hormonal Support': {
    qualitative: [
      'Improved hormonal balance',
      'Enhanced libido and mood',
      'Improved muscle tone and recovery',
      'Reduced fatigue',
    ],
    quantitative_ranges: [
      'Normalization of hormonal panel values',
      'Improvement in subjective wellbeing scale',
    ],
  },
  'Immune & Inflammation': {
    qualitative: [
      'Reduced systemic inflammation markers',
      'Enhanced immune responsiveness',
      'Improved recovery from illness',
      'Reduced joint discomfort',
    ],
    quantitative_ranges: [
      'Reduction in CRP and inflammatory markers',
      'Improved NK cell activity',
    ],
  },
  Longevity: {
    qualitative: [
      'Improved cellular regeneration markers',
      'Enhanced energy and vitality',
      'Reduced oxidative stress',
      'Improved sleep quality',
    ],
    quantitative_ranges: [
      'Reduction in biological age markers',
      'Improved antioxidant capacity',
    ],
  },
  'Metabolic Health': {
    qualitative: [
      'Improved insulin sensitivity',
      'Reduced visceral fat',
      'Enhanced metabolic flexibility',
      'Improved lipid profile',
    ],
    quantitative_ranges: [
      'Reduction in fasting glucose',
      'Improved HOMA-IR score',
      'Reduction in waist circumference',
    ],
  },
  'Recovery & Tissue Repair': {
    qualitative: [
      'Accelerated soft tissue healing',
      'Reduced inflammation at injury sites',
      'Improved joint mobility',
      'Enhanced recovery between training sessions',
    ],
    quantitative_ranges: [
      'Reduction in pain scores (VAS scale)',
      'Improved functional movement assessment',
      'Reduced time to return to activity',
    ],
  },
  'Recovery & Neurology': {
    qualitative: [
      'Reduced neuropathic pain',
      'Improved nerve conduction',
      'Enhanced central nervous system recovery',
      'Improved motor function',
    ],
    quantitative_ranges: [
      'Reduction in neuropathic pain score',
      'Improved nerve conduction velocity',
    ],
  },
  'Sexual Health & Anti-Aging': {
    qualitative: [
      'Improved libido and sexual function',
      'Enhanced hormonal vitality',
      'Improved mood and energy',
      'Reduced symptoms of age-related decline',
    ],
    quantitative_ranges: [
      'Improvement in sexual function questionnaire score',
      'Normalization of relevant hormonal markers',
    ],
  },
  'Skin & Aesthetics': {
    qualitative: [
      'Improved skin elasticity and firmness',
      'Reduction in fine lines and wrinkles',
      'Enhanced collagen density',
      'Improved skin hydration',
    ],
    quantitative_ranges: [
      'Improvement in skin elasticity measurement',
      'Reduction in subjective skin aging score',
    ],
  },
  'Sleep & Recovery': {
    qualitative: [
      'Improved sleep onset and depth',
      'Reduced nocturnal awakenings',
      'Enhanced morning energy and alertness',
      'Improved circadian rhythm regulation',
    ],
    quantitative_ranges: [
      'Improvement in PSQI sleep quality score',
      'Reduction in sleep latency',
    ],
  },
  'Weight Management': {
    qualitative: [
      'Reduction in visceral fat',
      'Improved body composition',
      'Reduced appetite and cravings',
      'Enhanced metabolic rate',
    ],
    quantitative_ranges: [
      'Reduction in body weight (% from baseline)',
      'Reduction in waist circumference',
      'Improvement in body fat percentage',
    ],
  },
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ENRICHED EXPORT — all 25 protocols with missing fields filled');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const snap = await db.collection('protocols').get();
  console.log(`Fetched: ${snap.size} protocols\n`);

  const sorted = snap.docs.sort((a, b) => a.id.localeCompare(b.id));
  const output = {
    exported_at: new Date().toISOString(),
    schema_version: 'antigravity_v2',
    total: snap.size,
    protocols: {},
  };

  for (const doc of sorted) {
    const data  = doc.data();
    const docId = doc.id;
    const enriched = { id: docId, ...data };
    const issues = [];

    // ─ 1. Phases: build from phase_blueprints if phases is empty/missing ─────
    const hasPhases = Array.isArray(data.phases) && data.phases.length > 0;
    if (!hasPhases) {
      if (Array.isArray(data.phase_blueprints) && data.phase_blueprints.length > 0) {
        enriched.phases = blueprintsToPhases(data.phase_blueprints);
        issues.push(`phases: INJECTED from phase_blueprints (${enriched.phases.length} phases)`);
      } else {
        enriched.phases = [
          {
            phase_number: 1,
            phase_title: 'Phase 1 — TODO: complete',
            start_week: 1,
            end_week: 8,
            objectives: ['TODO: define objectives'],
            drugs_used: [
              {
                product_slug: 'TODO',
                dosing_frequency: 'daily',
                weekly_dose: 'TODO: specify',
              },
            ],
            _injected_from: 'placeholder',
          },
        ];
        issues.push('phases: PLACEHOLDER inserted — requires manual completion');
      }
    } else {
      // ─ 2. Enrich existing phases with weekly_dose ────────────────────────
      const enrichedPhases = enrichPhaseDrugs(data.phases);
      const anyAdded = enrichedPhases.some((p, pi) =>
        p.drugs_used?.some((d, di) => !data.phases[pi]?.drugs_used?.[di]?.weekly_dose)
      );
      enriched.phases = enrichedPhases;
      if (anyAdded) issues.push('phases.drugs.weekly_dose: CALCULATED where possible');
    }

    // ─ 3. expected_outcomes ──────────────────────────────────────────────────
    if (!data.expected_outcomes || !data.expected_outcomes.qualitative?.length) {
      const cat = data.category || 'Metabolic Health';
      enriched.expected_outcomes = DEFAULT_OUTCOMES[cat] || {
        qualitative: ['TODO: define qualitative outcomes'],
        quantitative_ranges: ['TODO: define quantitative ranges'],
        _injected: true,
      };
      issues.push(`expected_outcomes: INJECTED for category "${cat}"`);
    }

    // ─ 4. category guard ─────────────────────────────────────────────────────
    if (!data.category) {
      enriched.category = 'TODO: assign category';
      issues.push('category: MISSING — assign manually');
    }

    // ─ Summary ───────────────────────────────────────────────────────────────
    enriched._enrichment_notes = issues;

    const statusIcon = issues.length === 0 ? '✅' : issues.some(i => i.includes('TODO')) ? '❌' : '⚠️ ';
    console.log(`  ${statusIcon}  ${docId.padEnd(20)} | phases: ${enriched.phases.length} | issues: ${issues.length}`);
    if (issues.length > 0) issues.forEach(i => console.log(`       → ${i}`));

    output.protocols[docId] = enriched;
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  const sizeKB = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅  Exported: export/protocols_all_enriched.json  (${sizeKB} KB)`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  await admin.app().delete();
}

run().catch(err => { console.error(err); process.exit(1); });
