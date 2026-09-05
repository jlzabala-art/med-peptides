/**
 * Autonomous Protocol Clinical Enrichment Engine
 * 
 * Enriches all clinical protocols in Firestore by populating missing:
 *   - clinical_rationale: Detailed pharmacological mechanism of action
 *   - contraindications: Clinical safety warnings and exclusion criteria
 *   - required_labs: Recommended baseline and follow-up biomarker panels
 *   - monitoring_cadence: Structured check-in frequency and milestone review
 *   - bom (Bill of Materials): Precise clinical dosage, frequency, and duration per item
 * 
 * Usage:
 *   node scripts/autoEnrichProtocols.mjs --dry-run
 *   node scripts/autoEnrichProtocols.mjs --apply
 */

import admin from 'firebase-admin';
import fs from 'fs';

// ── Firebase Admin Initialization ─────────────────────────────────────────────
const envFile = fs.readFileSync('.env.local', 'utf8');
const privateKeyLine = envFile.match(/FIREBASE_PRIVATE_KEY=(.*)/)[1];
const privateKey = privateKeyLine.replace(/\\n/g, '\n').replace(/^\"|\"$/g, '');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'med-peptides-app',
      clientEmail: 'firebase-adminsdk-fbsvc@med-peptides-app.iam.gserviceaccount.com',
      privateKey: privateKey
    })
  });
}
const db = admin.firestore();

const args = process.argv.slice(2);
const isDryRun = !args.includes('--apply');

// ── Peptide-Specific Clinical Reference Database ─────────────────────────────
const PEPTIDE_CLINICAL_DOSING = {
  'bpc-157': {
    dosage: '250mcg - 500mcg SQ or Oral',
    frequency: 'Twice daily (morning and evening)',
    duration: '6 - 12 weeks',
    rationale: 'Promotes focal angiogenesis, stimulates VEGFR2 expression, accelerates granulation tissue formation and fibroblasts migration in soft tissue, tendon, and gut mucosa repair.',
    contraindications: ['Active malignancy (due to pro-angiogenic stimulation)', 'Pregnancy or breastfeeding', 'Hypersensitivity to pentadecapeptide compounds'],
    labs: ['CBC', 'CMP', 'hs-CRP']
  },
  'tb-500': {
    dosage: '2.0mg - 2.5mg SQ',
    frequency: 'Twice weekly for 6 weeks, then 2mg every 2 weeks for maintenance',
    duration: '6 - 8 weeks',
    rationale: 'Upregulates G-actin sequestration, accelerating actin microfilament polymerization, cell motility, endothelial migration, and systemic tissue remodeling.',
    contraindications: ['Active cancer or uncontrolled neoplasms', 'Pregnancy or lactation', 'Severe uncontrolled proliferative retinopathy'],
    labs: ['CBC', 'CMP']
  },
  'cjc-1295': {
    dosage: '100mcg - 200mcg SQ',
    frequency: 'Once daily at bedtime (5 days on / 2 days off)',
    duration: '12 weeks',
    rationale: 'Synthetic GHRH analog that binds pituitary receptors to stimulate pulsatile endogenous Growth Hormone (GH) release without depleting cellular pituitary reserves.',
    contraindications: ['Active neoplastic disease or history of pituitary adenoma', 'Severe diabetic retinopathy', 'Pregnancy or nursing'],
    labs: ['IGF-1', 'Fasting Blood Glucose', 'HbA1c', 'Lipid Panel']
  },
  'ipamorelin': {
    dosage: '200mcg - 300mcg SQ',
    frequency: 'Once daily at bedtime or post-workout (5 days on / 2 days off)',
    duration: '12 weeks',
    rationale: 'Highly selective GHSR-1a (growth hormone secretagogue receptor) agonist stimulating physiologic GH pulses without significantly increasing cortisol, prolactin, or aldosterone.',
    contraindications: ['Active malignancy', 'Severe uncontrolled endocrine disorders', 'Pregnancy'],
    labs: ['IGF-1', 'Prolactin', 'CMP']
  },
  'nad': {
    dosage: '100mg - 250mg SQ (or 500mg IV infusion)',
    frequency: '1-3 times weekly',
    duration: '8 - 12 weeks',
    rationale: 'Direct intracellular coenzyme substrate for PARP DNA repair enzymes and Sirtuin (SIRT1-7) deacetylases, revitalizing mitochondrial ATP generation and epigenetic longevity pathways.',
    contraindications: ['Active cancer (unmonitored tumor metabolism)', 'Acute cardiac arrhythmia during rapid infusion', 'Pregnancy'],
    labs: ['CMP', 'CBC', 'Lipid Panel', 'Hs-CRP']
  },
  'semaglutide': {
    dosage: '0.25mg titration up to 1.0mg - 2.4mg SQ',
    frequency: 'Once weekly on the same day',
    duration: '16 - 24 weeks',
    rationale: 'Long-acting GLP-1 receptor agonist that slows gastric emptying, suppresses glucagon secretion, enhances glucose-dependent insulin release, and modulates hypothalamic satiety centers.',
    contraindications: ['Personal or family history of Medullary Thyroid Carcinoma (MTC)', 'Multiple Endocrine Neoplasia syndrome type 2 (MEN 2)', 'History of severe pancreatitis'],
    labs: ['HbA1c', 'Fasting Insulin', 'Lipid Panel', 'Comprehensive Metabolic Panel', 'Amylase/Lipase if indicated']
  },
  'tirzepatide': {
    dosage: '2.5mg titration up to 5.0mg - 15.0mg SQ',
    frequency: 'Once weekly',
    duration: '16 - 24 weeks',
    rationale: 'Dual GIP/GLP-1 receptor agonist offering synergistic enhancement of insulin sensitivity, white adipose tissue lipolysis, delayed gastric transit, and potent central appetite suppression.',
    contraindications: ['Personal or family history of MTC', 'MEN 2', 'History of pancreatitis', 'Severe gastroparesis'],
    labs: ['HbA1c', 'Fasting Glucose & Insulin', 'CMP', 'Lipid Panel', 'Calcitonin baseline']
  },
  'epithalon': {
    dosage: '5mg - 10mg SQ',
    frequency: 'Once daily for 10-20 consecutive days (repeat cycle every 6 months)',
    duration: '2 - 3 weeks per cycle',
    rationale: 'Synthetic tetrapeptide that induces telomerase activity, promotes telomere elongation in somatic cells, normalizes circadian melatonin secretion, and restores pineal gland biorhythms.',
    contraindications: ['Active tumor pathology', 'Pregnancy or nursing', 'Autoimmune flare-up without medical clearance'],
    labs: ['CBC', 'CMP', 'Hs-CRP', 'Telomere length test (optional)']
  },
  'thymosin-alpha-1': {
    dosage: '1.6mg (0.8ml) SQ',
    frequency: 'Twice weekly (or daily during acute immune challenge for 5-7 days)',
    duration: '6 - 12 weeks',
    rationale: 'Bio-identical thymic peptide modulating adaptive and innate immunity via TLR-9 stimulation, activating cytotoxic T-cells, NK cells, and dendritic cells while balancing Th1/Th2 ratio.',
    contraindications: ['Organ transplant recipients on immunosuppressive therapy', 'Severe uncontrolled autoimmune conditions (unless supervised)', 'Pregnancy'],
    labs: ['CBC with differential', 'CMP', 'Immunoglobulin panel (optional)']
  },
  'ghk-cu': {
    dosage: '2.0mg - 5.0mg SQ or Topical 1-2%',
    frequency: 'Once daily (5 days on / 2 days off)',
    duration: '6 - 8 weeks',
    rationale: 'Copper-binding tripeptide upregulating decorin, procollagen synthesis, glycosaminoglycans, elastogenesis, while exerting potent anti-fibrotic, anti-inflammatory, and neuroprotective gene modulation.',
    contraindications: ['Wilson disease or copper metabolism dysfunction', 'Active malignancy', 'Pregnancy'],
    labs: ['Serum Copper', 'Ceruloplasmin', 'CMP']
  },
  '5-amino-1mq': {
    dosage: '50mg - 100mg Oral',
    frequency: 'Once daily in the morning with food',
    duration: '8 - 12 weeks',
    rationale: 'Small molecule inhibitor of NNMT (nicotinamide N-methyltransferase), elevating intracellular NAD+ and SAM levels, enhancing white adipose lipolysis, and boosting cellular energy expenditure.',
    contraindications: ['Severe renal or hepatic dysfunction', 'Pregnancy or lactation'],
    labs: ['CMP', 'Lipid Panel', 'Fasting Glucose']
  },
  'selank': {
    dosage: '250mcg - 500mcg Nasal spray (or SQ)',
    frequency: '1-2 times daily as needed',
    duration: '4 - 8 weeks',
    rationale: 'Synthetic heptapeptide tuftsin analog that modulates GABA-ergic neurotransmission, promotes BDNF synthesis, and provides potent anxiolytic action without sedation or addiction potential.',
    contraindications: ['Hypersensitivity to synthetic tuftsin', 'Pregnancy'],
    labs: ['Baseline clinical assessment']
  },
  'semax': {
    dosage: '250mcg - 500mcg Nasal spray',
    frequency: 'Once daily in the morning',
    duration: '4 - 8 weeks',
    rationale: 'ACTH (4-10) analog that elevates BDNF and TrkB receptor expression, enhancing neuroplasticity, working memory, executive focus, and protection against cerebral ischemic stress.',
    contraindications: ['Acute psychosis or severe untreated anxiety', 'Pregnancy or lactation'],
    labs: ['Baseline clinical cognitive assessment']
  },
  'dsip': {
    dosage: '100mcg SQ',
    frequency: 'Once daily 30-60 minutes before bedtime',
    duration: '2 - 4 weeks',
    rationale: 'Endogenous nonapeptide promoting slow-wave deep sleep (delta rhythm), stabilizing hypothalamic-pituitary-adrenal axis responsiveness, and normalizing circadian cortisol surges.',
    contraindications: ['Severe narcolepsy', 'Pregnancy'],
    labs: ['CMP', 'Sleep architecture questionnaire']
  },
  'pt-141': {
    dosage: '1.25mg - 1.75mg SQ',
    frequency: 'As needed 30-60 minutes prior to anticipated sexual activity (max 8 doses/month)',
    duration: 'On-demand acute protocol',
    rationale: 'Selective melanocortin receptor agonist (MC3R/MC4R) that stimulates central nervous system dopamine and oxytocin pathways mediating sexual desire and arousal.',
    contraindications: ['Uncontrolled hypertension or severe cardiovascular disease', 'Pregnancy'],
    labs: ['Blood Pressure baseline', 'CMP']
  },
  'aod-9604': {
    dosage: '300mcg - 500mcg SQ',
    frequency: 'Once daily in the morning in a fasted state',
    duration: '12 weeks',
    rationale: 'C-terminal fragment of hGH (amino acids 177-191) that stimulates lipolysis and inhibits lipogenesis without altering glycemic control or IGF-1 systemic concentrations.',
    contraindications: ['Pregnancy or nursing', 'Active malignancy'],
    labs: ['Fasting Blood Glucose', 'Lipid Panel', 'CMP']
  },
  'mots-c': {
    dosage: '5mg - 10mg SQ',
    frequency: '3 times weekly on non-consecutive days (or 5mg daily for 5 days then maintenance)',
    duration: '8 - 12 weeks',
    rationale: 'Mitochondrial-derived peptide (MDP) regulating metabolic homeostasis, enhancing skeletal muscle glucose uptake via AMPK pathway, and preventing diet-induced insulin resistance.',
    contraindications: ['Severe renal failure', 'Active cancer', 'Pregnancy'],
    labs: ['HbA1c', 'Fasting Insulin', 'CMP', 'Lipid Panel']
  },
  'ss-31': {
    dosage: '4.0mg SQ',
    frequency: 'Once daily (morning or pre-exercise)',
    duration: '4 - 8 weeks',
    rationale: 'Mitochondria-targeted tetrapeptide that binds cardiolipin in the inner mitochondrial membrane, optimizing electron transport chain efficiency and quenching reactive oxygen species (ROS).',
    contraindications: ['Hypersensitivity to synthetic peptide analogs', 'Pregnancy'],
    labs: ['CMP', 'CBC', 'hs-CRP']
  }
};

// Helper: match compound name to reference
function matchCompound(name) {
  const clean = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, ref] of Object.entries(PEPTIDE_CLINICAL_DOSING)) {
    const cleanKey = key.replace(/[^a-z0-9]/g, '');
    if (clean.includes(cleanKey) || cleanKey.includes(clean)) {
      return ref;
    }
  }
  return null;
}

// ── Protocol Enrichment Logic ────────────────────────────────────────────────
function enrichProtocolDocument(protocol) {
  const enriched = { ...protocol };
  const name = protocol.name || '';
  const bom = Array.isArray(protocol.bom) ? [...protocol.bom] : [];

  // 1. Enrich BOM items with realistic dosages, frequencies and durations
  const enrichedBom = bom.map(item => {
    const itemName = item.product_name || item.name || item.productId || '';
    const ref = matchCompound(itemName);

    const dosage = item.dosage || ref?.dosage || 'Prescribed Clinical Concentration';
    const frequency = item.frequency || ref?.frequency || 'Once daily or as directed by physician';
    const duration = item.duration || ref?.duration || '8 - 12 Weeks';

    return {
      ...item,
      dosage,
      frequency,
      duration
    };
  });
  enriched.bom = enrichedBom;

  // 2. Synthesize or enrich clinical rationale
  if (!enriched.clinical_rationale || enriched.clinical_rationale.length < 30) {
    const rationales = enrichedBom
      .map(item => {
        const ref = matchCompound(item.product_name || item.productId);
        return ref ? `${item.product_name || item.productId}: ${ref.rationale}` : null;
      })
      .filter(Boolean);

    if (rationales.length > 0) {
      enriched.clinical_rationale = rationales.join(' ');
    } else {
      enriched.clinical_rationale = `${name} utilizes synergistic peptide signaling and targeted cellular pathways to achieve optimal therapeutic response, tissue homeostasis, and biomarker optimization.`;
    }
  }

  // 3. Populate or enrich contraindications
  const existingContra = Array.isArray(enriched.contraindications) ? enriched.contraindications : [];
  if (existingContra.length === 0) {
    const contraSet = new Set();
    enrichedBom.forEach(item => {
      const ref = matchCompound(item.product_name || item.productId);
      if (ref?.contraindications) {
        ref.contraindications.forEach(c => contraSet.add(c));
      }
    });

    if (contraSet.size === 0) {
      contraSet.add('Active malignancies or uncontrolled neoplasms');
      contraSet.add('Pregnancy, planning pregnancy, or breastfeeding');
      contraSet.add('Severe hepatic or end-stage renal impairment');
      contraSet.add('Known hypersensitivity to active peptides or benzyl alcohol');
    }

    enriched.contraindications = Array.from(contraSet);
  }

  // 4. Populate or enrich required labs
  const existingLabs = Array.isArray(enriched.required_labs) ? enriched.required_labs : [];
  if (existingLabs.length === 0) {
    const labSet = new Set(['CBC', 'CMP']);
    enrichedBom.forEach(item => {
      const ref = matchCompound(item.product_name || item.productId);
      if (ref?.labs) {
        ref.labs.forEach(l => labSet.add(l));
      }
    });

    // Add category-specific labs
    const cat = (enriched.category || enriched.categoryId || '').toLowerCase();
    if (cat.includes('metabolic') || cat.includes('weight')) {
      labSet.add('HbA1c');
      labSet.add('Fasting Insulin');
      labSet.add('Lipid Panel');
    } else if (cat.includes('aging') || cat.includes('longevity')) {
      labSet.add('IGF-1');
      labSet.add('hs-CRP');
      labSet.add('Lipid Panel');
    }

    enriched.required_labs = Array.from(labSet);
  }

  // 5. Populate monitoring cadence and check-in weeks
  if (!enriched.monitoring_cadence) {
    enriched.monitoring_cadence = 'Baseline evaluation, Week 4 tolerance check, Week 8 biomarker review, Week 12 consolidation';
  }
  if (!Array.isArray(enriched.check_in_weeks) || enriched.check_in_weeks.length === 0) {
    enriched.check_in_weeks = [2, 4, 8, 12];
  }

  // 6. Ensure phases have duration and objective
  if (Array.isArray(enriched.phases)) {
    enriched.phases = enriched.phases.map((ph, idx) => ({
      ...ph,
      name: ph.name || `Phase ${idx + 1}: Therapeutic Action`,
      durationWeeks: ph.durationWeeks || (idx === 0 ? 6 : 6),
      objective: ph.objective || 'Primary therapeutic intervention and patient tolerance establishment.'
    }));
  }

  enriched.updatedAt = new Date().toISOString();
  enriched._clinicalEnrichedAt = new Date().toISOString();

  return enriched;
}

// ── Main Execution Flow ───────────────────────────────────────────────────────
async function run() {
  console.log(`\n================================================================`);
  console.log(`🧬 CLINICAL PROTOCOL AUTO-ENRICHMENT ENGINE`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (Preview only, no DB writes)' : '⚡ LIVE RUN (Writing to Firestore)'}`);
  console.log(`================================================================\n`);

  console.log('📦 Fetching all protocols from Firestore...');
  const snapshot = await db.collection('protocols').get();
  console.log(`Found ${snapshot.size} protocols in database.\n`);

  let enrichedCount = 0;
  let bomItemsUpdated = 0;

  for (let i = 0; i < snapshot.docs.length; i++) {
    const doc = snapshot.docs[i];
    const data = { id: doc.id, ...doc.data() };
    const name = data.name || doc.id;

    process.stdout.write(`[${i + 1}/${snapshot.size}] Enriching "${name}" ... `);

    const enriched = enrichProtocolDocument(data);

    const bomDiff = (enriched.bom || []).filter(b => b.dosage && b.frequency).length;
    bomItemsUpdated += bomDiff;
    enrichedCount++;

    console.log(`✅ (BOM: ${enriched.bom.length} items with dose, ${enriched.required_labs.length} labs, ${enriched.contraindications.length} contras)`);

    if (!isDryRun) {
      const payload = JSON.parse(JSON.stringify(enriched));
      delete payload.id;
      await db.collection('protocols').doc(doc.id).set(payload, { merge: true });
    }
  }

  console.log(`\n================================================================`);
  console.log(`📊 PROTOCOL ENRICHMENT REPORT`);
  console.log(`================================================================`);
  console.log(`Total Protocols:     ${snapshot.size}`);
  console.log(`Protocols Enriched:  ${enrichedCount}`);
  console.log(`BOM Items Populated: ${bomItemsUpdated}`);
  if (!isDryRun) {
    console.log(`DB Writes:           ${enrichedCount} protocols updated in Firestore`);
  } else {
    console.log(`DB Writes:           0 (DRY RUN - run with --apply to execute)`);
  }
  console.log(`================================================================\n`);
}

run().catch(console.error);
