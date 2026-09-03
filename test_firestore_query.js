const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, limit, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  projectId: "med-peptides" // adjust if needed
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const q1 = query(collection(db, 'prescriptions'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'), limit(50));
    await getDocs(q1);
    console.log("Q1 success");
  } catch(e) {
    console.log("Q1 failed:", e.message);
  }
}
test();
