/**
 * audit-variants.mjs
 * 
 * Scans all products in the canonical `products/` collection and checks
 * which ones have the `variants/` subcollection and which don't.
 * 
 * Usage: node --experimental-modules scripts/audit-variants.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[match[1].trim()] = val;
  }
}

const projectId = envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID || envVars.FIREBASE_PROJECT_ID;
const clientEmail = envVars.FIREBASE_CLIENT_EMAIL;
let privateKey = envVars.FIREBASE_PRIVATE_KEY || '';
// Handle escaped newlines
privateKey = privateKey.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase credentials in .env.local');
  process.exit(1);
}

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
  projectId,
});

const db = getFirestore(app);

async function main() {
  console.log('🔍 Scanning all products in canonical collection...\n');

  const productsSnap = await db.collection('products').get();
  console.log(`Total products: ${productsSnap.size}\n`);

  const withVariants = [];
  const withoutVariants = [];
  const supplierStats = {}; // supplierId -> { withVariants: [], withoutVariants: [] }

  // Batch check: for each product, check if it has a variants subcollection
  const BATCH = 30;
  const docs = productsSnap.docs;

  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH);
    await Promise.all(batch.map(async (productDoc) => {
      const data = productDoc.data();
      const productId = productDoc.id;
      const name = data.canonicalName || data.name || productId;
      const suppliers = data.availableSuppliers || [];
      const supplierId = data.supplierId || '';

      // Check subcollection
      const variantsSnap = await productDoc.ref.collection('variants').limit(1).get();
      const hasSubcollection = !variantsSnap.empty;

      // Check embedded variants field
      const hasEmbedded = Array.isArray(data.variants) && data.variants.length > 0;

      const info = {
        id: productId,
        name,
        suppliers,
        supplierId,
        category: data.category || '',
        hasSubcollection,
        hasEmbedded,
        embeddedCount: Array.isArray(data.variants) ? data.variants.length : 0,
        status: data.status || 'unknown',
      };

      if (hasSubcollection) {
        withVariants.push(info);
      } else {
        withoutVariants.push(info);
      }

      // Supplier tracking
      const allSuppliers = new Set([...suppliers, supplierId].filter(Boolean));
      for (const sid of allSuppliers) {
        if (!supplierStats[sid]) supplierStats[sid] = { withVariants: [], withoutVariants: [] };
        if (hasSubcollection) {
          supplierStats[sid].withVariants.push(productId);
        } else {
          supplierStats[sid].withoutVariants.push(productId);
        }
      }
    }));
  }

  console.log(`✅ Products WITH variants subcollection: ${withVariants.length}`);
  console.log(`❌ Products WITHOUT variants subcollection: ${withoutVariants.length}`);
  console.log();

  console.log('=== PRODUCTS WITHOUT VARIANTS SUBCOLLECTION ===');
  for (const p of withoutVariants.sort((a, b) => a.name.localeCompare(b.name))) {
    const embeddedNote = p.hasEmbedded ? ` (has ${p.embeddedCount} embedded variants)` : '';
    console.log(`  ${p.id}: ${p.name} | category=${p.category} | suppliers=${p.suppliers.join(',')}${embeddedNote}`);
  }
  console.log();

  console.log('=== SUPPLIER SUMMARY ===');
  for (const [sid, stats] of Object.entries(supplierStats).sort()) {
    const total = stats.withVariants.length + stats.withoutVariants.length;
    const missing = stats.withoutVariants.length;
    const pct = total > 0 ? Math.round((missing / total) * 100) : 0;
    const emoji = missing === 0 ? '✅' : '⚠️';
    console.log(`  ${emoji} ${sid}: ${total} products total, ${missing} missing variants (${pct}%)`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
