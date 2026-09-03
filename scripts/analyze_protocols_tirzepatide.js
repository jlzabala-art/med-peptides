import { db } from '../src/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function main() {
  const snap = await getDocs(collection(db, 'protocols'));
  console.log(`Total protocols in DB: ${snap.size}`);
  let count = 0;
  snap.forEach(doc => {
    const data = doc.data();
    const str = JSON.stringify(data).toLowerCase();
    if (str.includes('tirzepatide')) {
      count++;
      console.log(`- Found Tirzepatide in protocol: ${doc.id} / ${data.name || data.title}`);
    }
  });
  console.log(`Total protocols containing Tirzepatide: ${count}`);
  process.exit(0);
}
main().catch(console.error);
