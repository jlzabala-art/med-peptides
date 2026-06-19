const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'med-peptides-app'
});

const db = admin.firestore();

db.collection('products').where('goals', 'array-contains', 'weight_loss_glp1').get()
  .then(snap => { 
    console.log('Count:', snap.size);
    process.exit(0); 
  })
  .catch(e => { console.error('Error:', e); process.exit(1); });
