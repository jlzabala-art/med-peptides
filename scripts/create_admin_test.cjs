/**
 * create_admin_test.js — Creates admin@regenpept.test with password TestAdmin1234!
 * Sets role=admin in Firestore users collection
 * Run: node scripts/create_admin_test.js
 */
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Use application default credentials (Firebase CLI auth)
initializeApp({ projectId: 'med-peptides-app' });

const auth = getAuth();
const db = getFirestore();

async function main() {
  const EMAIL = 'admin@regenpept.test';
  const PASSWORD = 'TestAdmin1234!';
  const DISPLAY_NAME = 'Test Admin';

  // Check if user already exists
  let uid;
  try {
    const existing = await auth.getUserByEmail(EMAIL);
    uid = existing.uid;
    console.log('✅ User already exists:', uid);
    // Update password just in case
    await auth.updateUser(uid, { password: PASSWORD, displayName: DISPLAY_NAME, emailVerified: true });
    console.log('✅ Password and display name updated');
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: EMAIL,
        password: PASSWORD,
        displayName: DISPLAY_NAME,
        emailVerified: true,
      });
      uid = newUser.uid;
      console.log('✅ Created new user:', uid);
    } else {
      throw err;
    }
  }

  // Set Firestore profile with role=admin
  await db.collection('users').doc(uid).set({
    uid,
    email: EMAIL,
    displayName: DISPLAY_NAME,
    firstName: 'Test',
    lastName: 'Admin',
    role: 'admin',
    professionalStatus: 'approved',
    createdAt: new Date(),
  }, { merge: true });

  console.log('✅ Firestore profile set with role=admin');
  console.log('\n🔐 Admin test account ready:');
  console.log('   Email:    admin@regenpept.test');
  console.log('   Password: TestAdmin1234!');
  console.log('   UID:      ', uid);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
