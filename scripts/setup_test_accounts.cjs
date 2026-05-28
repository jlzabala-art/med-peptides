/**
 * setup_test_accounts.js — Run via Node.js with Application Default Credentials.
 *
 * Prerequisites:
 *   1. npx firebase-tools login (one time)
 *   2. gcloud auth application-default set-quota-project med-peptides-app
 *   3. node scripts/setup_test_accounts.js
 *
 * All test accounts use role-appropriate Firestore profiles.
 * Passwords follow the pattern: Test1234! (generic) or TestAdmin1234! (admin).
 */
const admin = require('firebase-admin');

if (!admin.apps.length) admin.initializeApp({ projectId: 'med-peptides-app' });
const db = admin.firestore();
const auth = admin.auth();

// ── Known Test Account UIDs ──────────────────────────────────────────────────
const ACCOUNTS = {
  admin:      { uid: 'jvaUivJ4EDRYsm56FYUJiw31akI3', email: 'admin@regenpept.test',      password: 'TestAdmin1234!', role: 'admin' },
  doctor:     { uid: '754OYGgejoelucER7ReDaGUbAJu2', email: 'doctor@regenpept.test',      password: 'Test1234!',      role: 'doctor' },
  wholesaler: { uid: '2cGrtl9bkcMcBajRtHAkmwPEa8U2', email: 'wholesaler@regenpept.test', password: 'Test1234!',      role: 'wholesaler' },
  patient:    { uid: 'uPg6CQPv11bN0uMTAPGooiH4ibn1', email: 'patient@regenpept.test',     password: 'Test1234!',      role: 'patient' },
  guest:      { uid: 'MMzDsh3ClefZVRA3HFZvF70B0JG3', email: 'guest@regenpept.test',       password: 'Test1234!',      role: 'guest' },
};

async function main() {
  console.log('🔧 Setting up / verifying test accounts...\n');

  for (const [key, acc] of Object.entries(ACCOUNTS)) {
    console.log(`Setting up ${key}...`);
    
    // 1. Firebase Auth Setup (Create or Update)
    let userRecord;
    try {
      userRecord = await auth.getUser(acc.uid);
      // User exists, update password and email to match
      await auth.updateUser(acc.uid, {
        email: acc.email,
        password: acc.password,
        emailVerified: true,
        displayName: `Test ${key.charAt(0).toUpperCase() + key.slice(1)}`
      });
      console.log(`  - Auth: Updated existing user ${acc.email}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // User does not exist, create
        userRecord = await auth.createUser({
          uid: acc.uid,
          email: acc.email,
          password: acc.password,
          emailVerified: true,
          displayName: `Test ${key.charAt(0).toUpperCase() + key.slice(1)}`
        });
        console.log(`  - Auth: Created new user ${acc.email}`);
      } else {
        throw err;
      }
    }

    // 2. Firestore Setup
    const profile = {
      uid: acc.uid,
      email: acc.email,
      displayName: acc.displayName || `Test ${key.charAt(0).toUpperCase() + key.slice(1)}`,
      firstName: 'Test',
      lastName: key.charAt(0).toUpperCase() + key.slice(1),
      role: acc.role,
      updatedAt: new Date().toISOString(),
    };

    if (acc.role === 'admin') {
      profile.professionalStatus = 'approved';
      profile.approved = true;
    } else if (acc.role === 'doctor') {
      profile.professionalStatus = 'approved';
      profile.approved = true;
    } else if (acc.role === 'wholesaler') {
      profile.professionalStatus = 'approved';
      profile.approved = true;
    } else if (acc.role === 'patient') {
      profile.professionalStatus = 'approved';
      profile.approved = true;
      profile.firstName = 'Ana';
      profile.lastName = 'Martínez';
      profile.displayName = 'Ana Martínez';
      profile.assignedPhysicianIds = [ACCOUNTS.doctor.uid];
    } else if (acc.role === 'guest') {
      profile.professionalStatus = 'not_requested';
      profile.approved = false;
    }

    await db.collection('users').doc(acc.uid).set(profile, { merge: true });
    console.log(`  - Firestore: Profile set for ${acc.email} with role=${acc.role}`);
  }

  console.log('\n🏁 All test accounts ready. Login at https://med-peptides-app-27a3a.web.app/login');
  console.log('\n   Real admin (Google login only): jose@mediluxeme.com');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
