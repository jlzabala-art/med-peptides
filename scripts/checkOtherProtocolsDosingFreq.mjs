import { db } from './lib/firebase-admin.mjs';

async function check() {
  const snap = await db.collection('protocols').limit(5).get();
  snap.docs.forEach((doc) => {
    const data = doc.data();
    const phases = data.phases || [];
    phases.forEach((phase) => {
      const drugs = phase.drugs_used || [];
      drugs.forEach((drug) => {
        if (drug.dosing_frequency || drug.frequency) {
          console.log(`Doc: ${doc.id} | Drug: ${drug.product_slug} | dosing_frequency: ${drug.dosing_frequency} | frequency: ${drug.frequency}`);
        }
      });
    });
  });
}

check().catch(console.error);
