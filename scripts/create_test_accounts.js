/**
 * create_test_accounts.js
 * Run: node scripts/create_test_accounts.js
 *
 * Creates or verifies the 4 test accounts required for QA scenarios:
 *  - patient_b2c@qa.med-peptides.com   (role: patient)
 *  - patient_b2b@qa.med-peptides.com   (role: patient, linked to doctor)
 *  - doctor_qa@qa.med-peptides.com     (role: doctor)
 *  - wholesaler_qa@qa.med-peptides.com (role: wholesaler)
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS or service account key at ../service-account.json
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

// ── Init ─────────────────────────────────────────────────────────────────────
const saPath = path.resolve(__dirname, '../service-account.json');
if (!fs.existsSync(saPath)) {
  console.error('❌  service-account.json not found at', saPath);
  console.error('   Download from Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(require(saPath)) });
const auth = admin.auth();
const db   = admin.firestore();

const TEST_ACCOUNTS = [
  {
    email:    'patient_b2c@qa.med-peptides.com',
    password: 'QA_b2c_2026!',
    displayName: 'QA Patient B2C',
    role:     'patient',
    extra:    {},
  },
  {
    email:    'patient_b2b@qa.med-peptides.com',
    password: 'QA_b2b_2026!',
    displayName: 'QA Patient B2B',
    role:     'patient',
    extra:    { assignedPhysicianIds: [] },   // will be patched with doctor uid below
  },
  {
    email:    'doctor_qa@qa.med-peptides.com',
    password: 'QA_doctor_2026!',
    displayName: 'Dr. QA Test',
    role:     'doctor',
    extra:    { licenseNumber: 'TEST-12345', specialty: 'Research' },
  },
  {
    email:    'wholesaler_qa@qa.med-peptides.com',
    password: 'QA_whole_2026!',
    displayName: 'QA Wholesaler',
    role:     'wholesaler',
    extra:    { companyName: 'QA Pharma Dist.' },
  },
];

async function upsertUser({ email, password, displayName, role, extra }) {
  let uid;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    console.log(`✅  EXISTS   ${email}  (uid: ${uid})`);
  } catch {
    const created = await auth.createUser({ email, password, displayName, emailVerified: true });
    uid = created.uid;
    console.log(`🆕  CREATED  ${email}  (uid: ${uid})`);
  }

  // Upsert Firestore profile
  await db.collection('users').doc(uid).set(
    {
      uid,
      email,
      displayName,
      role,
      firstName:  displayName.split(' ')[0],
      lastName:   displayName.split(' ').slice(1).join(' '),
      createdAt:  admin.firestore.FieldValue.serverTimestamp(),
      ...extra,
    },
    { merge: true }
  );
  console.log(`   Firestore profile: role=${role}`);
  return uid;
}

async function main() {
  console.log('\n──────────────────────────────────────────');
  console.log(' Atlas Health QA — Test Account Setup');
  console.log('──────────────────────────────────────────\n');

  const uids = {};
  for (const account of TEST_ACCOUNTS) {
    uids[account.email] = await upsertUser(account);
  }

  // Link B2B patient → doctor
  const doctorUid    = uids['doctor_qa@qa.med-peptides.com'];
  const patientB2bUid = uids['patient_b2b@qa.med-peptides.com'];
  if (doctorUid && patientB2bUid) {
    await db.collection('users').doc(patientB2bUid).update({
      assignedPhysicianIds: [doctorUid],
    });
    console.log(`\n🔗  Linked patient_b2b → doctor_qa (uid: ${doctorUid})`);
  }

  console.log('\n──────────────────────────────────────────');
  console.log(' ✅  All accounts ready. Credentials:\n');
  TEST_ACCOUNTS.forEach(a => {
    console.log(`  ${a.role.padEnd(12)} ${a.email}  /  ${a.password}`);
  });
  console.log('──────────────────────────────────────────\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
