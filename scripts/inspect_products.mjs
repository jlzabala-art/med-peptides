import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

if (!getApps().length) {
  try {
    const svc = require(resolve(__dirname, '../serviceAccountKey.json'));
    initializeApp({ credential: cert(svc) });
  } catch {
    initializeApp();
  }
}
const db = getFirestore();

async function main() {
  const snap = await db.collection('products').get();
  const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const peptides = products.filter(p => p.productType === 'peptide');
  const supplements = products.filter(p => p.productType === 'supplement');

  console.log(`\n=== PRODUCTS STATS ===`);
  console.log(`Total Peptides: ${peptides.length}`);
  console.log(`Total Supplements: ${supplements.length}`);

  const peptidesEnriched = peptides.filter(p => p.typeData?.halfLife && p.typeData?.contraindications);
  const supplementsEnriched = supplements.filter(p => p.typeData?.halfLife || p.scientificName);

  console.log(`Enriched Peptides: ${peptidesEnriched.length} / ${peptides.length}`);
  console.log(`Enriched Supplements: ${supplementsEnriched.length} / ${supplements.length}`);

  console.log(`\n=== UNENRICHED PEPTIDES ===`);
  peptides.filter(p => !(p.typeData?.halfLife && p.typeData?.contraindications)).forEach(p => {
    console.log(`- ${p.name || p.id} (isActive: ${p.isActive})`);
  });

  console.log(`\n=== PROTOCOLS STATS ===`);
  const protoSnap = await db.collection('protocols').get();
  const protocols = protoSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`Total Protocols: ${protocols.length}`);
  
  const protoEnriched = protocols.filter(p => 
    p.expected_outcomes?.qualitative && 
    p.expected_outcomes.qualitative.length > 0 && 
    p.eligibility_rules?.indications &&
    p.eligibility_rules.indications.length > 0
  );
  console.log(`Enriched Protocols: ${protoEnriched.length} / ${protocols.length}`);

  console.log(`\n=== UNENRICHED PROTOCOLS ===`);
  protocols.filter(p => 
    !(p.expected_outcomes?.qualitative && 
      p.expected_outcomes.qualitative.length > 0 && 
      p.eligibility_rules?.indications &&
      p.eligibility_rules.indications.length > 0)
  ).forEach(p => {
    console.log(`- ${p.id} | ${p.title || p.protocol_title || ''}`);
  });
}

main().catch(e => { console.error(e); process.exit(1); });
