import { db } from '../scripts/lib/firebase-admin.mjs';

async function main() {
  const snap = await db.collection('supplements').limit(5).get();
  console.log(`Found ${snap.size} supplements`);
  for (const doc of snap.docs) {
    console.log(`=== ${doc.id} ===`);
    const data = doc.data();
    console.log('name:', data.name);
    console.log('dosage:', data.dosage);
    console.log('quantity:', data.quantity);
    console.log('status:', data.status);
    console.log('goals:', data.goals);
    
    // Check if there is a variants subcollection
    const variantsSnap = await doc.ref.collection('variants').get();
    console.log(`variants count: ${variantsSnap.size}`);
    for (const vDoc of variantsSnap.docs) {
      const vData = vDoc.data();
      console.log(`  - Variant: ${vDoc.id} | dosage: ${vData.dosage} | quantity: ${vData.quantity}`);
    }
  }
}

main().catch(console.error);
