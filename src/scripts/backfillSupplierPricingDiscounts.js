import { adminDb } from '../lib/firebaseAdmin.js';

async function backfillSupplierPricing() {
  console.log("=================================================================");
  console.log("  BACKFILLING AUTHORIZED SUPPLIER PRICING & DISCOUNTS SCHEMA     ");
  console.log("=================================================================");

  if (!adminDb) {
    console.error("❌ Firebase Admin DB not initialized.");
    process.exit(1);
  }

  const productsSnap = await adminDb.collection('products').get();
  console.log(`📦 Found ${productsSnap.size} products in Firestore.`);

  let updatedCount = 0;
  let batch = adminDb.batch();
  let batchOpCount = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const docId = doc.id;
    const name = data.name || '';
    const isCalcitonin = name.toLowerCase().includes('calcitonin');

    const variants = (data.variants || []).map((v, vIdx) => {
      const existingCost = Number(v.pricing?.supplierCost || v.supplierCost || v.costPrice || data.pricing?.supplierCost || 75.0);

      if (isCalcitonin) {
        return {
          ...v,
          supplier: 'Lotus Land',
          supplierName: 'Lotus Land',
          format: 'bulk_powder_gram',
          supplierPricing: {
            listPrice: 3100.00,
            discountPercent: 25.0,
            discountAmount: 775.00,
            netCost: 2325.00,
            currency: 'USD',
            unitOfMeasure: 'g',
            supplierId: 'lotus-land',
            supplierName: 'Lotus Land',
            moq: 5,
            agreementNotes: 'Lotus Land Volume Agreement (-25% Discount on Bulk Peptide APIs)',
            lastQuotationDate: '2026-08-19'
          },
          pricing: {
            ...(v.pricing || {}),
            supplierCost: 2325.00
          }
        };
      }

      // Standard historical product: no discount initially, listPrice equals netCost
      return {
        ...v,
        supplierPricing: {
          listPrice: existingCost,
          discountPercent: 0,
          discountAmount: 0,
          netCost: existingCost,
          currency: 'USD',
          unitOfMeasure: v.format === 'bulk_powder_gram' ? 'g' : 'vial',
          supplierId: data.supplierId || 'fagron',
          supplierName: data.supplier || data.supplierName || 'Fagron Compounding',
          agreementNotes: 'Initial Standard Catalog Cost (No historical discount recorded)'
        },
        pricing: {
          ...(v.pricing || {}),
          supplierCost: existingCost
        }
      };
    });

    const productSupplierPricing = isCalcitonin
      ? {
          listPrice: 3100.00,
          discountPercent: 25.0,
          discountAmount: 775.00,
          netCost: 2325.00,
          currency: 'USD',
          unitOfMeasure: 'g',
          supplierId: 'lotus-land',
          supplierName: 'Lotus Land',
          moq: 5,
          agreementNotes: 'Lotus Land Volume Agreement (-25% Discount on Bulk Peptide APIs)',
          lastQuotationDate: '2026-08-19'
        }
      : {
          listPrice: Number(data.pricing?.supplierCost || data.supplierCost || 75.0),
          discountPercent: 0,
          discountAmount: 0,
          netCost: Number(data.pricing?.supplierCost || data.supplierCost || 75.0),
          currency: 'USD',
          unitOfMeasure: data.productType === 'raw_material' ? 'g' : 'vial',
          supplierId: data.supplierId || 'fagron',
          supplierName: data.supplier || data.supplierName || 'Fagron Compounding',
          agreementNotes: 'Initial Standard Catalog Cost (No historical discount recorded)'
        };

    const docRef = adminDb.collection('products').doc(docId);
    batch.update(docRef, {
      variants,
      supplierPricing: productSupplierPricing,
      updatedAt: new Date()
    });

    batchOpCount++;
    updatedCount++;

    if (batchOpCount >= 400) {
      await batch.commit();
      console.log(`✓ Committed batch of ${batchOpCount} product updates.`);
      batch = adminDb.batch();
      batchOpCount = 0;
    }
  }

  // Also ensure a dedicated Calcitonin Raw Material document exists in Firestore if not already present
  const calcitoninQuery = await adminDb.collection('products').where('name', '==', 'Calcitonin Peptide (Bulk API)').get();
  if (calcitoninQuery.empty) {
    const newRef = adminDb.collection('products').doc('lotus-calcitonin-raw-api');
    batch.set(newRef, {
      id: 'lotus-calcitonin-raw-api',
      name: 'Calcitonin Peptide (Bulk API)',
      canonicalName: 'calcitonin-peptide-bulk-api',
      productType: 'raw_material',
      category: 'Peptides',
      subcategory: 'Bulk Peptide APIs & Raw Materials',
      description: 'High-purity Calcitonin peptide bulk lyophilized powder API for sterile pharmaceutical compounding.',
      supplier: 'Lotus Land',
      supplierName: 'Lotus Land',
      status: 'published',
      isActive: true,
      requiresColdChain: true,
      requiresPrescription: true,
      supplierPricing: {
        listPrice: 3100.00,
        discountPercent: 25.0,
        discountAmount: 775.00,
        netCost: 2325.00,
        currency: 'USD',
        unitOfMeasure: 'g',
        supplierId: 'lotus-land',
        supplierName: 'Lotus Land',
        moq: 5,
        agreementNotes: 'Lotus Land Volume Agreement (-25% Discount on Bulk Peptide APIs)',
        lastQuotationDate: '2026-08-19'
      },
      variants: [
        {
          id: 'var-calcitonin-5g',
          name: 'Calcitonin Bulk API 5g',
          dosage: '5g Lyophilized Powder',
          format: 'bulk_powder_gram',
          supplier: 'Lotus Land',
          supplierName: 'Lotus Land',
          stock: 5,
          inStock: true,
          purity: 99.2,
          moq: 5,
          supplierPricing: {
            listPrice: 3100.00,
            discountPercent: 25.0,
            discountAmount: 775.00,
            netCost: 2325.00,
            currency: 'USD',
            unitOfMeasure: 'g',
            supplierId: 'lotus-land',
            supplierName: 'Lotus Land',
            moq: 5,
            agreementNotes: 'Lotus Land Volume Agreement (-25% Discount on Bulk Peptide APIs)',
            lastQuotationDate: '2026-08-19'
          },
          pricing: {
            masterPrice: { base: 2325.00, currency: 'USD' },
            clinicPrice: { base: 3500.00, currency: 'USD' },
            wholesalePrice: { base: 2900.00, currency: 'USD' },
            retailPrice: { base: 4200.00, currency: 'USD' },
            supplierCost: 2325.00
          }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    batchOpCount++;
  }

  if (batchOpCount > 0) {
    await batch.commit();
    console.log(`✓ Committed final batch of ${batchOpCount} product updates.`);
  }

  console.log(`\n🎉 Successfully backfilled supplierPricing across ${updatedCount} products in Firestore!`);
  console.log("  - Lotus Land Calcitonin: List $3,100.00 | Discount -25% | Net Cost $2,325.00 / g");
  console.log("  - All other historical products: List Price == Net Cost (0% discount initially).");
}

backfillSupplierPricing()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Pipeline failed:", err);
    process.exit(1);
  });
