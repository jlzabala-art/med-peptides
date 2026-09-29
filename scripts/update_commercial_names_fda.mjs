import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});
const app = initializeApp({ credential });
const db = getFirestore(app);

const COMMERCIAL_FDA_DATA = {
  'tirzepatide': {
    commercialNames: ['Mounjaro®', 'Zepbound®'],
    commercialProducts: [
      {
        brandName: 'Mounjaro®',
        sponsor: 'Eli Lilly and Company',
        fdaApprovalYear: '2022',
        primaryIndication: 'Type 2 Diabetes Mellitus',
        route: 'Subcutaneous injection (weekly)',
        dosageForms: 'Single-dose pen (2.5 mg to 15 mg)'
      },
      {
        brandName: 'Zepbound®',
        sponsor: 'Eli Lilly and Company',
        fdaApprovalYear: '2023',
        primaryIndication: 'Chronic Weight Management (Obesity / Overweight)',
        route: 'Subcutaneous injection (weekly)',
        dosageForms: 'Single-dose pen (2.5 mg to 15 mg)'
      }
    ],
    fdaApprovalStatus: 'FDA Approved (NDA)',
    isFdaApproved: true
  },
  'semaglutide': {
    commercialNames: ['Ozempic®', 'Wegovy®', 'Rybelsus®'],
    commercialProducts: [
      {
        brandName: 'Ozempic®',
        sponsor: 'Novo Nordisk',
        fdaApprovalYear: '2017',
        primaryIndication: 'Type 2 Diabetes Mellitus & Major Adverse CV Risk Reduction',
        route: 'Subcutaneous injection (weekly)',
        dosageForms: 'Prefilled multi-dose pen (0.5 mg, 1 mg, 2 mg)'
      },
      {
        brandName: 'Wegovy®',
        sponsor: 'Novo Nordisk',
        fdaApprovalYear: '2021',
        primaryIndication: 'Chronic Weight Management & MACE Risk Reduction in Overweight/Obese with CVD',
        route: 'Subcutaneous injection (weekly)',
        dosageForms: 'Single-dose pen (0.25 mg to 2.4 mg)'
      },
      {
        brandName: 'Rybelsus®',
        sponsor: 'Novo Nordisk',
        fdaApprovalYear: '2019',
        primaryIndication: 'Type 2 Diabetes Mellitus (Oral GLP-1 Analogue)',
        route: 'Oral (daily)',
        dosageForms: 'Oral tablets (3 mg, 7 mg, 14 mg)'
      }
    ],
    fdaApprovalStatus: 'FDA Approved (NDA)',
    isFdaApproved: true
  },
  'tesamorelin': {
    commercialNames: ['Egrifta®', 'Egrifta SV®'],
    commercialProducts: [
      {
        brandName: 'Egrifta®',
        sponsor: 'Theratechnologies Inc.',
        fdaApprovalYear: '2010',
        primaryIndication: 'Reduction of Excess Visceral Abdominal Fat in HIV-associated Lipodystrophy',
        route: 'Subcutaneous injection (daily)',
        dosageForms: 'Lyophilized vial (1 mg / 2 mg)'
      },
      {
        brandName: 'Egrifta SV®',
        sponsor: 'Theratechnologies Inc.',
        fdaApprovalYear: '2018',
        primaryIndication: 'Concentrated Small-Volume Formulation for Lipodystrophy',
        route: 'Subcutaneous injection (daily)',
        dosageForms: 'Lyophilized vial (2 mg/vial, reconstituted at higher concentration)'
      }
    ],
    fdaApprovalStatus: 'FDA Approved (NDA)',
    isFdaApproved: true
  },
  'pt-141': {
    commercialNames: ['Vyleesi®'],
    commercialProducts: [
      {
        brandName: 'Vyleesi®',
        sponsor: 'Palatin Technologies / AMAG Pharmaceuticals',
        fdaApprovalYear: '2019',
        primaryIndication: 'Hypoactive Sexual Desire Disorder (HSDD) in Premenopausal Women',
        route: 'Subcutaneous auto-injector (as needed, 45 min before anticipated activity)',
        dosageForms: 'Pre-filled autoinjector (1.75 mg / 0.3 mL)'
      }
    ],
    fdaApprovalStatus: 'FDA Approved (NDA)',
    isFdaApproved: true
  },
  'sermorelin': {
    commercialNames: ['Geref®'],
    commercialProducts: [
      {
        brandName: 'Geref®',
        sponsor: 'EMD Serono / Merck KGaA',
        fdaApprovalYear: '1997',
        primaryIndication: 'Diagnostic Assessment of Pituitary Function & Pediatric GH Secretagogue',
        route: 'Subcutaneous injection (daily / nocturnal)',
        dosageForms: 'Lyophilized vial (0.5 mg, 1 mg)'
      }
    ],
    fdaApprovalStatus: 'FDA Approved (NDA)',
    isFdaApproved: true
  },
  'oxytocin': {
    commercialNames: ['Pitocin®', 'Syntocinon®'],
    commercialProducts: [
      {
        brandName: 'Pitocin®',
        sponsor: 'Par Pharmaceutical / Pfizer',
        fdaApprovalYear: '1980 (USP Reference)',
        primaryIndication: 'Induction / Stimulation of Labor & Postpartum Hemorrhage Control',
        route: 'Intravenous infusion / Intramuscular',
        dosageForms: 'Solution for injection (10 USP units/mL)'
      },
      {
        brandName: 'Syntocinon®',
        sponsor: 'Novartis / Mylan',
        fdaApprovalYear: '1960 (USP Reference)',
        primaryIndication: 'Uterine Contraction Stimulation & Lactation Facilitation',
        route: 'Intravenous / Intramuscular / Nasal spray',
        dosageForms: 'Injectable solution & Nasal spray (40 IU/mL)'
      }
    ],
    fdaApprovalStatus: 'FDA Approved (USP Reference)',
    isFdaApproved: true
  }
};

async function updateCommercialNamesInFirestore() {
  console.log('Updating commercialNames & commercialProducts in Firestore...');

  for (const [docId, updateData] of Object.entries(COMMERCIAL_FDA_DATA)) {
    const docRef = db.collection('products').doc(docId);
    const snap = await docRef.get();
    if (!snap.exists) {
      console.warn(`⚠️ Doc ${docId} does not exist in products! Skipping.`);
      continue;
    }

    const payload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await docRef.set(payload, { merge: true });
    console.log(`✅ Successfully updated "${docId}": commercialNames=${JSON.stringify(payload.commercialNames)}`);
  }

  console.log('🎉 All FDA-approved commercial names written to Firestore successfully!');
}

updateCommercialNamesInFirestore().then(() => process.exit(0)).catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
