import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function main() {
  console.log("Starting decommissioning of 'supplements' collection...");
  try {
    const snapshot = await db.collection('supplements').get();
    console.log(`Found ${snapshot.size} documents in 'supplements' collection.`);
    
    if (snapshot.size > 0) {
      console.log(`Deleting ${snapshot.size} documents...`);
      await deleteCollection(db, 'supplements', 500);
      console.log("'supplements' collection successfully decommissioned.");
    } else {
      console.log("'supplements' collection is already empty.");
    }
  } catch (error) {
    console.error("Error decommissioning collection:", error);
  } finally {
    process.exit(0);
  }
}

main();
