import { db } from '../scripts/lib/firebase-admin.mjs';

async function run() {
  const snapshot = await db.collection('products').get();
  console.log('Total products:', snapshot.size);
  let found = false;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.name && data.name.toLowerCase().includes('5-amino')) {
      console.log('Product Doc ID:', doc.id);
      console.log('Product Name:', data.name);
      console.log('Product Slug:', data.slug);
      console.log('Product Category:', data.category);
      console.log('Full data:', JSON.stringify(data, null, 2));
      found = true;
    }
  });
  if (!found) {
    console.log('No product found matching 5-amino');
  }
}

run().catch(console.error);
