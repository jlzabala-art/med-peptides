const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'med-peptides-app'
});

const db = admin.firestore();

db.collection('products').get()
  .then(snap => { 
    const counts = {};
    snap.forEach(doc => {
      const goals = doc.data().goals || [];
      goals.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
    });
    console.log('Goal Counts:', counts);
    process.exit(0); 
  })
  .catch(e => { console.error('Error:', e); process.exit(1); });
