import { db } from '../scripts/lib/firebase-admin.mjs';

async function checkCache() {
  const snapshot = await db.collection('pubmed_cache').get();
  console.log(`Found ${snapshot.size} cached queries:`);
  for (const doc of snapshot.docs) {
    const data = doc.data();
    console.log(`- Slug: "${data.productSlug}"`);
    console.log(`  Query: "${data.queryUsed}"`);
    console.log(`  Articles Count: ${data.articles?.length || 0}`);
    if (data.articles?.length > 0) {
      console.log(`  First Article: "${data.articles[0].title}"`);
    }
  }
}

checkCache().catch(console.error);
