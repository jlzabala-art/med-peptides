import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const APPLY = process.argv.includes('--apply');

if (!admin.apps.length) {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;
  if (key) {
    admin.initializeApp({ credential: admin.credential.cert(key) });
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
      })
    });
  }
}

const db = admin.firestore();

function slugifyPatient(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
}

function inferProductType(data) {
  const name = String(data.name || data.title || '').toLowerCase();
  const cat = String(data.category || '').toLowerCase();
  if (name.includes('pellet') || cat.includes('pellet')) return 'pellet';
  if (
    cat.includes('raw') ||
    cat.includes('api') ||
    name.includes('bulk api') ||
    name.includes('powder')
  ) {
    return 'raw_material';
  }
  if (cat.includes('diagnostic') || name.includes('trichotest') || name.includes('telotest')) {
    return 'diagnostic';
  }
  return 'finished_product';
}

async function commitUpdates(updates) {
  if (!APPLY || updates.length === 0) return;
  for (let i = 0; i < updates.length; i += 400) {
    const batch = db.batch();
    const chunk = updates.slice(i, i + 400);
    for (const u of chunk) {
      batch.set(u.ref, u.patch, { merge: true });
    }
    await batch.commit();
  }
}

async function main() {
  console.log(`\n=== Firestore Canonical Normalization (${APPLY ? 'APPLY MODE' : 'DRY-RUN MODE'}) ===\n`);

  // 1. Products (bounded to 500)
  const prodSnap = await db.collection('products').limit(500).get();
  const prodUpdates = [];
  let rawApiFixed = 0;
  let missingTypeFixed = 0;

  prodSnap.forEach((doc) => {
    const d = doc.data();
    if (d.type === 'raw_api') {
      rawApiFixed++;
      prodUpdates.push({ ref: doc.ref, patch: { type: 'raw_material', normalizedAt: new Date().toISOString() } });
    } else if (!d.type) {
      missingTypeFixed++;
      prodUpdates.push({ ref: doc.ref, patch: { type: inferProductType(d), normalizedAt: new Date().toISOString() } });
    }
  });

  // 2. Prescriptions (bounded to 500)
  const rxSnap = await db.collection('prescriptions').limit(500).get();
  const rxUpdates = [];
  let missingCodeFixed = 0;
  let missingPatientIdFixed = 0;

  rxSnap.forEach((doc) => {
    const d = doc.data();
    const patch = {};
    if (!d.code && !d.prescriptionNumber) {
      const genCode = `RX-${doc.id.slice(0, 6).toUpperCase()}`;
      patch.code = genCode;
      patch.prescriptionNumber = genCode;
      missingCodeFixed++;
    }
    const pName = d.patientName || d.patient?.name || '';
    if (!d.patientId && !d.patient?.id && pName) {
      const slug = slugifyPatient(pName);
      if (slug) {
        patch.patientId = `pt_${slug}`;
        missingPatientIdFixed++;
      }
    }
    if (Object.keys(patch).length > 0) {
      patch.normalizedAt = new Date().toISOString();
      rxUpdates.push({ ref: doc.ref, patch });
    }
  });

  console.log(`Products scanned: ${prodSnap.size} | raw_api -> raw_material: ${rawApiFixed} | missing type fixed: ${missingTypeFixed}`);
  console.log(`Prescriptions scanned: ${rxSnap.size} | missing code fixed: ${missingCodeFixed} | missing patientId fixed: ${missingPatientIdFixed}`);

  if (APPLY) {
    await commitUpdates(prodUpdates);
    await commitUpdates(rxUpdates);
    console.log(`\n✅ Applied ${prodUpdates.length} product updates and ${rxUpdates.length} prescription updates.`);
  } else {
    console.log('\nℹ️ Dry-run complete. Re-run with --apply to persist.');
  }
}

main().catch((err) => {
  console.error('Normalization error:', err);
  process.exit(1);
});
