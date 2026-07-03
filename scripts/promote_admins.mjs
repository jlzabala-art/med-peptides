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

const ADMIN_EMAILS = [
  'jose@mediluxeme.com',     // UID: 3u17gXlStXYuNgLE62wpkLtLop23
  'jlzabala@gmail.com',      // UID: eV8f8Hwlk7YoJkzhn1fCoQU85953
  'admin@regenpept.test',    // UID: jvaUivJ4EDRYsm56FYUJiw31akI3
];

async function promoteToAdmin() {
  for (const email of ADMIN_EMAILS) {
    try {
      const user = await auth.getUserByEmail(email);
      
      // Set custom claims
      await auth.setCustomUserClaims(user.uid, { role: 'admin' });
      
      // Update Firestore profile
      await db.collection('users').doc(user.uid).set({
        role: 'admin',
        approved: true,
        isAdmin: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      console.log(`✅  ${email} (${user.uid}) → role: admin`);
    } catch (err) {
      console.error(`❌  ${email}: ${err.message}`);
    }
  }
  console.log('\nDone. All specified users are now admins.');
}

promoteToAdmin();
