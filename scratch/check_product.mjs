import { db } from '../scripts/lib/firebase-admin.mjs';

async function checkProduct() {
  const snapshot = await db.collection('products').get();
  console.log(`Total products: ${snapshot.size}`);
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.name.toUpperCase().includes('5-AMINO')) {
      console.log(`Matched product:`);
      console.log(`- ID: ${doc.id}`);
      console.log(`- Name: "${data.name}"`);
      console.log(`- Slug: "${data.slug}"`);
    }
  }
}

checkProduct().catch(console.error);
