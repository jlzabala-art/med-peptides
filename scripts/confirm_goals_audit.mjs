import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8')
);
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function isSupplyOrAuxiliary(name = '', slug = '', category = '') {
  const text = `${name} ${slug} ${category}`.toLowerCase();
  return (
    text.includes('bacteriostatic') ||
    text.includes('bac water') ||
    text.includes('syringe') ||
    text.includes('jeringa') ||
    text.includes('needle') ||
    text.includes('sterile water') ||
    text.includes('wipe') ||
    text.includes('swab')
  );
}

function hasValidGoal(doc) {
  const g = doc.goals || doc.goalIds || doc.canonicalGoals || doc.goal || doc.category;
  if (Array.isArray(g)) {
    return g.filter(item => item && String(item).trim() !== '').length > 0;
  }
  return Boolean(g && String(g).trim() !== '' && String(g).trim().toLowerCase() !== 'all');
}

async function runAudit() {
  console.log('🔍 Auditing Products & Protocols in Firestore...\n');

  // 1. Audit Products
  const productsSnap = await db.collection('products').get();
  console.log(`📦 Total Products in Firestore: ${productsSnap.size}`);

  const productsMissingGoals = [];
  const suppliesExempted = [];
  let productsWithGoalsCount = 0;

  productsSnap.forEach(doc => {
    const data = doc.data();
    const name = data.canonicalName || data.name || doc.id;
    const slug = data.slug || doc.id;
    const category = data.category || data.therapeutic_category || '';

    if (isSupplyOrAuxiliary(name, slug, category)) {
      suppliesExempted.push({ id: doc.id, name, slug });
      return;
    }

    if (hasValidGoal(data)) {
      productsWithGoalsCount++;
    } else {
      productsMissingGoals.push({
        id: doc.id,
        name,
        slug,
        category: data.category,
        type: data.type
      });
    }
  });

  console.log(`✅ Products with Goal: ${productsWithGoalsCount}`);
  console.log(`🛡️  Supplies / Auxiliary (BAC water, Syringes exempted): ${suppliesExempted.length}`);
  suppliesExempted.forEach(s => console.log(`   - [EXEMPTED SUPPLY] ${s.name} (${s.id})`));

  if (productsMissingGoals.length > 0) {
    console.log(`\n⚠️  Products Missing Goals: ${productsMissingGoals.length}`);
    productsMissingGoals.slice(0, 30).forEach(p => console.log(`   - ${p.name} (id: ${p.id}, cat: ${p.category})`));
  } else {
    console.log(`\n🎉 ALL non-supply products have valid goals!`);
  }

  // 2. Audit Protocols
  console.log('\n─────────────────────────────────────────────────────────────');
  const protocolsSnap = await db.collection('protocols').get();
  console.log(`📋 Total Protocols in Firestore: ${protocolsSnap.size}`);

  const protocolsMissingGoals = [];
  let protocolsWithGoalsCount = 0;

  protocolsSnap.forEach(doc => {
    const data = doc.data();
    const name = data.name || data.protocol_name || data.title || doc.id;

    if (hasValidGoal(data)) {
      protocolsWithGoalsCount++;
    } else {
      protocolsMissingGoals.push({
        id: doc.id,
        name,
        slug: data.slug || doc.id,
        goals: data.goals,
        category: data.category
      });
    }
  });

  console.log(`✅ Protocols with Goal: ${protocolsWithGoalsCount}`);

  if (protocolsMissingGoals.length > 0) {
    console.log(`\n⚠️  Protocols Missing Goals: ${protocolsMissingGoals.length}`);
    protocolsMissingGoals.forEach(p => console.log(`   - ${p.name} (id: ${p.id})`));
  } else {
    console.log(`\n🎉 ALL protocols have valid goals!`);
  }

  console.log('\nAudit complete.');
  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
