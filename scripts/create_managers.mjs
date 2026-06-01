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
const auth = admin.auth();

const usersToCreate = [
  { email: 'kasia@mediluxeme.com', displayName: 'Kasia Manager', role: 'account_manager' },
  { email: 'business@mediluxeme.com', displayName: 'Business Manager', role: 'account_manager' }
];

async function run() {
  for (const u of usersToCreate) {
    let uid;
    try {
      const userRecord = await auth.getUserByEmail(u.email);
      uid = userRecord.uid;
      console.log(`User ${u.email} already exists in Auth with UID ${uid}`);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        const newUser = await auth.createUser({
          email: u.email,
          password: 'Password123!',
          displayName: u.displayName
        });
        uid = newUser.uid;
        console.log(`Created new Auth user for ${u.email} with UID ${uid}`);
      } else {
        console.error(e);
        continue;
      }
    }

    // Update Firestore
    const userRef = db.collection('users').doc(uid);
    await userRef.set({
      email: u.email,
      role: u.role,
      displayName: u.displayName,
      firstName: u.displayName.split(' ')[0],
      lastName: u.displayName.split(' ')[1] || '',
      approved: true,
      userType: 'professional',
      createdAt: new Date().toISOString()
    }, { merge: true });
    console.log(`Updated Firestore for ${u.email} with role ${u.role}`);
  }
  process.exit();
}

run();
