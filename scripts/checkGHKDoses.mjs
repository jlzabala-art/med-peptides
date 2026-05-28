import { db } from './lib/firebase-admin.mjs';

async function checkGHK() {
  const query = await db.collection('protocols').get();
  query.docs.forEach((doc) => {
    const data = doc.data();
    const phases = data.phases || [];
    phases.forEach((phase) => {
      const drugs = phase.drugs_used || [];
      drugs.forEach((drug) => {
        if (drug.product_slug && (drug.product_slug.includes('ghk') || drug.product_slug.includes('bpc'))) {
          if (drug.weekly_dose && !drug.weekly_dose.includes('TODO')) {
            console.log(`Doc: ${doc.id} | Drug: ${drug.product_slug} | Dose: ${drug.weekly_dose} | Freq: ${drug.dosing_frequency}`);
          }
        }
      });
    });
  });
}

checkGHK().catch(console.error);
