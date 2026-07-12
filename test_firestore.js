import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs, limit, query } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "regenpept-1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "regenpept-1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "regenpept-1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "338988675955",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:338988675955:web:5debc308a3f87d46c82305"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const protocolsSnap = await getDocs(query(collection(db, 'protocols'), limit(5)));
  for (const p of protocolsSnap.docs) {
    const data = p.data();
    console.log(`Protocol ${p.id}: ${data.protocol_name}`);
    console.log(` - inline phases count:`, data.phases?.length);
    const phasesSnap = await getDocs(collection(db, 'protocols', p.id, 'phases'));
    console.log(` - subcollection phases count:`, phasesSnap.size);
  }
}

test().catch(console.error);
