import { adminDb } from '../../../../lib/firebaseAdmin';
import { NextResponse } from 'next/server';

const PRESENTATION_MAP = {
  'vial': 'vial',
  'capsule': 'capsule',
  'nasal spray': 'nasal_spray',
  'sustained release': 'capsule',
  'cream tube': 'cream',
  'cream': 'cream'
};

function resolvePresentation(raw) {
  if (!raw) return 'vial';
  const clean = String(raw).toLowerCase().trim();
  return PRESENTATION_MAP[clean] || 'vial';
}

function getPresentationName(presKey) {
  switch (presKey) {
    case 'pen': return 'Pre-filled Pen';
    case 'nasal_spray': return 'Nasal Spray';
    case 'capsule': return 'Capsule';
    case 'cream': return 'Topical Cream';
    default: return 'Vial';
  }
}

export async function POST(request) {
  if (!adminDb) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const masterProducts = body.master_products || [];
    const fusionSupplierId = 'supplier-fusion';

    // 1. Pre-fetch all products ONCE for O(1) matching
    const productsSnap = await adminDb.collection('products').get();
    const productDocsMap = new Map();
    productsSnap.forEach(d => {
      const data = d.data();
      const cName = (data.canonicalName || data.name || '').toLowerCase();
      productDocsMap.set(cName, d.ref);
      productDocsMap.set(d.id.toLowerCase(), d.ref);
    });

    let updatedCount = 0;
    const updatePromises = [];

    for (const item of masterProducts) {
      const mpName = item.master_product?.display_name;
      if (!mpName) continue;

      const slug = mpName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let targetProductRef = productDocsMap.get(mpName.toLowerCase()) || productDocsMap.get(slug);

      if (!targetProductRef) {
        console.log(`Master product not found for Fusion item: ${mpName}`);
        continue;
      }

      const variants = item.variants || [];
      for (const v of variants) {
        const variantKey = v.variant_key;
        const dosage = v.dosage || (v.strength?.concentration || v.strength?.total_strength || v.strength?.declared_strength || '');
        const presentationKey = resolvePresentation(v.presentation?.display_name);
        
        const costExVat = v.pricing?.cost_price_ex_vat || null;
        const costIncVat = v.pricing?.cost_price_inc_vat || null;
        const priceUsd = costExVat ? costExVat / 3.67 : null;

        const variantData = {
          supplierId: fusionSupplierId,
          supplierName: 'Fusion',
          label: v.source_label || mpName,
          dosage: dosage,
          dose: dosage,
          presentation: presentationKey,
          presentationName: getPresentationName(presentationKey),
          price_aed: costExVat,
          price_aed_inc_vat: costIncVat,
          unit_price: priceUsd ? parseFloat(priceUsd.toFixed(2)) : null,
          cost_tiers: costExVat ? { cost_10: costExVat } : {},
          source_label: v.source_label || null,
          source_discrepancy: v.source_discrepancy || null,
          status: 'active',
          updatedAt: new Date().toISOString()
        };

        const variantRef = targetProductRef.collection('variants').doc(variantKey);
        updatePromises.push(variantRef.set(variantData, { merge: true }));
        updatedCount++;
      }
    }

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `Successfully imported and normalized ${updatedCount} Fusion variants into Firestore.`
    });
  } catch (err) {
    console.error("Error during Fusion import:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
