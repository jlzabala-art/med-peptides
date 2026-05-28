
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';

// Load env from .env.local if exists
try {
  const env = readFileSync('.env.local', 'utf8');
  env.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
} catch (e) {}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProtocol(id) {
  console.log(`Checking protocol: ${id}`);
  const docRef = doc(db, 'protocols', id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log('Protocol found!');
    console.log(JSON.stringify(snap.data(), null, 2));
  } else {
    console.log('Protocol NOT found in collection "protocols"');
    
    // Check if it's in another collection or maybe check all docs
    const querySnapshot = await getDocs(collection(db, 'protocols'));
    console.log(`Total documents in "protocols": ${querySnapshot.size}`);
    querySnapshot.forEach((doc) => {
      console.log(`- ${doc.id}: ${doc.data().protocol_title || doc.data().name}`);
    });
  }
}

const slug = process.argv[2] || 'wm_001';
checkProtocol(slug).then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
