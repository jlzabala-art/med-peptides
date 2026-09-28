import fs from 'fs';
import path from 'path';
import { adminDb } from '../src/lib/firebaseAdmin.js';
import { resolveVariantPrice } from '../src/utils/resolvePrice.js';
import { PRICING_TIER } from '../src/constants/productEnums.js';

// Load bioblend parsed data
const dataFilePath = path.join(process.cwd(), 'scripts', 'bioblend_catalog_data.json');
const bioblendData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

// Build lookup map from BioBlend raw data: item name / canonical name -> variants with prices
const bioblendMap = new Map();
for (const [phaseKey, items] of Object.entries(bioblendData)) {
  for (const item of items) {
    const keys = [
      item.name.toLowerCase().trim(),
      item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      (item.canonicalName || '').toLowerCase().trim(),
      (item.canonicalName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    ].filter(Boolean);

    for (const k of keys) {
      if (!bioblendMap.has(k)) {
        bioblendMap.set(k, item);
      }
    }
  }
}

async function reconcile() {
  console.log('Fetching all products from Firestore...');
  const snap = await adminDb.collection('products').get();
  console.log(`Found ${snap.size} products total.`);

  let magentaProductDocs = [];
  let totalMagentaVariants = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const variants = data.variants || [];
    const magVars = variants.filter(v => v.supplierId === 'supplier-magenta');

    if (magVars.length > 0) {
      magentaProductDocs.push({ doc, data, magVars });
      totalMagentaVariants += magVars.length;
    }
  }

  console.log(`Found ${magentaProductDocs.length} products containing ${totalMagentaVariants} Magenta variants.`);

  const batchSize = 100;
  let batch = adminDb.batch();
  let opCount = 0;

  for (const { doc, data, magVars } of magentaProductDocs) {
    // 1. Ensure supplierIds contains 'supplier-magenta'
    const existingSupplierIds = Array.isArray(data.supplierIds) ? data.supplierIds : [];
    const updatedSupplierIds = Array.from(new Set([...existingSupplierIds, 'supplier-magenta']));

    // 2. Lookup in BioBlend data if available
    const lookupKeys = [
      doc.id.toLowerCase(),
      (data.slug || '').toLowerCase(),
      (data.name || '').toLowerCase().trim(),
      (data.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      (data.canonicalName || '').toLowerCase().trim(),
      (data.canonicalName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    ];

    let bioblendItem = null;
    for (const k of lookupKeys) {
      if (bioblendMap.has(k)) {
        bioblendItem = bioblendMap.get(k);
        break;
      }
    }

    // 3. Normalize all variants of this product
    const allVariants = data.variants || [];
    const updatedVariants = allVariants.map(v => {
      if (v.supplierId !== 'supplier-magenta') return v;

      // Determine correct AED price
      let clinicAed = Number(v.price_aed || v.clinic_price_aed || v.costPrice || v.price || 0);

      // Check if bioblend item has exact variant match
      if (bioblendItem && Array.isArray(bioblendItem.variants)) {
        const vDoseNorm = String(v.dosage || v.dose || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const vFormatNorm = String(v.presentation || v.format || '').toLowerCase();

        const matchedRaw = bioblendItem.variants.find(bv => {
          const bvDoseNorm = String(bv.dose || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const bvFormatNorm = String(bv.format || '').toLowerCase();
          return bvDoseNorm === vDoseNorm && (bvFormatNorm === vFormatNorm || (vFormatNorm === 'cartridge' && bv.refill_price_aed));
        });

        if (matchedRaw) {
          if (vFormatNorm === 'cartridge' && matchedRaw.refill_price_aed) {
            clinicAed = Number(matchedRaw.refill_price_aed);
          } else if (matchedRaw.clinic_price_aed) {
            clinicAed = Number(matchedRaw.clinic_price_aed);
          }
        }
      }

      // If price was erroneously converted (e.g. 92.64 instead of 340), check if it's 340/3.6725
      if (clinicAed > 0 && clinicAed < 100 && (clinicAed * 3.6725 > 120)) {
        const candidateAed = Math.round(clinicAed * 3.6725);
        // Common standard prices in the BioBlend price list: 340, 405, 440, 520, 600, 750, 850, etc.
        if ([340, 405, 440, 500, 520, 600, 750, 850, 1100, 1200, 1400, 1500, 1600, 1700, 1800, 1900, 2400].includes(candidateAed)) {
          clinicAed = candidateAed;
        }
      }

      let patientAed = Number(v.patientPrice_aed || v.patientPrice || 0);
      if (!patientAed || patientAed <= clinicAed) {
        patientAed = Math.round(clinicAed * 1.5);
      }

      // Canonical pricing object in AED
      const pricingObj = {
        master: { perUnit: clinicAed, currency: 'AED', kit: clinicAed * 10 },
        wholesale: { perUnit: clinicAed, currency: 'AED', kit: clinicAed * 10 },
        clinic: { perUnit: clinicAed, currency: 'AED', kit: clinicAed * 10 },
        retail: { perUnit: patientAed, currency: 'AED', kit: patientAed * 10 }
      };

      return {
        ...v,
        currency: 'AED',
        price_aed: clinicAed,
        costPrice: clinicAed,
        trade_price: clinicAed,
        clinicPrice: clinicAed,
        price: clinicAed,
        cost_1: clinicAed,
        unit_price: clinicAed,
        patientPrice_aed: patientAed,
        patientPrice: patientAed,
        pricing: pricingObj,
        status: v.status || 'active',
        inStock: v.inStock !== false,
        updatedAt: new Date().toISOString()
      };
    });

    // Write updated product doc
    const productUpdates = {
      supplierIds: updatedSupplierIds,
      supplierId: data.supplierId || 'supplier-magenta',
      supplierName: data.supplierName || 'Magenta',
      status: data.status === 'archived' ? 'archived' : 'active',
      variants: updatedVariants,
      updatedAt: new Date().toISOString()
    };

    batch.set(doc.ref, productUpdates, { merge: true });
    opCount++;

    // Also update variants in subcollection
    const magUpdated = updatedVariants.filter(v => v.supplierId === 'supplier-magenta');
    for (const uv of magUpdated) {
      const vRef = doc.ref.collection('variants').doc(uv.id);
      batch.set(vRef, uv, { merge: true });
      opCount++;
      if (opCount >= batchSize) {
        await batch.commit();
        batch = adminDb.batch();
        opCount = 0;
      }
    }

    if (opCount >= batchSize) {
      await batch.commit();
      batch = adminDb.batch();
      opCount = 0;
    }
  }

  if (opCount > 0) {
    await batch.commit();
    opCount = 0;
  }

  console.log(`✅ Updated ${magentaProductDocs.length} product documents and subcollections.`);

  // 4. Update supplier metadata
  await adminDb.collection('suppliers').doc('supplier-magenta').set({
    id: 'supplier-magenta',
    name: 'Magenta',
    displayName: 'Magenta',
    companyName: 'Magenta Medical Supplies & Compounding',
    currency: 'AED',
    defaultCurrency: 'AED',
    status: 'active',
    productsSupplied: magentaProductDocs.length,
    variantsSupplied: totalMagentaVariants,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ Updated suppliers/supplier-magenta record.');

  // 5. Create or Update CAT-MAGENTA-MASTER in shared_catalog_links
  const sharedLinkPayload = {
    id: 'CAT-MAGENTA-MASTER',
    catalogId: 'CAT-MAGENTA-MASTER',
    catalogCode: 'RP-MAG-2026-366',
    supplierId: 'supplier-magenta',
    supplierIds: ['supplier-magenta'],
    currency: 'AED',
    catalogueFilter: 'Magenta',
    priceSource: 'cost',
    priceMarkupPercent: 0,
    markupPercent: 0,
    validityDays: 90,
    recipientName: 'BioBlend / Magenta Master Portfolio',
    recipientType: 'clinic',
    accountManagerName: 'Atlas Commercial Desk',
    accountManagerEmail: 'orders@atlas-solutions.com',
    targetAudience: 'Certified Medical Practitioners & Clinics',
    shortUrl: 'https://med-peptides.com/c/CAT-MAGENTA-MASTER',
    shareableUrl: 'https://med-peptides.com/c/CAT-MAGENTA-MASTER',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Official Master Catalog covering all 366 compounded peptide and clinical variants (BioBlend Price List August 2026).'
  };

  await adminDb.collection('shared_catalog_links').doc('CAT-MAGENTA-MASTER').set(sharedLinkPayload, { merge: true });
  console.log('✅ Created/Updated shared_catalog_links/CAT-MAGENTA-MASTER document.');

  // 6. Test verification query as performed by shared catalog loader
  console.log('\n🔍 Verifying fetchCatalogData behavior for CAT-MAGENTA-MASTER...');
  const testQuery = await adminDb.collection('products')
    .where('status', 'in', ['active', 'published', 'out of stock'])
    .where('supplierIds', 'array-contains', 'supplier-magenta')
    .get();

  console.log(`Fetched products count: ${testQuery.size}`);

  let testVariantsCount = 0;
  let samplePricing = [];
  testQuery.forEach(d => {
    const p = d.data();
    const mag = (p.variants || []).filter(v => v.supplierId === 'supplier-magenta');
    testVariantsCount += mag.length;
    if (samplePricing.length < 5 && mag.length > 0) {
      const v = mag[0];
      const resMaster = resolveVariantPrice(v, { tier: PRICING_TIER.MASTER });
      const resClinic = resolveVariantPrice(v, { tier: PRICING_TIER.CLINIC });
      samplePricing.push({
        product: p.name,
        variant: v.presentationName || v.presentation,
        dose: v.dosage,
        resolvedMaster: `${resMaster.perUnit} ${resMaster.currency}`,
        resolvedClinic: `${resClinic.perUnit} ${resClinic.currency}`
      });
    }
  });

  console.log(`Verified total Magenta variants: ${testVariantsCount}`);
  console.log('Sample resolved prices:', samplePricing);
}

reconcile()
  .then(() => {
    console.log('\n🎉 Reconcile completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Reconcile failed:', err);
    process.exit(1);
  });
