import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const svcAcct = require('../serviceAccountKey.json');
if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

const snap = await db.collection('protocols').doc('rec_001').get();
const data = snap.data();

console.log('active:', data.active);
console.log('status:', data.status);
console.log('protocol_slug:', data.protocol_slug);
console.log('protocol_title:', data.protocol_title);
console.log('phase_blueprints length:', data.phase_blueprints?.length);
console.log('phases length:', data.phases?.length);

// Check if getPublicProtocols (active==true query) would include it
console.log('\nWould getPublicProtocols include it?', data.active === true ? 'YES' : 'NO (active is not true)');
console.log('Would getProtocolTemplates include it?', (!data.status || data.status === 'approved') ? 'YES' : 'NO');
console.log('Would getProtocolTemplate(slug) find it? YES (confirmed by earlier diagnostic)');

// Check Firestore security rules via REST (just output rule snippet)
console.log('\n=== Checking if all protocols are accessible (no auth gate) ===');
const all = await db.collection('protocols').get();
console.log('Total docs in protocols:', all.size);
console.log('Sample IDs:', all.docs.slice(0,5).map(d => d.id));
