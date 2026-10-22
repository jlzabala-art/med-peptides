import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import crypto from 'crypto';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
if (rawPk.startsWith('"') && rawPk.endsWith('"')) {
  rawPk = rawPk.slice(1, -1);
}
const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'med-peptides-app';

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId
  });
}

const db = getFirestore();

async function run() {
  console.log('🔄 1. Generating 24-Hour WhatsApp Magic Link for Dr. Atlas...');

  const doctorId = 'dr-atlas-health-services';
  const doctorCode = 'DR-ATLAS01';
  const doctorSlug = 'atlas-health-services';
  const doctorName = 'Atlas Health Services';
  const phone = '+40 765 276 340'; // Contact linked with this patient / practice

  // Generate 24-hour token
  const magicToken = `mag_${crypto.randomBytes(20).toString('hex')}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const tokenDoc = {
    token: magicToken,
    doctorSlug: doctorSlug,
    alternateSlugs: [doctorSlug, doctorCode, doctorId, 'dr-atlas', 'atlas'],
    opaqueCode: doctorCode,
    doctorName: doctorName,
    phone: phone,
    email: 'clinical@atlashealth-services.com',
    rememberDevice: true,
    used: false,
    durationHours: 24,
    createdAt: now.toISOString(),
    expiresAt: expiresAt
  };

  await db.collection('doctor_magic_tokens').doc(magicToken).set(tokenDoc);
  console.log('✅ Magic token saved to doctor_magic_tokens with 24h validity.');

  const magicLink = `https://www.atlashealth-services.com/dr/${doctorCode}?magic_token=${magicToken}`;
  const magicLinkSlug = `https://www.atlashealth-services.com/dr/${doctorSlug}?magic_token=${magicToken}`;

  // 2. Update Patient Razvan Raducan for Fertility
  console.log('\n🔄 2. Updating Patient Razvan Raducan profile for Male Fertility...');
  await db.collection('patients').doc('pat-razvan-raducan').update({
    clinicalGoal: 'Male Fertility, Spermatogenesis & Endocrine Optimization',
    primaryIndication: 'Male Fertility & Metabolic Axis Priming',
    therapeuticFocus: 'Fertility Enhancement & Visceral Aromatase Reduction',
    clinicalNotes: 'Primary therapeutic objective is male fertility and spermatogenesis enhancement. Using Retatrutide for visceral adipose & aromatase reduction, combined with targeted gonadotropic axis support (Kisspeptin-10 / MOTS-c / Bloodo endocrine profiling).',
    updatedAt: new Date().toISOString()
  });
  console.log('✅ Patient Razvan Raducan clinical goal set to Fertility.');

  // 3. Update Prescription RX-70101 with explicit Fertility Recommendations
  console.log('\n🔄 3. Updating Prescription RX-70101 with Fertility Recommendations...');
  const fertilityRecommendations = {
    clinicalGoal: 'Male Fertility & Spermatogenesis Optimization',
    peptide: {
      id: 'kisspeptin-10',
      name: 'Kisspeptin-10 (2 mg / 5 mg Vial)',
      slug: 'kisspeptin-10',
      category: 'Bioactive Peptide / HPTA Gonadotropic Priming',
      brand: 'Lotusland Research',
      posology: '100 mcg to 200 mcg subcutaneous injection 2–3x weekly prior to bedtime',
      clinicalRationale: 'Direct Kiss1R agonist stimulating physiological pulsatile GnRH, LH, and FSH secretion. Promotes endogenous intratesticular testosterone and spermatogenesis without negative-feedback HPTA shutdown.',
      catalogUrl: '/p/kisspeptin-10'
    },
    mitochondrialPeptide: {
      id: 'mots-c',
      name: 'MOTS-c (10 mg Lyophilized Vial)',
      slug: 'mots-c',
      category: 'Mitochondrial Bioregulator',
      brand: 'Lotusland Research',
      posology: '5 mg subcutaneous injection 2x weekly for 4–6 weeks',
      clinicalRationale: 'Mitochondrial-derived peptide stimulating flagellar ATP phosphorylation and motility in mature spermatozoa while enhancing insulin sensitivity.',
      catalogUrl: '/p/mots-c'
    },
    diagnostic: {
      id: 'testosterone-test',
      name: 'Bloodo™ Testosterone+ & Endocrine Panel (DBS)',
      slug: 'testosterone-test',
      category: 'Capillary Dried Blood Spot (DBS) Micro-Sampling',
      brand: 'Bloodo Diagnostic',
      clinicalRationale: 'Essential baseline measuring Total Testosterone, Calculated Free Testosterone, SHBG, LH, FSH, and Estradiol to monitor the T/E2 ratio and confirm active spermatogenic signaling.',
      catalogUrl: '/p/testosterone-test'
    },
    nutraceutical: {
      id: 'ubiquinol-zinc-complex',
      name: 'UltraPerson™ CoQ10 Ubiquinol + Zinc Bisglycinate Complex',
      slug: 'ubiquinol-zinc',
      category: 'Clinical Antioxidant & Sperm Chromatin Shield',
      brand: 'UltraPerson by PharmaPolis',
      posology: '2 capsules daily with breakfast',
      clinicalRationale: 'Potent lipophilic antioxidant neutralizing reactive oxygen species (ROS) in seminal fluid, protecting sperm DNA fragmentation and membrane lipid peroxidation.'
    }
  };

  await db.collection('prescriptions').doc('RX-70101').update({
    clinicalGoal: 'Metabolic Weight Management & Male Fertility Optimization',
    patientNotes: 'Weight Management & Male Fertility Optimization. Patient presents with excess visceral adiposity and is actively seeking male fertility enhancement. Retatrutide powerfully targets GLP-1, GIP, and Glucagon receptors to reduce visceral adipose mass, directly downregulating peripheral aromatase activity (preventing excess conversion of testosterone to estradiol and normalizing the T/E2 ratio). In parallel, targeted gonadotropic support (Kisspeptin-10) and mitochondrial support (MOTS-c) preserve and enhance spermatogenesis, ensuring that caloric deficit does not compromise sperm motility or count.',
    atlasRecommendations: fertilityRecommendations,
    parts: [
      {
        partNumber: 1,
        totalParts: 2,
        title: 'Retatrutide 10mg Lyophilized Vial',
        format: 'Sterile Lyophilized Vial',
        volume: '10 mg',
        vehicle: 'Type I Borosilicate Glass Sterile Vial (USP/Ph. Eur.)',
        route: 'Subcutaneous Injection (SubQ)',
        badge: 'PREPARATION 1 OF 2 · SUBCUTANEOUS INJECTION (SUBQ)',
        directions: 'Administer subcutaneous injection once weekly (titration 2mg to 4mg).',
        posology: 'Administer subcutaneous injection once weekly (titration 2mg to 4mg).',
        apis: [
          {
            name: 'Retatrutide',
            dose: '10 mg',
            dosage: '10 mg',
            role: 'Triple GIP / GLP-1 / Glucagon Receptor Agonist',
            cellularTarget: 'GLP-1R / GIPR / GCGR Incretin & Glucagon Receptors',
            indication: 'Visceral Adiposity, Metabolic Synergy & Weight Optimization',
            tag: 'Metabolic Weight & Aromatase Reduction'
          }
        ]
      },
      {
        partNumber: 2,
        totalParts: 2,
        title: 'Bacteriostatic Water 3ml Diluent',
        format: 'Sterile Diluent Vehicle',
        volume: '3 mL',
        vehicle: 'Sterile Bacteriostatic Water (0.9% Benzyl Alcohol USP)',
        route: 'Sterile Reconstitution Vehicle',
        badge: 'PREPARATION 2 OF 2 · STERILE DILUENT VEHICLE',
        directions: 'Inject 2.0 mL - 3.0 mL slowly down the inside glass wall of the Retatrutide vial. Swirl gently until dissolved; do not shake.',
        posology: 'Inject 2.0 mL - 3.0 mL slowly down the inside glass wall of the Retatrutide vial. Swirl gently until dissolved; do not shake.',
        apis: [
          {
            name: 'Bacteriostatic Water (0.9% Benzyl Alcohol)',
            dose: '3 mL',
            dosage: '3 mL',
            role: 'Sterile Reconstitution Diluent',
            cellularTarget: 'Parenteral Peptide Solvent',
            indication: 'Peptide Reconstitution & Aseptic Multidose Preservation',
            tag: 'USP Diluent Vehicle'
          }
        ]
      }
    ],
    updatedAt: new Date().toISOString()
  });
  console.log('✅ Prescription RX-70101 updated with correct SubQ route, sterile vial specs, and tailored Weight + Fertility recommendations.');

  console.log('\n======================================================');
  console.log('WHATSAPP 24-HOUR MAGIC LINK FOR DR. ATLAS:');
  console.log('======================================================');
  console.log(magicLink);
  console.log('Alternative Slug URL:');
  console.log(magicLinkSlug);
  console.log('Token expires at:', expiresAt);
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
