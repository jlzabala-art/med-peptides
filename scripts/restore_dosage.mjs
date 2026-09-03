import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/joseluiszabala/regenpept-web.nosync/.env.local' });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const restores = [
  { p: 'bpc-157-tb-500', v: 'IqvLf8lr0XytTK6EproS', dose: '5 mg + 5 mg' },
  { p: 'bpc-157-tb-500', v: 'jvzwsl8H7kRUCXOTkTGa', dose: '10 mg + 10 mg' },
  { p: 'cjc-1295-without-dac-ipamorelin', v: 'IYcn5l7foezE1kPEuC9U', dose: '5 mg + 5 mg' },
  { p: 'glow-bpc-157-tb-500-ghk', v: '8KdwYW6nrsgdVxLganBR', dose: '10 mg + 10 mg + 75 mg' },
  { p: 'klow-bpc-157-tb-500-ghkcu-kpv', v: '5WwkhvpkRE2fIGs2mGjI', dose: '10 mg + 10 mg + 75 mg + 10 mg' },
  { p: 'thymosin-alpha-1-thymalin', v: 'tJXkSVTTpjolpro0Gr5m', dose: '10 mg + 10 mg' }
];

async function run() {
  for (const r of restores) {
    const ref = db.collection('products').doc(r.p).collection('variants').doc(r.v);
    const doc = await ref.get();
    if (doc.exists) {
      const data = doc.data();
      const updateData = {};
      if (data.dosage) updateData.dosage = r.dose;
      if (data.dose) updateData.dose = r.dose;
      await ref.update(updateData);
      console.log(`Restored ${r.p} / ${r.v} to ${r.dose}`);
    }
  }
}
run().catch(console.error);
