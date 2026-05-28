import { db } from './lib/firebase-admin.mjs';

async function listAll() {
  const query = await db.collection('protocols').get();
  console.log(`Total protocols in Firestore: ${query.size}\n`);
  
  const list = [];
  query.docs.forEach((doc) => {
    const data = doc.data();
    list.push({
      docId: doc.id,
      title: data.protocol_title || data.title || 'Untitled',
      protocol_id: data.protocol_id || 'N/A',
      protocol_slug: data.protocol_slug || 'N/A'
    });
  });

  // Sort by docId
  list.sort((a, b) => a.docId.localeCompare(b.docId));

  list.forEach((item) => {
    console.log(`Doc ID: ${item.docId.padEnd(45)} | Title: ${item.title.padEnd(55)} | protocol_id: ${item.protocol_id.padEnd(10)} | protocol_slug: ${item.protocol_slug}`);
  });
}

listAll().catch(console.error);
