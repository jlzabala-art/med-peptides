import { db } from '../src/firebase.js';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

async function main() {
  const q = query(collection(db, 'protocols'), orderBy('name', 'asc'), limit(100));
  const snap = await getDocs(q);
  
  let count = 0;
  snap.forEach(doc => {
    const data = doc.data();
    const str = JSON.stringify(data).toLowerCase();
    if (str.includes('tirzepatide')) {
      count++;
      console.log(`- Found Tirzepatide in first 100: ${doc.id} / ${data.name}`);
    }
  });
  console.log(`Total in first 100: ${count}`);
  
  // also check how many are active
  let activeCount = 0;
  snap.forEach(doc => {
    const data = doc.data();
    if (data.status === 'active' || data.isActive) activeCount++;
  });
  console.log(`Total active in first 100: ${activeCount}`);
  
  process.exit(0);
}
main().catch(console.error);
