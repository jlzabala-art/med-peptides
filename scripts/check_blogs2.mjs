import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
initializeApp({ projectId: 'med-peptides-app' });
const db = getFirestore();
async function check() {
  const q = await db.collection('blogPosts').limit(1).get();
  console.log(q.docs[0].data());
  process.exit(0);
}
check();
