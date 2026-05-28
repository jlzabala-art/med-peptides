
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase.js';

async function checkBlueprints() {
  console.log('Checking blueprints collection...');
  try {
    const snap = await getDocs(collection(db, 'blueprints'));
    console.log(`Found ${snap.docs.length} documents.`);
    snap.docs.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id} | Slug: ${data.protocol_slug} | Title: ${data.protocol_title}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

checkBlueprints();
