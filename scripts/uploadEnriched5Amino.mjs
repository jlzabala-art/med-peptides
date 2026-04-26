/**
 * uploadEnriched5Amino.mjs
 * Uploads the fully enriched 5-AMINO 1 MQ product to Firestore,
 * including the variants subcollection with 4-tier pricing.
 *
 * Usage: node scripts/uploadEnriched5Amino.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp }       from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db  = getFirestore();
const now = Timestamp.now();

// ── Enriched root document ────────────────────────────────────────────────────
const PRODUCT_ID = '5-AMINO_1_MQ-50mg-tablet';

const rootDoc = {
  name:            '5-AMINO 1 MQ',
  displayName:     '5-AMINO 1 MQ',
  scientificName:  '5-amino-1-methylquinolinium',
  cas:             '2250005-77-3',
  category:        'Weight Management & Metabolic',
  status:          'active',
  isBlend:         false,
  blendComponents: [],

  description: 'A selective small-molecule inhibitor of nicotinamide N-methyltransferase (NNMT), an enzyme overexpressed in adipose tissue that diverts S-adenosylmethionine (SAM) from methyl cycle metabolism. NNMT inhibition elevates intracellular NAD+ and activates SIRT1/SIRT3 epigenetic regulation.',

  objective: 'Metabolic optimization, adipose tissue regulation, cellular energy enhancement',

  mechanisms: [
    'Selective competitive inhibition of nicotinamide N-methyltransferase (NNMT) enzyme activity',
    'Restoration of intracellular NAD+ pools via methyl cycle redirection',
    'Indirect SIRT1 and SIRT3 deacetylase activation through NAD+ substrate availability',
    'Downregulation of adipogenesis transcription factors in white adipose tissue',
  ],

  pharmacokinetics: {
    half_life:              '4–6 hours (pre-clinical murine model)',
    bioavailability:        '~30–40% oral (tablet form, estimated)',
    route_of_administration: ['oral'],
    tmax:                   '~1.5 hours',
    protein_binding:        'Not established',
    metabolism:             'Hepatic; CYP450 involvement not fully characterized',
    excretion:              'Renal (primary), fecal (secondary)',
  },

  molecular_weight:   174.20,
  molecular_formula:  'C10H10N2',

  storage_conditions: {
    temperature: '-20°C',
    humidity:    '< 40% RH',
    light:       'Protect from UV light',
    container:   'Sealed amber vial or opaque HDPE bottle',
    shelf_life:  '24 months from manufacturing date',
    reconstitution: 'Not applicable (tablet form)',
  },

  research_status: 'Pre-clinical Research',

  safetyNote: 'For in vitro or animal research only. Not approved for human use. Handle with appropriate PPE. Potential mutagenic or teratogenic effects not fully evaluated. Dispose per institutional biohazard protocols.',

  contraindications: [
    'Concurrent high-dose niacin supplementation — may reduce inhibitory efficacy',
    'Co-administration with PARP inhibitors — potential NAD+ pathway interference',
    'Hepatic impairment — risk of incomplete metabolic clearance',
    'Pregnancy or lactation — no safety data available',
  ],

  goals:    ['cellular_energy', 'metabolism', 'fat_loss', 'epigenetic_regulation'],
  tags:     ['Metabolism', 'Form: Tablets', 'NNMT Inhibitor', 'NAD+ Modulator', 'Epigenetics'],
  synonyms: ['5-amino-1-methylquinolinium', '5-amino 1mq', '5A1MQ'],

  reference_pmids: ['32350176', '33823046', '30007368'],

  _variantsMigrated: true,
  _schemaVersion:    '3.0',
  _enrichedAt:       now,
  _migratedAt:       now,
};

// ── Variant document ──────────────────────────────────────────────────────────
const variantDoc = {
  label:     '50mg tablet',
  size:      '50mg',
  form:      'tablet',
  isDefault: true,
  stock:     { available: true, quantity: null },
  pricing: {
    retail:    { perUnit: 69.00,  kit: null },
    clinic:    { perUnit: 58.65,  kit: null },
    wholesale: { perUnit: 52.79,  kit: null },
    master:    { perUnit: 49.85,  kit: null },
  },
  legacy: {
    guestVialPrice: 69.00,
    proVialPrice:   null,
    guestKitPrice:  null,
    proKitPrice:    null,
  },
  migratedAt: now,
};

// ── Upload ────────────────────────────────────────────────────────────────────
async function main() {
  const ref = db.collection('products').doc(PRODUCT_ID);

  console.log(`\n📤 Uploading enriched product: ${PRODUCT_ID}\n`);

  // Write root document
  await ref.set(rootDoc, { merge: true });
  console.log('  ✅ Root document updated');

  // Write variant subcollection
  await ref.collection('variants').doc('default').set(variantDoc);
  console.log('  ✅ Variant "default" written (4-tier pricing)');

  // Verify
  const snap = await ref.collection('variants').get();
  console.log(`  ✅ Variants in subcollection: ${snap.size}`);
  snap.forEach(d => {
    const p = d.data().pricing;
    console.log(`     └─ "${d.data().label}" | retail: $${p.retail.perUnit} | clinic: $${p.clinic.perUnit} | wholesale: $${p.wholesale.perUnit} | master: $${p.master.perUnit}`);
  });

  console.log('\n🎉 Done. Verify in Firebase Console → products → 5-AMINO_1_MQ-50mg-tablet\n');
}

main().catch(e => { console.error(e); process.exit(1); });
