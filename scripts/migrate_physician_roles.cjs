const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

let serviceAccount;
try {
  if (fs.existsSync('./serviceAccountKey.json')) {
    serviceAccount = require('../serviceAccountKey.json');
  } else if (fs.existsSync('./serviceAccount-target.json')) {
    serviceAccount = require('../serviceAccount-target.json');
  } else {
    // try one level up
    serviceAccount = require('../serviceAccountKey.json');
  }
} catch (e) {
  console.log("Using default credentials");
}

if (!getApps().length) {
  initializeApp(serviceAccount ? { credential: cert(serviceAccount) } : undefined);
}

const db = getFirestore();

async function migrate() {
  console.log("Starting doctor roles migration...");
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  
  let count = 0;
  const batch = db.batch();

  snapshot.forEach(doc => {
    const data = doc.data();
    let needsUpdate = false;
    let newRoles = Array.isArray(data.roles) ? [...data.roles] : [];

    if (data.role === 'doctor' || data.role === 'physician') {
      if (!newRoles.includes('doctor')) {
        newRoles.push('doctor');
        needsUpdate = true;
      }
    }
    
    if (data.institution === 'Hortman' || (data.email && data.email.includes('hortman'))) {
       if (!newRoles.includes('doctor')) {
         newRoles.push('doctor');
         needsUpdate = true;
       }
    }

    if (needsUpdate) {
      console.log(`Updating ${doc.id} (${data.email || data.displayName}) - new roles: ${newRoles}`);
      batch.update(doc.ref, { 
        roles: newRoles,
        role: FieldValue.delete()
      });
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Migration complete. Updated ${count} users.`);
  } else {
    console.log("No users needed migration.");
  }
}

migrate().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
