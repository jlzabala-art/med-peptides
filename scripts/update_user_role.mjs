import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

const serviceAccount = JSON.parse(
  await readFile('/Users/joseluiszabala/Documents/Antigravity/regenpept-web/serviceAccountKey.json')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'med-peptides-app'
  });
}

const db = admin.firestore();
const uid = '3u17gXlStXYuNgLE62wpkLtLop23'; // UID for jose@mediluxeme.com

try {
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    console.log('User found:', userSnap.data().email);
    await userRef.update({
      role: 'admin',
      approved: true,
      userType: 'admin'
    });
    console.log('Successfully updated role to admin for jose@mediluxeme.com');
  } else {
    console.error('User document not found in Firestore for UID:', uid);
    // Create it if it doesn't exist? The user exists in Auth but maybe not in Firestore
    await userRef.set({
      email: 'jose@mediluxeme.com',
      role: 'admin',
      approved: true,
      userType: 'admin',
      createdAt: new Date().toISOString()
    }, { merge: true });
    console.log('Created/Updated user document with admin role.');
  }
} catch (error) {
  console.error('Error updating user role:', error);
} finally {
  process.exit();
}
