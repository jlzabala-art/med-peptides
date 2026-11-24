import fs from 'fs';
import path from 'path';
import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load .env.local or .env if present
for (const envFile of ['.env.local', '.env.production', '.env']) {
  const fullPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(fullPath)) {
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        let val = m[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[m[1]] = val;
      }
    }
  }
}

function getDb() {
  if (!getApps().length) {
    let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
    if (rawPk.startsWith('"') && rawPk.endsWith('"')) rawPk = rawPk.slice(1, -1);
    const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'med-peptides-app';

    if (privateKey && clientEmail && projectId) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    } else {
      initializeApp({ credential: applicationDefault(), projectId });
    }
  }
  return getFirestore();
}

const DHA_PATTERN = /\b(DHA|DOH|MOH)\b|DHA[-_\s]*\d+/i;
const isDryRun = process.argv.includes('--dry-run');

async function migrateCollection(db, colName, fieldsToCheck) {
  const snap = await db.collection(colName).get();
  let scanned = 0;
  let updated = 0;
  let batch = db.batch();
  let batchOps = 0;

  for (const doc of snap.docs) {
    scanned++;
    const data = doc.data() || {};
    const updates = {};

    for (const field of fieldsToCheck) {
      const parts = field.split('.');
      let cur = data;
      for (const p of parts) {
        cur = cur && typeof cur === 'object' ? cur[p] : undefined;
      }
      if (typeof cur === 'string' && DHA_PATTERN.test(cur)) {
        updates[field] = 'Certified Doctor';
      }
    }

    // Also sanitize labels array if present inside prescription
    if (Array.isArray(data.labels)) {
      let labelsChanged = false;
      const nextLabels = data.labels.map((lbl) => {
        if (!lbl || typeof lbl !== 'object') return lbl;
        const copy = { ...lbl };
        if (typeof copy.doctorLicense === 'string' && DHA_PATTERN.test(copy.doctorLicense)) {
          copy.doctorLicense = 'Certified Doctor';
          labelsChanged = true;
        }
        if (typeof copy.license === 'string' && DHA_PATTERN.test(copy.license)) {
          copy.license = 'Certified Doctor';
          labelsChanged = true;
        }
        return copy;
      });
      if (labelsChanged) {
        updates.labels = nextLabels;
      }
    }

    if (Object.keys(updates).length > 0) {
      updated++;
      if (!isDryRun) {
        batch.update(doc.ref, updates);
        batchOps++;
        if (batchOps >= 400) {
          await batch.commit();
          batch = db.batch();
          batchOps = 0;
        }
      }
    }
  }

  if (!isDryRun && batchOps > 0) {
    await batch.commit();
  }

  console.log(`[${colName}] scanned=${scanned}, ${isDryRun ? 'wouldUpdate' : 'updated'}=${updated}`);
  return { scanned, updated };
}

async function main() {
  const db = getDb();
  console.log(`Running DHA -> Certified Doctor migration (${isDryRun ? 'DRY RUN' : 'LIVE'})...`);
  await migrateCollection(db, 'prescriptions', [
    'doctorLicense',
    'license',
    'doctor.license',
    'treatingDoctor.license',
    'physicianLicense',
  ]);
  await migrateCollection(db, 'doctors', [
    'license',
    'doctorLicense',
    'licenseNumber',
    'dhaLicense',
  ]);
  console.log('Done.');
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
