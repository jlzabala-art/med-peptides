import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

const TARGET_SUPPLIERS = ['supplier-nplabs', 'supplier-europeptides', 'supplier-vallida', 'supplier-bioniq', 'supplier-lotusland'];

async function auditPricing() {
  console.log('=== AUDITING PRICING STRUCTURE & TIERS ACROSS ALL SUPPLIERS ===\n');

  const productsSnap = await db.collection('products').get();
  console.log(`Auditing ${productsSnap.size} total products...\n`);

  const report = {};

  TARGET_SUPPLIERS.forEach(sId => {
    report[sId] = {
      total: 0,
      hasUnitPrice: 0,
      hasWholesalePrice: 0,
      hasPricingTiers: 0,
      hasCostTiers: 0,
      variantsSynced: 0,
      missingPricing: 0,
      samples: []
    };
  });

  productsSnap.docs.forEach(doc => {
    const p = doc.data();
    const sId = p.supplierId;

    if (!report[sId]) return;

    const r = report[sId];
    r.total++;

    const unitPrice = p.pricing?.retail || p.originalPrice || p.retail_unit_price?.EUR || p.retail_unit_price?.USD || p.canonical_price_usd;
    const wholesalePrice = p.pricing?.wholesale || p.pricing?.volume10Kit || p.pricing?.supplierCost;
    const hasTiers = Array.isArray(p.pricing_tiers) && p.pricing_tiers.length > 0;
    const hasCostTiers = p.cost_tiers && Object.keys(p.cost_tiers).length > 0;

    if (unitPrice && unitPrice > 0) r.hasUnitPrice++;
    if (wholesalePrice && wholesalePrice > 0) r.hasWholesalePrice++;
    if (hasTiers) r.hasPricingTiers++;
    if (hasCostTiers) r.hasCostTiers++;

    if (!unitPrice && !wholesalePrice) {
      r.missingPricing++;
    }

    // Check variant sync
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      const v0 = p.variants[0];
      if (v0.unit_price && v0.unit_price > 0) {
        r.variantsSynced++;
      }
    }

    if (r.samples.length < 2) {
      r.samples.push({
        id: doc.id,
        name: p.name,
        unitPrice,
        wholesalePrice,
        pricing: p.pricing,
        pricing_tiers: p.pricing_tiers,
        cost_tiers: p.cost_tiers,
        variant0Price: p.variants?.[0]?.unit_price
      });
    }
  });

  console.table(Object.keys(report).map(sId => ({
    Supplier: sId,
    Total: report[sId].total,
    "With Unit Price": report[sId].hasUnitPrice,
    "With Wholesale": report[sId].hasWholesalePrice,
    "With Pricing Tiers": report[sId].hasPricingTiers,
    "With Cost Tiers": report[sId].hasCostTiers,
    "Variants Synced": report[sId].variantsSynced,
    "Missing Pricing": report[sId].missingPricing
  })));

  console.log('\n--- SAMPLE PRODUCT PRICING DETAILS ---');
  for (const sId of TARGET_SUPPLIERS) {
    console.log(`\n🔍 Supplier: ${sId}`);
    report[sId].samples.forEach(s => {
      console.log(`  - Product: "${s.name}" (${s.id})`);
      console.log(`    Unit Price: ${s.unitPrice}, Wholesale: ${s.wholesalePrice}, Variant 0 Unit Price: ${s.variant0Price}`);
      console.log(`    pricing:`, JSON.stringify(s.pricing || {}));
      console.log(`    pricing_tiers:`, JSON.stringify(s.pricing_tiers || []));
      console.log(`    cost_tiers:`, JSON.stringify(s.cost_tiers || {}));
    });
  }

  process.exit(0);
}

auditPricing().catch(console.error);
