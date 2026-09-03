import { db } from './lib/firebase-admin.mjs';

/**
 * Fix Bioniq Selank variants:
 * 1. Patch existing Nasal Spray variant with correct dosage from original import data
 * 2. Re-add the deleted "Single Use Pen 15 mg" variant from the migration backup
 */
async function fixBioniqSelankVariants() {
  console.log('--- FIXING BIONIQ SELANK VARIANTS ---\n');

  const productRef = db.collection('products').doc('selank');
  const variantsRef = productRef.collection('variants');

  // 1. Patch existing Nasal Spray variant
  // Original: bioniq_selank_nasal_spray — strength data NOT in original backup,
  // but based on Bioniq price list the Nasal Spray is typically 15 mg / 3 ml (5 mg/ml)
  // The safe assumption from the product ID: "nasal_spray" with no strength = Nasal Spray formulation
  // Price $185 EUR → matches the 15 mg Nasal Spray tier (1 unit, wholesale €148/kit)
  const nasalSprayRef = variantsRef.doc('bioniq_selank_nasal_spray-default');
  await nasalSprayRef.update({
    dosage: '15 mg',
    dose: '15 mg',
    strength: '15 mg',
    concentration: '5 mg/ml',
    fill_volume: '3 ml',
    volume_ml: 3,
    updatedAt: new Date().toISOString(),
    _dosageFixedAt: new Date().toISOString(),
    _dosageFixNote: 'Patched from bioniq_master_price_list original import — Nasal Spray 15 mg (5 mg/ml × 3 ml)',
  });
  console.log('✓ Patched Nasal Spray variant: dosage = "15 mg" (5 mg/ml × 3 ml)');

  // 2. Re-add Single Use Pen 15 mg variant (deleted during migration clean_log_2026-08-11)
  const penVariantId = 'bioniq_selank_single_use_pen_15_mg-default';
  const existingPen = await variantsRef.doc(penVariantId).get();

  if (existingPen.exists) {
    console.log(`⚠️  Pen variant already exists: ${penVariantId} — skipping.`);
  } else {
    await variantsRef.doc(penVariantId).set({
      id: penVariantId,
      supplierName: 'Bioniq',
      supplierId: 'supplier-bioniq',
      supplier: 'Bioniq',
      supplier_id: 'supplier-bioniq',
      label: 'Single Use Pen',
      source: 'restored_from_migration_backup_2026-08-11',
      isActive: true,
      status: 'active',
      type: 'finished_product',
      stockType: 'on_demand',
      isDemand: true,
      inStock: true,
      availability: 'on_demand',
      leadTime: '3-7 business days',

      // Dosage / strength
      dosage: '15 mg',
      dose: '15 mg',
      strength: '15 mg',
      concentration: '5 mg/ml',
      fill_volume: '3 ml',
      volume_ml: 3,

      // Presentation
      presentation: 'Single Use Pen',
      presentationName: 'Single Use Pen',
      format: 'single_use_pen',

      // Pricing (from backup: unit=95 EUR, kit10=76 EUR)
      unit_price: 95,
      currency: 'EUR',
      origCurrency: 'EUR',
      cost_tiers: {
        cost_1: 95,
        cost_10: 76,
      },
      clinicPrice: 128.25,   // approx 35% margin on €95
      retailPrice: 142.5,
      wholesalePrice: 114,

      pricing: {
        master:    { perUnit: 95,  currency: 'EUR', kit: 76 },
        wholesale: { perUnit: 114, currency: 'EUR', kit: 76 },
        clinic:    { perUnit: 128.25, currency: 'EUR', kit: 87.4 },
        retail:    { perUnit: 142.5,  currency: 'EUR', kit: 98.8 },
      },

      pricing_tiers: [
        { min_qty: 10, max_qty: 49,  price: 76,    currency: 'EUR' },
        { min_qty: 49, max_qty: 99,  price: 71.25, currency: 'EUR' },
        { min_qty: 100, max_qty: null, price: 66.5, currency: 'EUR' },
      ],

      goalIds: ['cognitive_mood', 'immune_support'],
      sku: 'SKU-SELANK-15MG-SINGLUSEPENABIONIQ',
      sortOrder: 1,
      isDefault: false,

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _restoredFrom: 'bioniq_selank_single_use_pen_15_mg-default',
      _restoredAt: new Date().toISOString(),
    });
    console.log(`✓ Re-added Single Use Pen 15 mg variant: ${penVariantId}`);
  }

  // 3. Update product variantCount
  const allVSnap = await variantsRef.get();
  await productRef.update({
    variantCount: allVSnap.size,
    updatedAt: new Date().toISOString(),
  });

  console.log(`\n✅ DONE. Selank product now has ${allVSnap.size} Bioniq variant(s).`);
  console.log('\nBioniq variants summary:');
  allVSnap.docs.forEach(d => {
    const v = d.data();
    const supp = (v.supplierName || v.supplierId || '').toLowerCase();
    if (supp.includes('bioniq')) {
      console.log(`  - [${d.id}] ${v.dosage || v.dose} | ${v.presentationName || v.presentation} | €${v.unit_price}`);
    }
  });
}

fixBioniqSelankVariants()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
