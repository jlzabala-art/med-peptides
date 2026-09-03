const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function fixProtocols() {
  try {
    const snapshot = await db.collection('protocols').get();
    let count = 0;
    
    const batch = db.batch();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const needsUpdate = !data.protocol_name || data.protocol_name.trim() === '' || data.protocol_name === 'Unnamed Protocol';
      
      if (needsUpdate) {
        console.log(`Fixing protocol: ${doc.id}`);
        const updateData = {};
        
        // Fix protocol_name
        if (data.protocol_title) {
          updateData.protocol_name = data.protocol_title;
        } else if (data.scientificName) {
          updateData.protocol_name = data.scientificName;
        } else if (data.abbreviatedName) {
          updateData.protocol_name = data.abbreviatedName;
        } else {
          updateData.protocol_name = `Protocol ${data.shortCode || doc.id}`;
        }
        
        // Fix therapeutic_category if missing
        if (!data.therapeutic_category && data.category) {
          updateData.therapeutic_category = data.category;
        }

        console.log(`  Set protocol_name = "${updateData.protocol_name}", therapeutic_category = "${updateData.therapeutic_category}"`);
        
        batch.update(doc.ref, updateData);
        count++;
      }
    }
    
    if (count > 0) {
      await batch.commit();
      console.log(`Successfully fixed ${count} unnamed protocols in Firestore.`);
    } else {
      console.log('No unnamed protocols found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fixProtocols();
