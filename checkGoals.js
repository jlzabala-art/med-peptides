import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (e) {
  console.log("No serviceAccountKey.json found");
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function checkGoals() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  
  const allGoals = new Set();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.goals && Array.isArray(data.goals)) {
      data.goals.forEach(g => allGoals.add(g));
    }
    if (data.category) allGoals.add(`category: ${data.category}`);
  });

  console.log("Unique goals found in Firestore:");
  console.log(Array.from(allGoals));
}

checkGoals().catch(console.error);
