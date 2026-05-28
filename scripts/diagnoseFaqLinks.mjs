/**
 * diagnoseFaqLinks.mjs
 * Shows the real data structure of products and FAQs in Firestore
 * to diagnose why product-specific FAQs aren't being found.
 *
 * Usage: node scripts/diagnoseFaqLinks.mjs
 */

import { db } from './lib/firebase-admin.mjs';


async function main() {
  console.log('\n========== DIAGNOSING FAQ ↔ PRODUCT LINKS ==========\n');

  // 1. Sample some products — check for faq_ids field
  console.log('── PRODUCTS (first 5) ──');
  const prodSnap = await db.collection('products').limit(5).get();
  prodSnap.docs.forEach(d => {
    const data = d.data();
    console.log(`  [${d.id}] ${data.name || '?'}`);
    console.log(`    faq_ids:     ${JSON.stringify(data.faq_ids)}`);
    console.log(`    product_ids: n/a (on product doc)`);
    console.log(`    variants:    ${Array.isArray(data.variants) ? data.variants.length + ' items' : 'none'}`);
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      data.variants.slice(0, 2).forEach((v, i) => {
        console.log(`      variant[${i}]: ${JSON.stringify(v)}`);
      });
    }
    console.log('');
  });

  // 2. Sample some FAQs — check for product_ids and relatedPeptideNames
  console.log('\n── FAQs (first 10) ──');
  const faqSnap = await db.collection('peptide_faq').limit(10).get();
  faqSnap.docs.forEach(d => {
    const data = d.data();
    console.log(`  [${d.id}]`);
    console.log(`    question:            ${(data.question || data.q || '').slice(0, 60)}`);
    console.log(`    product_ids:         ${JSON.stringify(data.product_ids)}`);
    console.log(`    relatedPeptideNames: ${JSON.stringify(data.relatedPeptideNames)}`);
    console.log(`    is_global:           ${data.is_global}`);
    console.log(`    active:              ${data.active}`);
    console.log(`    visibility:          ${data.visibility}`);
    console.log('');
  });

  console.log('\n========== DONE ==========\n');
}

main().catch(console.error);
