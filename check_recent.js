import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyB-fake-for-read-only",
  authDomain: "regenpept.firebaseapp.com",
  projectId: "regenpept",
  storageBucket: "regenpept.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const snap = await getDocs(collection(db, 'products'));
  const recent = [];
  const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  snap.forEach(doc => {
    const data = doc.data();
    if (data.createdAt && new Date(data.createdAt) > threshold) {
      recent.push({ id: doc.id, name: data.name, supplier: data.supplier, createdAt: data.createdAt });
    }
  });
  console.log(`Found ${recent.length} recent products`);
  console.log(recent.slice(0, 10));
}

check().catch(console.error);
