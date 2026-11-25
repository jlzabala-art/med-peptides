import { adminDb } from '../lib/firebaseAdmin.js';
import { ADVANCED_MEDICAL_EQUIPMENT_SUPPLIER } from '../data/advancedMedicalEquipmentData.js';

async function main() {
  if (!adminDb) {
    console.error('❌ adminDb not initialized. Check FIREBASE_SERVICE_ACCOUNT or .env.local');
    process.exit(1);
  }

  const now = new Date().toISOString();
  const payload = {
    ...ADVANCED_MEDICAL_EQUIPMENT_SUPPLIER,
    createdAt: now,
    updatedAt: now,
  };

  await adminDb
    .collection('suppliers')
    .doc(ADVANCED_MEDICAL_EQUIPMENT_SUPPLIER.id)
    .set(payload, { merge: true });

  console.log(`✅ Registered supplier: suppliers/${ADVANCED_MEDICAL_EQUIPMENT_SUPPLIER.id}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
