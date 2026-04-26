/**
 * auditDuplicateProducts.mjs
 * Shows all products grouped by name to find duplicates and bad kit pricing
 */
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const sa = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

const snap = await db.collection('products').get();

const byName = {};
for (const doc of snap.docs) {
  const p = doc.data();
  const name = p.name || doc.id;
  if (!byName[name]) byName[name] = [];
  
  // Get first variant pricing
  const varSnap = await db.collection('products').doc(doc.id).collection('variants').limit(1).get();
  const varData = varSnap.empty ? null : varSnap.docs[0].data();
  const retail = varData?.pricing?.retail;
  const kitEqPerUnit = retail && retail.kit === retail.perUnit;
  
  byName[name].push({
    id: doc.id,
    perUnit: retail?.perUnit,
    kit: retail?.kit,
    kitEqPerUnit,
    dosage: varData?.dosage || varData?.strength || 'undefined'
  });
}

let duplicates = 0;
let badKit = 0;

for (const [name, entries] of Object.entries(byName)) {
  if (entries.length > 1) {
    duplicates++;
    console.log(`⚠️  DUPLICATE: ${name} (${entries.length} docs)`);
    entries.forEach(e => console.log(`    id=${e.id} dosage=${e.dosage} perUnit=${e.perUnit} kit=${e.kit} ${e.kitEqPerUnit ? '❌ KIT=PERUNIT' : '✅'}`));
  } else if (entries[0].kitEqPerUnit) {
    badKit++;
    console.log(`❌ BAD KIT: ${name} perUnit=${entries[0].perUnit} kit=${entries[0].kit} (id=${entries[0].id})`);
  }
}

console.log(`\n📊 Summary: ${Object.keys(byName).length} products, ${duplicates} duplicates, ${badKit} with kit=perUnit`);
process.exit(0);
