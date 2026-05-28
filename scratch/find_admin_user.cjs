const { initializeApp } = require('../functions/node_modules/firebase-admin/app');
const { getFirestore } = require('../functions/node_modules/firebase-admin/firestore');

initializeApp({
  projectId: 'med-peptides-app'
});

const db = getFirestore();

async function run() {
  try {
    const snap = await db.collection('users').get();
    console.log(`Total users: ${snap.size}`);
    snap.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}, Name: ${data.firstName} ${data.lastName}, Email: ${data.email}, Role: ${data.role}, Approved: ${data.approved}`);
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
