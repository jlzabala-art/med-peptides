/**
 * patch_phase1_monitoring_risk.cjs
 *
 * PHASE 1 — Adds `monitoringSchedule` and `riskManagement` to all 25 protocols.
 * Values are clinically grounded per category and risk_class.
 *
 * Usage: node scripts/patch_phase1_monitoring_risk.cjs
 */

'use strict';

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

const SA_PATH = path.resolve(__dirname, '../Med-Peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))) });
const db = admin.firestore();

// ─── Monitoring schedule templates by category ────────────────────────────────
function buildMonitoringSchedule(category, durationWeeks) {
  const dur = durationWeeks || 8;

  const base = [
    {
      week: 0,
      label: 'Baseline Assessment',
      tests: ['Full blood count (CBC)', 'Comprehensive metabolic panel (CMP)', 'Vitals & weight'],
      notes: 'Establish baseline before starting protocol.',
    },
    {
      week: Math.round(dur / 2),
      label: 'Mid-Protocol Check-In',
      tests: ['Symptom review', 'Subjective wellbeing score (1–10)', 'Side-effect screening'],
      notes: 'Assess tolerability and early response.',
    },
    {
      week: dur,
      label: 'End-of-Protocol Evaluation',
      tests: ['Repeat CBC & CMP', 'Outcome questionnaire', 'Physician review'],
      notes: 'Full outcome assessment and decision on continuation or cycling.',
    },
  ];

  const categoryExtras = {
    'Cognitive Support': {
      midTests: ['MoCA cognitive screening', 'Sleep quality (PSQI)', 'Anxiety/stress scale (GAD-7)'],
      endTests: ['Neuropsychological battery (optional)', 'EEG or qEEG (if available)'],
    },
    'Energy & Metabolism': {
      midTests: ['Mitochondrial function markers (lactate, pyruvate if available)', 'Fatigue VAS score'],
      endTests: ['VO₂ max estimate', 'HRV measurement', 'Energy/fatigue diary review'],
    },
    'Hormonal Support': {
      midTests: ['IGF-1', 'GH stimulation panel', 'Cortisol AM'],
      endTests: ['Full hormone panel: IGF-1, GH, cortisol, thyroid (TSH, fT4)', 'Bone density marker (P1NP optional)'],
    },
    'Immune & Inflammation': {
      midTests: ['CRP', 'IL-6 (if available)', 'White cell differential'],
      endTests: ['Full inflammatory panel: CRP, ESR, IL-6, TNF-α', 'Immune cell subsets (CD4/CD8 ratio)'],
    },
    'Longevity': {
      midTests: ['Telomere length proxy (TruAge or similar)', 'Oxidative stress markers (8-OHdG optional)'],
      endTests: ['Biological age reassessment', 'NAD⁺ levels (if available)', 'Epigenetic clock score'],
    },
    'Metabolic Health': {
      midTests: ['Fasting glucose', 'Insulin', 'HOMA-IR', 'Lipid panel'],
      endTests: ['HbA1c', 'Full lipid panel', 'Body composition (DEXA or impedance)'],
    },
    'Recovery & Neurology': {
      midTests: ['Pain VAS score', 'ROM assessment', 'Neurological symptom checklist'],
      endTests: ['Functional movement screen', 'MRI or imaging review (if indicated)', 'PROMIS outcome score'],
    },
    'Skin': {
      midTests: ['Photographic documentation (standardized)', 'TEWL (transepidermal water loss)', 'Patient skin score'],
      endTests: ['Dermatologist review', 'Collagen density estimate (if available)', 'Patient satisfaction score'],
    },
    'Sleep': {
      midTests: ['Actigraphy data (1-week average)', 'Epworth Sleepiness Scale', 'PSQI score'],
      endTests: ['Polysomnography review (if available)', 'HRV night-time', 'Sleep diary summary'],
    },
    'Weight Management': {
      midTests: ['Weight & waist circumference', 'Fasting glucose', 'Lipid panel', 'Appetite VAS'],
      endTests: ['Body composition (DEXA or impedance)', 'Full metabolic panel', 'HbA1c', 'Liver enzymes (ALT, AST)'],
    },
  };

  const extra = categoryExtras[category] || {};

  if (extra.midTests) base[1].tests.push(...extra.midTests);
  if (extra.endTests) base[2].tests.push(...extra.endTests);

  return base;
}

// ─── Risk management templates by risk_class ─────────────────────────────────
function buildRiskManagement(category, riskClass) {
  const rc = riskClass || 'low_to_moderate';

  const contraindications = {
    'Cognitive Support':   ['Active psychiatric disorder (uncontrolled)', 'Concurrent use of MAOIs', 'Pregnancy or breastfeeding'],
    'Energy & Metabolism': ['Mitochondrial disease (consult specialist)', 'Severe renal impairment (CrCl < 30)', 'Pregnancy'],
    'Hormonal Support':    ['Active malignancy (GH-sensitive)', 'Diabetic retinopathy', 'Pregnancy', 'Active intracranial hypertension'],
    'Immune & Inflammation': ['Active autoimmune disease flare', 'Concurrent immunosuppressive therapy (relative)', 'Pregnancy'],
    'Longevity':           ['Active cancer or history of hormone-sensitive malignancy', 'Severe hepatic impairment', 'Pregnancy'],
    'Metabolic Health':    ['Type 1 diabetes (insulin-dependent, use with caution)', 'Severe renal impairment', 'Personal/family history of medullary thyroid carcinoma (GLP-1 class)'],
    'Recovery & Neurology': ['Active systemic infection', 'Uncontrolled coagulopathy', 'Known peptide hypersensitivity'],
    'Skin':                ['Active skin infection or open wounds at application site', 'Known hypersensitivity to copper compounds', 'Pregnancy'],
    'Sleep':               ['Concurrent use of benzodiazepines or Z-drugs (taper first)', 'Severe sleep apnea (untreated)', 'Pregnancy'],
    'Weight Management':   ['Personal/family history of medullary thyroid carcinoma', 'Multiple endocrine neoplasia type 2 (MEN2)', 'Severe GI motility disorder', 'Pregnancy'],
  };

  const sideEffects = {
    low_to_moderate: [
      { effect: 'Injection site reactions', frequency: 'Common (10–30%)', management: 'Rotate injection sites; use 29–31G insulin needles; apply cold compress.' },
      { effect: 'Mild nausea (first 1–2 weeks)', frequency: 'Uncommon (5–15%)', management: 'Administer with food; reduce dose temporarily if persistent.' },
      { effect: 'Fatigue or somnolence', frequency: 'Rare (<5%)', management: 'Adjust injection timing; evaluate sleep hygiene.' },
      { effect: 'Headache', frequency: 'Uncommon (5–10%)', management: 'Hydration; paracetamol as needed; review dosing.' },
    ],
    moderate: [
      { effect: 'Injection site reactions', frequency: 'Common (15–35%)', management: 'Rotate sites; use proper aseptic technique.' },
      { effect: 'Fluid retention / mild edema', frequency: 'Uncommon (5–10%)', management: 'Reduce dose; monitor blood pressure; salt restriction.' },
      { effect: 'Nausea / GI discomfort', frequency: 'Common (10–25%)', management: 'Dose with food; split doses; titrate slowly.' },
      { effect: 'Elevated fasting glucose', frequency: 'Uncommon (5%)', management: 'Monitor fasting glucose weekly; consult if persistent.' },
      { effect: 'Mood changes / irritability', frequency: 'Rare (<3%)', management: 'Reduce dose; psychological support if needed.' },
    ],
    high: [
      { effect: 'GI effects (nausea, vomiting, diarrhea)', frequency: 'Very common (>30%)', management: 'Start low and titrate; anti-emetics if needed; dose with food.' },
      { effect: 'Injection site lipodystrophy', frequency: 'Uncommon with rotation (5–10%)', management: 'Strict site rotation protocol; map injection sites.' },
      { effect: 'Hypoglycemia risk', frequency: 'Uncommon (2–5%)', management: 'Monitor blood glucose; avoid fasting periods; patient education.' },
      { effect: 'Pancreatitis risk', frequency: 'Rare (<1%)', management: 'Monitor amylase/lipase at baseline; discontinue if abdominal pain.' },
      { effect: 'Thyroid C-cell hyperplasia', frequency: 'Theoretical (animal data)', management: 'Monitor calcitonin at baseline; contraindicated in MEN2 / MTC history.' },
    ],
  };

  const escalationCriteria = {
    low_to_moderate: [
      'Allergic reaction (urticaria, angioedema, anaphylaxis) — STOP immediately, administer epinephrine if severe',
      'Persistent injection site infection (redness, warmth, pus) — STOP, antibiotics, dermatology review',
      'Significant mood deterioration or psychotic symptoms — STOP, psychiatric referral',
      'Unexplained abnormal labs > 2× upper limit of normal — STOP, specialist review',
    ],
    moderate: [
      'Severe or worsening edema — STOP, cardiovascular evaluation',
      'Fasting glucose > 7.0 mmol/L (126 mg/dL) on two occasions — Endocrinology referral',
      'Allergic reaction — STOP, emergency protocol',
      'Hypertensive urgency (BP > 180/110) — STOP, immediate medical attention',
    ],
    high: [
      'Severe abdominal pain (rule out pancreatitis) — STOP, emergency evaluation',
      'Anaphylaxis — STOP, epinephrine, emergency services',
      'Calcitonin elevation > 50 pg/mL — STOP, thyroid specialist',
      'Significant hepatic enzyme elevation (> 3× ULN) — STOP, hepatology review',
      'Severe hypoglycemia (BG < 3.0 mmol/L, symptomatic) — Treat with glucose, review protocol',
    ],
  };

  const storage = {
    default: 'Store peptides at 2–8°C (refrigerated). Reconstituted vials: stable for 28 days refrigerated. Do not freeze reconstituted product. Protect from light.',
  };

  return {
    contraindications: contraindications[category] || ['Pregnancy or breastfeeding', 'Known hypersensitivity to any component', 'Severe hepatic or renal impairment'],
    side_effects: sideEffects[rc] || sideEffects['low_to_moderate'],
    escalation_criteria: escalationCriteria[rc] || escalationCriteria['low_to_moderate'],
    storage_handling: storage.default,
    patient_education: [
      'Demonstrate subcutaneous injection technique before starting.',
      'Provide written dosing schedule and injection site rotation map.',
      'Instruct patient to report any unusual symptoms within 24h.',
      'Advise on proper sharps disposal.',
      'Provide emergency contact number for out-of-hours concerns.',
    ],
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 1 PATCH — monitoringSchedule + riskManagement');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const snap = await db.collection('protocols').get();
  console.log(`📋  ${snap.size} protocols found. Patching…\n`);

  let patched = 0, skipped = 0;

  const BATCH_SIZE = 400;
  const docs = snap.docs;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + BATCH_SIZE);

    chunk.forEach(doc => {
      const d   = doc.data();
      const cat = d.category || 'Metabolic Health';
      const rc  = d.risk_class || 'low_to_moderate';
      const dur = d.protocol_duration_weeks || 8;

      const alreadyHas = d.monitoringSchedule && d.riskManagement;
      if (alreadyHas) {
        console.log(`  ⏭   ${doc.id.padEnd(20)} already has both fields — skipping`);
        skipped++;
        return;
      }

      const update = {};

      if (!d.monitoringSchedule) {
        update.monitoringSchedule = buildMonitoringSchedule(cat, dur);
      }
      if (!d.riskManagement) {
        update.riskManagement = buildRiskManagement(cat, rc);
      }

      batch.update(doc.ref, update);
      console.log(`  ✅  ${doc.id.padEnd(20)} category="${cat}" risk="${rc}"`);
      patched++;
    });

    await batch.commit();
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅  Patched: ${patched}  |  Skipped (already had fields): ${skipped}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
