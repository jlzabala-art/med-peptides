const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'med-peptides-app'
});

const db = admin.firestore();

db.collection('products').limit(5).get()
  .then(snap => { 
    snap.forEach(doc => {
      console.log(doc.id, '-> goals:', doc.data().goals);
    });
    process.exit(0); 
  })
  .catch(e => { console.error('Error:', e); process.exit(1); });
