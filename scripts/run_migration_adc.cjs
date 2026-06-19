const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'med-peptides-app'
});

const db = admin.firestore();

// (run a test query)
db.collection('products').limit(1).get()
  .then(snap => { console.log('Docs:', snap.size); process.exit(0); })
  .catch(e => { console.error('Error:', e); process.exit(1); });
