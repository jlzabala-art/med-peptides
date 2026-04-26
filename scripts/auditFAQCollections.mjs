/**
 * auditFAQCollections.mjs — Audita peptide_faq y faq_peptide_mapping
 * Usage: node scripts/auditFAQCollections.mjs
 */
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
  } catch { initializeApp(); }
}
const db = getFirestore();

async function main() {
  // ── peptide_faq ──────────────────────────────────────────────────────────
  const faqSnap = await db.collection('peptide_faq').get();
  console.log(`\n📂 peptide_faq — ${faqSnap.docs.length} docs`);
  if (faqSnap.docs.length > 0) {
    const first = faqSnap.docs[0].data();
    console.log('   Keys:', Object.keys(first).join(', '));
    faqSnap.docs.slice(0, 5).forEach(d => {
      const data = d.data();
      const q = String(data.question || data.q || data.title || '(?)').slice(0, 70);
      const product = data.product_id || data.product_slug || data.peptide || data.related_product || '—';
      console.log(`   • [${d.id}] "${q}" → product: ${product}`);
    });
  }

  // ── faq_peptide_mapping ──────────────────────────────────────────────────
  const mappingSnap = await db.collection('faq_peptide_mapping').get();
  console.log(`\n📂 faq_peptide_mapping — ${mappingSnap.docs.length} docs`);
  if (mappingSnap.docs.length > 0) {
    const first = mappingSnap.docs[0].data();
    console.log('   Keys:', Object.keys(first).join(', '));
    mappingSnap.docs.slice(0, 5).forEach(d => {
      console.log(`   • [${d.id}]`, JSON.stringify(d.data()));
    });

    // Product coverage summary
    const productMap = new Map();
    mappingSnap.docs.forEach(d => {
      const data = d.data();
      const pid = data.productId || data.product_id || data.product_slug || '?';
      if (!productMap.has(pid)) productMap.set(pid, 0);
      productMap.set(pid, productMap.get(pid) + 1);
    });
    console.log('\n   Product coverage:');
    [...productMap.entries()].sort((a,b) => b[1]-a[1]).forEach(([pid, count]) => {
      console.log(`     ${pid.padEnd(30)} ${count} FAQs`);
    });
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  // Check which products in catalog have NO FAQs mapped
  const productSnap = await db.collection('products_canonical').get();
  const allProductIds = new Set(productSnap.docs.map(d => d.id));
  const mappedIds = new Set();
  if (mappingSnap.docs.length > 0) {
    mappingSnap.docs.forEach(d => {
      const data = d.data();
      const pid = data.productId || data.product_id || data.product_slug;
      if (pid) mappedIds.add(pid);
    });
  }
  const unmapped = [...allProductIds].filter(id => !mappedIds.has(id));
  console.log(`\n⚠️  Products with NO FAQs mapped (${unmapped.length}/${allProductIds.size}):`);
  unmapped.forEach(id => console.log(`   - ${id}`));
}

main().catch(e => { console.error(e); process.exit(1); });
