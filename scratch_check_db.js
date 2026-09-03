import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const pSnap = await db.collection('products').limit(5).get();
  for (const doc of pSnap.docs) {
    const vSnap = await doc.ref.collection('variants').get();
    console.log(`Product: ${doc.data().name} - CanonicalId: ${doc.id}`);
    console.log(`Variants: ${vSnap.size}`);
    if (vSnap.size > 0) {
      console.log(vSnap.docs.map(v => v.data().name + ' - ' + v.data().dosage));
    }
  }
}
check().catch(console.error);
