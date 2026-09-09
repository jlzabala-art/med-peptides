import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

async function checkPatientsCollection() {
  const snapAll = await db.collection('patients').get();
  console.log("Total in patients collection:", snapAll.size);
  snapAll.forEach(d => {
    const data = d.data();
    const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`;
    if (name.toLowerCase().includes('elena') || name.toLowerCase().includes('carlos') || name.toLowerCase().includes('mendez') || name.toLowerCase().includes('rostova')) {
      console.log("Found in patients collection:", d.id, name, data);
    }
  });

  const snapUsers = await db.collection('users').get();
  snapUsers.forEach(d => {
    const data = d.data();
    const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`;
    if (name.toLowerCase().includes('elena') || name.toLowerCase().includes('carlos') || name.toLowerCase().includes('mendez') || name.toLowerCase().includes('rostova')) {
      console.log("Found in users collection:", d.id, name, data.role);
    }
  });
}

checkPatientsCollection();
