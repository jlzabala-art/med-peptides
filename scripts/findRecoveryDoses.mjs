import { db } from './lib/firebase-admin.mjs';

async function findRecovery() {
  const query = await db.collection('protocols').get();
  query.docs.forEach((doc) => {
    const data = doc.data();
    const phases = data.phases || [];
    phases.forEach((phase) => {
      const drugs = phase.drugs_used || [];
      drugs.forEach((drug) => {
        const slug = (drug.product_slug || '').toLowerCase();
        if (slug.includes('bpc') || slug.includes('tb-') || slug.includes('tb500') || slug.includes('ara')) {
          console.log(`Doc: ${doc.id} | Drug: ${drug.product_slug} | Dose: ${drug.weekly_dose} | Freq: ${drug.dosing_frequency}`);
        }
      });
    });
  });
}

findRecovery().catch(console.error);
