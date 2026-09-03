import { adminDb } from '../lib/firebaseAdmin.js';

async function fixCalcitoninPricing() {
  console.log("Fixing Calcitonin full pricing and discount structure in Firestore...");

  const calcitoninRef = adminDb.collection('products').doc('lotus-calcitonin-raw-api');
  const doc = await calcitoninRef.get();

  if (!doc.exists) {
    console.error("Calcitonin doc not found");
    return;
  }

  const data = doc.data();
  const suppPricing = data.supplierPricing || {
    listPrice: 3100,
    discountPercent: 25,
    discountAmount: 775,
    netCost: 2325,
    currency: 'USD',
    unitOfMeasure: 'g',
    supplierId: 'lotus-land',
    supplierName: 'Lotus Land',
    moq: 5,
    agreementNotes: 'Lotus Land Volume Agreement (-25% Discount on Bulk Peptide APIs)',
    lastQuotationDate: '2026-08-19'
  };

  const updatedVariant = {
    id: 'var-calcitonin-5g',
    name: 'Calcitonin Bulk API 5g',
    dosage: '5g Lyophilized Powder',
    weight: '5g',
    moq: 5,
    format: 'bulk_powder_gram',
    presentation: 'bulk_powder_gram',
    presentationName: 'Bulk Powder (g)',
    supplier: 'Lotus Land',
    supplierName: 'Lotus Land',
    supplierId: 'lotus-land',
    stock: 0,
    inStock: false,
    purity: '98% HPLC',
    purityPercentage: 98,
    unit_price: 2325,
    price: 2325,
    priceUSD: 2325,
    supplierCost: 2325,
    cost_1: 2325,
    cost_10: 11625, // 5g * 2325 = $11,625 total batch cost
    cost_50: 22000,
    cost_100: 40000,
    cost_tiers: {
      cost_1: 2325,
      cost_10: 11625,
      cost_50: 22000,
      cost_100: 40000
    },
    supplierPricing: suppPricing,
    pricing: {
      masterPrice: { base: 2325, currency: 'USD' },
      cost_tiers: { cost_1: 2325, cost_10: 11625, cost_50: 22000, cost_100: 40000 },
      clinicPrice: { base: 3500, currency: 'USD' },
      wholesalePrice: { base: 2900, currency: 'USD' },
      retailPrice: { base: 4200, currency: 'USD' },
      supplierCost: 2325
    },
    hasCOA: true,
    coa_available: true,
    updatedAt: new Date()
  };

  // 1. Update parent doc array
  await calcitoninRef.update({
    supplierPricing: suppPricing,
    variants: [updatedVariant],
    costPrice: 2325,
    unit_price: 2325,
    price: 2325,
    updatedAt: new Date()
  });

  // 2. Update subcollection doc
  await calcitoninRef.collection('variants').doc('var-calcitonin-5g').set(updatedVariant, { merge: true });

  console.log("✓ Successfully updated Calcitonin pricing ($2325/g, Batch Cost $11,625, 25% discount Lotus Land) in both parent and subcollection!");
}

fixCalcitoninPricing()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
