/**
 * uploadEnrichedTirzepatide.mjs
 * Enriquece y carga los 3 documentos Tirzepatide en Firestore
 * con datos farmacológicos completos + variantes 4-tier pricing.
 *
 * Usage: node scripts/uploadEnrichedTirzepatide.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp }       from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db  = getFirestore();
const now = Timestamp.now();

// ── Shared enrichment (same for all vial sizes) ───────────────────────────────
const COMMON = {
  name:           'Tirzepatide',
  displayName:    'Tirzepatide',
  scientificName: 'LY3298176; Tirzepatide',
  cas:            '2023788-19-2',
  category:       'Weight Management & Metabolic',
  status:         'active',
  isBlend:        false,
  blendComponents: [],

  description: 'A once-weekly synthetic dual GIP and GLP-1 receptor agonist (twincretin) developed by Eli Lilly. FDA-approved for T2DM (Mounjaro) and chronic weight management (Zepbound). Demonstrates superior glycemic and weight outcomes vs. GLP-1 monotherapy in the SURPASS trial series.',

  objective: 'Weight reduction, glycemic control, metabolic syndrome management, insulin sensitivity',

  mechanisms: [
    'Selective dual GIP (GIPR) and GLP-1 receptor (GLP-1R) agonism (twincretin mechanism)',
    'GIP receptor agonism potentiating insulin sensitivity in skeletal muscle and adipose tissue',
    'GLP-1 receptor agonism providing incretin effect with glucose-dependent insulin secretion',
    'Central hypothalamic appetite suppression via GLP-1R signaling on vagal afferents and area postrema',
    'Glucagon suppression during hyperglycemic states reducing hepatic glucose output',
    'Delayed gastric emptying reducing post-prandial glucose excursions',
    'GIP-mediated reduction in hepatic fat via GIPR signaling on hepatocytes',
  ],

  pharmacokinetics: {
    half_life:               '~5 days (allowing once-weekly dosing)',
    bioavailability:         '>80% subcutaneous',
    route_of_administration: ['subcutaneous'],
    tmax:                    '8–72 hours post-injection (median ~24h)',
    protein_binding:         '>99% (albumin and other plasma proteins)',
    metabolism:              'Proteolytic degradation; C18 fatty diacid moiety extends half-life via albumin binding',
    excretion:               'Renal (~51%) and fecal (~49%); parent compound undetectable in urine',
    dose_proportionality:    'Approximately linear across 2.5–15 mg dose range',
    steady_state:            'Reached after 4 weeks of once-weekly dosing',
  },

  molecular_weight:   4813.48,
  molecular_formula:  'C225H348N48O68',

  storage_conditions: {
    temperature:    '2–8°C (refrigerated, unused pens/vials); up to 21 days at room temperature (≤30°C)',
    light:          'Store in original carton to protect from light',
    container:      'Single-dose prefilled pen or vial',
    shelf_life:     '24 months from manufacturing date; discard 21 days after first use if kept at room temp',
    reconstitution: 'Ready to inject solution; no reconstitution required',
    notes:          'Do not freeze. Do not use if solution is discolored or contains particles.',
  },

  research_status: 'FDA Approved (Phase III — SURPASS & SURMOUNT trials)',

  safetyNote: 'FDA-approved prescription medication (Mounjaro® / Zepbound®). For research use only when obtained outside approved channels. Contraindicated in patients with personal/family history of medullary thyroid carcinoma or Multiple Endocrine Neoplasia syndrome type 2 (MEN 2). Boxed warning: thyroid C-cell tumors observed in rodents.',

  contraindications: [
    'Personal or family history of medullary thyroid carcinoma (MTC)',
    'Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)',
    'Hypersensitivity to tirzepatide or any excipient',
    'Concurrent use of other GLP-1 receptor agonists (pharmacodynamic duplication)',
    'Type 1 diabetes mellitus (not studied; risk of diabetic ketoacidosis)',
    'Severe renal impairment or end-stage renal disease (limited data)',
    'Pregnancy or breastfeeding (teratogenic risk in animal studies)',
    'History of pancreatitis — use with caution; discontinue if suspected',
  ],

  goals: ['weight_loss', 'metabolism', 'obesity', 'insulin_sensitivity', 'glycemic_control'],
  tags:  ['Metabolism', 'Weight Loss', 'GLP-1', 'GIP', 'Twincretin', 'FDA Approved', 'Incretin'],

  synonyms: ['mounjaro', 'zepbound', 'ly3298176', 'twincretin'],

  reference_pmids: [
    '34170647', // SURPASS-1 (N Engl J Med 2021)
    '34170651', // SURPASS-2 vs. semaglutide
    '35658024', // SURMOUNT-1 weight loss trial
    '37480169', // SURMOUNT-2
    '36989539', // Cardiovascular outcomes
  ],

  semanticKeywords: ['fat loss', 'diabetes', 'blood sugar', 'appetite', 'obesity', 'metabolic syndrome', 'twincretin'],
  secondaryFactors:  ['appetite_suppression', 'blood_sugar', 'cardiovascular_health', 'insulin_sensitivity'],

  _schemaVersion:    '3.0',
  _variantsMigrated: true,
  _enrichedAt:       now,
  _migratedAt:       now,
};

// ── Per-vial configs: id, size, pricing ───────────────────────────────────────
const VIALS = [
  {
    id:          'Tirzepatide-10mg-vial',
    size:        '10mg',
    dosage:      '10mg/vial',
    quantity:    '10 vial/kit',
    guestVial:   46,
    proVial:     40,
    guestKit:    322,
    proKit:      273.70,
  },
  {
    id:          'Tirzepatide-15mg-vial',
    size:        '15mg',
    dosage:      '15mg/vial',
    quantity:    '10 vial/kit',
    guestVial:   69,
    proVial:     58.65,
    guestKit:    448.50,
    proKit:      381.22,
  },
  {
    id:          'Tirzepatide-30mg-vial',
    size:        '30mg',
    dosage:      '30mg/vial',
    quantity:    '10 vial/kit',
    guestVial:   80.50,
    proVial:     68.43,
    guestKit:    575,
    proKit:      488.75,
  },
];

function buildVariant({ size, dosage, quantity, guestVial, proVial, guestKit, proKit }) {
  const r = v => Math.round(v * 100) / 100;
  return {
    label:     `${size} vial`,
    size,
    form:      'vial',
    isDefault: size === '10mg',
    stock:     { available: true, quantity: null },
    pricing: {
      retail:    { perUnit: guestVial,            kit: guestKit            },
      clinic:    { perUnit: proVial,              kit: proKit              },
      wholesale: { perUnit: r(proVial * 0.90),    kit: r(proKit * 0.90)   },
      master:    { perUnit: r(proVial * 0.85),    kit: r(proKit * 0.85)   },
    },
    legacy: {
      guestVialPrice: guestVial,
      proVialPrice:   proVial,
      guestKitPrice:  guestKit,
      proKitPrice:    proKit,
      dosage,
      quantity,
    },
    migratedAt: now,
  };
}

// ── Upload ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n📤 Uploading enriched Tirzepatide (3 vials)\n');

  for (const vial of VIALS) {
    const ref     = db.collection('products').doc(vial.id);
    const rootDoc = { ...COMMON, dosage: vial.dosage, size: vial.size };
    const variant = buildVariant(vial);

    await ref.set(rootDoc, { merge: true });
    await ref.collection('variants').doc('default').set(variant);

    const p = variant.pricing;
    console.log(`✅ [${vial.id}]`);
    console.log(`   retail: $${p.retail.perUnit} | clinic: $${p.clinic.perUnit} | wholesale: $${p.wholesale.perUnit} | master: $${p.master.perUnit}`);
    console.log(`   kit:    $${p.retail.kit}     | kit clinic: $${p.clinic.kit}`);
  }

  // Verify
  console.log('\n🔍 Verifying...');
  for (const vial of VIALS) {
    const vs = await db.collection('products').doc(vial.id).collection('variants').get();
    console.log(`   ${vial.id}: ${vs.size} variant(s)`);
  }

  console.log('\n🎉 Tirzepatide fully enriched and uploaded.\n');
  console.log('Next: node scripts/migrateVariants.mjs --apply  (57 remaining products)\n');
}

main().catch(e => { console.error(e); process.exit(1); });
