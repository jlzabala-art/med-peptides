import { db } from './scripts/lib/firebase-admin.mjs';

async function test() {
  const protocolsSnap = await db.collection('protocols').limit(5).get();
  for (const p of protocolsSnap.docs) {
    const data = p.data();
    console.log(`Protocol ${p.id}: ${data.protocol_name}`);
    console.log(` - inline phases (if array):`, Array.isArray(data.phases) ? data.phases.length : typeof data.phases);
    console.log(` - inline phase_blueprints (if array):`, Array.isArray(data.phase_blueprints) ? data.phase_blueprints.length : typeof data.phase_blueprints);
    const phasesSnap = await db.collection('protocols').doc(p.id).collection('phases').get();
    console.log(` - subcollection phases count:`, phasesSnap.size);
  }
}

test().catch(console.error);
