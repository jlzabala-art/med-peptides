/**
 * seedTestUsers.mjs
 *
 * Seed script that creates pre-authorized test users for each of the 8 profiles:
 * - admin@regenpept.test
 * - clinic@regenpept.test
 * - doctor@regenpept.test
 * - wholesaler@regenpept.test
 * - sales_agent@regenpept.test
 * - staff@regenpept.test
 * - patient@regenpept.test
 * - guest@regenpept.test
 *
 * All users will have the password "123456".
 * Their Firestore profiles will be fully configured and pre-approved.
 * It also initializes `/settings/permissions` document in Firestore with default values.
 *
 * Usage:
 *   node src/scripts/seedTestUsers.mjs
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// Initialize Firebase Admin SDK using local service account key
const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
initializeApp({
  credential: cert(serviceAccountPath),
  projectId: 'med-peptides-app'
});

const db = getFirestore();
const auth = getAuth();

const DEFAULT_ROLE_PERMISSIONS = {
  admin: {
    canRecommend: true,
    canBulkOrder: true,
    customSynthesis: true,
    clinicalLogs: true,
    manageStaff: true,
    trackCommission: true,
    canAccessAdminDashboard: true,
    canAccessDoctorDashboard: true,
    canAccessCalculator: true,
    canAccessAcademy: true,
    canAccessClinicalAI: true,
    canAccessCustomSynthesis: true
  },
  clinic: {
    canRecommend: true,
    canBulkOrder: true,
    customSynthesis: true,
    clinicalLogs: true,
    manageStaff: true,
    trackCommission: false,
    canAccessAdminDashboard: false,
    canAccessDoctorDashboard: true,
    canAccessCalculator: true,
    canAccessAcademy: true,
    canAccessClinicalAI: true,
    canAccessCustomSynthesis: true
  },
  doctor: {
    canRecommend: true,
    canBulkOrder: false,
    customSynthesis: true,
    clinicalLogs: true,
    manageStaff: false,
    trackCommission: true,
    canAccessAdminDashboard: false,
    canAccessDoctorDashboard: true,
    canAccessCalculator: true,
    canAccessAcademy: true,
    canAccessClinicalAI: true,
    canAccessCustomSynthesis: true
  },
  wholesaler: {
    canRecommend: false,
    canBulkOrder: true,
    customSynthesis: true,
    clinicalLogs: false,
    manageStaff: false,
    trackCommission: false,
    canAccessAdminDashboard: false,
    canAccessDoctorDashboard: false,
    canAccessCalculator: true,
    canAccessAcademy: true,
    canAccessClinicalAI: false,
    canAccessCustomSynthesis: true
  },
  sales_agent: {
    canRecommend: false,
    canBulkOrder: false,
    customSynthesis: false,
    clinicalLogs: false,
    manageStaff: false,
    trackCommission: true,
    canAccessAdminDashboard: false,
    canAccessDoctorDashboard: false,
    canAccessCalculator: false,
    canAccessAcademy: true,
    canAccessClinicalAI: false,
    canAccessCustomSynthesis: false
  },
  staff: {
    canRecommend: false,
    canBulkOrder: false,
    customSynthesis: false,
    clinicalLogs: true,
    manageStaff: false,
    trackCommission: false,
    canAccessAdminDashboard: false,
    canAccessDoctorDashboard: false,
    canAccessCalculator: true,
    canAccessAcademy: true,
    canAccessClinicalAI: true,
    canAccessCustomSynthesis: false
  },
  patient: {
    canRecommend: false,
    canBulkOrder: false,
    customSynthesis: false,
    clinicalLogs: false,
    manageStaff: false,
    trackCommission: false,
    canAccessAdminDashboard: false,
    canAccessDoctorDashboard: false,
    canAccessCalculator: false,
    canAccessAcademy: true,
    canAccessClinicalAI: false,
    canAccessCustomSynthesis: false
  },
  guest: {
    canRecommend: false,
    canBulkOrder: false,
    customSynthesis: false,
    clinicalLogs: false,
    manageStaff: false,
    trackCommission: false,
    canAccessAdminDashboard: false,
    canAccessDoctorDashboard: false,
    canAccessCalculator: false,
    canAccessAcademy: true,
    canAccessClinicalAI: false,
    canAccessCustomSynthesis: false
  },
  medical_director: {
    canRecommend: true,
    canBulkOrder: true,
    customSynthesis: true,
    clinicalLogs: true,
    manageStaff: true,
    trackCommission: false,
    canAccessAdminDashboard: false,
    canAccessDoctorDashboard: true,
    canAccessCalculator: true,
    canAccessAcademy: true,
    canAccessClinicalAI: true,
    canAccessCustomSynthesis: true
  },
  fagron_doctor: {
    canRecommend: true,
    canBulkOrder: true,
    customSynthesis: true,
    clinicalLogs: true,
    manageStaff: true,
    trackCommission: false,
    canAccessAdminDashboard: false,
    canAccessDoctorDashboard: true,
    canAccessCalculator: true,
    canAccessAcademy: true,
    canAccessClinicalAI: true,
    canAccessCustomSynthesis: true
  },
  supplier: {
    canRecommend: false,
    canBulkOrder: true,
    customSynthesis: true,
    clinicalLogs: false,
    manageStaff: false,
    trackCommission: false,
    canAccessAdminDashboard: false,
    canAccessDoctorDashboard: false,
    canAccessCalculator: false,
    canAccessAcademy: false,
    canAccessClinicalAI: false,
    canAccessCustomSynthesis: false
  },
  account_manager: {
    canRecommend: false,
    canBulkOrder: false,
    customSynthesis: false,
    clinicalLogs: false,
    manageStaff: false,
    trackCommission: true,
    canAccessAdminDashboard: true,
    canAccessDoctorDashboard: false,
    canAccessCalculator: false,
    canAccessAcademy: true,
    canAccessClinicalAI: false,
    canAccessCustomSynthesis: false
  }
};

const usersToCreate = [
  { role: 'admin', email: 'admin@regenpept.test', name: 'Test Admin' },
  { role: 'medical_director', email: 'medical_director@regenpept.test', name: 'Test Medical Director' },
  { role: 'fagron_doctor', email: 'fagron_doctor@regenpept.test', name: 'Test Fagron Doctor' },
  { role: 'clinic', email: 'clinic@regenpept.test', name: 'Test Clinic' },
  { role: 'doctor', email: 'doctor@regenpept.test', name: 'Test Doctor' },
  { role: 'wholesaler', email: 'wholesaler@regenpept.test', name: 'Test Wholesaler' },
  { role: 'supplier', email: 'supplier@regenpept.test', name: 'Test Supplier' },
  { role: 'account_manager', email: 'account_manager@regenpept.test', name: 'Test Account Manager' },
  { role: 'sales_agent', email: 'sales_agent@regenpept.test', name: 'Test Sales Agent' },
  { role: 'staff', email: 'staff@regenpept.test', name: 'Test Staff' },
  { role: 'patient', email: 'patient@regenpept.test', name: 'Test Patient' },
  { role: 'guest', email: 'guest@regenpept.test', name: 'Test Guest' }
];

async function seed() {
  console.log('🚀 Starting Test User Seeding...');

  // 1. Seed global role permissions
  console.log('📝 Seeding role permissions to /settings/permissions...');
  await db.collection('settings').doc('permissions').set(DEFAULT_ROLE_PERMISSIONS, { merge: true });
  console.log('✅ Role permissions seeded.');

  // 2. Create users
  for (const item of usersToCreate) {
    const { role, email, name } = item;
    const password = 'Regenpept2026!';
    console.log(`👤 Processing user: ${email} (Role: ${role})...`);

    let uid;
    try {
      // Check if user already exists in Firebase Auth
      const userRecord = await auth.getUserByEmail(email);
      uid = userRecord.uid;
      console.log(`   User exists with UID: ${uid}. Resetting password to ${password}...`);
      await auth.updateUser(uid, {
        password: password,
        displayName: name
      });
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Create user
        const userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: name,
          emailVerified: true
        });
        uid = userRecord.uid;
        console.log(`   User created with UID: ${uid}`);
      } else {
        console.error(`   ❌ Failed to process auth user ${email}:`, err.message);
        continue;
      }
    }

    // Determine name splits
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Determine status
    const professionalStatus = ['admin', 'patient', 'guest'].includes(role) ? 'not_requested' : 'approved';

    // 3. Write Firestore user profile
    const profile = {
      firstName,
      lastName,
      email,
      role: role,
      approved: true,
      professionalStatus: professionalStatus,
      permissions: DEFAULT_ROLE_PERMISSIONS[role],
      createdAt: new Date().toISOString(),
      institution: role === 'clinic' ? 'Test Clinic Affiliation' : role === 'doctor' ? 'Test Hospital' : '',
      phone: '+34600112233',
      shippingCountry: 'Spain',
      shippingCity: 'Madrid',
      shippingStreet: 'Gran Via 1',
      shippingZip: '28013'
    };

    try {
      await db.collection('users').doc(uid).set(profile, { merge: true });
      console.log(`   ✅ Profile written in Firestore for uid: ${uid}`);
    } catch (dbErr) {
      console.error(`   ❌ Failed to write Firestore profile for uid: ${uid}:`, dbErr.message);
    }
  }

  console.log('🎉 Seeding successfully completed!');
}

seed().catch(err => {
  console.error('❌ Critical failure seeding test users:', err);
  process.exit(1);
});
