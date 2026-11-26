import { adminDb } from '../lib/firebaseAdmin.js';
import { VITEL_CAPITAL_ENTITY } from '../data/vitelCapitalData.js';

async function main() {
  if (!adminDb) {
    console.error('❌ adminDb not initialized.');
    process.exit(1);
  }

  const now = new Date().toISOString();
  const basePayload = {
    ...VITEL_CAPITAL_ENTITY,
    createdAt: now,
    updatedAt: now,
  };

  await adminDb
    .collection('suppliers')
    .doc(VITEL_CAPITAL_ENTITY.id)
    .set(basePayload, { merge: true });

  await adminDb
    .collection('partners')
    .doc(VITEL_CAPITAL_ENTITY.partnerId)
    .set(
      {
        ...basePayload,
        id: VITEL_CAPITAL_ENTITY.partnerId,
      },
      { merge: true }
    );

  console.log(`✅ Registered in suppliers/${VITEL_CAPITAL_ENTITY.id} and partners/${VITEL_CAPITAL_ENTITY.partnerId}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
