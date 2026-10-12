import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Initialize firebase-admin
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function updateAbdullaDirections() {
  console.log('🔍 Searching and updating Abdulla Alotaiba (51812) documents in Firestore...');

  const targetDocs = ['51812', 'RX-51812', 'RX-51812-A'];
  const newDirections = 'Take 3 capsules in the morning after breakfast.';

  for (const docId of targetDocs) {
    const docRef = db.collection('prescriptions').doc(docId);
    const snap = await docRef.get();

    if (snap.exists) {
      const data = snap.data();
      console.log(`\nFound prescriptions/${docId}:`);
      console.log(`  Current directions: "${data.directions || data.instructions || data.posology}"`);

      // Update directions, instructions, posology
      const updates = {
        directions: newDirections,
        instructions: newDirections,
        posology: newDirections,
        treatmentInstructions: newDirections,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Also if there's a labels array in the doc, update label directions
      if (Array.isArray(data.labels)) {
        updates.labels = data.labels.map((lbl, idx) => {
          if (idx === 0 || lbl.partNumber === 1 || lbl.partLabel?.includes('Part 1')) {
            return {
              ...lbl,
              directions: newDirections,
              instructions: newDirections
            };
          }
          return lbl;
        });
      }

      await docRef.set(updates, { merge: true });
      console.log(`  ✓ Updated prescriptions/${docId} with: "${newDirections}"`);
    } else {
      console.log(`Prescriptions/${docId} does not exist, creating pointer with updated directions...`);
      await docRef.set({
        code: '51812',
        fileNumber: '51812',
        prescriptionCode: docId,
        directions: newDirections,
        instructions: newDirections,
        posology: newDirections,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log(`  ✓ Created/merged prescriptions/${docId}`);
    }
  }

  // Also query any other prescription where patient name is Abdulla or fileNumber is 51812
  const querySnap = await db.collection('prescriptions')
    .where('fileNumber', '==', '51812')
    .get();

  for (const doc of querySnap.docs) {
    if (doc.id.includes('-B')) continue; // Skip night formula Part 2
    console.log(`Updating matching query prescription ${doc.id}...`);
    await doc.ref.set({
      directions: newDirections,
      instructions: newDirections,
      posology: newDirections,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`  ✓ Updated ${doc.id}`);
  }

  console.log('\n✅ Successfully updated all Abdulla Firestore documents!');
  process.exit(0);
}

updateAbdullaDirections().catch((err) => {
  console.error('❌ Error updating Firestore:', err);
  process.exit(1);
});
