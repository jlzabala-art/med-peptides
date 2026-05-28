import { db } from '../scripts/lib/firebase-admin.mjs';

async function check() {
  try {
    const collections = await db.listCollections();
    console.log('Collections:', collections.map(c => c.id));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

check();
