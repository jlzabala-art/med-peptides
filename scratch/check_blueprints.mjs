
import { db } from '../scripts/lib/firebase-admin.mjs';

async function checkCollections() {
  const collections = ['blueprints', 'protocols'];
  for (const colName of collections) {
    console.log(`\nChecking ${colName} collection...`);
    try {
      const snap = await db.collection(colName).get();
      console.log(`Found ${snap.docs.length} documents.`);
      snap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id.padEnd(10)} | Slug: ${String(data.protocol_slug || data.slug || '').padEnd(35)} | Title: ${data.protocol_title || data.title || data.protocol_name || data.name}`);
      });
    } catch (err) {
      console.error(`Error in ${colName}:`, err);
    }
  }
}

checkCollections();
