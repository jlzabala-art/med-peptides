import { db } from './lib/firebase-admin.mjs';

async function findImmune() {
  const query = await db.collection('protocols').get();
  query.docs.forEach((doc) => {
    const data = doc.data();
    const phases = data.phases || [];
    phases.forEach((phase) => {
      const drugs = phase.drugs_used || [];
      drugs.forEach((drug) => {
        const slug = (drug.product_slug || '').toLowerCase();
        if (slug.includes('kpv') || slug.includes('thym') || slug.includes('ta1') || slug.includes('ta-1')) {
          console.log(`Doc: ${doc.id} | Drug: ${drug.product_slug} | Dose: ${drug.weekly_dose} | Freq: ${drug.dosing_frequency}`);
        }
      });
    });
  });
}

findImmune().catch(console.error);
