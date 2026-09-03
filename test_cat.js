import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit, where } from 'firebase/firestore';

const firebaseConfig = { projectId: 'atlas-health-42' };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const q = query(collection(db, 'products'), where('canonicalName', '==', '24 Genomics Nutrigen Test'), limit(1));
  const snap = await getDocs(q);
  snap.forEach(doc => console.log('Category is:', doc.data().category));
  process.exit(0);
}
check();
