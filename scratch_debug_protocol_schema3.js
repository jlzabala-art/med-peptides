import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const q = await db.collection('protocols').get();
  for (const doc of q.docs) {
    const data = doc.data();
    const allItems = data.phases?.reduce((acc, phase) => [...acc, ...(phase.items || phase.medications || phase.drugs_used || [])], []) || [];
    const hasSelank = allItems.some(i => (i.productName || i.name || i.product_slug || i.product_id || '').toLowerCase().includes('selank'));
    if (hasSelank) {
       console.log("Protocol Name:", data.protocol_name);
       console.log("Phases summary:");
       data.phases?.forEach(p => console.log(` - ${p.label}: duration=${p.duration}, durationWeeks=${p.durationWeeks}, durationInWeeks=${p.durationInWeeks}`));
    }
  }
}
check();
