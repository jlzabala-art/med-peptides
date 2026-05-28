// seedHormonePelletsToFirestore.mjs
// ---------------------------------------------------------------------------
// Script to seed enriched hormone pellet data (testosterone, estradiol, gestrinone)
// into Firestore under the `products` collection. It runs in small batches to
// avoid hitting Firestore limits or transient errors.
// ---------------------------------------------------------------------------

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ---------------------------------------------------------------
// Service account configuration (same pattern as other seed scripts)
// ---------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceKeyPath = join(__dirname, 'serviceAccountKey.json');
let credential;
try {
  const raw = readFileSync(serviceKeyPath, 'utf-8');
  credential = cert(JSON.parse(raw));
  console.log('🔑  Using serviceAccountKey.json');
} catch {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('🔑  Using GOOGLE_APPLICATION_CREDENTIALS');
  } else {
    console.error('❌  No Firebase credentials found.');
    process.exit(1);
  }
}

initializeApp({ credential, projectId: 'med-peptides-app' });
const db = getFirestore();

// ---------------------------------------------------------------
// Hormone pellet data – enriched (goals, mechanisms, etc.)
// ---------------------------------------------------------------
const pellets = [
  {
    slug: 'testosterone-pellet',
    name: 'Testosterone Pellet',
    category: 'Hormone Pellets',
    subcategory: 'Testosterone',
    dosage: '12.5mg',
    description: 'Testosterone subcutaneous pellet for hormone replacement therapy (HRT) in men and women.',
    objective: 'Restore testosterone levels and improve androgen‑related symptoms.',
    goals: [
      'testosterone deficiency',
      'male hypogonadism',
      'female androgen insufficiency',
      'libido enhancement',
      'muscle mass preservation',
      'fat redistribution',
      'energy restoration',
      'mood stabilization'
    ],
    secondaryFactors: [
      'low energy',
      'decreased muscle strength',
      'increased body fat',
      'low libido',
      'fatigue',
      'depressive mood'
    ],
    mechanisms: [
      'subcutaneous slow‑release of testosterone',
      'conversion to dihydrotestosterone (DHT) in target tissues',
      'aromatization to estradiol for balanced estrogen levels',
      'up‑regulation of androgen receptors'
    ],
    semanticKeywords: [
      'testosterone',
      'pellet',
      'subcutaneous',
      'hormone therapy',
      'androgen',
      'hypogonadism',
      'libido',
      'muscle',
      'fat loss',
      'energy',
      'mood'
    ],
    searchAliases: ['testosterone pellet', 'T pellet', 'T pellet HRT'],
    synonyms: ['testosterone subcutaneous implant'],
    aiContent: {
      clinicalBrief: 'Testosterone pellets provide a long‑acting androgen source, delivering stable serum levels over several months. They are used in TRT/BHRT to correct low testosterone, improve libido, muscle mass, and energy while minimizing daily dosing.'
    },
    pharmacology: {
      halfLife: '3‑4 months (steady release)',
      receptorTargets: ['androgen receptor', 'estrogen receptor (via aromatization)']
    }
  },
  {
    slug: 'estradiol-pellet',
    name: 'Estradiol Pellet',
    category: 'Hormone Pellets',
    subcategory: 'Estradiol',
    dosage: '6mg',
    description: 'Estradiol subcutaneous pellet for menopausal hormone therapy.',
    objective: 'Replace declining estrogen levels and relieve menopausal symptoms.',
    goals: [
      'menopause symptom relief',
      'vasomotor symptom reduction',
      'vaginal dryness improvement',
      'bone density preservation',
      'mood stabilization',
      'sleep quality',
      'skin elasticity',
      'cardiovascular health support'
    ],
    secondaryFactors: [
      'hot flashes',
      'night sweats',
      'vaginal atrophy',
      'osteoporosis risk',
      'irritability',
      'insomnia'
    ],
    mechanisms: [
      'continuous subcutaneous estradiol release',
      'binding to estrogen receptors (ERα, ERβ)',
      'up‑regulation of osteoblastic activity',
      'modulation of hypothalamic thermoregulatory center'
    ],
    semanticKeywords: [
      'estradiol',
      'pellet',
      'menopause',
      'hormone therapy',
      'vasomotor',
      'bone health',
      'vaginal dryness',
      'mood',
      'sleep',
      'skin'
    ],
    searchAliases: ['estradiol pellet', 'E2 pellet', 'menopause estrogen pellet'],
    synonyms: ['estradiol subcutaneous implant'],
    aiContent: {
      clinicalBrief: 'Estradiol pellets deliver a steady estrogen supply, mitigating classic menopausal complaints such as hot flashes, night sweats, and loss of bone density while offering convenient dosing.'
    },
    pharmacology: {
      halfLife: '3‑4 months (steady release)',
      receptorTargets: ['estrogen receptor alpha', 'estrogen receptor beta']
    }
  },
  {
    slug: 'gestrinone-pellet',
    name: 'Gestrinone Pellet',
    category: 'Hormone Pellets',
    subcategory: 'Gestrinone',
    dosage: '10mg',
    description: 'Gestrinone subcutaneous pellet – synthetic 19‑nortestosterone derivative used for endometriosis and off‑label hormone therapy.',
    objective: 'Suppress ovarian hormonal drive and reduce endometriotic lesions.',
    goals: [
      'endometriosis symptom control',
      'pelvic pain reduction',
      'menstrual bleeding suppression',
      'hormonal contraception alternative',
      'androgenic symptom management',
      'improved quality of life',
      'reduction of inflammatory markers',
      'maintenance of bone health'
    ],
    secondaryFactors: [
      'chronic pelvic pain',
      'dysmenorrhea',
      'heavy menstrual bleeding',
      'acne',
      'hirsutism',
      'weight gain'
    ],
    mechanisms: [
      'potent antiprogestogenic activity',
      'partial androgen receptor agonism',
      'inhibition of gonadotropin release (LH/FSH)',
      'induction of endometrial atrophy'
    ],
    semanticKeywords: [
      'gestrinone',
      'pellet',
      'endometriosis',
      'antiprogestogen',
      'androgenic',
      'subcutaneous',
      'hormone therapy',
      'pelvic pain',
      'menstrual suppression',
      'inflammation'
    ],
    searchAliases: ['gestrinone pellet', 'gestrinone implant', '19‑nortestosterone pellet'],
    synonyms: ['19‑nortestosterone derivative pellet'],
    aiContent: {
      clinicalBrief: 'Gestrinone pellets provide long‑acting antiprogestogenic and weak androgenic effects, effectively reducing endometriotic lesion activity and associated pelvic pain, while also offering a contraceptive benefit.'
    },
    pharmacology: {
      halfLife: '≈ 3 months (steady release)',
      receptorTargets: ['progesterone receptor (antagonist)', 'androgen receptor (partial agonist)']
    }
  }
];

// ---------------------------------------------------------------
// Helper: simple slug → Firestore doc reference
// ---------------------------------------------------------------
function docRefFromSlug(slug) {
  return db.collection('products').doc(slug);
}

// ---------------------------------------------------------------
// Batch writer – writes in chunks of 200 operations (Firestore limit 500)
// ---------------------------------------------------------------
async function writeInBatches(docs) {
  const BATCH_SIZE = 200; // safe margin
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + BATCH_SIZE);
    for (const { slug, data } of chunk) {
      const ref = docRefFromSlug(slug);
      batch.set(ref, data, { merge: true });
    }
    await batch.commit();
    console.log(`✅  Batch ${Math.floor(i / BATCH_SIZE) + 1} committed (${chunk.length} docs)`);
  }
}

// ---------------------------------------------------------------
// Main – two‑phase approach: (1) basic product fields, (2) enriched fields
// ---------------------------------------------------------------
async function seed() {
  console.log('\n🚀  Starting hormone pellet seeding...');

  // Phase 1 – basic fields required for product UI
  const phase1 = pellets.map(p => ({
    slug: p.slug,
    data: {
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      dosage: p.dosage,
      desc: p.description,
      objective: p.objective,
      // Minimal pricing placeholder (real pricing added later via admin UI)
      pricing: { retail: { perUnit: 0, currency: 'EUR' } },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }));

  await writeInBatches(phase1);
  console.log('🔹  Phase 1 completed – base product docs created.');

  // Phase 2 – add enrichment fields (goals, mechanisms, etc.)
  const phase2 = pellets.map(p => ({
    slug: p.slug,
    data: {
      goals: p.goals,
      secondaryFactors: p.secondaryFactors,
      mechanisms: p.mechanisms,
      semanticKeywords: p.semanticKeywords,
      searchAliases: p.searchAliases,
      synonyms: p.synonyms,
      aiContent: p.aiContent,
      pharmacology: p.pharmacology,
      // also store a searchable concatenated field for simple text search
      searchable: [p.name, p.category, ...p.goals, ...p.semanticKeywords].join(' ').toLowerCase()
    }
  }));

  await writeInBatches(phase2);
  console.log('🔹  Phase 2 completed – enrichment data added.');

  console.log('\n✅  Hormone pellet seeding finished!');
}

seed().catch(err => {
  console.error('❌  Seeding failed:', err);
  process.exit(1);
});
