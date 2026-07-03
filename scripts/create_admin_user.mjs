import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function createAdminUser() {
  const email = 'admin@regenpept.test';
  const password = 'TestAdmin1234!';

  try {
    // Check if user already exists
    try {
      const existing = await auth.getUserByEmail(email);
      console.log(`User already exists: ${existing.uid}`);
      // Update password
      await auth.updateUser(existing.uid, { password });
      console.log('Password updated.');
      
      // Ensure Firestore doc has admin role
      await db.collection('users').doc(existing.uid).set({
        email,
        role: 'admin',
        approved: true,
        firstName: 'Admin',
        lastName: 'Test',
        displayName: 'Local Admin',
        createdAt: new Date().toISOString(),
      }, { merge: true });
      console.log('Firestore profile updated with admin role.');
      return;
    } catch (e) {
      if (e.code !== 'auth/user-not-found') throw e;
    }

    // Create user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: 'Admin Test',
      emailVerified: true,
    });
    console.log(`Created user: ${userRecord.uid}`);

    // Set custom claims (optional, belt+suspenders)
    await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });

    // Create Firestore profile
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role: 'admin',
      approved: true,
      firstName: 'Admin',
      lastName: 'Test',
      displayName: 'Admin Test',
      createdAt: new Date().toISOString(),
    });
    console.log(`Firestore profile created. UID: ${userRecord.uid}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createAdminUser();
