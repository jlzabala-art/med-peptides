const admin = require('firebase-admin');

// Initialize Firebase Admin (assuming default credentials from the environment or emulator)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function fixProtocols() {
  try {
    const snapshot = await db.collection('protocols').get();
    let count = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!data.protocol_name || data.protocol_name.trim() === '' || data.protocol_name === 'Unnamed Protocol') {
        console.log(`Found unnamed protocol: ${doc.id}`, data);
        // We can either delete them or rename them. The user said "esto no debe ser posible... si hay que enriquecer los datos del firebase, hazlo"
        // Let's just delete them if they are completely empty/invalid, or give them a name if they have data.
        
        // Actually, let's first just list them to see what they are.
        count++;
      }
    }
    
    console.log(`Total unnamed protocols: ${count}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

fixProtocols();
