/**
 * auditFAQs.mjs — Audita las colecciones de FAQs en Firestore
 * Usage: node scripts/auditFAQs.mjs
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

async function auditCollection(name) {
  try {
    const snap = await db.collection(name).limit(50).get();
    if (snap.empty) { console.log(`  ❌ "${name}" — vacía o no existe`); return; }
    console.log(`\n📂 "${name}" — ${snap.docs.length} docs`);
    // Show field keys of first doc + any product linkage
    const first = snap.docs[0].data();
    console.log('   Keys:', Object.keys(first).join(', '));
    // Check for product reference fields
    const productFields = Object.keys(first).filter(k =>
      k.includes('product') || k.includes('slug') || k.includes('tag') || k.includes('category')
    );
    console.log('   Product-related fields:', productFields.length ? productFields.join(', ') : '(none)');

    // Sample a few docs showing product linkage
    snap.docs.slice(0, 3).forEach(d => {
      const data = d.data();
      const question = data.question || data.title || data.q || '(no question field)';
      const productRef = data.product_id || data.product_slug || data.related_product || data.tags || '—';
      console.log(`   • [${d.id}] Q: "${String(question).slice(0, 60)}" → product: ${JSON.stringify(productRef)}`);
    });
  } catch (e) {
    console.log(`  ⚠️  "${name}" — error:`, e.message);
  }
}

async function main() {
  // Try common FAQ collection names
  const candidates = ['faqs', 'faq', 'FAQs', 'FAQ', 'product_faqs', 'knowledge_base', 'articles'];
  for (const name of candidates) {
    await auditCollection(name);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
