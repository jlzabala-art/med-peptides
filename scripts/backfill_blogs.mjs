import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
initializeApp({ projectId: 'med-peptides-app' });
const db = getFirestore();

async function backfill() {
  const snapshot = await db.collection('blogPosts').get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    let updates = {};
    if (!data.createdAt) {
      if (data.publishDate) {
        updates.createdAt = Timestamp.fromDate(new Date(data.publishDate));
      } else {
        updates.createdAt = Timestamp.now();
      }
    }
    if (!data.publishToBlog) updates.publishToBlog = data.status === 'published';
    if (data.publishToLinkedIn === undefined) updates.publishToLinkedIn = !!data.linkedInShared;
    
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
    }
  });
  await batch.commit();
  console.log('Backfilled', snapshot.size, 'blog posts with createdAt and publish settings');
  process.exit(0);
}
backfill();
