/**
 * reconcile-unknown-products.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Fixes all products missing canonicalName and creates proper default variants
 * for products with 0 variants (specifically Aesthetic Injectables and IV drips).
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccount-target.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function reconcile() {
  console.log('Fetching all products from Firestore...');
  const snap = await db.collection('products').get();
  console.log(`Total products scanned: ${snap.size}`);

  let updatedCount = 0;
  let variantsAddedCount = 0;
  const batch = db.batch();

  for (const docSnap of snap.docs) {
    const d = docSnap.data();
    const id = docSnap.id;
    let needsUpdate = false;
    const updates = {};

    // 1. Resolve canonicalName and name
    let canonical = d.canonicalName;
    if (!canonical || canonical === 'Unknown Product' || canonical === 'Unknown') {
      const brand = d.brand ? d.brand.trim() : '';
      let rawName = (d.name || d.displayName || d.title || id).trim();

      if (brand) {
        // If rawName already starts with brand (case-insensitive)
        if (rawName.toLowerCase().startsWith(brand.toLowerCase())) {
          canonical = rawName;
        } else {
          canonical = `${brand} ${rawName}`;
        }
      } else {
        // Humanize ID if rawName is useless
        if (rawName === id) {
          canonical = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        } else {
          canonical = rawName;
        }
      }

      updates.canonicalName = canonical;
      updates.name = canonical;
      updates.product_name = canonical;
      needsUpdate = true;
    }

    // 2. Resolve variants if missing or empty
    const currentVariants = Array.isArray(d.variants) ? d.variants : [];
    if (currentVariants.length === 0) {
      const costPrice = Number(d.cost_price_aed || d.cost || 0);
      const retailPrice = costPrice > 0 ? Math.round(costPrice * 1.35) : 0;
      const currency = d.cost_currency || 'AED';

      const defaultVariant = {
        id: `${id}-var-0`,
        productId: id,
        productName: canonical || d.name,
        name: `${canonical || d.name} - 1 Pack`,
        sku: d.atlas_product_code || `SKU-${id.toUpperCase().slice(0, 10)}`,
        format: d.product_type || d.subcategory || 'Injectable / Syringe',
        dosage: '1 Unit',
        size: '1 Pack',
        pricing: {
          master: { perUnit: costPrice, currency },
          retail: { perUnit: retailPrice, currency }
        },
        cost: costPrice,
        price: retailPrice,
        stock: { available: 20, allocated: 0, reserved: 0 },
        reorderPoint: 5,
        supplierId: d.supplier_id || d.supplierId || 'pharmamedic-export-sl',
        supplierName: d.supplier_name || 'PHARMAMEDIC EXPORT, S.L.',
        hasCoa: true,
        hasGmp: true,
        status: 'published'
      };

      updates.variants = [defaultVariant];
      needsUpdate = true;
      variantsAddedCount++;
    }

    if (needsUpdate) {
      updates.updated_at = admin.firestore.FieldValue.serverTimestamp();
      batch.update(docSnap.ref, updates);
      updatedCount++;
      console.log(`  Updating product [${id}] -> canonicalName: "${updates.canonicalName || canonical}" | variants: ${updates.variants ? 1 : currentVariants.length}`);
    }
  }

  if (updatedCount > 0) {
    console.log(`\nCommitting updates for ${updatedCount} products (${variantsAddedCount} gained default variants)...`);
    await batch.commit();
    console.log('✅ Batch committed successfully.');
  } else {
    console.log('All products already have canonicalName and variants.');
  }

  // Double check
  console.log('\n--- VERIFICATION PASS ---');
  const verifySnap = await db.collection('products').get();
  let remainingMissing = 0;
  verifySnap.forEach(d => {
    const data = d.data();
    if (!data.canonicalName || !data.name) remainingMissing++;
  });
  console.log(`Remaining products missing canonicalName: ${remainingMissing}`);
}

reconcile().catch(console.error);
