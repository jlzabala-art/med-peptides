import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();

async function listUsers() {
  const result = await auth.listUsers(20);
  result.users.forEach(user => {
    console.log(`Email: ${user.email} | UID: ${user.uid} | DisplayName: ${user.displayName || 'N/A'}`);
  });
}

listUsers().catch(console.error);
