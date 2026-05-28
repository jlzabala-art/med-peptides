import { db } from './lib/firebase-admin.mjs';

async function findSelank() {
  const query = await db.collection('protocols').get();
  query.docs.forEach((doc) => {
    const data = doc.data();
    const phases = data.phases || [];
    phases.forEach((phase) => {
      const drugs = phase.drugs_used || [];
      drugs.forEach((drug) => {
        if (drug.product_slug === 'selank') {
          console.log(`Doc: ${doc.id} | Dose: ${drug.weekly_dose} | Freq: ${drug.dosing_frequency}`);
        }
      });
    });
  });
}

findSelank().catch(console.error);
