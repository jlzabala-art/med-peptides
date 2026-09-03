import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

if (!initializeApp.apps?.length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

const db = getFirestore();

async function run() {
  const querySnapshot = await db.collection('protocols')
    .where('protocol_name', '==', 'BPC-157 & TB-500 Ultimate Tissue Recovery')
    .limit(1)
    .get();

  if (querySnapshot.empty) {
    console.log("No protocol found to update.");
    return;
  }

  const doc = querySnapshot.docs[0];

  const dosageData = {
    weekly_doses: "7x BPC-157, 2x TB-500",
    dosage_schedule: [
      {
        "peptide": "BPC-157",
        "dosage": "250 - 500 mcg",
        "frequency": "1 to 2 times daily",
        "route": "Subcutaneous (SC)",
        "timing": "Morning and/or evening",
        "notes": "Inject near the site of injury for enhanced localized healing, or into abdominal fat for systemic recovery. Do not exceed 1000 mcg per day."
      },
      {
        "peptide": "TB-500",
        "dosage": "2.0 - 2.5 mg",
        "frequency": "Twice weekly (Loading Phase)",
        "route": "Subcutaneous (SC)",
        "timing": "Evenly spaced days (e.g., Monday & Thursday)",
        "notes": "Systemic action; injection site location is less critical. Loading phase lasts 4-6 weeks, followed by a maintenance dose of 2.0 mg once a month."
      }
    ],
    monitoring_cadence: "Bi-weekly assessments during the first 6 weeks, transitioning to monthly.",
    check_in_weeks: [2, 4, 6, 8, 12],
    monitoring_guidelines: [
      {
        "week": 2,
        "focus": "Assess initial tolerance, check for injection site reactions (erythema, pruritus), and monitor early pain reduction."
      },
      {
        "week": 4,
        "focus": "Evaluate improvement in range of motion (ROM), reduction in localized inflammation, and patient-reported functional outcomes."
      },
      {
        "week": 6,
        "focus": "End of acute loading phase for TB-500. Conduct functional physical therapy assessment and determine need for TB-500 maintenance."
      },
      {
        "week": 12,
        "focus": "Comprehensive end-of-protocol review. Evaluate overall tissue healing, strength restoration, and perform follow-up imaging (MRI/Ultrasound) if clinically indicated to document tissue remodeling."
      }
    ]
  };

  await doc.ref.update(dosageData);
  console.log(`Successfully updated protocol ${doc.id} with Dosage and Monitoring info.`);
}

run().catch(console.error);
