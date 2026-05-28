import { db } from '../scripts/lib/firebase-admin.mjs';

async function main() {
  const docs = ['5-AMINO_1_MQ-2mg-vial', '5-AMINO_1_MQ-50mg-tablet'];
  for (const id of docs) {
    const docRef = db.collection('products').doc(id);
    const snap = await docRef.get();
    if (snap.exists) {
      console.log(`=== ${id} ===`);
      const data = snap.data();
      console.log('name:', data.name);
      console.log('form:', data.form);
      console.log('administration_route:', data.administration_route);
      console.log('dosage:', data.dosage);
      console.log('strength:', data.strength);
    } else {
      console.log(`=== ${id} NOT FOUND ===`);
    }
  }
}

main().catch(console.error);
