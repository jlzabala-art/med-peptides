const admin = require('firebase-admin');
const fs = require('fs');

if (fs.existsSync('./firebase-adminsdk.json')) {
  admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-adminsdk.json')),
    projectId: "med-peptides-app"
  });
} else {
  admin.initializeApp({
    projectId: "med-peptides-app"
  });
}

async function seedViewConfigs() {
  const db = admin.firestore();
  
  // Doctor View Config
  const doctorConfig = {
    name: 'Doctor Portal',
    activeTabs: ['patients', 'doctor_protocols', 'products', 'orders'],
    tabs: {
      patients: {}, // uses default props in component
      doctor_protocols: {},
      products: {
        readOnly: true,
        hideCosts: true
      },
      orders: {
        viewMode: 'doctor'
      }
    },
    updatedAt: new Date().toISOString()
  };

  // Wholesaler View Config
  const wholesalerConfig = {
    name: 'Wholesale Portal',
    activeTabs: ['products', 'orders'],
    tabs: {
      products: {
        readOnly: true,
        hideCosts: true,
        isWholesaler: true
      },
      orders: {
        viewMode: 'wholesaler'
      }
    },
    updatedAt: new Date().toISOString()
  };

  await db.collection('viewConfigs').doc('doctor').set(doctorConfig, { merge: true });
  await db.collection('viewConfigs').doc('wholesaler').set(wholesalerConfig, { merge: true });
  
  console.log('Successfully seeded viewConfigs for doctor and wholesaler roles.');
}

seedViewConfigs().catch(console.error);
